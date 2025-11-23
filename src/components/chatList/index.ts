import template from './chatList.hbs?raw';
import Block from '../../services/Block';

interface ChatListProps {
  attributes?: Record<string, string>;
  chatListItems?: Block[];
  createChatButton?: Block;
  [key: string]: unknown;
}

export default class ChatList extends Block {
  constructor(tagName: string = 'div', props: ChatListProps = {}) {
    super(tagName, props);
  }

  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
