document.body.innerHTML = '';
document.body.innerHTML = "<p id='photos_length'></p><div id='img_urls' style='word-break: break-all;'></div>";

var _photos_length = document.getElementById('photos_length');
var _img_urls = document.getElementById('img_urls');

var user_id = 1830527910;
var photo_ids = [];
var original_img_urls = [];

var timer;
var steps;
var processed_ids_length;
var photo_ids_length;
var remaining_ids_length;
var start_index;

function get_photo_ids() {
    var request = new XMLHttpRequest();
    request.open("GET", "http://photo.weibo.com/photos/get_photo_ids?uid=" + user_id + "&album_id=0&type=3&__rnd=" + (new Date).valueOf(), true);

    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            var data = JSON.parse(request.responseText);
            photo_ids = data.data;
            _photos_length.innerHTML = data.data.length;
            photo_ids_length = photo_ids.length;
            steps = 7;
            processed_ids_length = 0;
            remaining_ids_length = photo_ids_length - processed_ids_length;
            start_index = processed_ids_length;
            process_ids();
        } else {
        // We reached our target server, but it returned an error

        }
    };

    request.onerror = function() {
    // There was a connection error of some sort
    };

    request.send();
}

function process_ids() {
    steps = remaining_ids_length >= 7 ? 7 : remaining_ids_length;
    var ids = photo_ids.slice(start_index, start_index + steps).join();
    get_urls(ids);
    processed_ids_length += steps;
    start_index = processed_ids_length;
    remaining_ids_length = photo_ids_length - processed_ids_length;
    if (processed_ids_length < photo_ids_length) {
        timer = setTimeout(process_ids, 1000);
    } else {
        console.log("done!");
    };
}
function get_urls(ids) {
    // get multiples
    var request = new XMLHttpRequest();
    request.open("GET", "http://photo.weibo.com/photos/get_multiple?uid=" + user_id + "&ids=" + ids + "&type=3&__rnd=" + (new Date).valueOf(), true);

    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            var data = JSON.parse(request.responseText);
            var _data = data.data;
            var ids_array = JSON.parse("[" + ids + "]");
            var ids_array_length = ids_array.length;


            for (var i = 0; i < ids_array_length; i++) {
                var per_key = ids_array[i];

                var original_img_url = _data[per_key].large_pic_tmp;
                original_img_urls.push(original_img_url);
                _img_urls.insertAdjacentHTML('beforeend', original_img_url + ",");
            }
            ;


        } else {
        // We reached our target server, but it returned an error

        }
    };

    request.onerror = function() {
    // There was a connection error of some sort
    };
    request.send();

}
get_photo_ids();