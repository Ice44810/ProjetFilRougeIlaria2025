# TODO: Fix ERR_HTTP_HEADERS_SENT in stats.js

## Plan Implementation Steps
- [x] Step 1: Refactor StatsService in handlers/stats.js to use db.queryPromise consistently
- [x] Step 2: Add response sent guards (res.headersSent checks)
- [x] Step 3: Update server.js API routing for better middleware handling + transfers.js StatsService import
- [ ] Step 4: Test /api/topup, /api/stats endpoints
- [ ] Step 5: Verify fix and complete

Current: Steps 1-3 complete. Restart server and test.

