import template from './searchChatInput.hbs?raw';
import Block from '../../services/Block';

export default class SearchChatInput extends Block {
  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
