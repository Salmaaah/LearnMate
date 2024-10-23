import { createPortal } from 'react-dom';
import Input from '../Input/Input';
import MenuItem from '../MenuItem/MenuItem';
import { forwardRef, useState } from 'react';
import { useDataContext } from '../../../contexts/DataContext';
import { ReactComponent as DeleteIcon } from '../../../assets/icons/delete_3.svg';
import axios from 'axios';
import { ChromePicker } from 'react-color';

/**
 * Displays either a menu to edit property name and color, or delete property.
 *
 * @component
 * @param {React.SetStateAction<boolean>} setIsOpen - React's useState setter to toggle the `isOpen` state.
 * @param {{ top: string, left: string }} [position] - The menu's top and left coordinates in pixels.
 * @param {string} property - The type of property.
 * @param {{ id: number, name: string, color: string }} [value] - The property details.
 * @param {React.Ref} ref - The ref to the component.
 * @returns {JSX.Element} The rendered PropertyMenu component.
 */
const PropertyMenu = forwardRef(
  ({ setIsOpen, position, property, value }, ref) => {
    const { fetchData } = useDataContext();
    const [name, setName] = useState(value.name);
    const [nameError, setNameError] = useState(null);
    const [color, setColor] = useState(value.color);
    const propertyId = property.replace(/s$/, '') + '/' + value.id;

    // Identify the parent and grandparent DOM elements to manage focus after certain actions
    const parent = document.getElementById(`property-selection-${value.id}`);
    const grandParent = document.getElementById(
      `property-selector-${property.toLowerCase()}`
    );
    const nextElement =
      parent.nextElementSibling || grandParent.nextElementSibling;

    /**
     * Handles the blur event of the name input field.
     * If the name is valid and different from the current value, it updates the property.
     * If the name is empty, it sets an error message.
     *
     * @function
     * @returns {void}
     */
    const handleNameBlur = () => {
      if (name.trim() && name !== value.name) {
        handleUpdate({ name });
      } else if (!name.trim()) {
        setNameError("Name can't be empty.");
      }
    };

    /**
     * Updates the property with the provided data.
     * Sends a POST request to the updateProperty endpoint and fetches updated data upon success.
     *
     * @async
     * @function
     * @param {{ name?: string, color?: string }} data - An object containing the property data to update.
     * @returns {Promise<void>} A promise that resolves when the update is complete.
     */
    const handleUpdate = async (data) => {
      try {
        const response = await axios.post(`updateProperty/${propertyId}`, data);
        await fetchData();
        console.log(response.data.message);
      } catch (error) {
        if (error.response?.status === 400) {
          setNameError(error.response.data.error);
          console.error(error.response.data.error);
        } else {
          console.error('Error submitting form:', error.message);
        }
      }
    };

    /**
     * Deletes the property associated with the current property ID.
     * Sends a POST request to the deleteProperty endpoint and fetches updated data upon success.
     *
     * @async
     * @function
     * @returns {Promise<void>} A promise that resolves when the deletion is complete.
     */
    const handleDelete = async () => {
      try {
        const response = await axios.post(`deleteProperty/${propertyId}`);
        await fetchData();
        nextElement.focus(); // Set focus to the next available sibling element after deletion
        console.log(response.data.message);
      } catch (error) {
        console.error(
          error.response?.data.error || 'Error deleting property:',
          error.message
        );
      }
    };

    return createPortal(
      <form
        className="property-menu"
        id={`property-menu-${value.id}`}
        ref={ref}
        onSubmit={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => (e.key = 'enter' && e.stopPropagation())}
        style={{
          top: position.top,
          left: position.left,
          right: position.right,
          opacity: position.opacity,
        }}
        aria-label={`Edit "${value.name}" ${property
          .replace(/s$/, '')
          .toLowerCase()}`}
      >
        <Input
          size="small"
          name="name"
          type="text"
          value={name}
          onFocus={(event) => event.target.select()}
          onChange={(e) => {
            setName(e.target.value);
            setNameError(null);
          }}
          onBlur={handleNameBlur}
          error={nameError}
          autoFocus
        />
        {/* Hidden submit button to ensure the form can be submitted by hitting Enter */}
        <button type="submit" style={{ display: 'none' }} />
        <ChromePicker
          color={color}
          onChange={(newColor) => {
            setColor(newColor.hex);
            handleUpdate({ color: newColor.hex });
          }}
          disableAlpha
        />
        <MenuItem
          as="div"
          size="small"
          icon={<DeleteIcon />}
          label="Delete"
          onInteraction={handleDelete}
        />
        {/* Hidden div to handle focus when navigating outside the menu */}
        <div
          style={{ position: 'absolute', height: '0px' }}
          tabIndex={0}
          onFocus={() => {
            nextElement.focus();
            setIsOpen(false);
          }}
          aria-hidden
        ></div>
      </form>,
      document.body
    );
  }
);

export default PropertyMenu;
