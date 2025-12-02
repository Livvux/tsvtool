import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { getStatusColor } from '@/lib/animal-helpers';
import { getR2PublicUrl } from '@/lib/storage';
import { sanitizeText } from '@/lib/sanitize';
import type { Animal } from '@/types/animal';
import { 
  CalendarIcon, 
  SewingPinIcon, 
  RulerHorizontalIcon,
  InfoCircledIcon,
  VideoIcon
} from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

interface AnimalCardProps {
  animal: Animal;
  onClick?: () => void;
}

function AnimalImage({ storageId, name }: { storageId: string | null; name: string }) {
  const url = getR2PublicUrl(storageId);
  
  if (!url) {
    return (
      <div className="w-full h-48 bg-muted flex items-center justify-center text-muted-foreground animate-pulse">
        <div className="text-center">
           <span className="text-2xl opacity-50">🐾</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-48 overflow-hidden relative bg-muted">
      <img 
        src={url} 
        alt={name} 
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-in-out" 
        loading="lazy"
      />
    </div>
  );
}

export function AnimalCard({ animal, onClick }: AnimalCardProps) {
  // Construct R2 URLs in frontend
  const mainImageId = animal.gallery?.[0] ?? null;
  const hasVideos = animal.videos && animal.videos.length > 0;

  return (
    <Card
      className="group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border-border flex flex-col h-full bg-card"
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="relative">
        {mainImageId ? (
          <AnimalImage storageId={mainImageId} name={animal.name} />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center text-muted-foreground/50">
             <span className="text-4xl opacity-30">🐾</span>
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          {hasVideos && (
            <Badge className="shadow-sm backdrop-blur-md bg-gray-700 dark:bg-gray-800 text-white border-0 flex items-center gap-1">
              <VideoIcon className="w-3 h-3" />
              <span>{animal.videos?.length}</span>
            </Badge>
          )}
          <Badge className={cn("shadow-sm backdrop-blur-md bg-opacity-90 border-0", getStatusColor(animal.status))}>
            {animal.status}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-6 flex-grow flex flex-col gap-4">
        <div className="flex justify-between items-start">
           <div>
              <h3 className="text-2xl font-bold text-accent group-hover:text-primary transition-colors line-clamp-1 tracking-tight">
                {sanitizeText(animal.name)}
              </h3>
              <p className="text-base text-muted-foreground font-medium mt-1">{sanitizeText(animal.breed)}</p>
           </div>
           <Badge variant="secondary" className="font-normal text-sm px-3 py-1">
             {animal.animal}
           </Badge>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-foreground/80 mt-2">
          <div className="flex items-center gap-2" title="Geschlecht">
            <div className="w-5 flex justify-center text-muted-foreground font-bold text-base">
               {animal.gender === 'weiblich' ? '♀' : '♂'}
            </div>
            <span className="truncate">{animal.gender}</span>
          </div>
          <div className="flex items-center gap-2" title="Standort">
            <SewingPinIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{sanitizeText(animal.location)}</span>
          </div>
          {animal.birthDate && (
            <div className="flex items-center gap-2" title="Geburtsdatum">
               <CalendarIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
               <span className="truncate">{animal.birthDate}</span>
            </div>
          )}
          {animal.shoulderHeight && (
            <div className="flex items-center gap-2" title="Schulterhöhe">
               <RulerHorizontalIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
               <span className="truncate">{animal.shoulderHeight} cm</span>
            </div>
          )}
        </div>

        {animal.descLong ? (
          <p className="text-base text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
            {sanitizeText(animal.descLong)}
          </p>
        ) : animal.descShort ? (
           <p className="text-base text-muted-foreground mt-2 line-clamp-2 leading-relaxed italic opacity-80">
            {sanitizeText(animal.descShort)}
          </p>
        ) : null}
      </CardContent>
      
      <CardFooter className="px-6 py-4 mt-auto text-sm text-muted-foreground flex justify-between border-t border-border bg-muted/30">
         <span>Erstellt: {new Date(animal._creationTime).toLocaleDateString()}</span>
         <span className="flex items-center gap-2 text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
           Details <InfoCircledIcon className="w-5 h-5" />
         </span>
      </CardFooter>
    </Card>
  );
}
