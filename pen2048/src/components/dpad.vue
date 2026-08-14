<template>
  <div class="dpad-wrap">
    <div class="dpad-row">
      <div class="dpad-gap" />
      <div class="dpad-btn" @click="$emit('move', 'up')"><text class="dpad-label">↑</text></div>
      <div class="dpad-gap" />
    </div>
    <div class="dpad-row">
      <div class="dpad-btn" @click="$emit('move', 'left')"><text class="dpad-label">←</text></div>
      <div class="dpad-gap" />
      <div class="dpad-btn" @click="$emit('move', 'right')"><text class="dpad-label">→</text></div>
    </div>
    <div class="dpad-row">
      <div class="dpad-gap" />
      <div class="dpad-btn" @click="$emit('move', 'down')"><text class="dpad-label">↓</text></div>
      <div class="dpad-gap" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'DPad',
  props: {}
}
</script>

<style lang="less" scoped>
.dpad-wrap {
  align-items: center;
}

.dpad-row {
  flex-direction: row;
}

.dpad-btn {
  width: 52px;
  height: 52px;
  margin: 3px;
  border-radius: 10px;
  background-color: #8f7a66;
  justify-content: center;
  align-items: center;
}

.dpad-btn:active {
  opacity: 0.6;
}

.dpad-label {
  font-size: 24px;
  color: #f9f6f2;
}

.dpad-gap {
  width: 52px;
  height: 52px;
  margin: 3px;
}
</style>
