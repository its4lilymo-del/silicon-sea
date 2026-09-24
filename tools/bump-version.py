# -*- coding: utf-8 -*-
"""
硅与海 · 站点版本戳递增工具
每次部署前运行，保证浏览器拿到全新 URL（根治缓存混杂）。

用法：
  python tools/bump-version.py

作用：
  1. 生成新版本号 vYYYYMMDDHHMM
  2. 把 ai-brief 下所有 .html 中的旧版本号替换为新版本号
  3. 写入 ai-brief/version.txt（页面自愈脚本会比对它）
"""
import io, os, re, sys, datetime

BASE = r'C:\Users\莫莉莉\WorkBuddy\2026-09-19-23-10-37'
D = os.path.join(BASE, 'ai-brief')
VTXT = os.path.join(D, 'version.txt')

old = ''
if os.path.exists(VTXT):
    old = io.open(VTXT, encoding='utf-8').read().strip().split('\n')[0].strip()
if not old:
    m = re.search(r'v\d{8}[a-z]?', io.open(os.path.join(D, 'index.html'), encoding='utf-8').read())
    old = m.group(0) if m else ''

new = 'v' + datetime.datetime.now().strftime('%Y%m%d%H%M')
if new == old:
    new = 'v' + (datetime.datetime.now() + datetime.timedelta(minutes=1)).strftime('%Y%m%d%H%M')

changed = []
if old:
    for f in sorted(os.listdir(D)):
        if not f.endswith('.html'):
            continue
        p = os.path.join(D, f)
        s = io.open(p, encoding='utf-8').read()
        if old in s:
            s = s.replace(old, new)
            io.open(p, 'w', encoding='utf-8').write(s)
            changed.append(f)

io.open(VTXT, 'w', encoding='utf-8').write(new + '\n')
print('VER: %s -> %s' % (old or '(none)', new))
print('patched: %s' % (', '.join(changed) if changed else '(none)'))
