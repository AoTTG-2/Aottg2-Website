import ReactPlayer from "react-player";
import LandingLogo from "../../assets/images/logo-placeholder.webp";
import { useState } from "react";
import videoClips from "../../data/videoClips";
import Button from "../../components/Button";
import { handleExternalLink, playGameLink } from "../../data/links";

const Landing = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [isVideoLoading, setIsVideoLoading] = useState(true); // Add loading state

  const handleAnimationEnd = () => {
    setCurrentVideoIndex((currentVideoIndex + 1) % videoClips.length);
  };

  return (
    <div className="h-[40vw] bg-black overflow-hidden relative mt-16 md:mt-0">
      <div className="absolute inset-0">
        {isVideoLoading && (
          <img
            src="/video-placeholder.webp"
            alt="Video placeholder"
            className="absolute w-full h-full object-cover"
          />
        )}
        <ReactPlayer
          url={videoClips[currentVideoIndex]}
          loop={false}
          onEnded={handleAnimationEnd}
          onReady={() => setIsVideoLoading(false)} // Add this
          onBuffer={() => setIsVideoLoading(true)} // Add this
          playing
          muted
          width="100%"
          height="100%"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            objectFit: "cover",
            opacity: isVideoLoading ? 0 : 1, // Add this
          }}
          config={{
            file: {
              attributes: {
                style: {
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                },
              },
            },
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <div className="absolute inset-0 bg-black opacity-50" />
      </div>
      <div className="absolute inset-0 bg-[rgba(0,0,0,0)] flex flex-col items-center gap-4 lg:gap-8 justify-center">
        <img
          src={LandingLogo}
          className="w-[12rem] md:w-[24rem] lg:w-[36rem]"
          alt="Landing Logo"
        />
        <Button
          className="text-lg md:text-xl lg:text-3xl"
          onClick={handleExternalLink(playGameLink)}
        >
          Play for free
        </Button>
      </div>
    </div>
  );
};

export default Landing;
