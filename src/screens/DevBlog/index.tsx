import { useState } from "react";
import BgContainer from "../../components/BgContainer";

const YOUTUBE_ID = "xXX0lk-z2F0";

const DevBlog = () => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  return (
    <BgContainer title="Latest Devblog" isDark shouldShowCrack={false}>
      <div className="relative w-full overflow-hidden rounded bg-black pt-[56.25%] shadow-2xl">
        {isVideoLoaded ? (
          <iframe
            title="AoTTG 2 latest development blog video"
            src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0`}
            className="absolute top-0 left-0 w-full h-full"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsVideoLoaded(true)}
            className="absolute inset-0 group flex h-full w-full items-center justify-center overflow-hidden bg-black text-white"
            aria-label="Play latest AoTTG 2 development blog video"
          >
            <img
              src={`https://i.ytimg.com/vi/${YOUTUBE_ID}/hqdefault.jpg`}
              alt="Latest AoTTG 2 development blog video thumbnail"
              loading="lazy"
              decoding="async"
              width="480"
              height="360"
              className="h-full w-full object-cover opacity-75 transition duration-300 group-hover:scale-105 group-hover:opacity-90"
            />
            <span className="absolute flex h-20 w-20 items-center justify-center rounded-full bg-primary/90 text-4xl shadow-lg transition duration-300 group-hover:scale-110">
              ▶
            </span>
          </button>
        )}
      </div>
    </BgContainer>
  );
};

export default DevBlog;
