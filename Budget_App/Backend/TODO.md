# TODO List for Budget App Backend Enhancements

## Database Schema Updates
- [x] Update `utils/db.js`: Add `role` column to `users` table (default 'user')
- [x] Update `utils/db.js`: Create `categories` table (id, name, user_id)
- [x] Update `utils/db.js`: Add `category_id` to `transactions` table

## Controllers
- [x] Create `controllers/usersController.js`: Implement profile edit (GET/PUT /api/profile), password recovery (POST /api/reset-password)
- [x] Create `controllers/categoriesController.js`: Implement CRUD for categories (GET/POST/PUT/DELETE /api/categories)
- [x] Update `controllers/transactionsController.js`: Add `createTransaction`, `updateTransaction`, `deleteTransaction`, and support filtering by category/period in `getTransactions`

## Routes
- [x] Create `routes/users.js`: Handle user-related routes (profile, reset-password)
- [x] Create `routes/categories.js`: Handle category routes
- [x] Update `routes/transactions.js`: Ensure it handles all methods (GET, POST, PUT, DELETE) for transactions

## Server Integration
- [x] Update `server.js`: Add role checks (e.g., only admins can manage users)
- [x] Update `server.js`: Integrate new routes
- [x] Update `server.js`: Add visualization APIs (e.g., GET /api/stats for totals by category/monthly evolution)
- [x] Update `server.js`: Add input validation and error handling across all new endpoints
- [x] Update `server.js`: Ensure all new routes are protected and check user sessions/roles

## Testing and Optimization
- [ ] Test all new endpoints (e.g., via Postman or curl)
- [ ] Verify DB migrations don't break existing data
- [ ] Optimize queries if needed and add logging

## Finalization based on HTML pages
- [x] Add user profile fields (fullName, phone, address, postcode, ville) to DB
- [x] Update usersController to handle profile updates with new fields
- [x] Update edit_profil.html to fetch /api/users instead of PHP
- [x] Update /api/home to compute balance from DB transactions and fetch last transactions
- [x] Fix index.html fetch URL to relative path
