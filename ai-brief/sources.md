# 信源清单（sources.md）

- 维护规则：每周日健康检查一次；连续失败 2 天的信源标记 ⚠️ 并在 3 天内替换。

## T1 · 每日必抓（RSS 优先）

| # | 信源 | 地址 | 内容 | RSS |
|---|---|---|---|---|
| 1 | The Robot Report | therobotreport.com | 机器人行业新闻、融资、新品、量产 | 有 |
| 2 | IEEE Spectrum Robotics | spectrum.ieee.org/topic/robotics | 技术向深度报道、人形机器人专栏 | 有（topic feed） |
| 3 | arXiv cs.RO | export.arxiv.org/rss/cs.RO | 具身智能/机器人论文 | 有 |
| 4 | TechCrunch | techcrunch.com | 融资首发、AI 硬件新品 | 有 |
| 5 | TechNode | technode.com | 中国科技公司英文报道，机器人+出海硬件交叉内容多 | 有 |
| 6 | The Verge | theverge.com | 消费硬件、AI 设备 | 有 |
| 7 | 机器之心 | jiqizhixin.com | 中文，具身智能板块、论文解读（B 级媒体源） | 有/公众号 |
| 8 | 量子位 | qbitai.com | 中文 AI 行业动态（B 级媒体源） | 公众号 |

## T2 · 公司 Newsroom（页面抓取，每日/隔日）

优先级 = 两个方向的行业头部公司。

### 出海智能硬件
| 公司 | 地址 | 关注点 |
|---|---|---|
| Anker 安克 | anker.com + Newsroom | AI 功能在其充电/安防/音频产品线的落地 |
| 影石 Insta360 | insta360.com/blogs | 全景/AI 影像新品 |
| 韶音 Shokz | shokz.com | 运动耳机 + AI 交互 |
| 未来智能 | iflytek.com/news（讯飞旗下） | AI 会议耳机、AI 眼镜（2026-05 已发 AI 眼镜） |
| 绿联 / 倍思 | uggreen.com / baseus.com | 出海配件巨头的小型 AI 化 |

### 机器人 / 具身智能
| 公司 | 地址 | 关注点 |
|---|---|---|
| 优必选 UBTech | ubtrobot.com | 人形机器人量产与教育/工业落地 |
| 普渡 Pudu | pudurobotics.com | 商用配送机器人出海（海外营收占比高） |
| 越疆 Dobot | **dobot.cn/news/blog**（国内官网新闻中心） | 协作机械臂 + 人形（人形量产交付、家庭智能体机器人） |
| 众擎 EngineAI | engineai.com.cn | 人形机器人 |
| 星尘智能 Astribot | astribot.com | 具身智能操作 |
| 宇树 Unitree | unitree.com | 四足/人形、消费级机器人 |
| 智元 Agibot | agibot.com | 人形机器人量产 |
| Figure AI | figure.ai/news | 海外人形标杆，Helix 模型进展 |
| 1X Technologies | 1x.tech | 家用人形 Neo |
| Boston Dynamics | bostondynamics.com/blog | Atlas 电动化、商用化节点 |
| Tesla Optimus | **electrek.co/guides/tesla-optimus/**（Electrek 专题聚合页） | 量产时间表（官网 tesla.com/AI 反爬严重，改用持续跟进的第三方垂直媒体） |
| XPeng Robotics | heyxpeng.com/news | 车企跨界人形（2026-09 产线投产） |

## T3 · 每周复盘

| 信源 | 地址 | 用途 |
|---|---|---|
| EqualOcean | equalocean.com | 中国公司出海的英文深度分析 |
| Counterpoint / Canalys / IDC | 各官网 research 栏目 | 出货量数据（如智能眼镜季度报告） |
| Product Hunt | producthunt.com | 新 AI 硬件首发与早期反馈 |
| Kickstarter Hardware | kickstarter.com/discover/categories/hardware | 真实付费需求信号 |
| Hugging Face Daily Papers | huggingface.co/papers | VLA / embodied 论文热度榜 |

## 信源可信度分级

不用语言设限，也不挡二手——**三级都收，按级别标注**。

| 级别 | 定义 | 举例 | 标注要求 | 可否进头条 |
|---|---|---|---|---|
| **A 官方** | 当事方自行发布 / 公开存档记录 | 公司 Newsroom、官方微博与公众号、交易所与招投标公告、工商与专利、arXiv / GitHub、发布会回放 | 附原文链接 | ✅ |
| **B 媒体** | 有署名、有明确信源的专业媒体报道 | The Robot Report、TechCrunch、IEEE Spectrum、TechNode、EqualOcean、36氪、量子位、澎湃、OFweek、机器之心、AAStocks | 写明**媒体名 + 发布时间** | ✅ |
| **C 未证实** | 产业链消息、供应链传闻、未获回应的消息 | 「产业链称」「据知情人士」类 | 写「**未经官方证实 / 未获当事方回应**」 | ❌ 只进快讯或前日回溯 |

执行要点：同一事件取其最高级别出处；**不得把 C 级写成事实陈述**——这是唯一不可越过的底线；每条缺标注即视为不合格。


## 使用说明（给抓取层）

1. T1 按 RSS 逐条拉取，时间窗口 = 近 24 小时；
2. T2 无 RSS，抓 Newsroom 页面首屏条目，比对昨日快照（URL 集合）判断新增；
3. 信源命中后按 PRD §5 标准入筛选层；
4. 本文件与 PRD 版本号绑定，改源必须同步修改 PRD。
