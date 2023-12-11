import PropTypes from 'prop-types';

const Button = ({ label, type, style, disabled, icon_l, icon_r }) => {
  return (
    <button className={`button__${style}`} type={type} disabled={disabled}>
      {icon_l && <img className="button__icon" src={icon_l} alt="" />}
      <div>{label}</div>
      {icon_r && <img className="button__icon" src={icon_r} alt="" />}
    </button>
  );
};

Button.defaultProps = {
  label: 'label',
  style: 'primary',
};

Button.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  style: PropTypes.string,
};

export default Button;
