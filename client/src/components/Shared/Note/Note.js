import Button from '../Button/Button';
import Popup from '../../Popup/Popup';
import { ReactComponent as DeleteIcon } from '../../../assets/icons/delete_3.svg';
import { useState } from 'react';

// const Note = ({ name, content, modifiedDate, handleOpen }) => {
const Note = ({ note, handleButtonClick, handleDeleteNote }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const formatDate = (date) => {
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Convert date to a Date object if it's a string
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    // If the date is within the past week
    if (date > oneWeekAgo) {
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

  return (
    <div
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
    </div>
  );
};

export default Note;
