import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ChefHat, List } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Recipe {
  name: string;
  prepTime: string;
  difficulty: string;
  description: string;
  ingredients: string[];
  steps: string[];
}

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const generateImage = async () => {
      try {
        setIsLoadingImage(true);
        const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
          body: { recipeName: recipe.name }
        });

        if (error) throw error;
        
        if (data?.imageUrl) {
          setImageUrl(data.imageUrl);
        }
      } catch (error) {
        console.error("Error generating image:", error);
        toast({
          title: "Erro ao gerar imagem",
          description: "Não foi possível gerar a imagem da receita.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingImage(false);
      }
    };

    generateImage();
  }, [recipe.name, toast]);

  const difficultyColors = {
    "Fácil": "bg-primary/20 text-primary",
    "Médio": "bg-accent/20 text-accent-foreground",
    "Difícil": "bg-secondary/20 text-secondary"
  };

  return (
    <Card className="overflow-hidden bg-gradient-card shadow-md hover:shadow-lg transition-all duration-300 animate-slide-up">
      {isLoadingImage ? (
        <Skeleton className="w-full h-48" />
      ) : imageUrl ? (
        <img 
          src={imageUrl} 
          alt={recipe.name}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-primary flex items-center justify-center">
          <ChefHat className="w-16 h-16 text-primary-foreground opacity-50" />
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl">{recipe.name}</CardTitle>
          <Badge className={difficultyColors[recipe.difficulty as keyof typeof difficultyColors]}>
            {recipe.difficulty}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" />
          {recipe.prepTime}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{recipe.description}</p>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <List className="w-4 h-4" />
            Ingredientes
          </h4>
          <ul className="text-sm space-y-1 ml-6">
            {recipe.ingredients.slice(0, 5).map((ingredient, idx) => (
              <li key={idx} className="list-disc text-muted-foreground">{ingredient}</li>
            ))}
            {recipe.ingredients.length > 5 && (
              <li className="list-disc text-muted-foreground italic">
                +{recipe.ingredients.length - 5} ingredientes...
              </li>
            )}
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <ChefHat className="w-4 h-4" />
            Modo de Preparo
          </h4>
          <ol className="text-sm space-y-1 ml-6">
            {recipe.steps.slice(0, 3).map((step, idx) => (
              <li key={idx} className="list-decimal text-muted-foreground">{step}</li>
            ))}
            {recipe.steps.length > 3 && (
              <li className="list-decimal text-muted-foreground italic">
                +{recipe.steps.length - 3} passos...
              </li>
            )}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
