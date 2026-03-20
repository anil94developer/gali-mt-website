export const APP_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.playonlineds.net/api/users',
  appId: import.meta.env.VITE_APP_ID || 'com.dubaiking',
  devId: import.meta.env.VITE_DEV_ID || 'undefined',
  paymentGatewayUrl:
    import.meta.env.VITE_PAYMENT_GATEWAY_URL ||
    'https://playonlineds.net/Admin/public/payment-getway',
}

export const API_ENDPOINTS = {
  login: '/login',
  registerStep1: '/register-step1',
  register: '/register',
  getUserProfile: '/POM_get_user_profile',
  appNotice: '/POM_app_notice',
  home: '/home',
  marketList: '/get-market-list',
  batPlace: '/bat-place',
  deductWithdrawWeb: '/deduct-withdrawweb',
  appManager: '/app-manager',
  manageCommission: '/manage-commission',
  userRefferList: '/user-refferlist',
  pendingBetHistory: '/pending-bet-history',
  userCredit: '/user-credit',
  userProfileUpdate: '/user-profile-update',
  helpNumber: '/POM_help_number',
}
