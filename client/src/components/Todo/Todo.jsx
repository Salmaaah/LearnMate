import IconButton from '../IconButton/IconButton';
import { ReactComponent as DeleteIcon } from '../../assets/icons/delete_3.svg';
import { ReactComponent as DragIcon } from '../../assets/icons/drag_2.svg';
import { useState, useRef, useEffect } from 'react';
import useTodo from '../../hooks/useTodo';

const Todo = ({ provided, todo }) => {
  const [content, setContent] = useState(todo.content);
  const [done, setDone] = useState(todo.done);
  const ref = useRef(null);
  const [rows, setRows] = useState(1);
  const { handleUpdateTodo, handleDeleteTodo } = useTodo();

  // TODO: This needs to be refractored into a hook to be used here and by flashcard (difference in rows 2 vs 4)
  const handleRows = (ref, text, setRows) => {
    const textarea = ref.current;

    // Create a hidden div to measure wrapped lines
    const hiddenDiv = document.createElement('div');
    hiddenDiv.style.visibility = 'hidden';
    hiddenDiv.style.position = 'absolute';
    hiddenDiv.style.whiteSpace = 'pre-wrap'; // Preserve whitespace like textarea
    hiddenDiv.style.wordBreak = 'break-word'; // Mimic textarea word wrapping behavior
    hiddenDiv.style.width = `${textarea.clientWidth}px`; // Match the width of the textarea
    hiddenDiv.style.fontSize = window.getComputedStyle(textarea).fontSize;
    hiddenDiv.style.fontFamily = window.getComputedStyle(textarea).fontFamily;

    // Set the text content to a single line to measure line height
    hiddenDiv.textContent = 'test'; // Single line text
    document.body.appendChild(hiddenDiv);
    const lineHeight = hiddenDiv.clientHeight;

    // Set the text content to match the textarea for height calculation
    hiddenDiv.textContent = text + '\n';
    const hiddenDivHeight = hiddenDiv.clientHeight;

    document.body.removeChild(hiddenDiv);

    const newRows = Math.ceil(hiddenDivHeight / lineHeight);
    setRows(newRows > 2 ? 2 : newRows); // max rows are 4
  };

  useEffect(() => {
    handleRows(ref, content, setRows);
  }, [content]);

  // Effect to reset done state when todo is empty
  useEffect(() => {
    !content && setDone(false);
  }, [content]);

  // Effect to set focus on a newly created todo with a delay to account for the scrolling animation
  useEffect(() => {
    const handlefocus = (event) => {
      setTimeout(() => {
        todo.order === event.detail.todo && ref.current.focus();
      }, 200);
    };

    document.addEventListener('todoFocus', handlefocus);

    return () => {
      document.removeEventListener('todoFocus', handlefocus);
    };
  }, []);

  return (
    <li className="todo" ref={provided?.innerRef} {...provided?.draggableProps}>
      <div className="todo__content">
        <span
          className={`todo__checkbox${content ? ' full' : ''}${
            done ? ' checked' : ''
          }`}
          onClick={() => {
            if (content) {
              handleUpdateTodo(todo.id, { done: !done });
              setDone(!done);
            }
          }}
        />
        <textarea
          className={`todo__text${done ? ' done' : ''}`}
          ref={ref}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={rows}
          onBlur={() => {
            !content.trim()
              ? handleDeleteTodo(todo.id)
              : handleUpdateTodo(todo.id, { content: content });
          }}
        />
      </div>
      <div className="todo__controls">
        <IconButton
          provided={provided}
          icon={<DragIcon />}
          size="13px"
          iColor="var(--M75)"
          bHcolor=""
        />
        <IconButton
          icon={<DeleteIcon />}
          size="13px"
          iColor="var(--P200)"
          onClick={() => handleDeleteTodo(todo.id)}
        />
      </div>
    </li>
  );
};

export default Todo;
