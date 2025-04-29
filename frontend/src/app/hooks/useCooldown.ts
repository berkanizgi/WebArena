import { useEffect, useState, useCallback } from 'react';

export function useCooldown(duration: number) {
    const [cooldownProgress, setCooldownProgress] = useState(1);
    const [cooldownReady, setCooldownReady] = useState(true);

    const trigger = useCallback(() => {
        if (!cooldownReady) return;
        setCooldownReady(false);
        setCooldownProgress(0);
        const start = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            setCooldownProgress(progress);
            if (progress >= 1) {
                setCooldownReady(true);
                clearInterval(interval);
            }
        }, 16);
    }, [cooldownReady, duration]);

    return { cooldownProgress, cooldownReady, trigger };
}
