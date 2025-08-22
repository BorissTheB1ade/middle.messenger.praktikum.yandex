import template from './login.hbs?raw';
import Block from '../../services/Block';

export default class LoginPage extends Block {
  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
