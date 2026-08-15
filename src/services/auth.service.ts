import {
  adminLogin,
  loginWithPhone,
  loginWithEmail,
  refreshAccessToken,
} from './auth/authLogin';
import {
  getUserProfile,
  getAllCustomers,
  toggleBlockCustomer,
  updateProfile,
  deleteCustomer,
  register,
} from './auth/authRegistration';

import { resetPassword } from './auth/authResetPassword';

export const authService = {
  adminLogin,
  loginWithPhone,
  loginWithEmail,
  refreshAccessToken,
  getUserProfile,
  getAllCustomers,
  toggleBlockCustomer,
  updateProfile,
  deleteCustomer,
  register,
  resetPassword,
};
