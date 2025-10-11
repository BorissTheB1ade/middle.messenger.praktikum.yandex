import Block from 'services/Block';

export default function changePageContent(layout: Block, newContent: Block | null) {
  if (newContent) {
    layout.setProps({ ...layout._props, content: newContent });
  }
}
