# VibeTV - 在线观影平台

一个轻量级、开源免费的在线影视搜索与观看平台，支持多接口源接入，用户可自由选择播放线路。

## 产品特色

- **多源聚合**：整合多个影视API接口，提供丰富的影视资源
- **线路切换**：支持用户自由选择不同播放线路，提升观影成功率
- **静态部署**：纯前端实现，支持Vercel/腾讯EdgeOne一键部署
- **无广告干扰**：专注观影体验，无强制广告

## 技术栈

| 分类 | 技术 | 说明 |
| :--- | :--- | :--- |
| 框架 | Vue 3 | 渐进式JavaScript框架 |
| 构建工具 | Vite | 快速构建工具 |
| UI样式 | Tailwind CSS | 原子化CSS框架 |
| 状态管理 | Pinia | Vue状态管理库 |
| 视频播放 | Plyr / HLS.js | 开源视频播放器 |
| 类型检查 | TypeScript | JavaScript超集 |

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 pnpm

### 安装

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/OnlineTv.git
cd OnlineTv

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的 TMDB API Key
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
│   ├── components/         # Vue组件
│   │   ├── Carousel.vue    # 轮播组件
│   │   ├── Header.vue      # 顶部导航
│   │   ├── SearchBar.vue   # 搜索框
│   │   └── VideoCard.vue   # 影视卡片
│   ├── pages/              # 页面组件
│   │   ├── Home.vue        # 首页
│   │   ├── Play.vue        # 播放页
│   │   └── Search.vue      # 搜索页
│   ├── services/           # 服务层
│   │   ├── cmsApi.ts       # CMS接口
│   │   ├── douban.ts       # 豆瓣接口
│   │   ├── movieApi.ts     # 影视接口
│   │   └── tmdb.ts         # TMDB接口
│   ├── stores/             # 状态管理
│   ├── types/              # 类型定义
│   ├── router/             # 路由配置
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── public/                 # 静态资源
├── .env                    # 环境变量
├── index.html              # HTML模板
├── package.json            # 项目配置
├── vite.config.ts          # Vite配置
└── tailwind.config.js      # Tailwind配置
```

## 部署

### 腾讯EdgeOne

1. Fork 本仓库到你的GitHub账号
2. 登录 [腾讯EdgeOne](https://edgeone.ai/)
3. 创建新项目，连接GitHub仓库
4. 配置构建命令：`npm run build`
5. 配置输出目录：`dist`
6. 部署完成

### Vercel

1. Fork 本仓库到你的GitHub账号
2. 登录 [Vercel](https://vercel.com/)
3. Import 本仓库
4. 配置环境变量（如 TMDB_API_KEY）
5. 部署完成

## 环境变量

| 变量名 | 说明 | 默认值 |
| :--- | :--- | :--- |
| TMDB_API_KEY | TMDB API Key | 必填 |
| TMDB_BASE_URL | TMDB API 基础URL | https://api.themoviedb.org/3 |
| TMDB_IMAGE_BASE_URL | TMDB 图片基础URL | https://image.tmdb.org/t/p |

## 影视源接口

| 接口名称 | 类型 | 状态 | 说明 |
| :--- | :--- | :--- | :--- |
| TMDB API | 数据接口 | ✅ 稳定 | 提供影视元数据（需API Key） |
| 南风接口 | 播放接口 | ⚠️ 需验证 | 综合影视源 |
| 快乐接口 | 播放接口 | ⚠️ 需验证 | 多线路影视源 |
| 饭太硬接口 | 播放接口 | ⚠️ 需验证 | FongMi格式接口 |
| 摸鱼接口 | 播放接口 | ⚠️ 需验证 | 综合影视源 |
| 肥猫接口 | 播放接口 | ⚠️ 需验证 | 垂直类影视源 |

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

**文档版本**: v1.0  
**创建日期**: 2026-05-08
