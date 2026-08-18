<template>
  <div class="page" :class="dark ? 'page-d' : ''">
    <div class="topbar">
      <div class="back-btn" @click="goBack"><text class="back-label">返回</text></div>
      <text class="topbar-title" :class="dark ? 'topbar-title-d' : ''">存档管理</text>
      <text class="topbar-hint" :class="dark ? 'topbar-hint-d' : ''">{{ hint }}</text>
    </div>

    <!-- 存档列表：自动存档 + 3 个槽位，scroller 保证全部内容可见 -->
    <scroller scroll-y show-scrollbar="false" class="list">
      <!-- 自动存档（信息行） -->
      <div class="slot-row" :class="dark ? 'slot-row-d' : ''">
        <div class="slot-name">
          <text class="slot-name-text" :class="dark ? 'slot-name-text-d' : ''">当前</text>
        </div>
        <div class="mark-box" :class="autoCheated ? 'mark-box-x' : 'mark-box-ok'">
          <text class="mark-txt" :class="autoCheated ? 'mark-txt-x' : 'mark-txt-ok'">{{ autoCheated ? ' ' : ' ' }}</text>
        </div>
        <text class="slot-info" :class="dark ? 'slot-info-d' : ''">{{ autoInfo }}</text>
        <div class="slot-actions">
          <text class="auto-note" :class="dark ? 'auto-note-d' : ''">随游戏自动更新</text>
        </div>
      </div>

      <!-- 槽位列表：整体替换保证响应式（无 $set，避免索引赋值） -->
      <div v-for="slot in slots" :key="slot.n" class="slot-row" :class="dark ? 'slot-row-d' : ''">
        <div class="slot-name">
          <text class="slot-name-text" :class="dark ? 'slot-name-text-d' : ''">槽位 {{ slot.n }}</text>
        </div>
        <!-- 作弊标记框：绿 存档保存时未开作弊；红 存档保存时开着作弊 -->
        <div class="mark-box" :class="slot.cheated ? 'mark-box-x' : 'mark-box-ok'">
          <text class="mark-txt" :class="slot.cheated ? 'mark-txt-x' : 'mark-txt-ok'">{{ slot.cheated ? ' ' : ' ' }}</text>
        </div>
        <text class="slot-info" :class="dark ? 'slot-info-d' : ''">{{ slot.info }}</text>
        <div class="slot-actions">
          <div class="btn btn-plain" :class="[dark ? 'btn-plain-d' : '', { 'btn-disabled': !slot.hasData }]" @click="readSlot(slot.n)"><text class="btn-label-plain" :class="dark ? 'btn-label-plain-d' : ''">读取</text></div>
          <div class="btn" @click="writeSlot(slot.n)"><text class="btn-label">保存</text></div>
        </div>
      </div>

      <div class="footer">
        <text class="footer-text" :class="dark ? 'footer-text-d' : ''">读取：用槽位存档替换当前全部棋盘进度</text>
        <text class="footer-text" :class="dark ? 'footer-text-d' : ''">保存：把当前全部棋盘的进度存入槽位</text>
      </div>

      <!-- 重置全部存档：三个槽位都带作弊标记时读档无法摆脱，需整体清空（两段式防误触） -->
      <div class="reset-btn" @click="resetAll">
        <text class="reset-label">{{ armReset ? '再点一次确认重置' : '重置全部存档' }}</text>
      </div>
    </scroller>
  </div>
</template>

<script>
import { SLOT_COUNT, loadSlot, loadState, saveSlot, dbgLog, themeCache, loadTheme } from '../../utils/storage.js'
import { loadFromSlot, saveToSlot, resetAllSave, loadSave, SIZES } from '../../utils/state.js'

function fmtTime(ts) {
  if (!ts) {
    return '时间未知'
  }
  const d = new Date(ts)
  if (isNaN(d.getTime())) {
    return '时间未知'
  }
  const p = (x) => (x < 10 ? '0' + x : '' + x)
  return p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes())
}

export default {
  name: 'save',
  data() {
    return {
      slots: [],
      autoCheated: false,
      autoInfo: '空',
      hint: '(绿: 未作弊存档 红: 作弊存档)',
      /* 深色模式（启动时同步读缓存，避免首帧闪烁；onShow 再刷新） */
      dark: themeCache === 'dark',
      /* 重置按钮两段式确认：第一次点击进入待确认态，再点一次才执行 */
      armReset: false
    }
  },
  methods: {
    onShow() {
      dbgLog('save onShow')
      loadTheme().then((t) => {
        this.dark = t === 'dark'
      })
      this.refresh()
    },
    goBack() {
      dbgLog('save goBack')
      this.$page.finish()
    },
    /** 重新读取自动存档与三个槽位的信息（整体替换数组，保证响应式） */
    async refresh() {
      let auto = null
      try {
        auto = await loadState()
      } catch (err) {
        auto = null
      }
      this.autoCheated = !!(auto && auto.cheated)
      this.autoInfo = auto ? this.describe(auto) : '空'

      const list = []
      for (let n = 1; n <= SLOT_COUNT; n++) {
        let data = null
        try {
          data = await loadSlot(n)
        } catch (err) {
          data = null
        }
        list.push({
          n,
          hasData: !!data,
          /* 存档保存时固化的作弊标记（旧版存档无此字段视为未作弊 ✓） */
          cheated: !!(data && data.cheated),
          info: data ? this.describe(data) : '空'
        })
      }
      this.slots = list
    },
    /** 完整显示所有尺寸的得分与保存时间 */
    describe(d) {
      const parts = []
      for (const s of SIZES) {
        parts.push(s + '×' + s + ':' + (typeof d['b' + s] === 'number' ? d['b' + s] : '—'))
      }
      let str = parts.join(' ')
      return str
    },
    async readSlot(n) {
      dbgLog('readSlot ' + n)
      const ok = await loadFromSlot(n)
      if (ok) {
        this.hint = '已读取槽位 ' + n + '，进度已替换'
      } else {
        this.hint = '槽位 ' + n + ' 是空的'
      }
      this.refresh()
    },
    writeSlot(n) {
      dbgLog('writeSlot ' + n)
      saveToSlot(n)
      this.hint = '已保存到槽位 ' + n
      this.refresh()
    },
    /**
     * 重置全部存档（两段式防误触）：
     * 1. 先确保自动存档已加载完成（saveGame 才真正落盘）
     * 2. 重置所有棋盘 + 最佳成绩（含作弊标记清除），并清空 3 个槽位
     * 这样即使三个槽位全是作弊存档，也能回到干净的绿✓状态。
     */
    async resetAll() {
      if (!this.armReset) {
        this.armReset = true
        this.hint = '再点一次确认：清除所有棋盘与槽位'
        dbgLog('resetAll arm')
        return
      }
      this.armReset = false
      dbgLog('resetAll exec')
      await loadSave()
      resetAllSave()
      for (let n = 1; n <= SLOT_COUNT; n++) {
        saveSlot(n, null)
      }
      this.hint = '已重置全部存档'
      this.refresh()
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


.topbar-hint {
  font-size: 12vh;
  line-height: 15vh;
  font-weight: bold;
  color: #baac9d;
  margin-right: 10vw;
}

.list {
  width: 100%;
  height: 80vh;
}

.slot-row {
  height: 30vh;
  flex-direction: row;
  align-items: center;
  padding-left: 4vh;
  padding-right: 5vh;
  margin-left: 4vh;
  margin-right: 4vh;
  margin-top: 2vh;
  border-radius: 5vh;
  background-color: #eee4da;
}

.slot-name {
  width: 15vw;
}

.slot-name-text {
  font-size: 15vh;
  font-weight: bold;
  color: @text-dark;
}

/* 作弊标记框（绿: 正常存档 / 红: 作弊存档） */
.mark-box {
  width: 20vh;
  height: 20vh;
  border-radius: 2vh;
  border-width: 4vh;
  border-style: solid;
  margin-right: 5vh;
  justify-content: center;
  align-items: center;
}

.mark-box-ok {
  border-color: #2e9e44;
  background-color: #2e9e44;
}

.mark-box-x {
  border-color: #d93025;
  background-color: #d93025;
}

.mark-txt {
  font-size: 5vh;
  font-weight: bold;
}

.mark-txt-ok {
  color: #2e9e44;
}

.mark-txt-x {
  color: #d93025;
}

.slot-info {
  flex: 1;
  font-size: 10vh;
  color: @text-dark;
}

.slot-actions {
  width: auto;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
}

.auto-note {
  font-size: 10vh;
  color: #888888;
}

.btn {
  height: 25vh;
  width: auto;
  padding-left: 4vh;
  padding-right: 4vh;
  border-radius: 5vh;
  background-color: @accent;
  margin-left: 4vh;
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
  background-color: #ffffff;
  border-width: 5px;
  border-style: solid;
  border-color: @accent;
}

.btn-label-plain {
  font-size: 10vh;
  font-weight: bold;
  color: @accent;
}

.btn-disabled {
  opacity: 0.4;
}

.footer {
  align-self: center;
  padding-top: 4vh;
  padding-bottom: 4vh;
}

.footer-text {
  align-self: center;
  font-size: 10vh;
  color: #888888;
  margin-bottom: 4vh;
}

/* 重置全部存档按钮（红色警示，两段式确认防误触） */
.reset-btn {
  align-self: center;
  height: 18vh;
  padding-left: 8vw;
  padding-right: 8vw;
  border-radius: 3vh;
  background-color: #d93025;
  margin-top: 2vh;
  margin-bottom: 4vh;
  justify-content: center;
  align-items: center;
}

.reset-btn:active {
  opacity: 0.6;
}

.reset-label {
  font-size: 10vh;
  font-weight: bold;
  color: #ffffff;
}

/* ===== 深色模式（-d 变体放末尾，覆盖浅色定义） ===== */
.page-d {
  background-color: @bg-d;
}

.topbar-title-d {
  color: @ink-d;
}

.topbar-hint-d {
  color: @sub-d;
}

.slot-row-d {
  background-color: #22252d;
}

.slot-name-text-d {
  color: @ink-d;
}

.slot-info-d {
  color: @ink-d;
}

.auto-note-d {
  color: @sub-d;
}

.btn-plain-d {
  background-color: @empty-d;
  border-color: @accent-d;
}

.btn-label-plain-d {
  color: @accent-d;
}

.footer-text-d {
  color: @sub-d;
}
</style>
