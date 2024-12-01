import React from 'react';
import PropTypes from 'prop-types';
import ActionSubItem from '../ActionSubItem/ActionSubItem';

/**
 * A flashcard deck component with basic info (name, modified date, and number of flashcards).
 * Allows the user to edit or delete a deck.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {{id: number, name: string, modified_at: string, flashcards: Array, type: string, [key: string]: any}} props.deck - The deck data object.
 * @param {number} [props.openDeckId] - The ID of the deck to be opened.
 * @param {(action: string, item: object) => Promise<void>} props.handleEdit - Async function to handle clicking on the deck.
 * @param {(noteID: number) => Promise<void>} props.handleDelete - Async function to delete the deck.
 * @param {React.ReactNode} props.children - Flashcards passed to the FlashcardDeck component as children.
 * @param {(children: React.ReactNode) => React.ReactNode} props.handleChildren - Function that passes necessary props to child flashcards.
 * @returns {JSX.Element} The rendered FlashcardDeck component.
 */
const FlashcardDeck = ({
  deck,
  openDeckId,
  handleEdit,
  handleDelete,
  children,
  handleChildren,
}) => {
  const nbrItems = deck?.flashcards?.length;

  // Passes the nested children from the fragment to handleChildren
  // for further processing and rendering.
  const renderChildren = () => {
    if (children?.type === React.Fragment) {
      return handleChildren(children.props.children);
    }
  };

  return (
    <ActionSubItem
      item={deck}
      openSubItemId={openDeckId}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      renderContent={renderChildren}
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
    type: PropTypes.string.isRequired,
  }).isRequired,
  openDeckId: PropTypes.number,
  handleEdit: PropTypes.func,
  handleDelete: PropTypes.func,
  children: PropTypes.node.isRequired,
  handleChildren: PropTypes.func,
};

export default FlashcardDeck;
