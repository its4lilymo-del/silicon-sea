/* 硅与海 · 内页「回到顶部」按钮（today / archive / about / index-docs 共用）
   自包含：样式由本脚本注入，页面只需加一个 <script> 引用。
   位置：挂在正文大框（doc-frame / about-frame / #main）的右下角外侧——
         水平在大框右缘外 24px 的空白处，而非整个视口的右下角；
         窄屏大框近似全宽时自动退回贴边。滚动超过 320px 淡入，点击平滑回顶；
         系统「减少动态效果」时不做平滑滚动、不做过渡。 */
(function(){
  /* 注入按钮样式（颜色与内页设计系统一致：白底 / 淡紫描边 / 紫色悬停） */
  var css = ''
    + '.totop{position:fixed;bottom:26px;width:44px;height:44px;border-radius:50%;'
    + 'border:1px solid #ebe7f6;background:#fff;color:#4a4658;display:flex;align-items:center;'
    + 'justify-content:center;cursor:pointer;opacity:0;visibility:hidden;transform:translateY(10px);'
    + 'box-shadow:0 6px 18px rgba(97,78,160,.14);z-index:60;'
    + 'transition:opacity .25s ease,transform .25s ease,visibility .25s,color .18s,box-shadow .18s}'
    + '.totop.show{opacity:1;visibility:visible;transform:translateY(0)}'
    + '.totop:hover{color:#5b46a8;box-shadow:0 10px 26px rgba(97,78,160,.22)}'
    + '@media(hover:hover) and (pointer:fine){.totop.show:hover{transform:translateY(-3px)}}'
    + '.totop svg{width:19px;height:19px;display:block}'
    + '@media(prefers-reduced-motion:reduce){.totop{transition:none}}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  /* 生成按钮（向上箭头） */
  var b = document.createElement('button');
  b.className = 'totop';
  b.type = 'button';
  b.setAttribute('aria-label', '回到顶部');
  b.title = '回到顶部';
  b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" '
    + 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(b);

  /* 水平定位：按钮挂在正文大框右缘外侧 24px 的空白处 */
  var frame = document.querySelector('.doc-frame, .about-frame, #main');
  var GAP = 24, MIN = 12;
  function pos(){
    if(!frame){ b.style.right = MIN + 'px'; return; }
    var r = frame.getBoundingClientRect();
    /* 大框近似全宽（窄屏）或右侧空白不足时贴边兜底 */
    if(r.width > window.innerWidth - 60){ b.style.right = MIN + 'px'; return; }
    var right = window.innerWidth - r.right - GAP;
    if(right < MIN) right = MIN;
    b.style.right = right + 'px';
  }

  /* 滚动超 320px 显示 */
  var SHOW_AT = 320;
  function vis(){
    var y = window.scrollY || window.pageYOffset || 0;
    b.classList.toggle('show', y > SHOW_AT);
  }
  window.addEventListener('scroll', vis, { passive: true });
  window.addEventListener('resize', function(){ pos(); vis(); });
  pos();
  vis();

  b.addEventListener('click', function(){
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
})();
