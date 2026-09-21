import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lock file above this directory makes Turbopack guess the wrong
  // workspace root; pin it to the project.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
