import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef } from 'react';
import { useFileContext } from '../../../contexts/FileContext';
import { useEditorContext } from '../../../contexts/EditorContext';
import { useOpenDeck } from '../../../contexts/DeckContext';
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
import FlashcardDeck from '../../FlashcardDeck/FlashcardDeck';
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
  // Default empty sub-item data
  const noSubItem = {
    id: null,
    name: null,
    ...(label === 'Notes' ? { content: null } : {}),
    ...(label === 'Flashcards' ? { flashcards: null } : {}),
  };

  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [openSubItem, setOpenSubItem] = useState(noSubItem);
  const [editorState, setEditorState] = useState(null);
  const [showAIsearch, setShowAIsearch] = useState(false);
  const [scrollToListItem, setScrollToListItem] = useState(null);

  // Refs
  const actionItemRef = useRef(null);
  const editorContainerRef = useRef(null);
  const listEndRef = useRef(null);
  const prevDeps = useRef({ isOpen, id: openSubItem.id });

  // Contexts
  const { id: fileId, notes, flashcard_decks, todos } = useFileContext();
  const { editorInstanceRef, initEditor } = useEditorContext();
  const { setOpenDeckId } = useOpenDeck();

  // Custom Hooks (handling notes, flashcards, todos)
  const { handleCreateNote, handleUpdateNote, handleDeleteNote } = useNote();
  const {
    handleCreateFlashcardDeck,
    handleUpdateFlashcardDeck,
    handleDeleteFlashcardDeck,
    handleCreateFlashcard,
    handleUpdateFlashcard,
  } = useFlashcard();
  const { handleCreateTodo } = useTodo();
  const { askAI } = useAI();

  // Derived data
  const actionItems = { notes, flashcard_decks, todos }; // quizzes
  const subItems =
    actionItems[
      label === 'Flashcards' ? 'flashcard_decks' : label.toLowerCase()
    ];
  const openSubItemFromCtx = subItems?.find(
    (item) => item.id === parseInt(openSubItem.id)
  );

  // Effect to Synchronize the openSubItem state with data changes from the server.
  useEffect(() => {
    openSubItemFromCtx && setOpenSubItem(openSubItemFromCtx);
  }, [openSubItemFromCtx]);

  // Handles scrolling and focusing behaviors based on component state.
  useEffect(() => {
    const scroll = async () => {
      // Check if isOpen or openSubItem.id has changed
      const isOpenChange = isOpen !== prevDeps.current.isOpen;
      const idChange = openSubItem.id !== prevDeps.current.id;

      // Align the actionItem to the top of the screen when opening an action item or sub-item
      if ((isOpen && isOpenChange) || (openSubItem.id && idChange))
        await handleScroll(actionItemRef, 'start');

      // Handle scrolling to a list item if indicated
      if (scrollToListItem) {
        await handleScroll(listEndRef, 'nearest');

        // Focus the list item unless explicitly told not to ('noFocus')
        if (scrollToListItem !== 'noFocus') {
          const targetElement = document.getElementById(scrollToListItem);
          if (targetElement) {
            targetElement.focus();
          } else {
            console.warn(`Element with ID '${scrollToListItem}' not found.`);
          }
        }

        // Reset scrollToListItem
        setScrollToListItem(null);
      }
    };

    // Run scroll logic
    scroll();

    // Update the previous values for the next effect
    prevDeps.current = { isOpen, id: openSubItem.id };
  }, [isOpen, openSubItem.id, scrollToListItem]);

  /**
   * Handles scrolling to the specified reference and alignment.
   *
   * @param {React.RefObject} ref - Element to scroll into view.
   * @param {string} alignment - Scroll alignment (e.g., 'start', 'nearest').
   */
  const handleScroll = (ref, alignment) => {
    return new Promise((resolve) => {
      const targetElement = ref.current;
      if (!targetElement) return resolve();

      // Calculate the distance and approximate duration
      const currentScroll = window.scrollY;
      const targetScroll =
        targetElement.getBoundingClientRect().top + currentScroll;
      const distance = Math.abs(currentScroll - targetScroll);
      const speed = 1; // Pixels per millisecond (adjust for your use case)
      const estimatedDuration = Math.min(distance / speed, 1000); // Cap duration at 1 second

      // Use smooth scroll
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: alignment,
      });

      // Resolve after the estimated duration
      setTimeout(resolve, estimatedDuration);
    });
  };

  // Handles Clicking on ActionItem header
  const handleHeaderClick = () => {
    if (!openSubItem.id && children) setIsOpen(!isOpen);
    if (isOpen && !openSubItem.id && isEnlarged) toggleSize();
  };

  // Observes the DOM for the editorjs div to become available and trigger editor initialization logic.
  useEffect(() => {
    if (!editorState || editorState.initialized) return;

    const observer = new MutationObserver(() => {
      const editorElement = document.getElementById('editorjs');

      if (editorElement) {
        editorContainerRef.current = editorElement;
        observer.disconnect();
        setEditorState((prevState) => ({ ...prevState })); // Trigger re-run of `useEffect`
      }
    });

    observer.observe(actionItemRef.current, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [editorState]);

  // Handles the editor initialization logic and related actions
  useEffect(() => {
    if (!editorState) return;

    const { note, action, initialized } = editorState;

    const initializeEditor = async () => {
      if (editorContainerRef.current) {
        await initEditor(handleUpdateNote, note, action === 'generate');
        setEditorState((prevState) => ({ ...prevState, initialized: true }));
      }
    };

    if (!initialized) {
      initializeEditor();
      action === 'generate' && setShowAIsearch(true);
    }
  }, [editorState]);

  /**
   * Handles interactions within different contexts (Notes, Flashcards, Todos).
   * The behavior of this function is dynamic and depends on the provided action type and the current context (`label`).
   *
   * @async
   * @param {('create' | 'generate' | 'multigen' | 'edit')} action - The type of action to perform. Supported actions vary by context:
   *  - 'create': Creates a new note, flashcard deck, flashcard, or todo.
   *  - 'generate': AI-powered generation of a single note or flashcard.
   *  - 'multigen': Generates multiple flashcards at once in a new or existing deck based on a file's content (only applicable to Flashcards context).
   *  - 'edit': Edits an existing note (only applicable to Notes context).
   * @param {object|number|string} [itemData] - Relevant item data. The expected type depends on the context and action:
   *  - For Notes and FlashcardDecks 'edit' action: an object with item data (id, name, content/flashcards).
   *  - For Flashcards 'generate' action: a string representing the flashcard's term/definition ID.
   *  - For other contexts and actions, this may be omitted.
   * @returns {Promise<void>} - Resolves when the action is completed. It may involve DOM updates, scrolling, or event dispatching.
   */
  // TODO: refractor function to improve readability, maintainability, and future extensibility.
  const handleButtonClick = async (action, itemData) => {
    // Open ActionItem if not already open
    !isOpen && setIsOpen(true);

    // Handle different action types based on the label (Notes, Flashcards, Todos)
    if (label === 'Notes') {
      if (action === 'create' || action === 'generate') {
        // Handle new note creation
        const note = await handleCreateNote(fileId);
        setOpenSubItem(note); // Set the newly created note as the open sub-item
        setEditorState({ note, action, initialized: false }); // Initialize editor with the new note and showAIsearch in case of 'generate'
      } else if (action === 'edit') {
        // Handle opening an existing note
        setOpenSubItem(itemData); // Set the note as the open sub-item
        setEditorState({ note: itemData, action, initialized: false }); // Initialize editor with the existing note
      }
    } else if (label === 'Flashcards') {
      if (openSubItem.id) {
        // Flashcard level actions (if a sub-item is already open)
        const flashcards =
          flashcard_decks.find((deck) => deck.id === parseInt(openSubItem.id))
            ?.flashcards || [];

        if (action === 'create') {
          // Handle creating a new flashcard in the current deck
          const order = flashcards.length + 1; // Set the new flashcard's order based on the existing count
          const flashcard = await handleCreateFlashcard(openSubItem.id, order);
          setScrollToListItem(`term-${flashcard.id}`); // Scroll to the newly created flashcard
        } else if (action === 'generate') {
          // Dispatch a simulated spacebar key event to trigger show AIsearch logic inside AIsearch component
          const targetElement = document.getElementById(itemData);
          const spaceEvent = new KeyboardEvent('keydown', {
            key: ' ',
            bubbles: true, // Ensure the event bubbles up through the DOM
          });
          targetElement.dispatchEvent(spaceEvent);
        } else if (action === 'multigen') {
          // Handle multiple flashcard generation from file content into currently open deck
          handleMultigenFlashcards(openSubItem.id, fileId, flashcards.length);
        }
      } else {
        // Deck level actions (if no sub-item is open)

        if (action === 'create' || action === 'multigen') {
          // Handle new deck creation
          const deck = await handleCreateFlashcardDeck(
            fileId,
            action === 'multigen' // create an empty deck in case of batch generation
          );
          setOpenSubItem(deck); // Set the new deck as the open sub-item

          // For 'multigen', trigger batch flashcard generation in the newly created deck
          action === 'multigen' && handleMultigenFlashcards(deck.id, fileId, 0);
        } else if (action === 'edit') {
          // Handle opening an existing deck
          setOpenSubItem(itemData);
        }
      }
    } else if (label === 'Todos') {
      // Handle new Todo creation
      const order = children ? children.length + 1 : 1; // Set order based on existing todos
      const todo = await handleCreateTodo(fileId, order);
      setScrollToListItem(`todo-text-${todo.id}`); // Scroll to the newly created Todo
    }
  };

  const handleMultigenFlashcards = async (deckId, fileId, currentCount) => {
    const response = await askAI('Flashcards', 'multigen', fileId);
    const flashcardRegex = /F:\s(.*?)\nB:\s(.*?)(?=\nF:|\n$)/gs;
    let match;
    let order = currentCount + 1;

    // Create and update flashcards concurrently
    const flashcardPromises = [];
    while ((match = flashcardRegex.exec(response)) !== null) {
      const front = match[1].trim();
      const back = match[2].trim();
      const flashcardPromise = handleCreateFlashcard(deckId, order).then(
        (flashcard) =>
          handleUpdateFlashcard(flashcard.id, { term: front, definition: back })
      );
      flashcardPromises.push(flashcardPromise);
      order += 1;
    }

    await Promise.all(flashcardPromises);
    setScrollToListItem('noFocus');
  };

  // Effect to update the OpenDeckId state from DeckContext to to supply the onDragEnd function with the correct list of flashcards for dragging.
  useEffect(() => {
    label === 'Flashcards' && setOpenDeckId(openSubItem.id);
  }, [openSubItem.id]);

  // Handles name update of open sub-item on blur in case of Notes and Flashcards
  const updateItemName = (itemId, updatedName) => {
    const updateHandler =
      label === 'Notes' ? handleUpdateNote : handleUpdateFlashcardDeck;
    return updateHandler(itemId, { name: updatedName });
  };

  /**
   * Handles the back button click behavior for sub-items like notes and quizzes.
   *
   * @async
   * @returns {Promise<void>}
   */
  const handleBackClick = async () => {
    if (label === 'Notes') {
      editorContainerRef.current = null; // Reset editorContainerRef to avoid stale references

      if (
        Object.keys(openSubItem.content).length === 0 || // openSubItem.content is an empty object
        openSubItem.content.blocks?.every((block) => {
          return block.data.text.replace(/&nbsp;/g, '') === '';
        }) // All blocks within openSubItem.content contain empty values
      ) {
        // Delete note if empty
        await handleDeleteNote(openSubItem.id);
      }
    } else if (
      label === 'Flashcards' &&
      openSubItem.flashcards.every((flashcard) => {
        return !flashcard.term && !flashcard.definition && !flashcard.imagePath;
      })
    ) {
      await handleDeleteFlashcardDeck(openSubItem.id);
    }

    // Reset the open sub-item
    setOpenSubItem(noSubItem);
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
          openNoteId: openSubItem.id,
          handleEdit: handleButtonClick,
          handleDelete: handleDeleteNote,
          showAIsearch,
        });
      } else if (child.type === FlashcardDeck) {
        return React.cloneElement(child, {
          ...child.props,
          openDeckId: openSubItem.id,
          handleEdit: handleButtonClick,
          handleDelete: handleDeleteFlashcardDeck,
          handleChildren,
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
              handleGenerate: handleButtonClick,
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
      style={{
        ...(isEnlarged && { marginLeft: '28px', height: 'calc(100% - 20px)' }),
        ...(openSubItem.id &&
          label === 'Flashcards' && { backgroundColor: 'hsl(263, 15%, 98%)' }),
      }}
      aria-labelledby="title"
    >
      <div
        className={`action-item__header${
          openSubItem.id || !children ? '' : ' pointer'
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
          {openSubItem.id && isOpen ? (
            // aka a note or flashcard deck is open
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
                value={openSubItem.name}
                onChange={
                  (e) =>
                    setOpenSubItem({
                      ...openSubItem,
                      [e.target.name]: e.target.value,
                    }) // Update the value of the title as the user types
                }
                onKeyDown={(e) =>
                  label === 'Notes' &&
                  e.key === 'Enter' &&
                  editorInstanceRef.current?.focus()
                }
                onBlur={() => updateItemName(openSubItem.id, openSubItem.name)}
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
                    onClick={() =>
                      handleButtonClick(
                        label === 'Flashcards' ? 'multigen' : 'generate'
                      )
                    }
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
            {(label === 'Notes' || label === 'Flashcards') && (
              <Button
                icon_l={<StarsIcon />}
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleButtonClick(
                    label === 'Notes' ? 'generate' : 'multigen'
                  );
                }}
                onKeyDown={(e) => e.key === 'Enter' && e.stopPropagation()} // when pressing "Enter" on a button element, browsers automatically trigger the onClick event but with a delay, that's why we stop propagation in the meantime
                ariaLabel={`Click to ${
                  label === 'Notes'
                    ? 'generate note'
                    : 'batch generate flashcards'
                } with AI`}
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
            label === 'Notes' && openSubItem.id ? ' open-note' : ''
          }`}
          style={isEnlarged ? { height: '100%' } : {}}
          id={`${label.toLowerCase()}-content`}
        >
          {label === 'Notes' && openSubItem.id ? (
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
                label={`New ${label.replace(/s$/, '')}${
                  label === 'Flashcards' && !openSubItem.id ? ' Deck' : ''
                }`}
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
