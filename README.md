# VAST Challenge 2015: The Grand Challenge
page: http://vacommunity.org/VAST+Challenge+2015    
### 一、准备数据与环境
#### 0. 在clone之前
安装git-lfs  
如果是windows用户，可直接安装`tools/git-lfs-windows-v2.7.2.exe`  
然后执行
```
git lfs install
```
#### 1. 下载数据
克隆项目
```
git clone https://github.com/dicarne/VC2015GC-ZJGSU-CS1601-G16.git
```
因为数据太大了无法上传到GitHub，因此需要从其他来源下载数据。你可以从以下地址下载原始数据。  
百度网盘 链接：https://pan.baidu.com/s/1PAWo4OHbXPp0v6d2woa5wA  提取码：vop4   
腾讯微云 链接：https://share.weiyun.com/5MFdlSB 密码：c7hjek
#### 2. 将数据放在正确的位置上
解压压缩包，放入项目目录下，文件结构应该如下所示：
- VC2015GC
    - data
        - GC Data 2015
        - MC1 Data 2015
        - MC2 Data 2015
        - AuxiliaryFiles
    - js
        - ... ...
    - index.html
    - package.json
    - ... ...
#### 3. 安装依赖
安装本地http服务器  
```
npm install http-server
```

### 二、开始运行
```
npm start
```
这将会启动一个本地服务器并打开一个浏览器窗口，指向index.html。

### 三、开发说明
当前入口函数为js/vc2015gc.js中的StartAnalyse()。

### 四、提交说明
📝 更新说明性文档。  
🐛 修复bug。  
✨ 增加新功能。

---
Author: Ding jiahe, Quan yuru, Lou hanxin, Zhejiang Gongshang University, 2019.5