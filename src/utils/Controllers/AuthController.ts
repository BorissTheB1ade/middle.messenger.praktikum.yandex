import {
  authAPI, SignUpRequest, SignInRequest, User,
} from '../API/AuthAPI';
import store from '../../services/Store';
import router from '../../router';

interface APIError {
  reason?: string;
}

interface APIResponse {
  response: string;
  status: number;
}

class AuthController {
  static async signup(signUpRequest: SignUpRequest): Promise<boolean> {
    try {
      store.setState({ isLoading: true, error: null });

      const response = await authAPI.signup(signUpRequest) as APIResponse;

      if (response.status === 200) {
        await AuthController.getUser();
        store.setState({ isLoading: false, error: null });
        router.go('/messenger');
        return true;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const errorData = JSON.parse(response.response) as APIError;
      const errorMessage = errorData.reason || `Ошибка регистрации: ${response.status}`;
      throw new Error(errorMessage);
    } catch (error) {
      store.setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ошибка регистрации',
      });
      return false;
    }
  }

  static async signin(signInRequest: SignInRequest): Promise<boolean> {
    try {
      store.setState({ isLoading: true, error: null });

      const response = await authAPI.signin(signInRequest) as APIResponse;

      if (response.status === 200) {
        await AuthController.getUser();
        store.setState({ isLoading: false, error: null });
        router.go('/messenger');
        return true;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const errorData = JSON.parse(response.response) as APIError;
      const errorMessage = errorData.reason || `Ошибка авторизации: ${response.status}`;

      if (errorData.reason === 'User already in system') {
        store.setState({ isLoading: false, error: null });
        router.go('/messenger');
        return true;
      }

      throw new Error(errorMessage);
    } catch (error) {
      store.setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ошибка авторизации',
      });
      return false;
    }
  }

  static async getUser(): Promise<User | null> {
    try {
      const response = await authAPI.getUser() as APIResponse;

      if (response.status === 200) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const user = JSON.parse(response.response) as User;
        store.setState({ user, isAuth: true, error: null });
        return user;
      }
      store.setState({ isAuth: false, user: null });
      return null;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      store.setState({ isAuth: false, user: null });
      return null;
    }
  }

  static async logout(): Promise<boolean> {
    try {
      const response = await authAPI.logout() as APIResponse;

      if (response.status === 200) {
        store.reset();
        router.go('/');
        return true;
      }
      throw new Error(`Logout failed: ${response.status}`);
    } catch (error) {
      AuthController.handleError('Logout error:', error);
      return false;
    }
  }

  static async checkAuth(): Promise<boolean> {
    try {
      const user = await AuthController.getUser();
      return !!user;
    } catch (error) {
      AuthController.handleError('Check auth error:', error);
      return false;
    }
  }

  private static handleError(message: string, error: unknown): void {
    // eslint-disable-next-line no-console
    console.error(message, error);
  }
}

export default AuthController;
