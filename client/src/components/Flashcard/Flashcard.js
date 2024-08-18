import { useEffect, useState, useRef } from 'react';
import useFlashcard from '../../hooks/useFlashcard';
import AIsearch from '../Shared/AIsearch/AIsearch';
import IconButton from '../IconButton/IconButton';
import { ReactComponent as ImageIcon } from '../../assets/icons/image.svg';
import { ReactComponent as CrossIcon } from '../../assets/icons/delete_2.svg';
import { ReactComponent as DeleteIcon } from '../../assets/icons/delete_3.svg';
import { ReactComponent as DragIcon } from '../../assets/icons/drag_2.svg';
import { ReactComponent as StarsIcon } from '../../assets/icons/stars.svg';
import { ReactComponent as SwitchIcon } from '../../assets/icons/switch.svg';

const Flashcard = ({ flashcard, provided, handleButtonClick }) => {
  const [term, setTerm] = useState(flashcard.term);
  const [definition, setDefinition] = useState(flashcard.definition);
  const termRef = useRef(null);
  const definitionRef = useRef(null);
  const [termRows, setTermRows] = useState(1);
  const [definitionRows, setDefinitionRows] = useState(1);
  const [termIsFocused, setTermIsFocused] = useState(false);
  const [definitionIsFocused, setDefinitionIsFocused] = useState(false);
  const {
    handleUpdateFlashcard,
    handleDeleteFlashcard,
    handleUploadFlashcardImage,
    handleDeleteFlashcardImage,
  } = useFlashcard();
  // TODO: This state is useless and will be removed once the necessary changes are made to let go of the related AIsearch props
  const [showAIsearch, setShowAIsearch] = useState(false);

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
    setRows(newRows > 4 ? 4 : newRows); // max rows are 4
  };

  useEffect(() => {
    handleRows(termRef, term, setTermRows);
  }, [term]);

  useEffect(() => {
    handleRows(definitionRef, definition, setDefinitionRows);
  }, [definition]);

  // Effect to set focus to term on a newly created flashcard with a delay to account for the scrolling animation
  useEffect(() => {
    const handlefocus = (event) => {
      setTimeout(() => {
        flashcard.order === event.detail.flashcard && termRef.current.focus();
      }, 500);
    };

    document.addEventListener('flashcardFocus', handlefocus);

    return () => {
      document.removeEventListener('flashcardFocus', handlefocus);
    };
  }, []);

  // Effect to ensure that the UI always reflecs the changes implemented in the backend
  useEffect(() => {
    setTerm(flashcard.term);
    setDefinition(flashcard.definition);
  }, [flashcard]);

  return (
    <li
      className="flashcard"
      ref={provided?.innerRef}
      {...provided?.draggableProps}
    >
      <div className="flashcard__header">
        <div>{flashcard.order}</div>
        <div className="flashcard__buttons">
          <IconButton
            provided={provided}
            icon={<DragIcon />}
            size="13px"
            iColor="var(--M75)"
            bHcolor=""
          />
          <IconButton
            icon={<StarsIcon />}
            size="13px"
            onClick={() =>
              handleButtonClick(
                'generate',
                term !== '' && definition === ''
                  ? `${flashcard.id}_definition`
                  : `${flashcard.id}_term`
              )
            }
          />
          <IconButton
            icon={<SwitchIcon />}
            size="13px"
            onClick={() => {
              handleUpdateFlashcard(flashcard.id, {
                term: definition,
                definition: term,
              });
              setTerm(definition);
              setDefinition(term);
            }}
          />
          <IconButton
            icon={<DeleteIcon />}
            size="13px"
            iColor="var(--P200)"
            onClick={() => handleDeleteFlashcard(flashcard.id)}
          />
        </div>
      </div>
      <div></div>
      <div className="flashcard__content">
        <div className="flashcard__leftContent">
          <div className="flashcard__entry">
            <AIsearch
              context="Flashcards"
              parentId={`${flashcard.id}_term`}
              showAIsearch={showAIsearch}
              setShowAIsearch={setShowAIsearch}
            />

            <textarea
              ref={termRef}
              id={`${flashcard.id}_term`}
              value={term}
              placeholder="Enter your term"
              onChange={(e) => setTerm(e.target.value)}
              onFocus={() => setTermIsFocused(true)}
              rows={termRows}
              onBlur={() => {
                setTermIsFocused(false);
                handleUpdateFlashcard(flashcard.id, { term: term });
              }}
            />
            <div className={`${termIsFocused ? 'highlight' : ''}`}></div>
            <div>TERM</div>
          </div>
          <div className="flashcard__entry">
            <AIsearch
              context="Flashcards"
              parentId={`${flashcard.id}_definition`}
              showAIsearch={showAIsearch}
              setShowAIsearch={setShowAIsearch}
            />
            <textarea
              ref={definitionRef}
              id={`${flashcard.id}_definition`}
              value={definition}
              placeholder="Enter your definition"
              onChange={(e) => setDefinition(e.target.value)}
              onFocus={() => setDefinitionIsFocused(true)}
              rows={definitionRows}
              onBlur={() => {
                setDefinitionIsFocused(false);
                handleUpdateFlashcard(flashcard.id, { definition: definition });
              }}
            />
            <div className={`${definitionIsFocused ? 'highlight' : ''}`}></div>
            <div>DEFINITION</div>
          </div>
        </div>
        {flashcard.imagePath ? (
          <div className="flashcard__image">
            <img
              src={`/getFlashcardImage/${flashcard.id}`}
              alt={flashcard.term}
              onError={(e) => {
                // Optionally, display a placeholder or default image
                // e.target.src = '/path/to/placeholder-image.jpg';
              }}
            />
            <IconButton
              icon={<CrossIcon />}
              size="7px"
              bColor="var(--M75)"
              onClick={() => handleDeleteFlashcardImage(flashcard.id)}
            />
          </div>
        ) : (
          <>
            <div className="flashcard__imageUpload">
              <div>
                <ImageIcon />
                <div>Image</div>
              </div>
              <input
                alt="click to add image"
                accept="image/*"
                type="file"
                onChange={(e) => handleUploadFlashcardImage(e, flashcard.id)}
              />
            </div>
          </>
        )}
      </div>
    </li>
  );
};
export default Flashcard;
