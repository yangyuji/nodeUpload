$(function () {

    var files = [];
    var ctr = {
        /**
         * dataURL to blob
         * @param dataURI
         * @returns {Blob}
        */
        dataURItoBlob: function (dataURI) {
            var byteString = atob(dataURI.split(',')[1]);
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            return new Blob([ab], {type: mimeString});
        },

        /**
         * upload
         * @param {Object} file: file.name, file.dataURL
        */
        upload: function (file){
            var fd = new FormData();
            fd.append('file', ctr.dataURItoBlob(file.dataURL), file.name);
            $.ajax({
                type: 'POST',
                url: '/upload',
                data: fd,
                processData: false,
                contentType: false,
                xhr: function() {
                    var xhr = new window.XMLHttpRequest();
                    xhr.upload.addEventListener("progress", function(evt) {
                        if (evt.lengthComputable) {
                            var percentComplete = evt.loaded / evt.total * 100;
                            //在 Chrome DevTool 中限制网速来模拟效果比较好
                            $('.progress-bar').css('width',percentComplete.toFixed(2) + '%').html(percentComplete.toFixed(2) + '% Complete');
                        }
                    }, false);

                    return xhr;
                }
            }).success(function (res) {
                alert(res);
            }).error(function (err) {
                console.log(err);
            });
        },

        /**
         * compresse pic
         * @param img
         * @returns {dataURL}
        */
        compresse: function(img){
            try{
                // 压缩成 400px, 高度按比例计算
                var w = Math.min(400, img.width);
                var h = img.height * (w / img.width);
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');

                // 设置 canvas 的宽度和高度
                canvas.width = w;
                canvas.height = h;

                // 把图片绘制到 canvas 中
                ctx.drawImage(img, 0, 0, w, h);

                // 取出 base64 格式数据
                return canvas.toDataURL('image/png');
            }
            catch(err){
                console.log(err);
            }
        }
    };

    $('#inputFile').on('change', function (e) {
        var file = e.target.files[0];

        if (file) {
            if (/^image\//i.test(file.type)) {

                var reader = new FileReader();

                reader.onloadend = function () {
                    var img = new Image();

                    img.onload = function () {
                        
                        // 取出 base64 格式数据
                        var dataURL = ctr.compresse(img);

                        $('<div class="col-md-3" style="background-image:url(' + dataURL + ');"></div>').appendTo('.pic');
                        files.push({
                            name: file.name,
                            dataURL: dataURL
                        });

                        // 压缩后大小
                        var after = ctr.dataURItoBlob(dataURL);
                        $('.after').html('压缩后：' + (after.size / 1024).toFixed(2) + ' KB');
                    };

                    // 压缩前大小
                    var before = ctr.dataURItoBlob(reader.result);
                    $('.before').html('压缩前：' + (before.size / 1024).toFixed(2) + ' KB');

                    img.src = reader.result;

                };

                reader.onerror = function () {
                    console.error('reader error');
                };

                // 读出base64格式
                reader.readAsDataURL(file);
            } else {
                throw '只能上传图片';
            }
        }
    });

    $('.btn-primary').on('click', function (e) {
        if (files.length === 0) {
            alert('请选择上传文件！');
            return;
        }
        files.forEach(ctr.upload);
    });

    
});
