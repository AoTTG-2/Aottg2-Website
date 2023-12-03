import { motion } from "framer-motion";
import BrushImg from "../assets/images/brush-secondary.png";
import BrushSvg from "./BrushSvg";

const brushVariantsHover = {
  initial: {
    x: -60,
    y: 10,
    clipPath: "inset(0 100% 0 0)",
  },
  hover: {
    x: -10,
    clipPath: "inset(0 0 0 0)",
    transition: {
      duration: 0.1,
    },
  },
};

const blogVariants = (delay: number) => ({
  initial: {
    y: 50,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      delay,
    },
  },
  tap: {
    y: 10,
  },
});

const thumbnailVariants = {
  initial: {
    y: 0,
  },
  hover: {
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
};

const BlogPreview = ({ delay }: { delay: number }) => {
  return (
    <motion.div
      className="flex flex-col text-white gap-2 cursor-pointer"
      // TODO: delay to stagger
      variants={blogVariants(delay)}
      whileHover="hover"
      whileTap="tap"
      initial="initial"
      animate="animate"
    >
      <motion.div className="flex flex-col gap-2" variants={thumbnailVariants}>
        <img src="https://via.placeholder.com/512x320" className="w-full" />
        <div className="text-xl font-tertiary">
          January 1, 2022 - Game Update
        </div>
      </motion.div>
      <div className="text-3xl font-secondary relative z-0 w-max">
        Blog Post Update Placeholder Title
        <BrushSvg
          type="secondary"
          variants={brushVariantsHover}
          className="absolute top-0 left-0 h-full w-full z-[-1]"
        />
      </div>
    </motion.div>
  );
};

export default BlogPreview;
