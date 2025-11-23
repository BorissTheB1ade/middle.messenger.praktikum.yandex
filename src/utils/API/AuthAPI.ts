import { HTTPTransport } from './HTTPTransport';

export interface SignUpRequest extends Record<string, unknown> {
  first_name: string;
  second_name: string; 
  login: string;
  email: string;
  password: string;
  phone: string;
}

export interface SignInRequest extends Record<string, unknown> {
  login: string;
  password: string;
}

export interface User extends Record<string, unknown> {
  id: number;
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  phone: string;
  avatar?: string;
}

export class AuthAPI {
  private http: HTTPTransport;

  constructor() {
    this.http = new HTTPTransport();
  }

  signup(data: SignUpRequest) {
    return this.http.post('/auth/signup', { data });
  }

  signin(data: SignInRequest) {
    return this.http.post('/auth/signin', { data });
  }

  getUser() {
    return this.http.get('/auth/user');
  }

  logout() {
    return this.http.post('/auth/logout');
  }
}

export const authAPI = new AuthAPI();
