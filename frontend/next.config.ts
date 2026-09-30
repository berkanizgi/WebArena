import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep preview and production compilation from overwriting each other's files.
  distDir: process.env.WEBARENA_PREVIEW === '1' ? '.next-preview' : '.next',
};

export default nextConfig;
