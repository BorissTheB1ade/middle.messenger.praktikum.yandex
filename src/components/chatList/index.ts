import Block from '../../services/Block';
import template from './chatList.hbs?raw';

export default class ChatList extends Block {
  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
