const   Xlsx  = require('xlsx'),
        Csv   = require('csv-parse');

module.exports = function xlsxConverter(pathToXlsx) {
    return new Promise((resolve, reject) => {
        let workbook;

        try {
            workbook = Xlsx.readFile(pathToXlsx);
        } catch (e) {
            return reject(e);
        }

        return new Promise((resolve, reject) => {
            Csv(Xlsx.utils.sheet_to_csv(
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
