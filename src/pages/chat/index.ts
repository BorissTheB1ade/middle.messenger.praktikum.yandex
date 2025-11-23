import template from './chat.hbs?raw';
import Block from '../../services/Block';
import store from '../../services/Store';
import { chatController } from '../../utils/Controllers/ChatController';
import Link from '../../components/link';
import Button from '../../components/simpleButton';
import { authController } from '../../utils/Controllers/AuthController';
import ChatList from '../../components/chatList';
import ChatHeader from '../../components/chatHeader';
import MessageInput from '../../components/messageInput';
import MessageArea from '../../components/messageArea';
import SubmitButton from '../../components/button';
import ChatListItem from '../../components/chatListItem';
import Message from '../../components/message';
import { formEvents, linkEvents } from '../../services/Events';
import { webSocketService } from '../../services/Websocket';
import { MessageType } from '../../types/chat';
import UserDropdown from '../../components/userDropdown';
import UserSearch from '../../components/userSearch';

export default class ChatPage extends Block {
  private subscribe?: () => void;
  private messages: MessageType[] = [];

  constructor() {
    const createChatButton = new Button('div', {
      text: 'Создать чат',
      class: 'btn',
      events: {
        click: {
          handler: () => {
            const title = prompt('Введите название чата:');
            if (title) {
              chatController.createChat(title);
            }
          }
        }
      }
    });

    super('div', {
      attributes: { class: 'page' },
      goToProfileLink: new Link('div', { url: '/', text: 'Профиль', events: linkEvents, attributes: { 'data-url': '/settings' } }),
      logoutButton: new Button('div', {
        text: 'Выйти',
        class: 'btn',
        events: {
          click: {
            handler: () => {
              authController.logout();
            }
          }
        }
      }),
      chatHeader: new ChatHeader('div', {
        attributes: { class: 'chat-header-wrapper' },
        displayName: 'Выберите чат',
        lastOnline: '',
        iconName: 'red_circle.svg',
        onAddUser: () => {
          alert('Сначала выберите чат');
        },
        onRemoveUser: () => {
          alert('Сначала выберите чат');
        },
        onRemoveChat: () => {
          alert('Сначала выберите чат');
        }
      }),
      chatList: new ChatList('div', {
        attributes: { class: 'chat-list' },
        chatListItems: [],
        createChatButton: createChatButton
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
        const chatListItems = state.chats.map(chat => {
          const isSelected = state.currentChat?.id === chat.id;

          return new ChatListItem('div', {
            attributes: { class: `chat-list-item ${isSelected ? 'selected' : ''}` },
            displayName: chat.title,
            lastMessageText: chat.last_message?.content || 'Нет сообщений',
            iconName: chat.avatar || 'blue_circle.svg',
            unreadCount: chat.unread_count,
            events: {
              click: {
                handler: () => {
                  chatController.selectChat(chat);
                }
              }
            }
          });
        });

        if (state.currentChat) {
          this.setProps({
            chatList: new ChatList('div', {
              attributes: { class: 'chat-list' },
              chatListItems: chatListItems,
              createChatButton: createChatButton
            }),
            chatHeader: new ChatHeader('div', {
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
                  this.showRemoveUserDropdown(state.currentChat.id);
                }
              },
              onRemoveChat: () => {
                if (state.currentChat) {
                  this.handleDeleteChat(state.currentChat.id);
                }
              }
            })
          });
        } else {
          this.setProps({
            chatList: new ChatList('div', {
              attributes: { class: 'chat-list' },
              chatListItems: chatListItems,
              createChatButton: createChatButton
            }),
            chatHeader: new ChatHeader('div', {
              attributes: { class: 'chat-header-wrapper' },
              displayName: 'Выберите чат',
              lastOnline: '',
              iconName: 'red_circle.svg',
              onAddUser: () => {
                alert('Сначала выберите чат');
              },
              onRemoveUser: () => {
                alert('Сначала выберите чат');
              },
              onRemoveChat: () => {
                alert('Сначала выберите чат');
              }
            })
          });
        }
      }
    });

    webSocketService.onMessage((data) => {
      this.handleWebSocketMessage(data);
    });
  }


  private async loadChats() {
    this.messages = [];
    this.updateMessageArea();
    setTimeout(async () => {
      await chatController.getChats();
    }, 0);
  }

  public leave() {
    this.messages = [];
    this.updateMessageArea();
    this.hide();
  }


  private handleWebSocketMessage(data: any) {

    if (Array.isArray(data)) {
      this.messages = data.reverse();
    } else if (data.type === 'message') {
      this.messages = [...this.messages, data];
    }
    this.updateMessageArea();
  }


  private updateMessageArea() {
    const state = store.getState();
    const currentUser = state.user;
    const currentChatId = state.currentChat?.id;

    const messageItems = this.messages.map(message => {
      const messageTime = new Date(message.time).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });

      let userName = 'Неизвестный';

      if (message.user_id === currentUser?.id) {
        userName = 'Вы';
      } else if (currentChatId) {
        const chatUsers = state.chatUsers?.[currentChatId] || [];
        const messageUser = chatUsers.find(user => user.id === message.user_id);
        if (messageUser) {
          userName = messageUser.display_name ||
            `${messageUser.first_name} ${messageUser.second_name}`.trim() ||
            messageUser.login;
        }
      }

      return new Message('div', {
        attributes: {
          class: message.user_id === currentUser?.id
            ? 'message-string-outgoing'
            : 'message-string-incoming'
        },
        messageText: message.content,
        messageTime: messageTime,
        userName: userName,
        messageType: message.user_id === currentUser?.id ? 'outgoing' : 'incoming',
      });
    });

    this.setProps({
      messageArea: new MessageArea('div', {
        attributes: { class: 'message-area' },
        messageList: messageItems,
      })
    });
  }

  private showAddUserModal(chatId: number) {
    const modal = new UserSearch('div', {
      chatId: chatId,
      mode: 'add',
      onClose: () => {
        modal.getContent().remove();
      }
    });

    document.body.appendChild(modal.getContent());
  }

  private showRemoveUserDropdown(chatId: number) {
    chatController.getChatUsers(chatId).then(users => {
      const dropdown = new UserDropdown({
        users: users,
        title: 'Удалить пользователя',
        onSelectUser: (user) => {
          if (confirm(`Удалить пользователя ${user.login} из чата?`)) {
            chatController.deleteUserFromChat(chatId, user.id);
          }
        }
      });
      const overlay = document.createElement('div');
      overlay.className = 'dropdown-overlay';
      overlay.onclick = () => {
        overlay.remove();
        dropdown.getContent().remove();
      };

      document.body.appendChild(overlay);
      document.body.appendChild(dropdown.getContent());
    });
  }

  private handleDeleteChat(chatId: number) {
    if (confirm('Вы уверены, что хотите удалить этот чат? Все сообщения будут потеряны.')) {
      chatController.deleteChat(chatId)
        .then(() => {
          store.setState({
            currentChat: null,
          });
          this.messages = [];
          this.updateMessageArea();
          chatController.getChats();
        })
        .catch(() => {
          alert('Не удалось удалить чат');
        });
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
