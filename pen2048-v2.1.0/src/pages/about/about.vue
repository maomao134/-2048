<template>
  <div class="page" :class="dark ? 'page-d' : ''">
    <div class="topbar">
      <div class="back-btn" @click="goBack"><text class="back-label">返回</text></div>
      <text class="topbar-title" :class="dark ? 'topbar-title-d' : ''">关于</text>
    </div>
    <scroller scroll-y show-scrollbar="false" class="content">
      <!-- 应用卡片 -->
      <div class="app-card" :class="dark ? 'app-card-d' : ''">
        <text class="app-name" :class="dark ? 'app-name-d' : ''">2048</text>
        <text class="app-sub" :class="dark ? 'app-sub-d' : ''">3×3~6×6 自定义大小</text>

        <div class="info-row" :class="dark ? 'info-row-d' : ''">
          <text class="info-label" :class="dark ? 'info-label-d' : ''">版本</text>
          <text class="info-value" :class="dark ? 'info-value-d' : ''">v2.1.0</text>
        </div>
        <div class="info-row" :class="dark ? 'info-row-d' : ''">
          <text class="info-label" :class="dark ? 'info-label-d' : ''">原作</text>
          <text class="info-value" :class="dark ? 'info-value-d' : ''">GMM</text>
        </div>
        <div class="info-row" :class="dark ? 'info-row-d' : ''">
          <text class="info-label" :class="dark ? 'info-label-d' : ''">优化</text>
          <text class="info-value" :class="dark ? 'info-value-d' : ''">qq1122</text>
        </div>
        <div class="info-row" :class="dark ? 'info-row-d' : ''">
          <text class="info-label" :class="dark ? 'info-label-d' : ''">辅助AI</text>
          <div class="info-value-wrap">
            <text class="info-value" :class="dark ? 'info-value-d' : ''">deepseek-v4-flash</text>
            <text class="info-value" :class="dark ? 'info-value-d' : ''">deepseek-v4-pro</text>
          </div>
        </div>
      </div>

      <text class="copyright" :class="dark ? 'copyright-d' : ''">西伯利亚旋风黑土豆软件公司出品</text>
    </scroller>
  </div>
</template>

<script>
import { dbgLog, themeCache, loadTheme } from '../../utils/storage.js'

export default {
  name: 'about',
  data() {
    return {
      /* 深色模式（启动时同步读缓存，避免首帧闪烁；onShow 再刷新） */
      dark: themeCache === 'dark'
    }
  },
  methods: {
    onShow() {
      dbgLog('about onShow')
      loadTheme().then((t) => {
        this.dark = t === 'dark'
      })
    },
    goBack() {
      dbgLog('about goBack')
      this.$page.finish()
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../styles/colors.less';
@import '../../styles/bar.less';

.page {
  flex: 1;
  width: 100%;
  height: 100%;
  background-color: @bg;
}

.content {
  width: 100%;
  height: 80vh;
  align-items: center;
}

/* 应用信息卡片 */
.app-card {
  width: 80vw;
  align-self: center;
  border-radius: 4vh;
  border-width: 2px;
  border-style: solid;
  border-color: @board;
  background-color: @empty;
  align-items: center;
  margin-top: 4vh;
  padding-top: 4vh;
  padding-bottom: 4vh;
}

.app-name {
  font-size: 22vh;
  font-weight: bold;
  color: @text-dark;
}

.app-sub {
  font-size: 8vh;
  color: @accent;
  margin-top: 1vh;
  margin-bottom: 6vh;
}

/* 信息行：左标签右值 */
.info-row {
  width: 68vw;
  flex-direction: row;
  align-items: center;
  height: 14vh;
  margin-top: 2vh;
  border-radius: 3vh;
  background-color: @bg;
  padding-left: 4vw;
  padding-right: 4vw;
}

.info-label {
  font-size: 10vh;
  font-weight: bold;
  color: @text-dark;
  width: 20vw;
}

.info-value-wrap {
  flex: 1;
  align-items: flex-end;
}

.info-value {
  font-size: 10vh;
  color: @text-dark;
  text-align: right;
}

.copyright {
  align-self: center;
  font-size: 6vh;
  line-height: auto;
  color: @accent;
  margin-top: 5vh;
  margin-bottom: 4vh;
}

/* ===== 深色模式（-d 变体放末尾，覆盖浅色定义） ===== */
.page-d {
  background-color: @bg-d;
}

.topbar-title-d {
  color: @ink-d;
}

.app-card-d {
  border-color: @board-d;
  background-color: @empty-d;
}

.app-name-d {
  color: @ink-d;
}

.app-sub-d {
  color: @accent-d;
}

.info-row-d {
  background-color: @bg-d;
}

.info-label-d {
  color: @ink-d;
}

.info-value-d {
  color: @sub-d;
}

.copyright-d {
  color: @accent-d;
}
</style>
