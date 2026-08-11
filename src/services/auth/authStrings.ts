export const AUTH_STRINGS = {
  ERRORS: {
    PHONE_REQUIRED: 'Phone number is required',
    USER_NOT_FOUND: 'User not found',
    EMAIL_PASSWORD_REQUIRED: 'Email and password are required',
    INVALID_CREDENTIALS: 'Invalid email or password',
    PHONE_REGISTERED: 'Phone number is already registered',
    EMAIL_REGISTERED: 'Email is already registered',
  },
  NOTIFICATIONS: {
    LOGIN_SUCCESS_TITLE: 'Logged In Successfully',
    LOGIN_SUCCESS_BODY: (name?: string) =>
      `Welcome back, ${name || 'valued customer'}! You have logged in successfully.`,
    ADMIN_USER_LOGIN_TITLE: 'User Logged In',
    ADMIN_USER_LOGIN_BODY: (name?: string, identifier?: string) =>
      `User ${name || 'Customer'} (${identifier || 'N/A'}) has logged in.`,
    WELCOME_TITLE: 'Welcome to Meals on Wheels!',
    WELCOME_BODY: (name: string) =>
      `Hi ${name}! Your account has been registered successfully. Enjoy gourmet dining!`,
    ADMIN_REGISTER_TITLE: 'New Account Registered',
    ADMIN_REGISTER_BODY: (name: string, phone: string, email?: string | null) =>
      `New user ${name} (${phone}${email ? ' / ' + email : ''}) has created an account.`,
  },
};
