import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  cuisine: text("cuisine").notNull(),
  prepTime: integer("prep_time").notNull(), // in minutes
  servings: integer("servings").notNull(),
  ingredients: jsonb("ingredients").notNull().$type<string[]>(),
  instructions: text("instructions").notNull(),
  tags: jsonb("tags").notNull().$type<string[]>(),
  makesLeftovers: boolean("makes_leftovers").default(false),
  nonPerishableBase: boolean("non_perishable_base").default(false),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mealPlans = pgTable("meal_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  weekStartDate: text("week_start_date").notNull(), // YYYY-MM-DD format
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner
  recipeId: varchar("recipe_id").references(() => recipes.id),
  customMealName: text("custom_meal_name"),
  isLeftover: boolean("is_leftover").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recipeRatings = pgTable("recipe_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recipeId: varchar("recipe_id").references(() => recipes.id).notNull(),
  familyMember: text("family_member").notNull(),
  rating: integer("rating").notNull(), // 1=okay, 2=good, 3=great
  createdAt: timestamp("created_at").defaultNow(),
});

export const groceryItems = pgTable("grocery_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  quantity: text("quantity").notNull(),
  estimatedPrice: text("estimated_price"),
  preferredStore: text("preferred_store").notNull(),
  isCompleted: boolean("is_completed").default(false),
  isFromMeal: boolean("is_from_meal").default(false),
  associatedMealId: varchar("associated_meal_id").references(() => mealPlans.id),
  weekStartDate: text("week_start_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pantryItems = pgTable("pantry_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  quantity: text("quantity").notNull(),
  expirationDate: text("expiration_date"), // YYYY-MM-DD format
  stockLevel: text("stock_level").notNull(), // high, medium, low, empty
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const stores = pgTable("stores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  categories: jsonb("categories").notNull().$type<string[]>(),
  isPreferred: boolean("is_preferred").default(false),
});

// Insert schemas
export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  createdAt: true,
});

export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({
  id: true,
  createdAt: true,
});

export const insertRecipeRatingSchema = createInsertSchema(recipeRatings).omit({
  id: true,
  createdAt: true,
});

export const insertGroceryItemSchema = createInsertSchema(groceryItems).omit({
  id: true,
  createdAt: true,
});

export const insertPantryItemSchema = createInsertSchema(pantryItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
});

// Types
export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;

export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;

export type RecipeRating = typeof recipeRatings.$inferSelect;
export type InsertRecipeRating = z.infer<typeof insertRecipeRatingSchema>;

export type GroceryItem = typeof groceryItems.$inferSelect;
export type InsertGroceryItem = z.infer<typeof insertGroceryItemSchema>;

export type PantryItem = typeof pantryItems.$inferSelect;
export type InsertPantryItem = z.infer<typeof insertPantryItemSchema>;

export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;
