import BgLight from "../assets/images/bg-light.png";
import CrackedSvg from "./CrackedSvg";

const TexturedDiv = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="absolute w-full h-max translate-y-[-100%] z-5 bg-transparent">
        <CrackedSvg
          className="w-full h-auto scale-[-100%] z-[1] "
          color="#f0f0f0"
        />
      </div>

      <div
        style={{ backgroundImage: `url(${BgLight})` }}
        className="h-[100vh] relative"
      >
        <div className="relative z-10">{children}</div>
        <div className="h-24 absolute top-0 w-full bg-gradient-to-b from-[#f0f0f0] to-transparent" />
        <div className="h-24 absolute bottom-0 w-full bg-gradient-to-t from-[#f0f0f0] to-transparent" />
      </div>

      <div className="absolute w-full h-max z-5 bg-transparent">
        <CrackedSvg className="absolute top-0 w-full h-auto z-[2] " color="#f0f0f0" />
        <CrackedSvg className="absolute top-3 w-full h-auto z-[1] opacity-50" color="black" />
      </div>
    </>
  );
};

export default TexturedDiv;
