import { useState } from "react";
import { Utensils, Bell, Settings } from "lucide-react";
import MealPlanner from "@/components/meal-planner";
import GroceryList from "@/components/grocery-list";
import PantryManager from "@/components/pantry-manager";
import RecipeDatabase from "@/components/recipe-database";

export default function Home() {
  const [activeTab, setActiveTab] = useState("meals");

  const currentWeek = "Week of Jan 15-21";

  const tabs = [
    { id: "meals", label: "Meals", icon: "calendar-week" },
    { id: "grocery", label: "Grocery List", icon: "shopping-cart" },
    { id: "pantry", label: "Pantry", icon: "box" },
    { id: "recipes", label: "Recipes", icon: "book-open" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "meals":
        return <MealPlanner />;
      case "grocery":
        return <GroceryList />;
      case "pantry":
        return <PantryManager />;
      case "recipes":
        return <RecipeDatabase />;
      default:
        return <MealPlanner />;
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="app-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm" data-testid="header">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Utensils className="text-primary-foreground text-lg" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-card-foreground" data-testid="app-title">MealPlan</h1>
              <p className="text-xs text-muted-foreground" data-testid="current-week">{currentWeek}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 rounded-lg hover:bg-muted transition-colors" 
              data-testid="button-notifications"
              aria-label="Toggle notifications"
            >
              <Bell className="text-muted-foreground" size={20} />
            </button>
            <button 
              className="p-2 rounded-lg hover:bg-muted transition-colors" 
              data-testid="button-settings"
              aria-label="Open settings"
            >
              <Settings className="text-muted-foreground" size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20" data-testid="main-content">
        {/* Tab Navigation */}
        <div className="sticky top-16 z-30 bg-background border-b border-border">
          <div className="flex overflow-x-auto custom-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "tab-active"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <i className={`fas fa-${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div data-testid="tab-content">
          {renderTabContent()}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40" data-testid="bottom-navigation">
        <div className="grid grid-cols-4 h-16">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center space-y-1 hover:bg-muted transition-colors"
              data-testid={`nav-${tab.id}`}
            >
              <i className={`fas fa-${tab.icon} ${
                activeTab === tab.id ? "text-primary" : "text-muted-foreground"
              }`}></i>
              <span className={`text-xs font-medium ${
                activeTab === tab.id ? "text-primary" : "text-muted-foreground"
              }`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
