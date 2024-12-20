import PropTypes from 'prop-types';
import React, { useMemo, useState, useRef, useEffect } from 'react';
import useScrollDetect from '../../hooks/useScrollDetect';
import { motion, AnimatePresence } from 'framer-motion';
import IconButton from '../IconButton/IconButton';
import { ReactComponent as ArrowIcon } from '../../assets/icons/arrow.svg';
import { ReactComponent as ShuffleIcon } from '../../assets/icons/shuffle.svg';
import { ReactComponent as RestartIcon } from '../../assets/icons/restart.svg';

/**
 * Displays A stacked deck of flashcards to view and interact with.
 * Allows navigation between flashcards, shuffling, and flipping to see term/definition.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {Object[]} props.flashcards - Array of flashcard objects to display.
 * @param {number} props.flashcards[].order - The unique order of the flashcard.
 * @param {string} props.flashcards[].term - The term displayed on the front of the flashcard.
 * @param {string} props.flashcards[].definition - The definition displayed on the back of the flashcard.
 * @returns {JSX.Element} FlashcardViewer component.
 */
const FlashcardViewer = ({ flashcards }) => {
  const FLIP_ANIMATION = 0.4; // Duration of the flip animation in seconds
  const RESTART_ANIMATION = 0.7; // Duration of the restart animation in seconds

  // State declarations
  const [currentOrder, setCurrentOrder] = useState(1); // Current flashcard order
  const [viewedCards, setViewedCards] = useState([1]); // Array of viewed flashcard orders
  const [isFront, setIsFront] = useState(true); // Tracks whether the front of the card is displayed
  const [direction, setDirection] = useState(1); // Animation direction: 1 = next, -1 = previous
  const [shuffleEnabled, setShuffleEnabled] = useState(false); // Shuffle mode toggle
  const [shuffleButtonColor, setShuffleButtonColor] = useState(''); // Background color for shuffle button
  const [isResetting, setIsResetting] = useState(false); // Tracks whether the deck is resetting

  // Refs
  const viewerRef = useRef(null); // Ref for FlashcardViewer
  const termRef = useRef(null); // Ref for front content
  const defRef = useRef(null); // Ref for back content

  // Create a map for efficient lookups
  const flashcardMap = useMemo(() => {
    return flashcards.reduce((map, card) => {
      map[card.order] = card;
      return map;
    }, {});
  }, [flashcards]);

  // Retrieve the current card using the map
  const currentCard = flashcardMap[currentOrder];

  // Detect if the front (term) or back (definition) side of the current flashcard is scrollable
  const frontIsScrollable = useScrollDetect(termRef, currentCard?.term);
  const backIsScrollable = useScrollDetect(defRef, currentCard?.definition);

  // Get current index in the viewedCards array
  const currentIndex = viewedCards.indexOf(currentOrder);

  // Effect to dynamically update the flashcard width on resize,
  // allowing SCSS to adjust height, padding, and font size based on the new width.
  useEffect(() => {
    if (viewerRef?.current) {
      const cardContainer = viewerRef.current.querySelector(
        '.flashcard-viewer__card-container'
      );

      if (cardContainer) {
        // Avoid unnecessary updates that raise the error "ResizeObserver loop completed with undelivered notifications"
        let lastWidth = null;
        let timeoutId = null;

        // Create a ResizeObserver to watch the FlashcardViewer size
        const resizeObserver = new ResizeObserver((entries) => {
          if (timeoutId) return; // Ignore while throttled

          timeoutId = setTimeout(() => {
            timeoutId = null; // Reset throttle

            for (let entry of entries) {
              // Get the element's current width in pixels
              const cardWidthInPixels = Math.min(entry.contentRect.width, 800);

              // Check if the width has actually changed
              if (lastWidth !== cardWidthInPixels) {
                lastWidth = cardWidthInPixels;

                // Update the --card-width property to the new pixel width
                cardContainer.style.setProperty(
                  '--card-width',
                  `${cardWidthInPixels}px`
                );
              }
            }
          }, 10); // Adjust the throttle interval as needed
        });

        // Start observing the FlashcardViewer
        resizeObserver.observe(viewerRef.current);

        // Cleanup function to disconnect the observer
        return () => {
          resizeObserver.disconnect();
          if (timeoutId) clearTimeout(timeoutId);
        };
      }
    }
  }, [viewerRef?.current]);

  /**
   * Gets a random index from an array.
   *
   * @param {Array} array - The array to select a random index from.
   * @returns {number} A random index from the array.
   */
  const getRandomIndex = (array) => {
    return Math.floor(Math.random() * array.length);
  };

  /**
   * Marks a flashcard as viewed by adding its order to the viewedCards array.
   *
   * @param {number} order - The order of the flashcard to mark as viewed.
   */
  const markAsViewed = (order) => {
    setViewedCards((prev) => [...prev, order]);
  };

  /**
   * Executes a callback after ensuring the card's front side is shown
   * and waiting for the flip animation to complete.
   *
   * @param {function} callback - The function to execute after the flip animation.
   * @param {number} [buffer=200] - Additional time buffer (in milliseconds).
   */
  const withFlipAnimation = (callback, buffer = 200) => {
    let flipTimeout = 0;

    // If the card is showing its back side, trigger the flip animation
    if (!isFront) {
      handleFlip();
      flipTimeout = FLIP_ANIMATION * 1000 + buffer;
    }

    // Execute the callback after the flipTimeout ellapses
    setTimeout(callback, flipTimeout);
  };

  // Handles flipping the card (front/back toggle)
  const handleFlip = () => setIsFront((prev) => !prev);

  /**
   * Handles navigation to the next or previous card.
   *
   * @param {number} dir - The direction of navigation. 1 for next, -1 for previous.
   */
  const handleCardNavigation = (dir) => {
    // Define the navigation logic for moving to the next or previous card
    const navigate = () => {
      setDirection(dir); // Update the animation direction
      dir < 0 ? handlePrevious() : handleNext(); // Call appropriate navigation handler
    };

    // Ensure the card is flipped to its front side before navigating,
    // and execute the navigation function after the flip animation completes.
    withFlipAnimation(navigate);
  };

  // Handles moving to the next card
  const handleNext = () => {
    // Note: Forward navigation is disabled on currentIndex === flashcards.length - 1, no need to check for existance of card

    if (currentIndex < viewedCards.length - 1) {
      // If there is a forward history, move to the next card
      setCurrentOrder(viewedCards[currentIndex + 1]);
    } else {
      // If we are at the end of the history, determine the next card based on shuffle setting
      let nextCard;

      if (shuffleEnabled) {
        // If shuffle is enabled, pick a random card from unviewed cards
        const unviewedCards = flashcards.filter(
          (card) => !viewedCards.includes(card.order)
        );
        nextCard = unviewedCards[getRandomIndex(unviewedCards)];
      } else {
        // If shuffle is disabled, move to the next card in order
        nextCard = flashcardMap[currentOrder + 1];
      }

      // Set nextCard as the current card and mark it as viewed
      setCurrentOrder(nextCard.order);
      markAsViewed(nextCard.order);
    }
  };

  // Handles moving to the previous card in the viewed history
  const handlePrevious = () => setCurrentOrder(viewedCards[currentIndex - 1]); // Back navigation is disabled on index 0, no need to check for existance of card

  // Handles toggling shuffle mode
  const handleShuffle = () => {
    setShuffleEnabled((prev) => {
      // Restart deck in order when shuffle is being disabled
      if (prev) handleReset({ ordered: true });
      // Erase upcoming history when shuffle is being enabled
      else setViewedCards((prev) => prev.slice(0, currentIndex + 1));

      // Toggle the shuffle state
      return !prev;
    });

    // Toggle the background color of the shuffle button based on its state
    setShuffleButtonColor((prev) => (prev === '' ? 'var(--D50)' : ''));
  };

  /**
   * Restarts the deck.
   *
   * @param {boolean} [ordered] - Determines if the reset should maintain an ordered sequence.
   */
  const handleReset = (ordered) => {
    // Define the reset logic
    const reset = () => {
      // Activate restart animation
      setIsResetting(true);

      // Wait for restart animation to complete
      setTimeout(() => {
        setViewedCards([]); // Clear the history of viewed cards

        // Determine the new starting card's order, based on shuffle setting
        const order =
          shuffleEnabled && !ordered ? getRandomIndex(flashcards) : 1;

        // Set the new starting card and mark it as viewed
        setCurrentOrder(order);
        markAsViewed(order);

        // Deactivate restart animation
        setIsResetting(false);
      }, RESTART_ANIMATION * 1000);
    };

    // Ensure the card is flipped to its front side before resetting,
    // and execute the reset logic after the flip animation completes, with an additional 400ms buffer.
    withFlipAnimation(reset, 400);
  };

  /**
   * Renders the content for either side of the flashcard.
   *
   * @param {string} side - The flashcard side ("front" or "back").
   * @returns {React.ReactNode} The JSX representation of the flashcard content.
   */
  const renderContent = (side) => {
    const ref = side === 'front' ? termRef : defRef; // Ref object used to reference the text div.
    const text = side === 'front' ? currentCard?.term : currentCard?.definition; // Text content to display within the flashcard.
    const isScrollable =
      side === 'front' ? frontIsScrollable : backIsScrollable; // Determines if the text container should have an overlay to hint that the content is scrollable.

    return (
      <div className="flashcard-viewer__card-content">
        <div
          ref={ref}
          className="flashcard-viewer__card-text"
          style={isScrollable ? { paddingBottom: '2.5rem' } : {}}
        >
          {text}
        </div>
        {isScrollable && (
          <div className={`flashcard-viewer__card-text-overlay ${side}`} />
        )}
      </div>
    );
  };

  // Common props for IconButtons
  const buttonProps = {
    size: '13px',
    iColor: 'var(--P200)',
    bColor: 'var(--D50)',
    bHcolor: 'var(--M75)',
  };

  // Animation variants for next, previous, and flip effects
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : 0,
      opacity: direction > 0 ? 0 : 1,
      zIndex: direction > 0 ? 2 : 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      zIndex: 1,
      rotateY: isFront ? 0 : 180,
      transition: {
        rotateY: { duration: FLIP_ANIMATION },
      },
    },
    exit: (direction) => ({
      x: direction > 0 ? 0 : '100%',
      opacity: 0,
      zIndex: direction > 0 ? 0 : 2,
      transition:
        direction > 0
          ? { delay: 1, duration: 0.5 }
          : { opacity: { delay: 0.6 } },
    }),
  };

  // Animation variants for restart effect
  const resetVariants = {
    center: {
      opacity: 0,
      scale: 0.2,
      rotateY: [0, 180, 360, 540], // Triple flip
      transition: {
        rotateY: {
          duration: RESTART_ANIMATION,
          times: [
            0,
            0.33 * RESTART_ANIMATION,
            0.66 * RESTART_ANIMATION,
            RESTART_ANIMATION,
          ],
        },
        scale: { duration: RESTART_ANIMATION },
        opacity: {
          delay: 0.7 * RESTART_ANIMATION,
          duration: 0.3 * RESTART_ANIMATION,
        },
      },
    },
  };

  // Render current card content
  if (!currentCard) return <div>No flashcards available</div>;

  return (
    <div ref={viewerRef} className="flashcard-viewer">
      <div className="flashcard-viewer__card-container">
        <AnimatePresence custom={direction}>
          <motion.div
            key={currentCard.order}
            className="flashcard-viewer__card"
            initial="enter"
            animate="center"
            exit="exit"
            variants={isResetting ? resetVariants : variants}
            custom={direction}
            onClick={handleFlip}
          >
            <div className="flashcard-viewer__card-front">
              {renderContent('front')}
            </div>
            <div className="flashcard-viewer__card-back">
              {renderContent('back')}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flashcard-viewer__controls">
        <div className="flashcard-viewer__controls-left">
          <IconButton
            icon={<ArrowIcon />}
            onClick={() => handleCardNavigation(-1)}
            ariaProps={{
              'aria-label': 'Previous flashcard',
            }}
            disabled={currentIndex === 0}
            {...buttonProps}
          />
        </div>
        <div>{`${currentIndex + 1}/${flashcards.length}`}</div>
        <div className="flashcard-viewer__controls-right">
          <IconButton
            icon={<ArrowIcon />}
            onClick={() => handleCardNavigation(1)}
            ariaProps={{
              'aria-label': `Next ${shuffleEnabled ? 'random ' : ''}flashcard`,
            }}
            disabled={currentIndex === flashcards.length - 1}
            {...buttonProps}
          />
          <div>
            <IconButton
              icon={<ShuffleIcon />}
              onClick={handleShuffle}
              ariaProps={{
                'aria-label': `Click to ${
                  shuffleEnabled ? 'disable' : 'enable'
                } shuffle`,
              }}
              {...buttonProps}
              bColor={shuffleButtonColor}
            />
            <IconButton
              icon={<RestartIcon />}
              onClick={handleReset}
              ariaProps={{
                'aria-label': 'Click to restart',
              }}
              disabled={currentIndex === 0}
              {...buttonProps}
              bColor=""
            />
          </div>
        </div>
      </div>
    </div>
  );
};

FlashcardViewer.propTypes = {
  flashcards: PropTypes.arrayOf(
    PropTypes.shape({
      order: PropTypes.number.isRequired,
      term: PropTypes.string.isRequired,
      definition: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default FlashcardViewer;
