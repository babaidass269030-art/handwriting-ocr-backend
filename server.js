const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

app.get('/', (req, res) => {
  res.send("Handwriting OCR Server is Running!");
});

app.post('/api/ocr', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "No image provided" });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: "Transcribe all handwriting from this image accurately into editable text. Maintain the original layout and line breaks exactly." },
            { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } }
          ]
        }
      ]
    });

    res.json({ text: response.text });
  } catch (err) {
    console.error("OCR Error:", err);
    res.status(500).json({ error: err.message || "Failed to transcribe" });
  }
});

app.listen(port, () => {
  console.log(`OCR Server live on port ${port}`);
});
