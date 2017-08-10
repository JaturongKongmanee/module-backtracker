const fs = require('fs');
const path = require('path');
const os = require('os');

const folderSeperator = (os.platform() == 'linux' || os.platform() == 'darwin') ? '/' : '\\';

const getAbsolutePathFromImport = (startPath, referenceString, moduleName) => {
    if(/\.\.\/|\.\//.test(moduleName)){
        const startPathList = startPath.split(/[\\/]/);
        const referenceList = referenceString.trim().split(/\s*,\s*/);
        const moduleAbsolutePath = path.resolve(moduleName);
        const references = referenceList.map((ref) => {
            return `${path.join(path.dirname(startPath), moduleAbsolutePath)}.js!${ref}`;
        });

        return references;
    }
    return;
};

const listAllFiles = (startPath, filter, callback) => {
    if (!fs.existsSync(startPath)) {
        console.log("no dir ",startPath);
        return;
    }

    let matchFileCount = 0;
    let files = fs.readdirSync(startPath);
    for(let i = 0; i < files.length; i++) { 
        let from = path.join(startPath,files[i]);
        let stat = fs.lstatSync(from);

        if (stat.isDirectory()){
            matchFileCount += listAllFiles(from, filter, callback);
        }
        else if (filter.test(from)) {
            matchFileCount++;

            // TODO: remove setTimeout, used for testing
            setTimeout(() => { fs.readFile(from, {encoding: 'utf-8'}, callback.bind(null, from)) }, 1000*(6-matchFileCount) );
        } 
    };

    return matchFileCount;
};

exports.listAllFiles = listAllFiles;
exports.getAbsolutePathFromImport = getAbsolutePathFromImport;