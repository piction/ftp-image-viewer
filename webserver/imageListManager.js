var fs = require('fs'); //require filesystem module


function ImageListManager( filePath) {
    this.lastImageListTime = null;
    this.filePath = filePath;
    this.fileList = [];
    this.currentFileId = 0;
}

ImageListManager.prototype.update = function(callback) {
    var internal = this; // due to lexial scope
    var callBackFunc = callback;

    fs.stat(internal.filePath, function(err, stats){
        if (err) throw err;
        var mtime = new Date(stats.mtime);

        // check if fileList should be updated
        if ( internal.lastImageListTime != null && mtime <= internal.lastImageListTime ) {
            //console.log("skiped reading!")
            callBackFunc();
            return;
        }

        internal.lastImageListTime = mtime;
        // read file with list of iamges from NAS
        fs.readFile(internal.filePath, (err, data) => {
            if (err) throw err;
            internal.fileList = JSON.parse(data).files;
            console.log("updated list of images ");
            callBackFunc();
            return;
        });
    });
}
ImageListManager.prototype.getFiles = function() {
    return this.fileList;
}

ImageListManager.prototype.getNextFile = function() {
    var current = this.currentFileId;
    if ( this.fileList != null && this.fileList.length != 0 && current < this.fileList.length-2) {
        this.currentFileId++;
    }    
    
    if ( this.fileList == null || this.fileList.length == 0) {
        return null;
    }
    if ( current < this.fileList.length - 1 )
        return this.fileList[current];
    return this.fileList[0];
}


exports.manager = ImageListManager;