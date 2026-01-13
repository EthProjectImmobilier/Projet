import { Sparkles } from 'lucide-react';

interface AiBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  tooltip?: string;
}

/**
 * AiBadge: Reusable AI indicator
 * Shows an icon badge to indicate AI-derived insights
 * Used throughout the UI wherever AI data is presented
 */
export const AiBadge = ({
  size = 'sm',
  showText = false,
  tooltip = 'AI-powered insight',
}: AiBadgeProps) => {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div
      className="inline-flex items-center gap-1"
      title={tooltip}
    >
      <Sparkles
        className={`${sizeMap[size]} text-amber-500 flex-shrink-0`}
        strokeWidth={2.5}
      />
      {showText && (
        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
          AI
        </span>
      )}
    </div>
  );
};

export default AiBadge;
