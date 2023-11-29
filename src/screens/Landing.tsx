import ReactPlayer from "react-player";
import Video1 from "../assets/videos/0001-0163.mp4";
import { useMeasure } from "react-use";
import { useEffect, useState } from "react";

const Landing = () => {
  const [containerRef, { height, width }] = useMeasure<HTMLDivElement>();
  const [playerPadding, setPlayerPadding] = useState<number>(0);

  useEffect(() => {
    setPlayerPadding(100 / (width / height));
  }, [height, width]);

  console.log({ height });
  console.log({ width });

  const playerWrapperClass = `relative`;

  return (
    <div
      ref={containerRef}
      className="h-[40vw] bg-black overflow-hidden relative"
    >
      <div
        className={playerWrapperClass}
        style={{ padding: `${playerPadding}%` }}
      >
        <ReactPlayer
          url={Video1}
          playing={true}
          loop={true}
          muted={true}
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
      </div>
    </div>
  );
};

export default Landing;
