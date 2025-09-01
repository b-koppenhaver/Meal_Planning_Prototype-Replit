import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Star, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import type { Recipe } from "@shared/schema";

export default function RecipeDatabase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const queryClient = useQueryClient();

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ["/api/recipes"],
  });

  const addMealMutation = useMutation({
    mutationFn: async (mealPlan: any) => {
      const response = await apiRequest("POST", "/api/meal-plans", mealPlan);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans"] });
    },
  });

  const rateRecipeMutation = useMutation({
    mutationFn: async (rating: any) => {
      const response = await apiRequest("POST", "/api/recipe-ratings", rating);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
    },
  });

  const filters = ["All", "Favorites", "Low Effort", "Italian", "Mexican", "Indian", "American"];

  const filteredRecipes = recipes.filter((recipe: Recipe) => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Favorites") return getAverageRating(recipe.id) === 3;
    if (selectedFilter === "Low Effort") return recipe.effortLevel === "low";
    
    return recipe.cuisine.toLowerCase() === selectedFilter.toLowerCase();
  });

  const getAverageRating = (recipeId: string) => {
    // This would normally fetch from recipe ratings API and calculate average
    // For now, return a mock rating based on recipe ID
    const hash = recipeId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return (hash % 3) + 1;
  };

  const renderStars = (rating: number, recipeId: string, interactive = false) => {
    return Array.from({ length: 3 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={`rating-star cursor-pointer ${
          i < rating ? "text-accent fill-accent" : "text-muted-foreground"
        }`}
        onClick={interactive ? () => handleRating(recipeId, i + 1) : undefined}
        data-testid={`star-${recipeId}-${i + 1}`}
      />
    ));
  };

  const handleRating = (recipeId: string, rating: number) => {
    rateRecipeMutation.mutate({
      recipeId,
      familyMember: "User", // This would be dynamic in a real app
      rating
    });
  };

  const addToWeek = (recipe: Recipe) => {
    const currentWeek = "2024-01-15"; // This would be dynamic in a real app
    
    addMealMutation.mutate({
      weekStartDate: currentWeek,
      dayOfWeek: 1, // Monday
      mealType: "dinner",
      recipeId: recipe.id,
      isLeftover: false
    });
  };

  if (isLoading) {
    return (
      <div className="p-4" data-testid="loading-recipes">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-48 bg-muted rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="recipe-database">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold" data-testid="text-recipes-title">Recipe Database</h2>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-add-recipe"
          >
            <Plus className="mr-2" size={16} />
            Add Recipe
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-recipes"
            />
          </div>
          
          <div className="flex space-x-2 overflow-x-auto custom-scrollbar">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === filter
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                data-testid={`filter-${filter.toLowerCase().replace(' ', '-')}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecipes.map((recipe: Recipe) => {
            const rating = getAverageRating(recipe.id);
            
            return (
              <Card key={recipe.id} className="meal-card overflow-hidden" data-testid={`recipe-card-${recipe.id}`}>
                {recipe.imageUrl && (
                  <img 
                    src={recipe.imageUrl} 
                    alt={recipe.name}
                    className="w-full h-32 object-cover"
                    data-testid={`img-recipe-${recipe.id}`}
                  />
                )}
                
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-card-foreground" data-testid={`text-recipe-name-${recipe.id}`}>
                      {recipe.name}
                    </h3>
                    <div className="flex space-x-1" data-testid={`rating-${recipe.id}`}>
                      {renderStars(rating, recipe.id, true)}
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3" data-testid={`text-recipe-details-${recipe.id}`}>
                    {recipe.cuisine} • {recipe.effortLevel} effort • Serves {recipe.servings}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2 flex-wrap">
                      {rating === 3 && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                          Family Favorite
                        </span>
                      )}
                      {recipe.makesLeftovers && (
                        <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
                          Makes Leftovers
                        </span>
                      )}
                      {recipe.nonPerishableBase && (
                        <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
                          Non-Perishable Base
                        </span>
                      )}
                      {recipe.effortLevel === "low" && (
                        <span className="text-xs bg-muted/60 text-muted-foreground px-2 py-1 rounded-full">
                          Low Effort
                        </span>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => addToWeek(recipe)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      disabled={addMealMutation.isPending}
                      data-testid={`button-add-to-week-${recipe.id}`}
                    >
                      <CalendarPlus className="text-primary" size={16} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12" data-testid="no-recipes-found">
            <p className="text-muted-foreground">No recipes found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
