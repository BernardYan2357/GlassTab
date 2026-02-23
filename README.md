# GlassTab

<img src="image/icon.png" alt="GlassTab" style="width: 128px; height: 128px;">

> 极简的 Chrome 新标签页扩展。

![GlassTab Preview](image/display.png)

English version: [README_en.md](README_en.md)

## 简介

GlassTab 用毛玻璃风格重新定义了 Edge 新标签页。没有多余的元素与臃肿的功能，只保留时间、搜索和天气，干净、清爽。

## 功能

### 极简时钟

页面中央的大字时钟，支持 24 小时制 / 12 小时制切换。

### 多引擎搜索

内置 Bing、Google、DuckDuckGo、Yandex、TinEye 五个搜索引擎，点击搜索栏右侧图标即可切换。

### 以图搜图

在搜索栏直接粘贴图片（Ctrl+V），自动上传至临时图床并跳转到对应搜索引擎进行以图搜图。当使用 Bing 或 DuckDuckGo 时，会自动切换到 TinEye；Google 和 Yandex 则使用其原生图片搜索。

### 每日壁纸

支持三个壁纸源：
- **Pexels**（默认）— 按风景、自然、建筑等分类随机获取高质量摄影作品，左下角显示摄影师署名
- **Bing** — 每日必应壁纸
- **Picsum** — 随机图片

支持手动换一张、下载当前壁纸。

### 天气信息

基于地理定位自动获取当前天气，点击可展开查看体感温度、降雨量、风速及未来 5 天预报。支持手动切换城市。

## 安装

1. 下载或克隆本仓库
2. 打开 Chrome，进入 `chrome://extensions/`
3. 开启右上角「开发者模式」
4. 点击「加载已解压的扩展程序」，选择项目文件夹

## 配置

1. 将 `config.example.js` 复制为 `config.js`
2. 填入你的 API Key：

| 配置项 | 说明 | 申请地址 |
|-------|------|----------|
| `openWeatherMap` | OpenWeatherMap API Key | [openweathermap.org](https://openweathermap.org/api) |
| `pexels` | Pexels API Key | [pexels.com/api](https://www.pexels.com/api/) |
| `imgbb` | imgbb 图床 API Key（以图搜图） | [api.imgbb.com](https://api.imgbb.com/) |

## 致谢

- 壁纸来自 [Pexels](https://www.pexels.com)、[Bing](https://www.bing.com)、[Lorem Picsum](https://picsum.photos)
- 天气数据来自 [OpenWeatherMap](https://openweathermap.org)
- 以图搜图由 [imgbb](https://imgbb.com) 提供图片托管

## 许可

CC BY-NC 4.0 — 可自由使用和修改，但不得用于商业用途。详见 [LICENSE](LICENSE)。