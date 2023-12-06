const Button = (props) => {
  return (
    <button className="button__secondary" disabled>
      {props.icon_l && (
        <img className="button__icon" src={props.icon_l} alt="" />
      )}
      <div>{props.label}</div>
      {props.icon_r && (
        <img className="button__icon" src={props.icon_r} alt="" />
      )}
    </button>
  );
};

export default Button;
