import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import BrushSvg from "./BrushSvg";

const buttonVariants = {
  rest: { y: 0 },
  tap: { y: 5 },
};

const brushVariants = {
  hidden: {
    x: -50,
    clipPath: "inset(0 100% 0 0)",
  },
  visible: {
    x: 0,
    clipPath: "inset(0 0 0 0)",
    transition: {
      duration: 0.5,
    },
  },
  hover: {
    x: 0,
    clipPath: "inset(0 0 0 0)",
    transition: {
      duration: 0.15,
    },
  },
};

const hasBgBrushVariants = {
  hidden: {
    x: 0,
    clipPath: "inset(0 100% 0 0)",
  },
  visible: {
    x: 0,
    clipPath: "inset(0 0 0 0)",
    transition: {
      duration: 0.5,
    },
  },
  hover: {
    x: 0,
    y: -4,
    clipPath: "inset(0 0 0 0)",
    transition: {
      duration: 0.15,
    },
  },
};

const textVariants = {
  rest: { x: 0, y: 0 },
  hover: { x: 0, y: -4 },
  tap: { y: 0 },
};

const Button = ({
  className = "",
  hasBg = true,
  children,
  type = "primary",
  onClick,
}: any) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.5,
  });

  const classes = `select-none font-primary uppercase text-white text-xl md:text-2xl lg:text-3xl ${className} px-8 py-4 flex justify-center items-center leading-1 relative cursor-pointer`;

  return (
    <motion.div
      ref={ref}
      className={classes}
      variants={buttonVariants}
      onClick={onClick}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
    >
      <BrushSvg
        variants={hasBg ? hasBgBrushVariants : brushVariants}
        type={type}
        className="absolute top-0 left-0 w-full h-full"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        whileHover="hover"
      />
      <motion.span
        className="translate-y-[2px] z-[50]"
        variants={textVariants}
        style={{ textShadow: "0 4px 0 rgba(0,0,0,0.50)" }}
      >
        {children}
      </motion.span>
    </motion.div>
  );
};

export default Button;
