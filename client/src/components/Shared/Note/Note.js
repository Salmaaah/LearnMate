import PropTypes from 'prop-types';
import Popup from '../../Popup/Popup';
import AIsearch from '../AIsearch/AIsearch';
import IconButton from '../../IconButton/IconButton';
import { ReactComponent as DeleteIcon } from '../../../assets/icons/delete_3.svg';
import { useEffect, useState, useRef } from 'react';

/**
 * A note component with basic info (name, modified date, preview of content).
 * Allows the user to edit or delete a note, with AI search integration.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {{id: number, name: string, content: object, modified_date: string}} props.note - The note data object.
 * @param {number} [props.openSubItemId] - The ID of the note to be opened.
 * @param {(action: string, item: object) => Promise<void>} props.handleButtonClick - Async function to handle button click actions, edit note in this case.
 * @param {(noteID: number) => Promise<void>} props.handleDeleteNote - Async function to delete the note.
 * @param {boolean} props.showAIsearch - Boolean to control the visibility of the AIsearch component.
 * @returns {JSX.Element} The rendered Note component.
 */
const Note = ({
  note,
  openSubItemId,
  handleButtonClick,
  handleDeleteNote,
  showAIsearch,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const AIsearchRef = useRef(null);

  /**
   * Formats the given date, displaying either the day name (if within past week)
   * or as MM/DD/YYYY.
   *
   * @param {Date|string} date - Date to format.
   * @returns {string} - Formatted date string.
   */
  const formatDate = (date) => {
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Convert date to a Date object if it's a string
    if (!(date instanceof Date)) date = new Date(date);

    if (date > oneWeekAgo) {
      // Return the day name when date is within the past week
      const days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      return days[date.getDay()];
    } else {
      // Format the date as MM/DD/YYYY
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();
      return month + '/' + day + '/' + year;
    }
  };

  // Effect to manage visibility and open state of the note
  useEffect(() => {
    if (openSubItemId === note.id) {
      setIsVisible(true);
      setIsOpen(true);
    } else if (!openSubItemId) {
      setIsVisible(true);
      setIsOpen(false);
    } else if (openSubItemId && openSubItemId !== note.id) {
      setIsVisible(false);
      setIsOpen(false);
    }
  }, [openSubItemId, note.id]);

  // Effect to manage visibility of AIsearch
  useEffect(() => {
    if (AIsearchRef.current) {
      AIsearchRef.current.setShowAIsearch(showAIsearch);
    }
  }, [showAIsearch]);

  return (
    isVisible &&
    (isOpen ? (
      <>
        <AIsearch ref={AIsearchRef} context="Notes" />
        <div
          id="editorjs"
          tabIndex={0}
          role="textbox"
          aria-multiline="true"
          aria-label="Note content editor"
        ></div>
      </>
    ) : (
      <li
        className="note"
        onClick={() => handleButtonClick('edit', note)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleButtonClick('edit', note);
        }}
        aria-label={`Note titled ${note.name}, modified on ${formatDate(
          note.modified_date
        )}`}
      >
        <div className="note__info">
          <div className="note__name">{note.name}</div>
          <div className="note__other">
            <time
              dateTime={new Date(note.modified_date).toISOString()}
              aria-label={`Last modified on ${formatDate(note.modified_date)}`}
            >
              {formatDate(note.modified_date)}
            </time>
            <div aria-label="Note content preview">
              {note.content?.blocks?.[0]?.data?.text?.replace(/&nbsp;/g, '') ??
                ''}
            </div>
          </div>
        </div>
        <IconButton
          icon={<DeleteIcon />}
          size="13px"
          iColor="var(--P200)"
          bHcolor="var(--D50)"
          onClick={(e) => {
            e.stopPropagation();
            setShowPopup(true);
          }}
          onKeyDown={(e) => e.key === 'Enter' && e.stopPropagation()} // when pressing "Enter" on a button element, browsers automatically trigger the onClick event but with a delay, that's why we stop propagation in the meantime
          ariaProps={{
            'aria-label': `Delete ${note.name}`,
            'aria-haspopup': 'dialog',
            'aria-controls': `delete-note-popup-${note.id}`,
            'aria-expanded': showPopup,
          }}
        />
        <Popup
          id={`delete-note-popup-${note.id}`}
          title="Delete note?"
          content={
            <>
              The <strong>{note.name}</strong> note will be deleted and can be
              found in Recently Deleted for 30 days.
            </>
          }
          isOpen={showPopup}
          setIsOpen={setShowPopup}
          action="Delete"
          handleAction={() => handleDeleteNote(note.id)}
        />
      </li>
    ))
  );
};

Note.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    content: PropTypes.object.isRequired,
    modified_date: PropTypes.string.isRequired,
  }).isRequired,
  openSubItemId: PropTypes.number,
  handleButtonClick: PropTypes.func,
  handleDeleteNote: PropTypes.func,
  showAIsearch: PropTypes.bool,
};

export default Note;
