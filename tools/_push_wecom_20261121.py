import json, urllib.request

URL = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=0d267697-6654-4a4a-ab1f-92bb39b13933"

text = """硅与海 | 2026-11-21（第 49 期）

【头条】
1. 雀巢联手微软、波士顿动力建自主产线
雀巢11-20在瑞士奥尔布揭幕深度技术中心，与微软、波士顿动力签署合作协议联合开发AI与工程方案，与谷歌谈判进入收尾；CTO称目标是工厂产线自主运行。
点评：食品巨头首次把机器人加AI拉到集团级采购，需求侧信号比demo硬。
https://finance.sina.com.cn/stock/usstock/c/2026-11-21/doc-inizmmns6989990.shtml

2. 智动未来完成亿元级 Pre-A+ 轮
中美绿色基金领投、南曦创投联合领投，老股东海珠城发加码；资金用于广州新产线提产与四类场景部署。
点评：服务机器人靠商场酒店文旅跑量，钱直接换成产能和点位。
https://www.chinatimes.net.cn/article/157167.html

【快讯】
· 开放原子人形机器人开源社区工委会成立，启元机器人开源QyroSIM世界模型仿真平台
https://m.10jqka.com.cn/20261121/c682068299.shtml
· 优龙发布消费级外骨骼「如影」，第30000台下线，捐赠1000台
https://news.qq.com/rain/a/20261121A02KKB00
· RoboScience发布WorldFlow，原生3D动力学预测世界模型
https://arxiv.org/abs/2610.39278
· 华为云CloudRobo-WM1.2双榜第一，11-30开放权重与后训练代码
https://www.qbitai.com/2026/11/511610.html
· SuperMimic单卡3小时追平128卡7天，已在宇树G1真机迁移
https://finance.eastmoney.com/a/202611213936564521.html

本期入选 7 条 / 待审 2 条
完整版见 https://silicon-sea.pages.dev/ 往期日报页"""

print("text bytes:", len(text.encode("utf-8")))

def send(payload):
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(URL, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8")

print("TEXT ->", send({"msgtype": "text", "text": {"content": text}}))

news = {
    "msgtype": "news",
    "news": {"articles": [{
        "title": "硅与海 | 2026-11-21（第 49 期）",
        "description": "头条：雀巢联手微软、波士顿动力建自主产线，食品巨头首次把机器人加AI拉到集团级采购。本期入选7条/待审2条。",
        "url": "https://silicon-sea.pages.dev/",
        "picurl": "https://silicon-sea.pages.dev/hero-poster.jpg"
    }]}
}
print("NEWS ->", send(news))
