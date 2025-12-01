import { router } from './Router';
import LoginPage from '../pages/login';
import ChatPage from '../pages/chat';
import RegisterPage from '../pages/register';
import UserSettingsPage from '../pages/userSettings';
import ChangePasswordPage from '../pages/changePassword';
import ErrorPage from '../pages/error';

router
  .use('/', LoginPage, {})
  .use('/sign-up', RegisterPage, {})
  .use('/settings', UserSettingsPage, {}, true)
  .use('/messenger', ChatPage, {})
  .use('/changepswd', ChangePasswordPage, {}, true)
  .use('/error', ErrorPage, {});

export default router;
