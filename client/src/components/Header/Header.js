import PropTypes from 'prop-types';
import Button from '../Shared/Button/Button';

const Header = ({ cta }) => {
  return (
    <div className="navbarContainer">
      <nav className="navbar">
        <a className="navbar__logo" href="/">
          LearnMate
        </a>
        <div className="hide-for-mobile">
          <Button label={cta} type="button" style="secondary" />
        </div>
      </nav>
    </div>
  );
};

Header.defaultProps = {
  cta: 'Log in',
};

Header.propTypes = {
  cta: PropTypes.string.isRequired,
};

export default Header;
