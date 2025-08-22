import template from './changePassword.hbs?raw';
import Block from '../../services/Block';

export default class ChangePasswordPage extends Block {
  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
