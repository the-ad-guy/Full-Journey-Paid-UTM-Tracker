'use strict';
// Structural check for template.tpl: the three JSON sections must parse and
// the sandboxed JS must compile (as a function body - top-level return is
// legal there). Run from the repo root:  node test/check-template.js
const fs = require('fs');
const path = require('path');

const tpl = fs.readFileSync(path.join(__dirname, '..', 'template.tpl'), 'utf8');

function section(name) {
  const marker = '___' + name + '___';
  const start = tpl.indexOf(marker);
  if (start === -1) throw new Error('missing section ' + name);
  const from = start + marker.length;
  const next = tpl.indexOf('\n___', from);
  return tpl.slice(from, next === -1 ? tpl.length : next);
}

let failed = false;

for (const name of ['INFO', 'TEMPLATE_PARAMETERS', 'WEB_PERMISSIONS']) {
  try {
    const obj = JSON.parse(section(name));
    console.log('ok   ' + name + ' parses' + (name === 'INFO' ? ' - displayName: ' + obj.displayName : ''));
  } catch (e) {
    failed = true;
    console.log('FAIL ' + name + ': ' + e.message);
  }
}

try {
  new Function('require', 'data', section('SANDBOXED_JS_FOR_WEB_TEMPLATE'));
  console.log('ok   sandboxed JS compiles');
} catch (e) {
  failed = true;
  console.log('FAIL sandboxed JS: ' + e.message);
}

process.exit(failed ? 1 : 0);
