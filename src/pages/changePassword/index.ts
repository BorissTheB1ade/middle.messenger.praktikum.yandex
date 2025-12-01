import template from './changePassword.hbs?raw';
import Block from '../../services/Block';
import store from '../../services/Store';
import AuthController from '../../utils/Controllers/AuthController';
import { formEvents, linkEvents } from '../../services/Events';
import Form from '../../components/form';
import FormItem from '../../components/formItem';
import Input from '../../components/input';
import SubmitButton from '../../components/button';
import Link from '../../components/link';

export default class ChangePasswordPage extends Block {
  constructor() {
    super('div', {
      attributes: { class: 'page' },
      changePasswordFormTitle: 'Смена пароля',
      form: new Form('form', {
        attributes: { class: 'form', id: 'change-password-form' },
        events: formEvents,
        formItems: [
          new FormItem('div', {
            attributes: { class: 'form-item' },
            label: 'Старый пароль',
            input: new Input('div', {
              name: 'oldPassword', placeholder: '',
            }),
          }),
          new FormItem('div', {
            attributes: { class: 'form-item' },
            label: 'Новый пароль',
            input: new Input('div', {
              name: 'newPassword', placeholder: '',
            }),
          }),
        ],
      }),
      submitButton: new SubmitButton('div', { text: 'Сохранить изменения', form: 'change-password-form', class: 'submit-btn' }),
      link: new Link('div', {
        url: '/', text: 'К профилю', events: linkEvents, attributes: { 'data-url': '/settings' },
      }),
    });
  }

  componentDidMount() {
    const currentUser = store.getState().user;
    if (!currentUser) {
      AuthController.getUser().catch(() => {
      });
    }
  }

  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
