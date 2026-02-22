/**
 * 食养·Mock 用户体质
 * 当用户未做体质测评时，用 mock 保证可展示推荐与周计划逻辑（仅开发/演示）
 */

import type { BenyuanProfile } from './profile-utils'

const MOCK_CONSTITUTION_TYPE = '平和质'

/** 用于食养页的 mock 档案：假设已填体质测评且结果为 平和质 */
export function getMockProfileForDiet(): BenyuanProfile {
  return {
    schemaVersion: 1,
    constitution: {
      answers: [],
      dimensionScores: {},
      dimensionConvertedScores: {},
      type: MOCK_CONSTITUTION_TYPE,
      tendency: [],
      summary: '气虚质',
      updatedAt: Date.now(),
    },
    status: {
      hasBasicInfo: false,
      hasConstitution: true,
      hasBodyTest: false,
    },
    timestamp: Date.now(),
  }
}

/** 食养页取「当前用于推荐的体质」：有档案用档案，否则用 mock */
export function getConstitutionTypeForDiet(profile: BenyuanProfile | null): string | null {
  const t = profile?.constitution?.type
  if (t && typeof t === 'string' && t.trim()) return t.trim()
  return getMockProfileForDiet().constitution?.type ?? null
}

/**
 * 食疗方筛选用「用户体质集合」：
 * - 测评结果包括平和质（type 为 平和质）→ 返回 null，表示可吃全部食疗方
 * - 否则返回 [type, ...tendency]，筛选时要求食谱适用体质完全包含该集合
 */
export function getShiliaoUserSet(profile: BenyuanProfile | null): string[] | null {
  const p = profile ?? getMockProfileForDiet()
  const type = p?.constitution?.type
  if (!type || typeof type !== 'string') return null
  const t = type.trim()
  if (t === '平和质') return null
  const tendency = p?.constitution?.tendency
  const list = Array.isArray(tendency) ? tendency : []
  return [t, ...list].filter((s) => typeof s === 'string' && s.trim())
}
