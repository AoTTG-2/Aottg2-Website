import { motion, useScroll, useTransform } from "framer-motion";
import BgDark from "../../assets/images/bg-dark.png";
import { useRef } from "react";
import BlogPreview from "../../components/BlogPreview";
import HeaderText from "../../components/HeaderText";


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
          <HeaderText title="Latest News"/>
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
