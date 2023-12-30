import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ReactComponent as MoreIcon } from '../../../assets/icons/more.svg';

const MenuItem = ({ children, to, icon, label, iconOnly, onClick }) => {
  const location = useLocation();
  const active = to === location.pathname;
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    if (children) {
      // in case the MenuItem has a submenu
      setIsOpen(!isOpen);
    }
  };

  useEffect(() => {
    if (iconOnly) {
      setIsOpen(false); // Close the submenu when the MenuItem is set to iconOnly
    }
  }, [iconOnly]);

  return (
    <li
      className={`menuItem ${
        isOpen && !iconOnly // don't need !iconOnly because of the condition in useEffect
          ? 'sub1'
          : children && isHovered && iconOnly
          ? 'sub2 tr-tl'
          : ''
      }`}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      <Link
        className={`menuItem__title ${active ? 'active' : ''}`}
        to={to}
        onClick={handleClick}
      >
        {icon}
        <span className={`${iconOnly ? 'hidden' : 'visible'}`}>
          {label && <div>{label}</div>}
          {children && <MoreIcon />}
        </span>
      </Link>
      <ul className="menuItem__submenu">{children}</ul>
      <div
        className={`menuItem__tooltip ${
          iconOnly && !children && isHovered ? 'visible' : 'hidden'
        }`}
      >
        {label}
      </div>
    </li>
  );
};

MenuItem.defaultProps = {
  iconOnly: false,
};

MenuItem.propTypes = {
  to: PropTypes.string,
  icon: PropTypes.object,
  label: PropTypes.string,
  iconOnly: PropTypes.bool,
  onClick: PropTypes.func,
};

export default MenuItem;
