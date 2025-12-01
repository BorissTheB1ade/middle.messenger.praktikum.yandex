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
  // @ts-expect-error - подписка на стор
  private subscribe?: () => void;

  private messages: MessageType[] = [];

  private currentOffset = 0;

  private hasMoreMessages = true;

  private isLoadingOldMessages = false;

  private currentChatId: number | null = null;

  private showTrigger = false;

  private loadMoreButton: Button;

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

    const loadMoreButton = new Button('div', {
      text: 'Загрузить предыдущие сообщения',
      class: 'btn load-more-btn',
      events: {
        click: {
          handler: () => {
            this.loadMoreMessages();
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
              // eslint-disable-next-line no-console
              AuthController.logout().catch(console.error);
            },
          },
        },
      }),
      chatHeader: new ChatHeader({
        attributes: { class: 'chat-header-wrapper' },
        displayName: 'Выберите чат',
        lastOnline: '',
        iconName: 'red_circle.svg',
        // eslint-disable-next-line no-alert
        onAddUser: () => alert('Сначала выберите чат'),
        // eslint-disable-next-line no-alert
        onRemoveUser: () => alert('Сначала выберите чат'),
        // eslint-disable-next-line no-alert
        onRemoveChat: () => alert('Сначала выберите чат'),
      }, 'div'),
      chatList: new ChatList('div', {
        attributes: { class: 'chat-list' },
        chatListItems: [],
        createChatButton,
      }),
      messageArea: new MessageArea('div', {
        attributes: { class: 'message-area' },
        messageList: [],
        showTrigger: false,
        loadMoreButton,
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

    this.loadMoreButton = loadMoreButton;

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

        if (state.currentChat && state.currentChat.id !== this.currentChatId) {
          this.handleChatChange(state.currentChat.id);
        }

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
                  // eslint-disable-next-line no-console
                  this.showRemoveUserDropdown(state.currentChat.id).catch(console.error);
                }
              },
              onRemoveChat: () => {
                if (state.currentChat) {
                  // eslint-disable-next-line no-console
                  this.handleDeleteChat(state.currentChat.id).catch(console.error);
                }
              },
            }, 'div'),
            messageArea: new MessageArea('div', {
              attributes: { class: 'message-area' },
              messageList: this.getMessageItems(),
              showTrigger: this.showTrigger,
            }),
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
              // eslint-disable-next-line no-alert
              onAddUser: () => alert('Сначала выберите чат'),
              // eslint-disable-next-line no-alert
              onRemoveUser: () => alert('Сначала выберите чат'),
              // eslint-disable-next-line no-alert
              onRemoveChat: () => alert('Сначала выберите чат'),
            }, 'div'),
            messageArea: new MessageArea('div', {
              attributes: { class: 'message-area' },
              messageList: [],
              showTrigger: false,
            }),
          });
        }
      }
    });

    webSocketService.onMessage((data: WebSocketData) => {
      this.handleWebSocketMessage(data);
    });
  }

  private handleChatChange(newChatId: number) {
    this.messages = [];
    this.currentOffset = 0;
    this.hasMoreMessages = true;
    this.isLoadingOldMessages = false;
    this.currentChatId = newChatId;
    this.showTrigger = false;
  }

  private loadMoreMessages(): boolean {
    if (this.isLoadingOldMessages || !this.hasMoreMessages) {
      return false;
    }

    this.isLoadingOldMessages = true;

    try {
      const state = store.getState();
      const currentChatId = state.currentChat?.id;
      if (!currentChatId) return false;
      this.currentOffset += 20;
      webSocketService.getOldMessages(this.currentOffset);
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Ошибка подгрузки сообщений:', error);
      return false;
    } finally {
      this.isLoadingOldMessages = false;
    }
  }

  private loadChats() {
    this.resetChatState();
    this.updateMessageArea();
    setTimeout(() => {
      // eslint-disable-next-line no-console
      ChatController.getChats().catch(console.error);
    }, 0);
  }

  public leave() {
    this.resetChatState();
    this.updateMessageArea();
    this.hide();
  }

  private handleWebSocketMessage(data: WebSocketData) {
    if (Array.isArray(data)) {
      const newMessages = data;

      if (this.currentOffset > 0) {
        this.messages = [...this.messages, ...newMessages];
        this.showTrigger = true;
        if (newMessages.length < 20) {
          this.hasMoreMessages = false;
          this.showTrigger = false;
        }
      } else {
        this.messages = newMessages;
        this.hasMoreMessages = newMessages.length === 20;
        this.showTrigger = this.hasMoreMessages;
        this.currentOffset = 0;
      }

      this.updateMessageArea();
    } else if (typeof data === 'object' && data !== null && 'type' in data && data.type === 'message') {
      this.messages = [data as MessageType, ...this.messages];
      this.updateMessageArea();
    }
  }

  private getMessageItems() {
    const state = store.getState();
    const currentUser = state.user;
    const currentChatId = state.currentChat?.id;

    return this.messages.map((message) => {
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
          'data-message-id': message.id.toString(),
        },
        messageText: message.content,
        messageTime,
        userName,
        messageType: message.user_id === currentUser?.id ? 'outgoing' : 'incoming',
      });
    });
  }

  private updateMessageArea() {
    this.setProps({
      messageArea: new MessageArea('div', {
        attributes: { class: 'message-area' },
        messageList: this.getMessageItems(),
        showTrigger: this.showTrigger,
        loadMoreButton: this.loadMoreButton,
      }),
    });
  }

  private resetChatState() {
    this.messages = [];
    this.currentOffset = 0;
    this.hasMoreMessages = true;
    this.isLoadingOldMessages = false;
    this.currentChatId = null;
    this.showTrigger = false;
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
          // eslint-disable-next-line no-restricted-globals
          if (confirm(`Удалить пользователя ${user.login} из чата?`)) {
            // eslint-disable-next-line no-console
            ChatController.deleteUserFromChat(chatId, user.id).catch(console.error);
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
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Вы уверены, что хотите удалить этот чат? Все сообщения будут потеряны.')) {
      try {
        await ChatController.deleteChat(chatId);
        store.setState({
          currentChat: null,
        });
        this.resetChatState();
        this.updateMessageArea();
        await ChatController.getChats();
      } catch {
        // eslint-disable-next-line no-alert
        alert('Не удалось удалить чат');
      }
    }
  }

  componentDidMount() {
    this.resetChatState();
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
