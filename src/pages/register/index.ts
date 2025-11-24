import template from './register.hbs?raw';
import Block from '../../services/Block';
import { formEvents, linkEvents } from '../../services/Events';
import Form from '../../components/form';
import FormItem from '../../components/formItem';
import Input from '../../components/input';
import SubmitButton from '../../components/button';
import Link from '../../components/link';

export default class RegisterPage extends Block {
  constructor() {
    super('div', {
      attributes: { class: 'page' },
      registerFormTitle: 'Регистрация',
      form: new Form('form', {
        attributes: { class: 'form', id: 'register_form' },
        events: formEvents,
        formItems: [
          new FormItem('div', {
            attributes: { class: 'form-item' },
            label: 'Имя',
            input: new Input('div', {
              name: 'first_name', placeholder: 'Иван',
            }),
          }),
          new FormItem('div', {
            attributes: { class: 'form-item' },
            label: 'Фамилия',
            input: new Input('div', {
              name: 'second_name', placeholder: 'Иванов',
            }),
          }),
          new FormItem('div', {
            attributes: { class: 'form-item' },
            label: 'Логин',
            input: new Input('div', {
              name: 'login', placeholder: 'Jazz123',
            }),
          }),
          new FormItem('div', {
            attributes: { class: 'form-item' },
            label: 'E-mail',
            input: new Input('div', {
              name: 'email', placeholder: 'email@example.ru',
            }),
          }),
          new FormItem('div', {
            attributes: { class: 'form-item' },
            label: 'Пароль',
            input: new Input('div', {
              name: 'password', placeholder: '',
            }),
          }),
          new FormItem('div', {
            attributes: { class: 'form-item' },
            label: 'Телефон',
            input: new Input('div', {
              name: 'phone', placeholder: '+79999999999',
            }),
          }),
        ],
      }),
      submitButton: new SubmitButton('div', { form: 'register_form', text: 'Зарегистрироваться', class: 'submit-btn' }),
      link: new Link('div', {
        url: '/', text: 'Вход', events: linkEvents, attributes: { 'data-url': '/' },
      }),
    });
  }

  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
