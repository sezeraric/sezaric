import { notFound } from "next/navigation";
import { Rig } from "./rig";

/**
 * The figure render rig — a build tool that happens to need a browser, in the
 * same spirit as scripts/cutout.py and scripts/encode-scrub.sh. It renders
 * public/figure/turn-*.webp, the frames the showcase falls back to on devices
 * that cannot afford a second WebGL context.
 *
 * Never part of the deployed site.
 */
export default function FigureShotsPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <Rig />;
}
