import { 
  type Recipe, type InsertRecipe,
  type MealPlan, type InsertMealPlan,
  type RecipeRating, type InsertRecipeRating,
  type GroceryItem, type InsertGroceryItem,
  type PantryItem, type InsertPantryItem,
  type Store, type InsertStore,
  type IngredientStorePreference, type InsertIngredientStorePreference
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Recipes
  getRecipes(): Promise<Recipe[]>;
  getRecipeById(id: string): Promise<Recipe | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: string, recipe: Partial<InsertRecipe>): Promise<Recipe | undefined>;
  deleteRecipe(id: string): Promise<boolean>;

  // Meal Plans
  getMealPlansForWeek(weekStartDate: string): Promise<MealPlan[]>;
  createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan>;
  updateMealPlan(id: string, mealPlan: Partial<InsertMealPlan>): Promise<MealPlan | undefined>;
  deleteMealPlan(id: string): Promise<boolean>;

  // Recipe Ratings
  getRecipeRatings(recipeId: string): Promise<RecipeRating[]>;
  createRecipeRating(rating: InsertRecipeRating): Promise<RecipeRating>;
  updateRecipeRating(id: string, rating: Partial<InsertRecipeRating>): Promise<RecipeRating | undefined>;

  // Grocery Items
  getGroceryItemsForWeek(weekStartDate: string): Promise<GroceryItem[]>;
  createGroceryItem(item: InsertGroceryItem): Promise<GroceryItem>;
  updateGroceryItem(id: string, item: Partial<InsertGroceryItem>): Promise<GroceryItem | undefined>;
  deleteGroceryItem(id: string): Promise<boolean>;

  // Pantry Items
  getPantryItems(): Promise<PantryItem[]>;
  createPantryItem(item: InsertPantryItem): Promise<PantryItem>;
  updatePantryItem(id: string, item: Partial<InsertPantryItem>): Promise<PantryItem | undefined>;
  deletePantryItem(id: string): Promise<boolean>;

  // Stores
  getStores(): Promise<Store[]>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: string, store: Partial<InsertStore>): Promise<Store | undefined>;
  deleteStore(id: string): Promise<boolean>;

  // Ingredient Store Preferences
  getIngredientStorePreferences(ingredient?: string): Promise<IngredientStorePreference[]>;
  createIngredientStorePreference(preference: InsertIngredientStorePreference): Promise<IngredientStorePreference>;
  updateIngredientStorePreference(id: string, preference: Partial<InsertIngredientStorePreference>): Promise<IngredientStorePreference | undefined>;
  deleteIngredientStorePreference(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private recipes: Map<string, Recipe> = new Map();
  private mealPlans: Map<string, MealPlan> = new Map();
  private recipeRatings: Map<string, RecipeRating> = new Map();
  private groceryItems: Map<string, GroceryItem> = new Map();
  private pantryItems: Map<string, PantryItem> = new Map();
  private stores: Map<string, Store> = new Map();
  private ingredientStorePreferences: Map<string, IngredientStorePreference> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize with some default stores
    const defaultStores: InsertStore[] = [
      { name: "Whole Foods", categories: ["produce", "meat", "dairy", "pantry"], isPreferred: true },
      { name: "Target", categories: ["pantry", "frozen", "household"], isPreferred: false },
      { name: "Costco", categories: ["bulk", "meat", "pantry"], isPreferred: false },
    ];

    defaultStores.forEach(store => {
      const id = randomUUID();
      this.stores.set(id, { ...store, id });
    });

    // Initialize with some default recipes
    const defaultRecipes: InsertRecipe[] = [
      {
        name: "Spaghetti Carbonara",
        cuisine: "Italian",
        effortLevel: "medium",
        servings: 4,
        ingredients: ["spaghetti pasta", "eggs", "parmesan cheese", "bacon", "black pepper"],
        instructions: "Cook pasta, fry bacon, mix with eggs and cheese, combine with pasta.",
        tags: ["dinner", "pasta", "quick"],
        makesLeftovers: true,
        nonPerishableBase: true,
        imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop"
      },
      {
        name: "Chicken Tikka Masala",
        cuisine: "Indian",
        effortLevel: "high",
        servings: 6,
        ingredients: ["chicken breast", "coconut milk", "tomato sauce", "garam masala", "basmati rice"],
        instructions: "Marinate chicken, cook in spiced tomato sauce, serve with rice.",
        tags: ["dinner", "curry", "spicy"],
        makesLeftovers: true,
        nonPerishableBase: true,
        imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop"
      },
      {
        name: "Simple Pasta with Marinara",
        cuisine: "Italian",
        effortLevel: "low",
        servings: 2,
        ingredients: ["pasta", "marinara sauce", "parmesan cheese", "basil"],
        instructions: "Cook pasta, heat sauce, combine and serve with cheese.",
        tags: ["dinner", "simple", "quick"],
        makesLeftovers: false,
        nonPerishableBase: true,
        imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&h=600&fit=crop"
      },
      {
        name: "Beef Tacos",
        cuisine: "Mexican",
        effortLevel: "medium",
        servings: 4,
        ingredients: ["ground beef", "taco shells", "lettuce", "tomatoes", "cheese", "sour cream"],
        instructions: "Cook ground beef with spices, warm taco shells, assemble with toppings.",
        tags: ["dinner", "mexican", "family-friendly"],
        makesLeftovers: true,
        nonPerishableBase: false,
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop"
      }
    ];

    defaultRecipes.forEach(recipe => {
      const id = randomUUID();
      this.recipes.set(id, { ...recipe, id, createdAt: new Date() });
    });

    // Initialize with some default pantry items
    const defaultPantryItems: InsertPantryItem[] = [
      { name: "Diced Tomatoes", category: "Canned Goods", quantity: "4 cans", expirationDate: "2024-03-15", stockLevel: "high" },
      { name: "Coconut Milk", category: "Canned Goods", quantity: "1 can", expirationDate: "2024-02-28", stockLevel: "low" },
      { name: "Basmati Rice", category: "Grains & Pasta", quantity: "2 lbs", expirationDate: "2024-12-31", stockLevel: "high" },
      { name: "Spaghetti", category: "Grains & Pasta", quantity: "0 boxes", expirationDate: null, stockLevel: "empty" },
    ];

    defaultPantryItems.forEach(item => {
      const id = randomUUID();
      const now = new Date();
      this.pantryItems.set(id, { ...item, id, createdAt: now, updatedAt: now });
    });

    // Initialize ingredient store preferences
    const storeArray = Array.from(this.stores.values());
    const wholeFoods = storeArray.find(s => s.name === "Whole Foods");
    const target = storeArray.find(s => s.name === "Target");
    const costco = storeArray.find(s => s.name === "Costco");

    if (wholeFoods && target && costco) {
      const defaultPreferences: InsertIngredientStorePreference[] = [
        { ingredient: "chicken breast", storeId: wholeFoods.id, preferenceRank: 1 },
        { ingredient: "chicken breast", storeId: costco.id, preferenceRank: 2 },
        { ingredient: "ground beef", storeId: costco.id, preferenceRank: 1 },
        { ingredient: "ground beef", storeId: wholeFoods.id, preferenceRank: 2 },
        { ingredient: "spaghetti pasta", storeId: target.id, preferenceRank: 1 },
        { ingredient: "spaghetti pasta", storeId: wholeFoods.id, preferenceRank: 2 },
        { ingredient: "marinara sauce", storeId: target.id, preferenceRank: 1 },
        { ingredient: "marinara sauce", storeId: wholeFoods.id, preferenceRank: 2 },
        { ingredient: "parmesan cheese", storeId: wholeFoods.id, preferenceRank: 1 },
        { ingredient: "parmesan cheese", storeId: target.id, preferenceRank: 2 },
      ];

      defaultPreferences.forEach(pref => {
        const id = randomUUID();
        this.ingredientStorePreferences.set(id, { ...pref, id, createdAt: new Date() });
      });
    }
  }

  // Recipes
  async getRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async getRecipeById(id: string): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const id = randomUUID();
    const newRecipe: Recipe = { ...recipe, id, createdAt: new Date() };
    this.recipes.set(id, newRecipe);
    return newRecipe;
  }

  async updateRecipe(id: string, recipe: Partial<InsertRecipe>): Promise<Recipe | undefined> {
    const existing = this.recipes.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...recipe };
    this.recipes.set(id, updated);
    return updated;
  }

  async deleteRecipe(id: string): Promise<boolean> {
    return this.recipes.delete(id);
  }

  // Meal Plans
  async getMealPlansForWeek(weekStartDate: string): Promise<MealPlan[]> {
    return Array.from(this.mealPlans.values()).filter(
      plan => plan.weekStartDate === weekStartDate
    );
  }

  async createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan> {
    const id = randomUUID();
    const newMealPlan: MealPlan = { ...mealPlan, id, createdAt: new Date() };
    this.mealPlans.set(id, newMealPlan);
    return newMealPlan;
  }

  async updateMealPlan(id: string, mealPlan: Partial<InsertMealPlan>): Promise<MealPlan | undefined> {
    const existing = this.mealPlans.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...mealPlan };
    this.mealPlans.set(id, updated);
    return updated;
  }

  async deleteMealPlan(id: string): Promise<boolean> {
    return this.mealPlans.delete(id);
  }

  // Recipe Ratings
  async getRecipeRatings(recipeId: string): Promise<RecipeRating[]> {
    return Array.from(this.recipeRatings.values()).filter(
      rating => rating.recipeId === recipeId
    );
  }

  async createRecipeRating(rating: InsertRecipeRating): Promise<RecipeRating> {
    const id = randomUUID();
    const newRating: RecipeRating = { ...rating, id, createdAt: new Date() };
    this.recipeRatings.set(id, newRating);
    return newRating;
  }

  async updateRecipeRating(id: string, rating: Partial<InsertRecipeRating>): Promise<RecipeRating | undefined> {
    const existing = this.recipeRatings.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...rating };
    this.recipeRatings.set(id, updated);
    return updated;
  }

  // Grocery Items
  async getGroceryItemsForWeek(weekStartDate: string): Promise<GroceryItem[]> {
    return Array.from(this.groceryItems.values()).filter(
      item => item.weekStartDate === weekStartDate
    );
  }

  async createGroceryItem(item: InsertGroceryItem): Promise<GroceryItem> {
    const id = randomUUID();
    const newItem: GroceryItem = { ...item, id, createdAt: new Date() };
    this.groceryItems.set(id, newItem);
    return newItem;
  }

  async updateGroceryItem(id: string, item: Partial<InsertGroceryItem>): Promise<GroceryItem | undefined> {
    const existing = this.groceryItems.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    this.groceryItems.set(id, updated);
    return updated;
  }

  async deleteGroceryItem(id: string): Promise<boolean> {
    return this.groceryItems.delete(id);
  }

  // Pantry Items
  async getPantryItems(): Promise<PantryItem[]> {
    return Array.from(this.pantryItems.values());
  }

  async createPantryItem(item: InsertPantryItem): Promise<PantryItem> {
    const id = randomUUID();
    const now = new Date();
    const newItem: PantryItem = { ...item, id, createdAt: now, updatedAt: now };
    this.pantryItems.set(id, newItem);
    return newItem;
  }

  async updatePantryItem(id: string, item: Partial<InsertPantryItem>): Promise<PantryItem | undefined> {
    const existing = this.pantryItems.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item, updatedAt: new Date() };
    this.pantryItems.set(id, updated);
    return updated;
  }

  async deletePantryItem(id: string): Promise<boolean> {
    return this.pantryItems.delete(id);
  }

  // Stores
  async getStores(): Promise<Store[]> {
    return Array.from(this.stores.values());
  }

  async createStore(store: InsertStore): Promise<Store> {
    const id = randomUUID();
    const newStore: Store = { ...store, id };
    this.stores.set(id, newStore);
    return newStore;
  }

  async updateStore(id: string, store: Partial<InsertStore>): Promise<Store | undefined> {
    const existing = this.stores.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...store };
    this.stores.set(id, updated);
    return updated;
  }

  async deleteStore(id: string): Promise<boolean> {
    return this.stores.delete(id);
  }

  // Ingredient Store Preferences
  async getIngredientStorePreferences(ingredient?: string): Promise<IngredientStorePreference[]> {
    const allPreferences = Array.from(this.ingredientStorePreferences.values());
    if (ingredient) {
      return allPreferences.filter(pref => pref.ingredient === ingredient);
    }
    return allPreferences;
  }

  async createIngredientStorePreference(preference: InsertIngredientStorePreference): Promise<IngredientStorePreference> {
    const id = randomUUID();
    const newPreference: IngredientStorePreference = { ...preference, id, createdAt: new Date() };
    this.ingredientStorePreferences.set(id, newPreference);
    return newPreference;
  }

  async updateIngredientStorePreference(id: string, preference: Partial<InsertIngredientStorePreference>): Promise<IngredientStorePreference | undefined> {
    const existing = this.ingredientStorePreferences.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...preference };
    this.ingredientStorePreferences.set(id, updated);
    return updated;
  }

  async deleteIngredientStorePreference(id: string): Promise<boolean> {
    return this.ingredientStorePreferences.delete(id);
  }
}

export const storage = new MemStorage();
