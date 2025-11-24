import template from './userDropdown.hbs?raw';
import Block from '../../services/Block';

interface User {
    id: number;
    login: string;
    first_name: string;
    second_name: string;
}

interface UserDropdownProps {
    attributes?: Record<string, string>;
    users: User[];
    onSelectUser: (user: User) => void;
    title: string;
}

export default class UserDropdown extends Block {
  constructor(props: UserDropdownProps) {
    const usersHTML = props.users.map((user) => `<div class="user-item" data-user-id="${user.id}">
                <span class="user-login">${user.login}</span>
            </div>`).join('');

    super('div', {
      title: props.title,
      usersHTML,
      hasUsers: props.users.length > 0,
      attributes: {
        class: 'user-dropdown',
        ...props.attributes,
      },
      events: {
        click: (event: Event) => {
          const target = event.target as HTMLElement;
          const userItem = target.closest('.user-item');
          if (userItem && userItem instanceof HTMLElement) {
            const userId = parseInt(userItem.dataset.userId!, 10);
            const user = props.users.find((u) => u.id === userId);
            if (user) {
              props.onSelectUser(user);
              this.getContent().remove();
            }
          }
        },
      },
    });
  }

  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
