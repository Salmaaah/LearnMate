import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef } from 'react';
import { useFileContext } from '../../../contexts/FileContext';
import { useEditorContext } from '../../../contexts/EditorContext';
import { useDataContext } from '../../../contexts/DataContext';
import useNote from '../../../hooks/useNote';
import useFlashcard from '../../../hooks/useFlashcard';
import useTodo from '../../../hooks/useTodo';
import useAI from '../../../hooks/useAI';
import { ReactComponent as BackIcon } from '../../../assets/icons/arrow.svg';
import { ReactComponent as NewIcon } from '../../../assets/icons/new.svg';
import { ReactComponent as ExpandIcon } from '../../../assets/icons/expand.svg';
import { ReactComponent as ReduceIcon } from '../../../assets/icons/reduce.svg';
import { ReactComponent as StarsIcon } from '../../../assets/icons/stars.svg';
import Button from '../Button/Button';
import MenuItem from '../MenuItem/MenuItem';
import Note from '../Note/Note';
import { Draggable } from '@hello-pangea/dnd';

/**
 * Renders a section that handles either notes, flashcards, todos, or quizzes.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {object} [props.provided] - Provided object from react-beautiful-dnd for drag-and-drop functionality.
 * @param {string} props.label - The label for the type of item (e.g., 'Notes', 'Flashcards', etc.).
 * @param {React.Element} props.illustration - The illustration or icon displayed for the action item.
 * @param {object} props.enlargedState - State object for managing the size and visibility of the component.
 * @param {function(): void} props.enlargedState.toggleSize - Function to toggle the enlarged state of the component.
 * @param {boolean} props.enlargedState.isVisible - Boolean flag to determine if the action item is visible.
 * @param {boolean} props.enlargedState.isEnlarged - Boolean flag to check if the action item is currently enlarged.
 * @param {React.ReactNode} props.children - Child components passed to the ActionItem, such as notes, flashcards, or todos.
 * @returns {JSX.Element} The rendered ActionItem component.
 */
const ActionItem = ({
  provided,
  label,
  illustration,
  enlargedState: { toggleSize, isVisible, isEnlarged },
  children,
}) => {
  // Default empty note
  const noNote = {
    id: null,
    name: '',
    content: null,
  };

  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [openSubItemId, setOpenSubItemId] = useState(null); // in case of subItems that are clickable such as notes and quizzes
  const [currentNote, setCurrentNote] = useState(noNote);
  const [showAIsearch, setShowAIsearch] = useState(false);

  // Refs
  const actionItemRef = useRef(null);
  const listEndRef = useRef(null);

  // Contexts
  const { data } = useDataContext();
  const { id: fileId, notes, flashcards, todos } = useFileContext();
  const { editorInstanceRef, initEditor } = useEditorContext();

  // Custom Hooks (handling notes, flashcards, todos)
  const { handleCreateNote, handleUpdateNote, handleDeleteNote } = useNote();
  const { handleCreateFlashcard, handleUpdateFlashcard } = useFlashcard();
  const { handleCreateTodo } = useTodo();
  const { askAI } = useAI();

  // Derived data
  const actionItems = { notes, flashcards, todos }; // quizzes
  const subItems = actionItems[label.toLowerCase()];
  const noteFromData = data?.notes?.find(
    (note) => note.id === parseInt(currentNote.id)
  );

  // Effect to Synchronize the currentNote state with data changes from the server.
  useEffect(() => {
    if (noteFromData) {
      setCurrentNote({
        ...noteFromData,
        content: JSON.parse(noteFromData.content),
      });
    }
  }, [noteFromData]);

  /**
   * Scrolls to the specified reference.
   *
   * @param {React.RefObject} ref - Element to scroll into view.
   * @param {string} alignment - Scroll alignment (e.g., 'start', 'nearest').
   */
  const handleScroll = (ref, alignment) => {
    setTimeout(() => {
      ref?.current?.scrollIntoView({ behavior: 'smooth', block: alignment });
    }, 1);
  };

  // Handles Clicking on ActionItem header
  const handleHeaderClick = () => {
    if (!openSubItemId && children) setIsOpen(!isOpen);
    if (isOpen && isEnlarged) toggleSize();
    if (!isOpen) handleScroll(actionItemRef, 'start');
  };

  /**
   * Handles interactions within different contexts (Notes, Flashcards, Todos).
   * The behavior of this function is dynamic and depends on the provided action type and the current context (`label`).
   *
   * @async
   * @param {('create' | 'generate' | 'multigen' | 'edit')} action - The type of action to perform. Supported actions vary by context:
   *  - 'create': Creates a new note, flashcard, or todo.
   *  - 'generate': AI-powered generation of a note or flashcard.
   *  - 'multigen': Generates multiple flashcards at once based on a file's content (only applicable to Flashcards context).
   *  - 'edit': Edits an existing note (only applicable to Notes context).
   * @param {object|string} [item] - Relevant item data. The expected type depends on the context and action:
   *  - For Notes 'edit' action: an object with note details (id, name, content).
   *  - For Flashcards 'generate' action: a string representing the flashcard's term/definition ID.
   *  - For other contexts and actions, this may be omitted.
   * @returns {Promise<void>} - Resolves when the action is completed. It may involve DOM updates, scrolling, or event dispatching.
   *
   * @sideEffects
   * - Modifies component state (e.g., `setIsOpen`, `setCurrentNote`, `setOpenSubItemId`).
   * - Scrolls the view to align newly created or modified items into view.
   * - Dispatches custom DOM events (e.g., 'flashcardFocus', 'todoFocus').
   * - Uses `setTimeout` for timed interactions with the DOM (e.g., scrolling, initializing the editor, AI search focus).
   */
  // TODO: refractor function to improve readability, maintainability, and future extensibility.
  const handleButtonClick = async (action, item) => {
    // Open ActionItem if not already open
    setIsOpen(true);

    // Scroll to align the actionItem to the top of the screen
    handleScroll(actionItemRef, 'start');

    if (label === 'Notes') {
      if (action === 'create' || action === 'generate') {
        // Handle new note creation
        const note = await handleCreateNote(fileId);
        setCurrentNote(note);
        setOpenSubItemId(note.id);

        // Wait for the visibility and open states in note to be saved to have the editorjs element in the DOM before trying to open note
        setTimeout(async () => {
          await initEditor(
            note.id,
            handleUpdateNote,
            '',
            action === 'generate'
          );
        }, 1);

        // Wait for the editor to finish initializing and have the autofocus set to determine the position of AIsearch
        // before showing it to make sure the focus goes to the AIsearch input after opening as expected
        setTimeout(() => {
          if (action === 'generate') setShowAIsearch(true);
        }, 100);
      } else if (action === 'edit') {
        // Handle when an existing note is clicked
        setOpenSubItemId(item.id);
        setCurrentNote({
          id: item.id,
          name: item.name,
          content: item.content,
        });

        // Wait for the visibility and open states in note to be saved to have the editorjs element in the DOM before trying to open note
        setTimeout(async () => {
          await initEditor(undefined, handleUpdateNote, item);
        }, 1);
      }
    } else if (label === 'Flashcards') {
      if (action === 'create') {
        // Handle new Flashcard creation
        const order = children ? children.length + 1 : 1;
        await handleCreateFlashcard(fileId, order);

        // Delay to account for the previous scrolling animation
        setTimeout(() => {
          // Scroll to show the newly created flashcard in view
          handleScroll(listEndRef, 'nearest');

          // Dispatch flashcardFocus event
          const focusEvent = new CustomEvent('flashcardFocus', {
            detail: { flashcard: order },
          });
          document.dispatchEvent(focusEvent);
        }, 400);
      } else if (action === 'generate') {
        // Handle AI generation on current flashcard
        // 1ms Delay because for some unknown reason without it this doesn't work
        setTimeout(() => {
          // Dispatch space key event to trigger AIsearch
          // in this case 'item' is the parentId that AIsearch needs, either id + term or id + definition
          const targetElement = document.getElementById(item);
          const spaceEvent = new KeyboardEvent('keydown', {
            key: ' ',
            bubbles: true, // Ensure the event bubbles up through the DOM
          });
          targetElement.dispatchEvent(spaceEvent);
        }, 1);
      } else if (action === 'multigen') {
        // Handle multiple flashcard generation from file content
        const response = await askAI('Flashcards', action, fileId);
        const flashcardRegex = /F:\s(.*?)\nB:\s(.*?)(?=\nF:|\n$)/gs;
        let match;
        let order = flashcards.length + 1;

        // Match, create, and scroll to view flashcards one at a time
        while ((match = flashcardRegex.exec(response)) !== null) {
          const front = match[1].trim();
          const back = match[2].trim();
          const flashcardId = await handleCreateFlashcard(fileId, order);

          await handleUpdateFlashcard(flashcardId, {
            term: front,
            definition: back,
          });

          handleScroll(listEndRef, 'nearest');
          order += 1;
        }
      }
    } else if (label === 'Todos') {
      // Handle new Todo creation
      const order = children ? children.length + 1 : 1;
      await handleCreateTodo(fileId, order);

      // Delay to account for the previous scrolling animation
      setTimeout(() => {
        // Scroll to show the newly created todo in view
        handleScroll(listEndRef, 'nearest');

        // Dispatch todoFocus event
        const focusEvent = new CustomEvent('todoFocus', {
          detail: { todo: order },
        });
        document.dispatchEvent(focusEvent);
        console.log('dispatched event', focusEvent);
      }, 400);
    }
  };

  /**
   * Handles the back button click behavior for sub-items like notes and quizzes.
   *
   * @async
   * @returns {Promise<void>}
   */
  const handleBackClick = async () => {
    // When subItem is a note, we need to check if it's empty and delete it before closing
    if (
      label === 'Notes' &&
      (currentNote.content === null ||
        currentNote.content === '' ||
        currentNote.content.blocks.every((block) => {
          return block.data.text.replace(/&nbsp;/g, '') === '';
        }))
    ) {
      await handleDeleteNote(currentNote.id);
      setCurrentNote(noNote);
      setShowAIsearch(false);
    }

    // Reset the subItem ID
    setOpenSubItemId(null);
  };

  /**
   * Clones children elements and passes necessary props based on their type.
   *
   * @param {React.ReactNode} children - Children elements to be rendered.
   * @returns {React.ReactNode} Modified children elements.
   */
  const handleChildren = (children) => {
    return React.Children.map(children, (child) => {
      if (!child) return null;

      if (child.type === Note) {
        return React.cloneElement(child, {
          ...child.props,
          openSubItemId,
          handleButtonClick,
          handleDeleteNote,
          showAIsearch,
        });
      } else if (child.type === Draggable) {
        // Extract the function passed to Draggable's children prop
        const draggableChildFunction = child.props.children;

        // Wrap the child function to add the state to the correct element
        const wrappedFunction = (provided) => {
          const draggableChild = draggableChildFunction(provided);

          // Check if the inner child is Flashcard
          if (draggableChild.type.name === 'Flashcard') {
            return React.cloneElement(draggableChild, {
              ...draggableChild.props,
              handleButtonClick,
            });
          }

          return draggableChild;
        };

        return React.cloneElement(child, {
          ...child.props,
          children: wrappedFunction,
        });
      } else {
        return child;
      }
    });
  };

  // Close the ActionItem in case all subItems were deleted to get back to the original state
  useEffect(() => {
    if (!children) {
      setIsOpen(false);
    }
  }, [children]);

  return (
    <section
      ref={actionItemRef}
      className={`action-item${children ? ' full' : ''}${
        isOpen ? ' open' : ' closed'
      }${isVisible ? '' : ' hidden'}`}
      style={
        isEnlarged
          ? { marginLeft: '28px', height: 'calc(100% - 20px)' }
          : isOpen && label === 'Flashcards'
          ? { backgroundColor: 'hsl(263, 15%, 98%)' }
          : {}
      }
      aria-labelledby="title"
    >
      <div
        className={`action-item__header${
          openSubItemId || !children ? '' : ' pointer'
        }`}
        onClick={handleHeaderClick}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleHeaderClick();
        }}
        role="button"
        aria-expanded={isOpen}
        aria-controls={`${label.toLowerCase()}-content`}
      >
        <div id="left-section">
          {/* TODO: This is focused solely on when a note is open, need to make it adaptable to when it's a quizz */}
          {openSubItemId && isOpen ? (
            <div id="title-2">
              <Button
                icon_l={<BackIcon />}
                variant="secondary"
                onClick={handleBackClick}
                ariaLabel={'Click to go back'}
              />
              <input
                name="name"
                type="text"
                autoComplete="off"
                onClick={(event) => event.stopPropagation()}
                onFocus={(event) => event.target.select()}
                value={currentNote.name}
                onChange={
                  (e) =>
                    setCurrentNote({
                      ...currentNote,
                      [e.target.name]: e.target.value,
                    }) // Update the value of the title as the user types
                }
                onKeyDown={(e) =>
                  e.key === 'Enter' && editorInstanceRef.current?.focus()
                }
                onBlur={() =>
                  handleUpdateNote(currentNote.id, 'name', currentNote.name)
                }
                aria-label="Note title"
                autoFocus
              />
            </div>
          ) : (
            <div id="title">{label}</div>
          )}

          {!isOpen && (
            <div id="subtitle">
              {children ? (
                <>
                  <div>
                    {subItems.length === 1
                      ? '1 ITEM'
                      : `${subItems.length} ITEMS`}
                  </div>

                  <button
                    style={label === 'Todos' ? { display: 'none' } : {}}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleButtonClick(
                        label === 'Flashcards' ? 'multigen' : 'generate'
                      );
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && e.stopPropagation()} // when pressing "Enter" on a button element, browsers automatically trigger the onClick event but with a delay, that's why we stop propagation in the meantime
                    aria-label={`Generate ${label
                      .toLowerCase()
                      .replace(/s$/, '')} with AI`}
                  >
                    <StarsIcon />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleButtonClick('create');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && e.stopPropagation()} // when pressing "Enter" on a button element, browsers automatically trigger the onClick event but with a delay, that's why we stop propagation in the meantime
                    aria-label={`Create new ${label
                      .toLowerCase()
                      .replace(/s$/, '')}`}
                  >
                    <NewIcon />
                  </button>
                </>
              ) : label === 'Todos' ? (
                <>Create your first todo list</>
              ) : label === 'Quizz' ? (
                <>Test yourself with a custom generated quizz</>
              ) : (
                <>Create your {label} using AI or write your own</>
              )}
            </div>
          )}
          {!children && !isOpen && (
            <div id="CTA">
              {label !== 'Todos' ? (
                <>
                  <Button
                    icon_l={<StarsIcon />}
                    label="Generate with AI"
                    onClick={() => handleButtonClick('generate')}
                    disabled={label === 'Quizzes' ? true : false}
                  />
                  <button
                    onClick={() => handleButtonClick('create')}
                    style={label === 'Quizzes' ? { display: 'none' } : {}}
                  >
                    Create your own
                  </button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  label="Click to start"
                  onClick={() => handleButtonClick('create')}
                />
              )}
            </div>
          )}
        </div>
        {!isOpen ? (
          <>{illustration}</>
        ) : (
          <div id="right-section">
            {label === 'Notes' && (
              <Button
                icon_l={<StarsIcon />}
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleButtonClick('generate');
                }}
                onKeyDown={(e) => e.key === 'Enter' && e.stopPropagation()} // when pressing "Enter" on a button element, browsers automatically trigger the onClick event but with a delay, that's why we stop propagation in the meantime
                ariaLabel={'Click to generate note with AI'}
              />
            )}
            <Button
              icon_l={isEnlarged ? <ReduceIcon /> : <ExpandIcon />}
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                toggleSize();
              }}
              onKeyDown={(e) => e.key === 'Enter' && e.stopPropagation()} // when pressing "Enter" on a button element, browsers automatically trigger the onClick event but with a delay, that's why we stop propagation in the meantime
              ariaLabel={`Click to ${isEnlarged ? 'reduce' : 'enlarge'}`}
            />
          </div>
        )}
      </div>
      {isOpen && (
        <div
          className={`action-item__content${
            openSubItemId ? ' openSubItem' : ''
          }`}
          style={isEnlarged ? { height: '100%' } : {}}
          id={`${label.toLowerCase()}-content`}
        >
          {openSubItemId ? (
            handleChildren(children)
          ) : (
            <>
              <ul
                id="sub-items"
                {...provided?.droppableProps}
                ref={provided?.innerRef}
                aria-label={`List of ${label}`}
              >
                {handleChildren(children)}
                {provided?.placeholder}
                <div ref={listEndRef} style={{ display: 'hidden' }} />
              </ul>
              <MenuItem
                as="div"
                icon={<NewIcon />}
                label={`New ${label.replace(/s$/, '')}`}
                onInteraction={() => handleButtonClick('create')}
              />
            </>
          )}
        </div>
      )}
    </section>
  );
};

ActionItem.propTypes = {
  provided: PropTypes.object,
  label: PropTypes.string.isRequired,
  illustration: PropTypes.element.isRequired,
  enlargedState: PropTypes.shape({
    toggleSize: PropTypes.func.isRequired,
    isVisible: PropTypes.bool.isRequired,
    isEnlarged: PropTypes.bool.isRequired,
  }).isRequired,
  children: PropTypes.node, // not required for now because of quizzes being incomplete
};

export default ActionItem;
