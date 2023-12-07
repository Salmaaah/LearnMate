import { useState, useRef } from 'react';
import deleteIcon from '../../../assets/icons/delete.svg';
import viewIcon from '../../../assets/icons/view.svg';
import hideIcon from '../../../assets/icons/hide.svg';
import errorIcon from '../../../assets/icons/error.svg';

const Input = (props) => {
  const isPassword = props.type === 'password';
  const [showIcon, setShowIcon] = useState(isPassword);
  const [passwordIcon, setpasswordIcon] = useState(1);
  const inputRef = useRef(null);
  const [error] = useState(false);

  const resetInput = (e) => {
    e.preventDefault(); // Prevent the input from losing focus
    // Reset the input field value
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // Define img attributes based on isPassword
  // onMouseDown instead of onClick because it's triggered before the onBlur
  const iconAttributes = isPassword
    ? {
        src: passwordIcon === 1 ? viewIcon : hideIcon,
        alt: passwordIcon === 1 ? 'Show password' : 'Hide password',
        onMouseDown: () =>
          setpasswordIcon((prevIcon) => (prevIcon === 1 ? 2 : 1)), // access the previous state to determine the next
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
          type={passwordIcon === 1 ? 'password' : 'text'}
          placeholder={props.label}
          onFocus={() => setShowIcon(true)}
          onBlur={() => (!isPassword ? setShowIcon(false) : setShowIcon(true))}
        />
        {showIcon && <img className="input__icon" {...iconAttributes} />}
      </div>
      {error && (
        <div className="errorContainer">
          <img className="errorContainer__icon" src={errorIcon} alt="" />
          <span className="errorContainer__message">Error message.</span>
        </div>
      )}
    </div>
  );
};

export default Input;
