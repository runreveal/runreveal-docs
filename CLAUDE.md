# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- Development: `npm run dev` - Starts the development server
- Build: `npm run build` - Creates production build
- Start: `npm run start` - Serves the production build

## Code Style Guidelines
- **TypeScript**: Use TypeScript for type safety. Strict mode is off but follow good typing practices.
- **Components**: React functional components with explicit return types.
- **Imports**: Group imports by external libraries first, then internal components/utilities.
- **Naming**: Use PascalCase for components, camelCase for variables and functions.
- **MDX Content**: Keep MDX docs clean and well-organized with proper headings.
- **Error handling**: Use try/catch for async operations.

## Repository Structure
- `/pages`: MDX content pages and documentation routing
- `/components`: Reusable React components
- `/public`: Static assets and images

This is a Nextra-based documentation site. Focus on content organization and clarity.

## Important Notes
- Don't run `npm run dev` to validate your work. Instead ask for us to verify.