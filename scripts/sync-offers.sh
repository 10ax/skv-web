#!/usr/bin/env bash
#
# sync-offers.sh — reconcile src/data/offers.json against PROMO.pdf.
#
# offers.json is a HAND-CURATED SUBSET of the PDF (currently ~22 of ~124 cars),
# each with a locally-sourced image + credit and a human-assigned category. So
# this script does NOT regenerate the file. It does the one part that is safe to
# automate — syncing the monthly PRICE of the cars you already feature — and
# reports everything that needs a human decision (cars that vanished from the
# PDF, and new PDF cars you might want to feature).
#
# Usage:
#   scripts/sync-offers.sh                  # report only (no changes written)
#   scripts/sync-offers.sh --apply          # apply price updates to offers.json
#   scripts/sync-offers.sh --list-candidates# also print every PDF car you don't feature
#   scripts/sync-offers.sh -h | --help
#
# Requires: pdftotext (poppler), node. Price edits are surgical (only the changed
# digits), so the JSON's formatting is left byte-for-byte intact.
set -euo pipefail

APPLY=0
LIST_CANDIDATES=0
for arg in "$@"; do
  case "$arg" in
    --apply)            APPLY=1 ;;
    --list-candidates)  LIST_CANDIDATES=1 ;;
    -h|--help)
      sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *)
      echo "Unknown option: $arg (try --help)" >&2
      exit 2 ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PDF="$ROOT/PROMO.pdf"
JSON="$ROOT/src/data/offers.json"

command -v pdftotext >/dev/null 2>&1 || { echo "ERROR: pdftotext not found (install poppler / poppler-utils)." >&2; exit 1; }
command -v node      >/dev/null 2>&1 || { echo "ERROR: node not found." >&2; exit 1; }
[ -f "$PDF" ]  || { echo "ERROR: $PDF not found." >&2; exit 1; }
[ -f "$JSON" ] || { echo "ERROR: $JSON not found." >&2; exit 1; }

PDFTEXT="$(mktemp)"
NODE_HELPER="$(mktemp)"
trap 'rm -f "$PDFTEXT" "$NODE_HELPER"' EXIT

# Reading order (no -layout) puts each model on the line directly above its price.
pdftotext "$PDF" "$PDFTEXT"

cat > "$NODE_HELPER" <<'NODE'
const fs = require('node:fs');
const [pdfTxtPath, jsonPath, applyStr, listStr] = process.argv.slice(2);
const APPLY = applyStr === '1';
const LIST = listStr === '1';

const norm = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();
const eur = (n) =>
  '€' + n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// --- parse the PDF: a price line's model is the nearest non-empty line above it.
const priceRe = /^da €([\d.]*\d),(\d{2}) al mese$/;
const lines = fs.readFileSync(pdfTxtPath, 'utf8').split('\n').map((s) => s.trim());
const pdf = new Map(); // normModel -> { model, price }
const conflicts = [];
for (let i = 1; i < lines.length; i++) {
  const m = lines[i].match(priceRe);
  if (!m) continue;
  const price = parseFloat(m[1].replace(/\./g, '') + '.' + m[2]);
  let j = i - 1;
  while (j >= 0 && lines[j] === '') j--;
  const model = lines[j];
  if (!model || priceRe.test(model)) continue;
  const k = norm(model);
  if (pdf.has(k)) {
    if (pdf.get(k).price !== price) conflicts.push(`${model}: €${pdf.get(k).price} vs €${price}`);
  } else {
    pdf.set(k, { model, price });
  }
}

if (pdf.size === 0) {
  console.error('ERROR: no "da €X,XX al mese" prices found in the PDF — the layout may have changed.');
  console.error('Inspect it with:  pdftotext PROMO.pdf - | less');
  process.exit(1);
}

// --- diff against the curated JSON
const rawJson = fs.readFileSync(jsonPath, 'utf8');
const data = JSON.parse(rawJson);
const cars = data.cars;
const featured = new Set(cars.map((c) => norm(c.model)));
const cents = (n) => Math.round(n * 100); // compare in cents to dodge float noise

const changes = [];  // featured car whose price moved
const missing = [];  // featured car no longer in the PDF
for (const c of cars) {
  const hit = pdf.get(norm(c.model));
  if (!hit) { missing.push(c.model); continue; }
  if (cents(hit.price) !== cents(c.price)) changes.push({ model: c.model, old: c.price, next: hit.price });
}
const candidates = [...pdf.values()]
  .filter((v) => !featured.has(norm(v.model)))
  .sort((a, b) => a.price - b.price);

// --- report
console.log(`PROMO.pdf: ${pdf.size} unique models  |  featured in offers.json: ${cars.length}`);
if (conflicts.length) {
  console.log(`\n⚠ ${conflicts.length} model(s) had conflicting prices in the PDF (kept the first):`);
  conflicts.forEach((c) => console.log('   ' + c));
}

console.log(`\n── Price changes for featured cars: ${changes.length} ──`);
changes.forEach((c) => console.log(`   ${c.model}: ${eur(c.old)} → ${eur(c.next)}`));

console.log(`\n── Featured cars no longer in the PDF: ${missing.length} ──`);
if (missing.length) {
  missing.forEach((m) => console.log(`   ${m}   (decide: drop it, or it was renamed → see candidates)`));
} else {
  console.log('   none');
}

console.log(`\n── PDF cars you don't feature: ${candidates.length} ──`);
if (LIST) {
  candidates.forEach((v) => console.log(`   ${v.model}  (${eur(v.price)})`));
} else if (candidates.length) {
  console.log('   (re-run with --list-candidates to see them)');
}

// --- apply (prices only) via surgical raw-text edit so the diff is just the
// changed digits (preserves the file's one-car-per-line style, `.0` literals, etc.)
if (APPLY) {
  if (changes.length === 0) {
    console.log('\nNothing to apply — featured prices already match the PDF.');
    process.exit(0);
  }
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let out = rawJson;
  const failed = [];
  for (const c of changes) {
    const re = new RegExp(`("model"\\s*:\\s*"${esc(c.model)}"[\\s\\S]*?"price"\\s*:\\s*)(-?\\d+(?:\\.\\d+)?)`);
    let hit = false;
    out = out.replace(re, (_m, pre) => { hit = true; return pre + String(c.next); });
    if (!hit) failed.push(c.model);
  }
  if (failed.length) {
    console.error(`\nERROR: could not locate price field for: ${failed.join(', ')} — no changes written.`);
    process.exit(1);
  }
  // Re-parse to guarantee we didn't produce invalid JSON before overwriting.
  JSON.parse(out);
  fs.writeFileSync(jsonPath, out);
  console.log(`\n✓ Applied ${changes.length} price update(s) to ${jsonPath}`);
  process.exit(0);
}

// Non-apply: exit 1 when action is needed, so CI / you can gate on it.
if (changes.length || missing.length) {
  console.log('\nRun with --apply to write the price updates. (missing/new cars need manual work.)');
  process.exit(1);
}
console.log('\n✓ offers.json prices are in sync with PROMO.pdf.');
NODE

set +e
node "$NODE_HELPER" "$PDFTEXT" "$JSON" "$APPLY" "$LIST_CANDIDATES"
STATUS=$?
set -e

exit $STATUS
