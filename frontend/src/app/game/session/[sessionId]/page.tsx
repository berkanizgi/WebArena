export default function GameSessionPage({ params }: { params: { sessionId: string } }) {
    return (
        <div>
            <h1>Game Session gestartet!</h1>
            <p>Session ID: {params.sessionId}</p>
        </div>
    );
}
