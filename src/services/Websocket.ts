import store from './Store';

interface WebSocketMessage {
    id: number;
    user_id: number;
    chat_id: number;
    content: string;
    time: string;
    type: 'message';
    is_read: boolean;
}

interface PingMessage {
    type: 'ping';
}

interface PongMessage {
    type: 'pong';
}

interface GetOldMessage {
    type: 'get old';
    content: string;
}

interface TextMessage {
    type: 'message';
    content: string;
}

type WebSocketData = WebSocketMessage | WebSocketMessage[] | PingMessage | PongMessage | GetOldMessage | TextMessage;

export class WebSocketService {
  private socket: WebSocket | null = null;

  private listeners: ((data: WebSocketData) => void)[] = [];

  private pingInterval: NodeJS.Timeout | null = null;

  connect(chatId: number, token: string) {
    const userId = store.getState().user?.id;
    if (!userId) {
      return;
    }

    this.disconnect();

    const url = `wss://ya-praktikum.tech/ws/chats/${userId}/${chatId}/${token}`;

    this.socket = new WebSocket(url);

    this.socket.addEventListener('open', () => {
      this.startPing();
      this.socket?.send(JSON.stringify({
        type: 'get old',
        content: '0',
      } as GetOldMessage));
    });

    this.socket.addEventListener('message', (event) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const data = JSON.parse(event.data) as WebSocketData;
        if ((typeof data === 'object' && data !== null && 'type' in data && data.type === 'pong')) {
          return;
        }
        this.listeners.forEach((listener) => listener(data));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to parse WebSocket message:', error);
      }
    });

    this.socket.addEventListener('close', () => {
      this.stopPing();
    });

    this.socket.addEventListener('error', () => {
      this.stopPing();
    });
  }

  private startPing() {
    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          type: 'ping',
        } as PingMessage));
      }
    }, 30000);
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  sendMessage(message: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        content: message,
        type: 'message',
      } as TextMessage));
    } else {
      // eslint-disable-next-line no-console
      console.error('WebSocket not connected');
    }
  }

  onMessage(callback: (data: WebSocketData) => void) {
    this.listeners.push(callback);
  }

  disconnect() {
    this.stopPing();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  getState() {
    return this.socket?.readyState;
  }
}

export const webSocketService = new WebSocketService();
export type { WebSocketData, WebSocketMessage };
