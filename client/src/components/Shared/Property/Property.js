import { ReactComponent as DeleteIcon } from '../../../assets/icons/delete_2.svg';
import PropTypes from 'prop-types';

const Property = ({ name, color, textOnly, handleRemove }) => {
  return (
    <li className="property" style={{ backgroundColor: color }}>
      <div>{name}</div>
      {!textOnly && <DeleteIcon onClick={handleRemove} />}
    </li>
  );
};

export default Property;

Property.defaultProps = {
  color: '#eae9ec',
  textOnly: false,
};

Property.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.string,
  textOnly: PropTypes.bool,
  onClick: PropTypes.func,
};
