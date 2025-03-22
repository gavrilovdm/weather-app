# WeatherApp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.4.

## Features

The Weather Dashboard is an Angular application that provides:

- Real-time weather information display through customizable widgets
- Responsive UI with mobile-first design
- Offline support via Service Workers and IndexedDB
- Dynamic widget management with drag-and-drop functionality
- User preferences including units (metric/imperial), language, and theme settings
- Comprehensive state management for widget configurations
- Data caching and offline persistence capabilities
- Error handling with user-friendly messages

The application is structured with core services (State, Weather, Storage, Logging), feature modules (Dashboard, Settings), and shared components, following Angular best practices for modularity and maintainability.

## Installation

To install and run the project:

```bash
# Clone the repository
git clone https://github.com/yourusername/weather-app.git
cd weather-app

# Install dependencies
npm install

# Start the development server
ng serve
```

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.