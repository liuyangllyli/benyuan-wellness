<template>
  <view class="page">
    <text class="code">404</text>
    <text class="title">页面不存在</text>
    <button class="btn" @click="goHome">返回首页</button>
  </view>
</template>

<script setup lang="ts">
function goHome() {
  uni.reLaunch({ url: '/pages/index/index' })
}
</script>

<style scoped>
.page { padding: 32rpx; text-align: center; }
.code { font-size: 80rpx; color: #333; display: block; }
.title { font-size: 32rpx; color: #8f8f94; margin-top: 16rpx; display: block; }
.btn { margin-top: 32rpx; }
</style>
