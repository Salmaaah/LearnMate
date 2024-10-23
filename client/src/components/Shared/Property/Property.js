import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as DeleteIcon } from '../../../assets/icons/delete_2.svg';

/**
 * Displays a property item with optional delete functionality and navigation link.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {string} [props.as='div'] - The HTML element type to render
 * @param {string} props.name - The name to display
 * @param {string} [props.color='#eae9ec'] - Background color for the property
 * @param {boolean} [props.textOnly=false] - If true, hides the delete icon
 * @param {string} [props.url] - link to navigate to when the property is clicked
 * @param {(event: React.MouseEvent | React.KeyboardEvent) => Promise<void>} [props.handleRemove] - Function to call when delete icon is clicked
 * @returns {JSX.Element} The rendered Property component.
 */
const Property = ({
  as: Element = 'div',
  name,
  color = '#eae9ec',
  textOnly = false,
  url,
  handleRemove,
}) => {
  const navigate = useNavigate();

  /**
   * Handles navigation if a url is provided.
   *
   * @param {React.MouseEvent | React.KeyboardEvent} e - The click/keypress event
   */
  const handleNavigate = (e) => {
    if (url) {
      e.stopPropagation();
      navigate(url);
    }
  };

  /**
   * Utility function that simplifies handling keyboard accessibility
   * Handles key press events to trigger a callback when the 'Enter' key is pressed.
   *
   * @param {Function} callback - The function to invoke when 'Enter' is pressed.
   * @returns {function(KeyboardEvent): void} An event handler that listens for 'Enter' key presses and calls the provided callback.
   */
  const handleKeyPress = (callback) => (e) => {
    if (e.key === 'Enter') callback(e);
  };

  return (
    <Element
      className="property"
      style={{ backgroundColor: color }}
      onClick={(e) => handleNavigate(e)}
      tabIndex={url ? 0 : -1}
      onKeyDown={handleKeyPress(handleNavigate)}
    >
      <div className={`property__name${url ? ' link' : ''}`}>{name}</div>
      {!textOnly && (
        <DeleteIcon
          onClick={handleRemove}
          tabIndex={0}
          onKeyDown={handleKeyPress(handleRemove)}
          aria-label={`Remove ${name}`}
        />
      )}
    </Element>
  );
};

Property.propTypes = {
  as: PropTypes.string,
  name: PropTypes.string.isRequired,
  color: PropTypes.string,
  textOnly: PropTypes.bool,
  url: PropTypes.string,
  handleRemove: PropTypes.func,
};

export default Property;
