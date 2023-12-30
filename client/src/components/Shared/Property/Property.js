import { ReactComponent as DeleteIcon } from '../../../assets/icons/delete_2.svg';
import PropTypes from 'prop-types';

const Property = ({ name, color, textOnly, onClick }) => {
  return (
    <li className={`property ${color}`} onClick={onClick}>
      <div>{name}</div>
      {!textOnly && <DeleteIcon />}
    </li>
  );
};

export default Property;

Property.defaultProps = {
  color: 'gray',
  textOnly: false,
};

Property.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.string,
  textOnly: PropTypes.bool,
  onClick: PropTypes.func,
};
