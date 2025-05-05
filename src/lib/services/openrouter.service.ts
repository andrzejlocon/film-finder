import { OPENROUTER_API_ENDPOINT, OPENROUTER_API_KEY } from "astro:env/server";
import type {
  ErrorContext,
  ModelParameters,
  ParsedResponse,
  RequestPayload,
  RetryConfig,
  ServiceConfig,
} from "./openrouter.types";
import { modelParametersSchema, OpenRouterError, requestPayloadSchema, responseSchema } from "./openrouter.types";

export class OpenRouterService {
  private readonly _apiClient: typeof fetch;
  private readonly _apiEndpoint: string;
  private readonly _apiKey: string;
  private readonly _config: ServiceConfig;
  private _modelParameters: ModelParameters;
  private _model: string;
  private _systemMessage: string;

  constructor(config?: Partial<ServiceConfig>) {
    // Initialize API client and configuration
    this._apiClient = fetch;
    this._apiEndpoint = OPENROUTER_API_ENDPOINT || "https://openrouter.ai/api/v1/chat/completions";
    this._apiKey = OPENROUTER_API_KEY;

    if (!this._apiKey) {
      throw new OpenRouterError("OpenRouter API key is not configured", "MISSING_API_KEY");
    }

    console.log("OPENROUTER_API_ENDPOINT", this._apiEndpoint);
    console.log("OPENROUTER_API_KEY", this._apiKey);

    // Set default configuration
    this._config = {
      retryConfig: {
        maxAttempts: 5,
        initialDelay: 500,
        maxDelay: 8000,
        backoffFactor: 1.5,
      },
      timeout: 45000,
      ...config,
    };

    // Set default model parameters
    this._modelParameters = {
      temperature: 0.1,
      top_p: 0.6,
      max_tokens: 2000,
      //   frequency_penalty: 0.0,
      //   presence_penalty: 0.0,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "movies",
          schema: {
            type: "object",
            properties: {
              movies: {
                type: "array",
                items: {
                  type: "object",
                  required: ["title", "year", "description", "genres", "actors", "director"],
                  properties: {
                    title: { type: "string" },
                    year: { type: "number" },
                    description: { type: "string" },
                    genres: { type: "array", items: { type: "string" } },
                    actors: { type: "array", items: { type: "string" } },
                    director: { type: "string" },
                  },
                },
              },
            },
            required: ["movies"],
          },
        },
      },
    };

    // Validate default parameters
    const result = modelParametersSchema.safeParse(this._modelParameters);
    if (!result.success) {
      throw new OpenRouterError(
        "Invalid default model parameters",
        "INVALID_MODEL_PARAMETERS",
        undefined,
        result.error
      );
    }

    this._model = "openai/gpt-4o-mini";
    this._systemMessage =
      "You are a movie recommendation assistant. Always respond with valid JSON arrays containing movie objects. Each movie object must have the following fields: title (string), year (number), description (string), genres (array of strings), actors (array of strings), and director (string). Never include any additional text or explanations outside the JSON array. If the user provides multiple preferences, give priority to the most specific ones (e.g., specific actors and directors). Avoid suggesting movies that are difficult to match with the provided criteria.";
  }

  // Public methods
  public async sendChatRequest(message: string): Promise<ParsedResponse> {
    const requestId = crypto.randomUUID();
    try {
      const payload = this._buildRequestPayload(message);
      console.log("payload", payload);

      // Validate request payload
      const validationResult = requestPayloadSchema.safeParse(payload);
      if (!validationResult.success) {
        throw new OpenRouterError(
          "Invalid request payload",
          "INVALID_REQUEST_PAYLOAD",
          { timestamp: new Date().toISOString(), requestId },
          validationResult.error
        );
      }

      const response = await this._retryOperation(
        () => this._sendRequest(payload, requestId),
        this._config.retryConfig
      );

      return this._parseResponse(response);
    } catch (error) {
      this._handleError(error as Error, { requestId });
      throw error;
    }
  }

  public setModelParameters(params: Partial<ModelParameters>): void {
    const newParameters = {
      ...this._modelParameters,
      ...params,
    };

    // Validate new parameters
    const result = modelParametersSchema.safeParse(newParameters);
    if (!result.success) {
      throw new OpenRouterError(
        "Invalid model parameters",
        "INVALID_MODEL_PARAMETERS",
        { timestamp: new Date().toISOString() },
        result.error
      );
    }

    this._modelParameters = newParameters;
  }

  // Private methods
  private _buildRequestPayload(userMessage: string): RequestPayload {
    if (!userMessage.trim()) {
      throw new OpenRouterError("User message cannot be empty", "INVALID_USER_MESSAGE", {
        timestamp: new Date().toISOString(),
      });
    }

    return {
      model: this._model,
      messages: [
        { role: "system", content: this._systemMessage },
        { role: "user", content: userMessage },
      ],
      ...this._modelParameters,
    };
  }

  private async _sendRequest(payload: RequestPayload, requestId: string): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this._config.timeout);

    try {
      const response = await this._apiClient(this._apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this._apiKey}`,
          "X-Request-ID": requestId,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      console.log("response", response);

      if (!response.ok) {
        throw new OpenRouterError(`API request failed with status ${response.status}`, "API_REQUEST_FAILED", {
          timestamp: new Date().toISOString(),
          requestId,
        });
      }

      return response;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async _parseResponse(response: Response): Promise<ParsedResponse> {
    const data = await response.json();

    const result = responseSchema.safeParse(data);

    if (!result.success) {
      throw new OpenRouterError(
        "Invalid response format from API",
        "INVALID_RESPONSE_FORMAT",
        { timestamp: new Date().toISOString() },
        result.error
      );
    }

    console.log("result", result.data);

    return result.data;
  }

  private async _retryOperation<T>(
    operation: () => Promise<T>,
    config: RetryConfig,
    context: ErrorContext = { timestamp: new Date().toISOString() }
  ): Promise<T> {
    let lastError: Error | undefined;
    let delay = config.initialDelay;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.log("error", error);
        lastError = error as Error;

        if (error instanceof OpenRouterError) {
          // Don't retry client errors (4xx)
          if (error.code.startsWith("4")) {
            throw error;
          }
        }

        if (attempt === config.maxAttempts) {
          throw new OpenRouterError(
            "Max retry attempts reached",
            "MAX_RETRIES_EXCEEDED",
            { ...context, attempt, maxAttempts: config.maxAttempts },
            lastError
          );
        }

        // Wait before next attempt with exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * config.backoffFactor, config.maxDelay);
      }
    }

    throw lastError;
  }

  private _handleError(error: Error, context: Partial<ErrorContext> = {}): void {
    const errorContext: ErrorContext = {
      timestamp: new Date().toISOString(),
      ...context,
    };

    if (error instanceof OpenRouterError) {
      console.error(`[OpenRouter] Error: ${error.message}`, {
        code: error.code,
        context: error.context || errorContext,
        cause: error.cause,
      });
    } else {
      console.error(`[OpenRouter] Unexpected error: ${error.message}`, {
        context: errorContext,
        error,
      });
    }
  }
}
