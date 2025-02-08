
import { useCallback, useState } from "react";
import { useDropzone } from "@/lib/useDropzone";
import { Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  imageUrl: string;
  onImageUpload: (file: File) => void;
  className?: string;
}

export function ImageUploader({ imageUrl, onImageUpload, className = "" }: ImageUploaderProps) {
  const [isLoading, setIsLoading] = useState(true);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImageUpload(acceptedFiles[0]);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });

  return (
    <div className={`relative ${className}`}>
      <div
        {...getRootProps()}
        className={cn(
          "relative cursor-pointer transition-all duration-200",
          isDragActive && "scale-105"
        )}
      >
        <input {...getInputProps()} />
        
        {/* Blur placeholder while image loads */}
        <div 
          className={cn(
            "absolute inset-0 bg-gray-200 animate-pulse rounded-lg",
            !isLoading && "hidden"
          )}
        />

        <img
          src={imageUrl}
          alt="Menu item preview"
          className={cn(
            "w-32 h-32 object-cover rounded-lg transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
        />

        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg"
          role="button"
          aria-label="Click or drop to upload image"
        >
          <div className="text-white text-center p-2">
            <Image className="h-6 w-6 mx-auto mb-1" />
            <p className="text-xs">Click or drop to upload</p>
          </div>
        </div>
      </div>
    </div>
  );
}
