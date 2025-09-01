import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertRecipeSchema, 
  insertMealPlanSchema, 
  insertRecipeRatingSchema,
  insertGroceryItemSchema,
  insertPantryItemSchema,
  insertStoreSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Recipes
  app.get("/api/recipes", async (req, res) => {
    try {
      const recipes = await storage.getRecipes();
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });

  app.get("/api/recipes/:id", async (req, res) => {
    try {
      const recipe = await storage.getRecipeById(req.params.id);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });

  app.post("/api/recipes", async (req, res) => {
    try {
      const recipeData = insertRecipeSchema.parse(req.body);
      const recipe = await storage.createRecipe(recipeData);
      res.status(201).json(recipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid recipe data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create recipe" });
    }
  });

  app.put("/api/recipes/:id", async (req, res) => {
    try {
      const recipeData = insertRecipeSchema.partial().parse(req.body);
      const recipe = await storage.updateRecipe(req.params.id, recipeData);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid recipe data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update recipe" });
    }
  });

  app.delete("/api/recipes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRecipe(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete recipe" });
    }
  });

  // Meal Plans
  app.get("/api/meal-plans/:weekStartDate", async (req, res) => {
    try {
      const mealPlans = await storage.getMealPlansForWeek(req.params.weekStartDate);
      res.json(mealPlans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meal plans" });
    }
  });

  app.post("/api/meal-plans", async (req, res) => {
    try {
      const mealPlanData = insertMealPlanSchema.parse(req.body);
      const mealPlan = await storage.createMealPlan(mealPlanData);
      res.status(201).json(mealPlan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid meal plan data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create meal plan" });
    }
  });

  app.put("/api/meal-plans/:id", async (req, res) => {
    try {
      const mealPlanData = insertMealPlanSchema.partial().parse(req.body);
      const mealPlan = await storage.updateMealPlan(req.params.id, mealPlanData);
      if (!mealPlan) {
        return res.status(404).json({ message: "Meal plan not found" });
      }
      res.json(mealPlan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid meal plan data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update meal plan" });
    }
  });

  app.delete("/api/meal-plans/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteMealPlan(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Meal plan not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete meal plan" });
    }
  });

  // Recipe Ratings
  app.get("/api/recipes/:recipeId/ratings", async (req, res) => {
    try {
      const ratings = await storage.getRecipeRatings(req.params.recipeId);
      res.json(ratings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipe ratings" });
    }
  });

  app.post("/api/recipe-ratings", async (req, res) => {
    try {
      const ratingData = insertRecipeRatingSchema.parse(req.body);
      const rating = await storage.createRecipeRating(ratingData);
      res.status(201).json(rating);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid rating data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create rating" });
    }
  });

  // Grocery Items
  app.get("/api/grocery-items/:weekStartDate", async (req, res) => {
    try {
      const items = await storage.getGroceryItemsForWeek(req.params.weekStartDate);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch grocery items" });
    }
  });

  app.post("/api/grocery-items", async (req, res) => {
    try {
      const itemData = insertGroceryItemSchema.parse(req.body);
      const item = await storage.createGroceryItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid grocery item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create grocery item" });
    }
  });

  app.put("/api/grocery-items/:id", async (req, res) => {
    try {
      const itemData = insertGroceryItemSchema.partial().parse(req.body);
      const item = await storage.updateGroceryItem(req.params.id, itemData);
      if (!item) {
        return res.status(404).json({ message: "Grocery item not found" });
      }
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid grocery item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update grocery item" });
    }
  });

  app.delete("/api/grocery-items/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteGroceryItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Grocery item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete grocery item" });
    }
  });

  // Pantry Items
  app.get("/api/pantry-items", async (req, res) => {
    try {
      const items = await storage.getPantryItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pantry items" });
    }
  });

  app.post("/api/pantry-items", async (req, res) => {
    try {
      const itemData = insertPantryItemSchema.parse(req.body);
      const item = await storage.createPantryItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid pantry item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create pantry item" });
    }
  });

  app.put("/api/pantry-items/:id", async (req, res) => {
    try {
      const itemData = insertPantryItemSchema.partial().parse(req.body);
      const item = await storage.updatePantryItem(req.params.id, itemData);
      if (!item) {
        return res.status(404).json({ message: "Pantry item not found" });
      }
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid pantry item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update pantry item" });
    }
  });

  app.delete("/api/pantry-items/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePantryItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Pantry item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete pantry item" });
    }
  });

  // Stores
  app.get("/api/stores", async (req, res) => {
    try {
      const stores = await storage.getStores();
      res.json(stores);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stores" });
    }
  });

  app.post("/api/stores", async (req, res) => {
    try {
      const storeData = insertStoreSchema.parse(req.body);
      const store = await storage.createStore(storeData);
      res.status(201).json(store);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid store data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create store" });
    }
  });

  // Generate grocery list from meal plans
  app.post("/api/grocery-lists/generate/:weekStartDate", async (req, res) => {
    try {
      const weekStartDate = req.params.weekStartDate;
      const mealPlans = await storage.getMealPlansForWeek(weekStartDate);
      const recipes = await storage.getRecipes();
      const stores = await storage.getStores();
      
      // Clear existing grocery items for the week
      const existingItems = await storage.getGroceryItemsForWeek(weekStartDate);
      for (const item of existingItems) {
        if (item.isFromMeal) {
          await storage.deleteGroceryItem(item.id);
        }
      }

      // Generate grocery items from meal plans
      const groceryItems = [];
      for (const mealPlan of mealPlans) {
        if (mealPlan.recipeId && !mealPlan.isLeftover) {
          const recipe = recipes.find(r => r.id === mealPlan.recipeId);
          if (recipe) {
            for (const ingredient of recipe.ingredients) {
              const preferredStore = stores.find(s => s.isPreferred)?.name || "Whole Foods";
              const category = categorizeIngredient(ingredient);
              
              const groceryItem = await storage.createGroceryItem({
                name: ingredient,
                category,
                quantity: "1 unit",
                estimatedPrice: "$3.99",
                preferredStore,
                isCompleted: false,
                isFromMeal: true,
                associatedMealId: mealPlan.id,
                weekStartDate
              });
              groceryItems.push(groceryItem);
            }
          }
        }
      }

      res.json(groceryItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate grocery list" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function categorizeIngredient(ingredient: string): string {
  const lowerIngredient = ingredient.toLowerCase();
  
  if (lowerIngredient.includes('beef') || lowerIngredient.includes('chicken') || lowerIngredient.includes('meat')) {
    return "Meat & Seafood";
  }
  if (lowerIngredient.includes('milk') || lowerIngredient.includes('cheese') || lowerIngredient.includes('yogurt')) {
    return "Dairy";
  }
  if (lowerIngredient.includes('apple') || lowerIngredient.includes('berry') || lowerIngredient.includes('lettuce') || lowerIngredient.includes('tomato')) {
    return "Produce";
  }
  if (lowerIngredient.includes('pasta') || lowerIngredient.includes('rice') || lowerIngredient.includes('oats') || lowerIngredient.includes('bread')) {
    return "Grains & Pasta";
  }
  return "Pantry Essentials";
}
