import Button from '../Shared/Button/Button';

const Popup = ({ title, content, isOpen, setIsOpen, action, handleAction }) => {
  const closeModal = (e) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  const submitAction = (e) => {
    e.stopPropagation();
    handleAction();
  };

  return isOpen ? (
    <div className="popupBackdrop" onClick={(e) => closeModal(e)}>
      <dialog
        open={isOpen}
        className="popup"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{title}</h3>
        <p>{content}</p>
        <div>
          <Button
            label="Cancel"
            variant="primary"
            onClick={(e) => closeModal(e)}
          />
          <Button
            label={action}
            variant="secondary"
            onClick={(e) => submitAction(e)}
          />
        </div>
      </dialog>
    </div>
  ) : (
    ''
  );
};

export default Popup;
