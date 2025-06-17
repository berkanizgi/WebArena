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
                backgroundImage: 'url("/lobby/Lobby_Frame.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontFamily: '"Bangers", cursive',
            }}
        >
            <div
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: '2rem',
                    borderRadius: '16px',
                    width: '360px',
                    color: '#fff',
                    boxShadow: '0 0 20px rgba(0,0,0,0.6)',
                    border: '2px solid #fff',
                    backdropFilter: 'blur(6px)',
                }}
            >
                <h1
                    style={{
                        fontSize: '2.8rem',
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
                            color: '#ff4d4f',
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
                    style={inputStyle}
                />
                <input
                    type="password"
                    placeholder="Passwort"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                />
                <button
                    onClick={handleLogin}
                    style={buttonStyle}
                    onMouseOver={(e) =>
                        ((e.target as HTMLButtonElement).style.backgroundColor = '#1a80d0')
                    }
                    onMouseOut={(e) =>
                        ((e.target as HTMLButtonElement).style.backgroundColor = '#2196F3')
                    }
                >
                    Login
                </button>
            </div>
        </div>
    );
}

const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    borderRadius: '8px',
    border: '1px solid #aaa',
    backgroundColor: '#222',
    color: '#fff',
    fontSize: '1rem',
    fontFamily: 'monospace',
};

const buttonStyle = {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontFamily: '"Luckiest Guy", cursive',
    cursor: 'pointer',
    fontSize: '1.1rem',
    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
    transition: 'background-color 0.2s',
};
