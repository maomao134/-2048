<template>
  <div class="page">
    <!-- 标题 -->
    <div class="title-zone">
      <text class="title-main">2048</text>
      <text class="title-sub">双模式</text>
    </div>

    <!-- 模式选择卡片 -->
    <div class="cards-zone">
      <div
        class="mode-card"
        :class="{ 'mode-card-selected': selected === '4' }"
        @click="select('4')"
      >
        <text class="card-mode" :class="{ 'card-mode-selected': selected === '4' }" @click="select('4')">4×4</text>
        <text class="card-best" @click="select('4')">最佳 {{ best['4'] }}</text>
      </div>
      <div
        class="mode-card"
        :class="{ 'mode-card-selected': selected === '5' }"
        @click="select('5')"
      >
        <text class="card-mode" :class="{ 'card-mode-selected': selected === '5' }" @click="select('5')">5×5</text>
        <text class="card-best" @click="select('5')">最佳 {{ best['5'] }}</text>
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
import { best, selectedMode, setSelectedMode, loadSave, saveGame } from '../../utils/state.js'

export default {
  name: 'index',
  data() {
    return {
      selected: selectedMode,
      best
    }
  },
  methods: {
    onShow() {
      console.log('[pen2048] index onShow')
      loadSave().then(() => {
        // 恢复完成后刷新选中态与最佳成绩显示
        this.selected = selectedMode
      })
    },
    select(m) {
      console.log('[pen2048] select ' + m)
      this.selected = m
      setSelectedMode(m)
      saveGame()
    },
    start() {
      console.log('[pen2048] start mode=' + this.selected)
      setSelectedMode(this.selected)
      // 注意：不带 options 参数（带 options 的 navTo 在真机上不可用）
      $falcon.navTo('game')
    },
    openHelp() {
      console.log('[pen2048] openHelp')
      $falcon.navTo('page')
    },
    openSave() {
      console.log('[pen2048] openSave')
      $falcon.navTo('save')
    },
    exitApp() {
      console.log('[pen2048] exitApp')
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
  height: 76px;
  flex-direction: row;
  align-items: flex-end;
  padding-left: 24px;
}

.title-main {
  font-size: 44px;
  font-weight: bold;
  color: @text-dark;
}

.title-sub {
  font-size: 20px;
  color: @accent;
  margin-left: 12px;
  margin-bottom: 8px;
}

.cards-zone {
  height: 104px;
  flex-direction: row;
  align-items: center;
  padding-left: 24px;
  padding-right: 24px;
}

.mode-card {
  width: 180px;
  height: 84px;
  border-radius: 12px;
  border-width: 3px;
  border-style: solid;
  border-color: @board;
  background-color: @empty;
  margin-right: 18px;
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
  font-size: 26px;
  font-weight: bold;
  color: @text-dark;
}

.card-mode-selected {
  color: @accent;
}

.card-best {
  font-size: 14px;
  color: @text-dark;
  margin-top: 2px;
}

.action-zone {
  height: 60px;
  flex-direction: row;
  align-items: center;
  padding-left: 24px;
}

.btn {
  height: 44px;
  padding-left: 22px;
  padding-right: 22px;
  border-radius: 10px;
  background-color: @accent;
  margin-right: 14px;
  justify-content: center;
  align-items: center;
}

.btn:active {
  opacity: 0.6;
}

.btn-label {
  font-size: 17px;
  font-weight: bold;
  color: @text-light;
}

.action-plain {
  background-color: @empty;
}

.btn-label-plain {
  font-size: 17px;
  font-weight: bold;
  color: @text-dark;
}
</style>
