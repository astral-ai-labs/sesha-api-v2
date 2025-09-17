---
description: Rules for working with TS/TSX Projects
globs: "*.ts,*.tsx"
alwaysApply: false
---

**What's in here:** Complete TypeScript and React/TSX guidelines including file structure, import organization, type definitions, error handling, component patterns, custom hooks, performance optimization, and development tooling with pnpm.

# TypeScript & TSX Guidelines

**Write TypeScript and React code with absolute clarity as the top priority.** Keep it Simple, Stupid (KISS) - choose the most straightforward solution that any developer can understand at first glance. Readability isn't optional, it's everything. Code should tell a story that flows naturally from top to bottom.

These guidelines ensure our TypeScript and React codebases are maintainable, approachable, and immediately understandable:

## 1. File Structure & Header

**Every TypeScript/TSX file must start with a clear header:**

```typescript
/* ==========================================================================*/
// userService.ts — User management and authentication operations
/* ==========================================================================*/
// Purpose: Handle user CRUD operations and session management
// Sections: Imports, Types, Helpers, Public API
/* ==========================================================================*/
```

```tsx
/* ==========================================================================*/
// UserProfile.tsx — User profile display and editing component
/* ==========================================================================*/
// Purpose: Render user profile information with inline editing capabilities
// Sections: Imports, Types, Component, Styles, Exports
/* ==========================================================================*/
```

## 2. Import Organization

**Three distinct groups, separated by blank lines:**

```typescript
/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Core/Node Modules ---------------------------------------------------------
import fs from "fs";
import path from "path";
import { EventEmitter } from "events";

// External Packages ---------------------------------------------------------
import express from "express";
import { z } from "zod";
import axios from "axios";

// Internal Modules ----------------------------------------------------------
import { DatabaseConnection } from "../database/connection";
import { UserModel, UserProfile } from "./models";
import { ValidationError } from "../errors";
```

```tsx
/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// React & Next.js Core ----------------------------------------------------------------
import React, { useState, useEffect, useCallback } from "react";

// External Packages ---------------------------------------------------------
import clsx from "clsx";
import { Button, Input, Modal } from "@headlessui/react";

// Internal Components & Utilities -------------------------------------------
import styles from "./UserProfile.module.css";
import { Icon } from "../Icon";
import { useUserData } from "../../hooks/useUserData";
import { formatDate } from "../../utils/dateUtils";
```

## 3. Type Definitions & Interfaces

**Define clear, well-documented types at the top of files:**

```typescript
/* ==========================================================================*/
// Types & Interfaces
/* ==========================================================================*/

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  isActive: boolean;
}

interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

interface UserServiceConfig {
  databaseUrl: string;
  maxRetries: number;
  timeoutMs: number;
}

// Component Props
interface UserProfileProps {
  userId: string;
  editable?: boolean;
  onUpdate?: (user: User) => void;
  className?: string;
}

interface UserProfileState {
  user: User | null;
  isEditing: boolean;
  isLoading: boolean;
  error: string | null;
}
```

## 4. Public API Declaration

**Group exports at the bottom for clarity:**

```typescript
/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

function createUserAccount(userData: CreateUserRequest): Promise<User> {
  // Implementation here
}

function fetchUserById(userId: string): Promise<User | null> {
  // Implementation here
}

function validateUserEmail(email: string): boolean {
  // Implementation here
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export {
  createUserAccount,
  fetchUserById,
  validateUserEmail,
  type User,
  type CreateUserRequest,
};
```

```tsx
/* ==========================================================================*/
// Component Implementation
/* ==========================================================================*/

function UserProfile({ userId, editable = false, onUpdate, className }: UserProfileProps) {
  // Component implementation
}

function UserAvatar({ user, size = "medium" }: UserAvatarProps) {
  // Component implementation
}

/* ==========================================================================*/
// Component Exports
/* ==========================================================================*/
export { UserProfile, UserAvatar };
export type { UserProfileProps, UserAvatarProps };
```

## 5. Function Design & Documentation

**Always use proper TypeScript typing and clear documentation:**

```typescript
/**
 * Fetch user profile with optional settings inclusion.
 */
async function fetchUserProfile(
  userId: string, 
  includeSettings: boolean = false
): Promise<UserProfile | null> {
  // 1️⃣ Validate input -----------------
  if (!userId?.trim()) {
    throw new Error("User ID cannot be empty");
  }

  // 2️⃣ Query database -----------------
  const profile = await db.query("SELECT * FROM user_profiles WHERE user_id = ?", [userId]);
  
  if (!profile) {
    return null;
  }

  // 3️⃣ Include settings if requested -----------------
  if (includeSettings) {
    profile.settings = await fetchUserSettings(userId);
  }

  return profile;
}

/**
 * Validate email format and domain restrictions.
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && !email.includes("+");
}

/**
 * User service class with singleton pattern for database connections.
 */
class UserService {
  private static instance: UserService | null = null;
  private db: DatabaseConnection;

  private constructor(config: UserServiceConfig) {
    this.db = new DatabaseConnection(config.databaseUrl);
  }

  static getInstance(config: UserServiceConfig): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService(config);
    }
    return UserService.instance;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    // 1️⃣ Validate input data -----------------
    if (!this.validateUserData(userData)) {
      throw new ValidationError("Invalid user data provided");
    }

    // 2️⃣ Check for existing user -----------------
    const existingUser = await this.findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error(`User with email ${userData.email} already exists`);
    }

    // 3️⃣ Create user record -----------------
    const user: User = {
      id: generateId(),
      email: userData.email.toLowerCase(),
      name: userData.name.trim(),
      createdAt: new Date(),
      isActive: true,
    };

    // 4️⃣ Save to database -----------------
    await this.db.insert("users", user);

    return user;
  }
}
```

## 6. Error Handling Patterns

**FAIL FAST - Check for errors immediately and throw with descriptive messages:**

```typescript
async function processPayment(amount: number, userId: string): Promise<PaymentResult> {
  // FAIL FAST: Validate all inputs immediately
  if (amount <= 0) {
    throw new Error(`Payment amount must be positive, got: ${amount}`);
  }

  if (amount > 10000) {
    throw new Error(`Payment amount exceeds limit: ${amount}`);
  }

  if (!userId?.trim()) {
    throw new Error("User ID cannot be empty");
  }

  try {
    // 1️⃣ Validate user exists - FAIL FAST -----------------
    const user = await getUserById(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    if (!user.isActive) {
      throw new Error(`User ${userId} is not active`);
    }

    // 2️⃣ Check payment method - FAIL FAST -----------------
    if (!user.paymentMethod) {
      throw new Error(`User ${userId} has no payment method configured`);
    }

    // 3️⃣ Process payment -----------------
    const result = await paymentGateway.charge(amount, user.paymentMethod);

    // 4️⃣ Update user balance -----------------
    await updateUserBalance(userId, -amount);

    return { success: true, transactionId: result.id };

  } catch (error) {
    logger.error(`Payment failed for user ${userId}:`, error);
    throw new Error(`Payment processing failed: ${error.message}`);
  }
}

function validateFileUpload(file: File): void {
  // FAIL FAST: Multiple early checks
  if (!file) {
    throw new Error("File is required");
  }

  if (file.size === 0) {
    throw new Error("File cannot be empty");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size ${file.size} exceeds limit ${MAX_FILE_SIZE}`);
  }

  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} not allowed`);
  }
}
```

## 7. React Component Patterns

**Keep components focused and well-structured:**

```tsx
/* ==========================================================================*/
// Component State & Hooks
/* ==========================================================================*/

function UserProfile({ userId, editable = false, onUpdate, className }: UserProfileProps) {
  const [state, setState] = useState<UserProfileState>({
    user: null,
    isEditing: false,
    isLoading: true,
    error: null,
  });

  // 1️⃣ Load user data on mount -----------------
  useEffect(() => {
    if (!userId) {
      setState(prev => ({ ...prev, error: "User ID is required", isLoading: false }));
      return;
    }

    loadUserData();
  }, [userId]);

  const loadUserData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const user = await fetchUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      setState(prev => ({ ...prev, user, isLoading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error.message, 
        isLoading: false 
      }));
    }
  }, [userId]);

  // 2️⃣ Handle edit mode toggle -----------------
  const handleEditToggle = useCallback(() => {
    setState(prev => ({ ...prev, isEditing: !prev.isEditing }));
  }, []);

  // 3️⃣ Handle user updates -----------------
  const handleUserUpdate = useCallback(async (updatedUser: User) => {
    try {
      await updateUser(updatedUser);
      setState(prev => ({ ...prev, user: updatedUser, isEditing: false }));
      onUpdate?.(updatedUser);
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, [onUpdate]);

  // 4️⃣ Early returns for loading/error states -----------------
  if (state.isLoading) {
    return <LoadingSpinner />;
  }

  if (state.error) {
    return <ErrorMessage message={state.error} onRetry={loadUserData} />;
  }

  if (!state.user) {
    return <EmptyState message="User not found" />;
  }

  /* ==========================================================================*/
  // Render
  /* ==========================================================================*/
  
  return (
    <div className={clsx(styles.userProfile, className)}>
      {/* Header Section ------------------------------------------ */}
      <div className={styles.header}>
        <UserAvatar user={state.user} size="large" />
        <div className={styles.userInfo}>
          <h2 className={styles.userName}>{state.user.name}</h2>
          <p className={styles.userEmail}>{state.user.email}</p>
        </div>
        {editable && (
          <Button onClick={handleEditToggle} variant="outline">
            {state.isEditing ? "Cancel" : "Edit"}
          </Button>
        )}
      </div>

      {/* Content Section ----------------------------------------- */}
      <div className={styles.content}>
        {state.isEditing ? (
          <UserEditForm 
            user={state.user} 
            onSave={handleUserUpdate}
            onCancel={handleEditToggle}
          />
        ) : (
          <UserDisplayInfo user={state.user} />
        )}
      </div>
      {/* End Content --------------------------------------------- */}
    </div>
  );
}
```

## 8. Custom Hooks Patterns

**Create reusable, focused custom hooks:**

```tsx
/* ==========================================================================*/
// Custom Hooks
/* ==========================================================================*/

interface UseUserDataReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function useUserData(userId: string): UseUserDataReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) {
      setError("User ID is required");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const userData = await fetchUserById(userId);
      setUser(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, isLoading, error, refetch: fetchUser };
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

## 9. Async Patterns & Performance

**Use efficient TypeScript and React patterns:**

```typescript
/* ==========================================================================*/
// Async Operations
/* ==========================================================================*/

// Concurrent data fetching
async function fetchUserDashboard(userId: string): Promise<UserDashboard> {
  // 1️⃣ Validate input -----------------
  if (!userId) {
    throw new Error("User ID is required");
  }

  // 2️⃣ Fetch data concurrently -----------------
  const [user, projects, notifications] = await Promise.all([
    fetchUserById(userId),
    fetchUserProjects(userId),
    fetchUserNotifications(userId),
  ]);

  // 3️⃣ Combine results -----------------
  return {
    user,
    projects,
    notifications,
    lastUpdated: new Date(),
  };
}

// Stream processing with generators
async function* processUserBatch(userIds: string[]): AsyncGenerator<ProcessedUser> {
  for (const userId of userIds) {
    try {
      const user = await fetchUserById(userId);
      if (user) {
        const processed = await processUser(user);
        yield processed;
      }
    } catch (error) {
      console.error(`Failed to process user ${userId}:`, error);
    }
  }
}
```

```tsx
/* ==========================================================================*/
// React Performance Patterns
/* ==========================================================================*/

// Memoized components
const UserCard = React.memo(function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <div className={styles.userCard}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <Button onClick={() => onEdit(user)}>Edit</Button>
    </div>
  );
});

// Memoized expensive calculations
function UserList({ users, searchTerm }: UserListProps) {
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleUserEdit = useCallback((user: User) => {
    // Handle edit logic
  }, []);

  return (
    <div className={styles.userList}>
      {filteredUsers.map(user => (
        <UserCard 
          key={user.id} 
          user={user} 
          onEdit={handleUserEdit}
        />
      ))}
    </div>
  );
}
```

## 10. Testing Patterns

**Write clear, focused tests:**

```typescript
/* ==========================================================================*/
// Test Utilities
/* ==========================================================================*/

describe("UserService", () => {
  describe("createUser", () => {
    it("should create user with valid data", async () => {
      // Arrange
      const userData: CreateUserRequest = {
        email: "test@example.com",
        name: "Test User",
        password: "securePassword123",
      };

      // Act
      const user = await userService.createUser(userData);

      // Assert
      expect(user.email).toBe("test@example.com");
      expect(user.name).toBe("Test User");
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it("should fail with duplicate email", async () => {
      // Arrange
      const existingEmail = "existing@example.com";
      await createTestUser({ email: existingEmail });

      const userData: CreateUserRequest = {
        email: existingEmail,
        name: "New User",
        password: "password123",
      };

      // Act & Assert
      await expect(userService.createUser(userData))
        .rejects
        .toThrow("User with email existing@example.com already exists");
    });
  });
});
```

---

**Remember**: Always prioritize readability, consistency, and maintainability in your TypeScript and React code.

---

# TypeScript & TSX Development Tools

**Use pnpm, not npm** - Always use pnpm for package management in TypeScript/TSX projects.

## Package Management

```bash
# Use pnpm for all package operations
pnpm install
pnpm add package-name
pnpm remove package-name
pnpm run script-name
```

**Never use npm commands - always use pnpm instead.**
