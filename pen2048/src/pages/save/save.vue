<template>
  <div class="page">
    <div class="topbar">
      <div class="back-btn" @click="goBack"><text class="back-label">← 返回</text></div>
      <text class="topbar-title">存档管理</text>
      <text class="topbar-hint">{{ hint }}</text>
    </div>

    <!-- 槽位列表：整体替换保证响应式（无 $set，避免索引赋值） -->
    <div v-for="slot in slots" :key="slot.n" class="slot-row">
      <div class="slot-name">
        <text class="slot-name-text">槽位 {{ slot.n }}</text>
      </div>
      <text class="slot-info">{{ slot.info }}</text>
      <div class="slot-actions">
        <div class="btn btn-plain" :class="{ 'btn-disabled': !slot.hasData }" @click="readSlot(slot.n)"><text class="btn-label-plain">读取</text></div>
        <div class="btn" @click="writeSlot(slot.n)"><text class="btn-label">保存</text></div>
      </div>
    </div>

    <div class="footer">
      <text class="footer-text">读取：用槽位存档替换当前进度</text>
      <text class="footer-text">保存：把当前两个棋盘的进度存入槽位</text>
      <text class="footer-text">游戏中的每一步也会自动保存到"自动存档"</text>
    </div>
  </div>
</template>

<script>
import { SLOT_COUNT, loadSlot } from '../../utils/storage.js'
import { loadFromSlot, saveToSlot } from '../../utils/state.js'

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
      hint: ''
    }
  },
  methods: {
    onShow() {
      console.log('[pen2048] save onShow')
      this.refresh()
    },
    goBack() {
      console.log('[pen2048] save goBack')
      this.$page.finish()
    },
    /** 重新读取三个槽位的信息（整体替换数组，保证响应式） */
    async refresh() {
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
          info: data ? this.describe(data) : '（空）'
        })
      }
      this.slots = list
    },
    describe(d) {
      let s = '4×4 得分 ' + (typeof d.b4 === 'number' ? d.b4 : '?') +
        ' · 5×5 得分 ' + (typeof d.b5 === 'number' ? d.b5 : '?')
      if (d.savedAt) {
        s += ' · ' + fmtTime(d.savedAt)
      }
      return s
    },
    async readSlot(n) {
      console.log('[pen2048] readSlot ' + n)
      const ok = await loadFromSlot(n)
      if (ok) {
        this.hint = '已读取槽位 ' + n + '，进度已替换'
      } else {
        this.hint = '槽位 ' + n + ' 是空的'
      }
      this.refresh()
    },
    writeSlot(n) {
      console.log('[pen2048] writeSlot ' + n)
      saveToSlot(n)
      this.hint = '已保存到槽位 ' + n
      this.refresh()
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

.topbar {
  height: 40px;
  flex-direction: row;
  align-items: center;
  padding-left: 12px;
  padding-right: 12px;
}

.back-btn {
  height: 30px;
  padding-left: 12px;
  padding-right: 12px;
  border-radius: 8px;
  background-color: @accent;
  margin-right: 14px;
  justify-content: center;
  align-items: center;
}

.back-btn:active {
  opacity: 0.6;
}

.back-label {
  font-size: 14px;
  color: @text-light;
}

.topbar-title {
  font-size: 20px;
  font-weight: bold;
  color: @text-dark;
}

.topbar-hint {
  font-size: 13px;
  color: @accent;
  margin-left: 18px;
}

.slot-row {
  height: 52px;
  flex-direction: row;
  align-items: center;
  padding-left: 20px;
  padding-right: 20px;
  margin-left: 16px;
  margin-right: 16px;
  margin-top: 6px;
  border-radius: 10px;
  background-color: #eee4da;
}

.slot-name {
  width: 80px;
}

.slot-name-text {
  font-size: 16px;
  font-weight: bold;
  color: @text-dark;
}

.slot-info {
  flex: 1;
  font-size: 13px;
  color: @text-dark;
}

.slot-actions {
  flex-direction: row;
  align-items: center;
}

.btn {
  height: 34px;
  padding-left: 16px;
  padding-right: 16px;
  border-radius: 8px;
  background-color: @accent;
  margin-left: 8px;
  justify-content: center;
  align-items: center;
}

.btn:active {
  opacity: 0.6;
}

.btn-label {
  font-size: 14px;
  font-weight: bold;
  color: @text-light;
}

.btn-plain {
  background-color: #ffffff;
  border-width: 2px;
  border-style: solid;
  border-color: @accent;
}

.btn-label-plain {
  font-size: 14px;
  font-weight: bold;
  color: @accent;
}

.btn-disabled {
  opacity: 0.4;
}

.footer {
  flex: 1;
  padding-left: 20px;
  padding-top: 10px;
}

.footer-text {
  font-size: 12px;
  color: #888888;
  margin-bottom: 2px;
}
</style>
