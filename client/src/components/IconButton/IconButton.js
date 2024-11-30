import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * A button with an icon that supports custom colors, sizes, and shadow effects.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {Object} [props.provided] - Drag-and-drop provided props.
 * @param {ReactNode} props.icon - Icon to be displayed inside the button.
 * @param {string} [props.iColor='var(--D200)'] - Icon color.
 * @param {string} [props.iHcolor='var(--P200)'] - Icon hover color.
 * @param {string} [props.bColor=''] - Button background color.
 * @param {string} [props.bHcolor='var(--M50)'] - Button hover color.
 * @param {boolean} [props.shadow=false] - Determines if shadow class should be applied.
 * @param {Function} props.onClick - Click event handler function.
 * @param {Function} props.onKeyDown - KeyDown event handler function.
 * @param {string} [props.size='24px'] - Size of the button.
 * @param {object} [props.ariaProps={}] - ARIA attributes for accessibility.
 * @param {boolean} [props.disabled=false] - Determines if the button should be disabled.
 * @returns {JSX.Element} - Rendered button component.
 */
const IconButton = ({
  provided,
  icon,
  iColor = 'var(--D200)',
  iHcolor = 'var(--P200)',
  bColor = '',
  bHcolor = 'var(--M50)',
  shadow = false,
  onClick,
  onKeyDown,
  size = '24px',
  ariaProps = {},
  disabled = false,
}) => {
  const buttonRef = useRef(null);
  const buttonStyle = {
    '--iColor': iColor,
    '--iHcolor': iHcolor,
    '--bColor': bColor,
    '--bHcolor': bHcolor,
    padding: `${parseInt(size) / 1.3}px`,
  };

  // Effect to conditionally add classes to path elements for proper icon color application
  useEffect(() => {
    const paths = buttonRef.current.querySelectorAll('path');
    paths.forEach((path) => {
      if (
        path.hasAttribute('stroke') &&
        path.getAttribute('stroke') !== 'none'
      ) {
        path.classList.add('stroke');
      } else if (
        path.hasAttribute('fill') &&
        path.getAttribute('fill') !== 'none'
      ) {
        path.classList.add('fill');
      }
    });
  }, [icon]);

  return (
    <button
      ref={buttonRef}
      style={buttonStyle}
      className={`icon-button${shadow ? ' shadow' : ''}`}
      onClick={onClick}
      onKeyDown={onKeyDown}
      disabled={disabled}
      aria-disabled={disabled ? true : undefined}
      {...ariaProps}
      {...provided?.dragHandleProps}
    >
      <div
        style={{
          display: 'flex',
          width: size,
          height: size,
        }}
      >
        {icon}
      </div>
    </button>
  );
};

IconButton.propTypes = {
  provided: PropTypes.object,
  icon: PropTypes.node.isRequired,
  iColor: PropTypes.string,
  iHcolor: PropTypes.string,
  bColor: PropTypes.string,
  bHcolor: PropTypes.string,
  shadow: PropTypes.bool,
  onClick: PropTypes.func,
  onKeyDown: PropTypes.func,
  size: PropTypes.string,
  ariaProps: PropTypes.object,
  disabled: PropTypes.bool,
};

export default IconButton;
