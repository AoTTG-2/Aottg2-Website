import { useState, useEffect } from "react";

const useBreakpoint = (breakpoint = 1024) => {
  const [isBelowBreakpoint, setIsBelowBreakpoint] = useState(false);

  useEffect(() => {
    const checkBreakpoint = () => {
      setIsBelowBreakpoint(window.innerWidth < breakpoint);
    };

    // Check on mount
    checkBreakpoint();

    // Add event listener
    window.addEventListener("resize", checkBreakpoint);

    // Clean up
    return () => window.removeEventListener("resize", checkBreakpoint);
  }, [breakpoint]);

  return isBelowBreakpoint;
};

export default useBreakpoint;
