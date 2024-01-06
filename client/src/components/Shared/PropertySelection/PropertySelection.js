import { useState, useRef } from 'react';
import useOutsideClick from '../../../hooks/useOutsideClick';
import Property from '../Property/Property';
import PropertyMenu from '../PropertyMenu/PropertyMenu';
import { ReactComponent as MeatballsMenuIcon } from '../../../assets/icons/meatballs_menu.svg';
import { ReactComponent as DragIcon } from '../../../assets/icons/drag.svg';

const PropertySelection = ({ property, value, searchTerm }) => {
  const [isPropertyMenuOpen, setIsPropertyMenuOpen] = useState(false);
  const selectorRef = useRef(null);

  const handleClick = (event) => {
    event.stopPropagation();
    setIsPropertyMenuOpen(!isPropertyMenuOpen);
  };

  useOutsideClick(selectorRef, () => setIsPropertyMenuOpen(false));

  return (
    <li className={value ? 'propertySelection' : 'propertyCreation'}>
      {value && (
        <>
          <div className="propertySelection__name">
            <DragIcon />
            <ul>
              {/* Using <ul> here is not semantic, it's because the Property component is a <li> */}
              <Property name={value.name} color={value.color} textOnly={true} />
            </ul>
          </div>
          <div className="propertySelection__menu" ref={selectorRef}>
            <div onClick={handleClick}>
              <MeatballsMenuIcon />
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
          <ul>
            {/* Using <ul> here is not semantic, it's because the Property component is a <li> */}
            <Property name={searchTerm} textOnly={true} />
          </ul>
        </>
      )}
    </li>
  );
};

export default PropertySelection;
