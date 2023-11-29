import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import NavbarTexture from "../../assets/images/bg-light.png";
import Logo from "../../assets/images/logo-placeholder-dark.png";
import NavbarSvg from "../../components/NavbarSvg";
import { useState } from "react";

const Navbar = () => {
  const { scrollY } = useScroll();
  const [scrollProgress, setScrollProgress] = useState(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrollProgress(latest);
  });

  const navbarVariants = {
    animate: {
      y: scrollProgress > 0 ? 0 : -200,
      // y: 0,
      transition: {
        type: "tween",
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      variants={navbarVariants}
      animate="animate"
      className="fixed top-0 z-50 w-full"
    >
      <NavbarSvg
        className="absolute top-0 w-full h-auto z-[49]"
        image={NavbarTexture}
      />
      <NavbarSvg
        color="black"
        className="w-full h-auto absolute top-3 z-[48] opacity-50"
      />
      <div className="absolute w-full h-24 px-8 z-50 flex justify-start items-center">
        {/* TODO: do something about containing them*/}
        <img src={Logo} className="h-12" />
      </div>
    </motion.div>
  );
};

export default Navbar;
