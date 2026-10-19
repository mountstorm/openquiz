# Mahoot!

[Play Mahoot](https://openquiz-big-screen.mkhaydar409183.chatgpt.site) · [Source repository](https://github.com/mountstorm/openquiz)

An original, MIT-licensed live quiz game. Put the host screen on a projector, let players join from their phones, and enjoy some friendly competition. No feature paywall or player accounts.

## Features

- Big-screen host lobby, full-screen mode, six-digit room codes, copyable join links
- Separate mobile player screens; questions and answer text appear on both screens
- Server-authoritative timers, answer validation, speed-based scoring, and leaderboards
- Custom quiz editor with 10/20/30/60-second timers; JSON import/export
- Three ready-to-host quizzes; optional round-change sound
- Reconnect by refreshing the same tab; host/player credentials stay in session storage
- Rooms expire after 24 hours; expired rows are removed when a new room is created

## Quick start

Requires Node.js 22.13 or later and npm. This project uses React, Vinext, and Cloudflare D1.

```sh
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_ancient_the_renegades.sql
npm start
```

Use the actual SQL filename in `drizzle/` if it differs. Open the local address printed by Wrangler. To test two people on one computer, use separate tabs: host in one, join in another. For phones on your Wi-Fi, run `npm start -- --ip 0.0.0.0` and visit your computer's LAN IP and the printed port. Clipboard/fullscreen features may require HTTPS. Only expose the development server on a trusted network.

Quiz definitions are saved in the browser that created them. Export JSON for backups or to move a quiz to another device. Live room state is stored in D1, so players on separate devices share the same room.

## Self-host on Cloudflare

Hosting is independent of the application license. Your infrastructure provider may charge for usage.

1. Run `npm ci` and sign in with `npx wrangler login`.
2. Create a database with `npx wrangler d1 create openquiz` and keep the returned database ID.
3. Run `npm run build`.
4. Copy `dist/server/wrangler.json` to `dist/server/wrangler.deploy.json`. Set its `name` to a unique Worker name, `d1_databases[0].database_id` to your real ID, and `d1_databases[0].database_name` to `openquiz`. Preserve the entrypoint, assets, compatibility flags, and binding `DB`.
5. Apply the SQL in `drizzle/` to that database using `npx wrangler d1 execute openquiz --remote --config dist/server/wrangler.deploy.json --file drizzle/<migration>.sql`.
6. Deploy with `npx wrangler deploy --config dist/server/wrangler.deploy.json`.

The `.openai/hosting.json` file declares `DB` for the optional Sites deployment workflow. A public source distribution does not contain the original hosted Site identity. No GitHub, OpenAI, or third-party connector is required to play.

## Tests

```sh
npm test
npx tsc --noEmit
npm run build
```

Game tests cover a complete two-player round, score calculation, hidden correct answers, unauthorized host actions, duplicate answers, invalid inputs, and late submissions.

## Architecture and limits

The single `/api/game` endpoint uses D1 compare-and-swap updates to prevent concurrent joins or answers from overwriting each other. Clients poll every 1.2 seconds; round timing and points use server time. Correct answers and current-round points are withheld until reveal. Host and player tokens are random bearer credentials, sent in an Authorization header for reads and a JSON body for actions. Do not share a host tab/session.

This is an initial release, not feature parity with any commercial quiz platform. It supports up to 50 questions and a hard cap of 200 players per room; that cap is not a load-tested capacity guarantee. There is no moderation, account-based quiz sync, image-question upload, or analytics dashboard. Public deployments should add provider-level rate limits before heavy or untrusted traffic. D1 writes serialize per room; for large events, consider Durable Objects/WebSockets. Active games expire after 24 hours, and closing a host tab loses its session credentials. Early reveal is controlled by the host.

## Contributing

Open an issue or submit a pull request. Keep server-side validation and answer secrecy intact, add tests for gameplay changes, and check the phone and projector layouts. Never commit credentials, database state, or environment files.

## License

MIT; see [LICENSE](LICENSE). Dependencies retain their respective licenses. Mahoot is an independent implementation and is not affiliated with Kahoot. It does not use Kahoot code, branding, or assets.

## AWS meetup quiz and QR codes

The home page features an eight-question AWS introduction based on Muz’s meetup questions. Choose **Preview on big screen** to rehearse without players, use **Reveal answer** and **Next question**, and select the full-screen icon for a projector. The stable `/?quiz=aws` URL opens this preview. **Edit questions** lets you customize the quiz, photo URLs, and explanations before saving and hosting.

**Website QR** downloads a PNG pointing at the current website origin; it stays valid while the hostname stays the same. Each host lobby also generates a separate QR code containing the active room’s join link. Game rooms expire after 24 hours, so do not print a room QR for a future session.

Question explanations cite official AWS pages where applicable. The Builder ID question is the organizer’s group-specific instruction. Illustrative infrastructure photographs do not claim to depict AWS facilities. Photograph rights remain with their original owners; the MIT license covers the application code.

## Animated round flow

Live games now follow **question → answer reveal → leaderboard → next question**. After the host clicks **Reveal answer** (or the timer expires), the correct answer appears for three seconds, then everyone automatically moves to the leaderboard. The host chooses **Next question** when everyone is ready. The leaderboard occupies its own `/leaderboard` page; host and player screens follow the server phase together. Refreshing this page restores the same tab’s session. The last reveal opens the final podium instead.

The scoreboard includes animated score totals, a top-three podium, rank gains, streak badges, icon avatars, and a brief confetti burst. Tied scores share ranks. Streaks are visual encouragement and do not change the scoring formula. Question cards, answer locking, and correct-answer feedback have animations. Reduced-motion preferences disable decorative motion and score counting.

Visit `/leaderboard?demo=leaderboard` for a clearly labeled demo with sample players, or choose **Preview leaderboard** on the homepage. Live scoreboards never use demo scores.
