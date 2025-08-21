import template from './register.hbs?raw';
import Block from '../../services/Block';

export default class RegisterPage extends Block {
  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
