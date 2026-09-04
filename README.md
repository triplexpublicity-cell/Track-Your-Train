# Track Your Train — Mobile Live Tracking

## Included
- Firebase phone OTP login with local auth persistence
- Train number/name search
- From/To station search
- Trains between stations
- RailRadar live train data
- Speed, delay, current/next station and route
- Smooth moving train marker using live segment progress
- OpenStreetMap + satellite imagery toggle
- Optional passenger GPS contribution while the live train screen is open
- PNR section
- English-only UI

## Firebase setup
1. Create a Firebase Web App.
2. Enable Authentication -> Phone.
3. Allow India (+91) SMS region.
4. Add `track-your-train-alpha.vercel.app` under Authorized domains.
5. Enable Firestore Database.
6. Copy your Firebase Web config into `firebase-config.js`.
7. Publish `firestore.rules` in Firestore Rules.

## Vercel setup
Set Environment Variable:
`RAILRADAR_API_KEY`

Keep the RailRadar key server-side. Never put it in `index.html`.

## Important GPS note
Passenger GPS sharing requires the user to grant location permission. A mobile browser/PWA may not provide continuous background GPS after the app is closed or suspended. For reliable background tracking, package this project as a native Android app with a foreground location service.

The current Firestore rules intentionally keep each passenger's exact GPS private to that passenger. A production crowd-aggregation service should aggregate anonymous/coarse positions server-side before exposing any crowd signal to other users.
