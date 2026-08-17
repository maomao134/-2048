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

/** 可选棋盘大小（3×3 挑战 / 4×4 经典 / 5×5 宽松 / 6×6 极限） */
export const SIZES = ['3', '4', '5', '6']

/** 每个尺寸一个独立棋盘 */
export const games = {}

/** 每个尺寸一个最佳成绩 */
export const best = {}

for (const s of SIZES) {
  games[s] = freshGame(Number(s))
  best[s] = 0
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

function copyGame(g) {
  return {
    size: g.size,
    grid: g.grid.map(row => row.slice()),
    score: g.score,
    over: !!g.over,
    wonReached: !!g.wonReached,
    cheat: !!g.cheat,
    cheated: !!g.cheated
  }
}

/**
 * 把模块状态复制成全新对象（深拷贝棋盘），供页面 data() 使用。
 * 页面实例之间绝不共享响应式对象：falcon 定制版 Vue 对"已被另一个
 * 页面实例 observe 过的对象"再次 observe 时行为异常（重进游戏页棋盘
 * 更新失效的根因），所以每个页面实例只持有自己的副本。
 */
export function copyState() {
  const gs = {}
  const bs = {}
  for (const s of SIZES) {
    gs[s] = copyGame(games[s])
    bs[s] = best[s]
  }
  return {
    mode: selectedMode,
    games: gs,
    best: bs
  }
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
  const out = {
    mode: selectedMode,
    /* 本存档是否为作弊存档：任一棋盘开过作弊即打 ×（保存时固化，旧存档无此字段视为 ✓） */
    cheated: false
  }
  for (const s of SIZES) {
    const g = games[s]
    out['g' + s] = {
      size: g.size,
      grid: g.grid,
      score: g.score,
      over: !!g.over,
      wonReached: g.wonReached,
      cheat: !!g.cheat,
      cheated: !!g.cheated
    }
    out['b' + s] = best[s]
    if (g.cheated) {
      out.cheated = true
    }
  }
  return out
}

/** 把存档数据应用到当前状态（自动存档恢复与手动读档共用） */
export function applySave(data) {
  if (!data) {
    return false
  }
  let applied = false
  for (const s of SIZES) {
    if (isGoodGame(data['g' + s], Number(s))) {
      games[s] = data['g' + s]
      applied = true
    }
    if (typeof data['b' + s] === 'number' && data['b' + s] >= 0) {
      best[s] = data['b' + s]
    }
  }
  if (SIZES.indexOf(data.mode) >= 0) {
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

/**
 * 应用启动时调用：初始化 storage 中的自动存档为初始状态（所有最佳分数为 0）。
 * 这确保即使之前保存过游戏进度，重启应用后存档管理页面也显示初始状态。
 */
export function initializeSave() {
  saveLoaded = true
  saveGame()
}
