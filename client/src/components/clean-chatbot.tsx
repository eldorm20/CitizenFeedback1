import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/hooks/use-language";
import { 
  MessageSquare, 
  Bot, 
  User, 
  Send, 
  X,
  HelpCircle,
  Phone,
  Scale
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
}

interface CleanChatbotProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CleanChatbot({ open, onOpenChange }: CleanChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { t } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open && messages.length === 0) {
      // Add greeting message
      const greeting: Message = {
        id: "greeting",
        content: `Salom! Men YoriqnomAI - sizning raqamli yordamchingizman.

Qanday yordam bera olaman:
• Muammolarni to'g'ri yo'naltirish
• Mutaxassislar bilan bog'lash  
• Huquqiy maslahat berish
• Ariza topshirish jarayonida yordam

Muammoyingizni yozing, eng yaxshi yechimni topamiz!`,
        isBot: true,
        timestamp: new Date(),
        suggestions: ["Yo'l muammolari", "Kommunal xizmatlar", "Ekologiya", "Huquqiy yordam"]
      };
      setMessages([greeting]);
    }
  }, [open]);

  const generateResponse = async (userMessage: string): Promise<Message> => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Emergency detection
    if (lowerMessage.includes('favqulodda') || lowerMessage.includes('yong\'in') || lowerMessage.includes('odam halok')) {
      return {
        id: Date.now().toString(),
        content: `🚨 FAVQULODDA HOLAT

Zudlik bilan qo'ng'iroq qiling:
• 112 - Umumiy favqulodda xizmat
• 101 - Yong'in xizmati  
• 102 - Politsiya
• 103 - Tez tibbiy yordam

Agar xavf-xatar yo'q bo'lsa, ariza topshirishingiz mumkin.`,
        isBot: true,
        timestamp: new Date(),
        suggestions: ["112 ga qo'ng'iroq", "Ariza topshirish", "Boshqa yordam"]
      };
    }

    // Roads and infrastructure
    if (lowerMessage.includes('yo\'l') || lowerMessage.includes('asfalt') || lowerMessage.includes('chuqur')) {
      return {
        id: Date.now().toString(),
        content: `🛣️ YO'L VA INFRATUZILMA

Yo'l muammolari uchun:
• Aniq manzilni ko'rsating
• Foto/video ilova qiling
• Xavf darajasini baholang

Mutaxassis: Alisher Karimov
Telefon: +998 71 234-56-78
Ish vaqti: Dush-Juma 9:00-18:00

Ko'rib chiqish muddati: 3-7 kun`,
        isBot: true,
        timestamp: new Date(),
        suggestions: ["Mutaxassis bilan bog'lanish", "Ariza topshirish", "Foto yuklash"]
      };
    }

    // Utilities
    if (lowerMessage.includes('suv') || lowerMessage.includes('elektr') || lowerMessage.includes('gaz') || lowerMessage.includes('issiq')) {
      return {
        id: Date.now().toString(),
        content: `🏠 KOMMUNAL XIZMATLAR

Kommunal muammolar uchun:
• Aniq manzil va kvartira raqami
• Muammo vaqti va davomiyligi
• Oldingi murojaatlar haqida ma'lumot

Mutaxassis: Bakhtiyor Rahimov
Telefon: +998 71 345-67-89
Favqulodda: +998 71 345-67-90 (24/7)

Ko'rib chiqish: 24 soat ichida`,
        isBot: true,
        timestamp: new Date(),
        suggestions: ["Favqulodda xizmat", "Mutaxassis chaqirish", "Ariza yozish"]
      };
    }

    // Legal help
    if (lowerMessage.includes('huquq') || lowerMessage.includes('qonun') || lowerMessage.includes('shikoyat')) {
      return {
        id: Date.now().toString(),
        content: `⚖️ HUQUQIY YORDAM

Sizning huquqlaringiz:
• Murojaat qilish huquqi (Qonun №445)
• 15 kun ichida javob olish
• Qarshilik ko'rsatish (30 kun)
• Bepul yuridik yordam

Huquqiy xizmat: +998 71 200-00-00
Ish vaqti: Dush-Juma 9:00-17:00

Maslahat: Bepul va maxfiy`,
        isBot: true,
        timestamp: new Date(),
        suggestions: ["Bepul yurist", "Qonun matni", "Shikoyat tartibi"]
      };
    }

    // Default helpful response
    const responses = [
      `Savolingiz qabul qilindi!

Qaysi sohada yordam kerak:
🛣️ Yo'llar va transport
🏠 Kommunal xizmatlar  
🌱 Ekologiya masalalari
⚖️ Huquqiy maslahat
🚨 Favqulodda holatlar

Batafsil yozing, to'g'ri yo'naltiraman.`,
      `Muammoyingizni hal qilishga yordam beraman.

Kerakli ma'lumotlar:
• Muammo turi va joylashuvi
• Qachon paydo bo'lgani
• Oldingi murojaatlar
• Qo'shimcha hujjatlar

Ushbu ma'lumotlar bilan tezroq yordam bera olaman.`
    ];

    return {
      id: Date.now().toString(),
      content: responses[Math.floor(Math.random() * responses.length)],
      isBot: true,
      timestamp: new Date(),
      suggestions: ["Yo'l muammosi", "Kommunal ariza", "Huquqiy yordam", "Ekologiya"]
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

    // Simulate processing time
    setTimeout(async () => {
      const botResponse = await generateResponse(input);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600">
              <AvatarFallback className="text-white font-bold">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">YoriqnomAI</CardTitle>
              <p className="text-sm text-muted-foreground">AI Assistant • Online</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-4">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      message.isBot 
                        ? 'bg-muted text-muted-foreground' 
                        : 'bg-primary text-primary-foreground'
                    }`}>
                      <div className="flex items-start space-x-2">
                        {message.isBot && (
                          <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                          {message.suggestions && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="text-xs"
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
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
                  <div className="bg-muted rounded-lg p-3 flex items-center space-x-2">
                    <Bot className="h-4 w-4" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Muammoyingizni yozing..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!input.trim() || isTyping}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <HelpCircle className="h-3 w-3" />
              <span>24/7 Yordam</span>
            </div>
            <div className="flex items-center space-x-1">
              <Phone className="h-3 w-3" />
              <span>+998 71 123-45-67</span>
            </div>
            <div className="flex items-center space-x-1">
              <Scale className="h-3 w-3" />
              <span>Bepul maslahat</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}