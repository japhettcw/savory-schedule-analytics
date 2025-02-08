
import { useCallback } from "react";
import { useDropzone } from "@/lib/useDropzone";
import { Image } from "lucide-react";

interface ImageUploaderProps {
  imageUrl: string;
  onImageUpload: (file: File) => void;
  className?: string;
}

export function ImageUploader({ imageUrl, onImageUpload, className = "" }: ImageUploaderProps) {
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
        className={`
          relative cursor-pointer
          transition-all duration-200
          ${isDragActive ? 'scale-105' : ''}
        `}
      >
        <input {...getInputProps()} />
        <img
          src={imageUrl}
          alt="Menu item preview"
          className="w-32 h-32 object-cover rounded-lg"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
          <div className="text-white text-center p-2">
            <Image className="h-6 w-6 mx-auto mb-1" />
            <p className="text-xs">Click or drop to upload</p>
          </div>
        </div>
      </div>
    </div>
  );
}
