import sharp from "sharp"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const logoPath = path.join(root, "public/logo-miniapps.png")

// Graphic mark bounds in logo-miniapps.png (navy "m" + pixel cluster)
const left = 283
const top = 25
const width = 468
const height = 450

// Extract mark, trim residual whitespace, then pad ~8% and force square
const extracted = await sharp(logoPath)
  .extract({ left, top, width, height })
  .trim({ threshold: 20 })
  .toBuffer({ resolveWithObject: true })

const tw = extracted.info.width
const th = extracted.info.height
const side = Math.max(tw, th)
const pad = Math.round(side * 0.08)
const canvas = side + pad * 2
const offsetX = Math.floor((canvas - tw) / 2)
const offsetY = Math.floor((canvas - th) / 2)

const mark = await sharp({
  create: {
    width: canvas,
    height: canvas,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  },
})
  .composite([{ input: extracted.data, left: offsetX, top: offsetY }])
  .png()
  .toBuffer()

const appDir = path.join(root, "app")

// Next.js App Router conventions:
// - favicon.ico → <link rel="icon" href="/favicon.ico" sizes="any">
// - icon.png → <link rel="icon" type="image/png" sizes="32x32">
// - apple-icon.png → <link rel="apple-touch-icon">
await sharp(mark)
  .resize(32, 32, { kernel: "lanczos3" })
  .png({ compressionLevel: 9, palette: true })
  .toFile(path.join(appDir, "icon.png"))

await sharp(mark)
  .resize(180, 180, { kernel: "lanczos3" })
  .png({ compressionLevel: 9 })
  .toFile(path.join(appDir, "apple-icon.png"))

const sizes = [16, 32, 48]
const pngBuffers = await Promise.all(
  sizes.map((s) =>
    sharp(mark).resize(s, s, { kernel: "lanczos3" }).png().toBuffer()
  )
)

/** PNG-in-ICO writer (supported by Chrome, Edge, Safari, Firefox, Android Chrome) */
function createIco(pngs, dims) {
  const count = pngs.length
  const headerSize = 6
  const dirEntrySize = 16
  let offset = headerSize + dirEntrySize * count

  const entries = pngs.map((buf, i) => {
    const entry = {
      width: dims[i] >= 256 ? 0 : dims[i],
      height: dims[i] >= 256 ? 0 : dims[i],
      size: buf.length,
      offset,
    }
    offset += buf.length
    return entry
  })

  const out = Buffer.alloc(offset)
  out.writeUInt16LE(0, 0)
  out.writeUInt16LE(1, 2)
  out.writeUInt16LE(count, 4)

  for (let i = 0; i < count; i++) {
    const e = entries[i]
    const o = headerSize + i * dirEntrySize
    out.writeUInt8(e.width, o)
    out.writeUInt8(e.height, o + 1)
    out.writeUInt8(0, o + 2)
    out.writeUInt8(0, o + 3)
    out.writeUInt16LE(1, o + 4)
    out.writeUInt16LE(32, o + 6)
    out.writeUInt32LE(e.size, o + 8)
    out.writeUInt32LE(e.offset, o + 12)
    pngs[i].copy(out, e.offset)
  }
  return out
}

const ico = createIco(pngBuffers, sizes)
fs.writeFileSync(path.join(appDir, "favicon.ico"), ico)

// Remove inspection artifact if present
const artifact = path.join(root, "public/images/favicon-source-256.png")
if (fs.existsSync(artifact)) fs.unlinkSync(artifact)

console.log("favicon.ico", ico.length, "bytes (16/32/48)")
console.log("icon.png", fs.statSync(path.join(appDir, "icon.png")).size, "bytes (32x32)")
console.log(
  "apple-icon.png",
  fs.statSync(path.join(appDir, "apple-icon.png")).size,
  "bytes (180x180)"
)
