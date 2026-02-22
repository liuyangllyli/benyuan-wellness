/**
 * 食养·食谱类型与规则
 * 与 docs/代办事项与后续优化清单.md 一致：类型用名字关键词推断，推荐严格按适合体质
 */

export type DishType = '主食' | '汤' | '菜' | '其他'

export interface Recipe {
  id: string
  name: string
  ingredients: string
  steps: string
  category: string
  effect: string
  suitConstitution: string
  avoidWith: string
  howToEat: string
  notes: string
}

/** 由名字关键词推断：主食/汤/菜/其他 */
export function inferDishType(name: string): DishType {
  const n = name.trim()
  if (!n) return '其他'
  if (/粥|饭|面|粉|饼|馒头|包子|饺子|米|寿面|炒糯米/i.test(n)) return '主食'
  if (/汤|饮|汁|糊\s*$|羹/i.test(n)) return '汤'
  if (/炒|拌|蒸|炖|煮|煨|烧|煎|炸|扒|爆|焖|烩|扣|煸|菜|豆腐|鸡|鱼|肉|蛋|芹|笋|菇|芦笋|鲍鱼|猪血|肘子|鳝|虾|扇贝|南瓜|百合|枸杞|银耳|桃仁|芝糊|荸荠|双耳|鲍鱼|茼蒿|银花|酸辣/i.test(n)) return '菜'
  return '其他'
}

/** 九种体质（与测评、CSV 一致），用于匹配 */
export const CONSTITUTION_TYPES = [
  '平和质', '气虚质', '阳虚质', '阴虚质', '痰湿质', '湿热质', '血瘀质', '气郁质', '特禀质',
] as const

/** 档案中的体质判定 → 用于食谱匹配的体质名（只推「适合体质」，严格一致） */
export function normalizeConstitutionForRecipe(profileType: string): string | null {
  if (!profileType || typeof profileType !== 'string') return null
  const t = profileType.trim()
  if (t === '是平和质' || t === '基本是平和质') return '平和质'
  if (CONSTITUTION_TYPES.includes(t as any)) return t
  return null
}

/** 解析 CSV「适合体质」列：拆成数组，普通正常质→平和质 */
export function parseSuitConstitution(suitConstitution: string): string[] {
  if (!suitConstitution || typeof suitConstitution !== 'string') return []
  const raw = suitConstitution.split(/[、，,]\s*/).map((s) => s.trim()).filter(Boolean)
  return raw.map((s) => (s === '普通正常质' ? '平和质' : s))
}

/** 食谱是否适合该体质（严格：用户体质须在食谱的适合体质列表中） */
export function recipeSuitsConstitution(recipe: Recipe, normalizedConstitution: string): boolean {
  if (!normalizedConstitution) return false
  const suits = parseSuitConstitution(recipe.suitConstitution)
  return suits.includes(normalizedConstitution)
}

/** 食谱的「适合体质」是否完全包含用户体质集合（用户集合 ⊆ 食谱适合体质列表）。用于偏颇体质用户筛选食疗方。 */
export function recipeSuitsConstitutionSet(recipe: Recipe, userConstitutionSet: string[]): boolean {
  if (!userConstitutionSet?.length) return false
  const recipeSuits = parseSuitConstitution(recipe.suitConstitution)
  return userConstitutionSet.every((t) => recipeSuits.includes(t))
}

/** 从「不宜同吃」和「食材」字符串中提取用于冲突检测的词（去掉量、单位等） */
export function extractIngredientsForConflict(text: string): string[] {
  if (!text || typeof text !== 'string') return []
  const list: string[] = []
  const parts = text.replace(/\d+[克克毫升适量少许各\d、，。\s]+/g, ' ').split(/[、，,。\s]+/)
  for (const p of parts) {
    const s = p.replace(/^[\d.]+|[\d.]+$/g, '').trim()
    if (s.length >= 2 && !/^[、，.]+$/.test(s)) list.push(s)
  }
  return [...new Set(list)]
}

/** 两道菜是否「不宜同吃」冲突：甲食材是否出现在乙的不宜同吃中，或反向 */
export function hasAvoidConflict(recipeA: Recipe, recipeB: Recipe): boolean {
  const ingredientsA = extractIngredientsForConflict(recipeA.ingredients)
  const avoidA = extractIngredientsForConflict(recipeA.avoidWith)
  const ingredientsB = extractIngredientsForConflict(recipeB.ingredients)
  const avoidB = extractIngredientsForConflict(recipeB.avoidWith)
  for (const ing of ingredientsA) {
    if (avoidB.some((a) => a.includes(ing) || ing.includes(a))) return true
  }
  for (const ing of ingredientsB) {
    if (avoidA.some((a) => a.includes(ing) || ing.includes(a))) return true
  }
  return false
}

/** 一组食谱中是否存在任意两道「不宜同吃」冲突 */
export function findAvoidConflictInGroup(recipes: Recipe[]): [Recipe, Recipe] | null {
  for (let i = 0; i < recipes.length; i++) {
    for (let j = i + 1; j < recipes.length; j++) {
      if (hasAvoidConflict(recipes[i], recipes[j])) return [recipes[i], recipes[j]]
    }
  }
  return null
}
