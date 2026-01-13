import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AiBadge from './AiBadge';

interface RiskBadgeProps {
  score?: number; // 0-100
  loading?: boolean;
  error?: boolean;
}

/**
 * RiskBadge: Displays tenant risk score with color coding
 * - Low Risk (67-100): Green - Best rating
 * - Medium Risk (34-66): Yellow/Orange - Moderate rating
 * - High Risk (0-33): Red - Needs caution
 * Higher score = Lower risk (0-100 scale)
 */
export const RiskBadge = ({
  score,
  loading = false,
  error = false,
}: RiskBadgeProps) => {
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="animate-pulse">
          Analyzing...
        </Badge>
        <AiBadge size="sm" />
      </div>
    );
  }

  if (error || score === undefined) {
    return (
      <Badge variant="secondary" className="gap-1">
        <span>Risk unavailable</span>
      </Badge>
    );
  }

  // Determine color and icon based on score
  // Higher score = lower risk
  let variantColor = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  let icon = <AlertCircle className="h-4 w-4" />;
  let displayLevel = 'high';

  if (score >= 67) {
    variantColor = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    icon = <CheckCircle className="h-4 w-4" />;
    displayLevel = 'low';
  } else if (score >= 34) {
    variantColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    icon = <AlertTriangle className="h-4 w-4" />;
    displayLevel = 'medium';
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`px-3 py-1 rounded-full flex items-center gap-2 text-sm font-medium ${variantColor}`}>
        {icon}
        <span>Risk: {displayLevel}</span>
        {score !== undefined && (
          <span className="ml-1 text-xs opacity-75">({Math.round(score)}/100)</span>
        )}
      </div>
      <AiBadge size="sm" tooltip="AI-calculated risk score (higher = safer)" />
    </div>
  );
};

export default RiskBadge;
