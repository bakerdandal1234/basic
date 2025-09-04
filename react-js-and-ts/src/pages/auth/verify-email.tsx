import React, { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { Button } from "../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { ThemeToggle } from "../../components/theme/theme-toggle"
import {
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Input } from "../../components/ui/input"

export default function VerifyEmailPage() {
  const { verifyEmail, resendVerificationEmail } = useAuth()
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()

  const [resendLoading, setResendLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [resendMessage, setResendMessage] = useState("")
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setTokenValid(false)
        return
      }
      try {
        const isValid = await verifyEmail(token)
        setTokenValid(isValid)
      } catch {
        setTokenValid(false)
      }
    }

    checkToken()
  }, [token, verifyEmail])

  useEffect(() => {
    if (tokenValid === true) {
      const timer = setTimeout(() => {
        navigate("/dashboard")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [tokenValid, navigate])

  const handleResendEmail = async () => {
    setEmailError("")
    setResendMessage("")
    setIsError(false)

    if (!email || !email.includes("@")) {
      setEmailError("يرجى إدخال بريد إلكتروني صالح")
      return
    }

    try {
      setResendLoading(true)
      const msg = await resendVerificationEmail(email)
      setResendMessage(msg)
      setIsError(false)
    } catch (err: any) {
      const msg = err?.response?.data?.message || "فشل إرسال الرابط. حاول مرة أخرى"
      setResendMessage(msg)
      setIsError(true)
    } finally {
      setResendLoading(false)
    }
  }

  if (tokenValid === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-500 mb-4" />
            <CardTitle>جاري التحقق من البريد...</CardTitle>
            <CardDescription>يرجى الانتظار لحظة</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (tokenValid === true) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
            <CardTitle className="text-2xl text-green-600">تم التحقق بنجاح</CardTitle>
            <CardDescription>تم التحقق من بريدك الإلكتروني. سيتم توجيهك إلى لوحة التحكم خلال ثوانٍ...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
          <CardTitle className="text-2xl text-red-600">فشل التحقق</CardTitle>
          <CardDescription>الرابط غير صالح أو منتهي الصلاحية. أدخل بريدك لإرسال رابط جديد.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {resendMessage && (
            <div
              className={`text-sm font-medium text-center ${
                isError ? "text-destructive" : "text-green-600"
              }`}
            >
              {resendMessage}
            </div>
          )}

          <div className="space-y-2">
            <Input
              type="email"
              placeholder="أدخل بريدك الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={resendLoading}
            />
            {emailError && (
              <div className="text-red-600 text-xs">{emailError}</div>
            )}
          </div>

          <Button
            onClick={handleResendEmail}
            className="w-full"
            disabled={resendLoading}
          >
            {resendLoading ? "جاري الإرسال..." : "إرسال رابط جديد"}
          </Button>

          <Link to="/login">
            <Button variant="outline" className="w-full">
              العودة إلى تسجيل الدخول
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
