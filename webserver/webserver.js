var path = require('path');
var express = require('express')
var app = express();
var cors = require('cors');

var fs = require('fs'); //require filesystem module
var Client = require('ftp');

var imgListManager = require('./imageListManager');  
var DOWNLOAD_FOLDER = "ftp-downloads";

//var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
//var LED = new Gpio(4, 'out'); //use GPIO pin 4 as output
//var pushButton = new Gpio(17, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled


// create downloadfolder is not exists
if (!fs.existsSync(path.join(__dirname,DOWNLOAD_FOLDER))){
    fs.mkdirSync(path.join(__dirname,DOWNLOAD_FOLDER));
}
// read ftp configuration
var ftpconfig = JSON.parse(fs.readFileSync(path.join(__dirname,"ftp-config.json")));

// clear all images in download folder
fs.readdirSync(path.join(__dirname,DOWNLOAD_FOLDER))
        .forEach(file => {
            var fullFileName =path.join(path.join(__dirname,DOWNLOAD_FOLDER),file);
            fs.unlinkSync(fullFileName)
        });


var imageListManager = new imgListManager.manager(path.join(__dirname,'source-list.json'));
imageListManager.update(()=> { console.log("Files updated");});


var c = new Client();
c.on('ready', function() { console.log("connected to FTP"); });

//connect to localhost:21 as anonymous
c.connect({user:ftpconfig.user,password:ftpconfig.password , host:ftpconfig.host});


app.use(cors());

var servedImageCounter = 0;
app.get('/api/getNewPictureId',function(req,res,next) {
    console.log("api/getNewPicture Called");
    imageListManager.update(()=> {
        console.log(`Show all files length ${imageListManager.getFiles().length}`);
        var nextFilePath = path.join(ftpconfig.rootfolder, imageListManager.getNextFile());
        c.get(nextFilePath, function(err, stream) {
            console.log('download next now ...', nextFilePath);
            if (err) 
            {
                console.log("FTP failure ", err);
                next(err);
            } else {
                stream.once('close', function() {
                    // todo properties-reader - npm to set all props
                    console.log("download finished");
                    servedImageCounter = servedImageCounter + 1;
                    res.send({counter : servedImageCounter ,path:nextFilePath, label:path.basename(nextFilePath),meta:"todo-stream"});
                });
                stream.pipe(fs.createWriteStream (path.join(DOWNLOAD_FOLDER, servedImageCounter + '_' + path.basename(nextFilePath))));
            }
        });
    });
 
});


app.get('/api/getPicture/*', function (req, res) {
    fs.readdirSync(path.join(__dirname,DOWNLOAD_FOLDER))
        .forEach(file => {
            var split = file.split('_');
            if (split.length > 0){
            
                var fullFileName =path.join(path.join(__dirname,DOWNLOAD_FOLDER),file);
                if ( parseInt(split[0]) < (servedImageCounter -3) ){
                    console.log("served Id", servedImageCounter);
                    console.log("remove file ", fullFileName);
                    fs.unlinkSync(fullFileName)
                }
                console.log(` split :: ${split[0]} , served ${servedImageCounter} `);
                if (split[0] == servedImageCounter-1) {
                    console.log("found match ", fullFileName);
                    

                    var s = fs.createReadStream(fullFileName);
                    s.on('open', function () {
                        console.log("start reading and serving file ", fullFileName);
                        res.set('Content-Type', 'text/plain'); //correct mime type was not needed for chrome
                        s.pipe(res);
                    });
                    s.on('error', function () {
                        res.set('Content-Type', 'text/plain');
                        res.status(404).end('Not found');
                    });
                    return;            
                }
            }
        });

});
app.listen(3000);









// io.sockets.on('connection', function (socket) {// WebSocket Connection
//     console.log('on socket connection');
//     var lightvalue = 0; //static variable for current status
// //   pushButton.watch(function (err, value) { //Watch for hardware interrupts on pushButton
// //     if (err) { //if an error
// //       console.error('There was an error', err); //output error message to console
// //       return;
// //     }
// //     lightvalue = value;
// //     socket.emit('light', lightvalue); //send button status to client
// //   });
//   socket.on('light', function(data) { //get light switch status from client
//     lightvalue = data;
//     console.log('show light:',data);
//     // if (lightvalue != LED.readSync()) { //only change LED if status has changed
//     //   LED.writeSync(lightvalue); //turn LED on or off
//     // }
//   });
// });

// process.on('SIGINT', function () { //on ctrl+c
//    console.log('ending program');
//   //LED.writeSync(0); // Turn LED off
//   //LED.unexport(); // Unexport LED GPIO to free resources
//   //pushButton.unexport(); // Unexport Button GPIO to free resources
//   process.exit(); //exit completely
// });