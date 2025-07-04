interface ChatResponse {
  content: string;
  suggestions?: string[];
}

interface LanguageResponses {
  greeting: ChatResponse;
  faq: ChatResponse;
  [key: string]: ChatResponse;
}

interface ChatResponses {
  ru: LanguageResponses;
  en: LanguageResponses;
  uz: LanguageResponses;
}

export const getChatbotResponses = (language: 'en' | 'ru' | 'uz') => {
  const responses: ChatResponses = {
    // Russian responses
    ru: {
      greeting: {
        content: "Здравствуйте! Я виртуальный помощник платформы Muloqot Plus. Помогу вам с любыми вопросами по работе с системой подачи жалоб и предложений.",
        suggestions: [
          "Как подать жалобу?",
          "Проверить статус обращения",
          "Контакты властей",
          "Экстренные службы",
          "Техническая поддержка"
        ]
      },
      complaint_process: {
        content: `📋 **Как подать жалобу через Muloqot Plus:**

1. **Нажмите кнопку "Создать обращение"** в верхней части экрана
2. **Выберите категорию** проблемы (дороги, ЖКХ, транспорт и т.д.)
3. **Укажите район** где произошла проблема
4. **Опишите ситуацию** подробно и понятно
5. **Приложите фото** если возможно (помогает решить вопрос быстрее)
6. **Отправьте обращение** - оно автоматически направится в нужную службу

⏰ **Сроки рассмотрения:** 3-30 дней в зависимости от сложности вопроса
🔔 **Уведомления:** Вы получите уведомление о каждом изменении статуса`,
        suggestions: [
          "Какие категории доступны?",
          "Как отследить статус?",
          "Что делать если не отвечают?",
          "Сроки рассмотрения"
        ]
      },
      status_check: {
        content: `🔍 **Как проверить статус обращения:**

1. **Перейдите в раздел "Главная"** или "Мои обращения"
2. **Найдите ваше обращение** в списке
3. **Посмотрите статус:**
   • 🟡 **Новая** - обращение зарегистрировано
   • 🔵 **В работе** - специалисты изучают вопрос
   • 🟢 **Решена** - проблема устранена
   • 🔴 **Отклонена** - с пояснением причин

📱 **Уведомления в реальном времени:** Система автоматически уведомит вас о любых изменениях статуса через браузер`,
        suggestions: [
          "Почему долго рассматривают?",
          "Можно ли ускорить процесс?",
          "Подать повторное обращение",
          "Техническая проблема"
        ]
      },
      categories: {
        content: `📂 **Доступные категории обращений:**

🛣️ **Дороги** - ямы, освещение, дорожные знаки
🏠 **ЖКХ** - отопление, водоснабжение, электричество
🚌 **Транспорт** - общественный транспорт, парковки
🏥 **Здравоохранение** - работа больниц и поликлиник
🎓 **Образование** - школы, детские сады
🌳 **Экология** - загрязнение, уборка территории
🏛️ **Госуслуги** - работа госучреждений

💡 **Совет:** Выбирайте категорию максимально точно - это поможет направить обращение нужному специалисту быстрее`,
        suggestions: [
          "Подать жалобу на дороги",
          "Проблема с ЖКХ",
          "Транспортная проблема",
          "Экологическая проблема"
        ]
      },
      government_contacts: {
        content: `📞 **Контакты властей и служб:**

🏛️ **Администрация:**
• Приемная хокима: указана для каждого района в профиле
• Единая справочная: 1080
• Онлайн приемная: через платформу Muloqot Plus

🚨 **Экстренные службы:**
• Пожарная служба: 101
• Полиция: 102  
• Скорая помощь: 103
• Газовая служба: 104
• ЖКХ горячая линия: 1095

📧 **Обратная связь:**
• Через платформу Muloqot Plus (рекомендуется)
• Прямые звонки в рабочее время: 9:00-18:00`,
        suggestions: [
          "Номера экстренных служб",
          "Контакты по районам",
          "Режим работы служб",
          "Подать жалобу онлайн"
        ]
      },
      emergency_services: {
        content: `🚨 **Номера экстренных служб Узбекистана:**

**Единый номер экстренных служб: 112**

🔥 **Пожарная служба: 101**
👮 **Полиция: 102**
🚑 **Скорая медицинская помощь: 103**
⛽ **Газовая аварийная служба: 104**

🏠 **Коммунальные службы:**
• ЖКХ горячая линия: 1095
• Водоканал: по районам
• Электросети: по районам

📱 **Дополнительно:**
• Единая справочная: 1080
• Доверительная линия МВД: 1102`,
        suggestions: [
          "Контакты по районам",
          "Как связаться с ЖКХ?",
          "Номер газовой службы",
          "Подать жалобу не экстренную"
        ]
      },
      technical_support: {
        content: `🛠️ **Техническая поддержка Muloqot Plus:**

📧 **Email:** support@muloqotplus.uz
📞 **Телефон:** +998 71 123-45-67
⏰ **Время работы:** Пн-Пт 9:00-18:00

💬 **Онлайн-помощь:**
• Этот чат-бот (круглосуточно)
• Раздел "Помощь" на сайте
• Видео-инструкции

🎯 **Мы поможем с:**
• Регистрацией и входом в систему
• Подачей обращений
• Техническими проблемами
• Статусом ваших жалоб

🔧 **Частые проблемы:**
• Не приходят уведомления - проверьте настройки браузера
• Не загружается фото - максимум 10MB, форматы JPG/PNG
• Забыли пароль - используйте восстановление`,
        suggestions: [
          "Проблема с входом",
          "Не приходят уведомления",
          "Не загружается фото",
          "Забыл пароль"
        ]
      },
      districts: {
        content: `🗺️ **Районы города Ташкента:**

**Городские районы:**
• Алмазарский район
• Бектемирский район  
• Мирабадский район
• Миробад район
• Сергелийский район
• Ункурганский район
• Хамза район
• Шайхантахурский район
• Яккасарайский район
• Якобабад район
• Яшнабадский район
• Чиланзарский район

💡 **Важно:** Выбирайте район точно - это определяет, куда направится ваше обращение`,
        suggestions: [
          "Контакты районных администраций",
          "Подать жалобу в мой район",
          "Работает ли система во всех районах?",
          "Межрайонные проблемы"
        ]
      },
      faq: {
        content: `❓ **Часто задаваемые вопросы:**

**📝 Как работает платформа?**
Muloqot Plus - это официальная платформа для подачи жалоб и предложений властям. Все обращения автоматически направляются в нужные службы.

**⏰ Сколько ждать ответа?**
• Экстренные вопросы: до 24 часов
• Обычные жалобы: 3-15 дней  
• Сложные проблемы: до 30 дней

**💰 Это бесплатно?**
Да, все услуги платформы бесплатны для граждан.

**🔒 Безопасны ли мои данные?**
Да, все данные защищены согласно законодательству РУз о персональных данных.

**📱 Есть ли мобильное приложение?**
Пока только веб-версия, но она адаптирована для мобильных устройств.`,
        suggestions: [
          "Безопасность данных",
          "Мобильное приложение",
          "Стоимость услуг",
          "Техническая поддержка"
        ]
      }
    },
    
    // English responses
    en: {
      greeting: {
        content: "Hello! I'm the virtual assistant for Muloqot Plus platform. I'll help you with any questions about submitting complaints and suggestions.",
        suggestions: [
          "How to submit a complaint?",
          "Check complaint status",
          "Government contacts",
          "Emergency services",
          "Technical support"
        ]
      },
      complaint_process: {
        content: `📋 **How to submit a complaint via Muloqot Plus:**

1. **Click "Create Complaint"** button at the top of the screen
2. **Select category** of the problem (roads, utilities, transport, etc.)
3. **Choose district** where the problem occurred
4. **Describe the situation** in detail and clearly
5. **Attach photos** if possible (helps solve the issue faster)
6. **Submit the complaint** - it will be automatically sent to the relevant service

⏰ **Processing time:** 3-30 days depending on complexity
🔔 **Notifications:** You'll receive notifications about every status change`,
        suggestions: [
          "Available categories",
          "How to track status?",
          "What if no response?",
          "Processing timeframes"
        ]
      },
      status_check: {
        content: `🔍 **How to check complaint status:**

1. **Go to "Home" section** or "My Complaints"
2. **Find your complaint** in the list
3. **Check the status:**
   • 🟡 **New** - complaint registered
   • 🔵 **In Progress** - specialists reviewing
   • 🟢 **Resolved** - problem fixed
   • 🔴 **Rejected** - with explanation

📱 **Real-time notifications:** System automatically notifies you of any status changes via browser`,
        suggestions: [
          "Why taking so long?",
          "Can I speed up process?",
          "Submit follow-up",
          "Technical issue"
        ]
      },
      
      faq: {
        content: `📋 **Frequently Asked Questions**

**📝 How long to process complaints?**
- Emergency: 24 hours  
- Standard: 5-10 working days
- Complex: 30 days maximum

**🔄 Why is my complaint taking longer?**
Possible reasons:
• Complex investigation required
• Multiple agencies involved  
• Additional documentation needed
• Verification in progress

**📊 What complaint statuses exist?**
• 🟡 **New** - received, awaiting review
• 🔵 **In Progress** - under investigation
• 🟢 **Resolved** - problem fixed
• 🔴 **Rejected** - with explanation

**📱 Is there a mobile app?**
Currently web version only, but it's mobile-optimized.`,
        suggestions: [
          "Data security",
          "Mobile application", 
          "Service costs",
          "Technical support"
        ]
      }
    },
    
    // Uzbek responses
    uz: {
      greeting: {
        content: "Salom! Men Muloqot Plus platformasining virtual yordamchisiman. Shikoyat va takliflarni yuborish bo'yicha har qanday savollarga yordam beraman.",
        suggestions: [
          "Shikoyat qanday yuboriladi?",
          "Murojaat holatini tekshirish",
          "Hokimiyat kontaktlari",
          "Favqulodda xizmatlar",
          "Texnik yordam"
        ]
      },
      complaint_process: {
        content: `📋 **Muloqot Plus orqali shikoyat yuborish:**

1. **"Murojaat yaratish" tugmasini** bosing
2. **Muammo kategoriyasini** tanlang (yo'llar, kommunal, transport va h.k.)
3. **Tumanni** belgilang
4. **Vaziyatni batafsil** tasvirlab bering
5. **Rasm biriktiring** (imkon bo'lsa)
6. **Murojaatni yuboring** - avtomatik ravishda tegishli xizmatga yo'naladi

⏰ **Ko'rib chiqish muddati:** 3-30 kun
🔔 **Bildirishnomalar:** Har bir o'zgarish haqida xabar olasiz`,
        suggestions: [
          "Qanday kategoriyalar bor?",
          "Holatni qanday kuzatish mumkin?",
          "Javob kelmasa nima qilish kerak?",
          "Ko'rib chiqish muddatlari"
        ]
      },
      
      faq: {
        content: `📋 **Tez-tez so'raladigan savollar**

**📝 Shikoyatlar qancha vaqtda ko'rib chiqiladi?**
- Favqulodda: 24 soat
- Oddiy: 5-10 ish kuni  
- Murakkab: maksimum 30 kun

**🔄 Nima uchun mening shikoyatim uzoq ko'rib chiqilayapti?**
Mumkin bo'lgan sabablar:
• Murakkab tekshiruv talab etiladi
• Bir necha idora jalb qilingan
• Qo'shimcha hujjatlar kerak
• Tekshirish jarayonida

**📊 Qanday murojaatlar holatlari mavjud?**
• 🟡 **Yangi** - qabul qilingan, ko'rib chiqish kutilayapti
• 🔵 **Jarayonda** - tekshirilayapti
• 🟢 **Hal qilingan** - muammo bartaraf etildi
• 🔴 **Rad etilgan** - izoh bilan

**📱 Mobil ilova bormi?**
Hozircha faqat veb-versiya, lekin mobil qurilmalar uchun moslashtirilgan.`,
        suggestions: [
          "Ma'lumotlar xavfsizligi",
          "Mobil ilova",
          "Xizmat narxi", 
          "Texnik yordam"
        ]
      }
    }
  };

  const knowledgeBase = {
    ru: {
      "жалоб|обращен|подат|создат": "complaint_process",
      "статус|проверит|отследит|узнат": "status_check", 
      "категори|виды|разделы": "categories",
      "власт|хоким|администрац|контакт|связат": "government_contacts",
      "экстренн|служб|пожарн|полици|скорая|номер": "emergency_services",
      "техник|поддержк|помощ|проблем|ошибк": "technical_support",
      "район|территори|округ": "districts",
      "вопрос|часто|faq|помощ": "faq"
    },
    en: {
      "complaint|submit|create|file": "complaint_process",
      "status|check|track|follow": "status_check",
      "categor|type|kind": "categories", 
      "government|authority|contact|official": "government_contacts",
      "emergency|service|fire|police|ambulance": "emergency_services",
      "technical|support|help|problem|issue": "technical_support",
      "district|area|region": "districts",
      "question|faq|help|guide": "faq"
    },
    uz: {
      "shikoyat|murojaat|yaratish|yuborish": "complaint_process",
      "holat|tekshirish|kuzatish": "status_check",
      "kategoriya|turlar|bo'limlar": "categories",
      "hokimiyat|hokim|kontakt|bog'lanish": "government_contacts", 
      "favqulodda|xizmat|o't|politsiya|tez yordam": "emergency_services",
      "texnik|yordam|muammo|xatolik": "technical_support",
      "tuman|hudud|viloyat": "districts",
      "savol|ko'p so'raladigan|yordam": "faq"
    }
  };

  const getResponse = (userMessage: string): ChatResponse => {
    const lowerMessage = userMessage.toLowerCase();
    const langKnowledge = knowledgeBase[language] || knowledgeBase.ru;
    const langResponses = responses[language] || responses.ru;
    
    // Find matching response
    for (const [keywords, responseKey] of Object.entries(langKnowledge)) {
      const keywordList = keywords.split('|');
      if (keywordList.some(keyword => lowerMessage.includes(keyword))) {
        return langResponses[responseKey] || langResponses.faq;
      }
    }
    
    // Default helpful response
    return {
      content: language === 'ru' 
        ? "Извините, я не понял ваш вопрос. Попробуйте выбрать один из предложенных вариантов ниже или переформулируйте вопрос."
        : language === 'en'
        ? "Sorry, I didn't understand your question. Please try one of the suggested options below or rephrase your question."
        : "Kechirasiz, savolingizni tushunmadim. Quyidagi variantlardan birini tanlang yoki savolni boshqa so'zlar bilan ifodalang.",
      suggestions: langResponses.greeting.suggestions
    };
  };

  return {
    getResponse,
    getGreeting: () => responses[language]?.greeting || responses.ru.greeting
  };
};