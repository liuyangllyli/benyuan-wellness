/**
 * 节气与五运六气
 * 用于食养页展示「应对的五运六气和节气」，食养之道内容将结合体质+节气+五运六气由 CSV 提供
 */

/** 24 节气（按公历近似日期，每年略有浮动，存在约 1～2 日误差；精确数据待接入预计算表或 API，见 docs/代办事项与后续优化清单.md） */
const SOLAR_TERMS = [
  { name: '小寒', month: 1, day: 6 },
  { name: '大寒', month: 1, day: 20 },
  { name: '立春', month: 2, day: 4 },
  { name: '雨水', month: 2, day: 19 },
  { name: '惊蛰', month: 3, day: 5 },
  { name: '春分', month: 3, day: 20 },
  { name: '清明', month: 4, day: 5 },
  { name: '谷雨', month: 4, day: 20 },
  { name: '立夏', month: 5, day: 5 },
  { name: '小满', month: 5, day: 21 },
  { name: '芒种', month: 6, day: 6 },
  { name: '夏至', month: 6, day: 21 },
  { name: '小暑', month: 7, day: 7 },
  { name: '大暑', month: 7, day: 22 },
  { name: '立秋', month: 8, day: 8 },
  { name: '处暑', month: 8, day: 23 },
  { name: '白露', month: 9, day: 8 },
  { name: '秋分', month: 9, day: 23 },
  { name: '寒露', month: 10, day: 8 },
  { name: '霜降', month: 10, day: 23 },
  { name: '立冬', month: 11, day: 8 },
  { name: '小雪', month: 11, day: 22 },
  { name: '大雪', month: 12, day: 7 },
  { name: '冬至', month: 12, day: 22 },
]

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = d.getTime() - start.getTime()
  return Math.floor(diff / (24 * 60 * 60 * 1000))
}

/** 当前日期所在的节气（按公历近似，供展示用） */
export function getCurrentSolarTerm(date?: Date): { name: string; nextName?: string } {
  const d = date ?? new Date()
  const y = d.getFullYear()
  const doy = dayOfYear(d)

  for (let i = 0; i < SOLAR_TERMS.length; i++) {
    const t = SOLAR_TERMS[i]
    const next = SOLAR_TERMS[(i + 1) % SOLAR_TERMS.length]
    const termStart = dayOfYear(new Date(y, t.month - 1, t.day))
    const nextStart = dayOfYear(new Date(next.month > t.month ? y : y + 1, next.month - 1, next.day))
    const inRange = nextStart > termStart
      ? doy >= termStart && doy < nextStart
      : doy >= termStart || doy < nextStart
    if (inRange) return { name: t.name, nextName: next.name }
  }
  return { name: SOLAR_TERMS[23].name, nextName: SOLAR_TERMS[0].name }
}

/**
 * 五运六气（当前为占位，待接入权威数据或算法）
 * 可后续根据年份干支、当前节气等计算或查表
 */
export function getWuYunLiuQi(_date?: Date): string {
  return '待接入' // 合伙人提供规范后接入
}
