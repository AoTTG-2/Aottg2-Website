import { motion, useScroll, useTransform } from "framer-motion";
import BgDark from "../../assets/images/bg-dark.png";
import BrushImg from "../../assets/images/brush-secondary.png";
import { useRef } from "react";
import BlogPreview from "../../components/BlogPreview";
import BrushSvg from "../../components/BrushSvg";

const brushVariants = {
  initial: {
    x: -60,
    clipPath: "inset(0 100% 0 0)",
  },
  animate: {
    x: -10,
    clipPath: "inset(0 0 0 0)",
    transition: {
      duration: 0.2,
      delay: 1,
    },
  },
};

const HeaderText = () => {
  return (
    <div className="font-primary text-white text-6xl relative w-max z-10">
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Latest News
      </motion.span>
      <BrushSvg
      type="secondary"
        initial="initial"
        animate="animate"
        variants={brushVariants}
        className="absolute top-0 left-0 h-full w-full z-[-1]"
        style={{ x: -10, y: 10 }}
      />
    </div>
  );
};

const News = () => {
  const progressRef = useRef(null);
  const { scrollYProgress } = useScroll();

  const bgY = useTransform(scrollYProgress, [0, 1], [0, -500]);

  const blogsY = useTransform(scrollYProgress, [0, 1], [0, -250]);

  return (
    <div className="w-full relative flex justify-center" ref={progressRef}>
      {/* TODO: Parallax bg  */}
      <motion.img
        style={{
          y: bgY,
        }}
        src={BgDark}
        className="w-full h-[200%] absolute top-0 left-0 z-[-1] scale-y-[200%]"
      />
      <div className="lg: max-w-[1920px] py-24 px-32 w-full">
        {/* container !!! */}
        <div className="flex flex-col z-10 gap-12">
          <HeaderText />
          <motion.div
            className="relative z-20 flex justify-between items-stretch gap-8"
            style={{ y: blogsY }}
          >
            {/* TODO: Don't hardcode */}
            <BlogPreview delay={0.5} />
            <BlogPreview delay={0.75} />
            <BlogPreview delay={1} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default News;
