import { Card } from './Card';
import { cn } from '../../utils/cn';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  description,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-semibold mt-1">{value}</h3>
          
          {trend && (
            <div className="flex items-center mt-1">
              <span 
                className={cn(
                  "text-xs font-medium mr-1",
                  trend.isPositive ? "text-success-600" : "text-error-600"
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-gray-500">from last period</span>
            </div>
          )}
          
          {description && (
            <p className="text-sm text-gray-500 mt-2">{description}</p>
          )}
        </div>
        
        {icon && (
          <div className="p-2 rounded-full bg-primary-50 text-primary-500">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}