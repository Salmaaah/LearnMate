import React, { useState, useEffect } from 'react';
import IconButton from '../IconButton/IconButton';
import { ReactComponent as ArrowIcon } from '../../assets/icons/arrow.svg';
import { ReactComponent as ShuffleIcon } from '../../assets/icons/shuffle.svg';

const FlashcardViewer = ({ flashcards }) => {
  // State declarations
  const [currentOrder, setCurrentOrder] = useState(1); // Current flashcard order
  const [viewedCards, setViewedCards] = useState([1]); // Array of viewed flashcard orders
  const [isFront, setIsFront] = useState(true); // Tracks whether the front of the card is displayed
  const [shuffleEnabled, setShuffleEnabled] = useState(false); // Shuffle mode toggle
  const [shuffleButtonColor, setShuffleButtonColor] = useState(''); // Background color for shuffle button

  // Helper function to find a flashcard by its order
  const getCardByOrder = (order) => {
    return flashcards.find((card) => card.order === order);
  };

  // Get current flashcard and its index in the viewedCards array
  const currentCard = getCardByOrder(currentOrder);
  const currentIndex = viewedCards.indexOf(currentOrder);

  // Helper function to get a random index from an array
  const getRandomIndex = (array) => {
    return Math.floor(Math.random() * array.length);
  };

  // Marks a card as viewed by adding its order to the viewedCards list
  const markAsViewed = (order) => {
    setViewedCards((prev) => [...prev, order]);
  };

  // Resets the viewer state to start from the first flashcard
  const reset = () => {
    setViewedCards([]);
    setCurrentOrder(1);
    markAsViewed(1);
  };

  // Handler for moving to the next card
  const handleNext = () => {
    if (!isFront) handleFlip();

    if (currentIndex < viewedCards.length - 1) {
      // If there is a forward history, move to the next card in the history
      setCurrentOrder(viewedCards[currentIndex + 1]);
    } else {
      // If we are at the end of the history, determine the next card
      let nextCard;

      if (shuffleEnabled) {
        // If shuffle is enabled, pick a random card from unviewed cards
        const unviewedCards = flashcards.filter(
          (card) => !viewedCards.includes(card.order)
        );

        if (unviewedCards.length > 0)
          nextCard = unviewedCards[getRandomIndex(unviewedCards)];
      } else {
        // If shuffle is disabled, move to the next card in order
        nextCard = getCardByOrder(currentOrder + 1);
      }

      if (nextCard) {
        setCurrentOrder(nextCard.order);
        markAsViewed(nextCard.order);
      } else {
        // Reset if all cards have been viewed
        reset();
      }
    }
  };

  // Handler for moving to the previous card
  const handlePrevious = () => {
    if (currentIndex > 0) {
      if (!isFront) handleFlip();
      setCurrentOrder(viewedCards[currentIndex - 1]);
    }
  };

  // Handler for toggling shuffle mode
  const handleShuffle = () => {
    setShuffleEnabled((prev) => {
      if (prev) reset(); // Reset when shuffle is disabled
      return !prev;
    });
    // Toggle the background color of the shuffle button based on its state
    setShuffleButtonColor((prev) => (prev === '' ? 'var(--D50)' : ''));
  };

  // Effect to automatically move to the next card when shuffle is enabled
  useEffect(() => {
    if (shuffleEnabled) handleNext();
  }, [shuffleEnabled]);

  // Handler for flipping the card (front/back toggle)
  const handleFlip = () => setIsFront((prev) => !prev);

  // Common props for IconButtons
  const buttonProps = {
    size: '13px',
    iColor: 'var(--P200)',
    bColor: 'var(--D50)',
    bHcolor: 'var(--M75)',
  };

  // Render current card content
  if (!currentCard) return <div>No flashcards available</div>;

  return (
    <div className="flashcard-viewer">
      <div
        className="flashcard-viewer__card"
        style={{
          transform: isFront ? 'rotateY(0deg)' : 'rotateY(180deg)',
        }}
        onClick={handleFlip}
      >
        <div className="flashcard-viewer__card-front">{currentCard?.term}</div>
        <div className="flashcard-viewer__card-back">
          {currentCard?.definition}
        </div>
      </div>
      <div className="flashcard-viewer__controls">
        <div>
          <IconButton
            icon={<ArrowIcon />}
            onClick={handlePrevious}
            ariaProps={{
              'aria-label': 'Previous flashcard',
            }}
            disabled={currentIndex === 0}
            {...buttonProps}
          />
        </div>
        <div>{`${currentIndex + 1}/${flashcards.length}`}</div>
        <div>
          <IconButton
            icon={<ArrowIcon />}
            onClick={handleNext}
            ariaProps={{
              'aria-label': 'Next flashcard',
            }}
            {...buttonProps}
          />
          <IconButton
            icon={<ShuffleIcon />}
            onClick={handleShuffle}
            ariaProps={{
              'aria-label': 'Next flashcard',
            }}
            {...buttonProps}
            bColor={shuffleButtonColor}
          />
        </div>
      </div>
    </div>
  );
};

export default FlashcardViewer;
