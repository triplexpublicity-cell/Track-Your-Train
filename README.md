# RailTrack India — RailRadar integration

## Deploy
1. Upload all files/folders to your GitHub repository.
2. In Vercel, import the repository.
3. Vercel Project → Settings → Environment Variables.
4. Add:
   - Key: `RAILRADAR_API_KEY`
   - Value: your RailRadar API key
   - Enable Production, Preview and Development.
5. Redeploy.

The API key is used only by Vercel serverless functions and is not placed in `index.html`.

## Included
- Train number/name autocomplete
- RailRadar live train status
- Live route/station list
- Route map using station GPS coordinates returned by RailRadar
- Train marker interpolated using `segmentProgress`
- Speed, delay and last update
- 60-second auto refresh
- PNR endpoint proxy
- UI inspired by the supplied screenshots

RailRadar live endpoint supports `geometry=true` and `includeCoordinates=true`, and returns route stations plus current location/segment progress.
