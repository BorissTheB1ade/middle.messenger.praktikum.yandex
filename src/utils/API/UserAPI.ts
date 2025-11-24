import HTTPTransport from './HTTPTransport';

export interface ChangeProfileRequest extends Record<string, unknown> {
  first_name: string;
  second_name: string;
  login: string;
  display_name: string;
  email: string;
  phone: string;
}

export interface ChangePasswordRequest extends Record<string, unknown> {
  oldPassword: string;
  newPassword: string;

}

export class UserAPI {
  private http: HTTPTransport;

  constructor() {
    this.http = new HTTPTransport();
  }

  async changeProfile(data: ChangeProfileRequest) {
    return this.http.put('/user/profile', { data });
  }

  async changePassword(data: ChangePasswordRequest) {
    return this.http.put('/user/password', { data });
  }

  async changeAvatar(data: FormData) {
    return this.http.put('/user/profile/avatar', { data });
  }

  async searchUser(login: string): Promise<XMLHttpRequest> {
    return this.http.post('/user/search', {
      data: { login },
    });
  }
}

export const userAPI = new UserAPI();
