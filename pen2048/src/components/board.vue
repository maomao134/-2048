<template>
  <div class="board-wrap">
    <div v-for="(row, r) in grid" :key="r" class="board-row">
      <div
        v-for="(val, c) in row"
        :key="c"
        class="board-cell"
        :style="{ width: cellPx + 'px', height: cellPx + 'px', margin: gapPx + 'px', backgroundColor: cellColor(val) }"
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

export default {
  name: 'Board',
  props: {
    grid: { type: Array, required: true },
    size: { type: Number, required: true }
  },
  computed: {
    cellPx() {
      return this.size === 4 ? 44 : 35
    },
    gapPx() {
      return this.size === 4 ? 4 : 3
    }
  },
  methods: {
    cellColor(val) {
      if (val === 0) {
        return '#cdc1b4'
      }
      return TILE_COLORS[val] || '#3c3a32'
    },
    textColor(val) {
      return val <= 4 ? '#776e65' : '#f9f6f2'
    },
    cellFont(val) {
      const base = this.size === 4 ? 20 : 16
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
