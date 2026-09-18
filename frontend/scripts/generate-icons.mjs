import { createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import zlib from 'node:zlib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'icons')

function crc32(buf) {
  let c = ~0
  for (const b of buf) {
    c ^= b
    for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return ~c >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}

function rgbaPng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1)
    raw[rowStart] = 0
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const heart = [
  '................',
  '...##....##.....',
  '..####..####....',
  '.##############.',
  '.##############.',
  '..############..',
  '...##########...',
  '....########....',
  '.....######.....',
  '......####......',
  '.......##.......',
  '................',
  '................',
  '................',
  '................',
  '................',
]

function paint(size) {
  const rgba = Buffer.alloc(size * size * 4)
  const scale = size / 16
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      const cx = Math.floor(x / scale)
      const cy = Math.floor(y / scale)
      const on = heart[cy]?.[cx] === '#'
      if (on) {
        rgba[i] = 255
        rgba[i + 1] = 77
        rgba[i + 2] = 154
        rgba[i + 3] = 255
      } else {
        rgba[i] = 20
        rgba[i + 1] = 8
        rgba[i + 2] = 31
        rgba[i + 3] = 255
      }
    }
  }
  return rgbaPng(size, size, rgba)
}

await mkdir(outDir, { recursive: true })
await Promise.all([
  write(join(outDir, 'icon-192.png'), paint(192)),
  write(join(outDir, 'icon-512.png'), paint(512)),
  write(join(__dirname, '..', 'public', 'apple-touch-icon.png'), paint(180)),
])

function write(path, buf) {
  return new Promise((resolve, reject) => {
    const s = createWriteStream(path)
    s.on('finish', resolve)
    s.on('error', reject)
    s.end(buf)
  })
}

console.log('icons written')
