import { authAPI, SignUpRequest, SignInRequest, User } from '../API/AuthAPI';
import store  from '../../services/Store';
import { router } from '../../router';

export class AuthController {
  async signup(signUpRequest: SignUpRequest): Promise<boolean> {
    try {
      store.setState({ isLoading: true, error: null });

      const response = await authAPI.signup(signUpRequest);

      if (response.status === 200) {
        await this.getUser();
        store.setState({ isLoading: false, error: null });
        router.go('/messenger')
        return true;
      } else {
        const errorData = JSON.parse(response.response);
        throw new Error(errorData.reason || `Ошибка регистрации: ${response.status}`);
      }
    } catch (error) {
      store.setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ошибка регистрации'
      });
      return false;
    }
  }

  async signin(signInRequest: SignInRequest): Promise<boolean> {
    try {
      store.setState({ isLoading: true, error: null });

      const response = await authAPI.signin(signInRequest);

      if (response.status === 200) {
        await this.getUser();
        store.setState({ isLoading: false, error: null });
        router.go('/messenger')
        return true;
      } else {
        const errorData = JSON.parse(response.response);
        throw new Error(errorData.reason || `Ошибка авторизации: ${response.status}`);
      }
    } catch (error) {
      store.setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ошибка авторизации'
      });
      return false;
    }
  }

  async getUser(): Promise<User | null> {
    try {
      const response = await authAPI.getUser();

      if (response.status === 200) {
        const user = JSON.parse(response.response);
        store.setState({ user, isAuth: true, error: null });
        return user;
      } else {
        store.setState({ isAuth: false, user: null });
        return null;
      }
    } catch (error) {
      store.setState({ isAuth: false, user: null });
      return null;
    }
  }

  async logout(): Promise<boolean> {
    try {
      const response = await authAPI.logout();

      if (response.status === 200) {
        store.reset();
        router.go('/');
        return true;
      } else {
        throw new Error(`Logout failed: ${response.status}`);
      }
    } catch (error) {
      return false;
    }
  }

  async checkAuth(): Promise<boolean> {
    try {
      const user = await this.getUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }

}

export const authController = new AuthController();
