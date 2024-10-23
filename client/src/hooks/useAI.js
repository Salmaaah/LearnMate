import axios from 'axios';

/**
 * Custom hook for interacting with an AI API.
 *
 * @returns {{ askAI: Function }} - An object containing the askAI function.
 */
const useAI = () => {
  /**
   * Sends a request to the AI API based on the provided keyword and context.
   *
   * @async
   * @param {('Notes' | 'Flashcards')} context - The context for the AI request.
   * @param {string} keyword - The keyword indicating the type of request.
   * @param {number} id - The ID relevant to the context and keyword.
   * @returns {Promise<string>} - The response message from the AI API.
   */
  const askAI = async (context, keyword, id) => {
    try {
      const requestBody = { fileId: id };

      // Handle different keywords and prepare the request accordingly
      switch (keyword) {
        case 'summarize':
        case 'multigen':
          return await sendRequest(context, keyword, requestBody);

        case 'continue':
        case 'improve':
          const content = extractMarkdownContent();
          return await sendRequest(context, keyword, {
            ...requestBody,
            notes: content,
          });

        case 'predict':
          return await sendRequest(context, keyword, { flashcardId: id });

        default: // custom keyword handling
          return await sendRequest(context, 'custom', { prompt: keyword });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  /**
   * Sends a POST request to the AI API.
   *
   * @param {string} context - The context for the AI request.
   * @param {string} keyword - The keyword indicating the type of request.
   * @param {object} body - The request body to send.
   * @returns {Promise<string>} - The response message from the AI API.
   */
  const sendRequest = async (context, keyword, body) => {
    const response = await axios.post(`/askAI/${context}/${keyword}`, body);
    console.log(response.data.message);
    return response.data.message;
  };

  /**
   * Extracts and converts HTML content from the editor into Markdown format.
   * Note: The content is extracted from the DOM instead of the database because
   *       the notes are stored in an editorJS JSON format, which is more complex to parse
   *       than directly converting the HTML structure to Markdown.
   *
   * @returns {string} - The converted Markdown content.
   */
  const extractMarkdownContent = () => {
    const HTMLblocks = document.querySelectorAll('.ce-block');
    let content = '';

    HTMLblocks.forEach((block) => {
      const child = block.querySelector('.ce-block__content').children[0];
      const tag = child.tagName;
      const innerText = child.innerText;

      // Markdown formatting based on tag type
      let mdElement = '';

      switch (tag) {
        case 'H1':
          mdElement = '# ';
          break;
        case 'H2':
          mdElement = '## ';
          break;
        case 'H3':
          mdElement = '### ';
          break;
        case 'H4':
          mdElement = '#### ';
          break;
        case 'H5':
          mdElement = '##### ';
          break;
        case 'H6':
          mdElement = '###### ';
          break;
        case 'UL':
        case 'OL':
          mdElement = tag === 'UL' ? '- ' : '';
          Array.from(child.children).forEach((item, index) => {
            content += `${mdElement}${mdElement ? '' : `${index + 1}. `}${
              item.innerText
            }\n`;
          });
          return; // Skip adding innerText directly for lists
        default:
          mdElement = '';
      }

      content += mdElement + innerText + '\n';
    });

    return content;
  };

  return {
    askAI,
  };
};

export default useAI;
