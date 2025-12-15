import React, { MutableRefObject, useEffect, useRef, useState } from 'react';

function useOnScreen(
  ref: MutableRefObject<HTMLDivElement | null>,
  rootMargin = '0px'
) {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    let currentRef: HTMLDivElement | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIntersecting(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
      }
    );
    if (ref && ref?.current) {
      currentRef = ref.current;
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [ref, rootMargin]); // Empty array ensures that effect is only run on mount and unmount

  return isIntersecting;
}

const LazyShow = ({ children }: { children: React.ReactChild }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(rootRef);
  return (
    <div
      className={`lazy-div transform-gpu transition duration-500 ease-out will-change-transform ${
        onScreen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
      }`}
      ref={rootRef}
    >
      {children}
    </div>
  );
};

export default LazyShow;
