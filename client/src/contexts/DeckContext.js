import React, { createContext, useState, useContext, useEffect } from 'react';
import { useDataContext } from './DataContext';

// Create context for managing open deck
const OpenDeckContext = createContext();

// Context provider component
export function OpenDeckProvider({ children }) {
  const { data } = useDataContext();
  const [openDeckId, setOpenDeckId] = useState(null);
  const [openDeckFlashcards, setOpenDeckFlashcards] = useState(null);

  useEffect(() => {
    if (openDeckId && data.flashcard_decks) {
      const deck = data.flashcard_decks.find((deck) => deck.id === openDeckId);
      const flashcards =
        deck?.flashcards?.sort((a, b) => a.order - b.order) || [];
      setOpenDeckFlashcards(flashcards);
    } else {
      setOpenDeckFlashcards([]);
    }
  }, [openDeckId, data.flashcard_decks]);

  return (
    <OpenDeckContext.Provider value={{ openDeckFlashcards, setOpenDeckId }}>
      {children}
    </OpenDeckContext.Provider>
  );
}

// Custom hook to use the open deck context
export const useOpenDeck = () => {
  const context = useContext(OpenDeckContext);
  if (context === undefined) {
    throw new Error('useOpenDeck must be used within a OpenDeckProvider');
  }
  return context;
};
