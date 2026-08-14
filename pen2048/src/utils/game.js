/**
 * 2048 游戏核心逻辑（纯函数，不依赖 DOM）
 * 状态对象结构: { size, grid, score, over, wonReached }
 * grid: 二维数组，0 表示空格
 */

/** 创建一个空的 size x size 棋盘 */
export function emptyGrid(size) {
  const grid = []
  for (let r = 0; r < size; r++) {
    grid.push(new Array(size).fill(0))
  }
  return grid
}

/** 创建新游戏状态 */
export function newGame(size) {
  return {
    size,
    grid: emptyGrid(size),
    score: 0,
    over: false,
    wonReached: false
  }
}

/** 在随机空格上生成 2(90%) 或 4(10%)，返回新 grid */
export function spawnTile(state) {
  const grid = cloneGrid(state.grid)
  const empty = []
  for (let r = 0; r < state.size; r++) {
    for (let c = 0; c < state.size; c++) {
      if (grid[r][c] === 0) {
        empty.push([r, c])
      }
    }
  }
  if (empty.length === 0) {
    return grid
  }
  const [r, c] = empty[Math.floor(Math.random() * empty.length)]
  grid[r][c] = Math.random() < 0.9 ? 2 : 4
  return grid
}

/** 深拷贝棋盘 */
export function cloneGrid(grid) {
  return grid.map(row => row.slice())
}

/** 行 i / 序号 j → 棋盘坐标，按方向换算 */
function cellAt(size, i, j, dir) {
  switch (dir) {
    case 'left': return [i, j]
    case 'right': return [i, size - 1 - j]
    case 'up': return [j, i]
    case 'down': return [size - 1 - j, i]
    default: return [i, j]
  }
}

/**
 * 沿指定方向移动一次。
 * @returns { grid, moved, gained } 新棋盘 / 是否发生移动 / 本次得分
 */
export function moveTiles(grid, dir) {
  const size = grid.length
  const result = emptyGrid(size)
  let moved = false
  let gained = 0

  for (let i = 0; i < size; i++) {
    // 提取一条线上的非零值，按方向顺序
    const line = []
    for (let j = 0; j < size; j++) {
      const pos = cellAt(size, i, j, dir)
      const v = grid[pos[0]][pos[1]]
      if (v !== 0) {
        line.push(v)
      }
    }

    // 合并相邻相同值（每个格子每回合只合并一次）
    const merged = []
    let idx = 0
    while (idx < line.length) {
      if (idx + 1 < line.length && line[idx] === line[idx + 1]) {
        merged.push(line[idx] * 2)
        gained += line[idx] * 2
        idx += 2
      } else {
        merged.push(line[idx])
        idx += 1
      }
    }

    // 写回
    for (let j = 0; j < merged.length; j++) {
      const pos = cellAt(size, i, j, dir)
      result[pos[0]][pos[1]] = merged[j]
      const orig = grid[pos[0]][pos[1]]
      if (orig !== merged[j]) {
        moved = true
      }
    }
  }

  return { grid: result, moved, gained }
}

/** 判断游戏是否结束：无空格且无相邻相同 */
export function isGameOver(grid) {
  const size = grid.length
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) {
        return false
      }
      if (c + 1 < size && grid[r][c] === grid[r][c + 1]) {
        return false
      }
      if (r + 1 < size && grid[r][c] === grid[r + 1][c]) {
        return false
      }
    }
  }
  return true
}

/** 当前最大数字 */
export function maxTile(grid) {
  let max = 0
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid.length; c++) {
      if (grid[r][c] > max) {
        max = grid[r][c]
      }
    }
  }
  return max
}
