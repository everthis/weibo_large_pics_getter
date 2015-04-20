// Dependencies
var fs = require('fs');
var url = require('url');
var http = require('http');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

// App variables
var file_url = '';
var DOWNLOAD_DIR = 'hanyujia';

var read_data_array;
var read_data_array_len;
var count = 0;
var timer;

// Function to download file using HTTP.get
var download_file_httpget = function(file_url) {
    var options = {
        host: url.parse(file_url).host,
        port: 80,
        path: url.parse(file_url).pathname
    };

    var file_name = url.parse(file_url).pathname.split('/').pop();
    var file = fs.createWriteStream(DOWNLOAD_DIR + file_name);

    http.get(options, function(res) {
        res.on('data', function(data) {
            file.write(data);
        }).on('end', function() {
            file.end();
            console.log(file_name + ' downloaded to ' + DOWNLOAD_DIR);
        });
    });
};



// Function to download file using curl
var download_file_curl = function(file_url) {

    // extract the file name
    var file_name = url.parse(file_url).pathname.split('/').pop();
    // create an instance of writable stream
    var file = fs.createWriteStream(DOWNLOAD_DIR + file_name);
    // execute curl using child_process' spawn function
    var curl = spawn('curl', [file_url]);
    // add a 'data' event listener for the spawn instance
    curl.stdout.on('data', function(data) {
        file.write(data);
    });
    // add an 'end' event listener to close the writeable stream
    curl.stdout.on('end', function(data) {
        file.end();
        console.log(file_name + ' downloaded to ' + DOWNLOAD_DIR);
    });
    // when the spawn child process exits, check if there were any errors and close the writeable stream
    curl.on('exit', function(code) {
        if (code != 0) {
            console.log('Failed: ' + code);
        }
    });
};




// Function to download file using wget
var download_file_wget = function(file_url) {

    // extract the file name
    var file_name = url.parse(file_url).pathname.split('/').pop();
    // compose the wget command
    var wget = 'wget -P ' + DOWNLOAD_DIR + ' ' + file_url;
    // excute wget using child_process' exec function

    var child = exec(wget, function(err, stdout, stderr) {
        if (err) {
            throw err;
        } else {
            console.log(file_name + ' downloaded to ' + DOWNLOAD_DIR);
            startDownload();
        }
    });
};

function ensureExists(path, mask, cb) {
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
            else cb(err); // something else went wrong
        } else cb(null); // successfully created folder
    });
}


function makeDir() {
    // ensureExists usage
    ensureExists(DOWNLOAD_DIR, 0744, function(err) {
        if (err) {
            throw err; // handle folder creation error
        } else {
            console.log("directory ok!"); // we're all good
        }
    });
};

function multiProcess(num) {
    for (var i = 0; i < num; i++) {
        download_file_wget(read_data_array[count]);
        count += 1;
    };
}
function startDownload() {
        if (count < read_data_array_len) {
            download_file_wget(read_data_array[count]);
            count += 1;
            // timer = setTimeout(startDownload, 300);
        } else {
            console.log(count + "loop over!");
        };
    }
    // function startDownload() {
    //     for (var i = 0; i < read_data_array_len; i++) {
    //         download_file_wget(read_data_array[i]);
    //     };
    // }

function processData(data) {
    data = data.replace(/http/g, '"http');
    data = data.replace(/\.jpg/g, '.jpg"');
    return data;
}

function readTxt() {
    fs.readFile("hanyujia.txt", 'utf8', function(err, data) {
        if (err) throw err;
        if (data.indexOf('http') === 1) {
            data = processData(data);
        };
        read_data_array = JSON.parse(data);
        read_data_array_len = read_data_array.length;
        console.log(read_data_array_len);
        multiProcess(10);
    });
}
readTxt();
