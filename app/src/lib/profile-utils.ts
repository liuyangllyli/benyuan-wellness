/**
 * 体质档案与算分、推荐逻辑（与 Excel 设计稿一致，逻辑在代码中实现）
 * 读写键名与 key-code-index 一致：benyuan_profile；测评历史用 benyuan_assessment_history
 * 档案为分块结构（基本信息 / 体质 / 身体测试），支持单块更新与历史复现。
 * @see app/docs/测评Excel转代码约定.md
 * @see app/docs/测评与档案存储设计.md
 */

const PROFILE_SCHEMA_VERSION = 1

/** 基本信息块（Step1） */
export interface BasicInfoBlock {
  specialConditions?: string[]
  ageRange?: string
  gender?: string
  occupation?: string
  updatedAt?: number
}

/** 体质测评块（Step2） */
export interface ConstitutionBlock {
  answers: (number | string)[]
  baseScores?: number[]
  actualScores?: number[]
  dimensionScores: Record<string, number>
  dimensionConvertedScores: Record<string, number>
  type: string
  tendency?: string[]
  pianpoYes?: string[]
  summary?: string
  updatedAt?: number
}

/** 身体测评块（Step3，题4-19） */
export interface BodyTestBlock {
  q4?: number
  q5?: number
  q6?: number[]
  q7?: number
  q8?: number
  q9?: number
  q10?: number
  q11?: number
  q12?: number
  q13?: number[]
  q14?: number[]
  q15?: number
  q16?: number
  q17?: number
  q18?: number
  q19?: number
  score4_12?: number
  evaluation?: string
  overtrainingWarning?: boolean
  exerciseMethods?: string[]
  updatedAt?: number
}

/** 当前档案（v1 分块结构） */
export interface BenyuanProfile {
  schemaVersion?: number
  basicInfo?: BasicInfoBlock
  constitution?: ConstitutionBlock
  bodyTest?: BodyTestBlock
  timestamp?: number
  lastFullAssessmentAt?: number
  status?: {
    hasBasicInfo: boolean
    hasConstitution: boolean
    hasBodyTest: boolean
  }
  derived?: {
    specialSituationSelected?: boolean
    minorOrElderNeedCompanion?: boolean
  }
  // 兼容旧版读取：保留顶层体质字段的兼容（迁移后由 constitution 块填充，见 migrateProfileToV1）
  constitutionAnswers?: (number | string)[]
  constitutionType?: string
  constitutionDimensionScores?: Record<string, number>
  constitutionDimensionConvertedScores?: Record<string, number>
  constitutionTendency?: string[]
  bodyAnswers?: (number | string)[]
  painTags?: string[]
}

/** 测评记录类型（分块） */
export type AssessmentRecordType = 'basic_info' | 'constitution' | 'body_test'

/** 单次测评记录（历史一条，可复现当次结果） */
export interface AssessmentRecord {
  id: string
  timestamp: number
  type: AssessmentRecordType
  payload: {
    basicInfo?: BasicInfoBlock
    constitution?: ConstitutionBlock
    bodyTest?: BodyTestBlock
  }
  logicVersion?: string
  // 兼容旧版：历史中可能仍存在旧格式（无 type/payload），读取时迁移
  constitutionAnswers?: (number | string)[]
  constitutionType?: string
  baseScores?: number[]
  actualScores?: number[]
  constitutionDimensionScores?: Record<string, number>
  constitutionDimensionConvertedScores?: Record<string, number>
  constitutionTendency?: string[]
  bodyAnswers?: (number | string)[]
  painTags?: string[]
  bodyResult?: string
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

/** 将旧版 profile（顶层 constitution*）迁移为 v1 分块结构 */
function migrateProfileToV1(raw: Record<string, unknown>): BenyuanProfile {
  if (raw.schemaVersion === PROFILE_SCHEMA_VERSION) {
    return raw as BenyuanProfile
  }
  const now = Date.now()
  const p: BenyuanProfile = {
    schemaVersion: PROFILE_SCHEMA_VERSION,
    timestamp: (raw.timestamp as number) ?? now,
  }
  if (raw.constitutionAnswers != null || raw.constitutionType != null) {
    p.constitution = {
      answers: (raw.constitutionAnswers as (number | string)[]) ?? [],
      dimensionScores: (raw.constitutionDimensionScores as Record<string, number>) ?? {},
      dimensionConvertedScores: (raw.constitutionDimensionConvertedScores as Record<string, number>) ?? {},
      type: (raw.constitutionType as string) ?? '',
      tendency: (raw.constitutionTendency as string[]) ?? undefined,
      baseScores: raw.baseScores as number[] | undefined,
      actualScores: raw.actualScores as number[] | undefined,
      updatedAt: now,
    }
    p.constitutionAnswers = p.constitution.answers
    p.constitutionType = p.constitution.type
    p.constitutionDimensionScores = p.constitution.dimensionScores
    p.constitutionDimensionConvertedScores = p.constitution.dimensionConvertedScores
    p.constitutionTendency = p.constitution.tendency
  }
  if (raw.bodyAnswers != null || raw.painTags != null) {
    p.bodyAnswers = raw.bodyAnswers as (number | string)[]
    p.painTags = raw.painTags as string[]
  }
  p.status = {
    hasBasicInfo: !!raw.basicInfo,
    hasConstitution: !!p.constitution,
    hasBodyTest: !!raw.bodyTest,
  }
  return p
}

/** 将旧版历史记录（无 type/payload）迁移为新格式 */
function migrateLegacyRecord(r: Record<string, unknown>): AssessmentRecord {
  if (r.type != null && r.payload != null) {
    return r as AssessmentRecord
  }
  return {
    id: (r.id as string) ?? newAssessmentId(),
    timestamp: (r.timestamp as number) ?? 0,
    type: 'constitution',
    payload: {
      constitution: {
        answers: (r.constitutionAnswers as (number | string)[]) ?? [],
        dimensionScores: (r.constitutionDimensionScores as Record<string, number>) ?? {},
        dimensionConvertedScores: (r.constitutionDimensionConvertedScores as Record<string, number>) ?? {},
        type: (r.constitutionType as string) ?? '',
        tendency: (r.constitutionTendency as string[]) ?? undefined,
        baseScores: r.baseScores as number[] | undefined,
        actualScores: r.actualScores as number[] | undefined,
      },
    },
    logicVersion: r.logicVersion as string | undefined,
  }
}

/** 读取本地体质档案（当前）；若为旧版则迁移并写回 */
export function getProfile(): BenyuanProfile | null {
  try {
    const raw = uni.getStorageSync(PROFILE_KEY)
    if (!raw) return null
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    const profile = migrateProfileToV1(parsed)
    if (parsed.schemaVersion !== PROFILE_SCHEMA_VERSION) {
      uni.setStorageSync(PROFILE_KEY, JSON.stringify(profile))
    }
    return profile
  } catch {
    return null
  }
}

/** 写入本地体质档案（支持分块合并）；传入的 partial 仅更新对应块并刷新 timestamp */
export function saveProfile(partial: Partial<BenyuanProfile>): void {
  const now = Date.now()
  const current = getProfile()
  const next: BenyuanProfile = {
    ...current,
    ...partial,
    timestamp: now,
    schemaVersion: current?.schemaVersion ?? PROFILE_SCHEMA_VERSION,
  }
  if (partial.basicInfo != null) {
    next.basicInfo = { ...partial.basicInfo, updatedAt: now }
    next.status = { ...next.status, hasBasicInfo: true } as BenyuanProfile['status']
  }
  if (partial.constitution != null) {
    next.constitution = { ...partial.constitution, updatedAt: now }
    next.status = { ...next.status, hasConstitution: true } as BenyuanProfile['status']
    next.constitutionAnswers = next.constitution.answers
    next.constitutionType = next.constitution.type
    next.constitutionDimensionScores = next.constitution.dimensionScores
    next.constitutionDimensionConvertedScores = next.constitution.dimensionConvertedScores
    next.constitutionTendency = next.constitution.tendency
  }
  if (partial.bodyTest != null) {
    next.bodyTest = { ...partial.bodyTest, updatedAt: now }
    next.status = { ...next.status, hasBodyTest: true } as BenyuanProfile['status']
  }
  if (partial.lastFullAssessmentAt != null) next.lastFullAssessmentAt = partial.lastFullAssessmentAt
  if (partial.derived != null) next.derived = { ...current?.derived, ...partial.derived }
  if (next.status == null) {
    next.status = {
      hasBasicInfo: !!next.basicInfo,
      hasConstitution: !!next.constitution,
      hasBodyTest: !!next.bodyTest,
    }
  }
  uni.setStorageSync(PROFILE_KEY, JSON.stringify(next))
}

/** 读取测评历史（按时间倒序，最多 HISTORY_CAP 条）；旧版记录在内存中迁移为新格式 */
export function getAssessmentHistory(): AssessmentRecord[] {
  try {
    const raw = uni.getStorageSync(HISTORY_KEY)
    if (!raw) return []
    const list = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!Array.isArray(list)) return []
    return list.map((r: Record<string, unknown>) => migrateLegacyRecord(r))
  } catch {
    return []
  }
}

/** 追加一条测评记录到历史并保留最近 N 条；record 需含 id、timestamp、type、payload */
export function appendAssessmentHistory(record: AssessmentRecord): void {
  const list = getAssessmentHistory()
  const normalized: AssessmentRecord = record.type != null && record.payload != null
    ? record
    : migrateLegacyRecord(record as unknown as Record<string, unknown>)
  list.unshift(normalized)
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
