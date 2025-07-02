import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { Globe, Users, MessageSquare, CheckCircle } from "lucide-react";

export function LanguageDemo() {
  const { t, language, setLanguage } = useLanguage();

  const demoLanguages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "uz", name: "O'zbek", flag: "🇺🇿" },
    { code: "kaa", name: "Qaraqalpaq", flag: "🏴" },
    { code: "tg", name: "Тоҷикӣ", flag: "🇹🇯" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Current Language Display */}
      <Card className="gradient-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            {t("language")}: {language.toUpperCase()}
          </CardTitle>
          <CardDescription>
            {t("currentLanguage")}: {demoLanguages.find(l => l.code === language)?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">{t("welcomeMessage")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm">{t("totalUsers")}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-500" />
              <span className="text-sm">{t("complaints")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Switcher */}
      <Card>
        <CardHeader>
          <CardTitle>Test Language Switching</CardTitle>
          <CardDescription>
            Click any language to see the interface change instantly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {demoLanguages.map((lang) => (
              <Button
                key={lang.code}
                variant={language === lang.code ? "default" : "outline"}
                onClick={() => setLanguage(lang.code as any)}
                className="justify-start gap-2"
                size="sm"
              >
                <span>{lang.flag}</span>
                <span className="text-xs">{lang.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Translation Examples */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Translation Examples</CardTitle>
          <CardDescription>
            Common phrases in current language: {demoLanguages.find(l => l.code === language)?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Badge variant="outline">{t("new")}</Badge>
              <p className="text-xs text-muted-foreground">Status</p>
            </div>
            <div className="space-y-1">
              <Badge variant="outline">{t("inProgress")}</Badge>
              <p className="text-xs text-muted-foreground">Status</p>
            </div>
            <div className="space-y-1">
              <Badge variant="outline">{t("resolved")}</Badge>
              <p className="text-xs text-muted-foreground">Status</p>
            </div>
            <div className="space-y-1">
              <Badge variant="outline">{t("submit")}</Badge>
              <p className="text-xs text-muted-foreground">Action</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}