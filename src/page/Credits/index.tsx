import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { creditsApi } from "../../auth/creditsApi";
import type { PublicCreditCategory } from "../../auth/creditsTypes";
import { creditJson } from "../../data/links";
import BackgroundImage from "../../assets/images/bg-dark.webp";
import BrushSvg from "../../components/BrushSvg";

interface LegacyCreditItem {
  Category: string;
  Names: string[];
}

const normalizeCredit = (credit: PublicCreditCategory): PublicCreditCategory => ({
  ...credit,
  description: credit.description ?? null,
  contributors: credit.contributors ?? [],
  groups: credit.groups ?? [],
});

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
  const [credits, setCredits] = useState<PublicCreditCategory[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCredits() {
      const fallback = async () => {
        const response = await fetch(creditJson);
        const data = await response.json() as LegacyCreditItem[];
        setCredits(data.map((credit) => ({
          name: credit.Category,
          description: null,
          contributors: credit.Names.map((name) => ({ name })),
          groups: [],
        })));
      };

      let useFallback = true;
      try {
        const { ok, data } = await creditsApi.getPublic(controller.signal);
        if (controller.signal.aborted) return;
        if (ok && data.categories?.length) {
          setCredits(data.categories.map(normalizeCredit));
          useFallback = false;
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Error fetching credits:", error);
        }
      }

      if (useFallback && !controller.signal.aborted) await fallback();
    }

    void loadCredits();
    return () => controller.abort();
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
      <div className="relative z-10 flex flex-col justify-center items-center gap-8 lg:max-w-[1920px] py-24 px-12 mx-auto my-0">
        {credits.map((credit, index) => (
          <div
            key={index}
            className="flex flex-col justify-center items-center gap-4"
          >
            <CreditHeader
              category={credit.name}
              colorIndex={index % colors.length}
            />
            {credit.description ? <p className="max-w-2xl text-center text-white/80">{credit.description}</p> : null}
            {credit.contributors.length ? <CreditList names={credit.contributors.map((contributor) => contributor.name)} /> : null}
            {credit.groups.map((group, groupIndex) => (
              <div key={`${group.title}-${groupIndex}`} className="flex flex-col items-center gap-2">
                <h3 className="font-primary text-white text-2xl">{group.title}</h3>
                <CreditList names={group.contributors.map((contributor) => contributor.name)} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Credits;
