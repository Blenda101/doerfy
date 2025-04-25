import React, { useState, useCallback } from "react";
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
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { useDropzone } from "react-dropzone";
import { DragDropContext, Droppable, Draggable } from "@dnd-kit/core";
import { cn } from "../lib/utils";
import {
  Image as ImageIcon,
  Music,
  Quote,
  X,
  GripVertical,
  Upload,
  AlertCircle,
} from "lucide-react";
import { getCurrentUser, supabase } from "../utils/supabaseClient";

export interface BannerConfig {
  images: {
    url: string;
    order: number;
  }[];
  transitionTime: number;
  audio: {
    url: string;
    name: string;
    order: number;
  }[];
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
      transitionTime: 5,
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

  const onDrop = useCallback(
    async (acceptedFiles: File[], type: "images" | "audio") => {
      const maxSize = type === "images" ? 2 * 1024 * 1024 : 10 * 1024 * 1024;
      const validFiles = acceptedFiles.filter((file) => file.size <= maxSize);

      if (validFiles.length < acceptedFiles.length) {
        alert(
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
    setConfig((prev) => ({
      ...prev,
      quotes: [
        ...prev.quotes,
        {
          text: "",
          author: "",
          order: prev.quotes.length,
        },
      ],
    }));
  };

  const handleQuoteRemove = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      quotes: prev.quotes.filter((_, i) => i !== index),
    }));
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

        <div className="flex-1 overflow-y-auto px-6">
          {/* Image Management */}
          <section className="mb-8">
            <h3
              className={cn(
                "text-lg font-semibold mb-4",
                theme === "dark" ? "text-white" : "text-gray-900",
              )}
            >
              Background Images
            </h3>
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
            {config.images.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {config.images.map((image, index) => (
                  <div
                    key={index}
                    className={cn(
                      "relative rounded-lg overflow-hidden group",
                      "border",
                      theme === "dark" ? "border-slate-600" : "border-gray-200",
                    )}
                  >
                    <img
                      src={image.url}
                      alt={`Background ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      onClick={() => {
                        setConfig((prev) => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== index),
                        }));
                      }}
                      className={cn(
                        "absolute top-2 right-2 p-1 rounded-full",
                        "opacity-0 group-hover:opacity-100 transition-opacity",
                        theme === "dark"
                          ? "bg-slate-800 text-white hover:bg-slate-700"
                          : "bg-white text-gray-600 hover:bg-gray-100",
                      )}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div
                      className={cn(
                        "absolute bottom-0 left-0 right-0 p-2",
                        "bg-gradient-to-t from-black/50 to-transparent",
                      )}
                    >
                      <span className="text-white text-sm">{index + 1}</span>
                    </div>
                  </div>
                ))}
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
          </section>

          {/* Audio Management */}
          <section className="mb-8">
            <h3
              className={cn(
                "text-lg font-semibold mb-4",
                theme === "dark" ? "text-white" : "text-gray-900",
              )}
            >
              Audio Playlist
            </h3>
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
              <Music className="mx-auto h-12 w-12 text-gray-400" />
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
                    <Music
                      className={cn(
                        "h-5 w-5 mr-3",
                        theme === "dark" ? "text-slate-400" : "text-gray-400",
                      )}
                    />
                    <span
                      className={theme === "dark" ? "text-white" : undefined}
                    >
                      {audio.name}
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
                          : "text-gray-400 hover:text-gray-600 hover:bg-gray-200",
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
          </section>

          {/* Quote Management */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3
                className={cn(
                  "text-lg font-semibold",
                  theme === "dark" ? "text-white" : "text-gray-900",
                )}
              >
                Quotes
              </h3>
              <Button
                onClick={handleQuoteAdd}
                variant="outline"
                className={theme === "dark" && "border-slate-600 text-white"}
              >
                Add Quote
              </Button>
            </div>
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
                            theme === "dark" ? "text-white" : undefined
                          }
                        >
                          Quote Text
                        </Label>
                        <Textarea
                          value={quote.text}
                          onChange={(e) =>
                            handleQuoteUpdate(index, "text", e.target.value)
                          }
                          maxLength={150}
                          placeholder="Enter quote text..."
                          className={cn(
                            "mt-1",
                            theme === "dark" &&
                              "bg-slate-800 border-slate-600 text-white",
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
            <div className="mt-4 space-y-4">
              <div className="flex items-center">
                <Label className={theme === "dark" ? "text-white" : undefined}>
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
          </section>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className={theme === "dark" && "border-slate-600 text-white"}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className={theme === "dark" && "bg-purple-600 hover:bg-purple-700"}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
