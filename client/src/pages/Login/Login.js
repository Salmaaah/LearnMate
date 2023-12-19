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

const Login = () => {
  const { isLoading } = useUserAccess('/login');

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

  return (
    <div>
      {isFormSubmitted && <Navigate to="/dashboard" replace={true} />}
      <Header to="/signup" cta="Sign up" />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
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
              label={isSubmitting ? '...' : 'Log in'}
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
              style="secondary"
              icon_l={<GoogleIcon />}
            />
            <Button
              label="Continue with apple"
              type="submit"
              style="secondary"
              icon_l={<AppleIcon />}
            />
            <p className="form__disclaimer">
              By signing in to LearnMate, you acknowledge that you have read and
              understood, and agree to our{' '}
              <Link to="/">Terms & Conditions</Link> and{' '}
              <Link to="/">Privacy Policy</Link>.
            </p>
            <div className="form__cta">
              Don't have an account? <Link to="/signup">SIGN UP</Link>
            </div>
          </form>
        </main>
      )}
    </div>
  );
};

export default Login;
