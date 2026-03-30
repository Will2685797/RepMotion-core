from .database import Base
from sqlalchemy.sql import func
from sqlalchemy import (
    Column, 
    String,
    Integer, 
    Float, 
    Boolean, 
    TIMESTAMP, 
    Text, 
    ForeignKey, 
    DateTime, 
    Enum,
    JSON,
    text,
    UniqueConstraint,
    Computed,
    Index
)
from sqlalchemy.dialects.mysql import TINYINT
"""
définition des modèles de données pour les tables Source, RSSFeed et RawRSSItem
Modèle de la DB 
"""
"""
ategory AS `NewsItem_macro_category`, `NewsItem`.macro_method AS `NewsItem_macro_method`, `NewsItem`.macro_confidence AS `NewsItem_macro_confidence`, `NewsItem`.macro_debug AS `NewsItem_macro_debug`, `NewsItem`.sentiment AS `NewsItem_sentiment`, `NewsItem`.sentiment_method AS `NewsItem_sentiment_method`, `NewsItem`.sentiment_confidence AS `NewsItem_sentiment_confidence`, `NewsItem`.sentiment_debug AS `NewsItem_sentiment_debug`, `NewsItem`.extracted_subjects AS `NewsItem_extracted_subjects`, `NewsItem`.event_type AS `NewsItem_event_type`, `NewsItem`.stance AS `NewsItem_stance`, `NewsItem`.severity AS `NewsItem_severity`, `NewsItem`.certainty AS `NewsItem_certainty`, `NewsItem`.horizon AS `NewsItem_horizon`, `NewsItem`.created_utc AS `NewsItem_created_utc`
FROM `NewsItem`
WHERE `NewsItem`.id = %(id_1)s
 LIMIT %(param_1)s
2026-02-26 19:22:21,987 INFO sqlalchemy.engine.Engine [cached since 10.89s ago] {'id_1': 'e282132faa38514e634291445e5dd67f19970986050bd5b591f3b99948147ab6', 'param_1': 1}
2026-02-26 19:22:22,019 INFO sqlalchemy.engine.Engine SELECT `NewsItem`.id AS `NewsItem_id`, `NewsItem`.feed_id AS `NewsItem_feed_id`, `NewsItem`.source_domain AS `NewsItem_source_domain`, `NewsItem`.title AS `NewsItem_title`, `NewsItem`.snippet AS `NewsItem_snippet`, `NewsItem`.url AS `NewsItem_url`, `NewsItem`.published_utc AS `NewsItem_published_utc`, `NewsItem`.macro_category AS `NewsItem_macro_category`, `NewsItem`.macro_method AS `NewsItem_macro_method`, `NewsItem`.macro_confidence AS `NewsItem_macro_confidence`, `NewsItem`.macro_debug AS `NewsItem_macro_debug`, `NewsItem`.sentiment AS `NewsItem_sentiment`, `NewsItem`.sentiment_method AS `NewsItem_sentiment_method`, `NewsItem`.sentiment_confidence AS `NewsItem_sentiment_confidence`, `NewsItem`.sentiment_debug AS `NewsItem_sentiment_debug`, `NewsItem`.extracted_subjects AS `NewsItem_extracted_subjects`, `NewsItem`.event_type AS `NewsItem_event_type`, `NewsItem`.stance AS `NewsItem_stance`, `NewsItem`.severity AS `NewsItem_severity`, `NewsItem`.certainty AS `NewsItem_certainty`, `NewsItem`.horizon AS `NewsItem_horizon`, `NewsItem`.created_utc AS `NewsItem_created_utc`
FROM `NewsItem`
WHERE `NewsItem`.id = %(id_1)s
 LIMIT %(param_1)s
2026-02-26 19:22:22,021 INFO sqlalchemy.engine.Engine [cached since 10.93s ago] {'id_1': '0ce9fc352a68fd02e3a29562c43b8e49f895671e99c2b1a32f5c78eee4babb5e', 'param_1': 1}
2026-02-26 19:22:22,043 INFO sqlalchemy.engine.Engine SELECT `NewsItem`.id AS `NewsItem_id`, `NewsItem`.feed_id AS `NewsItem_feed_id`, `NewsItem`.source_domain AS `NewsItem_source_domain`, `NewsItem`.title AS `NewsItem_title`, `NewsItem`.snippet AS `NewsItem_snippet`, `NewsItem`.url AS `NewsItem_url`, `NewsItem`.published_utc AS `NewsItem_published_utc`, `NewsItem`.macro_category AS `NewsItem_macro_category`, `NewsItem`.macro_method AS `NewsItem_macro_method`, `NewsItem`.macro_confidence AS `NewsItem_macro_confidence`, `NewsItem`.macro_debug AS `NewsItem_macro_debug`, `NewsItem`.sentiment AS `NewsItem_sentiment`, `NewsItem`.sentiment_method AS `NewsItem_sentiment_method`, `NewsItem`.sentiment_confidence AS `NewsItem_sentiment_confidence`, `NewsItem`.sentiment_debug AS `NewsItem_sentiment_debug`, `NewsItem`.extracted_subjects AS `NewsItem_extracted_subjects`, `NewsItem`.event_type AS `NewsItem_event_type`, `NewsItem`.stance AS `NewsItem_stance`, `NewsItem`.severity AS `NewsItem_severity`, `NewsItem`.certainty AS `NewsItem_certainty`, `NewsItem`.horizon AS `NewsItem_horizon`, `NewsItem`.created_utc AS `NewsItem_created_utc`
FROM `NewsItem`
WHERE `NewsItem`.id = %(id_1)s
 LIMIT %(param_1)s
2026-02-26 19:22:22,043 INFO sqlalchemy.engine.Engine [cached since 10.95s ago] {'id_1': '05148067b4efa409efe10f21e3e228acc18ca7c33f654ecc9569e20e0dac0e6f', 'param_1': 1}
2026-02-26 19:22:22,056 INFO sqlalchemy.engine.Engine SELECT `NewsItem`.id AS `NewsItem_id`, `NewsItem`.feed_id AS `NewsItem_feed_id`, `NewsItem`.source_domain AS `NewsItem_source_domain`, `NewsItem`.title AS `NewsItem_title`, `NewsItem`.snippet AS `NewsItem_snippet`, `NewsItem`.url AS `NewsItem_url`, `NewsItem`.published_utc AS `NewsItem_published_utc`, `NewsItem`.macro_category AS `NewsItem_macro_category`, `NewsItem`.macro_method AS `NewsItem_macro_method`, `NewsItem`.macro_confidence AS `NewsItem_macro_confidence`, `NewsItem`.macro_debug AS `NewsItem_macro_debug`, `NewsItem`.sentiment AS `NewsItem_sentiment`, `NewsItem`.sentiment_method AS `NewsItem_sentiment_method`, `NewsItem`.sentiment_confidence AS `NewsItem_sentiment_confidence`, `NewsItem`.sentiment_debug AS `NewsItem_sentiment_debug`, `NewsItem`.extracted_subjects AS `NewsItem_extracted_subjects`, `NewsItem`.event_type AS `NewsItem_event_type`, `NewsItem`.stance AS `NewsItem_stance`, `NewsItem`.severity AS `NewsItem_severity`, `NewsItem`.certainty AS `NewsItem_certainty`, `NewsItem`.horizon AS `NewsItem_horizon`, `NewsItem`.created_utc AS `NewsItem_created_utc`
FROM `NewsItem`
WHERE `NewsItem`.id = %(id_1)s
 LIMIT %(param_1)s
2026-02-26 19:22:22,059 INFO sqlalchemy.engine.Engine [cached since 10.96s ago] {'id_1': 'bb6efec844128bac1610bf87ca29f198efada0cb77c266db520e5339a937fb54', 'param_1': 1}
2026-02-26 19:22:22,074 INFO sqlalchemy.engine.Engine SELECT `NewsItem`.id AS `NewsItem_id`, `NewsItem`.feed_id AS `NewsItem_feed_id`, `NewsItem`.source_domain AS `NewsItem_source_domain`, `NewsItem`.title AS `NewsItem_title`, `NewsItem`.snippet AS `NewsItem_snippet`, `NewsItem`.url AS `NewsItem_url`, `NewsItem`.published_utc AS `NewsItem_published_utc`, `NewsItem`.macro_category AS `NewsItem_macro_category`, `NewsItem`.macro_method AS `NewsItem_macro_method`, `NewsItem`.macro_confidence AS `NewsItem_macro_confidence`, `NewsItem`.macro_debug AS `NewsItem_macro_debug`, `NewsItem`.sentiment AS `NewsItem_sentiment`, `NewsItem`.sentiment_method AS `NewsItem_sentiment_method`, `NewsItem`.sentiment_confidence AS `NewsItem_sentiment_confidence`, `NewsItem`.sentiment_debug AS `NewsItem_sentiment_debug`, `NewsItem`.extracted_subjects AS `NewsItem_extracted_subjects`, `NewsItem`.event_type AS `NewsItem_event_type`, `NewsItem`.stance AS `NewsItem_stance`, `NewsItem`.severity AS `NewsItem_severity`, `NewsItem`.certainty AS `NewsItem_certainty`, `NewsItem`.horizon AS `NewsItem_horizon`, `NewsItem`.created_utc AS `NewsItem_created_utc`
FROM `NewsItem`
WHERE `NewsItem`.id = %(id_1)s
 LIMIT %(param_1)s
2026-02-26 19:22:22,075 INFO sqlalchemy.engine.Engine [cached since 10.98s ago] {'id_1': '6e4e60577162ed7fed17a3280ad60c03393a2f17a94cccabc63c7c113e62c4ab', 'param_1': 1}
2026-02-26 19:22:22,089 INFO sqlalchemy.engine.Engine SELECT `NewsItem`.id AS `NewsItem_id`, `NewsItem`.feed_id AS `NewsItem_feed_id`, `NewsItem`.source_domain AS `NewsItem_source_domain`, `NewsItem`.title AS `NewsItem_title`, `NewsItem`.snippet AS `NewsItem_snippet`, `NewsItem`.url AS `NewsItem_url`, `NewsItem`.published_utc AS `NewsItem_published_utc`, `NewsItem`.macro_category AS `NewsItem_macro_category`, `NewsItem`.macro_method AS `NewsItem_macro_method`, `NewsItem`.macro_confidence AS `NewsItem_macro_confidence`, `NewsItem`.macro_debug AS `NewsItem_macro_debug`, `NewsItem`.sentiment AS `NewsItem_sentiment`, `NewsItem`.sentiment_method AS `NewsItem_sentiment_method`, `NewsItem`.sentiment_confidence AS `NewsItem_sentiment_confidence`, `NewsItem`.sentiment_debug AS `NewsItem_sentiment_debug`, `NewsItem`.extracted_subjects AS `NewsItem_extracted_subjects`, `NewsItem`.event_type AS `NewsItem_event_type`, `NewsItem`.stance AS `NewsItem_stance`, `NewsItem`.severity AS `NewsItem_severity`, `NewsItem`.certainty AS `NewsItem_certainty`, `NewsItem`.horizon AS `NewsItem_horizon`, `NewsItem`.created_utc AS `NewsItem_created_utc`
FROM `NewsItem`
WHERE `NewsItem`.id = %(id_1)s
 LIMIT %(param_1)s
2026-02-26 19:22:22,091 INFO sqlalchemy.engine.Engine [cached since 11s ago] {'id_1': '288bb326b42ca3fd61e14dac54c35bc5164cf6e4c75c8fb7914e4e4f0c6cb02d', 'param_1': 1}
2026-02-26 19:22:22,105 INFO sqlalchemy.engine.Engine SELECT `NewsItem`.id AS `NewsItem_id`, `NewsItem`.feed_id AS `NewsItem_feed_id`, `NewsItem`.source_domain AS `NewsItem_source_domain`, `NewsItem`.title AS `NewsItem_title`, `NewsItem`.snippet AS `NewsItem_snippet`, `NewsItem`.url AS `NewsItem_url`, `NewsItem`.published_utc AS `NewsItem_published_utc`, `NewsItem`.macro_category AS `NewsItem_macro_category`, `NewsItem`.macro_method AS `NewsItem_macro_method`, `NewsItem`.macro_confidence AS `NewsItem_macro_confidence`, `NewsItem`.macro_debug AS `NewsItem_macro_debug`, `NewsItem`.sentiment AS `NewsItem_sentiment`, `NewsItem`.sentiment_method AS `NewsItem_sentiment_method`, `NewsItem`.sentiment_confidence AS `NewsItem_sentiment_confidence`, `NewsItem`.sentiment_debug AS `NewsItem_sentiment_debug`, `NewsItem`.extracted_subjects AS `NewsItem_extracted_subjects`, `NewsItem`.event_type AS `NewsItem_event_type`, `NewsItem`.stance AS `NewsItem_stance`, `NewsItem`.severity AS `NewsItem_severity`, `NewsItem`.certainty AS `NewsItem_certainty`, `NewsItem`.horizon AS `NewsItem_horizon`, `NewsItem`.created_utc AS `NewsItem_created_utc`
FROM `NewsItem`
WHERE `NewsItem`.id = %(id_1)s
 LIMIT %(param_1)s
2026-02-26 19:22:22,108 INFO sqlalchemy.engine.Engine [cached since 11.01s ago] {'id_1': 'eee711c5c8a5391297809be8954b26e0630680928afa5488b1d747c06e039e7d', 'param_1': 1}
2026-02-26 19:22:22,124 INFO sqlalchemy.engine.Engine SELECT `NewsItem`.id AS `NewsItem_id`, `NewsItem`.feed_id AS `NewsItem_feed_id`, `NewsItem`.source_domain AS `NewsItem_source_domain`, `NewsItem`.title AS `NewsItem_title`, `NewsItem`.snippet AS `NewsItem_snippet`, `NewsItem`.url AS `NewsItem_url`, `NewsItem`.published_utc AS `NewsItem_published_utc`, `NewsItem`.macro_category AS `NewsItem_macro_category`, `NewsItem`.macro_method AS `NewsItem_macro_method`, `NewsItem`.macro_confidence AS `NewsItem_macro_confidence`, `NewsItem`.macro_debug AS `NewsItem_macro_debug`, `NewsItem`.sentiment AS `NewsItem_sentiment`, `NewsItem`.sentiment_method AS `NewsItem_sentiment_method`, `NewsItem`.sentiment_confidence AS `NewsItem_sentiment_confidence`, `NewsItem`.sentiment_debug AS `NewsItem_sentiment_debug`, `NewsItem`.extracted_subjects AS `NewsItem_extracted_subjects`, `NewsItem`.event_type AS `NewsItem_event_type`, `NewsItem`.stance AS `NewsItem_stance`, `NewsItem`.severity AS `NewsItem_severity`, `NewsItem`.certainty AS `NewsItem_certainty`, `NewsItem`.horizon AS `NewsItem_horizon`, `NewsItem`.created_utc AS `NewsItem_created_utc`
FROM `NewsItem`
WHERE `NewsItem`.id = %(id_1)s
 LIMIT %(param_1)s
2026-02-26 19:22:22,126 INFO sqlalchemy.engine.Engine [cached since 11.03s ago] {'id_1': 'fffb66c7fa5c57eb3df250b368aa0be87658aedc4366b9b55e6572ded07ac367', 'param_1': 1}
2026-02-26 19:22:22,142 INFO sqlalchemy.engine.Engine SELECT `NewsItem`.id AS `NewsItem_id`, `NewsItem`.feed_id AS `NewsItem_feed_id`, `NewsItem`.source_domain AS `NewsItem_source_domain`, `NewsItem`.title AS `NewsItem_title`, `NewsItem`.snippet AS `NewsItem_snippet`, `NewsItem`.url AS `NewsItem_url`, `NewsItem`.published_utc AS `NewsItem_published_utc`, `NewsItem`.macro_category AS `NewsItem_macro_category`, `NewsItem`.macro_method AS `NewsItem_macro_method`, `NewsItem`.macro_confidence AS `NewsItem_macro_confidence`, `NewsItem`.macro_debug AS `NewsItem_macro_debug`, `NewsItem`.sentiment AS `NewsItem_sentiment`, `NewsItem`.sentiment_method AS `NewsItem_sentiment_method`, `NewsItem`.sentiment_confidence AS `NewsItem_sentiment_confidence`, `NewsItem`.sentiment_debug AS `NewsItem_sentiment_debug`, `NewsItem`.extracted_subjects AS `NewsItem_extracted_subjects`, `NewsItem`.event_type AS `NewsItem_event_type`, `NewsItem`.stance AS `NewsItem_stance`, `NewsItem`.severity AS `NewsItem_severity`, `NewsItem`.certainty AS `NewsItem_certainty`, `NewsItem`.horizon AS `NewsItem_horizon`, `NewsItem`.created_utc AS `NewsItem_created_utc`
FROM `NewsItem`
WHERE `NewsItem`.id = %(id_1)s
 LIMIT %(param_1)s
2026-02-26 19:22:22,144 INFO sqlalchemy.engine.Engine [cached since 11.05s ago] {'id_1': 'e1d028e6a6672b34359a17884e5034745ad8b08e52d7587146f41f0276ade8fa', 'param_1': 1}
2026-02-26 19:22:22,199 INFO sqlalchemy.engine.Engine SELECT `NewsItem`.id AS `NewsItem_id`, `NewsItem`.feed_id AS `NewsItem_feed_id`, `NewsItem`.source_domain AS `NewsItem_source_domain`, `NewsItem`.title AS `NewsItem_title`, `NewsItem`.snippet AS `NewsItem_snippet`, `NewsItem`.url AS `NewsItem_url`, `NewsItem`.published_utc AS `NewsItem_published_utc`, `NewsItem`.macro_category AS `NewsItem_macro_category`, `NewsItem`.macro_method AS `NewsItem_macro_method`, `NewsItem`.macro_confidence AS `NewsItem_macro_confidence`, `NewsItem`.macro_debug AS `NewsItem_macro_debug`, `NewsItem`.sentiment AS `NewsItem_sentiment`, `NewsItem`.sentiment_method AS `NewsItem_sentiment_method`, `NewsItem`.sentiment_confidence AS `NewsItem_sentiment_confidence`, `NewsItem`.sentiment_debug AS `NewsItem_sentiment_debug`, `NewsItem`.extracted_subjects AS `NewsItem_extracted_subjects`, `NewsItem`.event_type AS `NewsItem_event_type`, `NewsItem`.stance AS `NewsItem_stance`, `NewsItem`.severity AS `NewsItem_severity`, `NewsItem`.certainty AS `NewsItem_certainty`, `NewsItem`.horizon AS `NewsItem_horizon`, `NewsItem`.created_utc AS `NewsItem_created_utc`
FROM `NewsItem`
WHERE `NewsItem`.id = %(id_1)s
 LIMIT %(param_1)s
2026-02-26 19:22:22,202 INFO sqlalchemy.engine.Engine [cached since 11.11s ago] {'id_1': '4084686db713ef57ccae8d391818655b1ebd248573b966c595fb95d3eb334150', 'param_1': 1}
2026-02-26 19:22:22,248 INFO sqlalchemy.engine.Engine SELECT `NewsItem`.id AS `NewsItem_id`, `NewsItem`.feed_id AS `NewsItem_feed_id`, `NewsItem`.source_domain AS `NewsItem_source_domain`, `NewsItem`.title AS `NewsItem_title`, `NewsItem`.snippet AS `NewsItem_snippet`, `NewsItem`.url AS `NewsItem_url`, `NewsItem`.published_utc AS `NewsItem_published_utc`, `NewsItem`.macro_category AS `NewsItem_macro_category`, `NewsItem`.macro_method AS `NewsItem_macro_method`, `NewsItem`.macro_confidence AS `NewsItem_macro_confidence`, `NewsItem`.macro_debug AS `NewsItem_macro_debug`, `NewsItem`.sentiment AS `NewsItem_sentiment`, `NewsItem`.sentiment_method AS `NewsItem_sentiment_method`, `NewsItem`.sentiment_confidence AS `NewsItem_sentiment_confidence`, `NewsItem`.sentiment_debug AS `NewsItem_sentiment_debug`, `NewsItem`.extracted_subjects AS `NewsItem_extracted_subjects`, `NewsItem`.event_type AS `NewsItem_event_type`, `NewsItem`.stance AS `NewsItem_stance`, `NewsItem`.severity AS `NewsItem_severity`, `NewsItem`.certainty AS `NewsItem_certainty`, `NewsItem`.horizon AS `NewsItem_horizon`, `NewsItem`.created_utc AS `NewsItem_created_utc`
FROM `NewsItem`
WHERE `NewsItem`.id = %(id_1)s
 LIMIT %(param_1)s
2026-02-26 19:22:22,248 INFO sqlalchemy.engine.Engine [cached since 11.16s ago] {'id_1': 'c34d411e34bae5d09acf789508e09553c95712ac4fe24304cb1f3ab2dfdb083b', 'param_1': 1}
2026-02-26 19:22:22,256 INFO sqlalchemy.engine.Engine SELECT `NewsItem`.id AS `NewsItem_id`, `NewsItem`.feed_id AS `NewsItem_feed_id`, `NewsItem`.source_domain AS `NewsItem_source_domain`, `NewsItem`.title AS `NewsItem_title`, `NewsItem`.snippet AS `NewsItem_snippet`, `NewsItem`.url AS `NewsItem_url`, `NewsItem`.published_utc AS `NewsItem_published_utc`, `NewsItem`.macro_category AS `NewsItem_macro_category`, `NewsItem`.macro_method AS `NewsItem_macro_method`, `NewsItem`.macro_confidence AS `NewsItem_macro_confidence`, `NewsItem`.macro_debug AS `NewsItem_macro_debug`, `NewsItem`.sentiment AS `NewsItem_sentiment`, `NewsItem`.sentiment_method AS `NewsItem_sentiment_method`, `NewsItem`.sentiment_confidence AS `NewsItem_sentiment_confidence`, `NewsItem`.sentiment_debug AS `NewsItem_sentiment_debug`, `NewsItem`.extracted_subjects AS `NewsItem_extracted_subjects`, `NewsItem`.event_type AS `NewsItem_event_type`, `NewsItem`.stance AS `NewsItem_stance`, `NewsItem`.severity AS `NewsItem_severity`, `NewsItem`.certainty AS `NewsItem_certainty`, `NewsItem`.horizon AS `NewsItem_horizon`, `NewsItem`.created_utc AS `NewsItem_created_utc`
FROM `NewsItem`
WHERE `NewsItem`.id = %(id_1)s
 LIMIT %(param_1)s
2026-02-26 19:22:22,256 INFO sqlalchemy.engine.Engine [cached since 11.18s ago] {'id_1': '98c74ed833889cba98d560436a86bdb55c5563fe094549b70f9ad0d9a75f4e04', 'param_1': 1}
2026-02-26 19:22:22,296 INFO sqlalchemy.engine.Engine INSERT INTO `NewsItem` (id, feed_id, source_domain, title, snippet, url, published_utc, macro_category, macro_method, macro_confidence, macro_debug, sentiment, sentiment_method, sentiment_confidence, sentiment_debug, extracted_subjects, event_type, stance, severity, certainty, horizon) VALUES (%(id)s, %(feed_id)s, %(source_domain)s, %(title)s, %(snippet)s, %(url)s, %(published_utc)s, %(macro_category)s, %(macro_method)s, %(macro_confidence)s, %(macro_debug)s, %(sentiment)s, %(sentiment_method)s, %(sentiment_confidence)s, %(sentiment_debug)s, %(extracted_subjects)s, %(event_type)s, %(stance)s, %(severity)s, %(certainty)s, %(horizon)s)
2026-02-26 19:22:22,296 INFO sqlalchemy.engine.Engine [cached since 10.28s ago] [{'id': 'f7cc05376ef10b69a46a8c668e9cb0b2eb45b00e9e692ff6fa9c2063f52c8a03', 'feed_id': 'feed_src_bbci_co_uk_760cffed', 'source_domain': 'www.bbc.com', 'title': 'American citizen among those killed in Cuba boat shooting, US official says', 'snippet': 'Cuba has accused those on board of planning "an infiltration with terrorist aims” and firing first.', 'url': 'https://www.bbc.com/news/articles/c80j3rlp904o?at_medium=RSS&at_campaign=rss', 'published_utc': datetime.datetime(2026, 2, 26, 23, 59, 54, tzinfo=TzInfo(0)), 'macro_category': 'other', 'macro_method': 'other', 'macro_confidence': 0.33365192678239614, 'macro_debug': '{"rule_scores": {"tech": 0.0, "economy": 0.0, "commodities": 0.0, "geopolitics": 0.0, "macro_pillars": 0.0}, "ai_scores": {"tech": 0.2998566329479217 ... (26 characters truncated) ... 462388038635, "geopolitics": 0.22445088624954224, "commodities": 0.11098983883857727, "economy": 0.08205636590719223}, "max_ai": 0.29985663294792175}', 'sentiment': 'bad', 'sentiment_method': 'ensemble', 'sentiment_confidence': 0.3361335515975952, 'sentiment_debug': '{"rule_scores": {"bad": 0.0, "neutral": 0.0, "good": 0.0}, "ai_scores": {"bad": 0.840333878993988, "neutral": 0.0, "good": 0.0}, "max_ai": 0.840333878993988}', 'extracted_subjects': '["US official", "Cuba", "board", "an infiltration", "terrorist aims"]', 'event_type': 'conflict', 'stance': 'neutral', 'severity': 0.75, 'certainty': 0.75, 'horizon': 'multiday'}, {'id': '0daf6ef5bf3073ff3bcd89db96cad3998c9e28e3f29a4cbdf0465b6be00e3a40', 'feed_id': 'feed_src_bbci_co_uk_760cffed', 'source_domain': 'www.bbc.com', 'title': "US-Iran talks end after 'significant progress', mediator says", 'snippet': 'The indirect negotiations in Geneva are seen as a last-ditch effort, but the chances of a nuclear agreement are unclear.', 'url': 'https://www.bbc.com/news/articles/cvg1vd95nl9o?at_medium=RSS&at_campaign=rss', 'published_utc': datetime.datetime(2026, 2, 26, 21, 43, 44, tzinfo=TzInfo(0)), 'macro_category': 'other', 'macro_method': 'other', 'macro_confidence': 0.28816590044233537, 'macro_debug': '{"rule_scores": {"tech": 0.0, "economy": 0.0, "commodities": 0.0, "geopolitics": 0.0, "macro_pillars": 0.0}, "ai_scores": {"macro_pillars": 0.3203253 ... (25 characters truncated) ...  0.28467845916748047, "tech": 0.23753875494003296, "economy": 0.08100181072950363, "commodities": 0.07645570486783981}, "max_ai": 0.3203253448009491}', 'sentiment': 'bad', 'sentiment_method': 'ensemble', 'sentiment_confidence': 0.21767561435699465, 'sentiment_debug': '{"rule_scores": {"bad": 0.0, "neutral": 0.0, "good": 0.0}, "ai_scores": {"bad": 0.5441890358924866, "neutral": 0.0, "good": 0.0}, "max_ai": 0.5441890358924866}', 'extracted_subjects': '["US-Iran talks", "significant progress", "mediator", "The indirect negotiations", "Geneva", "a last-ditch effort", "the chances", "a nuclear agreement"]', 'event_type': 'other_geo', 'stance': 'neutral', 'severity': 0.75, 'certainty': 0.55, 'horizon': 'multiday'}, {'id': '4f22c3e09dfd4a76c79d47bdcd974ce7f93ec359919a97df51235eb15fa83c07', 'feed_id': 'feed_src_bbci_co_uk_760cffed', 'source_domain': 'www.bbc.com', 'title': 'Pakistan says two soldiers killed after attacks by Afghan Taliban', 'snippet': 'Both sides claim to have inflicted heavy losses after the Afghan Taliban launched attacks along the border.', 'url': 'https://www.bbc.com/news/articles/c0j5qx9n887o?at_medium=RSS&at_campaign=rss', 'published_utc': datetime.datetime(2026, 2, 26, 21, 56, 49, tzinfo=TzInfo(0)), 'macro_category': 'other', 'macro_method': 'other', 'macro_confidence': 0.028212957912021237, 'macro_debug': '{"rule_scores": {"tech": 0.0, "economy": 0.0, "commodities": 0.0, "geopolitics": 0.0, "macro_pillars": 0.0}, "ai_scores": {"geopolitics": 0.437304168 ... (25 characters truncated) ... 93585920334, "macro_pillars": 0.1986958384513855, "commodities": 0.06979583948850632, "economy": 0.05401480570435524}, "max_ai": 0.43730416893959045}', 'sentiment': 'bad', 'sentiment_method': 'ensemble', 'sentiment_confidence': 0.48144771575927736, 'sentiment_debug': '{"rule_scores": {"bad": 0.6, "neutral": 0.0, "good": 0.0}, "ai_scores": {"bad": 0.9036192893981934, "neutral": 0.0, "good": 0.0}, "max_ai": 0.9036192893981934}', 'extracted_subjects': '["Pakistan", "two soldiers", "attacks", "Afghan Taliban", "Both sides", "heavy losses", "the Afghan Taliban", "attacks", "the border"]', 'event_type': 'conflict', 'stance': 'escalation', 'severity': 0.75, 'certainty': 0.55, 'horizon': 'multiday'}, {'id': '2cad572b4047b315ad78490e70ddb66f54c164372d9f686881b553c122c3e36c', 'feed_id': 'feed_src_bbci_co_uk_760cffed', 'source_domain': 'www.bbc.com', 'title': 'Kenyan charged with luring young men to fight for Russia in Ukraine', 'snippet': 'A total of 1,000 Kenyans have reportedly been recruited to fight for Russia in its war against Ukraine.', 'url': 'https://www.bbc.com/news/articles/cx2g79kpe2po?at_medium=RSS&at_campaign=rss', 'published_utc': datetime.datetime(2026, 2, 26, 18, 4, 34, tzinfo=TzInfo(0)), 'macro_category': 'other', 'macro_method': 'other', 'macro_confidence': 0.12800775633917916, 'macro_debug': '{"rule_scores": {"tech": 0.0, "economy": 0.0, "commodities": 0.0, "geopolitics": 0.8, "macro_pillars": 0.5}, "ai_scores": {"geopolitics": 0.392396509 ... (24 characters truncated) ... 77119445801, "macro_pillars": 0.19441582262516022, "economy": 0.10228301584720612, "commodities": 0.05170691758394241}, "max_ai": 0.3923965096473694}', 'sentiment': 'neutral', 'sentiment_method': 'ensemble', 'sentiment_confidence': 0.3767063474655152, 'sentiment_debug': '{"rule_scores": {"bad": 0.0, "neutral": 0.3, "good": 0.0}, "ai_scores": {"bad": 0.0, "neutral": 0.7917658686637878, "good": 0.0}, "max_ai": 0.7917658686637878}', 'extracted_subjects': '["Kenyan", "young men", "Russia", "Ukraine", "A total of 1,000 Kenyans", "Russia", "Ukraine"]', 'event_type': 'supply_chain', 'stance': 'neutral', 'severity': 0.35, 'certainty': 0.4, 'horizon': 'multiday'}, {'id': 'd58ec959e0add976e5d288c860548904da39f33092b348098fae8e2651b198c7', 'feed_id': 'feed_src_bbci_co_uk_760cffed', 'source_domain': 'www.bbc.com', 'title': "Russia and Ukraine exchange more than 1,000 soldiers' bodies", 'snippet': "Russia's announcement comes as Ukraine's top negotiator met US peace envoys in Geneva.", 'url': 'https://www.bbc.com/news/articles/cg7ed4rp7x5o?at_medium=RSS&at_campaign=rss', 'published_utc': datetime.datetime(2026, 2, 26, 14, 28, 35, tzinfo=TzInfo(0)), 'macro_category': 'geopolitics', 'macro_method': 'ensemble', 'macro_confidence': 0.356907126903534, 'macro_debug': '{"rule_scores": {"tech": 0.0, "economy": 0.0, "commodities": 0.0, "geopolitics": 0.8, "macro_pillars": 0.0}, "ai_scores": {"geopolitics": 0.492267817 ... (27 characters truncated) ... 0.24248574674129486, "tech": 0.18811635673046112, "economy": 0.04408805072307587, "commodities": 0.03304201364517212}, "max_ai": 0.49226781725883484}', 'sentiment': 'neutral', 'sentiment_method': 'ensemble', 'sentiment_confidence': 0.3425697708129883, 'sentiment_debug': '{"rule_scores": {"bad": 0.0, "neutral": 0.2, "good": 0.0}, "ai_scores": {"bad": 0.0, "neutral": 0.7564244270324707, "good": 0.0}, "max_ai": 0.7564244270324707}', 'extracted_subjects': '["Russia", "Ukraine", "more than 1,000 soldiers\' bodies", "Russia\'s announcement", "Ukraine\'s top negotiator", "US peace envoys", "Geneva"]', 'event_type': 'other_geo', 'stance': 'deescalation', 'severity': 0.35, 'certainty': 0.55, 'horizon': 'multiday'}, {'id': 'a6c39e2a0cb0a7e94f4e5685f9d20f03af8c9c5705c9261b36cc9f27f3e5ff5b', 'feed_id': 'feed_src_bbci_co_uk_4016beb5', 'source_domain': 'www.bbc.com', 'title': 'Douglas Ross: My behaviour fell short of what is expected of MSPs', 'snippet': 'The Tory MSP apologised after refusing to leave the chamber on Tuesday when being ordered to do so by Presiding Officer Alison Johnstone.', 'url': 'https://www.bbc.com/news/videos/c0rj0l8vjyzo?at_medium=RSS&at_campaign=rss', 'published_utc': datetime.datetime(2026, 2, 26, 15, 18, 4, tzinfo=TzInfo(0)), 'macro_category': 'other', 'macro_method': 'other', 'macro_confidence': 0.0724786784913805, 'macro_debug': '{"rule_scores": {"tech": 0.0, "economy": 0.0, "commodities": 0.0, "geopolitics": 0.0, "macro_pillars": 0.0}, "ai_scores": {"macro_pillars": 0.4173845 ... (25 characters truncated) ... 586275100708, "commodities": 0.11533177644014359, "economy": 0.09249650686979294, "geopolitics": 0.045128513127565384}, "max_ai": 0.4173845946788788}', 'sentiment': 'bad', 'sentiment_method': 'ensemble', 'sentiment_confidence': 0.37102220058441165, 'sentiment_debug': '{"rule_scores": {"bad": 0.0, "neutral": 0.0, "good": 0.0}, "ai_scores": {"bad": 0.927555501461029, "neutral": 0.0, "good": 0.0}, "max_ai": 0.927555501461029}', 'extracted_subjects': '["Douglas Ross", "MSPs", "The Tory MSP", "the chamber", "Tuesday", "Presiding Officer Alison Johnstone"]', 'event_type': 'other_geo', 'stance': 'neutral', 'severity': 0.35, 'certainty': 0.55, 'horizon': 'multiday'}, {'id': '52c8a8a678733fe4b35e2e981b3b6ebd3c1f283b766d062788bd50acb19b7dd4', 'feed_id': 'feed_src_nytimes_com_befdaecf', 'source_domain': 'www.nytimes.com', 'title': 'What to Know About U.S.-Iran Nuclear Talks Amid Trump Threats', 'snippet': 'President Trump has kept up a steady drumbeat of threats and built up U.S. troops in the region. Iran’s task is to give him a win but also preserve some semblance of nuclear enrichment.', 'url': 'https://www.nytimes.com/2026/02/26/world/middleeast/iran-us-nuclear-talks.html', 'published_utc': datetime.datetime(2026, 2, 26, 21, 38, 3, tzinfo=TzInfo(0)), 'macro_category': 'geopolitics', 'macro_method': 'ensemble', 'macro_confidence': 0.24492402076721193, 'macro_debug': '{"rule_scores": {"tech": 0.0, "economy": 0.0, "commodities": 0.0, "geopolitics": 0.0, "macro_pillars": 0.0}, "ai_scores": {"geopolitics": 0.612310051 ... (25 characters truncated) ...  0.15611934661865234, "commodities": 0.11751645803451538, "tech": 0.07634062319993973, "economy": 0.03771355375647545}, "max_ai": 0.6123100519180298}', 'sentiment': 'neutral', 'sentiment_method': 'ensemble', 'sentiment_confidence': 0.47561193943023683, 'sentiment_debug': '{"rule_scores": {"bad": 0.0, "neutral": 0.7, "good": 1.0}, "ai_scores": {"bad": 0.0, "neutral": 0.839029848575592, "good": 0.0}, "max_ai": 0.839029848575592}', 'extracted_subjects': '["U.S.-Iran Nuclear Talks", "Trump Threats", "President Trump", "a steady drumbeat", "threats", "U.S. troops", "the region", "Iran\\u2019s task", "a win", "some semblance", "nuclear enrichment"]', 'event_type': 'other_geo', 'stance': 'escalation', 'severity': 0.75, 'certainty': 0.55, 'horizon': 'multiday'}, {'id': 'ba068c499deb12792351ce010878ff7ed1cb7c674f46aa40f3067c65cfa3782f', 'feed_id': 'feed_src_nytimes_com_befdaecf', 'source_domain': 'www.nytimes.com', 'title': 'Russia Launches Big Strikes Before U.S.-Ukraine Talks in Geneva', 'snippet': 'Ukrainian officials said they hoped that trilateral peace negotiations could take place next week.', 'url': 'https://www.nytimes.com/2026/02/26/world/europe/russia-attack-ukraine-talks.html', 'published_utc': datetime.datetime(2026, 2, 26, 23, 29, 3, tzinfo=TzInfo(0)), 'macro_category': 'geopolitics', 'macro_method': 'ensemble', 'macro_confidence': 0.44279509544372564, 'macro_debug': '{"rule_scores": {"tech": 0.0, "economy": 0.0, "commodities": 0.0, "geopolitics": 0.8, "macro_pillars": 0.0}, "ai_scores": {"geopolitics": 0.706987738 ... (23 characters truncated) ... : 0.12054845690727234, "tech": 0.11733105778694153, "economy": 0.0397343672811985, "commodities": 0.015398435294628143}, "max_ai": 0.706987738609314}', 'sentiment': 'other', 'sentiment_method': 'other', 'sentiment_confidence': 0.1420481602350871, 'sentiment_debug': '{"rule_scores": {"bad": 0.0, "neutral": 0.0, "good": 0.0}, "ai_scores": {"bad": 0.0, "neutral": 0.3860783278942108, "good": 0.0}, "max_ai": 0.3860783278942108}', 'extracted_subjects': '["Russia Launches", "Big Strikes", "U.S.-Ukraine", "Talks", "Geneva", "Ukrainian officials", "trilateral peace negotiations", "place"]', 'event_type': 'conflict', 'stance': 'escalation', 'severity': 0.35, 'certainty': 0.75, 'horizon': 'multiday'}  ... displaying 10 of 45 total bound parameter sets ...  {'id': 'c34d411e34bae5d09acf789508e09553c95712ac4fe24304cb1f3ab2dfdb083b', 'feed_id': 'feed_src_aljazeera_com_cfee309e', 'source_domain': 'www.aljazeera.com', 'title': 'Gaza mother recognises missing son on Israeli ‘for sale’ post', 'snippet': 'A mother from Gaza says she recognised her missing son listed as ‘for sale’ in a post shared by Israeli soldiers.', 'url': 'https://www.aljazeera.com/video/newsfeed/2026/2/26/gaza-mother-recognises-missing-son-on-israeli-for-sale-post?traffic_source=rss', 'published_utc': datetime.datetime(2026, 2, 26, 15, 22, 47, tzinfo=TzInfo(0)), 'macro_category': 'other', 'macro_method': 'other', 'macro_confidence': 0.40024256706237793, 'macro_debug': '{"rule_scores": {"tech": 0.0, "economy": 0.0, "commodities": 0.0, "geopolitics": 0.8, "macro_pillars": 0.0}, "ai_scores": {"commodities": 0.269890844 ... (23 characters truncated) ... 503373503685, "economy": 0.17266443371772766, "macro_pillars": 0.166530579328537, "geopolitics": 0.15641073882579803}, "max_ai": 0.26989084482192993}', 'sentiment': 'bad', 'sentiment_method': 'ensemble', 'sentiment_confidence': 0.47345952987670903, 'sentiment_debug': '{"rule_scores": {"bad": 1.0, "neutral": 0.0, "good": 0.0}, "ai_scores": {"bad": 0.6836488246917725, "neutral": 0.0, "good": 0.0}, "max_ai": 0.6836488246917725}', 'extracted_subjects': '["son", "sale", "\\u2019 post", "Gaza", "sale", "a post", "Israeli soldiers"]', 'event_type': 'other_geo', 'stance': 'neutral', 'severity': 0.35, 'certainty': 0.55, 'horizon': 'multiday'}, {'id': '98c74ed833889cba98d560436a86bdb55c5563fe094549b70f9ad0d9a75f4e04', 'feed_id': 'feed_src_aljazeera_com_cfee309e', 'source_domain': 'www.aljazeera.com', 'title': 'What is Greater Israel, and how popular is it among Israelis?', 'snippet': 'Recent US and Israeli comments on &#039;Greater Israel&#039; trigger regional concerns over sovereignty and territorial expansion.', 'url': 'https://www.aljazeera.com/news/2026/2/26/what-is-greater-israel-and-how-popular-is-it-among-israelis?traffic_source=rss', 'published_utc': datetime.datetime(2026, 2, 26, 14, 56, 20, tzinfo=TzInfo(0)), 'macro_category': 'geopolitics', 'macro_method': 'ensemble', 'macro_confidence': 0.25832672119140626, 'macro_debug': '{"rule_scores": {"tech": 0.0, "economy": 0.0, "commodities": 0.0, "geopolitics": 0.0, "macro_pillars": 0.0}, "ai_scores": {"geopolitics": 0.645816802 ... (24 characters truncated) ... : 0.1590096354484558, "tech": 0.06941010057926178, "economy": 0.06489488482475281, "commodities": 0.06086860969662666}, "max_ai": 0.6458168029785156}', 'sentiment': 'bad', 'sentiment_method': 'ensemble', 'sentiment_confidence': 0.2985930728912354, 'sentiment_debug': '{"rule_scores": {"bad": 0.4, "neutral": 0.0, "good": 0.6}, "ai_scores": {"bad": 0.5464826822280884, "neutral": 0.0, "good": 0.0}, "max_ai": 0.5464826822280884}', 'extracted_subjects': '["Greater Israel", "Israelis", "Recent US and Israeli comments", "Israel&#039", "regional concerns"]', 'event_type': 'other_geo', 'stance': 'neutral', 'severity': 0.35, 'certainty': 0.55, 'horizon': 'multiday'}]
2026-02-26 19:22:22,378 INFO sqlalchemy.engine.Engine ROLLBACK
INFO:     127.0.0.1:52338 - "POST /internal/ingest/news-items HTTP/1.1" 500 Internal Server Error
"""




# ==============================================================
# --- Fetcher Config  ---
# ==============================================================
class FetcherServerCfgDB(Base):
    __tablename__ = 'FetcherServerCfg'

    id = Column(Integer, primary_key=True, autoincrement=True)
    sha256 = Column(String(64), nullable=False, index=True)

    active = Column(Boolean, nullable=False, default=False, index=True)
    config_json = Column(JSON, nullable=False)
    comment = Column(String(255), nullable=True)
    created_by = Column(String(80), nullable=False)
    created_utc = Column(
        TIMESTAMP,
        nullable=False,
        server_default=text('CURRENT_TIMESTAMP'),
    )

    active_one = Column(
        Integer,
        Computed('IF(active = 1, 1, NULL)', persisted=True),
        nullable=True,
    )

    __table_args__ = (
        UniqueConstraint('sha256', name='uq_sha256'),
        UniqueConstraint('active_one', name='uq_one_active'),
    )




# ==============================================================
# --- Fetcher Classes  ---
# ==============================================================
# source registery
class SourceDB(Base):
    __tablename__ = 'Source'

    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    domain = Column(String(255), unique=True)
    weight_default = Column(Float, default=1.0)
    is_active = Column(Boolean, default=True)
    # created_utc = Column(TIMESTAMP)
    
class RSSFeedDB(Base):
    __tablename__ = 'RSSFeed'

    id = Column(String(50), primary_key=True)
    source_id = Column(String(50), ForeignKey('Source.id'), nullable=False)
    url = Column(Text, nullable=False)
    topic = Column(String(100))
    
# rss items
class RawRSSItemDB(Base):
    __tablename__ = 'RawRSSItem'

    id = Column(String(50), primary_key=True)
    feed_id = Column(String(50), ForeignKey('RSSFeed.id'))
    
    source_domain = Column(String(255))
    title = Column(Text)
    snippet = Column(Text)
    url = Column(Text)
    published_utc = Column(DateTime)

# news items
class NewsItemDB(Base):
    __tablename__ = 'NewsItem'
    id = Column(String(50), ForeignKey('RawRSSItem.id'), primary_key=True)
    feed_id = Column(String(50), ForeignKey('RSSFeed.id'), nullable=False)
    # source_id = Column(String(50))     # (index MUL dans DB)

    source_domain = Column(String(255))
    title = Column(Text)
    snippet = Column(Text)
    url = Column(Text)
    published_utc = Column(DateTime)

    macro_category = Column(Enum('tech', 'economy', 'commodities', 'geopolitics', 'macro_pillars', 'other'))
    macro_method = Column(Enum('rules', 'ensemble', 'both', 'other'))
    macro_confidence = Column(Float)
    macro_debug = Column(JSON)

    sentiment = Column(Enum('bad', 'neutral', 'good'))
    sentiment_method = Column(Enum('rules', 'ensemble', 'both', 'other'))
    sentiment_confidence = Column(Float)
    sentiment_debug = Column(JSON)

    extracted_subjects = Column(JSON)

    event_type = Column(String(100))
    stance = Column(Enum('escalation', 'deescalation', 'neutral'))
    severity = Column(Float)
    certainty = Column(Float)
    horizon = Column(Enum('immediate', 'intraday', 'multiday'))

    created_utc = Column(TIMESTAMP, server_default=func.current_timestamp())
    
# events
class EventDB(Base):
    __tablename__ = 'Event'

    # ids
    id = Column(String(50), primary_key=True)
    fingerprint = Column(String(255), nullable=False, unique=True)

    # consensus descriptors
    event_type = Column(String(100))
    stance = Column(Enum('escalation', 'deescalation', 'neutral'))
    horizon = Column(Enum('immediate', 'intraday', 'multiday'))
    horizon_tau = Column(Integer)

    # timestamps
    published_utc = Column(DateTime, nullable=False)
    latest_update_utc = Column(DateTime, nullable=False)

    # representative text
    title = Column(Text, nullable=False)

    # signal components
    consensus_sentiment = Column(Float, nullable=False)
    sentiment_dispersion = Column(Float, nullable=False)
    agreement_score = Column(Float, nullable=False)
    credibility = Column(Float)
    confidence = Column(Float, nullable=False)
    impact_strength = Column(Float, nullable=False)
    impact_score = Column(Float, nullable=False)

    # evidence / metadata
    distinct_sources = Column(Integer, default=1)
    sources_domains = Column(JSON)
    entities = Column(JSON)
    keywords = Column(JSON)

    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())

Index('idx_event_published_utc', EventDB.published_utc)
Index('idx_event_impact', EventDB.impact_strength, EventDB.impact_score)
Index('idx_event_type', EventDB.event_type)
Index('idx_event_horizon', EventDB.horizon)
Index('idx_event_latest', EventDB.latest_update_utc)

class EventNewsItemDB(Base):
    __tablename__ = 'EventNewsItem'

    event_id = Column(String(50), ForeignKey('Event.id'), primary_key=True)
    news_item_id = Column(String(50), ForeignKey('NewsItem.id'), primary_key=True)

Index('idx_eni_news_item', EventNewsItemDB.news_item_id)

# quotes
class QuoteDB(Base):
    __tablename__ = "Quote"

    # Unique per symbol + timestamp (tick storage)
    symbol = Column(String(32), primary_key=True)
    ts_utc = Column(DateTime, primary_key=True, nullable=False)
    price = Column(Float, nullable=False)

    change_pct = Column(Float, nullable=False)
    change_price = Column(Float, nullable=False)
    volume = Column(Float, nullable=False)

    dayLow = Column(Float, nullable=False)
    dayHigh = Column(Float, nullable=False)

    raw = Column(JSON, nullable=True)

    __table_args__ = (
        Index("ix_quote_ts_utc", "ts_utc"),
        Index("ix_quote_symbol_ts", "symbol", "ts_utc"),
    )
    
# candles
class CandleDB(Base):
    __tablename__ = "Candle"

    # Unique per symbol + timeframe + bar open
    symbol = Column(String(32), primary_key=True)
    tf_s = Column(Integer, primary_key=True)
    t_open_utc = Column(DateTime, primary_key=True, nullable=False)

    t_close_utc = Column(DateTime, nullable=False)

    o = Column(Float, nullable=False)
    h = Column(Float, nullable=False)
    l = Column(Float, nullable=False)
    c = Column(Float, nullable=False)
    v = Column(Float, nullable=True)

    __table_args__ = (
        Index("ix_candle_open", "t_open_utc"),
        Index("ix_candle_symbol_tf_open", "symbol", "tf_s", "t_open_utc"),
    )




# ==============================================================
# --- User Classes  ---
# ==============================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(255), unique=True, nullable=False, index=True)

    password_hash = Column(String(255), nullable=False)
    
    username = Column(String(50), unique=True, index=True, nullable=False)
    
    reset_token = Column(String(255), nullable=True, index=True)
    reset_token_expires_at = Column(TIMESTAMP, nullable=True)

    created_at = Column(TIMESTAMP, nullable=False, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, nullable=True, server_default=None, onupdate=func.current_timestamp())