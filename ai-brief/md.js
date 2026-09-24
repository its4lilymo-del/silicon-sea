/* 具身出海日报 · 极简 Markdown 渲染器（无依赖）
   三个内页共用。支持：标题/表格/列表/引用/代码块/链接/行内样式 */

function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

function inline(s){
  s=esc(s);
  s=s.replace(/`([^`]+)`/g,'<code>$1</code>');
  s=s.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  s=s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g,'$1<em>$2</em>');
  s=s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
  s=s.replace(/(^|[\s(（:：,，;；!！?？、])(https?:\/\/[^\s<)）]+)/g,'$1<a href="$2" target="_blank" rel="noopener">$2</a>');
  return s;
}

function md(src){
  var lines=src.replace(/\r\n/g,'\n').split('\n'),out=[],i=0;
  function flushPara(buf){
    var join=[],inPre=false;
    for(var k=0;k<buf.length;k++){
      if(/^```/.test(buf[k])){inPre=!inPre;continue}
      join.push(inPre?esc(buf[k]):inline(buf[k]));
    }
    if(join.length)out.push('<p>'+join.join(inPre?'\n':'<br>')+'</p>');
  }
  while(i<lines.length){
    var L=lines[i];
    if(/^```/.test(L)){
      var code=[];i++;
      while(i<lines.length && !/^```/.test(lines[i])){code.push(esc(lines[i]));i++}
      i++;out.push('<pre><code>'+code.join('\n')+'</code></pre>');continue;
    }
    if(/^\s*$/.test(L)){i++;continue}
    var h=L.match(/^(#{1,6})\s+(.*)$/);
    if(h){var lv=Math.min(h[1].length,4);out.push('<h'+lv+'>'+inline(h[2])+'</h'+lv+'>');i++;continue}
    if(/^\s*([-*_])\s*\1\s*\1[\s\1]*$/.test(L)){out.push('<hr>');i++;continue}
    if(/^>\s?/.test(L)){
      var q=[];
      while(i<lines.length && /^>\s?/.test(lines[i])){q.push(lines[i].replace(/^>\s?/,''));i++}
      out.push('<blockquote><p>'+q.map(inline).join('<br>')+'</p></blockquote>');continue;
    }
    if(/^\s*\|.*\|\s*$/.test(L)){
      var rows=[];
      while(i<lines.length && /^\s*\|.*\|\s*$/.test(lines[i])){
        rows.push(lines[i].trim().replace(/^\||\|$/g,'').split('|').map(function(c){return c.trim()}));i++;
      }
      var header=rows[0],body=rows.slice(1);
      if(rows.length>1 && rows[1].every(function(c){return /^:?-{2,}:?$/.test(c)}))body=rows.slice(2);
      var cols=Math.max.apply(null,rows.map(function(r){return r.length}));
      var html='<div class="tbl"><table><thead><tr>';
      for(var ci=0;ci<cols;ci++)html+='<th>'+(header[ci]!==undefined?inline(header[ci]):'&nbsp;')+'</th>';
      html+='</tr></thead><tbody>';
      body.forEach(function(r){
        html+='<tr>';
        for(var di=0;di<cols;di++)html+='<td>'+(r[di]!==undefined?inline(r[di]):'&nbsp;')+'</td>';
        html+='</tr>';
      });
      html+='</tbody></table></div>';out.push(html);continue;
    }
    if(/^\s*([-*+]|\d+\.)\s+/.test(L)){
      var items=[];
      while(i<lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])){
        items.push(lines[i].replace(/^\s*([-*+]|\d+\.)\s+/,''));i++;
      }
      out.push('<ul>'+items.map(function(t){return '<li>'+inline(t)+'</li>'}).join('')+'</ul>');continue;
    }
    var buf=[];
    while(i<lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,6}\s|>|\s*\|.*\|\s*$|\s*([-*+]|\d+\.)\s|```)/.test(lines[i])){buf.push(lines[i]);i++}
    flushPara(buf);
  }
  return out.join('\n');
}

/* 把渲染结果里的相对链接改写为站内 hash 链接 */
function rewriteLinks(root,basePath){
  root.querySelectorAll('a').forEach(function(a){
    var hr=a.getAttribute('href')||'';
    if(/^https?:/.test(hr)){a.setAttribute('target','_blank');a.setAttribute('rel','noopener');return}
    var base=basePath.split('/').slice(0,-1).join('/');
    var parts=(base+'/'+hr).split('/'),stack=[];
    parts.forEach(function(p){if(p==='..')stack.pop();else if(p!=='.')stack.push(p)});
    a.setAttribute('href','#/'+encodeURIComponent(stack[stack.length-1]));
  });
}
