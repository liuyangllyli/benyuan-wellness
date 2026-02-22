<template>
  <view class="content">
    <view class="text-area">
      <text class="title">{{ title }}</text>
    </view>
    <text class="desc">首页·当下</text>
    <view v-if="profileSummary" class="profile-summary">
      <text v-if="profileSummary.constitution" class="summary-line">体质：{{ profileSummary.constitution }}</text>
      <text v-if="profileSummary.bodyTest" class="summary-line">运动表现：{{ profileSummary.bodyTest }}</text>
      <view v-if="profileSummary.overtrainingHint" class="hint-line">
        <text class="hint-text">{{ profileSummary.overtrainingHint }}</text>
      </view>
      <view class="link-row">
        <text class="link" @click="goProfile">查看我的测评档案</text>
      </view>
    </view>
    <view v-else class="profile-prompt">
      <text class="prompt-text">完成观己测评，获取个性化内容</text>
      <text class="link" @click="goProfile">去测评</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getProfile } from '@/lib/profile-utils'

const title = ref('当下')
const profileSummary = ref<{
  constitution?: string
  bodyTest?: string
  overtrainingHint?: string
} | null>(null)

function refreshProfileSummary() {
  const profile = getProfile()
  if (profile?.constitution || profile?.bodyTest) {
    profileSummary.value = {
      constitution: profile.constitution?.summary || profile.constitution?.type || undefined,
      bodyTest: profile.bodyTest?.evaluation || undefined,
      overtrainingHint:
        profile.bodyTest?.overtrainingWarning
          ? '需注意：当前单次锻炼可能存在过度锻炼，请重视调养与锻炼结合'
          : undefined,
    }
  } else {
    profileSummary.value = null
  }
}

// 首次打开：未完成引导且无档案无日志 → 进入新手引导（与 Lovable/architecture 一致）
onMounted(() => {
  const onboarded = uni.getStorageSync('benyuan_onboarded')
  const profileRaw = uni.getStorageSync('benyuan_profile')
  const logsStr = uni.getStorageSync('benyuan_logs') || '[]'
  const logs = JSON.parse(logsStr) as unknown[]
  if (!onboarded && !profileRaw && (!logs || logs.length === 0)) {
    uni.reLaunch({ url: '/pages/onboarding/onboarding' })
    return
  }
  refreshProfileSummary()
})

onShow(() => {
  refreshProfileSummary()
})

function goProfile() {
  uni.switchTab({ url: '/pages/profile/profile' })
}
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 32rpx;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 40rpx;
  color: #333;
}

.desc {
  font-size: 28rpx;
  color: #8f8f94;
  margin-top: 24rpx;
}

.profile-summary,
.profile-prompt {
  margin-top: 32rpx;
  padding: 24rpx;
  background: #f5f5f7;
  border-radius: 16rpx;
  width: 100%;
  max-width: 600rpx;
}

.summary-line {
  display: block;
  font-size: 28rpx;
  color: #2c2c2e;
  margin-bottom: 8rpx;
}

.hint-line {
  margin-top: 12rpx;
}

.hint-text {
  font-size: 26rpx;
  color: #b8860b;
}

.link-row {
  margin-top: 16rpx;
}

.link {
  font-size: 28rpx;
  color: #5c7c5c;
}

.profile-prompt .prompt-text {
  display: block;
  font-size: 28rpx;
  color: #8f8f94;
  margin-bottom: 12rpx;
}
</style>
