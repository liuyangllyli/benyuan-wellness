<template>
  <view class="page">
    <!-- Tab 切换 -->
    <view class="tabs">
      <view
        class="tab"
        :class="{ active: activeTab === 'constitution' }"
        @click="activeTab = 'constitution'"
      >
        体质测评
      </view>
      <view
        class="tab"
        :class="{ active: activeTab === 'body' }"
        @click="activeTab = 'body'"
      >
        身体测试
      </view>
    </view>

    <!-- 体质测评 -->
    <template v-if="activeTab === 'constitution'">
      <template v-if="!showResult">
        <view class="section">
          <text class="section-title">中医体质测评</text>
          <text class="section-desc">请根据近一年的体验和感觉作答</text>
        </view>
        <!-- 进度条：短条，符合业界习惯 -->
        <view class="progress-wrap">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: progressPercent + '%' }" />
          </view>
          <text class="progress-text">{{ currentIndex + 1 }}/{{ totalQuestions }}</text>
        </view>
        <!-- 单题展示，一屏一题，题号与题目同一行 -->
        <view class="question-card">
          <view class="question-head">
            <text class="question-num">第{{ currentIndex + 1 }}题</text>
            <text class="question-title">{{ currentQuestion.title }}</text>
          </view>
          <view class="options">
            <view
              v-for="(opt, optIdx) in currentQuestion.options"
              :key="optIdx"
              class="option-row"
              :class="{ selected: constitutionAnswers[currentIndex] === optIdx }"
              @click="constitutionAnswers[currentIndex] = optIdx"
            >
              <view class="radio">
                <view v-if="constitutionAnswers[currentIndex] === optIdx" class="radio-inner" />
              </view>
              <text class="option-text">{{ opt.text }}</text>
            </view>
          </view>
        </view>
        <view class="nav-actions">
          <button
            v-if="currentIndex > 0"
            class="btn btn-outline"
            @click="currentIndex--"
          >
            上一题
          </button>
          <button
            v-if="currentIndex < totalQuestions - 1"
            class="btn btn-primary"
            :disabled="constitutionAnswers[currentIndex] === null"
            @click="goNext"
          >
            下一题
          </button>
          <button
            v-else
            class="btn btn-primary"
            :disabled="!canSubmitConstitution"
            @click="submitConstitution"
          >
            提交
          </button>
        </view>
      </template>
      <template v-else>
        <view class="result">
          <text class="result-title">体质测评结果</text>
          <view class="result-card">
            <text class="result-type">体质判定结果</text>
            <text v-if="resultDetermination" class="result-summary">{{ resultDetermination.summary }}</text>
          </view>
          <!-- 判定标准说明（来自平和质与偏颇体质判定标准表） -->
          <view class="criteria-wrap">
            <text class="criteria-title">判定标准说明</text>
            <view class="criteria-block">
              <text class="criteria-subtitle">平和质（正常体质）</text>
              <text class="criteria-item">· 是：平和质转化分≥60 且 其他8种体质转化分均＜30</text>
              <text class="criteria-item">· 基本是：平和质转化分≥60 且 其他8种体质转化分均＜40</text>
              <text class="criteria-item">· 否：不满足上述条件</text>
            </view>
            <view class="criteria-block">
              <text class="criteria-subtitle">偏颇体质（8种）</text>
              <text class="criteria-item">· 是：该体质转化分≥40</text>
              <text class="criteria-item">· 倾向是：该体质转化分 30～39</text>
              <text class="criteria-item">· 否：该体质转化分＜30</text>
            </view>
          </view>
          <!-- 平和质 8 题：您的选择 + 实际得分（便于与 Excel 核对） -->
          <view class="result-table-wrap">
            <text class="result-table-caption">平和质 8 题：您的选择、基础分、实际得分（带*题为反向：实际分=6−基础分）</text>
            <view class="result-table pinghe-table">
              <view class="result-table-header">
                <text class="col-num">题号</text>
                <text class="col-title">题目</text>
                <text class="col-choice">您的选择</text>
                <text class="col-base">基础分</text>
                <text class="col-actual">实际得分</text>
              </view>
              <view
                v-for="row in pingheDetailList"
                :key="row.num"
                class="result-table-row"
              >
                <text class="col-num">{{ row.num }}</text>
                <text class="col-title">{{ row.title }}</text>
                <text class="col-choice">{{ row.optionLabel }}</text>
                <text class="col-base">{{ row.baseScore }}</text>
                <text class="col-actual">{{ row.actualScore }}</text>
              </view>
              <view class="result-table-row total-row">
                <text class="col-num">—</text>
                <text class="col-title">合计（平和质原始分）</text>
                <text class="col-choice">—</text>
                <text class="col-base">—</text>
                <text class="col-actual">{{ pingheRawSum }}</text>
              </view>
            </view>
          </view>
          <!-- 第一步原始分 + 第二步转化分（共 9 种体质） -->
          <view class="result-table-wrap">
            <text class="result-table-caption">第一步 · 原始分 & 第二步 · 转化分（共 9 种体质）</text>
            <view class="result-table">
              <view class="result-table-header">
                <text class="col-type">体质</text>
                <text class="col-num">条目数</text>
                <text class="col-raw">原始分</text>
                <text class="col-converted">转化分</text>
              </view>
              <view
                v-for="item in resultDimensionList"
                :key="item.name"
                class="result-table-row"
              >
                <text class="col-type">{{ item.name }}</text>
                <text class="col-num">{{ item.entryCount }}</text>
                <text class="col-raw">{{ item.rawScore }}</text>
                <text class="col-converted">{{ item.convertedScore.toFixed(1) }}</text>
              </view>
            </view>
          </view>
          <view class="result-actions">
            <button class="btn btn-primary" @click="goHome">返回首页</button>
            <button class="btn btn-secondary" @click="goBodyTest">继续身体测试</button>
          </view>
        </view>
      </template>
    </template>

    <!-- 身体测试（占位） -->
    <view v-else class="body-placeholder">
      <text class="placeholder-title">身体测试</text>
      <text class="placeholder-desc">5 题 + 疼痛部位多选，敬请期待。</text>
      <text class="placeholder-desc">完成体质测评后，可在此进行身体测试。</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CONSTITUTION_QUESTIONS } from '@/lib/assessment-data'
import {
  saveProfile,
  appendAssessmentHistory,
  newAssessmentId,
  computeConstitutionScores,
  computeConvertedScores,
  getConstitutionDetermination,
  CONSTITUTION_ENTRY_COUNTS,
} from '@/lib/profile-utils'

const activeTab = ref<'constitution' | 'body'>('constitution')
const showResult = ref(false)
const resultDimensionScores = ref<Record<string, number>>({})
const resultDimensionConvertedScores = ref<Record<string, number>>({})
const resultActualScores = ref<number[]>([])
const resultBaseScores = ref<number[]>([])
const resultConstitutionAnswers = ref<number[]>([])
const resultDetermination = ref<{
  primary: string
  tendency: string[]
  pianpoYes: string[]
  summary: string
} | null>(null)
const OPTION_LABELS = ['没有', '很少', '有时', '经常', '总是']
/** 平和质 8 题在 67 题中的下标（题60～67） */
const PINGHE_QUESTION_INDEXES = [59, 60, 61, 62, 63, 64, 65, 66]
const pingheDetailList = computed(() => {
  const actual = resultActualScores.value
  const base = resultBaseScores.value
  const answers = resultConstitutionAnswers.value
  return PINGHE_QUESTION_INDEXES.map((idx, i) => {
    const optIdx = answers[idx] ?? -1
    const baseScore = base[idx] ?? 0
    return {
      num: 60 + i,
      title: CONSTITUTION_QUESTIONS[idx]?.title ?? '',
      optionLabel: optIdx >= 0 && optIdx < 5 ? OPTION_LABELS[optIdx] : '—',
      baseScore,
      actualScore: actual[idx] ?? 0,
    }
  })
})
const pingheRawSum = computed(() =>
  pingheDetailList.value.reduce((s, row) => s + row.actualScore, 0)
)
/** 九种体质固定顺序，仅展示第一步原始分 + 第二步转化分，不做判定 */
const CONSTITUTION_ORDER = [
  '阳虚质', '阴虚质', '气虚质', '痰湿质', '湿热质', '血瘀质', '特禀质', '气郁质', '平和质',
]
const resultDimensionList = computed(() => {
  const raw = resultDimensionScores.value
  const converted = resultDimensionConvertedScores.value
  return CONSTITUTION_ORDER.map((name) => ({
    name,
    entryCount: CONSTITUTION_ENTRY_COUNTS[name] ?? 0,
    rawScore: raw[name] ?? 0,
    convertedScore: converted[name] ?? 0,
  }))
})
const currentIndex = ref(0)

const constitutionAnswers = ref<(number | null)[]>(
  CONSTITUTION_QUESTIONS.map(() => null)
)

const totalQuestions = CONSTITUTION_QUESTIONS.length
const currentQuestion = computed(() => CONSTITUTION_QUESTIONS[currentIndex.value])
const progressPercent = computed(() =>
  totalQuestions > 0 ? ((currentIndex.value + 1) / totalQuestions) * 100 : 0
)
const canSubmitConstitution = computed(() =>
  constitutionAnswers.value.every((a) => a !== null)
)

function goNext() {
  if (currentIndex.value < totalQuestions - 1) currentIndex.value++
}

function submitConstitution() {
  if (!canSubmitConstitution.value) return
  const indices = constitutionAnswers.value as number[]
  const { baseScores, actualScores, dimensionScores } = computeConstitutionScores(
    indices,
    CONSTITUTION_QUESTIONS
  )
  const convertedScores = computeConvertedScores(dimensionScores, CONSTITUTION_ENTRY_COUNTS)
  const determination = getConstitutionDetermination(convertedScores)
  const constitutionType =
    determination.primary === '是平和质' || determination.primary === '基本是平和质'
      ? '平和质'
      : determination.primary
  const timestamp = Date.now()
  const record = {
    id: newAssessmentId(),
    timestamp,
    constitutionAnswers: indices,
    constitutionType,
    baseScores,
    actualScores,
    constitutionDimensionScores: dimensionScores,
    constitutionDimensionConvertedScores: convertedScores,
    constitutionTendency: determination.tendency,
    bodyAnswers: [] as number[],
    painTags: [] as string[],
  }
  appendAssessmentHistory(record)
  saveProfile({
    constitutionAnswers: indices,
    constitutionType,
    constitutionDimensionScores: dimensionScores,
    constitutionDimensionConvertedScores: convertedScores,
    constitutionTendency: determination.tendency,
    timestamp,
  })
  resultDimensionScores.value = dimensionScores
  resultDimensionConvertedScores.value = convertedScores
  resultActualScores.value = actualScores
  resultBaseScores.value = baseScores
  resultConstitutionAnswers.value = indices
  resultDetermination.value = determination
  showResult.value = true
}

function goHome() {
  uni.reLaunch({ url: '/pages/index/index' })
}

function goBodyTest() {
  showResult.value = false
  activeTab.value = 'body'
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 32rpx 120rpx;
  background: #f8f8f8;
}

.tabs {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 32rpx;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  font-size: 28rpx;
  color: #6b6b70;
  border-radius: 12rpx;
  transition: all 0.2s;
}

.tab.active {
  background: #5c7c5c;
  color: #fff;
}

.section {
  margin-bottom: 32rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #2c2c2e;
}

.section-desc {
  display: block;
  font-size: 26rpx;
  color: #8f8f94;
  margin-top: 8rpx;
}

/* 进度条：短条 */
.progress-wrap {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.progress-bar {
  flex: 1;
  height: 8rpx;
  background: #e5e5ea;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #5c7c5c;
  border-radius: 4rpx;
  transition: width 0.2s;
}

.progress-text {
  font-size: 24rpx;
  color: #8f8f94;
  min-width: 64rpx;
}

.question-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
}

.question-head {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.question-num {
  flex-shrink: 0;
  font-size: 28rpx;
  color: #5c7c5c;
  font-weight: 500;
}

.question-title {
  flex: 1;
  font-size: 30rpx;
  color: #2c2c2e;
  line-height: 1.5;
}

.nav-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 32rpx;
}

.nav-actions .btn {
  flex: 1;
}

.btn-outline {
  background: #fff;
  color: #5c7c5c;
  border: 2rpx solid #5c7c5c;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.option-row {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 20rpx 24rpx;
  background: #f5f5f7;
  border-radius: 12rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s;
}

.option-row.selected {
  background: #e8f0e8;
  border-color: #5c7c5c;
}

.radio {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #8f8f94;
  border-radius: 50%;
  margin-right: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.option-row.selected .radio {
  border-color: #5c7c5c;
}

.radio-inner {
  width: 24rpx;
  height: 24rpx;
  background: #5c7c5c;
  border-radius: 50%;
}

.option-text {
  font-size: 28rpx;
  color: #2c2c2e;
  flex: 1;
}

.btn {
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  border: none;
}

.btn-primary {
  background: #5c7c5c;
  color: #fff;
}

.btn-primary[disabled] {
  background: #c7c7cc;
  color: #fff;
}

.btn-secondary {
  background: #fff;
  color: #5c7c5c;
  border: 2rpx solid #5c7c5c;
  margin-top: 24rpx;
}

.result {
  padding: 24rpx 0;
}

.result-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #2c2c2e;
  margin-bottom: 24rpx;
}

.result-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
}

.result-type {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #5c7c5c;
  margin-bottom: 16rpx;
}

.result-guide {
  display: block;
  font-size: 28rpx;
  color: #6b6b70;
  line-height: 1.6;
}

.result-guide.hint {
  color: #8f8f94;
}

.result-summary {
  display: block;
  font-size: 30rpx;
  color: #2c2c2e;
  line-height: 1.5;
}

.criteria-wrap {
  background: #f0f4f0;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 24rpx;
}

.criteria-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #2c2c2e;
  margin-bottom: 12rpx;
}

.criteria-block {
  margin-bottom: 12rpx;
}

.criteria-block:last-child {
  margin-bottom: 0;
}

.criteria-subtitle {
  display: block;
  font-size: 24rpx;
  font-weight: 500;
  color: #5c7c5c;
  margin-bottom: 6rpx;
}

.criteria-item {
  display: block;
  font-size: 22rpx;
  color: #6b6b70;
  line-height: 1.6;
  margin-left: 8rpx;
}

.result-table-wrap {
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 24rpx;
}

.result-table-caption {
  display: block;
  font-size: 24rpx;
  color: #8f8f94;
  margin-bottom: 12rpx;
}

.result-table {
  border: 1rpx solid #e5e5e5;
  border-radius: 8rpx;
  overflow: hidden;
}

.result-table-header,
.result-table-row {
  display: flex;
  align-items: center;
  padding: 12rpx 16rpx;
  font-size: 24rpx;
  border-bottom: 1rpx solid #e5e5e5;
}

.result-table-header {
  background: #e8e8ed;
  font-weight: 600;
  color: #2c2c2e;
}

.result-table-row:last-child {
  border-bottom: none;
}

.col-type { flex: 1.2; min-width: 0; }
.col-num { flex: 0.5; text-align: center; }
.col-title { flex: 2; min-width: 0; }
.col-choice { flex: 0.6; text-align: center; }
.col-base { flex: 0.5; text-align: center; }
.col-actual { flex: 0.5; text-align: center; }
.col-raw { flex: 0.7; text-align: center; }
.col-converted { flex: 0.9; text-align: center; }
.total-row {
  font-weight: 600;
  background: #e8f0e8;
}

.result-scores {
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 24rpx;
}

.result-scores-title {
  display: block;
  font-size: 26rpx;
  color: #8f8f94;
  margin-bottom: 16rpx;
}

.result-score-row {
  display: flex;
  justify-content: space-between;
  padding: 8rpx 0;
  font-size: 28rpx;
}

.score-name {
  color: #2c2c2e;
}

.score-value {
  color: #5c7c5c;
  font-weight: 500;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.body-placeholder {
  padding: 80rpx 32rpx;
  text-align: center;
}

.placeholder-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #2c2c2e;
  margin-bottom: 16rpx;
}

.placeholder-desc {
  display: block;
  font-size: 28rpx;
  color: #8f8f94;
  margin-top: 12rpx;
}
</style>
