
/**
 * 🚀 三灜地產後台 API (完全自動定位穩定版)
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0]; 
    var data = sheet.getDataRange().getValues();
    var output = [];
    
    if (data.length <= 1) return createJsonResponse([]);

    var updatedRows = false;

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      // A:日期(0), B:案名(1), C:地址(2), D:緯度(3), E:經度(4), F:顯示地址(5), G:售價(6), H:分店(7)
      var date = formatDate(row[0]);
      var name = String(row[1] || "未命名案件");
      var addr = String(row[2] || ""); 
      var lat = row[3];              
      var lng = row[4];              
      var price = String(row[6] || "面議");
      var branch = String(row[7] || "總店");

      // ✨ 自動定位邏輯
      if (addr && (!lat || !lng)) {
        try {
          var res = Maps.newGeocoder().geocode(addr);
          if (res.status === 'OK') {
            var loc = res.results[0].geometry.location;
            lat = loc.lat;
            lng = loc.lng;
            var displayAddr = addr.substring(0, addr.indexOf('號') > 0 ? addr.indexOf('號')-2 : 10) + "...";
            sheet.getRange(i + 1, 4, 1, 3).setValues([[lat, lng, displayAddr]]);
            updatedRows = true;
          }
        } catch (err) {
          console.error("定位失敗: " + addr);
        }
      }

      if (lat && lng) {
        output.push({
          date: date,
          name: name,
          address: addr,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          displayAddress: String(row[5] || addr),
          price: price,
          branch: branch
        });
      }
    }
    
    if (updatedRows) SpreadsheetApp.flush();
    return createJsonResponse(output);

  } catch (err) {
    return createJsonResponse({ error: err.message });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function formatDate(date) {
  if (date instanceof Date) {
    return Utilities.formatDate(date, "GMT+8", "yyyy-MM-dd");
  }
  return String(date);
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('📍 地圖工具')
    .addItem('🔄 強制手動同步所有定位', 'geocodeAll')
    .addToUi();
}

function geocodeAll() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var data = sheet.getDataRange().getValues();
  var count = 0;
  for (var i = 1; i < data.length; i++) {
    if (data[i][2] && !data[i][3]) {
      var res = Maps.newGeocoder().geocode(data[i][2]);
      if (res.status === 'OK') {
        var loc = res.results[0].geometry.location;
        sheet.getRange(i + 1, 4, 1, 3).setValues([[loc.lat, loc.lng, data[i][2].substring(0, 8) + "..."]]);
        count++;
      }
    }
  }
  SpreadsheetApp.getUi().alert('手動同步完成，共處理 ' + count + ' 筆！');
}
