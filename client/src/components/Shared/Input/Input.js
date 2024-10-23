import { useState, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ReactComponent as DeleteIcon } from '../../../assets/icons/delete.svg';
import { ReactComponent as ViewIcon } from '../../../assets/icons/view.svg';
import { ReactComponent as HideIcon } from '../../../assets/icons/hide.svg';
import { ReactComponent as ErrorIcon } from '../../../assets/icons/error.svg';

/**
 * Renders an input field and handles validation, password visibility, and errors.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {('small' | 'medium' | 'large')} props.size - Defines the size of the input.
 * @param {string} props.label - Placeholder text for the input.
 * @param {string} props.name - Name attribute for the input field.
 * @param {('text' | 'email' | 'password')} props.type - Input type.
 * @param {string} props.value - Current value of the input.
 * @param {Function} [props.onFocus] - Callback function when input is focused.
 * @param {Function} props.onChange - Callback function when input value changes.
 * @param {Function} [props.onBlur] - Callback function when input loses focus.
 * @param {string} props.error - Error message for the input, if any.
 * @param {boolean} props.autoFocus - Boolean to determine if the input should auto-focus on mount.
 * @returns {JSX.Element} The rendered input component.
 */
const Input = ({
  size,
  label,
  name,
  type,
  value,
  onFocus,
  onChange,
  onBlur,
  error,
  autoFocus,
}) => {
  const isPassword = type === 'password';
  const [displayIcon, setDisplayIcon] = useState(isPassword);
  const [iconInFocus, setIconInFocus] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const inputRef = useRef(null);

  // Icon component selection based on input type
  const IconComponent = useMemo(() => {
    if (isPassword) {
      return passwordVisible ? HideIcon : ViewIcon;
    }
    return DeleteIcon;
  }, [isPassword, passwordVisible]);

  /**
   * Ensures the icon is displayed when the input is on focus.
   *
   * @param {React.FocusEvent<HTMLInputElement>} e - The focus event triggered when the input field is focused.
   */
  const handleFocus = (e) => {
    setDisplayIcon(true);
    if (onFocus) onFocus(e); // Call onFocus prop if provided
  };

  /**
   * Hides icon when input loses focus unless it's a password field.
   *
   * @param {React.FocusEvent<HTMLInputElement>} e - The blur event triggered when the input field loses focus.
   */
  const handleBlur = (e) => {
    setTimeout(() => {
      if (!isPassword && !iconInFocus) setDisplayIcon(false);
    }, [0]);
    if (onBlur) onBlur(e); // Call onBlur prop if provided
  };

  // Clears the input field and maintains focus when delete icon is clicked.
  const resetInput = () => {
    if (inputRef.current) {
      onChange({ target: { name, value: '' } });
      inputRef.current.focus();
    }
  };

  // Toggles the visibility of the password in a password field.
  const togglePasswordVisibility = () => {
    setPasswordVisible((prevVisible) => !prevVisible);
  };

  // Handles either resetting input or toggling password visibility
  const handleInputAction = () => {
    return isPassword ? togglePasswordVisibility : resetInput;
  };

  return (
    <div className="input-container">
      <div
        className={`input ${size} ${error ? 'error' : ''}`}
        onClick={() => inputRef.current.focus()}
      >
        <input
          className="input__field"
          ref={inputRef}
          type={passwordVisible ? 'text' : type}
          placeholder={label}
          name={name}
          value={value}
          onFocus={handleFocus}
          onChange={onChange}
          onBlur={handleBlur}
          autoFocus={autoFocus}
          aria-invalid={!!error}
          aria-label={label}
          aria-describedby={error ? 'input-error-message' : undefined}
        />
        {(displayIcon || iconInFocus) && (
          <IconComponent
            className={`input__icon ${isPassword ? 'purple' : 'muted'}`}
            onFocus={() => setIconInFocus(true)}
            onMouseDown={handleInputAction}
            onKeyDown={(e) => e.key === 'Enter' && handleInputAction()}
            onBlur={() => setIconInFocus(false)}
            aria-label={
              isPassword ? 'Toggle password visibility' : 'Clear input'
            }
            role="button"
            tabIndex="0"
          />
        )}
      </div>
      {error && (
        <div
          id="input-error-message"
          className="input-error"
          role="alert"
          aria-live="assertive"
        >
          <ErrorIcon className="input-error__icon" />
          <span className="input-error__message">{error}</span>
        </div>
      )}
    </div>
  );
};

Input.defaultProps = {
  size: 'large',
  type: 'text',
  error: '',
};

Input.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['text', 'email', 'password']),
  value: PropTypes.string.isRequired,
  onFocus: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  autoFocus: PropTypes.bool,
};

export default Input;
