import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Button from '../Shared/Button/Button';
import { ReactComponent as LearnmateLogo } from '../../assets/brandLogos/learnmate.svg';
import { ReactComponent as MenuIcon } from '../../assets/icons/menu.svg';
import NavItem from '../Shared/NavItem/NavItem';

/**
 * Serves as the main navigation header of the application when user is logged out.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {React.ReactNode} props.children - The navigation items to be displayed in the header.
 * @param {string} props.to - The path that the CTA button should link to.
 * @param {string} props.cta - The label text for the CTA button.
 * @returns {JSX.Element} - Rendered Header component.
 */
const Header = ({ children, to, cta }) => {
  const hasNavItems = !!children;

  return (
    <header className="navbarContainer">
      <nav className={`navbar${hasNavItems ? ' with-items' : ' no-items'}`}>
        <Link
          className="navbar__logo"
          to="/"
          aria-label="Navigate to welcome page"
        >
          <LearnmateLogo />
          <div className={`${hasNavItems ? 'hide-for-tablet-only' : ''}`}>
            LearnMate
          </div>
        </Link>
        <ul className="hide-for-mobile" role="menubar">
          {children}
        </ul>
        <div className="hide-for-mobile">
          <Button to={to} label={cta} variant="secondary" />
        </div>
        {hasNavItems && (
          <NavItem
            as="div"
            icon={<MenuIcon />}
            position="br-tr"
            addClass="hide-for-tablet-up"
            ariaLabel="Main navigation"
          >
            {children}
            <br />
            <Button to={to} label={cta} variant="secondary" />
          </NavItem>
        )}
      </nav>
    </header>
  );
};

Header.propTypes = {
  to: PropTypes.string.isRequired,
  cta: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export default Header;
