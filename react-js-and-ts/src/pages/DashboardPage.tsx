"use client"
import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { ThemeToggle } from "../components/theme/theme-toggle"
import { User, Mail, LogOut } from "lucide-react"

export default function DashboardPage() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
     

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                معلومات المستخدم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>الاسم:</strong> {user?.name}
                </p>
                <p>
                  <strong>البريد الإلكتروني:</strong> {user?.email}
                </p>
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  <span className={`text-sm ${user?.isVerified ? "text-green-600" : "text-red-600"}`}>
                    {user?.isVerified ? "تم التحقق من البريد الإلكتروني" : "لم يتم التحقق من البريد الإلكتروني"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الإحصائيات</CardTitle>
              <CardDescription>إحصائيات حسابك</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>عدد تسجيلات الدخول: 1</p>
                <p>آخر تسجيل دخول: اليوم</p>
                <p>حالة الحساب: نشط</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الإعدادات السريعة</CardTitle>
              <CardDescription>إعدادات الحساب</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  تغيير كلمة المرور
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  تحديث الملف الشخصي
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  إعدادات الخصوصية
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>مرحباً، {user?.name}!</CardTitle>
            <CardDescription>مرحباً بك في لوحة التحكم. يمكنك من هنا إدارة حسابك وإعداداتك.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              هذا مثال على لوحة تحكم بسيطة. يمكنك إضافة المزيد من الوظائف والمكونات حسب احتياجاتك.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}