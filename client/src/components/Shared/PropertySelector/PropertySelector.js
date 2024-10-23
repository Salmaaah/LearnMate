import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';
import useOutsideClick from '../../../hooks/useOutsideClick';
import { useDataContext } from '../../../contexts/DataContext';
import { useFileContext } from '../../../contexts/FileContext';
import useNote from '../../../hooks/useNote';
import Property from '../Property/Property';
import PropertySelection from '../PropertySelection/PropertySelection';
import axios from 'axios';

/**
 * Displays a property search bar with an expandable dropdown 
 * that allows users to select properties or create new ones.

 * @component
 * @param {Object} props - The props object.
 * @param {string} props.property - The name of the property (e.g., "Tags", "Notes").
 * @param {Array<{ id: number, name: string, color: string }>} props.selectedValues - Array of objects representing the currently selected property values.
 * @param {Array<{ id: number, name: string, color: string }>} props.availableOptions - Array of objects representing the available property values to select from.
 * @returns {JSX.Element} The rendered PropertySelector component.
 */
const PropertySelector = ({ property, selectedValues, availableOptions }) => {
  const { id: fileId } = useFileContext();
  const { fetchData } = useDataContext();
  const { handleCreateNote } = useNote();
  const selectorRef = useRef(null);
  const inputRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Handles focusing on the input field when dropdown is open and input is rendered
  useEffect(() => {
    if (isDropdownOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isDropdownOpen]);

  /**
   * Handles the change in property search input.

   * @param {React.ChangeEvent<HTMLInputElement>} event - The event object from the input change event.
   */
  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);
    setSearchTerm(value.trim());
  };

  // Filters available values based on search term if user is typing and sort them alphabetically
  const filteredOptions = searchTerm
    ? availableOptions
        .filter((value) =>
          value.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name))
    : availableOptions;

  // Checks if none of the filtered options is an exact match to the searchTerm
  const hasNoExactMatch = !filteredOptions.some(
    (option) => option.name.toLowerCase() === searchTerm.toLowerCase()
  );

  /**
   * Handles selection of a property value.
   *
   * @async
   * @param {{ id: number, name: string, color: string }} selectedValue - The selected value to add or to create.
   * @returns {Promise<void>}
   */
  const handleSelect = async (selectedValue) => {
    if (property === 'Notes' && selectedValue.id === '99999999999999') {
      await handleCreateNote(fileId, searchTerm);
    } else {
      try {
        const response = await axios.post(
          `addProperty/${property.replace(/s$/, '')}/${selectedValue.id}`,
          {
            fileId: fileId,
            name: selectedValue.name,
            color: selectedValue.color,
          }
        );
        await fetchData();
        console.log(response.data.message);
      } catch (error) {
        console.error(
          error.response?.status === 404
            ? error.response.data.error
            : `Error adding property: ${error.message}`
        );
      }
    }

    setInputValue('');
    setSearchTerm('');
    inputRef.current.focus();
  };

  /**
   * Handles removing a selected property.
   *
   * @async
   * @param {React.MouseEvent | React.KeyboardEvent} event - The click/keypress event on the remove button.
   * @param {{id: number, name: string, [key: string]: any}} valueToRemove - The property object to be removed.
   * @returns {Promise<void>}
   */
  const handleRemove = async (event, valueToRemove) => {
    event.stopPropagation();
    try {
      const response = await axios.post(
        `removeProperty/${property.replace(/s$/, '')}/${valueToRemove.id}`,
        {
          fileId: fileId,
          name: valueToRemove.name,
        }
      );
      await fetchData();
      console.log(response.data.message);
    } catch (error) {
      console.error(
        error.response?.status === 404
          ? error.response.data.error
          : `Error removing property: ${error.message}`
      );
    }
  };

  // Handles outside click to close dropdown (if open) and clear the input
  useOutsideClick(
    selectorRef,
    isDropdownOpen
      ? () => {
          handleInputChange({ target: { value: '' } }); // Clear the input
          setIsDropdownOpen(false);
        }
      : null
  );

  return (
    <li
      id={`property-selector-${property.toLowerCase()}`}
      ref={selectorRef}
      className={`property-selector${isDropdownOpen ? ' open' : ' closed'}`}
      role="menuitem"
      aria-haspopup="true"
      aria-controls={`${property.toLowerCase()}-submenu`}
      aria-expanded={isDropdownOpen}
      onClick={() => setIsDropdownOpen(true)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') setIsDropdownOpen(true);
      }}
    >
      <div className="property-selector__header">
        <div>{property}</div>
        <ul>
          {selectedValues.length > 0 && (
            <>
              {selectedValues.map((value) => (
                <Property
                  key={value.id}
                  as="li"
                  name={value.name}
                  color={value.color}
                  url={property === 'Notes' ? `/notebook/${value.id}` : ''}
                  handleRemove={(e) => handleRemove(e, value)}
                />
              ))}
            </>
          )}
          {(isDropdownOpen || selectedValues.length === 0) && (
            <li>
              <input
                ref={inputRef}
                autoComplete="off"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={`Add ${property.toLowerCase()}`}
                // id={`${property.toLowerCase()}Input`}
                aria-label={`Add ${property.toLowerCase()}`}
                aria-controls={`${property.toLowerCase()}-submenu`}
                tabIndex={isDropdownOpen ? 0 : -1}
              />
            </li>
          )}
        </ul>
      </div>
      {isDropdownOpen && (
        <div className="property-selector__dropdown">
          <div>Select an option or create one</div>
          <ul role="menu" id={`${property.toLowerCase()}-submenu`}>
            {filteredOptions.map((value) => (
              <PropertySelection
                key={value.id}
                property={property}
                value={value}
                onInteraction={() => handleSelect(value)}
              />
            ))}
            {searchTerm && hasNoExactMatch && (
              <PropertySelection
                key="searchTerm"
                searchTerm={searchTerm}
                onInteraction={() =>
                  handleSelect({
                    id: '99999999999999',
                    name: searchTerm,
                    color: '#eae9ec',
                  })
                }
              />
            )}
          </ul>
        </div>
      )}
    </li>
  );
};

PropertySelector.propTypes = {
  property: PropTypes.string.isRequired,
  selectedValues: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      color: PropTypes.string,
    })
  ).isRequired,
  availableOptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      color: PropTypes.string,
    })
  ).isRequired,
};

export default PropertySelector;
