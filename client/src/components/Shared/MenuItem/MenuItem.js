import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ReactComponent as MoreIcon } from '../../../assets/icons/more.svg';

const MenuItem = ({
  children,
  to,
  location,
  icon,
  label,
  more,
  expanded,
  onClick,
}) => {
  const active = to === location;
  // const [open, setOpen] = useState(false);

  return (
    <li>
      <Link
        className={`menuItem ${active ? 'active' : ''}`}
        to={to}
        onClick={onClick}
        // onClick={() => setOpen(!open)}
      >
        {icon}
        <span className={`${expanded ? 'visible' : 'hidden'}`}>
          {label && <div>{label}</div>}
          {more && <MoreIcon />}
          {/* <ul className={`${open ? 'open' : 'closed'}`}>{children}</ul> */}
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
  to: PropTypes.string,
  location: PropTypes.string,
  // icon: PropTypes.string,
  label: PropTypes.string,
  more: PropTypes.bool,
  expanded: PropTypes.bool,
};

export default MenuItem;
