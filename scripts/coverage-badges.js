import { makeBadge } from 'badge-maker';
import fs from 'node:fs';

function getCoveragePercent(jsonPath) {
  if (!fs.existsSync(jsonPath)) {
    console.error(
      `Fichier introuvable : ${jsonPath} (lance d'abord pnpm test:coverage)`,
    );
    process.exit(1);
  }
  const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const score = Number(json.total.lines.pct);
  if (!Number.isFinite(score)) {
    console.error(`Score de couverture invalide dans ${jsonPath}`);
    process.exit(1);
  }
  return score;
}

const setColor = (value) => {
  if (value < 50) return '#e63946';
  if (value < 80) return '#f4a261';
  return '#2a9d8f';
};

const services = [
  { name: 'back', path: 'apps/back/coverage/coverage-summary.json' },
  // { name: 'front', path: 'apps/front/coverage/coverage-summary.json' }, // avec #139
];

fs.mkdirSync('badges', { recursive: true });

for (const service of services) {
  const percent = getCoveragePercent(service.path);
  const badge = makeBadge({
    label: `${service.name} coverage`,
    message: `${percent}%`,
    color: setColor(percent),
  });
  fs.writeFileSync(`badges/coverage-${service.name}.svg`, badge);
  console.log(`✅ ${service.name} : ${percent}%`);
}

let readme = fs.readFileSync('README.md', 'utf8');
const badgesMarkdown = services
  .map((s) => `![${s.name} coverage](badges/coverage-${s.name}.svg)`)
  .join(' ');

readme = readme.replace(
  /<!-- COVERAGE BADGES START -->[\s\S]*<!-- COVERAGE BADGES END -->/,
  `<!-- COVERAGE BADGES START -->\n${badgesMarkdown}\n<!-- COVERAGE BADGES END -->`,
);

fs.writeFileSync('README.md', readme);
console.log('README mis à jour avec les badges de couverture.');
