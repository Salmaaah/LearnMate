import PropTypes from 'prop-types';
import IconButton from '../IconButton/IconButton';
import Popup from '../Popup/Popup';
import { ReactComponent as DeleteIcon } from '../../assets/icons/delete_3.svg';
import { ReactComponent as DragIcon } from '../../assets/icons/drag_2.svg';
import { useState, useRef, useEffect } from 'react';
import useTodo from '../../hooks/useTodo';
import useHandleRows from '../../hooks/useHandleRows';

/**
 * Displays a single todo item with functionality to edit content,
 * mark as done, rearrange order, and delete. The component also handles dynamic
 * row adjustment based on content size.
 *
 * @component
 * @param {object} props - Component properties.
 * @param {{id: number, content: string, done: boolean, order: number}} props.todo - The todo data object.
 * @param {object} props.provided - React Beautiful DnD's provided object for drag-and-drop functionality.
 * @returns {JSX.Element} - Rendered todo component.
 */
const Todo = ({ provided, todo }) => {
  const [content, setContent] = useState(todo.content);
  const [ariaContent, setAriaContent] = useState(
    todo.content.substring(0, 20) + (todo.content.length > 20 ? '...' : '')
  );
  const [done, setDone] = useState(todo.done);
  const [showPopup, setShowPopup] = useState(false);
  const ref = useRef(null);
  const [rows, setRows] = useState(1);
  const { handleUpdateTodo, handleDeleteTodo } = useTodo();
  const handleRows = useHandleRows(ref, content, 2, setRows);

  // Handles checkbox toggle and update todo status
  const handleCheckboxClick = () => {
    if (content) {
      handleUpdateTodo(todo.id, { done: !done });
      setDone((prev) => !prev);
    }
  };

  useEffect(() => {
    handleRows();
    if (!content) setDone(false); // reset done state when todo is empty
  }, [content, handleRows]);

  // Effect to ensure that the UI always reflects the changes implemented in the backend
  useEffect(() => {
    setContent(todo.content);
    setAriaContent(
      todo.content.substring(0, 40) + (todo.content.length > 40 ? '...' : '')
    );
    setDone(todo.done);
  }, [todo]);

  return (
    <li
      className="todo"
      id={`todo-${todo.id}`}
      ref={provided?.innerRef}
      {...provided?.draggableProps}
    >
      <div className="todo__content">
        <span
          className={`todo__checkbox${content ? ' full' : ''}${
            done ? ' checked' : ''
          }`}
          onClick={handleCheckboxClick}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCheckboxClick();
          }}
          role="checkbox"
          aria-checked={done}
          aria-labelledby={`todo-text-${todo.id}`}
        />
        <textarea
          className={`todo__text${done ? ' done' : ''}`}
          id={`todo-text-${todo.id}`}
          ref={ref}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={rows}
          onBlur={() => {
            !content.trim()
              ? handleDeleteTodo(todo.id)
              : handleUpdateTodo(todo.id, { content: content });
          }}
          aria-label="Todo item content"
        />
      </div>
      <div className="todo__controls">
        <IconButton
          provided={provided}
          icon={<DragIcon />}
          size="13px"
          iColor="var(--M75)"
          bHcolor=""
          ariaProps={{
            'aria-label': `Drag todo #${todo.order}`,
          }}
        />
        <IconButton
          icon={<DeleteIcon />}
          size="13px"
          iColor="var(--P200)"
          onClick={(e) => {
            e.stopPropagation();
            setShowPopup(true);
          }}
          ariaProps={{
            'aria-label': `Delete todo #${todo.order}`,
            'aria-haspopup': 'dialog',
            'aria-controls': `delete-todo-popup-${todo.id}`,
            'aria-expanded': showPopup,
          }}
        />
        <Popup
          id={`delete-todo-popup-${todo.id}`}
          title="Delete task?"
          content={
            <>
              The <strong>{ariaContent}</strong> task will be permanently
              deleted.
            </>
          }
          isOpen={showPopup}
          setIsOpen={setShowPopup}
          action="Delete"
          handleAction={() => handleDeleteTodo(todo.id)}
        />
      </div>
    </li>
  );
};

Todo.propTypes = {
  provided: PropTypes.object,
  todo: PropTypes.shape({
    id: PropTypes.number.isRequired,
    content: PropTypes.string.isRequired,
    done: PropTypes.bool.isRequired,
    order: PropTypes.number.isRequired,
  }).isRequired,
};

export default Todo;
