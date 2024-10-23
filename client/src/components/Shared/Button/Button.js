import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/**
 * A versatile button component that can render as either a `<button>` element or a `<Link>` element based on the `to` prop.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {('button' | 'reset' | 'submit')} [props.type='button'] - The button type.
 * @param {string} [props.to] - URL for navigation, used with `<Link>` for routing.
 * @param {string} [props.label] - The text or content to display inside the button.
 * @param {string} [props.ariaLabel] - If no label is provided, the aria-label for button.
 * @param {('primary' | 'secondary')} [props.variant='primary'] - The style variant of the button.
 * @param {('small' | 'medium' | 'large')} [props.size='large'] - The size of the button.
 * @param {boolean} [props.disabled=false] - Whether the button is disabled.
 * @param {React.ReactNode} [props.icon_l] - Optional left icon to display inside the button.
 * @param {React.ReactNode} [props.icon_r] - Optional right icon to display inside the button.
 * @param {Function} [props.onClick] - Click handler function.
 * @param {Function} [props.onKeyDown] - KeyDown handler function.
 * @returns {JSX.Element} The rendered `<button>` or `<Link>` element.
 *
 * @example
 * // Render as a button
 * <Button
 *   type="submit"
 *   label="Submit"
 *   variant="primary"
 *   size="medium"
 *   onClick={() => console.log('Button clicked')}
 * />
 *
 * @example
 * // Render as a Link
 * <Button
 *   to="/home"
 *   label="Go Home"
 *   variant="secondary"
 *   size="large"
 * />
 */
const Button = ({
  type,
  to,
  label,
  ariaLabel,
  variant,
  size,
  disabled,
  icon_l,
  icon_r,
  onClick,
  onKeyDown,
}) => {
  // Common attributes for both <Link> and <button>
  const commonProps = {
    className: `button ${variant} ${size}`,
    disabled,
    'aria-label': ariaLabel ? ariaLabel : undefined,
    'aria-disabled': disabled ? 'true' : undefined,
    tabIndex: disabled ? '-1' : undefined,
  };

  const content = (
    <>
      {icon_l}
      {label === '...' ? (
        <div className="button__loading">
          <span className="dot-flashing"></span>
        </div>
      ) : (
        <>{label}</>
      )}
      {icon_r}
    </>
  );

  // Render as a Link if 'to' prop is provided
  if (to) {
    return (
      <Link to={to} role="button" {...commonProps}>
        {content}
      </Link>
    );
  } else {
    // Render as a button otherwise
    return (
      <button
        type={type}
        onClick={onClick}
        onKeyDown={onKeyDown}
        {...commonProps}
      >
        {content}
      </button>
    );
  }
};

Button.defaultProps = {
  type: 'button',
  variant: 'primary',
  size: 'large',
  disabled: false,
};

Button.propTypes = {
  type: PropTypes.oneOf(['button', 'reset', 'submit']),
  to: PropTypes.string,
  label: PropTypes.string,
  ariaLabel: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  icon_l: PropTypes.node,
  icon_r: PropTypes.node,
  onClick: PropTypes.func,
};

export default Button;
