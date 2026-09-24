# -*- coding: utf-8 -*-
"""
硅与海 · 同步到 GitHub（每日自动化第十步调用）

用法：
  python tools/sync-github.py

做的事：
  1. git add -A，然后校验暂存区不含禁止路径（私有文档 / 凭据 / 会话记忆）
  2. 有变更则提交（信息自动区分「日报同步」与「站点同步」）
  3. 推送到 github.com/its4lilymo-del/silicon-sea（main 分支）
  4. 输出最后一行必为 GITHUB SYNC OK 或 GITHUB SYNC FAILED: <原因>

设计约束：
  - 永远以 0 退出：同步失败绝不能阻塞日报主流程，靠输出标记让上层汇报
  - GIT_TERMINAL_PROMPT=0 + 空 credential.helper 前置：
    防止 Git Credential Manager 在无界面环境弹 GUI 窗口把流程挂死（2026-09-24 实测坑）
  - 代理与提交身份都读仓库本地 git config（http.proxy / user.name / user.email）
"""
import os
import re
import subprocess
import sys
import datetime
import json

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = 'github.com/its4lilymo-del/silicon-sea'

# 暂存区出现这些路径片段就中止推送（双保险，正常情况下 .gitignore 已挡住）
FORBIDDEN = ('private-docs', '.workbuddy', 'cloudflare-credentials',
             '.wrangler', '.frames', '.tmp_')

# 视为「日报日常产出」的路径模式（用于自动写提交信息）
DAILY_PAT = re.compile(r'^ai-brief/(digests/|digests\.json|version\.txt|.*\.html$|.*\.js$|.*\.css$)')


def run(args, timeout=90):
    env = dict(os.environ)
    env['GIT_TERMINAL_PROMPT'] = '0'
    env['GCM_INTERACTIVE'] = 'never'
    env['NO_COLOR'] = '1'
    return subprocess.run(args, cwd=BASE, env=env, capture_output=True, text=True,
                          encoding='utf-8', errors='replace', timeout=timeout)


def commit_message(files):
    date = datetime.date.today().isoformat()
    issue = ''
    try:
        dj = json.load(open(os.path.join(BASE, 'ai-brief', 'digests.json'), encoding='utf-8'))
        items = dj.get('digests') or []
        if items and isinstance(items[0], dict):
            date = items[0].get('date') or date
            if items[0].get('issue'):
                issue = '（第 %s 期）' % items[0]['issue']
    except Exception:
        pass
    if files and all(DAILY_PAT.match(f) for f in files):
        return 'chore: 日报同步 %s%s' % (date, issue)
    return 'chore: 站点同步 %s（%d 个文件）' % (date, len(files))


def fail(reason):
    print('GITHUB SYNC FAILED: %s' % reason)


def main():
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

    r = run(['git', 'rev-parse', '--is-inside-work-tree'])
    if r.returncode != 0:
        return fail('项目目录不是 git 仓库')

    r = run(['git', 'status', '--porcelain'])
    if r.returncode != 0:
        return fail('git status 异常：' + (r.stderr or '').strip()[:200])
    if not r.stdout.strip():
        print('GITHUB SYNC OK: 无变更，跳过')
        return

    r = run(['git', 'add', '-A'])
    if r.returncode != 0:
        return fail('git add 失败：' + (r.stderr or '').strip()[:200])

    r = run(['git', 'diff', '--cached', '--name-only'])
    files = [l.strip() for l in (r.stdout or '').splitlines() if l.strip()]
    if not files:
        print('GITHUB SYNC OK: 无变更，跳过')
        return
    bad = [f for f in files if any(k in f for k in FORBIDDEN)]
    if bad:
        return fail('暂存区出现禁止路径，已中止推送: ' + ', '.join(bad[:5]))

    r = run(['git', 'commit', '-m', commit_message(files)])
    out = ((r.stdout or '') + (r.stderr or '')).strip()
    if r.returncode != 0:
        if 'nothing to commit' in out:
            print('GITHUB SYNC OK: 无变更，跳过')
            return
        return fail('git commit 失败：' + out[:200])

    # 推送：显式用 gh 的凭据 helper，清掉 GCM；代理走仓库本地 git config
    r = run(['git', '-c', 'credential.helper=',
             '-c', 'credential.helper=!gh auth git-credential',
             'push', 'origin', 'main'], timeout=180)
    out = ((r.stdout or '') + (r.stderr or '')).strip()
    if r.returncode != 0 or ('main -> main' not in out and 'up to date' not in out.lower()):
        return fail('git push 失败：' + out[-280:])

    print('GITHUB SYNC OK: %d 个文件变更已推送 -> %s' % (len(files), REPO))


if __name__ == '__main__':
    main()
