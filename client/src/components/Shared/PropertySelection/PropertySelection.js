import PropTypes from 'prop-types';
import { useState, useRef, useEffect, useCallback } from 'react';
import useOutsideClick from '../../../hooks/useOutsideClick';
import Property from '../Property/Property';
import PropertyMenu from '../PropertyMenu/PropertyMenu';
import { ReactComponent as MeatballsMenuIcon } from '../../../assets/icons/meatballs_menu.svg';
import { ReactComponent as NewTabIcon } from '../../../assets/icons/newTab.svg';
import { ReactComponent as DragIcon } from '../../../assets/icons/drag.svg';

/**
 * Displays either an existing property which is selectable, draggable,
 * and editable, or a property creation option.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {string} props.property - The type of property.
 * @param {{ id: number, name: string, color: string }} [props.value] - The property details.
 *    If no value is provided, the component renders in "create" mode.
 * @param {string} [props.searchTerm] - The term entered by the user for searching or creating a new property.
 * @param {Function} props.onInteraction - Callback function to handle interactions (clicks or enter keypresses) with the PropertySelection component.
 * @returns {JSX.Element} The rendered PropertySelection component.
 */
const PropertySelection = ({ property, value, searchTerm, onInteraction }) => {
  const [isPropertyMenuOpen, setIsPropertyMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, opacity: 0 });
  const actionButtonRef = useRef(null);
  const propertyMenuRef = useRef(null);

  // Effect to dynamically position the PropertyMenu based on available space
  useEffect(() => {
    if (isPropertyMenuOpen) {
      // Retrieve the main container's margin-left and full width
      const mainDiv = document.getElementById('main');
      const styles = window.getComputedStyle(mainDiv);
      const marginLeft = parseFloat(styles.marginLeft);
      const width = parseFloat(styles.width) + marginLeft;

      // Get the width of the PropertyMenu
      const propertyMenuRect = propertyMenuRef.current.getBoundingClientRect();
      const propertyMenuWidth = propertyMenuRect.width + 20; // Add margin space

      // Get the bounding box of the ActionButton to determine its position on the screen
      const actionButtonRect = actionButtonRef.current.getBoundingClientRect();

      // Calculate the available space between the left edge of the ActionButton and the right edge of the main container
      const spaceToRight = width - actionButtonRect.left;

      // If there's enough space to the right of the ActionButton for the PropertyMenu
      if (spaceToRight >= propertyMenuWidth) {
        // Position the PropertyMenu below the ActionButton, aligned to its left edge
        setMenuPos({
          top: actionButtonRect.bottom,
          left: actionButtonRect.left,
          opacity: 1, // Ensure the menu is visible
        });
      } else {
        // If there's not enough space, position the PropertyMenu below the ActionButton but aligned to the right edge of the container
        setMenuPos({
          top: actionButtonRect.bottom,
          right: width - actionButtonRect.right,
          opacity: 1, // Ensure the menu is visible
        });
      }
    }
  }, [isPropertyMenuOpen]);

  // Scroll the PropertyMenu into view when it opens and its position updates
  useEffect(() => {
    if (
      isPropertyMenuOpen &&
      menuPos.top !== 0 &&
      menuPos.left !== 0 &&
      menuPos.opacity !== 0
    ) {
      propertyMenuRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isPropertyMenuOpen, menuPos]);

  /**
   * Handles toggling PropertyMenu or opening Notes in a new tab on interaction
   * with the action button.
   *
   * @param {React.MouseEvent | React.KeyboardEvent} e - The click/keypress event
   */
  const handleActionButton = useCallback(
    (event) => {
      event.stopPropagation();

      if (property !== 'Notes') {
        setIsPropertyMenuOpen((prev) => !prev);
      } else {
        // Open note in a new tab
        const newWindow = window.open(
          `notebook/${value.id}`,
          '_blank',
          'noopener,noreferrer'
        );
        if (newWindow) newWindow.opener = null;
      }
    },
    [property, value]
  );

  /**
   * Utility function that simplifies handling keyboard accessibility
   * Handles key press events to trigger a callback when the 'Enter' key is pressed.
   *
   * @param {Function} callback - The function to invoke when 'Enter' is pressed.
   * @returns {(React.KeyboardEvent) => void} An event handler that listens for 'Enter' key presses and calls the provided callback.
   */
  const handleKeyPress = (callback) => (e) => {
    if (e.key === 'Enter') callback(e);
  };

  // Close the PropertyMenu when clicking outside
  useOutsideClick(
    actionButtonRef,
    isPropertyMenuOpen ? () => setIsPropertyMenuOpen(false) : null
  );

  return (
    <li
      id={value ? `property-selection-${value.id}` : undefined}
      className={value ? 'property-selection' : 'property-creation'}
      onClick={onInteraction}
      role="menuitem"
      tabIndex={0}
      onKeyDown={handleKeyPress(onInteraction)}
    >
      {value && (
        <>
          <div className="property-selection__dragAndDisplay">
            <DragIcon
              aria-label={`Drag '${value.name}' ${property
                .toLowerCase()
                .replace(/s$/, '')}`}
              role="button"
              tabIndex={0}
            />
            <Property name={value.name} color={value.color} textOnly={true} />
          </div>
          <div
            className="property-selection__actionButton"
            ref={actionButtonRef}
            onClick={handleActionButton}
            tabIndex={0}
            role="button"
            onKeyDown={handleKeyPress(handleActionButton)}
            aria-label={
              property === 'Notes'
                ? 'Open note in a new tab'
                : 'Open property edit menu'
            }
            aria-haspopup={property !== 'Notes'}
            aria-owns={
              isPropertyMenuOpen ? `property-menu-${value.id}` : undefined
            }
          >
            {property === 'Notes' ? (
              <NewTabIcon aria-hidden />
            ) : (
              <MeatballsMenuIcon aria-hidden />
            )}
          </div>
          {isPropertyMenuOpen && (
            <PropertyMenu
              ref={propertyMenuRef}
              setIsOpen={setIsPropertyMenuOpen}
              position={menuPos}
              property={property}
              value={value}
            />
          )}
        </>
      )}
      {searchTerm && (
        <>
          <div>Create</div>
          <Property name={searchTerm} textOnly={true} />
        </>
      )}
    </li>
  );
};

PropertySelection.propTypes = {
  property: PropTypes.string.isRequired,
  value: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    color: PropTypes.string,
  }),
  searchTerm: PropTypes.string,
  onInteraction: PropTypes.func.isRequired,
};

export default PropertySelection;
