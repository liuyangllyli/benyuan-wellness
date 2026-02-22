<template>
  <view class="page">
    <!-- 步骤条：Step1 基本信息 → Step2 体质测评 → Step3 身体测试 -->
    <view v-if="showStepBar" class="step-bar">
      <view
        class="step-item"
        :class="{ active: currentStep === 1, done: step1Done }"
        @click="goToStep(1)"
      >
        <text class="step-num">1</text>
        <text class="step-label">基本信息</text>
      </view>
      <view class="step-line" :class="{ done: step1Done }" />
      <view
        class="step-item"
        :class="{ active: currentStep === 2, done: step2Done }"
        @click="goToStep(2)"
      >
        <text class="step-num">2</text>
        <text class="step-label">体质测评</text>
      </view>
      <view class="step-line" :class="{ done: step2Done }" />
      <view
        class="step-item"
        :class="{ active: currentStep === 3 }"
        @click="goToStep(3)"
      >
        <text class="step-num">3</text>
        <text class="step-label">身体测试</text>
      </view>
    </view>

    <!-- Step1 基本信息 -->
    <template v-if="currentStep === 1">
      <view class="section">
        <text class="section-title">基本信息</text>
        <text class="section-desc">请如实填写，用于为您提供更合适的测评与建议，约 1 分钟</text>
      </view>
      <view class="question-card">
        <view class="question-head">
          <text class="question-num">第1题</text>
          <text class="question-title">您是否存在以下特殊情况？（可多选）</text>
        </view>
        <view class="options">
          <view
            v-for="(opt, optIdx) in BASIC_Q1_OPTIONS"
            :key="opt.id"
            class="option-row"
            :class="{ selected: basicQ1Selected(opt.id) }"
            @click="toggleBasicQ1(opt.id)"
          >
            <view class="checkbox">
              <view v-if="basicQ1Selected(opt.id)" class="checkbox-inner">✓</view>
            </view>
            <text class="option-text">{{ opt.text }}</text>
          </view>
        </view>
      </view>
      <view class="question-card">
        <view class="question-head">
          <text class="question-num">第2题</text>
          <text class="question-title">您的年龄段</text>
        </view>
        <view class="options">
          <view
            v-for="opt in BASIC_Q2_OPTIONS"
            :key="opt.id"
            class="option-row"
            :class="{ selected: basicInfo.ageRange === opt.value }"
            @click="basicInfo.ageRange = opt.value"
          >
            <view class="radio">
              <view v-if="basicInfo.ageRange === opt.value" class="radio-inner" />
            </view>
            <text class="option-text">{{ opt.text }}</text>
          </view>
        </view>
      </view>
      <view class="question-card">
        <view class="question-head">
          <text class="question-num">第3题</text>
          <text class="question-title">性别</text>
        </view>
        <view class="options">
          <view
            v-for="opt in BASIC_Q3_OPTIONS"
            :key="opt.id"
            class="option-row"
            :class="{ selected: basicInfo.gender === opt.value }"
            @click="basicInfo.gender = opt.value"
          >
            <view class="radio">
              <view v-if="basicInfo.gender === opt.value" class="radio-inner" />
            </view>
            <text class="option-text">{{ opt.text }}</text>
          </view>
        </view>
      </view>
      <view class="question-card">
        <view class="question-head">
          <text class="question-num">职业</text>
          <text class="question-title">（选填）</text>
        </view>
        <view class="options">
          <view
            v-for="opt in BASIC_OCCUPATION_OPTIONS"
            :key="opt.id"
            class="option-row"
            :class="{ selected: basicInfo.occupation === opt.id }"
            @click="basicInfo.occupation = basicInfo.occupation === opt.id ? undefined : opt.id"
          >
            <view class="radio">
              <view v-if="basicInfo.occupation === opt.id" class="radio-inner" />
            </view>
            <text class="option-text">{{ opt.text }}</text>
          </view>
        </view>
      </view>
      <view class="nav-actions">
        <button class="btn btn-primary" :disabled="!canSubmitBasicInfo" @click="submitBasicInfo">
          {{ mode === 'basic_info_only' ? '保存' : '下一步：体质测评' }}
        </button>
        <button
          v-if="hasAnyProfile"
          class="btn btn-outline"
          @click="goProfile"
        >
          {{ mode === 'basic_info_only' ? assessmentCopy.viewProfile : assessmentCopy.viewProfileHint }}
        </button>
      </view>
    </template>

    <!-- Step2 体质测评 -->
    <template v-else-if="currentStep === 2">
      <template v-if="!showResult">
        <view class="section">
          <text class="section-title">中医体质测评</text>
          <text class="section-desc">请根据近一年的体验和感觉作答，约 5 分钟</text>
        </view>
        <!-- 进度条：短条，符合业界习惯 -->
        <view class="progress-wrap">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: progressPercent + '%' }" />
          </view>
          <text class="progress-text">{{ currentIndex + 1 }}/{{ totalQuestions }}</text>
        </view>
        <!-- 单题展示，一屏一题；第37/38题按性别灰调不填 -->
        <view class="question-card">
          <view class="question-head">
            <text class="question-num">第{{ currentIndex + 1 }}题</text>
            <text class="question-title">{{ currentQuestion.title }}</text>
          </view>
          <view v-if="(currentIndex === 36 || currentIndex === 37) && !constitutionGender" class="question-skip-hint">
            <text>{{ assessmentCopy.constitutionNoGenderHint }}</text>
          </view>
          <view v-else-if="isConstitutionQuestionDisabled(currentIndex)" class="question-skip-hint">
            <text>{{ currentIndex === 36 ? assessmentCopy.constitutionSkipFemale : assessmentCopy.constitutionSkipMale }}</text>
          </view>
          <view v-else class="options">
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
          <view v-if="isConstitutionQuestionDisabled(currentIndex) && constitutionGender" class="options options-disabled">
            <view
              v-for="(opt, optIdx) in currentQuestion.options"
              :key="optIdx"
              class="option-row option-row-disabled"
            >
              <view class="radio" />
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
            :disabled="!isConstitutionQuestionDisabled(currentIndex) && constitutionAnswers[currentIndex] === null"
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
          <view class="result-card result-card-main">
            <text class="result-type">体质判定结果</text>
            <text v-if="resultDetermination" class="result-summary">{{ resultDetermination.summary }}</text>
            <text class="result-ref">依据《中医体质分类与判定》</text>
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
            <button class="btn btn-primary" @click="goToStep(3)">继续身体测试</button>
            <button class="btn btn-secondary" @click="goProfile">{{ assessmentCopy.viewProfile }}</button>
            <button class="btn btn-outline result-btn" @click="goHome">{{ assessmentCopy.returnHome }}</button>
          </view>
        </view>
      </template>
    </template>

    <!-- Step3 身体测试（题4-19） -->
    <template v-else-if="currentStep === 3">
      <template v-if="!showBodyResult">
        <view class="section">
          <text class="section-title">身体测试</text>
          <text class="section-desc">请根据您的实际情况作答，用于运动表现评估与炼体法推荐，约 3 分钟</text>
        </view>
        <scroll-view scroll-y class="body-test-form" :show-scrollbar="true">
          <!-- 题4-5 -->
          <view class="question-card">
            <view class="question-head">
              <text class="question-num">第1题</text>
              <text class="question-title">健康在您生活中的重要程度？</text>
            </view>
            <view class="options">
              <view
                v-for="(opt, idx) in BODY_Q4_OPTIONS"
                :key="idx"
                class="option-row"
                :class="{ selected: bodyAnswers.q4 === idx }"
                @click="bodyAnswers.q4 = idx"
              >
                <view class="radio"><view v-if="bodyAnswers.q4 === idx" class="radio-inner" /></view>
                <text class="option-text">{{ opt.text }}</text>
              </view>
            </view>
          </view>
          <view class="question-card">
            <view class="question-head">
              <text class="question-num">第2题</text>
              <text class="question-title">您每周进行运动的次数？</text>
            </view>
            <view class="options">
              <view
                v-for="(opt, idx) in BODY_Q5_OPTIONS"
                :key="idx"
                class="option-row"
                :class="{ selected: bodyAnswers.q5 === idx }"
                @click="bodyAnswers.q5 = idx"
              >
                <view class="radio"><view v-if="bodyAnswers.q5 === idx" class="radio-inner" /></view>
                <text class="option-text">{{ opt.text }}</text>
              </view>
            </view>
          </view>
          <!-- 题6 多选 -->
          <view class="question-card">
            <view class="question-head">
              <text class="question-num">第3题</text>
              <text class="question-title">您常做的运动类型？（可多选）</text>
            </view>
            <view class="options options-multi">
              <view
                v-for="(opt, idx) in BODY_Q6_OPTIONS"
                :key="opt.id"
                class="option-row"
                :class="{ selected: (bodyAnswers.q6 || []).includes(idx) }"
                @click="toggleBodyQ6(idx)"
              >
                <view class="checkbox">
                  <view v-if="(bodyAnswers.q6 || []).includes(idx)" class="checkbox-inner">✓</view>
                </view>
                <text class="option-text">{{ opt.text }}（{{ opt.intensity }}）</text>
              </view>
            </view>
          </view>
          <!-- 题7-12 单选 -->
          <view class="question-card">
            <view class="question-head">
              <text class="question-num">第4题</text>
              <text class="question-title">您每次低强度运动大约持续多久？</text>
            </view>
            <view class="options">
              <view
                v-for="(opt, idx) in BODY_Q7_OPTIONS"
                :key="idx"
                class="option-row"
                :class="{ selected: bodyAnswers.q7 === idx }"
                @click="bodyAnswers.q7 = idx"
              >
                <view class="radio"><view v-if="bodyAnswers.q7 === idx" class="radio-inner" /></view>
                <text class="option-text">{{ opt.text }}</text>
              </view>
            </view>
          </view>
          <view class="question-card">
            <view class="question-head">
              <text class="question-num">第5题</text>
              <text class="question-title">您每次中强度运动大约持续多久？</text>
            </view>
            <view class="options">
              <view
                v-for="(opt, idx) in BODY_Q8_OPTIONS"
                :key="idx"
                class="option-row"
                :class="{ selected: bodyAnswers.q8 === idx }"
                @click="bodyAnswers.q8 = idx"
              >
                <view class="radio"><view v-if="bodyAnswers.q8 === idx" class="radio-inner" /></view>
                <text class="option-text">{{ opt.text }}</text>
              </view>
            </view>
          </view>
          <view class="question-card">
            <view class="question-head">
              <text class="question-num">第6题</text>
              <text class="question-title">您每次高强度运动大约持续多久？</text>
            </view>
            <view class="options">
              <view
                v-for="(opt, idx) in BODY_Q9_OPTIONS"
                :key="idx"
                class="option-row"
                :class="{ selected: bodyAnswers.q9 === idx }"
                @click="bodyAnswers.q9 = idx"
              >
                <view class="radio"><view v-if="bodyAnswers.q9 === idx" class="radio-inner" /></view>
                <text class="option-text">{{ opt.text }}</text>
              </view>
            </view>
          </view>
          <view class="question-card">
            <view class="question-head">
              <text class="question-num">第7题</text>
              <text class="question-title">运动后您的身体感受通常是？</text>
            </view>
            <view class="options">
              <view
                v-for="(opt, idx) in BODY_Q10_OPTIONS"
                :key="idx"
                class="option-row"
                :class="{ selected: bodyAnswers.q10 === idx }"
                @click="bodyAnswers.q10 = idx"
              >
                <view class="radio"><view v-if="bodyAnswers.q10 === idx" class="radio-inner" /></view>
                <text class="option-text">{{ opt.text }}</text>
              </view>
            </view>
          </view>
          <view class="question-card">
            <view class="question-head">
              <text class="question-num">第8题</text>
              <text class="question-title">运动后次日您的身体状态通常是？</text>
            </view>
            <view class="options">
              <view
                v-for="(opt, idx) in BODY_Q11_OPTIONS"
                :key="idx"
                class="option-row"
                :class="{ selected: bodyAnswers.q11 === idx }"
                @click="bodyAnswers.q11 = idx"
              >
                <view class="radio"><view v-if="bodyAnswers.q11 === idx" class="radio-inner" /></view>
                <text class="option-text">{{ opt.text }}</text>
              </view>
            </view>
          </view>
          <view class="question-card">
            <view class="question-head">
              <text class="question-num">第9题</text>
              <text class="question-title">您的关节健康状况？</text>
            </view>
            <view class="options">
              <view
                v-for="(opt, idx) in BODY_Q12_OPTIONS"
                :key="idx"
                class="option-row"
                :class="{ selected: bodyAnswers.q12 === idx }"
                @click="bodyAnswers.q12 = idx"
              >
                <view class="radio"><view v-if="bodyAnswers.q12 === idx" class="radio-inner" /></view>
                <text class="option-text">{{ opt.text }}</text>
              </view>
            </view>
          </view>
          <!-- 题13 14 多选 -->
          <view class="question-card">
            <view class="question-head">
              <text class="question-num">第10题</text>
              <text class="question-title">长期困扰（可多选）</text>
            </view>
            <view class="options options-multi">
              <view
                v-for="(opt, idx) in BODY_Q13_OPTIONS"
                :key="opt.id"
                class="option-row"
                :class="{ selected: (bodyAnswers.q13 || []).includes(idx) }"
                @click="toggleBodyQ13(idx)"
              >
                <view class="checkbox">
                  <view v-if="(bodyAnswers.q13 || []).includes(idx)" class="checkbox-inner">✓</view>
                </view>
                <text class="option-text">{{ opt.text }}</text>
              </view>
            </view>
          </view>
          <view class="question-card">
            <view class="question-head">
              <text class="question-num">第11题</text>
              <text class="question-title">中式运动核心需求（可多选）</text>
            </view>
            <view class="options options-multi">
              <view
                v-for="(opt, idx) in BODY_Q14_OPTIONS"
                :key="opt.id"
                class="option-row"
                :class="{ selected: (bodyAnswers.q14 || []).includes(idx) }"
                @click="toggleBodyQ14(idx)"
              >
                <view class="checkbox">
                  <view v-if="(bodyAnswers.q14 || []).includes(idx)" class="checkbox-inner">✓</view>
                </view>
                <text class="option-text">{{ opt.text }}</text>
              </view>
            </view>
          </view>
          <!-- 题15-19 四档 -->
          <view class="question-card">
            <view class="question-head">
              <text class="question-num">第12题</text>
              <text class="question-title">{{ BODY_Q15_TITLE }}</text>
            </view>
            <view class="options">
              <view
                v-for="(opt, idx) in BODY_Q15_19_OPTIONS"
                :key="idx"
                class="option-row"
                :class="{ selected: bodyAnswers.q15 === idx }"
                @click="bodyAnswers.q15 = idx"
              >
                <view class="radio"><view v-if="bodyAnswers.q15 === idx" class="radio-inner" /></view>
                <text class="option-text">{{ opt.text }}</text>
              </view>
            </view>
          </view>
          <view class="question-card">
            <view class="question-head">
              <text class="question-num">第13题</text>
              <text class="question-title">{{ BODY_Q16_TITLE }}</text>
            </view>
            <view class="options">
              <view
                v-for="(opt, idx) in BODY_Q15_19_OPTIONS"
                :key="idx"
                class="option-row"
                :class="{ selected: bodyAnswers.q16 === idx }"
                @click="bodyAnswers.q16 = idx"
              >
                <view class="radio"><view v-if="bodyAnswers.q16 === idx" class="radio-inner" /></view>
                <text class="option-text">{{ opt.text }}</text>
              </view>
            </view>
          </view>
          <view class="question-card">
            <view class="question-head">
              <text class="question-num">第14题</text>
              <text class="question-title">{{ BODY_Q17_TITLE }}</text>
            </view>
            <view class="options">
              <view
                v-for="(opt, idx) in BODY_Q15_19_OPTIONS"
                :key="idx"
                class="option-row"
                :class="{ selected: bodyAnswers.q17 === idx }"
                @click="bodyAnswers.q17 = idx"
              >
                <view class="radio"><view v-if="bodyAnswers.q17 === idx" class="radio-inner" /></view>
                <text class="option-text">{{ opt.text }}</text>
              </view>
            </view>
          </view>
          <view class="question-card">
            <view class="question-head">
              <text class="question-num">第15题</text>
              <text class="question-title">{{ BODY_Q18_TITLE }}</text>
            </view>
            <view class="options">
              <view
                v-for="(opt, idx) in BODY_Q15_19_OPTIONS"
                :key="idx"
                class="option-row"
                :class="{ selected: bodyAnswers.q18 === idx }"
                @click="bodyAnswers.q18 = idx"
              >
                <view class="radio"><view v-if="bodyAnswers.q18 === idx" class="radio-inner" /></view>
                <text class="option-text">{{ opt.text }}</text>
              </view>
            </view>
          </view>
          <view class="question-card">
            <view class="question-head">
              <text class="question-num">第16题</text>
              <text class="question-title">{{ BODY_Q19_TITLE }}</text>
            </view>
            <view class="options">
              <view
                v-for="(opt, idx) in BODY_Q15_19_OPTIONS"
                :key="idx"
                class="option-row"
                :class="{ selected: bodyAnswers.q19 === idx }"
                @click="bodyAnswers.q19 = idx"
              >
                <view class="radio"><view v-if="bodyAnswers.q19 === idx" class="radio-inner" /></view>
                <text class="option-text">{{ opt.text }}</text>
              </view>
            </view>
          </view>
          <view class="nav-actions" style="margin-bottom: 80rpx;">
            <button class="btn btn-primary" :disabled="!canSubmitBodyTest" @click="submitBodyTest">
              提交身体测试
            </button>
          </view>
        </scroll-view>
      </template>
      <template v-else>
        <view class="result">
          <text class="result-title">身体测试结果</text>
          <view class="result-card">
            <text class="result-type">运动表现</text>
            <text class="result-summary">总分（第1-9题）：{{ bodyResult.score4_12 }}</text>
            <text class="result-guide">{{ bodyResult.evaluationText }}</text>
            <text v-if="bodyResult.overtrainingWarning" class="result-guide hint">
              {{ OVEREXERCISE_REMINDER_TEXT }}
            </text>
          </view>
          <view v-if="bodyResult.exerciseMethods && bodyResult.exerciseMethods.length" class="result-card">
            <text class="result-type">为您推荐</text>
            <text class="result-summary">{{ bodyResult.exerciseMethods.join('、') }}</text>
          </view>
          <view class="result-actions">
            <button class="btn btn-primary" @click="goProfile">{{ assessmentCopy.viewProfile }}</button>
            <button class="btn btn-outline result-btn" @click="goHome">{{ assessmentCopy.returnHome }}</button>
          </view>
        </view>
      </template>
    </template>

    <!-- 弹窗：进入 Step3 前根据 profile.derived 提示（主操作在右，符合习惯） -->
    <view v-if="modalVisible" class="modal-mask" @click.self="modalCancel">
      <view class="modal-box" @click.stop>
        <text class="modal-title">{{ modalTitle }}</text>
        <text class="modal-desc">{{ modalDesc }}</text>
        <view class="modal-actions">
          <button class="btn btn-outline modal-btn" @click="modalCancel">{{ assessmentCopy.modalCancel }}</button>
          <button class="btn btn-primary modal-btn" @click="modalConfirm">{{ assessmentCopy.modalConfirm }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  CONSTITUTION_QUESTIONS,
  BASIC_Q1_OPTIONS,
  BASIC_Q2_OPTIONS,
  BASIC_Q3_OPTIONS,
  BASIC_OCCUPATION_OPTIONS,
  BODY_Q4_OPTIONS,
  BODY_Q5_OPTIONS,
  BODY_Q6_OPTIONS,
  BODY_Q7_OPTIONS,
  BODY_Q8_OPTIONS,
  BODY_Q9_OPTIONS,
  BODY_Q10_OPTIONS,
  BODY_Q11_OPTIONS,
  BODY_Q12_OPTIONS,
  BODY_Q13_OPTIONS,
  BODY_Q14_OPTIONS,
  BODY_Q15_19_OPTIONS,
  BODY_Q15_TITLE,
  BODY_Q16_TITLE,
  BODY_Q17_TITLE,
  BODY_Q18_TITLE,
  BODY_Q19_TITLE,
} from '@/lib/assessment-data'
import {
  saveProfile,
  getProfile,
  appendAssessmentHistory,
  updateOrAppendBodyTestHistory,
  newAssessmentId,
  computeConstitutionScores,
  computeConvertedScores,
  getConstitutionDetermination,
  CONSTITUTION_ENTRY_COUNTS,
  type BasicInfoBlock,
  type BodyTestBlock,
} from '@/lib/profile-utils'
import {
  computeBodyTestScoring,
  getPracticeMethodsTriggered,
  OVEREXERCISE_REMINDER_TEXT,
  type BodyTestAnswersInput,
} from '@/lib/body-test-scoring'
import { assessmentCopy } from '@/lib/assessment-copy'

type StepMode = '' | 'basic_info_only' | 'constitution_only' | 'body_test_only'

const currentStep = ref<1 | 2 | 3>(1)
const mode = ref<StepMode>('')
const showStepBar = computed(() => !mode.value)

const step1Done = ref(false)
const step2Done = ref(false)

/** Step1 表单 */
const basicInfo = ref<{
  specialConditions: string[]
  ageRange?: string
  gender?: string
  occupation?: string
}>({ specialConditions: [] })

/** Step3 表单（题4-19 为选项下标，q6/q13/q14 为多选下标数组） */
const bodyAnswers = ref<BodyTestAnswersInput>({})
const showBodyResult = ref(false)
const bodyResult = ref<{
  score4_12: number
  evaluationText: string
  overtrainingWarning: boolean
  exerciseMethods: string[]
}>({
  score4_12: 0,
  evaluationText: '',
  overtrainingWarning: false,
  exerciseMethods: [],
})

/** 弹窗：进入 Step3 前提示 */
const modalVisible = ref(false)
const modalTitle = ref('')
const modalDesc = ref('')
const pendingStep3 = ref(false)
const hasAnyProfile = ref(false)

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
/** 体质第37题限女性、第38题限男性；已选性别后不适用题目灰调不填 */
const constitutionGender = computed(
  () => basicInfo.value.gender || getProfile()?.basicInfo?.gender
)
const CONSTITUTION_FEMALE_ONLY_INDEX = 36
const CONSTITUTION_MALE_ONLY_INDEX = 37
function isConstitutionQuestionDisabled(index: number): boolean {
  const g = constitutionGender.value
  if (!g) return false
  return (
    (index === CONSTITUTION_FEMALE_ONLY_INDEX && g !== 'female') ||
    (index === CONSTITUTION_MALE_ONLY_INDEX && g !== 'male')
  )
}
const canSubmitConstitution = computed(() => {
  return constitutionAnswers.value.every((a, i) => a !== null || isConstitutionQuestionDisabled(i))
})

/** Step1：题1 至少选一项（可仅选“没有上述情况”），题2、题3 必选 */
const canSubmitBasicInfo = computed(() => {
  const q1 = basicInfo.value.specialConditions
  const hasQ1 = Array.isArray(q1) && q1.length > 0
  return hasQ1 && !!basicInfo.value.ageRange && !!basicInfo.value.gender
})

function basicQ1Selected(id: string): boolean {
  return basicInfo.value.specialConditions.includes(id)
}

function toggleBasicQ1(id: string) {
  const arr = [...basicInfo.value.specialConditions]
  const i = arr.indexOf(id)
  if (i >= 0) arr.splice(i, 1)
  else arr.push(id)
  if (id === 'special_none') {
    basicInfo.value.specialConditions = ['special_none']
    return
  }
  basicInfo.value.specialConditions = arr.filter((x) => x !== 'special_none')
}

function submitBasicInfo() {
  if (!canSubmitBasicInfo.value) return
  const conditions = basicInfo.value.specialConditions
  const specialSituationSelected =
    conditions.length > 0 && !(conditions.length === 1 && conditions[0] === 'special_none')
  const ageRange = basicInfo.value.ageRange!
  const minorOrElderNeedCompanion = ageRange === '<12' || ageRange === '>70'
  const basicInfoBlock: BasicInfoBlock = {
    specialConditions: conditions,
    ageRange,
    gender: basicInfo.value.gender,
    occupation: basicInfo.value.occupation,
    updatedAt: Date.now(),
  }
  saveProfile({
    basicInfo: basicInfoBlock,
    derived: { specialSituationSelected, minorOrElderNeedCompanion },
  })
  appendAssessmentHistory({
    id: newAssessmentId(),
    timestamp: Date.now(),
    type: 'basic_info',
    payload: { basicInfo: basicInfoBlock },
    logicVersion: 'v1.0',
  })
  step1Done.value = true
  hasAnyProfile.value = true
  if (mode.value === 'basic_info_only') {
    uni.showToast({ title: '保存成功', icon: 'success' })
    return
  }
  currentStep.value = 2
}

/** 根据基本信息中勾选的「特殊情况」生成身体测试不建议的提示（让用户记得是哪些选项触发） */
function getSpecialSituationModalDesc(profile: ReturnType<typeof getProfile>): string {
  const ids = profile?.basicInfo?.specialConditions || []
  const labels = ids
    .filter((id) => id !== 'special_none')
    .map((id) => BASIC_Q1_OPTIONS.find((o) => o.id === id)?.text)
    .filter(Boolean) as string[]
  if (labels.length === 0) return assessmentCopy.bodyTestDefault
  const part = labels.join('」「')
  return `${assessmentCopy.bodyTestReasonSpecial(part)}，${assessmentCopy.bodyTestAdviceBase}${assessmentCopy.bodyTestAdviceEnd}`
}

/** 根据年龄区间生成家人陪同提示（让用户记得是哪个年龄段触发） */
function getAgeCompanionModalDesc(profile: ReturnType<typeof getProfile>): string {
  const ageRange = profile?.basicInfo?.ageRange
  if (!ageRange) return assessmentCopy.bodyTestAgeCompanionNoRange
  const opt = BASIC_Q2_OPTIONS.find((o) => o.value === ageRange)
  const label = opt?.text || ageRange
  return assessmentCopy.bodyTestAgeCompanionWithRange(label)
}

/** 同时存在「特殊情况」与「年龄陪同」时，合并为一条提示 */
function getBodyTestModalDesc(profile: ReturnType<typeof getProfile>): string {
  const hasSpecial = profile?.derived?.specialSituationSelected
  const hasAge = profile?.derived?.minorOrElderNeedCompanion
  const parts: string[] = []
  if (hasSpecial) {
    const ids = profile?.basicInfo?.specialConditions || []
    const labels = ids
      .filter((id) => id !== 'special_none')
      .map((id) => BASIC_Q1_OPTIONS.find((o) => o.id === id)?.text)
      .filter(Boolean) as string[]
    if (labels.length) parts.push(assessmentCopy.bodyTestReasonSpecial(labels.join('」「')))
  }
  if (hasAge && profile?.basicInfo?.ageRange) {
    const opt = BASIC_Q2_OPTIONS.find((o) => o.value === profile.basicInfo!.ageRange)
    const label = opt?.text || profile.basicInfo!.ageRange
    parts.push(assessmentCopy.bodyTestReasonAge(label))
  }
  if (parts.length === 0) return assessmentCopy.bodyTestDefault
  const reason = parts.join('，')
  let advice = assessmentCopy.bodyTestAdviceBase
  if (hasAge) advice += assessmentCopy.bodyTestAdviceAge
  advice += assessmentCopy.bodyTestAdviceEnd
  return `${reason}。${advice}`
}

function goToStep(step: 1 | 2 | 3) {
  if (step === 1) {
    if (mode.value === 'constitution_only' || mode.value === 'body_test_only') return
    currentStep.value = 1
    return
  }
  if (step === 2) {
    if (mode.value === 'body_test_only') return
    if (!step1Done.value && !getProfile()?.basicInfo) return
    currentStep.value = 2
    return
  }
  if (step === 3) {
    if (mode.value === 'constitution_only') return
    if (!step2Done.value && !getProfile()?.constitution) return
    const profile = getProfile()
    const derived = profile?.derived
    if (derived?.specialSituationSelected || derived?.minorOrElderNeedCompanion) {
      modalTitle.value = assessmentCopy.modalTitle
      modalDesc.value = getBodyTestModalDesc(profile)
      pendingStep3.value = true
      modalVisible.value = true
      return
    }
    currentStep.value = 3
    modalVisible.value = false
    pendingStep3.value = false
  }
}

function modalConfirm() {
  modalVisible.value = false
  currentStep.value = 3
  pendingStep3.value = false
}

function modalCancel() {
  modalVisible.value = false
  pendingStep3.value = false
  if (mode.value === 'body_test_only') uni.navigateBack()
}

/** Step3 多选切换 */
function toggleBodyQ6(idx: number) {
  const arr = bodyAnswers.value.q6 || []
  const i = arr.indexOf(idx)
  if (i >= 0) bodyAnswers.value.q6 = arr.filter((_, j) => j !== i)
  else bodyAnswers.value.q6 = [...arr, idx]
}

function toggleBodyQ13(idx: number) {
  const arr = bodyAnswers.value.q13 || []
  const i = arr.indexOf(idx)
  if (i >= 0) bodyAnswers.value.q13 = arr.filter((_, j) => j !== i)
  else bodyAnswers.value.q13 = [...arr, idx]
}

function toggleBodyQ14(idx: number) {
  const arr = bodyAnswers.value.q14 || []
  const i = arr.indexOf(idx)
  if (i >= 0) bodyAnswers.value.q14 = arr.filter((_, j) => j !== i)
  else bodyAnswers.value.q14 = [...arr, idx]
}

/** Step3 必填：题4-12 有选即可（题13/14 可选） */
const canSubmitBodyTest = computed(() => {
  const a = bodyAnswers.value
  return (
    a.q4 !== undefined &&
    a.q5 !== undefined &&
    a.q7 !== undefined &&
    a.q8 !== undefined &&
    a.q9 !== undefined &&
    a.q10 !== undefined &&
    a.q11 !== undefined &&
    a.q12 !== undefined
  )
})

function submitBodyTest() {
  if (!canSubmitBodyTest.value) return
  const answers: BodyTestAnswersInput = { ...bodyAnswers.value }
  const scoring = computeBodyTestScoring(answers)
  const exerciseMethods = getPracticeMethodsTriggered(answers)
  const bodyTestBlock: BodyTestBlock = {
    q4: answers.q4,
    q5: answers.q5,
    q6: answers.q6,
    q7: answers.q7,
    q8: answers.q8,
    q9: answers.q9,
    q10: answers.q10,
    q11: answers.q11,
    q12: answers.q12,
    q13: answers.q13,
    q14: answers.q14,
    q15: answers.q15,
    q16: answers.q16,
    q17: answers.q17,
    q18: answers.q18,
    q19: answers.q19,
    score4_12: scoring.score4_12,
    evaluation: scoring.evaluationText,
    overtrainingWarning: scoring.overtrainingWarning,
    exerciseMethods,
    updatedAt: Date.now(),
  }
  saveProfile({ bodyTest: bodyTestBlock })
  if (mode.value === 'body_test_only') {
    updateOrAppendBodyTestHistory(bodyTestBlock)
  } else {
    appendAssessmentHistory({
      id: newAssessmentId(),
      timestamp: Date.now(),
      type: 'body_test',
      payload: { bodyTest: bodyTestBlock },
      logicVersion: 'v1.0',
    })
  }
  bodyResult.value = {
    score4_12: scoring.score4_12,
    evaluationText: scoring.evaluationText,
    overtrainingWarning: scoring.overtrainingWarning,
    exerciseMethods,
  }
  showBodyResult.value = true
}

onLoad((options: Record<string, string> | undefined) => {
  const m = (options?.mode || '') as StepMode
  const startStep = options?.startStep === '2' ? 2 : options?.startStep === '3' ? 3 : 1
  const profile = getProfile()

  if (m === 'basic_info_only' || m === 'constitution_only' || m === 'body_test_only') {
    mode.value = m
    if (m === 'basic_info_only') currentStep.value = 1
    else if (m === 'constitution_only') currentStep.value = 2
    else currentStep.value = 3
  } else {
    // 从档案「开始/继续测评」进来：新用户 step=1，老用户直接到未完成的第一步
    currentStep.value = startStep
    // 若直接进 Step3 且需要弹窗（特殊情况/年龄陪同），先停在 Step2 并弹出确认
    if (startStep === 3 && profile?.derived) {
      const d = profile.derived
      if (d.specialSituationSelected || d.minorOrElderNeedCompanion) {
        pendingStep3.value = true
        modalTitle.value = assessmentCopy.modalTitle
        modalDesc.value = getBodyTestModalDesc(profile)
        modalVisible.value = true
        currentStep.value = 2
      }
    }
  }

  // 从档案点「编辑」身体测试进入时，若当前有特殊情况/年龄陪同，也需弹窗
  if (m === 'body_test_only' && profile?.derived) {
    const d = profile.derived
    if (d.specialSituationSelected || d.minorOrElderNeedCompanion) {
      pendingStep3.value = true
      modalTitle.value = assessmentCopy.modalTitle
      modalDesc.value = getBodyTestModalDesc(profile)
      modalVisible.value = true
      currentStep.value = 2
    }
  }

  hasAnyProfile.value = !!(profile?.basicInfo || profile?.constitution || profile?.bodyTest)
  if (profile?.basicInfo) step1Done.value = true
  if (profile?.constitution) step2Done.value = true
  if (profile?.basicInfo) {
    basicInfo.value = {
      specialConditions: profile.basicInfo.specialConditions || [],
      ageRange: profile.basicInfo.ageRange,
      gender: profile.basicInfo.gender,
      occupation: profile.basicInfo.occupation,
    }
  }
  if (profile?.constitution && currentStep.value === 2) {
    const prev = profile.constitution.answers
    if (Array.isArray(prev) && prev.length === CONSTITUTION_QUESTIONS.length) {
      constitutionAnswers.value = prev.map((a) => (typeof a === 'number' ? a : null))
    }
  }
  if (profile?.bodyTest && currentStep.value === 3) {
    bodyAnswers.value = {
      q4: profile.bodyTest.q4,
      q5: profile.bodyTest.q5,
      q6: profile.bodyTest.q6,
      q7: profile.bodyTest.q7,
      q8: profile.bodyTest.q8,
      q9: profile.bodyTest.q9,
      q10: profile.bodyTest.q10,
      q11: profile.bodyTest.q11,
      q12: profile.bodyTest.q12,
      q13: profile.bodyTest.q13,
      q14: profile.bodyTest.q14,
      q15: profile.bodyTest.q15,
      q16: profile.bodyTest.q16,
      q17: profile.bodyTest.q17,
      q18: profile.bodyTest.q18,
      q19: profile.bodyTest.q19,
    }
  }
})

function goNext() {
  if (currentIndex.value < totalQuestions - 1) currentIndex.value++
}

function submitConstitution() {
  if (!canSubmitConstitution.value) return
  const raw = constitutionAnswers.value
  const indices = raw.map((a, i) => {
    if (a !== null) return a
    if (isConstitutionQuestionDisabled(i)) return 0
    return 0
  }) as number[]
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
  const constitutionBlock = {
    answers: indices,
    baseScores,
    actualScores,
    dimensionScores,
    dimensionConvertedScores: convertedScores,
    type: constitutionType,
    tendency: determination.tendency,
    pianpoYes: determination.pianpoYes,
    summary: determination.summary,
    updatedAt: timestamp,
  }
  appendAssessmentHistory({
    id: newAssessmentId(),
    timestamp,
    type: 'constitution',
    payload: { constitution: constitutionBlock },
    logicVersion: 'v1.0',
  })
  saveProfile({
    constitution: constitutionBlock,
  })
  resultDimensionScores.value = dimensionScores
  resultDimensionConvertedScores.value = convertedScores
  resultActualScores.value = actualScores
  resultBaseScores.value = baseScores
  resultConstitutionAnswers.value = indices
  resultDetermination.value = determination
  step2Done.value = true
  showResult.value = true
}

function goHome() {
  uni.reLaunch({ url: '/pages/index/index' })
}

function goProfile() {
  uni.switchTab({ url: '/pages/profile/profile' })
}

function goBodyTest() {
  showResult.value = false
  activeTab.value = 'body'
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 28rpx 32rpx 120rpx;
  background: #f4f6f4;
}

/* 步骤条 */
.step-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx 20rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(92, 124, 92, 0.04);
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  flex: 0 0 auto;
}

.step-num {
  width: 48rpx;
  height: 48rpx;
  line-height: 48rpx;
  text-align: center;
  font-size: 26rpx;
  font-weight: 600;
  border-radius: 50%;
  background: #e5e5ea;
  color: #8f8f94;
}

.step-item.active .step-num,
.step-item.done .step-num {
  background: #5c7c5c;
  color: #fff;
}

.step-label {
  font-size: 22rpx;
  color: #8f8f94;
}

.step-item.active .step-label {
  color: #5c7c5c;
  font-weight: 500;
}

.step-line {
  flex: 1;
  height: 4rpx;
  background: #e5e5ea;
  margin: 0 8rpx;
  border-radius: 2rpx;
}

.step-line.done {
  background: #5c7c5c;
}

/* 多选勾框（与单选样式统一） */
.checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #8f8f94;
  border-radius: 8rpx;
  margin-right: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.option-row.selected .checkbox {
  border-color: #5c7c5c;
  background: #e8f0e8;
}

.checkbox-inner {
  font-size: 24rpx;
  color: #5c7c5c;
  font-weight: 600;
}

.body-test-form {
  max-height: calc(100vh - 280rpx);
}

/* 弹窗 */
.modal-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.12);
}

.modal-title {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #2c2c2e;
  margin-bottom: 24rpx;
}

.modal-desc {
  display: block;
  font-size: 28rpx;
  color: #6b6b70;
  line-height: 1.6;
  margin-bottom: 40rpx;
}

.modal-actions {
  display: flex;
  gap: 24rpx;
}

.modal-actions .modal-btn {
  flex: 1;
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
  border-radius: 20rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(92, 124, 92, 0.04);
}

.question-head {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.question-skip-hint {
  padding: 20rpx 24rpx;
  background: #f0f0f0;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}

.question-skip-hint text {
  font-size: 26rpx;
  color: #8f8f94;
}

.option-row-disabled {
  opacity: 0.5;
  pointer-events: none;
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
  font-size: 38rpx;
  font-weight: 600;
  color: #2c2c2e;
  margin-bottom: 28rpx;
  letter-spacing: 0.5rpx;
}

.result-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 28rpx;
  box-shadow: 0 2rpx 16rpx rgba(92, 124, 92, 0.06);
}

.result-card-main {
  border: 1rpx solid rgba(92, 124, 92, 0.2);
}

.result-type {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #4a6b4a;
  margin-bottom: 16rpx;
}

.result-ref {
  display: block;
  font-size: 24rpx;
  color: #9ca89c;
  margin-top: 12rpx;
}

.result-guide {
  display: block;
  font-size: 28rpx;
  color: #6b6b70;
  line-height: 1.6;
}

.result-guide.hint {
  color: #8a9a8a;
  margin-top: 12rpx;
}

.result-summary {
  display: block;
  font-size: 30rpx;
  color: #2c2c2e;
  line-height: 1.5;
}

.criteria-wrap {
  background: rgba(244, 248, 244, 0.9);
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  margin-bottom: 28rpx;
  border: 1rpx solid rgba(92, 124, 92, 0.12);
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
