// 親検収: fax-site v1.1（キャンペーン価格・レポート見本）機械検査 + 単一ファイルプレビュー生成
// 9/25追加: assets内の各画像がSOURCES.mdに載っているか(BRIEF_light_plan_site_sample_image_20260925.md §7)
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(dir, 'style.css'), 'utf8');
const body = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
const exec = 'https://script.google.com/macros/s/AKfycbzbuNOkw1bRkKLhCfqN56ND-aTnTfdcwxomv4RVaTc6WMc4IenWBlBLYNTnzEbvhsA/exec';
const results = [];
function chk(name, ok, detail) { results.push({ name, ok, detail: detail || '' }); }
chk('「当面」なし', !body.includes('当面'));
chk('「反応率」なし', !body.includes('反応率'));
chk('「%」なし', !body.includes('%') && !body.includes('％'));
chk('キャンペーン価格 7円/件', body.includes('キャンペーン価格') && /キャンペーン価格\s*7円\/件/.test(body.replace(/\s+/g, ' ')));
chk('キャンペーン価格 12円/件', /キャンペーン価格\s*12円\/件/.test(body.replace(/\s+/g, ' ')));
chk('定価10円・定価18円', body.includes('定価10円') && body.includes('定価18円'));
chk('レポート見本の見出し', body.includes('レポートの見本') && body.includes('架空'));
chk('送信完了報告の枠', body.includes('送信完了報告'));
chk('反応レポートの枠', body.includes('反応レポート'));
for (const p of ['register', 'inquiry', 'terms']) chk('link ' + p, html.includes(exec + '?page=' + p));
const ext = (html.match(/(?:src|href)=["']https?:\/\/[^"']+/g) || []).filter(u => !u.includes('script.google.com'));
chk('外部参照なし', ext.length === 0, ext.join(','));
chk('min-width>400なし', !/min-width\s*:\s*([5-9]\d{2}|\d{4,})px/.test(css));
chk('html開閉・title', /<html[\s>]/.test(html) && html.includes('</html>') && /<title>[^<]+<\/title>/.test(html));
const imgs = html.match(/<img[^>]+src=["']([^"']+)/g) || [];
chk('画像は同フォルダ', imgs.every(m => !/https?:/.test(m)), imgs.join(','));
// 見本枠に数字の比率が入っていないか（「件」単位の数は可）
const samples = html.match(/<pre class="mail-sample-body">[\s\S]*?<\/pre>/g) || [];
chk('見本枠2つ', samples.length === 2, String(samples.length));
// assets内の各画像ファイル名がassets/SOURCES.mdに載っていること(載っていなければFAIL)
const assetsDir = path.join(dir, 'assets');
const sourcesPath = path.join(assetsDir, 'SOURCES.md');
const imageExt = /\.(png|jpg|jpeg|gif|svg|webp)$/i;
const assetImages = fs.existsSync(assetsDir)
  ? fs.readdirSync(assetsDir).filter(f => imageExt.test(f))
  : [];
const sourcesText = fs.existsSync(sourcesPath) ? fs.readFileSync(sourcesPath, 'utf8') : '';
if (!fs.existsSync(sourcesPath)) {
  chk('assets/SOURCES.md 存在', false, sourcesPath);
} else {
  for (const f of assetImages) {
    chk('SOURCES.md掲載: ' + f, sourcesText.includes(f));
  }
}
console.log(results.map(r => (r.ok ? 'PASS' : 'FAIL') + ' ' + r.name + (r.detail ? ' ' + r.detail : '')).join('\n'));
console.log('samples:\n' + samples.map(s => s.replace(/<[^>]+>/g, '')).join('\n----\n'));
const fails = results.filter(r => !r.ok).length;
// 単一ファイルプレビュー（CSS inline + 画像 data URI）
let single = html.replace(/<link[^>]+style\.css[^>]*>/, '<style>\n' + css + '\n</style>');
single = single.replace(/src=["'](assets\/[^"']+)["']/g, (m, p) => {
  const f = path.join(dir, p);
  if (!fs.existsSync(f)) return m;
  const b = fs.readFileSync(f).toString('base64');
  const mime = p.endsWith('.png') ? 'image/png' : 'image/jpeg';
  return 'src="data:' + mime + ';base64,' + b + '"';
});
const out = path.join(require('os').tmpdir(), 'fax_site_preview_v1_1.html');
fs.writeFileSync(out, single, 'utf8');
console.log('preview:', out, fs.statSync(out).size, 'bytes');
process.exit(fails ? 1 : 0);
