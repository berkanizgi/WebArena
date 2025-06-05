'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        const res = await fetch('http://localhost:8081/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem('playerId', data.playerId);
            router.push('/lobby');
        } else {
            setError(data.message);
        }
    };

    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                backgroundColor: '#111',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <div
                style={{
                    width: '960px',
                    height: '640px',
                    backgroundImage: 'url("/lobby/Lobby_Frame.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    position: 'relative',
                    fontFamily: 'Bangers, cursive',
                }}
            >
                {/* Login-Fenster */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '46%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        padding: '2rem',
                        borderRadius: '16px',
                        width: '340px',
                        color: '#fff',
                        boxShadow: '0 0 20px rgba(0,0,0,0.6)',
                        border: '2px solid #fff',
                        backdropFilter: 'blur(4px)',
                    }}
                >
                    <h1
                        style={{
                            fontSize: '2.5rem',
                            marginBottom: '1.5rem',
                            textAlign: 'center',
                            fontFamily: '"Luckiest Guy", cursive',
                            color: '#fff',
                            textShadow: '2px 2px #000',
                        }}
                    >
                        Login
                    </h1>

                    {error && (
                        <p
                            style={{
                                color: '#f44336',
                                marginBottom: '1rem',
                                textAlign: 'center',
                                fontWeight: 'bold',
                            }}
                        >
                            {error}
                        </p>
                    )}

                    <input
                        type="text"
                        placeholder="Benutzername"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.6rem',
                            marginBottom: '1rem',
                            borderRadius: '8px',
                            border: '1px solid #888',
                            backgroundColor: '#f0f8ff',
                            fontFamily: 'monospace',
                        }}
                    />
                    <input
                        type="password"
                        placeholder="Passwort"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.6rem',
                            marginBottom: '1rem',
                            borderRadius: '8px',
                            border: '1px solid #888',
                            backgroundColor: '#f0f8ff',
                            fontFamily: 'monospace',
                        }}
                    />
                    <button
                        onClick={handleLogin}
                        style={{
                            width: '100%',
                            padding: '0.6rem',
                            backgroundColor: '#2196F3',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            fontFamily: '"Luckiest Guy", cursive',
                            cursor: 'pointer',
                        }}
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
}
