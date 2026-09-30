import * as Phaser from 'phaser';
import mapSource from '../../public/map/WebArenaMap.json';
import { CHARACTERS, WAVE_COUNT, findPath, normaliseMovement, pointAt, reachableCells, safePoint, waveSize } from './rules';
import type { Grid, Hud, Mode, Point, RunResult, Skin } from './rules';

type Enemy = { sprite: Phaser.Physics.Arcade.Sprite; hp: number; maxHp: number; path: Point[]; repath: number; shootAt: number; bar: Phaser.GameObjects.Graphics };
type Shot = { sprite: Phaser.Physics.Arcade.Image; hostile: boolean; expires: number };
export type SoloControls = { pause: (paused: boolean) => void; move: (x: number, y: number) => void; fire: (down: boolean) => void };
type Options = { skin: Skin; mode: Mode; onReady: (controls: SoloControls) => void; onHud: (hud: Hud) => void; onEnd: (result: RunResult) => void; onPause: () => void; onError: (message: string) => void };

export default class SoloScene extends Phaser.Scene {
  private options: Options;
  private player!: Phaser.Physics.Arcade.Sprite;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private collision!: Phaser.Tilemaps.TilemapLayer;
  private grid!: Grid;
  private cells: number[] = [];
  private enemies: Enemy[] = [];
  private shots: Shot[] = [];
  private pickups: { sprite: Phaser.GameObjects.Image; kind: 'heal' | 'boost' }[] = [];
  private health = 0;
  private wave = 0;
  private kills = 0;
  private score = 0;
  private elapsed = 0;
  private nextShot = 0;
  private hurtAt = 0;
  private boostUntil = 0;
  private lastHud = 0;
  private ended = false;
  private betweenWaves = false;
  private moved = 0;
  private fired = 0;
  private boosted = false;
  private virtualMove = { x: 0, y: 0 };
  private virtualFire = false;
  private reticle!: Phaser.GameObjects.Graphics;
  private marker!: Phaser.GameObjects.Text;
  private hero;
  private failedAsset = false;

  constructor(options: Options) {
    super('solo');
    this.options = options;
    this.hero = CHARACTERS.find(c => c.id === options.skin)!;
  }

  preload() {
    this.load.on('loaderror', () => { this.failedAsset = true; });
    const data = structuredClone(mapSource);
    // Tiled editor visibility and duplicate tileset names must not hide the game map.
    data.layers.forEach(layer => { layer.visible = true; });
    data.tilesets.forEach((tileset, index) => {
      const file = tileset.image.split('/').pop()!;
      tileset.name = 'solo-tiles-' + index;
      this.load.image(tileset.name, '/map/Tiles/' + file);
    });
    this.cache.tilemap.add('solo-map', { format: Phaser.Tilemaps.Formats.TILED_JSON, data });
    for (const skin of CHARACTERS) this.load.spritesheet('solo-' + skin.id, '/map/Tiles/character/' + skin.id + '/' + skin.id + '_asha_walk.png', { frameWidth: 32, frameHeight: 32 });
    this.load.image('solo-heal', '/game/medikit.png');
    this.load.image('solo-boost', '/game/blitz.png');
  }

  create() {
    if (this.failedAsset) { this.options.onError('Die Spielgrafiken konnten nicht vollständig geladen werden. Bitte starte die Runde neu.'); return; }
    const map = this.make.tilemap({ key: 'solo-map' });
    const tilesets = map.tilesets.map(t => map.addTilesetImage(t.name, t.name)!).filter(Boolean);
    const depths: Record<string, number> = { Bottom: 0, Collision: 1, onCollision: 2, Bruecke: 3, onTop: 4, Top: 20 };
    map.layers.forEach(l => {
      const layer = map.createLayer(l.name, tilesets)!;
      layer.setVisible(true).setDepth(depths[l.name] ?? 0);
      if (l.name === 'Collision') { this.collision = layer; layer.setCollisionByExclusion([-1]); }
    });
    const sourceCollision = mapSource.layers.find(l => l.name === 'Collision')!;
    this.grid = { width: mapSource.width, height: mapSource.height, tileSize: mapSource.tilewidth, blocked: sourceCollision.data! };
    this.cells = reachableCells(this.grid, { x: 648, y: 472 });
    const spawn = safePoint(this.grid, this.cells, { x: 648, y: 472 });
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.player = this.physics.add.sprite(spawn.x, spawn.y, 'solo-' + this.options.skin).setDepth(10).setCollideWorldBounds(true);
    this.player.setSize(11, 11).setOffset(10.5, 15);
    this.physics.add.collider(this.player, this.collision);
    this.health = this.hero.health;
    for (const character of CHARACTERS) for (const [direction, start] of [['down', 0], ['right', 8], ['up', 16], ['left', 24]] as const) {
      this.anims.create({ key: 'solo-' + character.id + '-' + direction, frames: this.anims.generateFrameNumbers('solo-' + character.id, { start, end: start + 7 }), frameRate: 10, repeat: -1 });
    }
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,ESC') as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.keyboard!.on('keydown-ESC', () => { if (!this.ended) this.options.onPause(); });
    this.input.mouse?.disableContextMenu();
    this.input.setDefaultCursor('crosshair');
    const camera = this.cameras.main;
    camera.setBackgroundColor('#151d2b').setBounds(0, 0, map.widthInPixels, map.heightInPixels).startFollow(this.player, true, .12, .12);
    const resize = () => camera.setZoom(this.scale.width < 600 ? 1.7 : 2.25);
    resize();
    this.scale.on('resize', resize);
    this.events.once('shutdown', () => this.scale.off('resize', resize));
    const texture = this.add.graphics();
    texture.fillStyle(0xffffff).fillCircle(4, 4, 3);
    texture.generateTexture('solo-shot', 8, 8);
    texture.destroy();
    this.reticle = this.add.graphics().setDepth(30);
    this.marker = this.add.text(this.player.x, this.player.y - 25, 'DU', { fontFamily: 'Arial', fontSize: '8px', color: '#f5de98', stroke: '#131724', strokeThickness: 3 }).setOrigin(.5).setDepth(30);
    this.addPickup('boost', { x: spawn.x + 66, y: spawn.y });
    this.addPickup('heal', { x: spawn.x - 60, y: spawn.y - 15 });
    this.startWave();
    this.options.onReady({
      pause: paused => { this.virtualMove = { x: 0, y: 0 }; this.virtualFire = false; if (paused) this.scene.pause(); else { this.input.keyboard?.resetKeys(); this.scene.resume(); } },
      move: (x, y) => { this.virtualMove = { x, y }; },
      fire: down => { this.virtualFire = down; },
    });
    this.emitHud();
  }

  private addPickup(kind: 'heal' | 'boost', target: Point) {
    const point = safePoint(this.grid, this.cells, target);
    const sprite = this.add.image(point.x, point.y, 'solo-' + kind).setDisplaySize(18, 18).setDepth(8);
    this.tweens.add({ targets: sprite, scaleX: sprite.scaleX * 1.15, scaleY: sprite.scaleY * 1.15, duration: 650, yoyo: true, repeat: -1 });
    this.pickups.push({ sprite, kind });
  }

  private startWave() {
    this.wave++;
    this.betweenWaves = false;
    const count = this.options.mode === 'training' ? 3 : waveSize(this.wave);
    const offsets = this.options.mode === 'training' ? [{ x: -80, y: 0 }, { x: 105, y: -18 }, { x: 10, y: 120 }] : [{ x: -175, y: -30 }, { x: 180, y: 30 }, { x: 0, y: -180 }, { x: -80, y: 170 }, { x: 190, y: 130 }];
    for (let i = 0; i < count; i++) {
      const offset = offsets[i % offsets.length];
      let point = safePoint(this.grid, this.cells, { x: this.player.x + offset.x, y: this.player.y + offset.y });
      if (Phaser.Math.Distance.BetweenPoints(point, this.player) < 55) {
        const candidates = this.cells.filter(c => Phaser.Math.Distance.BetweenPoints(pointAt(this.grid, c), this.player) > 110);
        point = safePoint(this.grid, candidates, { x: this.player.x + offset.x, y: this.player.y + offset.y });
      }
      // Path waypoints use tile centres, so the collision body must share the sprite centre.
      const sprite = this.physics.add.sprite(point.x, point.y, 'solo-red').setDepth(10).setSize(11, 11).setOffset(10.5, 10.5).setCollideWorldBounds(true);
      sprite.setTint(this.options.mode === 'training' ? 0xd1c6b0 : 0xffa499);
      const collider = this.physics.add.collider(sprite, this.collision);
      sprite.once('destroy', () => collider.destroy());
      const hp = this.options.mode === 'training' ? 35 : 35 + this.wave * 8;
      this.enemies.push({ sprite, hp, maxHp: hp, path: [], repath: 0, shootAt: this.elapsed + 2600 + i * 400, bar: this.add.graphics().setDepth(25) });
    }
    this.notify(this.options.mode === 'training' ? 'TRAINING' : 'WELLE ' + this.wave + ' / 3', this.player.x, this.player.y - 40, '#ffe2a4');
    this.emitHud();
  }

  private fire(from: Point, toward: Point, hostile: boolean) {
    const velocity = normaliseMovement(toward.x - from.x, toward.y - from.y, hostile ? 145 : 295);
    const sprite = this.physics.add.image(from.x, from.y, 'solo-shot').setDepth(12).setTint(hostile ? 0xff766a : 0xffe3a3).setVelocity(velocity.x, velocity.y);
    sprite.setCircle(3);
    const shot = { sprite, hostile, expires: this.elapsed + (hostile ? 2800 : 1700) };
    this.shots.push(shot);
    const collider = this.physics.add.collider(sprite, this.collision, () => sprite.destroy());
    sprite.once('destroy', () => collider.destroy());
    if (!hostile) this.fired++;
  }

  private hitPlayer(damage: number) {
    if (this.options.mode === 'training' || this.elapsed < this.hurtAt || this.ended) return;
    this.health = Math.max(0, this.health - damage);
    this.hurtAt = this.elapsed + 480;
    this.player.setTint(0xff7777);
    this.time.delayedCall(150, () => this.player?.active && this.player.clearTint());
    this.cameras.main.shake(90, .002);
    if (!this.health) this.finish(false);
  }

  private animate(sprite: Phaser.Physics.Arcade.Sprite, velocity: Point, target?: Point) {
    const x = target ? target.x - sprite.x : velocity.x, y = target ? target.y - sprite.y : velocity.y;
    const direction = Math.abs(x) > Math.abs(y) ? (x < 0 ? 'left' : 'right') : (y < 0 ? 'up' : 'down');
    if (Math.hypot(velocity.x, velocity.y) > 1) sprite.play(sprite.texture.key + '-' + direction, true);
    else { sprite.anims.stop(); sprite.setFrame({ down: 0, right: 8, up: 16, left: 24 }[direction]); }
  }

  private notify(message: string, x: number, y: number, color = '#b2ecc8') {
    const text = this.add.text(x, y, message, { fontFamily: 'Arial', fontStyle: 'bold', fontSize: '9px', color, stroke: '#131a28', strokeThickness: 3 }).setOrigin(.5).setDepth(35);
    this.tweens.add({ targets: text, y: y - 25, alpha: 0, duration: 1500, onComplete: () => text.destroy() });
  }

  private finish(won: boolean) {
    if (this.ended) return;
    this.ended = true;
    if (won) this.score += Math.max(0, 400 - Math.floor(this.elapsed / 1000));
    this.player.setVelocity(0);
    for (const enemy of this.enemies) enemy.sprite.setVelocity(0);
    this.physics.pause();
    this.emitHud();
    this.options.onEnd({ won, score: this.score, kills: this.kills, seconds: Math.floor(this.elapsed / 1000), mode: this.options.mode });
  }

  private objective() {
    if (this.options.mode === 'arena') return this.betweenWaves ? 'Kurz durchatmen. Die nächste Welle kommt.' : 'Besiege die roten Gegner. Überstehe alle 3 Wellen.';
    if (this.moved < 70) return 'Bewege dich mit WASD oder den Pfeiltasten.';
    if (!this.fired) return 'Ziele mit der Maus und schiesse mit Linksklick.';
    if (this.kills < 3) return 'Triff alle 3 Übungsgegner. Schüsse stoppen an Wänden.';
    if (!this.boosted) return 'Sammle den gelben Blitz nahe der Startposition.';
    return 'Training abgeschlossen!';
  }

  private emitHud() {
    this.options.onHud({ health: this.health, maxHealth: this.hero.health, wave: this.wave, kills: this.kills, score: this.score, seconds: Math.floor(this.elapsed / 1000), remaining: this.enemies.length, boost: this.elapsed < this.boostUntil, objective: this.objective() });
  }

  update(_time: number, delta: number) {
    if (!this.player || this.ended) return;
    const dt = Math.min(delta, 50);
    this.elapsed += dt;
    const k = this.keys;
    const x = Number(k.D.isDown || k.RIGHT.isDown) - Number(k.A.isDown || k.LEFT.isDown) + this.virtualMove.x;
    const y = Number(k.S.isDown || k.DOWN.isDown) - Number(k.W.isDown || k.UP.isDown) + this.virtualMove.y;
    const speed = this.hero.speed * (this.elapsed < this.boostUntil ? 1.45 : 1);
    const velocity = normaliseMovement(x, y, speed);
    this.player.setVelocity(velocity.x, velocity.y);
    this.moved += Math.hypot(velocity.x, velocity.y) * dt / 1000;
    const pointer = this.input.activePointer;
    const target = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    // Touch fire aims at the closest enemy; desktop uses the actual pointer.
    if (this.virtualFire) {
      const closest = [...this.enemies].sort((a, b) => Phaser.Math.Distance.BetweenPoints(a.sprite, this.player) - Phaser.Math.Distance.BetweenPoints(b.sprite, this.player))[0];
      if (closest) { target.x = closest.sprite.x; target.y = closest.sprite.y; }
    }
    this.animate(this.player, velocity, target);
    this.marker.setPosition(this.player.x, this.player.y - 25);
    this.reticle.clear().lineStyle(.7, 0xffe0a0, .85).strokeCircle(target.x, target.y, 5);
    if ((pointer.isDown || k.SPACE.isDown || this.virtualFire) && this.elapsed >= this.nextShot && this.input.isOver) {
      this.fire(this.player, target, false); this.nextShot = this.elapsed + 310;
    } else if ((k.SPACE.isDown || this.virtualFire) && this.elapsed >= this.nextShot) {
      this.fire(this.player, target, false); this.nextShot = this.elapsed + 310;
    }
    for (const enemy of this.enemies) {
      const distance = Phaser.Math.Distance.BetweenPoints(enemy.sprite, this.player);
      if (this.options.mode === 'arena') {
        if (this.elapsed >= enemy.repath) { enemy.path = findPath(this.grid, enemy.sprite, this.player); enemy.repath = this.elapsed + 650; }
        while (enemy.path.length && Phaser.Math.Distance.BetweenPoints(enemy.sprite, enemy.path[0]) < 2) enemy.path.shift();
        const next = enemy.path[0];
        const movement = next && distance > 65 ? normaliseMovement(next.x - enemy.sprite.x, next.y - enemy.sprite.y, 43 + this.wave * 7) : { x: 0, y: 0 };
        enemy.sprite.setVelocity(movement.x, movement.y);
        this.animate(enemy.sprite, movement, this.player);
        if (distance < 230 && this.elapsed > enemy.shootAt) { this.fire(enemy.sprite, this.player, true); enemy.shootAt = this.elapsed + 2200 - this.wave * 220; }
        if (distance < 19) this.hitPlayer(12);
      }
      enemy.bar.clear().fillStyle(0x131a28, .85).fillRect(enemy.sprite.x - 12, enemy.sprite.y - 21, 24, 3).fillStyle(0xff8673).fillRect(enemy.sprite.x - 12, enemy.sprite.y - 21, 24 * enemy.hp / enemy.maxHp, 3);
    }
    for (const shot of this.shots) {
      if (!shot.sprite.active) continue;
      if (this.elapsed > shot.expires) { shot.sprite.destroy(); continue; }
      if (shot.hostile) {
        if (Phaser.Math.Distance.BetweenPoints(shot.sprite, this.player) < 13) { shot.sprite.destroy(); this.hitPlayer(13); }
      } else for (const enemy of this.enemies) {
        if (!enemy.sprite.active || Phaser.Math.Distance.BetweenPoints(shot.sprite, enemy.sprite) >= 14) continue;
        shot.sprite.destroy();
        enemy.hp -= this.hero.damage;
        this.notify(String(this.hero.damage), enemy.sprite.x, enemy.sprite.y - 18, '#ffe2a4');
        if (enemy.hp <= 0) {
          this.kills++; this.score += 100;
          if (this.kills % 3 === 0) this.addPickup('heal', enemy.sprite);
          enemy.bar.destroy(); enemy.sprite.destroy();
        }
        break;
      }
    }
    this.shots = this.shots.filter(s => s.sprite.active);
    this.enemies = this.enemies.filter(e => e.sprite.active);
    this.pickups = this.pickups.filter(pickup => {
      if (Phaser.Math.Distance.BetweenPoints(pickup.sprite, this.player) > 21) return true;
      if (pickup.kind === 'heal' && this.health === this.hero.health) return true;
      if (pickup.kind === 'heal') { this.health = Math.min(this.hero.health, this.health + 40); this.notify('+40 LEBEN', this.player.x, this.player.y - 25); }
      else { this.boostUntil = this.elapsed + 6000; this.boosted = true; this.notify('TEMPO-BOOST', this.player.x, this.player.y - 25); }
      pickup.sprite.destroy(); return false;
    });
    if (!this.enemies.length && !this.betweenWaves && !this.ended) {
      if (this.options.mode === 'training') { if (this.boosted && this.moved >= 70) this.finish(true); }
      else if (this.wave >= WAVE_COUNT) this.finish(true);
      else {
        this.betweenWaves = true;
        this.health = Math.min(this.hero.health, this.health + 25);
        this.time.delayedCall(1800, () => { if (!this.ended) { this.addPickup('boost', { x: this.player.x + 60, y: this.player.y }); this.startWave(); } });
      }
    }
    if (this.elapsed - this.lastHud > 100) { this.emitHud(); this.lastHud = this.elapsed; }
  }
}
