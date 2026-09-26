# MILVETA Admin Portal — Vercel Preview

Static client-preview build for the MILVETA admin portal.

## Demo accounts
- admin1@milveta.com / Demo@123
- admin2@milveta.com / Demo@123

## Vercel
Import this folder/repository into Vercel.
Framework: Other
Build command: empty
Output directory: empty

The dashboard loads auth.js before admin.js so the login redirect works correctly.

## Important
This is a frontend preview only. The final version should use the Express/PostgreSQL backend with secure HttpOnly-cookie authentication and server-side authorization for the two real administrators.
