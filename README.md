# AI Chatbot Web Interface

A simple, elegant web UI for interacting with an AI-powered chatbot. This project includes a responsive HTML/CSS/JavaScript frontend and expects a compatible backend API for chat responses.
  
---
                  
## 🚀 Features
      
- **Modern Chat UI**: Clean, mobile-friendly design with clear user/bot message distinction   
- **Async Messaging**: Uses `fetch` API for smooth, real-time communication  
- **Easy Integration**: Connects to any backend responding at `/api/chat`. 
- **Error Handling**: Gracefully reports API/network errors.  
- **Lightweight**: All logic and styling in a single HTML file. 
    
---

## 🛠️ Getting Started 

### 1. Clone or Download
Save the `index.html` file from this repository.

### 2. Backend Requirements
You need a backend that accepts POST requests at `/api/chat` and returns AI-generated replies.

**Expected Request:**
```json
{
  "messages": [
    { "role": "user", "content": "Hello!" }
  ]
}
```

**Expected Response:**
```json
{
  "reply": "Hello! How can I assist you today?"
}
```

### 3. Run Locally

- **Option 1:** Serve with Python (static server):
  ```bash
  python3 -m http.server
  ```
- **Option 2:** Use any web server or integrate with your backend.

### 4. Open in Browser
Visit `http://localhost:8000` (or your server’s URL).

---

## 💡 Usage

1. Type your message in the input box.
2. Click **Send** or press **Enter**.
3. The bot responds instantly (if backend is working).

---

## 🧩 Customization

- **Styling:** Edit the `<style>` section for color, font, or layout changes.
- **Backend Endpoint:** Change the fetch URL in the JS if your backend uses a different path.
- **Message Format:** Adapt messages as needed for your backend logic.

---

## 🗂️ Project Structure

```
ai-chatbot/
  └── index.html        # Main web UI
  └── README.md         # Documentation
```

---

## ❓ Troubleshooting

- **No reply from bot:** Check backend is running and `/api/chat` endpoint is reachable.
- **Network errors:** Open browser dev tools for console logs.
- **API format mismatch:** Make sure backend returns `{ "reply": "..." }` in JSON.

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

---

## 👤 Author

Developed by [Your Name Here].  
Inspired by modern AI chatbot UIs.

---

## 🙏 Acknowledgements

- [OpenAI](https://openai.com/)
- Chatbot UI/UX inspirations from various open-source projects.

---

## ⚡ Demo

> Want a quick demo?  
> Just open `index.html` in your browser (with a running backend), and start chatting!
