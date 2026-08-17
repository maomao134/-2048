<template>
  <div class="page">
    <!-- 顶栏（自绘按钮） -->
    <div class="topbar">
      <div
        v-for="s in sizes"
        :key="s"
        class="tbtn"
        :class="{ 'tbtn-active': mode === s }"
        @click="switchMode(s)"
      ><text class="tbtn-label" :class="{ 'tbtn-label-active': mode === s }">{{ s }}×{{ s }}</text></div>
      <div class="topbar-spacer" />
      <text class="topbar-score">得分 {{ activeGame.score }}</text>
      <text class="topbar-score">最佳 {{ best[mode] }}</text>
      <!-- 作弊开关框：默认绿✓（未开启），开启后红× -->
      <div class="tbtn cheat-toggle" @click="toggleCheat">
        <text class="tbtn-label">作弊</text>
        <div class="cheat-box" :class="activeGame.cheat ? 'cheat-box-x' : 'cheat-box-ok'">
          <text class="cheat-mark" :class="activeGame.cheat ? 'cheat-mark-x' : 'cheat-mark-ok'">{{ activeGame.cheat ? ' ' : ' ' }}</text>
        </div>
      </div>
    </div>

    <!-- 主体 -->
    <div class="body">
      <!-- 棋盘区：滑动控制，作弊时点格子选中 -->
      <div class="board-area" @touchstart="onTouchStart" @touchend="onTouchEnd">
        <Board :grid="activeGame.grid" :size="activeGame.size" :sel="activeGame.cheat ? selCell : null" @celltap="onCellTap" />
      </div>

      <!-- 右侧控制区：作弊时改值面板，正常时方向键，结束/达成时操作面板 -->
      <div class="control-panel">
        <div v-if="activeGame.cheat" class="cheat-panel">
          <text class="cheat-sel">{{ selText }}</text>
          <div v-for="(row, ri) in valRows" :key="ri" class="val-row">
            <div v-for="v in row" :key="v" class="val-btn" @click="setCell(v)"><text class="val-txt">{{ v }}</text></div>
          </div>
          <div class="val-row">
            <div class="val-btn val-clear" @click="clearCell"><text class="val-txt">清空格</text></div>
            <div class="val-btn val-off" @click="toggleCheat"><text class="val-txt">关闭作弊</text></div>
          </div>
        </div>
        
        <div v-else class="end-panel">
          <div v-if="overlay === 'won'" class="btn" @click="continueGame"><text class="btn-label">继续挑战</text></div>
          <div style="flex-direction: row; align-items: center; justify-content: center; margin-bottom: 4px;">
            <div class="btn" @click="restart"><text class="btn-label">再来一局</text></div>
            <div class="btn" @click="restart"><text class="btn-label">重新开始</text></div>
          </div>
          <div style="flex-direction: row; align-items: center; justify-content: center; margin-bottom: 4px;">
            <div class="btn" @click="openSave"><text class="btn-label">存档界面</text></div>
            <div class="btn btn-plain" @click="backToMenu"><text class="btn-label-plain">标题画面</text></div>
          </div>

        </div>
        <text v-if="overlay !== 'none'" class="board-status">{{ overlay === 'won' ? '达成 2048！' : '游戏结束' }}</text>
      </div>
    </div>
  </div>
</template>

<script>
import Board from '../../components/board.vue'
import DPad from '../../components/dpad.vue'
import { spawnTile, moveTiles, isGameOver, maxTile } from '../../utils/game.js'
import { games as storeGames, best as storeBest, selectedMode, setSelectedMode, freshGame, loadSave, saveGame, copyState, SIZES } from '../../utils/state.js'
import { dbgLog } from '../../utils/storage.js'

export default {
  name: 'game',
  components: {
    Board,
    DPad
  },
  data() {
    // 每个页面实例持有自己的深拷贝，绝不共享模块里的对象
    // （falcon 定制版 Vue 对重复 observe 同一对象会失效）
    const st = copyState()
    return {
      // 模块级数组也要拷贝：falcon Vue 对跨实例共享的已 observe 对象会失效
      sizes: SIZES.slice(),
      mode: st.mode,
      games: st.games,
      best: st.best,
      overlay: 'none',
      touchX: 0,
      touchY: 0,
      /* 作弊模式选中的方格 { r, c }，未选中为 null */
      selCell: null,
      /* 改值面板的数值按钮分组 */
      valRows: [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2048, 4096]
      ]
    }
  },
  computed: {
    activeGame() {
      return this.games[this.mode]
    },
    selText() {
      const s = this.selCell
      if (!s) {
        return '未选中：点棋盘方格'
      }
      return '选中 第' + (s.r + 1) + '行 第' + (s.c + 1) + '列 = ' + this.activeGame.grid[s.r][s.c]
    }
  },
  created() {
    dbgLog('game created uid=' + this._uid + ' mode=' + this.mode)
  },
  mounted() {
    dbgLog('game mounted uid=' + this._uid)
  },
  methods: {
    onShow() {
      dbgLog('game onShow uid=' + this._uid + ' mode=' + this.mode)
      // loadSave().then(() => {
      //   // 恢复完成后从模块源整体重拷贝（含最新存档内容）
      //   const st = copyState()
      //   this.mode = st.mode
      //   this.games = st.games
      //   this.best = st.best
      //   // 恢复出的棋盘若已无路可走，直接显示结束面板，避免"棋盘不动"的错觉
      //   if (this.overlay === 'none' && isGameOver(this.games[this.mode].grid)) {
      //     this.overlay = 'over'
      //   }
      //   dbgLog('game onShow synced mode=' + this.mode + ' score=' + this.games[this.mode].score + ' overlay=' + this.overlay)
      // })
    },
    switchMode(m) {
      dbgLog('switchMode ' + m)
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
      dbgLog('doMove ' + dir)
      try {
        this._doMove(dir)
      } catch (err) {
        dbgLog('doMove error: ' + (err && err.message ? err.message : err))
      }
    },
    _doMove(dir) {
      if (this.overlay !== 'none') {
        dbgLog('_doMove skip overlay=' + this.overlay)
        return
      }
      const game = this.activeGame
      const result = moveTiles(game.grid, dir)
      if (!result.moved) {
        dbgLog('_doMove not moved dir=' + dir)
        return
      }
      let next = {
        size: game.size,
        grid: result.grid,
        score: game.score + result.gained,
        over: false,
        wonReached: game.wonReached,
        cheat: !!game.cheat,
        cheated: !!game.cheated
      }
      // 移动有效则生成新方块
      next.grid = spawnTile(next)
      // 棋盘已变化，清除作弊选中格
      this.selCell = null

      if (isGameOver(next.grid)) {
        next.over = true
      }
      // 仅在首次达成 2048 的那一步弹"达成"面板（之后不再重复弹出）
      const justWon = !game.wonReached && maxTile(next.grid) >= 2048
      if (justWon) {
        next.wonReached = true
      }

      // 页面实例只更新自己的副本；同时同步到模块存档源
      this.games[this.mode] = next
      storeGames[this.mode] = next

      // 更新最佳成绩
      if (next.score > this.best[this.mode]) {
        this.best[this.mode] = next.score
        storeBest[this.mode] = next.score
      }

      // 弹层
      if (next.over) {
        this.overlay = 'over'
      } else if (justWon && this.overlay === 'none') {
        this.overlay = 'won'
      }

      dbgLog('_doMove ok dir=' + dir + ' score=' + next.score + ' over=' + next.over + ' overlay=' + this.overlay)

      // 存档（含最新最佳成绩）
      saveGame()
    },
    restart() {
      dbgLog('restart')
      const fresh = freshGame(this.activeGame.size)
      this.games[this.mode] = fresh
      storeGames[this.mode] = fresh
      this.overlay = 'none'
      this.selCell = null
      saveGame()
    },
    /**
     * 作弊开关：默认绿✓（未开启），开启后红×。
     * 一旦开启过，本局 cheated 永久置真（关闭作弊不清除），
     * 之后的每次保存（自动存档/槽位）都会带 × 标记。
     */
    toggleCheat() {
      const game = this.activeGame
      const on = !game.cheat
      const next = {
        size: game.size,
        grid: game.grid,
        score: game.score,
        over: game.over,
        wonReached: game.wonReached,
        cheat: on,
        cheated: game.cheated || on
      }
      this.games[this.mode] = next
      storeGames[this.mode] = next
      if (!on) {
        this.selCell = null
      }
      dbgLog('toggleCheat on=' + on + ' cheated=' + next.cheated)
      saveGame()
    },
    /** 作弊模式点格子：选中它（非作弊模式点击不处理，滑动仍正常移动） */
    onCellTap(r, c) {
      if (!this.activeGame.cheat) {
        return
      }
      this.selCell = { r, c }
      dbgLog('onCellTap r=' + r + ' c=' + c + ' val=' + this.activeGame.grid[r][c])
    },
    /** 把选中格改为 v（增添/改动），并同步存档。分数不变。 */
    setCell(v) {
      const game = this.activeGame
      const s = this.selCell
      if (!game.cheat || !s) {
        dbgLog('setCell skip cheat=' + game.cheat + ' sel=' + (s ? s.r + ',' + s.c : 'null'))
        return
      }
      const grid = game.grid.map(row => row.slice())
      grid[s.r][s.c] = v
      dbgLog('setCell r=' + s.r + ' c=' + s.c + ' v=' + v)
      this.applyGrid(grid)
    },
    /** 删除选中格（清为 0） */
    clearCell() {
      const game = this.activeGame
      const s = this.selCell
      if (!game.cheat || !s) {
        return
      }
      const grid = game.grid.map(row => row.slice())
      grid[s.r][s.c] = 0
      dbgLog('clearCell r=' + s.r + ' c=' + s.c)
      this.applyGrid(grid)
    },
    /** 用编辑后的棋盘替换当前局并保存（作弊编辑不改分数，重算结束状态） */
    applyGrid(grid) {
      const game = this.activeGame
      const over = isGameOver(grid)
      const next = {
        size: game.size,
        grid,
        score: game.score,
        over,
        wonReached: game.wonReached,
        cheat: true,
        cheated: true
      }
      this.games[this.mode] = next
      storeGames[this.mode] = next
      if (over && this.overlay === 'none') {
        this.overlay = 'over'
      } else if (!over && this.overlay === 'over') {
        this.overlay = 'none'
      }
      dbgLog('applyGrid over=' + over + ' overlay=' + this.overlay)
      saveGame()
    },
    continueGame() {
      dbgLog('continueGame')
      this.overlay = 'none'
      saveGame()
    },
    backToMenu() {
      dbgLog('backToMenu')
      this.$page.finish()
    },
    openHelp() {
      dbgLog('openHelp')
      $falcon.navTo('page')
    },
    openSave() {
      dbgLog('openSave, backtomenu')
      $falcon.navTo('save')
      this.$page.finish()
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
      dbgLog('touchEnd dx=' + dx + ' dy=' + dy)
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
@import '../../styles/bar.less';

.page {
  flex: 1;
  width: 100%;
  height: 100%;
  background-color: @bg;
}



.tbtn {
  height: 15vh;
  padding-left: 6vh;
  padding-right: 6vh;
  border-radius: 2vh;
  background-color: @empty;
  margin-right: 8vh;
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
  font-size: 10vh;
  color: @text-dark;
}

.tbtn-label-active {
  color: @text-light;
}

.topbar-spacer {
  flex: 1;
}

.topbar-score {
  font-size: 14vh;
  color: @text-dark;
  margin-left: 2vw;
  margin-right: 2vw;
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
  font-size: 10vh;
  font-weight: bold;
  color: @accent;
}

.control-panel {
  width: 40vw;
  justify-content: center;
  align-items: center;
}

.end-panel {
  align-items: center;
  justify-content: center;
}

.btn {
  height: 16vh;
  padding-left: 6vh;
  padding-right: 6vh;
  border-radius: 2vh;
  background-color: @accent;
  margin: 2vh;
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

.btn-plain {
  background-color: @empty;
}

.btn-label-plain {
  font-size: 10vh;
  font-weight: bold;
  color: @text-dark;
}

/* 作弊开关框（默认绿✓，开启后红×） */
.cheat-toggle {
  flex-direction: row;
}

.cheat-box {
  width: 13vh;
  height: 13vh;
  border-radius: 2vh;
  border-width: 2vh;
  border-style: solid;
  margin-left: 2vh;
  justify-content: center;
  align-items: center;
}

.cheat-box-ok {
  border-color: #2e9e44;
}

.cheat-box-x {
  border-color: #d93025;
  background-color: #d93025;
}

.cheat-mark {
  font-size: 10vh;
  font-weight: bold;
}

.cheat-mark-ok {
  color: #2e9e44;
}

.cheat-mark-x {
  color: #d93025;
}

/* 作弊改值面板 */
.cheat-panel {
  align-items: center;
  justify-content: center;
}

.cheat-sel {
  font-size: 9vh;
  font-weight: bold;
  color: #d93025;
}

.val-row {
  flex-direction: row;
}

.val-btn {
  width: 8vw;
  height: 15vh;
  margin: 3px;
  border-radius: 2vh;
  background-color: @accent;
  justify-content: center;
  align-items: center;
}

.val-btn:active {
  opacity: 0.6;
}

.val-txt {
  font-size: 10vh;
  color: @text-light;
}

.val-clear {
  width: 13vw;
  background-color: #d93025;
}

.val-off {
  width: 13vw;
  background-color: @text-dark;
}
</style>
