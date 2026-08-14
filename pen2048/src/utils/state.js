/**
 * 全局游戏状态（模块级单例）
 * 主界面与游戏页共享，页面切换不丢进度（应用进程内有效）。
 * 配合 storage.js 实现跨启动存档。
 */
import { newGame, spawnTile } from './game.js'
import { loadState, saveState, loadSlot, saveSlot } from './storage.js'

/** 新游戏：开局生成两个方块 */
export function freshGame(size) {
  const state = newGame(size)
  state.grid = spawnTile(state)
  state.grid = spawnTile(state)
  return state
}

/** 两个独立棋盘 */
export const games = {
  '4': freshGame(4),
  '5': freshGame(5)
}

/** 最佳成绩 */
export const best = {
  '4': 0,
  '5': 0
}

/** 当前选中的模式 */
export let selectedMode = '4'

export function setSelectedMode(m) {
  selectedMode = m
}

/** 存档是否已加载完成（加载完成前不写存档，防止旧存档覆盖新进度） */
let saveLoaded = false

export function isGoodGrid(grid, size) {
  if (!Array.isArray(grid) || grid.length !== size) {
    return false
  }
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== size) {
      return false
    }
    for (const v of row) {
      if (typeof v !== 'number' || isNaN(v) || v < 0) {
        return false
      }
    }
  }
  return true
}

export function isGoodGame(g, size) {
  return !!g && g.size === size && isGoodGrid(g.grid, size) &&
    typeof g.score === 'number' && typeof g.wonReached === 'boolean'
}

/**
 * 从 storage 恢复自动存档（异步）。失败或无存档时保持初始状态。
 * 页面 onShow 时调用，幂等。
 */
export async function loadSave() {
  if (saveLoaded) {
    return
  }
  let data = null
  try {
    data = await loadState()
  } catch (err) {
    data = null
  }
  applySave(data)
  saveLoaded = true
}

/** 当前状态的纯对象快照（自动存档与手动槽位共用） */
export function snapshot() {
  return {
    g4: {
      size: games['4'].size,
      grid: games['4'].grid,
      score: games['4'].score,
      wonReached: games['4'].wonReached
    },
    g5: {
      size: games['5'].size,
      grid: games['5'].grid,
      score: games['5'].score,
      wonReached: games['5'].wonReached
    },
    b4: best['4'],
    b5: best['5'],
    mode: selectedMode
  }
}

/** 把存档数据应用到当前状态（自动存档恢复与手动读档共用） */
export function applySave(data) {
  if (!data) {
    return false
  }
  let applied = false
  if (isGoodGame(data.g4, 4)) {
    games['4'] = data.g4
    applied = true
  }
  if (isGoodGame(data.g5, 5)) {
    games['5'] = data.g5
    applied = true
  }
  if (typeof data.b4 === 'number' && data.b4 >= 0) {
    best['4'] = data.b4
  }
  if (typeof data.b5 === 'number' && data.b5 >= 0) {
    best['5'] = data.b5
  }
  if (data.mode === '4' || data.mode === '5') {
    selectedMode = data.mode
  }
  return applied
}

/**
 * 写入自动存档。加载完成前调用会被忽略（防竞态）。
 * 注意：falcon 运行时没有 this.$set，恢复与保存都通过直接赋值。
 */
export function saveGame() {
  if (!saveLoaded) {
    return
  }
  saveState(snapshot())
}

/**
 * 手动保存当前进度到槽位 n（1 起）。
 */
export function saveToSlot(n) {
  const data = snapshot()
  data.savedAt = Date.now()
  saveSlot(n, data)
}

/**
 * 从槽位 n 读取存档并应用到当前状态。
 * 返回 boolean：是否成功读取了有效存档。
 */
export async function loadFromSlot(n) {
  let data = null
  try {
    data = await loadSlot(n)
  } catch (err) {
    data = null
  }
  const ok = applySave(data)
  if (ok) {
    // 读档后同步自动存档，避免下次启动回到旧进度
    saveGame()
  }
  return ok
}
