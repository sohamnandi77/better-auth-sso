create table "user" ("id" text not null primary key, "name" text not null, "email" text not null unique, "emailVerified" boolean not null, "image" text, "createdAt" date not null, "updatedAt" date not null);

create table "session" ("id" text not null primary key, "expiresAt" date not null, "ipAddress" text, "userAgent" text, "userId" text not null references "user" ("id"));

create table "account" ("id" text not null primary key, "accountId" text not null, "providerId" text not null, "userId" text not null references "user" ("id"), "accessToken" text, "refreshToken" text, "idToken" text, "expiresAt" date, "password" text);

create table "verification" ("id" text not null primary key, "identifier" text not null, "value" text not null, "expiresAt" date not null);

create table "application" ("id" text not null primary key, "name" text not null, "clientId" text not null unique, "clientSecret" text not null, "redirectUris" jsonb not null, "allowedScopes" jsonb not null, "active" boolean, "createdAt" date not null, "updatedAt" date not null);

create table "authorizationCode" ("id" text not null primary key, "code" text not null unique, "codeChallenge" text not null, "codeChallengeMethod" text not null, "scopes" jsonb not null, "used" boolean, "expiresAt" date not null, "userId" text not null references "user" ("id"), "applicationId" text not null references "application" ("id"), "createdAt" date not null);

create table "consent" ("id" text not null primary key, "scopes" jsonb not null, "expiresAt" date not null, "userId" text not null references "user" ("id"), "applicationId" text not null references "application" ("id"), "createdAt" date not null, "updatedAt" date not null)