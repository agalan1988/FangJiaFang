import { useState, useEffect } from "react";

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkSize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener("resize", checkSize);
    
    // Initial check
    checkSize();

    return () => window.removeEventListener("resize", checkSize);
  }, [breakpoint]);

  return isMobile;
}
