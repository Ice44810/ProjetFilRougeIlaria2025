# Backend Check-up & Fixes Progress

## Current Status
✅ Plan approved by user. Starting step-by-step fixes.

## Detailed Steps from Plan:

### 1. Immediate Fixes (High Priority - Login/Runtime)
- [✅] **server.js**: Fixed parse(body) → parseBody middleware, /logout, API middleware.
- [✅] **handlers/users.js**: Moved Maps to top, console → logger, removed duplicates.
- [ ] **handlers/transactions.js**: Replace TransactionService refs → direct DB/model calls (hoisted OK).

### 1. Testing (High Priority)
- [✅] `node server.js` → Starts clean, DB ready, no errors.

### 2. Console Cleanup (All files)
- [ ] Replace remaining ~50 console.* → logger.* across handlers/, utils/db.js, public/js/
- [ ] handlers/cards.js, categories.js, etc.

### 3. DB Improvements
- [ ] utils/db.js: Ensure db.queryPromise works everywhere. Add pool?

### 4. Globals Refactor
- [ ] Create utils/sessions.js for shared sessions/otps/maps
- [ ] Update server.js, auth.js, handlers/users.js

### 5. Security & Polish
- [ ] Remove sensitive console logs permanently
- [ ] Add .env for DB creds
- [ ] Add eslint + lint all

### 6. Testing
- [ ] `node server.js` → no crashes
- [ ] Test login/register API with curl/Postman
- [ ] Frontend login.html → redirects on success
- [ ] Update this TODO.md after each major step

### 7. Completion
- [ ] attempt_completion with summary + run command

**Next step: Fix server.js critical bugs**

