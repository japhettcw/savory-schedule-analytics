
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
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger className={cn("inline-flex items-center gap-1", className)}>
          {children}
          {showIcon && <HelpCircle className="h-4 w-4 text-muted-foreground" />}
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
