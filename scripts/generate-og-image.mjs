import sharp from "sharp"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")

const WIDTH = 1200
const HEIGHT = 630
const LOGO_MAX = 420

const logoPath = path.join(root, "public/logo-miniapps.png")
const logo = await sharp(logoPath)
  .resize({
    width: LOGO_MAX,
    height: LOGO_MAX,
    fit: "inside",
    withoutEnlargement: true,
  })
  .png()
  .toBuffer({ resolveWithObject: true })

const left = Math.round((WIDTH - logo.info.width) / 2)
const top = Math.round((HEIGHT - logo.info.height) / 2)

const ogImage = await sharp({
  create: {
    width: WIDTH,
    height: HEIGHT,
    channels: 3,
    background: { r: 255, g: 255, b: 255 },
  },
})
  .composite([{ input: logo.data, left, top }])
  .png({ compressionLevel: 9 })
  .toBuffer()

const appDir = path.join(root, "app")
await sharp(ogImage).toFile(path.join(appDir, "opengraph-image.png"))
await sharp(ogImage).toFile(path.join(appDir, "twitter-image.png"))

console.log(`Wrote opengraph-image.png and twitter-image.png (${WIDTH}x${HEIGHT})`)
