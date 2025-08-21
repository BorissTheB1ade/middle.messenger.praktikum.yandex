import template from './message.hbs?raw';
import Block from '../../services/Block';

export default class Message extends Block {
  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
