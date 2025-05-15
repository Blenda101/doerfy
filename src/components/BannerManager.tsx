import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import {
  Image as ImageIcon,
  Music2,
  X,
  Search,
  Loader2,
} from "lucide-react";
import { getCurrentUser, supabase } from "../utils/supabaseClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

//@ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
//@ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


const imageCategories = [
  {
    name: "Nature & Landscapes",
    tags: ["nature", "landscape", "mountains", "beach", "forest", "sunset", "ocean"],
  },
  {
    name: "Abstract & Patterns",
    tags: ["abstract", "pattern", "texture", "geometric", "minimal", "artistic"],
  },
  {
    name: "Urban & Architecture",
    tags: ["city", "architecture", "urban", "building", "street", "skyline"],
  },
  {
    name: "Minimalist",
    tags: ["minimal", "simple", "clean", "white", "modern", "minimalist"],
  },
  {
    name: "Colorful & Vibrant",
    tags: ["colorful", "vibrant", "bright", "rainbow", "neon", "multicolor"],
  }
];

const quoteCategories = [
  {
    name: "Inspiration",
    tags: ["inspiration", "motivation", "success", "dreams", "goals"],
  },
  {
    name: "Life & Wisdom",
    tags: ["life", "wisdom", "philosophy", "truth", "knowledge"],
  },
  {
    name: "Love & Relationships",
    tags: ["love", "relationships", "friendship", "family", "romance"],
  },
  {
    name: "Personal Growth",
    tags: ["growth", "self-improvement", "learning", "change", "development"],
  },
  {
    name: "Leadership",
    tags: ["leadership", "management", "teamwork", "vision", "strategy"],
  },
];

interface AudioItem {
  url: string;
  name: string;
  order: number;
  source?: 'upload' | 'apple_music' | 'spotify';
}

export interface BannerConfig {
  images: {
    url: string;
    order: number;
  }[];
  transitionTime: number;
  audio: AudioItem[];
  autoplay: boolean;
  volume: number;
  quotes: {
    text: string;
    author: string;
    order: number;
  }[];
  quoteRotation: boolean;
  quoteDuration: number;
  textStyle: {
    font: string;
    size: number;
    color: string;
  };
}

interface SearchResult {
  id: string;
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  photographer: string;
}

interface QuoteSearchResult {
  id: string;
  content: string;
  author: string;
  tags: string[];
}

interface BannerManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: BannerConfig) => void;
  initialConfig?: BannerConfig;
  theme?: "light" | "dark";
}

export const BannerManager: React.FC<BannerManagerProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig,
  theme = "light",
}) => {
  const [config, setConfig] = useState<BannerConfig>(
    initialConfig || {
      images: [],
      transitionTime: 6,
      audio: [],
      autoplay: false,
      volume: 50,
      quotes: [],
      quoteRotation: false,
      quoteDuration: 10,
      textStyle: {
        font: "Inter",
        size: 24,
        color: "#FFFFFF",
      },
    },
  );

  const [imageSource, setImageSource] = useState<"upload" | "pixabay" | "unsplash">("upload");
  const [quoteSource, setQuoteSource] = useState<"custom" | "quotable" | "zenquotes">("custom");
  const [searchQuery, setSearchQuery] = useState("");
  const [quoteSearchQuery, setQuoteSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [quoteSearchResults, setQuoteSearchResults] = useState<QuoteSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isQuoteSearching, setIsQuoteSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedQuoteCategory, setSelectedQuoteCategory] = useState<string>("");
  const [appendSearch, setAppendSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [newQuote, setNewQuote] = useState({ text: "", author: "" });
  const [audioSource, setAudioSource] = useState<"upload" | "apple_music" | "spotify">("upload");
  const [audioLink, setAudioLink] = useState("");

  // Update config when initialConfig changes
  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  const handleSearch = async (page = 1) => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search term");
      return;
    }


    if (!supabaseUrl) {
      toast.error("VITE_SUPABASE_URL is not configured");
      return;
    }

    if (!supabaseAnonKey) {
      toast.error("VITE_SUPABASE_ANON_KEY is not configured");
      return;
    }

    if (page === 1) {
      setSearchResults([]);
      setCurrentPage(1);
      setHasMore(true);
    }

    const isLoadingMore = page > 1;
    if (isLoadingMore) {
      setIsLoadingMore(true);
    } else {
      setIsSearching(true);
    }

    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/image-search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            source: imageSource,
            query: searchQuery.trim(),
            page,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to search images: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data || !data.results) {
        throw new Error("Invalid response format from image search");
      }

      if (isLoadingMore) {
        setSearchResults(prev => [...prev, ...data.results]);
      } else {
        setSearchResults(data.results);
      }

      setHasMore(data.results.length === 12);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error searching images:", error);
      toast.error(error instanceof Error ? error.message : "Failed to search images");
    } finally {
      if (isLoadingMore) {
        setIsLoadingMore(false);
      } else {
        setIsSearching(false);
      }
    }
  };

  const handleQuoteSearch = async () => {
    if (!quoteSearchQuery.trim()) {
      toast.error("Please enter a search term");
      return;
    }


    if (!supabaseUrl) {
      toast.error("VITE_SUPABASE_URL is not configured");
      return;
    }

    if (!supabaseAnonKey) {
      toast.error("VITE_SUPABASE_ANON_KEY is not configured");
      return;
    }

    setIsQuoteSearching(true);

    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/quote-search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            source: quoteSource,
            query: quoteSearchQuery.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to search quotes: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data || !data.results) {
        throw new Error("Invalid response format from quote search");
      }

      setQuoteSearchResults(data.results);
    } catch (error) {
      console.error("Error searching quotes:", error);
      toast.error(error instanceof Error ? error.message : "Failed to search quotes");
    } finally {
      setIsQuoteSearching(false);
    }
  };

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      handleSearch(currentPage + 1);
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleQuoteCategoryChange = (value: string) => {
    setSelectedQuoteCategory(value);
  };

  const handleTagClick = (tag: string) => {
    if (appendSearch) {
      setSearchQuery((prev) => {
        const terms = prev.split(' ').filter(term => term.trim());
        if (!terms.includes(tag)) {
          return [...terms, tag].join(' ');
        }
        return prev;
      });
    } else {
      setSearchQuery(tag);
    }
  };

  const handleQuoteTagClick = (tag: string) => {
    if (appendSearch) {
      setQuoteSearchQuery((prev) => {
        const terms = prev.split(' ').filter(term => term.trim());
        if (!terms.includes(tag)) {
          return [...terms, tag].join(' ');
        }
        return prev;
      });
    } else {
      setQuoteSearchQuery(tag);
    }
  };

  const handleImageSelect = (image: SearchResult) => {
    setConfig((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        {
          url: image.url,
          order: prev.images.length,
        },
      ],
    }));
    toast.success("Image added to banner");
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[], type: "images" | "audio") => {
      const maxSize = type === "images" ? 2 * 1024 * 1024 : 10 * 1024 * 1024;
      const validFiles = acceptedFiles.filter((file) => file.size <= maxSize);

      if (validFiles.length < acceptedFiles.length) {
        toast.error(
          `Some files were too large. Maximum size: ${
            maxSize / (1024 * 1024)
          }MB`,
        );
      }

      const currentUser = await getCurrentUser();
      const filePromises = validFiles.map((file) => {
        const fileName = `${currentUser?.id}/banners/${file.name}${Date.now()}`;
        return supabase.storage
          .from("avatars")
          .upload(fileName, file)
          .then(({ error }) => {
            if (error) {
              console.error("Error uploading file:", error);
              return null;
            }
            return {
              url: supabase.storage.from("avatars").getPublicUrl(fileName).data
                .publicUrl,
              name: file.name,
              order:
                type === "images"
                  ? config.images.length + config.audio.length
                  : config.audio.length + config.images.length,
            };
          });
      });
      const results = (await Promise.all(filePromises)).filter(
        (file) => file !== null,
      );
      setConfig((prev) => ({
        ...prev,
        [type]: [...prev[type], ...results],
      }));
    },
    [config],
  );

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps } =
    useDropzone({
      onDrop: (files) => onDrop(files, "images"),
      accept: {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/webp": [".webp"],
      },
      maxSize: 2 * 1024 * 1024,
      disabled: imageSource !== "upload",
    });

  const { getRootProps: getAudioRootProps, getInputProps: getAudioInputProps } =
    useDropzone({
      onDrop: (files) => onDrop(files, "audio"),
      accept: {
        "audio/mpeg": [".mp3"],
        "audio/wav": [".wav"],
      },
      maxSize: 10 * 1024 * 1024,
    });

  const handleQuoteAdd = () => {
    if (!newQuote.text.trim() || !newQuote.author.trim()) {
      toast.error("Please enter both quote text and author");
      return;
    }

    setConfig((prev) => ({
      ...prev,
      quotes: [
        ...prev.quotes,
        {
          text: newQuote.text.trim(),
          author: newQuote.author.trim(),
          order: prev.quotes.length,
        },
      ],
    }));

    setNewQuote({ text: "", author: "" });
    toast.success("Quote added successfully");
  };

  const handleQuoteSelect = (quote: QuoteSearchResult) => {
    setConfig((prev) => ({
      ...prev,
      quotes: [
        ...prev.quotes,
        {
          text: quote.content,
          author: quote.author,
          order: prev.quotes.length,
        },
      ],
    }));
    toast.success("Quote added to banner");
  };

  const handleQuoteRemove = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      quotes: prev.quotes.filter((_, i) => i !== index),
    }));
    toast.success("Quote removed successfully");
  };

  const handleQuoteUpdate = (
    index: number,
    field: "text" | "author",
    value: string,
  ) => {
    setConfig((prev) => ({
      ...prev,
      quotes: prev.quotes.map((quote, i) =>
        i === index ? { ...quote, [field]: value } : quote,
      ),
    }));
  };

  const handleAudioLinkAdd = () => {
    if (!audioLink.trim()) {
      toast.error("Please enter a valid audio link");
      return;
    }

    const source = audioSource === "apple_music" ? "apple_music" : "spotify";
    const name = `${source} Track`;

    setConfig((prev) => ({
      ...prev,
      audio: [
        ...prev.audio,
        {
          url: audioLink.trim(),
          name,
          order: prev.audio.length,
          source,
        },
      ],
    }));

    setAudioLink("");
    toast.success("Audio link added successfully");
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-w-4xl h-[80vh] flex flex-col",
          theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white",
        )}
      >
        <DialogHeader>
          <DialogTitle className={theme === "dark" ? "text-white" : undefined}>
            Banner Management
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="images" className="flex-1 overflow-hidden">
          <TabsList>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-6">
            <TabsContent value="images">
              <div className="space-y-4">
                <h3
                  className={cn(
                    "text-lg font-semibold mb-4",
                    theme === "dark" ? "text-white" : "text-gray-900",
                  )}
                >
                  Background Images
                </h3>

                <RadioGroup
                  value={imageSource}
                  onValueChange={(value) => {
                    setImageSource(value as "upload" | "pixabay" | "unsplash");
                    setSearchResults([]);
                  }}
                  className="flex space-x-4 mb-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upload" id="upload" />
                    <Label className={ theme === "dark" ? "text-white" : ""} htmlFor="upload">Upload</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pixabay" id="pixabay" />
                    <Label className={ theme === "dark" ? "text-white" : ""} htmlFor="pixabay">Pixabay</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unsplash" id="unsplash" />
                    <Label className={ theme === "dark" ? "text-white" : ""} htmlFor="unsplash">Unsplash</Label>
                  </div>
                </RadioGroup>

                {imageSource === "upload" ? (
                  <div
                    {...getImageRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                      theme === "dark"
                        ? "border-slate-600 hover:border-slate-500"
                        : "border-gray-300 hover:border-gray-400",
                    )}
                  >
                    <input {...getImageInputProps()} />
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p
                      className={cn(
                        "mt-2",
                        theme === "dark" ? "text-slate-300" : "text-gray-600",
                      )}
                    >
                      Drag & drop images here, or click to select
                    </p>
                    <p
                      className={cn(
                        "text-sm mt-1",
                        theme === "dark" ? "text-slate-400" : "text-gray-500",
                      )}
                    >
                      Supported formats: JPG, PNG, WEBP (max 2MB)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex space-x-2">
                          <Input
                            type="text"
                            placeholder="Search images..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSearch();
                              }
                            }}
                            className={cn(
                              theme === "dark" &&
                                "bg-slate-700 border-slate-600 text-white",
                            )}
                          />
                          <Button
                            onClick={() => handleSearch()}
                            disabled={isSearching}
                            className={cn(
                              "min-w-[100px]",
                              theme === "dark" &&
                                "bg-purple-600 hover:bg-purple-700",
                            )}
                          >
                            {isSearching ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Search className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                            <SelectTrigger className={cn(
                              "w-[200px]",
                              theme === "dark" && "bg-slate-700 border-slate-600 text-white"
                            )}>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {imageCategories.map((category) => (
                                <SelectItem key={category.name} value={category.name}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={appendSearch}
                              onCheckedChange={setAppendSearch}
                            />
                            <Label className={ theme === "dark" ? "text-white" : ""}>Append tags to search</Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {selectedCategory && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {imageCategories
                              .find(cat => cat.name === selectedCategory)
                              ?.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className={cn(
                                    "cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600",
                                    searchQuery.includes(tag) && "bg-purple-100 dark:bg-purple-900"
                                  )}
                                  onClick={() => handleTagClick(tag)}
                                >
                                  {tag}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {searchResults.length > 0 && (
                      <div className="space-y-4">
                        <div className="h-[300px] overflow-y-auto">
                          <div className="grid grid-cols-3 gap-4">
                            {searchResults.map((image) => (
                              <div
                                key={image.id}
                                className={cn(
                                  "relative rounded-lg overflow-hidden cursor-pointer group",
                                  "border",
                                  theme === "dark"
                                    ? "border-slate-600"
                                    : "border-gray-200",
                                )}
                                onClick={() => handleImageSelect(image)}
                              >
                                <img
                                  src={image.thumbnail}
                                  alt={`Photo by ${image.photographer}`}
                                  className="w-full h-32 object-cover"
                                />
                                <div
                                  className={cn(
                                    "absolute inset-0 flex items-center justify-center",
                                    "bg-black bg-opacity-50 opacity-0 group-hover:opacity-100",
                                    "transition-opacity duration-200",
                                  )}
                                >
                                  <Button variant="secondary">Add to Banner</Button>
                                </div>
                                <div
                                  className={cn(
                                    "absolute bottom-0 left-0 right-0 p-2",
                                    "bg-gradient-to-t from-black/50 to-transparent",
                                  )}
                                >
                                  <span className="text-white text-xs">
                                    {image.photographer}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        {hasMore && (
                          <div className="flex justify-center">
                            <Button
                              variant="outline"
                              onClick={loadMore}
                              disabled={isLoadingMore}
                              className={cn(
                                "w-full",
                                theme === "dark" && "border-slate-600 text-slate-200"
                              )}
                            >
                              {isLoadingMore ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Load More"
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4">
                  <Label className={theme === "dark" ? "text-white" : undefined}>
                    Transition Time (seconds)
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={config.transitionTime}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        transitionTime: parseInt(e.target.value) || 5,
                      }))
                    }
                    className={cn(
                      "mt-1",
                      theme === "dark" &&
                        "bg-slate-700 border-slate-600 text-white",
                    )}
                  />
                </div>

                {config.images.length > 0 && (
                  <div className="mt-8">
                    <h4
                      className={cn(
                        "text-lg font-semibold mb-4",
                        theme === "dark" ? "text-white" : "text-gray-900",
                      )}
                    >
                      Selected Images Gallery
                    </h4>
                    <div className="h-[450px] overflow-y-auto pr-4 pb-8">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {config.images.map((image, index) => (
                          <div
                            key={index}
                            className={cn(
                              "relative rounded-lg overflow-hidden group aspect-square",
                              "border",
                              theme === "dark"
                                ? "border-slate-600"
                                : "border-gray-200",
                            )}
                          >
                            <img
                              src={image.url}
                              alt={`Gallery Image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div
                              className={cn(
                                "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100",
                                "transition-opacity duration-200",
                                "flex flex-col items-center justify-center p-4"
                              )}
                            >
                              <div className="text-white text-center mb-4">
                                <p className="text-sm font-medium">Image {index + 1}</p>
                                <p className="text-xs opacity-75">Click to view full size</p>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(image.url, '_blank');
                                  }}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfig((prev) => ({
                                      ...prev,
                                      images: prev.images.filter((_, i) => i !== index),
                                    }));
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="audio">
              <div className="space-y-4">
                <h3
                  className={cn(
                    "text-lg font-semibold mb-4",
                    theme === "dark" ? "text-white" : "text-gray-900",
                  )}
                >
                  Audio Playlist
                </h3>

                <RadioGroup
                  value={audioSource}
                  onValueChange={(value) => setAudioSource(value as "upload" | "apple_music" | "spotify")}
                  className="flex space-x-4 mb-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upload" id="upload" />
                    <Label className={ theme === "dark" ? "text-white" : ""} htmlFor="upload">Upload</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="apple_music" id="apple_music" />
                    <Label className={ theme === "dark" ? "text-white" : ""} htmlFor="apple_music">Apple Music</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="spotify" id="spotify" />
                    <Label className={ theme === "dark" ? "text-white" : ""} htmlFor="spotify">Spotify</Label>
                  </div>
                </RadioGroup>

                {audioSource === "upload" ? (
                  <div
                    {...getAudioRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                      theme === "dark"
                        ? "border-slate-600 hover:border-slate-500"
                        : "border-gray-300 hover:border-gray-400",
                    )}
                  >
                    <input {...getAudioInputProps()} />
                    <Music2 className="mx-auto h-12 w-12 text-gray-400" />
                    <p
                      className={cn(
                        "mt-2",
                        theme === "dark" ? "text-slate-300" : "text-gray-600",
                      )}
                    >
                      Drag & drop audio files here, or click to select
                    </p>
                    <p
                      className={cn(
                        "text-sm mt-1",
                        theme === "dark" ? "text-slate-400" : "text-gray-500",
                      )}
                    >
                      Supported formats: MP3, WAV (max 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className={theme === "dark" ? "text-white" : undefined}>
                        {audioSource === "apple_music" ? "Apple Music Link" : "Spotify Link"}
                      </Label>
                      <div className="flex space-x-2">
                        <Input
                          value={audioLink}
                          onChange={(e) => setAudioLink(e.target.value)}
                          placeholder={`Enter ${audioSource === "apple_music" ? "Apple Music" : "Spotify"} link`}
                          className={cn(
                            theme === "dark" && "bg-slate-700 border-slate-600 text-white",
                          )}
                        />
                        <Button
                          onClick={handleAudioLinkAdd}
                          className={theme === "dark" ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {config.audio.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {config.audio.map((audio, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center p-2 rounded-lg",
                          "border",
                          theme === "dark"
                            ? "border-slate-600 bg-slate-700"
                            : "border-gray-200 bg-gray-50",
                        )}
                      >
                        <Music2
                          className={cn(
                            "h-5 w-5 mr-3",
                            theme === "dark"
                              ? "text-slate-400"
                              : "text-gray-400",
                          )}
                        />
                        <span
                          className={theme === "dark" ? "text-white" : undefined}
                        >
                          {audio.name}
                          {audio.source && ` (${audio.source.replace('_', ' ')})`}
                        </span>
                        <button
                          onClick={() => {
                            setConfig((prev) => ({
                              ...prev,
                              audio: prev.audio.filter((_, i) => i !== index),
                            }));
                          }}
                          className={cn(
                            "ml-auto p-1 rounded-full",
                            theme === "dark"
                              ? "text-slate-400 hover:text-white hover:bg-slate-600"
                              : "text-gray-400 hover:text-gray-600  hover:bg-gray-200",
                          )}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 space-y-4">
                  <div className="flex items-center">
                    <Label className={theme === "dark" ? "text-white" : undefined}>
                      Autoplay
                    </Label>
                    <Switch
                      checked={config.autoplay}
                      onCheckedChange={(checked) =>
                        setConfig((prev) => ({
                          ...prev,
                          autoplay: checked,
                        }))
                      }
                      className="ml-2"
                    />
                  </div>
                  <div>
                    <Label className={theme === "dark" ? "text-white" : undefined}>
                      Volume
                    </Label>
                    <Slider
                      value={[config.volume]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([value]) =>
                        setConfig((prev) => ({
                          ...prev,
                          volume: value,
                        }))
                      }
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quotes">
              <div className="space-y-4">
                <h3
                  className={cn(
                    "text-lg font-semibold mb-4",
                    theme === "dark" ? "text-white" : "text-gray-900",
                  )}
                >
                  Quotes
                </h3>

                <RadioGroup
                  value={quoteSource}
                  onValueChange={(value) => {
                    setQuoteSource(value as "custom" | "quotable" | "zenquotes");
                    setQuoteSearchResults([]);
                  }}
                  className="flex space-x-4 mb-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem  value="custom" id="custom" />
                    <Label className={ theme === "dark" ? "text-white" : ""} htmlFor="custom">Custom</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="quotable" id="quotable" />
                    <Label className={ theme === "dark" ? "text-white" : ""} htmlFor="quotable">Quotable</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="zenquotes" id="zenquotes" />
                    <Label className={ theme === "dark" ? "text-white" : ""} htmlFor="zenquotes">ZenQuotes</Label>
                  </div>
                </RadioGroup>

                {quoteSource === "custom" ? (
                  <div className="space-y-4">
                    <div>
                      <Label className={theme === "dark" ? "text-white" : undefined}>
                        Quote Text
                      </Label>
                      <Input
                        value={newQuote.text}
                        onChange={(e) =>
                          setNewQuote((prev) => ({ ...prev, text: e.target.value }))
                        }
                        placeholder="Enter quote text"
                        className={cn(
                          theme === "dark" &&
                            "bg-slate-700 border-slate-600 text-white",
                        )}
                      />
                    </div>
                    <div>
                      <Label className={theme === "dark" ? "text-white" : undefined}>
                        Author
                      </Label>
                      <Input
                        value={newQuote.author}
                        onChange={(e) =>
                          setNewQuote((prev) => ({ ...prev, author: e.target.value }))
                        }
                        placeholder="Enter author name"
                        className={cn(
                          theme === "dark" &&
                            "bg-slate-700 border-slate-600 text-white",
                        )}
                      />
                    </div>
                    <Button
                      onClick={handleQuoteAdd}
                      className={theme === "dark" ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"}
                    >
                      Add Quote
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex space-x-2">
                          <Input
                            type="text"
                            placeholder="Search quotes..."
                            value={quoteSearchQuery}
                            onChange={(e) => setQuoteSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleQuoteSearch();
                              }
                            }}
                            className={cn(
                              theme === "dark" &&
                                "bg-slate-700 border-slate-600 text-white",
                            )}
                          />
                          <Button
                            onClick={() => handleQuoteSearch()}
                            disabled={isQuoteSearching}
                            className={cn(
                              "min-w-[100px]",
                              theme === "dark" &&
                                "bg-purple-600 hover:bg-purple-700",
                            )}
                          >
                            {isQuoteSearching ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Search className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <Select
                            value={selectedQuoteCategory}
                            onValueChange={handleQuoteCategoryChange}
                          >
                            <SelectTrigger
                              className={cn(
                                "w-[200px]",
                                theme === "dark" &&
                                  "bg-slate-700 border-slate-600 text-white",
                              )}
                            >
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {quoteCategories.map((category) => (
                                <SelectItem key={category.name} value={category.name}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={appendSearch}
                              onCheckedChange={setAppendSearch}
                            />
                            <Label className={ theme === "dark" ? "text-white" : ""} >Append tags to search</Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {selectedQuoteCategory && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {quoteCategories
                              .find((cat) => cat.name === selectedQuoteCategory)
                              ?.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className={cn(
                                    "cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600",
                                    quoteSearchQuery.includes(tag) &&
                                      "bg-purple-100 dark:bg-purple-900",
                                  )}
                                  onClick={() => handleQuoteTagClick(tag)}
                                >
                                  {tag}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {quoteSearchResults.length > 0 && (
                      <div className="space-y-4">
                        <div className="h-[400px] overflow-y-auto">
                          {quoteSearchResults.map((quote) => (
                            <div
                              key={quote.id}
                              className={cn(
                                "p-4 rounded-lg mb-4 cursor-pointer group",
                                "border",
                                theme === "dark"
                                  ? "border-slate-600 bg-slate-700"
                                  : "border-gray-200 bg-gray-50",
                              )}
                              onClick={() => handleQuoteSelect(quote)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p
                                    className={cn(
                                      "text-sm italic mb-2",
                                      theme === "dark"
                                        ? "text-slate-200"
                                        : "text-gray-700",
                                    )}
                                  >
                                    "{quote.content}"
                                  </p>
                                  <p
                                    className={cn(
                                      "text-sm",
                                      theme === "dark"
                                        ? "text-slate-400"
                                        : "text-gray-500",
                                    )}
                                  >
                                    - {quote.author}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={cn(
                                    "opacity-0 group-hover:opacity-100",
                                    "transition-opacity duration-200",
                                  )}
                                >
                                  Add
                                </Button>
                              </div>
                              {quote.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {quote.tags.map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="secondary"
                                      className={theme === "dark" ? "bg-slate-600" : "bg-gray-200"}
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6">
                  <h4
                    className={cn(
                      "text-lg font-semibold mb-4",
                      theme === "dark" ? "text-white" : "text-gray-900",
                    )}
                  >
                    Current Quotes
                  </h4>
                  <div className="space-y-4">
                    {config.quotes.map((quote, index) => (
                      <div
                        key={index}
                        className={cn(
                          "p-4 rounded-lg border",
                          theme === "dark"
                            ? "border-slate-600 bg-slate-700"
                            : "border-gray-200",
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-4">
                            <div>
                              <Label
                                className={
                                  theme === "dark" ? "text-white" : "text-gray-900"
                                }
                              >
                                Quote Text
                              </Label>
                              <Input
                                value={quote.text}
                                onChange={(e) =>
                                  handleQuoteUpdate(index, "text", e.target.value)
                                }
                                maxLength={150}
                                placeholder="Enter quote text..."
                                className={cn(
                                  "mt-1",
                                  theme === "dark" ? "bg-slate-800 border-slate-600 text-white" : "bg-slate-50 border-gray-200 text-gray-900",
                                )}
                              />
                            </div>
                            <div>
                              <Label
                                className={
                                  theme === "dark" ? "text-white" : undefined
                                }
                              >
                                Author
                              </Label>
                              <Input
                                value={quote.author}
                                onChange={(e) =>
                                  handleQuoteUpdate(index, "author", e.target.value)
                                }
                                placeholder="Enter author name..."
                                className={cn(
                                  "mt-1",
                                  theme === "dark" &&
                                    "bg-slate-800 border-slate-600 text-white",
                                )}
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => handleQuoteRemove(index)}
                            className={cn(
                              "ml-4 p-1 rounded-full",
                              theme === "dark"
                                ? "text-slate-400 hover:text-white hover:bg-slate-600"
                                : "text-gray-400 hover:text-gray-600 hover:bg-gray-200",
                            )}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center">
                    <Label className={theme === "dark" ? "text-white" : "text-gray-900"}>
                      Enable Quote Rotation
                    </Label>
                    <Switch
                      checked={config.quoteRotation}
                      onCheckedChange={(checked) =>
                        setConfig((prev) => ({
                          ...prev,
                          quoteRotation: checked,
                        }))
                      }
                      className="ml-2"
                    />
                  </div>
                  {config.quoteRotation && (
                    <div>
                      <Label
                        className={theme === "dark" ? "text-white" : undefined}
                      >
                        Display Duration (seconds)
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        value={config.quoteDuration}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            quoteDuration: parseInt(e.target.value) || 10,
                          }))
                        }
                        className={cn(
                          "mt-1",
                          theme === "dark" &&
                            "bg-slate-800 border-slate-600 text-white",
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className={theme === "dark" ? "border-slate-300 text-primary" : "border-gray-300 text-primary"}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className={theme === "dark" ? "bg-purple-600 hover:bg-purple-700" : "bg-purple-500 hover:bg-purple-600"}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};