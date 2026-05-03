// Downloads a video with a DIM watermark burned in via Canvas + MediaRecorder.
// Inspired by TikTok-style watermarks (logo + handle in corners).

const LOGO_URL = "/icons/icon-192.png";
const BRAND = "DIM • digitalintelligencemarketplace.com";

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const loadVideo = (src: string): Promise<HTMLVideoElement> =>
  new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = false;
    video.playsInline = true;
    video.preload = "auto";
    video.src = src;
    video.onloadedmetadata = () => resolve(video);
    video.onerror = () => reject(new Error("Failed to load video"));
  });

const pickMimeType = (): string => {
  const candidates = [
    "video/mp4;codecs=h264,aac",
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  for (const t of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t;
  }
  return "video/webm";
};

export interface WatermarkProgress {
  (ratio: number): void;
}

export async function downloadVideoWithWatermark(
  videoUrl: string,
  filenameBase = "dim-reel",
  onProgress?: WatermarkProgress,
): Promise<void> {
  const [video, logo] = await Promise.all([loadVideo(videoUrl), loadImage(LOGO_URL).catch(() => null)]);

  const width = video.videoWidth || 720;
  const height = video.videoHeight || 1280;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const canvasStream: MediaStream = (canvas as HTMLCanvasElement & {
    captureStream: (fps?: number) => MediaStream;
  }).captureStream(30);

  // Try to also capture audio from the video element
  try {
    const v = video as HTMLVideoElement & {
      captureStream?: () => MediaStream;
      mozCaptureStream?: () => MediaStream;
    };
    const audioStream: MediaStream | undefined = v.captureStream?.() || v.mozCaptureStream?.();
    if (audioStream) {
      audioStream.getAudioTracks().forEach((t) => canvasStream.addTrack(t));
    }
  } catch {
    // ignore — silent watermarked video is acceptable fallback
  }

  const mimeType = pickMimeType();
  const recorder = new MediaRecorder(canvasStream, { mimeType, videoBitsPerSecond: 4_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const watermarkH = Math.max(40, Math.round(height * 0.06));
  const padding = Math.round(height * 0.025);

  const drawFrame = () => {
    ctx.drawImage(video, 0, 0, width, height);

    // Bottom-left watermark
    const x = padding;
    const y = height - padding - watermarkH;

    if (logo) {
      const logoSize = watermarkH;
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 6;
      ctx.drawImage(logo, x, y, logoSize, logoSize);
      ctx.restore();
    }

    const textX = (logo ? watermarkH + padding * 1.5 : padding) + (logo ? 0 : 0);
    ctx.save();
    ctx.font = `600 ${Math.round(watermarkH * 0.38)}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.shadowColor = "rgba(0,0,0,0.7)";
    ctx.shadowBlur = 4;
    ctx.textBaseline = "middle";
    ctx.fillText(BRAND, padding + (logo ? watermarkH + padding : 0), y + watermarkH / 2);
    ctx.restore();

    // Top-right small handle
    ctx.save();
    ctx.font = `500 ${Math.round(watermarkH * 0.32)}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.shadowColor = "rgba(0,0,0,0.7)";
    ctx.shadowBlur = 4;
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("@DIM", width - padding, padding);
    ctx.restore();
  };

  let rafId = 0;
  const renderLoop = () => {
    if (video.ended || video.paused) return;
    drawFrame();
    if (video.duration && onProgress) onProgress(Math.min(1, video.currentTime / video.duration));
    rafId = requestAnimationFrame(renderLoop);
  };

  recorder.start(250);
  await video.play();
  renderLoop();

  await new Promise<void>((resolve) => {
    video.onended = () => resolve();
  });
  cancelAnimationFrame(rafId);
  // small delay to flush last frame
  await new Promise((r) => setTimeout(r, 200));
  recorder.stop();

  await new Promise<void>((resolve) => {
    recorder.onstop = () => resolve();
  });

  const ext = mimeType.includes("mp4") ? "mp4" : "webm";
  const blob = new Blob(chunks, { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filenameBase}.${ext}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
