import useForm from '../../hooks/useForm';
import Input from '../../components/Shared/Input/Input';
import Button from '../../components/Shared/Button/Button';
import Header from '../../components/Header/Header';
import googleIcon from '../../assets/brandLogos/google.png';
import appleIcon from '../../assets/brandLogos/apple.svg';
// import Form from '../../components/Shared/Form/Form';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Signup = () => {
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
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm(initialValues, validationFunctions, submitCallback);

  return (
    <div>
      <Header to="/login" cta="Log in" />
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
            label={isLoading ? '...' : 'Continue with email'}
            type="submit"
            disabled={isLoading}
          />
          <div className="form__divider">
            <span></span>
            <p>OR</p>
            <span></span>
          </div>
          <Button
            label="Continue with Google"
            type="submit"
            style="secondary"
            icon_l={googleIcon}
          />
          <Button
            label="Continue with apple"
            type="submit"
            style="secondary"
            icon_l={appleIcon}
          />
          <p className="form__disclaimer">
            By signing in to LearnMate, you acknowledge that you have read and
            understood, and agree to our <Link to="/">Terms & Conditions</Link>{' '}
            and <Link to="/">Privacy Policy</Link>.
          </p>
          <div className="form__cta">
            Already have an account? <Link to="/login">LOG IN</Link>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Signup;
