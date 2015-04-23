document.body.innerHTML = '';
document.body.innerHTML = "<p id='photos_length'></p><div id='img_urls' style='word-break: break-all;'></div>";

var _photos_length = document.getElementById('photos_length');
var _img_urls = document.getElementById('img_urls');

var user_id = 1823136207;
var album_id_list = {};
var _album_len = 0;
var loopedAlbumQuantity = 0;
var photo_ids = [];
var original_img_urls = [];

var timer;
var preset_steps = 14;
var current_steps;
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
            current_steps = preset_steps;
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
    current_steps = remaining_ids_length >= preset_steps ? preset_steps : remaining_ids_length;
    var ids = photo_ids.slice(start_index, start_index + current_steps).join();
    get_urls(ids);
    processed_ids_length += current_steps;
    start_index = processed_ids_length;
    remaining_ids_length = photo_ids_length - processed_ids_length;
    if (processed_ids_length < photo_ids_length) {
        timer = setTimeout(process_ids, 300);
    } else {
        console.log(photo_ids.length)
        console.log(original_img_urls.length)
        console.log("done!");
    };
}
function get_urls(ids) {
    // get multiples
    var request = new XMLHttpRequest();
    // request.open("GET", "http://photo.weibo.com/photos/get_multiple?uid=" + user_id + "&ids=" + ids + "&type=3&__rnd=" + (new Date).valueOf(), true);
    request.open("GET", "http://photo.weibo.com/photos/get_multiple?uid=" + user_id + "&ids=" + ids + "&type=3", true);

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
                _img_urls.insertAdjacentHTML('beforeend', '"' + original_img_url + '",');
            };

        } else {
        // We reached our target server, but it returned an error

        }
    };

    request.onerror = function() {
    // There was a connection error of some sort
    };
    request.send();

}
function loopAlbums() {
    for(var per_album_id in album_id_list) {
        if (album_id_list.hasOwnProperty(per_album_id)) {
            loopedAlbumQuantity += 1;
            getAlbumPhotos(per_album_id);
        };
    }
}
function getAllAlbums(user_id) {
    var request = new XMLHttpRequest();
    request.open("GET", "http://photo.weibo.com/albums/get_all?uid=" + user_id + "&page=1&count=1000&__rnd=" + (new Date).valueOf(), true);
    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            var data = JSON.parse(request.responseText);
            var _data = data.data;
            var _album_list = _data.album_list;

             _album_len = _data.album_list.length;
            for (var i = 0; i < _album_len; i++) {
                if (_album_list[i].count.photos > 0) {
                    var node = {
                        "photos_count": _album_list[i].count.photos,
                        "album_type": _album_list[i].type
                    };
                    album_id_list[_album_list[i].album_id] = node;
                };

            };
            loopAlbums();
        } else {
        // We reached our target server, but it returned an error
        }
    };
    request.onerror = function() {
    // There was a connection error of some sort
    };
    request.send();
}
function getAlbumPhotos(album_id) {
    var request = new XMLHttpRequest();
    var per_album = album_id_list[album_id];
    var count = per_album.photos_count;
    var type = per_album.album_type;
    request.open("GET", "http://photo.weibo.com/photos/get_all?uid=" + user_id + "&album_id=" + album_id + "&count=" + count + "&page=1&type=" + type + "&__rnd=" + (new Date).valueOf(), true);
    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            var data = JSON.parse(request.responseText);
            var _data = data.data;
            for (var i = 0; i < count; i++) {
                photo_ids.push(_data.photo_list[i].photo_id);
            };
            if (loopedAlbumQuantity === _album_len) {
                _photos_length.innerHTML = photo_ids.length;
                photo_ids_length = photo_ids.length;
                current_steps = preset_steps;
                processed_ids_length = 0;
                remaining_ids_length = photo_ids_length - processed_ids_length;
                start_index = processed_ids_length;
                process_ids();
            };
        } else {
        // We reached our target server, but it returned an error
        }
    };
    request.onerror = function() {
    // There was a connection error of some sort
    };
    request.send();
}

// 面孔专辑 type=45
// 头像相册 type=18
// 微博配图 type=3
// 默认专辑 type=24
// get_all API's max count is 100, or [] is returned.!!!!
// get_photo_ids API without count get the first 2000 once and only.
// http://photo.weibo.com/photos/get_all?uid=1823136207&album_id=3556886684034126&count=2000&page=1&type=3
// http://photo.weibo.com/photos/get_all?uid=1823136207&album_id=3556886684034126&count=30&page=1&type=3&__rnd=1429780718807
// http://photo.weibo.com/photos/get_photo_ids?uid=1823136207&album_id=0&type=3&__rnd=1429781325373
// get_photo_ids();
getAllAlbums(user_id);
