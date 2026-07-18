import type { NextConfig } from "next"
import path from "path"

const nextConfig: NextConfig = {
  turbopack: {
    // Pin root to this package (avoids parent lockfile confusion).
    root: path.resolve(__dirname),
  },
}

export default nextConfig
