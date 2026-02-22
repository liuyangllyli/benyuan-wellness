<template>
  <view class="page">
    <template v-if="record">
      <view class="section">
        <text class="section-title">历史详情</text>
        <text class="section-desc">{{ typeLabel(record.type) }} · {{ formatTime(record.timestamp) }}</text>
      </view>

      <template v-if="record.payload.basicInfo">
        <view class="block-card">
          <text class="block-name">基本信息</text>
          <view class="block-body">
            <text class="block-line">年龄：{{ basicInfoAgeLabel }}</text>
            <text class="block-line">性别：{{ basicInfoGenderLabel }}</text>
            <text v-if="record.payload.basicInfo.occupation" class="block-line">职业：{{ basicInfoOccupationLabel }}</text>
          </view>
        </view>
      </template>

      <template v-if="record.payload.constitution">
        <view class="block-card">
          <text class="block-name">体质测评</text>
          <view class="block-body">
            <text class="block-line">体质判定：{{ record.payload.constitution.summary || record.payload.constitution.type || '—' }}</text>
            <text v-if="record.payload.constitution.tendency?.length" class="block-line block-line-muted">
              倾向：{{ record.payload.constitution.tendency.join('、') }}
            </text>
            <view v-if="dimensionList.length" class="dimension-table">
              <view class="dimension-row header">
                <text class="col-type">体质</text>
                <text class="col-raw">原始分</text>
                <text class="col-converted">转化分</text>
              </view>
              <view v-for="item in dimensionList" :key="item.name" class="dimension-row">
                <text class="col-type">{{ item.name }}</text>
                <text class="col-raw">{{ item.raw }}</text>
                <text class="col-converted">{{ item.converted }}</text>
              </view>
            </view>
          </view>
        </view>
      </template>

      <template v-if="record.payload.bodyTest">
        <view class="block-card">
          <text class="block-name">身体测试</text>
          <view class="block-body">
            <text class="block-line">运动表现总分（题4-12）：{{ record.payload.bodyTest.score4_12 ?? '—' }}</text>
            <text v-if="record.payload.bodyTest.evaluation" class="block-line">{{ record.payload.bodyTest.evaluation }}</text>
            <text v-if="record.payload.bodyTest.overtrainingWarning" class="block-line block-line-warn">
              需注意过度锻炼、调养与锻炼结合
            </text>
            <text v-if="record.payload.bodyTest.exerciseMethods?.length" class="block-line block-line-muted">
              推荐：{{ record.payload.bodyTest.exerciseMethods!.join('、') }}
            </text>
          </view>
        </view>
      </template>
    </template>
    <view v-else class="empty-state">
      <text>未找到该记录</text>
      <button class="btn btn-outline" @click="goBack">返回档案</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getAssessmentHistory } from '@/lib/profile-utils'
import type { AssessmentRecord, AssessmentRecordType } from '@/lib/profile-utils'
import { BASIC_Q2_OPTIONS, BASIC_Q3_OPTIONS, BASIC_OCCUPATION_OPTIONS } from '@/lib/assessment-data'

const record = ref<AssessmentRecord | null>(null)

const CONSTITUTION_ORDER = [
  '阳虚质', '阴虚质', '气虚质', '痰湿质', '湿热质', '血瘀质', '特禀质', '气郁质', '平和质',
]

const dimensionList = computed(() => {
  const c = record.value?.payload?.constitution
  if (!c?.dimensionScores || !c?.dimensionConvertedScores) return []
  return CONSTITUTION_ORDER.map((name) => ({
    name,
    raw: c.dimensionScores[name] ?? 0,
    converted: (c.dimensionConvertedScores[name] ?? 0).toFixed(1),
  }))
})

const basicInfoAgeLabel = computed(() => {
  const v = record.value?.payload?.basicInfo?.ageRange
  if (!v) return '—'
  return BASIC_Q2_OPTIONS.find((o) => o.value === v)?.text ?? v
})

const basicInfoGenderLabel = computed(() => {
  const v = record.value?.payload?.basicInfo?.gender
  if (!v) return '—'
  return BASIC_Q3_OPTIONS.find((o) => o.value === v)?.text ?? v
})

const basicInfoOccupationLabel = computed(() => {
  const v = record.value?.payload?.basicInfo?.occupation
  if (!v) return '—'
  return BASIC_OCCUPATION_OPTIONS.find((o) => o.id === v)?.text ?? v
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

function goBack() {
  uni.navigateBack()
}

onLoad((options: Record<string, string> | undefined) => {
  const id = options?.id
  if (!id) return
  const list = getAssessmentHistory()
  record.value = list.find((r) => r.id === id) ?? null
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 32rpx 120rpx;
  background: #f8f8f8;
}

.section {
  margin-bottom: 24rpx;
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

.block-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  margin-bottom: 24rpx;
}

.block-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #2c2c2e;
  margin-bottom: 16rpx;
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

.block-line-muted {
  color: #8f8f94;
}

.block-line-warn {
  color: #b8860b;
}

.dimension-table {
  margin-top: 16rpx;
  border: 1rpx solid #e5e5e5;
  border-radius: 8rpx;
  overflow: hidden;
}

.dimension-row {
  display: flex;
  align-items: center;
  padding: 12rpx 16rpx;
  font-size: 24rpx;
  border-bottom: 1rpx solid #e5e5e5;
}

.dimension-row:last-child {
  border-bottom: none;
}

.dimension-row.header {
  background: #e8e8ed;
  font-weight: 600;
}

.col-type { flex: 1; min-width: 0; }
.col-raw { flex: 0.5; text-align: center; }
.col-converted { flex: 0.6; text-align: center; }

.empty-state {
  padding: 80rpx 32rpx;
  text-align: center;
}

.empty-state text {
  display: block;
  font-size: 28rpx;
  color: #8f8f94;
  margin-bottom: 32rpx;
}

.btn {
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
}

.btn-outline {
  background: #fff;
  color: #5c7c5c;
  border: 2rpx solid #5c7c5c;
}
</style>
