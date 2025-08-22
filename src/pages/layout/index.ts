import Block from '../../services/Block';
import template from './layout.hbs?raw';

export default class Layout extends Block {
  render() {
    return this.compile(template, this._props);
  }
}
