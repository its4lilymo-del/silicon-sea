import json, os

out = os.path.dirname(os.path.abspath(__file__))

head = """硅与海 | 2026-10-08（第 19 期）

【头条】
1. 机器人数据公司 Mecka 完成 6000 万美元 B 轮
红杉领投，英伟达、微软 M12、高通创投、三星参投；公司付费采集人类动作数据训练机器人，6 月年化收入超 1 亿美元。
https://www.mecka.ai/news/series-b

2. 优必选与一汽-大众合作，人形机器人进汽车物流
双方将联合开发与测试具身智能机器人的物流场景应用并建示范场景。
https://www.ithome.com/1/010/376.htm

【快讯】
"""

flash = [
    "1. 乐动机器人收购德国园林器械商 SABO：不超过 600 万欧元拿下全股权与欧洲 1400 余家零售商网络。https://www1.hkexnews.hk/listedco/listconews/sehk/2026/1007/2026100702048_c.pdf",
    "2. 白犀牛完成 C2 轮，C 轮累计 1 亿美元，隐山资本领投、韩国友利金融集团跟投。https://auto.ifeng.com/c/8x3GcPfgnqp",
    "3. 施耐德电气约 226 亿美元收购 PTC，打通设计到运营数字主线。https://www.therobotreport.com/ptc-acquisition-positions-schneider-electric-challenge-siemens/",
    "4. 灵生科技完成亿元级 A 轮，做跨本体通用底座 RUDA。https://www.163.com/dy/article/L8NHHM1J05569K8R.html",
    "5. 英伟达据报拟再向 Figure 投资 10 亿美元（未经官方证实）。https://www.163.com/dy/article/L8N5OCOT0512B07B.html",
    "6. 江西首个本土人形品牌「庐优」成立，优必选参股。https://www.toutiao.com/article/7694101962693870121/",
    "7. 韩国 Yujin Robot 牵头物流人形国家项目，机器人 2028 年进乐天仓库。https://embodiedwire.com/lotte-yujin-logistics-humanoid.html",
]

tail = """

本期入选 9 条 / 待审 1 条
完整版见 https://silicon-sea.pages.dev/ 往期日报页"""

def build(n_flash):
    return head + "\n".join(flash[:n_flash]) + tail

content = build(len(flash))
for n in range(len(flash), -1, -1):
    content = build(n)
    if len(content.encode("utf-8")) <= 2048:
        break

print("flash kept:", n, "bytes:", len(content.encode("utf-8")))

with open(os.path.join(out, "wx-text-payload.json"), "w", encoding="utf-8") as f:
    json.dump({"msgtype": "text", "text": {"content": content}}, f, ensure_ascii=False)

news = {"msgtype": "news", "news": {"articles": [{
    "title": "硅与海 | 2026-10-08（第 19 期）",
    "description": "头条：机器人数据公司 Mecka 完成 6000 万美元 B 轮——机器人最缺的不是模型而是真实动作数据，数据采集层正独立成赛道；本期入选 9 条 / 待审 1 条",
    "url": "https://silicon-sea.pages.dev/",
    "picurl": "https://silicon-sea.pages.dev/hero-poster.jpg",
}]}}
with open(os.path.join(out, "wx-news-payload.json"), "w", encoding="utf-8") as f:
    json.dump(news, f, ensure_ascii=False)

print("title bytes:", len(news["news"]["articles"][0]["title"].encode("utf-8")),
      "desc bytes:", len(news["news"]["articles"][0]["description"].encode("utf-8")))
