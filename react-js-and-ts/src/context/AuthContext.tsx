import React, { createContext, useContext, useEffect, useState } from "react"
import axios from "../lib/axios"
import type { User, AuthContextType } from "../types/auth"

// إنشاء السياق
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// مزود السياق
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  // أخطاء مخصصة لصفحات معينة
  const [loginError, setLoginError] = useState<string | null>(null)
  const [registerErrors, setRegisterErrors] = useState<{ [key: string]: string } | null>(null)
  const [error, setError] = useState<string | null>(null) // خطأ عام (اختياري)

  // ✅ التحقق من الجلسة عند تحميل التطبيق
  useEffect(() => {
    checkSession()
  }, [])

  // -------------------------
  // 🔐 الدوال الخاصة بالمصادقة
  // -------------------------

  // ✅ التحقق من وجود جلسة مستخدم
  const checkSession = async (): Promise<void> => {
    try {
      console.log("checkSession: Setting loading to true and attempting to fetch /me (relying on cookies).")
      setLoading(true)
      const response = await axios.get("/me")
      setUser(response.data.user);
      console.log("checkSession: setUser called. User:", response.data.user);
      setIsAuthenticated(true);
      console.log("checkSession: setIsAuthenticated called. isAuthenticated:", true);
      setLoading(false); // Set loading to false after successful user data fetch
      console.log("checkSession: setLoading called. loading:", false);
      console.log("checkSession: Final state in checkSession - user:", response.data.user, "isAuthenticated:", true, "loading:", false);
    } catch (error) {
      console.error("checkSession: Error during session check:", error)
      if (error.response) {
        console.error("checkSession: Error response data:", error.response.data);
        console.error("checkSession: Error response status:", error.response.status);
      }
      setUser(null)
      setIsAuthenticated(false)
      setLoading(false) // Ensure loading is set to false on error
      console.log("checkSession: User set to null, isAuthenticated set to false. Loading set to false.")
    }
  }

  

  // ✅ تسجيل مستخدم جديد
  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setLoading(true)
      setRegisterErrors(null)

      const response = await axios.post("/signup", { email, password, name })
      setUser(response.data.user)
      setIsAuthenticated(true)
      return true
    } catch (err: any) {
      const validationErrors = err.response?.data?.errors
      const translatedErrors: { [key: string]: string } = {}

      if (Array.isArray(validationErrors)) {
        validationErrors.forEach((item: { path: string; msg: string }) => {
          translatedErrors[item.path] = item.msg
        })
      } else {
        translatedErrors.general =
          err.response?.data?.message || "حدث خطأ أثناء التسجيل"
      }

      setRegisterErrors(translatedErrors)
      return false
    } finally {
      setLoading(false)
    }
  }

  // ✅ تسجيل الدخول
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true)
      setLoginError(null)

      const response = await axios.post("/login", { email, password })
      setUser(response.data.user)
      setIsAuthenticated(true)
    } catch (err: any) {
      setLoginError(err.response?.data?.message || "خطأ في البريد الإلكتروني أو كلمة المرور")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // ✅ تسجيل الخروج
  const logout = async (): Promise<void> => {
    try {
      setLoading(true)
      await axios.post("/logout")
      setUser(null)
      setIsAuthenticated(false)
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ أثناء تسجيل الخروج")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // ✅ نسيت كلمة المرور
  const forgotPassword = async (email: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      await axios.post("/forgot-password", { email })
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "حدث خطأ أثناء إرسال بريد إعادة تعيين كلمة المرور"
      )
      throw err
    } finally {
      setLoading(false)
    }
  }

  // ✅ إعادة تعيين كلمة المرور
  const resetPassword = async (token: string, password: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      await axios.post(`/reset-password/${token}`, { token, password })
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ أثناء إعادة تعيين كلمة المرور")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // ✅ التحقق من صلاحية رمز إعادة تعيين كلمة المرور
  const verifyResetPasswordToken = async (token: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      await axios.get(`/verify-reset-token/${token}`)
      return true
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "حدث خطأ أثناء التحقق من رمز إعادة تعيين كلمة المرور"
      )
      return false
    } finally {
      setLoading(false)
    }
  }

  // ✅ التحقق من البريد الإلكتروني
  const verifyEmail = async (token: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`/verify-email/${token}`)
      setUser(response.data.user)
      return true
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ أثناء التحقق من البريد الإلكتروني")
      return false
    } finally {
      setLoading(false)
    }
  }

  // ✅ إعادة إرسال بريد التحقق
  const resendVerificationEmail = async (email: string): Promise<string> => {
    try {
      setLoading(true)
      setError(null)
      const res = await axios.post("/resend-verification-email", { email })
      return res.data.message
    } catch (err: any) {
      setError(err.response?.data?.message || "حدث خطأ أثناء إعادة إرسال بريد التحقق")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // -----------------------
  // ✅ قيمة السياق النهائية
  // ----------------------- 
  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    loginError,
    registerErrors,
    error,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    verifyResetPasswordToken,
    verifyEmail,
    resendVerificationEmail,
    checkSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ✅ هوك للوصول إلى سياق المصادقة
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
