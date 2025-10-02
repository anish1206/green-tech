# Green Procurement Advisor

A web application that helps organizations analyze procurement data for environmental sustainability. The app uses AI-powered analysis to evaluate procurement items and provide green scoring recommendations.

## Features

- **CSV File Upload**: Upload procurement data in CSV format
- **AI-Powered Analysis**: Uses OpenAI API to analyze procurement items
- **Green Scoring**: Rule-based heuristic scoring for environmental impact
- **Firebase Authentication**: Secure user authentication with Google
- **History Tracking**: View previous analysis results
- **Real-time Analysis**: Get instant feedback on procurement decisions

## Demo Video


https://github.com/user-attachments/assets/4c987dc1-a922-47c3-96d7-ceadd2b048fa



## Tech Stack

### Frontend
- React 19
- Vite
- Firebase Auth
- Axios
- Modern CSS

### Backend
- Node.js
- Express.js
- Firebase Admin SDK
- OpenAI API
- Multer for file uploads
- CSV Parser

## Project Structure

```
GreenProcurementAdvisor/
├── client-app/          # React frontend application
│   ├── src/
│   │   ├── App.jsx      # Main application component
│   │   ├── firebase.js  # Firebase configuration
│   │   └── ...
│   └── package.json
├── server/              # Node.js backend server
│   ├── index.js         # Main server file
│   ├── .env.example     # Environment variables template
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase project
- OpenAI API key

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your environment variables:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Add your Firebase service account key as `serviceAccountKey.json`

5. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the client-app directory:
   ```bash
   cd client-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update Firebase configuration in `src/firebase.js`

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Start both the backend server (port 3001) and frontend development server (port 5173)
2. Open your browser and navigate to `http://localhost:5173`
3. Sign in with Google authentication
4. Upload a CSV file with procurement data
5. View the analysis results and green scores
6. Check your analysis history

## CSV File Format

Your CSV file should include a column for product names (can be named "product", "Product", "item", or "Item"). The system will analyze these product names for environmental keywords.

Example:
```csv
product,quantity,price
Recycled A4 Paper,100,25.00
Disposable Plastic Cups,200,15.00
LED Light Bulbs,50,120.00
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Environment Variables

Make sure to set up the following environment variables:

### Server (.env)
- `OPENAI_API_KEY`: Your OpenAI API key

### Firebase Configuration
- Update the Firebase configuration in `client-app/src/firebase.js` with your project details
- Add your Firebase service account key as `server/serviceAccountKey.json`

## Security Notes

- Never commit sensitive files like `.env` or `serviceAccountKey.json`
- These files are already included in `.gitignore`
- Make sure to configure your Firebase security rules appropriately
