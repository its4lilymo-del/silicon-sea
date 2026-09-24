/* 硅与海 · 页面动效与出处分级筛选（today / archive 共用）
   三个能力：
     1. fxMarkGrades  识别正文条目的 A/B/C 级别，打徽标
     2. buildGradeFilter 生成筛选按钮组
     3. fxInit        分段渐入 + 阅读进度条 + 筛选绑定
   原则：纯渐进增强。JS 不跑时正文照常可读，筛选按钮由 JS 注入。 */

/* ---------- 1. 识别出处分级 ----------
   与 PRD §5 的 A/B/C 三级对齐。

   判据优先级（从严到宽，避免关键词误判）：
     1) 「原文：」后面的链接域名属官方           → A
     1.5) 文内注明主事件经官方披露（交易所披露/官宣/
          公告等），但附的是媒体链接            → B（宁低勿高）
     2) 命中否定/未证实用语                     → C（最高优先，未证实永远压过其他信号）
     3) 条目里根本没有任何外链、且是流程说明句 → 不打标（返回 null）
     4) 其余有外链的条目                        → B

   关键教训一：不能靠"官网/Newsroom"这类词判断——「其余 15 家 Newsroom 无新增」
   这种否定句会误判成 A 级。A 级只能由"附了官方域名链接"来证明。
   关键教训二（2026-09-23 用户拍板）：主事件官方披露但链接是媒体的（如
   环动科技撤回 IPO——上交所已披露、原文链接是澎湃），页面展示层判 B 不判 A：
   读者点开的是媒体报道，分级只能基于能点开的证据；标错的代价不对称，
   宁低勿高。正解在源头——生成端遇到此类事件优先附官方 URL。 */

/* 官方域名白名单 */
var GRADE_A_HOST = [
  'weibo.com',            /* 官方微博 */
  'mp.weixin.qq.com',     /* 官方公众号 */
  'github.com',           /* 代码/开源发布 */
  'sec.gov',              /* 美股披露 */
  'sse.com.cn',           /* 上交所 */
  'szse.cn',              /* 深交所 */
  'hkexnews.hk',          /* 港交所 */
  'cninfo.com.cn',        /* 巨潮资讯 */
  'patents.google.com',
  'arxiv.org',
  'nvidia.com','tesla.com','unitree.com','agibot.com','ubtrobot.com',
  'iflytek.com','insta360.com','bostondynamics.com','figure.ai',
  '1x.tech','engineai.com','xpeng.com','dfrobot.com','pudutech.com',
  'robotics.tencent.com','unitree.cc'
];

/* C 级：未证实用语（否定式表达，优先级最高） */
var GRADE_C_HINT = /(未经官方证实|未获?官方确认|未获当事方回应|未官方确认|未予置评|尚待确认|有待核实|尚未获官方证实|市场传闻|渠道传闻|产业链称|产业链消息|据.{0,6}报道|据传|据称|消息人士|爆料|网传|传称)/;

/* 主事件官方披露的文内信号（规则 1.5 用，须有外链才生效）：
   交易所/招股书/证监会 + 披露类动词近邻，或公告/官宣等复合词。
   注意：不能出现裸「官方」（「尚未获官方证实」「未官方确认」是否定式）、
   裸「官网」（「官网检索兜底」「官网 Newsroom 无新增」是流程句）、
   裸「中标」（须「中标公示」才算官方记录，避免误触普通中标报道）。 */
var GRADE_OFFICIAL_MENTION = new RegExp(
  '(上交所|深交所|港交所|巨潮资讯|招股书|证监会)[^。；]{0,10}(披露|公告|公布|显示|发布|更新)' +
  '|(公告显示|公告称|公告披露|招股书披露|官网显示|官网披露|官网消息|官网发布|官网更新' +
  '|官方微博|官方微信|官方公众号|官方博客|官方宣布|官宣' +
  '|工商变更|工商登记|中标公示|招投标|专利公开|专利公布)');

/* 非新闻条目：流程说明 / 空窗说明 / 分组标题，不打级别标 */
var GRADE_SKIP = /(无新增|无动态|均无窗内|无窗内新增|已建档|快照已|本期均无|搜索转|检索兜底|供人工|见快讯|见前日回溯|上期报道|已在上期)/;

function fxPickGrade(block, extras) {
  extras = extras || [];
  var txt = block.textContent || '';
  [].forEach.call(extras, function (e) { txt += '\n' + (e.textContent || ''); });

  /* 0) 分组标题（以冒号结尾的短句）不是条目本身，不打标 */
  if (/[：:]\s*$/.test(txt.trim()) && txt.trim().length < 40) return null;

  /* 汇总条目内全部链接（标题里的 + 摘要/原文段落里的） */
  var links = [].slice.call(block.querySelectorAll('a[href^="http"]'));
  [].forEach.call(extras, function (e) {
    links = links.concat([].slice.call(e.querySelectorAll('a[href^="http"]')));
  });

  /* 1) 官方域名链接是最强证据：有官方链接就是 A
        即便摘要里另有一句传闻（如"另有市场传闻称…尚未获官方证实"），
        按 PRD「同事件取最高级别」仍判 A——主事件是官方披露的。 */
  for (var i = 0; i < links.length; i++) {
    var h = '';
    try { h = new URL(links[i].href).hostname.replace(/^www\./, ''); } catch (e) { continue; }
    for (var j = 0; j < GRADE_A_HOST.length; j++) {
      var d = GRADE_A_HOST[j];
      if (h === d || h.slice(-(d.length + 1)) === '.' + d) {
        block.dataset.hasUnverified = GRADE_C_HINT.test(txt) ? '1' : '';
        return 'A';
      }
    }
  }

  /* 1.5) 主事件在文内注明了官方披露（交易所披露/官宣/公告等），但附的是媒体链接：
         按 PRD「同事件取最高级别」，主事件本体是官方信息；但展示层只能按
         「能点开的证据」判——媒体链接不是官方证据，故判 B（宁低勿高）。
         若另含未证实用语，置 hasUnverified，由悬停提示读者留意。 */
  if (links.length && GRADE_OFFICIAL_MENTION.test(txt)) {
    block.dataset.hasUnverified = GRADE_C_HINT.test(txt) ? '1' : '';
    return 'B';
  }

  /* 2) 未证实用语且无官方链接 → C */
  if (GRADE_C_HINT.test(txt)) return 'C';

  /* 3) 没有外链的说明性句子，不打标 */
  if (!links.length) return null;

  /* 4) 其余有外链 → B */
  return 'B';
}

/* 给正文条目打级别标记——以「条目」为单位：
   渲染结构是 <ul><li>标题</li></ul><p>摘要…点评…原文…</p>，
   单列表后紧随的段落属于同一条目，级别与筛选都整组处理。 */
function fxMarkGrades(root) {
  var marked = 0;

  [].forEach.call(root.querySelectorAll('ul,ol'), function (list) {
    [].forEach.call(list.children, function (li) {
      if (li.tagName !== 'LI') return;

      /* 单条列表：其后的连续 <p> 是同一条目的正文 */
      var extras = [];
      if (list.children.length === 1) {
        var s = list.nextElementSibling;
        while (s && s.tagName === 'P') { extras.push(s); s = s.nextElementSibling; }
      }

      var g = fxPickGrade(li, extras);
      if (!g) return;

      li.dataset.grade = g;
      [].forEach.call(extras, function (p) { p.dataset.grade = g; });

      var badge = document.createElement('span');
      badge.className = 'grade-badge g' + g;
      badge.textContent = g;
      var tip;
      if (g === 'A') {
        tip = '官方来源，可直接作为事实引用';
        if (li.dataset.hasUnverified === '1') tip += '；文中另含未经证实的部分，请留意表述';
      } else if (g === 'B') {
        tip = '媒体报道，已注明媒体与时间';
        if (li.dataset.hasUnverified === '1') tip += '；文中另含未经证实的部分，请留意表述';
      } else {
        tip = '未经证实，详情以官方发布为准';
      }
      badge.title = tip;
      li.insertBefore(badge, li.firstChild);
      marked++;
    });
  });

  /* 不属于任何条目组的独立段落：只标含未证实用语的（C） */
  [].forEach.call(root.querySelectorAll('p'), function (p) {
    if (p.dataset.grade) return;
    if (p.closest && p.closest('ul,ol')) return;
    if (GRADE_C_HINT.test(p.textContent) && p.textContent.length > 20) {
      var b = document.createElement('span');
      b.className = 'grade-badge gC';
      b.textContent = 'C';
      b.title = '未经证实，详情以官方发布为准';
      p.insertBefore(b, p.firstChild);
      p.dataset.grade = 'C';
      marked++;
    }
  });

  return marked;
}

/* ---------- 2. 筛选按钮组 ---------- */
function buildGradeFilter(){
  return '<div class="gradefilter" id="gradefilter">'
    + '<span class="gf-label">出处分级</span>'
    + '<button data-g="all" class="on">全部</button>'
    + '<button data-g="A">A 官方</button>'
    + '<button data-g="B">B 媒体</button>'
    + '<button data-g="C">C 未证实</button>'
    + '<span class="gf-hint" id="gfhint"></span>'
    + '</div>';
}
/* ---------- 3. 初始化 ---------- */
function fxInit(){
  var doc = document.getElementById('doc');
  if (!doc) return;

  /* 3a. 分段渐入：块级元素加 .reveal，进入视口时加 .in */
  var blocks = doc.querySelectorAll('h2, h3, h4, p, ul, .tbl, blockquote, hr');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });

    [].forEach.call(blocks, function (b) {
      /* 筛选栏不参与渐入，避免刚加载时按钮不可见 */
      if (b.classList.contains('gradefilter')) return;
      b.classList.add('reveal');
      io.observe(b);
    });
    /* 首屏元素直接显示，避免白屏感 */
    setTimeout(function () {
      [].forEach.call(doc.querySelectorAll('.reveal:not(.in)'), function (b) {
        if (b.getBoundingClientRect().top < window.innerHeight) b.classList.add('in');
      });
    }, 60);
  }

  /* 3b. 阅读进度条 */
  var bar = document.getElementById('readbar');
  if (bar) {
    var tick = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0) + '%';
    };
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick, { passive: true });
    tick();
  }

  /* 3c. 筛选绑定 */
  var filter = document.getElementById('gradefilter');
  if (filter) {
    /* 某级别一条都没有时，按钮置灰并禁用，避免点了空白 */
    [].forEach.call(filter.querySelectorAll('button[data-g]'), function (b) {
      var g = b.dataset.g;
      if (g === 'all') return;
      var n = doc.querySelectorAll('li[data-grade="' + g + '"]').length;
      if (!n) {
        b.disabled = true;
        b.style.opacity = '.4';
        b.style.cursor = 'default';
        b.title = '本期无 ' + g + ' 级条目';
      }
    });

    [].forEach.call(filter.querySelectorAll('button'), function (btn) {
      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        var g = btn.dataset.g;
        [].forEach.call(filter.querySelectorAll('button'), function (b) { b.classList.remove('on'); });
        btn.classList.add('on');
        [].forEach.call(doc.querySelectorAll('[data-grade]'), function (el) {
          el.classList.toggle('grade-hidden', g !== 'all' && el.dataset.grade !== g);
        });
        /* 取消筛选时，把此前未触发的渐入元素直接显示，避免留白 */
        if (g === 'all') {
          [].forEach.call(doc.querySelectorAll('.reveal:not(.in)'), function (b) {
            if (b.getBoundingClientRect().top < window.innerHeight * 1.2) b.classList.add('in');
          });
        }
        fxHint(g);
      });
    });
    fxHint('all');
  }
}

function fxHint(g){
  var hint = document.getElementById('gfhint');
  if (!hint) return;
  var doc = document.getElementById('doc');
  var all = doc.querySelectorAll('li[data-grade]').length;
  var shown = g === 'all' ? all : doc.querySelectorAll('li[data-grade="' + g + '"]').length;
  hint.innerHTML = '显示 <b>' + shown + '</b> / ' + all + ' 条';
}
