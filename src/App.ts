import { EventHandler, EventHandlerWithOptions } from './types/common';
import MessageArea from './components/messageArea';
import AvatarInput from './components/avatarInput';
import SubmitButton from './components/button';
import ChatHeader from './components/chatHeader';
import ChatList from './components/chatList';
import ChatListItem from './components/chatListItem';
import Form from './components/form';
import FormItem from './components/formItem';
import Input from './components/input';
import Link from './components/link';
import Nav from './components/nav';
import SearchChatInput from './components/searchChatInput';
import ChangePasswordPage from './pages/changePassword';
import ChatPage from './pages/chat';
import ErrorPage from './pages/error';
import Layout from './pages/layout';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import UserSettingsPage from './pages/userSettings';
import Block from './services/Block';
import changePageContent from './utils/changePageContent';
import renderDOM from './utils/render';
import Message from './components/message';
import MessageInput from './components/messageInput';
import validateFormFields from './utils/validateFormFields';

export default class App {
  choosePage(url: EventTarget | null): Block | null {
    switch (String(url).split('/')[3]) {
      case 'loginPage':
        return this.loginPage;
      case 'registerPage':
        return this.registerPage;
      case 'changePasswordPage':
        return this.changePasswordPage;
      case 'errorClientPage':
        return this.errorClientPage;
      case 'errorServerPage':
        return this.errorServerPage;
      case 'userSettingsPage':
        return this.userSettingsPage;
      case 'chatPage':
        return this.chatPage;
      default:
        return null;
    }
  }

  private formEvents: Record<string, EventHandler | EventHandlerWithOptions> = {
    blur: {
      handler: (event: Event) => { validateFormFields(event.target); },
      extraEventProps: { capture: true },
    },
    submit: {
      handler: (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        validateFormFields(event.target);
      },
    },
  };

  private linkEvents: unknown = {
    click: {
      handler: (event: Event): void => {
        event.preventDefault();
        event.stopPropagation();
        changePageContent(this.layout, this.choosePage(event.target));
      },
    },
  };

  nav = new Nav('nav', {
    attributes: {
      class: 'header-link_container',
    },
    links: [
      new Link('li', { url: '/loginPage', text: 'Вход', events: this.linkEvents }),
      new Link('li', { url: '/registerPage', text: 'Регистрация', events: this.linkEvents }),
      new Link('li', { url: '/changePasswordPage', text: 'Смена пароля', events: this.linkEvents }),
      new Link('li', { url: '/errorClientPage', text: 'Ошибка клиента', events: this.linkEvents }),
      new Link('li', { url: '/errorServerPage', text: 'Ошибка сервера', events: this.linkEvents }),
      new Link('li', { url: '/userSettingsPage', text: 'Настройки пользователя', events: this.linkEvents }),
      new Link('li', { url: '/chatPage', text: 'Чат', events: this.linkEvents }),
    ],
  });

  errorClientPage = new ErrorPage('main', {
    attributes: { class: 'page' },
    errorCode: '404',
    errorMessage: 'Упс! Не туда попали...',
    link: new Link('div', { url: '/loginPage', text: 'Вход', events: this.linkEvents }),
  });

  errorServerPage = new ErrorPage('main', {
    attributes: { class: 'page' },
    errorCode: '500',
    errorMessage: 'Уже исправляем...',
    link: new Link('div', { url: '/loginPage', text: 'Вход', events: this.linkEvents }),
  });

  chatPage = new ChatPage('main', {
    attributes: { class: 'page' },
    goToProfileText: 'Профиль',
    chatSearch: new SearchChatInput('div', {
      attributes: { class: 'search-chat-input-wrapper' },
    }),
    chatList: new ChatList('div', {
      attributes: { class: 'chat-list' },
      chatListItems: [
        new ChatListItem('div', {
          attributes: { class: 'chat-list-item' },
          displayName: 'Иван Иванов',
          lastMessageText: 'Пример длинного сообщения, которое не влезет в строку',
          iconName: 'blue_circle.svg',
        }),
        new ChatListItem('div', {
          attributes: { class: 'chat-list-item' },
          displayName: 'Петр Петров',
          lastMessageText: 'Короткое сообщение',
          iconName: 'red_circle.svg',
        }),
      ],
    }),
    chatHeader: new ChatHeader('div', {
      attributes: { class: 'chat-header-wrapper' },
      displayName: 'Иван Иванов',
      lastOnline: 'Online recently',
      iconName: 'blue_circle.svg',
    }),
    messageArea: new MessageArea('div', {
      attributes: { class: 'message-area' },
      messageList: [
        new Message('div', {
          attributes: { class: 'message-string-incoming' },
          messageText: 'Какое-то тестовое сообщение... Hello world!...YAAHOOOOOOOOO! Мне нужен очень длинный текст, чтобы проверить, как делается перенос внутри сообщения ',
          messageType: 'incoming',
        }),
        new Message('div', {
          attributes: { class: 'message-string-outgoing' },
          messageText: 'Пример длинного сообщения, которое не влезет в строку',
          messageType: 'outgoing',
        }),
      ],
    }),
    messageInput: new MessageInput('form', {
      events: this.formEvents,
      submitButton: new SubmitButton('div', {
        class: 'message-submit-btn',
        text: '<img src="icons/send_message.svg" alt="send_message_icon"/>',
        form: 'message-send-form',
      }),
      attributes: { class: 'message-input-wrapper', id: 'message-send-form' },
    }),

  });

  userSettingsPage = new UserSettingsPage('main', {
    attributes: { class: 'page' },
    userSettingsFormTitle: 'Настройки пользователя',
    form: new Form('form', {
      attributes: { class: 'form', id: 'user-settings-form' },
      events: this.formEvents,
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
  });

  changePasswordPage = new ChangePasswordPage('main', {
    attributes: { class: 'page' },
    changePasswordFormTitle: 'Смена пароля',
    form: new Form('form', {
      attributes: { class: 'form', id: 'change-password-form' },
      events: this.formEvents,
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
  });

  registerPage = new RegisterPage('main', {
    attributes: { class: 'page' },
    registerFormTitle: 'Регистрация',
    form: new Form('form', {
      attributes: { class: 'form', id: 'register_form' },
      events: this.formEvents,
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
    link: new Link('div', { url: '/loginPage', text: 'Вход', events: this.linkEvents }),
  });

  loginPage = new LoginPage('main', {
    attributes: { class: 'page' },
    loginFormTitle: 'Вход',
    form: new Form('form', {
      events: this.formEvents,
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
    link: new Link('div', { url: '/registerPage', text: 'Регистрация', events: this.linkEvents }),
  });

  layout = new Layout('div', {
    nav: this.nav,
    content: this.loginPage,
  });

  render() {
    renderDOM('#app', this.layout);
  }
}
