import { useCallback, useEffect, useRef, useState } from "react";
import LandingLogo from "../../assets/images/logo-placeholder.webp";
import videoClips from "../../data/videoClips";
import Button from "../../components/Button";
import { handleExternalLink, playGameLink } from "../../data/links";

const VIDEO_POSTER = "/video-first-frame.webp";

const Landing = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const blobUrlsRef = useRef<Map<number, string>>(new Map());
  const pendingVideoRequestsRef = useRef<Map<number, Promise<string>>>(new Map());
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [canLoadVideo, setCanLoadVideo] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const shouldPlay = canLoadVideo && isInView && !prefersReducedMotion;

  const cacheVideoClip = useCallback(async (index: number) => {
    const cachedUrl = blobUrlsRef.current.get(index);
    if (cachedUrl) return cachedUrl;

    const pendingRequest = pendingVideoRequestsRef.current.get(index);
    if (pendingRequest) return pendingRequest;

    const request = fetch(videoClips[index], { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load hero video ${index}`);
        }
        return response.blob();
      })
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        blobUrlsRef.current.set(index, objectUrl);
        pendingVideoRequestsRef.current.delete(index);
        return objectUrl;
      })
      .catch(() => {
        pendingVideoRequestsRef.current.delete(index);
        return videoClips[index];
      });

    pendingVideoRequestsRef.current.set(index, request);
    return request;
  }, []);

  const handleVideoEnded = useCallback(() => {
    setCurrentVideoIndex((index) => (index + 1) % videoClips.length);
    setVideoSource(null);
    setIsVideoReady(false);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.15 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const scheduleVideoLoad = () => {
      if ("requestIdleCallback" in window) {
        const idleId = window.requestIdleCallback(() => setCanLoadVideo(true), {
          timeout: 1500,
        });
        return () => window.cancelIdleCallback(idleId);
      }

      const timer = setTimeout(() => setCanLoadVideo(true), 600);
      return () => clearTimeout(timer);
    };

    if (document.readyState === "complete") {
      return scheduleVideoLoad();
    }

    let cleanup = () => {};
    const onLoad = () => {
      cleanup = scheduleVideoLoad();
    };

    window.addEventListener("load", onLoad, { once: true });

    return () => {
      window.removeEventListener("load", onLoad);
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (!canLoadVideo) return;

    let isCancelled = false;

    setVideoSource(null);
    setIsVideoReady(false);

    cacheVideoClip(currentVideoIndex).then((source) => {
      if (!isCancelled) setVideoSource(source);
    });

    return () => {
      isCancelled = true;
    };
  }, [cacheVideoClip, canLoadVideo, currentVideoIndex]);

  useEffect(() => {
    const blobUrls = blobUrlsRef.current;
    const pendingVideoRequests = pendingVideoRequestsRef.current;

    return () => {
      blobUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
      blobUrls.clear();
      pendingVideoRequests.clear();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const syncPlayback = () => {
      if (document.hidden || !shouldPlay) {
        video.pause();
        return;
      }

      void video.play().catch(() => {
        // Browser autoplay policies can reject play; keep the poster visible.
      });
    };

    syncPlayback();
    document.addEventListener("visibilitychange", syncPlayback);

    return () => document.removeEventListener("visibilitychange", syncPlayback);
  }, [currentVideoIndex, shouldPlay, videoSource]);

  return (
    <section
      ref={containerRef}
      className="h-[40vw] min-h-[320px] bg-black overflow-hidden relative mt-16 md:mt-0"
      aria-label="Attack on Titan Tribute Game 2 hero"
    >
      <h1 className="sr-only">Attack on Titan Tribute Game 2</h1>
      <div className="absolute inset-0">
        <img
          src={VIDEO_POSTER}
          alt=""
          aria-hidden="true"
          width="1920"
          height="1080"
          className={`absolute w-full h-full object-cover transition-opacity duration-500 ${
            isVideoReady ? "opacity-0" : "opacity-100"
          }`}
        />
        {canLoadVideo && videoSource && (
          <video
            ref={videoRef}
            key={currentVideoIndex}
            className={`absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 object-cover transition-opacity duration-500 ${
              isVideoReady ? "opacity-100" : "opacity-0"
            }`}
            poster={VIDEO_POSTER}
            preload="auto"
            autoPlay={!prefersReducedMotion}
            muted
            playsInline
            disablePictureInPicture
            aria-hidden="true"
            onCanPlay={() => setIsVideoReady(true)}
            onWaiting={() => setIsVideoReady(false)}
            onEnded={handleVideoEnded}
          >
            <source src={videoSource} type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <div className="absolute inset-0 bg-black opacity-50" />
      </div>
      <div className="absolute inset-0 bg-[rgba(0,0,0,0)] flex flex-col items-center gap-4 lg:gap-8 justify-center">
        <img
          src={LandingLogo}
          className="w-[12rem] md:w-[24rem] lg:w-[36rem]"
          alt="Attack on Titan Tribute Game 2 logo"
          width="1000"
          height="328"
          decoding="async"
        />
        <Button
          className="text-lg md:text-xl lg:text-3xl"
          onClick={handleExternalLink(playGameLink)}
        >
          Play for free
        </Button>
      </div>
    </section>
  );
};

export default Landing;
