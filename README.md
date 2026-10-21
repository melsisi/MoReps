# MoReps

**One Mo rep.**

A mobile-first personal training app built for a FitRx 60 lb set, neighborhood rings and bars, a pool, and Tuesday volleyball. No build step, runtime dependencies, external fonts, analytics, or paid services.

## Use locally

Requires Node.js 22 or newer:

```sh
npm start
```

Open http://localhost:4173. To test on a phone on the same Wi-Fi, open `http://YOUR_COMPUTER_LAN_IP:4173`. The server listens on all local network interfaces. Offline installation requires HTTPS (or localhost), so use the published GitHub Pages URL for home-screen installation.

```sh
npm test
```

## Publish for free on GitHub Pages

1. Put this folder’s contents in a GitHub repository on the `main` branch.
2. In the repository, choose **Settings → Pages → Source → GitHub Actions**.
3. Push to `main`, or run **Publish MoReps to GitHub Pages** from the Actions tab.
4. Open `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/` on your phone.
5. On iPhone, open in Safari and choose **Share → Add to Home Screen**.

The included workflow runs the data tests and publishes only the app files. All asset paths are relative, so a repository subpath works. No token belongs in the source. On GitHub Free, Pages uses a public source repository. The program is in `data.mjs`. Age, height, body weight, and personal activity logs are not bundled into the public app; enter weight on your device or import your existing backup.

## What works

- Responsive dashboard and weekly schedule, with three strength sessions, Tuesday volleyball, pool conditioning, and recovery.
- Original animated SVG joint diagrams for all 15 prescribed movements; individual cues, pause/play, and reduced-motion support. These are illustrative movement guides, not motion capture or form assessments.
- Guided workouts: manual reps/seconds and load entry, each-side reminders, set checkmarks, two-minute rest timers, extra rest, undo, skip, partial-session saves, and reload-safe resume.
- Local progression: two sets in weeks 1–2 and planned volume from week 3. Rep ranges and instructions explain when to add resistance. Workloads are not medically assessed or automatically personalized from wearable data.
- XP, levels, earned milestones, actual activity-minute charts, XP history, session journal, weight tracking, and protein logs.
- Recovery gets credit. No punishment streak, weight-gain XP, maximum-heart-rate challenge, or reward for overfilling the protein goal.
- Data export/import with review before replacement. Offline shell with a service worker and installable manifest.

## Data and boundaries

Progress is stored under the original `kinetic.v1` key in this browser’s localStorage so the MoReps rename preserves existing logs and rewards. Backups exported before the rename remain compatible. It is not uploaded, synced, or shared. Changing origin, browser, or phone creates a separate data store. Clearing site data removes progress, so export backups. Restore replaces the device’s current data; it does not merge it. XP is derived from saved logs. Deleting a food entry does not revoke a protein reward already earned that day, and adding it again cannot award a second bonus.

The public site has no login or backend. There is no Apple Watch / HealthKit integration. Charts start with zero recorded activity and no assumed body weight. An existing baseline from a local backup is preserved. No sample workouts are mixed into actual progress.

Exercise load fields mean the label shown (usually per dumbbell). Row repetitions are per side; split-squat repetitions are per leg. Training-load totals count paired dumbbells and sides and exclude unloaded/bodyweight moves. They are an equipment-volume metric, not a measurement of muscle gain or exercise quality. Session minutes are elapsed time, including rest.

After changing offline assets, increment the cache version in `sw.js` before publishing. The service worker uses network-first requests with an offline cache fallback. Rest countdowns use absolute timestamps; sounds may be silenced or delayed if iOS suspends the browser. Timers do not send notifications while the app is closed.

Training sources are linked in **Your setup → Program notes & sources**. A first 8-week block is a starting program, to be refined from actual recovery and performance.
