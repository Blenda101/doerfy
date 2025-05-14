import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface SearchRequest {
  source: "quotable" | "zenquotes";
  query: string;
}

interface QuoteResult {
  id: string;
  content: string;
  author: string;
  tags: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { source, query } = (await req.json()) as SearchRequest;

    if (!query) {
      throw new Error("Search query is required");
    }

    let results: QuoteResult[] = [];

    if (source === "quotable") {
      const quoteApiKey = Deno.env.get("QUOTES4_API_KEY");
      if (!quoteApiKey) {
        throw new Error("Quotable API key not configured");
      }

      const response = await fetch(
        `https://famous-quotes4.p.rapidapi.com/random?count=20&category=${encodeURIComponent(
          query,
        )}`,
        {
          headers: {
            "x-rapidapi-key": quoteApiKey,
            "x-rapidapi-host": "famous-quotes4.p.rapidapi.com",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Quotable API error: ${response.statusText}`);
      }
      const data = await response.json();
      results = data.map((quote: any) => ({
        id: quote.id,
        content: quote.text,
        author: quote.author,
        tags: quote.category ? [quote.category] : [],
      }));
    } else if (source === "zenquotes") {
      // const apiKey = Deno.env.get('ZENQUOTES_API_KEY');
      // if (!apiKey) {
      //   throw new Error("ZenQuotes API key not configured");
      // }

      // const response = await fetch(
      //   `https://zenquotes.io/api/search/${encodeURIComponent(query)}}`
      // );

      const response = await fetch(
        `https://zenquotes.io/api/quotes/${encodeURIComponent(query)}`,
      );

      if (!response.ok) {
        throw new Error(`ZenQuotes API error: ${response.statusText}`);
      }

      const data = await response.json();
      results = data.map((quote: any) => ({
        id: quote.q,
        content: quote.q,
        author: quote.a,
        tags: [],
      }));
    }

    return new Response(JSON.stringify({ results }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error in quote search:", error);

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "An error occurred during quote search",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      },
    );
  }
});
