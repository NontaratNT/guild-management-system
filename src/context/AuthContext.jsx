import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = (username, password) => {
        // Mock authentication
        if (username && password) {
            const mockUser = {
                username,
                role: 'หัวกิล',
                guild: 'Yukisama',
                joinedAt: '2024-01-01'
            };
            setUser(mockUser);
            localStorage.setItem('guild_user', JSON.stringify(mockUser));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('guild_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
