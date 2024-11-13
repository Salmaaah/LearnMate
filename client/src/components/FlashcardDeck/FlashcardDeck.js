import PropTypes from 'prop-types';
import ActionSubItem from '../ActionSubItem/ActionSubItem';

/**
 * A flashcard deck component with basic info (name, modified date, and number of flashcards).
 * Allows the user to edit or delete a deck.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {{id: number, name: string, modified_at: string, flashcards: Array, table: string, [key: string]: any}} props.deck - The deck data object.
 * @param {number} [props.openSubItemId] - The ID of the deck to be opened.
 * @param {(action: string, item: object) => Promise<void>} props.handleButtonClick - Async function to handle clicking on the deck.
 * @param {(noteID: number) => Promise<void>} props.handleDeleteFlashcardDeck - Async function to delete the deck.
 * @param {React.ReactNode} props.children - Flashcards passed to the FlashcardDeck component as children.
 * @param {(children: React.ReactNode) => React.ReactNode} props.handleChildren - Function that passes necessary props to child flashcards.
 * @returns {JSX.Element} The rendered FlashcardDeck component.
 */
const FlashcardDeck = ({
  deck,
  openSubItemId,
  handleButtonClick,
  handleDeleteFlashcardDeck,
  children,
  handleChildren,
}) => {
  const nbrItems = deck?.flashcards?.length;

  return (
    <ActionSubItem
      item={deck}
      openSubItemId={openSubItemId}
      handleButtonClick={handleButtonClick}
      handleDelete={handleDeleteFlashcardDeck}
      renderContent={() => handleChildren(children)}
      additionalInfo={
        <div aria-label="Number of items in flashcard deck">
          {`${nbrItems} ${nbrItems === 1 ? 'term' : 'terms'}`}
        </div>
      }
    />
  );
};

FlashcardDeck.propTypes = {
  deck: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    modified_at: PropTypes.string.isRequired,
    flashcards: PropTypes.array.isRequired,
    table: PropTypes.string.isRequired,
  }).isRequired,
  openSubItemId: PropTypes.number,
  handleButtonClick: PropTypes.func,
  handleDeleteFlashcardDeck: PropTypes.func,
  children: PropTypes.node.isRequired,
  handleChildren: PropTypes.func,
};

export default FlashcardDeck;
