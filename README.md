# 🚀 SPARK CSE Study Portal

![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

**SPARK CSE** is a comprehensive, feature-rich Study Portal built specifically for Computer Science & Engineering students. It provides a centralized hub for accessing academic materials, tracking schedules, managing contributions, and staying up-to-date with department announcements.

---

## ✨ Key Features

### 🎓 For Students
- **Study Materials Library:** Browse, view, and download subject-wise notes, PDFs, and links.
- **Secure File Viewer:** Built-in PDF and image viewer with custom watermarking to protect intellectual property.
- **Academic Calendar & Timetable:** Stay on track with important dates, holidays, and an exam countdown timer.
- **Doubt Board:** Ask questions and engage with peers and moderators.
- **Contributions:** Upload your own study materials for admin review and share them with the community.

### 🛡️ For Admins & Moderators
- **Role-Based Access Control (RBAC):** Strict security roles (`Admin`, `Moderator`, `Student`).
- **Comprehensive Admin Panel:** 
  - Manage users, moderate content, and handle support tickets.
  - Approve or reject student contributions.
  - Global app settings (toggle premium features, update calendar, etc.).
- **Premium Tiers:** Ability to lock specific resources behind a premium membership.

---

## 🛠️ Technology Stack

**Frontend:**
- **React.js** (v18)
- **React Router** for seamless navigation
- **Context API** for state management (Auth & Theme)
- **SCSS / CSS Modules** for responsive, modern UI design
- **React-PDF / PDF-Lib** for document rendering and manipulation

**Backend:**
- **Node.js & Express.js**
- **MongoDB & Mongoose** for flexible database schemas
- **JSON Web Tokens (JWT)** for secure, stateless authentication
- **Multer & Cloudinary** for high-performance file uploading and media storage
- **Bcrypt.js & Crypto** for password hashing and secure OTP generation

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas Account (or local MongoDB server)
- Cloudinary Account (for file uploads)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/spark-cse.git
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd gritcse-backend-main
npm install
```

Create a `.env` file in the backend root and add the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
ALLOWED_ORIGINS=http://localhost:3000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and install dependencies:
```bash
cd gritcse-frontend-main
npm install
```

*(Optional)* Create a `.env` file in the frontend root if your backend is hosted elsewhere:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the React development server:
```bash
npm start
```
The application will open automatically at `http://localhost:3000`.

---

## ☁️ Deployment

This project is fully optimized for modern cloud deployments:
- **Frontend:** Can be easily deployed to **Cloudflare Pages**, **Vercel**, or **Netlify**.
- **Backend:** Configured for **Render**, **Railway**, or **Heroku**. Includes a `.npmrc` file to ensure `legacy-peer-deps` are handled smoothly during automated build processes.

---

## 🔒 Security Best Practices Implemented
- Cryptographically secure OTP generation (`crypto.randomInt`).
- Strict type-casting during authentication to prevent NoSQL injection / Type-mismatch bypasses.
- Exhaustive Role-Based Middleware to ensure isolated routing.
- Resolved all high-severity NPM vulnerabilities via strict package management.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! 
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
