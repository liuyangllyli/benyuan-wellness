/**
 * 体质档案与算分、推荐逻辑（与 Excel 设计稿一致，逻辑在代码中实现）
 * 读写键名与 key-code-index 一致：benyuan_profile；测评历史用 benyuan_assessment_history
 * @see app/docs/测评Excel转代码约定.md
 * @see app/docs/测评与档案存储设计.md
 */

/** 本地存储的 benyuan_profile 结构（当前档案，供推荐用） */
export interface BenyuanProfile {
  constitutionAnswers?: (number | string)[]
  constitutionType?: string
  /** 各体质维度原始分（实际得分之和），用于推荐与展示 */
  constitutionDimensionScores?: Record<string, number>
  /** 各体质维度转化分（测试用，数据保留） */
  constitutionDimensionConvertedScores?: Record<string, number>
  /** 体质倾向（转化分 30～39 的偏颇体质，如 ['痰湿质']） */
  constitutionTendency?: string[]
  bodyAnswers?: (number | string)[]
  painTags?: string[]
  timestamp?: number
}

/** 单次测评完整记录（写入历史，保留记录） */
export interface AssessmentRecord {
  id: string
  timestamp: number
  constitutionAnswers: (number | string)[]
  constitutionType: string
  /** 每题基础得分（1～5），顺序与题目一致 */
  baseScores?: number[]
  /** 每题实际得分（含 * 题反向），顺序与题目一致 */
  actualScores?: number[]
  /** 各体质维度原始分（实际得分之和） */
  constitutionDimensionScores?: Record<string, number>
  /** 各体质维度转化分（公式：((原始分-条目数)/(条目数×4))×100） */
  constitutionDimensionConvertedScores?: Record<string, number>
  /** 体质倾向（转化分 30～39 的偏颇体质） */
  constitutionTendency?: string[]
  bodyAnswers?: (number | string)[]
  painTags?: string[]
  bodyResult?: string
  logicVersion?: string
}

/** 九种体质各自题目数量（条目数） */
export const CONSTITUTION_ENTRY_COUNTS: Record<string, number> = {
  阳虚质: 7,
  阴虚质: 8,
  气虚质: 8,
  痰湿质: 8,
  湿热质: 7,
  血瘀质: 7,
  特禀质: 7,
  气郁质: 7,
  平和质: 8,
}

const PROFILE_KEY = 'benyuan_profile'
const HISTORY_KEY = 'benyuan_assessment_history'
const HISTORY_CAP = 50

/** 读取本地体质档案（当前） */
export function getProfile(): BenyuanProfile | null {
  try {
    const raw = uni.getStorageSync(PROFILE_KEY)
    if (!raw) return null
    return typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch {
    return null
  }
}

/** 写入本地体质档案（测评完成后更新「当前」） */
export function saveProfile(profile: BenyuanProfile): void {
  const next = { ...getProfile(), ...profile, timestamp: Date.now() }
  uni.setStorageSync(PROFILE_KEY, JSON.stringify(next))
}

/** 读取测评历史（按时间倒序，最多 HISTORY_CAP 条） */
export function getAssessmentHistory(): AssessmentRecord[] {
  try {
    const raw = uni.getStorageSync(HISTORY_KEY)
    if (!raw) return []
    const list = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

/** 追加一条测评记录到历史并保留最近 N 条 */
export function appendAssessmentHistory(record: AssessmentRecord): void {
  const list = getAssessmentHistory()
  list.unshift(record)
  const capped = list.slice(0, HISTORY_CAP)
  uni.setStorageSync(HISTORY_KEY, JSON.stringify(capped))
}

/** 生成一条测评记录的 id（简单唯一即可） */
export function newAssessmentId(): string {
  return `a_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

/**
 * 实际得分规则：
 * - 题目中不含 *：实际得分 = 基础得分（1→1, 2→2, 3→3, 4→4, 5→5）
 * - 题目中含 *：反向计分，基础得分 1→5, 2→4, 3→3, 4→2, 5→1（即 6 - 基础得分）
 */
export function getActualScore(baseScore: number, questionTitle: string): number {
  const isReverse = typeof questionTitle === 'string' && questionTitle.includes('*')
  if (isReverse) return 6 - baseScore
  return baseScore
}

/** 题目结构（仅需 id、title、constitutionType、options[].baseScore） */
export interface QuestionForScore {
  id: string
  constitutionType: string
  title: string
  options: { baseScore: number }[]
}

/**
 * 根据 67 题选项索引，计算每题基础得分、实际得分、各体质维度总分
 * 结果用于写入测评记录与当前档案
 */
export function computeConstitutionScores(
  optionIndices: number[],
  questions: QuestionForScore[]
): { baseScores: number[]; actualScores: number[]; dimensionScores: Record<string, number> } {
  const baseScores: number[] = []
  const actualScores: number[] = []
  const dimensionScores: Record<string, number> = {}
  questions.forEach((q, i) => {
    const base = q.options[optionIndices[i]]?.baseScore ?? 0
    baseScores.push(base)
    const actual = getActualScore(base, q.title)
    actualScores.push(actual)
    dimensionScores[q.constitutionType] = (dimensionScores[q.constitutionType] || 0) + actual
  })
  return { baseScores, actualScores, dimensionScores }
}

/**
 * 转化分公式：转化分数 = ((原始分 - 条目数) / (条目数 × 4)) × 100
 */
export function computeConvertedScore(rawScore: number, entryCount: number): number {
  if (entryCount <= 0) return 0
  return ((rawScore - entryCount) / (entryCount * 4)) * 100
}

/**
 * 由各体质原始分与条目数，计算各体质转化分
 */
export function computeConvertedScores(
  dimensionRawScores: Record<string, number>,
  entryCounts: Record<string, number>
): Record<string, number> {
  const out: Record<string, number> = {}
  Object.keys(entryCounts).forEach((type) => {
    const raw = dimensionRawScores[type] ?? 0
    const n = entryCounts[type] ?? 0
    out[type] = computeConvertedScore(raw, n)
  })
  return out
}

/** 偏颇体质 8 种（除平和质外） */
export const PIANPO_TYPES = [
  '阳虚质', '阴虚质', '气虚质', '痰湿质', '湿热质', '血瘀质', '特禀质', '气郁质',
]

/** 平和质与偏颇体质判定结果 */
export interface ConstitutionDetermination {
  /** 主判定：'是平和质' | '基本是平和质' | 某偏颇体质名（多偏颇为「是」时取其一存档用） */
  primary: string
  /** 倾向是（转化分 30～39 的偏颇体质） */
  tendency: string[]
  /** 偏颇体质中转化分≥40、判定为「是」的列表（可多个） */
  pianpoYes: string[]
  /** 最终展示文案 */
  summary: string
}

/**
 * 平和质与偏颇体质判定标准：
 * - 平和质：是 = 平和≥60 且 其他8种均<30；基本是 = 平和≥60 且 其他8种均<40；否则 否
 * - 偏颇体质：是 ≥40；倾向是 30～39；否 <30
 */
export function getConstitutionDetermination(
  convertedScores: Record<string, number>
): ConstitutionDetermination {
  const pinghe = convertedScores['平和质'] ?? 0
  const otherScores = PIANPO_TYPES.map((t) => convertedScores[t] ?? 0)
  const allUnder30 = otherScores.every((s) => s < 30)
  const allUnder40 = otherScores.every((s) => s < 40)

  if (pinghe >= 60 && allUnder30) {
    return { primary: '是平和质', tendency: [], pianpoYes: [], summary: '是平和质' }
  }
  if (pinghe >= 60 && allUnder40) {
    const tendency = PIANPO_TYPES.filter((t) => {
      const s = convertedScores[t] ?? 0
      return s >= 30 && s <= 39
    })
    const tendencyText = tendency.length
      ? `，有${tendency.map((x) => x.replace('质', '体质')).join('、')}倾向`
      : ''
    return {
      primary: '基本是平和质',
      tendency,
      pianpoYes: [],
      summary: `基本是平和体质${tendencyText}`,
    }
  }

  // 不能判平和：偏颇体质中 转化分≥40 为「是」，30～39 为「倾向是」
  const pianpoYes = PIANPO_TYPES.filter((t) => (convertedScores[t] ?? 0) >= 40)
  const tendency = PIANPO_TYPES.filter((t) => {
    const s = convertedScores[t] ?? 0
    return s >= 30 && s <= 39
  })
  const sorted = [...pianpoYes].sort(
    (a, b) => (convertedScores[b] ?? 0) - (convertedScores[a] ?? 0)
  )
  const primaryKey = sorted[0]
    ? sorted[0]
    : PIANPO_TYPES.sort(
        (a, b) => (convertedScores[b] ?? 0) - (convertedScores[a] ?? 0)
      )[0] ?? ''
  const tendencyText = tendency.length
    ? `，有${tendency.map((x) => x.replace('质', '体质')).join('、')}倾向`
    : ''
  let summary: string
  if (pianpoYes.length >= 8) {
    summary = '8种偏颇体质转化分均≥40，均为是'
  } else if (pianpoYes.length > 1) {
    summary =
      pianpoYes.map((x) => x.replace('质', '体质')).join('、') + ' 均为是' + tendencyText
  } else {
    const primaryLabel = primaryKey ? primaryKey.replace('质', '体质') : ''
    summary = primaryLabel + tendencyText
  }
  return {
    primary: primaryKey,
    tendency,
    pianpoYes,
    summary,
  }
}

/** 示例数据与预期结果，用于验证判定逻辑 */
const EXAMPLE_1_SCORES: Record<string, number> = {
  平和质: 75, 气虚质: 56, 阳虚质: 27, 阴虚质: 25, 痰湿质: 12,
  湿热质: 15, 血瘀质: 20, 气郁质: 18, 特禀质: 10,
}
const EXAMPLE_2_SCORES: Record<string, number> = {
  平和质: 75, 气虚质: 16, 阳虚质: 27, 阴虚质: 25, 痰湿质: 32,
  湿热质: 25, 血瘀质: 10, 气郁质: 18, 特禀质: 10,
}

/**
 * 验证示例1、示例2的判定结果与预期一致（示例1→气虚体质；示例2→基本是平和体质，有痰湿体质倾向）
 */
export function verifyDeterminationExamples(): boolean {
  const r1 = getConstitutionDetermination(EXAMPLE_1_SCORES)
  const r2 = getConstitutionDetermination(EXAMPLE_2_SCORES)
  const ok1 =
    r1.primary === '气虚质' &&
    r1.summary === '气虚体质' &&
    r1.pianpoYes.length === 1 &&
    r1.pianpoYes[0] === '气虚质'
  const ok2 =
    r2.primary === '基本是平和质' &&
    r2.tendency.length === 1 &&
    r2.tendency[0] === '痰湿质' &&
    r2.pianpoYes.length === 0 &&
    r2.summary === '基本是平和体质，有痰湿体质倾向'
  return ok1 && ok2
}

/**
 * 根据体质 9 题答案计算体质类型（与 Excel 算分规则一致）
 * 当前为占位：按每题所选选项的 value（体质类型）统计次数，取最多的；您提供算分逻辑后会替换
 * @param selectedValues 每题所选选项的 value，顺序与题目一致（如 ['平和质','气虚质', ...]）
 */
export function getConstitutionResult(selectedValues: (string | number)[]): string {
  if (!selectedValues.length) return ''
  const count: Record<string, number> = {}
  selectedValues.forEach((val) => {
    if (val != null && val !== '') {
      const key = String(val)
      count[key] = (count[key] || 0) + 1
    }
  })
  const entries = Object.entries(count)
  if (!entries.length) return ''
  entries.sort((a, b) => b[1] - a[1])
  return entries[0][0]
}

/**
 * 根据身体 5 题 + 疼痛部位得到身体测试结果（用于炼体指导）
 * 待您提供 Excel 规则后实现
 */
export function getBodyTestResult(
  bodyAnswers: (number | string)[],
  painTags: string[]
): string {
  // TODO: 按 Excel 实现
  return ''
}

/**
 * 根据体质类型返回饮食指导文案（与 Excel 体质→饮食 对照一致）
 */
export function getDietGuide(constitutionType: string): string {
  if (!constitutionType) return ''
  // TODO: 从 Excel 体质→饮食表填入映射
  return ''
}

/**
 * 根据身体结果（+ 可选疼痛部位）返回炼体指导文案（与 Excel 一致）
 */
export function getPracticeGuide(
  bodyResult: string,
  painTags?: string[]
): string {
  if (!bodyResult && (!painTags || !painTags.length)) return ''
  // TODO: 从 Excel 身体/疼痛→炼体表填入映射
  return ''
}
