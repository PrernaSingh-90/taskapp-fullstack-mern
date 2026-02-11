 /* eslint-disable react-hooks/set-state-in-effect */
 /* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["x-auth-token"] = token;
            localStorage.setItem("token", token);
            setUser({ token }); 
        } else {
            delete axios.defaults.headers.common["x-auth-token"];
            localStorage.removeItem("token");
            setUser(null);
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
        setToken(res.data.token);
    };

    const register = async (name, email, password) => {
        const res = await axios.post("http://localhost:5000/api/auth/register", { name, email, password });
        setToken(res.data.token);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};