/**
 * 食养模块：饮食建议、今日完成、餐后感受、好评食谱
 * 存储键与 Lovable 对齐：benyuan_diet_feelings、benyuan_logs；今日完成用 benyuan_diet_completed
 */

import type { BenyuanProfile } from './profile-utils'
import { DIET_GUIDE_BY_CONSTITUTION, type DietGuide } from './diet-data'

const DIET_COMPLETED_KEY = 'benyuan_diet_completed'
const DIET_FEELINGS_KEY = 'benyuan_diet_feelings'
const LOGS_KEY = 'benyuan_logs'

/** 根据档案体质取饮食建议 */
export function getDietGuide(profile: BenyuanProfile | null): DietGuide | null {
  const type = profile?.constitution?.type
  if (!type) return null
  return DIET_GUIDE_BY_CONSTITUTION[type] ?? null
}

/** 今日已完成餐次 id 列表 */
function getTodayKey(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function getTodayDietCompleted(): string[] {
  try {
    const raw = uni.getStorageSync(DIET_COMPLETED_KEY)
    if (!raw) return []
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw
    const today = getTodayKey()
    return Array.isArray(data?.ids) && data?.date === today ? data.ids : []
  } catch {
    return []
  }
}

export function markDietComplete(mealId: string): void {
  const today = getTodayKey()
  const ids = getTodayDietCompleted()
  if (ids.includes(mealId)) return
  const next = [...ids, mealId]
  uni.setStorageSync(DIET_COMPLETED_KEY, JSON.stringify({ date: today, ids: next }))
}

/** 取消标记该餐为已完成（用于餐卡上点击圆圈切换） */
export function unmarkDietComplete(mealId: string): void {
  const today = getTodayKey()
  const ids = getTodayDietCompleted().filter((id) => id !== mealId)
  uni.setStorageSync(DIET_COMPLETED_KEY, JSON.stringify({ date: today, ids }))
}

export interface DietFeelingRecord {
  mealId: string
  feeling: number
  timestamp: number
  /** 预留：用户自由文字反馈，供后续 AI 偏好提炼使用 */
  freeText?: string
}

function getDietFeelings(): DietFeelingRecord[] {
  try {
    const raw = uni.getStorageSync(DIET_FEELINGS_KEY)
    if (!raw) return []
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

/** 记录餐后感受（1–4），可选自由文字；并同步一条到 benyuan_logs 供归元趋势用 */
export function saveDietFeeling(mealId: string, feeling: number, freeText?: string): void {
  const list = getDietFeelings()
  list.push({ mealId, feeling, timestamp: Date.now(), ...(freeText != null && freeText !== '' ? { freeText } : {}) })
  uni.setStorageSync(DIET_FEELINGS_KEY, JSON.stringify(list))

  try {
    const logs = JSON.parse(uni.getStorageSync(LOGS_KEY) || '[]')
    logs.push({
      bodyFeeling: feeling,
      type: 'diet',
      item: mealId,
      timestamp: Date.now(),
    })
    uni.setStorageSync(LOGS_KEY, JSON.stringify(logs))
  } catch {
    // ignore
  }
}

export interface TopRatedRecipe {
  mealId: string
  count: number
}

/** 已提交过餐后反馈的 mealId 列表（用于展示「已反馈」角标） */
export function getDietFeedbackDoneIds(): string[] {
  const list = getDietFeelings()
  const ids = new Set<string>()
  list.forEach((r) => ids.add(r.mealId))
  return Array.from(ids)
}

/** 好评食谱：感受为 3（舒适）或 4（满足）的餐次按 mealId 统计次数，取前几条 */
export function getTopRatedRecipes(limit = 5): TopRatedRecipe[] {
  const list = getDietFeelings()
  const countByMeal: Record<string, number> = {}
  list.forEach((r) => {
    if (r.feeling >= 3) countByMeal[r.mealId] = (countByMeal[r.mealId] || 0) + 1
  })
  const entries = Object.entries(countByMeal)
    .filter(([, c]) => c > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
  return entries.map(([mealId, count]) => ({ mealId, count }))
}
