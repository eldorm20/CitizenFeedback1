import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { MessageSquare, Users, TrendingUp, CheckCircle } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Имя пользователя обязательно"),
  password: z.string().min(1, "Пароль обязателен"),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
  department: z.string().optional(),
  governmentId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === "government" && !data.governmentId) {
    return false;
  }
  if (data.role === "admin" && !data.governmentId) {
    return false;
  }
  return true;
}, {
  message: "Требуется служебный ID для регистрации как представитель власти или администратор",
  path: ["governmentId"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      role: "citizen",
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const onLogin = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
              Muloqot Plus
            </h1>
            <p className="text-muted-foreground mt-2">
              Платформа для граждан
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Добро пожаловать!</CardTitle>
                  <CardDescription>
                    Войдите в свой аккаунт, чтобы продолжить
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Имя пользователя</Label>
                      <Input
                        id="login-username"
                        placeholder="Введите имя пользователя"
                        className="glass-input"
                        {...loginForm.register("username")}
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-destructive">
                          {loginForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Пароль</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Введите пароль"
                        className="glass-input"
                        {...loginForm.register("password")}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-destructive">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full gradient-primary"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Вход..." : "Войти"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Создать аккаунт</CardTitle>
                  <CardDescription>
                    Зарегистрируйтесь, чтобы начать пользоваться платформой
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-firstName">Имя</Label>
                        <Input
                          id="register-firstName"
                          placeholder="Ваше имя"
                          className="glass-input"
                          {...registerForm.register("firstName")}
                        />
                        {registerForm.formState.errors.firstName && (
                          <p className="text-sm text-destructive">
                            {registerForm.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-lastName">Фамилия</Label>
                        <Input
                          id="register-lastName"
                          placeholder="Ваша фамилия"
                          className="glass-input"
                          {...registerForm.register("lastName")}
                        />
                        {registerForm.formState.errors.lastName && (
                          <p className="text-sm text-destructive">
                            {registerForm.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-username">Имя пользователя</Label>
                      <Input
                        id="register-username"
                        placeholder="Выберите имя пользователя"
                        className="glass-input"
                        {...registerForm.register("username")}
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your@email.com"
                        className="glass-input"
                        {...registerForm.register("email")}
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Пароль</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Создайте пароль"
                        className="glass-input"
                        {...registerForm.register("password")}
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-role">Тип пользователя</Label>
                      <Select 
                        defaultValue="citizen" 
                        onValueChange={(value) => registerForm.setValue("role", value)}
                      >
                        <SelectTrigger className="glass-input">
                          <SelectValue placeholder="Выберите тип пользователя" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="citizen">Гражданин</SelectItem>
                          <SelectItem value="government">Представитель власти</SelectItem>
                          <SelectItem value="admin">Администратор</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(registerForm.watch("role") === "government" || registerForm.watch("role") === "admin") && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="register-governmentId">
                            {registerForm.watch("role") === "admin" ? "Административный ID" : "Служебный ID"}
                          </Label>
                          <Input
                            id="register-governmentId"
                            placeholder={
                              registerForm.watch("role") === "admin" 
                                ? "Введите административный ID" 
                                : "Введите служебный ID"
                            }
                            className="glass-input"
                            {...registerForm.register("governmentId")}
                          />
                          {registerForm.formState.errors.governmentId && (
                            <p className="text-sm text-destructive">
                              {registerForm.formState.errors.governmentId.message}
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="register-department">
                            {registerForm.watch("role") === "admin" ? "Административная единица" : "Ведомство/Отдел"}
                          </Label>
                          <Input
                            id="register-department"
                            placeholder={
                              registerForm.watch("role") === "admin"
                                ? "Например: Министерство цифрового развития"
                                : "Например: Хокимият Юнусабадского района"
                            }
                            className="glass-input"
                            {...registerForm.register("department")}
                          />
                        </div>
                        
                        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            ⚠️ {registerForm.watch("role") === "admin" 
                              ? "Административные аккаунты проходят строгую верификацию" 
                              : "Аккаунты представителей власти проходят верификацию"} в соответствии с требованиями Республики Узбекистан
                          </p>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="register-confirmPassword">Подтверждение пароля</Label>
                      <Input
                        id="register-confirmPassword"
                        type="password"
                        placeholder="Повторите пароль"
                        className="glass-input"
                        {...registerForm.register("confirmPassword")}
                      />
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full gradient-secondary"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Регистрация..." : "Зарегистрироваться"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Side - Hero */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 dark:from-blue-800 dark:via-blue-900 dark:to-emerald-800 text-white p-12">
        <div className="max-w-md text-center">
          <h2 className="text-4xl font-bold mb-6">
            Присоединяйтесь к сообществу активных граждан
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Помогайте решать проблемы вашего города вместе с тысячами неравнодушных людей
          </p>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Активное сообщество</div>
                <div className="text-sm opacity-80">Тысячи пользователей уже с нами</div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Реальные результаты</div>
                <div className="text-sm opacity-80">Сотни решенных проблем</div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Прозрачность</div>
                <div className="text-sm opacity-80">Отслеживайте статус ваших обращений</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
