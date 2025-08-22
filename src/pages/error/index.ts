import Block from '../../services/Block';
import template from './error.hbs?raw';

export default class ErrorPage extends Block {
  render() {
    return this.compile(template, this._props);
  }
}
