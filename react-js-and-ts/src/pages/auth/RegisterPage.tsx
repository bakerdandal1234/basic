"use client"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "../../context/AuthContext"
import { Button } from "../../components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import Navbar from "../../components/Navbar"

// تعريف مخطط التحقق
const registerSchema = z
    .object({
        name: z.string().min(2, { message: "الاسم يجب أن يكون على الأقل حرفين" }),
        email: z.string().email({ message: "يرجى إدخال بريد إلكتروني صحيح" }),
        password: z.string().min(8, { message: "كلمة المرور يجب أن تكون على الأقل 8 أحرف" }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "كلمات المرور غير متطابقة",
        path: ["confirmPassword"],
    })

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const { register: registerUser, registerErrors } = useAuth()
    console.log(registerErrors)
    const navigate = useNavigate()

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    const onSubmit = async (data: RegisterFormValues) => {
        const success = await registerUser(data.email, data.password, data.name)

        if (success) {
            navigate("/login", {
                state: { message: "تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني." }
            })
        }
    }


    return (
        <div className="min-h-[calc(100vh-65px)] flex flex-col "><div className="flex-1 flex items-center justify-center bg-background p-4">
            {/* <div className="absolute top-4 right-4">
              <ThemeToggle />
          </div> */}

            <Card className="w-full max-w-md">

                <CardHeader>
                    <CardTitle className="text-2xl text-center">إنشاء حساب جديد</CardTitle>
                    <CardDescription className="text-center">أدخل بياناتك أدناه لإنشاء حساب جديد</CardDescription>
                    {registerErrors && registerErrors.general && <div className="text-destructive text-sm font-medium text-center">
                        {registerErrors.general}
                    </div>}
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>الاسم</FormLabel>
                                        <FormControl>
                                            <Input placeholder="أدخل اسمك" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        {registerErrors && registerErrors.name && <div className="text-destructive text-sm font-medium">
                                            {registerErrors.name}
                                        </div>}
                                    </FormItem>
                                )} />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>البريد الإلكتروني</FormLabel>
                                        <FormControl>
                                            <Input type="text" placeholder="example@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        {registerErrors && registerErrors.email && <div className="text-destructive text-sm font-medium">
                                            {registerErrors.email}
                                        </div>}

                                    </FormItem>
                                )} />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>كلمة المرور</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="********" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        {registerErrors && registerErrors.password && <div className="text-destructive text-sm font-medium">
                                            {registerErrors.password}
                                        </div>}
                                    </FormItem>
                                )} />

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
                                )} />

                            {/* {error && <div className="text-destructive text-sm font-medium">{error}</div>} */}

                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "جاري التسجيل..." : "تسجيل"}
                            </Button>
                        </form>
                    </Form>
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                أو سجل باستخدام
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
                        لديك حساب بالفعل؟{" "}
                        <Link to="/login" className="text-primary underline underline-offset-4 hover:text-primary/90">
                            تسجيل الدخول
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div></div>
    )
}