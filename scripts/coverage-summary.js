import fs from 'node:fs';

const services = ['back', 'front'];

for (const service of services) {
  const { total } = JSON.parse(
    fs.readFileSync(`apps/${service}/coverage/coverage-summary.json`, 'utf8'),
  );
  console.log(`### Couverture ${service}\n`);
  console.log('| Métrique | % |\n|---|---|');
  console.log(`| Lignes | ${total.lines.pct} |`);
  console.log(`| Instructions | ${total.statements.pct} |`);
  console.log(`| Fonctions | ${total.functions.pct} |`);
  console.log(`| Branches | ${total.branches.pct} |\n`);
}
