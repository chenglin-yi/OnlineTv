# VibeLume - 沉浸光影，自在观影

[English](README.md)

一个轻量级、开源免费的在线影视搜索与观看平台，支持多接口源接入，用户可自由选择播放线路。

## 产品特色

- **多源聚合**：整合多个影视API接口，提供丰富的影视资源
- **线路切换**：支持用户自由选择不同播放线路，提升观影成功率
- **静态部署**：纯前端实现，支持 EdgeOne Pages / Vercel 一键部署
- **无广告干扰**：专注观影体验，无强制广告
- **智能缓存**：搜索结果和首页数据本地缓存，提升响应速度

## 技术栈

| 分类 | 技术 | 说明 |
| :--- | :--- | :--- |
| 框架 | Vue 3 | 渐进式JavaScript框架 |
| 构建工具 | Vite | 快速构建工具 |
| UI样式 | Tailwind CSS | 原子化CSS框架 |
| 状态管理 | Pinia | Vue状态管理库 |
| 视频播放 | HLS.js | HLS流媒体播放 |
| 类型检查 | TypeScript | JavaScript超集 |
| HTTP客户端 | Axios | HTTP请求库 |
| 路由 | Vue Router | Vue官方路由 |

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 pnpm

### 安装

```bash
# 克隆仓库
git clone https://github.com/chenglin-yi/OnlineTv.git
cd OnlineTv

# 安装依赖
npm install
```

### 开发

```bash
npm run dev
```

访问 http://localhost:5173 预览应用。

### 构建

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 预览

```bash
npm run preview
```

## 项目结构

```
├── src/
│   ├── api/                # API接口层
│   │   ├── index.ts        # 线路测试接口
│   │   └── video.ts        # 视频搜索/详情接口
│   ├── components/         # Vue组件
│   │   ├── Carousel.vue    # 轮播组件
│   │   ├── Header.vue      # 顶部导航
│   │   ├── SearchBar.vue   # 搜索框
│   │   └── VideoCard.vue   # 影视卡片
│   ├── pages/              # 页面组件
│   │   ├── Home.vue        # 首页（发现）
│   │   ├── Play.vue        # 播放页
│   │   └── Search.vue      # 搜索页（找片）
│   ├── stores/             # 状态管理
│   │   └── app.ts          # 应用状态（线路管理）
│   ├── types/              # 类型定义
│   ├── router/             # 路由配置
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── edge-functions/         # EdgeOne Pages 边缘函数（API代理）
├── public/                 # 静态资源
├── .env                    # 环境变量
├── edgeone.json            # EdgeOne Pages 配置
├── index.html              # HTML模板
├── package.json            # 项目配置
├── vite.config.ts          # Vite配置
└── tailwind.config.js      # Tailwind配置
```

## 部署

### 腾讯 EdgeOne Pages

1. Fork 本仓库到你的GitHub账号
2. 登录 [腾讯 EdgeOne](https://edgeone.ai/)
3. 创建新项目，连接GitHub仓库
4. 构建命令：`npm run build`
5. 输出目录：`dist`
6. 部署完成

### Vercel

1. Fork 本仓库到你的GitHub账号
2. 登录 [Vercel](https://vercel.com/)
3. Import 本仓库
4. 部署完成

## 影视源接口

| 接口名称 | 类型 | 状态 | 说明 |
| :--- | :--- | :--- | :--- |
| 红牛资源 | MacCMS | ✅ 稳定 | 综合影视源 |
| 馒头资源 | MacCMS | ✅ 稳定 | 综合影视源 |
| 量子资源 | MacCMS | ✅ 稳定 | 综合影视源 |
| 非凡资源 | MacCMS | ✅ 稳定 | 综合影视源 |
| 卧龙资源 | MacCMS | ✅ 稳定 | 综合影视源 |
| 豆瓣资源 | MacCMS | ✅ 稳定 | 影视元数据 |

## 开发规范

本项目遵循以下代码规范：

- **命名**：变量/函数使用 camelCase，组件使用 PascalCase，常量使用 UPPER_SNAKE_CASE
- **代码风格**：2空格缩进，100字符行宽，单引号（JS）
- **提交信息**：使用语义化提交前缀

## 许可证

本项目仅供个人学习研究使用，请勿用于商业用途。

## 参考项目

- [LibreTV](https://github.com/chankahou/LibreTV) - 轻量级免费在线视频搜索与观看平台
- [MovieVerse](https://www.medevel.com/movieverse/) - 基于TMDB API的开源影视流媒体站点
- [movie-web](https://github.com/movie-web/movie-web) - 开源电影聚合平台

---

**文档版本**: v2.0  
**创建日期**: 2026-05-08