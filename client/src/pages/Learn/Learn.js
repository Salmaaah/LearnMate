import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useFlashcard from '../../hooks/useFlashcard';
import useTodo from '../../hooks/useTodo';
import { useSidebar } from '../../contexts/SidebarContext';
import { useDataContext } from '../../contexts/DataContext';
import { FileProvider } from '../../contexts/FileContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Layout from '../../pages/Layout/Layout';
import DocViewer from '../../components/Docviewer/Docviewer';
import ActionItem from '../../components/Shared/ActionItem/ActionItem';
import Note from '../../components/Shared/Note/Note';
import Flashcard from '../../components/Flashcard/Flashcard';
import Todo from '../../components/Todo/Todo';
import { ReactComponent as NotesIllustration } from '../../assets/illustrations/notes.svg';
import { ReactComponent as TodosIllustration } from '../../assets/illustrations/todos.svg';
// import { ReactComponent as ChangeCaseIcon } from '../../assets/icons/changeCase.svg';
// import ReactDOM from 'react-dom/client';

const Learn = () => {
  const { setIsExpanded } = useSidebar();
  const { id } = useParams();
  const { data } = useDataContext();
  const file = data.files.find((file) => file.id === parseInt(id));
  const flashcards = file.flashcards?.sort((a, b) => a.order - b.order);
  const todos = file.todos?.sort((a, b) => {
    // First, compare by `done` property
    if (a.done !== b.done) {
      return a.done - b.done;
    }
    // If `done` properties are the same, compare by `order`
    return a.order - b.order;
  });
  const { handleUpdateFlashcard } = useFlashcard();
  const { handleUpdateTodo } = useTodo();
  const [isEnlarged, setIsEnlarged] = useState({
    notes: false,
    todos: false,
    flashcards: false,
    quizzes: false,
  });

  // Hide sidebar on mount
  useEffect(() => {
    setIsExpanded(false);
  }, []);

  const toggleSize = (component) => {
    setIsEnlarged((prevState) => ({
      ...prevState,
      [component]: !prevState[component],
    }));
  };

  const isAnyEnlarged = () => {
    return Object.values(isEnlarged).some((value) => value === true);
  };

  // TODO: Figure out a better way to replace the icons I don't like from editorjs plugins
  // useEffect(() => {
  //   // Function to replace SVG
  //   const replaceSvg = (selector, IconComponent) => {
  //     const svgElement = document.querySelector(selector);

  //     if (svgElement) {
  //       const container = document.querySelector(selector.split(' > ')[0]);
  //       container.innerHTML = '';
  //       const root = ReactDOM.createRoot(container);
  //       root.render(<IconComponent />);
  //       return true;
  //     }
  //     return false;
  //   };

  //   // Create a new MutationObserver instance
  //   var observer = new MutationObserver((mutationsList, observer) => {
  //     // Look through all mutations that just occured
  //     for (let mutation of mutationsList) {
  //       // If the addedNodes property has one or more nodes
  //       if (mutation.addedNodes.length) {
  //         if (
  //           replaceSvg('button[data-tool="changeCase"] > svg', ChangeCaseIcon)
  //         ) {
  //           // Once we have replaced the SVG, there's no need to observe anymore
  //           observer.disconnect();
  //           break;
  //         }
  //       }
  //     }
  //   });

  //   // Start observing the document with the configured parameters
  //   observer.observe(document, { childList: true, subtree: true });
  // }, []);

  const reorder = (array, startIndex, endIndex) => {
    const result = array;
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = (items, handleUpdateItem) => (result) => {
    if (!result.destination) {
      return;
    }

    const reorderedItems = reorder(
      items,
      result.source.index,
      result.destination.index
    );

    reorderedItems.map((item, index) => {
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
          <div
            className={`grid__docviewer${isAnyEnlarged() ? ' hidden' : ' '}`}
          >
            <div>{file.name}</div>
            <DocViewer uri={`/files/${id}`} />
            {/* TODO: Add viewing for file types not included in Docviewer such as .svg */}
          </div>
          <div className="grid__actions">
            <ActionItem
              label="Notes"
              illustration={<NotesIllustration />}
              toggleSize={() => toggleSize('notes')}
              isVisible={isEnlarged.notes || !isAnyEnlarged()}
              isEnlarged={isEnlarged}
              setIsEnlarged={setIsEnlarged}
            >
              {file.notes.length > 0 &&
                file.notes.map((note) => <Note key={note.id} note={note} />)}
            </ActionItem>
            <DragDropContext
              onDragEnd={onDragEnd(flashcards, handleUpdateFlashcard)}
            >
              <Droppable droppableId="droppable">
                {(provided) => (
                  <ActionItem
                    provided={provided}
                    label="Flashcards"
                    illustration={<NotesIllustration />}
                    toggleSize={() => toggleSize('flashcards')}
                    isVisible={isEnlarged.flashcards || !isAnyEnlarged()}
                    isEnlarged={isEnlarged}
                    setIsEnlarged={setIsEnlarged}
                  >
                    {flashcards.length > 0 &&
                      flashcards.map((flashcard, index) => (
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
                  </ActionItem>
                )}
              </Droppable>
            </DragDropContext>
            <DragDropContext onDragEnd={onDragEnd(todos, handleUpdateTodo)}>
              <Droppable droppableId="droppable">
                {(provided) => (
                  <ActionItem
                    provided={provided}
                    label="Todos"
                    illustration={<TodosIllustration />}
                    toggleSize={() => toggleSize('todos')}
                    isVisible={isEnlarged.todos || !isAnyEnlarged()}
                    isEnlarged={isEnlarged}
                    setIsEnlarged={setIsEnlarged}
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
            <ActionItem
              label="Quizzes"
              isVisible={isEnlarged.quizzes || !isAnyEnlarged()}
            />
          </div>
        </div>
      </FileProvider>
    </Layout>
  );
};

export default Learn;
