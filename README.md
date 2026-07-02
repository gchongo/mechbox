# MechBox 机械工具箱

尺寸链叠加分析工具 — 纯 Web 应用

**域名**: https://mechbox.cax.do

## 技术栈

- Vue 3 + Vite
- Element Plus + Tailwind CSS
- Plotly.js + math.js
- localStorage 本地存储

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

## 项目结构

```
src/
├── assets/          # 静态资源与样式
├── components/      # 可复用组件
├── constants/       # 常量配置
├── router/          # 路由
├── utils/           # 计算引擎与存储
└── views/           # 页面视图
```

## 版本规划

- **V1.0** — 尺寸链分析 + 概率统计（当前）
- **V1.5** — 2D/GD&T 扩展 + 图表增强
- **V2.0** — Monte Carlo + 用户系统

详细需求见 [mechbox-project-requirements.md](./mechbox-project-requirements.md)
