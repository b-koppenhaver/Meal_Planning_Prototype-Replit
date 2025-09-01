import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Plus, Wand2, History, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import type { MealPlan, Recipe } from "@shared/schema";

export default function MealPlanner() {
  const [currentWeek, setCurrentWeek] = useState("2024-01-15");
  const queryClient = useQueryClient();

  // Get current week date range for display
  const getWeekRange = (startDate: string) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}-${end.getDate()}, ${start.getFullYear()}`;
  };

  const { data: mealPlans = [], isLoading: loadingMealPlans } = useQuery({
    queryKey: ["/api/meal-plans", currentWeek],
    enabled: !!currentWeek,
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ["/api/recipes"],
  });

  const generateGroceryListMutation = useMutation({
    mutationFn: async (weekStartDate: string) => {
      const response = await apiRequest("POST", `/api/grocery-lists/generate/${weekStartDate}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grocery-items"] });
    },
  });

  const addMealMutation = useMutation({
    mutationFn: async (mealPlan: any) => {
      const response = await apiRequest("POST", "/api/meal-plans", mealPlan);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans", currentWeek] });
    },
  });

  const navigateWeek = (direction: 'prev' | 'next') => {
    const current = new Date(currentWeek);
    const newDate = new Date(current);
    newDate.setDate(current.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate.toISOString().split('T')[0]);
  };

  const generateWeeklyPlan = async () => {
    await generateGroceryListMutation.mutateAsync(currentWeek);
  };

  const getDayMeals = (dayOfWeek: number) => {
    return mealPlans.filter((plan: MealPlan) => plan.dayOfWeek === dayOfWeek);
  };

  const getMealForType = (dayOfWeek: number, mealType: string) => {
    return mealPlans.find((plan: MealPlan) => 
      plan.dayOfWeek === dayOfWeek && plan.mealType === mealType
    );
  };

  const getRecipeById = (recipeId: string) => {
    return recipes.find((recipe: Recipe) => recipe.id === recipeId);
  };

  const getAverageRating = (recipeId: string) => {
    // This would normally fetch from recipe ratings API
    // For now, return a mock rating
    return Math.floor(Math.random() * 3) + 1;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 3 }, (_, i) => (
      <Star
        key={i}
        size={12}
        className={`rating-star ${
          i < rating ? "text-accent fill-accent" : "text-muted-foreground"
        }`}
      />
    ));
  };

  const weekDays = [
    { name: "Monday", short: "MON", dayOfWeek: 1 },
    { name: "Tuesday", short: "TUE", dayOfWeek: 2 },
    { name: "Wednesday", short: "WED", dayOfWeek: 3 },
    { name: "Thursday", short: "THU", dayOfWeek: 4 },
    { name: "Friday", short: "FRI", dayOfWeek: 5 },
    { name: "Saturday", short: "SAT", dayOfWeek: 6 },
    { name: "Sunday", short: "SUN", dayOfWeek: 0 },
  ];

  const mealTypes = ["breakfast", "lunch", "dinner"];

  if (loadingMealPlans) {
    return (
      <div className="p-4" data-testid="loading-meal-plans">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="h-48 bg-muted rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="meal-planner">
      {/* Week Overview */}
      <div className="p-4 bg-primary/5 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigateWeek('prev')}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              data-testid="button-previous-week"
            >
              <ChevronLeft className="text-muted-foreground" />
            </button>
            <h2 className="text-xl font-semibold" data-testid="text-week-range">
              {getWeekRange(currentWeek)}
            </h2>
            <button 
              onClick={() => navigateWeek('next')}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              data-testid="button-next-week"
            >
              <ChevronRight className="text-muted-foreground" />
            </button>
          </div>
          <Button 
            onClick={generateWeeklyPlan}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            disabled={generateGroceryListMutation.isPending}
            data-testid="button-generate-plan"
          >
            <Wand2 className="mr-2" size={16} />
            Generate Plan
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center">
          {weekDays.map((day) => (
            <div key={day.short} className="text-xs font-medium text-muted-foreground py-1">
              {day.short}
            </div>
          ))}
        </div>
      </div>

      {/* Daily Meal Cards */}
      <div className="p-4 space-y-4">
        {weekDays.map((day) => {
          const dayDate = new Date(currentWeek);
          dayDate.setDate(dayDate.getDate() + (day.dayOfWeek === 0 ? 6 : day.dayOfWeek - 1));
          
          return (
            <Card key={day.dayOfWeek} className="meal-card" data-testid={`card-day-${day.dayOfWeek}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-card-foreground" data-testid={`text-day-${day.dayOfWeek}`}>
                    {day.name}, {dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </h3>
                  <button 
                    className="text-muted-foreground hover:text-accent transition-colors"
                    data-testid={`button-add-meal-${day.dayOfWeek}`}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {mealTypes.map((mealType) => {
                  const meal = getMealForType(day.dayOfWeek, mealType);
                  const recipe = meal?.recipeId ? getRecipeById(meal.recipeId) : null;
                  const rating = recipe ? getAverageRating(recipe.id) : 0;

                  return (
                    <div key={mealType} className="mb-4 p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground capitalize">
                          {mealType}
                        </span>
                        {recipe && (
                          <div className="flex space-x-1" data-testid={`rating-${recipe.id}`}>
                            {renderStars(rating)}
                          </div>
                        )}
                      </div>

                      {meal && recipe ? (
                        <div data-testid={`meal-${meal.id}`}>
                          <p className="text-sm text-card-foreground" data-testid={`text-meal-name-${meal.id}`}>
                            {recipe.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {recipe.cuisine} • {recipe.prepTime} min
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            {recipe.makesLeftovers && (
                              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                                Makes Leftovers
                              </span>
                            )}
                            {recipe.nonPerishableBase && (
                              <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
                                Non-Perishable Base
                              </span>
                            )}
                            {rating === 3 && (
                              <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
                                Family Favorite
                              </span>
                            )}
                          </div>
                        </div>
                      ) : meal && meal.customMealName ? (
                        <div data-testid={`custom-meal-${meal.id}`}>
                          <p className="text-sm text-card-foreground">
                            {meal.customMealName}
                          </p>
                          {meal.isLeftover && (
                            <div className="flex items-center mt-1">
                              <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
                                Leftovers
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground italic">Click to add a meal</p>
                          <button 
                            className="text-xs text-primary hover:text-primary/80 transition-colors"
                            data-testid={`button-suggest-meal-${day.dayOfWeek}-${mealType}`}
                          >
                            <i className="fas fa-lightbulb mr-1"></i>Suggest
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <Button 
            onClick={generateWeeklyPlan}
            className="p-4 bg-primary text-primary-foreground rounded-xl text-left hover:bg-primary/90 h-auto flex-col items-start"
            disabled={generateGroceryListMutation.isPending}
            data-testid="button-quick-generate"
          >
            <Wand2 className="text-xl mb-2" />
            <p className="font-medium">Quick Generate</p>
            <p className="text-xs opacity-90">AI meal suggestions</p>
          </Button>
          <Button 
            variant="secondary"
            className="p-4 bg-secondary text-secondary-foreground rounded-xl text-left hover:bg-secondary/90 h-auto flex-col items-start"
            data-testid="button-view-history"
          >
            <History className="text-xl mb-2" />
            <p className="font-medium">Meal History</p>
            <p className="text-xs opacity-90">Previous weeks</p>
          </Button>
        </div>
      </div>
    </div>
  );
}
