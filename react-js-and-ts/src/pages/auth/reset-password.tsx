"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "../../components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form"
import { Input } from "../../components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { ThemeToggle } from "../../components/theme/theme-toggle"
import { useAuth } from "../../context/AuthContext"

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, { message: "كلمة المرور يجب أن تكون على الأقل 8 أحرف" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const { resetPassword, verifyResetPasswordToken } = useAuth()
  const navigate = useNavigate()
  const { token } = useParams()
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [localError, setLocalError] = useState("")

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  // التحقق من صحة التوكن
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setTokenValid(false)
        return
      }
      try {
        const isValid = await verifyResetPasswordToken(token)
        setTokenValid(isValid)
      } catch {
        setTokenValid(false)
      }
    }

    checkToken()
  }, [token, verifyResetPasswordToken])

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) return

    setLocalError("") // مسح أي رسالة خطأ سابقة

    try {
      await resetPassword(token, data.password)
      navigate("/login", {
        state: { message: "تم تحديث كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن." },
      })
    } catch (err: any) {
      // استخراج رسالة الخطأ من الخادم أو عرض رسالة عامة
      setLocalError(err?.response?.data?.message || "حدث خطأ أثناء تحديث كلمة المرور.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">إعادة تعيين كلمة المرور</CardTitle>
          <CardDescription className="text-center">
            {tokenValid === null && "جاري التحقق من الرابط..."}
            {tokenValid === false && "الرابط غير صالح أو منتهي الصلاحية."}
            {tokenValid === true && "أدخل كلمة المرور الجديدة أدناه"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {tokenValid === null && <p className="text-center py-4">جاري التحميل...</p>}

          {tokenValid === false && (
            <div className="space-y-4">
              <p className="text-destructive text-sm font-medium text-center">
                هذا الرابط غير صالح أو منتهي. يرجى طلب رابط جديد.
              </p>
              <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>
                العودة إلى تسجيل الدخول
              </Button>
            </div>
          )}

          {tokenValid === true && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>كلمة المرور الجديدة</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تأكيد كلمة المرور</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {localError && (
                  <p className="text-destructive text-sm font-medium text-center">
                    {localError}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "جاري التحديث..." : "تحديث كلمة المرور"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
