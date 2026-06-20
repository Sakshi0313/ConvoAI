import "./Chat.css";
import React, { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "./MyContext";
import { useAuth } from "./AuthContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function SpeakButton({ text }) {
    const { token } = useAuth();
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef(null);

    const handleSpeak = async () => {
        if (playing) {
            audioRef.current?.pause();
            setPlaying(false);
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/api/voice/speak", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ text })
            });

            if (!res.ok) return;

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audioRef.current = audio;
            setPlaying(true);
            audio.play();
            audio.onended = () => setPlaying(false);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <button className={`speakBtn ${playing ? "playing" : ""}`} onClick={handleSpeak} title={playing ? "Stop" : "Read aloud"}>
            <i className={`fa-solid ${playing ? "fa-stop" : "fa-volume-high"}`}></i>
            {playing ? "Stop" : "Read aloud"}
        </button>
    );
}

function Chat() {
    const { newChat, prevChats, reply } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);

    useEffect(() => {
        if (reply === null) {
            setLatestReply(null);
            return;
        }
        if (!prevChats?.length) return;

        const words = reply.split(" ");
        let idx = 0;
        const interval = setInterval(() => {
            setLatestReply(words.slice(0, idx + 1).join(" "));
            idx++;
            if (idx >= words.length) clearInterval(interval);
        }, 40);

        return () => clearInterval(interval);
    }, [prevChats, reply]);

    return (
        <>
            {newChat && <h2 className="newChatMsg">How can I help you today?</h2>}
            <div className="chats">
                {prevChats?.slice(0, -1).map((chat, idx) => (
                    <div className={chat.role === "user" ? "userDiv" : "gptDiv"} key={idx}>
                        {chat.role === "user" ? (
                            <p className="userMessage">{chat.content}</p>
                        ) : (
                            <div>
                                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{chat.content}</ReactMarkdown>
                                <SpeakButton text={chat.content} />
                            </div>
                        )}
                    </div>
                ))}

                {prevChats.length > 0 && (
                    <div className="gptDiv">
                        {latestReply === null ? (
                            <div>
                                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                    {prevChats[prevChats.length - 1].content}
                                </ReactMarkdown>
                                <SpeakButton text={prevChats[prevChats.length - 1].content} />
                            </div>
                        ) : (
                            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{latestReply}</ReactMarkdown>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

export default Chat;
