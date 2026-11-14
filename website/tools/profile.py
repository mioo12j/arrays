"""Profile page: Lieutenant General Ashish Ranjan Prasad (Retd), founder and CEO of Arrays Ingenieria.

Every fact below comes from a public source listed in SOURCES (or from the company's own records, as the page says).
Never add a date, post or claim that is not in a source. No em dashes.
"""

FILE = "lt-gen-ashish-ranjan-prasad.html"
TITLE = "Lt. Gen. Ashish Ranjan Prasad (Retd): Founder & CEO, Arrays Ingenieria"
SEO_TITLE = "Lt Gen Ashish Ranjan Prasad (Retd), CEO | Arrays Ingenieria"
DESC = ("Profile of Lt. Gen. Ashish Ranjan Prasad (Retd), AVSM, VSM, ADC: former Signal Officer-in-Chief of the Indian Army, "
        "founder and CEO of Arrays Ingenieria.")
PUBLISHED = "2026-11-14"
UPDATED = "2026-11-14"

HERO = ("assets/press/arrays-ingenieria-founder-ceo-lt-gen-ashish-ranjan-prasad-retd.jpg",
        "Lieutenant General Ashish Ranjan Prasad (Retd), founder and CEO of Arrays Ingenieria")
PORTRAIT = HERO

SUMMARY = ("Thirty-seven years in the Indian Army's Corps of Signals, rising to Signal Officer-in-Chief, followed by a second "
           "innings building India's solar plants at the head of a veteran-led MSME.")

J = "https://jharkhandstatenews.com/article/top-stories/964/major-general-ashish-ranjan-prasad-becomes-lt-general"
PIB = "https://www.indrastra.com/2017/03/NEWS-Increasing-Infrastructure-for-Digital-Army-003-03-2017-0079.html"
AVSM = "https://www.sanjhamorcha.com/list-of-honours-and-awards-republic-day-2017/"
VSM = "http://indianmilitaryveterans.blogspot.com/2016/01/list-of-personnel-being-awarded.html"
IANS = "https://www.business-standard.com/article/news-ians/army-s-signals-chief-retires-118073101468_1.html"
YT = "https://www.youtube.com/watch?v=-8CUv9HKaI0"
ECIL = "https://www.zaubacorp.com/ELECTRONICS-CORPORATION-OF-INDIA-LIMITED-U32100TG1967GOI001149"
ITI = "https://www.zaubacorp.com/ITI-LIMITED-L32202KA1950GOI000640"
SENTINEL = "https://www.sentinelassam.com/north-east-india-news/assam-news/assam-aipl-commissions-1-mw-solar-power-plant-at-jayshree-tea-estate"


def a(url, text):
    return f'<a href="{url}" target="_blank" rel="noopener">{text}</a>'


KEYS = [
    "Joined the Indian Army in January 1981, in the Corps of Signals; studied at BIT Mesra, Ranchi.",
    "Commanded 23 Infantry Division at Ranchi as a Major General, and was promoted Lieutenant General on 1 August 2016.",
    "Served as Signal Officer-in-Chief and Senior Colonel Commandant of the Corps of Signals until his retirement on 31 July 2018.",
    "Awarded the Vishisht Seva Medal (Republic Day 2016) and the Ati Vishisht Seva Medal (Republic Day 2017); ADC and Ph.D.",
    "Founded Arrays Ingenieria in 2018 under the motto \"Olive Green to Go Green\" and leads it as Chief Executive Officer.",
]

FACTS = [  # (label, value) for the at-a-glance table
    ("Full name", "Ashish Ranjan Prasad"),
    ("Also known as", "Lt. Gen. A.R. Prasad (Retd)"),
    ("Rank", "Lieutenant General (retired), Indian Army"),
    ("Post-nominals", "AVSM, VSM, ADC, Ph.D"),
    ("Arm of service", "Corps of Signals"),
    ("Joined the Army", "January 1981"),
    ("Education", "Birla Institute of Technology (BIT), Mesra, Ranchi"),
    ("Last military appointment", "Signal Officer-in-Chief and Senior Colonel Commandant, Corps of Signals"),
    ("Retired", "31 July 2018"),
    ("Today", "Founder and Chief Executive Officer, Arrays Ingenieria Pvt. Ltd."),
]

SECTIONS = [
    dict(h="At a glance", blocks=[
        "Lieutenant General Ashish Ranjan Prasad (Retd), AVSM, VSM, ADC, Ph.D, is a retired three-star officer of the Indian Army "
        "and the founder and Chief Executive Officer of Arrays Ingenieria Pvt. Ltd. (INGENIERIA), an ex-servicemen-led solar EPC and "
        "installation &amp; commissioning company. He spent his military career in the Corps of Signals, the arm that carries the "
        "Army's communications, and retired as its head, the Signal Officer-in-Chief. Colleagues, clients and the press usually "
        "refer to him as <b>Lt. Gen. A.R. Prasad (Retd)</b>.",
        ("table", "Lt. Gen. Ashish Ranjan Prasad (Retd) at a glance", ["", "Details"], FACTS),
    ]),
    dict(h="Education and early career", blocks=[
        f"Lt. Gen. Prasad studied at the Birla Institute of Technology (BIT), Mesra, in Ranchi, one of eastern India's best-known "
        f"engineering institutions ({a(J, 'Jharkhand State News, 1 August 2016')}). That technical grounding shaped the rest of his "
        "career: he chose the Corps of Signals, the Army's engineering and communications arm.",
        f"He joined the Indian Army in January 1981, in the Corps of Signals ({a(J, 'Jharkhand State News')}). "
        "Over the decades that followed he rose through the ranks of the Corps to general rank.",
        ("note", "What the Corps of Signals does",
         "The Corps of Signals provides the Indian Army's communications: radio, line, satellite and data networks that link every "
         "headquarters and unit, and the electronic-warfare and information-technology systems that sit on them. Its officers are "
         "engineers and commanders at the same time."),
    ]),
    dict(h="Commanding 23 Infantry Division, Ranchi", blocks=[
        f"As a Major General, Lt. Gen. Prasad commanded the Indian Army's 23 Infantry Division at Ranchi, Jharkhand "
        f"({a(J, 'Jharkhand State News')}). Command of an infantry division, a formation of several brigades and thousands of troops, "
        "is a demanding field command, responsible for the operational readiness, training and welfare of the "
        "soldiers under it.",
        f"On Republic Day 2016, while still a Major General, he was awarded the <b>Vishisht Seva Medal (VSM)</b> for distinguished "
        f"service; he is listed at serial 24 of the VSM awards as \"Maj Gen Ashish Ranjan Prasad, Signals\" ({a(VSM, 'Republic Day 2016 honours list')}).",
    ]),
    dict(h="Promotion to Lieutenant General", blocks=[
        f"On 1 August 2016 he was promoted to the rank of Lieutenant General, the Army's three-star rank. The then Chief of the Army "
        f"Staff, General Dalbir Singh Suhag, handed over the promoted rank to him ({a(J, 'Jharkhand State News, 1 August 2016')}). By "
        "then he had completed 35 years of service.",
        ("stats", [("1981", "Joined the Corps of Signals"), ("2016", "Promoted Lieutenant General"), ("37+", "Years in uniform"),
                   ("2018", "Founded Arrays Ingenieria")]),
    ]),
    dict(h="Signal Officer-in-Chief of the Indian Army", blocks=[
        "As a Lieutenant General he was appointed <b>Signal Officer-in-Chief</b> (SO-in-C) and <b>Senior Colonel Commandant</b> of "
        "the Corps of Signals. The Signal Officer-in-Chief heads the Corps at Army Headquarters in New Delhi and is responsible for "
        "the communication and information-technology backbone of the whole Army; the Senior Colonel Commandant is the senior-most "
        "officer of the Corps and the guardian of its traditions.",
        ("h3", "Building a digital Army"),
        f"In March 2017 he addressed DEFCOM INDIA 2017, a two-day seminar organised by the Corps of Signals with the Confederation of "
        f"Indian Industry (CII) on the theme <i>\"Infrastructure and Skilled Human Resource for Digital Army\"</i>. The Press Information "
        f"Bureau reported that the event was addressed by \"Signal Officer-in-Chief and Senior Col. Commandant, Corps of Signals Lt. Gen. "
        f"Ashish Ranjan Prasad\" alongside the Director General of CII, with the Chief of the Army Staff, General Bipin Rawat, and the "
        f"Minister of State for Defence, Dr. Subhash Bhamre, also speaking ({a(PIB, 'PIB via IndraStra, 24 March 2017')}). At the same "
        f"event he laid out the outline of <b>smart battlefields</b>, networked and sensor-rich, for the Army of the future "
        f"({a(YT, 'National Defence Bureau video, 23 March 2017')}).",
        ("fig", "assets/press/arrays-ingenieria-founder-lt-gen-ar-prasad-defcom-india-keynote.jpg",
         "Lt. Gen. A.R. Prasad delivering the keynote at DEFCOM India",
         "Lt. Gen. A.R. Prasad as Signal Officer-in-Chief, delivering the keynote at DEFCOM India."),
        ("h3", "Joint communications and need-based networks"),
        f"When he retired, the news agency IANS reported that he was known for his efforts towards integrating the communications of "
        f"the three services, the Army, Navy and Air Force, and that he introduced need-based networks built on the internet and "
        f"commercial networks, protected by multiple layers of security ({a(IANS, 'IANS via Business Standard, 31 July 2018')}). Both "
        "ideas, jointness and secure use of commercial technology, remain central to India's military modernisation.",
        ("h3", "On the boards of two public-sector companies"),
        f"During his tenure he also served as a director on the boards of two central public-sector enterprises: <b>Electronics "
        f"Corporation of India Ltd. (ECIL)</b> and, as a nominee director, <b>ITI Ltd.</b>, the state-owned telecom manufacturer. "
        f"Company records show both directorships ending on 31 July 2018, the day he retired ({a(ECIL, 'ECIL')}; {a(ITI, 'ITI Ltd.')}, "
        f"MCA records via ZaubaCorp).",
    ]),
    dict(h="Honours and awards", blocks=[
        "Lt. Gen. Prasad's post-nominal letters record the recognition he received from the nation:",
        ("table", "Honours of Lt. Gen. Ashish Ranjan Prasad (Retd)", ["Honour", "What it means", "Source"], [
            ("AVSM", "Ati Vishisht Seva Medal, awarded on Republic Day 2017 for distinguished service of an exceptional order",
             a(AVSM, "Republic Day 2017 honours list") + " (serial 14, IC-39846X)"),
            ("VSM", "Vishisht Seva Medal, awarded on Republic Day 2016 for distinguished service",
             a(VSM, "Republic Day 2016 honours list") + " (serial 24)"),
            ("ADC", "Honorary Aide-de-Camp to the President of India, the Supreme Commander of the Armed Forces",
             "Post-nominal used in his official designation"),
            ("Ph.D", "Doctorate", "Post-nominal used in his official designation"),
        ]),
        ("fig", "assets/press/arrays-ingenieria-ceo-lt-gen-ar-prasad-honoured-by-president-of-india.jpg",
         "Lt. Gen. A.R. Prasad honoured by the President of India",
         "Honoured by the President of India."),
    ]),
    dict(h="Retirement after 37 years of service", blocks=[
        f"Lt. Gen. Prasad retired as Signal Officer-in-Chief on 31 July 2018 ({a(IANS, 'IANS, 31 July 2018')}), after more than 37 "
        "years in uniform that began as a young Signals officer in 1981 and ended at the head of his Corps.",
    ]),
    dict(h="Second innings: founding Arrays Ingenieria", blocks=[
        "In 2018 he founded <a href=\"about.html\">Arrays Ingenieria Pvt. Ltd.</a>, known as INGENIERIA, to give fellow veterans a "
        "second innings of national service in clean energy. The company's motto, <b>\"Olive Green to Go Green\"</b>, captures the "
        "move from the Army's olive-green uniform to renewable energy. Assam's daily <i>The Sentinel</i> described the company as "
        f"\"a unique MSME founded by ex-servicemen, symbolizing a disciplined, mission-driven transition from OG (Olive Green-the "
        f"military uniform) to GG (Go Green-renewable energy)\" ({a(SENTINEL, 'The Sentinel, 22 May 2025')}).",
        "Under his leadership the company works pan India as a <a href=\"capex-solar-epc.html\">CAPEX solar EPC</a> contractor and as "
        "an <a href=\"solar-installation-commissioning.html\">installation &amp; commissioning partner</a> to India's largest solar "
        "developers, with civil works, pile foundations and operations &amp; maintenance alongside. It holds ISO 9001, ISO 14001 and "
        "ISO 45001 certification, and its site teams are drawn largely from the armed forces. Read more in "
        "<a href=\"ex-servicemen-led-msme.html\">our ex-servicemen story</a>.",
        ("quote", "As a team comprised entirely of former military professionals, we bring a distinct approach to every challenge, "
                  "strategic planning, decisive action, and an unwavering commitment to excellence.",
         "Lt. Gen. A.R. Prasad (Retd), <a href=\"leadership.html\">Message from the Leadership</a>"),
        ("h3", "Plants built under his leadership"),
        "Some of the solar plants Arrays Ingenieria has delivered with him at its head:",
        ("ul", [
            "<a href=\"project-koomber-tea-estate-595kwp-solar-cm-inauguration.html\">595 kWp at Koomber Tea Estate, Cachar, Assam</a>, "
            "for the Goodricke Group, inaugurated by the Chief Minister of Assam, Dr Himanta Biswa Sarma, on 1 October 2026.",
            "<a href=\"project-jayshree-tea-1mw-solar-assam.html\">1035 kWp at Towkok and Manjushree Tea Estates</a> for Jay Shree Tea "
            "&amp; Industries (BK Birla Group), inaugurated on 20 May 2025.",
            "<a href=\"project-dewan-group-tea-estates-1940kwp-solar-assam.html\">1940 kWp across the Dewan, Burtoll and Labac Tea "
            "Estates</a> of the Dewan Group, commissioned on 8 January 2026.",
            "<a href=\"project-super-smelters-1980kwp-rooftop-solar.html\">1980.3 kWp of rooftop solar at Super Smelters, Jamuria, West "
            "Bengal</a>, inaugurated with him among the guests.",
            "Plants at <a href=\"project-harmutty-tea-estate-400kwp-solar.html\">Harmutty</a>, "
            "<a href=\"project-orangajuli-tea-estate-450kw-solar.html\">Orangajuli</a> and "
            "<a href=\"project-barpatra-tea-estate-230kw-solar.html\">Borpatra</a> tea estates, and industrial and utility-scale work "
            "for Tata Power and others. See <a href=\"projects.html\">all projects</a>.",
        ]),
        ("fig", "assets/koomber/arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-welcome-banner-lt-gen-ar-prasad.jpg",
         "Welcome banner at the Koomber Tea Estate solar plant inauguration naming Lt. Gen. A.R. Prasad (Retd)",
         "The welcome banner at the Koomber Tea Estate solar inauguration, 1 October 2026."),
    ]),
    dict(h="In the words of others", blocks=[
        "Clients and public representatives have singled out his leadership:",
        ("quote", "Our sincere thanks to Lieutenant General Ashish Ranjan Prasad (Retd) and the team at Arrays Ingenieria for their "
                  "partnership in bringing this vision to life.",
         "Jay Shree Tea &amp; Industries Ltd., 22 May 2025, <a href=\"recognition.html#jayshree-towkok\">see the post</a>"),
        ("quote", "Glad to see Arrays Ingenieria, an MSME spearheaded by ex-servicemen under Lt Gen AR Prasad (Retd), deliver critical "
                  "renewable infrastructure with uncompromising military discipline.",
         "Shri Kaushik Rai, MLA, Lakhipur, 1 October 2026, <a href=\"https://x.com/iKaushikRai/status/2105642116089008488\" target=\"_blank\" rel=\"noopener\">see the post</a>"),
        ("quote", "It is particularly encouraging to witness Arrays Ingenieria, an MSME led by ex-servicemen under the stewardship of "
                  "Lt. Gen. A.R. Prasad (Retd.), translating its expertise, precision and institutional discipline into critical "
                  "renewable-energy infrastructure.",
         "Shri Rajdeep Goala, MLA, Udharbond, 1 October 2026, <a href=\"https://x.com/RajdeepGoala14/status/2105730931860574342\" target=\"_blank\" rel=\"noopener\">see the post</a>"),
    ]),
    dict(h="A voice on national television", blocks=[
        "Drawing on his years at the top of the Army's communications and technology arm, Lt. Gen. Prasad appears as a defence "
        "analyst on national news channels, including <b>India Today</b>, <b>Aaj Tak</b> and <b>India TV</b>, on border and "
        "national-security stories. See <a href=\"recognition.html#national-tv\">our founder on national TV</a>.",
        ("fig", "assets/press/arrays-ingenieria-lt-gen-ar-prasad-india-today-analysis.jpg",
         "Lt. Gen. A.R. Prasad (Retd) on India Today",
         "On India Today, giving expert analysis on the India-China faceoff."),
    ]),
    dict(h="Leadership philosophy", blocks=[
        "His message to clients and colleagues sets out how he leads the company: the values of military service applied to "
        "engineering.",
        ("quote", "Our identity is deeply rooted in innovation and guided by values that have been the cornerstone of our leadership, "
                  "discipline, integrity, and purpose.",
         "Lt. Gen. A.R. Prasad (Retd)"),
        ("quote", "As we continue to grow, our focus remains steadfast: to lead with purpose, innovate without boundaries, and "
                  "collaborate for impact.",
         "Lt. Gen. A.R. Prasad (Retd)"),
        ("ul", [
            "<b>Discipline on site.</b> Planned, briefed and safe work, the way a military operation is run.",
            "<b>Integrity.</b> Commitments kept to clients, partners and the people who work on site.",
            "<b>Purpose.</b> Clean energy as a second form of national service, and work for veterans after the uniform.",
        ]),
    ]),
    dict(h="Career timeline", blocks=[
        ("steps", [
            ("Education", "Studies at the Birla Institute of Technology (BIT), Mesra, Ranchi."),
            ("January 1981", "Joins the Indian Army, in the Corps of Signals."),
            ("As Major General", "Commands 23 Infantry Division, Ranchi."),
            ("26 January 2016", "Awarded the Vishisht Seva Medal (VSM)."),
            ("1 August 2016", "Promoted to Lieutenant General."),
            ("26 January 2017", "Awarded the Ati Vishisht Seva Medal (AVSM)."),
            ("March 2017", "As Signal Officer-in-Chief, addresses DEFCOM INDIA 2017 on the digital Army and smart battlefields."),
            ("31 July 2018", "Retires as Signal Officer-in-Chief and Senior Colonel Commandant, Corps of Signals."),
            ("2018", "Founds Arrays Ingenieria Pvt. Ltd. and leads it as CEO."),
            ("2025-2026", "Arrays Ingenieria delivers tea-estate solar plants across Assam, including the Koomber plant inaugurated by the Chief Minister."),
        ]),
    ]),
]

GALLERY = [
    ("assets/press/arrays-ingenieria-ceo-lt-gen-ar-prasad-with-pm-narendra-modi.jpg", "With Prime Minister Shri Narendra Modi"),
    ("assets/press/arrays-ingenieria-ceo-lt-gen-ar-prasad-with-defence-minister-rajnath-singh.jpg", "With Defence Minister Shri Rajnath Singh"),
    ("assets/press/arrays-ingenieria-ceo-lt-gen-ar-prasad-rashtrapati-bhavan.jpg", "Welcomed at Rashtrapati Bhavan"),
    ("assets/press/arrays-ingenieria-ceo-lt-gen-ar-prasad-armed-forces-ceremony.jpg", "At an armed-forces ceremony"),
    ("assets/press/arrays-ingenieria-ceo-lt-gen-ar-prasad-with-fellow-officers.jpg", "With fellow officers"),
    ("assets/press/arrays-ingenieria-ceo-lt-gen-ar-prasad-felicitated.jpg", "Felicitation and honours"),
]

FAQ = [
    ("Who is Lt. Gen. Ashish Ranjan Prasad?",
     "Lt. Gen. Ashish Ranjan Prasad (Retd), AVSM, VSM, ADC, Ph.D, is a retired Indian Army officer of the Corps of Signals who served "
     "as Signal Officer-in-Chief until 31 July 2018. He is the founder and Chief Executive Officer of Arrays Ingenieria Pvt. Ltd., an "
     "ex-servicemen-led solar EPC company."),
    ("What was Lt. Gen. A.R. Prasad's last appointment in the Army?",
     "Signal Officer-in-Chief and Senior Colonel Commandant of the Corps of Signals, the head of the Indian Army's communications and "
     "information-technology arm."),
    ("When did Lt. Gen. Prasad join and retire from the Indian Army?",
     "He joined the Indian Army in January 1981, was promoted to Lieutenant General on 1 August 2016, and retired on 31 July 2018."),
    ("Which awards has Lt. Gen. Ashish Ranjan Prasad received?",
     "The Ati Vishisht Seva Medal (AVSM, Republic Day 2017) and the Vishisht Seva Medal (VSM, Republic Day 2016). He also carries the "
     "post-nominal ADC, as an Honorary Aide-de-Camp to the President of India."),
    ("Where did Lt. Gen. Prasad study?",
     "At the Birla Institute of Technology (BIT), Mesra, Ranchi."),
    ("Which division did he command?",
     "23 Infantry Division at Ranchi, Jharkhand, as a Major General."),
    ("What is Lt. Gen. A.R. Prasad doing now?",
     "He leads Arrays Ingenieria Pvt. Ltd. (INGENIERIA), which he founded in 2018. The company builds and commissions solar power "
     "plants across India under the motto \"Olive Green to Go Green\"."),
    ("What does \"Olive Green to Go Green\" mean?",
     "Olive green is the colour of the Indian Army's uniform. The motto describes veterans moving from military service to building "
     "renewable-energy infrastructure, a second innings of national service."),
]

SOURCES = [
    ("Jharkhand State News: Major General Ashish Ranjan Prasad becomes Lt. General, 1 August 2016", J),
    ("Press Information Bureau via IndraStra: Increasing Infrastructure for Digital Army (DEFCOM INDIA 2017), 24 March 2017", PIB),
    ("National Defence Bureau: Lt Gen Ashish Ranjan Prasad laid out the outline of smart battlefields at DEFCOM INDIA 2017", YT),
    ("Republic Day 2017 list of honours and awards (Ati Vishisht Seva Medal)", AVSM),
    ("Republic Day 2016 list of distinguished service awards (Vishisht Seva Medal)", VSM),
    ("IANS via Business Standard: Army's Signals chief retires, 31 July 2018", IANS),
    ("Company records (MCA, via ZaubaCorp): Electronics Corporation of India Ltd., board of directors", ECIL),
    ("Company records (MCA, via ZaubaCorp): ITI Ltd., board of directors", ITI),
    ("The Sentinel: Assam: AIPL commissions 1 MW solar power plant at Jayshree Tea Estate, 22 May 2025", SENTINEL),
]

KEYWORDS = ["Lt Gen Ashish Ranjan Prasad", "Lt Gen AR Prasad", "Signal Officer-in-Chief", "Corps of Signals", "Arrays Ingenieria CEO",
            "ex-servicemen-led solar", "Olive Green to Go Green"]
