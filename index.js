
var DBModule = require('./DBModule.js');
var Grid = require('gridfs-stream');
var mongoskin = require('mongoskin');

//Upload file to server and also update the database
exports.uploadContent = function (req, res) {
    console.log('Calling uploadFile inside FileUploadService');
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        console.log('uploadFile  after busboy   fieldname: ' + fieldname + ", file : " + file + ", filename : " + filename);
        // make sure the db instance is open before passing into `Grid`
        var gfs = Grid(DBModule.db, mongoskin);
        //Get metadata var host = req.headers['host']; 
        var metadata = {contentType: mimetype};
        var writestream = gfs.createWriteStream({filename: filename, metadata: metadata});
        file.pipe(writestream);
        writestream.on('close', function (file) {
            // return URL to acces the uploaded content 
            var path = "contents/" + file._id;
            res.json({"path": path});
        });

        writestream.on('error', function (err) {
            log.error({err: err}, 'Failed to upload file to database');
            res.status(constants.HTTP_CODE_INTERNAL_SERVER_ERROR);
            res.json({error: err});
        });
    });
};
//view file from database
exports.previewContent = function (req, res) {
    var contentId = new DBModule.BSON.ObjectID(req.params.contentid);
    console.log('Calling previewFile inside FileUploadService for content id ' + contentId);

    var gs = DBModule.db.gridStore(contentId, 'r');
    gs.read(function (err, data) {
        if (!err) {
            //res.setHeader('Content-Type', metadata.contentType);
            res.end(data);
        } else {
            log.error({err: err}, 'Failed to read the content for id ' + contentId);
            res.status(constants.HTTP_CODE_INTERNAL_SERVER_ERROR);
            res.json({error: err});
        }
    });
};
