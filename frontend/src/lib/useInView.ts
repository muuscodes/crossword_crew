import { useEffect, useRef, useState } from "react";

// True once the element has scrolled into view, and it stays true after that. Without
// IntersectionObserver (very old browsers, tests), everything counts as in view straight away.
export function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(() => typeof IntersectionObserver !== "function");

  useEffect(() => {
    const element = ref.current;
    if (inView || !element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [inView]);

  return [ref, inView] as const;
}
