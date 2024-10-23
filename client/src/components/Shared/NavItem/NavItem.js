import PropTypes from 'prop-types';
import { useState, useRef } from 'react';
import useOutsideClick from '../../../hooks/useOutsideClick';
import { toHyphenatedLowercase } from '../../../utils/stringUtils';

/**
 * Displays a navigation item with optional dropdown and label.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {string} [props.as='li'] - Element type to render.
 * @param {React.ReactNode} props.children - Dropdown items.
 * @param {React.ReactNode} props.icon - Icon to display.
 * @param {string} [props.label] - Text label for the item.
 * @param {string} [props.ariaLabel] - Aria label for the item.
 * @param {boolean} [props.iconOnly=false] - Whether the menu item displays only an icon.
 * @param {('tl-bl' | 'br-tr' | 'br-bl')} [props.position='tl-bl'] - Position class for dropdown.
 * @param {string} [props.addClass] - Additional CSS classes.
 * @returns {JSX.Element} The rendered component.
 */
const NavItem = ({
  as: Element = 'li',
  children,
  icon,
  label,
  ariaLabel,
  iconOnly = false,
  position = 'tl-bl',
  addClass = '',
}) => {
  const [open, setOpen] = useState(false);
  const navItemRef = useRef(null);

  // Close dropdown when clicking outside of the nav item
  useOutsideClick(navItemRef, open ? () => setOpen(false) : null);

  return (
    <Element
      className={`nav-item ${addClass}`}
      ref={navItemRef}
      role={Element === 'li' ? 'menuitem' : undefined}
      aria-label={ariaLabel}
    >
      <button
        className="nav-item__header"
        style={
          iconOnly || !label
            ? { borderRadius: '50%' }
            : { borderRadius: '42px', padding: '5px 5px' }
        }
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={`${toHyphenatedLowercase(
          ariaLabel ? ariaLabel : label
        )}-submenu`}
      >
        <div>{icon}</div>
        {label && (
          <div className={`${iconOnly ? 'hidden' : 'visible'}`}>{label}</div>
        )}
      </button>
      {open && (
        <ul
          className={`nav-item__dropdown ${position}`}
          id={`${toHyphenatedLowercase(ariaLabel ? ariaLabel : label)}-submenu`}
          role="menu"
        >
          {children}
        </ul>
      )}
    </Element>
  );
};

NavItem.propTypes = {
  as: PropTypes.elementType,
  children: PropTypes.node,
  icon: PropTypes.node.isRequired,
  label: PropTypes.string,
  ariLabel: PropTypes.string,
  iconOnly: PropTypes.bool,
  position: PropTypes.oneOf(['tl-bl', 'br-tr', 'br-bl']),
  addClass: PropTypes.string,
};

export default NavItem;
