import template from './link.hbs?raw';
import Block from '../../services/Block';

export default class Link extends Block {
  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
