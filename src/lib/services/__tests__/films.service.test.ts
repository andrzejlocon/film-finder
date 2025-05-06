import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { FilmsService } from "../films.service";
import type { FilmDTO } from "../../../types";
import type { SupabaseClient } from "../../../db/supabase.client";
import type { PostgrestQueryBuilder } from "@supabase/postgrest-js";
import type { Database } from "../../../db/database.types";

// Helper type for mocking Supabase query builder
type MockQueryBuilder = Partial<
  PostgrestQueryBuilder<
    Database["public"],
    Database["public"]["Tables"]["user_films"],
    Database["public"]["Tables"]["user_films"]["Row"]
  >
> & {
  select: Mock;
  eq: Mock;
  ilike: Mock;
  range: Mock;
  order: Mock;
};

describe("FilmsService", () => {
  const mockUserId = "test-user-id";
  let queryBuilder: MockQueryBuilder;
  let mockSupabase: Partial<SupabaseClient>;
  let service: FilmsService;

  // Mock film data
  const mockFilms: FilmDTO[] = [
    {
      id: 1,
      user_id: mockUserId,
      title: "Test Film 1",
      year: 2021,
      description: "Test description 1",
      genres: ["Action"],
      actors: ["Actor 1"],
      director: "Director 1",
      status: "to-watch",
      generation_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      user_id: mockUserId,
      title: "Test Film 2",
      year: 2022,
      description: "Test description 2",
      genres: ["Drama"],
      actors: ["Actor 2"],
      director: "Director 2",
      status: "watched",
      generation_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    // Create query builder mock
    queryBuilder = {
      select: vi.fn(),
      eq: vi.fn(),
      ilike: vi.fn(),
      range: vi.fn(),
      order: vi.fn(),
    };

    // Setup chain calls
    queryBuilder.select.mockReturnValue(queryBuilder);
    queryBuilder.eq.mockReturnValue(queryBuilder);
    queryBuilder.ilike.mockReturnValue(queryBuilder);
    queryBuilder.range.mockReturnValue(queryBuilder);
    queryBuilder.order.mockReturnValue(queryBuilder);

    // Create Supabase client mock
    mockSupabase = {
      from: vi.fn().mockReturnValue(queryBuilder),
    };

    service = new FilmsService(mockSupabase as SupabaseClient);
  });

  describe("getUserFilms", () => {
    it("should fetch films with default pagination", async () => {
      // Arrange
      const expectedResponse = { data: mockFilms, count: mockFilms.length };
      queryBuilder.order.mockResolvedValue(expectedResponse);

      // Act
      const result = await service.getUserFilms(mockUserId);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("user_films");
      expect(queryBuilder.select).toHaveBeenCalledWith("*", { count: "exact" });
      expect(queryBuilder.eq).toHaveBeenCalledWith("user_id", mockUserId);
      expect(queryBuilder.range).toHaveBeenCalledWith(0, 9);
      expect(result).toEqual({
        data: mockFilms,
        page: 1,
        limit: 10,
        total: mockFilms.length,
      });
    });

    it("should apply status filter when provided", async () => {
      // Arrange
      const status = "watched";
      const filteredMockFilms = mockFilms.filter((film) => film.status === status);
      queryBuilder.order.mockResolvedValue({
        data: filteredMockFilms,
        count: filteredMockFilms.length,
      });

      // Act
      const result = await service.getUserFilms(mockUserId, { status });

      // Assert
      expect(queryBuilder.eq).toHaveBeenCalledWith("status", status);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe(status);
    });

    it("should apply search filter when provided", async () => {
      // Arrange
      const search = "Test Film 1";
      const filteredMockFilms = mockFilms.filter((film) => film.title.includes(search));
      queryBuilder.order.mockResolvedValue({
        data: filteredMockFilms,
        count: filteredMockFilms.length,
      });

      // Act
      const result = await service.getUserFilms(mockUserId, { search });

      // Assert
      expect(queryBuilder.ilike).toHaveBeenCalledWith("title", `%${search}%`);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe(search);
    });

    it("should handle custom pagination", async () => {
      // Arrange
      const page = 2;
      const limit = 5;
      queryBuilder.order.mockResolvedValue({
        data: mockFilms,
        count: mockFilms.length,
      });

      // Act
      const result = await service.getUserFilms(mockUserId, { page, limit });

      // Assert
      expect(queryBuilder.range).toHaveBeenCalledWith(5, 9);
      expect(result).toEqual({
        data: mockFilms,
        page,
        limit,
        total: mockFilms.length,
      });
    });

    it("should throw error when Supabase query fails", async () => {
      // Arrange
      const errorMessage = "Database error";
      queryBuilder.order.mockResolvedValue({
        error: new Error(errorMessage),
      });

      // Act & Assert
      await expect(service.getUserFilms(mockUserId)).rejects.toThrow(`Failed to fetch films: ${errorMessage}`);
    });

    it("should handle empty results", async () => {
      // Arrange
      queryBuilder.order.mockResolvedValue({
        data: [],
        count: 0,
      });

      // Act
      const result = await service.getUserFilms(mockUserId);

      // Assert
      expect(result).toEqual({
        data: [],
        page: 1,
        limit: 10,
        total: 0,
      });
    });
  });
});
