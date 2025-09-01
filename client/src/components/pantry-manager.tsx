import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Plus, Edit, AlertTriangle, Clock, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import type { PantryItem } from "@shared/schema";

export default function PantryManager() {
  const queryClient = useQueryClient();

  const { data: pantryItems = [], isLoading } = useQuery({
    queryKey: ["/api/pantry-items"],
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PantryItem> }) => {
      const response = await apiRequest("PUT", `/api/pantry-items/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pantry-items"] });
    },
  });

  const addToGroceryListMutation = useMutation({
    mutationFn: async (item: any) => {
      const response = await apiRequest("POST", "/api/grocery-items", item);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grocery-items"] });
    },
  });

  const getItemsByCategory = () => {
    const itemsByCategory: Record<string, PantryItem[]> = {};
    pantryItems.forEach((item: PantryItem) => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    });
    return itemsByCategory;
  };

  const getStockStats = () => {
    const lowStock = pantryItems.filter((item: PantryItem) => item.stockLevel === 'low').length;
    const expiringSoon = pantryItems.filter((item: PantryItem) => {
      if (!item.expirationDate) return false;
      const expDate = new Date(item.expirationDate);
      const today = new Date();
      const daysUntilExp = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExp <= 7 && daysUntilExp >= 0;
    }).length;
    const total = pantryItems.length;
    
    return { lowStock, expiringSoon, total };
  };

  const getStockLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-primary';
      case 'medium':
        return 'bg-accent';
      case 'low':
        return 'bg-accent';
      case 'empty':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'canned goods':
        return 'canned-food';
      case 'grains & pasta':
        return 'bread-slice';
      case 'spices & seasonings':
        return 'pepper-hot';
      case 'oils & vinegars':
        return 'wine-bottle';
      case 'baking supplies':
        return 'birthday-cake';
      default:
        return 'box';
    }
  };

  const addToGroceryList = (item: PantryItem) => {
    const currentWeek = "2024-01-15"; // This would be dynamic in a real app
    
    addToGroceryListMutation.mutate({
      name: item.name,
      category: item.category,
      quantity: "1 unit",
      preferredStore: "Whole Foods",
      isCompleted: false,
      isFromMeal: false,
      weekStartDate: currentWeek,
    });
  };

  const stats = getStockStats();
  const itemsByCategory = getItemsByCategory();

  if (isLoading) {
    return (
      <div className="p-4" data-testid="loading-pantry">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="pantry-manager">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold" data-testid="text-pantry-title">Pantry Inventory</h2>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-scan-item"
          >
            <Camera className="mr-2" size={16} />
            Scan Item
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="text-accent text-2xl mb-2 mx-auto" />
              <p className="text-2xl font-bold text-card-foreground" data-testid="text-low-stock-count">
                {stats.lowStock}
              </p>
              <p className="text-xs text-muted-foreground">Low Stock</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="text-destructive text-2xl mb-2 mx-auto" />
              <p className="text-2xl font-bold text-card-foreground" data-testid="text-expiring-count">
                {stats.expiringSoon}
              </p>
              <p className="text-xs text-muted-foreground">Expiring Soon</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Box className="text-primary text-2xl mb-2 mx-auto" />
              <p className="text-2xl font-bold text-card-foreground" data-testid="text-total-items">
                {stats.total}
              </p>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </CardContent>
          </Card>
        </div>

        {/* Pantry Categories */}
        {Object.entries(itemsByCategory).map(([category, items]) => (
          <div key={category} className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-card-foreground flex items-center">
                <i className={`fas fa-${getCategoryIcon(category)} text-accent mr-2`}></i>
                {category}
              </h3>
              <button 
                className="text-xs text-primary hover:text-primary/80 transition-colors"
                data-testid={`button-add-to-category-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              >
                <Plus className="mr-1" size={12} />
                Add
              </button>
            </div>
            
            <div className="space-y-2">
              {items.map((item) => (
                <Card key={item.id} data-testid={`pantry-item-${item.id}`}>
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className={`w-3 h-3 rounded-full ${getStockLevelColor(item.stockLevel)}`}
                        data-testid={`stock-indicator-${item.id}`}
                      ></div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground" data-testid={`text-item-name-${item.id}`}>
                          {item.name}
                        </p>
                        <p className={`text-xs ${
                          item.stockLevel === 'empty' ? 'text-destructive' : 'text-muted-foreground'
                        }`} data-testid={`text-item-details-${item.id}`}>
                          {item.stockLevel === 'empty' ? (
                            <>Out of stock • Needed for this week</>
                          ) : (
                            <>
                              {item.expirationDate && `Expires: ${new Date(item.expirationDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                              {item.expirationDate && item.quantity && ' • '}
                              {item.quantity}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    {item.stockLevel === 'empty' ? (
                      <Button 
                        size="sm"
                        onClick={() => addToGroceryList(item)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={addToGroceryListMutation.isPending}
                        data-testid={`button-add-to-list-${item.id}`}
                      >
                        Add to List
                      </Button>
                    ) : (
                      <button 
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                        data-testid={`button-edit-item-${item.id}`}
                      >
                        <Edit className="text-muted-foreground" size={12} />
                      </button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
