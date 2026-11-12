import json, urllib.request

KEY = "0d267697-6654-4a4a-ab1f-92bb39b13933"
URL = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=" + KEY

head_lines = [
    "硅与海 | 2026-11-13（第 41 期）",
    "",
    "【头条】",
    "1. Agile Robots 5 亿美元 F 轮，估值 85 亿美元",
    "慕尼黑 Agile Robots 11-12 宣布完成 5 亿美元 F 轮，投后估值 85 亿美元，软银领投，英伟达、日立、T.Capital 参投；累计融资 20 亿美元。点评：软银和英伟达同时押欧洲人形，押的是已装机的 2 万套工业系统，不是 demo。",
    "https://www.agile-robots.com/en/news/detail/physical-ai-leader-agile-robots-raises-500-million-series-f-funding/",
    "",
    "2. 沐曦优必选合资公司拿 5 亿天使轮",
    "曦选创智 11-12 披露完成 5 亿元天使轮，纪源、经纬联合领投，投后估值 40 亿元；首颗机器人主控 SoC 对标英伟达 Thor，2027 年开验证平台、2028 年量产。点评：本体厂开始自己造算力底座，是国产人形降本最难的一跳。",
    "https://www.163.com/dy/article/LBI9BILL0550B1DU.html",
    "",
    "【快讯】",
    "- Runway 开放世界动作模型 Praxis-1 权重，27B MoE，RoboLab-120 成功率 46.2%，Apache 2.0 可商用。",
    "https://www.therobotreport.com/runways-praxis-1-world-action-model-for-robotics-is-now-available/",
    "- 港科广联合欧拉万象提出 SLA，登顶 RoboDojo 真机榜，成功率 33.9%，约为 π0.5 的 2.6 倍。",
    "https://arxiv.org/abs/2611.08373",
    "- 港中深联合 A*STAR 提出 LOGIV，用任务图管长程执行，真机成功率 40.0% 升至 56.7%。",
    "https://arxiv.org/abs/2610.40016",
    "- 优必选迭代工业视觉大模型 V-Lab 2.0，称可识别 1200 以上品类。",
    "https://caifuhao.eastmoney.com/news/20261112202052955453350",
    "- 华为云定档 11-16 发布昇腾原生具身世界模型 CloudRobo-WM1.2。",
    "https://www.163.com/dy/article/LBJ6TB480511CMF5.html",
    "",
    "本期入选 7 条 / 待审 6 条（回溯区另有 2 条：北京具身智能三年行动方案、禾赛 Q3 机器人收入过半）",
    "完整版见 https://silicon-sea.pages.dev/ 往期日报页",
]

full = "\n".join(head_lines)
if len(full.encode("utf-8")) > 2048:
    short = head_lines[:10] + head_lines[10:13] + [
        "",
        "本期入选 7 条 / 待审 6 条",
        "完整版见 https://silicon-sea.pages.dev/ 往期日报页",
    ]
    full = "\n".join(short)
print("text bytes:", len(full.encode("utf-8")))

req = urllib.request.Request(
    URL,
    data=json.dumps({"msgtype": "text", "text": {"content": full}}, ensure_ascii=False).encode("utf-8"),
    headers={"Content-Type": "application/json"},
)
print("text resp:", urllib.request.urlopen(req, timeout=20).read().decode())

news = {
    "msgtype": "news",
    "news": {
        "articles": [
            {
                "title": "硅与海 | 2026-11-13（第 41 期）",
                "description": "头条：Agile Robots 完成 5 亿美元 F 轮、投后估值 85 亿美元，软银领投、英伟达参投。本期入选 7 条（头条 2＋快讯 5），另有 2 条前日回溯。",
                "url": "https://silicon-sea.pages.dev/",
                "picurl": "https://silicon-sea.pages.dev/hero-poster.jpg",
            }
        ]
    },
}
print("title bytes:", len(news["news"]["articles"][0]["title"].encode("utf-8")))
print("desc bytes:", len(news["news"]["articles"][0]["description"].encode("utf-8")))
req2 = urllib.request.Request(
    URL,
    data=json.dumps(news, ensure_ascii=False).encode("utf-8"),
    headers={"Content-Type": "application/json"},
)
print("news resp:", urllib.request.urlopen(req2, timeout=20).read().decode())
