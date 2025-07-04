import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostWithAuthor } from "@shared/schema";
import { 
  FileText, 
  Clock, 
  Copy, 
  Send, 
  Wand2,
  Calendar,
  User,
  Building,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResponseTemplate {
  id: string;
  category: string;
  title: string;
  template: string;
  placeholders: string[];
  estimatedDays: number;
  language: string;
}

interface ResponseTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: PostWithAuthor;
  onSubmitResponse: (response: string, status: string, estimatedDate?: Date) => Promise<void>;
}

// Mock templates - in a real app, these would come from the server
const MOCK_TEMPLATES: ResponseTemplate[] = [
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
    id: 'roads_pothole',
    category: 'Дороги',
    title: 'Ямы на дороге',
    template: `Уважаемый гражданин!

Благодарим за обращение о состоянии дороги по адресу {ADDRESS}.

Ваше обращение зарегистрировано под номером {INTERNAL_ID}.

Планируемые мероприятия:
- Выезд дорожной службы для оценки: {INSPECTION_DATE}
- Проведение ремонтных работ: {REPAIR_START} - {REPAIR_END}

С уважением,
{AGENCY_NAME}
Горячая линия: {HOTLINE}`,
    placeholders: ['ADDRESS', 'INTERNAL_ID', 'INSPECTION_DATE', 'REPAIR_START', 'REPAIR_END', 'AGENCY_NAME', 'HOTLINE'],
    estimatedDays: 10,
    language: 'ru'
  },
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

Вы можете отслеживать статус обращения на портале.

С уважением,
{RESPONSIBLE_PERSON}`,
    placeholders: ['CITIZEN_NAME', 'ISSUE_TITLE', 'INTERNAL_ID', 'REGISTRATION_DATE', 'AGENCY_NAME', 'DEADLINE_DATE', 'RESPONSIBLE_PERSON'],
    estimatedDays: 3,
    language: 'ru'
  }
];

export function ResponseTemplateModal({ open, onOpenChange, post, onSubmitResponse }: ResponseTemplateModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ResponseTemplate | null>(null);
  const [responseText, setResponseText] = useState("");
  const [newStatus, setNewStatus] = useState("in_progress");
  const [estimatedDate, setEstimatedDate] = useState("");
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Filter templates by category
  const relevantTemplates = MOCK_TEMPLATES.filter(template => 
    template.category === post.category || template.category === 'Общее'
  );

  // Generate default values for common placeholders
  const generateDefaultValues = (template: ResponseTemplate): Record<string, string> => {
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const defaults: Record<string, string> = {
      INTERNAL_ID: post.internalId || `REQ-${post.id}`,
      REGISTRATION_DATE: now.toLocaleDateString('ru-RU'),
      AGENCY_NAME: post.assignedAgency || 'Ответственное ведомство',
      CONTACT_INFO: post.agencyContact || 'info@government.uz',
      PHONE: '+998 71 XXX-XX-XX',
      RESPONSIBLE_PERSON: post.agencyContact || 'Ответственный специалист',
      POSITION: 'Специалист',
      INSPECTION_DATE: threeDaysLater.toLocaleDateString('ru-RU'),
      DEADLINE_DATE: oneWeekLater.toLocaleDateString('ru-RU'),
      CITIZEN_NAME: `${post.author.firstName} ${post.author.lastName}`,
      ISSUE_TITLE: post.title,
      ADDRESS: `${post.district}, ${post.title.substring(0, 50)}...`,
      HOTLINE: '+998 71 XXX-XX-XX',
      WORK_TYPE: 'замене/ремонту оборудования',
      START_DATE: threeDaysLater.toLocaleDateString('ru-RU'),
      END_DATE: oneWeekLater.toLocaleDateString('ru-RU'),
      TIME_RANGE: '09:00 - 18:00',
      REPAIR_START: threeDaysLater.toLocaleDateString('ru-RU'),
      REPAIR_END: oneWeekLater.toLocaleDateString('ru-RU'),
    };

    return defaults;
  };

  // Fill template with placeholder values
  const fillTemplate = (template: ResponseTemplate) => {
    let filledTemplate = template.template;
    
    template.placeholders.forEach(placeholder => {
      const value = placeholderValues[placeholder] || `{${placeholder}}`;
      const regex = new RegExp(`{${placeholder}}`, 'g');
      filledTemplate = filledTemplate.replace(regex, value);
    });

    return filledTemplate;
  };

  // Handle template selection
  const handleTemplateSelect = (template: ResponseTemplate) => {
    setSelectedTemplate(template);
    const defaultValues = generateDefaultValues(template);
    setPlaceholderValues(defaultValues);
    setResponseText(fillTemplate(template));
    
    // Set estimated date based on template
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + template.estimatedDays);
    setEstimatedDate(estimatedDate.toISOString().split('T')[0]);
  };

  // Update template when placeholder values change
  useEffect(() => {
    if (selectedTemplate) {
      setResponseText(fillTemplate(selectedTemplate));
    }
  }, [placeholderValues, selectedTemplate]);

  const handlePlaceholderChange = (placeholder: string, value: string) => {
    setPlaceholderValues(prev => ({
      ...prev,
      [placeholder]: value
    }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Скопировано",
        description: "Текст скопирован в буфер обмена",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleSubmit = async () => {
    if (!responseText.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите текст ответа",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const estimatedDateObj = estimatedDate ? new Date(estimatedDate) : undefined;
      await onSubmitResponse(responseText, newStatus, estimatedDateObj);
      onOpenChange(false);
      
      // Reset form
      setSelectedTemplate(null);
      setResponseText("");
      setPlaceholderValues({});
      setEstimatedDate("");
      
      toast({
        title: "Ответ отправлен",
        description: "Ответ на обращение успешно отправлен",
      });
    } catch (error) {
      console.error('Failed to submit response:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить ответ",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Ответ на обращение
          </DialogTitle>
          <DialogDescription>
            Используйте шаблоны для быстрого создания профессионального ответа
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Left Panel - Templates */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Информация об обращении</Label>
              <Card className="mt-2">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{post.author.firstName} {post.author.lastName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{post.district}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{post.category}</span>
                  </div>
                  {post.internalId && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">ID: {post.internalId}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Label className="text-sm font-medium">Шаблоны ответов</Label>
              <ScrollArea className="h-64 mt-2 border rounded-lg">
                <div className="p-4 space-y-2">
                  {relevantTemplates.map((template) => (
                    <Card 
                      key={template.id}
                      className={`cursor-pointer transition-colors hover:bg-accent ${
                        selectedTemplate?.id === template.id ? 'border-primary bg-accent' : ''
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium">{template.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {template.category}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {template.estimatedDays} дней
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Placeholder Editor */}
            {selectedTemplate && selectedTemplate.placeholders.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Настройка параметров</Label>
                <ScrollArea className="h-48 mt-2 border rounded-lg">
                  <div className="p-4 space-y-3">
                    {selectedTemplate.placeholders.map((placeholder) => (
                      <div key={placeholder}>
                        <Label className="text-xs">{placeholder}</Label>
                        <Input
                          value={placeholderValues[placeholder] || ''}
                          onChange={(e) => handlePlaceholderChange(placeholder, e.target.value)}
                          placeholder={`Введите значение для ${placeholder}`}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Right Panel - Response Editor */}
          <div className="space-y-4">
            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">Редактирование</TabsTrigger>
                <TabsTrigger value="preview">Предпросмотр</TabsTrigger>
              </TabsList>
              
              <TabsContent value="edit" className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Текст ответа</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(responseText)}
                      disabled={!responseText}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Копировать
                    </Button>
                  </div>
                  <Textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Введите текст ответа или выберите шаблон"
                    className="min-h-[300px] text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Новый статус</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_progress">В работе</SelectItem>
                        <SelectItem value="resolved">Решено</SelectItem>
                        <SelectItem value="rejected">Отклонено</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Предполагаемая дата решения</Label>
                    <Input
                      type="date"
                      value={estimatedDate}
                      onChange={(e) => setEstimatedDate(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Предпросмотр ответа</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg min-h-[300px]">
                      {responseText || "Выберите шаблон или введите текст ответа"}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!responseText.trim() || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Отправка...
              </div>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Отправить ответ
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
