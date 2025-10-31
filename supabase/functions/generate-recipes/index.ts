import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients } = await req.json();
    console.log("Generating recipes for ingredients:", ingredients);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `Você é um chef especialista em culinária criativa. Baseado nos ingredientes fornecidos, você deve sugerir 3 receitas deliciosas e viáveis.

Para cada receita, forneça:
- Nome da receita (criativo e apetitoso)
- Tempo de preparo estimado
- Dificuldade (Fácil, Médio, Difícil)
- Lista de ingredientes completa (incluindo os fornecidos e outros necessários)
- Modo de preparo passo a passo (5-8 passos)
- Descrição breve e apetitosa

Seja criativo mas prático. As receitas devem usar os ingredientes fornecidos como principais.`;

    const userPrompt = `Ingredientes disponíveis: ${ingredients.join(', ')}

Por favor, sugira 3 receitas deliciosas usando esses ingredientes.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "suggest_recipes",
            description: "Retorna 3 sugestões de receitas baseadas nos ingredientes",
            parameters: {
              type: "object",
              properties: {
                recipes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Nome da receita" },
                      prepTime: { type: "string", description: "Tempo de preparo" },
                      difficulty: { type: "string", enum: ["Fácil", "Médio", "Difícil"] },
                      description: { type: "string", description: "Descrição breve e apetitosa" },
                      ingredients: { type: "array", items: { type: "string" } },
                      steps: { type: "array", items: { type: "string" } }
                    },
                    required: ["name", "prepTime", "difficulty", "description", "ingredients", "steps"],
                    additionalProperties: false
                  },
                  minItems: 3,
                  maxItems: 3
                }
              },
              required: ["recipes"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "suggest_recipes" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Por favor, adicione créditos à sua conta Lovable AI." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const recipes = JSON.parse(toolCall.function.arguments).recipes;

    return new Response(JSON.stringify({ recipes }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-recipes function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro ao gerar receitas' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
