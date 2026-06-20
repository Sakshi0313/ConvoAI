ConvoAI – AI-Powered Conversational Assistant

ConvoAI is a full-stack AI chatbot application built using the MERN stack and OpenAI APIs. The project allows users to create and manage multiple chat threads, interact with an AI assistant, and view conversation history through a clean and responsive interface.

This project was developed as a learning exercise to gain hands-on experience with full-stack web development, REST APIs, MongoDB, React Context API, and OpenAI integration.

🚀 Features
AI-powered conversations using OpenAI GPT-4o Mini
Multi-thread chat management
Persistent conversation history stored in MongoDB
Real-time AI response generation
Markdown rendering with syntax-highlighted code blocks
Typing animation effect for AI responses
Responsive and user-friendly chat interface
Create, switch, and delete chat threads
🛠️ Tech Stack
Frontend
React 19
Vite
React Context API
React Markdown
Rehype Highlight
React Spinners
Backend
Node.js
Express.js 5
Database
MongoDB
Mongoose
AI Integration
OpenAI API (GPT-4o Mini)
🏗️ Architecture
Frontend (React + Vite)
        │
        ▼
Backend (Express.js)
        │
        ▼
MongoDB Database
        │
        ▼
OpenAI API (GPT-4o Mini)
📂 API Endpoints
Method	Endpoint	Description
GET	/api/thread	Fetch all chat threads
GET	/api/thread/	Fetch messages from a specific thread
POST	/api/chat	Send a message and receive AI response
DELETE	/api/thread/	Delete a chat thread
POST	/api/test	Database testing route
✨ Key Functionalities
Chat Management
Create new conversation threads
Store chat history in MongoDB
Switch between existing conversations
Delete unwanted threads
AI Conversations
Send prompts to OpenAI GPT-4o Mini
Receive AI-generated responses
Render markdown content and code snippets
Syntax highlighting for programming responses
User Experience
Sidebar for conversation management
Loading indicators during API requests
Typing animation for AI responses
Clean and responsive UI
⚙️ Installation
Clone Repository
git clone https://github.com/Sakshi0313/ConvoAI.git
cd ConvoAI
Install Dependencies

Frontend

cd frontend
npm install

Backend

cd backend
npm install
Environment Variables

Create a .env file in the backend folder:

OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=your_mongodb_connection_string
PORT=8080
Run Application

Backend

npm start

Frontend

npm run dev
