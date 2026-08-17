<template>
  <div class="page">
    <div class="topbar">
      <div class="back-btn" @click="goBack"><text class="back-label">返回</text></div>
      <text class="topbar-title">说明</text>
    </div>
    <scroller scroll-y show-scrollbar="false" class="content">
      <text class="head">玩法</text>
      <text class="line">每次移动，所有方块朝同一方向滑动，</text>
      <text class="line">数字相同的方块相撞后会合并成一个更大的数字。</text>
      <text class="head">操作</text>
      <text class="line">在棋盘上滑动屏幕，或点击右侧方向键，即可控制方块移动。</text>
      <text class="line">移动无效（没有方块变动）时不会生成新方块。</text>
      <text class="head">自定义大小</text>
      <text class="line">主界面可选 3×3 / 4×4 / 5×5 / 6×6，游戏内顶栏也可随时切换。</text>
      <text class="line">每个棋盘独立，进度互不影响。</text>
      <text class="line">3×3 是极限挑战模式，4×4 经典，5×5 宽松，6×6 最难填满。</text>
      <text class="head">作弊</text>
      <text class="line">点顶栏作弊框开启作弊：</text>
      <text class="line">点棋盘方格选中，再点右侧数字改值，或点"清空格"删除。</text>
      <div style="flex-direction: row; align-items: center; justify-content: center; margin-bottom: 4px;">
                        <text class="line-mark">开启过作弊的本局会永久带</text>
                        <text class="line-mark-red">红色</text>
                        <text class="line-mark">标记，未开过作弊的存档保持</text>
                        <text class="line-mark-green">绿色</text>
                        <text class="line-mark">标记。</text>
                    </div>
      <text class="head">计分</text>
      <text class="line">每次合并的数值会累加为得分，各尺寸的最佳成绩分别自动保存。</text>
      <text class="line">棋盘越大，越容易玩出更大的数字。</text>
      <text class="head">目标</text>
      <text class="line">合成 2048 即达成目标！</text>
      <text class="line">达成后可以继续挑战更高数字。</text>
      <text class="line">当棋盘被填满且无法再合并时，游戏结束。</text>
      <text class="version">西伯利亚旋风黑土豆软件公司出品</text>
      <text class="version">2048 v2.0.1 (原作 by GMM using Deepseek，优化 by qq1122)</text>
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
@import '../../styles/bar.less';

.page {
  flex: 1;
  width: 100%;
  height: 100%;
  background-color: @bg;
}

.content {
  width: 100%;
  height: 80vh;
  padding-left: 2vh;
  padding-right: 2vh;
}

.head {
  align-self: center;
  font-size: 13vh;
  font-weight: bold;
  color: @text-dark;
  margin-top: 4vh;
  margin-bottom: 2vh;
}

.line {
  align-self: center;
  font-size: 11vh;
  color: @text-dark;
  margin-bottom: 2vh;
}

.line-mark {
  align-self: center;
  font-size: 11vh;
  font-weight: bold;
  color: @bg;
  margin-bottom: 2vh;
  background-color: @board;
}
.line-mark-red {
  align-self: center;
  font-size: 11vh;
  font-weight: bold;
  color: #d93025;
  margin-bottom: 2vh;
  background-color: @board;
}
.line-mark-green {
  align-self: center;
  font-size: 11vh;
  font-weight: bold;
  color: #2e9e44;
  margin-bottom: 2vh;
  background-color: @board;
}

.version {
  align-self: center;
  font-size: 6vh;
  line-height: auto;
  color: @accent;
  margin-top: 2vh;
  margin-bottom: 2vh;
}
</style>
