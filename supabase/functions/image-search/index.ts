
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface SearchRequest {
  source: "pixabay" | "unsplash";
  query: string;
  page?: number;
}

interface SearchResult {
  id: string;
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  photographer: string;
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
    const { source, query, page = 1 } = await req.json() as SearchRequest;

    if (!query) {
      throw new Error("Search query is required");
    }

    let results: SearchResult[] = [];

    if (source === "unsplash") {
      const accessKey = Deno.env.get('UNSPLASH_API_KEY')
      if (!accessKey) {
        throw new Error("Unsplash API key not configured");
      }

      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          query
        )}&per_page=12&page=${page}`,
        {
          headers: {
            Authorization: `Client-ID ${accessKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.statusText}`);
      }

      const data = await response.json();
      results = data.results.map((photo: any) => ({
        id: photo.id,
        url: photo.urls.full,
        thumbnail: photo.urls.thumb,
        width: photo.width,
        height: photo.height,
        photographer: photo.user.name,
      }));
    } else if (source === "pixabay") {
      const apiKey = Deno.env.get('PIXABAY_API_KEY')
      if (!apiKey) {
        throw new Error("Pixabay API key not configured");
      }

      const response = await fetch(
        `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(
          query
        )}&per_page=12&page=${page}`
      );

      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.statusText}`);
      }

      const data = await response.json();
      results = data.hits.map((image: any) => ({
        id: image.id.toString(),
        url: image.largeImageURL,
        thumbnail: image.previewURL,
        width: image.imageWidth,
        height: image.imageHeight,
        photographer: image.user,
      }));
    }

    return new Response(
      JSON.stringify({ results }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error in image search:", error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An error occurred during image search",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});