<template>
  <view class="page">
    <text class="title">食养</text>
    <text class="desc">体质饮食 · 今日三餐 · 餐后感受</text>
    <view v-if="constitutionSummary" class="profile-card">
      <text class="card-title">您的体质</text>
      <text class="card-content">{{ constitutionSummary }}</text>
      <text class="card-desc">可根据体质获取饮食建议</text>
    </view>
    <view v-else class="profile-card empty">
      <text class="card-desc">完成观己体质测评后，可查看体质饮食建议</text>
      <text class="link" @click="goProfile">去观己测评</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getProfile } from '@/lib/profile-utils'

const constitutionSummary = ref('')

onShow(() => {
  const profile = getProfile()
  constitutionSummary.value =
    profile?.constitution?.summary || profile?.constitution?.type || ''
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
</style>
