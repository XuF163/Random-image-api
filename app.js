const express = require('express');
const path = require('path');
const fs = require('fs');

const imagesPath = path.join('/root/Paimonapi/PaimonImg/paimon');//自行替换目录
const app = express();
const port = 3000;

const imageFolderPath = path.join(__dirname, 'images');
let imageFilesCache = [];

// 创建存储日志的目录
const logDirectory = path.join('/root/Paimonapi/log/');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// 访问日志中间件函数
function logAccess(req, res, next) {
  const logEntry = `${new Date().toISOString()} - ${req.ip} - ${req.method} ${req.url} - ${req.headers['content-length'] || 0} bytes`;
  console.log(logEntry);
  const currentDate = new Date().toISOString().split('T')[0]; // 获取当前日期
  const logFileName = path.join(logDirectory, `${currentDate}.txt`);

  fs.appendFile(logFileName, logEntry + '\n', (err) => {
    if (err) {
      console.error('Failed to log access:', err);
    }
  });
  next();
}

// 获取文件夹内所有图片文件
function updateImageFilesCache() {
  fs.readdir(imagesPath, (err, files) => {
    if (err) {
      console.error('Error updating image files cache:', err);
      return;
    }
    imageFilesCache = files.filter(file => /\.(png|jpg|jpeg|gif)$/i.test(file));
  });
}

updateImageFilesCache();
setInterval(updateImageFilesCache, 3600000); // 更新缓存，每小时执行一次

function getRandomImageFromCache() {
  const randomIndex = Math.floor(Math.random() * imageFilesCache.length);
  return imageFilesCache[randomIndex];
}

// 静态资源中间件，用来访问图片资源
app.use('/images', express.static(imagesPath));

// 添加访问日志中间件
app.use(logAccess);

// 主路由
app.get('/', (req, res) => {
  const randomImage = getRandomImageFromCache();
  if (randomImage) {
    res.redirect(`/images/${randomImage}`);
  } else {
    res.status(404).send('找不到图片');
  }
});

// 监听端口
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
