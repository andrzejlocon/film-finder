import { useState, useEffect } from "react";
import type { RecommendationCriteria } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { YearPicker } from "@/components/ui/year-picker";

interface CriteriaFormProps {
  criteria: RecommendationCriteria;
  onCriteriaChange: (criteria: RecommendationCriteria) => void;
  onFillFromProfile: () => void;
  onGenerateRecommendations: () => void;
  isLoading: boolean;
}

export function CriteriaForm({
  criteria,
  onCriteriaChange,
  onFillFromProfile,
  onGenerateRecommendations,
  isLoading,
}: CriteriaFormProps) {
  const [inputValues, setInputValues] = useState({
    actors: "",
    directors: "",
    genres: "",
  });

  const [yearErrors, setYearErrors] = useState<string[]>([]);

  useEffect(() => {
    const errors: string[] = [];

    if (criteria.year_from && criteria.year_to && criteria.year_from > criteria.year_to) {
      errors.push("Year From must be less than or equal to Year To");
    }

    setYearErrors(errors);
  }, [criteria.year_from, criteria.year_to]);

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, field: "actors" | "directors" | "genres") => {
    if (e.key === "Enter" && inputValues[field].trim()) {
      e.preventDefault();
      const newValue = inputValues[field].trim();
      const currentValues = criteria[field] || [];

      if (!currentValues.includes(newValue)) {
        onCriteriaChange({
          ...criteria,
          [field]: [...currentValues, newValue],
        });
      }

      setInputValues((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleRemoveItem = (field: "actors" | "directors" | "genres", item: string) => {
    const currentValues = criteria[field] || [];
    onCriteriaChange({
      ...criteria,
      [field]: currentValues.filter((value) => value !== item),
    });
  };

  const handleYearChange = (field: "year_from" | "year_to", year: number | undefined) => {
    onCriteriaChange({
      ...criteria,
      [field]: year,
    });
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow">
      {/* Actors Input */}
      <div className="space-y-2">
        <Label htmlFor="actors">Actors</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {criteria.actors?.map((actor) => (
            <Badge key={actor} variant="secondary" className="flex items-center gap-1">
              {actor}
              <button onClick={() => handleRemoveItem("actors", actor)} className="ml-1 hover:text-red-500">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <Input
          id="actors"
          value={inputValues.actors}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInputValues((prev) => ({ ...prev, actors: e.target.value }))
          }
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => handleInputKeyPress(e, "actors")}
          placeholder="Type an actor's name and press Enter"
        />
      </div>

      {/* Directors Input */}
      <div className="space-y-2">
        <Label htmlFor="directors">Directors</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {criteria.directors?.map((director) => (
            <Badge key={director} variant="secondary" className="flex items-center gap-1">
              {director}
              <button onClick={() => handleRemoveItem("directors", director)} className="ml-1 hover:text-red-500">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <Input
          id="directors"
          value={inputValues.directors}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInputValues((prev) => ({ ...prev, directors: e.target.value }))
          }
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => handleInputKeyPress(e, "directors")}
          placeholder="Type a director's name and press Enter"
        />
      </div>

      {/* Genres Input */}
      <div className="space-y-2">
        <Label htmlFor="genres">Genres</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {criteria.genres?.map((genre) => (
            <Badge key={genre} variant="secondary" className="flex items-center gap-1">
              {genre}
              <button onClick={() => handleRemoveItem("genres", genre)} className="ml-1 hover:text-red-500">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <Input
          id="genres"
          value={inputValues.genres}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInputValues((prev) => ({ ...prev, genres: e.target.value }))
          }
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => handleInputKeyPress(e, "genres")}
          placeholder="Type a genre and press Enter"
        />
      </div>

      {/* Year Range */}
      <div className="flex gap-4">
        <YearPicker
          label="Year From"
          value={criteria.year_from}
          onChange={(year) => handleYearChange("year_from", year)}
        />
        <YearPicker label="Year To" value={criteria.year_to} onChange={(year) => handleYearChange("year_to", year)} />
      </div>

      {yearErrors.length > 0 && (
        <div className="text-red-500 text-sm">
          {yearErrors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button variant="outline" onClick={onFillFromProfile} disabled={true}>
          Fill from Profile
        </Button>
        <Button onClick={onGenerateRecommendations} disabled={isLoading || yearErrors.length > 0}>
          <span className="hidden sm:inline">Generate Recommendations</span>
          <span className="sm:hidden">Generate</span>
        </Button>
      </div>
    </div>
  );
}
