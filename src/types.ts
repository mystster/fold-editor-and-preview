
import * as CodeMirror from "codemirror";
export interface Inkdrop {
  commands: any;

  getActiveEditor(): Editor;
  onEditorLoad(callback: (e: Editor) => void): void;
}

export interface Editor {
  cm: CodeMirror.Editor;
  forceUpdate(): any;
}

