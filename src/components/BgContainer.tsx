import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import HeaderText from "./HeaderText";
import BgDark from "../assets/images/bg-dark.png";
import BgLight from "../assets/images/bg-light.png";
import CrackedSvg from "./CrackedSvg";
import useBreakpoint from "../utils/useBreakpoint";

interface BgContainerProps {
  id?: string;
  isDark?: boolean;
  shouldShowCrack?: boolean;
  isRightAligned?: boolean;
  customSrc?: string;
  title?: string;
  children: React.ReactNode;
  isFooter?: boolean;
}

const BgContainer: React.FC<BgContainerProps> = ({
  id,
  isDark = false,
  shouldShowCrack = true,
  isRightAligned = false,
  customSrc,
  title = "",
  isFooter,
  children,
}) => {
  const { scrollYProgress } = useScroll();
  const isMobile = useBreakpoint(768);
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1.2]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <div
      id={id}
      className="w-full relative flex justify-center overflow-hidden"
    >
      {shouldShowCrack && (
        <>
          <CrackedSvg
            className="absolute top-0 left-0 z-[50]"
            color={!isDark ? "#111111" : "#f0f0f0"}
          />
          <CrackedSvg
            className="absolute top-2 left-0 z-[45] opacity-50"
            color="black"
          />
        </>
      )}

      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {customSrc ? (
          <motion.img
            src={customSrc}
            className="w-full h-full object-cover"
            alt="Background"
            style={{ scale, y }}
          />
        ) : (
          <img
            src={isDark ? BgDark : BgLight}
            className="w-full h-full object-cover"
            alt="Background"
          />
        )}
      </div>

      <div
        className={`lg:max-w-[1920px] ${
          isFooter ? "mb-12" : "py-12 px-16 lg:py-24 lg:px-32"
        } w-full relative z-10`}
      >
        <div
          className={`flex flex-col z-10 gap-12 ${
            isMobile
              ? "items-center" // Always center on mobile
              : isRightAligned
              ? "items-end"
              : ""
          }`}
        >
          <HeaderText title={title} isDark={!isDark} />
          {children}
        </div>
      </div>

      {!customSrc && !isFooter && (
        <div
          className={`absolute translate-y-1 bottom-0 left-0 w-[100vw] z-[50] h-16 bg-gradient-to-t ${
            isDark ? "from-[#111111]" : "from-[#f0f0f0]"
          } to-transparent`}
        />
      )}
    </div>
  );
};

export default BgContainer;
