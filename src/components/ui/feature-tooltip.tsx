
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureTooltipProps {
  content: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  className?: string;
}

export function FeatureTooltip({ 
  content, 
  children, 
  showIcon = true,
  className 
}: FeatureTooltipProps) {
  return (
    <TooltipProvider delayDuration={700}>
      <Tooltip>
        <TooltipTrigger className={cn("inline-flex items-center gap-1", className)}>
          {children}
          {showIcon && <HelpCircle className="h-4 w-4 text-muted-foreground" />}
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          sideOffset={10}
          className="z-50"
        >
          <p className="max-w-xs text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
