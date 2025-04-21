import type { RecommendedFilmDTO } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecommendationCardProps {
  film: RecommendedFilmDTO;
  onStatusChange: (filmId: string, status: "to-watch" | "watched" | "rejected") => void;
  currentStatus?: "to-watch" | "watched" | "rejected";
}

export function RecommendationCard({ film, onStatusChange, currentStatus }: RecommendationCardProps) {
  const filmId = `${film.title}-${film.year}`;

  const getStatusStyles = () => {
    switch (currentStatus) {
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
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{film.description}</p>

        <div className="space-y-3">
          {/* Genres */}
          <div>
            <h4 className="text-sm font-semibold mb-1">Genres</h4>
            <div className="flex flex-wrap gap-1">
              {film.genres?.map((genre) => (
                <Badge key={genre} variant="secondary" className="text-xs">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          {/* Director */}
          <div>
            <h4 className="text-sm font-semibold mb-1">Director</h4>
            <p className="text-sm text-gray-600">{film.director}</p>
          </div>

          {/* Actors */}
          <div>
            <h4 className="text-sm font-semibold mb-1">Actors</h4>
            <div className="flex flex-wrap gap-1">
              {film.actors?.map((actor) => (
                <Badge key={actor} variant="outline" className="text-xs">
                  {actor}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 sm:justify-start md:justify-center border-t pt-4">
        <Button
          variant={currentStatus === "to-watch" ? "default" : "outline"}
          size="sm"
          className={cn("flex items-center gap-1", currentStatus === "to-watch" && "bg-blue-600 hover:bg-blue-700")}
          onClick={() => onStatusChange(filmId, "to-watch")}
        >
          <Clock className="h-4 w-4" />
          Watch Later
        </Button>
        <Button
          variant={currentStatus === "watched" ? "default" : "outline"}
          size="sm"
          className={cn("flex items-center gap-1", currentStatus === "watched" && "bg-green-600 hover:bg-green-700")}
          onClick={() => onStatusChange(filmId, "watched")}
        >
          <Eye className="h-4 w-4" />
          Watched
        </Button>
        <Button
          variant={currentStatus === "rejected" ? "default" : "outline"}
          size="sm"
          className={cn("flex items-center gap-1", currentStatus === "rejected" && "bg-red-600 hover:bg-red-700")}
          onClick={() => onStatusChange(filmId, "rejected")}
        >
          <X className="h-4 w-4" />
          Not for me
        </Button>
      </CardFooter>
    </Card>
  );
}
