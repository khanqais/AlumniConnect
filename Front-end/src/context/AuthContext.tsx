import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import axios from 'axios';

/* eslint-disable react-refresh/only-export-components */

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'alumni' | 'admin';
    token: string;
    isApproved?: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Initialize state from localStorage
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                return JSON.parse(storedUser);
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('user');
            }
        }
        return null;
    });
    
    const loading = false;

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
    };

    const updateUser = (userData: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    useEffect(() => {
        if (user?.token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
        }
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Export useAuth hook separately to satisfy Fast Refresh
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
