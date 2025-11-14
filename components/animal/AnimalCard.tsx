import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getStatusColor } from '@/lib/animal-helpers';
import type { Animal } from '@/types/animal';

interface AnimalCardProps {
  animal: Animal;
  onClick?: () => void;
}

export function AnimalCard({ animal, onClick }: AnimalCardProps) {

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{animal.name}</CardTitle>
          <Badge className={getStatusColor(animal.status)}>{animal.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Art:</span> {animal.animal}
          </p>
          <p>
            <span className="font-medium">Rasse:</span> {animal.breed}
          </p>
          <p>
            <span className="font-medium">Geschlecht:</span> {animal.gender}
          </p>
          <p>
            <span className="font-medium">Ort:</span> {animal.location}
          </p>
          {animal.descLong && (
            <p className="text-textPrimary line-clamp-2">{animal.descLong}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

