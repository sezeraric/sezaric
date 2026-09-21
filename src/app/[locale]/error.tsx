"use client";

/**
 * Last-resort boundary for the locale segment.
 *
 * If anything in the page throws during render, this is what stops the visitor
 * from getting a blank document. It deliberately depends on nothing — no
 * dictionary, no fonts beyond the inherited ones — because whatever failed may
 * be the thing that would have supplied them.
 */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-mx">
        {"// unexpected error"}
      </p>
      <h1 className="max-w-md text-2xl font-medium text-text">
        Something broke on this page.
      </h1>
      <button
        type="button"
        onClick={reset}
        className="rounded-sm border border-mx-dim/60 px-5 py-3 font-mono text-xs uppercase tracking-[0.15em] text-mx transition-colors hover:border-mx"
      >
        Try again
      </button>
      <a
        href="/en"
        className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-faint underline-offset-4 hover:text-text-dim hover:underline"
      >
        Back to the site
      </a>
    </main>
  );
}
