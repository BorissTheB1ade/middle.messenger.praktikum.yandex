import template from './chatMenu.hbs?raw';
import Block from '../../services/Block';

interface ChatMenuProps {
  attributes?: Record<string, string>;
  isOpen?: boolean;
  onAddUser?: () => void;
  onRemoveUser?: () => void;
  onRemoveChat?: () => void;
}

export default class ChatMenu extends Block {
  constructor(tagName: string = 'div', props: ChatMenuProps = {}) {
    super(tagName, {
      ...props,
      attributes: {
        class: `chat-menu ${props.isOpen ? 'open' : 'hidden'}`,
        ...props.attributes
      },
      events: {
        click: (event: Event) => {
          event.stopPropagation();
          const target = event.target as HTMLElement;
          const menuItem = target.closest('.chat-menu-item');

          if (menuItem) {
            const action = menuItem.getAttribute('data-action');

            if (action === 'add-user' && this._props.onAddUser) {
              (this._props.onAddUser as () => void)();
            } else if (action === 'remove-user' && this._props.onRemoveUser) {
              (this._props.onRemoveUser as () => void)();
            } else if (action === 'delete-chat' && this._props.onRemoveChat) {
              (this._props.onRemoveChat as () => void)();
            }
          }
        }
      }
    });
  }

  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
