import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface FilterSectionProps {
  filters: {
    category: string;
    district: string;
    search: string;
  };
  onFiltersChange: (filters: any) => void;
  categories: string[];
  districts: string[];
}

export function FilterSection({ 
  filters, 
  onFiltersChange, 
  categories, 
  districts 
}: FilterSectionProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 mb-8">
      <div className="max-w-7xl mx-auto">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Поиск жалоб..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  className="pl-12 glass-input"
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.category === "" ? "default" : "outline"}
                onClick={() => updateFilter("category", "")}
                className={filters.category === "" ? "gradient-primary" : "glass-input"}
              >
                Все категории
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={filters.category === category ? "default" : "outline"}
                  onClick={() => updateFilter("category", category)}
                  className={filters.category === category ? "gradient-primary" : "glass-input"}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* District and Sort */}
            <div className="flex items-center space-x-2">
              <Select
                value={filters.district}
                onValueChange={(value) => updateFilter("district", value)}
              >
                <SelectTrigger className="w-48 glass-input">
                  <SelectValue placeholder="Выберите район" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все районы</SelectItem>
                  {districts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select defaultValue="new">
                <SelectTrigger className="w-32 glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Новые</SelectItem>
                  <SelectItem value="popular">Популярные</SelectItem>
                  <SelectItem value="resolved">Решенные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
