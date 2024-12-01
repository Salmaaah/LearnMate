import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useFlashcard from '../../hooks/useFlashcard';
import useTodo from '../../hooks/useTodo';
import { useSidebar } from '../../contexts/SidebarContext';
import { useDataContext } from '../../contexts/DataContext';
import { FileProvider } from '../../contexts/FileContext';
import { useOpenDeck } from '../../contexts/DeckContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Layout from '../../pages/Layout/Layout';
import DocViewer from '../../components/Docviewer/Docviewer';
import ActionItem from '../../components/Shared/ActionItem/ActionItem';
import Note from '../../components/Shared/Note/Note';
import Flashcard from '../../components/Flashcard/Flashcard';
import FlashcardDeck from '../../components/FlashcardDeck/FlashcardDeck';
import FlashcardViewer from '../../components/FlashcardViewer/FlashcardViewer';
import Todo from '../../components/Todo/Todo';
import { ReactComponent as NotesIllustration } from '../../assets/illustrations/notes.svg';
import { ReactComponent as TodosIllustration } from '../../assets/illustrations/todos.svg';

/**
 * Displays a file and its associated flashcards, notes, todos, and quizzes,
 * and manages drag-and-drop functionality.
 *
 * @component
 * @returns {JSX.Element} The rendered Learn component.
 */
const Learn = () => {
  const { setIsExpanded } = useSidebar();
  const { id } = useParams();
  const { data } = useDataContext();
  const { openDeckFlashcards } = useOpenDeck();
  const file = data?.files.find((file) => file.id === parseInt(id));
  const todos =
    file?.todos?.sort((a, b) => {
      if (a.done !== b.done) return a.done - b.done; // compare by done property
      return a.order - b.order; // if done is the same compare by order
    }) || [];
  const { handleUpdateFlashcard } = useFlashcard();
  const { handleUpdateTodo } = useTodo();
  const [isEnlarged, setIsEnlarged] = useState({
    notes: false,
    todos: false,
    flashcards: false,
    quizzes: false,
  });
  // Effect to hide the sidebar when the component is mounted.
  useEffect(() => {
    setIsExpanded(false);
  }, [setIsExpanded]);

  /**
   * Toggles the size (enlarged or not) of a specific component.
   *
   * @param {string} component - The name of the component to enlarge or shrink.
   */
  const toggleSize = (component) => {
    setIsEnlarged((prevState) => ({
      ...prevState,
      [component]: !prevState[component],
    }));
  };

  /**
   * Checks if any component is currently enlarged.
   *
   * @returns {boolean} True if any component is enlarged, otherwise false.
   */
  const isAnyEnlarged = () => Object.values(isEnlarged).some((value) => value);

  /**
   * Encapsulates the logic for determining the visibility and size state
   * of each component into an object.
   *
   * @param {string} component - The name of the component.
   * @returns {{ toggleSize: function(): void, isVisible: boolean, isEnlarged: boolean }}
   */
  const getEnlargedState = (component) => ({
    toggleSize: () => toggleSize(component),
    isVisible: isEnlarged[component] || !isAnyEnlarged(),
    isEnlarged: isEnlarged[component],
  });

  /**
   * Reorders an array after a drag-and-drop action.
   *
   * @param {Array} array - The array to reorder.
   * @param {number} startIndex - The index from which to move an item.
   * @param {number} endIndex - The index to move the item to.
   * @returns {Array} A new array with the reordered items.
   */
  const reorder = (array, startIndex, endIndex) => {
    const result = Array.from(array); // Create a new array to avoid mutating original
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  /**
   * Handles drag-and-drop reordering of items.
   *
   * @param {Array} items - The items to reorder.
   * @param {function(number, object): Promise<void>} handleUpdateItem - Function to update the order of an item.
   * @returns {Function} A function to be used as the `onDragEnd` handler for drag-and-drop.
   */
  const onDragEnd = (items, handleUpdateItem) => (result) => {
    if (!result.destination) return;

    const reorderedItems = reorder(
      items,
      result.source.index,
      result.destination.index
    );

    reorderedItems.forEach((item, index) => {
      handleUpdateItem(item.id, { order: index + 1 });
    });
  };

  return (
    <Layout>
      <FileProvider file={file}>
        <div
          className={isAnyEnlarged() ? '' : 'grid'}
          style={isAnyEnlarged() ? { height: '90vh' } : {}}
        >
          {/* Document Viewer */}
          <div
            className={`grid__docviewer${isAnyEnlarged() ? ' hidden' : ''}`}
            role="document"
            aria-labelledby="file-name"
          >
            <div id="file-name">{file?.name}</div>
            <DocViewer uri={`/files/${id}`} />
          </div>
          {/* Action Items for Notes, Flashcards, Todos, Quizzes */}
          <div
            className="grid__actions"
            role="group"
            aria-label="Actions: Notes, Flashcards, Todos, and Quizzes"
          >
            {/* Notes Section */}
            <ActionItem
              label="Notes"
              illustration={<NotesIllustration />}
              enlargedState={getEnlargedState('notes')}
            >
              {file?.notes?.length > 0 &&
                file.notes.map((note) => <Note key={note.id} note={note} />)}
            </ActionItem>
            {/* Flashcards Section with Drag-and-Drop */}
            <DragDropContext
              onDragEnd={onDragEnd(openDeckFlashcards, handleUpdateFlashcard)}
            >
              <Droppable droppableId="flashcards">
                {(provided) => (
                  <ActionItem
                    provided={provided}
                    label="Flashcards"
                    illustration={<NotesIllustration />}
                    enlargedState={getEnlargedState('flashcards')}
                  >
                    {file?.flashcard_decks?.length > 0 &&
                      file.flashcard_decks.map((deck) => {
                        return (
                          <FlashcardDeck key={deck.id} deck={deck}>
                            {openDeckFlashcards.length > 0 && (
                              <>
                                <FlashcardViewer
                                  flashcards={openDeckFlashcards}
                                />
                                {openDeckFlashcards.map((flashcard, index) => (
                                  <Draggable
                                    key={flashcard.id.toString()}
                                    draggableId={flashcard.id.toString()}
                                    index={index}
                                  >
                                    {(provided) => (
                                      <Flashcard
                                        provided={provided}
                                        flashcard={flashcard}
                                      />
                                    )}
                                  </Draggable>
                                ))}
                              </>
                            )}
                          </FlashcardDeck>
                        );
                      })}
                  </ActionItem>
                )}
              </Droppable>
            </DragDropContext>
            {/* Todos Section with Drag-and-Drop */}
            <DragDropContext onDragEnd={onDragEnd(todos, handleUpdateTodo)}>
              <Droppable droppableId="todos">
                {(provided) => (
                  <ActionItem
                    provided={provided}
                    label="Todos"
                    illustration={<TodosIllustration />}
                    enlargedState={getEnlargedState('todos')}
                  >
                    {todos.length > 0 &&
                      todos.map((todo, index) => (
                        <Draggable
                          key={todo.id.toString()}
                          draggableId={todo.id.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <Todo provided={provided} todo={todo} />
                          )}
                        </Draggable>
                      ))}
                  </ActionItem>
                )}
              </Droppable>
            </DragDropContext>
            {/* Quizzes Section */}
            <ActionItem
              label="Quizzes"
              illustration={<TodosIllustration />}
              enlargedState={getEnlargedState('quizzes')}
            />
          </div>
        </div>
      </FileProvider>
    </Layout>
  );
};

export default Learn;
