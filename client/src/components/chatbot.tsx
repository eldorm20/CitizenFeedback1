import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Bot, User, Lightbulb, FileText, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";

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
  const { t, language } = useLanguage();
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

    // Платформа-специфичные ответы (короткие и четкие)
    if (lowerMessage.includes("подать") || lowerMessage.includes("жалоб") || lowerMessage.includes("обращение")) {
      response = "Подача обращения:\n1. 'Создать обращение' на главной\n2. Выберите категорию и район\n3. Опишите проблему + фото\n4. Отправьте - получите номер отслеживания";
      suggestions = ["Какие категории?", "Прикрепить фото", "Сроки рассмотрения"];
    }
    else if (lowerMessage.includes("статус") || lowerMessage.includes("отследить") || lowerMessage.includes("проверить")) {
      response = "Отслеживание статуса:\n• 'Мои обращения' → найдите по номеру\n• Статусы: Новая → В работе → Решено\n• Уведомления приходят автоматически";
      suggestions = ["Почему отклонили?", "Как ускорить?", "Кто рассматривает?"];
    }
    else if (lowerMessage.includes("категор") || lowerMessage.includes("тип") || lowerMessage.includes("раздел")) {
      response = "Категории обращений:\n🚗 Дороги  🏠 ЖКХ  🚌 Транспорт\n🛡️ Безопасность  🌱 Экология\n🏛️ Благоустройство  📚 Образование  🏥 Здравоохранение";
      suggestions = ["Подать обращение", "Выбрать район", "Фото требования"];
    }
    else if (lowerMessage.includes("район") || lowerMessage.includes("где") || lowerMessage.includes("географ")) {
      response = "Районы Ташкента:\nЮнусабадский, Мирзо-Улугбекский, Мирабадский, Алмазарский, Бектемирский, Чиланзарский, Хамзинский, Сергелийский, Сайрамский, Янгихаётский, Чартакский, Уктепинский";
      suggestions = ["Район не указан", "Несколько районов", "Подать обращение"];
    }
    else if (lowerMessage.includes("фото") || lowerMessage.includes("изображен") || lowerMessage.includes("картинк")) {
      response = "Требования к фото:\n✅ JPG, PNG, WebP до 10 МБ\n✅ Четкое изображение проблемы\n💡 Хорошее освещение, ориентиры, до 5 фото";
      suggestions = ["Проблемы загрузки", "Без фото можно?", "Видео принимается?"];
    }
    else if (lowerMessage.includes("власт") || lowerMessage.includes("чиновник") || lowerMessage.includes("администрац")) {
      response = "Контакты властей:\n📋 Автонаправление в нужную службу\n📞 Справочная: 1080, ЖКХ: 1095\n💬 Ответы через платформу";
      suggestions = ["Экстренные службы", "Ускорить ответ", "Жалоба на власти"];
    }
    else if (lowerMessage.includes("регистрац") || lowerMessage.includes("аккаунт") || lowerMessage.includes("вход")) {
      response = "Регистрация:\n• Имя, email, пароль → подтверждение\n• Вход по email/логину\n⭐ Отслеживание, уведомления, голосование";
      suggestions = ["Забыл пароль", "Изменить данные", "Удалить аккаунт"];
    }
    else if (lowerMessage.includes("время") || lowerMessage.includes("срок") || lowerMessage.includes("долго")) {
      response = "Сроки рассмотрения:\n⏱️ Обычные: 10-15 дней\n🚨 Экстренные: 24-48 часов\n📋 Сложные: до 30 дней";
      suggestions = ["Ускорить", "Почему долго?", "Подать повторно"];
    }
    else if (lowerMessage.includes("помощ") || lowerMessage.includes("справк") || lowerMessage.includes("поддержк")) {
      response = "Поддержка:\n📧 support@muloqotplus.uz\n📞 +998 71 123-45-67\n⏰ Пн-Пт 9:00-18:00\n💬 Чат-бот 24/7";
      suggestions = ["Техпроблема", "Как пользоваться?", "Живой человек"];
    }
    else if (lowerMessage.includes("приват") || lowerMessage.includes("данн") || lowerMessage.includes("безопасн")) {
      response = "Безопасность:\n🔒 Шифрование + защищенное хранение\n📋 Данные только для обработки обращений\n❌ Не передаем третьим лицам";
      suggestions = ["Удалить данные", "Кто видит?", "Анонимно"];
    }
    else if (lowerMessage.includes("мобиль") || lowerMessage.includes("телефон") || lowerMessage.includes("приложен")) {
      response = "Мобильная версия:\n📱 Полный функционал в браузере\n🚀 Приложение планируется в 2025\n💡 Используйте браузер - удобно!";
      suggestions = ["Проблемы на телефоне", "Когда приложение?", "Требования"];
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
                  <div className={`max-w-[80%] rounded-lg p-3 break-words ${
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