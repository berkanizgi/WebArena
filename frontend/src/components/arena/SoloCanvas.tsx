'use client';

import { useEffect, useRef } from 'react';
import type { Game } from 'phaser';
import type { Hud, Mode, RunResult, Skin } from '@/solo/rules';
import type { SoloControls } from '@/solo/SoloScene';

type Props = {
  skin: Skin; mode: Mode;
  onReady: (controls: SoloControls) => void; onHud: (hud: Hud) => void;
  onEnd: (result: RunResult) => void; onPause: () => void; onError: (message: string) => void;
};
export default function SoloCanvas(props: Props) {
  const container = useRef<HTMLDivElement>(null);
  const callbacks = useRef(props);
  callbacks.current = props;
  useEffect(() => {
    let cancelled = false;
    let game: Game | undefined;
    async function start() {
      try {
        const [Phaser, { default: SoloScene }] = await Promise.all([import('phaser'), import('@/solo/SoloScene')]);
        if (cancelled || !container.current) return;
        game = new Phaser.Game({
          type: Phaser.AUTO,
          parent: container.current,
          backgroundColor: '#151d2b',
          pixelArt: true,
          roundPixels: true,
          scale: { mode: Phaser.Scale.RESIZE, width: container.current.clientWidth, height: container.current.clientHeight },
          physics: { default: 'arcade', arcade: { debug: false } },
          audio: { noAudio: true },
          scene: new SoloScene({
            skin: props.skin, mode: props.mode,
            onReady: controls => callbacks.current.onReady(controls),
            onHud: hud => callbacks.current.onHud(hud),
            onEnd: result => callbacks.current.onEnd(result),
            onPause: () => callbacks.current.onPause(),
            onError: message => callbacks.current.onError(message),
          }),
        });
      } catch {
        if (!cancelled) callbacks.current.onError('Das Spiel konnte nicht gestartet werden. Bitte versuche es erneut.');
      }
    }
    void start();
    return () => { cancelled = true; game?.destroy(true); };
  }, [props.skin, props.mode]);
  return <div ref={container} className="arena-canvas" role="application" aria-label="WebArena Spielfeld. WASD oder Pfeiltasten zum Bewegen, Maus zum Zielen, Linksklick zum Schiessen." />;
}
