import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
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
  X,
  UserCheck,
  Zap,
  Globe,
  Shield,
  Briefcase,
  Heart,
  Star,
  ThumbsUp,
  Copy,
  Share2,
  ExternalLink
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
  category?: 'general' | 'legal' | 'emergency' | 'routing' | 'specialist';
  specialistInfo?: {
    name: string;
    role: string;
    department: string;
    contact: string;
    availability: string;
  };
  attachments?: Array<{
    type: 'document' | 'link' | 'contact';
    title: string;
    url?: string;
    description?: string;
  }>;
  rating?: number;
}

interface EnhancedChatbotProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Advanced Knowledge Base with Government Integration
const ENHANCED_KNOWLEDGE_BASE = {
  categories: {
    'roads': {
      keywords: ['дорог', 'ям', 'асфальт', 'светофор', 'разметка', 'знак', 'переход'],
      agency: 'Комитет дорожно-транспортной инфраструктуры',
      specialists: [
        { name: 'Алишер Каримов', role: 'Главный инженер', department: 'Отдел дорожного строительства', contact: '+998 71 234-56-78', availability: 'Пн-Пт 9:00-18:00' },
        { name: 'Фарида Усманова', role: 'Диспетчер', department: 'Служба экстренного ремонта', contact: '+998 71 234-56-79', availability: '24/7' }
      ],
      solutions: {
        'ямы': 'Сфотографируйте повреждение, укажите точный адрес. Срок устранения: 3-7 дней',
        'светофор': 'Обратитесь в диспетчерскую службу: +998 71 234-56-80. Срок устранения: 24 часа',
        'разметка': 'Заявка рассматривается в течение 10 дней, обновление разметки проводится весной/осенью'
      }
    },
    'utilities': {
      keywords: ['жкх', 'вода', 'канализация', 'отопление', 'свет', 'газ', 'мусор'],
      agency: 'Коммунальные службы района',
      specialists: [
        { name: 'Бахтиёр Рахимов', role: 'Главный инженер ЖКХ', department: 'Управление ЖКХ', contact: '+998 71 345-67-89', availability: 'Пн-Пт 8:30-17:30' },
        { name: 'Нигора Садикова', role: 'Диспетчер аварийной службы', department: 'Аварийная служба', contact: '+998 71 345-67-90', availability: '24/7' }
      ],
      solutions: {
        'вода': 'Отключение воды: обратитесь в аварийную службу. Плановые работы объявляются за 24 часа',
        'отопление': 'Сезон отопления: 15 октября - 15 апреля. Температура в квартире не менее +18°C',
        'мусор': 'График вывоза: ежедневно 6:00-8:00. Жалобы на нарушения принимаются круглосуточно'
      }
    },
    'environment': {
      keywords: ['экология', 'загрязнение', 'воздух', 'шум', 'зелен', 'дерев', 'парк'],
      agency: 'Комитет экологии и природопользования',
      specialists: [
        { name: 'Дилшод Турсунов', role: 'Эколог', department: 'Отдел мониторинга', contact: '+998 71 456-78-90', availability: 'Пн-Пт 9:00-17:00' }
      ]
    },
    'safety': {
      keywords: ['безопасность', 'освещение', 'преступность', 'наркотики', 'хулиганство'],
      agency: 'УВД района',
      specialists: [
        { name: 'Равшан Абдуллаев', role: 'Участковый', department: '12-й участок', contact: '+998 71 567-89-01', availability: 'Пн-Сб 8:00-20:00' }
      ]
    }
  },
  
  legalFramework: {
    'citizen_rights': 'Закон РУз "Об обращениях граждан и юридических лиц" №445',
    'deadlines': '15 рабочих дней для обычных обращений, 30 дней для сложных',
    'appeal_process': 'Право обжалования в вышестоящий орган в течение 30 дней',
    'compensation': 'Возмещение ущерба при доказанном нарушении прав'
  },
  
  emergencyServices: {
    'unified': { number: '112', description: 'Единая служба экстренного вызова' },
    'fire': { number: '101', description: 'Пожарная служба' },
    'police': { number: '102', description: 'Полиция' },
    'medical': { number: '103', description: 'Скорая медицинская помощь' },
    'gas': { number: '104', description: 'Аварийная газовая служба' },
    'utilities': { number: '105', description: 'Коммунальная аварийная служба' }
  }
};

export function EnhancedChatbot({ open, onOpenChange }: EnhancedChatbotProps) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionRating, setSessionRating] = useState<number>(0);
  const [isConnectedToSpecialist, setIsConnectedToSpecialist] = useState(false);
  const [currentSpecialist, setCurrentSpecialist] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting: Message = {
        id: Date.now().toString(),
        content: `Салом, ${user?.firstName || t('dear_citizen')}! 🌟\n\n Мен MuxlisaAI - Muloqot Plus платформасининг интеллектуал ёрдамчисиман.\n\n🚀 **Менинг имкониятларим:**\n• Муаммоларни аниқлаш ва ечим топиш\n• Тегишли идоралар билан боғлаш\n• Мутахассислар билан алоқа ўрнатиш\n• Ҳуқуқий маслаҳатлар бериш\n• Фавқулодда ҳолатларни қайд қилиш\n\n💡 Саволингизни ёзинг ёки тугмачаларни босинг!`,
        isBot: true,
        timestamp: new Date(),
        suggestions: [
          t('road_issues'),
          t('utilities_problems'),
          t('environmental_concerns'),
          t('safety_issues'),
          t('legal_consultation'),
          t('emergency_situation')
        ],
        commands: ["/ёрдам", "/мутахассис", "/қонунийлик", "/фавқулодда"],
        category: 'general'
      };
      setMessages([greeting]);
    }
  }, [open, user, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const detectProblemCategory = (message: string): string | null => {
    const lowerMessage = message.toLowerCase();
    
    for (const [category, data] of Object.entries(ENHANCED_KNOWLEDGE_BASE.categories)) {
      if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return category;
      }
    }
    return null;
  };

  const generateEnhancedResponse = async (userMessage: string): Promise<Message> => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Command handling
    if (lowerMessage.startsWith('/')) {
      return handleEnhancedCommand(lowerMessage);
    }
    
    // Emergency detection with immediate action
    if (lowerMessage.includes('фавқулодда') || lowerMessage.includes('авария') || 
        lowerMessage.includes('ёнғин') || lowerMessage.includes('ҳавф')) {
      return {
        id: Date.now().toString(),
        content: `🚨 **ФАВҚУЛОДДА ҲОЛАТ АНИҚЛАНДИ!**\n\n**Дарҳол қўнғироқ қилинг:**\n🆘 Умумий: 112\n🔥 Ёнғин: 101\n👮 Полиция: 102\n🚑 Тез ёрдам: 103\n\n⚠️ Агар ҳолат ҳаётга хавфли бўлмаса, муаммони батафсил тасвирланг.`,
        isBot: true,
        timestamp: new Date(),
        suggestions: ["Ҳаётга хавфли эмас", "112 га қўнғироқ", "Мутахассис билан алоқа"],
        category: 'emergency',
        attachments: [
          { type: 'contact', title: 'Фавқулодда хизматлар', description: 'Барча фавқулодда хизматлар рақамлари' }
        ]
      };
    }
    
    // Smart problem detection and specialist routing
    const category = detectProblemCategory(userMessage);
    
    if (category && ENHANCED_KNOWLEDGE_BASE.categories[category]) {
      const categoryData = ENHANCED_KNOWLEDGE_BASE.categories[category];
      const specialist = categoryData.specialists[0];
      
      return {
        id: Date.now().toString(),
        content: `🎯 **Муаммо аниқланди:** ${categoryData.agency}\n\n📋 **Тавсия этилган чора-тадбирлар:**\n• Муаммо тафсилотини киритинг\n• Суратларни илова қилинг\n• Аниқ манзилни кўрсатинг\n\n👨‍💼 **Мутахассис билан алоқа:**\n${specialist.name} - ${specialist.role}\n📞 ${specialist.contact}\n⏰ ${specialist.availability}\n\n🚀 Мутахассис билан бевосита суҳбатни бошлайми?`,
        isBot: true,
        timestamp: new Date(),
        suggestions: ["Мутахассис билан алоқа", "Араiza тафсилоти", "Бошқа йўл"],
        category: 'specialist',
        specialistInfo: specialist,
        attachments: [
          { type: 'document', title: 'Аризани расмийлаштириш', description: 'Аризани тўғри расмийлаштириш бўйича қўлланма' },
          { type: 'link', title: 'Онлайн аризa', url: '/complaints', description: 'Аризани онлайн топшириш' }
        ]
      };
    }
    
    // Legal consultation
    if (lowerMessage.includes('ҳуқуқ') || lowerMessage.includes('қонун') || lowerMessage.includes('жавобгарлик')) {
      return {
        id: Date.now().toString(),
        content: `⚖️ **ҲУҚУҚИЙ МАСЛАҲАТ**\n\n📖 **Негизий ҳуқуқларингиз:**\n• Мурожаат қилиш ҳуқуқи (Қонун №445)\n• 15 кунда жавоб олиш\n• Қарорни шикоят қилиш (30 кун)\n• Зарарни қоплаш талаби\n\n🏛️ **Ҳуқуқий ёрдам:**\n• Бепул юридик маслаҳат\n• Ҳужжатлар тайёрлаш\n• Судга шикоят қилиш\n\n📞 **Ҳуқуқий хизмат:** +998 71 200-00-00`,
        isBot: true,
        timestamp: new Date(),
        suggestions: ["Шикоят тартиби", "Бепул юрист", "Ҳужжат намунаси"],
        category: 'legal',
        attachments: [
          { type: 'document', title: 'Қонун №445', description: 'Фуқароларнинг мурожаатлари тўғрисида' },
          { type: 'link', title: 'Юридик ёрдам', url: '/legal-help', description: 'Бепул юридик маслаҳат' }
        ]
      };
    }
    
    // Intelligent general response with context awareness
    const responses = [
      `🤔 **Саволингизни тушундим!**\n\nҚайси соҳада ёрдам керак:\n🏗️ Инфратузилма\n🏠 Коммунал хизматлар\n🌿 Экология\n🛡️ Хавфсизлик\n\n💡 Батафсилрок тасвирлаб беринг, энг яхши ечимни топамиз!`,
      `📝 **Муаммоингизни қайд қилдим!**\n\n Тўғри йўналишда йўллаш учун:\n• Муаммо турини аниқлаштиринг\n• Манзилни кўрсатинг\n• Суратлар илова қилинг\n\n🎯 Бундан сўнг автоматик равишда тегишли идорага йўналтирилади.`
    ];
    
    return {
      id: Date.now().toString(),
      content: responses[Math.floor(Math.random() * responses.length)],
      isBot: true,
      timestamp: new Date(),
      suggestions: ["🏗️ Йўллар", "🏠 ЖКХ", "🌿 Экология", "🛡️ Хавфсизлик", "/ёрдам"],
      category: 'general'
    };
  };

  const handleEnhancedCommand = (command: string): Message => {
    switch (command) {
      case '/ёрдам':
      case '/help':
        return {
          id: Date.now().toString(),
          content: `🤖 **MUXLISAAI БУЙРУҚЛАРИ**\n\n🔧 **Асосий буйруқлар:**\n/ёрдам - бу меню\n/мутахассис - мутахассислар рўйхати\n/қонунийлик - ҳуқуқий маслаҳат\n/фавқулодда - фавқулодда хизматлар\n/статистика - мурожаат статистикаси\n\n🎯 **Махсус функциялар:**\n• Овозли хабар юбориш\n• Расм таҳлили\n• Ҳужжат скан қилиш\n• Жонли мутахассис билан алоқа\n\n🌟 **AI имкониятлари:**\n• Муаммоларни башорат қилиш\n• Автоматик категориялаш\n• Ечимларни тавсия этиш`,
          isBot: true,
          timestamp: new Date(),
          suggestions: ["/мутахассис", "/қонунийлик", "/фавқулодда", "Жонли чат"],
          commands: ["/мутахассис", "/қонунийлик", "/фавқулодда", "/статистика"],
          category: 'general'
        };
        
      case '/мутахассис':
        return {
          id: Date.now().toString(),
          content: `👥 **МУТАХАССИСЛАР РЎЙХАТИ**\n\n🏗️ **Йўллар ва транспорт:**\n• Алишер Каримов - Бош мухандис\n📞 +998 71 234-56-78\n⏰ Ду-Жу 9:00-18:00\n\n🏠 **ЖКХ ва коммунал:**\n• Бахтиёр Раҳимов - ЖКХ бошлиғи  \n📞 +998 71 345-67-89\n⏰ Ду-Жу 8:30-17:30\n\n🌿 **Экология:**\n• Дилшод Турсунов - Эколог\n📞 +998 71 456-78-90\n⏰ Ду-Жу 9:00-17:00\n\n🔗 **Жонли алоқа:** Мутахассис билан видео чатни бошлаш учун "Алоқа" тугмасини босинг`,
          isBot: true,
          timestamp: new Date(),
          suggestions: ["Йўллар мутахассиси", "ЖКХ мутахассиси", "Эколог", "Жонли чат"],
          category: 'specialist'
        };
        
      case '/қонунийлик':
        return {
          id: Date.now().toString(),
          content: `⚖️ **ҲУҚУҚИЙ ҚЎЛЛАНМА**\n\n📋 **Фуқаролик ҳуқуқлари:**\n• Мурожаат қилиш ҳуқуқи - Қонун №445\n• Маълумот олиш ҳуқуқи - Қонун №448\n• Жамоавий мурожаат ҳуқуқи\n\n⏰ **Кўриш муддатлари:**\n• Оддий мурожаатлар: 15 кун\n• Мураккаб масалалар: 30 кун\n• Фавқулодда ҳолатлар: дарҳол\n\n🏛️ **Шикоят тартиби:**\n• Юқори идорага мурожаат: 30 кун\n• Судга мурожаат: 3 ой\n• Бепул юридик ёрдам: доимий\n\n📞 **Ҳуқуқий хизмат:** +998 71 200-00-00`,
          isBot: true,
          timestamp: new Date(),
          suggestions: ["Шикоят тартиби", "Бепул юрист", "Қонун матни", "Ҳужжат намунаси"],
          category: 'legal'
        };
        
      case '/фавқулодда':
        return {
          id: Date.now().toString(),
          content: `🚨 **ФАВҚУЛОДДА ХИЗМАТЛАР**\n\n🆘 **Асосий рақамлар:**\n112 - Умумий фавқулодда хизмат\n101 - Ёнғин хизмати\n102 - Полиция\n103 - Тез тиббий ёрдам\n104 - Газ аварияси\n105 - Коммунал авария\n\n📞 **Қўнғироқ қилганда айтинг:**\n• Нима содир бўлди\n• Аниқ манзил\n• Жабрланганлар сони\n• Исмингиз ва телефонингиз\n\n🏥 **Ишонч телефони:** 1050\n💬 **Психологик ёрдам:** 1051`,
          isBot: true,
          timestamp: new Date(),
          suggestions: ["112 га қўнғироқ", "Ёнғин хизмати", "Тез ёрдам", "Психологик ёрдам"],
          category: 'emergency'
        };
        
      default:
        return {
          id: Date.now().toString(),
          content: `❓ Буйруқ "${command}" топилмади.\n\n/ёрдам буйруғидан фойдаланинг.`,
          isBot: true,
          timestamp: new Date(),
          suggestions: ["/ёрдам", "/мутахассис", "/қонунийлик", "/фавқулодда"],
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

    // Simulate AI processing with realistic delay
    setTimeout(async () => {
      const botResponse = await generateEnhancedResponse(input);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleConnectSpecialist = (specialist: any) => {
    setCurrentSpecialist(specialist);
    setIsConnectedToSpecialist(true);
    
    const connectionMessage: Message = {
      id: Date.now().toString(),
      content: `🔗 **Мутахассис билан алоқа ўрнатилди!**\n\n👨‍💼 ${specialist.name}\n📋 ${specialist.role}\n🏢 ${specialist.department}\n\n💬 Сиз енди мутахассис билан бевосита мулоқот қила оласиз. Саволларингизни ёзинг!`,
      isBot: true,
      timestamp: new Date(),
      category: 'specialist',
      specialistInfo: specialist
    };
    
    setMessages(prev => [...prev, connectionMessage]);
  };

  const handleRateMessage = (messageId: string, rating: number) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, rating } : msg
    ));
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'emergency': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'legal': return <Scale className="h-4 w-4 text-blue-500" />;
      case 'routing': return <FileText className="h-4 w-4 text-green-500" />;
      case 'specialist': return <UserCheck className="h-4 w-4 text-purple-500" />;
      default: return <Sparkles className="h-4 w-4 text-indigo-500" />;
    }
  };

  if (!open) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-4 right-4 w-[420px] h-[700px] z-50"
    >
      <Card className="h-full flex flex-col shadow-2xl border-2 border-indigo-200 bg-gradient-to-br from-white via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
        <CardHeader className="p-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-white">
                  <AvatarImage src="/muxlisa-ai-avatar.png" alt="MuxlisaAI" />
                  <AvatarFallback className="bg-white text-indigo-600 font-bold">
                    <Sparkles className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <motion.div 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </div>
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  MuxlisaAI 
                  <Zap className="h-4 w-4 text-yellow-300" />
                </CardTitle>
                <p className="text-xs text-indigo-100 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {isConnectedToSpecialist ? `Мутахассис билан алоқада` : 'AI ёрдамчи • Онлайн'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {sessionRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-300 fill-current" />
                  <span className="text-xs">{sessionRating}</span>
                </div>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onOpenChange(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {isConnectedToSpecialist && currentSpecialist && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 bg-white/20 rounded-lg p-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="h-3 w-3" />
                <span>{currentSpecialist.name} - {currentSpecialist.role}</span>
              </div>
            </motion.div>
          )}
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
                    <div className={`max-w-[85%] ${
                      message.isBot 
                        ? 'bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 text-gray-900 dark:text-gray-100' 
                        : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                    } rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-600`}>
                      
                      <div className="flex items-start gap-3">
                        {message.isBot && (
                          <div className="flex-shrink-0 mt-1">
                            {getCategoryIcon(message.category)}
                          </div>
                        )}
                        
                        <div className="flex-1 space-y-3">
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {message.content}
                          </div>
                          
                          {/* Specialist info display */}
                          {message.specialistInfo && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="bg-white/10 rounded-lg p-3 border border-white/20"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Briefcase className="h-4 w-4" />
                                  <span className="font-medium text-sm">Мутахассис маълумотлари</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleConnectSpecialist(message.specialistInfo)}
                                  className="text-xs"
                                >
                                  Алоқа
                                </Button>
                              </div>
                            </motion.div>
                          )}
                          
                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="space-y-2">
                              {message.attachments.map((attachment, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="flex items-center gap-2 p-2 bg-white/10 rounded-lg border border-white/20 text-xs"
                                >
                                  {attachment.type === 'document' && <FileText className="h-3 w-3" />}
                                  {attachment.type === 'link' && <ExternalLink className="h-3 w-3" />}
                                  {attachment.type === 'contact' && <Phone className="h-3 w-3" />}
                                  <div className="flex-1">
                                    <div className="font-medium">{attachment.title}</div>
                                    {attachment.description && (
                                      <div className="text-xs opacity-75">{attachment.description}</div>
                                    )}
                                  </div>
                                  {attachment.url && (
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          )}
                          
                          {/* Suggestions */}
                          {message.suggestions && (
                            <div className="flex flex-wrap gap-1">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-7 px-3 border-indigo-300 hover:bg-indigo-100 dark:border-indigo-700 dark:hover:bg-indigo-900"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                          
                          {/* Message footer with timestamp and actions */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="text-xs opacity-60">
                              {message.timestamp.toLocaleTimeString('ru-RU', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {message.isBot && (
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                                    onClick={() => handleRateMessage(message.id, 1)}
                                  >
                                    <ThumbsUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                                  >
                                    <Share2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                              
                              {message.category && (
                                <Badge variant="outline" className="text-xs">
                                  {message.category}
                                </Badge>
                              )}
                            </div>
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
                  <div className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-4 shadow-lg max-w-[80%]">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-indigo-500" />
                      <div className="flex space-x-1">
                        <motion.div
                          className="w-2 h-2 bg-indigo-500 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-indigo-500 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-indigo-500 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-300">MuxlisaAI ёзмоқда...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <Separator />
          
          <div className="p-4 bg-gradient-to-r from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 rounded-b-lg space-y-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Саволингизни ёзинг ёки овозли хабар юборинг..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                className="flex-1 border-indigo-200 focus:border-indigo-400 bg-white dark:bg-gray-800"
                disabled={isTyping}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!input.trim() || isTyping}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Command className="h-3 w-3" />
                  <span>Буйруқлар: /ёрдам /мутахассис</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-red-400" />
                  <span>AI ❤️ Халқ</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Онлайн</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
