export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        success: false,
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
      "?q=" + encodeURIComponent(q) +
      "&limit=10";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        data: [],
        error: data?.error?.message || "RailRadar station search failed"
      });
    }

    return res.status(200).json({
      success: true,
      data: (data.data || []).map((station) => ({
        code: station.code,
        name: station.name
      }))
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      data: [],
      error: error?.message || "Internal server error"
    });
  }
}
