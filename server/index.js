// 1. IMPORT LIBRARIES
require('dotenv').config(); // Loads .env file contents into process.env
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const stream = require('stream');
const { OpenAI } = require('openai');
const admin = require('firebase-admin');

// 2. INITIALIZE SERVICES
const app = express();
const PORT = 3001;

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// 3. APPLY MIDDLEWARE
app.use(cors());
app.use(express.json());

// Configure Multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Custom Middleware to decode Firebase ID Token
async function decodeIDToken(req, res, next) {
    // Check for Authorization header
    if (req.headers?.authorization?.startsWith('Bearer ')) {
        const idToken = req.headers.authorization.split('Bearer ')[1];
        try {
            // Verify token using Firebase Admin SDK
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            req['currentUser'] = decodedToken; // Attach user info to the request
        } catch (err) {
            console.log("Token verification failed:", err.message);
        }
    }
    next(); // Continue to the next middleware or route handler
}
// Apply the middleware to all routes
app.use(decodeIDToken);


// 4. DEFINE CORE LOGIC
/**
 * Rule-Based Scoring Function
 * Calculates a 'Green Score' based on keywords in the product name.
 */
function calculateGreenScore(item) {
    if (!item || !item.product) {
        return 0;
    }
    let score = 50;
    const productName = item.product.toLowerCase();

    if (productName.includes('recycled')) score += 20;
    if (productName.includes('compostable')) score += 20;
    if (productName.includes('organic')) score += 15;
    if (productName.includes('reusable')) score += 15;
    if (productName.includes('led')) score += 10;
    if (productName.includes('local')) score += 10;

    if (productName.includes('plastic') && !productName.includes('reusable')) score -= 30;
    if (productName.includes('disposable')) score -= 25;
    if (productName.includes('single-use')) score -= 30;

    return Math.max(0, Math.min(100, score));
}

// 5. DEFINE API ROUTES

/**
 * ROUTE: POST /api/upload
 * - Requires authentication.
 * - Processes uploaded CSV.
 * - Gets AI-powered insights.
 * - Saves the result to Firestore.
 * - Returns the full analysis.
 */
app.post('/api/upload', upload.single('file'), async (req, res) => {
    // A. Authentication Check
    if (!req.currentUser) {
        return res.status(401).json({ error: "Unauthorized. You must be logged in to upload." });
    }
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const results = [];
    const bufferStream = stream.Readable.from(req.file.buffer);

    // B. CSV Processing
    bufferStream
        .pipe(csv({ mapHeaders: ({ header }) => header.toLowerCase() }))
        .on('data', (data) => {
            const score = calculateGreenScore(data);
            results.push({ ...data, greenScore: score });
        })
        .on('end', async () => {
            try {
                // C. AI-Powered Analysis
                const summaryPrompt = `Based on this list of purchased items: ${JSON.stringify(results.map(i => i.product))}, write a 2-3 sentence summary of the environmental impact.`;
                const summaryCompletion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: summaryPrompt }],
                    max_tokens: 100,
                });
                const summary = summaryCompletion.choices[0].message.content.trim();

                const lowScoringItems = results.filter(item => item.greenScore < 40);
                await Promise.all(lowScoringItems.map(async (item) => {
                    const alternativePrompt = `Suggest one greener, sustainable alternative for "${item.product}" that is commonly available in India.`;
                    const altCompletion = await openai.chat.completions.create({
                        model: "gpt-3.5-turbo",
                        messages: [{ role: "user", content: alternativePrompt }],
                        max_tokens: 60,
                    });
                    item.suggestion = altCompletion.choices[0].message.content.trim();
                }));

                const totalScore = results.reduce((acc, item) => acc + item.greenScore, 0);
                const averageScore = results.length > 0 ? Math.round(totalScore / results.length) : 0;

                const finalResult = {
                    fileName: req.file.originalname,
                    averageScore: averageScore,
                    summary: summary,
                    items: results,
                };

                // D. Save to Firestore
                await db.collection('analyses').add({
                    ...finalResult,
                    userId: req.currentUser.uid,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });

                console.log(`Analysis for user ${req.currentUser.uid} saved successfully.`);
                res.json(finalResult);

            } catch (aiError) {
                console.error("Error during AI processing or DB save:", aiError);
                res.status(500).json({ error: 'Failed to get AI insights or save data.' });
            }
        })
        .on('error', (error) => {
            console.error('Error parsing CSV:', error);
            res.status(500).json({ error: 'Failed to process CSV file.' });
        });
});

/**
 * ROUTE: GET /api/history
 * - Requires authentication.
 * - Fetches all past analyses for the logged-in user from Firestore.
 */
app.get('/api/history', async (req, res) => {
    if (!req.currentUser) {
        return res.status(401).json({ error: "Unauthorized. You must be logged in to view history." });
    }

    try {
        const snapshot = await db.collection('analyses')
            .where('userId', '==', req.currentUser.uid)
            .orderBy('createdAt', 'desc')
            .get();

        if (snapshot.empty) {
            return res.json([]);
        }

        const history = snapshot.docs.map(doc => {
            const data = doc.data();
            // Ensure createdAt is serializable
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt.toDate().toISOString() // Convert timestamp to string
            };
        });
        
        res.json(history);

    } catch (dbError) {
        console.error("Error fetching history:", dbError);
        res.status(500).json({ error: "Failed to fetch analysis history." });
    }
});


// 6. START THE SERVER
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// 1. IMPORT LIBRARIES
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const multer = require('multer');
// const csv = require('csv-parser');
// const stream = require('stream');
// const admin = require('firebase-admin');
// // --- NEW: Import Google Generative AI ---
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// // 2. INITIALIZE SERVICES (Now with Google Gemini)
// const app = express();
// const PORT = 3001;

// // --- NEW: Initialize Google Gemini ---
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

// // Initialize Firebase Admin SDK
// const serviceAccount = require('./serviceAccountKey.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });
// const db = admin.firestore();

// // ... (The middleware, calculateGreenScore function, etc. all remain exactly the same) ...
// // 3. APPLY MIDDLEWARE
// app.use(cors());
// app.use(express.json());
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
// async function decodeIDToken(req, res, next) {
//     if (req.headers?.authorization?.startsWith('Bearer ')) {
//         const idToken = req.headers.authorization.split('Bearer ')[1];
//         try {
//             const decodedToken = await admin.auth().verifyIdToken(idToken);
//             req['currentUser'] = decodedToken;
//         } catch (err) {
//             console.log("Token verification failed:", err.message);
//         }
//     }
//     next();
// }
// app.use(decodeIDToken);

// // 4. DEFINE CORE LOGIC
// function calculateGreenScore(item) {
//     if (!item || !item.product) { return 0; }
//     let score = 50;
//     const productName = item.product.toLowerCase();
//     if (productName.includes('recycled')) score += 20;
//     if (productName.includes('compostable')) score += 20;
//     if (productName.includes('organic')) score += 15;
//     if (productName.includes('reusable')) score += 15;
//     if (productName.includes('led')) score += 10;
//     if (productName.includes('local')) score += 10;
//     if (productName.includes('plastic') && !productName.includes('reusable')) score -= 30;
//     if (productName.includes('disposable')) score -= 25;
//     if (productName.includes('single-use')) score -= 30;
//     return Math.max(0, Math.min(100, score));
// }

// // 5. DEFINE API ROUTES
// app.post('/api/upload', upload.single('file'), async (req, res) => {
//     if (!req.currentUser) { return res.status(401).json({ error: "Unauthorized." }); }
//     if (!req.file) { return res.status(400).json({ error: 'No file uploaded.' }); }

//     const results = [];
//     const bufferStream = stream.Readable.from(req.file.buffer);

//     bufferStream
//         .pipe(csv({ mapHeaders: ({ header }) => header.toLowerCase() }))
//         .on('data', (data) => {
//             const score = calculateGreenScore(data);
//             results.push({ ...data, greenScore: score });
//         })
//         .on('end', async () => {
//             try {
//                 // --- NEW: AI Analysis using Google Gemini ---
//                 const summaryPrompt = `Based on this list of purchased items: ${JSON.stringify(results.map(i => i.product))}, write a 2-3 sentence summary of the environmental impact.`;
//                 const summaryResult = await geminiModel.generateContent(summaryPrompt);
//                 const summary = summaryResult.response.text();

//                 const lowScoringItems = results.filter(item => item.greenScore < 40);
//                 await Promise.all(lowScoringItems.map(async (item) => {
//                     const alternativePrompt = `Suggest one greener, sustainable alternative for "${item.product}" that is commonly available in India.`;
//                     const altResult = await geminiModel.generateContent(alternativePrompt);
//                     item.suggestion = altResult.response.text();
//                 }));
//                 // --- END of Gemini AI Logic ---

//                 const totalScore = results.reduce((acc, item) => acc + item.greenScore, 0);
//                 const averageScore = results.length > 0 ? Math.round(totalScore / results.length) : 0;

//                 const finalResult = {
//                     fileName: req.file.originalname,
//                     averageScore: averageScore,
//                     summary: summary,
//                     items: results,
//                 };

//                 await db.collection('analyses').add({
//                     ...finalResult,
//                     userId: req.currentUser.uid,
//                     createdAt: admin.firestore.FieldValue.serverTimestamp()
//                 });

//                 console.log(`Analysis for user ${req.currentUser.uid} saved successfully.`);
//                 res.json(finalResult);

//             } catch (error) {
//                 console.error("Error during AI processing or DB save:", error);
//                 res.status(500).json({ error: 'Failed to get AI insights or save data.' });
//             }
//         })
//         .on('error', (error) => {
//             console.error('Error parsing CSV:', error);
//             res.status(500).json({ error: 'Failed to process CSV file.' });
//         });
// });

// app.get('/api/history', async (req, res) => {
//     if (!req.currentUser) { return res.status(401).json({ error: "Unauthorized." }); }
//     try {
//         const snapshot = await db.collection('analyses')
//             .where('userId', '==', req.currentUser.uid)
//             .orderBy('createdAt', 'desc')
//             .get();
//         if (snapshot.empty) { return res.json([]); }
//         const history = snapshot.docs.map(doc => {
//             const data = doc.data();
//             return {
//                 id: doc.id, ...data,
//                 createdAt: data.createdAt.toDate().toISOString()
//             };
//         });
//         res.json(history);
//     } catch (dbError) {
//         console.error("Error fetching history:", dbError);
//         res.status(500).json({ error: "Failed to fetch analysis history." });
//     }
// });

// // 6. START THE SERVER
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });