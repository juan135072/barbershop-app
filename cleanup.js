// Este script elimina todos los archivos de API relacionados con NextAuth
// Ejecútalo con: node cleanup.js

const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'src', 'app', 'api');

function removeDirectoryRecursive(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        removeDirectoryRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
        console.log(`Deleted file: ${curPath}`);
      }
    });
    fs.rmdirSync(dirPath);
    console.log(`Deleted directory: ${dirPath}`);
  }
}

try {
  removeDirectoryRecursive(apiDir);
  console.log('Cleanup completed successfully');
} catch (error) {
  console.error('Error during cleanup:', error);
}