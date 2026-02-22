/**
 * 将 recipe-master.csv（唯一主数据）转为 recipe-master.json，供前端加载
 * 运行：node app/scripts/csv-to-recipe-json.cjs（在项目根目录）
 * 源头与列映射见 docs/代办事项与后续优化清单.md 第四节
 */
const fs = require('fs')
const path = require('path')

const csvPath = path.join(__dirname, '../docs/recipe-master.csv')
const outPath = path.join(__dirname, '../src/lib/recipe-master.json')

function parseCSV(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuote = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuote) {
      if (c === '"') {
        inQuote = false
      } else {
        field += c
      }
      continue
    }
    if (c === '"') {
      inQuote = true
      continue
    }
    if (c === ',') {
      row.push(field.trim())
      field = ''
      continue
    }
    if (c === '\n' || c === '\r') {
      if (field !== '' || row.length > 0) {
        row.push(field.trim())
        field = ''
        if (row.some((cell) => cell.length > 0)) rows.push(row)
        row = []
      }
      if (c === '\r' && text[i + 1] === '\n') i++
      continue
    }
    field += c
  }
  if (field !== '' || row.length > 0) {
    row.push(field.trim())
    if (row.some((cell) => cell.length > 0)) rows.push(row)
  }
  return rows
}

const raw = fs.readFileSync(csvPath, 'utf8')
const rows = parseCSV(raw)
const header = rows[0]
const col = (name) => {
  const i = header.indexOf(name)
  if (i === -1) throw new Error('Missing column: ' + name)
  return i
}
const idx = {
  id: col('食谱ID'),
  name: col('食谱名字'),
  ingredients: col('食材'),
  steps: col('烹饪步骤'),
  category: col('类别（食疗方/家常菜/早餐）'),
  effect: col('功效'),
  suitConstitution: col('适合体质'),
  avoidWith: col('不宜同吃'),
  howToEat: col('食用方法'),
  notes: col('注意事项'),
}

const list = []
for (let r = 1; r < rows.length; r++) {
  const row = rows[r]
  if (row.length <= idx.id) continue
  const id = String(row[idx.id] || '').trim()
  const name = String(row[idx.name] || '').trim()
  if (!id && !name) continue
  list.push({
    id: id || `row-${r}`,
    name,
    ingredients: String(row[idx.ingredients] || '').trim(),
    steps: String(row[idx.steps] || '').trim(),
    category: String(row[idx.category] || '').trim(),
    effect: String(row[idx.effect] || '').trim().replace(/\s+/g, ' '),
    suitConstitution: String(row[idx.suitConstitution] || '').trim(),
    avoidWith: String(row[idx.avoidWith] || '').trim(),
    howToEat: String(row[idx.howToEat] || '').trim(),
    notes: String(row[idx.notes] || '').trim(),
  })
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(list, null, 0), 'utf8')
console.log('Wrote', list.length, 'recipes to', outPath)
