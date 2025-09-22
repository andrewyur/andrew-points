# andrew-points

mini economy for lodge

## features

- [x] discord oauth
- [x] redeem page
- [x] transaction ledger
- [x] bounty page
  - [x] create bounty interface
  - [x] list bounty page
  - [x] complete bounty interface
- [x] cron jobs to check for expiration of objects
  - need to set up docker compose, image with multiple entrypoints, and db in volume
- [ ] marketplace page
  - [ ] create listing interface
  - [ ] listings page
  - [ ] buy listing interface
- [ ] trade page (to be determined, could result in large coalescing of points)
  - [ ] create trade page
- [ ] earn page
  - [ ] create some menial task that ties points to physical work
- [ ] statistics page
  - [ ] recent activity
  - [ ] total points in circulation
  - [ ] leaderboard
- [ ] discord bot
  - [ ] notifications for every action
- [ ] home page
  - [ ] notifications
  - [ ] your points
  - [ ] your recent activity
  - [ ] your notifications
  - [ ] display user's ledger
- [ ] admin accounts
  - [ ] manipulate people's points
    - [ ] send notification
  - [ ] list active bounties
  - [ ] ban / timeout discord users
  - [ ] revert ledger actions
  - [ ] transaction reversals
- [ ] style pages
  - prioritizing mobile view
- [ ] logger with file transport
