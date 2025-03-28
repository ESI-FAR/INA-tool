import { Button, ButtonProps } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

/**
 * Button that shows tooltip even when disabled
 */
export function ButtonWithTooltip({
  onClick,
  disabled,
  tooltip,
  size = "default",
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  tooltip: string;
  size?: ButtonProps["size"];
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Button
              variant="secondary"
              onClick={onClick}
              disabled={disabled}
              size={size}
            >
              {children}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
