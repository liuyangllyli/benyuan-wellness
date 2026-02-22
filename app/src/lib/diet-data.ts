/**
 * 食养模块静态数据：今日三餐示例、体质饮食宜忌、十二时辰
 * 参考 Lovable Diet 页面，供 diet.vue 使用
 *
 * DIET_GUIDE_BY_CONSTITUTION 数据源说明：
 * - 当前为代码内写死的键值表，无独立 CSV/Excel。最初来源于 Lovable 食养页参考文案。
 * - 严谨要求：宜有权威出处（如中医体质与饮食规范）或可维护数据源（如 Excel/CSV），
 *   见 docs/代办事项与后续优化清单.md「食养·饮食概览数据源」。
 */

export interface MealRecipe {
  name: string
  benefit: string
  ingredients: string[]
  steps: string[]
  tcmAdvice: string
}

export interface MealItem {
  id: string
  title: string
  time: string
  timeRange: string
  constitution: string
  recipe: MealRecipe
}

/** 今日三餐（早/午/晚）示例，后续可改为根据体质或时令生成 */
export const DIET_MEALS: MealItem[] = [
  {
    id: 'breakfast',
    title: '给你的脾胃一碗温暖',
    time: '7:00',
    timeRange: '7:00–8:00',
    constitution: '温补脾胃',
    recipe: {
      name: '山药红枣小米粥',
      benefit: '健脾益气，温养脾胃',
      ingredients: ['山药 50g', '小米 80g', '红枣 3颗', '枸杞 5g'],
      steps: [
        '小米淘洗，山药去皮切丁',
        '红枣去核，枸杞洗净',
        '水沸后放入小米和山药',
        '小火熬煮30分钟，加红枣枸杞再煮5分钟',
      ],
      tcmAdvice: '辰时胃经当令，此时进食养胃效果最佳。',
    },
  },
  {
    id: 'lunch',
    title: '用一餐滋养你的身心',
    time: '12:00',
    timeRange: '12:00–13:00',
    constitution: '滋阴润燥',
    recipe: {
      name: '番茄扇贝豆腐汤',
      benefit: '滋阴润燥，补充营养',
      ingredients: ['番茄 2个', '扇贝 6个', '豆腐 200g', '姜丝适量'],
      steps: [
        '番茄切块，豆腐切丁',
        '锅中炒香姜丝和番茄',
        '加水煮沸，放入扇贝和豆腐',
        '煮10分钟，调味即可',
      ],
      tcmAdvice: '午时心经当令，午餐宜温润，不宜过于辛辣。',
    },
  },
  {
    id: 'dinner',
    title: '一顿温和的晚餐，为你安神',
    time: '18:00',
    timeRange: '18:00–19:00',
    constitution: '宁心安神',
    recipe: {
      name: '莲子百合南瓜蒸',
      benefit: '宁心安神，助眠健脾',
      ingredients: ['莲子 50g', '百合 30g', '南瓜 300g', '蜂蜜适量'],
      steps: [
        '莲子去心，百合洗净',
        '南瓜切块蒸15分钟',
        '莲子百合蒸20分钟',
        '淋蜂蜜，温热食用',
      ],
      tcmAdvice: '酉时肾经当令，晚餐宜清淡。',
    },
  },
]

/** 三餐时间区间（与设置页「我的偏好」一致，未设置时用默认值） */
export type MealTimeRanges = { breakfast: string; lunch: string; dinner: string }

const DEFAULT_MEAL_TIME_RANGES: MealTimeRanges = {
  breakfast: '7:00–8:00',
  lunch: '12:00–13:00',
  dinner: '18:00–19:00',
}

export function getMealTimeRanges(): MealTimeRanges {
  try {
    const raw = uni.getStorageSync('benyuan_settings')
    if (!raw) return DEFAULT_MEAL_TIME_RANGES
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw
    const r = data?.mealTimeRanges
    if (r && typeof r.breakfast === 'string' && typeof r.lunch === 'string' && typeof r.dinner === 'string') {
      return { breakfast: r.breakfast, lunch: r.lunch, dinner: r.dinner }
    }
  } catch (_) {}
  return DEFAULT_MEAL_TIME_RANGES
}

export interface DietGuide {
  type: string
  dir: string
  dos: string[]
  donts: string[]
}

/** 九种体质对应的饮食方向与宜忌（简要，可后续扩展） */
export const DIET_GUIDE_BY_CONSTITUTION: Record<string, DietGuide> = {
  平和质: {
    type: '平和质',
    dir: '均衡饮食，五谷为养，无需刻意偏颇。',
    dos: ['五谷杂粮', '时令蔬果', '适量肉蛋'],
    donts: ['过饱过饥', '过度辛辣生冷'],
  },
  气虚质: {
    type: '气虚质',
    dir: '益气健脾，温补为主。',
    dos: ['山药', '黄芪', '红枣', '小米'],
    donts: ['生冷寒凉', '过于油腻'],
  },
  阳虚质: {
    type: '阳虚质',
    dir: '温阳散寒，宜温补。',
    dos: ['羊肉', '生姜', '核桃', '桂圆'],
    donts: ['生冷', '冷饮', '苦瓜等寒凉'],
  },
  阴虚质: {
    type: '阴虚质',
    dir: '滋阴润燥，宜甘凉濡润。',
    dos: ['百合', '银耳', '梨', '鸭肉'],
    donts: ['辛辣燥热', '熬夜耗阴'],
  },
  痰湿质: {
    type: '痰湿质',
    dir: '健脾化湿，宜清淡利湿。',
    dos: ['薏米', '赤小豆', '冬瓜', '陈皮'],
    donts: ['肥甘厚味', '甜腻生湿'],
  },
  湿热质: {
    type: '湿热质',
    dir: '清热利湿，宜清淡。',
    dos: ['绿豆', '冬瓜', '苦瓜', '绿茶'],
    donts: ['辛辣油炸', '酒类助湿'],
  },
  血瘀质: {
    type: '血瘀质',
    dir: '活血化瘀，宜温通。',
    dos: ['山楂', '黑木耳', '玫瑰花', '红糖'],
    donts: ['寒凝生冷', '过度油腻'],
  },
  气郁质: {
    type: '气郁质',
    dir: '疏肝理气，宜舒畅情志与饮食。',
    dos: ['佛手', '橘皮', '玫瑰花', '麦芽'],
    donts: ['壅滞难化', '情绪下进食过饱'],
  },
  特禀质: {
    type: '特禀质',
    dir: '因人而异，注意过敏原与体质倾向。',
    dos: ['平和易消化食材', '时令新鲜'],
    donts: ['已知过敏原', '发物过量'],
  },
}

/**
 * 食养之道：根据体质、节气、五运六气返回建议文案
 * 当前为占位，待合伙人提供 CSV 后接入（见 docs/代办事项与后续优化清单.md）
 */
export function getShiyangAdvice(
  _constitutionType: string,
  _solarTermName: string,
  _wuYunLiuQi: string
): string {
  return '' // 待 CSV 接入后按 体质+节气+五运六气 查表返回
}

export interface ShiChenItem {
  name: string
  organ: string
  advice: string
}

/** 十二时辰：子丑寅卯辰巳午未申酉戌亥，每辰约 2 小时 */
const SHICHEN_NAMES = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时']
const SHICHEN_ORGANS = ['胆经', '肝经', '肺经', '大肠经', '胃经', '脾经', '心经', '小肠经', '膀胱经', '肾经', '心包经', '三焦经']

/** 简易时辰建议（可后续按产品文案细化） */
const SHICHEN_ADVICE: string[] = [
  '宜安卧养阳',
  '宜深睡养肝血',
  '宜平旦起床、吐纳',
  '宜晨起排便、饮水',
  '宜进食养胃',
  '宜运化吸收、适度活动',
  '宜午餐温润、小憩',
  '宜消化吸收、多饮水',
  '宜利尿排毒、学习',
  '宜晚餐清淡、养肾',
  '宜散步放松，愉悦心情',
  '宜准备入睡',
]

export function getShiChenList(): ShiChenItem[] {
  return SHICHEN_NAMES.map((name, i) => ({
    name: `${name}·${SHICHEN_ORGANS[i]}当令`,
    organ: SHICHEN_ORGANS[i],
    advice: SHICHEN_ADVICE[i] ?? '宜顺应自然',
  }))
}

/** 根据当前小时（0–23）取对应时辰（每辰 2 小时，子时 23–1） */
export function getCurrentShiChenIndex(hour: number): number {
  // 子=0: 23,0,1 → 丑=1: 1,2,3 → ... 戌=10: 19,20,21 → 亥=11: 21,22,23
  const h = hour === 0 ? 24 : hour
  const idx = Math.floor((h + 1) / 2) % 12
  return idx
}

export function getCurrentShiChen(hour?: number): ShiChenItem {
  const h = hour ?? new Date().getHours()
  const list = getShiChenList()
  const idx = getCurrentShiChenIndex(h)
  return list[idx]
}
