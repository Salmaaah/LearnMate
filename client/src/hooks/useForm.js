import { useState } from 'react';

const useForm = (initialValues, validationFunctions, submitCallback) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormSubmitted, setFormSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value }); // Update the values of the input fiels as the user types
    setErrors({ ...errors, [name]: '' }); // Clear the error message when the user starts typing in a field
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const validationFunction = validationFunctions[name];
    if (validationFunction) {
      const error = validationFunction(value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    setIsSubmitting(true); // Set submitting state to true when the form is being submitted

    try {
      await submitCallback(formData);
      setFormData(initialValues); // Reset form and submitting state upon successful signup/login
      setFormSubmitted(true);
    } catch (error) {
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data.errors
      ) {
        setErrors({ ...errors, ...error.response.data.errors });
        console.error(
          'Error signing up/logging in:',
          error.response.data.errors
        );
      } else {
        console.error('Error signing up/logging in:', error.message);
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
