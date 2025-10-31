# Soko Safi

Soko Safi is a full-stack e-commerce platform designed to connect artisans with buyers, offering a marketplace for unique, handcrafted products. The platform features a React-based frontend and a Python Flask backend, with a focus on user experience, secure transactions, and efficient product management.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
  - [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication:** Secure registration and login for buyers and artisans.
- **Product Listings:** Artisans can create, update, and manage their product listings with images and detailed descriptions.
- **Shopping Cart:** Buyers can add products to their cart and manage quantities.
- **Checkout Process:** Streamlined checkout with payment integration (e.g., M-Pesa).
- **User Dashboards:** Separate dashboards for buyers (order history, favorites) and artisans (sales, product management).
- **Messaging System:** Direct communication between buyers and artisans.
- **Reviews and Ratings:** Buyers can leave reviews for products and artisans.
- **Search and Filtering:** Easily find products by category, artisan, or keywords.
- **Responsive Design:** Optimized for various devices and screen sizes.

## Technologies Used

### Frontend

- **React:** A JavaScript library for building user interfaces.
- **Vite:** A fast build tool for modern web projects.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **React Router:** For declarative routing in the application.
- **Axios:** For making HTTP requests to the backend API.
- **Context API:** For state management.

### Backend

- **Python:** Programming language.
- **Flask:** A micro web framework for Python.
- **SQLAlchemy:** ORM for interacting with the database.
- **Flask-Migrate:** For handling database migrations.
- **Flask-JWT-Extended:** For JSON Web Token (JWT) based authentication.
- **Flask-SocketIO:** For real-time communication (e.g., chat, notifications).
- **PostgreSQL:** Relational database.
- **Cloudinary:** For image storage and management.
- **M-Pesa API:** For payment processing (Kenya).

## Project Structure

The project is organized into two main directories: `client` for the frontend and `server` for the backend.

```
.
├── client/                 # Frontend (React, Vite)
│   ├── public/             # Static assets
│   ├── src/                # React source code
│   │   ├── Components/     # Reusable UI components
│   │   ├── context/        # React Context for global state
│   │   ├── hooks/          # Custom React hooks
│   │   ├── Pages/          # Application pages/views
│   │   ├── services/       # API interaction, utility functions
│   │   └── utils/          # General utility functions
│   ├── package.json        # Frontend dependencies
│   └── ...
├── server/                 # Backend (Python, Flask)
│   ├── app/                # Flask application source
│   │   ├── models/         # Database models (SQLAlchemy)
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic, external API integrations
│   │   ├── sockets/        # Socket.IO event handlers
│   │   └── utils/          # Backend utility functions
│   ├── migrations/         # Alembic database migrations
│   ├── instance/           # Flask instance folder
│   ├── requirements.txt    # Python dependencies
│   ├── main.py             # Main Flask application entry point
│   └── ...
├── .gitignore              # Git ignore file
├── DEPLOYMENT.md           # Deployment instructions
├── FRONTEND_BACKEND_INTEGRATION.md # Integration guide
├── INTEGRATION_GUIDE.md    # General integration guide
├── LICENSE                 # Project license
├── package.json            # Root project dependencies (if any)
├── README.md               # This file
├── run_local.sh            # Script to run both frontend and backend locally
├── START_SERVERS.md        # Instructions for starting servers
├── test_backend.py         # Backend tests
└── ...
```

## Getting Started

Follow these instructions to set up and run the Soko Safi project on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (LTS version recommended) and **npm** or **yarn**
- **Python 3.8+**
- **pip** (Python package installer)
- **PostgreSQL** database server
- **Git**

### Frontend Setup

1.  Navigate to the `client` directory:
    ```bash
    cd client
    ```
2.  Install frontend dependencies:
    ```bash
    npm install
    # or yarn install
    ```
3.  Create a `.env.local` file in the `client` directory based on `.env.example` and configure your environment variables (e.g., backend API URL).
    ```bash
    cp .env.example .env.local
    ```

### Backend Setup

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Create a Python virtual environment and activate it:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
3.  Install backend dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Create a `.env.local` file in the `server` directory based on `.env.example` and configure your environment variables (e.g., database URL, JWT secret, Cloudinary credentials, M-Pesa API keys).
    ```bash
    cp .env.example .env.local
    ```
5.  Initialize and migrate the database:
    ```bash
    flask db upgrade
    ```
    (If `flask db` commands are not found, ensure your Flask app is correctly configured and `FLASK_APP` environment variable is set, typically to `main.py` or `app/__init__.py`.)

### Running Locally

You can run both the frontend and backend concurrently.

1.  **Start the Backend Server:**
    Open a new terminal, navigate to the `server` directory, activate your virtual environment, and run:

    ```bash
    cd server
    source venv/bin/activate
    python main.py
    ```

    The backend server will typically run on `http://localhost:5000`.

2.  **Start the Frontend Development Server:**
    Open another terminal, navigate to the `client` directory, and run:

    ```bash
    cd client
    npm run dev
    # or yarn dev
    ```

    The frontend application will typically run on `http://localhost:5173`.

    Alternatively, you can use the `run_local.sh` script from the project root to start both:

    ```bash
    ./run_local.sh
    ```

## Deployment

Refer to `DEPLOYMENT.md` for detailed instructions on deploying the Soko Safi application to a production environment.

## Testing

### Frontend Tests

Frontend tests are located in `client/src/Components/__tests__/` and `client/src/Pages/__tests__/`.
To run frontend tests:

```bash
cd client
npm test
```

### Backend Tests

Backend tests are located in `server/test_server.py` and `test_backend.py`.
To run backend tests:

```bash
cd server
source venv/bin/activate
pytest
```

## Contributing

We welcome contributions to Soko Safi! Please refer to `CONTRIBUTING.md` (if available) for guidelines on how to contribute.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
