export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        success: false,
        error: "Method not allowed"
      });
    }

    const from = String(req.query.from || "").trim().toUpperCase();
    const to = String(req.query.to || "").trim().toUpperCase();
    const date = String(req.query.date || "").trim();

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        error: "From and To station codes are required"
      });
    }

    if (from === to) {
      return res.status(400).json({
        success: false,
        error: "From and To stations cannot be the same"
      });
    }

    const apiKey = process.env.RAILRADAR_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "RAILRADAR_API_KEY is not configured"
      });
    }

    const params = new URLSearchParams();

    if (date) {
      params.set("date", date);
    }

    params.set("live", "true");

    const url =
      `https://api.railradar.in/v1/trains/between/${encodeURIComponent(from)}/${encodeURIComponent(to)}` +
      `?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      }
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error:
          result?.error?.message ||
          `RailRadar returned HTTP ${response.status}`
      });
    }

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Internal server error"
    });
  }
}
