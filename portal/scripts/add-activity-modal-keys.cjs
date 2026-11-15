const fs = require('fs');
const path = require('path');

const enPath = path.resolve(__dirname, '../src/i18n/translations/en.json');
const amPath = path.resolve(__dirname, '../src/i18n/translations/am.json');
const omPath = path.resolve(__dirname, '../src/i18n/translations/om.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const am = JSON.parse(fs.readFileSync(amPath, 'utf8'));
const om = JSON.parse(fs.readFileSync(omPath, 'utf8'));

const additions = {
  activity: {
    tabChanges: { en: 'Changes & State Transition', am: 'ለውጦች እና የሁኔታ ሽግግር', om: 'Jijjiirama fi Ce\'umsa Haalaa' },
    tabTelemetry: { en: 'HTTP Telemetry (Req & Res)', am: 'የHTTP ቴሌሜትሪ (ጥያቄ እና ምላሽ)', om: 'Teelemeetirii HTTP (Gaaffii fi Deebii)' },
    tabOrigin: { en: 'Actor & Network Origin', am: 'ፈጻሚ እና የአውታረ መረብ መነሻ', om: 'Raawwataa fi Madda Netwoorkii' },
    auditImmutableNote: { en: 'This audit record is immutable and cryptographically bound to the CivicLink municipal ledger.', am: 'ይህ የኦዲት መረጃ የማይለወጥ እና ከCivicLink መዝገብ ጋር ደህንነቱ በተጠበቀ ሁኔታ የተሳሰረ ነው።', om: 'Galmeen oodiitii kun kan hin jijjiiramne fi koodiidhaan galmee CivicLink wajjin kan hidhatedha.' }
  }
};

for (const section of Object.keys(additions)) {
  if (!en[section]) en[section] = {};
  if (!am[section]) am[section] = {};
  if (!om[section]) om[section] = {};

  for (const [key, trans] of Object.entries(additions[section])) {
    en[section][key] = trans.en;
    am[section][key] = trans.am;
    om[section][key] = trans.om;
  }
}

function countKeys(obj) {
  let count = 0;
  for (const k in obj) {
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      count += countKeys(obj[k]);
    } else {
      count++;
    }
  }
  return count;
}

function diffKeys(a, b, prefix = '') {
  let diffs = [];
  for (const k of Object.keys(a)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (!(k in b)) {
      diffs.push(`Missing in other: ${full}`);
    } else if (typeof a[k] === 'object' && a[k] !== null && typeof b[k] === 'object' && b[k] !== null) {
      diffs = diffs.concat(diffKeys(a[k], b[k], full));
    }
  }
  return diffs;
}

const diffEnAm = diffKeys(en, am);
const diffAmEn = diffKeys(am, en);
const diffEnOm = diffKeys(en, om);
const diffOmEn = diffKeys(om, en);

if (diffEnAm.length || diffAmEn.length || diffEnOm.length || diffOmEn.length) {
  console.error('Parity check failed!', { diffEnAm, diffAmEn, diffEnOm, diffOmEn });
  process.exit(1);
}

fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n', 'utf8');
fs.writeFileSync(amPath, JSON.stringify(am, null, 2) + '\n', 'utf8');
fs.writeFileSync(omPath, JSON.stringify(om, null, 2) + '\n', 'utf8');

console.log('SUCCESS! Parity maintained.');
console.log('Key count:', {
  en: countKeys(en),
  am: countKeys(am),
  om: countKeys(om),
});

