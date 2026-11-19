import json, urllib.request, sys

KEY = "0d267697-6654-4a4a-ab1f-92bb39b13933"
URL = f"https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key={KEY}"

head1 = ("1、镁伽科技完成近 2 亿美元新轮融资：阿曼投资局参与，亚投资本、Granite Asia、创新工场加注，"
         "累计融资约 6 亿美元，覆盖科学智能与工业智能。点评：主权基金进场，物理 AI 的资本来源正从硅谷 VC 转向海湾长钱。\n"
         "https://www.cs.com.cn/tzjj/01/2026/11/19/detail_2026111910053252.html")
head2 = ("2、黑芝麻智能在深圳设具身智能总部：采前海+香港双总部，称已与美的、遨博、中远海运、均胜电子合作，"
         "并锁定多家头部机器人厂商量产订单，客户与金额未披露。点评：车规芯片厂把机器人当第二曲线，算力底座多了量产级玩家。\n"
         "https://www.cnstock.com/commonDetail/830805")

news = [
    ("1、博理科技连完 B2、B+ 两轮合计超 5 亿元，资金投向材料、产能与具身应用，RoboFab 供机器人仿生柔体件。\n"
     "https://finance.sina.com.cn/tech/roll/2026-11-19/doc-inizhezx0324689.shtml"),
    ("2、大晓机器人发布 ACE-CaP-0，240 次真机评测成功率 92.1%，精细任务从数小时压到分钟级。\n"
     "https://www.xuhui.gov.cn/xwzx_zwxx/20261119/577687.html"),
    ("3、柯力传感战略投资知行机器人，打通感知—控制—执行，知行手系列负载 0.1–150 公斤。\n"
     "https://news.qq.com/rain/a/20261119A06XFE00"),
    ("4、Humyn Labs 完成 4700 万美元 A 轮，20 多国采集四模态数据，称年化收入超 5000 万美元。\n"
     "https://www.therobotreport.com/humyn-labs-raises-47m-to-collect-real-world-data-for-robotics/"),
    ("5、三星拟在 CES 2027 首发 HR、HE 两款人形机器人（未经官方证实，三星未回应）。\n"
     "https://www.jwview.com/jingwei/html/11-19/697648.shtml"),
    ("6、福建省首家具身智能创新中心在福州鼓楼揭牌，内设数据采集超级工厂。\n"
     "https://news.fznews.com.cn/fzyw/20261120/4JC6Nc8X64.shtml"),
]

head = "硅与海 | 2026-11-20（第 48 期）\n\n【头条】\n"
tail = "\n\n本期入选 8 条 / 待审 2 条\n完整版见 https://silicon-sea.pages.dev/ 往期日报页"

def build(n):
    parts = [head, head1, "\n", head2, "\n\n【快讯】\n"]
    parts.append("\n".join(news[:n]))
    parts.append(tail)
    return "".join(parts)

content = build(6)
if len(content.encode("utf-8")) > 2048:
    content = build(3)
if len(content.encode("utf-8")) > 2048:
    content = build(0)
print("TEXT BYTES:", len(content.encode("utf-8")))

def post(payload, tag):
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(URL, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            body = r.read().decode("utf-8")
        print(tag, "->", body)
        return body
    except Exception as e:
        print(tag, "-> ERROR:", repr(e))
        return None

post({"msgtype": "text", "text": {"content": content}}, "TEXT")

desc = ("头条：镁伽科技完成近 2 亿美元新轮融资，阿曼投资局参与，累计融资约 6 亿美元；"
        "黑芝麻智能在深圳设具身智能总部并锁定多家头部厂商量产订单。"
        "本期入选 8 条 / 待审 2 条，含博理科技 5 亿元融资、大晓 ACE-CaP-0、Humyn Labs 4700 万美元 A 轮。")
print("DESC BYTES:", len(desc.encode("utf-8")))
post({"msgtype": "news", "news": {"articles": [{
    "title": "硅与海 | 2026-11-20（第 48 期）",
    "description": desc,
    "url": "https://silicon-sea.pages.dev/",
    "picurl": "https://silicon-sea.pages.dev/hero-poster.jpg",
}]}}, "NEWS")
