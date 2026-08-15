<template>
  <div class="page">
    <div class="topbar">
      <div class="back-btn" @click="goBack"><text class="back-label">← 返回</text></div>
      <text class="topbar-title">2048 · 说明</text>
    </div>
    <scroller scroll-y show-scrollbar="false" class="content">
      <text class="head">玩法</text>
      <text class="line">每次移动，所有方块朝同一方向滑动，数字相同的方块相撞后会合并成一个更大的数字。</text>
      <text class="head">操作</text>
      <text class="line">在棋盘上滑动屏幕，或点击右侧方向键，即可控制方块移动。移动无效（没有方块变动）时不会生成新方块。</text>
      <text class="head">自定义大小</text>
      <text class="line">主界面可选 3×3 / 4×4 / 5×5 / 6×6，游戏内顶栏也可随时切换。每个棋盘独立，进度互不影响。3×3 是极限挑战模式，4×4 经典，5×5 宽松，6×6 最难填满。</text>
      <text class="head">作弊</text>
      <text class="line">点顶栏作弊框开启作弊（绿✓ 变红×）：点棋盘方格选中，再点右侧数字改值，或点"清空格"删除。开启过作弊的本局会永久带红×标记，之后保存的存档在存档管理里显示红×；未开过作弊的存档保持绿✓。</text>
      <text class="head">计分</text>
      <text class="line">每次合并的数值会累加为得分，各尺寸的最佳成绩分别自动保存。棋盘越大，越容易玩出更大的数字。</text>
      <text class="head">目标</text>
      <text class="line">合成 2048 即达成目标！达成后可以继续挑战更高数字。当棋盘被填满且无法再合并时，游戏结束。</text>
      <text class="version">2048 v1.8.0 · 为有道词典笔 A7 Pro 设计</text>
    </scroller>
  </div>
</template>

<script>
export default {
  name: 'page',
  methods: {
    goBack() {
      console.log('[pen2048] page goBack')
      this.$page.finish()
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

.content {
  width: 100%;
  height: 192px;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 8px;
}

.head {
  font-size: 16px;
  font-weight: bold;
  color: @text-dark;
  margin-top: 10px;
  margin-bottom: 4px;
}

.line {
  font-size: 14px;
  color: @text-dark;
  margin-bottom: 4px;
}

.version {
  font-size: 12px;
  color: @text-dark;
  margin-top: 12px;
  margin-bottom: 8px;
}
</style>
