import fs from 'node:fs';

const scriptPath = new URL('../site/assets/js/app.js', import.meta.url);
const reportPath = new URL('../reports/cover-audit-report.json', import.meta.url);

let source = fs.readFileSync(scriptPath, 'utf8');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

function escapeJsString(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

let updated = 0;
const misses = [];

for (const suggestion of report.suggestions) {
  const idLiteral = escapeJsString(suggestion.id);
  const objectPattern = new RegExp(`(\\{\\n\\s+id: '${idLiteral}',[\\s\\S]*?\\n\\s+\\})`, 'm');
  const match = source.match(objectPattern);
  if (!match) {
    misses.push(suggestion.id);
    continue;
  }

  let objectText = match[1];
  const alt = `Real cover from ${suggestion.source}`;
  objectText = objectText.replace(/coverImage: '[^']*',/, `coverImage: '${escapeJsString(suggestion.image)}',`);
  objectText = objectText.replace(/coverAlt: '[^']*',/, `coverAlt: '${escapeJsString(alt)}',`);
  source = source.slice(0, match.index) + objectText + source.slice(match.index + match[1].length);
  updated += 1;
}

fs.writeFileSync(scriptPath, source);
console.log(JSON.stringify({ updated, misses }, null, 2));
