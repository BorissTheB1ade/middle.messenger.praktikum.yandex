import Block from '../../services/Block';
import template from './error.hbs?raw';
import Link from '../../components/link';
import { linkEvents } from '../../services/Events';

export default class ErrorPage extends Block {
  constructor() {
    super('div', {
      attributes: { class: 'page' },
      errorCode: '404',
      errorMessage: 'Упс! Не туда попали...',
      link: new Link('div', {
        url: '/', text: 'Вход', events: linkEvents, attributes: { 'data-url': '/' },
      }),
    });
  }

  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
