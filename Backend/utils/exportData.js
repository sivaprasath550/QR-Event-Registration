const { Parser } = require('json2csv');

const exportToCSV = (data) => {
  try {
    const parser = new Parser();
    return parser.parse(data);
  } catch (err) {
    throw err;
  }
};

const exportToJSON = (data) => {
  return JSON.stringify(data, null, 2);
};

module.exports = { exportToCSV, exportToJSON };