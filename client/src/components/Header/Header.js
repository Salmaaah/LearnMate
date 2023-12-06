import PropTypes from 'prop-types';
import Button from '../Shared/Button/Button';
import applelogo from '../../assets/icons/apple-logo.svg';

const hello = 'Hello!';

const Header = (props) => {
  return (
    <div>
      <h1>{props.name}</h1>
      <h2>{hello}</h2>
      <Button label="Log in" icon_r={applelogo} />
    </div>
  );
};

Header.defaultProps = {
  name: 'LearnMate',
};

Header.propTypes = {
  name: PropTypes.string.isRequired,
};

export default Header;
