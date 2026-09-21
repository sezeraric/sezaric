import type { Post } from "../types";
import { aiBubble } from "./ai-bubble";
import { matrixHalfTrue } from "./matrix-half-true";

/** Newest first. Add new posts here. */
export const posts: Post[] = [matrixHalfTrue, aiBubble];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export const sortedPosts = [...posts].sort((a, b) => b.date.localeCompare(a.date));
