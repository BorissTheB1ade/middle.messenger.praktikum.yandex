import { chatAPI, Chat } from '../API/ChatAPI';
import { userAPI } from '../API/UserAPI';
import { webSocketService } from '../../services/Websocket';
import store from '../../services/Store';

export class ChatController {
  async getChats(): Promise<boolean> {
  try {
    store.setState({ isLoading: true });

    const response = await chatAPI.getChats();

    if (response.status === 200) {
      const chats = JSON.parse(response.response);
      if (chats && chats.length > 0) {
        const firstChat = chats[0];
        store.setState({
          chats,
          currentChat: firstChat,
          isLoading: false
        });
        try {
          const tokenResponse = await chatAPI.getToken(firstChat.id);
          if (tokenResponse.status === 200) {
            const { token } = JSON.parse(tokenResponse.response);
            const chatWithToken = { ...firstChat, token };
            store.setState({ currentChat: chatWithToken });
            await this.getChatUsers(firstChat.id);
            webSocketService.connect(firstChat.id, token);
          }
        } catch (tokenError) {
          console.error('Failed to get token for first chat:', tokenError);
        }
      } else {
        store.setState({ chats, isLoading: false });
      }

      return true;
    } else {
      throw new Error(`Failed to get chats: ${response.status}`);
    }
  } catch (error) {
    store.setState({
      isLoading: false,
      error: error instanceof Error ? error.message : 'Failed to load chats'
    });
    return false;
  }
}

  async selectChat(chat: Chat): Promise<void> {
    store.setState({ currentChat: chat });

    try {
      const response = await chatAPI.getToken(chat.id);
      if (response.status === 200) {
        const { token } = JSON.parse(response.response);
        const chatWithToken = { ...chat, token };
        store.setState({ currentChat: chatWithToken });
        await this.getChatUsers(chat.id);
        webSocketService.connect(chat.id, token);
      }
    } catch (error) {
      console.error('Failed to get token:', error);
    }
  }

  async createChat(title: string): Promise<boolean> {
    try {
      const response = await chatAPI.createChat({ title });

      if (response.status === 200) {
        await this.getChats();
        return true;
      } else {
        const errorData = JSON.parse(response.response);
        throw new Error(errorData.reason || `Failed to create chat: ${response.status}`);
      }
    } catch (error) {
      store.setState({
        error: error instanceof Error ? error.message : 'Failed to create chat'
      });
      return false;
    }
  }

  async addUserToChat(chatId: number, userId: number): Promise<boolean> {
    try {
      const response = await chatAPI.addUserToChat({
        users: [userId],
        chatId
      });

      if (response.status === 200) {
        return true;
      } else {
        const errorData = JSON.parse(response.response);
        throw new Error(errorData.reason || `Failed to add user: ${response.status}`);
      }
    } catch (error) {
      store.setState({
        error: error instanceof Error ? error.message : 'Failed to add user to chat'
      });
      return false;
    }
  }

  async getChatUsers(chatId: number): Promise<any[]> {
    try {
      const response = await chatAPI.getChatUsers(chatId);

      if (response.status === 200) {
        const users = JSON.parse(response.response);
        const currentState = store.getState();
        store.setState({
          chatUsers: {
            ...currentState.chatUsers,
            [chatId]: users
          }
        });

        return users;
      } else {
        throw new Error(`Failed to get chat users: ${response.status}`);
      }
    } catch (error) {
      return [];
    }
  }

  async deleteUserFromChat(chatId: number, userId: number): Promise<boolean> {
    try {
      const response = await chatAPI.deleteUserFromChat({
        users: [userId],
        chatId
      });
      if (response.status === 200) {
        alert('Пользователь успешно удален из чата');
        return true;
      } else {
        const errorData = JSON.parse(response.response);
        throw new Error(errorData.reason || `Failed to remove user: ${response.status}`);
      }
    } catch (error) {
      alert(`Ошибка при удалении пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return false;
    }
  }

  async deleteChat(chatId: number): Promise<boolean> {
    try {
      const response = await chatAPI.deleteChat(chatId);

      if (response.status === 200) {
        await this.getChats();
        alert('Чат удален');
        return true;
      } else {
        const errorData = JSON.parse(response.response);
        throw new Error(errorData.reason || 'Ошибка при удалении чата');
      }
    } catch (error) {
      alert(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return false;
    }
  }

  async searchUserByLogin(login: string): Promise<any> {
    try {
      const response = await userAPI.searchUser(login);

      if (response.status === 200) {
        const users = JSON.parse(response.response);
        if (users.length > 0) {
          return users[0];
        } else {
          throw new Error('Пользователь не найден');
        }
      } else {
        throw new Error('Ошибка при поиске пользователя');
      }
    } catch (error) {
      throw error;
    }
  }
}

export const chatController = new ChatController();
