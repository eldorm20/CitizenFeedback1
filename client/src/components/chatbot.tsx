import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Bot, User, Lightbulb, FileText, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
}

interface ChatbotProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Chatbot({ open, onOpenChange }: ChatbotProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open && messages.length === 0) {
      // Initial greeting
      const greeting: Message = {
        id: "welcome",
        content: `Привет, ${user?.firstName || "пользователь"}! 👋 Я ваш виртуальный помощник платформы Muloqot Plus. Чем могу помочь?`,
        isBot: true,
        timestamp: new Date(),
        suggestions: [
          "Как подать жалобу?",
          "Как отследить статус обращения?",
          "Какие категории доступны?",
          "Как связаться с властями?"
        ]
      };
      setMessages([greeting]);
    }
  }, [open, user?.firstName]);

  const generateBotResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    let response = "";
    let suggestions: string[] = [];

    // Платформа-специфичные ответы
    if (lowerMessage.includes("подать") || lowerMessage.includes("жалоб") || lowerMessage.includes("обращение")) {
      response = "Для подачи обращения:\n\n1. Нажмите кнопку 'Создать обращение' на главной странице\n2. Выберите категорию проблемы\n3. Укажите район\n4. Опишите проблему подробно\n5. Приложите фотографии (если есть)\n6. Отправьте обращение\n\nВаше обращение автоматически получит номер для отслеживания.";
      suggestions = ["Какие категории есть?", "Как прикрепить фото?", "Сколько времени рассмотрение?"];
    }
    else if (lowerMessage.includes("статус") || lowerMessage.includes("отследить") || lowerMessage.includes("проверить")) {
      response = "Отслеживание статуса обращения:\n\n• Зайдите в раздел 'Мои обращения'\n• Найдите ваше обращение по номеру или названию\n• Статусы означают:\n  - 'Новая' - принято к рассмотрению\n  - 'В работе' - передано в соответствующую службу\n  - 'Решено' - проблема устранена\n  - 'Отклонено' - не подлежит рассмотрению\n\nВы получите уведомления при изменении статуса.";
      suggestions = ["Почему отклонили?", "Как ускорить рассмотрение?", "Кто рассматривает?"];
    }
    else if (lowerMessage.includes("категор") || lowerMessage.includes("тип") || lowerMessage.includes("раздел")) {
      response = "Доступные категории обращений:\n\n🚗 Дороги - ямы, разметка, светофоры\n🏠 Коммунальные услуги - отопление, вода, газ\n🚌 Транспорт - остановки, расписание\n🛡️ Безопасность - освещение, охрана\n🌱 Экология - мусор, озеленение\n🏛️ Благоустройство - парки, тротуары\n📚 Образование - школы, детсады\n🏥 Здравоохранение - больницы, поликлиники";
      suggestions = ["Подать обращение", "Какой район выбрать?", "Требования к фото"];
    }
    else if (lowerMessage.includes("район") || lowerMessage.includes("где") || lowerMessage.includes("географ")) {
      response = "Доступные районы:\n\n• Юнусабадский\n• Мирзо-Улугбекский\n• Мирабадский\n• Алмазарский\n• Бектемирский\n• Чиланзарский\n• Хамзинский\n• Сергелийский\n• Сайрамский\n• Янгихаётский\n• Чартакский\n• Уктепинский\n\nВыберите район, где находится проблема. Это поможет направить обращение нужным службам.";
      suggestions = ["Мой район не указан", "Несколько районов", "Подать обращение"];
    }
    else if (lowerMessage.includes("фото") || lowerMessage.includes("изображен") || lowerMessage.includes("картинк")) {
      response = "Требования к фотографиям:\n\n✅ Форматы: JPG, PNG, WebP\n✅ Размер: до 10 МБ\n✅ Качество: четкое изображение проблемы\n\n💡 Советы:\n• Фотографируйте при хорошем освещении\n• Покажите масштаб проблемы\n• Включите ориентиры (дома, улицы)\n• Можно прикрепить до 5 фотографий";
      suggestions = ["Проблемы с загрузкой", "Подать без фото", "Видео можно?"];
    }
    else if (lowerMessage.includes("власт") || lowerMessage.includes("чиновник") || lowerMessage.includes("администрац")) {
      response = "Взаимодействие с властями через платформу:\n\n📋 Обращения автоматически направляются:\n• В районную администрацию\n• В профильные службы\n• К ответственным специалистам\n\n📞 Прямые контакты:\n• Единая справочная: 1080\n• Приемная хокима: указана для каждого района\n• Горячая линия ЖКХ: 1095\n\nОтветы приходят через платформу или по указанным контактам.";
      suggestions = ["Номера экстренных служб", "Как ускорить ответ?", "Жалоба на власти"];
    }
    else if (lowerMessage.includes("регистрац") || lowerMessage.includes("аккаунт") || lowerMessage.includes("вход")) {
      response = "Регистрация и вход в систему:\n\n🆕 Регистрация:\n• Укажите имя, фамилию, email\n• Придумайте надежный пароль\n• Подтвердите email\n\n🔐 Вход:\n• Используйте email или логин\n• Пароль можно восстановить\n\n⭐ Зарегистрированные пользователи могут:\n• Отслеживать обращения\n• Получать уведомления\n• Комментировать и голосовать";
      suggestions = ["Забыл пароль", "Изменить данные", "Удалить аккаунт"];
    }
    else if (lowerMessage.includes("время") || lowerMessage.includes("срок") || lowerMessage.includes("долго")) {
      response = "Сроки рассмотрения обращений:\n\n⏱️ Обычные обращения: 10-15 рабочих дней\n🚨 Экстренные случаи: 24-48 часов\n📋 Сложные вопросы: до 30 дней\n\n🔔 Уведомления приходят при:\n• Принятии к рассмотрению (сразу)\n• Передаче исполнителю (1-3 дня)\n• Изменении статуса\n• Получении ответа\n\nВы всегда можете отследить прогресс в личном кабинете.";
      suggestions = ["Ускорить рассмотрение", "Почему долго?", "Подать повторно"];
    }
    else if (lowerMessage.includes("помощ") || lowerMessage.includes("справк") || lowerMessage.includes("поддержк")) {
      response = "Служба поддержки Muloqot Plus:\n\n📧 Email: support@muloqotplus.uz\n📞 Телефон: +998 71 123-45-67\n⏰ Время работы: Пн-Пт 9:00-18:00\n\n💬 Онлайн-помощь:\n• Этот чат-бот (круглосуточно)\n• Раздел 'Часто задаваемые вопросы'\n• Инструкции на сайте\n\n🎯 Мы поможем с:\n• Техническими проблемами\n• Вопросами по использованию\n• Статусом обращений";
      suggestions = ["Техническая проблема", "Как пользоваться?", "Связаться с человеком"];
    }
    else if (lowerMessage.includes("приват") || lowerMessage.includes("данн") || lowerMessage.includes("безопасн")) {
      response = "Конфиденциальность и безопасность:\n\n🔒 Ваши данные защищены:\n• Шифрование всех передач\n• Безопасное хранение в базе\n• Доступ только авторизованным лицам\n\n📋 Мы используем данные для:\n• Обработки ваших обращений\n• Связи с вами по вопросам\n• Улучшения работы платформы\n\n❌ Мы НЕ передаем данные:\n• Третьим лицам без согласия\n• Для рекламных целей\n• За пределы необходимого";
      suggestions = ["Удалить данные", "Кто видит обращения?", "Анонимно подать"];
    }
    else if (lowerMessage.includes("мобиль") || lowerMessage.includes("телефон") || lowerMessage.includes("приложен")) {
      response = "Мобильная версия Muloqot Plus:\n\n📱 Доступ через браузер:\n• Адаптивный дизайн\n• Полный функционал\n• Работает на всех устройствах\n\n🚀 Мобильное приложение:\n• В разработке для Android/iOS\n• Планируется выпуск в 2025\n• Push-уведомления\n• Offline-режим\n\n💡 Пока используйте браузер - это удобно и быстро!";
      suggestions = ["Проблемы на телефоне", "Когда приложение?", "Системные требования"];
    }
    else {
      // Общие ответы
      const responses = [
        "Я понимаю ваш вопрос. Для получения подробной информации рекомендую обратиться в службу поддержки или изучить раздел помощи на сайте.",
        "Спасибо за вопрос! Если нужна дополнительная помощь, вы можете создать обращение или связаться с нашей службой поддержки.",
        "По этому вопросу лучше обратиться к специалистам. Создайте обращение в соответствующей категории, и вам обязательно помогут.",
        "Интересный вопрос! Для точного ответа рекомендую связаться со службой поддержки или использовать поиск по базе знаний."
      ];
      response = responses[Math.floor(Math.random() * responses.length)];
      suggestions = ["Служба поддержки", "Создать обращение", "Часто задаваемые вопросы"];
    }

    return {
      id: Date.now().toString(),
      content: response,
      isBot: true,
      timestamp: new Date(),
      suggestions
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = generateBotResponse(input);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96 h-[600px] glass-effect shadow-2xl">
        <CardHeader className="gradient-primary text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-6 h-6" />
              <div>
                <CardTitle className="text-lg">Помощник Muloqot</CardTitle>
                <p className="text-sm text-white/80">Онлайн • Готов помочь</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex flex-col h-[calc(600px-80px)]">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    message.isBot 
                      ? "bg-secondary text-secondary-foreground" 
                      : "gradient-primary text-white"
                  }`}>
                    <div className="flex items-start space-x-2">
                      <div className="flex-shrink-0">
                        {message.isBot ? (
                          <Bot className="w-4 h-4 mt-0.5" />
                        ) : (
                          <User className="w-4 h-4 mt-0.5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString('ru-RU', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {message.suggestions && (
                      <div className="mt-3 space-y-1">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="mr-1 mb-1 text-xs h-7"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-secondary-foreground rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Напишите ваш вопрос..."
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="flex-1"
              />
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || isTyping}
                className="gradient-primary text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge variant="outline" className="text-xs cursor-pointer" onClick={() => handleSuggestionClick("Как подать жалобу?")}>
                <Lightbulb className="w-3 h-3 mr-1" />
                Подача жалоб
              </Badge>
              <Badge variant="outline" className="text-xs cursor-pointer" onClick={() => handleSuggestionClick("Как отследить статус?")}>
                <FileText className="w-3 h-3 mr-1" />
                Статус обращения
              </Badge>
              <Badge variant="outline" className="text-xs cursor-pointer" onClick={() => handleSuggestionClick("Какие районы есть?")}>
                <MapPin className="w-3 h-3 mr-1" />
                Районы
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}