import type { FilmDTO, FilmStatus } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilmCardProps {
  film: FilmDTO;
  onStatusChange: (filmId: number, newStatus: FilmStatus) => void;
  onDeleteRequest: (filmId: number, filmTitle: string) => void;
}

export function FilmCard({ film, onStatusChange, onDeleteRequest }: FilmCardProps) {
  const getStatusStyles = () => {
    switch (film.status) {
      case "to-watch":
        return "border-blue-200 bg-blue-50";
      case "watched":
        return "border-green-200 bg-green-50";
      case "rejected":
        return "border-red-200 bg-red-50";
      default:
        return "";
    }
  };

  return (
    <Card className={cn("h-full flex flex-col border-2", getStatusStyles())}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{film.title}</CardTitle>
            <CardDescription>{film.year}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-red-600"
            onClick={() => onDeleteRequest(film.id, film.title)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{film.description}</p>

        <div className="space-y-3">
          {/* Genres */}
          {film.genres && film.genres.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-1">Genres</h4>
              <div className="flex flex-wrap gap-1">
                {film.genres.map((genre) => (
                  <Badge key={genre} variant="secondary" className="text-xs">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Director */}
          {film.director && (
            <div>
              <h4 className="text-sm font-semibold mb-1">Director</h4>
              <p className="text-sm text-gray-600">{film.director}</p>
            </div>
          )}

          {/* Actors */}
          {film.actors && film.actors.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-1">Actors</h4>
              <div className="flex flex-wrap gap-1">
                {film.actors.map((actor) => (
                  <Badge key={actor} variant="outline" className="text-xs">
                    {actor}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 sm:justify-start md:justify-center border-t pt-4">
        <Button
          variant={film.status === "to-watch" ? "default" : "outline"}
          size="sm"
          className={cn("flex items-center gap-1", film.status === "to-watch" && "bg-blue-600 hover:bg-blue-700")}
          onClick={() => onStatusChange(film.id, "to-watch")}
        >
          <Clock className="h-4 w-4" />
          Do obejrzenia
        </Button>
        <Button
          variant={film.status === "watched" ? "default" : "outline"}
          size="sm"
          className={cn("flex items-center gap-1", film.status === "watched" && "bg-green-600 hover:bg-green-700")}
          onClick={() => onStatusChange(film.id, "watched")}
        >
          <Eye className="h-4 w-4" />
          Obejrzane
        </Button>
        <Button
          variant={film.status === "rejected" ? "default" : "outline"}
          size="sm"
          className={cn("flex items-center gap-1", film.status === "rejected" && "bg-red-600 hover:bg-red-700")}
          onClick={() => onStatusChange(film.id, "rejected")}
        >
          <X className="h-4 w-4" />
          Odrzucone
        </Button>
      </CardFooter>
    </Card>
  );
}
