export const MIN_PASSWORD_LOGIN = 8;
export const MIN_PASSWORD_NEW = 8;

// Demo tanpa backend: kode OTP selalu sama. Ganti dengan panggilan API saat backend siap.
export const DEMO_OTP = '123456';
export const OTP_COOLDOWN_SECONDS = 60;

export const emptyRegisterForm = {
  name: '',
  nik: '',
  phone: '',
  username: '',
  address: '',
  password: '',
  confirm: '',
  agree: false,
};

export const emptyForgotForm = {
  nik: '',
  phone: '',
  username: '',
  otp: '',
  agree: false,
};

export const emptyResetForm = {
  password: '',
  confirm: '',
  human: false,
};
