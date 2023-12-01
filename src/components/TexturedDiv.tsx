import BgLight from "../assets/images/bg-light.png";
import CrackedSvg from "./CrackedSvg";
import NavbarSvg from "./NavbarSvg";
const TexturedDiv = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="absolute w-full h-max translate-y-[-100%] z-5 bg-transparent">
        <CrackedSvg
          className="w-full h-auto scale-[-100%] z-[1] "
          color="#f0f0f0"
        />
      </div>
      <div style={{ backgroundImage: `url(${BgLight})` }} className="h-[100vh]">
        {children}
      </div>
      <div className="absolute w-full h-max z-5 bg-transparent">
        <CrackedSvg
          className="w-full h-auto z-[1] "
          color="#f0f0f0"
        />
      </div>
    </>
  );
};

export default TexturedDiv;
