import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSidebar } from '../../contexts/SidebarContext';
import { useDataContext } from '../../contexts/DataContext';
import { FileProvider } from '../../contexts/FileContext';
import Layout from '../../pages/Layout/Layout';
import DocViewer from '../../components/Docviewer/Docviewer';
import ActionItem from '../../components/Shared/ActionItem/ActionItem';
import Note from '../../components/Shared/Note/Note';
import { ReactComponent as NotesIllustration } from '../../assets/illustrations/notes.svg';
import { ReactComponent as TodosIllustration } from '../../assets/illustrations/todos.svg';
// import { ReactComponent as ChangeCaseIcon } from '../../assets/icons/changeCase.svg';
// import ReactDOM from 'react-dom/client';

const Learn = () => {
  const { setIsExpanded } = useSidebar();
  const { id } = useParams();
  const { data } = useDataContext();
  const file = data.files.find((file) => file.id === parseInt(id));
  const [isEnlarged, setIsEnlarged] = useState({
    notes: false,
    todos: false,
    flashCards: false,
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
            <ActionItem
              label="Todos"
              illustration={<TodosIllustration />}
              isVisible={isEnlarged.todos || !isAnyEnlarged()}
            />
            <ActionItem
              label="Flashcards"
              isVisible={isEnlarged.flashCards || !isAnyEnlarged()}
            />
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
