import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import NavbarTexture from "../../assets/images/bg-light.webp";
import Logo from "../../assets/images/navbar-image.webp";
import { useAuth } from "../../auth/useAuth";
import { NAVBAR_HEIGHT_CLASS, NAVBAR_LOGO_HEIGHT_CLASS } from "../../data/layout";
import useBreakpoint from "../../utils/useBreakpoint";

interface NavbarProps {
  refs: {
    [key: string]: React.RefObject<HTMLDivElement>;
  };
}

interface MenuItem {
  name: string;
  id?: string;
  path?: string;
}

const Navbar: React.FC<NavbarProps> = ({ refs }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useBreakpoint(768);
  const { isAuthenticated } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { name: "DEVBLOG", id: "devblog" },
    { name: "COMMUNITY", id: "community" },
    { name: "SUPPORT", id: "support" },
    { name: "CREDITS", id: "credits" },
    { name: "PLAY", id: "home" },
    { name: isAuthenticated ? "ACCOUNT" : "LOGIN", path: isAuthenticated ? "/accounts" : "/login" },
  ];

  const scrollToSection = (id: string) => {
    if (id === "credits") {
      navigate("/credits");
      window.scrollTo(0, 0);
    } else {
      if (location.pathname !== "/") {
        navigate("/");
      }
      setTimeout(() => {
        const element = refs[id]?.current;
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
    setIsMenuOpen(false);
  };

  const handleMenuItem = (item: MenuItem) => {
    if (item.path) {
      navigate(item.path);
      window.scrollTo(0, 0);
      setIsMenuOpen(false);
      return;
    }

    if (item.id) {
      scrollToSection(item.id);
    }
  };

  return (
    <motion.div className="fixed top-0 z-[100] w-full">
      <div
        className={`w-full ${NAVBAR_HEIGHT_CLASS} px-4 md:px-8 z-50 flex justify-between items-center relative overflow-hidden shadow-lg`}
        style={{
          backgroundImage: `url(${NavbarTexture})`,
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 100%",
          backgroundPosition: "center",
        }}
      >
        <img
          src={Logo}
          className={`${NAVBAR_LOGO_HEIGHT_CLASS} w-auto flex-shrink-0 object-contain cursor-pointer`}
          alt="AoTTG 2 home"
          width="453"
          height="155"
          decoding="async"
          onClick={() => scrollToSection("home")}
        />
        {isMobile ? (
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-black text-2xl focus:outline-none"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
          >
            ☰
          </button>
        ) : (
          <div className="flex flex-row gap-6 font-primary text-black">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleMenuItem(item)}
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
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleMenuItem(item)}
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
