import { readFileSync, writeFileSync } from 'fs'

const DEV_SCRIPT = '<script type="module" src="/src/embed.ts"></script>'
const PROD_SCRIPT = '<script src="/embed.js"></script>'

for (const file of ['index.html', 'form.html']) {
  const content = readFileSync(file, 'utf-8').replace(DEV_SCRIPT, PROD_SCRIPT)
  writeFileSync(`dist-embed/${file}`, content)
  console.log(`copied ${file} → dist-embed/${file}`)
}
