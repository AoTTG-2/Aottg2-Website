import React from "react";
import { motion, useInView } from "framer-motion";
import BrushSvg from "./BrushSvg";

const brushVariants = {
  hidden: {
    x: -60,
    clipPath: "inset(0 100% 0 0)",
  },
  visible: {
    x: -10,
    clipPath: "inset(0 0 0 0)",
    transition: {
      duration: 0.2,
      delay: 0.5,
    },
  },
};

const HeaderText = ({
  title,
  isDark = false,
}: {
  title: string;
  isDark?: boolean;
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.5,
  });

  return (
    <div
      ref={ref}
      className={`font-primary ${
        isDark ? "text-[#b53c48]" : "text-white"
      } text-4xl lg:text-6xl relative w-max z-10`}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      >
        {title}
      </motion.span>
      {!isDark && (
        <BrushSvg
          color={!isDark ? "#614c90" : "#b53c48"}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={brushVariants}
          className="absolute top-0 left-0 h-full w-full z-[-1]"
          style={{ x: -10, y: 10 }}
        />
      )}
    </div>
  );
};

export default HeaderText;
