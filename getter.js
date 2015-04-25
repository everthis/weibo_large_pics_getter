'use strict';
var WEIBO = {};
WEIBO.settings = {
    "user_id": 1596931083,
    "pagecount": 100,
    "steps": 14
};
WEIBO.init = function() {
    this.page = 1;    
    this.getAllAlbums(WEIBO.settings.user_id);
    this.imgURLs = [];
    this.isLoopOver = false;
};
WEIBO.clearPage = function() {
    document.body.innerHTML = '';
    document.getElementsByTagName('head')[0].innerHTML = '';
    document.body.innerHTML = "<p id='photos_length' style='margin: 0;'></p><div id='img_urls' style='word-break: break-all;'></div>";
    this.$img_urls = document.getElementById('img_urls');
};
WEIBO.XHR = function(method, url, isasync, callback) {
    var request = new XMLHttpRequest(),
        _this = this;
    request.open(method, url + "&__rnd=" + (new Date).valueOf(), isasync);
    request.onload = function() {
        if (request.status === 200 && request.readyState === 4) {
            var cb = callback.bind(_this,request.responseText);
            cb();
        } else if (request.status === 408) {
            console.log('retrying...');
            _this.XHR(method, url, isasync, callback);
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
    this.albums_id_arr = [];
    for(var per_album_id in this.albums_id_list) {
        if (this.albums_id_list.hasOwnProperty(per_album_id)) {
            this.albums_id_arr.push(per_album_id);
        };
    }
    this.getIDsOfAlbum(this.albums_id_arr[0]);
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
    this.typeNode = {};
    this.typeNode["type"] = this.albums_id_list[album_id]["album_type"];
    this.typeNode["ids"] = [];
    this.page = 1;
    this.remaining_count = album_count;

    this.getIDsOfPage(this.settings.user_id, album_id, this.settings.pagecount, this.page, type, this.getIDsOfAlbum_callback.call(this, album_id, type));
};

WEIBO.getIDsOfAlbum_callback = function(album_id, type) {
    return function(request) {
        var data = JSON.parse(request).data;
        var album_photos = this.albums_id_list[album_id]["photos_count"];       
        var maxPages = Math.ceil(album_photos / this.settings.pagecount);

        for (var i = 0; i < data.photo_list.length; i++) {
            this.typeNode['ids'].push(data.photo_list[i]["photo_id"]);
        };
        if (this.page === maxPages) {
            this.photos_id_type.push(this.typeNode);
            this.loopedAlbumQuantity += 1;
            if (this.loopedAlbumQuantity === this.generatedAlbumsLength) {
                console.log("ok");
                this.updatePageImgsCount();
                this.gotType = 0;
                this.preprocessIDs(0);
            }else{
                this.getIDsOfAlbum(this.albums_id_arr[this.loopedAlbumQuantity]);
            };
        } else {
            this.page += 1;
            
            if (this.page <= maxPages) {
                this.getIDsOfPage(this.settings.user_id, album_id, this.settings.pagecount, this.page, type, this.getIDsOfAlbum_callback.call(this, album_id, type));
            };
        };


    };
};

WEIBO.preprocessIDs = function(i) {
    var preset_steps = this.settings.steps;
        
    // for (var i = 0; i < this.photos_id_type.length; i++) {
        this.photo_ids_length = this.photos_id_type[i]["ids"].length;
        this.current_steps = preset_steps;
        this.processed_ids_length = 0;
        this.remaining_ids_length = this.photo_ids_length - this.processed_ids_length;
        this.start_index = this.processed_ids_length;
        this.type = this.photos_id_type[i]["type"];
        this.ids_arr = this.photos_id_type[i]["ids"];
        this.processIDs();
    // };
};
WEIBO.processIDs = function() {
    this.current_steps = this.remaining_ids_length >= this.settings.steps ? this.settings.steps : this.remaining_ids_length;
    var ids = this.ids_arr.slice(this.start_index, this.start_index + this.current_steps).join();
    this.getURLs(this.type, ids);
};
WEIBO.postprocessIDs = function() {
    var _this = this;
    this.processed_ids_length += this.current_steps;
    this.start_index = this.processed_ids_length;
    this.remaining_ids_length = this.photo_ids_length - this.processed_ids_length;
    if (this.processed_ids_length < this.photo_ids_length) {
        this.timer = setTimeout(_this.processIDs.bind(_this), 10);
    } else {
        this.gotType += 1;
        if (this.gotType === this.photos_id_type.length) {
            console.log("done!");            
        } else{
            this.preprocessIDs(this.gotType);
        };
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
WEIBO.getURLs_callback = function(request) {
    var data = JSON.parse(request).data;

    for (var per_id in data) {
        if (data.hasOwnProperty(per_id)) {
            if (data[per_id]) {
                var original_img_url = data[per_id].large_pic_tmp;
                this.imgURLs.push(original_img_url);
                this.updatePageURLs(original_img_url);
            };
        };
    };
    this.postprocessIDs();

};
WEIBO.updatePageImgsCount = function() {
    var $imgsLength = document.getElementById('photos_length'),
        idsLength = 0;
    for (var i = 0; i < this.photos_id_type.length; i++) {
        idsLength += this.photos_id_type[i]["ids"].length;
    };
    $imgsLength.innerHTML = idsLength;
};
WEIBO.updatePageURLs = function(URL) {
    this.$img_urls.insertAdjacentHTML('beforeend', '"' + URL + '",');
};


WEIBO.init();