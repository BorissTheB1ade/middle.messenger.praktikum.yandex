import Block from '../../services/Block';
import template from './form.hbs?raw';

export default class Form extends Block {
  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
