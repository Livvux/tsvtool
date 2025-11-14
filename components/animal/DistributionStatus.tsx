import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getStatusBadge as getCachedStatusBadge, formatDateTime } from '@/lib/animal-helpers';
import type { Animal } from '@/types/animal';

interface DistributionStatusProps {
  animal: Animal;
}

interface PlatformStatus {
  name: string;
  key: keyof Animal['distributedTo'];
  icon: string;
}

const platforms: PlatformStatus[] = [
  { name: 'WordPress', key: 'wordpress', icon: 'W' },
  { name: 'Facebook', key: 'facebook', icon: 'F' },
  { name: 'Instagram', key: 'instagram', icon: 'I' },
  { name: 'X (Twitter)', key: 'x', icon: 'X' },
  { name: 'matchpfote', key: 'matchpfote', icon: 'M' },
];

export function DistributionStatus({ animal }: DistributionStatusProps) {
  const { distributedTo } = animal;
  
  const getStatusBadge = (status: boolean | undefined) => {
    const badge = getCachedStatusBadge(status);
    return <Badge className={badge.className}>{badge.text}</Badge>;
  };

  const hasAnyDistribution = Object.values(distributedTo || {}).some(
    (value) => value !== undefined && value !== null
  );

  if (!hasAnyDistribution && !distributedTo?.distributedAt) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verteilung</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-textPrimary">
            Noch nicht verteilt
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verteilung</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platforms.map((platform) => {
            const status = distributedTo?.[platform.key] as boolean | undefined;
            return (
              <div
                key={platform.key}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{platform.name}</span>
                </div>
                {getStatusBadge(status)}
              </div>
            );
          })}
        </div>
        {distributedTo?.distributedAt && (
          <div className="pt-2 border-t">
            <p className="text-xs text-textPrimary">
              Verteilungszeitpunkt: {formatDateTime(distributedTo.distributedAt)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

