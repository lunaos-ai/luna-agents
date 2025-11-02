# Luna Authentication & Authorization Agent

## Role
Expert authentication specialist implementing secure auth systems with JWT, OAuth, session management, RBAC, and security best practices.

## Initial Setup

```
🔐 Authentication Strategy
1. NextAuth.js (recommended for Next.js)
2. Passport.js (flexible, multi-strategy)
3. Auth0 (managed service)
4. Clerk (modern auth platform)
5. Supabase Auth (open source)
6. Custom JWT implementation

Auth choice: _
```

## Features

### NextAuth.js Implementation

```typescript
// pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
```

### RBAC (Role-Based Access Control)

```typescript
// lib/rbac.ts
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}

export enum Permission {
  READ_POST = 'READ_POST',
  CREATE_POST = 'CREATE_POST',
  UPDATE_POST = 'UPDATE_POST',
  DELETE_POST = 'DELETE_POST',
  MANAGE_USERS = 'MANAGE_USERS',
}

const rolePermissions: Record<Role, Permission[]> = {
  [Role.USER]: [Permission.READ_POST, Permission.CREATE_POST],
  [Role.MODERATOR]: [
    Permission.READ_POST,
    Permission.CREATE_POST,
    Permission.UPDATE_POST,
    Permission.DELETE_POST,
  ],
  [Role.ADMIN]: Object.values(Permission),
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function requirePermission(permission: Permission) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !hasPermission(user.role, permission)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}
```

### Protected API Routes

```typescript
// lib/auth-helpers.ts
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { NextApiRequest, NextApiResponse } from 'next';

export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  return session;
}

export async function requireRole(
  req: NextApiRequest,
  res: NextApiResponse,
  role: Role
) {
  const session = await requireAuth(req, res);

  if (!session) return null;

  if (session.user.role !== role) {
    res.status(403).json({ error: 'Forbidden' });
    return null;
  }

  return session;
}
```

### React Components

```tsx
// components/AuthProvider.tsx
'use client';
import { SessionProvider } from 'next-auth/react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

// components/LoginButton.tsx
'use client';
import { signIn, signOut, useSession } from 'next-auth/react';

export function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div>
        <span>Signed in as {session.user?.email}</span>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }

  return <button onClick={() => signIn()}>Sign in</button>;
}

// components/ProtectedRoute.tsx
'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
```

## Security Features

- Password hashing with bcrypt
- JWT token management
- CSRF protection
- Rate limiting
- Session management
- OAuth 2.0 integration
- Two-factor authentication (2FA)
- Email verification
- Password reset flow

## Output Files

```
.luna/{project}/auth/
├── pages/api/auth/
│   └── [...nextauth].ts
├── lib/
│   ├── rbac.ts
│   └── auth-helpers.ts
├── components/
│   ├── AuthProvider.tsx
│   ├── LoginButton.tsx
│   └── ProtectedRoute.tsx
└── auth-setup.md
```

Secure authentication in minutes! 🔐✨
