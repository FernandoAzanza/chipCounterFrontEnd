// components/GoogleIcon.tsx
import React from "react"

export const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 488 512"
    fill="currentColor"
  >
    <path
      fill="#EA4335"
      d="M488 261.8c0-17.8-1.6-35-4.6-51.6H249v97.7h134.3c-5.8 31.4-23.5 57.9-50 75.7v62h80.9c47.3-43.6 74.8-108 74.8-183.8z"
    />
    <path
      fill="#34A853"
      d="M249 492c67 0 123.3-22.1 164.4-60l-80.9-62c-22.5 15.1-51.3 24-83.5 24-64.2 0-118.5-43.4-137.9-101.7H26.8v63.9C68.2 441.5 151.9 492 249 492z"
    />
    <path
      fill="#4A90E2"
      d="M111.1 292.3c-10.1-30.1-10.1-62.6 0-92.7V135.7H26.8C-8.9 204.1-8.9 307.9 26.8 376.3l84.3-63.9z"
    />
    <path
      fill="#FBBC05"
      d="M249 97.1c35.3 0 67 12.1 91.9 35.9l68.9-68.9C372.3 23.1 318.5 0 249 0 151.9 0 68.2 50.5 26.8 135.7l84.3 63.9C130.5 140.5 184.8 97.1 249 97.1z"
    />
  </svg>
)
