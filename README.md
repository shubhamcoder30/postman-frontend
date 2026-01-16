# Postman Clone - Frontend (Client)

A modern, premium-designed API testing tool built with React and Vite. This application allows users to test HTTP endpoints, manage collections, and organize API environments.

## Tech Stack
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (Premium Modern Design)
- **State Management**: Redux Toolkit
- **Icons**: Lucide React
- **HTTP Client**: Axios / Native Fetch
- **Communication**: Socket.IO Client (for WebSocket testing)

## Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

## Getting Started

### 1. Installation
Navigate to the client directory and install dependencies:
```bash
npm install
```

### 2. Configure API Endpoint
In the `client` directory, ensure the `src/config.ts` or relevant environment file points to your backend server (default is `http://localhost:3000`).

### 3. Running the Application

#### Development Mode
```bash
npm run dev
```
The application will usually be available at `http://localhost:5173`.

#### Production Build
To create an optimized production build:
```bash
npm run build
```

## Key Features
- **Dynamic Request Builder**: Support for GET, POST, PUT, DELETE, PATCH, OPTIONS, and HEAD.
- **Collection Management**: Organize requests into folders (collections) with drag-and-drop support (coming soon) and bulk deletion.
- **Variable Substitution**: Use `{{variable_name}}` in URLs and headers to swap values from collection or environment variables.
- **Real-time Updates**: Immediate UI reactivity when importing/exporting Postman collections.
- **Premium Aesthetics**: Glassmorphism dashboard, fluid animations, and high-contrast typography.
- **WebSocket/Socket.IO Support**: Test real-time connections directly from the interface.

## Project Structure
- `src/components`: Reusable UI components (Sidebar, RequestBuilder, etc.).
- `src/pages`: Main application views (MainApp, Login, Signup).
- `src/store`: Redux slices and store configuration.
- `src/utils`: Helper functions for variable substitution and URL parsing.
- `src/index.css`: Global styles and custom Tailwind utilities.
