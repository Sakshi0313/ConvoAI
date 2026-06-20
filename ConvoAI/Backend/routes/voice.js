import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Speech-to-Text: accepts audio blob, returns transcript
router.post("/transcribe", authMiddleware, upload.single("audio"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
    }

    try {
        const formData = new FormData();
        const blob = new Blob([req.file.buffer], { type: req.file.mimetype || "audio/webm" });
        formData.append("file", blob, "audio.webm");
        formData.append("model", "whisper-1");

        const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: formData
        });

        const data = await response.json();
        if (!response.ok) {
            return res.status(500).json({ error: data.error?.message || "Transcription failed" });
        }

        res.json({ text: data.text });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Transcription failed" });
    }
});

// Text-to-Speech: accepts text, returns audio stream
router.post("/speak", authMiddleware, async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: "Text is required" });
    }

    try {
        const response = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "tts-1",
                input: text,
                voice: "alloy",
                response_format: "mp3"
            })
        });

        if (!response.ok) {
            const err = await response.json();
            return res.status(500).json({ error: err.error?.message || "TTS failed" });
        }

        res.setHeader("Content-Type", "audio/mpeg");
        const arrayBuffer = await response.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Text-to-speech failed" });
    }
});

export default router;
