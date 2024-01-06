import Input from '../Input/Input';
import MenuItem from '../MenuItem/MenuItem';
import useForm from '../../../hooks/useForm';
import { useState, useEffect } from 'react';
import { useDataContext } from '../../../contexts/DataContext';
import { ReactComponent as DeleteIcon } from '../../../assets/icons/delete_3.svg';
import axios from 'axios';
import { ChromePicker } from 'react-color';

const PropertyMenu = ({ property, value }) => {
  const { fetchData } = useDataContext();
  const [color, setColor] = useState(value.color);

  const initialValues = { name: value.name };

  const validationFunctions = {
    // no need for validation here because we submit on blur
    // name: (value) => {
    //   return value.name === 0 ? '' : 'Name must be at least 1 characters long';
    // },
    // color must be within a certain range
  };

  const submitCallback = async (formData) => {
    try {
      const response = await axios.post(
        `update/${property.replace(/s$/, '')}/${value.id}`,
        formData
      );
      await fetchData();
      console.log(response.data.message);
    } catch (error) {
      throw error; // Propagate the error to be handled in the catch block of the form's handleSubmit
    }
  };

  const {
    formData,
    errors,
    isSubmitting,
    isFormSubmitted,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm(initialValues, validationFunctions, submitCallback);

  // TODO: display errors

  const handleColorChange = (color) => {
    setColor(color.hex);
  };

  useEffect(() => {
    submitCallback({ color: color });
  }, [color]);

  const handleDelete = async () => {
    try {
      const response = await axios.post(
        `delete/${property.replace(/s$/, '')}/${value.id}`
      );
      await fetchData();
      console.log(response.data.message);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.error(error.response.data.error);
      } else {
        console.error('Error deleting property:', error.message);
      }
    }
  };

  const handleClick = (event) => {
    event.stopPropagation();
  };

  return (
    <form
      className="propertyMenu"
      onSubmit={handleSubmit}
      onClick={handleClick}
    >
      <Input
        size="small"
        name="name"
        type="text"
        value={formData.name}
        onFocus={(event) => event.target.select()}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.name}
        autoFocus
      />
      {/* According to the HTML specification, the form submission event is not triggered when you hit Enter in an input field if the form only contains that one input field. To fix this, I added a hidden submit button to the form. */}
      <button type="submit" style={{ display: 'none' }} />
      <ChromePicker
        color={color}
        onChange={handleColorChange}
        disableAlpha={true}
      />
      {/* TODO: figure out how to put this MenuItem in a <ul> because it's a <li>, and when done edit the scss to fit this */}
      <MenuItem
        size="small"
        icon={<DeleteIcon />}
        label="Delete"
        onClick={handleDelete}
      />
    </form>
  );
};

export default PropertyMenu;
