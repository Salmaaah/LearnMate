import { createContext, useContext, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Paragraph from '@editorjs/paragraph';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Checklist from '@editorjs/checklist';
import Alert from 'editorjs-alert';
import ToggleBlock from 'editorjs-toggle-block';
import AIText from '@alkhipce/editorjs-aitext';
import Table from '@editorjs/table';
import CodeBox from '@bomdi/codebox';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';
import Underline from '@editorjs/underline';
import TextSpoiler from 'editorjs-inline-spoiler-tool';
import ChangeCase from 'editorjs-change-case';
import Strikethrough from '@sotaproject/strikethrough';
import ColorPlugin from 'editorjs-text-color-plugin';
import ImageTool from '@editorjs/image';
import LinkTool from '@editorjs/link';
import Embed from '@editorjs/embed';
// import AttachesTool from '@editorjs/attaches';
import DragDrop from 'editorjs-drag-drop';
import Undo from 'editorjs-undo';
import AlignmentTuneTool from 'editorjs-text-alignment-blocktune';
import IndentTune from 'editorjs-indent-tune';
import { debounce } from 'lodash';

const EditorContext = createContext();

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within a EditorProvider');
  }
  return context;
};

export const EditorProvider = ({ children }) => {
  const [blockInfo, setBlockInfo] = useState({
    block: null,
    editableBlock: null,
    isEmpty: false,
  });
  const editorInstanceRef = useRef(null);
  const [paddingBottom, setPaddingBottom] = useState(300);
  const [numBlocks, setNumBlocks] = useState(1);

  const initEditor = (updateNote, note, autofocus = false) => {
    const debouncedUpdateNote = debounce(
      (id, element, value) => updateNote(id, { [element]: value }),
      200
    );

    const editor = new EditorJS({
      holder: 'editorjs',
      // TODO: the longer the placeholder the bigger the heigth of each new block gets, even when the block is empty
      // find a solution so that this no longer happens
      // placeholder:
      //   "Start writing, or press 'space' for AI, '/' for commands...",
      placeholder: 'Start writing...',
      tunes: ['alignmentTune', 'indentTune'],
      tools: {
        alignmentTune: {
          class: AlignmentTuneTool,
          config: {
            default: 'left',
            // blocks: {
            //   header: 'center',
            // },
          },
        },
        indentTune: {
          class: IndentTune,
          // shortcut: 'tab',
        },
        aiText: {
          class: AIText,
          config: {
            openaiKey: 'YOUR_OPEN_AI_KEY', // TODO: insery api key
          },
        },
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
        },
        header: {
          class: Header,
          shortcut: 'CMD+SHIFT+H',
          config: {
            placeholder: 'Header',
            levels: [1, 2, 3, 4],
            defaultLevel: 2,
          },
        },
        alert: {
          class: Alert,
          inlineToolbar: true,
          shortcut: 'CMD+SHIFT+A',
          config: {
            defaultType: 'primary',
            messagePlaceholder: 'Enter something',
          },
        },
        codeBox: {
          class: CodeBox,
          config: {
            // themeURL:
            //   'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.18.1/build/styles/tokyo-night-dark.css', // Optional
            themeName: 'atom-one-dark', // Optional
            // useDefaultTheme: 'light', // Optional. This also determines the background color of the language select drop-down
          },
        },
        list: {
          // TODO: Find an alternative nested list that's not buggy
          class: List,
          inlineToolbar: true,
          config: {
            defaultStyle: 'unordered',
          },
        },
        checklist: {
          class: Checklist,
          inlineToolbar: true,
        },
        toggle: {
          class: ToggleBlock,
          inlineToolbar: true,
        },
        table: {
          class: Table,
          inlineToolbar: true,
          config: {
            rows: 2,
            cols: 3,
          },
        },
        image: {
          class: ImageTool,
          config: {
            endpoints: {
              byFile: 'http://localhost:8008/uploadFile', // TODO: create backend file uploader endpoint
              byUrl: 'http://localhost:8008/fetchUrl', // TODO: create endpoint that provides uploading by Url
            },
          },
        },
        linkTool: {
          class: LinkTool,
          config: {
            endpoint: 'http://localhost:8008/fetchUrl', // TODO: create backend endpoint for url data fetching
          },
        },
        embed: {
          class: Embed,
          inlineToolbar: true,
        },
        underline: {
          class: Underline,
          shortcut: 'CMD+SHIFT+U',
        },
        strikethrough: {
          class: Strikethrough,
          shortcut: 'CMD+SHIFT+S',
        },
        Marker: {
          class: Marker,
          shortcut: 'CMD+SHIFT+M',
        },
        changeCase: {
          class: ChangeCase,
          config: {
            showLocaleOption: false, // enable locale case options
            locale: 'tr', // or ['tr', 'TR', 'tr-TR']
          },
        },
        Color: {
          class: ColorPlugin,
          config: {
            colorCollections: [
              '#EC7878',
              '#9C27B0',
              '#673AB7',
              '#3F51B5',
              '#0070FF',
              '#03A9F4',
              '#00BCD4',
              '#4CAF50',
              '#8BC34A',
              '#CDDC39',
              '#FFF',
            ],
            defaultColor: '#FF1300',
            type: 'text',
            customPicker: true, // TODO: Fix custom picker not showing up
          },
        },
        // Marker: {
        //   class: ColorPlugin,
        //   config: {
        //     defaultColor: '#FFBF00',
        //     type: 'marker',
        //     icon: `<svg fill="#000000" height="200px" width="200px" version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M17.6,6L6.9,16.7c-0.2,0.2-0.3,0.4-0.3,0.6L6,23.9c0,0.3,0.1,0.6,0.3,0.8C6.5,24.9,6.7,25,7,25c0,0,0.1,0,0.1,0l6.6-0.6 c0.2,0,0.5-0.1,0.6-0.3L25,13.4L17.6,6z"></path> <path d="M26.4,12l1.4-1.4c1.2-1.2,1.1-3.1-0.1-4.3l-3-3c-0.6-0.6-1.3-0.9-2.2-0.9c-0.8,0-1.6,0.3-2.2,0.9L19,4.6L26.4,12z"></path> </g> <g> <path d="M28,29H4c-0.6,0-1-0.4-1-1s0.4-1,1-1h24c0.6,0,1,0.4,1,1S28.6,29,28,29z"></path> </g> </g></svg>`,
        //   },
        // },
        inlineCode: {
          class: InlineCode,
          shortcut: 'CMD+SHIFT+C',
        },
        TextSpoiler: TextSpoiler,
      },

      onReady: async () => {
        new DragDrop(editor);
        new Undo({ editor });

        // Dispatch editorFocus event when autofocus is set to true to trigger the focus event listener in AIsearch
        if (autofocus) {
          const focusEvent = new CustomEvent('editorFocus', {
            detail: { message: 'First block focused' },
          });
          document.dispatchEvent(focusEvent);
        }

        // Detect when a block is added or removed from the editor element and update the padding accordingly
        // TODO: add support for when the block height changes
        const editorElement = document.querySelector('.codex-editor__redactor');

        const handleMutation = (mutationsList) => {
          for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
              const currentNumBlocks =
                editorElement.querySelectorAll('.ce-block').length;

              // Use callback form of setNumBlocks to ensure we're working with the latest state
              setNumBlocks((prevNumBlocks) => {
                if (currentNumBlocks > prevNumBlocks) {
                  // Handle the addition of new ce-blocks
                  setPaddingBottom((prevPaddingBottom) => {
                    const newPaddingBottom = Math.max(
                      prevPaddingBottom - 38.3906,
                      0
                    );
                    editorElement.style.paddingBottom = `${newPaddingBottom}px`;
                    return newPaddingBottom;
                  });
                } else if (
                  currentNumBlocks < prevNumBlocks &&
                  currentNumBlocks <= 9
                ) {
                  // Handle the removal of ce-blocks
                  setPaddingBottom((prevPaddingBottom) => {
                    const newPaddingBottom = Math.max(
                      prevPaddingBottom + 38.3906,
                      0
                    );
                    editorElement.style.paddingBottom = `${newPaddingBottom}px`;
                    return newPaddingBottom;
                  });
                }

                // Update the numBlocks state
                return currentNumBlocks;
              });
            }
          }
        };

        if (editorElement) {
          const observer = new MutationObserver(handleMutation);
          observer.observe(editorElement, { childList: true, subtree: true });

          // Initial count of ce-blocks
          setNumBlocks(editorElement.querySelectorAll('.ce-block').length);

          return () => {
            observer.disconnect();
          };
        }
      },

      onChange: async (api, event) => {
        // Update blockInfo state on change
        if (event.type === 'block-changed' || event.type === 'block-added') {
          const index = api.blocks.getCurrentBlockIndex();
          const currentBlock = document.querySelectorAll('.ce-block')[index];
          // We've chosen index block retrieval over any event related retrieval (event.detail.target.holder/event.detail.target.id)
          // because of the weird way EditoJS adds new blocks from empty blocks

          setBlockInfo((prevInfo) => ({
            ...prevInfo,
            block: currentBlock,
            editableBlock: currentBlock.querySelector(
              '[contenteditable="true"]'
            ),
            isEmpty: event.detail.target.isEmpty,
          }));
        } else {
          // TODO: figure out how to get info on block on top in case of block remove to update blockInfo and be able to correctly predict AIsearch position
          console.log('untreated event', event.type);
        }

        // Save content updates to note
        const updatedData = await editor.save();
        debouncedUpdateNote(note.id, 'content', updatedData);
      },

      data: note.content,
      autofocus: autofocus,

      // (event) => {
      //   const redactor = event.ui.nodes.redactor;
      //   const currentNumBlocks = redactor.childElementCount;
      //   console.log(currentNumBlocks);

      //   // // Use callback form of setNumBlocks to ensure we're working with the latest state
      //   // setNumBlocks((prevNumBlocks) => {
      //   //   console.log(prevNumBlocks, currentNumBlocks);
      //   //   if (currentNumBlocks > prevNumBlocks) {
      //   //     // Handle the addition of new ce-blocks
      //   //     setPaddingBottom((prevPaddingBottom) => {
      //   //       const newPaddingBottom = Math.max(prevPaddingBottom - 38.3906, 0);
      //   //       redactor.style.paddingBottom = `${newPaddingBottom}px`;
      //   //       return newPaddingBottom;
      //   //     });
      //   //   } else if (
      //   //     currentNumBlocks < prevNumBlocks &&
      //   //     currentNumBlocks <= 9
      //   //   ) {
      //   //     // Handle the removal of ce-blocks
      //   //     setPaddingBottom((prevPaddingBottom) => {
      //   //       const newPaddingBottom = Math.max(prevPaddingBottom + 38.3906, 0);
      //   //       redactor.style.paddingBottom = `${newPaddingBottom}px`;
      //   //       return newPaddingBottom;
      //   //     });
      //   //   }

      //   //   // Update the numBlocks state
      //   //   return currentNumBlocks;
      //   // });
      // },
    });

    editorInstanceRef.current = editor;
  };

  return (
    <EditorContext.Provider
      value={{ initEditor, editorInstanceRef, blockInfo, setBlockInfo }}
    >
      {children}
    </EditorContext.Provider>
  );
};
