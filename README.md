# FilmFinder

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]() [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)]()

## Table of Contents
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description
FilmFinder is a minimal viable product (MVP) application designed to simplify the process of searching for movies and TV series. Users can define personalized criteria such as actors, directors, genres, and production years to receive AI-generated movie recommendations that suit their individual preferences.

## Tech Stack
- **Frontend:** Astro 5, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui
- **Backend:** Supabase for database management and authentication
- **AI Integration:** Openrouter.ai for accessing AI models to generate recommendations
- **CI/CD and Deployment:** GitHub Actions for CI/CD, DigitalOcean for hosting (Docker-based deployment)

## Getting Started Locally
1. **Clone the repository:**
   ```sh
   git clone <repository-url>
   cd <project-directory>
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Ensure you are using the correct Node version (as specified in `.nvmrc`):**
   ```sh
   nvm use 22.14.0
   ```
4. **Run the development server:**
   ```sh
   npm run dev
   ```

## Available Scripts
- `npm run dev` - Starts the Astro development server.
- `npm run build` - Builds the project for production.
- `npm run preview` - Previews the production build locally.
- `npm run astro` - Runs Astro CLI commands.
- `npm run lint` - Runs ESLint to analyze and identify code issues.
- `npm run lint:fix` - Attempts to automatically fix ESLint issues.
- `npm run format` - Formats the codebase using Prettier.

## Project Scope
FilmFinder focuses on delivering a streamlined and user-centric film recommendation experience. Key features include:
- **User Authentication:** Registration, login, and profile management.
- **Personalized Preferences:** Users can specify favorite actors, directors, genres, and production years.
- **Criteria-based Search:** Manual entry of search criteria with an option to autofill using existing profile preferences.
- **AI-driven Recommendations:** Generation of movie recommendations using an AI model via an API.
- **Watch Status Management:** Ability to mark movies as "To Watch," "Watched," or "Rejected," with logging of status changes.
- **Dynamic UI:** Presentation of movie recommendations using card layouts, infinite scrolling, and a text-based search filter.

## Project Status
This project is currently in its MVP stage. It is actively being developed and enhanced with additional features and improvements based on user feedback.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
