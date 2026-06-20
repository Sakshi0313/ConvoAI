import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";

function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
        const body = isLogin
            ? { email: form.email, password: form.password }
            : { username: form.username, email: form.email, password: form.password };

        try {
            const res = await fetch(`http://localhost:8080${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong");
            } else {
                login(data.token, data.username);
                navigate("/");
            }
        } catch (err) {
            setError("Network error. Is the server running?");
        }
        setLoading(false);
    };

    return (
        <div className="authPage">
            <div className="authCard">
                <img src="src/assets/blacklogo.png" alt="logo" className="authLogo" />
                <h2>ConvoAI</h2>
                <div className="authTabs">
                    <button
                        className={isLogin ? "activeTab" : ""}
                        onClick={() => { setIsLogin(true); setError(""); }}
                    >Login</button>
                    <button
                        className={!isLogin ? "activeTab" : ""}
                        onClick={() => { setIsLogin(false); setError(""); }}
                    >Register</button>
                </div>

                <form onSubmit={handleSubmit} className="authForm">
                    {!isLogin && (
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={form.username}
                            onChange={handleChange}
                            required
                        />
                    )}
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                    {error && <p className="authError">{error}</p>}
                    <button type="submit" className="submitBtn" disabled={loading}>
                        {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AuthPage;
