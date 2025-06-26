'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isRegister, setIsRegister] = useState(false); // Neuer State für Modus
    const router = useRouter();
    const [popupMessage, setPopupMessage] = useState<string | null>(null);


    const handleLogin = async () => {
        const res = await fetch('http://localhost:8081/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });


        const data = await res.json();

        if (data.success) {
            sessionStorage.setItem('playerId', data.playerId);
            router.push('/lobby');
        } else {
            toast.error(data.message);
        }
    };

    const handleRegister = async () => {
        const res = await fetch('http://localhost:8081/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (data.success) {
            // ✅ Popup anzeigen
            toast.success('Successfully registered! Please Log in.');


            // ✅ zurück auf Login
            setIsRegister(false);
            setUsername('');
            setPassword('');
            setError('');
        } else {
            toast.error(data.message);
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
            <ToastContainer position="top-center" autoClose={3000} />

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
                    {isRegister ? 'Register' : 'Login'}
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
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={inputStyle}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                />
                <button
                    onClick={isRegister ? handleRegister : handleLogin}
                    style={buttonStyle}
                    onMouseOver={(e) =>
                        ((e.target as HTMLButtonElement).style.backgroundColor = '#1a80d0')
                    }
                    onMouseOut={(e) =>
                        ((e.target as HTMLButtonElement).style.backgroundColor = '#2196F3')
                    }
                >
                    {isRegister ? 'Register' : 'Login'}
                </button>

                {/* Umschalten zwischen Login / Register */}
                <p
                    style={{
                        marginTop: '1rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        color: '#aaa',
                        fontSize: '0.95rem',
                    }}
                    onClick={() => {
                        setIsRegister(!isRegister);
                        setError('');
                    }}
                >
                    {isRegister
                        ? 'Account already? Login Now!'
                        : 'No Account? Register Now!'}
                </p>
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
