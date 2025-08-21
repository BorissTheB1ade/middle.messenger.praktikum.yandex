import template from './chatHeader.hbs?raw';
import Block from '../../services/Block';

export default class ChatHeader extends Block {
  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
