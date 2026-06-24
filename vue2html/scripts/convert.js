/**
 * 标准版前端 — Vue SFC → 静态 HTML 批量转换 v4
 * 输出: high-fidelity/ (高保真) + wireframe/ (线框图)
 * 浏览器自适应 | 纯静态无 Vue 运行时 | 先合并后简化
 */
const fs = require('fs');
const path = require('path');
const sass = require('sass');
const less = require('less');

const SRC = path.join(__dirname, 'src');
const ASSETS_SRC = path.join(SRC, 'assets');
const HF_DIR = path.join(__dirname, 'high-fidelity');
const WF_DIR = path.join(__dirname, 'wireframe');

const EL_CSS = 'https://unpkg.com/element-ui@2.12.0/lib/theme-chalk/index.css';

const COMMON_CSS = fs.readFileSync(path.join(ASSETS_SRC, 'css/common.css'), 'utf-8');
const ICON_CSS   = fs.readFileSync(path.join(ASSETS_SRC, 'css/icon/iconfont.css'), 'utf-8');

// ========== 路由 ==========
const FLOWS = [];
function flow(g, b, s) { FLOWS.push({ group: g, box: b, steps: s }); }

flow('查档(旧版)', 'views/chaDang/box.vue', [
  'views/chaDang/choose.vue','views/chaDang/purpose.vue','views/chaDang/yongtu.vue',
  'views/chaDang/step1.vue','views/chaDang/step2.vue','views/chaDang/step3.vue',
  'views/chaDang/stepOld.vue','views/chaDang/SelfAddOther.vue','views/chaDang/step4.vue',
  'views/chaDang/step5.vue','views/chaDang/step6.vue','views/chaDang/step7.vue',
]);
flow('查档(新版)', 'views/chaDang_new/box.vue', [
  'views/chaDang_new/choose.vue','views/chaDang_new/purpose.vue','views/chaDang_new/yongtu.vue',
  'views/chaDang_new/identityCard.vue','views/chaDang_new/comparison.vue','views/chaDang_new/comparison_zn.vue',
  'views/chaDang_new/stepOld.vue','views/chaDang_new/SelfAddOther.vue','views/chaDang_new/ownership.vue',
  'views/chaDang_new/havehouse.vue','views/chaDang_new/queryinfo.vue','views/chaDang_new/print.vue',
  'views/chaDang_new/evaluation.vue','views/chaDang_new/steperror.vue','views/chaDang_new/stepfp.vue',
]);
flow('查档(安卓)', 'views/chaDang_android/box.vue', [
  'views/chaDang_android/identityCard.vue','views/chaDang_android/comparison.vue','views/chaDang_android/stepOld.vue',
  'views/chaDang_android/SelfAddOther.vue','views/chaDang_android/ownership.vue','views/chaDang_android/havehouse.vue',
  'views/chaDang_android/queryinfo.vue','views/chaDang_android/print.vue','views/chaDang_android/evaluation.vue',
  'views/chaDang_android/steperror.vue','views/chaDang_android/stepfp.vue',
]);
flow('打证(旧版)', 'views/daZheng/layout.vue', [
  'views/daZheng/choose.vue','views/daZheng/getIdCard.vue','views/daZheng/authCompare.vue',
  'views/daZheng/authCompare2.vue','views/daZheng/serialNumber.vue','views/daZheng/list.vue','views/daZheng/print.vue',
]);
flow('打证(新版)', 'views/daZheng_new/layout.vue', [
  'views/daZheng_new/getIdCard.vue','views/daZheng_new/authCompare.vue','views/daZheng_new/authCompare2.vue',
  'views/daZheng_new/serialNumber.vue','views/daZheng_new/list.vue','views/daZheng_new/print.vue',
]);
flow('打证书', 'views/daZS/layout.vue', [
  'views/daZS/choose.vue','views/daZS/getIdCard.vue','views/daZS/authCompare.vue',
  'views/daZS/authCompare2.vue','views/daZS/serialNumber.vue','views/daZS/list.vue',
  'views/daZS/listNew.vue','views/daZS/hwxListNew.vue','views/daZS/print.vue',
]);
flow('证书证明(新版)', 'views/dzszm_new/box.vue', [
  'views/dzszm_new/getIdCard.vue','views/dzszm_new/comparison.vue','views/dzszm_new/serialNumber.vue',
  'views/dzszm_new/list.vue','views/dzszm_new/printzs.vue','views/dzszm_new/printzm.vue',
  'views/dzszm_new/printsuccess.vue','views/dzszm_new/evaluation.vue','views/dzszm_new/steperror.vue',
]);
flow('申报', 'views/shenBao/box.vue', [
  'views/shenBao/step1.vue','views/shenBao/step2.vue','views/shenBao/step3.vue',
  'views/shenBao/step4.vue','views/shenBao/step5.vue','views/shenBao/step6.vue',
  'views/shenBao/step7.vue','views/shenBao/step8.vue','views/shenBao/step9.vue',
  'views/shenBao/step10.vue','views/shenBao/step11.vue','views/shenBao/step12.vue',
  'views/shenBao/step13.vue','views/shenBao/step18.vue',
]);
flow('网签', 'views/wangqian/layout.vue', [
  'views/wangqian/getIdCard.vue','views/wangqian/authCompare.vue','views/wangqian/list.vue',
  'views/wangqian/peopleSell.vue','views/wangqian/peopleBuy.vue','views/wangqian/ht_1.vue',
  'views/wangqian/ht_2.vue','views/wangqian/ht_3.vue','views/wangqian/ht_4.vue',
  'views/wangqian/ht_5.vue','views/wangqian/ht_6.vue','views/wangqian/print.vue','views/wangqian/esign.vue',
]);
flow('缴费', 'views/jiaoFei/box.vue', ['views/jiaoFei/step1.vue','views/jiaoFei/step2.vue']);
flow('利害关系', 'views/lhgx/box.vue', [
  'views/lhgx/step1.vue','views/lhgx/step2.vue','views/lhgx/step3.vue','views/lhgx/step4.vue','views/lhgx/step5.vue',
]);
flow('证书真伪', 'views/zszw/box.vue', ['views/zszw/step1.vue']);
flow('加号', 'views/addnum/layout.vue', [
  'views/addnum/choose.vue','views/addnum/zm_inputNum.vue','views/addnum/zm_inputPreview.vue',
  'views/addnum/zs_inputNum.vue','views/addnum/zs_inputPreview.vue',
]);
flow('办事指南', 'views/daZheng/layout.vue', ['views/bszn/bszn.vue','views/bszn/bsznDetail.vue']);
flow('办事进度', 'views/daZheng/layout.vue', ['views/bsjd/step1.vue','views/bsjd/step2.vue']);
flow('智能问答', 'views/daZheng/layout.vue', ['views/znwd/znwd.vue']);

const STANDALONE = [
  { group:'首页', name:'index', vue:'views/index.vue', desc:'主入口(路由跳转)', empty:true },
  { group:'首页', name:'indexOld', vue:'views/indexOld.vue', desc:'8000B一体机首页' },
  { group:'首页', name:'indexCZ', vue:'views/indexCZ.vue', desc:'CZ一体机首页' },
  { group:'首页', name:'indexCZZ', vue:'views/indexCZZ.vue', desc:'CZZ一体机首页' },
  { group:'首页', name:'indexSMART', vue:'views/indexSMART.vue', desc:'智能屏首页' },
  { group:'首页', name:'indexAI', vue:'views/indexAI.vue', desc:'AI智能屏首页' },
  { group:'首页', name:'indexAICD', vue:'views/indexAICD.vue', desc:'AI智能屏查档' },
  { group:'首页', name:'indexAIZM', vue:'views/indexAIZM.vue', desc:'AI智能屏证明' },
  { group:'首页', name:'indexAIZS', vue:'views/indexAIZS.vue', desc:'9000AI首页' },
  { group:'业务入口', name:'cd', vue:'views/cd.vue', desc:'查档入口' },
  { group:'业务入口', name:'cd1', vue:'views/cd1.vue', desc:'查档入口2' },
  { group:'业务入口', name:'cd_new', vue:'views/cd_new.vue', desc:'新查档入口' },
  { group:'业务入口', name:'cd_android', vue:'views/cd_android.vue', desc:'安卓查档入口' },
  { group:'业务入口', name:'dz', vue:'views/dz.vue', desc:'打证入口' },
  { group:'业务入口', name:'dzm', vue:'views/dzm.vue', desc:'打证明入口' },
  { group:'业务入口', name:'dzs', vue:'views/dzs.vue', desc:'打证书入口' },
  { group:'业务入口', name:'dzss', vue:'views/dzss.vue', desc:'打证书入口2' },
  { group:'业务入口', name:'dzs_dzm', vue:'views/dzs_dzm.vue', desc:'证书证明入口' },
  { group:'业务入口', name:'jf', vue:'views/jf.vue', desc:'缴费入口' },
  { group:'业务入口', name:'sb', vue:'views/sb.vue', desc:'申报入口' },
  { group:'业务入口', name:'wq', vue:'views/wq.vue', desc:'网签入口' },
  { group:'后台', name:'backstage', vue:'views/htgl/backstage.vue', desc:'后台管理' },
  { group:'后台', name:'chaDangBackEnd', vue:'views/dataBackEnd/chaDangBackEnd.vue', desc:'查档后台' },
  { group:'后台', name:'stressTest', vue:'views/stressTest/stressTest.vue', desc:'压力测试' },
  { group:'后台', name:'zmzsBackEnd', vue:'views/dzmzsBackEnd/zmzsBackEnd.vue', desc:'证明证书后台' },
];

// ========== 工具函数 ==========
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function parseVueSFC(content) {
  const r = { template: '', styles: [], script: '' };
  const t = content.match(/<template>([\s\S]*?)<\/template>/i);
  if (t) r.template = t[1].trim();
  const sc = content.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  if (sc) r.script = sc[1].trim();
  const re = /<style([^>]*)>([\s\S]*?)<\/style>/gi; let m;
  while ((m = re.exec(content)) !== null) {
    r.styles.push({
      css: m[2].trim(),
      isScss: /lang\s*=\s*["'](?:scss|sass)["']/i.test(m[1]),
      isLess: /lang\s*=\s*["']less["']/i.test(m[1])
    });
  }
  return r;
}

function compileScss(code) {
  try {
    return sass.compileString(code, { logger: { warn: () => {}, debug: () => {} } }).css;
  } catch (e) {
    return code.replace(/\/\/.*/g, '').replace(/\$[\w-]+:[^;]+;/g, '').replace(/&/g, '');
  }
}

function compileLess(code) {
  let result = code;
  less.render(code, { syncImport: true }, (err, out) => { if (!err && out) result = out.css; });
  return result;
}

function fixCssUrls(css, depth) {
  const pfx = '../'.repeat(Math.max(0, depth));
  return css
    .replace(/url\((['"]?)\.\.\/\.\.\/assets\/images\//g, `url($1${pfx}assets/images/`)
    .replace(/url\((['"]?)\.\.\/images\//g, `url($1${pfx}assets/images/`);
}

function simplifyTemplate(tpl, depth) {
  let h = tpl;
  // 去除 Vue 指令
  h = h.replace(/\s+v-if\s*=\s*"[^"]*"/g, '');
  h = h.replace(/\s+v-else-if\s*=\s*"[^"]*"/g, '');
  h = h.replace(/\s+v-else(\s|>)/g, (m, g1) => g1 || '>');
  h = h.replace(/\s+v-show\s*=\s*"[^"]*"/g, '');
  h = h.replace(/\s+v-for\s*=\s*"[^"]*"/g, '');
  h = h.replace(/\s+v-model\s*=\s*"[^"]*"/g, '');
  h = h.replace(/\s+:key\s*=\s*"[^"]*"/g, '');
  h = h.replace(/\s+v-html\s*=\s*"[^"]*"/g, '');
  h = h.replace(/\s+v-on\s*:\w+\s*=\s*"[^"]*"/g, '');
  h = h.replace(/\s+@\w+(?:\.\w+)*\s*=\s*"[^"]*"/g, '');
  h = h.replace(/\s+@dblclick\s*=\s*"[^"]*"/g, '');
  h = h.replace(/\s+:(\w[\w-]*)\s*=\s*"'([^']*)'"/g, ' $1="$2"');
  h = h.replace(/\s+:(\w[\w-]*)\s*=\s*"([^"]*)"/g, (m, attr, val) => {
    if (val === 'true') return ` ${attr}`;
    if (val === 'false') return '';
    if (/^\d+$/.test(val)) return ` ${attr}="${val}"`;
    if (/^[a-zA-Z_$][\w$.]*$/.test(val)) return ` ${attr}=""`;
    return m;
  });
  h = h.replace(/\s+ref\s*=\s*"[^"]*"/g, '');
  h = h.replace(/\s+=""/g, '');
  // {{ }} → 静态占位
  h = h.replace(/\{\{[\s]*([^}]+?)[\s]*\}\}/g, (m, expr) => {
    const v = expr.trim();
    if (/deploy\.(logoTitle|machineType)/.test(v)) return '不动产登记';
    if (/year|month|date|banbenId|version|residuecard/.test(v)) return '—';
    if (/\$store/.test(v)) return '';
    return '—';
  });
  // img src 路径修复
  const pfx = '../'.repeat(Math.max(0, depth));
  h = h.replace(/src\s*=\s*"\.\.\/assets\/images\//g, `src="${pfx}assets/images/`);
  h = h.replace(/src\s*=\s*"\.\.\/\.\.\/assets\/images\//g, `src="${pfx}assets/images/`);
  h = h.replace(/src\s*=\s*"\.\.\/images\//g, `src="${pfx}assets/images/`);
  // 移除 slot / router-view（合并之后才移除）
  h = h.replace(/<slot[^>]*>\s*<\/slot>/g, '');
  h = h.replace(/<slot[^>]*\/>/g, '');
  h = h.replace(/<router-view[^>]*\/?>\s*<\/router-view>|<router-view[^>]*\/>/gi, '');
  return h;
}

// 读取 Vue 文件并编译样式 + 简化模板
function readVue(vuePath, depth) {
  const full = path.join(SRC, vuePath);
  if (!fs.existsSync(full)) return { template: '', css: '' };
  const parsed = parseVueSFC(fs.readFileSync(full, 'utf-8'));
  let css = '';
  for (const s of parsed.styles) {
    if (s.isScss) css += compileScss(s.css) + '\n';
    else if (s.isLess) css += compileLess(s.css) + '\n';
    else css += s.css + '\n';
  }
  return { template: simplifyTemplate(parsed.template, depth || 1), css };
}

// 读取原始模板（不简化，保留 router-view 用于 box+step 合并）
function readVueRaw(vuePath) {
  const full = path.join(SRC, vuePath);
  if (!fs.existsSync(full)) return { template: '', css: '' };
  const raw = fs.readFileSync(full, 'utf-8');
  const parsed = parseVueSFC(raw);
  let css = '';
  for (const s of parsed.styles) {
    if (s.isScss) css += compileScss(s.css) + '\n';
    else if (s.isLess) css += compileLess(s.css) + '\n';
    else css += s.css + '\n';
  }
  // 解析子组件并展开
  const { template: resolvedTpl, css: resolvedCss } = resolveSubComponents(vuePath, parsed.template, parsed.script, css);
  return { template: resolvedTpl, css: resolvedCss };
}

// 解析 layout 文件的子组件（header-bar, footer-bar 等）
function resolveSubComponents(parentVuePath, template, script, existingCss) {
  let tpl = template;
  let css = existingCss;
  // 提取 import 语句: import Xxx from './path'
  const imports = [];
  const re = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(script)) !== null) {
    imports.push({ name: m[1], from: m[2] });
  }
  // 解析每个导入的组件
  for (const imp of imports) {
    // 解析路径
    let compPath;
    if (imp.from.startsWith('.')) {
      compPath = path.join(path.dirname(parentVuePath), imp.from);
    } else {
      compPath = imp.from;
    }
    // 确保 .vue 后缀
    if (!compPath.endsWith('.vue')) compPath += '.vue';
    const fullPath = path.join(SRC, compPath);
    // 标准化路径
    const resolvedRel = path.relative(SRC, fullPath).replace(/\\/g, '/');
    if (!fs.existsSync(fullPath)) continue;
    // 读取子组件
    const compRaw = fs.readFileSync(fullPath, 'utf-8');
    const compParsed = parseVueSFC(compRaw);
    // 编译子组件样式
    let compCss = '';
    for (const s of compParsed.styles) {
      if (s.isScss) compCss += compileScss(s.css) + '\n';
      else if (s.isLess) compCss += compileLess(s.css) + '\n';
      else compCss += s.css + '\n';
    }
    css += compCss;
    // 生成 kebab-case 标签名
    const kebab = imp.name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
    // 替换 <xxx></xxx> 和 <xxx />
    tpl = tpl.replace(
      new RegExp(`<${kebab}([^>]*)>(\\s*)<\\/${kebab}>`, 'gi'),
      (match, attrs, space) => `<div class="__comp_${kebab}">${compParsed.template}</div>`
    );
    tpl = tpl.replace(
      new RegExp(`<${kebab}[^>]*\\/>`, 'gi'),
      `<div class="__comp_${kebab}">${compParsed.template}</div>`
    );
  }
  return { template: tpl, css };
}

// ========== HTML 生成 ==========
const BASE_STYLE = `html,body{width:100vw;height:100vh;margin:0;padding:0;overflow:hidden;background:#222}
#app{width:100vw;height:100vh;position:relative;overflow:hidden auto}`;

function buildHighFidelity(title, bodyHtml, componentCss, depth, navHtml) {
  const commonCss = fixCssUrls(COMMON_CSS, depth);
  const iconCss  = fixCssUrls(ICON_CSS, depth);
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<link rel="stylesheet" href="${EL_CSS}">
<style>
${BASE_STYLE}
${commonCss}
${iconCss}
${componentCss}
</style>
</head>
<body>
${navHtml}
<div id="app">
${bodyHtml}
</div>
</body>
</html>`;
}

function buildWireframe(title, bodyHtml, depth, navHtml) {
  let wfBody = bodyHtml
    .replace(/<img[^>]*>/g, '<div class="sk-img" style="display:inline-block;min-width:40px;min-height:40px">img</div>')
    .replace(/<input[^>]*>/g, '<div class="sk-input" style="display:inline-block;height:40px;min-width:100px"></div>')
    .replace(/<button[^>]*>.*?<\/button>/g, '<div class="sk-btn" style="display:inline-block;padding:8px 24px">btn</div>')
    .replace(/<textarea[^>]*>.*?<\/textarea>/g, '<div class="sk-block" style="height:80px;min-width:200px"></div>')
    .replace(/<select[^>]*>.*?<\/select>/g, '<div class="sk-select" style="display:inline-block;height:36px;width:120px"></div>');
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>线框图 - ${title}</title>
<style>
${BASE_STYLE}
/* 线框骨架 */
.sk{background:#e8e8e8;border-radius:3px;display:inline-block;min-height:10px}
.sk-img{background:#eee;border:1.5px dashed #bbb;display:inline-flex;align-items:center;justify-content:center;color:#bbb;font-size:11px;border-radius:3px}
.sk-input,.sk-select,.sk-block{background:#f5f5f5;border:1.5px dashed #bbb;border-radius:4px;display:inline-block}
.sk-btn{border:1.5px dashed #bbb;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;color:#aaa;font-size:10px;background:#f5f5f5}
#app{background:#fafafa;border:1px solid #ccc}
#app *{color:transparent!important;background-color:rgba(0,0,0,0.02)!important;background-image:none!important;text-shadow:none!important;border-color:#e0e0e0!important;box-shadow:none!important}
#app .sk,#app .sk-img,#app .sk-btn,#app .sk-input,#app .sk-select,#app .sk-block{color:#bbb!important}
#app header,#app footer,[class*="header"],[class*="footer"],[class*="box"],[class*="content"],[class*="main"]{border:1px solid #e8e8e8!important;background:#fefefe!important}
#app table,#app table td,#app table th{border:1px solid #e8e8e8!important}
</style>
</head>
<body>
${navHtml}
<div id="app">${wfBody}</div>
</body>
</html>`;
}

// ========== 导航栏 ==========
function flowNavHtml(steps, curIdx) {
  const prev = curIdx > 0
    ? `<a href="${steps[curIdx-1].name}.html" style="color:#333;text-decoration:none;padding:4px 12px;background:#eee;border-radius:4px">◀ 上一步</a>`
    : '<span style="opacity:0.3">◀ 上一步</span>';
  const next = curIdx < steps.length-1
    ? `<a href="${steps[curIdx+1].name}.html" style="color:#333;text-decoration:none;padding:4px 12px;background:#eee;border-radius:4px">下一步 ▶</a>`
    : '<span style="opacity:0.3">下一步 ▶</span>';
  const sel = steps.map((s, j) =>
    `<option value="${s.name}.html"${j===curIdx?' selected':''}>${j+1}. ${s.desc}</option>`
  ).join('');
  return `<div style="position:fixed;top:0;left:0;right:0;z-index:10001;background:rgba(255,255,255,0.95);border-bottom:1px solid #ddd;padding:6px 16px;display:flex;align-items:center;gap:10px;font-size:13px;font-family:'Microsoft YaHei',sans-serif">
${prev} ${next}
<select onchange="if(this.value)location.href=this.value" style="padding:4px 8px;border:1px solid #ccc;border-radius:4px;font-size:12px">${sel}</select>
<a href="../index.html" style="color:#1565c0;text-decoration:none;margin-left:auto;font-size:12px">📋 索引</a>
</div>`;
}

// ========== 主流程 ==========
console.log('='.repeat(60));
console.log('  标准版前端 → HTML 批量转换 v4');
console.log('  浏览器自适应 | 纯静态无 Vue | 先合并后简化');
console.log('='.repeat(60));

for (const d of [HF_DIR, WF_DIR]) {
  if (fs.existsSync(d)) { fs.rmSync(d, { recursive: true }); console.log(`  🗑 已清理: ${path.basename(d)}/`); }
  ensureDir(d);
}

let totalHf = 0, totalWf = 0;
const hfIdx = [], wfIdx = [];

// 1. Box+Step 流程（先用原始模板合并，再简化）
for (const f of FLOWS) {
  const boxRaw = readVueRaw(f.box);
  const gHf = path.join(HF_DIR, f.group), gWf = path.join(WF_DIR, f.group);
  ensureDir(gHf); ensureDir(gWf);

  const hp = [], wp = [];
  const stepDefs = f.steps.map(s => ({ name: path.basename(s, '.vue'), desc: path.basename(s, '.vue') }));
  for (let i = 0; i < f.steps.length; i++) {
    const stepRaw = readVueRaw(f.steps[i]);
    const sname = path.basename(f.steps[i], '.vue');
    const depth = 1;

    // 关键：先用原始模板合并，再统一简化
    const mergedRaw = boxRaw.template.replace(
      /<router-view[^>]*\/?>\s*<\/router-view>|<router-view[^>]*\/>/gi,
      stepRaw.template
    );
    const merged = simplifyTemplate(mergedRaw, depth);
    const mergedCss = boxRaw.css + '\n' + stepRaw.css;
    const nav = flowNavHtml(stepDefs, i);

    fs.writeFileSync(path.join(gHf, sname + '.html'), buildHighFidelity(`${f.group} - ${sname}`, merged, mergedCss, depth, nav), 'utf-8');
    fs.writeFileSync(path.join(gWf, sname + '.html'), buildWireframe(`${f.group} - ${sname}`, merged, depth, nav), 'utf-8');

    hp.push({ name: sname, desc: sname, file: `${f.group}/${sname}.html` });
    wp.push({ name: sname, desc: sname, file: `${f.group}/${sname}.html` });
    totalHf++; totalWf++;
  }
  hfIdx.push({ group: f.group, pages: hp, isFlow: true });
  wfIdx.push({ group: f.group, pages: wp, isFlow: true });
  console.log(`  ✅ ${f.group}: ${f.steps.length} 页`);
}

// 2. 独立页面
const sg = {};
for (const s of STANDALONE) { if (!sg[s.group]) sg[s.group] = []; sg[s.group].push(s); }
for (const [group, items] of Object.entries(sg)) {
  const gHf = path.join(HF_DIR, group), gWf = path.join(WF_DIR, group);
  ensureDir(gHf); ensureDir(gWf);

  const hp = [], wp = [];
  for (const item of items) {
    const data = readVue(item.vue, 1);
    let tpl = data.template;
    if (!tpl || /^<div class="index"><\/div>$/.test(tpl.trim())) {
      tpl = `<div style="display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:20px;font-family:'Microsoft YaHei',sans-serif">
<div style="font-size:48px">🏧</div>
<div style="font-size:36px;color:#999">${item.desc}</div>
<div style="font-size:18px;color:#bbb">此页面为路由跳转入口，请从索引页选择其他页面</div>
</div>`;
    }
    const depth = 1;

    fs.writeFileSync(path.join(gHf, item.name + '.html'), buildHighFidelity(`${group} - ${item.desc}`, tpl, data.css, depth, ''), 'utf-8');
    fs.writeFileSync(path.join(gWf, item.name + '.html'), buildWireframe(`${group} - ${item.desc}`, tpl, depth, ''), 'utf-8');

    hp.push({ name: item.name, desc: item.desc, file: `${group}/${item.name}.html` });
    wp.push({ name: item.name, desc: item.desc, file: `${group}/${item.name}.html` });
    totalHf++; totalWf++;
  }
  hfIdx.push({ group, pages: hp, isFlow: false });
  wfIdx.push({ group, pages: wp, isFlow: false });
  console.log(`  ✅ ${group}: ${items.length} 页`);
}

// 3. 索引页
function buildIdx(title, sections, total) {
  const grid = sections.map(s => {
    const links = s.pages.map(p =>
      `          <li><a href="${p.file}">${p.desc}</a> <span style="color:#999;font-size:11px">(${p.name})</span></li>`
    ).join('\n');
    return `      <div class="sec">
        <h2>${s.isFlow?'🔄':'📄'} ${s.group} <span style="font-weight:400;color:#888;font-size:12px">(${s.pages.length}页)</span></h2>
        <ul>\n${links}\n        </ul>
      </div>`;
  }).join('\n');
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>${title}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Microsoft YaHei",sans-serif;background:#e8edf2;padding:20px}
h1{text-align:center;margin-bottom:6px;color:#263238}
.sub{text-align:center;color:#607d8b;margin-bottom:24px;font-size:14px}
.grid{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:14px}
.sec{background:#fff;border-radius:8px;padding:14px 18px;box-shadow:0 1px 3px rgba(0,0,0,0.08)}
.sec h2{font-size:14px;color:#37474f;border-bottom:1px solid #eceff1;padding-bottom:6px;margin-bottom:6px}
.sec ul{list-style:none}.sec li{margin:2px 0}
.sec a{color:#1565c0;text-decoration:none;font-size:13px}
.sec a:hover{text-decoration:underline}
.foot{text-align:center;margin-top:24px;color:#90a4ae;font-size:12px}
</style></head><body>
<h1>🏠 ${title}</h1>
<p class="sub">共 ${total} 个页面 | 浏览器窗口自适应</p>
<div class="grid">${grid}</div>
<p class="foot">Vue SFC → 静态 HTML v4</p>
</body></html>`;
}

fs.writeFileSync(path.join(HF_DIR, 'index.html'), buildIdx('高保真UI - 页面索引', hfIdx, totalHf), 'utf-8');
fs.writeFileSync(path.join(WF_DIR, 'index.html'), buildIdx('线框图 - 页面索引', wfIdx, totalWf), 'utf-8');

// 4. 复制 assets
function copyAssets(dstDir) {
  const dest = path.join(dstDir, 'assets');
  if (!fs.existsSync(dest)) {
    function cp(s, d) {
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
      for (const e of fs.readdirSync(s)) {
        const ss = path.join(s, e), dd = path.join(d, e);
        fs.statSync(ss).isDirectory() ? cp(ss, dd) : fs.copyFileSync(ss, dd);
      }
    }
    cp(ASSETS_SRC, dest);
    console.log(`  📦 Assets → ${path.basename(dstDir)}/assets/`);
  }
}
copyAssets(HF_DIR);
copyAssets(WF_DIR);

console.log(`\n${'='.repeat(60)}`);
console.log(`  ✅ 完成！高保真 ${totalHf} 页 + 线框图 ${totalWf} 页`);
console.log(`  📁 high-fidelity/index.html  /  wireframe/index.html`);
console.log(`${'='.repeat(60)}`);
