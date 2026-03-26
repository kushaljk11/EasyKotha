EasyKotha
EasyKotha is a full-stack room rental platform for Nepal with:

Role-based authentication (Tenant, Landlord, Admin)
Property listing and filtering
Booking workflow
Payment integration (eSewa and Khalti)
Chat and notifications
AI chatbot support (Gemini)
Recommendation engine for similar and personalized posts
Live frontend:
https://easykotha.vercel.app

Project Structure
EasyKothaFrontend
React + Vite frontend
EasyKothaBackend
Node.js + Express + Prisma backend
EasyKothaBackend/prisma/schema.prisma
PostgreSQL schema
Tech Stack
Frontend:

React
Vite
Tailwind CSS
Axios
React Router
Zustand
Backend:

Node.js
Express
Prisma
PostgreSQL
JWT
Socket.IO
Gemini API
Nodemailer
Cloudinary
Live Usage
Open:
https://easykotha.vercel.app

If you are deploying your own frontend, set:

VITE_API_BASE_URL to your backend API base, for example (coming soon)
VITE_API_ORIGIN to your backend origin, for example (coming soon)
Reference:

EasyKothaFrontend/src/config/env.js
EasyKothaFrontend/src/api/axios.js
Local Setup
1) Prerequisites
Node.js 20+
npm
PostgreSQL
2) Clone and Install
Frontend:

cd EasyKothaFrontend
npm install
Backend:

cd EasyKothaBackend
npm install
3) Environment Variables
Frontend .env in EasyKothaFrontend:

VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_ORIGIN=http://localhost:5000
Backend .env in EasyKothaBackend:
Required core:

DATABASE_URL=postgresql://username:password@host:5432/dbname
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
Optional but used by features:

ADMIN_EMAIL
EMAIL_USER
SMTP_HOST
SMTP_PORT
SMTP_MAIL
SMTP_PASS
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL
FACEBOOK_APP_ID
FACEBOOK_APP_SECRET
FACEBOOK_CALLBACK_URL
OAUTH_BASE_URL
ESEWA_MERCHANT_ID
ESEWA_SECRET
ESEWA_PAYMENT_URL
ESEWA_PAYMENT_STATUS_CHECK_URL
KHALTI_SECRET_KEY
KHALTI_PAYMENT_URL
KHALTI_VERIFICATION_URL
SUCCESS_URL
FAILURE_URL
Reference:

EasyKothaBackend/server.js
EasyKothaBackend/config/passport.js
EasyKothaBackend/controller/payment.controller.js
EasyKothaBackend/config/cloudinary.js
4) Prisma Setup
From EasyKothaBackend:

npx prisma generate
npx prisma migrate dev
5) Run the App
Backend:

npm run dev
Frontend:

npm run dev
Default local URLs:

Frontend: http://localhost:5173
Backend: http://localhost:5000
Main API Groups
Auth:

/api/signup
/api/login
/api/check
Posts:

/api/posts
/api/createpost
/api/posts/:id
/api/posts/:id/recommendations
/api/recommendations/user
Bookings:

/api/bookings
/api/bookings/my-bookings
/api/bookings/:id/status
Payments:

/api/payment/initiate-payment
/api/payment/payment-status
/api/payment/admin/transactions
Chatbot:

/api/chat
Route references:

EasyKothaBackend/routes/auth.routes.js
EasyKothaBackend/routes/post.route.js
EasyKothaBackend/routes/booking.route.js
EasyKothaBackend/routes/payment.route.js
EasyKothaBackend/server.js