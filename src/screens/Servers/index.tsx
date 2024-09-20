import { useState, useRef, useEffect } from "react";
import { useScroll, motion } from "framer-motion";
import BgContainer from "../../components/BgContainer";
import Button from "../../components/Button";
import Titan_1 from "../../assets/images/server-image-1.png";
import Titan_2 from "../../assets/images/server-image-2.png";
import { handleExternalLink, Links } from "../../data/links";
import { FaPatreon } from "react-icons/fa";

//TODO: use i18n for these texts
const supportText = `Help keep AoTTG 2 running smoothly for players worldwide!

Our Servers:
• US (United States)
• SA (South America)
• EU (Europe)
• CN (China)
• ASIA (Asia)

Your donations directly contribute to maintaining and improving
these servers, ensuring a great gaming experience for all.

100% of donations go towards server costs and improvements.`;

const shakeAnimation = {
  x: [0, -10, 10, -10, 10, 0],
  transition: { duration: 0.5 }
};

const Servers = () => {
  const [showTitan2, setShowTitan2] = useState(false);
  const [shake, setShake] = useState(false);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange(v => {
      if (v > 0.5 && !showTitan2) {
        setShowTitan2(true);
        // Set shake to true after a small delay to ensure the image has changed
        setTimeout(() => setShake(true), 50);
      } else if (v <= 0.5 && showTitan2) {
        setShowTitan2(false);
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress, showTitan2]);

  useEffect(() => {
    if (shake) {
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shake]);

  return (
    <BgContainer title="Support Our Servers" isDark isRightAligned>
      <motion.div
        ref={ref}
        className="lg:absolute lg:top-0 lg:left-0 w-full h-full flex justify-center items-center lg:w-3/5"
        animate={shake ? shakeAnimation : {}}
      >
        <img
          src={showTitan2 ? Titan_2 : Titan_1}
          className="object-cover lg:w-full lg:h-full"
          alt={showTitan2 ? "Titan 2 (stomped)" : "Titan 1 (before stomping)"}
        />
      </motion.div>
      <div className="whitespace-pre-wrap text-gray-300 font-primary text-2xl lg:text-3xl w-full lg:w-2/5 ml-auto flex flex-col gap-12 z-50 [text-shadow:_0_4px_0_rgb(0_0_0_/_40%)]">
        {supportText}
        <Button
          hasBg
          type="secondary"
          hasIcon
          IconComponent={<FaPatreon />}
          onClick={handleExternalLink(Links.Patreon)}
        >
          Support on Patreon
        </Button>
      </div>
    </BgContainer>
  );
};

export default Servers;
