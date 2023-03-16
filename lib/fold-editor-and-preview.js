'use babel';

import FoldEditorAndPreviewMessageDialog from './fold-editor-and-preview-message-dialog';

module.exports = {

  activate() {
    inkdrop.components.registerClass(FoldEditorAndPreviewMessageDialog);
    inkdrop.layouts.addComponentToLayout(
      'modal',
      'FoldEditorAndPreviewMessageDialog'
    )
  },

  deactivate() {
    inkdrop.layouts.removeComponentFromLayout(
      'modal',
      'FoldEditorAndPreviewMessageDialog'
    )
    inkdrop.components.deleteClass(FoldEditorAndPreviewMessageDialog);
  }

};
