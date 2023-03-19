
import * as CodeMirror from "codemirror";
export interface Inkdrop {
  window: any;
  commands: any;
  config: any;
  components: any;
  layouts: any;
  store: any;
  getActiveEditor(): Editor;
  onEditorLoad(callback: (e: Editor) => void): void;
}

export interface Editor {
  cm: CodeMirror.Editor;
  forceUpdate(): any;
}

export interface DispatchAction {
  type: string;
}
