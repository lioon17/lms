"use client"

import { createContext, useContext, useEffect, useState } from "react"

const AuthContext = createContext(undefined)

// Mock users for demonstration
const mockUsers = [
  {
    id: "1",
    email: "admin@lms.com",
    name: "Admin User",
    role: "admin",
    createdAt: new Date(),
  },
  {
    id: "2",
    email: "instructor@lms.com",
    name: "John Instructor",
    role: "instructor",
    createdAt: new Date(),
  },
  {
    id: "3",
    email: "student@lms.com",
    name: "Jane Student",
    role: "student",
    createdAt: new Date(),
  },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("lms_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    setLoading(true)

    // Mock authentication - in real app, this would be an API call
    const foundUser = mockUsers.find((u) => u.email === email)

    if (foundUser && password === "password") {
      setUser(foundUser)
      localStorage.setItem("lms_user", JSON.stringify(foundUser))
      setLoading(false)
      return true
    }

    setLoading(false)
    return false
  }

  const register = async (email, password, name, role) => {
    setLoading(true)

    // Mock registration
    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      role,
      createdAt: new Date(),
    }

    mockUsers.push(newUser)
    setUser(newUser)
    localStorage.setItem("lms_user", JSON.stringify(newUser))
    setLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("lms_user")
  }

  return <AuthContext.Provider value={{ user, login, logout, register, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
