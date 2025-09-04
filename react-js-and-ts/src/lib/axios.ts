// ملف axiosInstance.ts
import axios from "axios"

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
})

let isRefreshing = false
let failedQueue: Array<{ resolve: () => void; reject: (e: any) => void }> = []

const processQueue = (error: any) => {
  failedQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve())
  failedQueue = []
}

// المسارات التي لا نريد فيها إعادة محاولة /refresh
const authFreePaths = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/me", // Add /me to authFreePaths to prevent token refresh attempts
]

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    const path = originalRequest.url || ""

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !authFreePaths.includes(path)
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => axiosInstance(originalRequest))
      }

      originalRequest._retry = true
      isRefreshing = true

      return new Promise((resolve, reject) => {
        axiosInstance.post("/refresh")
          .then(() => {
            processQueue(null)
            resolve(axiosInstance(originalRequest))
          })
          .catch(err => {
            processQueue(err)
            reject(err)
            // يمكنك هنا توجيه المستخدم إلى صفحة /auth/login
          })
          .finally(() => {
            isRefreshing = false
          })
      })
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
