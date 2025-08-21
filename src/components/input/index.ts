import template from './input.hbs?raw';
import Block from '../../services/Block';

export default class Input extends Block {
  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
