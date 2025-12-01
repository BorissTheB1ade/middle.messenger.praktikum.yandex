import template from './simpleButton.hbs?raw';
import Block from '../../services/Block';

export default class Button extends Block {
  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
