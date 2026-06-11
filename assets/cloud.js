/* Awareness · capa de nube (Supabase) con cola offline.
 * Si config.js está vacío, todo funciona igual en modo invitado.
 * API: AwCloud.status() / .onChange(cb) / .signIn(email) / .signOut()
 *      .push(tabla, fila)  — encola y sincroniza cuando hay sesión
 */
(function () {
  'use strict';
  const CFG = window.AWARENESS_CONFIG || {};
  const configured = !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY);
  let sb = null, user = null, ready = !configured;
  const listeners = [];
  const QKEY = 'aw:cloud:queue';

  const loadQ = () => { try { return JSON.parse(localStorage.getItem(QKEY) || '[]'); } catch (e) { return []; } };
  const saveQ = (q) => { try { localStorage.setItem(QKEY, JSON.stringify(q.slice(-300))); } catch (e) {} };
  const notify = () => listeners.forEach(cb => { try { cb(AwCloud.status()); } catch (e) {} });

  const ensureProfile = () => {
    if (!sb || !user) return;
    sb.from('profiles').upsert({ id: user.id, alias: (user.email || '').split('@')[0] }).then(() => {});
  };

  let syncing = false;
  const sync = () => {
    if (!sb || !user || syncing) return;
    const q = loadQ();
    if (!q.length) return;
    syncing = true;
    const item = q[0];
    sb.from(item.tabla).insert(Object.assign({ user_id: user.id }, item.fila)).then(({ error }) => {
      syncing = false;
      if (!error || (error.code && error.code !== 'PGRST301' && String(error.message || '').indexOf('fetch') === -1)) {
        // insertado, o error permanente (fila inválida): no bloquear la cola
        const q2 = loadQ(); q2.shift(); saveQ(q2);
        sync();
      }
    }).catch(() => { syncing = false; });
  };

  const init = () => {
    if (!configured) return;
    const arranca = () => {
      sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
      sb.auth.getSession().then(({ data }) => {
        user = (data && data.session && data.session.user) || null;
        ready = true;
        if (user) { ensureProfile(); sync(); }
        notify();
      });
      sb.auth.onAuthStateChange((_e, session) => {
        user = (session && session.user) || null;
        if (user) { ensureProfile(); sync(); }
        notify();
      });
    };
    if (window.supabase) return arranca();
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    s.async = false;
    s.onload = arranca;
    s.onerror = () => { ready = true; notify(); };
    document.head.appendChild(s);
  };

  const AwCloud = {
    status() { return { configured, ready, user: user ? { id: user.id, email: user.email } : null }; },
    onChange(cb) { listeners.push(cb); if (ready) cb(this.status()); },
    signIn(email) {
      if (!sb) return Promise.reject(new Error('La nube no está configurada todavía.'));
      const base = location.href.replace(/[^/]*$/, '');
      return sb.auth.signInWithOtp({ email, options: { emailRedirectTo: base + 'cuenta.html' } });
    },
    signOut() { return sb ? sb.auth.signOut() : Promise.resolve(); },
    push(tabla, fila) {
      const q = loadQ(); q.push({ tabla, fila }); saveQ(q);
      sync();
    },
    pendientes() { return loadQ().length; },
    client() { return sb; }
  };

  window.AwCloud = AwCloud;
  init();
})();
