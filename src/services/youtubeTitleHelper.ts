// In-memory cache for YouTube video titles to minimize network queries
const titleCache = new Map<string, string>();

/**
 * Asynchronously fetch video title from YouTube's public oEmbed / noembed endpoints
 */
export async function fetchYouTubeVideoTitle(videoId: string): Promise<string | null> {
  if (!videoId) return null;
  
  if (titleCache.has(videoId)) {
    return titleCache.get(videoId)!;
  }

  try {
    // Attempt noembed first (fast, reliable CORS JSON)
    const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (response.ok) {
      const data = await response.json();
      if (data && data.title) {
        titleCache.set(videoId, data.title);
        return data.title;
      }
    }
  } catch {
    // Fallback attempt via standard YouTube oEmbed
    try {
      const ytResponse = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, {
        signal: AbortSignal.timeout(3000),
      });
      if (ytResponse.ok) {
        const data = await ytResponse.json();
        if (data && data.title) {
          titleCache.set(videoId, data.title);
          return data.title;
        }
      }
    } catch {
      // Offline or network restricted fallback
    }
  }

  return null;
}

/**
 * Store known title into memory cache
 */
export function cacheVideoTitle(videoId: string, title: string) {
  if (videoId && title && !titleCache.has(videoId)) {
    titleCache.set(videoId, title);
  }
}

/**
 * Synchronous cache lookup
 */
export function getCachedVideoTitle(videoId: string): string | undefined {
  return titleCache.get(videoId);
}
