// Demos showing how to import files from different languages
// (we will need this later, but for now, this is just a demo)
import { fsHello } from "./demos/fsdemo";
import { jsHello } from "./demos/jsdemo";
import { tsHello } from "./demos/tsdemo";
import * as monaco from 'monaco-editor';
import $ from 'jquery';
import {h} from 'maquette';
import {createProjector} from 'maquette';
import {VNode} from 'maquette';
import marked from 'marked';
// import * as styles from "./editor.css";


// fsHello();
// jsHello();
// tsHello();

// var el = $('#paper')[0];
const s = require('./editor.css');


// monaco.editor.create(el, {
//   value: "function hello() {\n\talert('Hello Tomas!');\n}",
//   language: 'javascript'
// });

// Import interfaces related to language plugins and editors
// (these are TypeScript interfaces defined in `languages.ts`)
import * as Langs from './languages'; /// a little change

// We define a new class for `MarkdownBlockKind` because we
// later need to cast `BlockKind` to `MarkdownBlockKind` so that
// we can access Markdown-specific properties from editor,
// type checker, etc. (using <MarkdownBlockKind>block)

class MarkdownBlockKind implements Langs.BlockKind {
  language : string;
  source : string;
  constructor(source:string) {
    this.language = "markdown";
    this.source = source;
  }
}

// For the editor and language plugin, we do not need a dedicated
// class, because we just need to create some implementation of 
// an interface - and TypeScript lets us do this using a simple 
// JavaScript record expression - to this is much simpler than a class.


const markdownEditor : Langs.Editor<SillyState> = {
  initialize: (blockcode:Langs.BlockKind) => {  
    return { Editing: false };
  },
  render: (id:number, blockcode:Langs.BlockKind) => {
    let renderEditorDiv = function() {
      return h('div', {id: "block_" + id.toString(),
                        class:"block"}, [
        h('div', { id: "editor_" + id.toString(),
        class:"editor" }, []),
      ] );
    }
    // cast code into BlockKind
    let markdownBlock = <MarkdownBlockKind>blockcode;
    let editing = true;
    let outputId = "output_"+id;
    let blockId = "block_"+id;
    let editorId = "editor_"+id;
  
    let paperElement = document.getElementById('paper');
      
    createProjector().append(paperElement,renderEditorDiv);
    createProjector().renderNow();
      
    // create editor element
    let editorEl = $('#'+editorId);
    editorEl[0].classList.add('editable');
  
    // create editor, append onto editor element
    let editor = monaco.editor.create(editorEl[0], {
      value: markdownBlock.source,
      language: 'markdown',
      scrollBeyondLastLine: false,
      theme:'vs',
    });

    let toggleVisible = function () {
      editing = !editing;
      if (editing===true)
        editorEl[0].classList.add("editable");
    }

    let renderOutput = function() {
      let mdText = editor.getValue() ? marked(editor.getValue()) : '';
      return h('div.output', {
        id:outputId, 
        innerHTML:mdText,
        onclick: toggleVisible,
        classes: {rendered: !editing}
      })
    }

    // append output onto block div
    let blockEl = $('#'+blockId);
    createProjector().append(blockEl[0], renderOutput);
    var myCondition1 = editor.createContextKey('myCondition1', true);
    
    // callback to update output when triggered
    let myBinding = editor.addCommand(monaco.KeyCode.Enter | monaco.KeyMod.Shift,function (e) {
      editing = false;
      editorEl[0].classList.remove("editable")
      var outputEl = $('#'+outputId)[0];
      markdownBlock.source = editor.getValue();
      createProjector().replace(outputEl, renderOutput);
      console.log("entered");
    },'myCondition1');
    // editor.onMouseDown(function (e) {
    //   var outputEl = $('#'+outputId)[0];
    //   markdownBlock.source = editor.getValue();
    //   createProjector().replace(outputEl, render);
    // });
  }
}

const markdownLanguagePlugin : Langs.LanguagePlugin = {
  language: "markdown",
  editor: markdownEditor,
  parse: (code:string) => {
    return new MarkdownBlockKind(code);
  }
}

type SillyState = {
  Editing : boolean;
}

// const sillyEditor : Langs.Editor<SillyState> = {
//   initialize: (blockcode:Langs.BlockKind) => {  
//     return { Editing: false };
//   },
//   append: (id:number) => {
//     let editorId = "editor_"+id;
//     let editorEl = $('#'+editorId);
//     // let editorEl = $('#paper');
//     console.log(editorEl);
//     console.log(editorId);
//   },
//   render: (id:number, state:SillyState) => {
//     function switchEditing() {
//       state.Editing = !state.Editing;
//       console.log("Switched to " + id + " " + state.Editing)
//     }
//     let renderEditorDiv = function() {
//       return h('div', {id: "block_" + id.toString()}, [
//         h('div', { id: "editor_" + id.toString() }, [ "EDITOR: Hello world!" ]),
//         h('button', { onclick: switchEditing }, ["Update"])
//       ] );
//     }
//     // if (state.Editing) {
//       let paperElement = document.getElementById('paper');
//       console.log(paperElement)
//       createProjector().append(paperElement,renderEditorDiv);
//       createProjector().renderNow();
//       let editorId = "editor_"+id;
//       let editorEl = $('#'+editorId);
//       let editor = monaco.editor.create(editorEl[0], {
//         value: "value",
//         language: 'markdown',
//         scrollBeyondLastLine: false,
//         theme:'vs',
//       });
//     // }
//     // else
//     //   return h('div', [
//     //     h('p', [ "Hello world!" ]),
//     //     h('button', { onclick: switchEditing }, ["Edit"])
//     //   ] );
//   },
  
// }

// const markdownLanguagePlugin : Langs.LanguagePlugin = {
//   language: "markdown",
//   editor: sillyEditor,
//   parse: (code:string) => {
//     return new MarkdownBlockKind(code);
//   }
// }

// Wrattler will have a number of language plugins for different
// languages (including R, Python, TheGamma and Markdown). Probably
// something like this, except that we might need a dictionary or
// a lookup table (so that we can find language plugin for a given
// language quickly):

// fill in language plugins dictionary here eg.
var languagePlugins : { [language: string]: Langs.LanguagePlugin; } = { };
languagePlugins["markdown"] = markdownLanguagePlugin;
// console.log(languagePlugins['markdown']);

// A sample document is just an array of records with cells. Each 
// cell has a language and source code (here, just Markdown):
let documents = 
  [ {"language": "markdown", 
     "source": "# Testing Markdown\n1. Edit this block \n2. Shift+Enter to convert to *Markdown*"}, 
    {"language": "markdown", 
     "source": "## More testing\nThis is _some more_ `markdown`!"},
    {"language": "markdown", 
     "source": "## And more testing\nThis is _not_ `markdown`!"}, ]

// Now, to render the document initially, we need to:
//
// 1. Iterate over the cells defined in `document`. For each cell, we
//    get the appropriate `LanguagePlugin` and call its `parse` function
//    to parse the source code. This gives us a list of `BlockKind` values
//    (with `language` set to the right language)

type CellState = {
  //Language
  Block : Langs.BlockKind
  State : any
}

type NotebookState = {
  Cells : CellState[]
}

let cellStates = documents.map(cell => {
  let plugin = languagePlugins[cell.language]; // TODO: Error handling
  let block = plugin.parse(cell.source);
  let state = plugin.editor.initialize(block);
  return { Block: block, State: state };
})

let state = { Cells: cellStates };

function render(state:NotebookState) {
  let index = 0
  let nodes = state.Cells.map(cellState => {
    let plugin = languagePlugins[cellState.Block.language]
    console.log(cellState)
    let vnode = plugin.editor.render(index, cellState.Block)
    // plugin.editor.append(index)
    index++;
    // plugin.editor.append(index);
    // return h('div', [
    //   h('h2', ["Blockkkk " + index.toString()]),
    //   vnode
    // ]);
  })  
  // return h('div', nodes);
}

function renderOutput() {
  return render(state);
}

let paperElement = document.getElementById('paper');
// let proj = createProjector();
// proj.replace(paperElement, renderOutput);
renderOutput();


/*
let index = 0;
for (let cell of documents) {
  var language = cell['language'];
  if (languagePlugins[language] == null)
    console.log("No language plugins for "+language);
  else 
  {
    // console.log("Language plugin for " + language + " is " + languagePlugins[language].language);
    // 
    let languagePlugin = languagePlugins[language];
    let block = languagePlugin.parse(cell['source']);
    languagePlugin.editor.create(index, block);
    index++;
  }
}
*/

// let index = 0;
// for (let cell of documents) {
//   var language = cell['language'];
//   if (languagePlugins[language] == null)
//     console.log("No language plugins for "+language);
//   else 
//   {
//     // console.log("Language plugin for " + language + " is " + languagePlugins[language].language);
//     let editorId = "editor_"+index;
//     $('#paper').append("<div id=\""+editorId+"\" style=\"height:100px;\"></div>")
//     let languagePlugin = languagePlugins[language];
//     let block = languagePlugin.parse(cell['source'])
//     languagePlugin.editor.create(editorId, block);
//     index++;
//   }
// }

// 2. We collect an array of `BlockKind` objects - these represent the
//    parsed cells that we can then render (and later, type check, etc.)
//
// 3. To render everything, we iterate over our collection of `BlockKind`
//    objects. For each, we look at its language, get the appropriate 
//    `LanguagePlugin` - this gives us an `editor` that we can then use to
//    render the block.
//
// Ideally, we should be able to use the infrastructure we have here to 
// parse the Markdown in the above `document` (using some good JavaScript 
// Markdown parser - I used one in the prototype but it was not very good),
// render the produced HTML and allow people to edit that using Monaco.
//
// The `create` function of the `Editor` interface now takes an ID
// (the idea is that in the main loop, we will create DIV element for
// each block and pass its ID to the editor so that it can do whatever
// it wants with it - either using VirtualDom, or directly).
//
// Right now, `create` takes the ID and the `BlockKind`. `BlockKind` is
// just an interface, so for Markdown, this will be some concrete Markdown
// implementation that will also store the parsed Markdown in some way.
// When `create` is called, it can assume that it gets Markdown-specific
// `BlockKind` and it can access the parsed document (after some type cast).
//
// Eventually, we will need to make `create` a bit more complex, so that
// the editor can notify the main code about changes in the source code, 
// but we can ignore that for now.

