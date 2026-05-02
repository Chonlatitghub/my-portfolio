// Vercel serverless function — proxies TikTok oEmbed to avoid browser CORS block
export default async function handler(req, res) {
  const { id, user = 'kumpoy.food' } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing video id' });
  }

  const oembedUrl =
    `https://www.tiktok.com/oembed?url=${encodeURIComponent(
      `https://www.tiktok.com/@${user}/video/${id}`
    )}`;

  try {
    const upstream = await fetch(oembedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'oEmbed fetch failed' });
    }

    const data = await upstream.json();

    // cache for 6 hours (thumbnail URLs are signed and expire)
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');

    return res.status(200).json({
      thumbnail_url: data.thumbnail_url || null,
      title: data.title || null
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
