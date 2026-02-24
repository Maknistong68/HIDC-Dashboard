import { readFileSync } from 'fs'
const d = JSON.parse(readFileSync(0, 'utf8'))
const byRule = {}
d.forEach(f => {
  f.messages.forEach(m => {
    const rule = m.ruleId || 'parse-error'
    if (!byRule[rule]) byRule[rule] = []
    const rel = f.filePath.replace(/.*[\\\/]src[\\\/]/, 'src/')
    byRule[rule].push({ file: rel, line: m.line, msg: m.message.substring(0, 80) })
  })
})
Object.entries(byRule).sort((a, b) => b[1].length - a[1].length).forEach(([rule, items]) => {
  const files = [...new Set(items.map(i => i.file))]
  console.log(`\n=== ${rule} (${items.length} in ${files.length} files) ===`)
  files.forEach(f => {
    const fi = items.filter(i => i.file === f)
    console.log(`  ${f}: L${fi.map(i => i.line).join(',')}`)
  })
})
