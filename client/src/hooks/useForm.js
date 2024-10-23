import { useState } from 'react';

/**
 * @typedef {object} FormManager
 * @property {Object.<string, string>} formData - The current values of the form fields.
 * @property {Object.<string, string>} errors - An object containing validation error messages for each field.
 * @property {boolean} isSubmitting - A flag indicating if the form is currently being submitted.
 * @property {boolean} isFormSubmitted - A flag indicating if the form has been successfully submitted.
 * @property {Function} handleChange - Function to handle input field changes.
 * @property {Function} handleBlur - Function to handle input field blur events for validation.
 * @property {Function} handleSubmit - Function to handle form submission.
 */

/**
 * Custom hook for managing form state, validation, and submission.
 *
 * @param {Object.<string, string>} initialValues - The default values for the form fields.
 * @param {Object.<string, Function>} validationFunctions - An object containing validation functions for each form field.
 * @param {function(object): Promise<void>} submitCallback - A function to be called when the form is submitted.
 * @returns {FormManager} The form state and handlers object.
 */
const useForm = (initialValues, validationFunctions, submitCallback) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormSubmitted, setFormSubmitted] = useState(false);

  /**
   * Handles updating the values of the input fields as they change.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event from the input field.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value }); // Update the values of the input fields as the user types
    setErrors({ ...errors, [name]: '' }); // Clear the error message when the user starts typing in a field
  };

  /**
   * Validates input fields when they lose focus.
   *
   * @param {React.FocusEvent<HTMLInputElement>} e - The blur event from the input field.
   */
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const validationFunction = validationFunctions[name];
    if (validationFunction) {
      const error = validationFunction(value);
      setErrors({ ...errors, [name]: error });
    }
  };

  /**
   * Handles form submission.
   *
   * @async
   * @param {React.FormEvent<HTMLFormElement>} e - The submit event from the form.
   * @returns {Promise<void>} - A promise that resolves when the submission process is complete.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    setIsSubmitting(true); // Set submitting state to true when the form is being submitted

    try {
      if (JSON.stringify(formData) !== JSON.stringify(initialValues)) {
        await submitCallback(formData);
        setFormSubmitted(true);
      } else {
        console.log('Form values have not changed. Skipping submitCallback.');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrors({ ...errors, ...error.response.data.error });
        console.error(error.response.data.error);
      } else {
        console.error('Error submitting form:', error.message);
      }
    } finally {
      setIsSubmitting(false); // Reset submitting state regardless of success or failure
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    isFormSubmitted,
    handleChange,
    handleBlur,
    handleSubmit,
  };
};

export default useForm;
