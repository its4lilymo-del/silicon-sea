# -*- coding: utf-8 -*-
"""
硅与海 · 一键同步到 Cloudflare Pages

用法：
  python tools/deploy-cloudflare.py            # 递增版本戳 + 部署
  python tools/deploy-cloudflare.py --no-bump  # 只部署，不改版本号

做的事：
  1. 递增站点版本戳（vYYYYMMDDHHMM）并重写 ai-brief/version.txt
  2. 用 wrangler 把 ai-brief/ 部署到 Cloudflare Pages 项目 silicon-sea
  3. 打印部署结果（成功给 URL，失败给原始错误）

凭据：读取同目录下 cloudflare-credentials.json（本机私有，不部署、不入库）
"""
import io, os, sys, json, subprocess, datetime, re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(BASE, 'ai-brief')
TOOLS = os.path.join(BASE, 'tools')
CRED = os.path.join(TOOLS, 'cloudflare-credentials.json')
PROJECT = 'silicon-sea'

NODE = r'C:\Program Files\nodejs\node.exe'
WRANGLER = r'C:\Users\莫莉莉\.workbuddy\binaries\node\workspace\node_modules\wrangler\bin\wrangler.js'


def bump_version():
    vtxt = os.path.join(SITE, 'version.txt')
    old = ''
    if os.path.exists(vtxt):
        old = io.open(vtxt, encoding='utf-8').read().strip().split('\n')[0].strip()
    if not old:
        m = re.search(r'v\d{8,12}', io.open(os.path.join(SITE, 'index.html'), encoding='utf-8').read())
        old = m.group(0) if m else ''
    new = 'v' + datetime.datetime.now().strftime('%Y%m%d%H%M')
    if new == old:
        new = 'v' + (datetime.datetime.now() + datetime.timedelta(minutes=1)).strftime('%Y%m%d%H%M')
    changed = []
    if old:
        for f in sorted(os.listdir(SITE)):
            if f.endswith('.html'):
                p = os.path.join(SITE, f)
                s = io.open(p, encoding='utf-8').read()
                if old in s:
                    io.open(p, 'w', encoding='utf-8').write(s.replace(old, new))
                    changed.append(f)
    io.open(vtxt, 'w', encoding='utf-8').write(new + '\n')
    print('[1/2] VER %s -> %s  (patched: %s)' % (old or '(none)', new, ', '.join(changed) or 'none'))


def load_creds():
    if not os.path.exists(CRED):
        raise SystemExit('缺少凭据文件：%s' % CRED)
    return json.load(io.open(CRED, encoding='utf-8'))


def deploy():
    c = load_creds()
    env = dict(os.environ)
    env['CLOUDFLARE_API_TOKEN'] = c['api_token']
    env['CLOUDFLARE_ACCOUNT_ID'] = c['account_id']
    env['NO_COLOR'] = '1'
    env['WRANGLER_SEND_METRICS'] = 'false'
    cmd = [NODE, WRANGLER, 'pages', 'deploy', SITE,
           '--project-name=' + PROJECT, '--branch=main', '--commit-dirty=true']
    print('[2/2] deploying %s -> %s' % (SITE, PROJECT))
    r = subprocess.run(cmd, env=env, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=600)
    out = (r.stdout or '') + (r.stderr or '')
    print(out.strip())
    if r.returncode != 0 or 'Successfully' not in out and 'Deployment complete' not in out:
        raise SystemExit('DEPLOY FAILED (exit %s)' % r.returncode)
    print('DEPLOY OK -> https://%s.pages.dev/' % PROJECT)


if __name__ == '__main__':
    if '--no-bump' not in sys.argv:
        bump_version()
    deploy()
