import template from './nav.hbs?raw';
import Block from '../../services/Block';

export default class Nav extends Block {
  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
