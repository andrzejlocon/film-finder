import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const MIN_YEAR = 1887;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS_PER_PAGE = 20;

interface YearPickerProps {
  value?: number;
  onChange: (year: number | undefined) => void;
  label: string;
}

export function YearPicker({ value, onChange, label }: YearPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    if (value) {
      return Math.floor((value - MIN_YEAR) / YEARS_PER_PAGE);
    }
    return Math.floor((CURRENT_YEAR - MIN_YEAR) / YEARS_PER_PAGE);
  });

  const startYear = MIN_YEAR + currentPage * YEARS_PER_PAGE;
  const years = Array.from({ length: YEARS_PER_PAGE }, (_, i) => startYear + i).filter(
    (year) => year >= MIN_YEAR && year <= CURRENT_YEAR
  );

  const totalPages = Math.ceil((CURRENT_YEAR - MIN_YEAR + 1) / YEARS_PER_PAGE);

  const handleYearClick = (year: number) => {
    onChange(year);
    setIsOpen(false);
  };

  const handlePageChange = (delta: number) => {
    setCurrentPage((prev) => {
      const newPage = prev + delta;
      return Math.max(0, Math.min(newPage, totalPages - 1));
    });
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-32 justify-start text-left font-normal", !value && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? value.toString() : <span>Pick year</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <div className="p-2">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => handlePageChange(-1)}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {startYear} - {Math.min(startYear + YEARS_PER_PAGE - 1, CURRENT_YEAR)}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Years Grid */}
            <div className="grid grid-cols-4 gap-1">
              {years.map((year) => (
                <Button
                  key={year}
                  variant={year === value ? "default" : "outline"}
                  className={cn("h-8", year === value && "bg-primary text-primary-foreground")}
                  onClick={() => handleYearClick(year)}
                >
                  {year}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
