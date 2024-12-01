import PropTypes from 'prop-types';
import ActionSubItem from '../../ActionSubItem/ActionSubItem';
import AIsearch from '../AIsearch/AIsearch';
import { useEffect, useRef } from 'react';

/**
 * A note component with basic info (name, modified date, and preview of content).
 * Allows the user to edit or delete a note, with AI search integration.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {{id: number, name: string, content: object, modified_at: string, type: string}} props.note - The note data object.
 * @param {number} [props.openNoteId] - The ID of the note to be opened.
 * @param {(action: string, item: object) => Promise<void>} props.handleEdit - Async function to handle clicking on the note.
 * @param {(noteID: number) => Promise<void>} props.handleDelete - Async function to delete the note.
 * @param {boolean} props.showAIsearch - Boolean to control the visibility of the AIsearch component.
 * @returns {JSX.Element} The rendered Note component.
 */
const Note = ({ note, openNoteId, handleEdit, handleDelete, showAIsearch }) => {
  const AIsearchRef = useRef(null);

  // Effect to manage visibility of AIsearch
  useEffect(() => {
    if (AIsearchRef.current) {
      AIsearchRef.current.setShowAIsearch(showAIsearch);
    }
  }, [showAIsearch]);

  return (
    <ActionSubItem
      item={note}
      openSubItemId={openNoteId}
      handleItemClick={() => handleEdit('edit', note)}
      handleDeleteIcon={handleDelete}
      renderContent={() => (
        <>
          <AIsearch ref={AIsearchRef} context="Notes" />
          <div
            id="editorjs"
            tabIndex={0}
            role="textbox"
            aria-multiline="true"
            aria-label="Note content editor"
          />
        </>
      )}
      additionalInfo={
        <div aria-label="Note content preview">
          {note.content?.blocks?.[0]?.data?.text?.replace(/&nbsp;/g, '') ?? ''}
        </div>
      }
    />
  );
};

Note.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    content: PropTypes.object.isRequired,
    modified_at: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
  openNoteId: PropTypes.number,
  handleEdit: PropTypes.func,
  handleDelete: PropTypes.func,
  showAIsearch: PropTypes.bool,
};

export default Note;
