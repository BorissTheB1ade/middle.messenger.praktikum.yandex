import template from './login.hbs?raw';
import Block from '../../services/Block';
import { formEvents, linkEvents } from '../../services/Events';
import Form from '../../components/form';
import FormItem from '../../components/formItem';
import Input from '../../components/input';
import SubmitButton from '../../components/button';
import Link from '../../components/link';

export default class LoginPage extends Block {
  constructor() {
    super('div', {
      attributes: { class: 'page' },
      loginFormTitle: 'Вход',
      form: new Form('form', {
        events: formEvents,
        attributes: { class: 'form', id: 'login_form' },
        formItems: [
          new FormItem('div', {
            attributes: { class: 'form-item' },
            label: 'Логин',
            input: new Input('div', {
              name: 'login', placeholder: 'Jazz123',
            }),
          }),
          new FormItem('div', {
            attributes: { class: 'form-item' },
            label: 'Пароль',
            input: new Input('div', {
              name: 'password', placeholder: '',
            }),
          }),
        ],
      }),
      submitButton: new SubmitButton('div', { text: 'Войти', form: 'login_form', class: 'submit-btn' }),
      link: new Link('div', {
        url: '/sign-up', text: 'Регистрация', events: linkEvents, attributes: { 'data-url': '/sign-up' },
      }),
    });
  }

  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
