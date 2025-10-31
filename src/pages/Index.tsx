import { useState } from "react";
import { ChefHat, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IngredientSelector } from "@/components/IngredientSelector";
import { RecipeCard } from "@/components/RecipeCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Recipe {
  name: string;
  prepTime: string;
  difficulty: string;
  description: string;
  ingredients: string[];
  steps: string[];
}

const Index = () => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateRecipes = async () => {
    if (selectedIngredients.length === 0) {
      toast({
        title: "Selecione ingredientes",
        description: "Por favor, selecione pelo menos um ingrediente.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGenerating(true);
      setRecipes([]);

      const { data, error } = await supabase.functions.invoke('generate-recipes', {
        body: { ingredients: selectedIngredients }
      });

      if (error) throw error;

      if (data?.recipes) {
        setRecipes(data.recipes);
        toast({
          title: "Receitas geradas!",
          description: `${data.recipes.length} receitas deliciosas foram criadas para você.`,
        });
      }
    } catch (error) {
      console.error("Error generating recipes:", error);
      toast({
        title: "Erro ao gerar receitas",
        description: "Ocorreu um erro ao gerar as receitas. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <header className="bg-gradient-primary text-primary-foreground py-12 px-4 shadow-lg">
        <div className="container mx-auto max-w-6xl text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <ChefHat className="w-12 h-12" />
            <h1 className="text-4xl md:text-5xl font-bold">Cook Book</h1>
          </div>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Transforme os ingredientes da sua geladeira em receitas incríveis com o poder da inteligência artificial
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-6xl px-4 py-12 space-y-12">
        {/* Ingredient Selection */}
        <section className="space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Quais ingredientes você tem?
            </h2>
            <p className="text-muted-foreground">
              Selecione os ingredientes disponíveis na sua geladeira
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-md">
            <IngredientSelector
              selectedIngredients={selectedIngredients}
              onIngredientsChange={setSelectedIngredients}
            />
          </div>

          {selectedIngredients.length > 0 && (
            <div className="flex justify-center">
              <Button
                variant="hero"
                size="lg"
                onClick={handleGenerateRecipes}
                disabled={isGenerating}
                className="gap-2"
              >
                <Sparkles className="w-5 h-5" />
                {isGenerating ? "Gerando receitas..." : "Gerar Receitas"}
              </Button>
            </div>
          )}
        </section>

        {/* Recipes Display */}
        {recipes.length > 0 && (
          <section className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Suas Receitas Personalizadas
              </h2>
              <p className="text-muted-foreground">
                Escolha uma receita e comece a cozinhar!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe, idx) => (
                <RecipeCard key={idx} recipe={recipe} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!isGenerating && recipes.length === 0 && selectedIngredients.length === 0 && (
          <section className="text-center py-12 animate-fade-in">
            <ChefHat className="w-24 h-24 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              Comece selecionando seus ingredientes
            </h3>
            <p className="text-muted-foreground">
              Nossa IA irá criar receitas deliciosas especialmente para você!
            </p>
          </section>
        )}
      </main>
    </div>
  );
};

export default Index;
