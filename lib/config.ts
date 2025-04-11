// API configuration
export const API_CONFIG = {
  // Backend API URL - change this to your actual backend URL
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",

  // Endpoints
  endpoints: {
    predict: "/predict/",
  },

  // Feature flags
  features: {
    // Set to true to use mock data instead of real API calls
    useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true",
  },
}
