<template>
  <div class="page" :class="dark ? 'page-d' : ''">
    <div class="topbar">
      <div class="back-btn" @click="goBack"><text class="back-label">返回</text></div>
      <text class="topbar-title" :class="dark ? 'topbar-title-d' : ''">设置</text>
    </div>
    <scroller scroll-y show-scrollbar="false" class="content">
      <!-- 外观：深色模式开关（深色模式下按钮随主题变深色） -->
      <text class="head" :class="dark ? 'head-d' : ''">外观</text>
      <div class="opt-row" :class="dark ? 'opt-row-d' : ''" @click="toggleDark">
        <text class="opt-name" :class="dark ? 'opt-name-d' : ''">深色模式</text>
        <text class="opt-state" :class="dark ? 'opt-state-d' : ''">{{ dark ? '开' : '关' }}</text>
      </div>

      <!-- 其他：说明 / 关于入口（点击进入对应页面） -->
      <text class="head" :class="dark ? 'head-d' : ''">其他</text>
      <div class="opt-row" :class="dark ? 'opt-row-d' : ''" @click="openHelp">
        <text class="opt-name" :class="dark ? 'opt-name-d' : ''">说明</text>
        <text class="opt-state" :class="dark ? 'opt-state-d' : ''">›</text>
      </div>
      <div class="opt-row" :class="dark ? 'opt-row-d' : ''" @click="openAbout">
        <text class="opt-name" :class="dark ? 'opt-name-d' : ''">关于</text>
        <text class="opt-state" :class="dark ? 'opt-state-d' : ''">›</text>
      </div>
    </scroller>
  </div>
</template>

<script>
import { dbgLog, themeCache, loadTheme, saveTheme } from '../../utils/storage.js'

export default {
  name: 'settings',
  data() {
    return {
      /* 深色模式（启动时同步读缓存，避免首帧闪烁；onShow 再刷新） */
      dark: themeCache === 'dark'
    }
  },
  methods: {
    onShow() {
      dbgLog('settings onShow')
      loadTheme().then((t) => {
        this.dark = t === 'dark'
      })
    },
    goBack() {
      dbgLog('settings goBack')
      this.$page.finish()
    },
    toggleDark() {
      const next = !this.dark
      this.dark = next
      saveTheme(next ? 'dark' : 'light')
      dbgLog('settings toggleDark ' + (next ? 'dark' : 'light'))
    },
    openHelp() {
      dbgLog('settings openHelp')
      $falcon.navTo('page')
    },
    openAbout() {
      dbgLog('settings openAbout')
      $falcon.navTo('about')
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
  padding-left: 2vh;
  padding-right: 2vh;
}

/* 设置选项行（深色开关 / 说明 / 关于入口）：全宽卡片，左名字右状态 */
.opt-row {
  flex-direction: row;
  align-items: center;
  margin-left: 3vw;
  margin-right: 3vw;
  height: 16vh;
  border-radius: 3vh;
  background-color: #ffffff;
  border-width: 2px;
  border-style: solid;
  border-color: @board;
  padding-left: 5vw;
  padding-right: 5vw;
}

.opt-row:active {
  opacity: 0.6;
}

.opt-name {
  flex: 1;
  font-size: 11vh;
  color: @text-dark;
}

.opt-state {
  font-size: 11vh;
  color: @accent;
}

/* 分组标题：左对齐小字强调色 */
.head {
  align-self: flex-start;
  margin-left: 5vw;
  font-size: 9vh;
  color: @accent;
  margin-top: 3vh;
  margin-bottom: 1vh;
}

/* ===== 深色模式（-d 变体放末尾，覆盖浅色定义） ===== */
.page-d {
  background-color: @bg-d;
}

.topbar-title-d {
  color: @ink-d;
}

/* 深色模式下按钮随主题变深色（深色底 + 亮色字） */
.opt-row-d {
  background-color: @empty-d;
  border-color: @board-d;
}

.opt-name-d {
  color: @ink-d;
}

.opt-state-d {
  color: @accent-d;
}

.head-d {
  color: @accent-d;
}
</style>
