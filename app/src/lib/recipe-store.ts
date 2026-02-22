/**
 * 食养·食谱数据加载与按体质筛选
 * 主数据源头：app/docs/recipe-master.csv（唯一 master）
 * 运行态加载：recipe-master.json，由 scripts/csv-to-recipe-json.cjs 从 CSV 生成
 * 详见 docs/代办事项与后续优化清单.md 第四节「食养·食谱主数据来源与使用」
 */

import type { Recipe } from './recipe-types'
import {
  inferDishType,
  normalizeConstitutionForRecipe,
  recipeSuitsConstitution,
  recipeSuitsConstitutionSet,
  type DishType,
} from './recipe-types'

// 构建时由 script 生成，见 app/scripts/csv-to-recipe-json.cjs
import recipeMaster from './recipe-master.json'
const recipeList: Recipe[] = recipeMaster as Recipe[]

let byId: Map<string, Recipe> | null = null
let byType: Map<DishType, Recipe[]> | null = null

function ensureIndex() {
  if (byId != null) return
  byId = new Map()
  byType = new Map()
  const typeKeys: DishType[] = ['主食', '汤', '菜', '其他']
  typeKeys.forEach((t) => byType!.set(t, []))
  for (const r of recipeList) {
    byId.set(r.id, r)
    const t = inferDishType(r.name)
    byType!.get(t)!.push(r)
  }
}

/** 全部食谱（recipe-master 全集） */
export function getAllRecipes(): Recipe[] {
  ensureIndex()
  return recipeList
}

/** 按 id 取一条 */
export function getRecipeById(id: string): Recipe | undefined {
  ensureIndex()
  return byId!.get(id)
}

/** 仅返回适合该体质的食谱（严格，不放宽）。用于「食疗方」或全库按体质统计。 */
export function getRecipesForConstitution(constitutionType: string): Recipe[] {
  const normalized = normalizeConstitutionForRecipe(constitutionType)
  if (!normalized) return []
  return recipeList.filter((r) => recipeSuitsConstitution(r, normalized))
}

/** 全部早餐类食谱（不限体质，任何体质都可选） */
export function getAllBreakfastRecipes(): Recipe[] {
  ensureIndex()
  return recipeList.filter((r) => isBreakfastCategory(r.category))
}

/** 全部家常菜类食谱（不限体质，任何体质都可选） */
export function getAllJiachangRecipes(): Recipe[] {
  ensureIndex()
  return recipeList.filter((r) => isJiachangCategory(r.category))
}

/** 适合当前体质的食疗方：测评包括平和质→全部食疗方；否则食谱适用体质须完全包含用户体质集合（type+tendency） */
export function getShiliaoRecipesForProfile(shiliaoUserSet: string[] | null): Recipe[] {
  const shiliao = recipeList.filter((r) => isShiliaoCategory(r.category))
  if (shiliaoUserSet === null || !shiliaoUserSet.length) return shiliao
  return shiliao.filter((r) => recipeSuitsConstitutionSet(r, shiliaoUserSet))
}

/** 按体质 + 类型（主食/汤/菜）筛选，用于推荐时抽选（不区分餐位，供非推荐场景用） */
export function getRecipesByConstitutionAndDishType(
  constitutionType: string,
  dishType: DishType
): Recipe[] {
  const normalized = normalizeConstitutionForRecipe(constitutionType)
  if (!normalized) return []
  const candidates = (byType ?? (ensureIndex(), byType!)).get(dishType) ?? []
  return candidates.filter((r) => recipeSuitsConstitution(r, normalized))
}

/** 是否属「早餐」类别（第一层分类：早餐 vs 非早餐） */
export function isBreakfastCategory(category: string): boolean {
  const cat = (category || '').trim()
  return cat === '早餐' || /^早餐$/i.test(cat)
}

/** 是否属「家常菜」类别 */
export function isJiachangCategory(category: string): boolean {
  const cat = (category || '').trim()
  return cat === '家常菜' || /家常菜/i.test(cat)
}

/** 是否属「食疗方」类别 */
export function isShiliaoCategory(category: string): boolean {
  const cat = (category || '').trim()
  return cat === '食疗方' || /食疗方/i.test(cat)
}

/** 是否属「非早餐」类别（家常菜或食疗方，用于午/晚餐） */
export function isNonBreakfastCategory(category: string): boolean {
  return isJiachangCategory(category) || isShiliaoCategory(category)
}

export type MealSlotForFilter = 'breakfast' | 'lunch' | 'dinner'

/** 按体质 + 菜品类型 + 餐位筛选。早餐=全部早餐；午/晚餐=全部家常菜 + 食疗方（shiliaoUserSet 为 null 则全部食疗方，否则食谱须完全包含该集合） */
export function getRecipesByConstitutionDishTypeAndSlot(
  _constitutionType: string,
  dishType: DishType,
  slot: MealSlotForFilter,
  shiliaoUserSet?: string[] | null
): Recipe[] {
  const byTypeMap = byType ?? (ensureIndex(), byType!)
  const candidates = byTypeMap.get(dishType) ?? []
  if (slot === 'breakfast') {
    return candidates.filter((r) => isBreakfastCategory(r.category))
  }
  return candidates.filter((r) => {
    if (isJiachangCategory(r.category)) return true
    if (isShiliaoCategory(r.category)) {
      if (shiliaoUserSet === null || shiliaoUserSet === undefined || shiliaoUserSet.length === 0) return true
      return recipeSuitsConstitutionSet(r, shiliaoUserSet)
    }
    return false
  })
}

export { inferDishType }
