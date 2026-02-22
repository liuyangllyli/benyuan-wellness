<template>
  <view class="page">
    <!-- 顶部：一句说明 + 主操作（新老用户同一条流程，仅入口步数不同） -->
    <view class="hero">
      <text class="hero-desc">{{ hasAnyProfile ? '可单独编辑任一块，或继续完成未填部分' : '分三步完成（基本信息 → 体质 → 身体测试），可随时保存' }}</text>
      <button class="btn-start" @click="goAssessment">
        {{ startButtonText }}
      </button>
    </view>

    <!-- 完整测评摘要（基本信息 + 体质 + 身体测试） -->
    <view class="blocks-title">完整测评摘要</view>
    <view
      v-for="block in blocks"
      :key="block.mode"
      class="block-card"
      :class="{ empty: !block.filled }"
    >
      <view class="block-header">
        <text class="block-name">{{ block.name }}</text>
        <text class="block-edit" @click="goUpdate(block.mode)">编辑</text>
      </view>
      <view v-if="block.filled" class="block-body">
        <text v-for="(line, i) in block.lines" :key="i" class="block-line" :class="{ muted: line.muted }">
          {{ line.text }}
        </text>
      </view>
      <view v-else class="block-empty">尚未填写，点击「编辑」填写</view>
    </view>

    <!-- 测评历史 -->
    <view class="section history-section">
      <text class="section-title">测评历史</text>
      <text class="section-desc">最近 {{ history.length }} 条，点击查看详情</text>
    </view>
    <view v-if="history.length === 0" class="empty-hint">
      <text>暂无测评历史</text>
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
          <text class="history-time">{{ formatTime(item.timestamp) }}</text>
          <text class="history-arrow">查看详情 ›</text>
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

const profile = ref<BenyuanProfile | null>(null)
const history = ref<AssessmentRecord[]>([])

const hasAnyProfile = computed(() =>
  !!(profile.value?.basicInfo || profile.value?.constitution || profile.value?.bodyTest)
)
const hasAllBlocks = computed(
  () =>
    !!(profile.value?.basicInfo && profile.value?.constitution && profile.value?.bodyTest)
)

const startButtonText = computed(() => {
  if (hasAllBlocks.value) return '去测评'
  if (!profile.value?.basicInfo) return '从基本信息开始'
  if (!profile.value?.constitution) return '继续：体质测评'
  if (!profile.value?.bodyTest) return '继续：身体测试'
  return '继续测评'
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
    basic_info: '基本信息',
    constitution: '体质测评',
    body_test: '身体测试',
  }
  return map[type] ?? type
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
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
  profile.value = getProfile()
  history.value = getAssessmentHistory()
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

.hero-desc {
  display: block;
  font-size: 28rpx;
  color: #5a6b5a;
  line-height: 1.5;
  margin-bottom: 24rpx;
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

.history-section {
  margin-top: 32rpx;
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
