"""RC-168 RiverSpend division registry — organizational catalog, not running agents."""
DIVISIONS={
 "games":{"name":"RiverGames","mission":"Game design, development, QA, publishing and game services","teams":["design","engine","art","sound","qa","publishing"],"status":"planned"},
 "audio":{"name":"RiverAudio","mission":"Sound production, audio tools, ISSA and audio experiences","teams":["composition","sound_design","mixing","audio_engineering","qa"],"status":"planned"},
 "video":{"name":"RiverVideo","mission":"Video production, editing, animation, streaming and broadcast","teams":["production","editing","motion_graphics","streaming","qa"],"status":"planned"},
 "film":{"name":"RiverFilm","mission":"Film development, writing, production, postproduction and distribution","teams":["story","development","production","postproduction","distribution","rights_review"],"status":"planned"},
 "electronics":{"name":"RiverElectronics","mission":"Consumer devices, prototypes, embedded software and hardware testing","teams":["product_design","embedded","hardware","prototyping","qa","compliance"],"status":"planned"},
 "robotics":{"name":"RiverRobotics","mission":"Robotics research, simulation, control systems and safe prototyping","teams":["research","simulation","controls","hardware","safety","testing"],"status":"planned"},
 "ai":{"name":"RiverAI","mission":"RiverSSAI, model integration, evaluation and AI infrastructure","teams":["core","evaluation","integration","data","safety","research"],"status":"planned"},
 "cloud":{"name":"RiverCloud","mission":"Infrastructure, storage, hosting, reliability and portability","teams":["platform","storage","observability","reliability","security"],"status":"planned"},
 "software":{"name":"RiverSoftware","mission":"Applications, engineering, developer tooling and quality","teams":["frontend","backend","mobile","devtools","qa"],"status":"planned"},
 "market":{"name":"RiverMarket","mission":"RiverSpendShop, seller/buyer experience, catalog and commerce operations","teams":["catalog","seller_tools","buyer_experience","commerce","qa"],"status":"planned"},
 "pay":{"name":"RiverPay","mission":"Payment integrations, payment flow design and financial safeguards","teams":["integrations","risk","reconciliation","compliance_review"],"status":"planned"},
 "security":{"name":"RiverFortress","mission":"Security reviews, privacy, threat modeling and incident preparedness","teams":["security_review","privacy","threat_model","incident_response"],"status":"planned"},
 "delivery":{"name":"RiverDelivery","mission":"Delivery operations, tracking, logistics integrations and route planning","teams":["operations","integrations","tracking","qa"],"status":"planned"},
 "education":{"name":"RiverAcademy","mission":"Learning content, encyclopedia, training and educational products","teams":["curriculum","content","media","qa"],"status":"planned"},
 "design":{"name":"RiverDesign","mission":"Brand, UI/UX, accessibility, design systems and creative direction","teams":["brand","ux","ui","accessibility","research"],"status":"planned"},
 "legal_compliance":{"name":"RiverCompliance","mission":"Regulatory mapping, licensing, policy and compliance review support","teams":["regulatory_research","licensing","policy","review"],"status":"planned"},
 "operations":{"name":"RiverOperations","mission":"Project coordination, planning, finance ops, documentation and reporting","teams":["planning","coordination","documentation","metrics"],"status":"planned"},
 "research":{"name":"RiverResearch","mission":"Research, feasibility, prototypes and technical exploration","teams":["technology","market_research","prototyping","evaluation"],"status":"planned"}
}
def list_divisions():
 return [{"id":k,**v} for k,v in DIVISIONS.items()]
def get_division(key):
 return DIVISIONS.get(key)
