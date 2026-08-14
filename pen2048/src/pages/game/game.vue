<template>
  <div class="page">
    <!-- 顶栏（自绘按钮） -->
    <div class="topbar">
      <div class="tbtn" @click="backToMenu"><text class="tbtn-label">菜单</text></div>
      <div
        class="tbtn"
        :class="{ 'tbtn-active': mode === '4' }"
        @click="switchMode('4')"
      ><text class="tbtn-label" :class="{ 'tbtn-label-active': mode === '4' }">4×4</text></div>
      <div
        class="tbtn"
        :class="{ 'tbtn-active': mode === '5' }"
        @click="switchMode('5')"
      ><text class="tbtn-label" :class="{ 'tbtn-label-active': mode === '5' }">5×5</text></div>
      <div class="topbar-spacer" />
      <text class="topbar-score">得分 {{ activeGame.score }}</text>
      <text class="topbar-score">最佳 {{ best[mode] }}</text>
      <div class="tbtn" @click="restart"><text class="tbtn-label">重新开始</text></div>
      <div class="tbtn" @click="openSave"><text class="tbtn-label">存档</text></div>
      <div class="tbtn" @click="openHelp"><text class="tbtn-label">说明</text></div>
    </div>

    <!-- 主体 -->
    <div class="body">
      <!-- 棋盘区：滑动控制 -->
      <div class="board-area" @touchstart="onTouchStart" @touchend="onTouchEnd">
        <text v-if="overlay !== 'none'" class="board-status">{{ overlay === 'won' ? '达成 2048！' : '游戏结束' }}</text>
        <Board :grid="activeGame.grid" :size="activeGame.size" />
      </div>

      <!-- 右侧控制区：正常时方向键，结束/达成时操作面板 -->
      <div class="control-panel">
        <DPad v-if="overlay === 'none'" @move="doMove" />
        <div v-else class="end-panel">
          <div v-if="overlay === 'won'" class="btn" @click="continueGame"><text class="btn-label">继续挑战</text></div>
          <div class="btn" @click="restart"><text class="btn-label">再来一局</text></div>
          <div class="btn btn-plain" @click="backToMenu"><text class="btn-label-plain">回主界面</text></div>
        </div>
        <text class="control-hint">滑动棋盘或用方向键</text>
      </div>
    </div>
  </div>
</template>

<script>
import Board from '../../components/board.vue'
import DPad from '../../components/dpad.vue'
import { spawnTile, moveTiles, isGameOver, maxTile } from '../../utils/game.js'
import { games, best, selectedMode, setSelectedMode, freshGame, loadSave, saveGame } from '../../utils/state.js'

export default {
  name: 'game',
  components: {
    Board,
    DPad
  },
  data() {
    return {
      mode: selectedMode,
      games,
      best,
      overlay: 'none',
      touchX: 0,
      touchY: 0
    }
  },
  computed: {
    activeGame() {
      return this.games[this.mode]
    }
  },
  methods: {
    onShow() {
      console.log('[pen2048] game onShow mode=' + this.mode)
      loadSave().then(() => {
        // 恢复完成后对齐当前模式
        this.mode = selectedMode
      })
    },
    switchMode(m) {
      console.log('[pen2048] switchMode ' + m)
      if (this.mode !== m) {
        this.mode = m
        setSelectedMode(m)
        this.overlay = 'none'
        saveGame()
      }
    },
    maxTileOf(grid) {
      return maxTile(grid)
    },
    doMove(dir) {
      console.log('[pen2048] doMove ' + dir)
      try {
        this._doMove(dir)
      } catch (err) {
        console.log('[pen2048] doMove error: ' + (err && err.message ? err.message : err))
      }
    },
    _doMove(dir) {
      if (this.overlay !== 'none') {
        return
      }
      const game = this.activeGame
      const result = moveTiles(game.grid, dir)
      if (!result.moved) {
        return
      }
      let next = {
        size: game.size,
        grid: result.grid,
        score: game.score + result.gained,
        over: false,
        wonReached: game.wonReached
      }
      // 移动有效则生成新方块
      next.grid = spawnTile(next)

      if (isGameOver(next.grid)) {
        next.over = true
      }
      if (!next.wonReached && maxTile(next.grid) >= 2048) {
        next.wonReached = true
      }

      // 注意：falcon 运行时没有 this.$set，直接赋值即可（键在 data() 初始化时已存在）
      this.games[this.mode] = next

      // 更新最佳成绩
      if (next.score > this.best[this.mode]) {
        this.best[this.mode] = next.score
      }

      // 弹层
      if (next.over) {
        this.overlay = 'over'
      } else if (next.wonReached && this.overlay === 'none') {
        this.overlay = 'won'
      }

      // 存档（含最新最佳成绩）
      saveGame()
    },
    restart() {
      console.log('[pen2048] restart')
      this.games[this.mode] = freshGame(this.activeGame.size)
      this.overlay = 'none'
      saveGame()
    },
    continueGame() {
      console.log('[pen2048] continueGame')
      this.overlay = 'none'
      saveGame()
    },
    backToMenu() {
      console.log('[pen2048] backToMenu')
      this.$page.finish()
    },
    openHelp() {
      console.log('[pen2048] openHelp')
      $falcon.navTo('page')
    },
    openSave() {
      console.log('[pen2048] openSave')
      $falcon.navTo('save')
    },
    onTouchStart(e) {
      const t = touchPoint(e)
      if (t) {
        this.touchX = t.x
        this.touchY = t.y
      }
    },
    onTouchEnd(e) {
      const t = touchPoint(e)
      if (!t) {
        return
      }
      const dx = t.x - this.touchX
      const dy = t.y - this.touchY
      console.log('[pen2048] touchEnd dx=' + dx + ' dy=' + dy)
      if (Math.abs(dx) < 16 && Math.abs(dy) < 16) {
        return
      }
      if (Math.abs(dx) > Math.abs(dy)) {
        this.doMove(dx > 0 ? 'right' : 'left')
      } else {
        this.doMove(dy > 0 ? 'down' : 'up')
      }
    }
  }
}

/** 兼容多种触摸事件对象结构 */
function touchPoint(e) {
  if (!e) {
    return null
  }
  const t = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]) || e
  const x = t.clientX || t.pageX || t.screenX || t.x || 0
  const y = t.clientY || t.pageY || t.screenY || t.y || 0
  return { x, y }
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

.topbar {
  height: 40px;
  flex-direction: row;
  align-items: center;
  padding-left: 12px;
  padding-right: 12px;
}

.tbtn {
  height: 30px;
  padding-left: 12px;
  padding-right: 12px;
  border-radius: 8px;
  background-color: @empty;
  margin-right: 8px;
  justify-content: center;
  align-items: center;
}

.tbtn:active {
  opacity: 0.6;
}

.tbtn-active {
  background-color: @accent;
}

.tbtn-label {
  font-size: 14px;
  color: @text-dark;
}

.tbtn-label-active {
  color: @text-light;
}

.topbar-spacer {
  flex: 1;
}

.topbar-score {
  font-size: 15px;
  color: @text-dark;
  margin-right: 16px;
}

.body {
  flex: 1;
  flex-direction: row;
}

.board-area {
  flex: 1;
  justify-content: center;
  align-items: center;
}

.board-status {
  font-size: 18px;
  font-weight: bold;
  color: @accent;
  margin-bottom: 6px;
}

.control-panel {
  width: 250px;
  justify-content: center;
  align-items: center;
}

.control-hint {
  font-size: 12px;
  color: @text-dark;
  margin-top: 6px;
}

.end-panel {
  align-items: center;
  justify-content: center;
}

.btn {
  height: 44px;
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 10px;
  background-color: @accent;
  margin-top: 8px;
  justify-content: center;
  align-items: center;
}

.btn:active {
  opacity: 0.6;
}

.btn-label {
  font-size: 16px;
  font-weight: bold;
  color: @text-light;
}

.btn-plain {
  background-color: @empty;
}

.btn-label-plain {
  font-size: 16px;
  font-weight: bold;
  color: @text-dark;
}
</style>
