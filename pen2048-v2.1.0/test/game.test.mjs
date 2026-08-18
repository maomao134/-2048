/**
 * 2048 核心逻辑自测（本地 node 运行，不依赖词典笔环境）
 * 用法: node test/game.test.mjs
 */
import { emptyGrid, newGame, spawnTile, cloneGrid, moveTiles, isGameOver, maxTile } from '../src/utils/game.js'

let failed = 0

function expect(name, actual, want) {
  const a = JSON.stringify(actual)
  const w = JSON.stringify(want)
  if (a === w) {
    console.log('PASS', name)
  } else {
    failed++
    console.log('FAIL', name, '→ got', a, 'want', w)
  }
}

// 1. 空棋盘
expect('emptyGrid(4) 是 4x4 全零', emptyGrid(4), [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]])

// 2. 新游戏
const g = newGame(4)
expect('newGame 初始得分 0', g.score, 0)
expect('newGame 未结束', g.over, false)

// 3. 生成方块
const g2 = spawnTile(g)
const flat2 = g2.flat().filter(v => v > 0)
expect('spawnTile 后有一个方块', flat2.length, 1)
expect('spawnTile 值是 2 或 4', flat2[0] === 2 || flat2[0] === 4, true)
const g3 = spawnTile({ ...g, grid: g2 })
expect('spawnTile 两次后有两个方块', g3.flat().filter(v => v > 0).length, 2)

// 4. 左移合并
let r = moveTiles([[2, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], 'left')
expect('左移 [2,2,0,0] → 合并为 4', r.grid[0], [4, 0, 0, 0])
expect('左移得分 4', r.gained, 4)
expect('左移发生移动', r.moved, true)

// 5. 无效移动
r = moveTiles([[2, 4, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], 'left')
expect('左移 [2,4,0,0] → 不变', r.grid[0], [2, 4, 0, 0])
expect('无效移动 moved=false', r.moved, false)

// 6. 双合并 [2,2,2,2] → [4,4,0,0]（每格只合并一次）
r = moveTiles([[2, 2, 2, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], 'left')
expect('左移 [2,2,2,2] → [4,4,0,0]', r.grid[0], [4, 4, 0, 0])
expect('得分 8', r.gained, 8)

// 7. 右移
r = moveTiles([[2, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], 'right')
expect('右移 [2,2,0,0] → [0,0,0,4]', r.grid[0], [0, 0, 0, 4])

// 8. 上移
r = moveTiles([[2, 0, 0, 0], [2, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], 'up')
expect('上移 → 第一列 [4,0,0,0]', r.grid.map(row => row[0]), [4, 0, 0, 0])

// 9. 下移
r = moveTiles([[2, 0, 0, 0], [2, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], 'down')
expect('下移 → 第一列 [0,0,0,4]', r.grid.map(row => row[0]), [0, 0, 0, 4])

// 10. 5x5
r = moveTiles([[2, 2, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]], 'left')
expect('5x5 左移', r.grid[0], [4, 0, 0, 0, 0])

// 11. 结束判定
const full = [[2, 4, 2, 4], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 4, 2]]
expect('棋盘满且无相邻相同 → 结束', isGameOver(full), true)
const mergeable = [[2, 2, 4, 8], [4, 8, 16, 32], [8, 16, 32, 64], [16, 32, 64, 128]]
expect('存在相邻相同 → 未结束', isGameOver(mergeable), false)
expect('有空格 → 未结束', isGameOver([[2, 0, 4, 8], [4, 8, 16, 32], [8, 16, 32, 64], [16, 32, 64, 128]]), false)

// 12. 最大值
expect('maxTile', maxTile([[2, 4], [2048, 16]]), 2048)

// 13. 随机模拟 1000 回合不抛异常
let sim = newGame(4)
sim.grid = spawnTile(sim)
sim.grid = spawnTile(sim)
for (let i = 0; i < 1000; i++) {
  const dirs = ['left', 'right', 'up', 'down']
  const res = moveTiles(sim.grid, dirs[i % 4])
  if (res.moved) {
    sim.grid = spawnTile({ ...sim, grid: res.grid })
  }
  if (isGameOver(sim.grid)) {
    break
  }
}
console.log('PASS 随机模拟 1000 回合无异常')

console.log(failed === 0 ? '\n全部通过 ✓' : '\n有 ' + failed + ' 项失败 ✗')
process.exit(failed === 0 ? 0 : 1)
