import { userAPI, ChangeProfileRequest, ChangePasswordRequest } from '../API/UserAPI';
import store from '../../services/Store';
import { authController } from './AuthController';
import {router} from '../../router/Router'

export class UserController {
  async updateProfile(profileData: ChangeProfileRequest, avatarFile?: File): Promise<boolean> {
    try {
      store.setState({ isLoading: true, error: null });
      if (Object.keys(profileData).length > 0) {
        const profileResponse = await userAPI.changeProfile(profileData);

        if (profileResponse.status !== 200) {
          const errorData = JSON.parse(profileResponse.response);
          throw new Error(errorData.reason || `Ошибка обновления профиля: ${profileResponse.status}`);
        }
      }
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        const avatarResponse = await userAPI.changeAvatar(formData);

        if (avatarResponse.status !== 200) {
          const errorData = JSON.parse(avatarResponse.response);
          throw new Error(errorData.reason || `Ошибка обновления аватара: ${avatarResponse.status}`);
        }
      }

      await authController.getUser();
      store.setState({ isLoading: false, error: null });
      
      return true;

    } catch (error) {
      store.setState({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Ошибка обновления профиля'
      });
      return false;
    }
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<boolean> {
    if (Object.keys(passwordData).length > 0) {
        const passwordResponse = await userAPI.changePassword(passwordData);

        if (passwordResponse.status !== 200) {
          const errorData = JSON.parse(passwordResponse.response);
          throw new Error(errorData.reason || `Ошибка обновления профиля: ${passwordResponse.status}`);
        }
        else{
          store.reset();
          authController.logout()
          router.go('/')
        }
      }
    return false;
  }
  
}

export const userController = new UserController()
