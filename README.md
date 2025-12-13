# VideoTube Backend 🎥

Backend service for the VideoTube platform.  
Built with **Node.js, Express, MongoDB, Cloudinary, Multer, Socket.io**.

---

## 🚀 Features
- **User Authentication** with JWT + bcrypt
- **Video Uploads**:  
  - Files first stored locally (video + thumbnail)  
  - Uploaded to **Cloudinary**  
  - Local files auto-deleted after upload  
  - Real-time upload progress tracked via **Socket.io**
- **Video Streaming** from Cloudinary
- **Comment System** with pagination
- **MongoDB** for scalable data storage

---

## 🛠️ Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose)
- Multer (file uploads)
- Cloudinary (video storage)
- Socket.io (upload progress)
- JWT + bcrypt (auth)
---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone <repo-url>
```

### 2. Navigate to backend folder

```bash
cd navigate_to_dir
```

### 3. Install dependencies

```bash
npm install
```

### 🔐4. Set Environment Variables

#### Create a .env file in the root of your project:
```bash
PORT=Your_Port

MONGOOSE_URL="mongodb+srv://yourUsername:yourPassword@cluster0.875cujb.mongodb.net"

CORS_ORIGIN="http://localhost:your_frontend_Port"

ACCESS_TOKEN_SECRET="your_generated_access_secret"
ACCESS_TOKEN_EXPIRY=1d or your_choose

REFRESH_TOKEN_SECRET="your_generated_refresh_secret"
REFRESH_TOKEN_EXPIRY=10d or your_choose

CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### 4. Run development server

```bash
npm run dev
```


## 📂Project Structure

```markdown
# 📂 Project Root
.
├── public/                                 # Publicly accessible static files
│   └── temp/                               # Temporary storage (e.g., cached uploads, temp files)
│
├── src/                                    # Main source code folder
│   ├── controllers/                        # Controllers: handle request/response logic
│   │   ├── comment.controller.js           # Manage comments (CRUD, pagination)
│   │   ├── dashboard.controllers.js        # Dashboard-related APIs
│   │   ├── healthcheck.controllers.js      # Health check endpoint (server status)
│   │   ├── likes.controllers.js            # Handle likes/dislikes on videos/tweets
│   │   ├── playlist.controllers.js         # Playlist creation & management
│   │   ├── subscription.controllers.js     # User subscriptions (channels/users)
│   │   ├── tweet.controllers.js            # Tweet-like posts handling
│   │   ├── user.controller.js              # User authentication & profile management
│   │   └── video.controllers.js            # Video upload, stream, delete, etc.
│   │
│   ├── db/                                 # Database connection setup
│   │   └── index.js                        # MongoDB connection using Mongoose
│   │
│   ├── middlewares/                        # Middlewares: run before controllers
│   │   ├── auth/                           # Authentication middleware (JWT, bcrypt)
│   │   └── multer/                         # Multer config for file uploads
│   │
│   ├── model/                              # Database models (Mongoose schemas)
│   │   ├── comment/                        # Comment schema
│   │   ├── likes/                          # Likes schema
│   │   ├── playlists/                      # Playlist schema
│   │   ├── subscription/                   # Subscription schema
│   │   ├── tweets/                         # Tweet schema
│   │   ├── user/                           # User schema
│   │   └── video/                          # Video schema
│   │
│   ├── routes/                             # API routes
│   │   ├── comment/                        # Routes for comment APIs
│   │   ├── dashboard/                      # Routes for dashboard APIs
│   │   ├── heathcheck/                     # Routes for health check
│   │   ├── likes/                          # Routes for likes APIs
│   │   ├── playlists/                      # Routes for playlist APIs
│   │   ├── subscription/                   # Routes for subscription APIs
│   │   ├── tweets/                         # Routes for tweet APIs
│   │   ├── user/                           # Routes for user APIs
│   │   └── video/                          # Routes for video APIs
│   │
│   ├── socket/                             # Socket.io for real-time communication
│   │   └── index.js                        # Socket.io setup (upload progress, live chat, etc.)
│   │
│   ├── utils/                              # Utility/helper functions
│   │   ├── ApiError.js                     # Custom error handling class
│   │   ├── ApiResponse.js                  # Standardized API response format
│   │   ├── asyncHandler.js                 # Wrapper for async functions (error handling)
│   │   └── fileUpload.js                   # File upload helper (Cloudinary, local storage)
│   │
│   ├── app.js                              # Express app setup (middlewares, routes)
│   ├── constants.js                        # Project-wide constants (config values)
│   └── index.js                            # Entry point (start server)
│
├── .env_sample                             # Sample environment variables file
├── .gitignore                              # Git ignore rules
├── .prettierignore                         # Ignore files for Prettier formatting
├── .prettierrc                             # Prettier configuration
├── package.json                            # Project metadata & dependencies
└── package-lock.json                       # Dependency lock file
```
