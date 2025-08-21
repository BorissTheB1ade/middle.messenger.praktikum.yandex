import template from './chat.hbs?raw';
import Block from '../../services/Block';

export default class ChatPage extends Block {
  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
