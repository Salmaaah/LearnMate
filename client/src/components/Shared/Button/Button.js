import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// TODO: create small version

const Button = ({ type, to, label, variant, disabled, icon_l, icon_r }) => {
  if (to) {
    return (
      <Link to={to}>
        <button className={`button__${variant}`} disabled={disabled}>
          {icon_l}
          <div>{label}</div>
          {icon_r}
        </button>
      </Link>
    );
  } else {
    return (
      <button className={`button__${variant}`} type={type} disabled={disabled}>
        {icon_l}
        {label === '...' ? (
          <div className="button__loading">
            <span className="dot-flashing"></span>
          </div>
        ) : (
          <div>{label}</div>
        )}
        {icon_r}
      </button>
    );
  }
};

Button.defaultProps = {
  type: 'button',
  variant: 'primary',
  disabled: false,
};

Button.propTypes = {
  type: PropTypes.oneOf(['button', 'reset', 'submit']),
  to: PropTypes.string,
  label: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary']),
  disabled: PropTypes.bool,
  icon_l: PropTypes.object,
  icon_r: PropTypes.object,
};

export default Button;
