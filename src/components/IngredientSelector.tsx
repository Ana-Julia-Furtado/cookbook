import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const COMMON_INGREDIENTS = [
  "Frango", "Carne", "Peixe", "Ovos", "Leite",
  "Queijo", "Manteiga", "Arroz", "Macarrão", "Batata",
  "Tomate", "Cebola", "Alho", "Cenoura", "Brócolis",
  "Pimentão", "Alface", "Azeite", "Sal", "Pimenta",
  "Farinha", "Açúcar", "Feijão", "Milho", "Ervilha"
];

interface IngredientSelectorProps {
  selectedIngredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
}

export function IngredientSelector({ selectedIngredients, onIngredientsChange }: IngredientSelectorProps) {
  const toggleIngredient = (ingredient: string) => {
    if (selectedIngredients.includes(ingredient)) {
      onIngredientsChange(selectedIngredients.filter(i => i !== ingredient));
    } else {
      onIngredientsChange([...selectedIngredients, ingredient]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {COMMON_INGREDIENTS.map((ingredient) => {
          const isSelected = selectedIngredients.includes(ingredient);
          return (
            <Badge
              key={ingredient}
              variant={isSelected ? "default" : "outline"}
              className={`
                cursor-pointer transition-all duration-300 px-4 py-2 text-sm font-medium
                ${isSelected 
                  ? "bg-primary text-primary-foreground shadow-md hover:shadow-lg scale-105" 
                  : "hover:bg-accent hover:text-accent-foreground hover:scale-105"
                }
              `}
              onClick={() => toggleIngredient(ingredient)}
            >
              {isSelected && <Check className="w-3 h-3 mr-1" />}
              {ingredient}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
