var http = require('http');
var fs = require('fs');

var read_data_array;
var read_data_array_len;

var timer;

var fix_array = [];



var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);
    });
  });
};

var ccb = function(str) {
	console.log(str);
};

var count = 0;
function downTimer() {
  for (var i = 0; i <= fix_array.length - 1; i++) {
    count = fix_array[i]
    // if (count < read_data_array_len) {
      download(read_data_array[count], count + '.jpg', ccb(count));
      // timer = setTimeout(downTimer, 50);
    // };
  };
}


fs.readFile("suo.txt", 'utf8', function(err, data) {
  if (err) throw err;
  read_data_array = JSON.parse(data);
  read_data_array_len = read_data_array.length;
  console.log(read_data_array_len);
  fix_array = [367,399,407,544,550,654,943];
  downTimer();
});

// setTimeout(function(){
// /* 代码块... */ 
// setTimeout(arguments.callee, 10); 
// }, 10); 


