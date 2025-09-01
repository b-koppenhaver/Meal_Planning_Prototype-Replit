import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Share, Trash2, Store, Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import type { GroceryItem, Store as StoreType } from "@shared/schema";

export default function GroceryList() {
  const [currentWeek] = useState("2024-01-15");
  const [selectedStore, setSelectedStore] = useState("Whole Foods");
  const [newItemName, setNewItemName] = useState("");
  const [showAddStore, setShowAddStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const queryClient = useQueryClient();

  const { data: groceryItems = [], isLoading } = useQuery({
    queryKey: ["/api/grocery-items", currentWeek],
    enabled: !!currentWeek,
  });

  const { data: stores = [] } = useQuery({
    queryKey: ["/api/stores"],
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<GroceryItem> }) => {
      const response = await apiRequest("PUT", `/api/grocery-items/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grocery-items", currentWeek] });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (item: any) => {
      const response = await apiRequest("POST", "/api/grocery-items", item);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grocery-items", currentWeek] });
      setNewItemName("");
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/grocery-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grocery-items", currentWeek] });
    },
  });

  const addStoreMutation = useMutation({
    mutationFn: async (store: any) => {
      const response = await apiRequest("POST", "/api/stores", store);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      setNewStoreName("");
      setShowAddStore(false);
    },
  });

  const deleteStoreMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/stores/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
    },
  });

  const toggleItemCompleted = (item: GroceryItem) => {
    updateItemMutation.mutate({
      id: item.id,
      updates: { isCompleted: !item.isCompleted }
    });
  };

  const clearCompleted = () => {
    const completedItems = groceryItems.filter((item: GroceryItem) => item.isCompleted);
    completedItems.forEach((item: GroceryItem) => {
      deleteItemMutation.mutate(item.id);
    });
  };

  const addCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    addItemMutation.mutate({
      name: newItemName,
      category: "Custom",
      quantity: "1 unit",
      preferredStore: selectedStore,
      isCompleted: false,
      isFromMeal: false,
      weekStartDate: currentWeek,
    });
  };

  const addNewStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;

    addStoreMutation.mutate({
      name: newStoreName,
      categories: ["pantry", "produce"],
      isPreferred: false,
    });
  };

  const getItemsByStore = () => {
    const itemsByStore: Record<string, GroceryItem[]> = {};
    groceryItems.forEach((item: GroceryItem) => {
      if (!itemsByStore[item.preferredStore]) {
        itemsByStore[item.preferredStore] = [];
      }
      itemsByStore[item.preferredStore].push(item);
    });
    return itemsByStore;
  };

  const getItemsByCategory = (storeItems: GroceryItem[]) => {
    const itemsByCategory: Record<string, GroceryItem[]> = {};
    storeItems.forEach((item) => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    });
    return itemsByCategory;
  };

  const getTotalStats = () => {
    const total = groceryItems.length;
    const completed = groceryItems.filter((item: GroceryItem) => item.isCompleted).length;
    return { total, completed };
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "produce":
        return "leaf";
      case "meat & seafood":
        return "drumstick-bite";
      case "dairy":
        return "milk";
      case "pantry essentials":
      case "grains & pasta":
        return "box";
      default:
        return "shopping-basket";
    }
  };

  const stats = getTotalStats();
  const itemsByStore = getItemsByStore();

  if (isLoading) {
    return (
      <div className="p-4" data-testid="loading-grocery-list">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="grocery-list">
      {/* Store Selection */}
      <div className="p-4 bg-secondary/5 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold" data-testid="text-grocery-title">Grocery List</h2>
          <div className="flex items-center space-x-2">
            <Button 
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              data-testid="button-share-list"
            >
              <Share className="mr-1" size={16} />
              Share
            </Button>
            <button 
              onClick={clearCompleted}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              data-testid="button-clear-completed"
            >
              <Trash2 className="text-muted-foreground" size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex space-x-2 overflow-x-auto custom-scrollbar mb-3">
          {stores.map((store: StoreType) => (
            <div key={store.id} className="flex-shrink-0 flex items-center space-x-1">
              <button
                onClick={() => setSelectedStore(store.name)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStore === store.name
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                data-testid={`button-store-${store.name.toLowerCase().replace(' ', '-')}`}
              >
                <Store className="mr-2" size={16} />
                {store.name}
              </button>
              {!store.isPreferred && (
                <button
                  onClick={() => deleteStoreMutation.mutate(store.id)}
                  className="p-1 rounded hover:bg-destructive/20 transition-colors"
                  data-testid={`button-delete-store-${store.id}`}
                >
                  <X className="text-destructive" size={12} />
                </button>
              )}
            </div>
          ))}
          
          {showAddStore ? (
            <form onSubmit={addNewStore} className="flex-shrink-0 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Store name..."
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
                data-testid="input-new-store-name"
                autoFocus
              />
              <button
                type="submit"
                disabled={!newStoreName.trim() || addStoreMutation.isPending}
                className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                data-testid="button-save-store"
              >
                <Check size={12} />
              </button>
              <button
                type="button"
                onClick={() => { setShowAddStore(false); setNewStoreName(""); }}
                className="p-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80"
                data-testid="button-cancel-store"
              >
                <X size={12} />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowAddStore(true)}
              className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              data-testid="button-add-store"
            >
              <Plus className="mr-2" size={16} />
              Add Store
            </button>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground" data-testid="text-list-stats">
          <span>{stats.total} items • {stats.completed} completed</span>
        </div>
      </div>

      {/* Grocery Categories */}
      <div className="p-4">
        {Object.entries(itemsByStore).map(([storeName, storeItems]) => {
          if (selectedStore !== "All" && selectedStore !== storeName) return null;
          
          const itemsByCategory = getItemsByCategory(storeItems);
          
          return (
            <div key={storeName} className="mb-8">
              {selectedStore === "All" && (
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Store className="mr-2 text-primary" />
                  {storeName}
                </h3>
              )}
              
              {Object.entries(itemsByCategory).map(([category, items]) => (
                <div key={category} className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-card-foreground flex items-center">
                      <i className={`fas fa-${getCategoryIcon(category)} text-primary mr-2`}></i>
                      {category}
                    </h4>
                    <span className="text-xs text-muted-foreground">{storeName}</span>
                  </div>
                  
                  <div className="space-y-2">
                    {items.map((item) => (
                      <Card 
                        key={item.id} 
                        className={`grocery-item ${item.isCompleted ? 'checked' : ''} transition-all`}
                        data-testid={`item-${item.id}`}
                      >
                        <CardContent className="flex items-center space-x-3 p-3">
                          <button
                            onClick={() => toggleItemCompleted(item)}
                            className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-colors ${
                              item.isCompleted
                                ? "border-primary bg-primary"
                                : "border-border hover:border-primary"
                            }`}
                            data-testid={`button-toggle-${item.id}`}
                          >
                            {item.isCompleted && (
                              <Check className="text-primary-foreground" size={12} />
                            )}
                          </button>
                          
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              item.isCompleted ? 'text-muted-foreground line-through' : 'text-card-foreground'
                            }`} data-testid={`text-item-name-${item.id}`}>
                              {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground" data-testid={`text-item-details-${item.id}`}>
                              {item.quantity} {item.isFromMeal && '• For meal'}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button 
                              className="text-xs text-muted-foreground hover:text-accent transition-colors"
                              data-testid={`button-change-store-${item.id}`}
                            >
                              Change Store
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        {/* Add Custom Item */}
        <Card className="border-2 border-dashed border-border">
          <CardContent className="p-4">
            <form onSubmit={addCustomItem} className="flex items-center space-x-3">
              <i className="fas fa-plus text-muted-foreground"></i>
              <Input
                type="text"
                placeholder="Add custom item..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="flex-1 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                data-testid="input-add-custom-item"
              />
              {newItemName && (
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={addItemMutation.isPending}
                  data-testid="button-add-item"
                >
                  Add
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
