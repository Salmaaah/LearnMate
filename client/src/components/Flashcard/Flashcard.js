import { useEffect, useState, useRef } from 'react';
import useFlashcard from '../../hooks/useFlashcard';
import IconButton from '../IconButton/IconButton';
import { ReactComponent as ImageIcon } from '../../assets/icons/image.svg';
import { ReactComponent as CrossIcon } from '../../assets/icons/delete_2.svg';
import { ReactComponent as DeleteIcon } from '../../assets/icons/delete_3.svg';
import { ReactComponent as DragIcon } from '../../assets/icons/drag_2.svg';
import { ReactComponent as StarsIcon } from '../../assets/icons/stars.svg';
import { ReactComponent as SwitchIcon } from '../../assets/icons/switch.svg';

const Flashcard = ({ flashcard, provided }) => {
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
    setRows(newRows);
  };

  useEffect(() => {
    handleRows(termRef, term, setTermRows);
  }, [term]);

  useEffect(() => {
    handleRows(definitionRef, definition, setDefinitionRows);
  }, [definition]);

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
          <IconButton icon={<StarsIcon />} size="13px" />
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
            <textarea
              ref={termRef}
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
            <textarea
              ref={definitionRef}
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
