import template from './userSearch.hbs?raw';
import Block from '../../services/Block';
import { chatController } from '../../utils/Controllers/ChatController';

interface UserSearchProps {
    attributes?: Record<string, string>;
    chatId: number;
    mode: 'add' | 'remove';
    onClose: () => void;
}

export default class UserSearch extends Block {
  private props: UserSearchProps;

  constructor(tagName: string = 'div', props: UserSearchProps) {
    super(tagName, {
      ...props,
      attributes: {
        class: 'search-user-modal',
        ...props.attributes
      },
      events: {
        click: (event: Event) => {
          const target = event.target as HTMLElement;
          if (target.classList.contains('modal-overlay') || target.classList.contains('close-btn')) {
            props.onClose();
          }
        },
        submit: (event: Event) => {
          event.preventDefault();
          const target = event.target as HTMLFormElement;
          const loginInput = target.querySelector('input[name="login"]') as HTMLInputElement;
          
          if (loginInput && loginInput.value.trim()) {
            this.searchUser(loginInput.value.trim());
          }
        }
      }
    });

    this.props = props;
  }

  private async searchUser(login: string) {
  try {
    const user = await chatController.searchUserByLogin(login);
    await chatController.addUserToChat(this.props.chatId, user.id);
    alert('Пользователь добавлен в чат');
    this.props.onClose();
  } catch (error) {
    alert(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  }
}

  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
