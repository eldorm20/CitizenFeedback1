import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { 
  MessageSquare, 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  Command,
  HelpCircle,
  AlertTriangle,
  Scale,
  Phone,
  FileText,
  Clock,
  CheckCircle,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
  commands?: string[];
  isTyping?: boolean;
  category?: 'general' | 'legal' | 'emergency' | 'routing';
}

interface ModernChatbotProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UZBEK_GOVERNMENT_KNOWLEDGE = {
  agencies: {
    'махалла': {
      name: 'Махаллинский комитет',
      responsibilities: ['Коммунальные услуги', 'Локальные дорожные работы', 'Санитария района'],
      contact: '+998 (71) 123-45-67',
      hours: '9:00-18:00',
      competence: 'Локальные проблемы района'
    },
    'хокимият': {
      name: 'Хокимият района',
      responsibilities: ['Крупные инфраструктурные проекты', 'Транспортные вопросы', 'Экология'],
      contact: '+998 (71) 234-56-78',
      hours: '8:30-17:30',
      competence: 'Районные проблемы'
    },
    'министерство': {
      name: 'Профильное министерство',
      responsibilities: ['Системные проблемы', 'Политика в области', 'Крупные нарушения'],
      contact: '+998 (71) 345-67-89',
      hours: '9:00-17:00',
      competence: 'Системные и крупные вопросы'
    }
  },
  procedures: {
    complaint_process: 'Жалоба рассматривается в течение 15 дней согласно Закону РУз "Об обращениях граждан"',
    appeal_rights: 'Вы имеете право на обжалование решения в вышестоящий орган в течение 30 дней',
    document_requirements: 'Для подачи жалобы требуется: ФИО, адрес, суть проблемы, подпись'
  },
  legal_framework: 'ЗРУ-445 "Об обращениях граждан и юридических лиц"'
};

export function ModernChatbot({ open, onOpenChange }: ModernChatbotProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting: Message = {
        id: Date.now().toString(),
        content: `Привет, ${user?.firstName || 'дорогой гражданин'}! 👋\n\nЯ - виртуальный помощник MuxlisaAI для платформы Muloqot Plus. Помогу вам:\n\n🏛️ Направить жалобу в нужное ведомство\n📋 Разъяснить ваши права\n🚨 Обработать экстренные ситуации\n⚖️ Предоставить правовую информацию\n\nВведите /помощь для списка команд или просто опишите вашу проблему.`,
        isBot: true,
        timestamp: new Date(),
        suggestions: [
          "Проблема с дорогами",
          "Коммунальные услуги", 
          "Экстренная ситуация",
          "Мои права",
          "/помощь"
        ],
        commands: ["/помощь", "/экстренно", "/права", "/контакты"],
        category: 'general'
      };
      setMessages([greeting]);
    }
  }, [open, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateBotResponse = async (userMessage: string): Promise<Message> => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Command handling
    if (lowerMessage.startsWith('/')) {
      return handleCommand(lowerMessage);
    }
    
    // Emergency detection
    if (lowerMessage.includes('экстренно') || lowerMessage.includes('авария') || 
        lowerMessage.includes('опасность') || lowerMessage.includes('пожар')) {
      return {
        id: Date.now().toString(),
        content: `🚨 ЭКСТРЕННАЯ СИТУАЦИЯ ОБНАРУЖЕНА!\n\nНемедленно обратитесь:\n• Экстренные службы: 112\n• МЧС: 101\n• Полиция: 102\n• Скорая помощь: 103\n\nЕсли ситуация не критическая, опишите проблему подробнее для направления в соответствующее ведомство.`,
        isBot: true,
        timestamp: new Date(),
        suggestions: ["Не экстренно, продолжить", "Связаться с 112"],
        category: 'emergency'
      };
    }
    
    // Government routing intelligence
    if (lowerMessage.includes('дорог') || lowerMessage.includes('ям') || lowerMessage.includes('асфальт')) {
      const agency = UZBEK_GOVERNMENT_KNOWLEDGE.agencies.хокимият;
      return {
        id: Date.now().toString(),
        content: `🛣️ Проблема с дорогами - это компетенция **${agency.name}**\n\n📋 Ваша жалоба будет направлена:\n• Контакт: ${agency.contact}\n• Время работы: ${agency.hours}\n• Срок рассмотрения: 15 дней\n\nДля более точного направления укажите:\n• Точный адрес проблемы\n• Характер повреждения\n• Степень опасности`,
        isBot: true,
        timestamp: new Date(),
        suggestions: ["Создать жалобу", "Нужна помощь с адресом", "Другая проблема"],
        category: 'routing'
      };
    }
    
    if (lowerMessage.includes('жкх') || lowerMessage.includes('вода') || lowerMessage.includes('канализация') || 
        lowerMessage.includes('отопление') || lowerMessage.includes('свет')) {
      const agency = UZBEK_GOVERNMENT_KNOWLEDGE.agencies.махалла;
      return {
        id: Date.now().toString(),
        content: `🏠 Вопросы ЖКХ решает **${agency.name}**\n\n📋 Рекомендуемые действия:\n• Обратитесь в махаллу: ${agency.contact}\n• Время работы: ${agency.hours}\n• Если нет результата - направим в хокимият\n\nДля эффективного решения укажите:\n• Адрес проблемы\n• Длительность проблемы\n• Предыдущие обращения`,
        isBot: true,
        timestamp: new Date(),
        suggestions: ["Подать жалобу", "Контакты махаллы", "Эскалировать в хокимият"],
        category: 'routing'
      };
    }
    
    if (lowerMessage.includes('прав') || lowerMessage.includes('закон') || lowerMessage.includes('обжалование')) {
      return {
        id: Date.now().toString(),
        content: `⚖️ ВАШИ ПРАВА КАК ГРАЖДАНИНА:\n\n📖 Согласно ${UZBEK_GOVERNMENT_KNOWLEDGE.legal_framework}:\n\n✅ Право на обращение в любой государственный орган\n✅ Обязательное рассмотрение в течение 15 дней\n✅ Получение письменного ответа\n✅ Обжалование решения в вышестоящий орган\n✅ Компенсация при доказанном ущербе\n\n🔄 Процедура обжалования:\n• Подача в вышестоящий орган в течение 30 дней\n• Приложение копий документов\n• Обоснование несогласия`,
        isBot: true,
        timestamp: new Date(),
        suggestions: ["Как обжаловать", "Образец заявления", "Сроки рассмотрения"],
        category: 'legal'
      };
    }
    
    // General intelligent response
    const responses = [
      `Понял вашу проблему! 🤔\n\nДля наиболее эффективного решения помогите мне:\n• Опишите проблему подробнее\n• Укажите точный адрес\n• Расскажите о предыдущих обращениях\n\nЭто поможет направить жалобу в правильное ведомство и ускорить решение.`,
      `Спасибо за обращение! 📝\n\nЧтобы дать точные рекомендации, нужно больше информации:\n• В какой сфере проблема? (дороги, ЖКХ, транспорт, экология)\n• Насколько срочно требуется решение?\n• Есть ли документы или фото проблемы?\n\nИспользуйте команду /помощь для полного списка возможностей.`
    ];
    
    return {
      id: Date.now().toString(),
      content: responses[Math.floor(Math.random() * responses.length)],
      isBot: true,
      timestamp: new Date(),
      suggestions: ["Дороги", "ЖКХ", "Транспорт", "Экология", "/помощь"],
      category: 'general'
    };
  };

  const handleCommand = (command: string): Message => {
    switch (command) {
      case '/помощь':
      case '/help':
        return {
          id: Date.now().toString(),
          content: `🤖 КОМАНДЫ MUXLISAAI:\n\n🔧 **Основные команды:**\n/помощь - это меню\n/экстренно - экстренные службы\n/права - ваши права\n/контакты - все контакты ведомств\n/статус - проверить статус жалобы\n\n📋 **Категории проблем:**\n• Дороги и транспорт\n• ЖКХ и коммунальные услуги\n• Экология и природа\n• Безопасность\n• Образование и здравоохранение\n\n💡 **Умные возможности:**\n• Автоматическое определение ведомства\n• Правовые консультации\n• Отслеживание статуса обращений\n• Эскалация в вышестоящие органы`,
          isBot: true,
          timestamp: new Date(),
          suggestions: ["/экстренно", "/права", "/контакты", "Создать жалобу"],
          commands: ["/экстренно", "/права", "/контакты", "/статус"],
          category: 'general'
        };
        
      case '/экстренно':
        return {
          id: Date.now().toString(),
          content: `🚨 ЭКСТРЕННЫЕ СЛУЖБЫ УЗБЕКИСТАНА:\n\n🆘 **Единая служба экстренного вызова: 112**\n\n🔥 Пожарная служба: 101\n👮 Полиция: 102  \n🚑 Скорая помощь: 103\n⚡ Аварийная газовая служба: 104\n🚰 Аварийная водопроводная служба: 105\n\n⚠️ **При звонке сообщите:**\n• Что произошло\n• Точный адрес\n• Количество пострадавших\n• Ваше имя и номер телефона\n\n🏥 **Телефон доверия:** 1050`,
          isBot: true,
          timestamp: new Date(),
          suggestions: ["Вызвать 112", "Не экстренно", "Другая проблема"],
          category: 'emergency'
        };
        
      case '/права':
        return {
          id: Date.now().toString(),
          content: `⚖️ ВАШИ ПРАВА (${UZBEK_GOVERNMENT_KNOWLEDGE.legal_framework}):\n\n📝 **Право на обращение:**\n• В любой госорган\n• В письменной и устной форме\n• Лично или через представителя\n• Коллективно\n\n⏰ **Сроки рассмотрения:**\n• Обычные обращения: 15 дней\n• Сложные вопросы: до 30 дней\n• Экстренные: немедленно\n\n🔄 **Право на обжалование:**\n• В вышестоящий орган: 30 дней\n• В суд: 3 месяца\n• На бездействие: в любое время\n\n💰 **Компенсация ущерба при доказанном нарушении прав**`,
          isBot: true,
          timestamp: new Date(),
          suggestions: ["Как обжаловать", "Образцы документов", "Сроки"],
          category: 'legal'
        };
        
      case '/контакты':
        return {
          id: Date.now().toString(),
          content: `📞 КОНТАКТЫ ГОСУДАРСТВЕННЫХ ОРГАНОВ:\n\n🏛️ **Махаллинский комитет:**\n• Телефон: +998 (71) 123-45-67\n• Время: 9:00-18:00\n• Компетенция: ЖКХ, санитария\n\n🏢 **Хокимият района:**\n• Телефон: +998 (71) 234-56-78\n• Время: 8:30-17:30\n• Компетенция: транспорт, дороги\n\n🏛️ **Министерства:**\n• Телефон: +998 (71) 345-67-89\n• Время: 9:00-17:00\n• Компетенция: системные вопросы\n\n📧 **Единый портал:** my.gov.uz\n☎️ **Горячая линия:** 1100`,
          isBot: true,
          timestamp: new Date(),
          suggestions: ["Махалла", "Хокимият", "Министерство", "my.gov.uz"],
          category: 'general'
        };
        
      default:
        return {
          id: Date.now().toString(),
          content: `❓ Команда "${command}" не найдена.\n\nИспользуйте /помощь для списка доступных команд.`,
          isBot: true,
          timestamp: new Date(),
          suggestions: ["/помощь", "/экстренно", "/права", "/контакты"],
          category: 'general'
        };
    }
  };

  const handleSendMessage = async () => {
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
    setTimeout(async () => {
      const botResponse = await generateBotResponse(input);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'emergency': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'legal': return <Scale className="h-4 w-4 text-blue-500" />;
      case 'routing': return <FileText className="h-4 w-4 text-green-500" />;
      default: return <Bot className="h-4 w-4 text-purple-500" />;
    }
  };

  if (!open) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 w-96 h-[600px] z-50"
    >
      <Card className="h-full flex flex-col shadow-2xl border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-900">
        <CardHeader className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sparkles className="h-6 w-6" />
                <motion.div 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">MuxlisaAI</CardTitle>
                <p className="text-xs text-purple-100">Умный помощник Muloqot Plus</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[85%] ${message.isBot ? 'bg-gray-100 dark:bg-gray-800' : 'bg-purple-600 text-white'} rounded-lg p-3 shadow-md`}>
                      <div className="flex items-start gap-2">
                        {message.isBot && (
                          <div className="flex-shrink-0 mt-1">
                            {getCategoryIcon(message.category)}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="whitespace-pre-wrap text-sm">
                            {message.content}
                          </div>
                          
                          {message.suggestions && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-6 px-2 border-purple-200 hover:bg-purple-100"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                            {message.isBot && (
                              <div className="flex items-center gap-1">
                                {message.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {message.category}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 shadow-md">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-purple-500" />
                      <div className="flex space-x-1">
                        <motion.div
                          className="w-2 h-2 bg-purple-500 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-purple-500 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-purple-500 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <Separator />
          
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Опишите вашу проблему или введите команду..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 border-purple-200 focus:border-purple-400"
                disabled={isTyping}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!input.trim() || isTyping}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Command className="h-3 w-3" />
                <span>Команды: /помощь /экстренно /права</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Онлайн</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}