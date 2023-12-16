import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import deleteIcon from '../../../assets/icons/delete.svg';
import viewIcon from '../../../assets/icons/view.svg';
import hideIcon from '../../../assets/icons/hide.svg';
import errorIcon from '../../../assets/icons/error.svg';

const Input = ({ label, name, type, value, onChange, onBlur, error }) => {
  const isPassword = type === 'password';
  const [displayIcon, setDisplayIcon] = useState(isPassword);
  const [passwordIcon, setpasswordIcon] = useState(isPassword ? 1 : 0);
  const inputRef = useRef(null);

  const handleOnBlur = (e) => {
    // when input is not on focus and the input type is other than password, hide the delete icon, else leave the show/hide icon always on display
    !isPassword ? setDisplayIcon(false) : setDisplayIcon(true);

    // Call the onBlur props function in case it's given
    onBlur && onBlur(e);
  };

  const resetInput = (e) => {
    e.preventDefault(); // Prevent the input from losing focus

    if (inputRef.current) {
      inputRef.current.value = ''; // Reset the input field value
    }
  };

  // Define img (icon) attributes based on isPassword
  // onMouseDown instead of onClick because it's triggered before the onBlur
  const iconAttributes = isPassword
    ? {
        src: passwordIcon === 1 ? viewIcon : hideIcon,
        alt: passwordIcon === 1 ? 'Show password' : 'Hide password',
        onMouseDown: () =>
          // access the previous state to determine the next, if it was set to view icon, switch to hide and vice versa
          setpasswordIcon((prevIcon) => (prevIcon === 1 ? 2 : 1)),
      }
    : {
        src: deleteIcon,
        alt: 'Reset',
        onMouseDown: resetInput,
      };

  return (
    <div className="inputContainer">
      <div
        className={`input ${error ? 'error' : ''}`} // adds error class in case of an error
        onClick={() => inputRef.current.focus()} // activates input element when clicked anywhere even outside the input element itself
      >
        <input
          ref={inputRef}
          className="input__field"
          type={passwordIcon === 1 ? 'password' : 2 ? 'text' : type}
          placeholder={label}
          name={name}
          value={value}
          onFocus={() => setDisplayIcon(true)}
          onChange={onChange}
          onBlur={handleOnBlur}
        />
        {displayIcon && (
          <img
            className={`input__icon ${isPassword ? 'purple' : 'muted'}`}
            {...iconAttributes}
            alt=""
          />
        )}
      </div>
      {error && (
        <div className="errorContainer">
          <img className="errorContainer__icon" src={errorIcon} alt="" />
          <span className="errorContainer__message">{error}</span>
        </div>
      )}
    </div>
  );
};

Input.defaultProps = {
  type: 'text',
  error: '',
};

Input.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['text', 'email', 'password']),
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default Input;
