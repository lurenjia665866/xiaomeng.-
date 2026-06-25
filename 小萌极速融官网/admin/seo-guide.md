# 小萌极速融官网 — SEO 运营维护手册

## 一、文件架构概览

```
小萌极速融官网/
├── index.html        # 主站首页（含所有模块）
├── landing.html      # 投流专用落地页（精简版）
├── css/style.css     # 全部样式（不要修改）
├── js/main.js        # 交互脚本（不要修改）
├── news/             # 资讯专栏目录（可无限新增文章）
│   ├── index.html    # 文章列表页
│   └── article/      # 单篇文章目录
├── sitemap.xml       # 网站地图（更新文章后需刷新）
├── robots.txt        # 爬虫规则
└── admin/
    └── seo-guide.md  # 本指南
```

## 二、修改页面 TDK（标题/关键词/描述）

每个页面的 HTML `<head>` 中都有专属的 TDK 区块，用注释标记：

```html
<!-- ===== SEO: Title / Keywords / Description (可独立修改) ===== -->
<title>小萌极速融 — 全款车抵押|按揭车二押|车辆一押|车抵贷3-100万</title>
<meta name="description" content="小萌极速融，长安新生全国头部代理，专注全款车抵押...">
<meta name="keywords" content="车抵贷,全款车抵押,按揭车二押...">
```

### 修改步骤
1. 打开对应 HTML 文件
2. 找到 `<!-- ===== SEO: Title / Keywords / Description -->` 区块
3. 修改 `<title>`、`<meta name="description">`、`<meta name="keywords">`
4. 保存文件后，用站长工具（百度搜索资源平台、Google Search Console）提交更新

### 各页面 TDK 位置
| 页面 | 文件 | TDK位置 |
|---|---|---|
| 主站首页 | `index.html` | `<head>` 第8-10行 |
| 投流落地页 | `landing.html` | `<head>` 第5-8行 |

## 三、通用区块关键词修改

页面中所有**可自由修改的文字区块**都用注释标记 `<!-- SEO关键词埋位 -->`，搜索以下注释即可找到：

### 1. 产品卡片（首页 #products 区）
每张产品卡片底部有一段描述文字，可直接替换为带地域词的长尾关键词：
```
原："适合全款车抵押、按揭车二次抵押小额周转。线上预审，5分钟出额度。"
改："北京全款车抵押、上海按揭车二次抵押都可以做，线上预审5分钟出额度。"
```

### 2. FAQ 区块（首页 #faq 区）
FAQ 的问题和答案均可自由编辑，建议在每个答案中嵌入地域/业务关键词。

### 3. Hero 标签（首页首屏）
关键词标签 `<span class="hero-tag">` 可新增/修改/排序。

### 4. 资讯文章（news/ 目录）
每篇文章的标题、描述、标签均可独立编辑。

## 四、资讯专栏操作（SEO 核心）

### 新建文章
1. 进入 `news/article/` 目录
2. 新建 HTML 文件，命名规则：`2026-06-22-short-slug.html`
3. 复制 `template.html`（如有）或参考现有文章结构
4. 填写独立 TDK、文章正文
5. 在 `news/index.html` 的文章列表中加入新文章链接
6. 刷新 `sitemap.xml`

### 文章 TDK 示例
```html
<title>全款车抵押和按揭车二押有什么区别？一篇讲清楚 — 小萌极速融</title>
<meta name="description" content="详解全款车抵押与按揭车二次抵押在额度、利率、流程上的区别...">
<meta name="keywords" content="全款车抵押,按揭车二押,车抵贷区别">
```

### 批量编辑技巧
- 建议批量产出文章后，用查找替换工具批量修改标题中的地域词
- 例如：批量将"【市】车抵贷"替换为"北京车抵贷""上海车抵贷""广州车抵贷"

## 五、图片 ALT 标签

所有 `<img>` 标签（上线替换真实图片后）必须填写 ALT 属性：
```html
<img src="assets/car-mortgage.jpg" alt="全款车抵押办理流程 — 小萌极速融">
```

图片命名建议：`keyword-description.jpg`（如 `full-pay-car-mortgage.jpg`）

## 六、网站地图更新

每次新增文章后，打开 `sitemap.xml`，按格式追加URL：
```xml
<url>
  <loc>https://www.xiaomengjisu.com/news/article/2026-06-22-new-article.html</loc>
  <lastmod>2026-06-22</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.6</priority>
</url>
```

## 七、禁止操作

- **不要修改** `css/style.css` 和 `js/main.js`（除非需要调整样式或功能）
- **不要删除** 合规声明区块（年化、风险提示、禁止词汇）
- **不要使用** 违禁词：零利息、无视征信、黑户可办、秒批、保下款、无门槛

## 八、上线前检查清单

- [ ] 所有页面的 TDK 已填入真实内容
- [ ] 主站 TDK 与落地页 TDK 内容区分开
- [ ] 图片已替换真实文件并填写 ALT
- [ ] `sitemap.xml` 包含所有页面
- [ ] `robots.txt` 已配置
- [ ] 全站扫一遍违禁词
- [ ] 年化标注 19.99%-23.99% 确认出现在首页、产品区、页脚
- [ ] 百度搜索资源平台提交链接
