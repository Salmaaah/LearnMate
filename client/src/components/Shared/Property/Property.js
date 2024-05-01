import { ReactComponent as DeleteIcon } from '../../../assets/icons/delete_2.svg';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const Property = ({
  as: Element = 'div',
  name,
  color = '#eae9ec',
  textOnly = false,
  link,
  handleRemove,
}) => {
  const navigate = useNavigate();

  return (
    <Element
      className="property"
      style={{ backgroundColor: color }}
      onClick={(e) => {
        link && e.stopPropagation();
        navigate(link);
      }}
    >
      <div className={`property__name${link ? ' link' : ''}`}>{name}</div>
      {!textOnly && <DeleteIcon onClick={handleRemove} />}
    </Element>
  );
};

export default Property;

Property.propTypes = {
  as: PropTypes.string,
  name: PropTypes.string.isRequired,
  color: PropTypes.string,
  textOnly: PropTypes.bool,
  link: PropTypes.string,
  handleRemove: PropTypes.func,
};
