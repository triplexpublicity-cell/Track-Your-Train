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

    const url =
      "https://api.railradar.in/v1/lookup/search/stations" +
      "?q=" +
      encodeURIComponent(q) +
      "&limit=10";

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json"
      }
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        data: [],
        error:
          result?.error?.message ||
          `RailRadar returned HTTP ${response.status}`
      });
    }

    const rawStations = Array.isArray(result?.data)
      ? result.data
      : [];

    const stations = rawStations
      .map((station) => ({
        code:
          station.code ||
          station.stationCode ||
          station.station_code ||
          "",
        name:
          station.name ||
          station.stationName ||
          station.station_name ||
          ""
      }))
      .filter(
        (station) =>
          station.code.length > 0 &&
          station.name.length > 0
      );

    return res.status(200).json({
      success: true,
      data: stations
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      data: [],
      error: error?.message || "Internal server error"
    });
  }
}
