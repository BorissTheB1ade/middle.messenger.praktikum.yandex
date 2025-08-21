import template from './avatar.hbs?raw';
import Block from '../../services/Block';

export default class AvatarInput extends Block {
  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
