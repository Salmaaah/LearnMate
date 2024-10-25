import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import useOutsideClick from '../../../hooks/useOutsideClick';
import { ReactComponent as MoreIcon } from '../../../assets/icons/more.svg';
import { toHyphenatedLowercase } from '../../../utils/stringUtils';

/**
 * A customizable menu item component that supports navigation, icons, labels, and submenus.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {string} [props.as='li'] - The HTML element to render as.
 * @param {boolean} [props.isSubItem=false] - Whether the menu item is a sub item of another menu item.
 * @param {React.ReactNode} [props.children] - The sub items of the menu item.
 * @param {boolean} [props.active=false] - Whether the menu item should be highlighted.
 * @param {React.ReactNode} [props.icon] - The icon to display.
 * @param {boolean} [props.iconOnly=false] - Whether the menu item should display only the icon.
 * @param {string} [props.label] - The text label to display.
 * @param {('large' | 'medium' | 'small')} [props.size='large'] - The size of the menu item.
 * @param {string} [props.to] - URL in case menu item's purpose is navigation.
 * @param {Function} [props.onInteraction] - Function in case menu item's purpose is to handle a specific action.
 * @param {boolean} [props.disabled=false] - Whether the menu item is disabled.
 * @param {('tr-tl' | 'bl-tl')} [props.position='tr-tl'] - Position class for dropdown when iconOnly is true.
 * @returns {JSX.Element} The rendered component.
 */
const MenuItem = ({
  as: Element = 'li',
  isSubItem = false,
  children,
  active = false,
  icon,
  iconOnly = false,
  label,
  size = 'large',
  to,
  onInteraction,
  disabled = false,
  position = 'tr-tl',
}) => {
  const { pathname } = useLocation();
  const ref = useRef(null);
  const timeoutRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [submenuClass, setSubmenuClass] = useState('');
  const highlighted = to === pathname || active;
  const hasSubMenu = !!children;

  /**
   * Passes the `isSubItem` prop to all child menu items.
   *
   * @param {React.ReactElement} children - A React element that may contain child elements
   *   (e.g., a parent `MenuItem` with sub-items).
   * @returns {React.ReactNode[]} An array of cloned React elements with the `isSubItem` prop set to `true`.
   *   Returns `undefined` if `children` is not provided or has no children.
   */
  const handleSubItems = (children) => {
    if (children)
      return React.Children.map(children, (child) =>
        React.cloneElement(child, { ...child.props, isSubItem: true })
      );
  };

  // Set isHovered state to true on mouse enter for menuitem and submenu
  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current); // Cancel any previously scheduled timeout
    if (!disabled) setIsHovered(true); // Only hover if the item is not disabled
  }, [disabled]);

  // Set isHovered state to false on mouse leave for menuitem and submenu
  const handleMouseLeave = useCallback(() => {
    if (submenuClass) {
      // Delay removing hover state to make submenu accessible
      timeoutRef.current = setTimeout(() => setIsHovered(false), 100);
    } else {
      setIsHovered(false);
    }
  }, [submenuClass]);

  /**
   * Handle clicks or Enter key presses on the menu item.
   *
   * @param {React.MouseEvent | React.KeyboardEvent} event - The click/keypress event.
   */
  const handleAction = (event) => {
    if (disabled) {
      event.preventDefault(); // Prevent action if the item is disabled
      return;
    }

    if (onInteraction) onInteraction(event);
    if (hasSubMenu) setIsOpen(!isOpen);
  };

  // Handle which submenu class is applied
  useEffect(() => {
    if (hasSubMenu) {
      if (iconOnly && (isHovered || isOpen))
        setSubmenuClass(`sub2 ${position}`);
      else if (!iconOnly && isOpen) setSubmenuClass('sub1');
      else setSubmenuClass('');
    }
  }, [hasSubMenu, iconOnly, isOpen, isHovered]);

  // Close submenu when iconOnly is true
  useEffect(() => {
    if (iconOnly) setIsOpen(false);
  }, [iconOnly]);

  // Close submenu when clicking outside
  useOutsideClick(ref, isOpen ? () => setIsOpen(false) : null);

  // Props for the menu item's title element (either <Link> or <button>).
  const titleProps = {
    className: `menu-item__title ${size}${disabled ? ' disabled' : ''}${
      highlighted || submenuClass ? ' highlighted' : ''
    }`,
    onClick: handleAction,
    disabled,
    tabIndex: disabled ? -1 : 0,
    'aria-disabled': disabled,
    'aria-label': label,
  };

  // Props specifically for the menu item's title <button>.
  const ariaProps = hasSubMenu
    ? {
        'aria-haspopup': true,
        'aria-controls': `${toHyphenatedLowercase(label)}-submenu`,
        'aria-expanded': isOpen,
      }
    : {};

  // Content of the menu item's title.
  const titleContent = (
    <>
      {icon}
      <span className={`${iconOnly && !isSubItem ? 'hidden' : 'visible'}`}>
        {label && <div>{label}</div>}
        {hasSubMenu && <MoreIcon />}
      </span>
    </>
  );

  return (
    <Element
      className={`menu-item ${submenuClass}`}
      ref={ref}
      role={Element === 'li' ? 'menuitem' : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {to ? (
        <Link to={to} {...titleProps}>
          {titleContent}
        </Link>
      ) : (
        <button {...titleProps} {...ariaProps}>
          {titleContent}
        </button>
      )}
      {(isOpen || (iconOnly && isHovered)) && (
        <ul
          className={`menu-item__submenu ${submenuClass}`}
          role="menu"
          id={`${toHyphenatedLowercase(label)}-submenu`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {handleSubItems(children)}
        </ul>
      )}
      <div
        className={`menu-item__tooltip${
          !submenuClass && isHovered && iconOnly ? ' visible' : ' hidden'
        }`}
        role="tooltip"
        aria-hidden={submenuClass || !isHovered}
      >
        {label}
      </div>
    </Element>
  );
};

MenuItem.propTypes = {
  as: PropTypes.string,
  isSubItem: PropTypes.bool,
  children: PropTypes.node,
  icon: PropTypes.node,
  iconOnly: PropTypes.bool,
  label: PropTypes.string,
  size: PropTypes.oneOf(['large', 'medium', 'small']),
  active: PropTypes.bool,
  to: PropTypes.string,
  onInteraction: PropTypes.func,
  disabled: PropTypes.bool,
  position: PropTypes.oneOf(['tr-tl', 'bl-tl']),
};

export default MenuItem;
