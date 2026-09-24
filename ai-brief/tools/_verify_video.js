/* 视频降级三场景验证（puppeteer-core + 系统 Chrome）
   ①桌面 1440：加载本地 hero-bg.mp4（不再请求 CloudFront 外链），视频播放
   ②窄屏 390：不请求任何 mp4，poster 显示
   ③reduced-motion：不请求 mp4，fade-up 动画被豁免
   退出码 0=全部通过 */
var puppeteer = require('C:/Users/莫莉莉/.workbuddy/binaries/node/workspace/node_modules/puppeteer-core');
var CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
var results = [];
function check(name, ok, detail){ results.push(ok); console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + '  ' + detail); }
function sleep(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }

function watchReqs(page){
  var reqs = [];
  page.on('request', function(r){ reqs.push(r.url()); });
  return reqs;
}

var BASE_URL = process.argv[2] || encodeURI('file:///C:/Users/莫莉莉/WorkBuddy/2026-09-19-23-10-37/ai-brief/index.html');

(async function(){
  var browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--disable-gpu', '--no-first-run', '--autoplay-policy=no-user-gesture-required', '--hide-scrollbars']
  });
  try {
    var page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    /* ① 桌面 */
    var reqs1 = watchReqs(page);
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2500);
    var r1 = await page.evaluate(function(){
      var v = document.querySelector('.bg-video');
      return {
        src: v.currentSrc || v.src || '',
        ready: v.readyState,
        paused: v.paused,
        posterShown: !!v.poster
      };
    });
    var hasLocal = reqs1.some(function(u){ return u.indexOf('hero-bg.mp4') >= 0; });
    var hasCloudfront = reqs1.some(function(u){ return u.indexOf('cloudfront') >= 0; });
    check('桌面: 加载本地 hero-bg.mp4', hasLocal && r1.ready >= 1, 'ready=' + r1.ready);
    check('桌面: 不再请求 CloudFront 外链', !hasCloudfront, '');
    check('桌面: 视频自动播放', !r1.paused, '');
    check('桌面: poster 已配置', r1.posterShown, '');

    /* ② 窄屏 390 */
    var reqs2;
    await page.setViewport({ width: 390, height: 800 });
    reqs2 = [];
    page.removeAllListeners('request');
    page.on('request', function(r){ reqs2.push(r.url()); });
    await page.goto(BASE_URL + '?m=1', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1500);
    var r2 = await page.evaluate(function(){
      var v = document.querySelector('.bg-video');
      return { src: v.currentSrc || '', poster: getComputedStyle(v).poster || '' };
    });
    var mp4Req2 = reqs2.filter(function(u){ return u.indexOf('.mp4') >= 0; }).length;
    check('窄屏: 零视频请求', mp4Req2 === 0 && !r2.src, 'mp4请求=' + mp4Req2);

    /* ③ reduced-motion */
    page.removeAllListeners('request');
    var reqs3 = [];
    page.on('request', function(r){ reqs3.push(r.url()); });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL + '?rm=1', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1500);
    var r3 = await page.evaluate(function(){
      var v = document.querySelector('.bg-video');
      var t = document.querySelector('.hero__title');
      return {
        src: v.currentSrc || '',
        fadeAnim: getComputedStyle(t).animationName
      };
    });
    var mp4Req3 = reqs3.filter(function(u){ return u.indexOf('.mp4') >= 0; }).length;
    check('reduced-motion: 零视频请求', mp4Req3 === 0 && !r3.src, 'mp4请求=' + mp4Req3);
    check('reduced-motion: 入场动画豁免', r3.fadeAnim === 'none', 'anim=' + r3.fadeAnim);

    await page.screenshot({ path: 'C:/Users/莫莉莉/WorkBuddy/2026-09-19-23-10-37/ai-brief/tools/_shot_video.png' });
  } finally {
    await browser.close();
  }
  var fails = results.filter(function(x){ return !x; }).length;
  console.log(fails === 0 ? 'ALL PASS (' + results.length + ')' : fails + ' FAILED / ' + results.length);
  process.exit(fails === 0 ? 0 : 1);
})().catch(function(e){ console.error('ERR', e.message); process.exit(1); });
