import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IconButton from '../IconButton/IconButton';
import { ReactComponent as ArrowIcon } from '../../assets/icons/arrow.svg';
import { ReactComponent as ShuffleIcon } from '../../assets/icons/shuffle.svg';
import { ReactComponent as RestartIcon } from '../../assets/icons/restart.svg';

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

  // Create a map for efficient lookups
  const flashcardMap = useMemo(() => {
    return flashcards.reduce((map, card) => {
      map[card.order] = card;
      return map;
    }, {});
  }, [flashcards]);

  // Retrieve the current card using the map
  const currentCard = flashcardMap[currentOrder];

  // Get current index in the viewedCards array
  const currentIndex = viewedCards.indexOf(currentOrder);

  // Helper function to get a random index from an array
  const getRandomIndex = (array) => {
    return Math.floor(Math.random() * array.length);
  };

  // Marks a card as viewed by adding its order to the viewedCards list
  const markAsViewed = (order) => {
    setViewedCards((prev) => [...prev, order]);
  };

  // Executes a callback after ensuring the card's front side is shown and waiting for the flip animation to complete.
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

  // Handles navigation to the next or previous card.
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

  // Restarts the deck.
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
    <div className="flashcard-viewer">
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
              {currentCard?.term}
            </div>
            <div className="flashcard-viewer__card-back">
              {currentCard?.definition}
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

export default FlashcardViewer;
