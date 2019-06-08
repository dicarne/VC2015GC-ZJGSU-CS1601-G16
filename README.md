# VAST Challenge 2015: The Grand Challenge
原题: http://vacommunity.org/VAST+Challenge+2015    
### 一、准备数据与环境
#### 0. 在clone之前
安装Git LFS。
安装MongoDb，将其加入环境变量。
#### 1. 下载数据
**克隆项目**
```
git clone https://github.com/dicarne/VC2015GC-ZJGSU-CS1601-G16.git
```
**下载数据库**  
因为数据库太大了无法上传到GitHub，因此需要从其他来源下载数据。你可以从以下地址下载。  
百度网盘 链接：https://pan.baidu.com/s/1w4oEZsrnmNeoWEy1Lm3xkQ 提取码：y0qs  

#### 2. 将数据放在正确的位置上
解压压缩包，放入项目目录下，文件结构应该如下所示：
- VC2015GC
    - data
        - GC Data 2015
        - MC1 Data 2015
        - MC2 Data 2015
        - AuxiliaryFiles
        - db
    - index.js
    - package.json
    - ... ...
#### 3. 安装依赖  
```
npm install
```

### 二、开始运行本地服务器
双击目录下的`opendb.bat`启动数据库，命令行应该正常显示。
```
npm start
```
访问`http://localhost:8080/static/index.html`

### 三、提交说明
📝 更新说明性文档。  
🐛 修复bug。  
✨ 增加新功能。

---
Author: Ding jiahe, Quan yuru, Lou hanxin, Zhejiang Gongshang University, 2019.5