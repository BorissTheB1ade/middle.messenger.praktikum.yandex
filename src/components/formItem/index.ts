import template from './formItem.hbs?raw';
import Block from '../../services/Block';

export default class FormItem extends Block {
  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
