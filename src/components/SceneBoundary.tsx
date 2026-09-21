"use client";

import { Component, type ReactNode } from "react";

/**
 * Keeps a WebGL failure from taking down the page.
 *
 * react-three-fiber rethrows anything that goes wrong inside its canvas —
 * context creation, shader compilation, a lost context — out into the React
 * tree. Without a boundary that error unmounts everything above it, and the
 * visitor gets a white screen instead of a site. The canvas is decoration; it
 * is never allowed to be the reason the page does not render.
 */
export class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (process.env.NODE_ENV === "development") {
      console.error("[scene] disabled after error:", error);
    }
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}
