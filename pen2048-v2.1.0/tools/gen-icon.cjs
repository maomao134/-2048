/**
 * 生成 app_icon.png（128x128，2048 风格四色方块图标）
 * 纯 Node 实现（zlib + 手写 PNG chunk / CRC32），无需任何依赖。
 * 用法: node tools/gen-icon.js
 */
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const SIZE = 128

// CRC32 查表法
const CRC_TABLE = (() => {
  const table = new Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}

// 像素颜色
const FRAME = [143, 122, 102, 255] // #8f7a66 边框
const TILES = [
  [238, 228, 218, 255], // 2   #eee4da
  [242, 177, 121, 255], // 8   #f2b179
  [245, 149, 99, 255],  // 16  #f59563
  [246, 94, 59, 255]    // 32  #f65e3b
]

const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1))
const FRAME_W = 10
const GAP = 6
const HALF = (SIZE - FRAME_W * 2 - GAP) / 2 // 每个方块边长

for (let y = 0; y < SIZE; y++) {
  const rowStart = y * (SIZE * 4 + 1)
  raw[rowStart] = 0 // filter: none
  for (let x = 0; x < SIZE; x++) {
    let color = FRAME
    const innerX = x - FRAME_W
    const innerY = y - FRAME_W
    if (innerX >= 0 && innerY >= 0) {
      const qx = innerX < HALF ? 0 : (innerX < HALF + GAP ? -1 : 1)
      const qy = innerY < HALF ? 0 : (innerY < HALF + GAP ? -1 : 1)
      if (qx >= 0 && qy >= 0) {
        color = TILES[qy * 2 + qx]
      }
    }
    const px = rowStart + 1 + x * 4
    raw[px] = color[0]
    raw[px + 1] = color[1]
    raw[px + 2] = color[2]
    raw[px + 3] = color[3]
  }
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(SIZE, 0)
ihdr.writeUInt32BE(SIZE, 4)
ihdr[8] = 8 // bit depth
ihdr[9] = 6 // color type: RGBA
ihdr[10] = 0
ihdr[11] = 0
ihdr[12] = 0

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0))
])

const out = path.join(__dirname, '..', 'app_icon.png')
fs.writeFileSync(out, png)
console.log('written:', out, png.length, 'bytes')
