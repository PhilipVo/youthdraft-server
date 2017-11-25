const   xlsx  = require('xlsx'),
        csv   = require('csv-parse'),
        path  = require('path'),
        fs    = require('file-system');

module.exports = function xlsxConverter(pathToXlsx) {
  return new Promise((resolve, reject) => {
    let workbook;
    const ext = path.extname(pathToXlsx)
    if (ext == ".xlsx") {
      try {
        workbook = xlsx.readFile(pathToXlsx);
        fs.unlink(pathToXlsx, error => {
          return reject(error);
        });
      } catch (error) {
        fs.unlink(pathToXlsx, error => {
          return reject(error);
        });
        return reject(error);
      }
    } else {
      fs.readFile(pathToXlsx, (error, data) => {
        if (error)
          return reject(error);
        workbook = data;
      });
    }
    return new Promise((resolve, reject) => {
      csv(xlsx.utils.sheet_to_csv(
        workbook.Sheets[workbook.SheetNames[0]],
        {blankrows: false}),
        (err, records) => {
          if (err) {
            return reject(err);
          }
          resolve(records.splice(1));
      });
    }).then(jsonValueArrays => {
      resolve(jsonValueArrays);
    }).catch(reject)

  })
};
