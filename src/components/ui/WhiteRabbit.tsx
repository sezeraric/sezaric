/**
 * The white rabbit.
 *
 * "Follow the white rabbit" was on screen from the first line of the boot
 * sequence with nothing to follow. This is the thing to follow: it shows up
 * when that line is typed, leads you into the site, and is waiting at the end.
 *
 * Drawn as a flat silhouette on purpose — in the film it is a tattoo, a simple
 * white shape, not a photograph of an animal. That also keeps it crisp at any
 * size and costs nothing to animate.
 */
export function RabbitGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g className="rabbit-body">
        {/* Back ear, then the front ear, which twitches on its own. */}
        <ellipse cx="58" cy="25" rx="6" ry="18" transform="rotate(-20 58 25)" fill="#f4f7f5" />
        <g className="rabbit-ear">
          <ellipse cx="68" cy="23" rx="6.2" ry="19" transform="rotate(8 68 23)" fill="#f4f7f5" />
          <ellipse cx="68.4" cy="25" rx="2.3" ry="12" transform="rotate(8 68 25)" fill="#f1c7d1" opacity="0.55" />
        </g>
        <circle cx="68" cy="46" r="15" fill="#f4f7f5" />
        <ellipse cx="45" cy="66" rx="30" ry="21" fill="#f4f7f5" />
        <circle cx="35" cy="70" r="18" fill="#f4f7f5" />
        <circle cx="15" cy="61" r="7" fill="#ffffff" />
        <ellipse cx="66" cy="84" rx="7" ry="4.6" fill="#e8eeea" />
        <ellipse cx="40" cy="88" rx="16" ry="4.6" fill="#e8eeea" />
        <circle cx="73.5" cy="43.5" r="2.3" fill="#0b1510" />
        <circle cx="82" cy="49" r="1.7" fill="#e6a1b2" />
      </g>
    </svg>
  );
}
