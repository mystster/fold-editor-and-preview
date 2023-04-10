/// <reference types="codemirror/addon/fold/foldgutter" />
/// <reference types="mdast" />

import { Inkdrop, Editor } from "./types";
import CodeMirror from "codemirror";
import { Root, Content } from "mdast";
import { visit } from "unist-util-visit";

declare global {
  var inkdrop: Inkdrop;
}

declare module "codemirror" {
  export type FoldRangeFinder = (
    cm: CodeMirror.Editor,
    pos: CodeMirror.Position
  ) => CodeMirror.FoldRange | undefined;
  interface FoldGutterOptions {
    /*
     * The range-finder function to use when determining whether something can be folded.
     * When not given, CodeMirror.fold.auto will be used as default.
     */
    rangeFinder?: FoldRangeFinder | undefined;
  }
  interface FoldRange {
    from: Position;
    to: Position;
  }
}

type mdastNode = Root | Content;

const app = require("@electron/remote").app;

const modulePath = app.getAppPath() + "/node_modules/";
require(modulePath + "codemirror/addon/fold/foldcode.js");
require(modulePath + "codemirror/addon/fold/foldgutter.js");
const { markdownRenderer } = require("inkdrop");
const FOLD_START_KEYWORD =/!-- region\s*(.*) -->/;
const FOLD_END_KEYWORD =/!-- endregion -->/;

function foldRemark() {
  return (tree: mdastNode) => {
    visit(tree, (node, index, parent) => {
      if (node.type === "html" && parent != null) {
        if (node.value.match(FOLD_START_KEYWORD)) {
          let keywordCount = 1;
          for (
            //@ts-ignore
            let index = parent.children.indexOf(node) + 1;
            index < parent.children.length;
            index++
          ) {
            const element = parent.children[index];
            if (element.type === "html" && element.value.match(FOLD_START_KEYWORD)) {
              keywordCount++;
            } else if (
              element.type === "html" && element.value.match(FOLD_END_KEYWORD)) {
              keywordCount--;
            }
            if (keywordCount == 0 && element.type === "html") {
              element.value = "</details>";
              node.value = "<details><summary>" +
                //@ts-expect-error
                (node.value.match(FOLD_START_KEYWORD)[1].trim().length > 0 ? node.value.match(FOLD_START_KEYWORD)[1] : "detail") +
                "</summary>";
              break;
            }
          }
        }
      }
    });
  };
}

module.exports = {
  activate() {
    global.inkdrop.onEditorLoad(this.handleEditorInit.bind(this));
    if (markdownRenderer) {
      markdownRenderer.remarkPlugins.push(foldRemark);
    }
  },

  deactivate() {
    const editor = global.inkdrop.getActiveEditor();
    if (editor && editor.cm && this.originalGutters) {
      editor.cm.setOption("gutters", this.originalGutters);
    }
  },

  handleEditorInit(editor: Editor) {
    const cm = editor.cm;
    this.originalGutters = cm.getOption("gutters");
    cm.setOption(
      "gutters",
      this.originalGutters.concat(["CodeMirror-foldgutter"])
    );
    cm.setOption("foldGutter", {
      rangeFinder: (
        codemirror: CodeMirror.Editor,
        start: CodeMirror.Position
      ) => {
        if (codemirror.getLine(start.line).match(FOLD_START_KEYWORD)) {
          let keywordCount: number = 1;
          for (
            let lineNo = start.line + 1;
            lineNo < codemirror.lineCount();
            lineNo++
          ) {
            if (codemirror.getLine(lineNo).match(FOLD_END_KEYWORD)) {
              keywordCount--;
            } else if (codemirror.getLine(lineNo).match(FOLD_START_KEYWORD)) {
              keywordCount++;
            }
            if (keywordCount == 0) {
              return {
                from: CodeMirror.Pos(
                  start.line,
                  codemirror.getLine(start.line).length
                ),
                to: CodeMirror.Pos(lineNo, codemirror.getLine(lineNo).length),
              };
            }
          }
        }
        return undefined;
      },
    });
  },
};
