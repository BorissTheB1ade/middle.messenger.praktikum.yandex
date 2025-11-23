import EventBus from './EventBus';
import { Chat } from '../types/chat';

export type User = {
  id: number;
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  phone: string;
  avatar: string;
  display_name?: string
};


export type AppState = {
  user: User | null;
  isAuth: boolean;
  chats: Chat[];
  currentChat: Chat | null;
  error: string | null;
  isLoading: boolean;
  chatUsers: Record<number, User[]>;
};

const initialState: AppState = {
  user: null,
  isAuth: false,
  chats: [],
  currentChat: null,
  error: null,
  isLoading: false,
  chatUsers: {}
};

class Store extends EventBus {
  private static instance: Store | null = null;
  private state: AppState = this.loadState();
  id = Math.random();


  private loadState(): AppState {
    const saved = localStorage.getItem('appState');
    if (saved) {
      return { ...initialState, ...JSON.parse(saved) };
    }
    return initialState;
  }

  public static getInstance(): Store {
    if (!Store.instance) {
      Store.instance = new Store();
    }
    return Store.instance;
  }

  public getState() {
    return this.state;
  }

  public setState(newState: Partial<AppState>) {
    const prevState = { ...this.state };

    this.state = { ...this.state, ...newState };

    localStorage.setItem('appState', JSON.stringify({
      user: this.state.user,
      isAuth: this.state.isAuth
    }));

    this.emit('changed', prevState, this.state);
  }

  public reset() {
    const prevState = { ...this.state };
    this.state = { ...initialState };
    localStorage.removeItem('appState');
    this.emit('changed', prevState, this.state);
  }
}

export default Store.getInstance();
