import React, { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import NavbarTexture from "../../assets/images/bg-dark.png";
import Logo from "../../assets/images/logo-placeholder.png";
import useBreakpoint from "../../utils/useBreakpoint";
import { useLocation, useNavigate } from "react-router-dom";

interface NavbarProps {
  refs: {
    [key: string]: React.RefObject<HTMLDivElement>;
  };
}

const Navbar: React.FC<NavbarProps> = ({ refs }) => {
  const { scrollY } = useScroll();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useBreakpoint(768);

  const navigate = useNavigate();
  const location = useLocation();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrollProgress(latest);
  });

  const navbarVariants = {
    animate: {
      y: !isMobile && scrollProgress > 0 ? 0 : isMobile ? 0 : -200,
      transition: {
        type: "tween",
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  };

  const menuItems = [
    { name: "DEVBLOG", id: "devblog" },
    { name: "COMMUNITY", id: "community" },
    { name: "SUPPORT", id: "support" },
    { name: "CREDITS", id: "credits" },
    { name: "PLAY", id: "home" },
  ];

  const scrollToSection = (id: string) => {
    if (id === "credits") {
      navigate("/credits");
      window.scrollTo(0, 0);
    } else {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const element = refs[id]?.current;
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      } else {
        const element = refs[id]?.current;
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  return (
    <motion.div
      variants={navbarVariants}
      animate="animate"
      className="fixed top-0 z-[100] w-full"
    >
      <div
        className={`w-full ${
          isMobile ? "h-16" : "h-24"
        } px-4 md:px-8 z-50 flex justify-between items-center relative overflow-hidden shadow-lg`}
        style={{
          backgroundImage: `url(${NavbarTexture})`,
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 100%",
          backgroundPosition: "center",
        }}
      >
        <img
          src={Logo}
          className={`${isMobile ? "h-8" : "h-12"} cursor-pointer`}
          alt="Logo"
          onClick={() => scrollToSection("home")}
        />
        {isMobile ? (
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white text-2xl focus:outline-none"
          >
            ☰
          </button>
        ) : (
          <div className="flex flex-row gap-6 font-primary text-white">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(item.id)}
                className="cursor-pointer hover:text-[#852837] transition-colors duration-300"
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobile && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: isMenuOpen ? "auto" : 0,
            opacity: isMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="bg-[#111111] text-white overflow-hidden font-primary"
        >
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => scrollToSection(item.id)}
              className="w-full text-left p-4 hover:bg-gray-800 transition-colors duration-300"
            >
              {item.name}
            </button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Navbar;
