import PropTypes from 'prop-types';
import { useRef } from 'react';
import Button from '../Shared/Button/Button';
import useOutsideClick from '../../hooks/useOutsideClick';

/**
 * A modal dialog with a title, content, and action buttons.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {string} props.id - The id of the popup dialog.
 * @param {string} props.title - The title of the popup dialog.
 * @param {ReactNode} props.content - The message displayed in the popup.
 * @param {boolean} props.isOpen - Controls whether the popup is visible.
 * @param {React.SetStateAction<boolean>} props.setIsOpen - React's useState setter to toggle the `isOpen` state.
 * @param {string} props.action - Label for the action button in the popup.
 * @param {Function} props.handleAction - Function to handle the primary action when the action button is clicked.
 * @returns {JSX.Element} - Rendered modal component.
 */
const Popup = ({
  id,
  title,
  content,
  isOpen,
  setIsOpen,
  action,
  handleAction,
}) => {
  const popupRef = useRef(null);

  const closeModal = (e) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  useOutsideClick(popupRef, isOpen ? () => setIsOpen(false) : null);

  const submitAction = (e) => {
    e.stopPropagation();
    handleAction();
  };

  return (
    isOpen && (
      <div
        className="popup-backdrop"
        onClick={closeModal} // UseOutsideClick could take care of this but it delays stopping propagation, so we opted to add this.
      >
        <dialog
          id={id}
          ref={popupRef}
          open={isOpen}
          className="popup"
          onClick={(e) => e.stopPropagation()}
          aria-modal="true"
          aria-labelledby="popup-title"
          aria-describedby="popup-content"
        >
          <h3 id="popup-title">{title}</h3>
          <p id="popup-content">{content}</p>
          <div>
            <Button
              label="Cancel"
              variant="primary"
              onClick={closeModal}
              onKeyDown={(e) => e.key === 'Enter' && e.stopPropagation()} // when pressing "Enter" on a button element, browsers automatically trigger the onClick event but with a delay, that's why we stop propagation in the meantime
            />
            <Button
              label={action}
              variant="secondary"
              onClick={submitAction}
              onKeyDown={(e) => e.key === 'Enter' && e.stopPropagation()} // when pressing "Enter" on a button element, browsers automatically trigger the onClick event but with a delay, that's why we stop propagation in the meantime
            />
          </div>
        </dialog>
      </div>
    )
  );
};

Popup.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  action: PropTypes.string.isRequired,
  handleAction: PropTypes.func.isRequired,
};

export default Popup;
