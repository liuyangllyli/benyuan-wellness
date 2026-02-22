<template>
  <view class="page">
    <!-- 顶部：一句说明 + 主操作（新老用户同一条流程，仅入口步数不同） -->
    <view class="hero">
      <text v-if="loadError" class="hero-error">{{ loadError }}</text>
      <text v-else class="hero-desc">{{ hasAnyProfile ? profileCopy.heroDescFilled : profileCopy.heroDescEmpty }}</text>
      <text v-if="!hasAnyProfile && !loadError" class="hero-tip">{{ profileCopy.heroDescEmptyTip }}</text>
      <button class="btn-start" @click="goAssessment">
        {{ startButtonText }}
      </button>
    </view>

    <!-- 完整测评摘要（基本信息 + 体质 + 身体测试） -->
    <view class="blocks-title">{{ profileCopy.blocksTitle }}</view>
    <view
      v-for="block in blocks"
      :key="block.mode"
      class="block-card"
      :class="{ empty: !block.filled }"
    >
      <view class="block-header">
        <text class="block-name">{{ block.name }}</text>
        <text class="block-edit" @click="goUpdate(block.mode)">{{ profileCopy.blockEdit }}</text>
      </view>
      <view v-if="block.filled" class="block-body">
        <text v-for="(line, i) in block.lines" :key="i" class="block-line" :class="{ muted: line.muted }">
          {{ line.text }}
        </text>
      </view>
      <view v-else class="block-empty">{{ profileCopy.blockEmptyHint }}</view>
    </view>

    <!-- 测评历史：默认收起，点击「查看」展开 -->
    <view class="history-card" @click="historyExpand = !historyExpand">
      <view class="history-card-header">
        <text class="history-card-title">{{ profileCopy.historyTitle }}</text>
        <text class="history-card-count">{{ profileCopy.historyRecords(history.length) }}</text>
        <text class="history-card-toggle">{{ historyExpand ? profileCopy.historyToggleCollapse : profileCopy.historyToggleView }}</text>
      </view>
    </view>
    <view v-if="historyExpand" class="history-expand">
      <view v-if="history.length === 0" class="empty-hint">
        <text>{{ profileCopy.historyEmpty }}</text>
      </view>
      <view v-else class="history-list">
        <view
          v-for="item in history"
          :key="item.id"
          class="history-item"
          @click="goDetail(item.id)"
        >
          <text class="history-type">{{ typeLabel(item.type) }}</text>
          <view class="history-right">
            <text class="history-time">{{ formatDateTime(item.timestamp) }}</text>
            <text class="history-arrow">{{ profileCopy.historyDetail }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getProfile, getAssessmentHistory } from '@/lib/profile-utils'
import type { BenyuanProfile, AssessmentRecord, AssessmentRecordType } from '@/lib/profile-utils'
import { BASIC_Q2_OPTIONS, BASIC_Q3_OPTIONS, BASIC_OCCUPATION_OPTIONS } from '@/lib/assessment-data'
import { formatDateTime } from '@/lib/format'
import { profileCopy } from '@/lib/assessment-copy'

const profile = ref<BenyuanProfile | null>(null)
const history = ref<AssessmentRecord[]>([])
const historyExpand = ref(false)
const loadError = ref('')

const hasAnyProfile = computed(() =>
  !!(profile.value?.basicInfo || profile.value?.constitution || profile.value?.bodyTest)
)
const hasAllBlocks = computed(
  () =>
    !!(profile.value?.basicInfo && profile.value?.constitution && profile.value?.bodyTest)
)

const startButtonText = computed(() => {
  if (hasAllBlocks.value) return profileCopy.startFull
  if (!profile.value?.basicInfo) return profileCopy.startFromBasic
  if (!profile.value?.constitution) return profileCopy.startConstitution
  if (!profile.value?.bodyTest) return profileCopy.startBodyTest
  return profileCopy.startContinue
})

const blocks = computed(() => {
  const p = profile.value
  return [
    {
      name: '基本信息',
      mode: 'basic_info_only' as const,
      filled: !!p?.basicInfo,
      lines: p?.basicInfo
        ? [
            { text: `年龄：${ageRangeLabel.value}`, muted: false },
            { text: `性别：${genderLabel.value}`, muted: false },
            ...(p.basicInfo.occupation ? [{ text: `职业：${occupationLabel.value}`, muted: false }] : []),
            ...(p.basicInfo.specialConditions?.length
              ? [{ text: `特殊情况：${specialConditionsLabel.value}`, muted: true }]
              : []),
          ]
        : [],
    },
    {
      name: '体质测评',
      mode: 'constitution_only' as const,
      filled: !!p?.constitution,
      lines: p?.constitution
        ? [
            { text: `体质判定：${p.constitution.summary || p.constitution.type || '—'}`, muted: false },
            ...(p.constitution.tendency?.length
              ? [{ text: `倾向：${p.constitution.tendency.join('、')}`, muted: true }]
              : []),
          ]
        : [],
    },
    {
      name: '身体测试',
      mode: 'body_test_only' as const,
      filled: !!p?.bodyTest,
      lines: p?.bodyTest
        ? [
            { text: `运动表现总分（题4-12）：${p.bodyTest.score4_12 ?? '—'}`, muted: false },
            ...(p.bodyTest.evaluation ? [{ text: p.bodyTest.evaluation, muted: false }] : []),
            ...(p.bodyTest.exerciseMethods?.length
              ? [{ text: `推荐：${p.bodyTest.exerciseMethods!.join('、')}`, muted: true }]
              : []),
          ]
        : [],
    },
  ]
})

const ageRangeLabel = computed(() => {
  const v = profile.value?.basicInfo?.ageRange
  if (!v) return '—'
  return BASIC_Q2_OPTIONS.find((o) => o.value === v)?.text ?? v
})

const genderLabel = computed(() => {
  const v = profile.value?.basicInfo?.gender
  if (!v) return '—'
  return BASIC_Q3_OPTIONS.find((o) => o.value === v)?.text ?? v
})

const occupationLabel = computed(() => {
  const v = profile.value?.basicInfo?.occupation
  if (!v) return '—'
  return BASIC_OCCUPATION_OPTIONS.find((o) => o.id === v)?.text ?? v
})

const specialConditionsLabel = computed(() => {
  const arr = profile.value?.basicInfo?.specialConditions
  if (!arr?.length) return '—'
  const labels: Record<string, string> = {
    special_surgery: '近期手术',
    special_mental: '后遗症/精神类',
    special_visceral: '内脏疾病',
    special_bone: '骨伤疾病',
    special_other: '其他疾病',
    special_none: '无',
  }
  return arr.map((id) => labels[id] ?? id).join('、')
})

function typeLabel(type: AssessmentRecordType): string {
  const map: Record<AssessmentRecordType, string> = {
    basic_info: profileCopy.typeBasicInfo,
    constitution: profileCopy.typeConstitution,
    body_test: profileCopy.typeBodyTest,
  }
  return map[type] ?? type
}

/** 根据当前档案，进入测评时应落在哪一步（新用户/老用户同一条流程，只改入口步数） */
function getStartStep(): 1 | 2 | 3 {
  const p = profile.value
  if (!p?.basicInfo) return 1
  if (!p?.constitution) return 2
  if (!p?.bodyTest) return 3
  return 1 // 都填过了，从第一步开始即可（可再测）
}

function goAssessment() {
  const step = getStartStep()
  const url = step === 1 ? '/pages/assessment/assessment' : `/pages/assessment/assessment?startStep=${step}`
  uni.navigateTo({ url })
}

function goUpdate(mode: 'basic_info_only' | 'constitution_only' | 'body_test_only') {
  uni.navigateTo({ url: `/pages/assessment/assessment?mode=${mode}` })
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/profile/detail?id=${encodeURIComponent(id)}` })
}

onShow(() => {
  loadError.value = ''
  try {
    profile.value = getProfile()
    history.value = getAssessmentHistory()
  } catch (e) {
    loadError.value = profileCopy.loadError
    profile.value = null
    history.value = []
    uni.showToast({ title: profileCopy.loadError, icon: 'none' })
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 28rpx 32rpx 120rpx;
  background: #f0f2f0;
}

.hero {
  margin-bottom: 32rpx;
}

.hero-desc,
.hero-tip,
.hero-error {
  display: block;
  font-size: 28rpx;
  color: #5a6b5a;
  line-height: 1.5;
  margin-bottom: 24rpx;
}

.hero-tip {
  color: #8f8f94;
  font-size: 26rpx;
}

.hero-error {
  color: #c0392b;
}

.btn-start {
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  background: #5c7c5c;
  color: #fff;
  border: none;
  width: 100%;
}

.blocks-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #7a8a7a;
  margin-bottom: 18rpx;
  letter-spacing: 0.5rpx;
}

.block-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.block-card.empty {
  background: #f8faf8;
  border: 1rpx solid #e8ece8;
}

.block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.block-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #2c2c2e;
}

.block-edit {
  font-size: 28rpx;
  color: #5c7c5c;
  flex-shrink: 0;
}

.block-body {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.block-line {
  font-size: 28rpx;
  color: #2c2c2e;
}

.block-line.muted {
  color: #8f8f94;
}

.block-empty {
  font-size: 26rpx;
  color: #8f8f94;
}

.section {
  margin-bottom: 16rpx;
}

.history-card {
  margin-top: 32rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.history-card-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.history-card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #2c2c2e;
}

.history-card-count {
  font-size: 26rpx;
  color: #8f8f94;
  flex: 1;
}

.history-card-toggle {
  font-size: 28rpx;
  color: #5c7c5c;
}

.history-expand {
  margin-top: 12rpx;
  padding-top: 12rpx;
}

.empty-hint {
  padding: 48rpx;
  text-align: center;
  font-size: 28rpx;
  color: #8f8f94;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx 28rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.history-item:active {
  background: #f5f7f5;
}

.history-type {
  font-size: 28rpx;
  color: #2c2c2e;
}

.history-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.history-time {
  font-size: 24rpx;
  color: #8f8f94;
}

.history-arrow {
  font-size: 26rpx;
  color: #5c7c5c;
}
</style>
