import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/navigation-header";
import { PostCard } from "@/components/post-card";
import { EnhancedFilterSection } from "@/components/enhanced-filter-section";
import { CreatePostModal } from "@/components/create-post-modal";
import { PostWithAuthor } from "@shared/schema";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  "Дороги", "Коммунальные услуги", "Транспорт", 
  "Безопасность", "Экология", "Благоустройство"
];

const districts = [
  "Юнусабадский", "Сергелийский", "Чиланзарский", 
  "Яшнабадский", "Мирабадский", "Шайхантахурский"
];

export default function ComplaintsPage() {
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    district: "",
    search: "",
    status: "",
    dateRange: "",
    sortBy: "newest"
  });

  const { data: posts = [], isLoading } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.set("category", filters.category);
      if (filters.district) params.set("district", filters.district);
      if (filters.search) params.set("search", filters.search);
      
      const response = await fetch(`/api/posts?${params}`);
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    }
  });

  // Filter posts for complaints only (exclude initiatives)
  const complaints = posts.filter(post => 
    post.category !== "Благоустройство" || !post.title.toLowerCase().includes("инициатива")
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <NavigationHeader 
        onCreatePost={() => setCreatePostOpen(true)}
        showCreateButton={true}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">
              Жалобы граждан
            </h1>
            <p className="text-muted-foreground">
              Все поступившие жалобы и обращения граждан
            </p>
          </div>
          
          <Button
            onClick={() => setCreatePostOpen(true)}
            className="gradient-primary hover-lift text-white mt-4 md:mt-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Создать жалобу
          </Button>
        </div>

        {/* Enhanced Filters */}
        <EnhancedFilterSection
          filters={filters}
          onFiltersChange={setFilters}
          categories={categories}
          districts={districts}
          showStatusFilter={true}
          showAdvanced={true}
        />

        {/* Posts Grid */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-muted-foreground mt-4">Загрузка жалоб...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Жалобы не найдены</p>
            </div>
          ) : (
            complaints.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>
      </div>

      <CreatePostModal
        open={createPostOpen}
        onOpenChange={setCreatePostOpen}
        categories={categories}
        districts={districts}
      />
    </div>
  );
}