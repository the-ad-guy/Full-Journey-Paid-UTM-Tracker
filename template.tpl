___TERMS_OF_SERVICE___

By creating or modifying this file you agree to Google Tag Manager's Community
Template Gallery Developer Terms of Service available at
https://developers.google.com/tag-manager/gallery-tos (or such other URL as
Google may provide), as modified from time to time.

___INFO___

{
  "type": "TAG",
  "id": "cvt_temp_public_id",
  "version": 1,
  "securityGroups": [],
  "displayName": "Full Journey Paid UTM Tracker",
  "brand": {
    "id": "brand_dummy",
    "displayName": ""
  },
  "description": "Tracks the full paid journey in first-party cookies: first + most recent paid landing URLs, the latest click ID per ad platform (gclid, fbclid, msclkid, ttclid, li_fat_id, gbraid, wbraid), and first/most-recent overall + nonpaid channels with referrer domains. Classifies each site ENTRY (paid, email, organic_search, organic_social, referral, direct) with strict layer separation - nonpaid traffic can never overwrite paid attribution. Fire on Initialization - All Pages.",
  "containerContexts": [
    "WEB"
  ]
}

___TEMPLATE_PARAMETERS___

[
  {
    "type": "GROUP",
    "name": "cookieSettings",
    "displayName": "Cookie settings",
    "groupStyle": "NO_ZIPPY",
    "subParams": [
      {
        "type": "TEXT",
        "name": "firstPaidCookie",
        "displayName": "First-paid cookie name",
        "simpleValueType": true,
        "defaultValue": "first_paid_utm",
        "help": "Stores the full landing URL of the visitor's FIRST paid visit. Set once, never overwritten. Blank = default (first_paid_utm)."
      },
      {
        "type": "TEXT",
        "name": "recentPaidCookie",
        "displayName": "Recent-paid cookie name",
        "simpleValueType": true,
        "defaultValue": "recent_paid_utm",
        "help": "Stores the full landing URL of the MOST RECENT paid visit. Replaced on every qualifying paid entry. Blank = default (recent_paid_utm)."
      },
      {
        "type": "TEXT",
        "name": "attrCookie",
        "displayName": "Attribution state cookie name",
        "simpleValueType": true,
        "defaultValue": "rocs_attr",
        "help": "JSON cookie holding first/recent overall channel, first/recent nonpaid channel + referrer domain, and the latest click ID per platform. Blank = default (rocs_attr)."
      },
      {
        "type": "TEXT",
        "name": "sessCookie",
        "displayName": "Session cookie name",
        "simpleValueType": true,
        "defaultValue": "rocs_sess",
        "help": "Short-lived rolling session marker used to tell new site entries apart from internal navigation. Blank = default (rocs_sess)."
      },
      {
        "type": "TEXT",
        "name": "cookieDomain",
        "displayName": "Cookie domain",
        "simpleValueType": true,
        "defaultValue": "auto",
        "help": "Domain attribute for all cookies, e.g. \".example.com\". \"auto\" picks the broadest domain that will accept the cookie. Blank = auto."
      },
      {
        "type": "TEXT",
        "name": "lifetimeDays",
        "displayName": "Cookie lifetime (days)",
        "simpleValueType": true,
        "defaultValue": 730,
        "help": "Lifetime of the attribution cookies in days. Blank = default (730). Note: Safari ITP caps JavaScript-set cookies at ~7 days regardless."
      },
      {
        "type": "TEXT",
        "name": "sessionMinutes",
        "displayName": "Session timeout (minutes)",
        "simpleValueType": true,
        "defaultValue": 30,
        "help": "Inactivity window that defines a session. Blank = default (30, matching GA4)."
      },
      {
        "type": "TEXT",
        "name": "ignoreDomains",
        "displayName": "Ignore domains",
        "simpleValueType": true,
        "defaultValue": "",
        "help": "Comma-separated list of referrer domains to IGNORE (treated like internal navigation - no attribution update). Use for payment gateways, SSO providers, or sister domains, e.g. \"paypal.com, auth.example.org\". The page's own domain and its subdomains are always ignored automatically."
      }
    ]
  },
  {
    "type": "GROUP",
    "name": "classification",
    "displayName": "Classification (advanced)",
    "groupStyle": "ZIPPY_CLOSED",
    "subParams": [
      {
        "type": "TEXT",
        "name": "clickIds",
        "displayName": "Click ID parameters",
        "simpleValueType": true,
        "defaultValue": "gclid,gbraid,wbraid,fbclid,msclkid,ttclid,li_fat_id",
        "help": "Comma-separated query parameters that mark a visit as paid AND are stored as \"latest value per type\". Blank = default list."
      },
      {
        "type": "TEXT",
        "name": "detectOnlySignals",
        "displayName": "Detection-only paid parameters",
        "simpleValueType": true,
        "defaultValue": "gad_source",
        "help": "Comma-separated query parameters that mark a visit as paid but are NOT stored as click IDs. Blank = default (gad_source)."
      },
      {
        "type": "TEXT",
        "name": "paidMediums",
        "displayName": "Paid utm_medium values",
        "simpleValueType": true,
        "defaultValue": "cpc,paid",
        "help": "Comma-separated utm_medium values (case-insensitive) that classify a visit as paid. Blank = default (cpc, paid). utm_source alone NEVER means paid."
      },
      {
        "type": "TEXT",
        "name": "emailMediums",
        "displayName": "Email utm_medium values",
        "simpleValueType": true,
        "defaultValue": "email,e-mail,email_marketing,newsletter",
        "help": "Comma-separated utm_medium values classified as email (when not paid). Blank = default list."
      },
      {
        "type": "TEXT",
        "name": "emailSources",
        "displayName": "Email utm_source fallback values",
        "simpleValueType": true,
        "defaultValue": "email,newsletter,mailchimp,constant_contact,hubspot_email",
        "help": "Conservative fallback: comma-separated utm_source values classified as email when utm_medium does not identify it. Exact matches only, never substrings. Blank = default list."
      },
      {
        "type": "TEXT",
        "name": "searchDomains",
        "displayName": "Search engine referrer domains",
        "simpleValueType": true,
        "defaultValue": "bing.com,search.yahoo.com,duckduckgo.com,ecosia.org",
        "help": "Comma-separated referrer domains classified as organic_search. Google country domains (google.com, google.co.uk, ...) are always recognized automatically. Blank = default list."
      },
      {
        "type": "TEXT",
        "name": "socialDomains",
        "displayName": "Social referrer domains",
        "simpleValueType": true,
        "defaultValue": "facebook.com,instagram.com,linkedin.com,tiktok.com,x.com,twitter.com,t.co",
        "help": "Comma-separated referrer domains classified as organic_social. Blank = default list."
      }
    ]
  },
  {
    "type": "GROUP",
    "name": "maintenance",
    "displayName": "Maintenance",
    "groupStyle": "ZIPPY_CLOSED",
    "subParams": [
      {
        "type": "CHECKBOX",
        "name": "dedupeLegacy",
        "checkboxText": "Remove duplicate host-only cookies",
        "simpleValueType": true,
        "defaultValue": true,
        "help": "When two cookies share the paid-cookie name (a host-only copy plus a domain-wide one), which value JavaScript reads is arbitrary. This expires the host-only copy so reads become deterministic."
      },
      {
        "type": "CHECKBOX",
        "name": "debug",
        "checkboxText": "Enable debug logging",
        "simpleValueType": true,
        "defaultValue": false,
        "help": "Logs classification decisions and cookie writes to the console (Preview mode only)."
      }
    ]
  }
]

___SANDBOXED_JS_FOR_WEB_TEMPLATE___

// UTM Attribution Tracker
// =======================
// Classifies each site ENTRY (not every page view) into a channel and
// maintains three attribution layers that never overwrite each other:
//   PAID     first/recent paid landing URL cookies + latest click ID per type
//   OVERALL  first/recent traffic channel
//   NONPAID  first/recent nonpaid channel + referrer domain
// Precedence per entry: paid > email > organic_search > organic_social >
// referral > direct. Fire on Initialization - All Pages.

const getUrl = require('getUrl');
const getReferrerUrl = require('getReferrerUrl');
const parseUrl = require('parseUrl');
const getCookieValues = require('getCookieValues');
const setCookie = require('setCookie');
const getTimestampMillis = require('getTimestampMillis');
const JSON = require('JSON');
const Object = require('Object');
const logToConsole = require('logToConsole');
const makeString = require('makeString');
const makeNumber = require('makeNumber');
const getType = require('getType');

// ------------------------------ config ---------------------------------

const str = (v) => (v === undefined || v === null) ? '' : makeString(v).trim();

// Comma-separated field -> trimmed, lowercased, deduped array (fallback if blank).
const list = (raw, fallback) => {
  const src = str(raw) === '' ? fallback : str(raw);
  const out = [];
  src.split(',').forEach((item) => {
    const v = item.trim().toLowerCase();
    if (v !== '' && out.indexOf(v) === -1) out.push(v);
  });
  return out;
};

const num = (raw, fallback) => {
  const n = makeNumber(str(raw));
  return n > 0 ? n : fallback;
};

const DEBUG = !!data.debug;
const FIRST_PAID_COOKIE = str(data.firstPaidCookie) || 'first_paid_utm';
const RECENT_PAID_COOKIE = str(data.recentPaidCookie) || 'recent_paid_utm';
const ATTR_COOKIE = str(data.attrCookie) || 'rocs_attr';
const SESS_COOKIE = str(data.sessCookie) || 'rocs_sess';
const COOKIE_DOMAIN = str(data.cookieDomain) || 'auto';
const LIFETIME_SECONDS = num(data.lifetimeDays, 730) * 86400;
const SESSION_SECONDS = num(data.sessionMinutes, 30) * 60;
const IGNORE_DOMAINS = list(data.ignoreDomains, '');
const CLICK_IDS = list(data.clickIds, 'gclid,gbraid,wbraid,fbclid,msclkid,ttclid,li_fat_id');
const DETECT_ONLY = list(data.detectOnlySignals, 'gad_source');
const PAID_MEDIUMS = list(data.paidMediums, 'cpc,paid');
const EMAIL_MEDIUMS = list(data.emailMediums, 'email,e-mail,email_marketing,newsletter');
const EMAIL_SOURCES = list(data.emailSources, 'email,newsletter,mailchimp,constant_contact,hubspot_email');
const SEARCH_DOMAINS = list(data.searchDomains, 'bing.com,search.yahoo.com,duckduckgo.com,ecosia.org');
const SOCIAL_DOMAINS = list(data.socialDomains, 'facebook.com,instagram.com,linkedin.com,tiktok.com,x.com,twitter.com,t.co');
const DEDUPE = data.dedupeLegacy !== false;

const log = (a, b, c) => {
  if (DEBUG) logToConsole('[UTM-TRACKER]', a, b === undefined ? '' : b, c === undefined ? '' : c);
};

// --------------------------- cookie helpers ----------------------------

const readCookie = (name) => {
  const values = getCookieValues(name);
  return values.length ? values[0] : undefined;
};

const writeCookie = (name, value, maxAgeSeconds) => {
  setCookie(name, value, {
    domain: COOKIE_DOMAIN,
    path: '/',
    'max-age': maxAgeSeconds,
    secure: true,
    samesite: 'Lax'
  });
};

// Sandboxed JSON.parse returns undefined (never throws) on malformed input,
// so a corrupted cookie degrades to "absent" and gets rebuilt.
const readJson = (name) => {
  const raw = readCookie(name);
  if (!raw) return undefined;
  const obj = JSON.parse(raw);
  return getType(obj) === 'object' ? obj : undefined;
};

// ------------------------------- URL state -----------------------------

const pageUrl = getUrl();
const page = parseUrl(pageUrl);
if (!page) {
  data.gtmOnSuccess();
  return;
}

const stripWww = (h) => h.indexOf('www.') === 0 ? h.substring(4) : h;
const pageHost = stripWww(str(page.hostname).toLowerCase());

const refRaw = getReferrerUrl();
const ref = refRaw ? parseUrl(refRaw) : undefined;
const refHost = (ref && ref.hostname) ? stripWww(str(ref.hostname).toLowerCase()) : '';

const qp = page.searchParams || {};
const getParam = (name) => {
  const v = qp[name];
  if (v === undefined) return undefined;
  return getType(v) === 'array' ? str(v[0]) : str(v);
};
const hasParam = (name) => qp[name] !== undefined;

// --------------------------- host matching -----------------------------

// Exact-or-subdomain match; never substring (fake-example.com != example.com).
const hostMatches = (host, domain) => {
  if (host === domain) return true;
  const suffix = '.' + domain;
  return host.length > suffix.length &&
    host.substring(host.length - suffix.length) === suffix;
};

// Own domain (either direction, covers apex vs subdomain pages) + the
// user-configured ignore list count as internal: no attribution update.
const isInternalReferrer = () => {
  if (!refHost) return false;
  if (hostMatches(refHost, pageHost) || hostMatches(pageHost, refHost)) return true;
  for (let i = 0; i < IGNORE_DOMAINS.length; i++) {
    if (hostMatches(refHost, IGNORE_DOMAINS[i])) return true;
  }
  return false;
};

// google.<tld> / google.<tld>.<tld> without regex (sandbox has no RegExp):
// first label "google", 1-2 further labels of 2-3 chars each.
const isGoogleHost = (host) => {
  const parts = host.split('.');
  if (parts.length < 2 || parts.length > 3 || parts[0] !== 'google') return false;
  for (let i = 1; i < parts.length; i++) {
    if (parts[i].length < 2 || parts[i].length > 3) return false;
  }
  return true;
};

// ---------------------------- classification ---------------------------

const inList = (value, arr) => value !== undefined && arr.indexOf(value.toLowerCase()) !== -1;

const hasPaidSignal = () => {
  for (let i = 0; i < CLICK_IDS.length; i++) {
    if (hasParam(CLICK_IDS[i])) return true;
  }
  for (let j = 0; j < DETECT_ONLY.length; j++) {
    if (hasParam(DETECT_ONLY[j])) return true;
  }
  return inList(getParam('utm_medium'), PAID_MEDIUMS);
};

const hasEmailSignal = () => {
  if (inList(getParam('utm_medium'), EMAIL_MEDIUMS)) return true;
  return inList(getParam('utm_source'), EMAIL_SOURCES);
};

const classifyReferrer = () => {
  if (isGoogleHost(refHost)) return 'organic_search';
  let i;
  for (i = 0; i < SEARCH_DOMAINS.length; i++) {
    if (hostMatches(refHost, SEARCH_DOMAINS[i])) return 'organic_search';
  }
  for (i = 0; i < SOCIAL_DOMAINS.length; i++) {
    if (hostMatches(refHost, SOCIAL_DOMAINS[i])) return 'organic_social';
  }
  return 'referral';
};

// ------------------- duplicate host-only cookie cleanup ----------------

// Two same-name cookies (host-only + domain-wide) make reads arbitrary.
// Expiring WITHOUT a domain attribute only removes the host-only copy;
// tried at "/" and every path prefix since it may also be path-scoped.
const dedupeLegacyCookie = (name) => {
  if (getCookieValues(name).length <= 1) return;
  log('duplicate cookie detected, expiring host-only copy:', name);
  const paths = ['/'];
  const segs = str(page.pathname).split('/');
  let acc = '';
  for (let i = 0; i < segs.length; i++) {
    if (!segs[i]) continue;
    acc = acc + '/' + segs[i];
    paths.push(acc);
    paths.push(acc + '/');
  }
  for (let p = 0; p < paths.length; p++) {
    setCookie(name, '', { path: paths[p], 'max-age': 0 });
  }
};

if (DEDUPE) {
  dedupeLegacyCookie(FIRST_PAID_COOKIE);
  dedupeLegacyCookie(RECENT_PAID_COOKIE);
}

// ------------------------------ entry logic ----------------------------

const now = getTimestampMillis();

let sess = readJson(SESS_COOKIE);
if (sess && (!sess.ts || now - sess.ts > SESSION_SECONDS * 1000)) sess = undefined;

const refIsInternal = isInternalReferrer();
const refIsExternal = !!refHost && !refIsInternal;

// Campaign-tagged URLs are ALWAYS entries, even mid-session. Otherwise:
// no live session -> external/empty referrer is an entry (internal referrer
// = new-tab continuation). Live session -> only a fresh external referrer
// counts (left the site and came back).
let isEntry = false;
let channel;

if (hasPaidSignal()) {
  isEntry = true;
  channel = 'paid';
} else if (hasEmailSignal()) {
  isEntry = true;
  channel = 'email';
} else if (!sess) {
  if (!refIsInternal) {
    isEntry = true;
    channel = refIsExternal ? classifyReferrer() : 'direct';
  }
} else if (refIsExternal) {
  isEntry = true;
  channel = classifyReferrer();
}

if (isEntry) {
  log(channel + ' entry detected', pageUrl);
  const attr = readJson(ATTR_COOKIE) || {};
  attr.v = 1;
  if (getType(attr.ids) !== 'object') attr.ids = {};

  // Overall traffic channel layer.
  if (!attr.ftc) {
    attr.ftc = channel;
    log('first traffic channel set:', channel);
  }
  attr.rtc = channel;

  if (channel === 'paid') {
    // PAID layer only - the nonpaid layer is untouched by design.
    if (!readCookie(FIRST_PAID_COOKIE)) {
      writeCookie(FIRST_PAID_COOKIE, pageUrl, LIFETIME_SECONDS);
      log('first paid attribution set');
    }
    if (readCookie(RECENT_PAID_COOKIE) !== pageUrl) {
      writeCookie(RECENT_PAID_COOKIE, pageUrl, LIFETIME_SECONDS);
      log('recent paid attribution updated');
    }
    for (let c = 0; c < CLICK_IDS.length; c++) {
      const v = getParam(CLICK_IDS[c]);
      if (v !== undefined && v !== '') {
        attr.ids[CLICK_IDS[c]] = v;
        log('latest ' + CLICK_IDS[c] + ' updated');
      }
    }
  } else {
    // NONPAID layer only - paid cookies and click IDs are untouched.
    const refDomain = refIsExternal ? refHost : '';
    if (!attr.fnc) {
      attr.fnc = channel;
      if (refDomain) attr.fnr = refDomain;
      log('first nonpaid attribution set:', channel, refDomain || '(no referrer)');
    }
    attr.rnc = channel;
    if (refDomain) attr.rnr = refDomain;
    else Object.delete(attr, 'rnr'); // direct touch must not keep an older referrer paired with it
    log('recent nonpaid attribution updated:', channel, refDomain || '(no referrer)');
  }

  writeCookie(ATTR_COOKIE, JSON.stringify(attr), LIFETIME_SECONDS);
} else {
  log('internal navigation / session continuation - no channel updates');
}

// Rolling session marker, refreshed on EVERY page view.
const sessCh = isEntry ? channel : (sess && sess.ch) || null;
writeCookie(SESS_COOKIE, JSON.stringify({ ts: now, ch: sessCh }), SESSION_SECONDS);

data.gtmOnSuccess();

___WEB_PERMISSIONS___

[
  {
    "instance": {
      "key": {
        "publicId": "get_url",
        "versionId": "1"
      },
      "param": [
        {
          "key": "urlParts",
          "value": {
            "type": 1,
            "string": "any"
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "get_referrer",
        "versionId": "1"
      },
      "param": [
        {
          "key": "urlParts",
          "value": {
            "type": 1,
            "string": "any"
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "get_cookies",
        "versionId": "1"
      },
      "param": [
        {
          "key": "cookieAccess",
          "value": {
            "type": 1,
            "string": "any"
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "set_cookies",
        "versionId": "1"
      },
      "param": [
        {
          "key": "allowedCookies",
          "value": {
            "type": 2,
            "listItem": [
              {
                "type": 3,
                "mapKey": [
                  {
                    "type": 1,
                    "string": "name"
                  },
                  {
                    "type": 1,
                    "string": "domain"
                  },
                  {
                    "type": 1,
                    "string": "path"
                  },
                  {
                    "type": 1,
                    "string": "secure"
                  },
                  {
                    "type": 1,
                    "string": "session"
                  }
                ],
                "mapValue": [
                  {
                    "type": 1,
                    "string": "*"
                  },
                  {
                    "type": 1,
                    "string": "*"
                  },
                  {
                    "type": 1,
                    "string": "*"
                  },
                  {
                    "type": 1,
                    "string": "any"
                  },
                  {
                    "type": 1,
                    "string": "any"
                  }
                ]
              }
            ]
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "logging",
        "versionId": "1"
      },
      "param": [
        {
          "key": "environments",
          "value": {
            "type": 1,
            "string": "debug"
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  }
]

___TESTS___

scenarios:
- name: Paid landing sets first and recent paid cookies plus click ID
  code: |-
    const written = {};
    mock('getUrl', () => 'https://example.com/landing?utm_source=google&utm_medium=cpc&gclid=ABC123');
    mock('getReferrerUrl', () => '');
    mock('getCookieValues', (name) => []);
    mock('setCookie', (name, value, options) => { written[name] = value; });

    runCode({});

    assertApi('gtmOnSuccess').wasCalled();
    assertThat(written.first_paid_utm).isEqualTo('https://example.com/landing?utm_source=google&utm_medium=cpc&gclid=ABC123');
    assertThat(written.recent_paid_utm).isEqualTo(written.first_paid_utm);
    assertThat(written.rocs_attr.indexOf('"gclid":"ABC123"') >= 0).isTrue();
    assertThat(written.rocs_attr.indexOf('"rtc":"paid"') >= 0).isTrue();
- name: Organic search entry never touches paid cookies
  code: |-
    const written = {};
    mock('getUrl', () => 'https://example.com/');
    mock('getReferrerUrl', () => 'https://www.google.com/search?q=test');
    mock('getCookieValues', (name) => []);
    mock('setCookie', (name, value, options) => { written[name] = value; });

    runCode({});

    assertApi('gtmOnSuccess').wasCalled();
    assertThat(written.first_paid_utm === undefined).isTrue();
    assertThat(written.recent_paid_utm === undefined).isTrue();
    assertThat(written.rocs_attr.indexOf('"rtc":"organic_search"') >= 0).isTrue();
    assertThat(written.rocs_attr.indexOf('"fnr":"google.com"') >= 0).isTrue();
- name: utm_source alone is not paid
  code: |-
    const written = {};
    mock('getUrl', () => 'https://example.com/?utm_source=google');
    mock('getReferrerUrl', () => '');
    mock('getCookieValues', (name) => []);
    mock('setCookie', (name, value, options) => { written[name] = value; });

    runCode({});

    assertApi('gtmOnSuccess').wasCalled();
    assertThat(written.first_paid_utm === undefined).isTrue();
    assertThat(written.rocs_attr.indexOf('"rtc":"direct"') >= 0).isTrue();
- name: Custom cookie names and ignore domains are honored
  code: |-
    const written = {};
    mock('getUrl', () => 'https://example.com/?fbclid=XYZ');
    mock('getReferrerUrl', () => 'https://checkout.stripe.com/');
    mock('getCookieValues', (name) => []);
    mock('setCookie', (name, value, options) => { written[name] = value; });

    runCode({
      firstPaidCookie: 'my_first',
      recentPaidCookie: 'my_recent',
      attrCookie: 'my_attr',
      ignoreDomains: 'stripe.com'
    });

    assertApi('gtmOnSuccess').wasCalled();
    assertThat(written.my_first).isEqualTo('https://example.com/?fbclid=XYZ');
    assertThat(written.my_attr.indexOf('"fbclid":"XYZ"') >= 0).isTrue();

___NOTES___

Created 2026-08-13. Sandboxed-JS port of the "Paid URL Attribution Cookie"
Custom HTML tag. Repository: https://github.com/the-ad-guy/utm-tracker
