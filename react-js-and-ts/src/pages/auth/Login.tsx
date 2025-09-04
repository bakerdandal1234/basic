"use client"

import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "../../context/AuthContext"
import { Button } from "../../components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../components/ui/dialog"
import Navbar from "../../components/Navbar"
import { ForgotPasswordForm } from "../../pages/auth/forgot-password"

// تعريف مخطط التحقق
const loginSchema = z.object({
    email: z.string().email({ message: "يرجى إدخال بريد إلكتروني صحيح" }),
    password: z.string().min(1, { message: "كلمة المرور مطلوبة" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const { login, loginError } = useAuth()
    const navigate = useNavigate()
    const [forgotPasswordOpen, setForgotPasswordOpen] = React.useState(false)

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (data: LoginFormValues) => {
        try {
            await login(data.email, data.password)
            navigate("/dashboard")
        } catch (error) {
            console.error("Login error:", error)
        }
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background p-4">
            {/* <div className="absolute top-4 right-4">
      <ThemeToggle />
    </div> */}
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">تسجيل الدخول</CardTitle>
                    <CardDescription className="text-center">أدخل بيانات حسابك للوصول إلى لوحة التحكم</CardDescription>
                    {loginError && <div className="text-destructive text-sm font-medium text-center">{loginError}</div>}

                    {/* <FormItem>
                        <FormMessage />
                    </FormItem> */}
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>البريد الإلكتروني</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="example@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel>كلمة المرور</FormLabel>
                                            <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="link" className="p-0 h-auto text-sm">
                                                        نسيت كلمة المرور؟
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>نسيت كلمة المرور</DialogTitle>
                                                        <DialogDescription>
                                                            أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <ForgotPasswordForm onSuccess={() => setForgotPasswordOpen(false)} />
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                        <FormControl>
                                            <Input type="password" placeholder="********" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />


                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                            </Button>
                        </form>
                    </Form>
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                أو سجل الدخول باستخدام
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" onClick={() => window.location.href = 'http://localhost:3000/auth/google'}>
                            Google
                        </Button>
                        <Button variant="outline" onClick={() => window.location.href = 'http://localhost:3000/auth/github'}>
                            GitHub
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        ليس لديك حساب؟{" "}
                        <Link to="/register" className="text-primary underline underline-offset-4 hover:text-primary/90">
                            إنشاء حساب
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}