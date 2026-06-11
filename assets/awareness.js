/* Awareness · motor común de módulos (fase 2: progresión + nube)
 * Uso:
 *   Awareness.start({
 *     id:'go-no-go', title:'Go / No-Go',
 *     tagline:'Instrucción de una línea.',
 *     instructions:'Texto breve opcional con más detalle.',
 *     levelHints:['fácil','...','...','...','experto'],   // opcional, 5 textos
 *     metricLabels:{aciertos:'Aciertos', ...},            // etiquetas pantalla final
 *     primaryMetric:'aciertos',                            // métrica grande
 *     unlock:{threshold:75, times:2},                      // opcional: regla de desbloqueo
 *     game:{ start(ctx){...} }                             // lógica del juego
 *   });
 * ctx = { level, stage(HTMLElement), hud(obj), finish(metrics), cleanup(fn), rng() }
 * Progresión: el jugador empieza en nivel 1 y desbloquea el siguiente al alcanzar
 * `threshold` en la métrica primaria `times` veces jugando su nivel más alto.
 */
(function () {
  'use strict';

  // Carga config.js y cloud.js (misma carpeta), en orden, sin tocar los juegos.
  (function () {
    const cs = document.currentScript;
    if (!cs || !cs.src) return;
    const base = cs.src.replace(/awareness\.js.*$/, '');
    ['config.js', 'cloud.js'].forEach(f => {
      const s = document.createElement('script');
      s.src = base + f; s.async = false;
      document.head.appendChild(s);
    });
  })();

  const $ = (h, p) => { const d = document.createElement('div'); d.innerHTML = h; const n = d.firstElementChild; (p || null) && p.appendChild(n); return n; };

  const Awareness = {
    start(cfg) {
      const UNLOCK = Object.assign({ threshold: 75, times: 2 }, cfg.unlock || {});
      const root = document.body;
      root.innerHTML = '';
      const shell = $('<div class="aw-shell"></div>', root);
      const unlocked = () => Math.min(5, Math.max(1, this._load(cfg.id + ':unlocked') || 1));
      const state = { level: unlocked(), t0: 0, cleanups: [] };

      const top = $(
        '<div class="aw-top">' +
        '<a class="aw-back" href="../../index.html">← Inicio</a>' +
        '<div class="aw-title">' + cfg.title + '</div>' +
        '<span class="aw-lvl-chip">Nivel <b class="aw-lvl-n">' + state.level + '</b></span>' +
        '</div>', shell);
      const main = $('<div style="flex:1;display:flex;flex-direction:column"></div>', shell);
      const setLvlChip = () => { top.querySelector('.aw-lvl-n').textContent = state.level; };

      const intro = () => {
        state.cleanups.forEach(f => { try { f(); } catch (e) {} });
        state.cleanups = [];
        main.innerHTML = '';
        const s = $('<div class="aw-screen"></div>', main);
        $('<h1>' + cfg.title + '</h1>', s);
        $('<div class="aw-tagline">' + (cfg.tagline || '') + '</div>', s);
        if (cfg.instructions) $('<div class="aw-instr">' + cfg.instructions + '</div>', s);
        const lv = $('<div class="aw-levels"></div>', s);
        const hint = $('<div class="aw-level-hint"></div>', s);
        const maxL = unlocked();
        if (state.level > maxL) state.level = maxL;
        for (let i = 1; i <= 5; i++) {
          const libre = i <= maxL;
          const b = $('<button class="aw-level' + (i === state.level ? ' sel' : '') + '"' +
            (libre ? '' : ' disabled title="Se desbloquea rindiendo bien en el nivel ' + (i - 1) + '"') +
            '>' + (libre ? i : '🔒') + '</button>', lv);
          if (libre) b.onclick = () => {
            state.level = i; setLvlChip();
            lv.querySelectorAll('.aw-level').forEach(x => x.classList.remove('sel'));
            b.classList.add('sel'); showHint();
          };
        }
        const showHint = () => {
          let t = (cfg.levelHints && cfg.levelHints[state.level - 1]) || '';
          const best = this._load(cfg.id + ':best:' + state.level);
          if (best != null) t += (t ? ' · ' : '') + 'Mejor marca: ' + best;
          if (state.level === maxL && maxL < 5) {
            const wins = this._load(cfg.id + ':wins') || 0;
            t += (t ? ' · ' : '') + 'Desbloqueo del nivel ' + (maxL + 1) + ': ' + wins + '/' + UNLOCK.times +
              ' partidas con ' + UNLOCK.threshold + '+';
          }
          hint.textContent = t;
        };
        showHint();
        const go = $('<button class="aw-btn">Comenzar</button>', s);
        go.onclick = play;
      };

      const play = () => {
        main.innerHTML = '';
        const hudEl = $('<div class="aw-hud"></div>', main);
        const stage = $('<div class="aw-stage"></div>', main);
        const bar = $('<div class="aw-actions" style="padding-top:10px"></div>', main);
        const quit = $('<button class="aw-btn sec">Terminar</button>', bar);
        state.t0 = performance.now();
        const stats = {};
        const ctx = {
          level: state.level,
          stage,
          hud: {
            set(obj) {
              Object.assign(stats, obj);
              hudEl.innerHTML = Object.entries(stats)
                .map(([k, v]) => '<span class="aw-stat">' + k + ' <b>' + v + '</b></span>').join('');
            }
          },
          cleanup(fn) { state.cleanups.push(fn); },
          rng: mulberry(Date.now() & 0xffff),
          finish: (metrics) => results(metrics || {})
        };
        quit.onclick = () => results({ abandonado: 1 });
        try { cfg.game.start(ctx); }
        catch (e) { stage.innerHTML = '<div class="aw-screen"><div class="aw-tagline">Error al iniciar: ' + e.message + '</div></div>'; }
      };

      const results = (m) => {
        state.cleanups.forEach(f => { try { f(); } catch (e) {} });
        state.cleanups = [];
        const dur = Math.round((performance.now() - state.t0) / 1000);
        main.innerHTML = '';
        const s = $('<div class="aw-screen"></div>', main);
        $('<h1>Sesión completada</h1>', s);
        const grid = $('<div class="aw-results"></div>', s);
        const labels = cfg.metricLabels || {};
        Object.entries(m).forEach(([k, v]) => {
          if (k === 'abandonado') return;
          $('<div class="aw-res"><div class="v">' + v + '</div><div class="k">' + (labels[k] || k) + '</div></div>', grid);
        });
        $('<div class="aw-res"><div class="v">' + dur + 's</div><div class="k">Duración</div></div>', grid);

        // mejor marca
        const pk = cfg.primaryMetric;
        if (pk && m[pk] != null && !m.abandonado) {
          const key = cfg.id + ':best:' + state.level;
          const prev = this._load(key);
          if (prev == null || Number(m[pk]) > Number(prev)) {
            this._save(key, m[pk]);
            $('<div class="aw-best">★ Nueva mejor marca en nivel ' + state.level + '</div>', s);
          } else {
            $('<div class="aw-feedback">Tu mejor marca en este nivel: ' + prev + '</div>', s);
          }
        }

        // progresión: desbloqueo por rendimiento en el nivel más alto
        const maxL = unlocked();
        if (pk && m[pk] != null && !m.abandonado && state.level === maxL && maxL < 5) {
          if (Number(m[pk]) >= UNLOCK.threshold) {
            let wins = (this._load(cfg.id + ':wins') || 0) + 1;
            if (wins >= UNLOCK.times) {
              this._save(cfg.id + ':unlocked', maxL + 1);
              this._save(cfg.id + ':wins', 0);
              $('<div class="aw-best" style="font-size:1.05rem">🔓 ¡Nivel ' + (maxL + 1) + ' desbloqueado!</div>', s);
            } else {
              this._save(cfg.id + ':wins', wins);
              $('<div class="aw-feedback">Te falta ' + (UNLOCK.times - wins) + ' partida así de buena para desbloquear el nivel ' + (maxL + 1) + '.</div>', s);
            }
          } else {
            $('<div class="aw-feedback">Con ' + UNLOCK.threshold + '+ en ' + (labels[pk] || pk) + ' avanzas hacia el nivel ' + (maxL + 1) + '.</div>', s);
          }
        }

        // historial local + contrato de módulo + nube
        const record = { modulo: cfg.id, version: 2, nivel: state.level, duracion_s: dur, fecha: new Date().toISOString(), metricas: m };
        const hist = this._load('aw:historial') || [];
        hist.push(record); if (hist.length > 400) hist.shift();
        this._save('aw:historial', hist);
        try { if (window.parent !== window) window.parent.postMessage({ awareness: record }, '*'); } catch (e) {}
        try {
          if (!m.abandonado && window.AwCloud) AwCloud.push('module_runs',
            { modulo: record.modulo, nivel: record.nivel, duracion_s: record.duracion_s, metricas: record.metricas });
        } catch (e) {}

        const acts = $('<div class="aw-actions"></div>', s);
        $('<button class="aw-btn">Jugar otra vez</button>', acts).onclick = play;
        const nuevoMax = unlocked();
        if (state.level < nuevoMax) $('<button class="aw-btn sec">Subir a nivel ' + (state.level + 1) + '</button>', acts).onclick =
          () => { state.level++; setLvlChip(); play(); };
        $('<button class="aw-btn sec">Inicio</button>', acts).onclick = () => { location.href = '../../index.html'; };
      };

      intro();
    },
    _save(k, v) { try { localStorage.setItem('aw:' + k, JSON.stringify(v)); } catch (e) {} },
    _load(k) { try { const v = localStorage.getItem('aw:' + k); return v == null ? null : JSON.parse(v); } catch (e) { return null; } }
  };

  function mulberry(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  window.Awareness = Awareness;
})();
