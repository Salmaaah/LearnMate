import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Button from '../Shared/Button/Button';

const Header = ({ children, to, cta }) => {
  return (
    <header className="navbarContainer">
      <nav className="navbar">
        <Link className="navbar__logo" to="/">
          LearnMate
        </Link>
        <ul>{children}</ul>
        <div className="hide-for-mobile">
          <Button to={to} label={cta} variant="secondary" />
        </div>
      </nav>
    </header>
  );
};

Header.propTypes = {
  to: PropTypes.string,
  cta: PropTypes.string.isRequired,
};

export default Header;
