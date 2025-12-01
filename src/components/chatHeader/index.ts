import template from './chatHeader.hbs?raw';
import Block from '../../services/Block';
import ChatMenu from '../chatMenu';

interface ChatHeaderProps {
  attributes?: Record<string, string>;
  displayName: string;
  lastOnline: string;
  iconName: string;
  onAddUser?: () => void;
  onRemoveUser?: () => void;
  onRemoveChat?: () => void;
}

export default class ChatHeader extends Block {
  constructor(props: ChatHeaderProps, tagName: string = 'div') {
    const chatMenu = new ChatMenu('div', {
      attributes: { class: 'chat-menu hidden' },
      onAddUser: props.onAddUser,
      onRemoveUser: props.onRemoveUser,
      onRemoveChat: props.onRemoveChat,
    });

    super(tagName, {
      ...props,
      chatMenu,
      events: {
        click: (event: Event) => {
          const target = event.target as HTMLElement;
          const settingsIcon = target.closest('.chat-header-settings')
            || target.closest('img[alt="chat_settings"]');

          if (settingsIcon) {
            event.stopPropagation();
            const isCurrentlyOpen = !chatMenu.getContent().classList.contains('hidden');
            chatMenu.setProps({
              attributes: { class: `chat-menu ${isCurrentlyOpen ? 'hidden' : 'open'}` },
            });
          }
          if (!target.closest('.chat-menu') && !target.closest('.chat-header-settings')) {
            chatMenu.setProps({
              attributes: { class: 'chat-menu hidden' },
            });
          }
        },
      },
    });
  }

  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
