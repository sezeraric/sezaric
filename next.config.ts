import type { NextConfig } from "next";

/**
 * OVNRATED lives at sezaric.com/ourated but is its own Next.js app and its own
 * Vercel project (Next Multi-Zones). This site only forwards the path — pages,
 * assets under /ourated/_next and the API — to that deployment. Set
 * OURATED_ORIGIN to its production URL, e.g. https://ourated.vercel.app.
 * Unset, /ourated is simply not served.
 */
const OURATED_ORIGIN = process.env.OURATED_ORIGIN?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // A stray lock file above this directory makes Turbopack guess the wrong
  // workspace root; pin it to the project.
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    if (!OURATED_ORIGIN) return [];
    return [
      { source: "/ourated", destination: `${OURATED_ORIGIN}/ourated` },
      { source: "/ourated/:path+", destination: `${OURATED_ORIGIN}/ourated/:path+` },
    ];
  },
};

export default nextConfig;
