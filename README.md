# Stitcher: Your Personal Tailoring Connection

Welcome to Stitcher, a modern platform designed to seamlessly connect customers with skilled tailors. Our vision is to eliminate the hassle of finding the right tailor and to provide a smooth, transparent, and enjoyable experience for creating custom-fit clothing.
[![Netlify Status](https://api.netlify.com/api/v1/badges/961b94d7-0974-4510-87fa-c73863fc63a1/deploy-status)](https://app.netlify.com/projects/stitcher-ai/deploys)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/AshishYesale7/Stitcher&env=NEXT_PUBLIC_FIREBASE_API_KEY,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,NEXT_PUBLIC_FIREBASE_PROJECT_ID,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,NEXT_PUBLIC_FIREBASE_APP_ID,GEMINI_API_KEY)

## Our Vision

In a world of fast fashion, we believe in the value of personalization and craftsmanship. Stitcher aims to be the go-to digital destination for anyone looking to get clothes made to their exact specifications. We empower customers to find the perfect artisan for their needs and provide tailors with the tools to manage their business and reach a wider audience.

---

## Deployment

You can deploy this project to Netlify with one click.

1.  Click the "Deploy to Netlify" button above.
2.  Follow the instructions to connect your GitHub account.
3.  Fill in the required environment variables with your credentials from Firebase and Google AI Studio.
4.  Click "Deploy site".

Netlify will automatically build and deploy your application.

## Current Development Status

### ✅&nbsp; Completed

-   **Robust Authentication System:**
    -   Secure phone (OTP) & Google sign-in for both customers and tailors.
    -   Smart OTP auto-fill on supported mobile devices.
    -   Country code selector that defaults to the user's location.
    -   Separate, role-based user profiles in Firestore (`customers` and `tailors` collections).
-   **Personalized User Dashboards:**
    -   Role-specific dashboards for customers and tailors.
    -   Automatic redirection to the correct dashboard upon login.
    -   Clean logout flow that prevents redirect loops.
-   **AI-Powered Tailor Recommendations:**
    -   A Genkit-based AI flow to suggest tailors based on user needs.
-   **Core UI & Navigation:**
    -   Responsive landing page and dashboard layouts.
    -   Functional navigation and mobile-friendly sidebars.

### ⏳&nbsp; In Progress

-   **Full Order Management System:**
    -   Customers: Create, track, and view order history.
    -   Tailors: Receive, update, and manage orders.

### ấp  Future Plans

-   **Complete Tailor & Customer Profiles:**
    -   Tailors: Portfolios, specialties, reviews, and pricing.
    -   Customers: Saved measurements and favorite tailors.
-   **In-App Messaging:**
    -   Direct chat between customers and tailors.
-   **AI-Powered Garment Design:**
    -   Allow customers to design garments using generative AI.
-   **Secure Payments Integration:**
    -   Built-in system for deposits and final payments.
