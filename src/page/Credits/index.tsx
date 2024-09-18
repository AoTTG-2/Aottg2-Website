import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { creditJson } from "../../data/links";
import BackgroundImage from "../../assets/images/bg-dark.png";
import BrushSvg from "../../components/BrushSvg";

interface CreditItem {
  Category: string;
  Names: string[];
}

const brushVariants = {
  hidden: {
    x: -60,
    clipPath: "inset(0 100% 0 0)",
  },
  visible: {
    x: -10,
    clipPath: "inset(0 0 0 0)",
    transition: {
      duration: 0.2,
      delay: 0.5,
    },
  },
};

const colors = ["#614c90", "#b53c48", "#3cb371"];

const CreditHeader: React.FC<{ category: string; colorIndex: number }> = ({
  category,
  colorIndex,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.5,
  });

  return (
    <div
      ref={ref}
      className="font-primary text-white text-3xl lg:text-4xl relative w-max z-10"
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      >
        {category}
      </motion.span>
      <BrushSvg
        color={colors[colorIndex]}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={brushVariants}
        className="absolute top-0 left-0 h-full w-full z-[-1]"
        style={{ x: -10, y: 10 }}
      />
    </div>
  );
};

const CreditList: React.FC<{ names: string[] }> = ({ names }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.2,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.ul
      ref={ref}
      className="flex flex-col justify-center items-center"
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {names.map((name, index) => (
        <motion.li
          className="text-white font-primary text-xl"
          key={index}
          variants={itemVariants}
        >
          {name}
        </motion.li>
      ))}
    </motion.ul>
  );
};

const Credits: React.FC = () => {
  const [credits, setCredits] = useState<CreditItem[]>([]);

  useEffect(() => {
    fetch(creditJson)
      .then((response) => response.json())
      .then((data: CreditItem[]) => setCredits(data))
      .catch((error) => console.error("Error fetching credits:", error));
  }, []);

  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${BackgroundImage})`,
          aspectRatio: "16 / 9",
          minHeight: "100vh",
          margin: "auto",
          filter: "brightness(0.2)",
        }}
      />
      <div className="relative z-10 flex flex-col justify-center items-center gap-8 lg:max-w-[1920px] py-24 px-12">
        {credits.map((credit, index) => (
          <div
            key={index}
            className="flex flex-col justify-center items-center gap-4"
          >
            <CreditHeader
              category={credit.Category}
              colorIndex={index % colors.length}
            />
            <CreditList names={credit.Names} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Credits;
