import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import useFlashcard from '../../hooks/useFlashcard';
import useHandleRows from '../../hooks/useHandleRows';
import AIsearch from '../Shared/AIsearch/AIsearch';
import IconButton from '../IconButton/IconButton';
import Popup from '../Popup/Popup';
import { ReactComponent as ImageIcon } from '../../assets/icons/image.svg';
import { ReactComponent as CrossIcon } from '../../assets/icons/delete_2.svg';
import { ReactComponent as DeleteIcon } from '../../assets/icons/delete_3.svg';
import { ReactComponent as DragIcon } from '../../assets/icons/drag_2.svg';
import { ReactComponent as StarsIcon } from '../../assets/icons/stars.svg';
import { ReactComponent as SwitchIcon } from '../../assets/icons/switch.svg';

/**
 * Displays a single flashcard in edit mode.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {{id: number, term: string, definition: string, imagePath: string, order: number}} props.flashcard - The flashcard data object.
 * @param {object} props.provided - React Beautiful DnD's provided object for drag-and-drop functionality.
 * @param {(action: string, item: string) => Promise<void>} props.handleButtonClick - Function to handle button click actions.
 * @returns {JSX.Element} - Rendered Flashcard component.
 */
const Flashcard = ({ flashcard, provided, handleButtonClick }) => {
  const termRef = useRef(null);
  const definitionRef = useRef(null);
  const [term, setTerm] = useState(flashcard.term);
  const [ariaTerm, setAriaTerm] = useState(
    flashcard.term.substring(0, 20) + (flashcard.term.length > 20 ? '...' : '')
  );
  const [definition, setDefinition] = useState(flashcard.definition);
  const [termRows, setTermRows] = useState(1);
  const [definitionRows, setDefinitionRows] = useState(1);
  const [termIsFocused, setTermIsFocused] = useState(false);
  const [definitionIsFocused, setDefinitionIsFocused] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [uploadIsHovered, setUploadIsHovered] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const {
    handleUpdateFlashcard,
    handleDeleteFlashcard,
    handleUploadFlashcardImage,
    handleDeleteFlashcardImage,
  } = useFlashcard();

  const maxRows = 4;
  const handleTermRows = useHandleRows(termRef, term, maxRows, setTermRows);
  const handleDefinitionRows = useHandleRows(
    definitionRef,
    definition,
    maxRows,
    setDefinitionRows
  );

  useEffect(() => {
    handleTermRows();
  }, [term, handleTermRows]);

  useEffect(() => {
    handleDefinitionRows();
  }, [definition, handleDefinitionRows]);

  // Effect to set focus to term on a newly created flashcard with a delay to account for the scrolling animation
  useEffect(() => {
    const handleFocus = (event) => {
      setTimeout(() => {
        flashcard.order === event.detail.flashcard && termRef.current.focus();
      }, 500);
    };

    document.addEventListener('flashcardFocus', handleFocus);

    return () => {
      document.removeEventListener('flashcardFocus', handleFocus);
    };
  }, [flashcard.order]);

  // Effect to ensure that the UI always reflects the changes implemented in the backend
  useEffect(() => {
    setTerm(flashcard.term);
    setAriaTerm(
      flashcard.term.substring(0, 20) +
        (flashcard.term.length > 20 ? '...' : '')
    );
    setDefinition(flashcard.definition);
  }, [flashcard]);

  return (
    <li
      className="flashcard"
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      aria-label={`Flashcard for '${ariaTerm}'`}
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
            ariaProps={{
              'aria-label': `Drag flashcard #${flashcard.order}`,
            }}
          />
          <IconButton
            icon={<StarsIcon />}
            size="13px"
            onClick={() =>
              handleButtonClick(
                'generate',
                term !== '' && definition === ''
                  ? `${flashcard.id}-definition`
                  : `${flashcard.id}-term`
              )
            }
            ariaProps={{
              'aria-label': 'Generate with AI',
            }}
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
            ariaProps={{
              'aria-label': 'Switch term and definition',
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
              'aria-label': `Delete flashcard #${flashcard.order}`,
              'aria-haspopup': 'dialog',
              'aria-controls': `delete-flashcard-popup-${flashcard.id}`,
              'aria-expanded': showPopup,
            }}
          />
          <Popup
            id={`delete-flashcard-popup-${flashcard.id}`}
            title="Delete flashcard?"
            content={
              <>
                The <strong>{ariaTerm}</strong> flashcard will be permanently
                deleted.
              </>
            }
            isOpen={showPopup}
            setIsOpen={setShowPopup}
            action="Delete"
            handleAction={() => handleDeleteFlashcard(flashcard.id)}
          />
        </div>
      </div>
      <div></div>
      <div className="flashcard__content">
        <div className="flashcard__leftContent">
          <div className="flashcard__entry">
            <AIsearch context="Flashcards" parentId={`${flashcard.id}-term`} />

            <textarea
              ref={termRef}
              id={`${flashcard.id}-term`}
              value={term}
              placeholder="Enter your term"
              onChange={(e) => setTerm(e.target.value)}
              onFocus={() => setTermIsFocused(true)}
              rows={termRows}
              onBlur={() => {
                setTermIsFocused(false);
                handleUpdateFlashcard(flashcard.id, { term: term });
              }}
              aria-label={`Term input for flashcard #${flashcard.order}`}
            />
            <div className={termIsFocused ? 'highlight' : ''}></div>
            <div>TERM</div>
          </div>
          <div className="flashcard__entry">
            <AIsearch
              context="Flashcards"
              parentId={`${flashcard.id}-definition`}
            />
            <textarea
              ref={definitionRef}
              id={`${flashcard.id}-definition`}
              value={definition}
              placeholder="Enter your definition"
              onChange={(e) => setDefinition(e.target.value)}
              onFocus={() => setDefinitionIsFocused(true)}
              rows={definitionRows}
              onBlur={() => {
                setDefinitionIsFocused(false);
                handleUpdateFlashcard(flashcard.id, { definition: definition });
              }}
              aria-label={`Definition input for flashcard #${flashcard.order}`}
            />
            <div className={definitionIsFocused ? 'highlight' : ''}></div>
            <div>DEFINITION</div>
          </div>
        </div>
        {flashcard.imagePath && !imageError ? (
          <div className="flashcard__image">
            <img
              src={`/getFlashcardImage/${
                flashcard.id
              }?v=${new Date().getTime()}`} // Force a fresh request rather than use the cached image.
              alt={`Visual aid for '${ariaTerm}' flashcard`}
              onError={() => {
                setImageError(true);
              }}
            />
            <IconButton
              icon={<CrossIcon />}
              size="7px"
              bColor="var(--M75)"
              onClick={() => handleDeleteFlashcardImage(flashcard.id)}
              ariaProps={{
                'aria-label': 'Delete image',
              }}
            />
          </div>
        ) : (
          <>
            <div
              className={`flashcard__imageUpload${
                uploadIsHovered ? ' hover' : ''
              }${imageError ? ' error' : ''}`}
            >
              <div>
                <ImageIcon />
                <div>{imageError ? 'Error' : 'Image'}</div>
              </div>
              <input
                aria-label={
                  !imageError
                    ? `Upload an image for the term '${ariaTerm}'`
                    : `Error uploading image for the term '${ariaTerm}', click to try again`
                }
                aria-invalid={!!imageError}
                accept="image/*"
                type="file"
                onChange={(e) => handleUploadFlashcardImage(e, flashcard.id)}
                onFocus={() => setUploadIsHovered(true)} // For accessibility
                onBlur={() => setUploadIsHovered(false)} // For accessibility
              />
              {imageError && (
                <span
                  role="alert"
                  aria-live="assertive"
                  style={{
                    position: 'absolute',
                    height: '0px',
                    visibility: 'hidden',
                  }}
                >
                  Error uploading image for the term '{ariaTerm}', click to try
                  again
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </li>
  );
};

Flashcard.propTypes = {
  flashcard: PropTypes.shape({
    id: PropTypes.number.isRequired,
    order: PropTypes.number.isRequired,
    term: PropTypes.string.isRequired,
    definition: PropTypes.string.isRequired,
    imagePath: PropTypes.string,
  }).isRequired,
  provided: PropTypes.object,
  handleButtonClick: PropTypes.func,
};

export default Flashcard;
