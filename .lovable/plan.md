

# YouTube Video Embed Fallback Implementation Plan

## Overview
Add YouTube video embed support to the LessonPlayer component, allowing you to use YouTube videos as content while building your own video library. The player will intelligently detect YouTube URLs and render a responsive YouTube iframe embed, while maintaining all existing functionality for native videos and Cloudinary-hosted content.

---

## Technical Approach

### Video Source Priority
The LessonPlayer will handle video sources in this order:
1. **Cloudinary URLs** - Optimized with automatic compression + CDN
2. **YouTube URLs** - Embedded via iframe with YouTube's player
3. **Direct video URLs** - Standard HTML5 video element
4. **No URL** - Placeholder with "Coming Soon" message

---

## Part 1: YouTube URL Detection Utility

### New File: `src/lib/videoUtils.ts`

Create a utility module to detect and parse video URLs:

```typescript
// Video source types
export type VideoSourceType = 'youtube' | 'cloudinary' | 'direct' | 'none';

// Extract YouTube video ID from various URL formats
// Supports:
// - https://www.youtube.com/watch?v=VIDEO_ID
// - https://youtu.be/VIDEO_ID
// - https://www.youtube.com/embed/VIDEO_ID
// - https://youtube.com/shorts/VIDEO_ID

export function extractYouTubeId(url: string): string | null;
export function getVideoSourceType(url: string | undefined): VideoSourceType;
export function buildYouTubeEmbedUrl(videoId: string, options?: YouTubeEmbedOptions): string;
```

---

## Part 2: YouTube Player Component

### New File: `src/components/learning/YouTubePlayer.tsx`

A dedicated YouTube embed component with:
- Responsive 16:9 aspect ratio
- Privacy-enhanced mode (`youtube-nocookie.com`)
- Configurable player options via URL parameters
- Loading state with skeleton
- Error handling for invalid videos

```text
+--------------------------------------------------+
|                                                  |
|           YOUTUBE IFRAME EMBED                   |
|        (privacy-enhanced, responsive)            |
|                                                  |
+--------------------------------------------------+
|  [External player controls via YouTube]          |
+--------------------------------------------------+
```

**Embed URL Parameters:**
- `rel=0` - Don't show related videos from other channels
- `modestbranding=1` - Minimal YouTube branding
- `enablejsapi=1` - Enable JavaScript API for future progress tracking
- `origin={window.location.origin}` - Security origin

---

## Part 3: LessonPlayer Enhancement

### File: `src/components/learning/LessonPlayer.tsx`

Update the player to conditionally render:

```typescript
// Detect video source type
const videoSourceType = getVideoSourceType(videoUrl);
const youtubeId = videoSourceType === 'youtube' ? extractYouTubeId(videoUrl) : null;

// Render based on source type
{videoSourceType === 'youtube' && youtubeId ? (
  <YouTubePlayer
    videoId={youtubeId}
    title={title}
    onReady={() => setIsReady(true)}
  />
) : effectiveVideoUrl ? (
  <video ... />  // Existing native video player
) : (
  <Placeholder />  // "Coming Soon" state
)}
```

**Key Changes:**
- Import video utilities and YouTubePlayer component
- Add video source type detection before rendering
- Conditionally render YouTube embed or native player
- Show simplified controls for YouTube (hide native controls that don't apply)
- Maintain bookmark and notes functionality for all video types

---

## Part 4: Lesson Data Structure Update

### Files: `src/data/foundationPathLessons.ts` & `src/data/practicalSkillsLessons.ts`

Add optional `videoUrl` field to the Lesson interface:

```typescript
export interface Lesson {
  id: string;
  courseId: string;
  moduleId: number;
  lessonOrder: number;
  title: string;
  description: string;
  videoUrl?: string;           // NEW: YouTube URL, Cloudinary URL, or direct URL
  videoDurationSeconds: number;
  contentType: 'video' | 'article' | 'quiz' | 'project';
  isPreview: boolean;
  resources: { title: string; type: string; url: string }[];
}
```

---

## Part 5: LessonPage Integration

### File: `src/pages/course/LessonPage.tsx`

Update to pass the video URL from lesson data:

```typescript
// Current (line 210)
videoUrl={undefined}

// Updated
videoUrl={lesson.videoUrl}
```

---

## Part 6: Sample YouTube Content

### Example Lesson Data Update

Here's how lessons can be configured with YouTube content:

```typescript
{
  id: 'fp-1-1',
  title: 'What is Artificial Intelligence?',
  videoUrl: 'https://www.youtube.com/watch?v=2ePf9rue1Ao', // 3Blue1Brown
  videoDurationSeconds: 480,
  // ... rest of lesson data
}
```

**Curated Educational YouTube Content (Free to Use):**

| Module | Lesson | Suggested YouTube Source |
|--------|--------|-------------------------|
| Intro to AI | What is AI? | CrashCourse or 3Blue1Brown |
| Mathematics | Linear Algebra | 3Blue1Brown Essence of LA |
| Python | Variables | freeCodeCamp Python tutorials |
| Prompt Engineering | Basics | AI Jason or similar |

---

## File Structure Summary

```
src/
├── lib/
│   └── videoUtils.ts           (NEW - URL detection utilities)
├── components/
│   └── learning/
│       ├── YouTubePlayer.tsx   (NEW - YouTube embed component)
│       ├── LessonPlayer.tsx    (UPDATED - conditional rendering)
│       └── index.ts            (UPDATED - export YouTubePlayer)
├── data/
│   ├── foundationPathLessons.ts   (UPDATED - add videoUrl field)
│   └── practicalSkillsLessons.ts  (UPDATED - add videoUrl field)
└── pages/
    └── course/
        └── LessonPage.tsx      (UPDATED - pass videoUrl prop)
```

---

## Technical Details

### YouTube URL Formats Supported
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://www.youtube.com/watch?v=VIDEO_ID&t=123` (with timestamp)
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://youtube.com/shorts/VIDEO_ID`

### Privacy & Performance
- Uses `youtube-nocookie.com` for enhanced privacy (no cookies until play)
- Lazy loading with `loading="lazy"` attribute
- Responsive sizing with aspect-ratio CSS

### UX Considerations
- YouTube videos use YouTube's built-in controls (speed, fullscreen, etc.)
- Bookmark and notes features remain available below the player
- Completed badge still displays when lesson is marked complete
- Keyboard shortcuts for native controls gracefully disabled for YouTube

---

## Future Enhancements (Not in Scope)
- YouTube IFrame API integration for precise progress tracking
- Vimeo embed support
- Auto-pause on tab switch
- Picture-in-Picture for YouTube (requires API)

---

## Summary

This implementation provides a seamless way to use YouTube videos as course content:
- Zero cost for video hosting
- High-quality, reliable video delivery via YouTube CDN
- Easy content curation from educational creators
- Smooth transition path to Cloudinary when original content is ready
- Full learning platform features (notes, bookmarks, completion) work with all video types

