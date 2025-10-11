import template from './messageInput.hbs?raw';
import Block from '../../services/Block';

export default class MessageInput extends Block {
  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
