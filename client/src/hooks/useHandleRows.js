import { useCallback } from 'react';

/**
 * Custom hook for calculating the number of rows required for a textarea based on its content.
 *
 * @param {React.RefObject<HTMLTextAreaElement>} textareaRef - Ref to the textarea element
 * @param {string} textContent - The content of the textarea
 * @param {number} maxRows - Maximum number of rows allowed
 * @param {React.SetStateAction<number>} setRowsCallback - React's useState setter to update the rows state
 * @return {function(): void} A memoized function that calculates the number of rows required for the textarea
 * and updates the rows state based on its content.
 */
const useHandleRows = (textareaRef, textContent, maxRows, setRowsCallback) => {
  return useCallback(() => {
    const textarea = textareaRef.current;

    // Create a hidden div that mimics the textarea's appearance
    const hiddenDiv = document.createElement('div');
    hiddenDiv.style.visibility = 'hidden';
    hiddenDiv.style.position = 'absolute';
    hiddenDiv.style.whiteSpace = 'pre-wrap';
    hiddenDiv.style.wordBreak = 'break-word';
    hiddenDiv.style.width = `${textarea.clientWidth}px`;
    hiddenDiv.style.fontSize = window.getComputedStyle(textarea).fontSize;
    hiddenDiv.style.fontFamily = window.getComputedStyle(textarea).fontFamily;

    // Measure a single line's height with a sample text
    hiddenDiv.textContent = 'test';
    document.body.appendChild(hiddenDiv);
    const lineHeight = hiddenDiv.clientHeight;

    // Measure the entire text content's height
    hiddenDiv.textContent = textContent + '\n';
    const hiddenDivHeight = hiddenDiv.clientHeight;

    // Remove the hiddenDiv from the DOM
    document.body.removeChild(hiddenDiv);

    // Set the textarea's rows attribute to the calculated row count
    const newRows = Math.ceil(hiddenDivHeight / lineHeight);
    setRowsCallback(Math.min(newRows, maxRows));
  }, [textareaRef, textContent, setRowsCallback]);
};

export default useHandleRows;
