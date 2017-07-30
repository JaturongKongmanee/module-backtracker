function getAbsolutePathFromRequire(startPath, requiredPath){
    const startPathList = startPath.split(/[\\/]/);
    const requiredPathList = requiredPath.split(/[\\/]/);
    var countDD = 0;
    var countD = 0;

    requiredPathList.forEach((element) => {
        if (element === '..'){
            countDD += 1;
        }
        if (element === '.'){
            countD += 1;
        }
    });

    if (countDD === 0 && countD === 0) return;

    return requiredPathList[0] != '.' ? startPathList.slice(0, startPathList.length - (countDD + 1))
    .concat(requiredPathList.slice(countDD)).join('/') :
    startPathList.slice(0, startPathList.length - (countDD + 1))
    .concat(requiredPathList.slice(countDD + 1)).join('/');
};

function getAbsolutePathFromImport(startPath, importedPath){
    const startPathList = startPath.split(/[\\/]/);
    const functionUsed = importedPath[1].trim().split(/\s*,\s*/);
    const importedPathList = importedPath[2].split(/[\\/]/);

    var countDD = 0;
    var countD = 0;

    importedPathList.forEach((element) => {
        if (element === '..'){
            countDD += 1;
        }
        if (element === '.'){
            countD += 1;
        }
    });

    if (countDD === 0 && countD === 0) return;

    result = [];

    functionUsed.forEach((fn) => {
        //console.log(fn);
        if (importedPathList[0] != '.') {
            result.push(startPathList.slice(0, startPathList.length - (countDD + 1)).concat(importedPathList.slice(countDD)).join('\\') + `.js!${fn}`);
        } else {
            result.push(startPathList.slice(0, startPathList.length - (countDD + 1)).concat(importedPathList.slice(countDD + 1)).join('\\') + `.js!${fn}`);
        }
    });

    // console.log(result);
    return result;
};


exports.getAbsolutePathFromImport = getAbsolutePathFromImport;