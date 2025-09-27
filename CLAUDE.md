# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kotonoha is a Next.js 15 web application for Japanese text proofreading using the Gemini API. The application provides a secure, user-friendly interface for editing and proofreading Japanese text in environments where LLM access is restricted.

**Tech Stack:**
- Next.js 15 with App Router and React 19
- TypeScript 5 (strict mode)
- TailwindCSS 4
- Gemini API integration via @google/genai
- State management with Zustand
- UI components from shadcn/ui and Radix UI

## Common Development Commands

```bash
# Install dependencies
pnpm install

# Development server (with Turbopack)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Code quality
pnpm lint           # Run ESLint
pnpm lint:fix       # Fix ESLint issues
pnpm format         # Format with Prettier
pnpm fix            # Run format + lint:fix

# Testing (when available)
pnpm test           # Unit tests
pnpm playwright test # E2E tests
```

## Architecture and Structure

### Core Directories
- `src/app/` - Next.js App Router pages, layouts, and API routes
  - `components/` - Shared React components (Header, EditorPanel, ControlPanel, ResultPanel)
  - `api/proofread/` - API route for Gemini integration
  - `globals.css` - Global styles and Tailwind configuration
- `docs/` - Project documentation and detailed task lists
- `lib/` - Utility functions and shared logic (planned)

### Key Components
The application follows a three-panel layout:
1. **EditorPanel** - Text input with character count and validation
2. **ControlPanel** - Action buttons and loading states
3. **ResultPanel** - Proofreading results with copy/apply functionality

### Security Architecture
- API keys stored server-side only (never exposed to client)
- DOMPurify integration for XSS prevention
- Content Security Policy configured in next.config.ts
- Input validation and sanitization at API boundaries

### State Management
- Local component state for UI interactions
- Zustand stores planned for global application state
- localStorage for user preferences (text style, correction level)

## Development Guidelines

### TypeScript
- Strict mode enabled
- All new code must be fully typed
- Use 2-space indentation

### Components
- One component per file in PascalCase (e.g., `EditorPanel.tsx`)
- Prefer functional components with hooks
- Use TailwindCSS utility classes for styling

### API Integration
- All Gemini API calls go through `/api/proofread` route
- Sanitize all API responses with DOMPurify
- Implement proper error handling for API failures
- Use AbortController for request timeouts

### Security Requirements
- Never expose GEMINI_API_KEY to client-side code
- Sanitize all user inputs and API responses
- Validate all inputs at API boundaries
- Follow CSP headers configuration

### Testing Strategy
- Unit tests for utility functions and components
- E2E tests with Playwright for main user flows
- MSW for API mocking in tests
- Security testing for XSS prevention

## Environment Setup

Create `.env.local` with:
```
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
NODE_ENV=development
TIMEOUT_MS=10000
```

## Current Development Status

The project is in active development with basic UI components implemented. Key remaining tasks include:
- API route implementation with Gemini integration
- Security hardening (DOMPurify integration)
- State management setup
- Testing infrastructure
- Mobile responsiveness improvements

Refer to `docs/tasks.md` for detailed implementation tasks and progress tracking.