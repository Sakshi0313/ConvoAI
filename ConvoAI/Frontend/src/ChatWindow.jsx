import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useAuth } from "./AuthContext.jsx";
import { useTheme } from "./ThemeContext.jsx";
import { useContext, useState, useEffect, useRef } from "react";
import { ScaleLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

function ChatWindow() {
    const { prompt, setPrompt, reply, setReply, currThreadId, setPrevChats, setNewChat } = useContext(MyContext);
    const { token, username, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [recording, setRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const getReply = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setNewChat(false);

        try {
            const response = await fetch("http://localhost:8080/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ message: prompt, threadId: currThreadId })
            });
            const res = await response.json();
            setReply(res.reply);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (prompt && reply) {
            setPrevChats(prev => ([
                ...prev,
                { role: "user", content: prompt },
                { role: "assistant", content: reply }
            ]));
        }
        setPrompt("");
    }, [reply]);

    // Voice recording
    const toggleRecording = async () => {
        if (recording) {
            mediaRecorderRef.current?.stop();
            setRecording(false);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(t => t.stop());
                const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                const formData = new FormData();
                formData.append("audio", blob, "audio.webm");

                try {
                    const res = await fetch("http://localhost:8080/api/voice/transcribe", {
                        method: "POST",
                        headers: { "Authorization": `Bearer ${token}` },
                        body: formData
                    });
                    const data = await res.json();
                    if (data.text) setPrompt(data.text);
                } catch (err) {
                    console.log(err);
                }
            };

            mediaRecorder.start();
            setRecording(true);
        } catch (err) {
            alert("Microphone access denied.");
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/auth");
    };

    return (
        <div className="chatWindow">
            <div className="navbar">
                <span>ConvoAI <i className="fa-solid fa-chevron-down"></i></span>
                <div style={{ display: "flex", alignItems: "center" }} ref={dropdownRef}>
                    <span className="navUsername">{username}</span>
                    <div className="userIconDiv" onClick={() => setIsOpen(o => !o)}>
                        <span className="userIcon">
                            <i className="fa-solid fa-user"></i>
                        </span>
                    </div>
                    {isOpen && (
                        <div className="dropDown">
                            <div className="dropDownItem" onClick={() => { toggleTheme(); setIsOpen(false); }}>
                                <i className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}`}></i>
                                {theme === "dark" ? "Light mode" : "Dark mode"}
                            </div>
                            <div className="dropDownItem">
                                <i className="fa-solid fa-gear"></i> Settings
                            </div>
                            <div className="dropDownItem">
                                <i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan
                            </div>
                            <div className="dropDownItem danger" onClick={handleLogout}>
                                <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Chat />

            <ScaleLoader color="#339cff" loading={loading} />

            <div className="chatInput">
                <div className="inputBox">
                    <input
                        placeholder="Ask anything"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" ? getReply() : ""}
                    />
                    <div className="inputActions">
                        <button
                            className={`micBtn ${recording ? "recording" : ""}`}
                            onClick={toggleRecording}
                            title={recording ? "Stop recording" : "Voice input"}
                        >
                            <i className={`fa-solid ${recording ? "fa-stop" : "fa-microphone"}`}></i>
                        </button>
                        <div id="submit" onClick={getReply}>
                            <i className="fa-solid fa-paper-plane"></i>
                        </div>
                    </div>
                </div>
                <p className="info">ConvoAI can make mistakes. Check important info.</p>
            </div>
        </div>
    );
}

export default ChatWindow;
