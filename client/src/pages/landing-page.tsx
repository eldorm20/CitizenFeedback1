import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Shield, Zap, TrendingUp, MapPin, Calendar, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function LandingPage() {
  const { user } = useAuth();

  // Redirect authenticated users to their appropriate dashboard
  if (user) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        
        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between p-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Muloqot Plus</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth">
              <Button variant="ghost" className="hover-lift">Вход</Button>
            </Link>
            <Link href="/auth">
              <Button className="gradient-primary hover-lift text-white">Регистрация</Button>
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 px-6 lg:px-8 pb-20 pt-10">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-in-up">
              <span className="gradient-text">Голос граждан</span>
              <br />
              для лучшего города
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Платформа для подачи жалоб, обсуждения проблем и совместного решения вопросов городского развития
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Link href="/auth">
                <Button size="lg" className="gradient-primary hover-lift text-white">
                  Начать сейчас
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="hover-lift">
                Узнать больше
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 gradient-text">
            Возможности платформы
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: MessageSquare,
                title: "Подача жалоб",
                description: "Легко сообщайте о проблемах в вашем районе с фотографиями и подробным описанием"
              },
              {
                icon: Users,
                title: "Участие граждан",
                description: "Голосуйте, комментируйте и поддерживайте инициативы других жителей"
              },
              {
                icon: Shield,
                title: "Прозрачность",
                description: "Отслеживайте статус ваших обращений и получайте обратную связь от властей"
              },
              {
                icon: Zap,
                title: "Быстрое решение",
                description: "Ускоренная обработка заявок благодаря цифровой системе управления"
              },
              {
                icon: TrendingUp,
                title: "Аналитика",
                description: "Статистика и отчеты для понимания главных проблем города"
              },
              {
                icon: MapPin,
                title: "Геолокация",
                description: "Точное определение местоположения проблемы для быстрого реагирования"
              }
            ].map((feature, index) => (
              <Card key={index} className="glass-effect hover-lift">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "2,500+", label: "Обращений" },
              { number: "89%", label: "Решено" },
              { number: "12", label: "Районов" },
              { number: "4.8", label: "Рейтинг" }
            ].map((stat, index) => (
              <div key={index} className="animate-fade-in-up">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 gradient-text">
            Как это работает
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Сообщите о проблеме",
                description: "Загрузите фото, опишите проблему и укажите место"
              },
              {
                step: "02", 
                title: "Отслеживайте прогресс",
                description: "Получайте уведомления о статусе вашего обращения"
              },
              {
                step: "03",
                title: "Видите результат",
                description: "Проблема решается, город становится лучше"
              }
            ].map((step, index) => (
              <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-white text-xl font-bold mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-r from-primary to-accent">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Присоединяйтесь к активным гражданам
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Вместе мы можем сделать наш город лучше. Начните уже сегодня!
          </p>
          <Link href="/auth">
            <Button size="lg" variant="secondary" className="hover-lift">
              Создать аккаунт
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-8 border-t">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Muloqot Plus</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 Muloqot Plus. Все права защищены.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}