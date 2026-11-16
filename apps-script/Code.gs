/**
 * Facil Japón — receptor de leads y progreso (Google Apps Script)
 *
 * Recibe dos tipos de mensajes desde el sitio (assets/js/fj-progress.js):
 *   - type "lead":     alta del usuario desde /licencia/ o desde el quiz.
 *   - type "progress": actualización de intentos, notas y tiempo.
 *
 * Ambos hacen UPSERT por correo: si el correo ya existe se actualiza su fila,
 * si no existe se crea una nueva. Así nadie aparece duplicado en el Excel.
 *
 * INSTALACIÓN
 *  1. Abre el Google Sheet de leads > Extensiones > Apps Script.
 *  2. Reemplaza el contenido de Code.gs por este archivo.
 *  3. Implementar > Administrar implementaciones > (lápiz) > Versión: "Nueva versión".
 *     Así la URL /exec NO cambia y el sitio sigue funcionando sin tocar nada.
 *  4. Si el script NO está vinculado a la hoja, escribe su ID en SHEET_ID.
 *
 * Si la fila 1 ya tiene encabezados, se reutilizan (ver ALIASES). Las columnas
 * que falten se agregan automáticamente al final.
 */

var SHEET_ID = '';            // opcional: ID del Sheet si el script no está vinculado a él
var SHEET_NAME = 'Leads';     // si no existe, se usa la primera hoja
var IGNORED = ['type'];       // campos que no se guardan como columna

// Nombre de columna aceptado por campo (comparación sin tildes ni mayúsculas).
var ALIASES = {
  name: ['nombre', 'name'],
  email: ['correo', 'email', 'e-mail', 'correo electronico'],
  country: ['pais', 'país', 'pais de licencia', 'country'],
  prefecture: ['prefectura', 'prefecture'],
  stage: ['etapa', 'stage'],
  need: ['necesidad', 'need'],
  createdAt: ['fecha', 'created', 'creado', 'created at']
};

// Campos que nunca se sobrescriben una vez creada la fila.
var KEEP_FIRST = ['createdAt', 'source', 'product', 'page', 'utm', 'userAgent'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var data = JSON.parse(e.postData.contents);
    var email = String(data.email || '').trim().toLowerCase();
    if (!email) return reply_({ ok: false, error: 'email requerido' });
    data.email = email;
    upsert_(getSheet_(), data);
    return reply_({ ok: true });
  } catch (err) {
    return reply_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return reply_({ ok: true, service: 'facil-japon-leads' });
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getSheet_() {
  var ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
}

function norm_(v) {
  return String(v).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

function upsert_(sheet, data) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getLastRow() ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  headers = headers.map(String);
  if (headers.length === 1 && headers[0] === '') headers = [];

  // Columna de cada campo; si no existe se crea al final.
  var col = {};
  Object.keys(data).forEach(function (key) {
    if (IGNORED.indexOf(key) !== -1) return;
    var names = [norm_(key)].concat((ALIASES[key] || []).map(norm_));
    var idx = -1;
    headers.forEach(function (h, i) { if (idx === -1 && names.indexOf(norm_(h)) !== -1) idx = i; });
    if (idx === -1) { headers.push(key); idx = headers.length - 1; }
    col[key] = idx;
  });
  if (headers.length > sheet.getLastColumn() || sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  // Busca la fila del usuario por correo.
  var emailCol = col.email;
  var lastRow = sheet.getLastRow();
  var row = -1;
  if (lastRow > 1) {
    var emails = sheet.getRange(2, emailCol + 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < emails.length; i++) {
      if (String(emails[i][0]).trim().toLowerCase() === data.email) { row = i + 2; break; }
    }
  }

  var width = headers.length;
  if (row === -1) {
    var fresh = new Array(width).fill('');
    Object.keys(col).forEach(function (k) { fresh[col[k]] = data[k]; });
    sheet.appendRow(fresh);
    return;
  }

  var current = sheet.getRange(row, 1, 1, width).getValues()[0];
  Object.keys(col).forEach(function (k) {
    var value = data[k];
    if (value === '' || value === null || value === undefined) return;
    if (KEEP_FIRST.indexOf(k) !== -1 && current[col[k]] !== '') return;
    current[col[k]] = value;
  });
  sheet.getRange(row, 1, 1, width).setValues([current]);
}
