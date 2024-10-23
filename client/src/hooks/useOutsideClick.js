import { useEffect } from 'react';

/**
 * Custom hook that triggers a callback when a click occurs outside the specified
 * ref element or when specific keys are pressed.
 *
 * @param {React.RefObject} ref - The ref of the element to monitor for outside clicks and key presses.
 * @param {Function} [callback] - The callback function to execute when an outside click is detected or specific keys are pressed.
 * @returns {void}
 */
const useOutsideClick = (ref, callback) => {
  useEffect(() => {
    if (!callback) return;

    /**
     * Handles click events.
     * If the click occurs outside the referenced element, the callback is invoked.
     *
     * @param {MouseEvent} event - The mouse event triggered by the click.
     * @returns {void}
     */
    const handleOutsideClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback(event);
      }
    };

    /**
     * Handles keydown events.
     * If the Escape key is pressed, the callback is invoked and focus returns to the referenced element.
     * If the Tab key is pressed, the callback is invoked if the focus has moved outside the referenced element.
     *
     * @param {KeyboardEvent} event - The keyboard event triggered by a key press.
     * @returns {void}
     */
    const handleKeyPress = (event) => {
      if (event.key === 'Escape') {
        callback(event);
        if (ref.current) {
          ref.current.focus();
        }
      } else if (event.key === 'Tab') {
        setTimeout(() => {
          const focusedElement = document.activeElement;
          if (
            ref.current &&
            !ref.current.contains(focusedElement) &&
            !focusedElement.id.includes('rc-editable-input-')
          ) {
            callback(event);
          }
        }, 0);
      }
    };

    // Add event listeners for click and keydown events
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeyPress);

    // Cleanup function to remove event listeners when the component unmounts or dependencies change
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [ref, callback]);
};

export default useOutsideClick;
