import template from './messageArea.hbs?raw';
import Block from '../../services/Block';

export default class MessageArea extends Block {
  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
