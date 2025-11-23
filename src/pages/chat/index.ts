import template from './chat.hbs?raw';
import Block from '../../services/Block';
import store from '../../services/Store';
import ChatController from '../../utils/Controllers/ChatController';
import Link from '../../components/link';
import Button from '../../components/simpleButton';
import AuthController from '../../utils/Controllers/AuthController';
import ChatList from '../../components/chatList';
import ChatHeader from '../../components/chatHeader';
import MessageInput from '../../components/messageInput';
import MessageArea from '../../components/messageArea';
import SubmitButton from '../../components/button';
import ChatListItem from '../../components/chatListItem';
import Message from '../../components/message';
import { formEvents, linkEvents } from '../../services/Events';
import { webSocketService, WebSocketData } from '../../services/Websocket';
import { MessageType } from '../../types/chat';
import UserDropdown from '../../components/userDropdown';
import UserSearch from '../../components/userSearch';

export default class ChatPage extends Block {
  // @ts-expect-error
  private subscribe?: () => void;

  private messages: MessageType[] = [];

  constructor() {
    const createChatButton = new Button('div', {
      text: 'Создать чат',
      class: 'btn',
      events: {
        click: {
          handler: async () => {
            // eslint-disable-next-line no-alert
            const title = prompt('Введите название чата:');
            if (title) {
              await ChatController.createChat(title);
            }
          },
        },
      },
    });

    super('div', {
      attributes: { class: 'page' },
      goToProfileLink: new Link('div', {
        url: '/', text: 'Профиль', events: linkEvents, attributes: { 'data-url': '/settings' },
      }),
      logoutButton: new Button('div', {
        text: 'Выйти',
        class: 'btn',
        events: {
          click: {
            handler: () => {
              AuthController.logout().catch(() => {
                // Обработка ошибки выхода
              });
            },
          },
        },
      }),
      chatHeader: new ChatHeader({
        attributes: { class: 'chat-header-wrapper' },
        displayName: 'Выберите чат',
        lastOnline: '',
        iconName: 'red_circle.svg',
        onAddUser: () => {
          // eslint-disable-next-line no-alert
          alert('Сначала выберите чат');
        },
        onRemoveUser: () => {
          // eslint-disable-next-line no-alert
          alert('Сначала выберите чат');
        },
        onRemoveChat: () => {
          // eslint-disable-next-line no-alert
          alert('Сначала выберите чат');
        },
      }, 'div'),
      chatList: new ChatList('div', {
        attributes: { class: 'chat-list' },
        chatListItems: [],
        createChatButton,
      }),
      messageArea: new MessageArea('div', {
        attributes: { class: 'message-area' },
        messageList: [],
      }),
      messageInput: new MessageInput('form', {
        events: formEvents,
        submitButton: new SubmitButton('div', {
          class: 'message-submit-btn',
          text: '<img src="icons/send_message.svg" alt="send_message_icon"/>',
          form: 'message-send-form',
        }),
        attributes: { class: 'message-input-wrapper', id: 'message-send-form' },
      }),
    });

    this.subscribe = store.on('changed', () => {
      const state = store.getState();

      if (state.chats) {
        const chatListItems = state.chats.map((chat) => {
          const isSelected = state.currentChat?.id === chat.id;

          return new ChatListItem('div', {
            attributes: { class: `chat-list-item ${isSelected ? 'selected' : ''}` },
            displayName: chat.title,
            lastMessageText: chat.last_message?.content || 'Нет сообщений',
            iconName: chat.avatar || 'blue_circle.svg',
            unreadCount: chat.unread_count,
            events: {
              click: {
                handler: async () => {
                  await ChatController.selectChat(chat);
                },
              },
            },
          });
        });

        if (state.currentChat) {
          this.setProps({
            chatList: new ChatList('div', {
              attributes: { class: 'chat-list' },
              chatListItems,
              createChatButton,
            }),
            chatHeader: new ChatHeader({
              attributes: { class: 'chat-header-wrapper' },
              displayName: state.currentChat.title,
              lastOnline: 'Online',
              iconName: state.currentChat.avatar || 'blue_circle.svg',
              onAddUser: () => {
                if (state.currentChat) {
                  this.showAddUserModal(state.currentChat.id);
                }
              },
              onRemoveUser: () => {
                if (state.currentChat) {
                  this.showRemoveUserDropdown(state.currentChat.id).catch(() => {
                    // Обработка ошибки
                  });
                }
              },
              onRemoveChat: () => {
                if (state.currentChat) {
                  this.handleDeleteChat(state.currentChat.id).catch(() => {
                    // Обработка ошибки
                  });
                }
              },
            }, 'div'),
          });
        } else {
          this.setProps({
            chatList: new ChatList('div', {
              attributes: { class: 'chat-list' },
              chatListItems,
              createChatButton,
            }),
            chatHeader: new ChatHeader({
              attributes: { class: 'chat-header-wrapper' },
              displayName: 'Выберите чат',
              lastOnline: '',
              iconName: 'red_circle.svg',
              onAddUser: () => {
                // eslint-disable-next-line no-alert
                alert('Сначала выберите чат');
              },
              onRemoveUser: () => {
                // eslint-disable-next-line no-alert
                alert('Сначала выберите чат');
              },
              onRemoveChat: () => {
                // eslint-disable-next-line no-alert
                alert('Сначала выберите чат');
              },
            }, 'div'),
          });
        }
      }
    });

    webSocketService.onMessage((data: WebSocketData) => {
      this.handleWebSocketMessage(data);
    });
  }

  private loadChats() {
    this.messages = [];
    this.updateMessageArea();
    setTimeout(() => {
      ChatController.getChats().catch(() => {
        // Обработка ошибки загрузки чатов
      });
    }, 0);
  }

  public leave() {
    this.messages = [];
    this.updateMessageArea();
    this.hide();
  }

  private handleWebSocketMessage(data: WebSocketData) {
    if (Array.isArray(data)) {
      this.messages = data.reverse();
    } else if (typeof data === 'object' && data !== null && 'type' in data && data.type === 'message') {
      this.messages = [...this.messages, data as MessageType];
    }
    this.updateMessageArea();
  }

  private updateMessageArea() {
    const state = store.getState();
    const currentUser = state.user;
    const currentChatId = state.currentChat?.id;

    const messageItems = this.messages.map((message) => {
      const messageTime = new Date(message.time).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });

      let userName = 'Неизвестный';

      if (message.user_id === currentUser?.id) {
        userName = 'Вы';
      } else if (currentChatId) {
        const chatUsers = state.chatUsers?.[currentChatId] || [];
        const messageUser = chatUsers.find((user) => user.id === message.user_id);
        if (messageUser) {
          userName = messageUser.display_name
            || `${messageUser.first_name} ${messageUser.second_name}`.trim()
            || messageUser.login;
        }
      }

      return new Message('div', {
        attributes: {
          class: message.user_id === currentUser?.id
            ? 'message-string-outgoing'
            : 'message-string-incoming',
        },
        messageText: message.content,
        messageTime,
        userName,
        messageType: message.user_id === currentUser?.id ? 'outgoing' : 'incoming',
      });
    });

    this.setProps({
      messageArea: new MessageArea('div', {
        attributes: { class: 'message-area' },
        messageList: messageItems,
      }),
    });
  }

  // eslint-disable-next-line class-methods-use-this
  private showAddUserModal(chatId: number) {
    const modal = new UserSearch({
      chatId,
      mode: 'add',
      onClose: () => {
        modal.getContent().remove();
      },
    }, 'div');

    document.body.appendChild(modal.getContent());
  }

  // eslint-disable-next-line class-methods-use-this
  private async showRemoveUserDropdown(chatId: number) {
    try {
      const users = await ChatController.getChatUsers(chatId);
      const dropdown = new UserDropdown({
        users,
        title: 'Удалить пользователя',
        onSelectUser: (user) => {
          // eslint-disable-next-line no-alert, no-restricted-globals
          if (confirm(`Удалить пользователя ${user.login} из чата?`)) {
            ChatController.deleteUserFromChat(chatId, user.id).catch(() => {
              // Обработка ошибки удаления пользователя
            });
          }
        },
      });
      const overlay = document.createElement('div');
      overlay.className = 'dropdown-overlay';
      overlay.onclick = () => {
        overlay.remove();
        dropdown.getContent().remove();
      };

      document.body.appendChild(overlay);
      document.body.appendChild(dropdown.getContent());
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load chat users:', error);
    }
  }

  private async handleDeleteChat(chatId: number) {
    // eslint-disable-next-line no-alert, no-restricted-globals
    if (confirm('Вы уверены, что хотите удалить этот чат? Все сообщения будут потеряны.')) {
      try {
        await ChatController.deleteChat(chatId);
        store.setState({
          currentChat: null,
        });
        this.messages = [];
        this.updateMessageArea();
        await ChatController.getChats();
      } catch {
        // eslint-disable-next-line no-alert
        alert('Не удалось удалить чат');
      }
    }
  }

  componentDidMount() {
    this.messages = [];
    this.updateMessageArea();
  }

  show() {
    this.loadChats();
    super.show();
  }

  render(): DocumentFragment {
    return this.compile(template, this._props);
  }
}
