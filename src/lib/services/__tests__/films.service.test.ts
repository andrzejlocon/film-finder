import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { FilmsService } from "../films.service";
import type { FilmDTO, CreateFilmInput, FilmStatus } from "@/types.ts";
import type { SupabaseClient } from "@/db/supabase.client.ts";
import type { PostgrestQueryBuilder } from "@supabase/postgrest-js";
import type { Database } from "@/db/database.types.ts";
import type { CreateFilmCommandSchema } from "../../schemas/films.schema";

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
  single: Mock;
  in: Mock;
  insert: Mock;
  delete: Mock;
};

// Helper type for mocking Supabase client
type MockSupabaseClient = Pick<SupabaseClient, "from" | "rpc"> & {
  from: Mock;
  rpc: Mock;
};

describe("FilmsService", () => {
  const mockUserId = "test-user-id";
  let queryBuilder: MockQueryBuilder;
  let mockSupabase: MockSupabaseClient;
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
    // Create query builder mock with proper method chaining
    const mockMethods = {
      select: vi.fn(),
      eq: vi.fn(),
      ilike: vi.fn(),
      range: vi.fn(),
      order: vi.fn(),
      single: vi.fn(),
      in: vi.fn(),
      insert: vi.fn(),
      delete: vi.fn(),
    };

    // Setup chain calls to return the mock methods object
    Object.values(mockMethods).forEach((method) => {
      method.mockReturnValue(mockMethods);
    });

    queryBuilder = mockMethods;

    // Create Supabase client mock
    mockSupabase = {
      from: vi.fn().mockReturnValue(queryBuilder),
      rpc: vi.fn(),
    } as unknown as MockSupabaseClient;

    service = new FilmsService(mockSupabase as unknown as SupabaseClient);
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
        data: null,
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

  describe("updateFilmStatus", () => {
    const mockFilmId = 1;
    const mockFilm = mockFilms[0];
    const newStatus = "watched" as const;

    it("should successfully update film status", async () => {
      // Arrange
      queryBuilder.single.mockResolvedValue({ data: mockFilm, error: null });
      mockSupabase.rpc.mockResolvedValue({
        data: { ...mockFilm, status: newStatus },
        error: null,
      });

      // Act
      const result = await service.updateFilmStatus(mockUserId, mockFilmId, newStatus);

      // Assert
      expect(queryBuilder.select).toHaveBeenCalledWith("*");
      expect(queryBuilder.eq).toHaveBeenCalledWith("id", mockFilmId);
      expect(queryBuilder.eq).toHaveBeenCalledWith("user_id", mockUserId);
      expect(mockSupabase.rpc).toHaveBeenCalledWith("update_film_status", {
        p_film_id: mockFilmId,
        p_user_id: mockUserId,
        p_new_status: newStatus,
        p_prev_status: mockFilm.status,
      });
      expect(result.status).toBe(newStatus);
    });

    it("should throw error when film is not found", async () => {
      // Arrange
      queryBuilder.single.mockResolvedValue({ data: null, error: { message: "not found" } });

      // Act & Assert
      await expect(service.updateFilmStatus(mockUserId, mockFilmId, "watched")).rejects.toThrow(
        "Film not found or you are not authorized to update it"
      );
    });

    it("should throw error when update fails", async () => {
      // Arrange
      const errorMessage = "Database error";
      queryBuilder.single.mockResolvedValue({ data: mockFilm, error: null });
      mockSupabase.rpc.mockResolvedValue({ data: null, error: { message: errorMessage } });

      // Act & Assert
      await expect(service.updateFilmStatus(mockUserId, mockFilmId, "watched")).rejects.toThrow(
        `Failed to update film status: ${errorMessage}`
      );
    });

    it("should throw error when user is not authorized", async () => {
      // Arrange
      const unauthorizedUserId = "other-user-id";
      queryBuilder.single.mockResolvedValue({ data: null, error: { message: "not found" } });

      // Act & Assert
      await expect(service.updateFilmStatus(unauthorizedUserId, mockFilmId, "watched")).rejects.toThrow(
        "Film not found or you are not authorized to update it"
      );
    });
  });

  describe("createFilms", () => {
    const mockCreateFilmInput = {
      title: "New Test Film",
      year: 2024,
      description: "New test description",
      genres: ["Action", "Sci-Fi"],
      actors: ["Actor 1", "Actor 2"],
      director: "Test Director",
      status: "to-watch" as FilmStatus,
      generation_id: 1,
    } satisfies Required<CreateFilmInput>;

    const mockCreateFilmCommand: CreateFilmCommandSchema = {
      films: [mockCreateFilmInput],
    };

    const mockCreatedFilm: FilmDTO = {
      id: 3,
      user_id: mockUserId,
      title: mockCreateFilmInput.title,
      year: mockCreateFilmInput.year,
      description: mockCreateFilmInput.description,
      genres: mockCreateFilmInput.genres,
      actors: mockCreateFilmInput.actors,
      director: mockCreateFilmInput.director,
      status: mockCreateFilmInput.status,
      generation_id: mockCreateFilmInput.generation_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    it("should successfully create new films", async () => {
      // Arrange
      const mockCheckDuplicatesQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      };

      const mockInsertQuery = {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: [mockCreatedFilm], error: null }),
        }),
      };

      mockSupabase.from.mockImplementation((table) => {
        if (table === "user_films") {
          return { ...mockCheckDuplicatesQuery, ...mockInsertQuery };
        }
        return mockInsertQuery;
      });

      // Act
      const result = await service.createFilms(mockUserId, mockCreateFilmCommand);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("user_films");
      expect(mockCheckDuplicatesQuery.select).toHaveBeenCalledWith("title");
      expect(mockCheckDuplicatesQuery.select().eq).toHaveBeenCalledWith("user_id", mockUserId);
      expect(mockCheckDuplicatesQuery.select().eq().in).toHaveBeenCalledWith("title", [mockCreateFilmInput.title]);
      expect(mockInsertQuery.insert).toHaveBeenCalledWith([{ ...mockCreateFilmInput, user_id: mockUserId }]);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockCreatedFilm);
    });

    it("should successfully create multiple films", async () => {
      // Arrange
      const multipleFilms = [
        mockCreateFilmInput,
        { ...mockCreateFilmInput, title: "Another Test Film" },
      ] satisfies Required<CreateFilmInput>[];

      const multipleCreatedFilms: FilmDTO[] = multipleFilms.map((film, index) => ({
        id: 3 + index,
        user_id: mockUserId,
        title: film.title,
        year: film.year,
        description: film.description,
        genres: film.genres,
        actors: film.actors,
        director: film.director,
        status: film.status,
        generation_id: film.generation_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const mockCheckDuplicatesQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      };

      const mockInsertQuery = {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: multipleCreatedFilms, error: null }),
        }),
      };

      mockSupabase.from.mockImplementation((table) => {
        if (table === "user_films") {
          return { ...mockCheckDuplicatesQuery, ...mockInsertQuery };
        }
        return mockInsertQuery;
      });

      // Act
      const result = await service.createFilms(mockUserId, { films: multipleFilms });

      // Assert
      expect(mockCheckDuplicatesQuery.select).toHaveBeenCalledWith("title");
      expect(mockCheckDuplicatesQuery.select().eq).toHaveBeenCalledWith("user_id", mockUserId);
      expect(mockCheckDuplicatesQuery.select().eq().in).toHaveBeenCalledWith(
        "title",
        multipleFilms.map((f) => f.title)
      );
      expect(mockInsertQuery.insert).toHaveBeenCalledWith(
        multipleFilms.map((film) => ({ ...film, user_id: mockUserId }))
      );
      expect(result).toHaveLength(2);
      expect(result).toEqual(multipleCreatedFilms);
    });

    it("should throw error when duplicate films are found", async () => {
      // Arrange
      const existingFilm = { title: mockCreateFilmInput.title };
      const mockCheckDuplicatesQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: [existingFilm], error: null }),
          }),
        }),
      };

      mockSupabase.from.mockReturnValue(mockCheckDuplicatesQuery);

      // Act & Assert
      await expect(service.createFilms(mockUserId, mockCreateFilmCommand)).rejects.toThrow(
        `Following films already exist: ${mockCreateFilmInput.title}`
      );
    });

    it("should throw error when database insert fails", async () => {
      // Arrange
      const errorMessage = "Database error";
      const mockCheckDuplicatesQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      };

      const mockInsertQuery = {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: null, error: new Error(errorMessage) }),
        }),
      };

      mockSupabase.from.mockImplementation((table) => {
        if (table === "user_films") {
          return { ...mockCheckDuplicatesQuery, ...mockInsertQuery };
        }
        return mockInsertQuery;
      });

      // Act & Assert
      await expect(service.createFilms(mockUserId, mockCreateFilmCommand)).rejects.toThrow(
        `Failed to create films: ${errorMessage}`
      );
    });

    it("should handle empty films array", async () => {
      // Arrange
      const emptyCommand: CreateFilmCommandSchema = { films: [] };

      // Act & Assert
      await expect(service.createFilms(mockUserId, emptyCommand)).rejects.toThrow(); // Exact error message will depend on Zod schema validation
    });

    it("should validate required fields in film data", async () => {
      // Arrange
      const invalidFilm = {
        title: "", // Invalid - empty title
        year: 1800, // Invalid - too early
        description: "",
        genres: ["invalid-genre"],
        actors: ["invalid-actor"],
        director: "",
        status: "invalid-status" as FilmStatus, // Invalid - wrong status
        generation_id: 1,
      } satisfies Required<CreateFilmInput>;

      // Act & Assert
      await expect(service.createFilms(mockUserId, { films: [invalidFilm] })).rejects.toThrow(); // Exact error message will depend on Zod schema validation
    });
  });

  describe("deleteFilm", () => {
    const mockFilmId = 1;

    it("should successfully delete a film", async () => {
      // Arrange
      queryBuilder.eq.mockImplementation(() => ({
        ...queryBuilder,
        data: null,
        error: null,
      }));

      // Act
      await service.deleteFilm(mockUserId, mockFilmId);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("user_films");
      expect(queryBuilder.delete).toHaveBeenCalled();
      expect(queryBuilder.eq).toHaveBeenCalledWith("id", mockFilmId);
      expect(queryBuilder.eq).toHaveBeenCalledWith("user_id", mockUserId);
    });

    it("should throw error when film is not found", async () => {
      // Arrange
      queryBuilder.eq.mockImplementation(() => ({
        ...queryBuilder,
        data: null,
        error: { code: "PGRST116", message: "not found" },
      }));

      // Act & Assert
      await expect(service.deleteFilm(mockUserId, mockFilmId)).rejects.toThrow(
        "Film not found or you are not authorized to delete it"
      );
    });

    it("should throw error on database failure", async () => {
      // Arrange
      const errorMessage = "Database error";
      queryBuilder.eq.mockImplementation(() => ({
        ...queryBuilder,
        data: null,
        error: { message: errorMessage },
      }));

      // Act & Assert
      await expect(service.deleteFilm(mockUserId, mockFilmId)).rejects.toThrow(
        `Failed to delete film: ${errorMessage}`
      );
    });
  });
});
