<template>
  <view class="page">
    <view class="content">
      <!-- 步骤 1：本元 -->
      <view v-if="step === 0" class="step">
        <text class="step-title">本元</text>
        <text class="step-desc">回归本元，从了解自己的身体开始。</text>
      </view>
      <!-- 步骤 2：身·气·神 -->
      <view v-else-if="step === 1" class="step">
        <text class="step-title">身 · 气 · 神</text>
        <text class="step-desc">调身、养气、安神，三者合一，日日归元。</text>
      </view>
      <!-- 步骤 3：开始归元之路 -->
      <view v-else class="step">
        <text class="step-title">开始归元之路</text>
        <text class="step-desc">你可以先了解自己的体质，或先逛一逛再决定。</text>
      </view>
    </view>

    <!-- 步骤点 -->
    <view class="dots">
      <view
        v-for="(_, i) in 3"
        :key="i"
        class="dot"
        :class="{ active: step === i }"
      />
    </view>

    <!-- 底部操作 -->
    <view class="actions">
      <template v-if="step < 2">
        <button class="btn btn-primary" @click="next">下一步</button>
      </template>
      <template v-else>
        <button class="btn btn-primary" @click="goAssessment">了解自己</button>
        <button class="btn btn-secondary" @click="goHome">先逛一逛</button>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const step = ref(0)

function next() {
  if (step.value < 2) step.value++
}

function finishOnboarding() {
  uni.setStorageSync('benyuan_onboarded', 'true')
}

function goAssessment() {
  finishOnboarding()
  uni.reLaunch({ url: '/pages/assessment/assessment' })
}

function goHome() {
  finishOnboarding()
  uni.reLaunch({ url: '/pages/index/index' })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 48rpx 40rpx 80rpx;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f5f0e8 0%, #faf8f5 100%);
}

.content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
}

.step {
  text-align: center;
}

.step-title {
  display: block;
  font-size: 44rpx;
  font-weight: 600;
  color: #2c2c2e;
  letter-spacing: 2rpx;
  margin-bottom: 24rpx;
}

.step-desc {
  display: block;
  font-size: 30rpx;
  color: #6b6b70;
  line-height: 1.6;
  max-width: 560rpx;
  margin: 0 auto;
}

.dots {
  display: flex;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 48rpx;
}

.dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #d1d1d6;
  transition: background 0.2s;
}

.dot.active {
  background: #5c7c5c;
  width: 32rpx;
  border-radius: 8rpx;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.btn {
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 48rpx;
  font-size: 32rpx;
  border: none;
}

.btn-primary {
  background: #5c7c5c;
  color: #fff;
}

.btn-secondary {
  background: transparent;
  color: #5c7c5c;
  border: 2rpx solid #5c7c5c;
}
</style>
