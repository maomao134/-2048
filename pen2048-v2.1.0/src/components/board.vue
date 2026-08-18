<template>
  <div class="board-wrap" :class="dark ? 'board-wrap-d' : ''">
    <div v-for="(row, r) in grid" :key="r" class="board-row">
      <div
        v-for="(val, c) in row"
        :key="c"
        class="board-cell"
        :style="{ width: cellPx + 'px', height: cellPx + 'px', margin: gapPx + 'px', backgroundColor: cellColor(val), borderWidth: isSel(r, c) ? '3px' : '0px', borderStyle: 'solid', borderColor: isSel(r, c) ? '#d93025' : 'transparent' }"
        @click="onTap(r, c)"
      >
        <text v-if="val > 0" class="cell-text" :style="{ color: textColor(val), fontSize: cellFont(val) + 'px' }">{{ val }}</text>
      </div>
    </div>
  </div>
</template>

<script>
const TILE_COLORS = {
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e'
}

/** 深色模式瓷砖：2/4 用深灰底亮字，8+ 保持暖色（深色背景下同样醒目） */
const DARK_TILE_COLORS = {
  2: '#4a4e58',
  4: '#565b66',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e'
}

/** 各尺寸棋盘布局：格子边长 / 间距 / 基准字号（屏幕 1024×240 限制，6×6 为舒适上限） */
const LAYOUT = {
  3: { cell: 52, gap: 4, font: 22 },
  4: { cell: 44, gap: 3, font: 20 },
  5: { cell: 35, gap: 2, font: 16 },
  6: { cell: 28, gap: 2, font: 13 }
}

export default {
  name: 'Board',
  props: {
    grid: { type: Array, required: true },
    size: { type: Number, required: true },
    /* 作弊模式下的选中格 { r, c }，null 表示未选中 */
    sel: { type: Object, default: null },
    /* 深色模式：切换空 tile / 2、4 的配色与棋盘底色 */
    dark: { type: Boolean, default: false }
  },
  computed: {
    cellPx() {
      return (LAYOUT[this.size] || LAYOUT[4]).cell
    },
    gapPx() {
      return (LAYOUT[this.size] || LAYOUT[4]).gap
    }
  },
  methods: {
    isSel(r, c) {
      const s = this.sel
      return !!s && s.r === r && s.c === c
    },
    onTap(r, c) {
      this.$emit('celltap', r, c)
    },
    cellColor(val) {
      if (val === 0) {
        return this.dark ? '#2b2e36' : '#cdc1b4'
      }
      const table = this.dark ? DARK_TILE_COLORS : TILE_COLORS
      return table[val] || '#3c3a32'
    },
    textColor(val) {
      if (this.dark) {
        return val <= 4 ? '#e8e6e1' : '#f9f6f2'
      }
      return val <= 4 ? '#776e65' : '#f9f6f2'
    },
    cellFont(val) {
      const base = (LAYOUT[this.size] || LAYOUT[4]).font
      if (val < 100) {
        return base
      }
      if (val < 1000) {
        return base - 2
      }
      return base - 4
    }
  }
}
</script>

<style lang="less" scoped>
.board-wrap {
  background-color: #bbada0;
  border-radius: 8px;
}

.board-wrap-d {
  background-color: #3d4048;
}

.board-row {
  flex-direction: row;
}

.board-cell {
  justify-content: center;
  align-items: center;
  border-radius: 6px;
}

.cell-text {
  font-weight: bold;
}
</style>
