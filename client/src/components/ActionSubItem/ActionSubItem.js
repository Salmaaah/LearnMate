import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import IconButton from '../IconButton/IconButton';
import Popup from '../Popup/Popup';
import { ReactComponent as DeleteIcon } from '../../assets/icons/delete_3.svg';
import { capitalize } from '../../utils/stringUtils';

/**
 * A component that manages the visibility, open state, and deletion functionality
 * for items used within an ActionItem component, such as flashcard decks or notes.
 * Displays a clickable list item with the provided content and handles delete actions
 * via a popup confirmation.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {{id: number, name: string, modified_at: string, type: string, [key: string]: any}} props.item - The sub-item data object.
 * @param {number} [props.openSubItemId] - ID of the sub-item to be opened.
 * @param {(action: string, item: object) => Promise<void>} props.handleEdit - Function to handle clicking on ActionSubItem.
 * @param {function(number): Promise<void>} props.handleDelete - Function to handle deletion of the sub-item by ID.
 * @param {() => React.ReactNode} props.renderContent - Function that renders the content displayed when the sub-item is opened.
 * @param {React.ReactNode} props.additionalInfo - div of additional info displayed when the sub-item is closed.
 * @returns {JSX.Element} The rendered ActionSubItem component.
 */
const ActionSubItem = ({
  item,
  openSubItemId,
  handleEdit,
  handleDelete,
  renderContent,
  additionalInfo,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  /**
   * Formats the given date, displaying "Today" or "Yesterday" if the date is today or yesterday,
   * the day name if within the past week, or as MM/DD/YYYY for earlier dates.
   *
   * @param {Date|string} date - Date to format.
   * @returns {string} - Formatted date string.
   */
  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Convert date to a Date object if it's a string
    if (!(date instanceof Date)) date = new Date(date);

    // Check if the date is today
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return 'Today';
    }

    // Check if the date is yesterday
    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return 'Yesterday';
    }

    // Return the day name if the date is within the past week
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
      return `${month}/${day}/${year}`;
    }
  };

  // Manage visibility and open state based on openSubItemId
  useEffect(() => {
    if (openSubItemId === item.id) {
      setIsVisible(true);
      setIsOpen(true);
    } else if (!openSubItemId) {
      setIsVisible(true);
      setIsOpen(false);
    } else {
      setIsVisible(false);
      setIsOpen(false);
    }
  }, [openSubItemId, item.id]);

  return (
    isVisible &&
    (isOpen ? (
      renderContent() // Pass custom content from child components
    ) : (
      <li
        className="action-sub-item"
        onClick={() => handleEdit('edit', item)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleEdit('edit', item)}
        aria-label={`${capitalize(item.type)} titled ${
          item.name
        }, modified on ${formatDate(item.modified_at)}`}
      >
        <div className="action-sub-item__info">
          <div className="action-sub-item__name">{item.name}</div>
          <div className="action-sub-item__other">
            <time
              dateTime={new Date(item.modified_at).toISOString()}
              aria-label={`Last modified on ${formatDate(item.modified_at)}`}
            >
              {formatDate(item.modified_at)}
            </time>
            {additionalInfo}
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
            'aria-label': `Delete ${item.name}`,
            'aria-haspopup': 'dialog',
            'aria-controls': `delete-${item.type}-popup-${item.id}`,
            'aria-expanded': showPopup,
          }}
        />
        <Popup
          id={`delete-${item.type}-popup-${item.id}`}
          title={`Delete ${item.type}?`}
          content={
            <>
              The <strong>{item.name}</strong> {item.type} will be deleted and
              can be found in Recently Deleted for 30 days.
            </>
          }
          isOpen={showPopup}
          setIsOpen={setShowPopup}
          action="Delete"
          handleAction={() => handleDelete(item.id)}
        />
      </li>
    ))
  );
};

ActionSubItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    modified_at: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
  openSubItemId: PropTypes.number,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  renderContent: PropTypes.func.isRequired,
  additionalInfo: PropTypes.node.isRequired,
};

export default ActionSubItem;
