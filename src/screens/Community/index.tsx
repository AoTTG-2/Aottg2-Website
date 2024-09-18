import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import BgContainer from "../../components/BgContainer";
import CommunityImg from "../../assets/images/community.png";
import Button from "../../components/Button";
import { handleExternalLink, Links } from "../../data/links";

const Community = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Transform the scroll progress to the desired x position
  const xPosition = useTransform(scrollYProgress, [0, 1], ["50%", "35%"]);

  return (
    <BgContainer title="Join the Community">
      <div
        ref={ref}
        className="flex flex-col lg:flex-row gap-12 lg:mt-4 text-gray-950 relative"
      >
        {/* This div will only be visible on medium and smaller screens */}
        <div className="w-full lg:hidden">
          <img
            src={CommunityImg}
            className="w-full h-auto object-cover"
            alt="Community"
          />
        </div>
        <div className="text-center lg:text-left lg:flex-none lg:w-2/5 lg:pr-4 font-primary text-2xl lg:text-4xl flex flex-col gap-12 z-10">
          <span>
            Join our AoTTG 2 Discord! Connect with players, get updates, and
            share strategies. Chat with our team, report issues, and dive into
            game discussions. Whether you're a veteran or new recruit, there's a
            place for you here. Join us beyond the walls!
          </span>
          <Button hasBg onClick={handleExternalLink(Links.Discord)}>
            Join the Discord
          </Button>
        </div>
      </div>

      {/* This AnimatedImage will only be visible on large screens and above */}
      <motion.div
        className="absolute top-0 right-0 w-full h-full hidden lg:block"
        style={{ x: xPosition }}
      >
        <img
          src={CommunityImg}
          className="h-full w-auto object-cover object-left"
          alt="Community"
        />
      </motion.div>
    </BgContainer>
  );
};

export default Community;
