import GameClientWrapper from './GameClientWrapper';

export default async function GameSessionPage({ params, searchParams }: {
    params: Promise<{ sessionId: string }>;
    searchParams: Promise<{ playerId?: string }>;
}) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    const sessionId = resolvedParams.sessionId;
    const playerId = resolvedSearchParams.playerId;

    if (!sessionId || !playerId) {
        return <div>Session nicht gefunden.</div>;
    }

    return <GameClientWrapper sessionId={sessionId} playerId={playerId} />;
}
