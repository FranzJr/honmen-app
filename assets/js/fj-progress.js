/**
 * Facil Japón — perfil y progreso del usuario (compartido entre /licencia/ y /quiz/)
 *
 * Todo se guarda en localStorage (mismo origen), así que un usuario registrado
 * en una página es reconocido en la otra. Los datos se envían además al Google
 * Apps Script (apps-script/Code.gs), que actualiza la fila del usuario por correo.
 */
(function (global) {
  'use strict';

  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbyKebbb6peIQMHAo8zoUZYfvRqaTad70bq81Rd3e2aNZUzdLZVh8xNnYPRFkp5aWiXl/exec';
  var K_PROFILE = 'fj_profile';
  var K_ATTEMPTS = 'fj_attempts';
  var K_PENDING = 'fj_sync_pending';
  var PASS = 45;
  var MAX_ATTEMPTS = 500;

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }

  function getProfile() {
    var p = read(K_PROFILE, null);
    return p && p.email ? p : null;
  }
  function saveProfile(p) {
    p.email = String(p.email || '').trim().toLowerCase();
    return write(K_PROFILE, p) ? p : null;
  }

  // Cada intento: [timestamp, puntaje, total de preguntas, segundos invertidos]
  function getAttempts() {
    var a = read(K_ATTEMPTS, []);
    return Array.isArray(a) ? a : [];
  }
  function addAttempt(score, total, seconds) {
    var list = getAttempts();
    list.push([Date.now(), score, total, Math.max(0, Math.round(seconds))]);
    if (list.length > MAX_ATTEMPTS) list = list.slice(-MAX_ATTEMPTS);
    write(K_ATTEMPTS, list);
  }

  function hash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  // Puesto motivacional (no proviene de datos reales): parte cerca del final de
  // un top 100 y sube conforme mejoran la mejor nota y el promedio reales.
  function rankFor(best, avg, email) {
    var t = Math.max(0, Math.min(1, (0.7 * best + 0.3 * avg) / 50));
    var jitter = hash(email || 'fj') % 5 - 2;
    return Math.max(10, Math.min(99, Math.round(97 - Math.pow(t, 1.6) * 80) + jitter));
  }

  function summary() {
    var list = getAttempts();
    var profile = getProfile();
    var s = { attempts: list.length, best: 0, avg: 0, totalSec: 0, last: 0, lastAt: 0, passed: false, rank: null };
    if (!list.length) return s;
    var sum = 0;
    list.forEach(function (a) {
      sum += a[1];
      s.totalSec += a[3] || 0;
      if (a[1] > s.best) s.best = a[1];
    });
    var last = list[list.length - 1];
    s.last = last[1];
    s.lastAt = last[0];
    s.avg = Math.round((sum / list.length) * 10) / 10;
    s.passed = s.best >= PASS;
    s.rank = rankFor(s.best, s.avg, profile && profile.email);
    return s;
  }

  function fmtTime(sec) {
    sec = Math.round(sec || 0);
    if (sec < 60) return sec + 's';
    var m = Math.round(sec / 60);
    if (m < 60) return m + 'm';
    return Math.floor(m / 60) + 'h ' + (m % 60) + 'm';
  }

  function post(payload) {
    try {
      return fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) })
        .then(function () { return true; })
        .catch(function () { return false; });
    } catch (e) { return Promise.resolve(false); }
  }

  function progressFields() {
    var s = summary();
    return {
      attempts: s.attempts,
      bestScore: s.best,
      avgScore: s.avg,
      totalTimeSec: s.totalSec,
      lastScore: s.last,
      lastAttemptAt: s.lastAt ? new Date(s.lastAt).toISOString() : '',
      passed: s.passed ? 'sí' : 'no',
      updatedAt: new Date().toISOString()
    };
  }

  // Actualiza la fila del usuario ya registrado; si no hay conexión queda pendiente.
  function syncProgress() {
    var p = getProfile();
    if (!p) return Promise.resolve(false);
    try { localStorage.setItem(K_PENDING, '1'); } catch (e) {}
    var payload = Object.assign({ type: 'progress', email: p.email, name: p.name || '' }, progressFields());
    return post(payload).then(function (ok) {
      if (ok) { try { localStorage.removeItem(K_PENDING); } catch (e) {} }
      return ok;
    });
  }

  // Alta (o actualización) del usuario junto con sus estadísticas actuales.
  function sendLead(lead) {
    return post(Object.assign({ type: 'lead' }, lead, progressFields()));
  }

  function flushPending() {
    try { if (localStorage.getItem(K_PENDING) && getProfile()) syncProgress(); } catch (e) {}
  }

  function clearAll() {
    try {
      localStorage.removeItem(K_PROFILE);
      localStorage.removeItem(K_ATTEMPTS);
      localStorage.removeItem(K_PENDING);
    } catch (e) {}
  }

  global.FJ = {
    ENDPOINT: ENDPOINT, PASS: PASS,
    getProfile: getProfile, saveProfile: saveProfile,
    getAttempts: getAttempts, addAttempt: addAttempt,
    summary: summary, fmtTime: fmtTime,
    syncProgress: syncProgress, sendLead: sendLead, flushPending: flushPending,
    clearAll: clearAll
  };
})(window);
