var http = require('http');
var fs = require('fs');

var read_data_array;
var read_data_array_len;

var timer;



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
	if (count < read_data_array_len) {
		download(read_data_array[count], './hanyujia/' + count + '.jpg', ccb(count));
		count += 1;
		timer = setTimeout(downTimer, 50);
	};
}


fs.readFile("hanyujia.txt", 'utf8', function(err, data) {
  if (err) throw err;
  read_data_array = JSON.parse(data);
  read_data_array_len = read_data_array.length;
  console.log(read_data_array_len);
  downTimer();
});

// setTimeout(function(){
// /* 代码块... */
// setTimeout(arguments.callee, 10);
// }, 10);


