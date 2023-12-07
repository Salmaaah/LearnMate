import PropTypes from 'prop-types';
import Button from '../Shared/Button/Button';
import Input from '../Shared/Input/Input';

const Header = (props) => {
  return (
    <nav className="navbar">
      <h1 className="navbar__logo">LearnMate</h1>
      <Button label="Log in" />
    </nav>
  );
};

Header.defaultProps = {
  name: 'LearnMate',
};

Header.propTypes = {
  name: PropTypes.string.isRequired,
};

export default Header;
