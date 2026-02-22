<template>
  <view class="content">
    <view class="text-area">
      <text class="title">{{ title }}</text>
    </view>
    <text class="desc">首页·此刻 · 与 key-code-index、architecture 一致</text>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const title = ref('此刻')

// 首次打开：未完成引导且无档案无日志 → 进入新手引导（与 Lovable/architecture 一致）
onMounted(() => {
  const onboarded = uni.getStorageSync('benyuan_onboarded')
  const profile = uni.getStorageSync('benyuan_profile')
  const logsStr = uni.getStorageSync('benyuan_logs') || '[]'
  const logs = JSON.parse(logsStr) as unknown[]
  if (!onboarded && !profile && (!logs || logs.length === 0)) {
    uni.reLaunch({ url: '/pages/onboarding/onboarding' })
  }
})
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
</style>
