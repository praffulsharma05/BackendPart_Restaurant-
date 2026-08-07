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
};
