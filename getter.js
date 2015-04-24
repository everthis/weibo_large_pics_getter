var WEIBO = {};
WEIBO.settings = {
    "user_id": 1876510327,
    "pagecount": 100
};
WEIBO.init = function() {
    this.page = 1;
};
WEIBO.clearPage = function() {
    document.body.innerHTML = '';
    document.body.innerHTML = "<p id='photos_length'></p><div id='img_urls' style='word-break: break-all;'></div>";
};
WEIBO.XHR = function(method, url, isasync, callback) {
    var request = new XMLHttpRequest(),
        _this = this;
    request.open(method, url + "&__rnd=" + (new Date).valueOf(), isasync);
    request.onload = function() {
        if (request.status === 200 && request.readyState === 4) {
            callback.call(_this, request.responseText);
        }
    };
    request.onerror = function() {};
    request.send();
};

WEIBO.getAllAlbums = function(user_id) {
    this.clearPage();
    var _this = this;
    this.XHR("GET", "http://photo.weibo.com/albums/get_all?uid=" + user_id + "&page=1&count=1000", true, this.getAllAlbums_callback);
};
WEIBO.getAllAlbums_callback = function(request) {
    var data = JSON.parse(request).data;
    var album_list = data.album_list;

    var album_len = data.album_list.length;
    this.albums_id_list = {};
    for (var i = 0; i < album_len; i++) {
        if (album_list[i].count.photos > 0) {
            var node = {
                "photos_count": album_list[i].count.photos,
                "album_type": album_list[i].type
            };
            this.albums_id_list[album_list[i]["album_id"]] = node;
        };
    };
    this.getGeneratedAlbumsLength();
    this.loopAlbums();
};
WEIBO.getGeneratedAlbumsLength = function() {
    this.generatedAlbumsLength = 0;
    for(var key in this.albums_id_list) {
        if (this.albums_id_list.hasOwnProperty(key)) this.generatedAlbumsLength += 1;
    };
};

WEIBO.loopAlbums = function() {
    this.loopedAlbumQuantity = 0;
    this.photos_id_type = [];
    for(var per_album_id in this.albums_id_list) {
        if (this.albums_id_list.hasOwnProperty(per_album_id)) {
            this.getIDsOfAlbum(per_album_id);
        };
    }
};

WEIBO.getAlmostFirstTwoThousandIDs = function(album_id) {
    var type = this.albums_id_list[album_id][album_type];
    this.XHR("GET", "http://photo.weibo.com/photos/get_photo_ids?uid=" + this.settings.user_id + "&album_id=" + album_id + "&type=" + type, true, this.getAlmostFirstTwoThousandIDs_callback);
};
WEIBO.getAlmostFirstTwoThousandIDs_callback = function(request) {
    var data = JSON.parse(request).data;
        this.first_packet_photo_ids = data;
        this.first_packet_length = data.length;
};

WEIBO.getIDsOfPage = function(user_id, album_id, count, page, type, callback) {
    this.XHR("GET", "http://photo.weibo.com/photos/get_all?uid=" + user_id + "&album_id=" + album_id + "&count=" + count + "&page=" + page + "&type=" + type, true, callback);
};
WEIBO.getIDsOfAlbum = function(album_id) {
    var per_album = this.albums_id_list[album_id];
    var album_count = per_album.photos_count;
    var type = per_album.album_type;
    this.page = 1;
    this.remaining_count = album_count;

    this.getIDsOfPage(this.settings.user_id, album_id, this.settings.pagecount, this.page, type, this.getIDsOfAlbum_callback.call(this, album_id));
};

WEIBO.getIDsOfAlbum_callback = function(album_id) {
    return function(request) {
        var data = JSON.parse(request).data;
        var album_photos = this.albums_id_list[album_id]["photos_count"];
        var node = {};
            node["type"] = this.albums_id_list[album_id]["album_type"];
            node["ids"] = [];

        for (var i = 0; i < album_photos; i++) {
            node.ids.push(data.photo_list[i].photo_id);
        };
        this.photos_id_type.push(node);
        this.loopedAlbumQuantity += 1;
        if (this.loopedAlbumQuantity === this.generatedAlbumsLength) {
            console.log("ok");
        };
    };
};

WEIBO.preprocessIDs = function() {
    var preset_steps = 14;
    for (var i = 0; i < this.photos_id_type.length; i++) {
        this.photo_ids_length = this.photos_id_type[i]["ids"].length;
        this.current_steps = preset_steps;
        this.processed_ids_length = 0;
        this.remaining_ids_length = this.photo_ids_length - this.processed_ids_length;
        this.start_index = processed_ids_length;
        this.type = this.photos_id_type[i]["type"];
        this.processIDs();
    };
};
WEIBO.processIDs = function() {
    this.current_steps = remaining_ids_length >= preset_steps ? preset_steps : remaining_ids_length;
    var ids = this.photos_id_type[i]["ids"].slice(this.start_index, this.start_index + this.current_steps).join();
    this.getURLs(this.type, ids);
};
WEIBO.postprocessIDs = function() {
    processed_ids_length += current_steps;
    start_index = processed_ids_length;
    remaining_ids_length = photo_ids_length - processed_ids_length;
    if (processed_ids_length < photo_ids_length) {
        timer = setTimeout(process_ids, 300);
    } else {
        console.log("done!");
    };
};

/**
 * [can't process mixed types]
 * @param  {[type]} type [description]
 * @param  {[type]} ids  [description]
 * @return {[type]}      [description]
 */
WEIBO.getURLs = function(type, ids) {
    this.XHR("GET", "http://photo.weibo.com/photos/get_multiple?uid=" + this.settings.user_id + "&ids=" + ids + "&type=" + type, true, this.getURLs_callback);
};
WEIBO.getURLs_callback = function() {

};


WEIBO.getAllAlbums(WEIBO.settings.user_id);