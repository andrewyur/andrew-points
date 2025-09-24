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
- [x] marketplace page
  - [x] create listing interface
  - [x] listings page
  - [x] buy listing interface
- [ ] trade page (to be determined, could result in large coalescing of points)
  - [ ] create trade page
- [x] earn page
  - [x] create some menial task that ties points to physical work
    - free tier hCaptcha
    - earn session creation and timed expiry
    - randomized puzzle timing
  - [ ] potential improvements
    - [ ] send a video of you doing a pushup/jumping jack
    - [ ] do one random task of my choosing
    - [ ] Quicktime events
    - [ ] talk to me for 5 minutes straight, uninterrupted
    - [ ] tell me a joke, get points if its good, lose points if its bad
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
  - daisyui.com
- [ ] logger with file transport
