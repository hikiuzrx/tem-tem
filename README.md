
# Tem-Tem Backend API

A robust, production-ready backend built with **NestJS**, **MongoDB (Mongoose)**, **Redis**, and **Cloudinary**. This API supports authentication, product and category management, image uploads, caching, and more, with full Swagger documentation and e2e tests.

---

## 📁 Project Structure

```
.
├── docker-compose.yaml
├── dockerfile.dev
├── eslint.config.mjs
├── logs
│   ├── app.log
│   └── error.log
├── nest-cli.json
├── package.json
├── README.md
├── src
│   ├── app.controller.spec.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── config
│   │   ├── db.config.ts
│   │   └── redis.config.ts
│   ├── infrastructure
│   │   ├── cloudinary
│   │   │   ├── cloudinary.module.ts
│   │   │   ├── cloudinary.provider.ts
│   │   │   └── cloudinary.service.ts
│   │   ├── database
│   │   │   └── db.module.ts
│   │   ├── logger
│   │   │   ├── logger.interceptor.ts
│   │   │   ├── logger.module.ts
│   │   │   ├── logger.service.ts
│   │   │   └── transport.ts
│   │   └── redis
│   │       ├── redis.module.ts
│   │       └── redis.service.ts
│   ├── main.ts
│   ├── modules
│   │   ├── auth
│   │   │   ├── auth.controller.spec.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── decorators
│   │   │   │   ├── isPublic.decorator.ts
│   │   │   │   └── roles.decorator.ts
│   │   │   ├── dto
│   │   │   │   ├── login.dto.ts
│   │   │   │   └── register.dto.ts
│   │   │   ├── guards
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   └── schema
│   │   │       └── user.schema.ts
│   │   ├── categories
│   │   │   ├── category.controller.spec.ts
│   │   │   ├── category.controller.ts
│   │   │   ├── category.service.ts
│   │   │   ├── catgeory.module.ts
│   │   │   ├── dto
│   │   │   │   ├── createCtegory.dto.ts
│   │   │   │   ├── fetchCategory.dto.ts
│   │   │   │   └── updateCategory.dto.ts
│   │   │   └── schema
│   │   │       └── category.schema.ts
│   │   └── products
│   │       ├── dto
│   │       │   ├── createProdcut.ts
│   │       │   ├── deleteProduct.ts
│   │       │   ├── getProduct.ts
│   │       │   ├── getProductByCategory.dto.ts
│   │       │   └── update.product.ts
│   │       ├── product.controller.spec.ts
│   │       ├── product.controller.ts
│   │       ├── product.module.ts
│   │       ├── product.service.ts
│   │       └── schema
│   │           └── product.schema.ts
│   ├── scripts
│   │   └── seed-admin.ts
│   ├── shared
│   │   ├── cloudinary.constants.ts
│   │   └── constants.ts
│   └── types
│       ├── jwt.d.ts
│       └── models.d.ts
├── test
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── tsconfig.build.json
├── tsconfig.json
└── yarn.lock

25 directories, 64 files
```

---

## 🛠️ Tech Stack

- **NestJS**: Node.js framework for scalable server-side apps
- **MongoDB + Mongoose**: NoSQL database and ODM
- **Redis**: Caching, password reset codes
- **Cloudinary**: Image upload and storage
- **Passport + JWT**: Authentication and role-based access
- **Swagger**: API documentation
- **Multer**: File upload handling
- **Argon2**: Password hashing
- **Supertest/Jest**: e2e and unit testing

---

## 🗄️ Database Models & Relationships

### User
- `email` (unique)
- `username` (unique)
- `password` (hashed)
- `role` (admin | user)
- ...

### Category
- `name` (unique)
- `description`
- `image` (Cloudinary URL)
- ...

### Product
- `name`
- `description`
- `price`
- `image` (Cloudinary URL)
- `category` (reference by name, resolved to Category)
- ...

#### Relationships
- **Product → Category**: Each product references a category by name (not by ID). On creation/update, the API verifies the category exists (or creates it if needed).
- **User**: Used for authentication and role-based access. No direct relation to products/categories, but role controls access.

---

## 🚀 Features
- **Authentication**: Register, login, JWT, role guards
- **Password Reset**: Code sent via email, stored in Redis
- **Product CRUD**: Create, update, delete, filter (by category/price), pagination
- **Category CRUD**: Create, update, delete, list
- **Image Upload**: Cloudinary integration for products/categories
- **Caching**: Redis for product/category queries
- **Validation**: DTOs with class-validator
- **Swagger Docs**: All endpoints documented
- **Testing**: e2e tests for all major endpoints

---

## 🧑‍💻 Getting Started

1. **Install dependencies**
  ```sh
  yarn install
  ```
2. **Configure environment**
  - Set up MongoDB, Redis, and Cloudinary credentials (see `src/config/`)
3. **Run in development**
  ```sh
  yarn start:dev
  ```
4. **Run tests**
  ```sh
  yarn test:e2e
  ```
5. **API Docs**
  - Visit `/api` for Swagger UI after starting the server

---

## 📚 API Overview

- **Auth**: `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/password-reset`, `/auth/confirm-password-reset`
- **Categories**: `/categories` (CRUD, image upload)
- **Products**: `/products` (CRUD, filter, image upload)

All endpoints are protected by JWT and role guards as appropriate.

---

## 📝 License

MIT
