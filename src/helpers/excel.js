import * as XLSX from 'xlsx';

/**
 * Export data to an Excel file.
 * @param {Array<Object>} data - Array of objects to export.
 * @param {Array<string>} headers - Ordered list of Vietnamese headers.
 * @param {Array<string>} keys - Corresponding keys in data objects.
 * @param {string} fileName - Name of the downloaded file.
 * @param {string} sheetName - Name of the sheet inside the file.
 */
export const exportToExcel = (data, headers, keys, fileName = 'export.xlsx', sheetName = 'Sheet1') => {
  // Map data to have Vietnamese headers
  const formattedData = data.map((row) => {
    const formattedRow = {};
    headers.forEach((header, index) => {
      const key = keys[index];
      formattedRow[header] = row[key] !== undefined && row[key] !== null ? row[key] : '';
    });
    return formattedRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Save/Download file
  XLSX.writeFile(workbook, fileName);
};

/**
 * Parse an Excel file and map its columns.
 * @param {File} file - Excel file from input field.
 * @param {Object} columnMapping - Mapping of normalized keys to possible Excel headers in lowercase.
 * e.g., { code: ['mã tx', 'mã tài xế', 'ma tx', 'ma tai xe'], ... }
 * @returns {Promise<Array<Object>>}
 */
export const importFromExcel = (file, columnMapping) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of arrays (raw format) to handle flexible headers
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (rawRows.length === 0) {
          return resolve([]);
        }

        // Find headers row (usually the first row, or search for matching keys)
        const headers = rawRows[0].map(h => h ? h.toString().trim().toLowerCase() : '');
        const dataRows = rawRows.slice(1);
        
        // Map headers to key indexes
        const headerMap = {};
        Object.entries(columnMapping).forEach(([targetKey, possibleHeaders]) => {
          const index = headers.findIndex(h => 
            possibleHeaders.some(ph => h === ph.toLowerCase() || h.includes(ph.toLowerCase()))
          );
          if (index !== -1) {
            headerMap[targetKey] = index;
          }
        });

        // Parse rows
        const result = dataRows.map((row) => {
          const mappedRow = {};
          let hasData = false;
          
          Object.entries(headerMap).forEach(([targetKey, colIndex]) => {
            const val = row[colIndex];
            if (val !== undefined && val !== null && val !== '') {
              mappedRow[targetKey] = val;
              hasData = true;
            }
          });
          
          return hasData ? mappedRow : null;
        }).filter(r => r !== null);

        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
