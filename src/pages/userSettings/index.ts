import template from './userSettings.hbs?raw';
import Block from '../../services/Block';
import store from '../../services/Store';
import { formEvents, linkEvents } from '../../services/Events';
import Form from '../../components/form';
import FormItem from '../../components/formItem';
import Input from '../../components/input';
import SubmitButton from '../../components/button';
import Link from '../../components/link';
import AvatarInput from '../../components/avatarInput';

interface User {
  id?: number;
  first_name?: string;
  second_name?: string;
  login?: string;
  display_name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export default class UserSettingsPage extends Block {
  private subscribe?: () => void;

  constructor() {
    super('div', {
      attributes: { class: 'page' },
      userSettingsFormTitle: 'Настройки пользователя',
      form: new Form('form', {
        attributes: { class: 'form', id: 'user-settings-form' },
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
            label: 'Отображаемое имя',
            input: new Input('div', {
              name: 'display_name', placeholder: 'Иван Иванов',
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
            label: 'Телефон',
            input: new Input('div', {
              name: 'phone', placeholder: '+79999999999',
            }),
          }),
        ],
      }),
      avatar: new AvatarInput('div', {
        attributes: { class: 'avatar-circle' },
        events: {
          change: {
            handler: (event: Event | null) => {
              if (!event) return;
              const target = event.target as HTMLInputElement;
              if (!target.files || target.files.length === 0) return;

              const file = target.files[0];
              if (file && file.type.match('image.*')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const preview = document.getElementById('avatar-preview') as HTMLImageElement;
                  if (preview && e.target?.result) {
                    preview.src = e.target.result as string;
                  }
                };
                reader.readAsDataURL(file);
              }
            },
          },
        },
      }),
      submitButton: new SubmitButton('div', {
        attributes: { class: 'user-settings_submit-btn-container' },
        text: 'Сохранить изменения',
        form: 'user-settings-form',
        class: 'submit-btn',
      }),
      link: new Link('div', {
        url: '/', text: 'К чатам', events: linkEvents, attributes: { 'data-url': '/' },
      }),
      link2: new Link('div', {
        url: '/', text: 'Сменить пароль', events: linkEvents, attributes: { 'data-url': '/changepswd' },
      }),
    });

    this.subscribe = store.on('changed', () => {
      const state = store.getState();
      if (state.user && window.location.pathname === '/settings') {
        setTimeout(() => UserSettingsPage.fillFormWithUserData(state.user), 0);
      }
    });
  }

  private static fillFormWithUserData(user: User | null) {
    if (!user) return;

    const form = document.getElementById('user-settings-form');

    if (form) {
      const fields = ['first_name', 'second_name', 'login', 'display_name', 'email', 'phone'] as const;

      fields.forEach((field) => {
        const input = form.querySelector(`[name="${field}"]`) as HTMLInputElement;

        if (input && user[field]) {
          input.value = user[field];
        }
      });

      const avatarPreview = document.getElementById('avatar-preview') as HTMLImageElement;
      if (avatarPreview && user.avatar) {
        avatarPreview.src = `https://ya-praktikum.tech/api/v2/resources${user.avatar}`;
      }
    }
  }

  componentDidMount() {
    const currentUser = store.getState().user;
    if (!currentUser) {
      window.location.href = '/';
      return;
    }
    setTimeout(() => UserSettingsPage.fillFormWithUserData(currentUser), 0);
  }

  render(): DocumentFragment {
    setTimeout(() => {
      const { user } = store.getState();
      if (user) {
        UserSettingsPage.fillFormWithUserData(user);
      }
    }, 0);

    return this.compile(template, this._props);
  }
}
