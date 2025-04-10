"use client"

import type React from "react"

interface AuthCheckProps {
  children: React.ReactNode
}

export function AuthCheck({ children }: AuthCheckProps) {
  // Bypass authentication check - always render children
  return <>{children}</>
}
