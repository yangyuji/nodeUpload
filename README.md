# nodeUpload

## 实现功能
> *  上传图片压缩
> *  上传图片预览
> *  上传进度提示

## 实现技术

> *  采用node做服务端，实现的文件上传功能，带有上传进度提示；

> *  采用了canvas压缩图片，使用了 [XMLHttpRequest 2.0家臣](http://www.zhangxinxu.com/wordpress/2013/10/understand-domstring-document-formdata-blob-file-arraybuffer/) 成员的Blob，ArrayBuffer，FileReader，FormData，所以不兼容低版本浏览器，建议在移动端上使用。

## 使用方法
> *  git clone https://github.com/yangyuji/nodeUpload.git
> *  npm install
> *  node http.js
