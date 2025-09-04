export interface User {
  id: string
  email: string
  name: string
  isVerified: boolean
  role: { _id: string; name: string; permissions: string[]; }
  permissions?: string[]

}

export interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  registerErrors: { [key: string]: string } | null
  loginError: string | null
  isAuthenticated: boolean
  register: (email: string, password: string, name: string) => Promise<boolean>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string) => Promise<void>
  verifyEmail: (token: string) => Promise<boolean>
  resendVerificationEmail: (email: string) => Promise<string>
  verifyResetPasswordToken: (token: string) => Promise<boolean>
  checkSession: () => Promise<void>
  setAuthToken: (token: string) => void
}