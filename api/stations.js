export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        success: false,
        data: [],
        error: "Method not allowed"
      });
    }

    const q = String(req.query.q || "").trim();

    if (q.length < 2) {
      return res.status(400).json({
        success: false,
        data: [],
        error: "Search query must contain at least 2 characters"
      });
    }

    const apiKey = process.env.RAILRADAR_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        data: [],
        error: "RAILRADAR_API_KEY is not configured"
      });
    }

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json"
    };

    const normalize = (value) =>
      String(value || "")
        .toUpperCase()
        .replace(/[.\-_,/]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const query = normalize(q);

    // --------------------------------------------------
    // 1. SEARCH STATIONS
    // --------------------------------------------------

    const searchUrl =
      "https://api.railradar.in/v1/lookup/search/stations" +
      "?q=" +
      encodeURIComponent(q) +
      "&limit=50";

    const searchResponse = await fetch(searchUrl, {
      method: "GET",
      headers
    });

    const searchResult = await searchResponse.json();

    if (!searchResponse.ok) {
      return res.status(searchResponse.status).json({
        success: false,
        data: [],
        error:
          searchResult?.error?.message ||
          `RailRadar station search failed`
      });
    }

    const rawStations = Array.isArray(searchResult?.data)
      ? searchResult.data
      : [];

    // --------------------------------------------------
    // 2. GET NTES VALID STATION DIRECTORY
    // --------------------------------------------------

    const ntesUrl =
      "https://api.railradar.in/v1/lookup/stations/ntes";

    const ntesResponse = await fetch(ntesUrl, {
      method: "GET",
      headers
    });

    const ntesResult = await ntesResponse.json();

    if (!ntesResponse.ok) {
      return res.status(ntesResponse.status).json({
        success: false,
        data: [],
        error:
          ntesResult?.error?.message ||
          `NTES station directory failed`
      });
    }

    const ntesStations =
      ntesResult?.data &&
      typeof ntesResult.data === "object"
        ? ntesResult.data
        : {};

    // --------------------------------------------------
    // 3. ONLY VALID NTES STATION CODES
    // --------------------------------------------------

    const validCodes = new Set(
      Object.keys(ntesStations)
        .map((code) => String(code).trim().toUpperCase())
        .filter((code) => /^[A-Z]{1,10}$/.test(code))
    );

    // --------------------------------------------------
    // 4. RESOLVE SEARCH RESULT TO REAL CODE
    // --------------------------------------------------

    const stations = rawStations
      .map((station) => {
        const apiCode = String(
          station?.code ||
          station?.stationCode ||
          station?.station_code ||
          ""
        )
          .trim()
          .toUpperCase();

        const apiName = String(
          station?.name ||
          station?.stationName ||
          station?.station_name ||
          ""
        ).trim();

        const apiCity = String(
          station?.city ||
          station?.cityName ||
          ""
        ).trim();

        if (!apiName && !apiCode) {
          return null;
        }

        let realCode = null;
        let realName = apiName;

        // ----------------------------------------------
        // A. If API gives a valid NTES code, use it
        // ----------------------------------------------

        if (validCodes.has(apiCode)) {
          realCode = apiCode;

          realName =
            String(ntesStations[apiCode] || apiName).trim();
        }

        // ----------------------------------------------
        // B. If API gave an invalid code such as
        //    "GONDIA JN", resolve by exact station name
        // ----------------------------------------------

        if (!realCode && apiName) {
          const normalizedName = normalize(apiName);

          for (const code of validCodes) {
            const directoryName = String(
              ntesStations[code] || ""
            ).trim();

            if (
              normalize(directoryName) === normalizedName
            ) {
              realCode = code;
              realName = directoryName;
              break;
            }
          }
        }

        // ----------------------------------------------
        // C. If still unresolved, discard it.
        //    Never send an invalid station code.
        // ----------------------------------------------

        if (!realCode) {
          return null;
        }

        return {
          code: realCode,
          name: realName,
          city: apiCity
        };
      })
      .filter(Boolean);

    // --------------------------------------------------
    // 5. KEEP ONLY RELEVANT SEARCH RESULTS
    // --------------------------------------------------

    const relevant = stations.filter((station) => {
      const name = normalize(station.name);
      const city = normalize(station.city);
      const code = normalize(station.code);

      return (
        name.includes(query) ||
        city.includes(query) ||
        code === query ||
        code.includes(query)
      );
    });

    // --------------------------------------------------
    // 6. SORT BY RELEVANCE
    // --------------------------------------------------

    relevant.sort((a, b) => {
      const aName = normalize(a.name);
      const bName = normalize(b.name);

      const aCity = normalize(a.city);
      const bCity = normalize(b.city);

      // Exact station name first
      if (aName === query && bName !== query) return -1;
      if (bName === query && aName !== query) return 1;

      // City exact match next
      if (aCity === query && bCity !== query) return -1;
      if (bCity === query && aCity !== query) return 1;

      // Station name starting with query
      const aStarts = aName.startsWith(query);
      const bStarts = bName.startsWith(query);

      if (aStarts && !bStarts) return -1;
      if (bStarts && !aStarts) return 1;

      return aName.localeCompare(bName);
    });

    // --------------------------------------------------
    // 7. REMOVE DUPLICATE CODES
    // --------------------------------------------------

    const uniqueStations = [];

    const seen = new Set();

    for (const station of relevant) {
      if (seen.has(station.code)) {
        continue;
      }

      seen.add(station.code);

      uniqueStations.push({
        code: station.code,
        name: station.name
      });

      if (uniqueStations.length >= 10) {
        break;
      }
    }

    // --------------------------------------------------
    // 8. FINAL RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      data: uniqueStations
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      data: [],
      error: error?.message || "Internal server error"
    });
  }
}
