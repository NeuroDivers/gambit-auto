
import React from "react";
import { Badge } from "@/components/ui/badge";

interface CategoryFilterProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export function CategoryFilter({ selectedCategory, setSelectedCategory }: CategoryFilterProps) {
  const categories = [
    { id: "all", label: "All" },
    { id: "base", label: "Base Colors" },
    { id: "components", label: "Components" },
    { id: "states", label: "States" },
    { id: "tabs", label: "Tabs" }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {categories.map(category => (
        <Badge
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSelectedCategory(category.id)}
        >
          {category.label}
        </Badge>
      ))}
    </div>
  );
}
