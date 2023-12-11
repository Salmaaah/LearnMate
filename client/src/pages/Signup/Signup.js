import { useState } from 'react';
// import { useHistory } from 'react-router-dom';
import axios from 'axios';
import Input from '../../components/Shared/Input/Input';
import Button from '../../components/Shared/Button/Button';
import Header from '../../components/Header/Header';
import googleIcon from '../../assets/icons/google.png';
import appleIcon from '../../assets/icons/apple.svg';

const Signup = () => {
  // const { data, isPending, error } = useFetch('/signup');
  // const history = useHistory();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    // The spread operator (...) is used for object destructuring. In our case we're creating a shallow copy of the current state (formData).
    // e.target refers to the DOM element that triggered the event. In this case, it represents the input field that the user is interacting with.
    // e.target.name is the name attribute of the input field. It's used as a key to identify which property of the state (formData) should be updated.
    // e.target.value is the current value entered by the user into the input field. It represents the new value for the specified property.
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear the error message when the user starts typing in a field
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case 'username':
        validateUsername(value);
        break;
      case 'email':
        validateEmail(value);
        break;
      case 'password':
        validatePassword(value);
        break;
      case 'confirmPassword':
        validateConfirmPassword(value);
        break;
      default:
        break;
    }
  };

  const validateUsername = (value) => {
    if (value.length < 5) {
      setErrors({
        ...errors,
        username: 'Username must be at least 5 characters long.',
      });
    } else {
      setErrors({ ...errors, username: '' });
    }
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setErrors({ ...errors, email: 'Invalid email format.' });
    } else {
      setErrors({ ...errors, email: '' });
    }
  };

  const validatePassword = (value) => {
    if (value.length < 8) {
      setErrors({
        ...errors,
        password: 'Password must be at least 8 characters long.',
      });
    } else {
      setErrors({ ...errors, password: '' });
    }
  };

  const validateConfirmPassword = (value) => {
    if (value !== formData.password) {
      setErrors({ ...errors, confirmPassword: 'Passwords do not match.' });
    } else {
      setErrors({ ...errors, confirmPassword: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    try {
      setIsLoading(true); // Set loading state to true when the form is being submitted
      const response = await axios.post('/signup', formData);
      console.log('User signed up successfully:', response.data);

      // Reset form and loading state upon successful signup
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      // history.push('/dashboard'); // Redirect to the dashboard
    } catch (error) {
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data.errors
      ) {
        // Deconstruct and set server-side validation errors individually
        setErrors((prevErrors) => ({
          ...prevErrors,
          ...error.response.data.errors,
        }));

        console.error('Error signing up:', errors);
      } else {
        console.error('Error signing up:', error.message);
      }
    } finally {
      setIsLoading(false); // Reset loading state regardless of success or failure
    }
  };

  return (
    <div>
      <Header cta="Log in" />
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
            understood, and agree to our <a href="#">Terms & Conditions</a> and{' '}
            <a href="#">Privacy Policy</a>.
          </p>
          <div className="form__cta">
            Already have an account? <a href="#">LOG IN</a>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Signup;
