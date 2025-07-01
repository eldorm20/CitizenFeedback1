import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, X, Calendar, MapPin, Tag, TrendingUp } from "lucide-react";

interface EnhancedFilterSectionProps {
  filters: {
    category: string;
    district: string;
    search: string;
    status?: string;
    dateRange?: string;
    sortBy?: string;
  };
  onFiltersChange: (filters: any) => void;
  categories: string[];
  districts: string[];
  showStatusFilter?: boolean;
  showAdvanced?: boolean;
}

export function EnhancedFilterSection({ 
  filters, 
  onFiltersChange, 
  categories, 
  districts,
  showStatusFilter = false,
  showAdvanced = true
}: EnhancedFilterSectionProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const updateFilter = (key: string, value: string) => {
    const actualValue = value === "all" ? "" : value;
    onFiltersChange({ ...filters, [key]: actualValue });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: "",
      district: "",
      search: "",
      status: "",
      dateRange: "",
      sortBy: "newest"
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== "newest");

  return (
    <Card className="glass-effect">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Фильтры и поиск
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Очистить
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Поиск по названию или описанию..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10 glass-input"
          />
        </div>

        {/* Primary Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            value={filters.category === "" ? "all" : filters.category}
            onValueChange={(value) => updateFilter("category", value)}
          >
            <SelectTrigger className="glass-input">
              <Tag className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Все категории" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.district === "" ? "all" : filters.district}
            onValueChange={(value) => updateFilter("district", value)}
          >
            <SelectTrigger className="glass-input">
              <MapPin className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Все районы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все районы</SelectItem>
              {districts.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.sortBy || "newest"}
            onValueChange={(value) => updateFilter("sortBy", value)}
          >
            <SelectTrigger className="glass-input">
              <TrendingUp className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Сначала новые</SelectItem>
              <SelectItem value="oldest">Сначала старые</SelectItem>
              <SelectItem value="popular">По популярности</SelectItem>
              <SelectItem value="comments">По комментариям</SelectItem>
              <SelectItem value="status">По статусу</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter for Government/Admin */}
        {showStatusFilter && (
          <Select
            value={filters.status === "" ? "all" : filters.status}
            onValueChange={(value) => updateFilter("status", value)}
          >
            <SelectTrigger className="glass-input">
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="new">Новые</SelectItem>
              <SelectItem value="in_progress">В работе</SelectItem>
              <SelectItem value="resolved">Решенные</SelectItem>
              <SelectItem value="rejected">Отклоненные</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Advanced Filters Toggle */}
        {showAdvanced && (
          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm"
            >
              {showAdvancedFilters ? "Скрыть" : "Показать"} расширенные фильтры
            </Button>
          </div>
        )}

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                value={filters.dateRange || "all"}
                onValueChange={(value) => updateFilter("dateRange", value)}
              >
                <SelectTrigger className="glass-input">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Период" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все время</SelectItem>
                  <SelectItem value="today">Сегодня</SelectItem>
                  <SelectItem value="week">Эта неделя</SelectItem>
                  <SelectItem value="month">Этот месяц</SelectItem>
                  <SelectItem value="quarter">Этот квартал</SelectItem>
                  <SelectItem value="year">Этот год</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2">
            {filters.category && (
              <Badge variant="secondary" className="text-xs">
                {filters.category}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => updateFilter("category", "")}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}
            {filters.district && (
              <Badge variant="secondary" className="text-xs">
                {filters.district}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => updateFilter("district", "")}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}
            {filters.status && (
              <Badge variant="secondary" className="text-xs">
                Статус: {filters.status}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => updateFilter("status", "")}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}