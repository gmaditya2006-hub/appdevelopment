const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname)));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'WasteWise backend is running',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/classify-waste', async (req, res) => {
  const { image } = req.body || {};

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: 'OPENAI_API_KEY is not configured on the server.' });
  }
  if (typeof image !== 'string' || !/^data:image\/(jpeg|jpg|png|webp);base64,/.test(image)) {
    return res.status(400).json({ error: 'A base64 JPEG, PNG, or WebP image is required.' });
  }

  const prompt = `You are an AI Waste Classification Assistant. Inspect only objects visibly present in the image.
Classify every visible waste item into exactly one category: Wet/Organic Waste, Dry/Recyclable Waste, E-Waste, or Hazardous Waste.
Prioritize Hazardous Waste when an item contains hazardous chemicals or substances. If the image is unclear, return an empty items array and the message "Unable to identify confidently". Never guess.
Return only valid JSON in this shape: {"items":[{"item_name":"string","category":"Wet/Organic Waste | Dry/Recyclable Waste | E-Waste | Hazardous Waste","confidence":0,"reason":"string","disposal":"string"}],"message":"optional string"}.
Use safe disposal advice, especially for hazardous items.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: [{ type: 'text', text: 'Analyze this waste image.' }, { type: 'image_url', image_url: { url: image } }] }
        ]
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      return res.status(502).json({ error: payload.error?.message || 'Vision API request failed.' });
    }

    const result = JSON.parse(payload.choices?.[0]?.message?.content || '{}');
    return res.json(result);
  } catch (error) {
    return res.status(502).json({ error: `Waste classification failed: ${error.message}` });
  }
});

app.get('/api/waste-guide/:type?', (req, res) => {
  const type = (req.params.type || '').toLowerCase();
  const guides = {
    organic: {
      category: 'Organic Waste',
      advice: 'Compost food scraps and biodegradable materials in a local compost or green bin.',
      points: 10
    },
    recyclable: {
      category: 'Recyclable Waste',
      advice: 'Clean and dry recyclable items before placing them in the proper collection stream.',
      points: 12
    },
    'e-waste': {
      category: 'E-Waste',
      advice: 'Take electronic items to an approved e-waste collection service or repair center.',
      points: 15
    },
    hazardous: {
      category: 'Hazardous Waste',
      advice: 'Dispose of batteries, chemicals, and paint safely at authorized hazardous waste centers.',
      points: 20
    }
  };

  const result = guides[type] || {
    category: 'General Waste',
    advice: 'Sort the item carefully and check the nearest disposal center for the right treatment route.',
    points: 8
  };

  res.json({
    itemType: type || 'general',
    ...result
  });
});

app.get('/api/centers', (req, res) => {
  const { type = 'recyclable', city = 'Bangalore' } = req.query;

  const centers = [
    {
      name: 'Green Recycling Center',
      distance: '1.8 km away',
      accepts: ['Paper', 'Plastic', 'Glass'],
      rating: 4.6,
      type: 'recyclable'
    },
    {
      name: 'Eco Waste Hub',
      distance: '3.4 km away',
      accepts: ['Organic', 'Compostable'],
      rating: 4.8,
      type: 'organic'
    },
    {
      name: 'Safe E-Waste Point',
      distance: '2.1 km away',
      accepts: ['Phones', 'Chargers', 'Laptops'],
      rating: 4.7,
      type: 'e-waste'
    }
  ];

  const filtered = centers.filter((center) => center.type === type.toLowerCase() || type === 'all');

  res.json({
    city,
    type,
    results: filtered.length ? filtered : centers
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`WasteWise server running on http://localhost:${PORT}`);
});
