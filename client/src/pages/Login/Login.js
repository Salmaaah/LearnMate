import useForm from '../../hooks/useForm';
import Input from '../../components/Shared/Input/Input';
import Button from '../../components/Shared/Button/Button';
import Header from '../../components/Header/Header';
import googleIcon from '../../assets/icons/google.png';
import appleIcon from '../../assets/icons/apple.svg';
// import Form from '../../components/Shared/Form/Form';
import axios from 'axios';

const Login = () => {
  const initialValues = {
    identifier: '',
    password: '',
  };

  const validationFunctions = {
    identifier: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) || value.length >= 5
        ? ''
        : 'Invalid username or email. Please try again.';
    },
    password: (value) => (value.length < 8 ? 'Incorrect password.' : ''),
  };

  const submitCallback = async (formData) => {
    try {
      const response = await axios.post('/login', formData);
      console.log('User logged in successfully:', response.data);
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
      <Header cta="Sign up" />
      <main className="formContainer">
        <form className="form" onSubmit={handleSubmit}>
          <h1>Log in</h1>
          <div className="form__fields">
            <Input
              label="Username or email"
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.identifier}
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
          </div>
          <Button
            label={isLoading ? '...' : 'Log in'}
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
            Don't have an account? <a href="#">SIGN UP</a>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Login;
