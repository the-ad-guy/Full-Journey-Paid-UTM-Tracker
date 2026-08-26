'use strict';
/*
 * Behavioral tests for the companion Custom HTML tags.
 * Mocks document/window/cookies/Date, evals each tag, and replays
 * multi-visit journeys.  Run from the repo root:
 *     node test/check-companion.js
 *
 * The cookie jar deliberately emulates real browser domain rules - it
 * rejects public suffixes (.com, .co.uk) and any domain that is not a
 * suffix of the current hostname - so the auto cookie-domain probe in
 * Tag 1 is genuinely exercised rather than assumed.
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'companion');
const TAG1 = strip(fs.readFileSync(path.join(DIR, '1-attribution-cookie.html'), 'utf8'));
const TAG2 = strip(fs.readFileSync(path.join(DIR, '2-link-injector.html'), 'utf8'));

function strip(src) {
  return src.replace(/<!--[\s\S]*?-->/, '').replace(/<\/?script>/g, '');
}

// Public suffixes the mock browser refuses to set cookies on.
const PUBLIC_SUFFIXES = new Set(['com', 'org', 'net', 'co.uk', 'com.au', 'co.jp']);

function makeEnv(hostname) {
  hostname = hostname || 'www.example.com';
  const jar = []; // {name, value, domain, expires}
  let simNow = Date.parse('2026-08-13T10:00:00Z');

  const domainAllowed = (d) => {
    if (!d) return true; // host-only always allowed
    const bare = d.replace(/^\./, '').toLowerCase();
    if (PUBLIC_SUFFIXES.has(bare)) return false;      // browsers reject public suffixes
    if (bare.split('.').length < 2) return false;
    return hostname === bare || hostname.endsWith('.' + bare); // must cover current host
  };

  const document = {
    referrer: '',
    get cookie() {
      return jar
        .filter((c) => c.expires === null || c.expires > simNow)
        .map((c) => c.name + '=' + c.value)
        .join('; ');
    },
    set cookie(str) {
      const parts = String(str).split(';').map((s) => s.trim());
      const eq = parts[0].indexOf('=');
      if (eq < 1) return;
      const name = parts[0].slice(0, eq);
      const value = parts[0].slice(eq + 1);
      let expires = null;
      let domain = '';
      for (const p of parts.slice(1)) {
        let m = p.match(/^expires=(.+)$/i);
        if (m) expires = Date.parse(m[1]);
        m = p.match(/^domain=(.+)$/i);
        if (m) domain = m[1];
      }
      if (!domainAllowed(domain)) return; // browser silently drops it
      const idx = jar.findIndex((c) => c.name === name && c.domain === domain);
      if (expires !== null && expires <= simNow) {
        if (idx !== -1) jar.splice(idx, 1);
        return;
      }
      if (idx !== -1) jar[idx].value = value;
      else jar.push({ name, value, domain, expires });
    },
    readyState: 'complete',
    listeners: {},
    addEventListener(t, fn) { (this.listeners[t] = this.listeners[t] || []).push(fn); },
    anchors: [],
    querySelectorAll(sel) {
      const subs = [...sel.matchAll(/href\*="([^"]+)"/g)].map((m) => m[1]);
      return this.anchors.filter((a) => subs.some((s) => (a.attrs.href || '').includes(s)));
    },
  };

  const window = {
    location: { href: 'https://' + hostname + '/', hostname, pathname: '/' },
    dataLayer: [],
    console,
    setTimeout() { return 0; }, // GA retries are not under test here
  };

  function FakeDate(...a) { return a.length ? new Date(...a) : new Date(simNow); }
  FakeDate.now = () => simNow;
  FakeDate.parse = Date.parse;
  FakeDate.UTC = Date.UTC;

  return {
    jar, document, window,
    advanceDays(d) { simNow += d * 86400000; },
    advanceMinutes(m) { simNow += m * 60000; },
    visit(href, ref) {
      const u = new URL(href);
      window.location.href = href;
      window.location.hostname = u.hostname;
      window.location.pathname = u.pathname;
      document.referrer = ref || '';
    },
    anchor(href) {
      const a = {
        attrs: { href },
        getAttribute(n) { return n in this.attrs ? this.attrs[n] : null; },
        setAttribute(n, v) { this.attrs[n] = v; },
        closest() { return a; },
      };
      document.anchors.push(a);
      return a;
    },
    runTag1() { new Function('window', 'document', 'Date', TAG1)(window, document, FakeDate); },
    runTag2(hosts, paramOrder) {
      let src = TAG2.replace(
        'var DESTINATION_HOSTS = [];',
        'var DESTINATION_HOSTS = ' + JSON.stringify(hosts || []) + ';'
      );
      if (paramOrder) {
        // Index-based splice rather than a regex - no escaping to get wrong.
        const a = src.indexOf('var PARAM_ORDER = [');
        const b = src.indexOf('];', a);
        if (a === -1 || b === -1) throw new Error('PARAM_ORDER block not found in tag source');
        src = src.slice(0, a) + 'var PARAM_ORDER = ' + JSON.stringify(paramOrder) + ';' + src.slice(b + 2);
      }
      document.listeners = {};
      new Function('window', 'document', 'Date', src)(window, document, FakeDate);
    },
    get(name) {
      const c = document.cookie.split('; ').find((s) => s.startsWith(name + '='));
      return c ? decodeURIComponent(c.slice(name.length + 1)) : null;
    },
    attr() { const r = this.get('attr_state'); return r ? JSON.parse(r) : null; },
    domainOf(name) { const c = jar.find((x) => x.name === name); return c ? c.domain : null; },
  };
}

let pass = 0, fail = 0;
const check = (label, cond, detail) => {
  if (cond) { pass++; console.log('  ok   ' + label); }
  else { fail++; console.log('  FAIL ' + label + (detail !== undefined ? ' -> ' + JSON.stringify(detail) : '')); }
};
const section = (n) => console.log('\n== ' + n + ' ==');

// ---------------------------------------------- auto cookie domain
section('Auto cookie-domain detection');
{
  const cases = [
    ['www.example.com', '.example.com'],
    ['example.com', '.example.com'],
    ['shop.eu.example.com', '.example.com'],
    ['www.example.co.uk', '.example.co.uk'],  // must skip the .co.uk public suffix
    ['localhost', ''],                        // host-only
    ['192.168.1.10', ''],                     // host-only
  ];
  for (const [host, expected] of cases) {
    const env = makeEnv(host);
    env.visit('https://' + host + '/?gclid=A1', '');
    env.runTag1();
    check(host + ' -> "' + expected + '"', env.domainOf('attr_state') === expected, env.domainOf('attr_state'));
  }
  const env = makeEnv('www.example.com');
  env.visit('https://www.example.com/?gclid=A1', '');
  env.runTag1();
  check('no probe cookie left behind', !env.document.cookie.includes('_attr_probe'), env.document.cookie);
}

// ---------------------------------------------- journey behavior
section('Attribution journey (generic domain)');
{
  const env = makeEnv('www.example.com');

  env.visit('https://www.example.com/lp?utm_source=google&utm_medium=cpc&utm_campaign=Spring&gclid=G111', 'https://www.google.com/');
  env.runTag1();
  check('paid entry stored', env.get('first_paid_utm') !== null && env.attr().ids.gclid === 'G111' && env.attr().ftc === 'paid');

  env.advanceMinutes(5);
  env.visit('https://www.example.com/pricing', 'https://www.example.com/lp');
  env.runTag1();
  check('internal nav ignored', env.attr().rtc === 'paid');

  env.advanceDays(2);
  env.visit('https://www.example.com/', 'https://www.google.com/');
  env.runTag1();
  check('organic entry, paid preserved', env.attr().rtc === 'organic_search' && env.attr().fnr === 'google.com' && env.get('first_paid_utm').includes('G111'));

  env.advanceDays(1);
  env.visit('https://www.example.com/', '');
  env.runTag1();
  check('direct entry clears rnr', env.attr().rnc === 'direct' && env.attr().rnr === undefined);

  env.advanceDays(1);
  env.visit('https://www.example.com/?fbclid=F222&utm_source=facebook&utm_medium=cpc', '');
  env.runTag1();
  check('both click IDs coexist', env.attr().ids.gclid === 'G111' && env.attr().ids.fbclid === 'F222');

  // subdomain continuation shares cookies via the resolved .example.com domain
  env.advanceMinutes(2);
  env.visit('https://shop.example.com/cart', 'https://www.example.com/');
  env.runTag1();
  check('cross-subdomain referrer is internal', env.attr().rtc === 'paid');
}

// ---------------------------------------------- injector
section('Link injector');
{
  const env = makeEnv('www.example.com');
  env.visit('https://www.example.com/lp?utm_source=google&utm_medium=cpc&gclid=G111', 'https://www.google.com/');
  env.runTag1();

  const a = env.anchor('https://app.example.com/apply?ref=nav#top');
  const b = env.anchor('https://book.example.net/start');
  const evil = env.anchor('https://app.example.com.evil.io/apply');
  env.runTag2(['app.example.com', 'book.example.net']);

  const p = new URL(a.attrs.href).searchParams;
  check('first-paid utm injected', p.get('utm_source') === 'google' && p.get('utm_medium') === 'cpc');
  check('recent_paid_utm injected', p.get('recent_utm_source') === 'google');
  check('click ID injected', p.get('gclid') === 'G111');
  check('channels injected', p.get('traffic_channel') === 'paid');
  check('existing param + hash preserved', p.get('ref') === 'nav' && a.attrs.href.endsWith('#top'));
  check('second destination host decorated', new URL(b.attrs.href).searchParams.get('gclid') === 'G111');
  check('lookalike host untouched', evil.attrs.href === 'https://app.example.com.evil.io/apply');

  const before = a.attrs.href;
  env.runTag2(['app.example.com', 'book.example.net']);
  check('idempotent', a.attrs.href === before);

  // inert with no configured hosts
  const env2 = makeEnv('www.example.com');
  env2.visit('https://www.example.com/?gclid=Z9', '');
  env2.runTag1();
  const c = env2.anchor('https://app.example.com/apply');
  env2.runTag2([]);
  check('inert when DESTINATION_HOSTS empty', c.attrs.href === 'https://app.example.com/apply');

  // organic-only visitor gets no paid params
  const env3 = makeEnv('www.example.com');
  env3.jar.push({ name: '_fbp', value: 'fb.1.1.2', domain: '.example.com', expires: null });
  env3.visit('https://www.example.com/', 'https://www.bing.com/');
  env3.runTag1();
  const d = env3.anchor('https://app.example.com/apply');
  env3.runTag2(['app.example.com']);
  const q = new URL(d.attrs.href).searchParams;
  check('organic-only: channels yes, paid no', q.get('nonpaid_channel') === 'organic_search' && !q.has('utm_source') && !q.has('fbp'));
  check('no blank params emitted', !/=(&|$)/.test(new URL(d.attrs.href).search));
}

// ---------------------------------------------- journey summary
section('Journey summary fields');
{
  const P = (src, id) => 'https://www.example.com/lp?utm_source=' + src + '&utm_medium=cpc&' + id;
  const env = makeEnv('www.example.com');

  env.visit(P('google', 'gclid=G1'), ''); env.runTag1();
  check('touch 1', env.attr().ptc === 1 && env.attr().psp === 'google' && !!env.attr().fpd, env.attr());

  env.advanceDays(1);
  env.visit(P('google', 'gclid=G2'), ''); env.runTag1();
  check('touch 2 same source collapses', env.attr().ptc === 2 && env.attr().psp === 'google', env.attr());

  env.advanceDays(1);
  env.visit(P('facebook', 'fbclid=F1'), ''); env.runTag1();
  check('touch 3 new source appends', env.attr().ptc === 3 && env.attr().psp === 'google.facebook');

  env.advanceDays(1);
  env.visit(P('google', 'gclid=G3'), ''); env.runTag1();
  check('touch 4 returns to google', env.attr().ptc === 4 && env.attr().psp === 'google.facebook.google');

  const fpdBefore = env.attr().fpd;
  env.advanceDays(1);
  env.visit('https://www.example.com/', 'https://www.google.com/'); env.runTag1();
  check('organic entry leaves journey untouched',
    env.attr().ptc === 4 && env.attr().psp === 'google.facebook.google' && env.attr().fpd === fpdBefore);

  // click-ID-derived tokens, no utm_source present
  const e2 = makeEnv('www.example.com');
  e2.visit('https://www.example.com/?fbclid=X', ''); e2.runTag1();
  e2.advanceDays(1);
  e2.visit('https://www.example.com/?msclkid=Y', ''); e2.runTag1();
  e2.advanceDays(1);
  e2.visit('https://www.example.com/?li_fat_id=Z', ''); e2.runTag1();
  check('click IDs derive platform tokens', e2.attr().psp === 'facebook.bing.linkedin', e2.attr().psp);
  check('derived token never fabricates utm_source', !(e2.get('first_paid_utm') || '').includes('utm_source'));

  // paid with no source and no click ID
  const e3 = makeEnv('www.example.com');
  e3.visit('https://www.example.com/?utm_medium=cpc', ''); e3.runTag1();
  check('sourceless paid touch -> unknown', e3.attr().psp === 'unknown');

  // separator-hostile source is sanitized
  const e4 = makeEnv('www.example.com');
  e4.visit('https://www.example.com/?utm_source=Foo.Bar%20Baz&utm_medium=cpc', ''); e4.runTag1();
  check('source sanitized, separator safe', e4.attr().psp === 'foo-bar-baz', e4.attr().psp);

  // cap: first hop always survives
  const e5 = makeEnv('www.example.com');
  for (let i = 0; i < 15; i++) {
    e5.advanceDays(1);
    e5.visit('https://www.example.com/?utm_source=s' + i + '&utm_medium=cpc', '');
    e5.runTag1();
  }
  const hops = e5.attr().psp.split('.');
  check('capped at 12 hops, first preserved',
    hops.length === 12 && hops[0] === 's0' && hops[11] === 's14' && e5.attr().ptc === 15, e5.attr().psp);

  // injector output
  const e6 = makeEnv('www.example.com');
  e6.visit(P('google', 'gclid=G1'), ''); e6.runTag1();
  e6.advanceDays(1);
  e6.visit(P('facebook', 'fbclid=F1'), ''); e6.runTag1();
  const a6 = e6.anchor('https://app.example.com/apply');
  e6.runTag2(['app.example.com']);
  const q6 = new URL(a6.attrs.href).searchParams;
  check('injector emits journey fields',
    q6.get('utm_journey') === 'google.facebook' && q6.get('paid_touch_count') === '2' &&
    /^\d{4}-\d{2}-\d{2}$/.test(q6.get('first_paid_date')), a6.attrs.href);
  check('separator survives URL encoding', a6.attrs.href.includes('utm_journey=google.facebook'));

  // corrupted fpd must omit the param, never emit Invalid Date
  const e7 = makeEnv('www.example.com');
  e7.visit(P('google', 'gclid=G1'), ''); e7.runTag1();
  const bad = JSON.parse(e7.get('attr_state')); bad.fpd = 'garbage';
  e7.document.cookie = 'attr_state=' + encodeURIComponent(JSON.stringify(bad)) + '; domain=.example.com; path=/';
  const a7 = e7.anchor('https://app.example.com/apply');
  e7.runTag2(['app.example.com']);
  check('corrupt fpd omitted cleanly',
    !new URL(a7.attrs.href).searchParams.has('first_paid_date') && !/NaN|Invalid/.test(a7.attrs.href));

  // organic-only visitor gets none of them
  const e8 = makeEnv('www.example.com');
  e8.visit('https://www.example.com/', 'https://www.bing.com/'); e8.runTag1();
  const a8 = e8.anchor('https://app.example.com/apply');
  e8.runTag2(['app.example.com']);
  const q8 = new URL(a8.attrs.href).searchParams;
  check('organic-only: no journey params',
    !q8.has('utm_journey') && !q8.has('paid_touch_count') && !q8.has('first_paid_date'));
}

// ---------------------------------------------- canonical ordering
section('Canonical parameter order');
{
  const env = makeEnv('www.example.com');
  env.visit('https://www.example.com/lp?utm_source=google&utm_medium=cpc&utm_campaign=spring&gclid=G1', 'https://www.google.com/');
  env.runTag1();
  env.advanceDays(1);
  env.visit('https://www.example.com/lp?utm_source=facebook&utm_medium=cpc&utm_campaign=remarket&fbclid=F1', '');
  env.runTag1();
  env.advanceDays(1);
  env.visit('https://www.example.com/', ''); env.runTag1(); // direct: adds nonpaid layer
  env.jar.push({ name: '_fbc', value: 'fb.1.9.F1', domain: '.example.com', expires: null });
  env.jar.push({ name: '_fbp', value: 'fb.1.8.7', domain: '.example.com', expires: null });

  const a = env.anchor('https://app.example.com/apply?keep=1&other=2#frag');
  env.runTag2(['app.example.com']);
  const names = [...new URL(a.attrs.href).searchParams.keys()];

  check('gclid leads, then first-touch utm_*',
    names[0] === 'gclid' && names[1] === 'utm_source', names);

  const idx = (n) => names.indexOf(n);
  check('groups follow PARAM_ORDER default',
    idx('utm_campaign') < idx('recent_utm_source') &&
    idx('recent_utm_campaign') < idx('fbclid') &&
    idx('fbclid') < idx('fbc') &&
    idx('fbp') < idx('paid_touch_count') &&
    idx('utm_journey') < idx('traffic_channel') &&
    idx('recent_traffic_channel') < idx('nonpaid_channel'), names);

  check('fbclid rides with click_ids, not on its own',
    idx('fbclid') > idx('recent_utm_source') && idx('fbclid') < idx('fbc'), names);

  check('unmanaged params pushed to the tail in original order',
    idx('keep') === names.length - 2 && idx('other') === names.length - 1, names);
  check('hash preserved', a.attrs.href.endsWith('#frag'));

  const first = a.attrs.href;
  env.runTag2(['app.example.com']);
  check('idempotent - byte-identical on re-run', a.attrs.href === first, a.attrs.href);
  check('no duplicate names', new Set(names).size === names.length, names);

  // stale hardcoded click ID is replaced, not duplicated
  const b = env.anchor('https://app.example.com/x?gclid=STALE&wbraid=GHOST');
  env.runTag2(['app.example.com']);
  const bp = new URL(b.attrs.href).searchParams;
  check('stale click IDs cleared', bp.get('gclid') === 'G1' && !bp.has('wbraid') &&
    [...bp.keys()].filter(k => k === 'gclid').length === 1, b.attrs.href);

  // never-paid visitor keeps hardcoded utm_source
  const e2 = makeEnv('www.example.com');
  e2.visit('https://www.example.com/', 'https://www.bing.com/'); e2.runTag1();
  const c = e2.anchor('https://app.example.com/x?utm_source=website&gclid=HARDCODED');
  e2.runTag2(['app.example.com']);
  const cp = new URL(c.attrs.href).searchParams;
  check('no paid history: hardcoded params survive',
    cp.get('utm_source') === 'website' && cp.get('gclid') === 'HARDCODED', c.attrs.href);
  check('no paid history: nonpaid params still emitted first',
    [...cp.keys()][0] === 'traffic_channel', [...cp.keys()]);

  // direct touch must drop a hardcoded stale referrer domain
  const e3 = makeEnv('www.example.com');
  e3.visit('https://www.example.com/', 'https://www.bing.com/'); e3.runTag1();
  e3.advanceDays(1);
  e3.visit('https://www.example.com/', ''); e3.runTag1(); // direct -> rnr deleted
  const d = e3.anchor('https://app.example.com/x?recent_nonpaid_referrer_domain=stale.com');
  e3.runTag2(['app.example.com']);
  check('direct clears stale referrer param',
    !new URL(d.attrs.href).searchParams.has('recent_nonpaid_referrer_domain'), d.attrs.href);
}

// ---------------------------------------------- configurable order
section('PARAM_ORDER is configurable');
{
  const seed = (e) => {
    e.visit('https://www.example.com/lp?utm_source=google&utm_medium=cpc&gclid=G1', '');
    e.runTag1();
    e.advanceDays(1);
    e.visit('https://www.example.com/lp?utm_source=facebook&utm_medium=cpc&fbclid=F1', '');
    e.runTag1();
    e.jar.push({ name: '_fbc', value: 'fb.1.9.F1', domain: '.example.com', expires: null });
    e.jar.push({ name: '_fbp', value: 'fb.1.8.7', domain: '.example.com', expires: null });
  };

  // Meta first instead of gclid first
  const e1 = makeEnv('www.example.com'); seed(e1);
  const a1 = e1.anchor('https://app.example.com/x');
  e1.runTag2(['app.example.com'],
    ['meta', 'gclid', 'utm', 'recent_utm', 'click_ids', 'journey', 'channel', 'nonpaid', 'ga']);
  const n1 = [...new URL(a1.attrs.href).searchParams.keys()];
  check('custom order puts meta first', n1[0] === 'fbc' && n1[1] === 'fbp' && n1[2] === 'gclid', n1);
  check('fbclid follows click_ids position, not gclid', n1.indexOf('fbclid') > n1.indexOf('gclid'), n1);

  // Reverse-ish: attribution before any identifier
  const e2 = makeEnv('www.example.com'); seed(e2);
  const a2 = e2.anchor('https://app.example.com/x');
  e2.runTag2(['app.example.com'],
    ['utm', 'recent_utm', 'journey', 'channel', 'nonpaid', 'gclid', 'click_ids', 'meta', 'ga', 'fbclid']);
  const n2 = [...new URL(a2.attrs.href).searchParams.keys()];
  check('custom order puts utm_* first', n2[0] === 'utm_source', n2);
  check('gclid follows the attribution block',
    n2.indexOf('gclid') > n2.indexOf('nonpaid_channel'), n2);

  // A group omitted from PARAM_ORDER must still be emitted, not dropped
  const e3 = makeEnv('www.example.com'); seed(e3);
  const a3 = e3.anchor('https://app.example.com/x');
  e3.runTag2(['app.example.com'], ['utm', 'gclid']);
  const n3 = [...new URL(a3.attrs.href).searchParams.keys()];
  check('omitted groups still emitted (no silent data loss)',
    n3.includes('fbc') && n3.includes('utm_journey') && n3.includes('traffic_channel') &&
    n3.includes('recent_utm_source') && n3.includes('fbclid'), n3);
  check('omitted groups appended after the listed ones',
    n3[0] === 'utm_source' && n3.indexOf('gclid') < n3.indexOf('fbc'), n3);

  // Unknown tokens are ignored rather than throwing
  const e4 = makeEnv('www.example.com'); seed(e4);
  const a4 = e4.anchor('https://app.example.com/x');
  e4.runTag2(['app.example.com'], ['nonsense', 'gclid', 'typo']);
  const n4 = [...new URL(a4.attrs.href).searchParams.keys()];
  check('unknown tokens ignored, output still complete',
    n4[0] === 'gclid' && n4.includes('utm_source') && n4.includes('fbp'), n4);

  // Custom order stays idempotent
  const order = ['meta', 'utm', 'gclid', 'recent_utm', 'click_ids', 'journey', 'channel', 'nonpaid', 'ga'];
  const e5 = makeEnv('www.example.com'); seed(e5);
  const a5 = e5.anchor('https://app.example.com/x?keep=1');
  e5.runTag2(['app.example.com'], order);
  const once = a5.attrs.href;
  e5.runTag2(['app.example.com'], order);
  check('custom order is idempotent', a5.attrs.href === once, a5.attrs.href);
}

// ---------------------------------------------- brand check
section('No brand references');
{
  // Guards against client-specific strings leaking back into this public
  // repo when changes are ported from a private deployment. The patterns are
  // assembled from fragments so this file does not itself match the scan -
  // a repo-wide `grep` for the client name must come back empty.
  const DENY = [
    'r' + 'ocs',
    'sales' + 'force',
    'enroll' + '.',
    'G-' + '2QJGF' + '1YJS1',
  ].map((s) => new RegExp(s.replace(/\./g, '\\.'), 'i'));

  const files = [
    'companion/1-attribution-cookie.html',
    'companion/2-link-injector.html',
    'template.tpl',
    'README.md',
  ];
  for (const f of files) {
    const src = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    const hits = DENY.filter((re) => re.test(src)).map((re) => re.source);
    check(f + ' is brand-free', hits.length === 0, hits);
  }
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
