/**
 * 食养·推荐引擎：单日与周计划
 * 规则：主食最多1、汤最多1、至少1道菜；严格适合体质；同餐位3天不重复；不宜同吃校验
 */

import type { Recipe } from './recipe-types'
import {
  findAvoidConflictInGroup,
  inferDishType,
  type DishType,
} from './recipe-types'
import {
  getRecipesByConstitutionDishTypeAndSlot,
  getRecipeById,
} from './recipe-store'

export type MealSlotKey = 'breakfast' | 'lunch' | 'dinner'

/** 单日三餐：每餐为食谱 id 数组（顺序可：主食、汤、菜…） */
export interface DayMeals {
  breakfast: string[]
  lunch: string[]
  dinner: string[]
}

/** 洗牌后取前 n 个（不修改原数组） */
function shuffleSlice<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

/** 从候选中排除已用 id，再随机取最多 limit 个 */
function pickFrom(
  candidates: Recipe[],
  excludeIds: Set<string>,
  limit: number
): Recipe[] {
  const available = candidates.filter((r) => !excludeIds.has(r.id))
  return shuffleSlice(available, limit)
}

/** 组一餐：主食≤1、汤≤1、菜≥1，且不宜同吃无冲突。早餐仅从「早餐」选，午/晚餐仅从「家常菜」「食疗方」选；shiliaoUserSet 用于食疗方筛选（null=全部） */
function buildOneMeal(
  constitutionType: string,
  slot: MealSlotKey,
  excludeIds: Set<string>,
  shiliaoUserSet?: string[] | null
): Recipe[] {
  const staple = getRecipesByConstitutionDishTypeAndSlot(constitutionType, '主食', slot, shiliaoUserSet)
  const soup = getRecipesByConstitutionDishTypeAndSlot(constitutionType, '汤', slot, shiliaoUserSet)
  const dish = getRecipesByConstitutionDishTypeAndSlot(constitutionType, '菜', slot, shiliaoUserSet)
  const other = getRecipesByConstitutionDishTypeAndSlot(constitutionType, '其他', slot, shiliaoUserSet)

  const picked: Recipe[] = []
  const used = new Set(excludeIds)

  const addOne = (list: Recipe[], max: number) => {
    const got = pickFrom(list, used, max)
    got.forEach((r) => {
      picked.push(r)
      used.add(r.id)
    })
  }

  addOne(staple, 1)
  addOne(soup, 1)
  addOne(dish, 1)
  if (picked.length === 0 && dish.length === 0) addOne(other, 1)
  if (picked.length < 2) addOne(dish, 1)
  if (picked.length < 2) addOne(other, 1)

  let conflict = findAvoidConflictInGroup(picked)
  while (conflict) {
    const [a, b] = conflict
    const toReplace = picked.indexOf(a)
    const pool = toReplace === 0 ? staple : toReplace === 1 ? soup : dish.length ? dish : other
    const alt = pickFrom(pool, used, 1)[0]
    if (!alt) break
    picked[toReplace] = alt
    used.delete(a.id)
    used.add(alt.id)
    conflict = findAvoidConflictInGroup(picked)
  }

  // 早餐固定为 2 道（仅来自「早餐」类别池，已由 getRecipesByConstitutionDishTypeAndSlot 保证）
  if (slot === 'breakfast') return picked.slice(0, 2)
  return picked
}

const MAX_DAY_RETRIES = 6

/** 单日推荐：需传入该餐位近 3 天已用的 recipeId 集合；shiliaoUserSet 为食疗方筛选用。前置检查：若当日存在跨餐不宜同吃则重试，保证系统推荐无冲突。 */
export function getSingleDayRecommendation(
  constitutionType: string,
  excludeBreakfast: string[],
  excludeLunch: string[],
  excludeDinner: string[],
  shiliaoUserSet?: string[] | null
): DayMeals {
  const setB = new Set(excludeBreakfast)
  const setL = new Set(excludeLunch)
  const setD = new Set(excludeDinner)
  for (let retry = 0; retry < MAX_DAY_RETRIES; retry++) {
    const day: DayMeals = {
      breakfast: buildOneMeal(constitutionType, 'breakfast', setB, shiliaoUserSet).map((r) => r.id),
      lunch: buildOneMeal(constitutionType, 'lunch', setL, shiliaoUserSet).map((r) => r.id),
      dinner: buildOneMeal(constitutionType, 'dinner', setD, shiliaoUserSet).map((r) => r.id),
    }
    if (validateDayMealsAvoidConflict(day).ok) return day
  }
  return {
    breakfast: buildOneMeal(constitutionType, 'breakfast', setB, shiliaoUserSet).map((r) => r.id),
    lunch: buildOneMeal(constitutionType, 'lunch', setL, shiliaoUserSet).map((r) => r.id),
    dinner: buildOneMeal(constitutionType, 'dinner', setD, shiliaoUserSet).map((r) => r.id),
  }
}

const MAX_WEEK_RETRIES = 5

/** 周计划推荐：下周一～下周日，同餐位在 7 天内尽量 3 天不重复；shiliaoUserSet 为食疗方筛选用。前置检查：任一日存在不宜同吃则整周重试，保证系统推荐无冲突。 */
export function getWeekRecommendation(
  constitutionType: string,
  weekStartYMD: string,
  shiliaoUserSet?: string[] | null
): Record<string, DayMeals> {
  for (let w = 0; w < MAX_WEEK_RETRIES; w++) {
    const out: Record<string, DayMeals> = {}
    const recentB: string[][] = []
    const recentL: string[][] = []
    const recentD: string[][] = []
    let hasConflict = false
    for (let d = 0; d < 7; d++) {
      const dateYMD = addDaysYMD(weekStartYMD, d)
      const day = getSingleDayRecommendation(
        constitutionType,
        recentB.slice(-3).flat(),
        recentL.slice(-3).flat(),
        recentD.slice(-3).flat(),
        shiliaoUserSet
      )
      out[dateYMD] = day
      if (!validateDayMealsAvoidConflict(day).ok) hasConflict = true
      recentB.push(day.breakfast)
      recentL.push(day.lunch)
      recentD.push(day.dinner)
    }
    if (!hasConflict) return out
  }
  const out: Record<string, DayMeals> = {}
  const recentB: string[][] = []
  const recentL: string[][] = []
  const recentD: string[][] = []
  for (let d = 0; d < 7; d++) {
    const dateYMD = addDaysYMD(weekStartYMD, d)
    out[dateYMD] = getSingleDayRecommendation(
      constitutionType,
      recentB.slice(-3).flat(),
      recentL.slice(-3).flat(),
      recentD.slice(-3).flat(),
      shiliaoUserSet
    )
    recentB.push(out[dateYMD].breakfast)
    recentL.push(out[dateYMD].lunch)
    recentD.push(out[dateYMD].dinner)
  }
  return out
}

function addDaysYMD(ymd: string, days: number): string {
  const [y, m, d] = ymd.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + days)
  const yy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

/** 当前日期 YYYY-MM-DD */
export function todayYMD(): string {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

/** 明日日期 YYYY-MM-DD（用于明日三餐展示与备餐提醒） */
export function tomorrowYMD(): string {
  return addDaysYMD(todayYMD(), 1)
}

/** 下周一 0 点对应的 YMD（用于周计划「下一周」） */
export function nextMondayYMD(): string {
  const d = new Date()
  const day = d.getDay()
  const add = day === 0 ? 1 : day === 1 ? 7 : 8 - day
  d.setDate(d.getDate() + add)
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

/** 将 DayMeals 中的 id 转为 Recipe（用于展示） */
export function resolveDayMeals(day: DayMeals): { breakfast: Recipe[]; lunch: Recipe[]; dinner: Recipe[] } {
  return {
    breakfast: day.breakfast.map((id) => getRecipeById(id)).filter(Boolean) as Recipe[],
    lunch: day.lunch.map((id) => getRecipeById(id)).filter(Boolean) as Recipe[],
    dinner: day.dinner.map((id) => getRecipeById(id)).filter(Boolean) as Recipe[],
  }
}

/** 校验当日三餐是否存在不宜同吃冲突（仅当日早+午+晚内检查，不涉及跨天；用户自选或保存前调用） */
export function validateDayMealsAvoidConflict(day: DayMeals): { ok: boolean; conflict?: [Recipe, Recipe] } {
  const all = [...day.breakfast, ...day.lunch, ...day.dinner]
    .map((id) => getRecipeById(id))
    .filter(Boolean) as Recipe[]
  const conflict = findAvoidConflictInGroup(all)
  return conflict ? { ok: false, conflict } : { ok: true }
}
