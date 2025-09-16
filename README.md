<!-- ─────────────────────────────────────────────────────────────────────────────
   fabrova— Copyright (c) 2025 Ashish Vasant Yesale (ashishyesale007@gmail.com)
   SPDX-License-Identifier: BSD-3-Clause OR Proprietary
   fabrova is dual-licensed under the BSD 3-Clause License and a Commercial License.
   - 📜 [License (BSD 3-Clause)](https://github.com/AshishYesale7/Stitcher/LICENSE)
- ⚖️ [Commercial Use Terms](https://github.com/AshishYesale7/Stitcher/COMMERCIAL_TERMS.md)
  
   This file is part of the "fabrova" Project.
  
   ─────────────────────────────────────────────────────────────────────────────
   Licensing:
   -----------
  
  
     Licensed under the BSD 3-Clause License or a Commercial License.          
     You may use this file under the terms of either license as specified in: 
  
        - BSD 3-Clause License (see ./LICENSE)                           
        - Commercial License (see ./COMMERCIAL_TERMS.md or contact legal@your.org)  
  
     Redistribution and use in source and binary forms, with or without       
     modification, are permitted under the BSD license provided that the      
     following conditions are met:                                            
  
       * Redistributions of source code must retain the above copyright       
         notice, this list of conditions and the following disclaimer.       
       * Redistributions in binary form must reproduce the above copyright    
         notice, this list of conditions and the following disclaimer in the  
         documentation and/or other materials provided with the distribution. 
       * Neither the name of the project nor the names of its contributors    
         may be used to endorse or promote products derived from this         
         software without specific prior written permission.                  
  
     THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS  
     IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED    
     TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A          
     PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER 
     OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, 
     EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,      
     PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR       
     PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF   
   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING     
     NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS       
     SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.  
  
   By using this software, you agree to be bound by the terms of either license.
  
   Alternatively, commercial use with extended rights is available — contact the author for commercial licensing.
  
   ─────────────────────────────────────────────────────────────────────────────
   Contributor Guidelines:
   ------------------------
   Contributions are welcome under the terms of the Developer Certificate of Origin (DCO).
   All contributors must certify that they have the right to submit the code and agree to
   release it under the above license terms.
  
   Contributions must:
     - Be original or appropriately attributed
     - Include clear documentation and test cases where applicable
     - Respect the coding and security guidelines defined in CONTRIBUTING.md
  
   ─────────────────────────────────────────────────────────────────────────────
   Terms of Use and Disclaimer:
   -----------------------------
   This software is provided "as is", without any express or implied warranty.
   In no event shall the authors, contributors, or copyright holders
   be held liable for any damages arising from the use of this software.
  
   Use of this software in critical systems (e.g., medical, nuclear, safety)
   is entirely at your own risk unless specifically licensed for such purposes.
  
   ─────────────────────────────────────────────────────────────────────────────
-->
 

# fabrova: Your Personal Tailoring Connection

Welcome to fabrova, a modern platform designed to seamlessly connect customers with skilled tailors. Our vision is to eliminate the hassle of finding the right tailor and to provide a smooth, transparent, and enjoyable experience for creating custom-fit clothing.
[![Netlify Status](https://api.netlify.com/api/v1/badges/961b94d7-0974-4510-87fa-c73863fc63a1/deploy-status)](https://app.netlify.com/sites/fabrova-ai/deploys)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/AshishYesale7/fabrova&env=NEXT_PUBLIC_FIREBASE_API_KEY,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,NEXT_PUBLIC_FIREBASE_PROJECT_ID,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,NEXT_PUBLIC_FIREBASE_APP_ID,GEMINI_API_KEY)

## Our Vision

In a world of fast fashion, we believe in the value of personalization and craftsmanship. fabrova aims to be the go-to digital destination for anyone looking to get clothes made to their exact specifications. We empower customers to find the perfect artisan for their needs and provide tailors with the tools to manage their business and reach a wider audience.

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


"fabrova" is dual-licensed under the BSD 3-Clause License and a Commercial License.

You may use this project under the terms of the BSD 3-Clause License as stated in the LICENSE file.  
Alternatively, commercial use with extended rights is available — contact the author for commercial licensing.

See the [LICENSE](./LICENSE) file for details.

- 📜 [License (BSD 3-Clause)](./LICENSE)
- ⚖️ [Commercial Use Terms](./COMMERCIAL_TERMS.md)
