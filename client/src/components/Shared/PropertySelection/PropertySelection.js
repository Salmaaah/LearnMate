import { useState, useRef } from 'react';
import useOutsideClick from '../../../hooks/useOutsideClick';
import Property from '../Property/Property';
import PropertyMenu from '../PropertyMenu/PropertyMenu';
import { ReactComponent as MeatballsMenuIcon } from '../../../assets/icons/meatballs_menu.svg';
import { ReactComponent as NewTabIcon } from '../../../assets/icons/newTab.svg';
import { ReactComponent as DragIcon } from '../../../assets/icons/drag.svg';

const PropertySelection = ({ property, value, searchTerm, onClick }) => {
  const [isPropertyMenuOpen, setIsPropertyMenuOpen] = useState(false);
  const selectorRef = useRef(null);

  const handleClick = (event) => {
    event.stopPropagation();

    if (property !== 'Notes') {
      setIsPropertyMenuOpen(!isPropertyMenuOpen);
    } else {
      // Open note in a new tab
      const newWindow = window.open(
        `notebook/${value.id}`,
        '_blank',
        'noopener,noreferrer'
      );
      if (newWindow) newWindow.opener = null;
    }
  };

  useOutsideClick(selectorRef, () => setIsPropertyMenuOpen(false));

  return (
    <li
      className={value ? 'propertySelection' : 'propertyCreation'}
      onClick={onClick}
    >
      {value && (
        <>
          <div className="propertySelection__leftSection">
            <DragIcon />
            <Property name={value.name} color={value.color} textOnly={true} />
          </div>
          <div className="propertySelection__rightSection" ref={selectorRef}>
            <div onClick={handleClick}>
              {property !== 'Notes' && <MeatballsMenuIcon />}
              {property === 'Notes' && <NewTabIcon />}
            </div>
            {isPropertyMenuOpen && (
              <PropertyMenu property={property} value={value} />
            )}
          </div>
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

export default PropertySelection;
