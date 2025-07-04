// Response templates for common issues to help government officials provide consistent responses

export interface ResponseTemplate {
  id: string;
  category: string;
  title: string;
  template: string;
  placeholders: string[];
  estimatedDays: number;
  language: 'ru' | 'en' | 'uz';
}

export const RESPONSE_TEMPLATES: ResponseTemplate[] = [
  // ЖКХ (Utilities)
  {
    id: 'utilities_water_outage',
    category: 'ЖКХ',
    title: 'Отключение воды - плановое',
    template: `Уважаемый житель!

По Вашему обращению сообщаем, что в районе {ADDRESS} проводятся плановые работы по {WORK_TYPE}.

Срок выполнения работ: {START_DATE} - {END_DATE}
Время отключения: {TIME_RANGE}

В случае продления работ будет дополнительно сообщено.

Приносим извинения за временные неудобства.

С уважением,
{AGENCY_NAME}
Контакт: {CONTACT_INFO}`,
    placeholders: ['ADDRESS', 'WORK_TYPE', 'START_DATE', 'END_DATE', 'TIME_RANGE', 'AGENCY_NAME', 'CONTACT_INFO'],
    estimatedDays: 1,
    language: 'ru'
  },
  {
    id: 'utilities_heating_issue',
    category: 'ЖКХ',
    title: 'Проблемы с отоплением',
    template: `Уважаемый житель!

Ваше обращение о проблемах с отоплением по адресу {ADDRESS} принято к рассмотрению.

Регистрационный номер: {INTERNAL_ID}

Планируемые действия:
1. Выезд специалиста для диагностики - {INSPECTION_DATE}
2. Устранение неисправности - до {RESOLUTION_DATE}

О ходе выполнения работ будем информировать дополнительно.

С уважением,
{AGENCY_NAME}
Телефон: {PHONE}`,
    placeholders: ['ADDRESS', 'INTERNAL_ID', 'INSPECTION_DATE', 'RESOLUTION_DATE', 'AGENCY_NAME', 'PHONE'],
    estimatedDays: 5,
    language: 'ru'
  },

  // Дороги (Roads)
  {
    id: 'roads_pothole',
    category: 'Дороги',
    title: 'Ямы на дороге',
    template: `Уважаемый гражданин!

Благодарим за обращение о состоянии дороги по адресу {ADDRESS}.

Ваше обращение зарегистрировано под номером {INTERNAL_ID}.

Планируемые мероприятия:
- Выезд дорожной службы для оценки: {INSPECTION_DATE}
- Проведение ремонтных работ: {REPAIR_START} - {REPAIR_END}

Информация о начале работ будет размещена на информационных стендах в районе.

С уважением,
{AGENCY_NAME}
Горячая линия: {HOTLINE}`,
    placeholders: ['ADDRESS', 'INTERNAL_ID', 'INSPECTION_DATE', 'REPAIR_START', 'REPAIR_END', 'AGENCY_NAME', 'HOTLINE'],
    estimatedDays: 10,
    language: 'ru'
  },

  // Транспорт (Transport)
  {
    id: 'transport_bus_schedule',
    category: 'Транспорт',
    title: 'Изменение расписания автобусов',
    template: `Уважаемые пассажиры!

По Вашему обращению сообщаем об изменениях в работе маршрута №{ROUTE_NUMBER}.

Причина изменений: {REASON}
Период действия: с {START_DATE} по {END_DATE}

Новое расписание:
{NEW_SCHEDULE}

Альтернативные маршруты: {ALTERNATIVE_ROUTES}

Справочная служба: {PHONE}

С уважением,
Управление транспорта`,
    placeholders: ['ROUTE_NUMBER', 'REASON', 'START_DATE', 'END_DATE', 'NEW_SCHEDULE', 'ALTERNATIVE_ROUTES', 'PHONE'],
    estimatedDays: 3,
    language: 'ru'
  },

  // Благоустройство (Landscaping)
  {
    id: 'landscaping_tree_trimming',
    category: 'Благоустройство',
    title: 'Обрезка деревьев',
    template: `Уважаемый житель!

Ваше обращение о необходимости обрезки деревьев по адресу {ADDRESS} рассмотрено.

Номер обращения: {INTERNAL_ID}

Запланированные работы:
- Осмотр зеленых насаждений: {INSPECTION_DATE}
- Проведение обрезки: {WORK_DATE}
- Уборка территории: {CLEANUP_DATE}

Работы будут проводиться с {START_TIME} до {END_TIME}.

С уважением,
{AGENCY_NAME}
Контактное лицо: {CONTACT_PERSON}
Телефон: {PHONE}`,
    placeholders: ['ADDRESS', 'INTERNAL_ID', 'INSPECTION_DATE', 'WORK_DATE', 'CLEANUP_DATE', 'START_TIME', 'END_TIME', 'AGENCY_NAME', 'CONTACT_PERSON', 'PHONE'],
    estimatedDays: 7,
    language: 'ru'
  },

  // Общие шаблоны (General)
  {
    id: 'general_under_review',
    category: 'Общее',
    title: 'Обращение принято к рассмотрению',
    template: `Уважаемый(-ая) {CITIZEN_NAME}!

Ваше обращение по вопросу "{ISSUE_TITLE}" принято к рассмотрению.

Регистрационный номер: {INTERNAL_ID}
Дата регистрации: {REGISTRATION_DATE}
Ответственное ведомство: {AGENCY_NAME}
Срок рассмотрения: до {DEADLINE_DATE}

Вы можете отслеживать статус обращения на портале или по телефону {PHONE}.

С уважением,
{RESPONSIBLE_PERSON}
{POSITION}`,
    placeholders: ['CITIZEN_NAME', 'ISSUE_TITLE', 'INTERNAL_ID', 'REGISTRATION_DATE', 'AGENCY_NAME', 'DEADLINE_DATE', 'PHONE', 'RESPONSIBLE_PERSON', 'POSITION'],
    estimatedDays: 3,
    language: 'ru'
  },
  {
    id: 'general_completed',
    category: 'Общее',
    title: 'Обращение выполнено',
    template: `Уважаемый(-ая) {CITIZEN_NAME}!

Сообщаем о выполнении работ по Вашему обращению №{INTERNAL_ID}.

Выполненные мероприятия:
{COMPLETED_ACTIONS}

Дата завершения: {COMPLETION_DATE}
Ответственный исполнитель: {EXECUTOR}

Если у Вас есть вопросы по качеству выполненных работ, обращайтесь по телефону {PHONE}.

Благодарим за сотрудничество!

С уважением,
{AGENCY_NAME}`,
    placeholders: ['CITIZEN_NAME', 'INTERNAL_ID', 'COMPLETED_ACTIONS', 'COMPLETION_DATE', 'EXECUTOR', 'PHONE', 'AGENCY_NAME'],
    estimatedDays: 0,
    language: 'ru'
  },
  {
    id: 'general_rejected',
    category: 'Общее',
    title: 'Обращение не может быть удовлетворено',
    template: `Уважаемый(-ая) {CITIZEN_NAME}!

По результатам рассмотрения Вашего обращения №{INTERNAL_ID} сообщаем следующее:

Причина отклонения: {REJECTION_REASON}

Рекомендации:
{RECOMMENDATIONS}

Если Вы не согласны с данным решением, Вы можете:
1. Подать повторное обращение с дополнительными материалами
2. Обратиться в вышестоящую инстанцию
3. Связаться с нами для уточнений по телефону {PHONE}

С уважением,
{AGENCY_NAME}
{RESPONSIBLE_PERSON}`,
    placeholders: ['CITIZEN_NAME', 'INTERNAL_ID', 'REJECTION_REASON', 'RECOMMENDATIONS', 'PHONE', 'AGENCY_NAME', 'RESPONSIBLE_PERSON'],
    estimatedDays: 0,
    language: 'ru'
  }
];

export function getTemplatesByCategory(category: string): ResponseTemplate[] {
  return RESPONSE_TEMPLATES.filter(template => 
    template.category === category || template.category === 'Общее'
  );
}

export function getTemplate(id: string): ResponseTemplate | undefined {
  return RESPONSE_TEMPLATES.find(template => template.id === id);
}

export function fillTemplate(templateId: string, values: Record<string, string>): string {
  const template = getTemplate(templateId);
  if (!template) {
    throw new Error(`Template with id "${templateId}" not found`);
  }

  let filledTemplate = template.template;
  
  // Replace placeholders with values
  template.placeholders.forEach(placeholder => {
    const regex = new RegExp(`{${placeholder}}`, 'g');
    const value = values[placeholder] || `{${placeholder}}`;
    filledTemplate = filledTemplate.replace(regex, value);
  });

  return filledTemplate;
}

export function getTemplatePlaceholders(templateId: string): string[] {
  const template = getTemplate(templateId);
  return template ? template.placeholders : [];
}

// Helper function to generate common values
export function generateCommonValues(post: any, agency: any): Record<string, string> {
  const now = new Date();
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    INTERNAL_ID: post.internalId || 'N/A',
    REGISTRATION_DATE: now.toLocaleDateString('ru-RU'),
    AGENCY_NAME: agency?.name || 'Ответственное ведомство',
    CONTACT_INFO: agency?.email || 'N/A',
    PHONE: agency?.phone || 'N/A',
    RESPONSIBLE_PERSON: agency?.contact || 'N/A',
    POSITION: 'Ответственный специалист',
    INSPECTION_DATE: threeDaysLater.toLocaleDateString('ru-RU'),
    DEADLINE_DATE: oneWeekLater.toLocaleDateString('ru-RU'),
    CITIZEN_NAME: post.author?.firstName + ' ' + post.author?.lastName || 'Уважаемый гражданин',
    ISSUE_TITLE: post.title || 'Ваше обращение',
    ADDRESS: `${post.district}, место происшествия`,
  };
}
