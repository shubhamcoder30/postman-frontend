# Postman Clone - Client Application

The frontend application for the Postman Clone, built with **React**, **Vite**, and **TypeScript**. It provides a premium, responsive interface for API testing and management.

## 🛠️ Tech Stack

- **Core**: React 19, Vite, TypeScript
- **State Management**: Redux Toolkit (with RTK Thunks)
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS, PostCSS, SCSS (custom utilities)
- **HTTP Client**: Axios
- **Real-Time**: Socket.IO Client
- **Forms**: Formik, Yup validation
- **Icons**: Lucide React

## 📂 Directory Structure

```
src/
├── api/                # Axios instance and API config
├── assets/             # Static images and global styles
├── components/         # Reusable UI components
│   ├── RequestBuilder/ # Core component for composing requests
│   ├── ResponseViewer/ # Component to display API responses
│   └── ...
├── pages/              # Main route pages (Login, MainApp, etc.)
├── store/              # Redux setup
│   ├── slices/         # State slices (auth, collection, environment)
│   └── hooks.ts        # Typed Redux hooks
├── types/              # Centralized TypeScript interfaces
└── utils/              # Helpers (variable substitution, local storage)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- NPM

### Installation

1.  Navigate to the client directory:
    ```bash
    cd client
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Configuration

Create a `.env` file in the root of the `client` directory:

```env
VITE_API_URL=http://localhost:3000/api
```

### Running the App

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## 🧩 Key Features & Logic

### Request Builder
Located in `src/components/RequestBuilder`, this component handles the complexity of composing different types of requests. It manages:
- **HTTP/WebSocket/Socket.IO** toggles.
- **Header & Body** management (JSON, Form Data, etc.).
- **Auth** configuration (Bearer, Basic).

### Variable Substitution
The application supports Postman-style variable substitution (e.g., `{{baseUrl}}`).
- **Logic**: Implemented in `src/utils/variables.ts`.
- **Scope**: Variables are resolved from the active **Environment** first, then the **Collection** variables.

### Real-Time Testing
- **Socket.IO**: Uses `socket.io-client` to connect to the target servers.
- **WebSockets**: Uses native browser `WebSocket` API.
- **Messages**: Incoming/Outgoing messages are tracked in local state within `MainApp.tsx` and displayed in `ResponseViewer`.

## 📜 Scripts

- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm run lint`: Run ESLint.
- `npm run preview`: Preview the production build.
