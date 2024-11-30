import { useState, useEffect } from 'react';

const useScrollDetect = (ref, content) => {
  const [hasScrollbar, setHasScrollbar] = useState(false);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      // Set the scrollbar state to true if the element's content exceeds its visible height, indicating the presence of a scrollbar
      setHasScrollbar(ref.current.scrollHeight > ref.current.clientHeight);
    });

    if (ref.current && content) {
      resizeObserver.observe(ref.current); // Observe the specific element
    }

    // Cleanup observer on unmount
    return () => {
      resizeObserver.disconnect();
    };
  }, [ref, content]);

  return hasScrollbar;
};

export default useScrollDetect;
