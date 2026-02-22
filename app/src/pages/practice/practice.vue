<template>
  <view class="page">
    <text class="title">炼体</text>
    <text class="desc">练功计划 · 今日安排 · 动作库</text>
    <view v-if="exerciseMethods.length" class="profile-card">
      <text class="card-title">为您推荐</text>
      <text class="card-content">{{ exerciseMethods.join('、') }}</text>
      <text class="card-desc">基于您的身体测评推荐</text>
    </view>
    <view v-else class="profile-card empty">
      <text class="card-desc">完成身体测评后可获得炼体法推荐（活身法、动身法、合身法）</text>
      <text class="link" @click="goProfile">去观己测评</text>
    </view>
    <view v-if="overtrainingHint" class="hint-card">
      <text class="hint-text">{{ overtrainingHint }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getProfile } from '@/lib/profile-utils'

const exerciseMethods = ref<string[]>([])
const overtrainingHint = ref('')

onShow(() => {
  const profile = getProfile()
  exerciseMethods.value = profile?.bodyTest?.exerciseMethods?.length
    ? profile.bodyTest.exerciseMethods!
    : []
  overtrainingHint.value = profile?.bodyTest?.overtrainingWarning
    ? '需注意：当前单次锻炼可能存在过度锻炼，请重视调养与锻炼结合'
    : ''
})

function goProfile() {
  uni.switchTab({ url: '/pages/profile/profile' })
}
</script>

<style scoped>
.page {
  padding: 32rpx;
}
.title {
  font-size: 36rpx;
  color: #333;
}
.desc {
  font-size: 28rpx;
  color: #8f8f94;
  margin-top: 16rpx;
}
.profile-card {
  margin-top: 32rpx;
  padding: 24rpx 28rpx;
  background: #f0f4f0;
  border-radius: 16rpx;
}
.profile-card.empty {
  background: #f5f5f7;
}
.card-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #5c7c5c;
  margin-bottom: 8rpx;
}
.card-content {
  font-size: 30rpx;
  color: #2c2c2e;
}
.card-desc {
  display: block;
  font-size: 26rpx;
  color: #8f8f94;
  margin-top: 8rpx;
}
.link {
  display: inline-block;
  margin-top: 12rpx;
  font-size: 28rpx;
  color: #5c7c5c;
}
.hint-card {
  margin-top: 24rpx;
  padding: 20rpx 28rpx;
  background: #fff8e8;
  border-radius: 12rpx;
}
.hint-text {
  font-size: 26rpx;
  color: #b8860b;
}
</style>
