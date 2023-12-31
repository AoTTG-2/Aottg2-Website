import ReactPlayer from "react-player";
import LandingLogo from "../../assets/images/logo-placeholder.png";
import { useMeasure } from "react-use";
import { useEffect, useState } from "react";
import videoClips from "../../data/videoClips";
import Button from "../../components/Button";
import BrushSvg from "../../components/BrushSvg";

const Landing = () => {
  const [containerRef, { height, width }] = useMeasure<HTMLDivElement>();
  const [playerPadding, setPlayerPadding] = useState<number>(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);

  useEffect(() => {
    setPlayerPadding(100 / (width / height));
  }, [height, width]);

  const handleAnimationEnd = () => {
    //loop through videoclips
    setCurrentVideoIndex((currentVideoIndex + 1) % videoClips.length);
  };

  return (
    <div
      ref={containerRef}
      className="h-[40vw] bg-black overflow-hidden relative"
    >
      <div className="relative" style={{ padding: `${playerPadding}%` }}>
        <ReactPlayer
          url={videoClips[currentVideoIndex]}
          loop={false}
          onEnded={handleAnimationEnd}
          playing
          muted
          height="100%"
          width="100"
          // TODO: fix top positioning
          style={{
            position: "absolute",
            top: "-20%",
            left: 0,
            objectFit: "cover",
          }}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black to-transparent" />
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50" />
        {/* Container */}
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-[rgba(0,0,0,0)] flex flex-col items-center gap-8 justify-center">
        <img src={LandingLogo} className="w-[36rem]" />
        <Button>
            Play for free
        </Button>
      </div>
    </div>
  );
};

export default Landing;
