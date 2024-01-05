import { useState } from 'react';

const useForm = (initialValues, validationFunctions, submitCallback) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormSubmitted, setFormSubmitted] = useState(false);

  // Update the values of the input fields as the user types
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value }); // Update the values of the input fields as the user types
    setErrors({ ...errors, [name]: '' }); // Clear the error message when the user starts typing in a field
  };

  // Validate the input field when the user leaves the field
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const validationFunction = validationFunctions[name];
    if (validationFunction) {
      const error = validationFunction(value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault(); // Prevent the default form submission behavior
    setIsSubmitting(true); // Set submitting state to true when the form is being submitted

    try {
      if (JSON.stringify(formData) !== JSON.stringify(initialValues)) {
        await submitCallback(formData);
        // setFormData(initialValues); // Reset form upon successful submit
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
