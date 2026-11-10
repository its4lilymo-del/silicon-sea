# -*- coding: utf-8 -*-
import json, urllib.request

KEY = "0d267697-6654-4a4a-ab1f-92bb39b13933"
URL = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=" + KEY

text = """硅与海 | 2026-11-11（第 39 期）

头条
1. 蚂蚁灵波开源触觉基础模型
11-10 开源 LingBot-Touch，基于近 5000 小时真实触觉数据预训练，统一磁触觉/视触觉/压阻三类信号；26 项真机测试中四类动作模型成功率提升 14 至 26 个百分点。
https://www.qbitai.com/2026/11/508996.html

2. 妙动 Beni 全球现货开售
11-10 起现货发售，标准套装 4999 元、探索套装 5799 元；7 月 Kickstarter 获 7926 名支持者、筹资超 500 万美元。
https://www.nfnews.com/content/834pw7dx3d.html

快讯
- 禾赛 Q3 机器人动力模组出货 23405 套，环比增 97%，累计 35295 套（港交所公告 11-10）
https://www1.hkexnews.hk/listedco/listconews/sehk/2026/1110/2026111001054_c.pdf
- 物原科技一个月融资过亿美元，物理基座模型路线（量子位 11-10）
https://www.qbitai.com/2026/11/508991.html
- 猿声科技再融超亿元，速腾、拓普等产业方入局（猎云网 11-10）
https://news.qq.com/rain/a/20261110A0AW8H00
- 星尘智能 AOS 黑客松上机率 94%，16 款应用完成真机迁移（36氪 11-10）
https://36kr.com/p/4063520236196736
- Intel 与 Altera 联手开发物理 AI 传感器桥参考系统（The Robot Report 11-10）
https://www.therobotreport.com/intel-altera-expand-collaboration-simplify-sensor-integration-physical-ai/
- Vbot 发布 DEV 极客开发版，售价 22988 元、限时 20988 元（官方 11-10）
https://forum.vbot.cn/

本期入选 8 条 / 待审 4 条
完整版见 https://silicon-sea.pages.dev/ 往期日报页"""


def post(payload):
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(URL, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode("utf-8")


print("text bytes:", len(text.encode("utf-8")))
print(post({"msgtype": "text", "text": {"content": text}}))

desc = "头条：蚂蚁灵波开源 LingBot-Touch 触觉基础模型，触觉从绑定单一传感器变成可跨硬件复用的表征。本期入选 8 条 / 待审 4 条。"
print("desc bytes:", len(desc.encode("utf-8")))
print(post({"msgtype": "news", "news": {"articles": [{
    "title": "硅与海 | 2026-11-11（第 39 期）",
    "description": desc,
    "url": "https://silicon-sea.pages.dev/",
    "picurl": "https://silicon-sea.pages.dev/hero-poster.jpg"
}]}}))
