import Button from '../Button/Button';
import Popup from '../../Popup/Popup';
import AIsearch from '../AIsearch/AIsearch';
import { ReactComponent as DeleteIcon } from '../../../assets/icons/delete_3.svg';
import { useEffect, useState } from 'react';

const Note = ({
  note,
  openSubItemId,
  handleButtonClick,
  handleDeleteNote,
  showAIsearch,
  setShowAIsearch,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const formatDate = (date) => {
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Convert date to a Date object if it's a string
    if (!(date instanceof Date)) {
      date = new Date(date);
    }

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
      setIsOpen(false); // no need
    }
  }, [openSubItemId]);

  return (
    isVisible &&
    (isOpen ? (
      <>
        <AIsearch
          context="Notes"
          showAIsearch={showAIsearch}
          setShowAIsearch={setShowAIsearch}
        />
        <div id="editorjs" tabIndex={0}></div>
      </>
    ) : (
      <li
        className="note"
        onClick={() => handleButtonClick('edit', note)}
        onMouseOver={() => setIsHovering(true)}
        onMouseOut={() => setIsHovering(false)}
      >
        <div className="note__info">
          <div className="note__name">{note.name}</div>
          <div className="note__other">
            <div>{formatDate(note.modified_date)}</div>
            <div>
              {note.content
                ? note.content.blocks[0].data.text.replace(/&nbsp;/g, '')
                : null}
            </div>
          </div>
        </div>
        {isHovering && (
          <Button
            icon_l={<DeleteIcon />}
            variant="secondary"
            size="large"
            onClick={(e) => {
              e.stopPropagation();
              setShowPopup(true);
            }}
          />
        )}
        <Popup
          title="Delete note"
          content="This note will be deleted and can be found in Recently Deleted for 30 days."
          isOpen={showPopup}
          setIsOpen={setShowPopup}
          action="Delete"
          handleAction={() => handleDeleteNote(note.id)}
        />
      </li>
    ))
  );
};

export default Note;
