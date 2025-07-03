import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Bot, User, Lightbulb, FileText, MapPin, Sparkles, Search, Phone, Clock, Shield, AlertTriangle, Scale, Minimize2, Maximize2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
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

interface AdvancedChatbotProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Knowledge base for Uzbekistan government processes
const UZBEK_GOVERNMENT_KNOWLEDGE = {
  complaint_process: {
    steps: 'Подача жалобы → Регистрация → Рассмотрение → Решение',
    timeframe: 'Рассмотрение 15 дней согласно Закону РУз "Об обращениях граждан"',
    appeal_rights: 'Вы имеете право на обжалование решения в вышестоящий орган в течение 30 дней',
    document_requirements: 'Для подачи жалобы требуется: ФИО, адрес, суть проблемы, подпись'
  },
  legal_framework: 'ЗРУ-445 "Об обращениях граждан и юридических лиц"'
};

export function AdvancedChatbot({ open, onOpenChange }: AdvancedChatbotProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting: Message = {
        id: Date.now().toString(),
        content: `Привет, ${user?.firstName || 'дорогой гражданин'}! 👋\n\nЯ - виртуальный помощник YoriqnomAI для платформы Muloqot Plus. Помогу вам:\n\n🏛️ Направить жалобу в нужное ведомство\n📋 Разъяснить ваши права\n🚨 Обработать экстренные ситуации\n⚖️ Предоставить правовую информацию\n\nВведите /помощь для списка команд или просто опишите вашу проблему.`,
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

  const handleCommand = (command: string): Message => {
    switch (command) {
      case '/помощь':
        return {
          id: Date.now().toString(),
          content: `🆘 ДОСТУПНЫЕ КОМАНДЫ:\n\n🏛️ **/права** - Узнать ваши права\n🚨 **/экстренно** - Экстренные службы\n📞 **/контакты** - Государственные органы\n🔍 **/статус** - Проверить статус жалобы\n💡 **/инициатива** - Подать инициативу\n\n📝 **Также могу помочь с:**\n• Направлением жалоб в нужные ведомства\n• Разъяснением процедур\n• Правовыми консультациями\n• Экстренными ситуациями\n\nПросто опишите вашу проблему!`,
          isBot: true,
          timestamp: new Date(),
          suggestions: ["/права", "/экстренно", "/контакты", "Подать жалобу"],
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
        content: `🚨 Обнаружена экстренная ситуация!\n\n**Немедленно звоните: 112**\n\nЕсли ситуация не критична, опишите подробнее, и я помогу направить обращение в нужное ведомство.`,
        isBot: true,
        timestamp: new Date(),
        suggestions: ["Вызвать 112", "Не экстренно", "/экстренно"],
        category: 'emergency'
      };
    }
    
    // Route to appropriate government agency based on keywords
    if (lowerMessage.includes('дорог') || lowerMessage.includes('транспорт') || lowerMessage.includes('трафик')) {
      return {
        id: Date.now().toString(),
        content: `🛣️ Проблемы с дорогами и транспортом:\n\n📋 **Рекомендую обратиться:**\n• Хокимият района (местные дороги)\n• Министерство транспорта (магистрали)\n• ГИБДД (нарушения ПДД)\n\n📝 **Для подачи жалобы укажите:**\n• Точный адрес проблемы\n• Описание ситуации\n• Фото (если возможно)\n• Ваши контакты\n\n⏰ **Срок рассмотрения:** 15 дней`,
        isBot: true,
        timestamp: new Date(),
        suggestions: ["Подать жалобу", "Контакты хокимията", "Образец заявления"],
        category: 'routing'
      };
    }
    
    if (lowerMessage.includes('коммунальн') || lowerMessage.includes('свет') || 
        lowerMessage.includes('вода') || lowerMessage.includes('газ')) {
      return {
        id: Date.now().toString(),
        content: `🏠 Коммунальные услуги:\n\n🔧 **Куда обращаться:**\n• ЖЭК (текущие вопросы)\n• Махалла (местные проблемы)\n• Ресурсоснабжающие организации\n\n⚡ **Аварийные службы:**\n• Электричество: 104\n• Водоснабжение: 105\n• Газ: 104\n\n📞 **Горячая линия ЖКХ:** 1100\n\n📝 **Нужны документы:** счета, договоры, фото проблемы`,
        isBot: true,
        timestamp: new Date(),
        suggestions: ["Аварийная служба", "Подать жалобу", "Контакты ЖЭК"],
        category: 'routing'
      };
    }
    
    // General response for other inquiries
    return {
      id: Date.now().toString(),
      content: `Понял вашу проблему: "${userMessage}"\n\n🤔 **Рекомендую:**\n\n1️⃣ Уточните категорию проблемы\n2️⃣ Подготовьте документы\n3️⃣ Используйте команды для получения контактов\n\n💡 **Полезные команды:**\n• /права - ваши права\n• /контакты - куда обратиться\n• /помощь - список всех команд\n\nОпишите проблему подробнее, и я помогу выбрать правильное ведомство!`,
      isBot: true,
      timestamp: new Date(),
      suggestions: ["/права", "/контакты", "/помощь", "Подробнее"],
      category: 'general'
    };
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
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        height: isMinimized ? "auto" : "600px"
      }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-4 right-4 w-96 z-50"
      style={{ height: isMinimized ? "auto" : "600px" }}
    >
      <div className="glass-card h-full flex flex-col shadow-2xl border-2 border-purple-200/30 bg-gradient-to-br from-white/95 via-purple-50/90 to-blue-50/95 dark:from-gray-900/95 dark:via-purple-900/90 dark:to-blue-900/95 backdrop-blur-xl">
        <CardHeader className="p-4 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { repeat: Infinity, duration: 8, ease: "linear" },
                    scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                  }}
                >
                  <Sparkles className="h-6 w-6" />
                </motion.div>
                <motion.div 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">YoriqnomAI</CardTitle>
                <p className="text-xs text-purple-100">Умный помощник Muloqot Plus</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col flex-1"
            >
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full max-h-96 p-4">
                  <div className="space-y-4">
                    <AnimatePresence>
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`max-w-[80%] ${
                            message.isBot 
                              ? 'glass-card bg-gradient-to-r from-white/80 to-purple-50/80 dark:from-gray-800/80 dark:to-purple-900/80' 
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          } rounded-lg p-3 shadow-lg`}>
                            <div className="flex items-start gap-2 mb-2">
                              {message.isBot ? (
                                <div className="flex-shrink-0">
                                  {getCategoryIcon(message.category)}
                                </div>
                              ) : (
                                <User className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <div className="text-sm whitespace-pre-wrap">
                                  {message.content}
                                </div>
                                <div className={`text-xs mt-1 ${
                                  message.isBot ? 'text-gray-500' : 'text-purple-100'
                                }`}>
                                  {message.timestamp.toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                              </div>
                            </div>
                            
                            {message.suggestions && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {message.suggestions.map((suggestion, idx) => (
                                  <Button
                                    key={idx}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="text-xs h-6 px-2 bg-white/50 hover:bg-white/80 border-purple-200"
                                  >
                                    {suggestion}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                      
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-start"
                        >
                          <div className="glass-card bg-gradient-to-r from-white/80 to-purple-50/80 dark:from-gray-800/80 dark:to-purple-900/80 rounded-lg p-3 shadow-lg">
                            <div className="flex items-center gap-2">
                              <Bot className="h-4 w-4 text-purple-500" />
                              <div className="flex space-x-1">
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                                  className="w-2 h-2 bg-purple-500 rounded-full"
                                />
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                                  className="w-2 h-2 bg-purple-500 rounded-full"
                                />
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                                  className="w-2 h-2 bg-purple-500 rounded-full"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>
              </CardContent>
              
              <div className="p-4 border-t border-purple-200/30">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Опишите вашу проблему..."
                    className="flex-1 glass-input border-purple-200/50 focus:border-purple-400"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isTyping}
                    className="gradient-primary shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}