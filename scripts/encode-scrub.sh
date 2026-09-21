#!/usr/bin/env bash
#
# Re-encode a clip so it can be scrubbed by scroll position.
#
# Seeking a normally-encoded MP4 snaps to the nearest keyframe, which are
# seconds apart — the picture jumps instead of moving. Forcing every frame to be
# a keyframe (-g 1) makes every frame seekable. The file gets several times
# larger, which is why the source should stay short.
#
# Usage: scripts/encode-scrub.sh input.mp4 public/bullet-time.mp4 [width]
set -euo pipefail

IN="$1"
OUT="$2"
WIDTH="${3:-1280}"

ffmpeg -y -i "$IN" \
  -an \
  -vf "scale=${WIDTH}:-2:flags=lanczos,fps=24" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -g 1 -keyint_min 1 -sc_threshold 0 \
  -crf 24 -preset slow \
  -movflags +faststart \
  "$OUT"

# A poster for the first paint, before the video has buffered.
ffmpeg -y -i "$OUT" -frames:v 1 -q:v 4 "${OUT%.mp4}-poster.jpg"

ls -lh "$OUT" "${OUT%.mp4}-poster.jpg"
