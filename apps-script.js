/**
 * Google Apps Script - Invitación Baby Shower
 * 
 * INSTRUCCIONES DE DESPLIEGUE:
 * 1. Ve a extensiones -> Apps Script en tu Google Sheet.
 * 2. Pega este código en Código.gs.
 * 3. Ejecuta la función `setup()` una vez para crear las hojas necesarias.
 * 4. Ve a "Implementar" -> "Nueva implementación".
 * 5. Tipo: "Aplicación web".
 * 6. Ejecutar como: "Tú".
 * 7. Quién tiene acceso: "Cualquier persona".
 * 8. Copia la URL de la aplicación web y pégala en `script.js` (SCRIPT_URL).
 */

const SHEET_RSVP = 'RSVP';
const SHEET_REGALOS = 'Regalos';

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (!ss.getSheetByName(SHEET_RSVP)) {
    const rsvp = ss.insertSheet(SHEET_RSVP);
    rsvp.appendRow(['Fecha', 'Nombre', 'Acompañantes', 'Asistencia']);
    rsvp.getRange("A1:D1").setFontWeight("bold");
    rsvp.setFrozenRows(1);
  }
  
  if (!ss.getSheetByName(SHEET_REGALOS)) {
    const regalos = ss.insertSheet(SHEET_REGALOS);
    regalos.appendRow(['Fecha', 'Regalo']);
    regalos.getRange("A1:B1").setFontWeight("bold");
    regalos.setFrozenRows(1);
  }
}

function doPost(e) {
  try {
    // Usamos text/plain desde el frontend para evitar CORS OPTIONS, 
    // pero el contenido es un string JSON.
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (data.action === 'rsvp') {
      const sheet = ss.getSheetByName(SHEET_RSVP);
      sheet.appendRow([
        new Date(), 
        data.name, 
        data.companions, 
        data.status
      ]);
      return ContentService.createTextOutput(JSON.stringify({success: true}))
                           .setMimeType(ContentService.MimeType.JSON);
                           
    } else if (data.action === 'gift') {
      const sheet = ss.getSheetByName(SHEET_REGALOS);
      sheet.appendRow([
        new Date(), 
        data.gift
      ]);
      return ContentService.createTextOutput(JSON.stringify({success: true}))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: false, error: "Acción no válida"}))
                         .setMimeType(ContentService.MimeType.JSON);
                         
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    if (e.parameter.action === 'gifts') {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(SHEET_REGALOS);
      
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify([]))
                             .setMimeType(ContentService.MimeType.JSON);
      }
      
      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return ContentService.createTextOutput(JSON.stringify([]))
                             .setMimeType(ContentService.MimeType.JSON);
      }
      
      const gifts = [];
      // Empezar en 1 para saltar la fila de encabezado
      for (let i = 1; i < data.length; i++) {
        if (data[i][1]) {
          gifts.push(data[i][1]); // Columna 2: Regalo
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify(gifts))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput("Backend Activo.");
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}
