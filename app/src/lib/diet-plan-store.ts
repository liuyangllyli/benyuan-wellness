/**
 * 食养·周计划与日菜谱存储
 * 结构支持多用户扩展（当前用单用户 key，后续可加 userId 前缀）
 * @see docs/代办事项与后续优化清单.md
 * @see docs/食养-今日明日下周菜单存储与读写关系.md 今日/明日/下周菜单的存储与读写、下周到来时如何作为今日明日使用
 */

import type { DayMeals } from './diet-recommend'
import { nextMondayYMD, todayYMD, tomorrowYMD } from './diet-recommend'

const WEEK_PLAN_KEY = 'benyuan_diet_week_plan'
const SKIP_NEXT_WEEK_KEY = 'benyuan_diet_skip_next_week_ymd'
const WEEK_ARCHIVE_KEY = 'benyuan_diet_week_archive'
const TODAY_GENERATED_KEY = 'benyuan_diet_today_generated'
const TOMORROW_GENERATED_KEY = 'benyuan_diet_tomorrow_generated'
const REPLACED_SLOTS_KEY = 'benyuan_diet_replaced_slots'
const SCHEMA_VERSION = 1
const ARCHIVE_MAX_WEEKS = 26

export interface WeekPlanRecord {
  schemaVersion: number
  /** 周一起始日 YYYY-MM-DD */
  weekStartYMD: string
  /** 下周一～下周日共 7 天，key 为 YYYY-MM-DD */
  meals: Record<string, DayMeals>
  updatedAt: number
  /** 预留：多用户时区分 */
  userId?: string
}

function getStoredWeekPlan(): WeekPlanRecord | null {
  try {
    const raw = uni.getStorageSync(WEEK_PLAN_KEY)
    if (!raw) return null
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (data?.schemaVersion !== SCHEMA_VERSION) return null
    return data as WeekPlanRecord
  } catch {
    return null
  }
}

/** 读取已存储的周计划（任意一周），用于编辑/展示 */
export function getWeekPlanRecord(): WeekPlanRecord | null {
  return getStoredWeekPlan()
}

/** 获取当前生效的周计划（若今日落在某周计划区间内则返回该计划） */
export function getActiveWeekPlan(): WeekPlanRecord | null {
  const plan = getStoredWeekPlan()
  if (!plan?.meals) return null
  const today = todayYMD()
  const start = plan.weekStartYMD
  const startDate = new Date(start + 'T00:00:00')
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)
  const todayDate = new Date(today + 'T00:00:00')
  if (todayDate < startDate || todayDate > endDate) return null
  return plan
}

/** 周计划存档：key 为 weekStartYMD，最多保留 ARCHIVE_MAX_WEEKS 周 */
export type WeekArchive = Record<string, WeekPlanRecord>

function getArchive(): WeekArchive {
  try {
    const raw = uni.getStorageSync(WEEK_ARCHIVE_KEY)
    if (!raw) return {}
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw
    return typeof data === 'object' && data !== null ? data : {}
  } catch {
    return {}
  }
}

function saveArchive(archive: WeekArchive): void {
  uni.setStorageSync(WEEK_ARCHIVE_KEY, JSON.stringify(archive))
}

/** 该周周日 YYYY-MM-DD（周一 +6 天） */
function getSundayYMD(weekStartYMD: string): string {
  const [y, m, d] = weekStartYMD.split('-').map(Number)
  const date = new Date(y, m - 1, d + 6)
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

/** 若当前存储的周计划已过「周日 24:00」（即今日 > 该周周日），则归档并清空当前计划；归档最多保留 26 周 */
export function ensureArchiveCurrentPlan(): void {
  const plan = getStoredWeekPlan()
  if (!plan?.meals || Object.keys(plan.meals).length === 0) return
  const sunday = getSundayYMD(plan.weekStartYMD)
  if (todayYMD() <= sunday) return
  const archive = getArchive()
  archive[plan.weekStartYMD] = plan
  const weekStarts = Object.keys(archive).sort()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - ARCHIVE_MAX_WEEKS * 7)
  const cutoffYMD = [cutoff.getFullYear(), String(cutoff.getMonth() + 1).padStart(2, '0'), String(cutoff.getDate()).padStart(2, '0')].join('-')
  for (const ws of weekStarts) {
    if (ws < cutoffYMD) delete archive[ws]
  }
  saveArchive(archive)
  uni.removeStorageSync(WEEK_PLAN_KEY)
}

/** 保存周计划（覆盖） */
export function saveWeekPlan(weekStartYMD: string, meals: Record<string, DayMeals>): void {
  const record: WeekPlanRecord = {
    schemaVersion: SCHEMA_VERSION,
    weekStartYMD,
    meals,
    updatedAt: Date.now(),
  }
  uni.setStorageSync(WEEK_PLAN_KEY, JSON.stringify(record))
}

/** 清空当前周计划（归档后或用户主动删除时调用） */
export function clearCurrentWeekPlan(): void {
  uni.removeStorageSync(WEEK_PLAN_KEY)
}

/** 是否选择「不安排」下一周菜单（按下一周周一日期匹配） */
export function isNextWeekSkipped(): boolean {
  try {
    const stored = uni.getStorageSync(SKIP_NEXT_WEEK_KEY)
    return stored === nextMondayYMD()
  } catch {
    return false
  }
}

/** 设置下一周为不安排（true）或安排（false） */
export function setNextWeekSkipped(skip: boolean): void {
  if (skip) {
    uni.setStorageSync(SKIP_NEXT_WEEK_KEY, nextMondayYMD())
  } else {
    try {
      if (uni.getStorageSync(SKIP_NEXT_WEEK_KEY) === nextMondayYMD()) {
        uni.removeStorageSync(SKIP_NEXT_WEEK_KEY)
      }
    } catch (_) {}
  }
}

/** 某日某餐位是否被用户替换过（用于展示 推荐/自选 标签） */
export type ReplacedSlotsStore = Record<string, Record<'breakfast' | 'lunch' | 'dinner', boolean>>

function getReplacedSlotsRaw(): ReplacedSlotsStore {
  try {
    const raw = uni.getStorageSync(REPLACED_SLOTS_KEY)
    if (!raw) return {}
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw
    return typeof data === 'object' && data !== null ? data : {}
  } catch {
    return {}
  }
}

function saveReplacedSlotsRaw(store: ReplacedSlotsStore): void {
  uni.setStorageSync(REPLACED_SLOTS_KEY, JSON.stringify(store))
}

export function isSlotReplaced(dateYMD: string, slot: 'breakfast' | 'lunch' | 'dinner'): boolean {
  const store = getReplacedSlotsRaw()
  return !!store[dateYMD]?.[slot]
}

export function markSlotReplaced(dateYMD: string, slot: 'breakfast' | 'lunch' | 'dinner'): void {
  const store = getReplacedSlotsRaw()
  if (!store[dateYMD]) store[dateYMD] = { breakfast: false, lunch: false, dinner: false }
  store[dateYMD][slot] = true
  saveReplacedSlotsRaw(store)
}

export function clearReplacedForDay(dateYMD: string): void {
  const store = getReplacedSlotsRaw()
  delete store[dateYMD]
  saveReplacedSlotsRaw(store)
}

/** 今日菜谱：若在周计划内则从周计划取，否则返回 null（由调用方再走单日推荐） */
export function getTodayMealsFromPlan(): DayMeals | null {
  const plan = getActiveWeekPlan()
  if (!plan) return null
  const today = todayYMD()
  return plan.meals[today] ?? null
}

/** 单日推荐结果缓存（当日有效）。00:00 滚存：昨日「明日菜单」若已存在则迁入今日并清空明日缓存。 */
export function getTodayGeneratedMeals(): DayMeals | null {
  const today = todayYMD()
  try {
    const raw = uni.getStorageSync(TODAY_GENERATED_KEY)
    if (raw) {
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw
      if (data?.date === today) return data.meals as DayMeals
    }
    const tomRaw = uni.getStorageSync(TOMORROW_GENERATED_KEY)
    if (tomRaw) {
      const tom = typeof tomRaw === 'string' ? JSON.parse(tomRaw) : tomRaw
      if (tom?.forDate === today && tom?.meals) {
        saveTodayGeneratedMeals(tom.meals as DayMeals)
        uni.removeStorageSync(TOMORROW_GENERATED_KEY)
        return tom.meals as DayMeals
      }
    }
  } catch {
    // ignore
  }
  return null
}

export function saveTodayGeneratedMeals(meals: DayMeals): void {
  uni.setStorageSync(
    TODAY_GENERATED_KEY,
    JSON.stringify({ date: todayYMD(), meals })
  )
}

/** 明日推荐结果缓存（key 为明日日期，用于明日三餐展示与换一道后持久化） */
export function getTomorrowGeneratedMeals(): DayMeals | null {
  try {
    const raw = uni.getStorageSync(TOMORROW_GENERATED_KEY)
    if (!raw) return null
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (data?.forDate !== tomorrowYMD()) return null
    return data.meals as DayMeals
  } catch {
    return null
  }
}

export function saveTomorrowGeneratedMeals(meals: DayMeals): void {
  uni.setStorageSync(
    TOMORROW_GENERATED_KEY,
    JSON.stringify({ forDate: tomorrowYMD(), meals })
  )
}

/** 取某日的菜谱（仅从已存周计划读，不生成） */
export function getDayMealsFromPlan(dateYMD: string): DayMeals | null {
  const plan = getStoredWeekPlan()
  if (!plan?.meals) return null
  return plan.meals[dateYMD] ?? null
}

/** 最近 3 天（不含今日）该餐位用过的 recipeId 列表，用于单日推荐排除 */
export function getRecentMealIdsForSlot(
  slot: 'breakfast' | 'lunch' | 'dinner'
): string[] {
  const plan = getStoredWeekPlan()
  if (!plan?.meals) return []
  const today = todayYMD()
  const dates = getPreviousDaysYMD(today, 3)
  const ids: string[] = []
  for (const ymd of dates) {
    const day = plan.meals[ymd]
    if (day) ids.push(...(day[slot] ?? []))
  }
  return ids
}

function getPreviousDaysYMD(fromYMD: string, n: number): string[] {
  const [y, m, d] = fromYMD.split('-').map(Number)
  const from = new Date(y, m - 1, d)
  const out: string[] = []
  for (let i = 1; i <= n; i++) {
    const d = new Date(from)
    d.setDate(d.getDate() - i)
    out.push(
      [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-')
    )
  }
  return out
}
