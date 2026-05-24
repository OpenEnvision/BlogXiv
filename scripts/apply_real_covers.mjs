import fs from 'node:fs';

const scriptPath = new URL('../site/assets/js/app.js', import.meta.url);
const reportPath = new URL('../reports/cover-audit-report.json', import.meta.url);

let source = fs.readFileSync(scriptPath, 'utf8');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

function escapeJsString(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function escapeJsDoubleString(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

let updated = 0;
const misses = [];

for (const suggestion of report.suggestions) {
  const image = suggestion.image || suggestion.newCover;
  if (!image) {
    misses.push(suggestion.id);
    continue;
  }

  const idLiteral = escapeJsString(suggestion.id);
  const objectPattern = new RegExp(`(\\{\\n\\s+id: '${idLiteral}',[\\s\\S]*?\\n\\s+\\})`, 'm');
  const match = source.match(objectPattern);
  const alt = `Real cover from ${suggestion.source}`;

  if (match) {
    let objectText = match[1];
    objectText = objectText.replace(/coverImage: '[^']*',/, `coverImage: '${escapeJsString(image)}',`);
    objectText = objectText.replace(/coverAlt: '[^']*',/, `coverAlt: '${escapeJsString(alt)}',`);
    source = source.slice(0, match.index) + objectText + source.slice(match.index + match[1].length);
    updated += 1;
    continue;
  }

  const iclrMatch = suggestion.id.match(/^iclr(20\d{2})-(.+)$/);
  if (iclrMatch) {
    const [, year, slug] = iclrMatch;
    const arrayPatterns = [
      new RegExp(
        `(\\[\\n\\s+"${escapeRegex(slug)}",[\\s\\S]*?\\n\\s+"${escapeRegex(suggestion.url)}",\\n\\s+)"[^"]*",\\n\\s+"[^"]*"(\\n\\s+\\])`,
        'm'
      ),
      new RegExp(
        `(\\[\\n\\s+${year},\\n\\s+"${escapeRegex(slug)}",[\\s\\S]*?\\n\\s+"${escapeRegex(suggestion.url)}",\\n\\s+)"[^"]*",\\n\\s+"[^"]*"(\\n\\s+\\])`,
        'm'
      )
    ];
    const arrayMatch = arrayPatterns.map(pattern => source.match(pattern)).find(Boolean);
    if (arrayMatch) {
      const replacement = `${arrayMatch[1]}"${escapeJsDoubleString(image)}",\n${arrayMatch[1].match(/\n(\s+)$/)?.[1] || ''}"${escapeJsDoubleString(alt)}"${arrayMatch[2]}`;
      source = source.slice(0, arrayMatch.index) + replacement + source.slice(arrayMatch.index + arrayMatch[0].length);
      updated += 1;
      continue;
    }
  }

  misses.push(suggestion.id);
}

fs.writeFileSync(scriptPath, source);
console.log(JSON.stringify({ updated, misses }, null, 2));
