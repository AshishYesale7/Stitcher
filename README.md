# Stitcher: Your Personal Tailoring Connection

Welcome to Stitcher, a modern platform designed to seamlessly connect customers with skilled tailors. Our vision is to eliminate the hassle of finding the right tailor and to provide a smooth, transparent, and enjoyable experience for creating custom-fit clothing.

## Our Vision

In a world of fast fashion, we believe in the value of personalization and craftsmanship. Stitcher aims to be the go-to digital destination for anyone looking to get clothes made to their exact specifications. We empower customers to find the perfect artisan for their needs and provide tailors with the tools to manage their business and reach a wider audience.

---

## ✅ Latest Updates (What's New)

We've been hard at work building the core foundation of the Stitcher experience. Here's what has been recently implemented:

- **🔐 Robust Authentication System:**
  - **Phone & Google Sign-In:** Secure and easy login options for both customers and tailors using Firebase Authentication.
  - **Smart OTP Handling:**
    - The app automatically detects and fills the OTP from SMS on supported mobile devices (using the WebOTP API).
    - The country code selector intelligently defaults to the user's location based on their IP address.
  - **Distinct User Roles:** Separate, secure login portals for **Customers** and **Tailors**.

- **👤 Personalized User Dashboards:**
  - Upon logging in, users are directed to a dashboard tailored to their role.
  - **Customer Dashboard:** Provides quick access to find tailors, track orders, and manage their profile.
  - **Tailor Dashboard:** A central hub for tailors to manage their orders and services (to be expanded).

- **🤖 AI-Powered Tailor Recommendations:**
  - Customers can describe the garment they want, and our Genkit-powered AI will recommend the best tailors based on specialties, design expertise, and location.

- **🚀 Seamless User Experience:**
  - **Automatic Redirection:** Logged-in users are automatically sent to their dashboard from the landing or login pages.
  - **Flawless Logout:** Users are correctly redirected to the landing page upon logging out, without getting stuck in a redirect loop.
  - **Responsive Design:** A clean and modern UI that works across devices, with a functional navigation menu on mobile.

---

## 🔮 Upcoming Features (What's Next)

We're just getting started! Here is a glimpse of the exciting features we plan to build next:

- **📝 Full Order Management System:**
  - **Customers:** Ability to create new orders, upload design specifications, track the status of their garments (e.g., "Measurement," "Stitching," "Ready for Pickup"), and view their order history.
  - **Tailors:** A comprehensive system to receive new orders, update their status, communicate with customers, and manage their workflow.

- **👔 Complete Tailor & Customer Profiles:**
  - **Tailors:** Rich profiles showcasing their specialties, a portfolio of their work, customer reviews, ratings, and pricing information.
  - **Customers:** Ability to save their measurements, manage their profile details, and view a list of their favorite tailors.

- **💬 In-App Messaging:**
  - Direct communication channel between customers and tailors to discuss design details, measurements, and timelines without leaving the app.

- **🖼️ AI-Powered Garment Design:**
  - An innovative feature allowing customers to **design their own garments** using generative AI. Users could describe a design, upload a sketch, and see a visual representation of their idea.

- **💳 Secure Payments Integration:**
  - A built-in payment system to handle deposits and final payments securely within the platform.

Stay tuned as we continue to build and enhance the Stitcher experience!