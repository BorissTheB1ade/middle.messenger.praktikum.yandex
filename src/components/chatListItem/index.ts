import template from './chatListItem.hbs?raw';
import Block from '../../services/Block';

export default class ChatListItem extends Block {
  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
