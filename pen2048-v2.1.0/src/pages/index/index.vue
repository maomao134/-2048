<template>
  <div class="page" :class="dark ? 'page-d' : ''">
    <!-- 标题（深色模式开关已移到设置页） -->
    <div class="title-zone">
      <text class="title-main" :class="dark ? 'title-main-d' : ''">2048</text>
      <text class="title-sub" :class="dark ? 'title-sub-d' : ''">3×3~6×6 自定义</text>
    </div>

    <!-- 模式选择卡片 -->
    <div class="cards-zone">
      <div
        v-for="s in sizes"
        :key="s"
        class="mode-card"
        :class="(selected === s ? 'mode-card-selected ' : 'mode-card ') + (dark ? (selected === s ? 'mode-card-selected-d ' : 'mode-card-d ') : '')"
        @click="select(s)"
      >
        <text class="card-mode" :class="(selected === s ? 'card-mode-selected ' : 'card-mode ') + (dark ? (selected === s ? 'card-mode-selected-d ' : 'card-mode-d ') : '')" @click="select(s)">{{ s }}×{{ s }}</text>
        <text class="card-best" :class="dark ? 'card-best-d' : ''" @click="select(s)">最佳 {{ best[s] }}</text>
      </div>
    </div>

    <!-- 操作按钮（自绘 div 按钮，真机验证可用） -->
    <div class="action-zone">
      <div class="btn action-start" @click="start"><text class="btn-label">开始游戏</text></div>
      <div class="btn action-plain" :class="dark ? 'btn-plain-d' : ''" @click="openSave"><text class="btn-label-plain" :class="dark ? 'btn-label-plain-d' : ''">存档管理</text></div>
      <div class="btn action-plain" :class="dark ? 'btn-plain-d' : ''" @click="openSettings"><text class="btn-label-plain" :class="dark ? 'btn-label-plain-d' : ''">设置</text></div>
      <div class="btn action-plain" :class="dark ? 'btn-plain-d' : ''" @click="exitApp"><text class="btn-label-plain" :class="dark ? 'btn-label-plain-d' : ''">退出</text></div>
    </div>
  </div>
</template>

<script>
import { best as storeBest, selectedMode, setSelectedMode, loadSave, saveGame, SIZES } from '../../utils/state.js'
import { dbgLog, themeCache, loadTheme } from '../../utils/storage.js'

export default {
  name: 'index',
  data() {
    // 只持副本，不与游戏页共享响应式对象
    const bs = {}
    for (const s of SIZES) {
      bs[s] = storeBest[s]
    }
    return {
      // 模块级数组也要拷贝：falcon Vue 对跨实例共享的已 observe 对象会失效
      sizes: SIZES.slice(),
      selected: selectedMode,
      best: bs,
      /* 深色模式（启动时同步读缓存，避免首帧闪烁；onShow 再刷新） */
      dark: themeCache === 'dark'
    }
  },
  methods: {
    onShow() {
      dbgLog('index onShow')
      loadTheme().then((t) => {
        this.dark = t === 'dark'
      })
      loadSave().then(() => {
        // 恢复完成后刷新选中态与最佳成绩显示
        this.selected = selectedMode
        for (const s of SIZES) {
          this.best[s] = storeBest[s]
        }
      })
    },
    select(m) {
      dbgLog('select ' + m)
      this.selected = m
      setSelectedMode(m)
      saveGame()
    },
    start() {
      dbgLog('start mode=' + this.selected)
      setSelectedMode(this.selected)
      // 注意：不带 options 参数（带 options 的 navTo 在真机上不可用）
      $falcon.navTo('game')
    },
    openSettings() {
      dbgLog('openSettings')
      $falcon.navTo('settings')
    },
    openSave() {
      dbgLog('openSave')
      $falcon.navTo('save')
    },
    exitApp() {
      dbgLog('exitApp')
      this.$app.finish()
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../styles/colors.less';

.page {
  flex: 1;
  width: 100%;
  height: 100%;
  background-color: @bg;
}

.title-zone {
  height: 30vh;
  flex-direction: row;
  align-items: flex-end;
  padding-left: 5vw;
}

.title-main {
  font-size: 25vh;
  font-weight: bold;
  color: @text-dark;
}

.title-sub {
  font-size: 10vh;
  color: @accent;
  margin-left: 5vw;
}

.cards-zone {
  height: 45vh;
  flex-direction: row;
  align-items: center;
  padding-left: 5vw;
  padding-right: 5vw;
}

.mode-card {
  width: 20vw;
  height: 40vh;
  border-radius: 4vh;
  border-width: 2px;
  border-style: solid;
  border-color: @board;
  background-color: @empty;
  margin-right: 2vw;
  align-items: center;
  justify-content: center;
}

.mode-card-selected {
  border-color: @accent;
  background-color: #eee4da;
}

.mode-card:active {
  opacity: 0.7;
}

.card-mode {
  font-size: 18vh;
  color: @text-dark;
}

.card-mode-selected {
  color: @accent;
}

.card-best {
  font-size: 10vh;
  color: @text-dark;
}

.action-zone {
  height: 20vh;
  flex-direction: row;
  align-items: center;
  padding-left: 5vw;
  margin-top: 2vh;
}

.btn {
  height: 20vh;
  padding-left: 5vw;
  padding-right: 5vw;
  border-radius: 3vh;
  background-color: @accent;
  margin-right: 5vw;
  justify-content: center;
  align-items: center;
}

.btn:active {
  opacity: 0.6;
}

.btn-label {
  font-size: 10vh;
  font-weight: bold;
  color: @text-light;
}

.action-plain {
  background-color: @empty;
}

.btn-label-plain {
  font-size: 10vh;
  font-weight: bold;
  color: @text-dark;
}

/* ===== 深色模式（-d 变体放末尾，覆盖浅色定义） ===== */

.page-d {
  background-color: @bg-d;
}

.title-main-d {
  color: @ink-d;
}

.title-sub-d {
  color: @accent-d;
}

.mode-card-d {
  border-color: @board-d;
  background-color: @empty-d;
}

.mode-card-selected-d {
  border-color: @accent-d;
  background-color: @empty-d;
}

.card-mode-d {
  color: @ink-d;
}

.card-mode-selected-d {
  color: @accent-d;
}

.card-best-d {
  color: @sub-d;
}

.btn-plain-d {
  background-color: @empty-d;
}

.btn-label-plain-d {
  color: @ink-d;
}
</style>
