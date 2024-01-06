import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import useOutsideClick from '../../../hooks/useOutsideClick';
import { ReactComponent as MoreIcon } from '../../../assets/icons/more.svg';

// TODO: create small version

const MenuItem = ({
  children,
  to,
  active,
  icon,
  label,
  size,
  iconOnly,
  onClick,
}) => {
  const location = useLocation();
  const ref = useRef(null);
  const highlight = to === location.pathname || active;
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

  useOutsideClick(ref, () => setIsOpen(false));

  return (
    <li
      ref={ref}
      className={`menuItem ${size} ${
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
        className={`menuItem__title ${highlight ? 'highlight' : ''}`}
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
  size: 'large',
  active: false,
};

MenuItem.propTypes = {
  to: PropTypes.string,
  icon: PropTypes.object,
  label: PropTypes.string,
  size: PropTypes.oneOf(['large', 'medium', 'small']),
  active: PropTypes.bool, // in case the MenuItem is not a Link and needs to be highlighted
  iconOnly: PropTypes.bool,
  onClick: PropTypes.func,
};

export default MenuItem;
