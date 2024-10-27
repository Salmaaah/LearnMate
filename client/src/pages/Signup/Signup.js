import useUserAccess from '../../hooks/useUserAccess';
import useForm from '../../hooks/useForm';
import Input from '../../components/Shared/Input/Input';
import Button from '../../components/Shared/Button/Button';
import Header from '../../components/Header/Header';
import { ReactComponent as AppleIcon } from '../../assets/brandLogos/apple.svg';
import { ReactComponent as GoogleIcon } from '../../assets/brandLogos/google.svg';
import axios from 'axios';
import { Link, Navigate } from 'react-router-dom';

/**
 * Handles user signup, including form validation and submission.
 *
 * @component
 * @returns {JSX.Element} The rendered signup page component.
 */
const Signup = () => {
  const { isLoading } = useUserAccess('/signup');

  const initialValues = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  /**
   * Validation functions for each form field.
   *
   * @type {object}
   * @property {function(string): string} username - Validates the username.
   * @property {function(string): string} email - Validates the email.
   * @property {function(string): string} password - Validates the password.
   * @property {function(string): string} confirmPassword - Validates the retyped password.
   */
  const validationFunctions = {
    username: (value) =>
      value.length < 5 ? 'Username must be at least 5 characters long.' : '',
    email: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? '' : 'Invalid email format.';
    },
    password: (value) =>
      value.length < 8 ? 'Password must be at least 8 characters long.' : '',
    confirmPassword: (value) =>
      value !== formData.password ? 'Passwords do not match.' : '',
  };

  /**
   * Submits the form data to the server for user signup.
   *
   * @async
   * @param {object} formData - The data entered in the form.
   * @param {string} formData.username - The user's username.
   * @param {string} formData.email - The user's email.
   * @param {string} formData.password - The user's password.
   * @param {string} formData.confirmPassword - The user's retyped password (for server-side valdiation).
   * @returns {Promise<void>}
   */
  const submitCallback = async (formData) => {
    try {
      const response = await axios.post('/signup', formData);
      console.log('User signed up successfully:', response.data);
    } catch (error) {
      throw error; // Propagate the error to be handled in the form's handleSubmit
    }
  };

  // Destructure form state and handlers from the useForm hook
  const {
    formData,
    errors,
    isSubmitting,
    isFormSubmitted,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm(initialValues, validationFunctions, submitCallback);

  return (
    <>
      {isFormSubmitted && <Navigate to="/courses" replace={true} />}
      {/* When dashboard is complete, Navigate to="/dashboard" */}
      <Header to="/login" cta="Log in" />
      {isLoading ? (
        <div role="status" aria-live="polite">
          Loading...
        </div>
      ) : (
        <main className="formContainer">
          <form className="form" onSubmit={handleSubmit}>
            <h1>Create your profile</h1>
            <div className="form__fields">
              <Input
                label="Username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.username}
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
              />
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
              />
              <Input
                label="Re-enter password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.confirmPassword}
              />
            </div>
            <Button
              label={isSubmitting ? '...' : 'Continue with email'}
              ariaLabel={isSubmitting ? 'Signing up in progress...' : undefined}
              type="submit"
              disabled={isSubmitting}
            />
            <div className="form__divider">
              <span></span>
              <p>OR</p>
              <span></span>
            </div>
            <Button
              label="Continue with Google"
              type="submit"
              variant="secondary"
              icon_l={<GoogleIcon />}
              disabled
            />
            <Button
              label="Continue with apple"
              type="submit"
              variant="secondary"
              icon_l={<AppleIcon />}
              disabled
            />
            <p className="form__disclaimer">
              By signing in to LearnMate, you acknowledge that you have read and
              understood, and agree to our{' '}
              <Link to="/terms">Terms & Conditions</Link> and{' '}
              <Link to="/privacy">Privacy Policy</Link>.
            </p>
            <div className="form__cta">
              Already have an account? <Link to="/login">LOG IN</Link>
            </div>
          </form>
        </main>
      )}
    </>
  );
};

export default Signup;
