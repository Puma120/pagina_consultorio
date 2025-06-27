// src/utils/csvUtils.js

export function generateCSV(dataObj, filename) {
  const headers = Object.keys(dataObj).join(',');
  const values = Object.values(dataObj).join(',');
  const csvContent = `data:text/csv;charset=utf-8,${headers}\n${values}`;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
