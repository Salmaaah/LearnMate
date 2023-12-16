import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ReactComponent as MoreIcon } from '../../../assets/icons/more.svg';

const MenuItem = ({ to, currentLocation, icon, label, more, expanded }) => {
  const isActive = to === currentLocation;

  return (
    <li>
      <Link className={`menuItem ${isActive ? 'active' : ''}`} to={to}>
        {icon}
        <span className={`${expanded ? 'visible' : 'hidden'}`}>
          {label && <div>{label}</div>}
          {more && <MoreIcon />}
        </span>
      </Link>
    </li>
  );
};

MenuItem.defaultProps = {
  more: false,
  expanded: true,
};

MenuItem.propTypes = {
  to: PropTypes.string.isRequired,
  currentLocation: PropTypes.string.isRequired,
  // icon: PropTypes.string,
  label: PropTypes.string,
  more: PropTypes.bool,
  expanded: PropTypes.bool,
};

export default MenuItem;
