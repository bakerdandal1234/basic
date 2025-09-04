
import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "../../context/AuthContext"
import { Button } from "../../components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form"
import { Input } from "../../components/ui/input"
import { useNavigate } from "react-router-dom"
// تعريف مخطط التحقق
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "يرجى إدخال بريد إلكتروني صحيح" }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

interface ForgotPasswordFormProps {
  onSuccess: () => void
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const { forgotPassword, error } = useAuth()
  const [success, setSuccess] = React.useState(false)
  const navigate = useNavigate()
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      await forgotPassword(data.email)
      setSuccess(true)      // بعد ثانيتين نخبر الأبّ بالنجاح (مثلاً لإغلاق الـ Dialog)
      setTimeout(() => {
        onSuccess()
        navigate("/login") // إعادة التوجيه إلى صفحة تسجيل الدخول
      }, 6000)
    } catch (error) {
      console.error("Forgot password error:", error)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="text-green-600 font-medium">تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني</div>
        <p className="text-sm text-muted-foreground">
          يرجى التحقق من بريدك الإلكتروني واتباع التعليمات لإعادة تعيين كلمة المرور.
        </p>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>البريد الإلكتروني</FormLabel>
              <FormControl>
                <Input type="text" placeholder="example@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <div className="text-destructive text-sm font-medium">{error}</div>}

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
        </Button>
      </form>
    </Form>
  )
}