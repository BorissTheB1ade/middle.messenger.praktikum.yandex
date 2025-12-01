import { userAPI, ChangeProfileRequest, ChangePasswordRequest } from '../API/UserAPI';
import store from '../../services/Store';
import AuthController from './AuthController';
import { router } from '../../router/Router';

interface APIError {
  reason?: string;
}

interface APIResponse {
  response: string;
  status: number;
}

export class UserController {
  static async updateProfile(profileData: ChangeProfileRequest, avatarFile?: File): Promise<boolean> {
    try {
      store.setState({ isLoading: true, error: null });
      if (Object.keys(profileData).length > 0) {
        const profileResponse = await userAPI.changeProfile(profileData) as APIResponse;

        if (profileResponse.status !== 200) {
          const errorData = JSON.parse(profileResponse.response) as APIError;
          const errorMessage = errorData.reason || `Ошибка обновления профиля: ${profileResponse.status}`;
          throw new Error(errorMessage);
        }
      }
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);

        const avatarResponse = await userAPI.changeAvatar(formData) as APIResponse;

        if (avatarResponse.status !== 200) {
          const errorData = JSON.parse(avatarResponse.response) as APIError;
          const errorMessage = errorData.reason || `Ошибка обновления аватара: ${avatarResponse.status}`;
          throw new Error(errorMessage);
        }
      }

      await AuthController.getUser();
      store.setState({ isLoading: false, error: null });

      return true;
    } catch (error) {
      store.setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ошибка обновления профиля',
      });
      return false;
    }
  }

  static async changePassword(passwordData: ChangePasswordRequest): Promise<boolean> {
    try {
      if (Object.keys(passwordData).length > 0) {
        const passwordResponse = await userAPI.changePassword(passwordData) as APIResponse;

        if (passwordResponse.status !== 200) {
          const errorData = JSON.parse(passwordResponse.response) as APIError;
          const errorMessage = errorData.reason || `Ошибка обновления профиля: ${passwordResponse.status}`;
          throw new Error(errorMessage);
        } else {
          store.reset();
          await AuthController.logout().catch((error) => {
            UserController.handleError('Logout error:', error);
          });
          router.go('/');
          return true;
        }
      }
      return false;
    } catch (error) {
      UserController.handleError('Password change error:', error);
      store.setState({
        error: error instanceof Error ? error.message : 'Ошибка изменения пароля',
      });
      return false;
    }
  }

  private static handleError(message: string, error: unknown): void {
    // eslint-disable-next-line no-console
    console.error(message, error);
  }
}

export const userController = new UserController();
