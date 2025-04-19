// API configuration
export const API_CONFIG = {
  // Backend API URL - now using the Modal endpoint
  baseUrl:
    process.env.NEXT_PUBLIC_API_URL || "https://fernandoazanza--yolo-chip-detector-run-inference-from-upload.modal.run",

  // Endpoints
  endpoints: {
    predict: "/", // Modal endpoints typically use the root path
  },

  // Feature flags
  features: {
    // Set to true to use mock data instead of real API calls
    useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true",
  },
}
