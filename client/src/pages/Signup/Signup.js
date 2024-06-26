import useUserAccess from '../../hooks/useUserAccess';
import useForm from '../../hooks/useForm';
import Input from '../../components/Shared/Input/Input';
import Button from '../../components/Shared/Button/Button';
import Header from '../../components/Header/Header';
import { ReactComponent as AppleIcon } from '../../assets/brandLogos/apple.svg';
import { ReactComponent as GoogleIcon } from '../../assets/brandLogos/google.svg';
// import Form from '../../components/Shared/Form/Form';
import axios from 'axios';
import { Link, Navigate } from 'react-router-dom';

const Signup = () => {
  const { isLoading } = useUserAccess('/signup');

  const initialValues = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

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

  const submitCallback = async (formData) => {
    try {
      const response = await axios.post('/signup', formData);
      console.log('User signed up successfully:', response.data);
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

  return (
    <div>
      {isFormSubmitted && <Navigate to="/dashboard" replace={true} />}
      <Header to="/login" cta="Log in" />
      {isLoading ? (
        <div>Loading...</div>
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
            />
            <Button
              label="Continue with apple"
              type="submit"
              variant="secondary"
              icon_l={<AppleIcon />}
            />
            <p className="form__disclaimer">
              By signing in to LearnMate, you acknowledge that you have read and
              understood, and agree to our{' '}
              <Link to="/">Terms & Conditions</Link> and{' '}
              <Link to="/">Privacy Policy</Link>.
            </p>
            <div className="form__cta">
              Already have an account? <Link to="/login">LOG IN</Link>
            </div>
          </form>
        </main>
      )}
    </div>
  );
};

export default Signup;
