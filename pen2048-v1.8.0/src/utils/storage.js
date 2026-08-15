/**
 * 存档持久化。
 * 优先使用系统 storage jsapi，失败时降级为内存存储（游戏仍可玩，只是不保存记录）。
 * 整个游戏状态（两个棋盘、最佳成绩、模式选择）序列化为一个 JSON 存档。
 */

const memory = {}

export const SAVE_KEY = 'pen2048-save'

/** 手动存档槽位（1/2/3） */
export const SLOT_COUNT = 3

export function slotKey(n) {
  return 'pen2048-slot-' + n
}

/**
 * 读取存档。返回解析后的状态对象，无存档时返回 null。
 */
export async function loadState() {
  try {
    const res = await $falcon.jsapi.storage.getStorage({ key: SAVE_KEY })
    if (res && res.data) {
      return JSON.parse(res.data)
    }
  } catch (err) {
    // 系统存储不可用，走内存
  }
  return memory[SAVE_KEY] || null
}

/**
 * 写入存档。state 需为可 JSON 序列化的纯对象。
 */
export async function saveState(state) {
  memory[SAVE_KEY] = state
  try {
    await $falcon.jsapi.storage.setStorage({ key: SAVE_KEY, data: JSON.stringify(state) })
  } catch (err) {
    // 系统存储不可用时忽略（内存中已保留）
  }
}

/**
 * 读取手动存档槽位 n（1 起）。无存档时返回 null。
 */
export async function loadSlot(n) {
  const key = slotKey(n)
  try {
    const res = await $falcon.jsapi.storage.getStorage({ key })
    if (res && res.data) {
      return JSON.parse(res.data)
    }
  } catch (err) {
    // 系统存储不可用，走内存
  }
  return memory[key] || null
}

/**
 * 写入手动存档槽位 n。
 */
export async function saveSlot(n, state) {
  const key = slotKey(n)
  memory[key] = state
  try {
    await $falcon.jsapi.storage.setStorage({ key, data: JSON.stringify(state) })
  } catch (err) {
    // 系统存储不可用时忽略（内存中已保留）
  }
}

/**
 * 调试日志：写入 storage 的 pen2048-dbg 键。
 * 真机上 console.log 无处可查，调试日志随存档文件落盘，
 * 可从 /userdisk/.../sharedpreferences/preferences.json 直接读取。
 */
const DBG_KEY = 'pen2048-dbg'
const dbgBuffer = []

export function dbgLog(msg) {
  try {
    dbgBuffer.push({ t: Date.now(), m: String(msg) })
    if (dbgBuffer.length > 300) {
      dbgBuffer.splice(0, dbgBuffer.length - 300)
    }
    $falcon.jsapi.storage.setStorage({ key: DBG_KEY, data: JSON.stringify(dbgBuffer) })
  } catch (err) {
    // 调试日志失败不影响游戏
  }
}
