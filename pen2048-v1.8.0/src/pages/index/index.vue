<template>
  <div class="page">
    <!-- 标题 -->
    <div class="title-zone">
      <text class="title-main">2048</text>
      <text class="title-sub">3×3~6×6 自定义</text>
    </div>

    <!-- 模式选择卡片 -->
    <div class="cards-zone">
      <div
        v-for="s in sizes"
        :key="s"
        class="mode-card"
        :class="{ 'mode-card-selected': selected === s }"
        @click="select(s)"
      >
        <text class="card-mode" :class="{ 'card-mode-selected': selected === s }" @click="select(s)">{{ s }}×{{ s }}</text>
        <text class="card-best" @click="select(s)">最佳 {{ best[s] }}</text>
      </div>
    </div>

    <!-- 操作按钮（自绘 div 按钮，真机验证可用） -->
    <div class="action-zone">
      <div class="btn action-start" @click="start"><text class="btn-label">开始游戏</text></div>
      <div class="btn action-plain" @click="openSave"><text class="btn-label-plain">存档管理</text></div>
      <div class="btn action-plain" @click="openHelp"><text class="btn-label-plain">说明</text></div>
      <div class="btn action-plain" @click="exitApp"><text class="btn-label-plain">退出</text></div>
    </div>
  </div>
</template>

<script>
import { best as storeBest, selectedMode, setSelectedMode, loadSave, saveGame, SIZES } from '../../utils/state.js'
import { dbgLog } from '../../utils/storage.js'

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
      best: bs
    }
  },
  methods: {
    onShow() {
      dbgLog('index onShow')
      // 刷新最佳成绩显示（来自手动读档后的更新）
      for (const s of SIZES) {
        this.best[s] = storeBest[s]
      }
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
    openHelp() {
      dbgLog('openHelp')
      $falcon.navTo('page')
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
</style>
