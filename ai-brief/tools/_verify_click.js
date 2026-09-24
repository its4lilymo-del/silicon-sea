/* 真实浏览器点击验证 v2（puppeteer-core + 系统 Chrome，无下载内核）
   覆盖：①about 目录点击「文档」→ #docs 完整入视口 + 高亮正确
        ②totop 按钮位置（today 挂 doc-frame 右下角 / show 态距底 26 / 窄屏贴边）
        ③index CTA 字号 19px、按钮高 55px @1440 视口
   注：totop 按钮右缘 = 框右缘内侧 24px → btnRightIn = frameRightIn + 24。
   退出码 0=全部通过，1=有失败。 */
var puppeteer = require('C:/Users/莫莉莉/.workbuddy/binaries/node/workspace/node_modules/puppeteer-core');

var BASE = process.argv[2] || encodeURI('file:///C:/Users/莫莉莉/WorkBuddy/2026-09-19-23-10-37/ai-brief/');
var CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
var results = [];
function check(name, ok, detail){ results.push(ok); console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + '  ' + detail); }
function sleep(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }

(async function(){
  var browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--disable-gpu', '--no-first-run', '--hide-scrollbars']
  });
  try {
    var page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    /* ── 测试 1：about 目录点击「文档」 ── */
    await page.goto(BASE + 'about.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(600);
    await page.click('.toc-side a[href="#docs"]');
    await sleep(2000);
    var r1 = await page.evaluate(function(){
      var d = document.querySelector('#docs').getBoundingClientRect();
      var on = document.querySelector('.toc-side a.on');
      return {
        scrollY: Math.round(window.scrollY || 0),
        maxScroll: Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
        docsTop: Math.round(d.top), docsBottom: Math.round(d.bottom),
        vh: window.innerHeight,
        onHref: on ? on.getAttribute('href') : null
      };
    });
    console.log('  about 详情:', JSON.stringify(r1));
    check('about: #docs 完整入视口', r1.docsTop >= -2 && r1.docsBottom <= r1.vh + 2,
          'top=' + r1.docsTop + ' bottom=' + r1.docsBottom + ' vh=' + r1.vh);
    check('about: 高亮落在「文档」', r1.onHref === '#docs', 'on=' + r1.onHref);
    check('about: 已滚到页底', Math.abs(r1.scrollY - r1.maxScroll) <= 4,
          'y=' + r1.scrollY + ' max=' + r1.maxScroll);

    /* ── 测试 2：totop 位置（today.html，桌面 1440）──
       file:// 下 fetch digest 会失败导致页面很短，先注入高度让滚动可用 */
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE + 'today.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(600);
    await page.evaluate(function(){
      document.documentElement.style.height = '2600px';
      document.body.style.height = '2600px';
      window.scrollTo(0, 800);
    });
    await sleep(600);
    var r2 = await page.evaluate(function(){
      var btn = document.querySelector('.totop');
      var b = btn.getBoundingClientRect();
      var f = document.querySelector('.doc-frame').getBoundingClientRect();
      return {
        shown: btn.classList.contains('show'),
        scrollY: Math.round(window.scrollY || 0),
        btnRightIn: Math.round(window.innerWidth - b.right),
        btnBottomIn: Math.round(window.innerHeight - b.bottom),
        frameRightIn: Math.round(window.innerWidth - f.right)
      };
    });
    console.log('  totop@today 详情:', JSON.stringify(r2));
    check('today: 滚动后按钮出现', r2.shown && r2.scrollY > 320,
          'shown=' + r2.shown + ' y=' + r2.scrollY);
    check('today: 按钮挂在 doc-frame 右缘外侧 24px',
          Math.abs(r2.btnRightIn - (r2.frameRightIn - 24)) <= 3,
          'btn=' + r2.btnRightIn + ' 期望=' + (r2.frameRightIn - 24));
    check('today: show 态距底 26px', Math.abs(r2.btnBottomIn - 26) <= 2, 'bottom=' + r2.btnBottomIn);

    /* ── 测试 2b：totop 窄屏贴边（390px） ── */
    await page.setViewport({ width: 390, height: 800 });
    await sleep(400);
    var r2b = await page.evaluate(function(){
      var b = document.querySelector('.totop').getBoundingClientRect();
      return { btnRightIn: Math.round(window.innerWidth - b.right) };
    });
    check('today@窄屏: 按钮贴边 12px', Math.abs(r2b.btnRightIn - 12) <= 3, 'right=' + r2b.btnRightIn);

    /* ── 测试 3：index CTA 字号与高度 @1440 ── */
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE + 'index.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1400);
    var r3 = await page.evaluate(function(){
      var cta = document.querySelector('.hero__cta');
      var cs = getComputedStyle(cta);
      return { fontSize: parseFloat(cs.fontSize), height: Math.round(cta.getBoundingClientRect().height) };
    });
    check('index: CTA 字号 19px（±0.6）', Math.abs(r3.fontSize - 19) <= 0.6, 'fs=' + r3.fontSize);
    check('index: CTA 高 55px（±2）', Math.abs(r3.height - 55) <= 2, 'h=' + r3.height);
    await page.screenshot({ path: 'C:/Users/莫莉莉/WorkBuddy/2026-09-19-23-10-37/ai-brief/tools/_shot_home5.png' });

    /* ── 测试 4：about 页 totop 挂 about-frame（桌面） ── */
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE + 'about.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(500);
    await page.evaluate(function(){ window.scrollTo(0, 800); });
    await sleep(500);
    var r4 = await page.evaluate(function(){
      var b = document.querySelector('.totop').getBoundingClientRect();
      var f = document.querySelector('.about-frame').getBoundingClientRect();
      return {
        btnRightIn: Math.round(window.innerWidth - b.right),
        frameRightIn: Math.round(window.innerWidth - f.right)
      };
    });
    check('about: 按钮挂在 about-frame 右缘外侧 24px',
          Math.abs(r4.btnRightIn - (r4.frameRightIn - 24)) <= 3,
          'btn=' + r4.btnRightIn + ' 期望=' + (r4.frameRightIn - 24));

  } finally {
    await browser.close();
  }
  var fails = results.filter(function(x){ return !x; }).length;
  console.log(fails === 0 ? 'ALL PASS (' + results.length + ')' : fails + ' FAILED / ' + results.length);
  process.exit(fails === 0 ? 0 : 1);
})().catch(function(e){ console.error('ERR', e.message); process.exit(1); });
