/**
 * 微信小程序 → 静态 HTML 批量转换
 * 输出: high-fidelity/ + wireframe/
 * 用法: node convert.js [--mode browser|mobile]  默认: mobile
 */
const fs = require('fs');
const path = require('path');

// CLI
const args = process.argv.slice(2);
const MODE = args.includes('--mode') ? (args[args.indexOf('--mode') + 1] || 'mobile') : 'mobile';
const IS_MOBILE = MODE !== 'browser';
const SUFFIX = IS_MOBILE ? '' : '-browser';  // mobile uses no suffix (default)

const ROOT = process.cwd();
const HF_DIR = path.join(ROOT, 'high-fidelity' + SUFFIX);
const WF_DIR = path.join(ROOT, 'wireframe' + SUFFIX);

// ========== 读取 app.json ==========
let appJson = { pages: [] };
try { appJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'app.json'), 'utf-8')); } catch(e) {
  console.log('  ⚠ 未找到 app.json，扫描 pages/ 目录...');
  // Fallback: scan pages/ directory
  const pagesDir = path.join(ROOT, 'pages');
  if (fs.existsSync(pagesDir)) {
    function scan(dir, prefix) {
      fs.readdirSync(dir).forEach(f => {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) {
          if (fs.existsSync(path.join(full, f + '.wxml'))) {
            appJson.pages.push(prefix + f + '/' + f);
          }
          scan(full, prefix + f + '/');
        }
      });
    }
    scan(pagesDir, 'pages/');
  }
}

// ========== 读取全局样式 ==========
let GLOBAL_WXSS = '';
const globalWxssPath = path.join(ROOT, 'app.wxss');
if (fs.existsSync(globalWxssPath)) {
  GLOBAL_WXSS = fs.readFileSync(globalWxssPath, 'utf-8');
}

// ========== 工具函数 ==========
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// rpx → px (@375px width: 1rpx = 0.5px)
function convertRpx(css) {
  return css.replace(/(\d+(?:\.\d+)?)rpx/g, (m, num) => {
    return (parseFloat(num) / 2).toFixed(1).replace(/\.0$/, '') + 'px';
  });
}

// 修复 url() 和 src 中的图片路径
function fixPaths(str, depth) {
  const pfx = '../'.repeat(Math.max(0, depth));
  // CSS url()
  str = str.replace(/url\(['"]?\.\.\/images\//g, `url(${pfx}assets/images/`);
  str = str.replace(/url\(['"]?images\//g, `url(${pfx}assets/images/`);
  // HTML src
  str = str.replace(/src\s*=\s*"\.\.\/images\//g, `src="${pfx}assets/images/`);
  str = str.replace(/src\s*=\s*"images\//g, `src="${pfx}assets/images/`);
  str = str.replace(/src\s*=\s*"\/images\//g, `src="${pfx}assets/images/`);
  // ../../ 多层
  str = str.replace(/src\s*=\s*"(?:\.\.\/)+images\//g, `src="${pfx}assets/images/`);
  return str;
}

// 解析 <import> 引用的模板文件
function resolveImports(wxml, wxmlDir, depth) {
  const imports = {};
  // <import src="./xxx.wxml" />
  const re = /<import\s+src\s*=\s*["']([^"']+)["']\s*\/?>/g;
  let m;
  while ((m = re.exec(wxml)) !== null) {
    const importPath = path.resolve(wxmlDir, m[1]);
    if (fs.existsSync(importPath)) {
      const tplContent = fs.readFileSync(importPath, 'utf-8');
      // Extract <template name="..."> definitions
      const tplRe = /<template\s+name\s*=\s*["']([^"']+)["']\s*>([\s\S]*?)<\/template>/g;
      let tm;
      while ((tm = tplRe.exec(tplContent)) !== null) {
        imports[tm[1]] = tm[2];
      }
    }
  }
  // Resolve <template is="name" data="{{...}}">
  let result = wxml;
  for (const [name, content] of Object.entries(imports)) {
    const isRe = new RegExp(`<template\\s+is\\s*=\\s*["']${name}["'][^>]*\\/?>`, 'gi');
    result = result.replace(isRe, content);
  }
  return result;
}

// 处理 <include src="./xxx.wxml" />
function resolveIncludes(wxml, wxmlDir) {
  return wxml.replace(/<include\s+src\s*=\s*["']([^"']+)["']\s*\/?>/g, (m, src) => {
    const incPath = path.resolve(wxmlDir, src);
    if (fs.existsSync(incPath)) {
      let content = fs.readFileSync(incPath, 'utf-8');
      content = content.replace(/<import[^>]*\/?>/g, ''); // Strip nested imports
      return content;
    }
    return `<!-- include not found: ${src} -->`;
  });
}

// 剥离小程序指令
function stripDirectives(wxml) {
  let h = wxml;
  h = h.replace(/\s+wx:if\s*=\s*"\{\{[^}]*\}\}"/g, '');
  h = h.replace(/\s+wx:elif\s*=\s*"\{\{[^}]*\}\}"/g, '');
  h = h.replace(/\s+wx:else/g, '');
  h = h.replace(/\s+wx:for\s*=\s*"\{\{[^}]*\}\}"/g, '');
  h = h.replace(/\s+wx:for-index\s*=\s*"[^"]*"/g, '');
  h = h.replace(/\s+wx:for-item\s*=\s*"[^"]*"/g, '');
  h = h.replace(/\s+wx:key\s*=\s*"[^"]*"/g, '');
  h = h.replace(/\s+bind\w+\s*=\s*"[^"]*"/g, '');
  h = h.replace(/\s+catch\w+\s*=\s*"[^"]*"/g, '');
  h = h.replace(/\s+data-[\w-]+\s*=\s*"\{\{[^}]*\}\}"/g, '');
  h = h.replace(/\s+hidden\s*=\s*"\{\{[^}]*\}\}"/g, '');
  h = h.replace(/\s+hidden\s*=\s*"true"/g, '');
  // <block> unwrap
  h = h.replace(/<\/?block[^>]*>/g, '');
  h = h.replace(/<import[^>]*\/?>/g, '');
  // {{ }} → placeholder
  h = h.replace(/\{\{([^}]+)\}\}/g, (m, expr) => {
    const v = expr.trim();
    if (/index\s*\+\s*1/.test(v)) return '1';
    if (v === 'index') return '0';
    if (/item\./.test(v)) return '—';
    return '—';
  });
  return h;
}

// 从 .js 文件提取 data 默认值作为占位
function extractDataDefaults(jsPath) {
  if (!fs.existsSync(jsPath)) return {};
  const js = fs.readFileSync(jsPath, 'utf-8');
  const dataMatch = js.match(/data\s*:\s*\{([\s\S]*?)\}\s*[,;}]/);
  if (!dataMatch) return {};
  const defaults = {};
  const kvRe = /(\w+)\s*:\s*(?:'([^']*)'|"([^"]*)"|(\d+)|(\[)|(\{))/g;
  let m;
  while ((m = kvRe.exec(dataMatch[1])) !== null) {
    const key = m[1];
    defaults[key] = m[2] || m[3] || m[4] || (m[5] ? '[...]' : m[6] ? '{...}' : '');
  }
  return defaults;
}

// 用 data 默认值替换 {{ }}
function applyDefaults(tpl, defaults) {
  for (const [key, val] of Object.entries(defaults)) {
    if (val && val !== '[...]' && val !== '{...}') {
      tpl = tpl.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), val);
    }
  }
  return tpl;
}

// ========== HTML 生成 ==========
const MOBILE_STYLE = `*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;min-height:100vh;margin:0;padding:0;background:#c8c8c8;font-family:"PingFang SC","Microsoft YaHei",sans-serif}
body{display:flex;justify-content:center;align-items:flex-start}
.phone{width:375px;min-height:100vh;background:#f2f3f7;position:relative;overflow:hidden;box-shadow:0 0 20px rgba(0,0,0,0.15)}
.scroll{width:100%;height:100vh;overflow-y:auto}
.scroll::-webkit-scrollbar{display:none}`;

const BROWSER_STYLE = `*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100vw;height:100vh;margin:0;padding:0;overflow:hidden;background:#222;font-family:"PingFang SC","Microsoft YaHei",sans-serif}
#app{width:100vw;height:100vh;position:relative;overflow:hidden auto}`;

function getStyle() { return IS_MOBILE ? MOBILE_STYLE : BROWSER_STYLE; }

function buildHighFidelity(title, bodyHtml, pageCss, depth, group) {
  const globalCss = convertRpx(fixPaths(GLOBAL_WXSS, depth));
  const css = convertRpx(fixPaths(pageCss, depth));
  const style = getStyle();
  const bodyContent = IS_MOBILE
    ? `<div class="phone">\n  <div class="scroll" id="app">\n${bodyHtml}\n  </div>\n</div>`
    : `<div id="app">\n${bodyHtml}\n</div>`;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
${style}
/* ====== app.wxss ====== */
${globalCss}
/* ====== page.wxss ====== */
${css}
</style>
</head>
<body>
${bodyContent}
</body>
</html>`;
}

function buildWireframe(title, bodyHtml, depth, group) {
  let wfBody = bodyHtml
    .replace(/<img[^>]*>/g, '<div class="sk-img" style="display:inline-block;min-width:40px;min-height:40px">📷</div>')
    .replace(/<input[^>]*>/g, '<div class="sk-input" style="display:inline-block;height:36px;min-width:80px"></div>')
    .replace(/<button[^>]*>.*?<\/button>/g, '<div class="sk-btn" style="display:inline-block;padding:6px 20px">btn</div>');
  const style = getStyle();
  const bodyContent = IS_MOBILE
    ? `<div class="phone" style="background:#fff">\n  <div class="scroll" id="app">${wfBody}</div>\n</div>`
    : `<div id="app" style="background:#fafafa;border:1px solid #ccc">${wfBody}</div>`;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>线框图 - ${title}</title>
<style>
${style}
.sk{background:#e8e8e8;border-radius:3px;display:inline-block;min-height:10px}
.sk-img{background:#eee;border:1.5px dashed #bbb;display:inline-flex;align-items:center;justify-content:center;color:#bbb;font-size:11px;border-radius:3px}
.sk-input{background:#f5f5f5;border:1.5px dashed #bbb;border-radius:4px;display:inline-block}
.sk-btn{border:1.5px dashed #bbb;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;color:#aaa;font-size:10px;background:#f5f5f5}
${IS_MOBILE ? '.phone{background:#fff!important}' : '#app{background:#fafafa;border:1px solid #ccc}'}
#app *{color:transparent!important;background-color:rgba(0,0,0,0.02)!important;background-image:none!important;text-shadow:none!important;border-color:#e0e0e0!important;box-shadow:none!important}
#app .sk,#app .sk-img,#app .sk-btn,#app .sk-input{color:#bbb!important}
#app [class*="header"],#app [class*="footer"]{border:1px solid #e8e8e8!important;background:#fefefe!important}
</style>
</head>
<body>
${bodyContent}
</body>
</html>`;
}

// ========== TabBar 生成 ==========
function buildTabBar() {
  const tabBar = appJson.tabBar;
  if (!tabBar || !tabBar.list) return '';
  const items = tabBar.list.map((item, i) => {
    const active = i === 0 ? ' style="color:#1979fe"' : ' style="color:#999"';
    const icon = item.iconPath || '';
    return `<div${active} onclick="location.href='${item.pagePath.replace('pages/', '')}.html'">
      ${icon ? `<img src="${icon}" style="width:20px;height:20px;display:block;margin:0 auto">` : ''}
      <span style="font-size:10px">${item.text}</span>
    </div>`;
  }).join('');
  return `<div style="position:fixed;bottom:0;left:0;right:0;height:49px;background:#fff;border-top:1px solid #eee;display:flex;justify-content:space-around;align-items:center;z-index:9999;max-width:375px;margin:0 auto">${items}</div>`;
}

// ========== 主流程 ==========
console.log('='.repeat(60));
console.log(`  微信小程序 → HTML 批量转换  [${IS_MOBILE ? '📱 手机端 375px' : '🖥 浏览器自适应'}]`);
console.log('='.repeat(60));

for (const d of [HF_DIR, WF_DIR]) {
  if (fs.existsSync(d)) { fs.rmSync(d, { recursive: true }); console.log(`  🗑 已清理: ${path.basename(d)}/`); }
  ensureDir(d);
}

const pages = appJson.pages;
// 去重 (app.json 可能有重复)
const uniquePages = [...new Set(pages)];

// 按目录分组
const groups = {};
for (const p of uniquePages) {
  const parts = p.split('/');
  let group = parts.length >= 3 ? parts[1] : '首页';
  // 汉化常见分组名
  const nameMap = { pages: '主页面', city: '城市', consult: '咨询', course: '课程', mine: '我的', school: '学院' };
  group = nameMap[group] || group;
  if (!groups[group]) groups[group] = [];
  groups[group].push(p);
}

let totalHf = 0, totalWf = 0;
const hfIdx = [], wfIdx = [];

const tabBarHtml = buildTabBar();
const tabBarPages = appJson.tabBar ? appJson.tabBar.list.map(t => t.pagePath) : [];

for (const [group, pageList] of Object.entries(groups)) {
  const gHf = path.join(HF_DIR, group);
  const gWf = path.join(WF_DIR, group);
  ensureDir(gHf); ensureDir(gWf);

  const hp = [], wp = [];
  for (const pagePath of pageList) {
    // pagePath: "pages/index/index"
    const parts = pagePath.split('/');
    const pageName = parts[parts.length - 1];
    const wxmlDir = path.join(ROOT, parts.slice(0, -1).join('/'));
    const basePath = path.join(ROOT, pagePath);
    const wxmlPath = basePath + '.wxml';
    const wxssPath = basePath + '.wxss';
    const jsPath = basePath + '.js';

    if (!fs.existsSync(wxmlPath)) {
      console.log(`  ⚠ 跳过: ${pagePath} (无 .wxml)`);
      continue;
    }

    let wxml = fs.readFileSync(wxmlPath, 'utf-8');
    let wxss = fs.existsSync(wxssPath) ? fs.readFileSync(wxssPath, 'utf-8') : '';

    // 模板解析
    wxml = resolveImports(wxml, wxmlDir, 1);
    wxml = resolveIncludes(wxml, wxmlDir);
    // 数据占位
    const defaults = extractDataDefaults(jsPath);
    wxml = applyDefaults(wxml, defaults);
    // 剥离指令
    wxml = stripDirectives(wxml);
    // 路径修复
    wxml = fixPaths(wxml, 1);
    wxss = fixPaths(wxss, 1);

    // TabBar 页面添加底部导航
    const isTabPage = tabBarPages.some(t => pagePath.includes(t) || t.includes(pagePath));
    const bodyHtml = isTabPage ? wxml + '\n' + tabBarHtml : wxml;

    const depth = 1;
    const desc = pageName;

    // 高保真
    const hf = buildHighFidelity(`${group} - ${desc}`, bodyHtml, wxss, depth, group);
    fs.writeFileSync(path.join(gHf, pageName + '.html'), hf, 'utf-8');

    // 线框图 (不需要 page CSS，骨架样式覆盖一切)
    const wf = buildWireframe(`${group} - ${desc}`, bodyHtml, depth, group);
    fs.writeFileSync(path.join(gWf, pageName + '.html'), wf, 'utf-8');

    hp.push({ name: pageName, desc, file: `${group}/${pageName}.html` });
    wp.push({ name: pageName, desc, file: `${group}/${pageName}.html` });
    totalHf++; totalWf++;
  }
  hfIdx.push({ group, pages: hp });
  wfIdx.push({ group, pages: wp });
  console.log(`  ✅ ${group}: ${pageList.length} 页`);
}

// 索引页
function buildIdx(title, sections, total) {
  const grid = sections.map(s => {
    const links = s.pages.map(p =>
      `          <li><a href="${p.file}">${p.desc}</a></li>`
    ).join('\n');
    return `      <div class="sec">
        <h2>📄 ${s.group} <span style="font-weight:400;color:#888;font-size:12px">(${s.pages.length}页)</span></h2>
        <ul>\n${links}\n        </ul>
      </div>`;
  }).join('\n');
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>${title}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Microsoft YaHei",sans-serif;background:#e8edf2;padding:20px}
h1{text-align:center;margin-bottom:6px;color:#263238}
.sub{text-align:center;color:#607d8b;margin-bottom:24px;font-size:14px}
.grid{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(350px,1fr));gap:14px}
.sec{background:#fff;border-radius:8px;padding:14px 18px;box-shadow:0 1px 3px rgba(0,0,0,0.08)}
.sec h2{font-size:14px;color:#37474f;border-bottom:1px solid #eceff1;padding-bottom:6px;margin-bottom:6px}
.sec ul{list-style:none}.sec li{margin:2px 0}
.sec a{color:#1565c0;text-decoration:none;font-size:13px}
.sec a:hover{text-decoration:underline}
.foot{text-align:center;margin-top:24px;color:#90a4ae;font-size:12px}
</style></head><body>
<h1>🏠 ${title}</h1>
<p class="sub">共 ${total} 个页面 | ${IS_MOBILE ? '📱 手机端 375px' : '🖥 浏览器自适应'}</p>
<div class="grid">${grid}</div>
<p class="foot">微信小程序 → 静态 HTML</p>
</body></html>`;
}

fs.writeFileSync(path.join(HF_DIR, 'index.html'), buildIdx('高保真UI - 页面索引', hfIdx, totalHf), 'utf-8');
fs.writeFileSync(path.join(WF_DIR, 'index.html'), buildIdx('线框图 - 页面索引', wfIdx, totalWf), 'utf-8');

// 复制图片资源
const imagesDir = path.join(ROOT, 'images');
if (fs.existsSync(imagesDir)) {
  for (const target of [HF_DIR, WF_DIR]) {
    const dest = path.join(target, 'assets', 'images');
    if (!fs.existsSync(dest)) {
      ensureDir(dest);
      function cp(s, d) {
        if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
        for (const e of fs.readdirSync(s)) {
          const ss = path.join(s, e), dd = path.join(d, e);
          if (fs.statSync(ss).isDirectory()) { cp(ss, dd); } else { try { fs.copyFileSync(ss, dd); } catch(_) {} }
        }
      }
      cp(imagesDir, dest);
      console.log(`  📦 images/ → ${path.basename(target)}/assets/images/`);
    }
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log(`  ✅ 完成！高保真 ${totalHf} 页 + 线框图 ${totalWf} 页`);
console.log(`  📁 high-fidelity${SUFFIX}/index.html  /  wireframe${SUFFIX}/index.html`);
console.log(`${'='.repeat(60)}`);
