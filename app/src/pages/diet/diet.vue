<template>
  <view class="page">
    <!-- 顶部 -->
    <view class="header">
      <view class="header-row">
        <text class="title">食养之道</text>
        <view class="tag">气·食养调气</view>
      </view>
      <view class="shichen-block">
        <text class="shichen-name">{{ shiChen.name }}</text>
        <text class="shichen-advice">{{ shiChen.advice }}</text>
        <text class="shichen-hint">按当日时辰更新</text>
      </view>
    </view>

    <!-- 体质·五运六气·节气·食养之道（食养之道待 CSV 接入） -->
    <view v-if="constitutionSummary" class="card overview">
      <text class="card-title">你的饮食概览</text>
      <view class="overview-row">
        <text class="overview-label">体质测试结果</text>
        <text class="overview-value">{{ constitutionSummary }}</text>
      </view>
      <view class="overview-row">
        <text class="overview-label">五运六气 · 节气</text>
        <view class="overview-value-wrap">
          <text class="overview-value">{{ wuYunLiuQi }} · {{ solarTerm.name }}</text>
          <view class="csv-missing-badge" title="待提供数据">
            <text class="csv-missing-icon">⚠</text>
            <text class="csv-missing-text">缺：节气与五运六气数据（数据接入后会移除）</text>
          </view>
        </view>
      </view>
      <view class="overview-block shiyang-block">
        <view class="overview-label-row">
          <text class="overview-label">食养之道</text>
          <view v-if="!shiyangAdvice" class="csv-missing-badge">
            <text class="csv-missing-icon">⚠</text>
            <text class="csv-missing-text">缺：食养之道 CSV（数据接入后会移除）</text>
          </view>
        </view>
        <text v-if="shiyangAdvice" class="shiyang-content">{{ shiyangAdvice }}</text>
        <text v-else class="shiyang-placeholder">内容将根据体质、五运六气与节气由合伙人提供 CSV 后生成</text>
      </view>
    </view>
    <view v-else class="card empty">
      <text class="card-desc">完成观己体质测评后，可查看体质与食养建议</text>
      <text class="link" @click="goProfile">去观己测评</text>
    </view>

    <!-- 安全提示（小字+可折叠，减少干扰） -->
    <view class="safety-tip" :class="{ expanded: safetyTipExpanded }" @click="safetyTipExpanded = !safetyTipExpanded">
      <text class="safety-icon">▲</text>
      <text v-if="!safetyTipExpanded" class="safety-text">食谱建议仅供参考（点击展开）</text>
      <text v-else class="safety-text">食谱建议仅供参考，过敏体质请注意食材筛选。点击收起</text>
    </view>

    <!-- 适合你的食谱库 + 自选/推荐说明 -->
    <view v-if="constitutionType" class="card recipe-lib-entry">
      <view class="card-head">
        <text class="card-title">适合你的食谱库</text>
        <view class="csv-missing-badge">
          <text class="csv-missing-icon">⚠</text>
          <text class="csv-missing-text">缺：食谱类型列（数据接入后会移除）</text>
        </view>
      </view>
      <text class="card-desc">按体质筛选的完整食谱，可自选或使用推荐</text>
      <view class="recipe-lib-actions">
        <text class="recipe-lib-count">共 {{ fullRecipeList.length }} 道</text>
        <text class="link" @click="openRecipeLibrary">查看全部食谱</text>
      </view>
    </view>

    <!-- 今日三餐（推荐 or 自选替换） -->
    <view class="section" :class="{ 'section-locked': !constitutionType }">
      <view class="section-head-row">
        <text class="section-title">今日三餐</text>
        <text v-if="todayResolved" class="link reroll-today" @click="rerollToday">重新推荐今日菜单</text>
      </view>
      <text class="section-desc">同餐位 3 天内不重复；点任一道菜可换一道。点击餐卡左侧圆圈可标记该餐「已完成」</text>
      <view v-if="!constitutionType" class="card empty">
        <text class="card-desc">暂无推荐，请先完成观己体质测评</text>
        <text class="link" @click="goProfile">去观己测评</text>
      </view>
      <view v-else-if="!todayResolved" class="card empty">
        <text class="card-desc">尚未生成今日菜单</text>
        <view class="empty-actions">
          <text class="link" @click="rerollToday">重新推荐今日菜单</text>
          <text class="link" @click="openRecipeLibrary">或查看食谱库自选</text>
        </view>
      </view>
      <template v-else>
        <view
          v-for="slot in mealSlots"
          :key="slot.key"
          class="meal-card"
          :class="[getSlotStatus(slot.key), { hasFeedback: feedbackDone.includes(slot.key) }]"
        >
          <view class="meal-left" @click.stop="toggleMealComplete(slot.key)">
            <view v-if="completedItems.includes(slot.key)" class="meal-dot done">
              <text class="dot-check">✓</text>
            </view>
            <view v-else-if="getSlotStatus(slot.key) === 'current'" class="meal-dot current" />
            <view v-else class="meal-dot" />
          </view>
          <view class="meal-body">
            <view class="meal-meta">
              <text class="meal-time">{{ slot.timeRange }}</text>
              <text v-if="completedItems.includes(slot.key)" class="meal-done-badge">已完成</text>
              <text v-if="feedbackDone.includes(slot.key)" class="feedback-badge">已反馈</text>
            </view>
            <text class="meal-title">{{ slot.label }}</text>
            <view class="recipe-names">
              <text
                v-for="r in slot.recipes"
                :key="r.id"
                class="recipe-name"
                @click.stop="openDetail(r.id, slot.key)"
              >{{ r.name }}</text>
            </view>
          </view>
        </view>
      </template>
    </view>

    <!-- 明日三餐（方便下午选菜备餐；与今日同一页，周菜单仍在下） -->
    <view class="section section-tomorrow" :class="{ 'section-locked': !constitutionType }">
      <view class="section-head-row">
        <text class="section-title">明日三餐</text>
        <text v-if="tomorrowResolved" class="link reroll-today" @click="rerollTomorrow">重新推荐明日菜单</text>
      </view>
      <text class="section-desc">提前看好明日菜单，方便备餐；点任一道菜可换一道</text>
      <view v-if="!constitutionType" class="card empty">
        <text class="card-desc">暂无推荐，请先完成观己体质测评</text>
        <text class="link" @click="goProfile">去观己测评</text>
      </view>
      <view v-else-if="!tomorrowResolved" class="card empty">
        <text class="card-desc">尚未生成明日菜单</text>
        <view class="empty-actions">
          <text class="link" @click="rerollTomorrow">重新推荐明日菜单</text>
          <text class="link" @click="openRecipeLibrary">或查看食谱库自选</text>
        </view>
      </view>
      <template v-else>
        <view
          v-for="slot in tomorrowMealSlots"
          :key="'tomorrow-' + slot.key"
          class="meal-card tomorrow-card tomorrow-card-no-dot"
        >
          <view class="meal-body">
            <view class="meal-meta">
              <text class="meal-time">{{ slot.timeRange }}</text>
            </view>
            <text class="meal-title">{{ slot.label }}</text>
            <view class="recipe-names">
              <text
                v-for="r in slot.recipes"
                :key="r.id"
                class="recipe-name"
                @click.stop="openDetail(r.id, slot.key, tomorrowYMD())"
              >{{ r.name }}</text>
            </view>
          </view>
        </view>
      </template>
    </view>

    <!-- 下一周菜单：勾选不安排/安排，不安排时整块灰显 -->
    <view class="card week-entry" :class="{ 'week-entry-skipped': nextWeekSkipped }">
      <view class="week-entry-inner">
        <view class="week-entry-title-row">
          <view class="week-entry-title-with-icon">
          <text class="week-entry-icon">📆</text>
          <text class="card-title">下一周菜单</text>
        </view>
          <view class="csv-missing-badge">
            <text class="csv-missing-icon">⚠</text>
            <text class="csv-missing-text">缺：食材分类数据（数据接入后会移除）</text>
          </view>
        </view>
        <text class="card-desc">周六选好下周菜单，周末采购食材</text>
      </view>
      <view class="week-entry-options">
        <view class="week-option" @click.stop="chooseSkipNextWeek">
          <view class="week-option-dot" :class="{ checked: nextWeekSkipped }" />
          <text class="week-option-label">不安排下周菜单</text>
        </view>
        <view class="week-option" @click.stop="chooseArrangeNextWeek">
          <view class="week-option-dot" :class="{ checked: !nextWeekSkipped }" />
          <text class="week-option-label">安排下周菜单</text>
        </view>
      </view>
      <view v-if="!nextWeekSkipped" class="week-entry-open">
        <text class="link" @click.stop="openWeekPlan">进入下一周菜单</text>
      </view>
    </view>

    <!-- AI 应用方向（下拉选一项看详情，供与合伙人讨论） -->
    <view class="card ai-card">
      <text class="ai-title">AI 应用方向</text>
      <picker mode="selector" :range="aiIdeaTitles" range-key="label" @change="onAiIdeaSelect">
        <view class="ai-picker">
          <text class="ai-picker-label">{{ selectedAiIdea?.label ?? '请选择一项查看详情' }}</text>
          <text class="ai-picker-arrow">▼</text>
        </view>
      </picker>
      <view v-if="selectedAiIdea" class="ai-idea-detail">
        <text class="ai-idea-detail-text">{{ selectedAiIdea.detail }}</text>
      </view>
    </view>

    <!-- 食谱详情弹层（可滚动到底；z-index 高于周计划以便从周计划内点单道菜时浮在最上） -->
    <view v-if="selectedRecipeId" class="sheet-mask sheet-mask-top" @click="selectedRecipeId = null">
      <view class="sheet detail-sheet" @click.stop>
        <view class="sheet-head">
          <text class="sheet-title">{{ detailRecipe?.name }}</text>
          <text class="sheet-close" @click="selectedRecipeId = null">×</text>
        </view>
        <scroll-view scroll-y class="detail-sheet-body" :show-scrollbar="true">
          <text v-if="detailRecipe?.effect" class="sheet-benefit">{{ detailRecipe.effect }}</text>
          <text v-if="detailRecipe?.suitConstitution" class="sheet-meta">适合体质：{{ detailRecipe.suitConstitution }}</text>
          <text class="sheet-heading">食材</text>
          <view class="sheet-pills">
            <text v-for="(ing, i) in detailIngredients" :key="i" class="pill muted">{{ ing }}</text>
          </view>
          <text class="sheet-heading">步骤</text>
          <view class="sheet-steps">
            <view v-for="(step, i) in detailSteps" :key="i" class="step-row">
              <view class="step-num"><text>{{ i + 1 }}</text></view>
              <text class="step-text">{{ step }}</text>
            </view>
          </view>
          <text v-if="detailRecipe?.avoidWith" class="sheet-heading">不宜同吃</text>
          <text v-if="detailRecipe?.avoidWith" class="sheet-warn">{{ detailRecipe.avoidWith }}</text>
          <text v-if="detailRecipe?.notes" class="sheet-heading">注意事项</text>
          <text v-if="detailRecipe?.notes" class="sheet-notes">{{ detailRecipe.notes }}</text>
        </scroll-view>
        <view class="sheet-actions">
          <button
            v-if="canReplaceCurrentRecipe"
            class="btn btn-outline"
            @click="startReplaceRecipe"
          >换一道</button>
        </view>
      </view>
    </view>

    <!-- 完整食谱库弹层（按体质，分类型；z-index 高于周计划以便换一道时浮在最上） -->
    <view v-if="showRecipeLibrary" class="sheet-mask sheet-mask-top" @click="closeRecipeLibrary">
      <view class="sheet recipe-library-sheet" @click.stop>
        <view class="sheet-head">
          <text class="sheet-title">适合你的食谱库</text>
          <text class="sheet-close" @click="closeRecipeLibrary">×</text>
        </view>
        <text class="sheet-desc">{{ replaceTarget ? '选择一道替换' : '以下为适合你体质的全部食谱，可自选搭配今日/周计划，或使用推荐' }}</text>
        <scroll-view scroll-y class="library-scroll" :show-scrollbar="true">
          <view class="library-table">
            <view class="library-table-head">
              <text class="library-th">类别</text>
              <text class="library-th">类型</text>
              <text class="library-th">食谱名</text>
            </view>
            <view
              v-for="(row, ri) in recipeLibraryTableRows"
              :key="row.id ? row.id : 'placeholder-' + row.section"
              class="library-table-row"
              :class="{ 'row-placeholder': !row.id }"
              @click="row.id ? onPickRecipeFromLibrary(row.id) : null"
            >
              <text class="library-td">{{ row.section }}</text>
              <text class="library-td">{{ row.type }}</text>
              <text class="library-td library-td-name">{{ row.name }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 餐后反馈弹层 -->
    <view v-if="feedbackMeal" class="sheet-mask" @click="feedbackMeal = null">
      <view class="feedback-sheet" @click.stop>
        <view class="sheet-head">
          <text class="sheet-title">这一餐感觉如何？</text>
          <text class="sheet-close" @click="feedbackMeal = null">×</text>
        </view>
        <text class="feedback-desc">你的反馈会帮助我们优化下次的食谱推荐</text>
        <view class="feelings">
          <view
            v-for="f in mealFeelings"
            :key="f.value"
            class="feeling-item"
            :class="{ active: feedbackValue === f.value }"
            @click="feedbackValue = f.value"
          >
            <text class="feeling-emoji">{{ f.emoji }}</text>
            <text class="feeling-label">{{ f.label }}</text>
          </view>
        </view>
        <view v-if="feedbackValue != null" class="feedback-response">
          <text>{{ getFeelingResponse(feedbackValue) }}</text>
        </view>
        <button
          class="btn btn-primary full"
          :class="{ disabled: feedbackValue == null }"
          :disabled="feedbackValue == null"
          @click="submitFeedback"
        >
          记录感受
        </button>
        <text class="skip" @click="feedbackMeal = null">跳过</text>
      </view>
    </view>

    <!-- 周计划弹层 -->
    <view v-if="showWeekPlan" class="sheet-mask" @click="closeWeekPlan">
      <view class="sheet week-sheet" @click.stop>
        <view class="sheet-head">
          <text class="sheet-title">下一周菜单</text>
          <text class="sheet-close" @click="closeWeekPlan">×</text>
        </view>
        <view class="week-days-wrap">
          <scroll-view scroll-y class="week-days-scroll">
          <view v-for="(day, dateYMD) in weekPlanMeals" :key="dateYMD" class="week-day">
            <view class="week-day-head" @click="openDaySheet(dateYMD)">
              <text class="week-date">{{ formatWeekDay(dateYMD) }}</text>
            </view>
            <view class="week-slots">
              <view class="week-slot">
                <text class="week-slot-label">早</text>
                <view
                  v-for="id in (day?.breakfast ?? [])"
                  :key="id"
                  class="week-recipe-wrap"
                  @click.stop="openDetail(id, 'breakfast', dateYMD)"
                >
                  <text class="week-recipe week-recipe-click">{{ getRecipeName(id) }}</text>
                </view>
                <text v-if="!(day?.breakfast?.length)" class="week-empty">—</text>
              </view>
              <view class="week-slot">
                <text class="week-slot-label">午</text>
                <view
                  v-for="id in (day?.lunch ?? [])"
                  :key="id"
                  class="week-recipe-wrap"
                  @click.stop="openDetail(id, 'lunch', dateYMD)"
                >
                  <text class="week-recipe week-recipe-click">{{ getRecipeName(id) }}</text>
                </view>
                <text v-if="!(day?.lunch?.length)" class="week-empty">—</text>
              </view>
              <view class="week-slot">
                <text class="week-slot-label">晚</text>
                <view
                  v-for="id in (day?.dinner ?? [])"
                  :key="id"
                  class="week-recipe-wrap"
                  @click.stop="openDetail(id, 'dinner', dateYMD)"
                >
                  <text class="week-recipe week-recipe-click">{{ getRecipeName(id) }}</text>
                </view>
                <text v-if="!(day?.dinner?.length)" class="week-empty">—</text>
              </view>
            </view>
          </view>
          </scroll-view>
        </view>
        <view class="week-actions">
          <button v-if="hasWeekPlanMeals" class="btn btn-outline week-action-btn" @click="previewWeekIngredients">查看本周食材</button>
          <button class="btn btn-outline week-action-btn" @click="generateWeekPlan">一键推荐本周菜单</button>
          <button class="btn btn-primary week-action-btn-primary" @click="confirmWeekPlan">确认本周菜单</button>
        </view>
      </view>
    </view>

    <!-- 确认后·本周食材统计（用于采购） -->
    <view v-if="showIngredientsSheet" class="sheet-mask" @click="showIngredientsSheet = false">
      <view class="sheet ingredients-sheet" @click.stop>
        <view class="sheet-head">
          <text class="sheet-title">本周食材统计</text>
          <text class="sheet-close" @click="showIngredientsSheet = false">×</text>
        </view>
        <text class="sheet-desc">合并同类项，按类别展示便于采购</text>
        <view v-if="weekPlanIngredientsByCategory.length === 0" class="ingredients-empty">
          <text class="ingredients-empty-text">本周暂无菜单，先安排下周菜单即可生成采购清单</text>
        </view>
        <view v-else class="ingredients-scroll-wrap">
          <scroll-view scroll-y class="ingredients-scroll">
            <view v-for="g in weekPlanIngredientsByCategory" :key="g.category" class="ingredients-group">
              <text class="ingredients-category-label">{{ g.category }}</text>
              <view class="ingredients-list">
                <text v-for="(ing, i) in g.items" :key="g.category + '-' + i" class="ingredient-item">{{ ing }}</text>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>

    <!-- 周计划·某日弹层：可换一道、重排本日 -->
    <view v-if="showDaySheet && selectedDayYMD" class="sheet-mask" @click="closeDaySheet">
      <view class="sheet day-sheet" @click.stop>
        <view class="sheet-head">
          <text class="sheet-title">{{ formatWeekDay(selectedDayYMD) }} 三餐</text>
          <text class="sheet-close" @click="closeDaySheet">×</text>
        </view>
        <scroll-view v-if="daySheetResolved" scroll-y class="day-sheet-body">
          <view v-for="s in daySheetSlots" :key="s.key" class="day-sheet-slot">
            <text class="day-slot-label">{{ s.label }}</text>
            <view class="day-slot-recipes">
              <text
                v-for="r in s.recipes"
                :key="r.id"
                class="day-recipe-name"
                @click="openDetail(r.id, s.key, selectedDayYMD ?? undefined)"
              >{{ r.name }}</text>
            </view>
          </view>
        </scroll-view>
        <view class="day-sheet-actions">
          <text class="day-sheet-hint">换一道：点上方某道菜后点「换一道」；整日重排：点下方按钮</text>
          <button class="btn btn-outline" @click="rerollDay">重排本日（整日重新推荐）</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getProfile } from '@/lib/profile-utils'
import { getCurrentShiChen, getShiyangAdvice, getMealTimeRanges } from '@/lib/diet-data'
import { getCurrentSolarTerm, getWuYunLiuQi } from '@/lib/solar-terms'
import {
  getTodayDietCompleted,
  markDietComplete,
  unmarkDietComplete,
  saveDietFeeling,
  getDietFeedbackDoneIds,
} from '@/lib/diet-utils'
import { getConstitutionTypeForDiet, getShiliaoUserSet } from '@/lib/diet-mock'
import {
  getSingleDayRecommendation,
  resolveDayMeals,
  todayYMD,
  tomorrowYMD,
  nextMondayYMD,
  getWeekRecommendation,
  validateDayMealsAvoidConflict,
} from '@/lib/diet-recommend'
import {
  getRecipeById,
  getAllBreakfastRecipes,
  getAllJiachangRecipes,
  getShiliaoRecipesForProfile,
} from '@/lib/recipe-store'
import { inferDishType } from '@/lib/recipe-types'
import {
  getTodayMealsFromPlan,
  getTodayGeneratedMeals,
  saveTodayGeneratedMeals,
  getDayMealsFromPlan,
  getTomorrowGeneratedMeals,
  saveTomorrowGeneratedMeals,
  getRecentMealIdsForSlot,
  getWeekPlanRecord,
  getActiveWeekPlan,
  saveWeekPlan as saveWeekPlanStore,
  ensureArchiveCurrentPlan,
  markSlotReplaced,
  clearReplacedForDay,
  isNextWeekSkipped,
  setNextWeekSkipped,
} from '@/lib/diet-plan-store'
import type { DayMeals } from '@/lib/diet-recommend'

/** AI/MLLM 应用方向（供与合伙人讨论，下拉展示详情） */
const AI_MLLM_IDEAS: { label: string; detail: string }[] = [
  {
    label: '1. 拍现有食材 → 推荐今天做什么',
    detail: '用户拍摄冰箱或桌面上的食材，系统识别后从食谱库中筛选「用这些食材能做、且符合体质」的菜品，并可一键加入今日菜单。比单纯「识宜忌」更可执行，与现有今日菜单、体质、食谱库形成闭环。实现：图像识别（MLLM/视觉模型）提取食材列表 → 与 recipe-master 食材字段匹配 → 按体质与冲突规则筛选 → 推荐并支持加入今日餐位。',
  },
  {
    label: '2. 语音/文字记一餐',
    detail: '用户说或输入「今天中午吃了番茄炒蛋、米饭」，系统解析成结构化记录（餐次、菜品/食材），记入「今日吃了什么」，便于回顾或与推荐对比。不依赖拍照，使用门槛低；积累的数据可反哺后续推荐（如少重复、偏好的菜多推）。实现：语音转文字 + NLP/LLM 解析为（日期、餐次、菜品列表）→ 写入本地或后端「饮食记录」→ 可选与当日推荐对比展示。',
  },
  {
    label: '3. 餐后反馈 → 偏好提炼',
    detail: '在现有「这一餐感觉如何」反馈基础上，用 LLM 从用户自由输入中提炼偏好（如太油、太淡、想多吃蔬菜、不喜欢某类食材），沉淀为可用的用户偏好标签，用于后续推荐权重或过滤，让推荐越用越贴个人口味。实现：反馈提交时若用户写了文字，调用 LLM 做简短偏好抽取 → 写入用户偏好表或 profile → 推荐逻辑中按标签加权或排除。',
  },
  {
    label: '4. 食谱/体质问答',
    detail: '用户问「经期能不能吃绿豆」「这道菜和我的体质搭吗」等，系统基于体质、食谱数据、不宜同吃规则作答（RAG 检索 + LLM 生成，或规则引擎 + LLM 润色），把现有数据变成可对话的「食养顾问」。实现：问句意图识别 + 检索体质说明/食谱/不宜同吃 → 生成简短安全回答，并标注「仅供参考」避免替代专业建议。',
  },
  {
    label: '5. 拍菜品识宜忌（原方案）',
    detail: '对着食材或菜品拍照，AI 识别后结合用户体质判断宜忌并给出简短说明。适合快速扫一眼「这个我能不能吃」。价值相对单一，可与「拍食材推荐今日菜」合并为同一入口：先识别，再提供「宜忌」与「可做菜品推荐」两种结果。',
  },
]

const selectedAiIdeaIndex = ref<number>(0)
const selectedAiIdea = computed(() =>
  selectedAiIdeaIndex.value >= 0 && AI_MLLM_IDEAS[selectedAiIdeaIndex.value]
    ? AI_MLLM_IDEAS[selectedAiIdeaIndex.value]
    : null
)
const aiIdeaTitles = AI_MLLM_IDEAS

function onAiIdeaSelect(e: { detail: { value: string | number } }) {
  const idx = Number(e.detail.value)
  selectedAiIdeaIndex.value = idx >= 0 && idx < AI_MLLM_IDEAS.length ? idx : 0
}

const shiChen = ref(getCurrentShiChen())
const completedItems = ref<string[]>([])
const selectedRecipeId = ref<string | null>(null)
const completingSlot = ref<'breakfast' | 'lunch' | 'dinner' | null>(null)
const feedbackMeal = ref<string | null>(null)
const feedbackValue = ref<number | null>(null)
const feedbackDone = ref<string[]>([])
const showWeekPlan = ref(false)
const weekPlanMeals = ref<Record<string, DayMeals>>({})
const showRecipeLibrary = ref(false)
const safetyTipExpanded = ref(false)
/** 换一道：slot + 被替换的 recipeId；dateYMD 有值时表示在周计划某日弹层内替换 */
const replaceTarget = ref<{ slot: 'breakfast' | 'lunch' | 'dinner'; recipeId: string; dateYMD?: string } | null>(null)
const showDaySheet = ref(false)
const selectedDayYMD = ref<string | null>(null)
const showIngredientsSheet = ref(false)
/** 是否已选「不安排下周菜单」 */
const nextWeekSkipped = ref(false)

const mealFeelings = [
  { emoji: '😣', label: '不适', value: 1 },
  { emoji: '😐', label: '一般', value: 2 },
  { emoji: '😌', label: '舒适', value: 3 },
  { emoji: '😊', label: '满足', value: 4 },
]

const constitutionType = computed(() => getConstitutionTypeForDiet(getProfile()))

/** 体质测试结果（展示用，来自档案 summary 或 type） */
const constitutionSummary = computed(() => {
  const p = getProfile()
  const summary = p?.constitution?.summary
  const type = p?.constitution?.type
  if (summary && typeof summary === 'string') return summary.trim()
  if (type && typeof type === 'string') return type.trim()
  const mockType = getConstitutionTypeForDiet(null)
  return mockType ?? ''
})

/** 当前节气 */
const solarTerm = computed(() => getCurrentSolarTerm())

/** 五运六气（待接入） */
const wuYunLiuQi = computed(() => getWuYunLiuQi())

/** 食养之道文案（待 CSV 接入后按体质+节气+五运六气查表） */
const shiyangAdvice = computed(() =>
  getShiyangAdvice(constitutionType.value || '', solarTerm.value.name, wuYunLiuQi.value)
)

/** 早餐=全部早餐，家常菜=全部家常菜（任何体质均可）；食疗方=按体质规则（平和质全部，偏颇为食谱完全包含用户体质集合）。 */
const fullRecipeList = computed(() => {
  const breakfast = getAllBreakfastRecipes()
  const jiachang = getAllJiachangRecipes()
  const shiliao = getShiliaoRecipesForProfile(getShiliaoUserSet(getProfile()))
  return [...breakfast, ...jiachang, ...shiliao]
})

/** 食谱库展示顺序：1）早餐 2）食疗方（菜、主食、汤） 3）家常菜（菜、主食、汤）。早餐与家常菜任何体质均可；食疗方=平和质全部/偏颇为食谱完全包含用户体质集合。 */
const recipeLibraryByCategory = computed(() => {
  const breakfast = getAllBreakfastRecipes()
  const jiachangList = getAllJiachangRecipes()
  const shiliaoList = getShiliaoRecipesForProfile(getShiliaoUserSet(getProfile()))
  const jiachang: { 菜: typeof jiachangList; 主食: typeof jiachangList; 汤: typeof jiachangList } = { 菜: [], 主食: [], 汤: [] }
  const shiliao: { 菜: typeof shiliaoList; 主食: typeof shiliaoList; 汤: typeof shiliaoList } = { 菜: [], 主食: [], 汤: [] }
  for (const r of jiachangList) {
    const dishType = inferDishType(r.name)
    if (dishType === '菜') jiachang.菜.push(r)
    else if (dishType === '主食') jiachang.主食.push(r)
    else if (dishType === '汤') jiachang.汤.push(r)
  }
  for (const r of shiliaoList) {
    const dishType = inferDishType(r.name)
    if (dishType === '菜') shiliao.菜.push(r)
    else if (dishType === '主食') shiliao.主食.push(r)
    else if (dishType === '汤') shiliao.汤.push(r)
  }
  const out: { section: string; list?: typeof list; subs?: { type: string; list: typeof list }[] }[] = []
  out.push({ section: '早餐', list: breakfast })
  out.push({
    section: '食疗方',
    subs: [
      { type: '菜', list: shiliao.菜 },
      { type: '主食', list: shiliao.主食 },
      { type: '汤', list: shiliao.汤 },
    ].filter((s) => s.list.length > 0),
  })
  out.push({
    section: '家常菜',
    subs: [
      { type: '菜', list: jiachang.菜 },
      { type: '主食', list: jiachang.主食 },
      { type: '汤', list: jiachang.汤 },
    ].filter((s) => s.list.length > 0),
  })
  return out
})

/** 食谱库表格行：顺序 早餐→食疗方→家常菜；换一道时按餐次过滤：早只显早餐，午/晚只显食疗方+家常菜 */
const recipeLibraryTableRows = computed(() => {
  const groups = recipeLibraryByCategory.value
  const slot = replaceTarget.value?.slot
  let toShow: typeof groups
  if (slot === 'breakfast') {
    toShow = groups.filter((g) => g.section === '早餐')
  } else if (slot === 'lunch' || slot === 'dinner') {
    toShow = groups.filter((g) => g.section === '食疗方' || g.section === '家常菜')
  } else {
    toShow = groups
  }
  const rows: { section: string; type: string; name: string; id: string }[] = []
  for (const group of toShow) {
    let hasAny = false
    if (group.list?.length) {
      hasAny = true
      for (const r of group.list) {
        rows.push({ section: group.section, type: '—', name: r.name, id: r.id })
      }
    }
    if (group.subs?.length) {
      for (const sub of group.subs) {
        for (const r of sub.list) {
          hasAny = true
          rows.push({ section: group.section, type: sub.type, name: r.name, id: r.id })
        }
      }
    }
    if (!hasAny) {
      rows.push({ section: group.section, type: '—', name: '（当前体质下暂无）', id: '' })
    }
  }
  return rows
})

/** 用于「重新推荐今日」后强制今日三餐重新计算 */
const refreshTodayTrigger = ref(0)
const todayDayMeals = computed<DayMeals | null>(() => {
  refreshTodayTrigger.value
  const fromPlan = getTodayMealsFromPlan()
  if (fromPlan) return fromPlan
  const cached = getTodayGeneratedMeals()
  if (cached) return cached
  const type = constitutionType.value
  if (!type) return null
  const day = getSingleDayRecommendation(
    type,
    getRecentMealIdsForSlot('breakfast'),
    getRecentMealIdsForSlot('lunch'),
    getRecentMealIdsForSlot('dinner'),
    getShiliaoUserSet(getProfile())
  )
  saveTodayGeneratedMeals(day)
  return day
})

const todayResolved = computed(() => {
  if (!todayDayMeals.value) return null
  return resolveDayMeals(todayDayMeals.value)
})

const mealTimeRanges = computed(() => getMealTimeRanges())
const mealSlots = computed(() => {
  const r = todayResolved.value
  const t = mealTimeRanges.value
  if (!r) return []
  return [
    { key: 'breakfast' as const, label: '早餐', timeRange: t.breakfast, recipes: r.breakfast },
    { key: 'lunch' as const, label: '午餐', timeRange: t.lunch, recipes: r.lunch },
    { key: 'dinner' as const, label: '晚餐', timeRange: t.dinner, recipes: r.dinner },
  ]
})

/** 明日三餐：优先周计划，否则明日缓存，否则即时推荐并写入明日缓存 */
const refreshTomorrowTrigger = ref(0)
const tomorrowDayMeals = computed<DayMeals | null>(() => {
  refreshTomorrowTrigger.value
  const tom = tomorrowYMD()
  const fromPlan = getDayMealsFromPlan(tom)
  if (fromPlan) return fromPlan
  const cached = getTomorrowGeneratedMeals()
  if (cached) return cached
  const type = constitutionType.value
  if (!type) return null
  const day = getSingleDayRecommendation(type, [], [], [], getShiliaoUserSet(getProfile()))
  saveTomorrowGeneratedMeals(day)
  return day
})

const tomorrowResolved = computed(() => {
  if (!tomorrowDayMeals.value) return null
  return resolveDayMeals(tomorrowDayMeals.value)
})

const tomorrowMealSlots = computed(() => {
  const r = tomorrowResolved.value
  const t = mealTimeRanges.value
  if (!r) return []
  return [
    { key: 'breakfast' as const, label: '早餐', timeRange: t.breakfast, recipes: r.breakfast },
    { key: 'lunch' as const, label: '午餐', timeRange: t.lunch, recipes: r.lunch },
    { key: 'dinner' as const, label: '晚餐', timeRange: t.dinner, recipes: r.dinner },
  ]
})

const detailRecipe = computed(() =>
  selectedRecipeId.value ? getRecipeById(selectedRecipeId.value) ?? null : null
)

/** 当前详情是否允许「换一道」：明日/周计划可换；今日仅未标记完成的餐可换 */
const canReplaceCurrentRecipe = computed(() => {
  const slot = completingSlot.value
  if (!slot) return false
  if (selectedDayYMD.value) return true
  return !completedItems.value.includes(slot)
})

const detailIngredients = computed(() => {
  const s = detailRecipe.value?.ingredients
  if (!s) return []
  return s.split(/[、，,。]\s*/).map((x) => x.trim()).filter(Boolean)
})

const detailSteps = computed(() => {
  const s = detailRecipe.value?.steps
  if (!s) return []
  return s
    .split(/[；;。]\s*/)
    .map((x) => x.trim().replace(/^\d+[.．]\s*/, ''))
    .filter(Boolean)
})

function getSlotStatus(slot: 'breakfast' | 'lunch' | 'dinner'): 'done' | 'current' | 'past' | 'upcoming' {
  if (completedItems.value.includes(slot)) return 'done'
  const now = new Date().getHours() * 60 + new Date().getMinutes()
  const ranges: [number, number][] = [[7 * 60, 8 * 60], [12 * 60, 13 * 60], [18 * 60, 19 * 60]]
  const idx = slot === 'breakfast' ? 0 : slot === 'lunch' ? 1 : 2
  const [start, end] = ranges[idx]
  if (now >= start && now <= end) return 'current'
  if (now < start) return 'upcoming'
  return 'past'
}

function openDetail(recipeId: string, slotKey: 'breakfast' | 'lunch' | 'dinner', dateYMD?: string) {
  selectedRecipeId.value = recipeId
  completingSlot.value = slotKey
  selectedDayYMD.value = dateYMD ?? null
}

/** 点击整卡：打开该餐第一道菜的详情；dateYMD 为明日或周计划某日时传入以便换一道写入正确日期 */
function openMealSlot(slot: { key: 'breakfast' | 'lunch' | 'dinner'; recipes: { id: string }[] }, dateYMD?: string) {
  const first = slot.recipes[0]
  if (first) openDetail(first.id, slot.key, dateYMD)
}

function openRecipeLibrary() {
  replaceTarget.value = null
  showRecipeLibrary.value = true
}

function closeRecipeLibrary() {
  showRecipeLibrary.value = false
  replaceTarget.value = null
}

function openDetailFromLibrary(recipeId: string) {
  showRecipeLibrary.value = false
  selectedRecipeId.value = recipeId
  completingSlot.value = null
}

function startReplaceRecipe() {
  if (!completingSlot.value || !selectedRecipeId.value) return
  if (!selectedDayYMD.value && completedItems.value.includes(completingSlot.value)) {
    uni.showToast({ title: '该餐已标记完成，不可更换', icon: 'none' })
    return
  }
  replaceTarget.value = {
    slot: completingSlot.value,
    recipeId: selectedRecipeId.value,
    dateYMD: selectedDayYMD.value ?? undefined,
  }
  selectedRecipeId.value = null
  completingSlot.value = null
  showRecipeLibrary.value = true
}

function onPickRecipeFromLibrary(recipeId: string) {
  if (replaceTarget.value) {
    const { slot, recipeId: oldId, dateYMD } = replaceTarget.value
    const tom = tomorrowYMD()
    const day = dateYMD === tom
      ? tomorrowDayMeals.value
      : dateYMD
        ? weekPlanMeals.value[dateYMD]
        : todayDayMeals.value
    if (day) {
      const slotIds = day[slot]
      const idx = slotIds.indexOf(oldId)
      if (idx !== -1) {
        const next = [...slotIds]
        next[idx] = recipeId
        const nextDay: DayMeals = { ...day, [slot]: next }
        const check = validateDayMealsAvoidConflict(nextDay)
        if (!check.ok && check.conflict) {
          const [a, b] = check.conflict
          uni.showModal({
            title: '不宜同吃',
            content: `「${a.name}」与「${b.name}」不宜同吃，请另选一道。`,
            showCancel: false,
            confirmText: '确定',
          })
          return
        }
        const theDate = dateYMD ?? todayYMD()
        markSlotReplaced(theDate, slot)
        if (dateYMD === tom) {
          const plan = getActiveWeekPlan()
          if (plan?.meals && tom in plan.meals) {
            const updated = { ...plan.meals, [tom]: nextDay }
            saveWeekPlanStore(plan.weekStartYMD, updated)
            weekPlanMeals.value = { ...weekPlanMeals.value, [tom]: nextDay }
          } else {
            saveTomorrowGeneratedMeals(nextDay)
            refreshTomorrowTrigger.value++
          }
        } else if (dateYMD) {
          weekPlanMeals.value = { ...weekPlanMeals.value, [dateYMD]: nextDay }
        } else {
          const plan = getActiveWeekPlan()
          if (plan?.meals) {
            const updated = { ...plan.meals, [theDate]: nextDay }
            saveWeekPlanStore(plan.weekStartYMD, updated)
          } else {
            saveTodayGeneratedMeals(nextDay)
          }
        }
      }
    }
    replaceTarget.value = null
    showRecipeLibrary.value = false
    uni.showToast({ title: '已更换', icon: 'success' })
  } else {
    openDetailFromLibrary(recipeId)
  }
}

/** 餐卡左侧圆圈点击：切换该餐「已完成」状态（仅今日） */
function toggleMealComplete(slot: 'breakfast' | 'lunch' | 'dinner') {
  if (completedItems.value.includes(slot)) {
    unmarkDietComplete(slot)
  } else {
    markDietComplete(slot)
  }
  completedItems.value = getTodayDietCompleted()
}

function handleCompleteSlot(slot: 'breakfast' | 'lunch' | 'dinner') {
  markDietComplete(slot)
  completedItems.value = getTodayDietCompleted()
  selectedRecipeId.value = null
  completingSlot.value = null
  feedbackMeal.value = slot
  feedbackValue.value = null
}

function getFeelingResponse(value: number): string {
  switch (value) {
    case 1:
      return '饮食后感到不适，下次会为你调整食材搭配，减少刺激性食物'
    case 2:
      return '还好，继续观察身体的反应，逐步找到最适合你的食谱'
    case 3:
      return '很好！说明今天的食材搭配适合你的体质'
    case 4:
      return '太棒了！这道食谱已加入你的「好评食谱」，后续会更多推荐类似搭配'
    default:
      return ''
  }
}

function submitFeedback() {
  if (feedbackValue.value == null || !feedbackMeal.value) return
  saveDietFeeling(feedbackMeal.value, feedbackValue.value)
  feedbackDone.value = [...feedbackDone.value, feedbackMeal.value]
  feedbackMeal.value = null
  feedbackValue.value = null
  refresh()
}

function goProfile() {
  uni.switchTab({ url: '/pages/profile/profile' })
}

function refresh() {
  completedItems.value = getTodayDietCompleted()
  feedbackDone.value = getDietFeedbackDoneIds()
  shiChen.value = getCurrentShiChen()
  nextWeekSkipped.value = isNextWeekSkipped()
  ensureArchiveCurrentPlan()
}

function chooseSkipNextWeek() {
  setNextWeekSkipped(true)
  nextWeekSkipped.value = true
}

function chooseArrangeNextWeek() {
  setNextWeekSkipped(false)
  nextWeekSkipped.value = false
}

function openWeekPlan() {
  const type = constitutionType.value
  if (!type) {
    uni.showToast({ title: '请先完成体质测评', icon: 'none' })
    return
  }
  const nextStart = nextMondayYMD()
  const plan = getWeekPlanRecord()
  if (plan?.weekStartYMD === nextStart && plan?.meals) {
    weekPlanMeals.value = { ...plan.meals }
  } else {
    weekPlanMeals.value = getWeekRecommendation(type, nextStart, getShiliaoUserSet(getProfile()))
  }
  showWeekPlan.value = true
}

function closeWeekPlan() {
  showWeekPlan.value = false
  showDaySheet.value = false
  selectedDayYMD.value = null
}

/** 重新推荐今日：清除今日缓存并重新生成，若今日在周计划内则同步更新周计划 */
function rerollToday() {
  const type = constitutionType.value
  if (!type) {
    uni.showToast({ title: '请先完成体质测评', icon: 'none' })
    return
  }
  const day = getSingleDayRecommendation(
    type,
    getRecentMealIdsForSlot('breakfast'),
    getRecentMealIdsForSlot('lunch'),
    getRecentMealIdsForSlot('dinner'),
    getShiliaoUserSet(getProfile())
  )
  saveTodayGeneratedMeals(day)
  const plan = getActiveWeekPlan()
  const today = todayYMD()
  if (plan?.meals && today in plan.meals) {
    const updated = { ...plan.meals, [today]: day }
    saveWeekPlanStore(plan.weekStartYMD, updated)
    weekPlanMeals.value = { ...weekPlanMeals.value, [today]: day }
  }
  refreshTodayTrigger.value++
  uni.showToast({ title: '已重新推荐今日菜单', icon: 'success' })
}

/** 重新推荐明日菜单（仅当明日不在周计划时写入明日缓存） */
function rerollTomorrow() {
  const type = constitutionType.value
  if (!type) {
    uni.showToast({ title: '请先完成体质测评', icon: 'none' })
    return
  }
  const tom = tomorrowYMD()
  const day = getSingleDayRecommendation(type, [], [], [], getShiliaoUserSet(getProfile()))
  const plan = getActiveWeekPlan()
  if (plan?.meals && tom in plan.meals) {
    const updated = { ...plan.meals, [tom]: day }
    saveWeekPlanStore(plan.weekStartYMD, updated)
    weekPlanMeals.value = { ...weekPlanMeals.value, [tom]: day }
  } else {
    saveTomorrowGeneratedMeals(day)
    refreshTomorrowTrigger.value++
  }
  uni.showToast({ title: '已重新推荐明日菜单', icon: 'success' })
}

/** 周计划日期展示：通用表达「下周一 3月2日」 */
function formatWeekDay(ymd: string): string {
  const d = new Date(ymd + 'T00:00:00')
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const m = d.getMonth() + 1
  const day = d.getDate()
  return `下${week[d.getDay()]} ${m}月${day}日`
}

/** 周计划某日弹层：该日三餐解析结果 */
const daySheetResolved = computed(() => {
  const ymd = selectedDayYMD.value
  if (!ymd) return null
  const day = weekPlanMeals.value[ymd]
  if (!day) return null
  return resolveDayMeals(day)
})

const daySheetSlots = computed(() => {
  const r = daySheetResolved.value
  if (!r) return []
  return [
    { key: 'breakfast' as const, label: '早餐', recipes: r.breakfast },
    { key: 'lunch' as const, label: '午餐', recipes: r.lunch },
    { key: 'dinner' as const, label: '晚餐', recipes: r.dinner },
  ]
})

function openDaySheet(dateYMD: string) {
  selectedDayYMD.value = dateYMD
  showDaySheet.value = true
}

function closeDaySheet() {
  showDaySheet.value = false
  selectedDayYMD.value = null
}

/** 重排本日：用推荐结果覆盖该日，排除本周其他天已选 */
function rerollDay() {
  const ymd = selectedDayYMD.value
  const type = constitutionType.value
  if (!ymd || !type) return
  const others = Object.keys(weekPlanMeals.value).filter((d) => d !== ymd)
  const excludeB = others.flatMap((d) => weekPlanMeals.value[d]?.breakfast ?? [])
  const excludeL = others.flatMap((d) => weekPlanMeals.value[d]?.lunch ?? [])
  const excludeD = others.flatMap((d) => weekPlanMeals.value[d]?.dinner ?? [])
  const day = getSingleDayRecommendation(type, excludeB, excludeL, excludeD, getShiliaoUserSet(getProfile()))
  weekPlanMeals.value = { ...weekPlanMeals.value, [ymd]: day }
  clearReplacedForDay(ymd)
  uni.showToast({ title: '已重排本日', icon: 'success' })
}

function getRecipeName(id: string): string {
  return getRecipeById(id)?.name ?? id
}

function generateWeekPlan() {
  const type = constitutionType.value
  if (!type) return
  weekPlanMeals.value = getWeekRecommendation(type, nextMondayYMD(), getShiliaoUserSet(getProfile()))
  uni.showToast({ title: '已重新推荐', icon: 'none' })
}

/** 食材→类别（关键词匹配；后续可改为 CSV 映射） */
const INGREDIENT_CATEGORY_ORDER = ['调味料', '蔬菜', '海鲜', '肉', '蛋奶', '主食', '其他'] as const
function getIngredientCategory(ing: string): (typeof INGREDIENT_CATEGORY_ORDER)[number] {
  const t = ing
  if (/盐|酱油|醋|料酒|蚝油|生抽|老抽|食用油|花椒|八角|辣椒|胡椒|鸡精|香油|冰糖|红糖|蜂蜜|淀粉|味精|桂皮|香叶|姜|葱|蒜|大蒜|生姜/.test(t)) return '调味料'
  if (/青菜|萝卜|南瓜|胡萝卜|土豆|山药|玉米|番茄|黄瓜|茄子|豆角|白菜|菠菜|芹菜|洋葱|莲藕|冬瓜|白萝卜|青椒|红椒|木耳|香菇|银耳|百合|莲子|红枣|枸杞|桂圆|麦冬|陈皮|甘草|党参|黄芪/.test(t)) return '蔬菜'
  if (/虾|鱼|蟹|贝|海带|紫菜|鱿鱼|海/.test(t)) return '海鲜'
  if (/猪肉|牛肉|羊肉|鸡肉|鸭肉|肉|排骨|五花/.test(t)) return '肉'
  if (/鸡蛋|鸭蛋|牛奶|豆腐|豆干|豆浆|蛋|奶/.test(t)) return '蛋奶'
  if (/米|面|粉|馒头|米饭|面条|粥|饼|饺子/.test(t)) return '主食'
  return '其他'
}

/** 本周菜单食材汇总（去重）；排除纯数字+单位等非食材项 */
const weekPlanIngredientsList = computed(() => {
  const set = new Set<string>()
  const skip = /^\d+[g克ml毫升个只份]$|^适量|^少许|^全员/
  for (const day of Object.values(weekPlanMeals.value)) {
    if (!day) continue
    for (const slot of [day.breakfast, day.lunch, day.dinner]) {
      if (!slot) continue
      for (const id of slot) {
        const r = getRecipeById(id)
        if (!r?.ingredients) continue
        const parts = r.ingredients.split(/[、，,。\s]+/).map((s) => s.replace(/\d+[克毫升适量少许各\d、，.]+$/g, '').trim()).filter((s) => s.length >= 2 && !skip.test(s))
        parts.forEach((p) => set.add(p))
      }
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'zh-CN'))
})

/** 按类别分组的本周食材（用于采购展示：调味料、蔬菜、海鲜、肉、蛋奶、主食、其他） */
const weekPlanIngredientsByCategory = computed(() => {
  const list = weekPlanIngredientsList.value
  const map: Record<string, string[]> = {}
  for (const cat of INGREDIENT_CATEGORY_ORDER) {
    map[cat] = []
  }
  for (const ing of list) {
    const cat = getIngredientCategory(ing)
    map[cat].push(ing)
  }
  return INGREDIENT_CATEGORY_ORDER.map((cat) => ({ category: cat, items: map[cat].sort((a, b) => a.localeCompare(b, 'zh-CN')) })).filter((g) => g.items.length > 0)
})

/** 当前周计划是否有任意一天的菜单（用于显示「查看本周食材」按钮） */
const hasWeekPlanMeals = computed(() => {
  const meals = weekPlanMeals.value
  for (const day of Object.values(meals)) {
    if (!day) continue
    if ((day.breakfast?.length ?? 0) + (day.lunch?.length ?? 0) + (day.dinner?.length ?? 0) > 0) return true
  }
  return false
})

function previewWeekIngredients() {
  showIngredientsSheet.value = true
}

function saveWeekPlan() {
  const keys = Object.keys(weekPlanMeals.value).sort()
  const weekStart = keys[0]
  if (!weekStart) return
  const conflicts: { dateYMD: string; pair: [string, string] }[] = []
  for (const dateYMD of keys) {
    const day = weekPlanMeals.value[dateYMD]
    if (!day) continue
    const check = validateDayMealsAvoidConflict(day)
    if (!check.ok && check.conflict) {
      const [a, b] = check.conflict
      conflicts.push({ dateYMD, pair: [a.name, b.name] })
    }
  }
  if (conflicts.length > 0) {
    const first = conflicts[0]
    const dayLabel = formatWeekDay(first.dateYMD)
    uni.showModal({
      title: '不宜同吃',
      content: `${dayLabel}存在不宜同吃：「${first.pair[0]}」与「${first.pair[1]}」。请点该日替换其中一道后再保存。`,
      showCancel: false,
      confirmText: '确定',
    })
    return
  }
  saveWeekPlanStore(weekStart, weekPlanMeals.value)
  uni.showToast({ title: '周计划已保存', icon: 'success' })
  closeWeekPlan()
}

/** 确认本周菜单：保存后弹出本周食材统计，便于采购；有冲突时提示具体日期与菜品 */
function confirmWeekPlan() {
  const keys = Object.keys(weekPlanMeals.value).sort()
  const weekStart = keys[0]
  if (!weekStart) return
  const conflicts: { dateYMD: string; pair: [string, string] }[] = []
  for (const dateYMD of keys) {
    const day = weekPlanMeals.value[dateYMD]
    if (!day) continue
    const check = validateDayMealsAvoidConflict(day)
    if (!check.ok && check.conflict) {
      const [a, b] = check.conflict
      conflicts.push({ dateYMD, pair: [a.name, b.name] })
    }
  }
  if (conflicts.length > 0) {
    const first = conflicts[0]
    const dayLabel = formatWeekDay(first.dateYMD)
    uni.showModal({
      title: '不宜同吃',
      content: `${dayLabel}存在不宜同吃：「${first.pair[0]}」与「${first.pair[1]}」。请点该日替换其中一道后再确认。`,
      showCancel: false,
      confirmText: '确定',
    })
    return
  }
  saveWeekPlanStore(weekStart, weekPlanMeals.value)
  closeWeekPlan()
  showIngredientsSheet.value = true
  uni.showToast({ title: '已确认，可查看食材统计', icon: 'success' })
}

onMounted(refresh)
onShow(refresh)
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 32rpx 120rpx;
  background: #f8f8f8;
}

.header {
  margin-bottom: 32rpx;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.title {
  font-size: 40rpx;
  font-weight: 600;
  color: #2c2c2e;
}

.tag {
  font-size: 22rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(92, 124, 92, 0.12);
  color: #5c7c5c;
}

.shichen-block {
  border-left: 4rpx solid rgba(92, 124, 92, 0.4);
  padding-left: 24rpx;
}

.shichen-name {
  display: block;
  font-size: 26rpx;
  color: #5a6b5a;
}

.shichen-advice {
  display: block;
  font-size: 26rpx;
  color: #8f8f94;
  margin-top: 8rpx;
}

.shichen-hint {
  display: block;
  font-size: 22rpx;
  color: #b0b0b0;
  margin-top: 6rpx;
}

.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid rgba(0, 0, 0, 0.06);
}

.card.empty {
  background: #f5f5f7;
}

.overview .card-title {
  display: block;
  margin-bottom: 20rpx;
}

.overview-row {
  margin-bottom: 16rpx;
}

.overview-label {
  display: block;
  font-size: 24rpx;
  color: #8f8f94;
  margin-bottom: 6rpx;
}

.overview-value {
  font-size: 28rpx;
  color: #2c2c2e;
}

.overview-block {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #eee;
}

.shiyang-block .overview-label {
  margin-bottom: 12rpx;
}

.shiyang-content {
  display: block;
  font-size: 28rpx;
  color: #2c2c2e;
  line-height: 1.5;
}

.shiyang-placeholder {
  display: block;
  font-size: 26rpx;
  color: #8f8f94;
  font-style: italic;
}

.overview-value-wrap {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
}

.overview-label-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.csv-missing-badge {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  background: rgba(231, 76, 60, 0.08);
  border: 1rpx solid rgba(231, 76, 60, 0.35);
}

.csv-missing-icon {
  font-size: 28rpx;
  color: #e74c3c;
  line-height: 1;
}

.csv-missing-text {
  font-size: 22rpx;
  color: #c0392b;
  line-height: 1.2;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #2c2c2e;
}

.constitution-tag {
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(92, 124, 92, 0.12);
  color: #5c7c5c;
}

.card-dir {
  display: block;
  font-size: 28rpx;
  color: #5a6b5a;
  margin-bottom: 24rpx;
}

.tags-row {
  display: flex;
  gap: 32rpx;
}

.tags-group {
  flex: 1;
}

.tags-label {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.tags-label.dos {
  color: #5c7c5c;
}

.tags-label.donts {
  color: #c0392b;
}

.tag-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.pill {
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
}

.pill.dos {
  background: rgba(92, 124, 92, 0.12);
  color: #5c7c5c;
}

.pill.donts {
  background: rgba(192, 57, 43, 0.1);
  color: #c0392b;
}

.pill.muted {
  background: #f0f0f0;
  color: #8f8f94;
}

.card-desc {
  display: block;
  font-size: 26rpx;
  color: #8f8f94;
  margin-top: 12rpx;
}

.link {
  display: inline-block;
  margin-top: 16rpx;
  font-size: 28rpx;
  color: #5c7c5c;
}

.empty-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx 32rpx;
  margin-top: 16rpx;
}

.empty-actions .link {
  margin-top: 0;
}

.safety-tip {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  padding: 16rpx 24rpx;
  background: #fffbf0;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  font-size: 24rpx;
  color: #8a8a8a;
}

.safety-tip.expanded {
  padding: 20rpx 24rpx;
}

.safety-icon {
  color: #b8860b;
  font-size: 22rpx;
  flex-shrink: 0;
}

.safety-text {
  flex: 1;
  font-size: 24rpx;
  color: #8a8a8a;
}

.safety-tip.expanded .safety-text {
  font-size: 26rpx;
  color: #5a5a5a;
}

.top-recipes .card-desc {
  margin-top: 20rpx;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
  font-size: 28rpx;
}

.top-meal {
  color: #2c2c2e;
}

.top-count {
  color: #5c7c5c;
  font-weight: 500;
}

.section {
  margin-bottom: 32rpx;
}

.section-locked {
  opacity: 0.82;
}

.section-locked .card.empty {
  background: #f0f0f2;
}

.section-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.section-head-row .section-title {
  margin-bottom: 0;
}

.reroll-today {
  margin-top: 0;
  font-size: 26rpx;
  color: #5c7c5c;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #2c2c2e;
  margin-bottom: 8rpx;
}

.section-desc {
  display: block;
  font-size: 26rpx;
  color: #8f8f94;
  margin-bottom: 24rpx;
}

/* 今日三餐卡片略突出 */
.section:not(.section-tomorrow) .meal-card {
  border: 1rpx solid rgba(92, 124, 92, 0.22);
  background: #fffefc;
}

.meal-card {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  background: #fff;
  border-radius: 24rpx;
  border: 1rpx solid rgba(0, 0, 0, 0.06);
  margin-bottom: 20rpx;
}

.meal-card.current {
  border-color: rgba(92, 124, 92, 0.4);
  box-shadow: 0 4rpx 16rpx rgba(92, 124, 92, 0.08);
}

.meal-card.done {
  border-color: rgba(0, 0, 0, 0.06);
  background: #f2f2f2;
}

.meal-card.past {
  opacity: 0.7;
}

/* 明日三餐：与今日明显区分，保持简洁 */
.section-tomorrow {
  background: linear-gradient(180deg, #e8f0e8 0%, #f2f6f2 100%);
  padding: 24rpx;
  border-radius: 24rpx;
  margin-bottom: 32rpx;
}
.section-tomorrow .section-title {
  color: #2d4a2d;
  font-weight: 700;
}
.section-tomorrow .section-desc {
  color: #5a7a5a;
}
.meal-card.tomorrow-card {
  background: #fff;
  border: 1rpx solid rgba(92, 124, 92, 0.25);
  border-left: 6rpx solid #5c7c5c;
}
.meal-card.tomorrow-card .meal-time {
  color: #4a6a4a;
}
.meal-card.tomorrow-card .meal-title {
  color: #2d4a2d;
}

.meal-card.tomorrow-card-no-dot .meal-body {
  padding-left: 0;
}

.meal-left {
  margin-right: 24rpx;
  flex-shrink: 0;
  cursor: pointer;
}

.meal-dot {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  border: 2rpx solid #e0e0e0;
}

.meal-dot.current {
  border-width: 2rpx;
  border-color: #5c7c5c;
  background: rgba(92, 124, 92, 0.1);
}

.meal-dot.done {
  background: rgba(92, 124, 92, 0.2);
  border-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dot-check {
  color: #5c7c5c;
  font-size: 28rpx;
  font-weight: 600;
}

.meal-body {
  flex: 1;
  min-width: 0;
}

.meal-done-badge {
  font-size: 24rpx;
  color: #5c7c5c;
  padding: 4rpx 10rpx;
  border-radius: 999rpx;
  background: rgba(92, 124, 92, 0.12);
}

.meal-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.meal-time {
  font-size: 26rpx;
  color: #8f8f94;
}

.feedback-badge {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(92, 124, 92, 0.12);
  color: #5c7c5c;
}

.meal-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #2c2c2e;
}

.meal-constitution {
  display: block;
  font-size: 26rpx;
  color: #8f8f94;
  margin-top: 8rpx;
}

.recipe-names {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 12rpx;
}

.recipe-name {
  font-size: 26rpx;
  color: #5c7c5c;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(92, 124, 92, 0.08);
}

.week-entry {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16rpx;
}

.week-entry-inner {
  flex: 1;
  min-width: 0;
}

.week-entry-options {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx 32rpx;
  width: 100%;
}

.week-option {
  display: flex;
  align-items: center;
  gap: 12rpx;
  cursor: pointer;
}

.week-option-dot {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 2rpx solid #ccc;
  flex-shrink: 0;
}

.week-option-dot.checked {
  border-color: #5c7c5c;
  background: #5c7c5c;
  box-shadow: inset 0 0 0 2rpx #fff;
}

.week-option-label {
  font-size: 28rpx;
  color: #333;
}

.week-entry-skipped .week-option-dot {
  border-color: #bbb;
}

.week-entry-skipped .week-option-dot.checked {
  border-color: #9a9a9a;
  background: #9a9a9a;
}

.week-entry-skipped .week-option-label {
  color: #9a9a9a;
}

.week-entry-open {
  width: 100%;
  margin-top: 8rpx;
}

.week-entry-open .link {
  margin-top: 0;
  font-size: 26rpx;
}

.week-entry-skipped {
  background: #f0f0f0;
  border-color: rgba(0, 0, 0, 0.06);
  cursor: default;
}

.week-entry-skipped .card-title,
.week-entry-skipped .card-desc {
  color: #9a9a9a;
}

.detail-sheet {
  display: flex;
  flex-direction: column;
  max-height: 85vh;
}

.detail-sheet-body {
  flex: 1;
  height: 55vh;
  min-height: 240rpx;
  margin-bottom: 24rpx;
}

.sheet-meta {
  display: block;
  font-size: 26rpx;
  color: #8f8f94;
  margin-top: 12rpx;
}

.sheet-warn {
  display: block;
  font-size: 26rpx;
  color: #c0392b;
  margin-top: 8rpx;
}

.sheet-notes {
  display: block;
  font-size: 26rpx;
  color: #5a5a5a;
  margin-top: 8rpx;
}

.week-sheet {
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx 32rpx 80rpx;
  padding-bottom: calc(80rpx + env(safe-area-inset-bottom));
}

.week-days-wrap {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* scroll-view 在 H5 下必须用固定高度才能滚动，100% 在部分手机不生效 */
.week-days-scroll {
  height: 55vh;
  padding-bottom: 24rpx;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
}

.week-day {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}

.week-day-head {
  cursor: pointer;
  margin-bottom: 12rpx;
}

.week-date {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #2c2c2e;
}

.week-slots {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.week-slot {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  font-size: 26rpx;
}

.week-slot-label {
  width: 32rpx;
  color: #8f8f94;
}

.week-recipe {
  color: #2c2c2e;
}

.week-recipe-click {
  color: #5c7c5c;
  cursor: pointer;
}

.week-recipe-click:active {
  opacity: 0.8;
}

.week-recipe-wrap {
  display: inline-block;
  cursor: pointer;
}

.week-empty {
  color: #c0c0c0;
}

.week-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #eee;
  flex-shrink: 0;
}

.week-action-btn {
  flex: 1 1 45%;
  min-width: 0;
  white-space: normal;
  min-height: 72rpx;
}

.week-action-btn-primary {
  flex: 1 1 100%;
}

.day-sheet {
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx 32rpx 80rpx;
}

.day-sheet-body {
  flex: 1;
  max-height: 50vh;
  padding: 16rpx 0;
}

.day-sheet-slot {
  margin-bottom: 24rpx;
}

.day-slot-label {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #2c2c2e;
  margin-bottom: 12rpx;
}

.day-slot-recipes {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.day-recipe-name {
  font-size: 26rpx;
  color: #5c7c5c;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(92, 124, 92, 0.08);
}

.day-sheet-hint {
  display: block;
  font-size: 22rpx;
  color: #8f8f94;
  margin-bottom: 16rpx;
}

.day-sheet-actions {
  padding-top: 24rpx;
  border-top: 1rpx solid #eee;
}

.ingredients-sheet {
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  overflow: hidden;
}

.ingredients-sheet .sheet-desc {
  display: block;
  font-size: 26rpx;
  color: #8f8f94;
  margin-bottom: 16rpx;
}

.ingredients-empty {
  padding: 48rpx 24rpx;
  text-align: center;
}

.ingredients-empty-text {
  font-size: 26rpx;
  color: #8f8f94;
}

.ingredients-sheet .sheet-head + .sheet-desc {
  flex-shrink: 0;
}

.ingredients-sheet .ingredients-scroll-wrap {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* scroll-view 在 H5 下必须用固定高度才能滚动，100% 在部分手机不生效 */
.ingredients-scroll {
  height: 55vh;
  box-sizing: border-box;
  padding-bottom: 24rpx;
  -webkit-overflow-scrolling: touch;
}

.ingredients-group {
  margin-bottom: 24rpx;
  padding: 20rpx 24rpx;
  background: #f8f9f8;
  border-radius: 16rpx;
  border-left: 6rpx solid #5c7c5c;
}

.ingredients-category-label {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #2c2c2e;
  margin-bottom: 16rpx;
  padding-left: 0;
  letter-spacing: 0.5rpx;
}

.ingredients-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 0;
}

.ingredient-item {
  font-size: 26rpx;
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(92, 124, 92, 0.12);
  color: #2c2c2e;
}

.week-entry-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.week-entry-title-row .card-title {
  margin-bottom: 0;
}

.week-entry-title-with-icon {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.week-entry-icon {
  font-size: 44rpx;
  line-height: 1;
}

.recipe-lib-entry .card-head {
  flex-wrap: wrap;
  gap: 12rpx;
}

.recipe-lib-entry .card-desc {
  margin-top: 0;
  margin-bottom: 16rpx;
  width: 100%;
}

.recipe-lib-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.recipe-lib-count {
  font-size: 26rpx;
  color: #8f8f94;
}

.recipe-library-sheet .sheet-desc {
  display: block;
  font-size: 26rpx;
  color: #8f8f94;
  margin-bottom: 24rpx;
}

.library-scroll {
  height: 60vh;
  max-height: 60vh;
}

.library-table {
  min-width: 100%;
}

.library-table-head {
  display: flex;
  align-items: center;
  padding: 16rpx 12rpx;
  border-bottom: 2rpx solid #e8e8e8;
  background: #f5f5f5;
  font-size: 26rpx;
  font-weight: 600;
  color: #2c2c2e;
}

.library-th {
  flex: 0 0 120rpx;
  padding-right: 16rpx;
}

.library-th:last-of-type {
  flex: 1;
}

.library-table-row {
  display: flex;
  align-items: center;
  padding: 20rpx 12rpx;
  border-bottom: 1rpx solid #eee;
  font-size: 26rpx;
  color: #2c2c2e;
}

.library-table-row:active {
  background: rgba(92, 124, 92, 0.06);
}

.library-td {
  flex: 0 0 120rpx;
  padding-right: 16rpx;
  color: #5c7c5c;
}

.library-td-name {
  flex: 1;
  color: #2c2c2e;
  min-width: 0;
}

.library-table-row.row-placeholder {
  color: #8f8f94;
}
.library-table-row.row-placeholder .library-td-name {
  color: #8f8f94;
}

.meal-arrow {
  font-size: 36rpx;
  color: #8f8f94;
}

/* AI 应用方向：亮黄区分，表示该部分尚不确定 */
.ai-card {
  background: #fefce8;
  border: 1rpx solid #f5eeb3;
}

.ai-card .ai-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #8b7e2e;
  margin-bottom: 16rpx;
}

.ai-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background: rgba(255, 252, 232, 0.9);
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  border: 1rpx solid #f5eeb3;
}

.ai-picker-label {
  font-size: 26rpx;
  color: #8b7e2e;
  flex: 1;
}

.ai-picker-arrow {
  font-size: 22rpx;
  color: #b5a84a;
  margin-left: 12rpx;
}

.ai-idea-detail {
  padding: 20rpx 24rpx;
  background: rgba(255, 251, 215, 0.8);
  border-radius: 12rpx;
  border: 1rpx solid #f5eeb3;
}

.ai-idea-detail-text {
  font-size: 24rpx;
  color: #8b7e2e;
  line-height: 1.6;
  display: block;
  white-space: pre-wrap;
}

/* 弹层 */
.sheet-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
}

.sheet-mask-top {
  z-index: 200;
}

.sheet,
.feedback-sheet {
  width: 100%;
  max-height: 85vh;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx 32rpx 80rpx;
  overflow-y: auto;
}

.sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.sheet-title {
  font-size: 38rpx;
  font-weight: 600;
  color: #2c2c2e;
}

.sheet-close {
  font-size: 44rpx;
  color: #8f8f94;
  padding: 8rpx;
}

.sheet-benefit {
  display: block;
  font-size: 30rpx;
  color: #5c7c5c;
  margin-bottom: 28rpx;
}

.sheet-heading {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #2c2c2e;
  margin-bottom: 16rpx;
}

.sheet-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 28rpx;
}

.sheet-steps {
  margin-bottom: 28rpx;
}

.step-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 16rpx;
}

.step-num {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: rgba(92, 124, 92, 0.12);
  color: #5c7c5c;
  font-size: 24rpx;
  font-weight: 600;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-text {
  flex: 1;
  font-size: 28rpx;
  color: #2c2c2e;
  line-height: 1.5;
}

.sheet-tcm {
  border-left: 4rpx solid rgba(92, 124, 92, 0.3);
  padding-left: 24rpx;
  margin-bottom: 32rpx;
}

.tcm-text {
  font-size: 26rpx;
  color: #8f8f94;
}

.sheet-actions {
  display: flex;
  gap: 24rpx;
}

.sheet-actions .btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 24rpx;
  font-size: 30rpx;
}

.btn-primary {
  background: #5c7c5c;
  color: #fff;
  border: none;
}

.btn-outline {
  background: #fff;
  color: #5c7c5c;
  border: 2rpx solid #5c7c5c;
  flex: 0 0 auto;
  padding: 0 40rpx;
}

.feedback-desc {
  display: block;
  font-size: 26rpx;
  color: #8f8f94;
  margin-bottom: 32rpx;
}

.feelings {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.feeling-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx 20rpx;
  min-width: 120rpx;
  border-radius: 24rpx;
  background: #f5f5f7;
}

.feeling-item.active {
  background: rgba(92, 124, 92, 0.12);
  border: 1rpx solid rgba(92, 124, 92, 0.2);
}

.feeling-emoji {
  font-size: 48rpx;
}

.feeling-label {
  font-size: 26rpx;
  color: #2c2c2e;
}

.feeling-item.active .feeling-label {
  color: #5c7c5c;
  font-weight: 600;
}

.feedback-response {
  padding: 24rpx;
  background: #f5f5f7;
  border-radius: 16rpx;
  margin-bottom: 32rpx;
  font-size: 28rpx;
  color: #2c2c2e;
}

.btn.full {
  width: 100%;
}

.btn.full.disabled {
  background: #e0e0e0;
  color: #999;
}

.skip {
  display: block;
  text-align: center;
  font-size: 28rpx;
  color: #8f8f94;
  margin-top: 24rpx;
}
</style>
