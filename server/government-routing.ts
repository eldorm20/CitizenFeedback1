// Intelligent routing system for automatically assigning complaints to appropriate government agencies
export interface Agency {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  workingHours: string;
  responsibilities: string[];
  maxCapacity: number;
  currentLoad: number;
  averageResponseTime: number; // in hours
  successRate: number; // percentage
}

export interface RoutingRule {
  categories: string[];
  districts?: string[];
  keywords: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  agencies: string[]; // agency IDs in order of preference
}

// Government agencies database
export const AGENCIES: Record<string, Agency> = {
  // Hokimiyats (District Administrations)
  'hokim_yunusabad': {
    id: 'hokim_yunusabad',
    name: 'Хокимият Юнусабадского района',
    contact: 'А. Каримов',
    email: 'yunusabad@hokim.tashkent.uz',
    phone: '+998 71 268-45-67',
    workingHours: 'Пн-Пт 9:00-18:00',
    responsibilities: ['ЖКХ', 'Благоустройство', 'Дороги', 'Коммунальные услуги'],
    maxCapacity: 50,
    currentLoad: 23,
    averageResponseTime: 72,
    successRate: 87
  },
  'hokim_chilanzar': {
    id: 'hokim_chilanzar',
    name: 'Хокимият Чиланзарского района',
    contact: 'М. Рахимов',
    email: 'chilanzar@hokim.tashkent.uz',
    phone: '+998 71 276-89-12',
    workingHours: 'Пн-Пт 9:00-18:00',
    responsibilities: ['ЖКХ', 'Благоустройство', 'Дороги', 'Коммунальные услуги'],
    maxCapacity: 45,
    currentLoad: 31,
    averageResponseTime: 68,
    successRate: 92
  },
  'hokim_mirabad': {
    id: 'hokim_mirabad',
    name: 'Хокимият Мирабадского района',
    contact: 'Н. Усманова',
    email: 'mirabad@hokim.tashkent.uz',
    phone: '+998 71 255-33-44',
    workingHours: 'Пн-Пт 9:00-18:00',
    responsibilities: ['ЖКХ', 'Благоустройство', 'Дороги', 'Коммунальные услуги'],
    maxCapacity: 40,
    currentLoad: 18,
    averageResponseTime: 65,
    successRate: 89
  },

  // Specialized agencies
  'transport_dept': {
    id: 'transport_dept',
    name: 'Управление транспорта г. Ташкента',
    contact: 'О. Назаров',
    email: 'transport@tashkent.uz',
    phone: '+998 71 200-15-16',
    workingHours: 'Пн-Пт 9:00-17:00',
    responsibilities: ['Транспорт', 'Общественный транспорт', 'Дорожная безопасность'],
    maxCapacity: 30,
    currentLoad: 12,
    averageResponseTime: 96,
    successRate: 84
  },
  'healthcare_dept': {
    id: 'healthcare_dept',
    name: 'Министерство здравоохранения РУз',
    contact: 'Д. Мирзаева',
    email: 'complaints@minhealth.uz',
    phone: '+998 71 241-78-90',
    workingHours: 'Пн-Пт 8:30-17:30',
    responsibilities: ['Здравоохранение', 'Поликлиники', 'Больницы'],
    maxCapacity: 60,
    currentLoad: 37,
    averageResponseTime: 120,
    successRate: 91
  },
  'education_dept': {
    id: 'education_dept',
    name: 'Министерство образования РУз',
    contact: 'С. Турсунов',
    email: 'info@edu.uz',
    phone: '+998 71 239-12-34',
    workingHours: 'Пн-Пт 9:00-18:00',
    responsibilities: ['Образование', 'Школы', 'Детские сады'],
    maxCapacity: 40,
    currentLoad: 22,
    averageResponseTime: 144,
    successRate: 88
  },
  'ecology_dept': {
    id: 'ecology_dept',
    name: 'Госкомэкологии РУз',
    contact: 'Р. Алимов',
    email: 'ecology@eco.gov.uz',
    phone: '+998 71 207-56-78',
    workingHours: 'Пн-Пт 9:00-17:00',
    responsibilities: ['Экология', 'Загрязнение', 'Мусор', 'Озеленение'],
    maxCapacity: 25,
    currentLoad: 8,
    averageResponseTime: 168,
    successRate: 76
  },
  'anticorruption': {
    id: 'anticorruption',
    name: 'Антикоррупционное агентство РУз',
    contact: 'И. Каримова',
    email: 'report@anticorruption.uz',
    phone: '+998 71 205-10-05',
    workingHours: 'Круглосуточно',
    responsibilities: ['Коррупция', 'Вымогательство', 'Злоупотребления'],
    maxCapacity: 20,
    currentLoad: 5,
    averageResponseTime: 48,
    successRate: 94
  }
};

// Intelligent routing rules
export const ROUTING_RULES: RoutingRule[] = [
  // Infrastructure and utilities
  {
    categories: ['ЖКХ', 'Коммунальные услуги'],
    keywords: ['отопление', 'вода', 'газ', 'электричество', 'канализация', 'горячая вода'],
    priority: 'high',
    agencies: ['hokim_yunusabad', 'hokim_chilanzar', 'hokim_mirabad']
  },
  {
    categories: ['Дороги'],
    keywords: ['яма', 'дорога', 'асфальт', 'тротуар', 'освещение', 'светофор'],
    priority: 'medium',
    agencies: ['hokim_yunusabad', 'hokim_chilanzar', 'hokim_mirabad', 'transport_dept']
  },
  {
    categories: ['Благоустройство'],
    keywords: ['парк', 'сквер', 'детская площадка', 'мусор', 'озеленение'],
    priority: 'medium',
    agencies: ['hokim_yunusabad', 'hokim_chilanzar', 'hokim_mirabad']
  },

  // Transport
  {
    categories: ['Транспорт', 'Общественный транспорт'],
    keywords: ['автобус', 'маршрут', 'остановка', 'транспорт', 'метро'],
    priority: 'medium',
    agencies: ['transport_dept', 'hokim_yunusabad', 'hokim_chilanzar']
  },

  // Social services
  {
    categories: ['Здравоохранение'],
    keywords: ['поликлиника', 'больница', 'врач', 'лечение', 'медицина'],
    priority: 'high',
    agencies: ['healthcare_dept']
  },
  {
    categories: ['Образование'],
    keywords: ['школа', 'детский сад', 'учитель', 'образование', 'учеба'],
    priority: 'high',
    agencies: ['education_dept']
  },

  // Environment
  {
    categories: ['Экология'],
    keywords: ['загрязнение', 'мусор', 'экология', 'природа', 'воздух', 'шум'],
    priority: 'medium',
    agencies: ['ecology_dept', 'hokim_yunusabad', 'hokim_chilanzar']
  },

  // Corruption and violations
  {
    categories: ['Коррупция'],
    keywords: ['взятка', 'коррупция', 'вымогательство', 'злоупотребление', 'нарушение'],
    priority: 'urgent',
    agencies: ['anticorruption']
  }
];

export function routeComplaintToAgency(
  category: string,
  district: string,
  content: string,
  priority: string = 'medium'
): { agency: Agency; confidence: number; reasoning: string } {
  const contentLower = content.toLowerCase();
  let bestMatch: { agency: Agency; score: number; reasoning: string } | null = null;

  // Find matching routing rules
  for (const rule of ROUTING_RULES) {
    let score = 0;
    let reasoning = '';

    // Category match (high weight)
    if (rule.categories.includes(category)) {
      score += 50;
      reasoning += `Категория "${category}" соответствует правилу. `;
    }

    // Keyword match (medium weight)
    const matchedKeywords = rule.keywords.filter(keyword => 
      contentLower.includes(keyword)
    );
    if (matchedKeywords.length > 0) {
      score += matchedKeywords.length * 15;
      reasoning += `Найдены ключевые слова: ${matchedKeywords.join(', ')}. `;
    }

    // Priority boost (low weight)
    if (rule.priority === priority) {
      score += 10;
      reasoning += `Приоритет совпадает (${priority}). `;
    }

    // District-specific routing
    if (district && rule.agencies.length > 0) {
      const districtAgencyMap: Record<string, string> = {
        'Юнусабадский': 'hokim_yunusabad',
        'Чиланзарский': 'hokim_chilanzar', 
        'Мирабадский': 'hokim_mirabad'
      };

      const preferredAgency = districtAgencyMap[district];
      if (preferredAgency && rule.agencies.includes(preferredAgency)) {
        score += 25;
        reasoning += `Районная специализация для ${district}. `;
      }
    }

    // Select best agency from rule
    if (score > 0 && rule.agencies.length > 0) {
      for (const agencyId of rule.agencies) {
        const agency = AGENCIES[agencyId];
        if (agency) {
          // Apply load balancing and performance factors
          const loadFactor = 1 - (agency.currentLoad / agency.maxCapacity);
          const performanceFactor = (agency.successRate / 100) * (100 / agency.averageResponseTime);
          const adjustedScore = score * loadFactor * performanceFactor;

          if (!bestMatch || adjustedScore > bestMatch.score) {
            bestMatch = {
              agency,
              score: adjustedScore,
              reasoning: reasoning + `Выбрано ведомство с учетом загрузки (${agency.currentLoad}/${agency.maxCapacity}) и эффективности (${agency.successRate}%).`
            };
          }
        }
      }
    }
  }

  // Fallback to district hokimiyat if no specific match
  if (!bestMatch) {
    const districtAgencyMap: Record<string, string> = {
      'Юнусабадский': 'hokim_yunusabad',
      'Чиланзарский': 'hokim_chilanzar',
      'Мирабадский': 'hokim_mirabad'
    };

    const fallbackAgencyId = districtAgencyMap[district] || 'hokim_yunusabad';
    const fallbackAgency = AGENCIES[fallbackAgencyId];
    
    bestMatch = {
      agency: fallbackAgency,
      score: 30,
      reasoning: `Направлено в хокимият района по умолчанию (${district}).`
    };
  }

  return {
    agency: bestMatch.agency,
    confidence: Math.min(bestMatch.score, 100),
    reasoning: bestMatch.reasoning
  };
}

export function updateAgencyLoad(agencyId: string, increment: number = 1) {
  if (AGENCIES[agencyId]) {
    AGENCIES[agencyId].currentLoad += increment;
  }
}

export function getAgencyStats(agencyId: string) {
  return AGENCIES[agencyId];
}

export function getAllAgencies(): Agency[] {
  return Object.values(AGENCIES);
}

export function getTopPerformingAgencies(limit: number = 5): Agency[] {
  return Object.values(AGENCIES)
    .sort((a, b) => {
      const scoreA = (a.successRate / 100) * (100 / a.averageResponseTime);
      const scoreB = (b.successRate / 100) * (100 / b.averageResponseTime);
      return scoreB - scoreA;
    })
    .slice(0, limit);
}

export function generateInternalId(agencyId: string, category: string): string {
  const timestamp = Date.now().toString(36);
  const categoryCode = category.substring(0, 3).toUpperCase();
  const agencyCode = agencyId.substring(0, 4).toUpperCase();
  return `${agencyCode}-${categoryCode}-${timestamp}`;
}