import { HTTPTransport } from './HTTPTransport';

export type CreateChatRequest = {
  title: string;
};

export type AddUserToChatRequest = {
  users: number[];
  chatId: number;
};

export type DeleteUserFromChatRequest = {
  users: number[];
  chatId: number;
};

export type Chat = {
  id: number;
  title: string;
  avatar: string;
  created_by: number;
  unread_count: number;
  last_message: {
    user: {
      first_name: string;
      second_name: string;
      avatar: string;
      email: string;
      login: string;
      phone: string;
    };
    time: string;
    content: string;
  };
  token?: string;
};

class ChatAPI {
  private http = new HTTPTransport();

  async getChats(): Promise<XMLHttpRequest> {
    return this.http.get('/chats');
  }

  async createChat(data: CreateChatRequest): Promise<XMLHttpRequest> {
    return this.http.post('/chats', { data });
  }

  async deleteChat(chatId: number): Promise<XMLHttpRequest> {
    return this.http.delete('/chats', { data: { chatId } });
  }

  async addUserToChat(data: AddUserToChatRequest): Promise<XMLHttpRequest> {
    return this.http.put('/chats/users', { data });
  }

  async deleteUserFromChat(data: DeleteUserFromChatRequest): Promise<XMLHttpRequest> {
    return this.http.delete('/chats/users', { data });
  }

  async getChatUsers(chatId: number): Promise<XMLHttpRequest> {
    return this.http.get(`/chats/${chatId}/users`);
  }

  async getToken(chatId: number): Promise<XMLHttpRequest> {
    return this.http.post(`/chats/token/${chatId}`);
  }
}

export const chatAPI = new ChatAPI();
