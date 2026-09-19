const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      "Transcribe all handwriting from this image accurately into editable text. Maintain the original layout and line breaks exactly.",
      {
        inlineData: {
          data: cleanBase64,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const response = await result.response;
    res.json({ text: response.text() });
  } catch (err) {
    console.error("OCR Error:", err);
    res.status(500).json({ error: err.message || "Failed to transcribe" });
  }
});

app.listen(port, () => {
  console.log(`OCR Server live on port ${port}`);
});
