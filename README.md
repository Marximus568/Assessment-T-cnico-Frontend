# Course Management Platform - Frontend

![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-yellow?style=for-the-badge&logo=pinia&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

A modern, high-performance web application built with **Vue 3** and **Vite**, designed to provide an intuitive interface for managing educational courses and lessons. This frontend consumes a RESTful API and handles complex state management, authentication, and content organization.

## 🚀 Key Features

### 🔐 Advanced Authentication
- **Secure Login & Registration**: User authentication flow with real-time validation.
- **JWT Management**: Automatic token handling and persistence via `localStorage` and **Pinia**.
- **Route Protection**: Intelligent navigation guards prevent unauthorized access to private resources.
- **Automatic Session Invalidation**: Axios interceptors handle 401/403 errors by redirecting users to the login screen.

### 📚 Course Lifecycle Management
- **Dashboard**: A comprehensive course list with server-side **pagination**.
- **Search & Filtering**: Real-time search by title and status filtering (Draft/Published) for efficient content management.
- **Metrics Dashboard**: Integrated **Course Summary** view showing critical data points like total lessons and last modified timestamps.
- **Content Creation**: Streamlined flow for creating and editing course metadata.

### 📝 Lesson Organization
- **Dynamic Content**: List views sorted by the `order` field to maintain educational flow.
- **Real-time Reordering**: Intuitive "Up/Down" controls leverage the reorder API to update lesson sequences instantly.
- **CRUD Operations**: Full management of lesson content (Add, Edit, Soft Delete).

## 🛠️ Tech Stack & Architecture

- **Core**: [Vue 3](https://vuejs.org/) (Composition API)
- **Tooling**: [Vite](https://vitejs.dev/) for ultra-fast development and builds.
- **State Management**: [Pinia](https://pinia.vuejs.org/) for reactive, modular state across the app.
- **Navigation**: [Vue Router](https://router.vuejs.org/) with centralized configuration and guards.
- **HTTP Client**: [Axios](https://axios-http.com/) with request/response interceptors for centralized JWT injection and error handling.
- **Styling**: Vanilla CSS with **glassmorphism** influences and a premium color palette (#42b983, #2c3e50).

## 📂 Project Structure

```text
src/
├── api/          # Axios client configuration & interceptors
├── assets/       # Static assets and global styles
├── components/   # Reusable UI components
├── router/       # Centralized route definitions & guards
├── stores/       # Pinia stores (auth, user state)
├── views/        # Main page components (Login, Courses, Lessons)
└── App.vue       # Root component & main layout
```

## ⚙️ Installation & Setup

1. **Clone & Install Dependencies**:
   ```bash
   git clone <repository-url>
   cd Assement-frontend
   npm install
   ```

2. **Configure Environment**:
   Ensure your backend API is running at `http://localhost:5129`. You can modify the `baseURL` in `src/api/client.js` if necessary.

3. **Development Mode**:
   ```bash
   npm run dev
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```

## 🧠 Development Philosophy

This project follows **Clean Code** principles and a **Modular Architecture**. Each module (Authentication, Courses, Lessons) is decoupled, making the codebase easy to maintain and scale. The UI focuses on **UX/UI excellence**, providing micro-animations and feedback (loading states, error handling) to ensure a premium user experience.

---

**Developed with ❤️ and Precision**
