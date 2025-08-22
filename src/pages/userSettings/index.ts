import template from './userSettings.hbs?raw';
import Block from '../../services/Block';

export default class UserSettingsPage extends Block {
  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
