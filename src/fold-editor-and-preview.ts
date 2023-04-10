/// <reference types="codemirror/addon/fold/foldgutter" />

import { Inkdrop, Editor } from "./types";
import CodeMirror from "codemirror";
//@ts-ignore
import { zone } from "mdast-zone";

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

const app = require("@electron/remote").app;

const modulePath = app.getAppPath() + "/node_modules/";
require(modulePath + "codemirror/addon/fold/foldcode.js");
require(modulePath + "codemirror/addon/fold/foldgutter.js");
const { markdownRenderer } = require("inkdrop");
const FOLD_START_KEYWORD = /^<!-- region\s(.*) -->/;
const FOLD_END_KEYWORD = /<!-- endregion -->/;

function foldRemarkPlugin() {
  return (tree: any) =>
    zone(
      tree,
      FOLD_START_KEYWORD,
      FOLD_END_KEYWORD,
      (start: any, nodes: Array<any>, end: any) => {
        let startMsg = "detail";
        const startMatch = start.value.match(FOLD_START_KEYWORD);
        if (startMatch) {
          startMsg = startMatch[1];
        }
        return [
          {
            type: "html",
            value: "<details><summary>" + startMsg + "</summary>",
          },
          ...nodes,
          { type: "html", value: "</details>" },
        ];
      }
    );
}

module.exports = {
  activate() {
    global.inkdrop.onEditorLoad(this.handleEditorInit.bind(this));
    if (markdownRenderer) {
      markdownRenderer.remarkPlugins.push(foldRemarkPlugin);
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
    console.dir(this.originalGutters);
    cm.setOption(
      "gutters",
      this.originalGutters.concat(["CodeMirror-foldgutter"])
    );
    console.dir(cm.getOption("gutters"));
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
