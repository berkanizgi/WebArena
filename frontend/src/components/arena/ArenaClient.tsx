'use client';

/* The original character illustrations are intentionally displayed unmodified. */
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { CHARACTERS, formatTime, loadProgress } from '@/solo/rules';
import type { Hud, Mode, RunResult, Skin } from '@/solo/rules';
import type { SoloControls } from '@/solo/SoloScene';
import './arena.css';

const SoloCanvas = dynamic(() => import('./SoloCanvas'), { ssr: false });
const STORAGE_KEY = 'webarena.solo.progress.v1';
const initialHud: Hud = { health: 0, maxHealth: 100, wave: 1, kills: 0, score: 0, seconds: 0, remaining: 0, boost: false, objective: 'Die Arena wird vorbereitet …' };
function OriginalLogo() {
  const clipId = useId();
  // Display the actual logo pixels from the original lobby artwork, without redrawing them.
  return <svg className="brand-logo" viewBox="596 178 300 283" role="img" aria-label="WebArena Original-Logo">
    <defs><clipPath id={clipId}><path d="M650 185 739 181 829 183 838 191 840 233 836 250 878 250 886 259 895 328 886 339 859 340 836 372 844 424 839 439 785 448 752 460 719 448 655 446 645 435 650 403 655 373 630 343 606 341 597 330 615 259 624 250 659 250 648 195Z"/></clipPath></defs>
    <image href="/lobby/Lobby_Frame.png" width="1536" height="1024" clipPath={'url(#' + clipId + ')'}/>
  </svg>;
}
function Arrow() { return <span aria-hidden="true">↗</span>; }
function Controls() {
  return <div className="controls-legend"><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Bewegen</span><span><kbd>↖</kbd> Maus: zielen & schiessen</span><span><kbd>Esc</kbd> Pause</span></div>;
}

export default function ArenaClient() {
  const [skin, setSkin] = useState<Skin>('black');
  const [mode, setMode] = useState<Mode>('arena');
  const [playing, setPlaying] = useState(false);
  const [run, setRun] = useState(0);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [help, setHelp] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<RunResult | null>(null);
  const [hud, setHud] = useState<Hud>(initialHud);
  const [progress, setProgress] = useState({ best: 0, wins: 0 });
  const controls = useRef<SoloControls | null>(null);
  const pausedRef = useRef(false);
  const frame = useRef<HTMLDivElement>(null);
  const helpDialog = useRef<HTMLElement>(null);
  const helpTrigger = useRef<HTMLButtonElement>(null);
  const hero = CHARACTERS.find(c => c.id === skin)!;

  useEffect(() => {
    try { setProgress(loadProgress(localStorage.getItem(STORAGE_KEY))); } catch { /* Playing does not depend on storage access. */ }
  }, []);
  const pause = useCallback(() => {
    if (!controls.current) return;
    pausedRef.current = !pausedRef.current;
    controls.current.pause(pausedRef.current);
    setPaused(pausedRef.current);
  }, []);
  useEffect(() => {
    if (!playing || !ready || result) return;
    const onHidden = () => { if (document.hidden && !pausedRef.current) pause(); };
    const onBlur = () => { if (!pausedRef.current) pause(); };
    document.addEventListener('visibilitychange', onHidden);
    window.addEventListener('blur', onBlur);
    const onKey = (event: KeyboardEvent) => {
      if (!help && event.key === 'Escape' && pausedRef.current) { event.preventDefault(); event.stopImmediatePropagation(); pause(); }
    };
    // Phaser handles Escape while running; native listener handles it while paused.
    window.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('visibilitychange', onHidden);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('keydown', onKey, true);
    };
  }, [playing, ready, result, pause, help]);
  useEffect(() => {
    if (!help) return;
    const trigger = helpTrigger.current;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault(); event.stopImmediatePropagation(); setHelp(false);
      }
      if (event.key === 'Tab') {
        const buttons = helpDialog.current?.querySelectorAll<HTMLButtonElement>('button');
        if (!buttons?.length) return;
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => { window.removeEventListener('keydown', onKey, true); trigger?.focus(); };
  }, [help]);
  const onReady = useCallback((controller: SoloControls) => { controls.current = controller; setReady(true); }, []);
  const onEnd = useCallback((completed: RunResult) => {
    setResult(completed);
    if (completed.mode !== 'arena') return;
    setProgress(previous => {
      const next = { best: Math.max(previous.best, completed.score), wins: previous.wins + Number(completed.won) };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* The current run still works without persistent storage. */ }
      return next;
    });
  }, []);
  const start = (nextMode: Mode) => {
    controls.current = null; pausedRef.current = false;
    setMode(nextMode); setHud(initialHud); setResult(null); setReady(false); setPaused(false); setError(''); setPlaying(true); setRun(n => n + 1);
  };
  const leave = () => { setPlaying(false); setResult(null); setPaused(false); pausedRef.current = false; controls.current = null; };
  const fullscreen = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await frame.current?.requestFullscreen(); } catch { /* Optional browser feature. */ } };
  const touchMove = (x: number, y: number) => controls.current?.move(x, y);
  const touchButton = (label: string, x: number, y: number) => <button aria-label={label} onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); touchMove(x, y); }} onPointerUp={() => touchMove(0, 0)} onPointerCancel={() => touchMove(0, 0)}>{label}</button>;

  return <div className="webarena">
    <header className="site-header">
      <button className="brand" onClick={leave} aria-label="WebArena Startseite"><OriginalLogo/></button>
      <nav aria-label="Hauptnavigation"><button className={!playing ? 'active-nav' : ''} onClick={leave}>Spielen</button><button ref={helpTrigger} onClick={() => { if (playing && ready && !pausedRef.current && !result) pause(); setHelp(true); }}>Spielanleitung</button><a href="https://github.com/berkanizgi/WebArena" target="_blank" rel="noreferrer">GitHub <Arrow/></a></nav>
      <span className="preview-badge"><i/> Solo Edition</span>
    </header>

    {!playing ? <main className="arena-home">
      <div className="intro"><div><p className="eyebrow">KLEINE ARENA. GROSSE MOMENTE.</p><h1>Ein Klick.<br/>Mitten im <em>Spiel.</em></h1></div><p className="intro-copy">Wähle deinen Kämpfer, weiche Angriffen aus<br className="desktop-break"/> und erobere die Arena. Direkt im Browser.</p></div>
      <div className="home-grid">
        <section className="launch-card" aria-labelledby="launch-title">
          <div className="launch-backdrop"/>
          <div className="launch-content"><span className="card-kicker"><i/> BEREIT FÜR DEINE RUNDE</span><h2 id="launch-title">Die Arena<br/>gehört dir.</h2><p>Drei Wellen. Vier Kämpfer.<br/>Wie lange hältst du durch?</p>
            <div className="launch-actions"><button className="primary-button" onClick={() => start('arena')}>Jetzt spielen <span>→</span></button><button className="training-link" onClick={() => start('training')}>Erst einmal trainieren <Arrow/></button></div>
          </div>
          <img className="hero-character" src={'/lobby/' + skin + '_char_lobby.png'} alt={hero.name + ', dein ausgewählter Kämpfer'} key={skin}/>
          <div className="hero-caption"><span>DEIN KÄMPFER</span><strong>{hero.name}</strong><small>{hero.role}</small></div>
          <div className="launch-bottom"><span>01 <b>SOLO-ARENA</b></span><span>Ohne Anmeldung <span aria-hidden="true">✦</span></span></div>
        </section>
        <aside className="character-panel">
          <div className="panel-heading"><div><p className="eyebrow">DEIN SPIELSTIL</p><h2>Wähle deinen Kämpfer</h2></div><span>04</span></div>
          <div className="character-grid">{CHARACTERS.map(character => <button key={character.id} className={'character-choice ' + (skin === character.id ? 'selected' : '')} aria-pressed={skin === character.id} onClick={() => setSkin(character.id)}>
            <img src={'/lobby/' + character.id + '_char_lobby.png'} alt=""/><span className="character-name">{character.name}</span><span className="character-role">{character.role}</span>{skin === character.id && <span className="selected-check" aria-hidden="true">✓</span>}
          </button>)}</div>
          <div className="hero-stats"><div><span>Ausdauer</span><meter min={0} max={160} value={hero.health}>{hero.health}</meter></div><div><span>Tempo</span><meter min={0} max={150} value={hero.speed}>{hero.speed}</meter></div><div><span>Angriff</span><meter min={0} max={35} value={hero.damage}>{hero.damage}</meter></div></div>
        </aside>
      </div>
      <div className="home-details">
        <section className="detail-controls"><p className="eyebrow">SCHNELL DRIN. SCHWER WIEDER RAUS.</p><h3>Du hast die Kontrolle.</h3><Controls/></section>
        <section className="detail-stat"><span className="stat-icon" aria-hidden="true">✧</span><div><p>Dein Bestwert</p><strong>{progress.best.toLocaleString('de-AT')} <small>Punkte</small></strong></div></section>
        <section className="detail-stat"><span className="stat-icon" aria-hidden="true">⚑</span><div><p>Arena gemeistert</p><strong>{progress.wins.toLocaleString('de-AT')} <small>Mal</small></strong></div></section>
      </div>
      <footer className="arena-footer"><span>Entstanden an der FH Vorarlberg. Gebaut zum Spielen.</span><span>Originale WebArena-Karte <b>·</b> Fortschritt auf diesem Gerät</span></footer>
    </main> : <main className="play-page" ref={frame}>
      <div className="play-heading"><button className="back-button" onClick={leave}>← Zurück zur Auswahl</button><div className="mode-label"><i/>{mode === 'training' ? 'TRAINING' : 'SOLO-ARENA'} <span>· {hero.name}</span></div><div className="play-tools"><button onClick={fullscreen} aria-label="Vollbild umschalten">⛶</button><button onClick={pause} disabled={!ready || !!result || !!error} aria-label={paused ? 'Spiel fortsetzen' : 'Spiel pausieren'}>{paused ? '▶' : 'Ⅱ'}</button></div></div>
      <div className="game-shell">
        <div className="game-hud" aria-live="off">
          <div className="health-block"><span>LEBEN <b>{hud.health} / {hud.maxHealth}</b></span><div className="health-track"><i style={{ width: 100 * hud.health / hud.maxHealth + '%' }}/></div></div>
          <div><span>{mode === 'training' ? 'ZIELE' : 'WELLE'}</span><strong>{mode === 'training' ? hud.kills + ' / 3' : hud.wave + ' / 3'}</strong></div>
          <div><span>PUNKTE</span><strong>{hud.score.toLocaleString('de-AT')}</strong></div>
          <div><span>ZEIT</span><strong>{formatTime(hud.seconds)}</strong></div>
        </div>
        <SoloCanvas key={run} skin={skin} mode={mode} onReady={onReady} onHud={setHud} onEnd={onEnd} onPause={pause} onError={setError}/>
        {!ready && !error && <div className="game-overlay loading-overlay"><div className="loading-orbit"/><p>Deine Arena wird vorbereitet …</p></div>}
        {paused && !result && !error && <div className="game-overlay"><div className="overlay-card"><p className="eyebrow">SPIEL PAUSIERT</p><h2>Kurz durchatmen.</h2><p>Deine Runde wartet auf dich.</p><button autoFocus className="primary-button" onClick={pause}>Weiterspielen →</button><button className="quiet-button" onClick={() => start(mode)}>Runde neu starten</button><button className="quiet-button" onClick={leave}>Zur Auswahl</button></div></div>}
        {error && <div className="game-overlay"><div className="overlay-card"><h2>Ein Moment …</h2><p>{error}</p><button className="primary-button" onClick={() => start(mode)}>Erneut versuchen</button><button className="quiet-button" onClick={leave}>Zur Auswahl</button></div></div>}
        {result && <div className="game-overlay"><div className="overlay-card result-card"><span className="result-symbol" aria-hidden="true">{result.won ? '✦' : '↻'}</span><p className="eyebrow">{result.won ? 'STARK GESPIELT' : 'DIE NÄCHSTE RUNDE WARTET'}</p><h2>{result.won ? (mode === 'training' ? 'Bereit für die Arena.' : 'Arena gemeistert!') : 'Noch eine Runde?'}</h2><p>{result.won ? 'Bewegung, Timing und ein guter Treffer.' : 'Bleib in Bewegung und nutze die Wände als Deckung.'}</p><div className="result-stats"><div><strong>{result.score}</strong><span>Punkte</span></div><div><strong>{result.kills}</strong><span>Trefferziele</span></div><div><strong>{formatTime(result.seconds)}</strong><span>Zeit</span></div></div><button autoFocus className="primary-button" onClick={() => start(mode === 'training' && result.won ? 'arena' : mode)}>{mode === 'training' && result.won ? 'Ab in die Arena' : 'Noch einmal spielen'} →</button><button className="quiet-button" onClick={leave}>Kämpfer wechseln</button></div></div>}
        <div className="touch-controls" aria-label="Touch-Steuerung"><div className="touch-pad">{touchButton('↑', 0, -1)}{touchButton('←', -1, 0)}{touchButton('↓', 0, 1)}{touchButton('→', 1, 0)}</div><button className="touch-fire" aria-label="Schiessen" onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); controls.current?.fire(true); }} onPointerUp={() => controls.current?.fire(false)} onPointerCancel={() => controls.current?.fire(false)}>◎</button></div>
      </div>
      <div className="objective-bar"><span><i/>{hud.objective}</span><b>{hud.boost ? '⚡ TEMPO-BOOST' : 'Wände bieten Deckung'}</b></div>
      <Controls/>
    </main>}
    {help && <div className="help-backdrop" onClick={() => setHelp(false)}><section ref={helpDialog} className="help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={e => e.stopPropagation()}><button className="dialog-close" onClick={() => setHelp(false)} aria-label="Spielanleitung schliessen">×</button><p className="eyebrow">DEINE ERSTE RUNDE</p><h2 id="help-title">So spielst du WebArena.</h2><ol><li><b>Bewegen.</b> WASD oder die Pfeiltasten bringen dich durch die Arena.</li><li><b>Zielen & schiessen.</b> Bewege die Maus und halte die linke Maustaste. Alternativ schiesst du mit der Leertaste.</li><li><b>Überleben.</b> Weiche roten Schüssen aus. Medikits geben dir Leben, ein gelber Blitz kurzzeitig mehr Tempo.</li><li><b>Gewinnen.</b> Besiege alle Gegner in drei Wellen. Im Training übst du ohne Schaden.</li></ol><p className="help-note">Auf Touch-Geräten bewegst du dich mit den Richtungstasten. Der Schussknopf zielt auf den nächsten Gegner.</p><button autoFocus className="primary-button" onClick={() => setHelp(false)}>Alles klar →</button></section></div>}
  </div>;
}
