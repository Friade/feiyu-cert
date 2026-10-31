# 肥鱼证 · Feiyu Certificate

给养大肥鱼的人一张正式的、可以长期留着的身份证明。  
填上名字、照片和鱼图，盖下「鱼印」，导出高清 PNG。

灵感来自 B 站视频 **BV1oyxC6HEvt**（UP：提仆兮袔，《忧郁肥鱼》系列第 10 集）。  
这是一个非官方同人项目，目前是 **v0.2 可发布版**，不包含 UP 的角色素材。

![界面截图](assets/screenshot.png)

## v0.2 更新

- 照片 / 附图新增比例选择：1:1、4:3、3:4、1:1.5、1.5:1、1:2、2:1；高比例会自动收窄，避免压到发证区。
- 图片标签可单独开关、改文字；「附：图」的冒号已去掉。
- 新增署名区：主人 / 大肥鱼，可放在发证日期下方或左侧，支持独立字体、颜色、显隐。
- 发证默认改为「肥鱼事务所」。
- 字体选项去掉「（开源）」字样，界面更干净。
- 上传区下方增加「刷新会丢失图片」提示。
- 去掉滚轮缩放，只保留滑块，避免误触。

## 现在能做什么

- 1000 × 1400 的证书版式：双线蓝框、毛笔标题、四行正文、照片 / 附图双图位、发证信息、红色鱼印、底部小字。
- 文字自定义：标题、编号、正文（最多 6 行）、发证、日期、主人、大肥鱼、底部小字、印章文字（1–4 字）。
- 字体与颜色：开源毛笔行楷 / 小薇宋，也可切回系统字体；标题、正文、纸张、印章、署名颜色可调。
- 图片：上传自己的照片和鱼图（PNG / JPG / WebP，单张 ≤ 15 MB），支持比例、缩放、显示 / 隐藏。
- 图片标签：照片 / 附图标签可开关、可改字；默认「照片」「附图」。
- 署名：主人 / 大肥鱼两行，支持「发证/日期下方」或「左侧」排版，独立字体、颜色、显隐。
- 排版：拖动「照片 / 附图」自由摆放；方向键 2px 微调，Shift + 方向键 10px；「复位排版」一键还原。
- 盖章动画：点「盖章发证」，鱼印从上方落下，纸面轻震；可选低频音效。
- 导出：2000 × 2800 高清 PNG，按当前排版、颜色、图片和印章生成。
- 放大预览：手机上点「放大预览」全屏看证书，Esc 退出。
- 草稿：保存文字、颜色、字号、比例、标签和图片位置到 localStorage；图片本身不保存（刷新后回占位图）。

## 本地运行

不需要构建，也没有依赖。

```bash
python -m http.server 8765 --bind 127.0.0.1 --directory .
```

打开 <http://127.0.0.1:8765/>。

也可以直接双击 `index.html`。用本地服务器更稳，字体加载和导出下载都更接近线上环境。

## 部署到 GitHub Pages

目标仓库：<https://github.com/Friade/->。

需要一个有 `Contents` 和 `Pages` 写权限的 token（classic PAT 的 `repo` 也可以）。把 token 放进项目根目录的 `github-token.txt`（可见文件，已 gitignore）或 `.github-token`，或设置环境变量 `GITHUB_TOKEN`，然后：

```bash
node tools/deploy-github-pages.mjs --dry-run
node tools/deploy-github-pages.mjs
```

脚本会通过 GitHub Git Data API 创建首个提交、启用 Pages，并轮询构建状态。  
预计地址：<https://friade.github.io/-/>。

> 不要把 token 提交到仓库，也不要把 token 贴进公开 issue。

## 文件

```text
feiyu-cert/
├─ index.html                 页面结构
├─ styles.css                 证书样式、面板、响应式、盖章动画
├─ app.js                     渲染、拖拽、上传、盖章、草稿、PNG 导出
├─ LICENSE                   代码 MIT
├─ LICENSE-ASSETS.md         占位图 / 模板 / 字体许可说明
├─ .nojekyll                  GitHub Pages 跳过 Jekyll
├─ assets/
│  ├─ portrait-placeholder.svg  照片占位（原创小蓝发）
│  ├─ fish-placeholder.svg      鱼图占位（原创深蓝大鱼）
│  ├─ favicon.svg
│  ├─ screenshot.png
│  └─ fonts/
│     ├─ MaShanZheng-Regular.ttf   SIL OFL
│     ├─ ZCOOLXiaoWei-Regular.ttf  SIL OFL
│     ├─ OFL-MaShanZheng.txt
│     └─ OFL-ZCOOLXiaoWei.txt
├─ tools/
│  ├─ cdp-shot.mjs             Edge CDP 截图 / 导出测试脚本
│  ├─ deploy-github-pages.mjs  通过 GitHub API 发布 Pages
│  ├─ inspect_ref.py           参考图拆解
│  └─ colors.py                参考图取色
└─ ref/                        本地参考图与截图（不提交到公开仓库）
```

## 设计坐标

证书使用固定 1000 × 1400 坐标系，外层用 CSS `transform: scale()` 适配屏幕。

| 元素 | 位置 / 尺寸 |
| --- | --- |
| 外框 / 内框 | inset 26 / 42 |
| 标题 | top 84，字号 112，三字轻微旋转 |
| 标题线 | top 228，宽 420 |
| 编号 | top 56，right 72 |
| 正文 | top 276，字号 46，行距约 36 |
| 照片模块 | left 74，top 640，基础宽 280，高比例时自动收窄 |
| 附图模块 | left 500，top 645，基础宽 360，高比例时自动收窄 |
| 发证块 | left 490，top 1062 |
| 署名（下方） | left 490，top 1196 |
| 署名（左侧） | left 90，top 1062 |
| 鱼印 | left 772，top 1048，118 × 128，旋转 -3° |
| 底部小字 | left 90，top 1305 |

图片比例会保持宽高比；当高度超过 360px 时自动收窄宽度，避免压到发证和署名区。

## 路线图

- [x] 1:1 版式原型
- [x] 开源字体 + 自定义颜色 / 字号
- [x] 图片上传、拖拽、缩放、显隐、比例
- [x] 图片标签开关 / 自定义文字
- [x] 主人 / 大肥鱼署名，支持左右排版、独立字体颜色
- [x] 盖章动画与音效
- [x] 高清 PNG 导出
- [x] GitHub Pages 部署与开源仓库（准备中）
- [ ] 鱼缸档案（多张证、本地列表）
- [ ] 图片持久化（IndexedDB，刷新不丢）
- [ ] 二维码 / 分享页（静态托管需要额外方案）
- [ ] A5 PDF 导出
- [ ] 自定义字体上传
- [ ] 字体子集化，减小 12 MB 字体体积

## 版权、字体与许可证

- 版式灵感来自上述 B 站视频；**没有**打包视频里的角色图。两张占位图是本项目原创的 SVG。
- 如果公开做「1:1 复刻」，建议先和 UP 打个招呼；同人项目也请保留出处和视频链接。
- `Ma Shan Zheng` 与 `ZCOOL XiaoWei` 来自 Google Fonts，均为 SIL Open Font License 1.1。OFL 全文已放在 `assets/fonts/`：
  - `OFL-MaShanZheng.txt`
  - `OFL-ZCOOLXiaoWei.txt`
- 代码许可证待定。建议代码用 MIT；占位插画和证书模板可另用 CC BY-NC-SA，避免被直接商用。正式开源前再定。

## 已知问题

- 两套中文字体合计约 12 MB，首次加载偏慢；后续做子集化或按需加载。
- 图片只存在当前页面，刷新后回占位图；保存草稿不包含图片。
- PNG 导出用 Canvas 重绘，纸张噪点和印章毛边是近似效果，不会和屏幕像素完全一致。
- 鱼缸档案、二维码、PDF、自定义字体上传还没接。
- 目前按桌面和 430 × 900 手机视口调过；更宽的平板 / 折叠屏还需要再测。