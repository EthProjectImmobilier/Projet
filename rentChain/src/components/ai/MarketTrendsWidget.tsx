import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp } from 'lucide-react';
import AiBadge from './AiBadge';
import type { CityAnalytics } from '@/services/aiService';

interface MarketTrendsWidgetProps {
  analytics: CityAnalytics[];
  loading?: boolean;
  error?: boolean;
  maxCitiesToShow?: number;
}

const CITY_COLORS: Record<string, string> = {
  Casablanca: '#ef4444',
  Rabat: '#f59e0b',
  Agadir: '#10b981',
  Fes: '#3b82f6',
  Tanger: '#8b5cf6',
  Marrakech: '#ec4899',
  Tangier: '#8b5cf6',
};

/**
 * MarketTrendsWidget: Displays price forecasts per city
 * Shows a single line chart with multiple city trends
 * Used on Home/Landing page (public, no auth required)
 */
export const MarketTrendsWidget = ({
  analytics = [],
  loading = false,
  error = false,
  maxCitiesToShow = 5,
}: MarketTrendsWidgetProps) => {
  const [selectedCities, setSelectedCities] = useState<Set<string>>(
    new Set(analytics.slice(0, maxCitiesToShow).map((a) => a.city))
  );

  // Transform analytics data for Recharts
  const chartData = useMemo(() => {
    if (!analytics.length) return [];

    // Get all unique dates from forecasts
    const allDates = new Set<string>();
    analytics.forEach((city) => {
      city.forecast.forEach((f) => {
        allDates.add(f.date);
      });
    });

    const sortedDates = Array.from(allDates).sort();

    // Create data points for each date with prices from selected cities
    return sortedDates.map((date) => {
      const dataPoint: Record<string, any> = { date };

      analytics.forEach((city) => {
        if (selectedCities.has(city.city)) {
          const forecast = city.forecast.find((f) => f.date === date);
          if (forecast) {
            // Convert scientific notation to readable number
            dataPoint[city.city] = parseFloat(forecast.price.toFixed(9));
          }
        }
      });

      return dataPoint;
    });
  }, [analytics, selectedCities]);

  const handleCityToggle = (city: string) => {
    const newSet = new Set(selectedCities);
    if (newSet.has(city)) {
      newSet.delete(city);
    } else {
      newSet.add(city);
    }
    setSelectedCities(newSet);
  };

  if (error) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Market Trends
            </CardTitle>
            <AiBadge size="sm" />
          </div>
          <CardDescription>
            AI-forecasted price trends across major cities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-center">
            <div>
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                Market trends unavailable
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics.length) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Market Trends
            </CardTitle>
            <AiBadge size="sm" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-center">
            <div>
              <p className="text-sm text-muted-foreground">
                No market data available
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Market Trends
            </CardTitle>
            <AiBadge size="sm" tooltip="AI price forecasts" />
          </div>
          <span className="text-xs text-muted-foreground">
            {analytics.length} cities analyzed
          </span>
        </div>
        <CardDescription>
          AI-forecasted price trends for the next 30 days
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* City Selector */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Select Cities to Compare:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {analytics.map((city) => (
              <Button
                key={city.city}
                variant={selectedCities.has(city.city) ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCityToggle(city.city)}
                className="text-xs"
              >
                {city.city}
              </Button>
            ))}
          </div>
        </div>

        {/* Chart */}
        {loading ? (
          <div className="animate-pulse">
            <div className="bg-muted rounded-lg h-80" />
          </div>
        ) : selectedCities.size > 0 && chartData.length > 0 ? (
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  interval={Math.floor(chartData.length / 6)}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{
                    value: 'Price (ETH)',
                    angle: -90,
                    position: 'insideLeft',
                  }}
                />
                <Tooltip
                  formatter={(value: any) => {
                    if (typeof value === 'number') {
                      return `$${value.toFixed(9)}`;
                    }
                    return value;
                  }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                />
                <Legend />

                {Array.from(selectedCities).map((city) => (
                  <Line
                    key={city}
                    type="monotone"
                    dataKey={city}
                    stroke={CITY_COLORS[city] || '#8884d8'}
                    dot={false}
                    isAnimationActive={false}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Select at least one city to view trends
            </p>
          </div>
        )}

        {/* Analytics Summary */}
        {selectedCities.size > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            {analytics
              .filter((a) => selectedCities.has(a.city))
              .map((city) => (
                <div key={city.city} className="text-xs space-y-1">
                  <h4 className="font-semibold">{city.city}</h4>
                  <p className="text-muted-foreground">
                    Model: <span className="font-medium">{city.model_used}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Error: <span className="font-medium">{city.rmse_error.toFixed(2)}%</span>
                  </p>
                  <p className="text-muted-foreground">
                    Cluster:{' '}
                    <span className="font-medium">{city.market_cluster}</span>
                  </p>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketTrendsWidget;
