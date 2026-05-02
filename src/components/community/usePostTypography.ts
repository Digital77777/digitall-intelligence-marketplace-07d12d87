import { useMemo } from "react";

/**
 * Facebook-style dynamic font sizing for community feed posts.
 *
 * Rule: If a post has NO media (images, videos, GIFs) AND the combined
 * title + content text length is < 80 characters, render the post text
 * with a large, prominent font. Otherwise, fall back to standard feed
 * typography.
 *
 * This logic is shared by InstagramPostMobile and InstagramPostDesktop
 * to guarantee consistent behavior across breakpoints.
 */

export const SHORT_TEXT_THRESHOLD = 80;

export interface PostTypography {
  /** True when the post qualifies for the prominent large-font treatment. */
  isShortTextPost: boolean;
  /** Total length of title + content used for the threshold check. */
  combinedLength: number;
  /** Tailwind classes for the post title (h2/h3). */
  titleClass: string;
  /** Tailwind classes for the post body text. Includes link sizing. */
  contentClass: string;
  /** Tailwind classes for the wrapper padding around text-only posts. */
  containerPaddingClass: string;
  /** Tailwind classes for inline action buttons inside the content (e.g. "more"). */
  inlineActionClass: string;
}

interface PostLike {
  title?: string | null;
  content?: string | null;
}

interface Options {
  /** Whether the post has any media attached (images / videos). */
  hasMedia: boolean;
}

export function getPostTypography(post: PostLike, { hasMedia }: Options): PostTypography {
  const titleLen = post.title?.length ?? 0;
  const contentLen = post.content?.length ?? 0;
  const combinedLength = titleLen + contentLen;
  const isShortTextPost = !hasMedia && combinedLength < SHORT_TEXT_THRESHOLD;

  if (isShortTextPost) {
    return {
      isShortTextPost,
      combinedLength,
      titleClass:
        "text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-3 break-words",
      contentClass:
        "text-2xl sm:text-3xl font-semibold leading-tight text-foreground whitespace-pre-wrap break-words [&_a]:text-2xl sm:[&_a]:text-3xl [&_a]:font-semibold",
      containerPaddingClass: "px-4 py-6",
      inlineActionClass:
        "text-muted-foreground font-medium ml-1 hover:underline text-base",
    };
  }

  return {
    isShortTextPost,
    combinedLength,
    titleClass: "text-base font-bold text-foreground leading-snug mb-3",
    contentClass:
      "text-[15px] leading-relaxed text-foreground whitespace-pre-wrap [&_a]:text-[15px]",
    containerPaddingClass: "px-4 py-4",
    inlineActionClass:
      "text-muted-foreground font-medium ml-1 hover:underline",
  };
}

export function usePostTypography(post: PostLike, options: Options): PostTypography {
  return useMemo(
    () => getPostTypography(post, options),
    [post.title, post.content, options.hasMedia]
  );
}
