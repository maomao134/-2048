/**
 * 存档机制单测：saveGame/loadSave 往返、坏存档防护。
 * mock $falcon.jsapi.storage 为内存实现。
 */
import { strict as assert } from 'assert'

const store = {}

globalThis.$falcon = {
  jsapi: {
    storage: {
      async getStorage({ key }) {
        return store[key] !== undefined ? { data: store[key] } : null
      },
      async setStorage({ key, data }) {
        store[key] = data
        return {}
      }
    }
  }
}

const { games, best, selectedMode, setSelectedMode, saveGame, loadSave } = await import('../src/utils/state.js')

// 重置模块态（测试用初始棋盘）
games['4'] = { size: 4, grid: [[2, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], score: 0, wonReached: false }
games['5'] = { size: 5, grid: new Array(5).fill(0).map(() => new Array(5).fill(0)), score: 0, wonReached: false }
best['4'] = 0
best['5'] = 0
setSelectedMode('4')

// 模拟一次"加载完成"（模块单例的 saveLoaded 只会在首次 loadSave 时翻转，
// 因此先 loadSave 一次——此时 store 为空，saveLoaded=true）
await loadSave()

// --- 测试 1：saveGame 写入后 loadSave 能恢复（需要新模块实例才能重新加载，
// 这里直接验证序列化内容）---
games['4'].score = 100
games['4'].grid = [[2, 4, 0, 0], [0, 8, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
best['4'] = 100
setSelectedMode('5')
saveGame()

const saved = JSON.parse(store['pen2048-save'])
assert.equal(saved.g4.score, 100)
assert.deepEqual(saved.g4.grid[1][1], 8)
assert.equal(saved.b4, 100)
assert.equal(saved.mode, '5')
console.log('PASS 存档序列化正确')

// --- 测试 2：storage 返回 JSON 字符串 → loadState 解析 ---
const { loadState, saveState } = await import('../src/utils/storage.js')
await saveState({ g4: { size: 4, grid: [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], score: 1, wonReached: false } })
const loaded = await loadState()
assert.equal(loaded.g4.score, 1)
console.log('PASS storage 往返（JSON 序列化）')

// --- 测试 3：坏存档校验被拒绝 ---
const { isGoodGrid, isGoodGame } = await import('../src/utils/state.js')
const good = { size: 4, grid: [[2, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], score: 0, wonReached: false }
assert.ok(isGoodGame(good, 4))
assert.ok(!isGoodGame({ size: 3, grid: [[1, 2, 3]], score: 0, wonReached: false }, 4), 'size 不符应拒绝')
assert.ok(!isGoodGame({ size: 4, grid: 'oops', score: 0, wonReached: false }, 4), 'grid 非数组应拒绝')
assert.ok(!isGoodGame({ size: 4, grid: [['x', 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], score: 0, wonReached: false }, 4), '非数字应拒绝')
assert.ok(!isGoodGrid([[2, 0], [0, 0]], 4), '行数不符应拒绝')
assert.ok(!isGoodGrid([[2, 0, 0, 0], [0, 0]], 4), '列数不符应拒绝')
console.log('PASS 坏存档校验防护')

// --- 测试 4：手动槽位 save/load 往返 ---
const { saveToSlot, loadFromSlot } = await import('../src/utils/state.js')
games['4'].score = 500
best['5'] = 300
saveToSlot(2)
const slotData = JSON.parse(store['pen2048-slot-2'])
assert.equal(slotData.g4.score, 500)
assert.equal(slotData.b5, 300)
assert.ok(slotData.savedAt > 0, 'savedAt 应存在')
console.log('PASS 槽位保存')

// 改变状态后从槽位 2 恢复
games['4'].score = 0
const ok = await loadFromSlot(2)
assert.ok(ok)
assert.equal(games['4'].score, 500, '读档应恢复得分')
assert.equal(best['5'], 300, '读档应恢复最佳')
// 读档后自动存档同步
const auto = JSON.parse(store['pen2048-save'])
assert.equal(auto.g4.score, 500, '读档后自动存档应同步')
console.log('PASS 槽位读取并同步自动存档')

// --- 测试 5：空槽位读取返回 false ---
delete store['pen2048-slot-3']
const okEmpty = await loadFromSlot(3)
assert.ok(!okEmpty, '空槽位应返回 false')
console.log('PASS 空槽位处理')

// --- 测试 6：copyState 是深拷贝，与模块状态隔离（页面实例互不共享）---
const { copyState } = await import('../src/utils/state.js')
games['4'].score = 777
const st = copyState()
st.games['4'].score = 12345
st.games['4'].grid[0][0] = 999
assert.equal(games['4'].score, 777, 'copyState 修改不应影响模块状态')
assert.notEqual(games['4'].grid[0][0], 999, 'copyState 棋盘应为深拷贝')
assert.equal(st.best['4'], best['4'], 'copyState 应复制最佳成绩')
console.log('PASS copyState 深拷贝隔离')

console.log('全部通过 ✓')
