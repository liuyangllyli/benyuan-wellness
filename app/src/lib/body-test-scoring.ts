/**
 * 身体测评题 4-19 算分与炼体法触发
 * 与 Excel 设计一致：4-12 总分、评价分段、特别提醒、15-19 触发活身法/动身法/合身法
 */

import {
  BODY_Q4_OPTIONS,
  BODY_Q5_OPTIONS,
  BODY_Q6_OPTIONS,
  BODY_Q7_OPTIONS,
  BODY_Q8_OPTIONS,
  BODY_Q9_OPTIONS,
  BODY_Q10_OPTIONS,
  BODY_Q11_OPTIONS,
  BODY_Q12_OPTIONS,
} from './assessment-data'

/** 题 4-12 每题得分（用于总分与特别提醒判断） */
export interface BodyTestScoringResult {
  qScores: Record<string, number>
  score4_12: number
  performanceLevel: 'weak' | 'good' | 'excellent'
  evaluationText: string
  overtrainingWarning: boolean
  overtrainingReasonCodes: string[]
}

/** 题 4-19 答案（选项下标或 q6 多选下标数组） */
export interface BodyTestAnswersInput {
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
}

const EVALUATION_WEAK = '您的运动表现较弱，需要进行一定量的运动，运动是人体健康不可或缺的部分，可以先从轻量开始'
const EVALUATION_GOOD = '您的运动表现良好，如身体允许可以稍稍加强运动量'
const EVALUATION_EXCELLENT = '您的运动表现佳，望继续保持'
const OVEREXERCISE_REMINDER = '同时需注意目前单次锻炼可能存在过度锻炼、透支的情况，需重视调养与锻炼的结合'

/** 过量提醒：题7 低强度120分钟以上、题8 中强度60-120分钟或更长、题9 高强度60分钟以上、题10 经常力竭、题11 酸痛剧烈 */
export function computeBodyTestScoring(answers: BodyTestAnswersInput): BodyTestScoringResult {
  const qScores: Record<string, number> = {}

  const q4Idx = answers.q4 ?? 0
  qScores.q4 = BODY_Q4_OPTIONS[q4Idx]?.score ?? 0

  const q5Idx = answers.q5 ?? 0
  qScores.q5 = BODY_Q5_OPTIONS[q5Idx]?.score ?? 0

  let q6Sum = 0
  if (Array.isArray(answers.q6)) {
    answers.q6.forEach((idx) => {
      q6Sum += BODY_Q6_OPTIONS[idx]?.score ?? 0
    })
  }
  qScores.q6 = q6Sum

  const q7Idx = answers.q7 ?? 0
  qScores.q7 = BODY_Q7_OPTIONS[q7Idx]?.score ?? 0

  const q8Idx = answers.q8 ?? 0
  qScores.q8 = BODY_Q8_OPTIONS[q8Idx]?.score ?? 0

  const q9Idx = answers.q9 ?? 0
  qScores.q9 = BODY_Q9_OPTIONS[q9Idx]?.score ?? 0

  const q10Idx = answers.q10 ?? 0
  qScores.q10 = BODY_Q10_OPTIONS[q10Idx]?.score ?? 0

  const q11Idx = answers.q11 ?? 0
  qScores.q11 = BODY_Q11_OPTIONS[q11Idx]?.score ?? 0

  const q12Idx = answers.q12 ?? 0
  qScores.q12 = BODY_Q12_OPTIONS[q12Idx]?.score ?? 0

  const score4_12 =
    (qScores.q4 ?? 0) +
    (qScores.q5 ?? 0) +
    (qScores.q6 ?? 0) +
    (qScores.q7 ?? 0) +
    (qScores.q8 ?? 0) +
    (qScores.q9 ?? 0) +
    (qScores.q10 ?? 0) +
    (qScores.q11 ?? 0) +
    (qScores.q12 ?? 0)

  let performanceLevel: 'weak' | 'good' | 'excellent' = 'good'
  let evaluationText = EVALUATION_GOOD
  if (score4_12 <= 14) {
    performanceLevel = 'weak'
    evaluationText = EVALUATION_WEAK
  } else if (score4_12 >= 26) {
    performanceLevel = 'excellent'
    evaluationText = EVALUATION_EXCELLENT
  }

  // 过量提醒：题7/8 时长过长、题9 高强度60分钟以上、题10 经常力竭、题11 酸痛剧烈
  // 题7 低强度：120分钟以上(index 3)；题8 中强度：60-120分钟(2) 或 120分钟以上(3)；题9 仅选项2「60分钟以上」
  const overtrainingReasonCodes: string[] = []
  if (q7Idx === 3) overtrainingReasonCodes.push('Q7_LONG_DURATION')
  if (q8Idx === 2 || q8Idx === 3) overtrainingReasonCodes.push('Q8_LONG_DURATION')
  if (q9Idx === 2) overtrainingReasonCodes.push('Q9_60MIN')
  if (qScores.q10 === 1) overtrainingReasonCodes.push('Q10_EXHAUSTED')
  if (qScores.q11 === 1) overtrainingReasonCodes.push('Q11_SEVERE_SORENESS')
  const overtrainingWarning = overtrainingReasonCodes.length > 0

  return {
    qScores,
    score4_12,
    performanceLevel,
    evaluationText,
    overtrainingWarning,
    overtrainingReasonCodes,
  }
}

/** 题 15/16 选「感觉中等」或「感觉明显」(index 2 或 3) → 活身法；17/18 → 动身法；19 → 合身法 */
export function getPracticeMethodsTriggered(answers: BodyTestAnswersInput): ('活身法' | '动身法' | '合身法')[] {
  const methods: ('活身法' | '动身法' | '合身法')[] = []
  const trigger = (idx: number | undefined) => idx === 2 || idx === 3
  if (trigger(answers.q15) || trigger(answers.q16)) methods.push('活身法')
  if (trigger(answers.q17) || trigger(answers.q18)) methods.push('动身法')
  if (trigger(answers.q19)) methods.push('合身法')
  return methods
}

/** 特别提醒文案（与说明书一致） */
export const OVEREXERCISE_REMINDER_TEXT = OVEREXERCISE_REMINDER
