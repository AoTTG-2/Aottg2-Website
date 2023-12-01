import { motion } from "framer-motion";
import Brush from "../assets/images/brush.png";

const buttonVariants = {
  rest: {
    y: 0,
  },
  tap: {
    y: 5,
  },
};

const brushVariants = {
  rest: {
    x: -50,
    clipPath: "inset(0 100% 0 0)",
  },
  hover: {
    x: 0,
    clipPath: "inset(0 0 0 0)",
    transition: {
      duration: 0.15,
    },
  },
};

const textVariants = {
  rest: {
    x: -2,
    y: 0,
  },
  hover: {
    x: 0,
    y: -2,
  },
  tap: {
    y: 0,
  },
};

const Button = ({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const classes = `font-primary uppercase text-white text-2xl ${className} px-8 py-4 flex justify-center items-center leading-1 relative cursor-pointer`;
  return (
    <motion.div
      className={classes}
      variants={buttonVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
    >
      <motion.img
        variants={brushVariants}
        src={Brush}
        style={{
          x: -50,
          clipPath: "inset(0 100% 0 0)",
        }}
        className="absolute top-0 left-0 w-full h-full"
      />
      <motion.span className="translate-y-[2px]" variants={textVariants} style={{ textShadow: '0 4px 0 rgba(0,0,0,0.50)' }}>
        {children}
      </motion.span>
    </motion.div>
  );
};

export default Button;
