import template from './submitButton.hbs?raw';
import Block from '../../services/Block';

export default class SubmitButton extends Block {
  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
