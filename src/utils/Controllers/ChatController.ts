import { chatAPI, Chat } from '../API/ChatAPI';
import { userAPI } from '../API/UserAPI';
import { webSocketService } from '../../services/Websocket';
import store from '../../services/Store';

interface APIError {
  reason?: string;
}

interface TokenResponse {
  token: string;
}

interface APIResponse {
  response: string;
  status: number;
}

class ChatController {
  static async getChats(): Promise<boolean> {
    try {
      store.setState({ isLoading: true });

      const response = await chatAPI.getChats() as APIResponse;

      if (response.status === 200) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const chats: Chat[] = JSON.parse(response.response);
        if (chats && chats.length > 0) {
          const firstChat = chats[0];
          store.setState({
            chats,
            currentChat: firstChat,
            isLoading: false,
          });
          try {
            const tokenResponse = await chatAPI.getToken(firstChat.id) as APIResponse;
            if (tokenResponse.status === 200) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              const { token } = JSON.parse(tokenResponse.response) as TokenResponse;
              const chatWithToken = { ...firstChat, token };
              store.setState({ currentChat: chatWithToken });
              await ChatController.getChatUsers(firstChat.id);
              webSocketService.connect(firstChat.id, token);
            }
          } catch (tokenError) {
            ChatController.handleError('Failed to get token for first chat:', tokenError);
          }
        } else {
          store.setState({ chats, isLoading: false });
        }

        return true;
      }
      const status = String(response.status);
      throw new Error(`Failed to get chats: ${status}`);
    } catch (error) {
      store.setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load chats',
      });
      return false;
    }
  }

  static async selectChat(chat: Chat): Promise<void> {
    store.setState({ currentChat: chat });

    try {
      const response = await chatAPI.getToken(chat.id) as APIResponse;
      if (response.status === 200) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { token } = JSON.parse(response.response) as TokenResponse;
        const chatWithToken = { ...chat, token };
        store.setState({ currentChat: chatWithToken });
        await ChatController.getChatUsers(chat.id);
        webSocketService.connect(chat.id, token);
      }
    } catch (error) {
      ChatController.handleError('Failed to get token:', error);
    }
  }

  static async createChat(title: string): Promise<boolean> {
    try {
      const response = await chatAPI.createChat({ title }) as APIResponse;

      if (response.status === 200) {
        await ChatController.getChats();
        return true;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const errorData = JSON.parse(response.response) as APIError;
      const status = String(response.status);
      const errorMessage = errorData.reason || `Failed to create chat: ${status}`;
      throw new Error(errorMessage);
    } catch (error) {
      store.setState({
        error: error instanceof Error ? error.message : 'Failed to create chat',
      });
      return false;
    }
  }

  static async addUserToChat(chatId: number, userId: number): Promise<boolean> {
    try {
      const response = await chatAPI.addUserToChat({
        users: [userId],
        chatId,
      }) as APIResponse;

      if (response.status === 200) {
        return true;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const errorData = JSON.parse(response.response) as APIError;
      const status = String(response.status);
      const errorMessage = errorData.reason || `Failed to add user: ${status}`;
      throw new Error(errorMessage);
    } catch (error) {
      store.setState({
        error: error instanceof Error ? error.message : 'Failed to add user to chat',
      });
      return false;
    }
  }

  static async getChatUsers(chatId: number): Promise<import('../../services/Store').User[]> {
    try {
      const response = await chatAPI.getChatUsers(chatId) as APIResponse;

      if (response.status === 200) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const users: import('../../services/Store').User[] = JSON.parse(response.response);
        const currentState = store.getState();
        store.setState({
          chatUsers: {
            ...currentState.chatUsers,
            [chatId]: users,
          },
        });

        return users;
      }
      const status = String(response.status);
      throw new Error(`Failed to get chat users: ${status}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return [];
    }
  }

  static async deleteUserFromChat(chatId: number, userId: number): Promise<boolean> {
    try {
      const response = await chatAPI.deleteUserFromChat({
        users: [userId],
        chatId,
      }) as APIResponse;
      if (response.status === 200) {
        // eslint-disable-next-line no-alert
        alert('Пользователь успешно удален из чат');
        return true;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const errorData = JSON.parse(response.response) as APIError;
      const status = String(response.status);
      const errorMessage = errorData.reason || `Failed to remove user: ${status}`;
      throw new Error(errorMessage);
    } catch (error) {
      // eslint-disable-next-line no-alert
      alert(`Ошибка при удалении пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return false;
    }
  }

  static async deleteChat(chatId: number): Promise<boolean> {
    try {
      const response = await chatAPI.deleteChat(chatId) as APIResponse;

      if (response.status === 200) {
        await ChatController.getChats();
        // eslint-disable-next-line no-alert
        alert('Чат удален');
        return true;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const errorData = JSON.parse(response.response) as APIError;
      const errorMessage = errorData.reason || 'Ошибка при удалении чата';
      throw new Error(errorMessage);
    } catch (error) {
      // eslint-disable-next-line no-alert
      alert(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return false;
    }
  }

  static async searchUserByLogin(login: string): Promise<import('../../services/Store').User | null> {
    try {
      const response = await userAPI.searchUser(login) as APIResponse;

      if (response.status === 200) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const users: import('../../services/Store').User[] = JSON.parse(response.response);
        if (users.length > 0) {
          return users[0];
        }
        throw new Error('Пользователь не найден');
      } else {
        throw new Error('Ошибка при поиске пользователя');
      }
    } catch (error) {
      ChatController.handleError('Search user error:', error);
      return null;
    }
  }

  private static handleError(message: string, error: unknown): void {
    // eslint-disable-next-line no-console
    console.error(message, error);
  }
}

export default ChatController;
