"""
Content data for the generated pages (case studies, FAQ, glossary, clients).
Imported by build.py. Keep every statement factual: each project fact below
comes from the client's purchase/work order, a certificate, or a news report.
Arrays Ingenieria does installation & commissioning (I&C), EPC and civil
works on a CAPEX basis; it does not manufacture modules or inverters and does
not offer OPEX/RESCO financing.
"""

# ------------------------------------------------------------ projects ----
# file: page name; photos: [(src, alt)]; docs: [(src, caption)];
# coverage: ids from COVERAGE in build.py; services: page file names.
PROJECTS = [
    dict(
        file="project-jayshree-tea-1mw-solar-assam.html",
        name="Jay Shree Tea: 1 MW Solar at Towkok & Manjushree Tea Estates",
        short="Jay Shree Tea, Assam · 1035 kWp",
        title="1 MW Solar, Jay Shree Tea Estates Assam | Arrays Ingenieria",
        desc="Case study: 1035 kWp ground-mount solar (535 kWp Towkok + 500 kWp Manjushree) for Jay Shree Tea, BK Birla Group, in Sonari, Assam, under Tata Power's EPC.",
        capacity="1035 kWp (535 + 500 kWp)", kind="Ground-mount, on-grid", location="Sonari, Charaideo district, Assam",
        client="Jay Shree Tea & Industries Ltd. (BK Birla Group)", partner="Tata Power Renewable Energy Ltd. (EPC contract)",
        role="Material supply, installation & commissioning", year="2025 (inaugurated 20 May 2025)",
        cat="ground", tag="Tea Estate · Ground-Mount",
        hero="assets/photos/arrays-ingenieria-jayshree-tea-estate-1mw-ground-mount-solar-sonari-assam.jpg",
        intro="Two ground-mount, grid-connected solar plants for Jay Shree Tea & Industries, part of the BK Birla Group: 535 kWp at "
              "Towkok Tea Estate and 500 kWp at Manjushree Tea Estate, together about 1 MW, in Sonari, Assam.",
        body=[
            "Jay Shree Tea placed the purchase order with Arrays Ingenieria on 2 December 2024 for the material supply, installation and "
            "commissioning of a 1035 kWp grid-connected solar power generation system across the two estates. The project was executed "
            "under Tata Power's EPC contract, with all materials to Tata Power-approved makes.",
            "Both estates run on grid power backed by diesel generators, so the scope included synchronising each plant with two DG sets "
            "per site, letting the estates use solar power alongside their generators.",
            "The plants were inaugurated on 20 May 2025. It was the first renewable-energy project in Jay Shree Tea's 80-year history, "
            "and was reported by The Sentinel and announced by Jay Shree Tea on Instagram, Facebook and LinkedIn.",
        ],
        scope=["AC LT power cabling (1.1 kV, armoured XLPE)", "Cable trays and conduits with supporting structures",
               "Lightning arrestors", "Chemical earthing system with all associated civil work",
               "Module cleaning system (HDPE pipe network)", "Safety equipment to Tata Power standards",
               "Synchronisation with two DG sets at each site", "Testing and commissioning"],
        photos=[("assets/photos/arrays-ingenieria-jayshree-tea-estate-1mw-ground-mount-solar-sonari-assam.jpg", "Jayshree Tea Estate ground-mount solar plant in Sonari, Assam, built by Arrays Ingenieria"),
                ("assets/photos/arrays-ingenieria-towkok-tea-estate-535kwp-ground-mount-solar-assam.jpg", "Towkok Tea Estate 535 kWp ground-mount solar plant, Assam, by Arrays Ingenieria"),
                ("assets/photos/arrays-ingenieria-manjushree-tea-estate-500kwp-ground-mount-solar-assam.jpg", "Manjushree Tea Estate 500 kWp ground-mount solar plant, Assam, by Arrays Ingenieria"),
                ("assets/photos/arrays-ingenieria-jay-shree-tea-1035kwp-grid-connected-solar.jpg", "1035 kWp grid-connected solar system for Jay Shree Tea, built by Arrays Ingenieria")],
        docs=[("assets/certs/arrays-ingenieria-jay-shree-tea-towkok-535kwp-certificate-of-appreciation.jpg", "Jay Shree Tea certificate of appreciation: 535 kWp, Towkok Tea Estate"),
              ("assets/certs/arrays-ingenieria-jay-shree-tea-500kwp-certificate-of-appreciation.jpg", "Jay Shree Tea certificate of appreciation: 500 kWp ground-mount solar")],
        coverage=["sentinel-jayshree", "jayshree-towkok"],
        services=["capex-solar-epc.html", "solar-installation-commissioning.html", "service-ground-mount.html", "solar-for-tea-estates.html"],
    ),
    dict(
        file="project-orangajuli-tea-estate-450kw-solar.html",
        name="Orangajuli Tea Estate: 450 kWp Ground-Mount Solar Plant",
        short="Orangajuli Tea Estate, Assam · 450 kWp",
        title="450 kWp Solar, Orangajuli Tea Estate | Arrays Ingenieria",
        desc="Case study: 450 kWp grid-connected ground-mount solar plant at Goodricke's Orangajuli Tea Estate, Udalguri, Assam, commissioned on Janmashtami 2026.",
        capacity="450 kWp", kind="Ground-mount, grid-connected", location="Orangajuli, Panerihaat, Udalguri district, Assam",
        client="Orangajuli Tea Estate (Goodricke Group)", partner="Tata Power Renewable Energy Ltd. & Sustvest (3.11 MW programme)",
        role="Installation partner", year="2026 (commissioned 4 September 2026)",
        cat="ground", tag="Tea Estate · Ground-Mount",
        hero="assets/photos/arrays-ingenieria-ex-servicemen-led-orangajuli-tea-estate-450kwp-solar-inauguration-ribbon.jpg",
        intro="A 450 kWp grid-connected ground-mount solar plant at Orangajuli Tea Estate, Panerihaat, in Udalguri, Assam, commissioned "
              "on Janmashtami, 4 September 2026, and inaugurated by the estate manager, Daljit Singh Maan.",
        body=[
            "The plant is part of a 3.11 MW solar programme for Goodricke Group's tea estates, developed jointly by Tata Power Renewable "
            "Energy Ltd. and Sustvest, with Arrays Ingenieria as the installation partner.",
            "With Orangajuli, Arrays Ingenieria reported that it had completed the installation and commissioning of solar plants at 18 "
            "tea gardens in Assam. The launch was reported by the Hindi daily Prerna Bharati and filmed by NE Reports.",
        ],
        scope=["Installation of the ground-mount solar plant", "Grid connection", "Testing and commissioning"],
        photos=[("assets/photos/arrays-ingenieria-ex-servicemen-led-orangajuli-tea-estate-450kwp-solar-inauguration-ribbon.jpg",
                 "Ribbon-cutting at the 450 kWp Orangajuli Tea Estate solar plant in Udalguri, Assam, built by Arrays Ingenieria"),
                ("assets/photos/arrays-ingenieria-ex-servicemen-led-orangajuli-tea-estate-450kwp-solar-inauguration-team.jpg",
                 "Inauguration of the 450 kWp ground-mounted on-grid solar plant at Orangajuli Tea Garden, Panerihaat, Udalguri, on Sri Krishna Janmashtami, 4 September 2026, with Arrays Ingenieria (ex-servicemen-led MSME), installation partner")],
        docs=[("assets/news/prerna-bharati-orangajuli-450kw-solar-ingenieria.jpg", "Prerna Bharati, 5 Sep 2026: report on the Orangajuli plant")],
        coverage=["ne-reports-orangajuli", "hub-network-orangajuli", "prerna-bharati-orangajuli"],
        services=["solar-installation-commissioning.html", "service-ground-mount.html", "solar-for-tea-estates.html"],
    ),
    dict(
        file="project-barpatra-tea-estate-230kw-solar.html",
        name="Borpatra (Barpatra) Tea Estate: 230 kWp On-Grid Solar Plant",
        short="Borpatra Tea Estate, Assam · 230 kWp",
        title="230 kWp Solar, Borpatra Tea Estate | Arrays Ingenieria",
        desc="Case study: 230 kWp on-grid ground-mount solar at Goodricke's Borpatra (Barpatra) Tea Estate, Sonari, Assam, with net-metering approvals from APDCL.",
        capacity="230 kWp", kind="Ground-mount, on-grid (net-metered)", location="Borhat, Sivasagar district, Assam",
        client="Borpatra Tea Garden, Stewart Holl (India) Ltd. (Goodricke Group)", partner="Tata Power Renewable Energy Ltd. & Sustvest (3.11 MW programme)",
        role="Turnkey implementation partner", year="2026 (commissioned September 2026)",
        cat="ground", tag="Tea Estate · Ground-Mount",
        hero="assets/borpatra/arrays-ingenieria-ex-servicemen-led-borpatra-tea-estate-230kwp-solar-inauguration-team.jpg",
        intro="A 230 kWp on-grid ground-mount solar plant at Goodricke Group's Borpatra (Barpatra) Tea Garden in Borhat, Sivasagar, Assam, formally "
              "inaugurated by the estate manager, Satish Pandey, on 25 September 2026.",
        body=[
            "The plant is part of the 3.11 MW commercial & industrial solar programme for Goodricke's estates, developed jointly by Tata "
            "Power Renewable Energy Ltd. and Sustvest, with Arrays Ingenieria as the turnkey implementation partner.",
            "Arrays Ingenieria obtained the net-metering and statutory approvals from Assam Power Distribution Company Ltd. (APDCL), "
            "including technical inspection by the Namrup SDE and the APDCL Dibrugarh TRD department, so the plant could start on schedule.",
            "Borpatra brought the company's count to 19 on-grid solar plants in Assam's tea gardens, as reported in the Hindi press on "
            "25 September 2026.",
            "Under its motto \"Olive Green to Go Green\", Arrays Ingenieria brings military-grade discipline and engineering precision "
            "to building critical clean-energy infrastructure. For its team of veterans, working in renewable energy is a \"second "
            "innings of national service\", contributing directly to sustainable nation-building.",
        ],
        impact=dict(
            heading="Driving the PM's Panchamrit and Assam's green-energy goals",
            paras=[
                "By cutting reliance on fossil fuels in the energy-intensive tea-processing sector, the Borpatra solar installation "
                "contributes to Prime Minister Narendra Modi's \"Panchamrit\" climate commitments, announced at COP26: 500 GW of "
                "non-fossil capacity and half of India's energy needs from renewables by 2030, and net zero by 2070.",
                "It also advances Assam Chief Minister Dr Himanta Biswa Sarma's target of 6,000 MW of installed green-energy capacity "
                "by 2030. The project shows that sustainable innovation and clean energy can drive the next chapter of Assam's "
                "economic growth story.",
            ],
            sources=[("PM's national statement at COP26, PIB, 1 Nov 2021", "https://pib.gov.in/PressReleasePage.aspx?PRID=1768712"),
                     ("Himanta Biswa Sarma, Rewriting Assam's Energy Future, 22 Sep 2026", "https://himantabiswa.substack.com/p/rewriting-assams-energy-future")],
        ),
        scope=["Turnkey implementation of the ground-mount plant", "Net-metering and statutory approvals with APDCL",
               "Grid connection", "Testing and commissioning"],
        photos=[],  # filled from BORPATRA_ALBUM below
        docs=[("assets/certs/goodricke-appreciation-borpatra-230kwp-arrays-ingenieria.jpg", "Goodricke certificate of appreciation: installation & commissioning of the 230 kWp plant at Borpatra Tea Garden"),
              ("assets/news/northeast-chronicle-borpatra-230kwp-solar-arrays-ingenieria.jpg", "Northeast Chronicle, 27 Sep 2026"),
              ("assets/news/dainik-purvoday-borpatra-230kw-solar-arrays-ingenieria.jpg", "Dainik Purvoday, 26 Sep 2026"),
              ("assets/news/prerna-bharati-borpatra-230kw-solar-arrays-ingenieria.jpg", "Prerna Bharati, 26 Sep 2026"),
              ("assets/news/purvanchal-prahari-borpatra-230kw-solar-arrays-ingenieria.jpg", "Purvanchal Prahari, 26 Sep 2026"),
              ("assets/news/swarajati-borpatra-230kwp-solar-arrays-ingenieria.jpg", "Swarajati, 27 Sep 2026"),
              ("assets/news/dainik-janambhumi-borpatra-solar-arrays-ingenieria.jpg", "Dainik Janambhumi, 27 Sep 2026"),
              ("assets/news/janambhumi-borpatra-230kw-solar-arrays-ingenieria.jpg", "Janambhumi (online), 26 Sep 2026"),
              ("assets/news/niyamiya-barta-borpatra-solar-arrays-ingenieria.jpg", "Niyomiya Barta, 27 Sep 2026"),
              ("assets/news/arrays-ingenieria-borpatra-230kwp-tata-power-media-monitor.jpg", "Listed in Tata Power / TPREL media monitoring, 27 Sep 2026")],
        coverage=["northeast-chronicle-borpatra", "barpatra-230kw", "prerna-bharati-borpatra", "purvanchal-prahari-borpatra", "swarajati-borpatra", "dainik-janambhumi-borpatra", "niyomiya-barta-borpatra", "janambhumi-online-borpatra", "sonari-live", "news-axom"],
        services=["solar-installation-commissioning.html", "service-epc.html", "solar-for-tea-estates.html"],
    ),
    dict(
        file="project-super-smelters-1980kwp-rooftop-solar.html",
        name="Super Smelters: 1980.3 kWp Rooftop Solar Plant",
        short="Super Smelters, West Bengal · 1980.3 kWp",
        title="1980.3 kWp Rooftop Solar, Super Smelters | Arrays Ingenieria",
        desc="Case study: a 1980.3 kWp industrial rooftop solar plant at Super Smelters Ltd., Jamuria, West Bengal, built by Arrays Ingenieria with Tata Power Solar.",
        capacity="1980.3 kWp (about 2 MW)", kind="Industrial rooftop", location="Jamuria (Asansol), West Bengal",
        client="Super Smelters Ltd.", partner="Tata Power Solar",
        role="Implementation partner", year="Commissioned and inaugurated",
        cat="rooftop", tag="Industrial · Rooftop",
        hero="assets/photos/arrays-ingenieria-super-smelters-1980kwp-solar-plant-asansol.jpg",
        intro="A 1980.3 kWp rooftop solar power plant, about 2 MW, on the open roofs of Super Smelters Ltd., described by the local "
              "press as the largest industrial unit in the Jamuria industrial area of West Bengal.",
        body=[
            "The plant was built in collaboration with Tata Power Solar, with Arrays Ingenieria as implementation partner. It was "
            "inaugurated by Super Smelters' director, Sanjay Singhania, with Lt. Gen. Ashish Ranjan Prasad (Retd) of Arrays Ingenieria present.",
            "Super Smelters issued Arrays Ingenieria a letter of appreciation for the project, and the inauguration was covered by Sanmarg "
            "and other Hindi dailies.",
        ],
        scope=["Rooftop solar installation", "Electrical works", "Testing and commissioning"],
        photos=[("assets/photos/arrays-ingenieria-super-smelters-1980kwp-solar-plant-asansol.jpg", "Super Smelters 1980.3 kWp rooftop solar plant in West Bengal, built by Arrays Ingenieria with Tata Power Solar"),
                ("assets/press/arrays-ingenieria-super-smelters-1980kwp-solar-inauguration-tata-power-solar.jpg", "Inauguration of the 1980.3 kWp Super Smelters solar plant, Arrays Ingenieria"),
                ("assets/photos/arrays-ingenieria-industrial-rooftop-solar-array.jpg", "Large industrial rooftop solar array installed by Arrays Ingenieria")],
        docs=[("assets/certs/arrays-ingenieria-super-smelters-certificate-of-appreciation.jpg", "Super Smelters Ltd. letter of appreciation, 1980.3 kWp solar plant")],
        coverage=["sanmarg-supersmelters", "supersmelters-rooftop"],
        services=["service-rooftop.html", "solar-installation-commissioning.html", "service-epc.html"],
    ),
    dict(
        file="project-seci-300mw-koppal-pile-foundation.html",
        name="SECI 300 MW Solar Park, Koppal: Pile Foundation Works",
        short="SECI 300 MW, Karnataka · piling",
        title="SECI 300 MW Koppal Solar Pile Foundation | Arrays Ingenieria",
        desc="Case study: construction of pile foundations for the 300 MW SECI solar project at Koppal, Karnataka, under an outline agreement with Tata Power (TPREL).",
        capacity="300 MW solar project", kind="Utility-scale, pile foundations", location="Koppal, Karnataka",
        client="Tata Power Renewable Energy Ltd. (TPREL)", partner="SECI project",
        role="Pile foundation contractor", year="2025 (agreement dated 17 February 2025)",
        cat="civil", tag="Utility-Scale · Piling",
        hero="assets/photos/arrays-ingenieria-seci-300mw-koppal-karnataka-solar-pile-foundation.jpg",
        intro="Construction of pile foundations for the 300 MW SECI solar project at Koppal, Karnataka, one of the largest "
              "utility-scale jobs in the company's portfolio.",
        body=[
            "Tata Power Renewable Energy Ltd. (TPREL) issued Arrays Ingenieria an outline agreement on 17 February 2025 for the "
            "construction of pile foundation work at the 300 MW SECI project.",
            "Pile foundations carry the module mounting structures of a ground-mount plant, so their depth, alignment and "
            "levels decide how the rest of the plant goes up. Arrays Ingenieria's veteran-led site teams run piling to the EPC's "
            "specifications and schedule.",
        ],
        scope=["Construction of pile foundations for the module mounting structures", "Work to Tata Power specifications and schedule"],
        photos=[("assets/photos/arrays-ingenieria-seci-300mw-koppal-karnataka-solar-pile-foundation.jpg", "SECI 300 MW solar park pile-foundation works at Koppal, Karnataka, by Arrays Ingenieria")],
        docs=[],
        coverage=[],
        services=["service-piling.html", "service-civil.html", "solar-installation-commissioning.html"],
    ),
    dict(
        file="project-dcm-hisar-10mw-solar-civil-works.html",
        name="DCM Textile, Hisar: Civil Works for a 10 MW Solar Plant",
        short="DCM Hisar, Haryana · 10 MW civil",
        title="10 MW Solar Civil Works, DCM Hisar | Arrays Ingenieria",
        desc="Case study: civil works by Arrays Ingenieria for the 9979 kWp (10 MW) solar plant at DCM Textile, Hisar, Haryana, under a Tata Power work order.",
        capacity="9979 kWp (10 MW)", kind="Ground-mount, civil works", location="Hisar, Haryana",
        client="Tata Power", partner="DCM Textile (plant owner)",
        role="Civil works contractor", year="2021 (work order dated 18 June 2021)",
        cat="civil", tag="Industrial · Civil Works",
        hero="assets/photos/arrays-ingenieria-dcm-hisar-10mw-ground-mount-solar-civil-works.jpg",
        intro="Civil works for a 9979 kWp (10 MW) ground-mount solar plant at DCM Textile in Hisar, Haryana.",
        body=[
            "Tata Power issued Arrays Ingenieria the work order on 18 June 2021 for civil works at the 9979 kWp plant. Tata Power "
            "has since engaged the company for piling, civil works and installation on projects across India.",
        ],
        scope=["Civil works for the 10 MW ground-mount plant", "Work to Tata Power specifications"],
        photos=[("assets/photos/arrays-ingenieria-dcm-hisar-10mw-ground-mount-solar-civil-works.jpg", "DCM Hisar 10 MW ground-mount solar project civil works, Haryana, by Arrays Ingenieria")],
        docs=[],
        coverage=[],
        services=["service-civil.html", "service-ground-mount.html"],
    ),
    dict(
        file="project-tata-motors-jamshedpur-5-5mw-solar-piling.html",
        name="Tata Motors, Jamshedpur: Piling & Civil Works for 5.5 MW Solar",
        short="Tata Motors, Jamshedpur · 5.5 MW",
        title="5.5 MW Solar Piling, Tata Motors | Arrays Ingenieria",
        desc="Case study: piling and civil works, including a pre-cast boundary wall, for the 5.5 MW solar plant at Tata Motors, Jamshedpur, for Tata Power.",
        capacity="5.5 MW", kind="Ground-mount, piling & civil", location="Jamshedpur, Jharkhand",
        client="Tata Power", partner="Tata Motors (plant owner)",
        role="Piling & civil works contractor", year="2023 (work order dated 27 July 2023)",
        cat="civil", tag="Industrial · Piling & Civil",
        hero="assets/photos/arrays-ingenieria-tata-motors-jamshedpur-5-5mw-solar-piling.jpg",
        intro="Piling and civil works for the 5.5 MW solar plant at Tata Motors in Jamshedpur, Jharkhand.",
        body=[
            "Tata Power issued Arrays Ingenieria the work order on 27 July 2023 for piling and civil work for the 5.5 MW plant at Tata "
            "Motors, Jamshedpur. The scope included a pre-cast boundary wall around the plant.",
        ],
        scope=["Pile foundations for the module mounting structures", "Civil works", "Pre-cast boundary wall"],
        photos=[("assets/photos/arrays-ingenieria-tata-motors-jamshedpur-5-5mw-solar-piling.jpg", "Tata Motors 5.5 MW solar piling and civil works in Jamshedpur by Arrays Ingenieria"),
                ("assets/photos/arrays-ingenieria-tata-motors-jamshedpur-precast-boundary-wall.jpg", "Pre-cast boundary wall for the Tata Motors solar plant, Jamshedpur, by Arrays Ingenieria")],
        docs=[],
        coverage=[],
        services=["service-piling.html", "service-civil.html"],
    ),
    dict(
        file="project-yiapl-14-36mw-solar-civil-fencing.html",
        name="YIAPL: 14.36 MW Solar Project, Supply, Civil Works & Fencing",
        short="YIAPL, Uttar Pradesh · 14.36 MW",
        title="14.36 MW Solar Civil Works & Fencing, UP | Arrays Ingenieria",
        desc="Case study: supply, civil works and chain-link fencing by Arrays Ingenieria for the 14.36 MW YIAPL solar power project in Uttar Pradesh, India.",
        capacity="14.36 MW", kind="Ground-mount, civil & fencing", location="Uttar Pradesh",
        client="YIAPL", partner="",
        role="Supply, civil works & fencing", year="",
        cat="civil", tag="Utility-Scale · Civil & Fencing",
        hero="assets/photos/arrays-ingenieria-yiapl-14-36mw-solar-civil-works-fencing-uttar-pradesh.jpg",
        intro="Supply, civil works and chain-link fencing for the 14.36 MW YIAPL solar power project in Uttar Pradesh.",
        body=[
            "A plant of this size needs its perimeter secured and its civil works finished before installation crews can move in. "
            "Arrays Ingenieria delivered the supply, civil work and chain-link fencing for the site.",
        ],
        scope=["Supply of materials", "Civil works", "Chain-link perimeter fencing"],
        photos=[("assets/photos/arrays-ingenieria-yiapl-14-36mw-solar-civil-works-fencing-uttar-pradesh.jpg", "YIAPL 14.36 MW solar power project civil works and fencing in Uttar Pradesh by Arrays Ingenieria")],
        docs=[],
        coverage=[],
        services=["service-civil.html", "service-ground-mount.html"],
    ),
    dict(
        file="project-tcpl-vaishali-319kwp-rooftop-solar.html",
        name="TCPL Greenery Agro, Vaishali: 319 kWp Rooftop Solar",
        short="TCPL, Bihar · 319 kWp rooftop",
        title="319 kWp Rooftop Solar, TCPL Vaishali | Arrays Ingenieria",
        desc="Case study: 319 kWp rooftop solar plant for TCPL Greenery Agro (Tata Consumer Products) at Bhagwanpur, Vaishali, Bihar, reported by Dainik Bhaskar.",
        capacity="319 kWp", kind="Rooftop, grid-connected", location="Bhagwanpur, Vaishali district, Bihar",
        client="TCPL Greenery Agro (Tata Consumer Products)", partner="",
        role="Plant construction", year="2024",
        cat="rooftop", tag="Industrial · Rooftop",
        hero="assets/photos/arrays-ingenieria-rooftop-solar-installation-clean-power.jpg",
        hero_alt="Rooftop solar installation by Arrays Ingenieria",
        intro="A 319 kWp rooftop solar plant for TCPL Greenery Agro, a Tata Consumer Products unit, at Bhagwanpur in Vaishali "
              "district, Bihar.",
        body=[
            "Dainik Bhaskar's Hajipur edition reported the plant on 3 April 2024 under the headline \"भगवानपुर में सोलर पावर ग्रिड से "
            "319 किलोवाट बिजली का होगा उत्पादन\" (Bhagwanpur solar plant to generate 319 kW of power), including Arrays Ingenieria's "
            "work on the plant.",
            "Bihar is home ground for the company: its branch office is in Madhubani.",
        ],
        scope=["Rooftop solar plant construction", "Grid connection"],
        photos=[("assets/news/arrays-ingenieria-tcpl-vaishali-319kwp-rooftop-solar-dainik-bhaskar.jpg", "Dainik Bhaskar report on the 319 kWp rooftop solar plant by Arrays Ingenieria in Vaishali, Bihar")],
        docs=[],
        coverage=["bhaskar-tcpl"],
        services=["service-rooftop.html", "service-epc.html"],
    ),
    dict(
        file="project-assam-1711kwp-on-grid-solar.html",
        name="1711.66 kWp On-Grid Solar PV Project, Assam",
        short="Assam · 1711.66 kWp on-grid",
        title="1711.66 kWp On-Grid Solar Project, Assam | Arrays Ingenieria",
        desc="Case study: supply of components and installation & commissioning of a 1711.66 kWp on-grid solar PV project in Assam for Sustvest (SolarGridX Ventures).",
        capacity="1711.66 kWp", kind="On-grid solar PV", location="Assam",
        client="SolarGridX Ventures Pvt. Ltd. (Sustvest)", partner="",
        role="Supply of components, installation & commissioning", year="2026 (purchase order dated 25 March 2026)",
        cat="rooftop", tag="On-Grid · I&C",
        hero="assets/photos/arrays-ingenieria-assam-1711kwp-on-grid-rooftop-solar.jpg",
        intro="Supply of components and installation & commissioning of a 1711.66 kWp on-grid solar PV project in Assam.",
        body=[
            "SolarGridX Ventures Pvt. Ltd., which trades as Sustvest, appointed Arrays Ingenieria as contractor by a purchase order "
            "dated 25 March 2026, for the supply of components and the installation and commissioning of the project.",
            "It is a clear example of the company's installation & commissioning (I&C) work for solar developers: the developer "
            "finances and owns the project, and Arrays Ingenieria's veteran-led crews build and commission it.",
        ],
        scope=["Supply of components (as per the contract annexure)", "Installation", "Commissioning"],
        photos=[("assets/photos/arrays-ingenieria-assam-1711kwp-on-grid-rooftop-solar.jpg", "1711.66 kWp on-grid solar PV project in Assam by Arrays Ingenieria")],
        docs=[],
        coverage=[],
        services=["solar-installation-commissioning.html", "service-epc.html"],
    ),
]

# ----------------------------------------------------------------- FAQ ----
FAQ = [
    ("What does Arrays Ingenieria do?",
     "Arrays Ingenieria is a veteran-led solar contractor. We do three things: installation & commissioning (I&C) of solar plants, "
     "complete EPC (engineering, procurement and construction), and all the civil works a plant needs, from pile foundations to "
     "boundary walls and fencing. We work on the CAPEX model, so the plant belongs to our client."),
    ("Do you manufacture solar panels or inverters?",
     "No. We are an installation, EPC and civil company, not a manufacturer. We source Tier-1 modules, inverters and balance-of-system "
     "equipment from established manufacturers, or use the makes approved by our client or the lead EPC, such as Tata Power-approved makes."),
    ("What is the CAPEX model for solar?",
     "Under CAPEX you pay for the plant and own it from day one. We design, supply and build it; every unit it generates is yours, "
     "and there is no long-term power purchase agreement. Businesses that own the plant may also claim accelerated depreciation "
     "under the Income Tax Act; check the current rate with your tax adviser."),
    ("Do you offer OPEX, RESCO or zero-investment solar?",
     "No, we do not finance or own plants. If your organisation prefers an OPEX or RESCO arrangement, the developer that finances "
     "the plant can engage us as its installation and EPC partner, as Tata Power Renewable Energy and Sustvest have done for tea "
     "estates in Assam."),
    ("What is the difference between CAPEX and OPEX solar?",
     "With CAPEX you invest upfront, own the plant and keep all the savings. With OPEX or RESCO a developer invests and owns the plant, "
     "and you buy its power at an agreed tariff for many years. CAPEX usually gives the highest lifetime savings; OPEX avoids the upfront cost."),
    ("What does solar installation & commissioning (I&C) include?",
     "I&C covers everything on site after the design and equipment are fixed: mounting structures, module installation, DC and AC "
     "cabling, inverters and distribution boards, earthing and lightning protection, testing, grid synchronisation and commissioning."),
    ("Do you work as a subcontractor for EPC companies and developers?",
     "Yes, it is a large part of our work. Tata Power has engaged us for pile foundations on the 300 MW SECI project at Koppal, civil "
     "works on the 10 MW DCM Textile plant in Hisar and piling and civil works for the 5.5 MW Tata Motors plant in Jamshedpur, and "
     "Sustvest for the installation and commissioning of 1711.66 kWp in Assam."),
    ("What civil works do you carry out for solar plants?",
     "Pile foundations for module mounting structures, RCC works, pre-cast boundary walls, chain-link fencing, earthing with its "
     "civil work, and cable trays and conduits with their supports."),
    ("Can a solar plant work alongside our diesel generators?",
     "Yes. At Jay Shree Tea's Towkok and Manjushree estates the scope included synchronising each solar plant with two DG sets, so "
     "the estates can run solar and generators together."),
    ("Do you handle net-metering and DISCOM approvals?",
     "Yes. At Borpatra Tea Estate in Assam we obtained the net-metering and statutory approvals from APDCL, including its technical "
     "inspections, so the plant could start on schedule."),
    ("How many tea-estate solar plants have you built?",
     "As reported in September 2026, Arrays Ingenieria has installed 19 on-grid solar plants in Assam's tea gardens, for estates "
     "including those of Jay Shree Tea (BK Birla Group) and Goodricke Group."),
    ("Where in India do you work?",
     "Across India. Our projects span Assam, West Bengal, Bihar, Jharkhand, Uttar Pradesh, Uttarakhand, Haryana and Karnataka. Our "
     "corporate office is in Greater Noida, Uttar Pradesh, with a branch office in Madhubani, Bihar."),
    ("Who runs Arrays Ingenieria?",
     "The company was founded in 2018 by Lt. Gen. Ashish Ranjan Prasad (Retd), AVSM, VSM, ADC, former Signal Officer-in-Chief of the "
     "Indian Army, and is run by ex-servicemen who bring military discipline, safety and timeliness to every site."),
    ("Which certifications do you hold?",
     "We are ISO 9001:2015 (quality), ISO 14001:2015 (environment) and ISO 45001:2018 (occupational health & safety) certified, and "
     "a registered MSME (Udyam UDYAM-DL-03-0023905)."),
    ("How do I get a quote?",
     "Send us your site location, the type of plant (rooftop or ground-mount), the approximate capacity or your monthly electricity "
     "bill, and whether you need full EPC, I&C only or civil works only. Use the contact form or email arraysingenieria@gmail.com."),
]

# ------------------------------------------------------------ glossary ----
GLOSSARY = [
    ("ACDB / DCDB", "AC and DC distribution boards: the enclosures that house the fuses, isolators and surge protection between the modules, the inverters and the grid connection."),
    ("Accelerated depreciation", "A tax benefit that lets a business that owns a solar plant write off its cost faster than normal assets, reducing taxable income in the early years. Available under the CAPEX model."),
    ("ALMM", "Approved List of Models and Manufacturers: the list of solar modules approved by India's Ministry of New and Renewable Energy (MNRE) for use in government-linked projects."),
    ("Balance of system (BOS)", "Everything in a solar plant except the modules: mounting structures, inverters, cables, distribution boards, earthing, lightning protection and monitoring."),
    ("Bifacial module", "A solar module that generates power from both sides, using light reflected from the ground onto its rear face."),
    ("CAPEX model", "The owner pays for the solar plant upfront and owns it outright, keeping all the savings. Arrays Ingenieria builds plants on this model."),
    ("Commissioning", "The final stage of a project: testing every component, synchronising the plant with the grid and handing it over as ready to generate."),
    ("CUF (capacity utilisation factor)", "The energy a plant actually generates in a year as a percentage of what it would generate running at full capacity all year."),
    ("DCR (domestic content requirement)", "A rule in some government schemes that modules and cells must be made in India."),
    ("DG synchronisation", "Controls that let a solar plant run alongside diesel generators safely, reducing fuel use without back-feeding the generators."),
    ("Earthing", "Connecting the plant's metal structures and electrical equipment to the ground so that fault currents and lightning are carried safely away."),
    ("EPC", "Engineering, procurement and construction: a single contract covering the design, equipment purchase and building of the whole plant."),
    ("Grid-connected (on-grid) system", "A solar plant connected to the utility grid, which can draw from or export to the grid; the most common type for businesses."),
    ("Ground-mount solar", "Modules installed on structures fixed to the ground, typically on pile foundations; used for tea estates, industrial land and utility parks."),
    ("Group captive", "An arrangement where consumers take an ownership stake in an off-site solar plant and draw its power under captive-generation rules."),
    ("I&C (installation & commissioning)", "The on-site work of building a solar plant to an agreed design and bringing it into operation: structures, modules, cabling, inverters, earthing, testing and commissioning."),
    ("Inverter", "The equipment that converts the direct current (DC) from the modules into alternating current (AC) for use on site or export to the grid."),
    ("kWp / MWp", "Kilowatt-peak and megawatt-peak: the rated DC output of a solar plant under standard test conditions. 1 MWp = 1,000 kWp."),
    ("Lightning arrestor", "A device that intercepts lightning strikes and conducts them safely to earth, protecting modules and equipment."),
    ("Module cleaning system", "A pipe network with taps or nozzles across the plant so that modules can be washed regularly, recovering output lost to dust (soiling)."),
    ("MMS (module mounting structure)", "The steel or aluminium frame that holds the modules at the designed tilt and orientation."),
    ("Net metering", "A billing arrangement where the power a solar plant exports to the grid is offset against the power drawn from it."),
    ("OPEX / RESCO model", "A developer (a renewable energy service company) finances and owns the plant, and the site owner buys its power at an agreed tariff. Arrays Ingenieria works as I&C or EPC partner to such developers."),
    ("Performance ratio (PR)", "Actual energy generated divided by the theoretical energy available from the sunlight; a measure of how well a plant is built and maintained."),
    ("Pile foundation", "A steel or concrete pile driven or cast into the ground to anchor the module mounting structures of a ground-mount plant."),
    ("PM Surya Ghar: Muft Bijli Yojana", "The central government scheme that subsidises rooftop solar for homes."),
    ("Rooftop solar", "Modules installed on a building's RCC or metal-sheet roof, turning unused roof space into a power source."),
    ("SCADA / remote monitoring", "Systems that record a plant's generation and faults in real time and make them visible remotely."),
    ("Tier-1 module", "A module from a large, bankable manufacturer with an established production and financing track record."),
    ("TOPCon", "Tunnel oxide passivated contact: a high-efficiency solar cell technology now common in new modules."),
]

# ------------------------------------------------------------- clients ----
# name, relationship, what we did, project files
CLIENTS = [
    ("Tata Power Renewable Energy Ltd. / Tata Power Solar Systems Ltd.", "EPC partner",
     "Our longest-running client, since 2021: installation & commissioning, BOS works, piling, "
     "civil works, module cleaning systems and CEIG approvals, on rooftop and ground-mount plants from Assam to Odisha, Haryana and Uttar Pradesh.",
     ["project-super-smelters-1980kwp-rooftop-solar.html", "project-amalgamated-plantations-assam-tea-estates-solar.html",
      "project-tata-motors-jamshedpur-5-5mw-solar-piling.html", "project-dcm-hisar-10mw-solar-civil-works.html"]),
    ("Jay Shree Tea & Industries Ltd. (BK Birla Group)", "Client",
     "1035 kWp across Towkok and Manjushree Tea Estates, and solar plants at the Dewan, Labac and Burtoll gardens of the Dewan Group of Tea Estates.",
     ["project-jayshree-tea-1mw-solar-assam.html"]),
    ("Goodricke Group", "Plant owner",
     "Solar plants at Koomber (595 kWp, inaugurated by the Chief Minister of Assam), Orangajuli (450 kWp) and Barpatra (230 kWp) Tea Estates under the 3.11 MW programme with Tata Power Renewable Energy and Sustvest, and the 400 kWp plant at Harmutty Tea Estate, North Lakhimpur; Goodricke has issued certificates of appreciation for Koomber, Borpatra and Harmutty.",
     ["project-koomber-tea-estate-595kwp-solar-cm-inauguration.html", "project-orangajuli-tea-estate-450kw-solar.html", "project-barpatra-tea-estate-230kw-solar.html", "project-harmutty-tea-estate-400kwp-solar.html"]),
    ("Sustvest (SolarGridX Ventures Pvt. Ltd.)", "Developer partner",
     "Supply of components and installation & commissioning of a 1711.66 kWp on-grid project in Assam, and the Goodricke tea-estate programme.",
     ["project-assam-1711kwp-on-grid-solar.html"]),
    ("Super Smelters Ltd.", "Client", "A 1980.3 kWp industrial rooftop plant at Jamuria, West Bengal, with Tata Power Solar.",
     ["project-super-smelters-1980kwp-rooftop-solar.html"]),
    ("Tata Motors", "Plant owner", "Piling, civil works and a pre-cast boundary wall at Jamshedpur, and a solar carport at Pantnagar.",
     ["project-tata-motors-jamshedpur-5-5mw-solar-piling.html"]),
    ("Tata Consumer Products (TCPL Greenery Agro)", "Client", "A 319 kWp rooftop plant at Bhagwanpur, Vaishali, Bihar.",
     ["project-tcpl-vaishali-319kwp-rooftop-solar.html"]),
    ("DCM Textile", "Plant owner", "Civil works for a 9979 kWp (10 MW) plant at Hisar, Haryana.",
     ["project-dcm-hisar-10mw-solar-civil-works.html"]),
    ("SECI", "Project", "Pile foundations on the 300 MW SECI solar project at Koppal, Karnataka, for Tata Power.",
     ["project-seci-300mw-koppal-pile-foundation.html"]),
    ("Bharat Petroleum", "Client", "An RCC rooftop on-grid solar plant, recognised with a certificate of appreciation.", []),
    ("Tata Steel", "Plant owner", "A solar project at Noamundi, and ballast lifting hooks and module cleaning for the floating solar plant at Jamshedpur.", []),
    ("Amalgamated Plantations (APPL)", "Plant owner", "Piling, BOS works and installation & commissioning of ground-mount plants at tea estates across Assam, about 5 MW, 2022-2026.",
     ["project-amalgamated-plantations-assam-tea-estates-solar.html"]),
    ("Rossell India Ltd.", "Plant owner", "Ground-mount plants at the Kharikatia, Nagrijuli, Romai and Dikom tea estates in Assam, piled, installed and commissioned by us.",
     ["project-rossell-india-assam-tea-estates-solar.html"]),
    ("Balaji Action Buildwell", "Plant owner", "Installation & commissioning of a sheet-roof plant, BOS, ground-mount civil works and CEIG approvals at Sitarganj, Uttarakhand.",
     ["project-balaji-action-sitarganj-4mwp-solar.html"]),
    ("SRMB Steel", "Plant owner", "Rooftop I&C and BOS works for three phases at Durgapur, West Bengal: 1895.4 kWp, 1060 kWp and 1.69 MWp.",
     ["project-srmb-steel-durgapur-rooftop-solar.html"]),
    ("Apar Industries", "Plant owner", "Installation & commissioning, skylight safety mesh and CEIG approval for a 1.2 MWp sheet-roof plant at Jharsuguda, Odisha.",
     ["project-apar-industries-jharsuguda-1-2mwp-rooftop-solar.html"]),
    ("Tata Croma, RSPL and A K Automatics", "Plant owners", "Rooftop installation & commissioning: 500 kWp at Gurugram, 417 kWp at Roorkee and 531 kWp at Rohtak, 2024-2025.", []),
    ("Pernod Ricard India", "Plant owner", "Piling, installation & commissioning and CEIG approval for a 250 kW ground-mount plant at Behror, Rajasthan.", []),
    ("YIAPL (Noida International Airport)", "Plant owner", "Pile foundations and chain-link fencing for the 14.36 MW solar project at Noida International Airport.",
     ["project-yiapl-14-36mw-solar-civil-fencing.html"]),
]

# -------------------------------------------------------- leader quotes ----
# Verbatim public statements, each with its official source. Shown as the
# national context for our work; they are not endorsements of the company.
# reported=True: PIB reported the words in indirect speech, so the page says so.
# Photos: official portraits from Wikimedia Commons under the Government Open Data
# License - India (GODL-India), which requires this attribution and forbids implying
# that the government endorses our use.
LEADER_QUOTES = [
    dict(id="pm", photo="assets/leaders/narendra-modi.jpg", photo_alt="Official portrait of Prime Minister Narendra Modi", photo_credit="Prime Minister's Office",
         photo_url="https://commons.wikimedia.org/wiki/File:Narendra_Modi_Portrait_2026.jpg", who="Shri Narendra Modi", role="Prime Minister of India", mono="PM",
         quote="In order to further sustainable development and people's wellbeing, we are launching the PM Surya Ghar: Muft Bijli "
               "Yojana. This project, with an investment of over Rs. 75,000 crores, aims to light up 1 crore households by providing "
               "up to 300 units of free electricity every month.",
         context="Launching PM Surya Ghar: Muft Bijli Yojana", date="2024-02-13",
         source="PIB, Prime Minister's Office", url="https://pib.gov.in/PressReleasePage.aspx?PRID=2005596"),
    dict(id="rm", photo="assets/leaders/rajnath-singh.jpg", photo_alt="Official portrait of Raksha Mantri Rajnath Singh", photo_credit="Ministry of Defence / PIB",
         photo_url="https://commons.wikimedia.org/wiki/File:Shri_Rajnath_Singh,_in_New_Delhi_on_May_09,_2023_(cropped).jpg", who="Shri Rajnath Singh", role="Raksha Mantri (Defence Minister)", mono="RM",
         quote="Ex-servicemen are a national asset, bringing decades of experience, leadership, discipline & strategic thinking to "
               "society. Their continued engagement in social & economic initiatives strengthen communities and the nation as a whole.",
         context="National Conclave 2025 on ex-servicemen welfare, Manekshaw Centre, New Delhi", date="2025-09-29",
         source="PIB, Ministry of Defence", url="https://pib.gov.in/PressReleasePage.aspx?PRID=2172917"),
    dict(id="cm", photo="assets/leaders/himanta-biswa-sarma.jpg", photo_alt="Official portrait of Assam Chief Minister Himanta Biswa Sarma", photo_credit="President's Secretariat",
         photo_url="https://commons.wikimedia.org/wiki/File:Himanta_Biswa_Sarma_in_2026.jpg", who="Dr Himanta Biswa Sarma", role="Chief Minister of Assam", mono="CM",
         quote="On solar, we are moving on multiple fronts: expediting adoption of the PM Surya Ghar scheme to expand rooftop solar, "
               "and permitting tea garden owners to use up to 5% of their land for solar generation opening a new avenue for green "
               "power across our tea belt.",
         context="Rewriting Assam's Energy Future", date="2026-09-22",
         source="Himanta Biswa Sarma", url="https://himantabiswa.substack.com/p/rewriting-assams-energy-future"),
    dict(id="hm", photo="assets/leaders/amit-shah.jpg", photo_alt="Portrait of Union Home Minister Amit Shah", photo_credit="Ministry of Home Affairs / PIB",
         photo_url="https://commons.wikimedia.org/wiki/File:Shri_Amit_Shah_in_Raigad.jpg", who="Shri Amit Shah", role="Union Home Minister", mono="HM", reported=True,
         quote="The stepwell construction and Solar Roof-Top Yojana have been made keeping in mind the earth's temperature, climate "
               "change and water needs in the coming times.",
         context="Urging Ahmedabad residents to adopt PM Surya Ghar rooftop solar", date="2025-01-23",
         source="PIB, Ministry of Home Affairs (as reported)", url="https://pib.gov.in/PressReleasePage.aspx?PRID=2095622"),
]

# ------------------------------------------------------- national facts ----
NATIONAL_FACTS = [
    dict(num="500", suffix=" GW", label="Non-fossil capacity target for 2030: the first of the Prime Minister's Panchamrit commitments at COP26",
         url="https://pib.gov.in/PressReleasePage.aspx?PRID=1768712"),
    dict(num="283.46", suffix=" GW", label="Non-fossil capacity installed in India as on 31 March 2026",
         url="https://pib.gov.in/PressReleasePage.aspx?PRID=2250039"),
    dict(num="50", suffix="%", label="Share of India's installed power capacity from non-fossil sources, reached June 2025",
         url="https://pib.gov.in/PressReleasePage.aspx?PRID=2250039"),
    dict(num="164.59", suffix=" GW", label="Solar capacity installed in India as on 31 July 2026 (MNRE data)",
         url="https://solarquarter.com/2026/08/12/indias-solar-capacity-surpasses-164-gw-as-2026-installations-approach-29-gw-by-july-end/"),
    dict(num="75", suffix=" lakh", label="Households targeted for rooftop solar under PM Surya Ghar by December 2026, on the way to 1 crore",
         url="https://www.pib.gov.in/PressReleasePage.aspx?PRID=2268992"),
]

# -------------------------------------------------------------- schemes ----
# (title, who it is for, points, how we fit in, source name, source url)
SCHEMES = [
    # (title, who, points, where we fit, source name, source url, in-depth guide, status in October 2026)
    ("PM Surya Ghar: Muft Bijli Yojana", "Homes & housing societies",
     ["Launched on 13 February 2024; approved by the Union Cabinet on 29 February 2024 with an outlay of Rs 75,021 crore",
      "Central subsidy: Rs 30,000 for 1 kW, Rs 60,000 for 2 kW and Rs 78,000 for 3 kW or more",
      "Housing societies and RWAs: Rs 18,000 per kW for common facilities, up to 500 kW",
      "Collateral-free loans of around 7% for home systems up to 3 kW; Indian-made (DCR) modules and a registered vendor required",
      "Target: 75 lakh households by December 2026, on the way to 1 crore"],
     "The scheme is aimed at homes. For businesses the equivalent levers are depreciation, 5% GST and net metering, which our CAPEX plants are built around.",
     "PIB", "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2268992", "pm-surya-ghar-subsidy.html", "Open; apply on pmsuryaghar.gov.in"),
    ("PM-KUSUM", "Farmers, cooperatives, panchayats, FPOs",
     ["Component A: grid-connected solar plants of 500 kW to 2 MW on farmers' land, power bought by the DISCOM",
      "Component B: standalone solar pumps, with 30% central support (50% in the North-East, hill states and islands) plus state support",
      "Component C: solarisation of grid-connected pumps, individually or by whole feeders",
      "Financial closure for Components A and C extended to 30 November 2026; completion by 31 March 2027, with no further extension",
      "PM-KUSUM 2.0, with about 10 GW for agri-photovoltaics, announced but not yet notified"],
     "Component A and feeder-level plants are ground-mount plants: the piling, fencing, civil works, installation and commissioning we do every day.",
     "Energetica India", "https://energetica-india.net/news/mnre-extends-pm-kusum-financial-closure-deadline-to-nov-30", "pm-kusum-scheme.html", "Closing: complete by 31 Mar 2027"),
    ("Solar in Assam's tea gardens", "Tea estates in Assam",
     ["Tea garden owners may use up to 5% of their land for solar generation, as announced by the Chief Minister",
      "Assam's goal: 6,000 MW of installed green energy capacity by 2030; its solar policy targets about 3,500 MW of solar",
      "Clean-energy incentives for tea, coffee and rubber units buying from APDCL have included annual energy banking"],
     "We have built ground-mount plants across Assam's tea gardens, from Koomber (inaugurated by the Chief Minister) to Harmutty, with DG synchronisation and APDCL approvals.",
     "Himanta Biswa Sarma, 22 Sep 2026", "https://himantabiswa.substack.com/p/rewriting-assams-energy-future", "solar-for-assam-tea-estates-guide.html", "In force; check APDCL for current terms"),
    ("Accelerated depreciation", "Businesses that own their plant",
     ["Solar power generating systems are depreciated at 40% a year on the written-down value",
      "The Income-tax Act, 2025 applies from 1 April 2026; the 40% rate for qualifying solar assets is reported to continue",
      "Half the year's depreciation if the plant is used for less than 180 days in its first year"],
     "Every plant we build on the CAPEX model belongs to the client, so the depreciation is theirs. Confirm the position with your chartered accountant.",
     "Taxguru: Income-tax Act, 2025", "https://taxguru.in/income-tax/depreciation-income-tax-act-2025-section-34-rates-provisions.html", "accelerated-depreciation-solar.html", "Available to business owners"),
    ("GST on solar at 5%", "Everyone buying a solar plant",
     ["The 56th GST Council cut GST on solar cells, modules and specified devices from 12% to 5%, effective 22 September 2025",
      "EPC contracts: 70% goods at 5% and 30% services at 18%, about 8.9% overall",
      "The Andhra Pradesh High Court upheld the 70:30 method for a solar EPC contract in December 2025"],
     "We set out supply and services clearly in every CAPEX quotation, so the tax treatment is transparent from the start.",
     "pv magazine India, 4 Sep 2025", "https://www.pv-magazine-india.com/2025/09/04/gst-on-solar-cells-modules-cut-to-5/", "gst-on-solar-india.html", "In force"),
    ("Net metering and time-of-day tariffs", "Grid-connected consumers",
     ["Net metering up to 500 kW or the sanctioned load, whichever is lower, under the national consumer rules; states set the details",
      "Above that, net billing or gross metering",
      "Time-of-day tariffs make solar hours cheaper and evening peaks dearer",
      "Draft amendment of March 2026 proposes charges above 5 kW and storage above 500 kW; check whether it has been notified"],
     "We handle net-metering applications, inspections and CEIG approvals; at Borpatra Tea Estate we obtained the approvals from APDCL.",
     "Mercom India", "https://www.mercomindia.com/government-proposes-amendments-to-electricity-consumer-rights-rules", "net-metering-india.html", "In force; 2026 changes in draft"),
    ("Green Energy Open Access", "Consumers of 100 kW and more",
     ["Buy green power from an off-site plant from 100 kW of load (down from 1 MW); captive consumers have no minimum",
      "Connections in the same electricity division can be aggregated (2023 amendment)",
      "Single-window applications on the national GOAR portal, with deemed approval if not decided in time",
      "The ISTS charges waiver ended for projects commissioned after 30 June 2025 and is phasing out in steps"],
     "Captive and open-access plants are ground-mount plants: we do the piling, civil works, fencing and installation & commissioning.",
     "GOAR portal", "https://greenopenaccess.in/", "green-energy-open-access.html", "In force; state charges vary"),
    ("ALMM List-I and List-II", "Projects covered by the ALMM order",
     ["List-I sets which solar modules may be used in covered projects",
      "From 1 June 2026, List-II for solar cells applies: covered projects need List-I modules made with List-II cells",
      "Exemptions for projects whose bid deadline was before the amendment, and for net-metering and open-access projects commissioned before 1 June 2026",
      "A List-III for wafers is reported for June 2028"],
     "We do not manufacture modules, so we specify the ALMM-listed or client-approved makes each project needs and keep the documents.",
     "PIB", "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2082901", "almm-list-ii-solar-cells.html", "In force from 1 June 2026"),
    ("Customs duty on modules and cells", "Anyone importing equipment",
     ["Budget 2025-26: BCD on modules cut to 20% with a 20% AIDC (about 40% combined); on cells to 20% with 7.5% AIDC",
      "Budget 2026-27 left the headline rates unchanged and removed duty on a solar-glass input",
      "Anti-dumping duty on Chinese-origin cells and modules recommended in September 2025; check the current notification"],
     "For most C&I and scheme projects the route is now Indian ALMM modules; we compare options and paperwork before you commit.",
     "Energetica India", "https://www.energetica-india.net/news/union-budget-2025-26-solar-cells-and-modules-duty-cut-to-20-percent", "solar-import-duty-india.html", "In force"),
    ("BIS Quality Control Order", "Every plant: modules, inverters, batteries",
     ["Solar Systems, Devices and Components Goods Order, 2025, notified 27 January 2025",
      "Modules, solar inverters and storage batteries must meet Indian Standards and carry the BIS mark",
      "Inverters above 200 kW given extra time on self-certification, reportedly to the end of 2026"],
     "We check BIS and ALMM documents for every component on site and hand them over with the test reports.",
     "PIB", "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2097219", "solar-quality-standards-bis-cea.html", "In force"),
    ("Storage with solar", "Utility tenders and large prosumers",
     ["Power Ministry advisory (Feb 2025): two-hour co-located storage equal to 10% of capacity in future solar tenders",
      "Viability gap funding for battery storage; a second tranche of about Rs 5,400 crore announced in 2025",
      "ISTS waiver for co-located BESS commissioned by 30 June 2028"],
     "We build the solar side and can plan for storage; for most C&I owners a plant sized to daytime load pays back fastest.",
     "pv magazine India", "https://www.pv-magazine-india.com/2025/02/20/power-ministry-mandates-co-locating-energy-storage-with-solar-projects/", "battery-storage-with-solar.html", "Advisory for future tenders"),
]

# ------------------------------------------------------------- timeline ----
# (date label, iso, title, text, link)
TIMELINE = [
    ("Oct 2018", "2018-10", "Company founded",
     "Arrays Ingenieria Pvt. Ltd. is incorporated. Founded by Lt. Gen. Ashish Ranjan Prasad (Retd), it sets out to give fellow veterans a second innings in green energy.", "about.html"),
    ("Jun 2021", "2021-06", "First Tata Power work order",
     "Civil works for the 9979 kWp (10 MW) solar plant at DCM Textile, Hisar.", "project-dcm-hisar-10mw-solar-civil-works.html"),
    ("Jul 2023", "2023-07", "Tata Motors, Jamshedpur",
     "Piling and civil works for the 5.5 MW plant, for Tata Power.", "project-tata-motors-jamshedpur-5-5mw-solar-piling.html"),
    ("Apr 2024", "2024-04", "In Dainik Bhaskar",
     "The 319 kWp rooftop plant for TCPL Greenery Agro in Vaishali, Bihar, makes the news.", "project-tcpl-vaishali-319kwp-rooftop-solar.html"),
    ("2024", "2024", "India 5000 Best MSME Awards",
     "Nominated for quality excellence.", "achievements.html"),
    ("Dec 2024", "2024-12", "Jay Shree Tea purchase order",
     "Supply, installation and commissioning of 1035 kWp at Towkok and Manjushree Tea Estates.", "project-jayshree-tea-1mw-solar-assam.html"),
    ("Feb 2025", "2025-02", "SECI 300 MW, Koppal",
     "Tata Power outline agreement for pile foundations on the 300 MW SECI project.", "project-seci-300mw-koppal-pile-foundation.html"),
    ("May 2025", "2025-05", "Jay Shree Tea's first solar plants",
     "Inaugurated on 20 May; reported by The Sentinel and announced by Jay Shree Tea.", "recognition.html#sentinel-jayshree"),
    ("Nov 2025", "2025-11", "Dewan Group of Tea Estates",
     "Solar plants at Dewan, Labac and Burtoll for Jay Shree Tea.", "recognition.html#jayshree-dewan"),
    ("Mar 2026", "2026-03", "Sustvest, 1711.66 kWp",
     "Appointed for supply, installation and commissioning of an on-grid project in Assam.", "project-assam-1711kwp-on-grid-solar.html"),
    ("Sep 2026", "2026-09", "Orangajuli and Borpatra",
     "450 kWp at Orangajuli on Janmashtami and 230 kWp at Borpatra: 19 on-grid plants in Assam's tea gardens.", "solar-for-tea-estates.html"),
]

# ----------------------------------------------------------- panchamrit ----
# Verbatim from the Prime Minister's national statement at COP26, Glasgow (PIB, 1 Nov 2021).
PANCHAMRIT_URL = "https://pib.gov.in/PressReleasePage.aspx?PRID=1768712"
PANCHAMRIT = [
    "India will reach its non-fossil energy capacity to 500 GW by 2030.",
    "India will meet 50 percent of its energy requirements from renewable energy by 2030.",
    "India will reduce the total projected carbon emissions by one billion tonnes from now onwards till 2030.",
    "By 2030, India will reduce the carbon intensity of its economy by less than 45 percent.",
    "By the year 2070, India will achieve the target of Net Zero.",
]

# ----------------------------------------------------------- where we work ----
# (state, headline, [(project text, link or "")]); only projects documented on this site.
STATES = [
    ("Assam", "Our biggest region: on-grid plants across the tea gardens", [
        ("Koomber Tea Estate: 595 kWp, inaugurated by the Chief Minister, Cachar", "project-koomber-tea-estate-595kwp-solar-cm-inauguration.html"),
        ("Jay Shree Tea: 535 kWp Towkok and 500 kWp Manjushree, Sonari", "project-jayshree-tea-1mw-solar-assam.html"),
        ("Orangajuli Tea Estate: 450 kWp, Udalguri", "project-orangajuli-tea-estate-450kw-solar.html"),
        ("Borpatra (Barpatra) Tea Garden: 230 kWp, Borhat, Sivasagar", "project-barpatra-tea-estate-230kw-solar.html"),
        ("1711.66 kWp on-grid project for Sustvest", "project-assam-1711kwp-on-grid-solar.html"),
        ("Dewan, Labac and Burtoll gardens for Jay Shree Tea", "recognition.html#jayshree-dewan"),
        ("Kakajan Tea Estate for Amalgamated Plantations", "")]),
    ("West Bengal", "Industrial rooftop solar", [
        ("Super Smelters: 1980.3 kWp rooftop, Jamuria", "project-super-smelters-1980kwp-rooftop-solar.html")]),
    ("Bihar", "Home to our branch office in Madhubani", [
        ("TCPL Greenery Agro (Tata Consumer): 319 kWp rooftop, Vaishali", "project-tcpl-vaishali-319kwp-rooftop-solar.html"),
        ("Pile foundations and chain-link fencing, Madhepura", "")]),
    ("Jharkhand", "Piling and civil works for the Tata group", [
        ("Tata Motors: 5.5 MW piling and civil works, Jamshedpur", "project-tata-motors-jamshedpur-5-5mw-solar-piling.html"),
        ("Tata Steel: solar project, Noamundi", "")]),
    ("Uttar Pradesh", "Home to our corporate office in Greater Noida", [
        ("YIAPL: 14.36 MW supply, civil works and fencing", "project-yiapl-14-36mw-solar-civil-fencing.html")]),
    ("Uttarakhand", "Rooftop, carport and ground-mount projects", [
        ("Tata Motors: solar carport, Pantnagar", ""),
        ("Balaji Action: rooftop solar, Sitarganj", ""),
        ("Ground-mount solar project, Ramnagar", "")]),
    ("Haryana", "Utility-scale civil works", [
        ("DCM Textile: civil works for 10 MW, Hisar", "project-dcm-hisar-10mw-solar-civil-works.html")]),
    ("Karnataka", "Our largest project", [
        ("SECI 300 MW, Koppal: pile foundations for Tata Power", "project-seci-300mw-koppal-pile-foundation.html")]),
]

BP = "assets/borpatra/arrays-ingenieria-ex-servicemen-led-borpatra-tea-estate-230kwp-solar-"
BORPATRA_ALBUM = [
    (BP + "inauguration-poster.jpg", "Official poster for the inauguration of the 230 kWp ground-mounted on-grid solar power plant at Borpatra Tea Estate, 25 September 2026: Tata Power Solar, Goodricke, Sustvest and Arrays Ingenieria (installation partner)"),
    (BP + "inauguration-team.jpg", "Inauguration of the 230 kWp Borpatra Tea Estate solar plant, 25 September 2026: the team at the banner and AC distribution board, Arrays Ingenieria (ex-servicemen-led) installation partner"),
    (BP + "inauguration-banner-gate.jpg", "Borpatra Tea Estate gate with the banner for the inauguration of the 230 kWp ground-mounted on-grid solar power plant, 25 September 2026, Tata Power Solar, Goodricke, Sustvest and Arrays Ingenieria"),
    (BP + "inverter-puja.jpg", "Puja at Inverter-2 of the 230 kWp Borpatra Tea Estate solar plant before the inauguration, installed by Arrays Ingenieria"),
    (BP + "banner-acdb.jpg", "Inauguration banner beside the AC distribution board (ACDB) of the 230 kWp Borpatra Tea Estate solar plant, Arrays Ingenieria"),
    (BP + "manager-acdb.jpg", "Borpatra Tea Estate manager at the AC distribution board on inauguration day, 230 kWp solar plant by Arrays Ingenieria"),
    (BP + "modules.jpg", "Solar modules of the 230 kWp ground-mounted on-grid plant at Borpatra Tea Estate, Assam, installed by Arrays Ingenieria (Ingenieria), ex-servicemen-led MSME"),
]

# ------------------------------------------------- Koomber inauguration ----
# Inaugurated by the Chief Minister of Assam, 1 October 2026. Facts from The
# Sentinel, the CM's Office and MLA Kaushik Rai's posts, and the company's own
# press release; photo captions describe only what each photo shows.
K = "assets/koomber/"
KOOMBER_ALBUM = [
    (K + "arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-cm-inaugurates-595kwp-solar-plant-ribbon-cutting.jpg", "Chief Minister Dr Himanta Biswa Sarma cuts the ribbon to inaugurate the 595 kWp solar plant at Koomber Tea Estate"),
    (K + "arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-cm-cuts-ribbon-595kwp-solar-plant.jpg", "The Chief Minister of Assam cuts the ribbon at the Koomber Tea Estate solar plant"),
    (K + "arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-welcomes-cm-with-assamese-gamosa.jpg", "Shri Ranveer Singh of Arrays Ingenieria welcomes the Chief Minister with a traditional Assamese gamosa"),
    (K + "arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-gamosa-welcome-cm.jpg", "The Chief Minister is felicitated with a gamosa by Arrays Ingenieria at the inauguration"),
    (K + "arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-cm-tours-plant-with-team.jpg", "Arrays Ingenieria takes the Chief Minister around the 595 kWp ground-mount solar plant"),
    (K + "arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-ground-mount-solar-plant.jpg", "The 595 kWp ground-mounted on-grid solar plant at Koomber Tea Estate, built by Arrays Ingenieria"),
    (K + "arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-cm-speaks-at-solar-plant-site.jpg", "The Chief Minister speaks at the Koomber solar plant site"),
    (K + "arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-cm-reviews-solar-plant-with-mlas.jpg", "The Chief Minister with MLAs and officials at the solar plant"),
    (K + "arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-cm-inspects-solar-modules.jpg", "The Chief Minister inspects the solar modules at Koomber Tea Estate"),
    (K + "arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-cm-himanta-biswa-sarma-arrives.jpg", "The Chief Minister of Assam arrives at Koomber Tea Estate"),
    (K + "arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-cm-at-ribbon-solar-plant.jpg", "Before the ribbon-cutting at the Koomber solar plant"),
    (K + "arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-ribbon-ceremony.jpg", "The ribbon ceremony at Koomber Tea Garden"),
    (K + "arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-cm-enters-solar-plant-after-inauguration.jpg", "The Chief Minister walks into the solar plant after the inauguration"),
    (K + "arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-cm-on-site-at-solar-plant.jpg", "The Chief Minister on site at the Koomber solar plant"),
    (K + "arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-cm-and-officials-at-solar-site.jpg", "The Chief Minister with officials at the solar site"),
    (K + "arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-team-greets-cm-at-inauguration-banner.jpg", "Arrays Ingenieria greets the Chief Minister at the inauguration banner"),
    (K + "arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-cm-greeted-by-team.jpg", "The Arrays Ingenieria team greets the Chief Minister"),
    (K + "arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-gamosa-felicitation-cm.jpg", "Gamosa felicitation of the Chief Minister at Koomber"),
    (K + "arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-inauguration-banner.jpg", "Inauguration banner: 595 kWp solar plant at Koomber Tea Garden, with Tata Power Solar, Goodricke, Sustvest and Arrays Ingenieria"),
    (K + "arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-welcome-banner-lt-gen-ar-prasad.jpg", "Arrays Ingenieria's welcome banner for the Chief Minister, with Lt. Gen. A.R. Prasad (Retd)"),
]
KOOMBER_PEOPLE = [
    "Shri Krishnendu Paul, Minister of Public Health Engineering and MLA, Patharkandi",
    "Dr Rajdeep Roy, MLA, Silchar",
    "Shri Rajdeep Goala, MLA, Udharbond",
    "Shri Kaushik Rai, MLA, Lakhipur",
    "Shri Anil Gurung, Manager, and Shri Jitul Chetia, Assistant Manager, Koomber Tea Estate",
]

PROJECTS.insert(0, dict(
    file="project-koomber-tea-estate-595kwp-solar-cm-inauguration.html",
    name="Koomber Tea Estate: 595 kWp Solar Plant, Inaugurated by the Chief Minister of Assam",
    short="Koomber Tea Estate, Assam · 595 kWp",
    title="Assam CM Opens 595 kWp Koomber Solar | Arrays Ingenieria",
    desc="Assam CM Dr Himanta Biswa Sarma inaugurated the 595 kWp solar plant at Koomber Tea Estate, Cachar, on 1 Oct 2026. Installation partner: Arrays Ingenieria.",
    capacity="595 kWp", kind="Ground-mounted, on-grid", location="Koomber Tea Garden, Silchar, Cachar district (Barak Valley), Assam",
    client="Koomber Tea Estate (Goodricke Group)", partner="Tata Power Renewable Energy Ltd. & Sustvest (3.11 MW programme)",
    role="Installation partner", year="2026 (inaugurated 1 October 2026)",
    cat="ground", tag="Tea Estate · Inaugurated by the CM",
    hero=K + "arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-cm-inaugurates-595kwp-solar-plant-ribbon-cutting.jpg",
    intro="On 1 October 2026 the Chief Minister of Assam, Dr Himanta Biswa Sarma, inaugurated the 595 kWp ground-mounted, "
          "on-grid solar power plant at Koomber Tea Estate in Cachar district. Arrays Ingenieria was the installation partner.",
    body=[
        "The plant is part of the 3.11 MW Goodricke Tea Estates Solar Programme, developed with Tata Power Renewable Energy Ltd. "
        "(TPREL) and Sustvest, which brings clean energy to Goodricke's tea estates across Assam.",
        "On behalf of the company's Chief Executive Officer, Lt. Gen. A.R. Prasad (Retd), AVSM, VSM, ADC, Ph.D, Shri Ranveer Singh "
        "welcomed the Chief Minister with a traditional Assamese gamosa. At the inauguration the Chief Minister said the state "
        "government is working to promote tea-garden tourism and to connect tea gardens with solar power, so that they become more "
        "self-reliant in energy.",
        "The plant was built by the Arrays Ingenieria team, including the ex-servicemen Shri Birendra and Shri Dinesh, with the "
        "guidance of Shri Kundal Kant Singh, Abhinanda Basu, Shri Santosh Singh and Baliram of TPREL, and Shri Hardik (CEO) and "
        "Shri Devyansh of Sustvest.",
        "The inauguration was announced by the Chief Minister's Office on X and Facebook, posted by MLAs Kaushik Rai and Rajdeep Goala, and reported "
        "by The Sentinel on its website, Facebook and Instagram.",
    ],
    scope=["Installation of the 595 kWp ground-mounted plant", "Electrical works and grid connection",
           "Testing and commissioning", "Handover for inauguration"],
    photos=KOOMBER_ALBUM[:6],
    album=KOOMBER_ALBUM,
    album_lead="%d photos from Koomber Tea Estate, 1 October 2026." % len(KOOMBER_ALBUM),
    videos=True,
    people=KOOMBER_PEOPLE,
    docs=[("assets/certs/goodricke-appreciation-koomber-595kwp-arrays-ingenieria.jpg", "Goodricke certificate of appreciation: installation & commissioning of the 595 kWp plant at Koomber Tea Garden, Silchar"),
          ("assets/news/arrays-ingenieria-koomber-595kwp-solar-cm-inauguration-prerna-bharati.jpg", "Prerna Bharati, 2 Oct 2026: Arrays Ingenieria welcomes the Chief Minister at the Koomber inauguration"),
          ("assets/news/arrays-ingenieria-koomber-595kwp-solar-cm-inauguration-azad-sipahi.jpg", "Azad Sipahi, Ranchi, 3 Oct 2026: solar plant inaugurated at Koomber tea garden")],
    coverage=["sentinel-koomber", "hindusthan-samachar-koomber", "india-today-ne-koomber", "prerana-bharati-koomber-video", "news-axom-koomber", "prerna-bharati-koomber", "azad-sipahi-koomber"],
    official=["cmo-assam-koomber", "kaushik-rai-koomber", "rajdeep-goala-koomber", "pallab-lochan-das-koomber"],
    services=["solar-installation-commissioning.html", "service-ground-mount.html", "solar-for-tea-estates.html"],
    impact=dict(
        heading="Driving the PM's Panchamrit and the CM's Green Assam mission",
        paras=[
            "The Chief Minister's Office said the plant \"empowers iconic tea industry with clean energy and accelerates the mission "
            "towards a Green Assam\". The Sentinel reported that it aligns with the government's efforts to promote its Green Assam "
            "mission.",
            "By cutting fossil-fuel use in energy-intensive tea processing, the plant also contributes to the Prime Minister's "
            "Panchamrit commitments made at COP26, and to Assam's target of 6,000 MW of green-energy capacity by 2030.",
        ],
        sources=[("CM's Office, Assam on X, 1 Oct 2026", "https://x.com/CMOfficeAssam/status/2105545750054928662"),
                 ("The Sentinel, 1 Oct 2026", "https://www.sentinelassam.com/breakingnews/assam-himanta-biswa-sarma-inaugurates-595-kwp-solar-plant-at-koomber-tea-estate"),
                 ("PM's national statement at COP26, PIB", "https://pib.gov.in/PressReleasePage.aspx?PRID=1768712")],
    ),
))

# Borpatra inauguration photos (25 September 2026, read from the banners).
_bp = next(p for p in PROJECTS if p["file"] == "project-barpatra-tea-estate-230kw-solar.html")
_bp["photos"] = BORPATRA_ALBUM[:4] + [("assets/news/arrays-ingenieria-borpatra-tea-estate-230kwp-solar-newspaper-print.jpg",
                 "Printed newspaper report on the 230 kWp Borpatra (Barpatra) Tea Estate solar plant by Arrays Ingenieria")]
_bp["album"] = BORPATRA_ALBUM
_bp["album_lead"] = "%d photos from the inauguration at Borpatra Tea Estate, 25 September 2026." % len(BORPATRA_ALBUM)

# ------------------------------------------------------------- insights ----
# Essays for insights.html. Paragraphs are HTML (internal links allowed). Every
# number carries a source; dates are when the essay was written or last checked.
SRC_PIB_RE = ("PIB: India ranks third globally in renewable energy installed capacity", "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2250039")
SRC_MNRE_JUL = ("SolarQuarter, 12 Aug 2026, citing MNRE data", "https://solarquarter.com/2026/08/12/indias-solar-capacity-surpasses-164-gw-as-2026-installations-approach-29-gw-by-july-end/")
SRC_ALMM = ("PIB: MNRE amends the ALMM Order 2019 (List-II for solar cells)", "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2082901")
SRC_GST = ("pv magazine India, 4 Sep 2025: GST on solar cells, modules cut to 5%", "https://www.pv-magazine-india.com/2025/09/04/gst-on-solar-cells-modules-cut-to-5/")
SRC_SURYA = ("PIB: 75 lakh households targeted for rooftop solar by December 2026", "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2268992")
SRC_SURYA_CAB = ("PIB, 29 Feb 2024: Cabinet approves PM Surya Ghar", "https://pib.gov.in/PressReleasePage.aspx?PRID=2010133")
SRC_KUSUM = ("Energetica India: MNRE extends PM-KUSUM financial closure deadline to 30 Nov", "https://energetica-india.net/news/mnre-extends-pm-kusum-financial-closure-deadline-to-nov-30")
SRC_CM = ("Himanta Biswa Sarma, Rewriting Assam's Energy Future, 22 Sep 2026", "https://himantabiswa.substack.com/p/rewriting-assams-energy-future")
SRC_COP = ("PIB: PM's national statement at COP26, 1 Nov 2021", "https://pib.gov.in/PressReleasePage.aspx?PRID=1768712")

INSIGHTS = [
    dict(id="india-solar-2026", tag="Market Update", date="2026-10-02",
         title="India's Solar Boom in 2026: 164 GW and Counting",
         summary="India passed 150 GW of solar by March 2026 and 164 GW by July. What the build-out means for businesses planning a plant now.",
         takeaways=["150.26 GW of solar installed as on 31 March 2026; 164.59 GW by 31 July 2026",
                    "About 28.8 GW was added in the first seven months of 2026 alone",
                    "Good installation crews, not modules, are now the scarce resource: book your EPC partner early"],
         paras=[
            "India's solar fleet is growing faster than ever. Installed solar capacity crossed <strong>150 GW</strong> (150.26 GW) as on "
            "31 March 2026, and MNRE data put it at <strong>164.59 GW by 31 July 2026</strong>: 122.57 GW of ground-mounted plants, 30.74 GW "
            "of grid-connected rooftop solar, 4.77 GW of solar in hybrid projects and 6.51 GW off-grid. Roughly 28.8 GW was added between "
            "January and July 2026.",
            "The national direction is fixed: the Prime Minister's <strong>Panchamrit</strong> commitments at COP26 call for 500 GW of "
            "non-fossil capacity by 2030 and net zero by 2070, and non-fossil sources already passed half of India's installed power "
            "capacity in June 2025. For a factory, tea estate or warehouse, the question is no longer whether solar works, but how quickly "
            "and how well your plant can be built.",
            "That is where the bottleneck now sits. With record volumes, experienced <a href=\"solar-installation-commissioning.html\">installation "
            "and commissioning</a> crews, piling rigs and approval specialists are in demand. Plan the site survey, net-metering paperwork and "
            "civil works early, and choose a partner with a documented track record. Ours is on the <a href=\"projects.html\">projects page</a>.",
         ],
         sources=[SRC_PIB_RE, SRC_MNRE_JUL, SRC_COP]),
    dict(id="almm-list-ii-solar-cells", tag="Policy", date="2026-10-02",
         title="ALMM List-II for Solar Cells (from 1 June 2026): What It Means for Your Project",
         summary="Projects under the ALMM order now need modules from List-I built with cells from List-II. Here is what changes and how to plan around it.",
         takeaways=["ALMM List-I covers modules; List-II, for solar cells, applies from 1 June 2026",
                    "Covered projects must use List-I modules that are themselves made with List-II cells",
                    "Projects whose bids closed before the order was issued are exempt from the cell requirement"],
         paras=[
            "MNRE's <strong>Approved List of Models and Manufacturers (ALMM)</strong> decides which solar modules can be used in projects "
            "that fall under it, such as government-linked and scheme-backed projects. Until 2026 only List-I (modules) was in force. MNRE "
            "amended the ALMM Order 2019 so that <strong>List-II, for solar PV cells, takes effect from 1 June 2026</strong>.",
            "From then on, covered projects must source modules from List-I, and those modules must in turn use cells from List-II. The aim "
            "is to grow domestic cell manufacturing and cut import dependence. Projects whose bid submission deadline fell on or before the "
            "date of the order are excused from the cell requirement, though they still use List-I modules.",
            "For buyers, the practical effect is on <strong>procurement and documentation</strong>: the make, model and cell origin of every "
            "module must match the list in force for your project. Arrays Ingenieria does not manufacture modules or inverters, so we specify "
            "the ALMM-listed or client-approved makes each project requires and keep the paperwork that inspectors and DISCOMs ask for. See "
            "<a href=\"capex-solar-epc.html\">how our CAPEX EPC works</a>.",
         ],
         sources=[SRC_ALMM]),
    dict(id="gst-on-solar-5-percent", tag="Tax", date="2026-10-02",
         title="GST on Solar Cut to 5%: How It Lowers the Cost of a Solar Plant",
         summary="The 56th GST Council cut GST on solar devices from 12% to 5% from 22 September 2025. What that does to a CAPEX solar budget.",
         takeaways=["GST on solar cells, modules and other renewable devices fell from 12% to 5%",
                    "Decided at the 56th GST Council meeting on 3 September 2025; effective 22 September 2025",
                    "Equipment is the largest part of a plant's cost, so the cut flows straight into payback"],
         paras=[
            "On 3 September 2025 the <strong>56th GST Council</strong> cut the GST rate on solar cells, modules and other renewable-energy "
            "devices from <strong>12% to 5%</strong>, with effect from <strong>22 September 2025</strong>.",
            "Because modules, inverters and structures make up most of the cost of a solar plant, a lower tax rate on equipment reduces the "
            "upfront investment for anyone buying a plant on the <a href=\"capex-solar-epc.html\">CAPEX model</a>, and shortens payback. "
            "How GST applies to a full EPC contract depends on how supply and services are split, so confirm the treatment for your contract "
            "with your tax adviser.",
            "Combined with accelerated depreciation for businesses that own their plant, the tax cut makes 2026 one of the best years yet "
            "to build captive solar. <a href=\"contact.html\">Ask us for a quote</a> with the new rates built in.",
         ],
         sources=[SRC_GST]),
    dict(id="capex-vs-opex-solar", tag="Business Models", date="2026-10-02",
         title="CAPEX vs OPEX (RESCO) Solar: Which Model Suits Your Business?",
         summary="Own the plant and keep every unit, or pay per unit with no upfront cost? A clear comparison of CAPEX and OPEX solar for Indian businesses.",
         takeaways=["CAPEX: you invest, you own the plant, you keep all savings and the tax benefits",
                    "OPEX / RESCO: a developer invests and owns the plant; you buy the power at an agreed tariff",
                    "Arrays Ingenieria builds on the CAPEX model and works as installation partner to developers"],
         paras=[
            "Under the <strong>CAPEX model</strong> the client pays for the plant and owns it from day one. Every unit it generates is free "
            "power, and a business owner can claim depreciation on the asset. The investment is recovered through lower electricity bills, "
            "after which the plant keeps saving money for the rest of its life.",
            "Under the <strong>OPEX or RESCO model</strong> a developer funds, owns and runs the plant on your site and sells you the power "
            "at a fixed tariff for a long contract period. There is no upfront cost, but the savings are shared with the developer and the "
            "tax benefits stay with the owner.",
            "If you have the capital or access to green loans, CAPEX usually gives the best lifetime return. If you would rather not invest, "
            "OPEX lets you start saving immediately. Arrays Ingenieria builds plants for owners on the CAPEX model, and works as the "
            "<a href=\"solar-installation-commissioning.html\">installation and commissioning partner</a> for developers, as on the 3.11 MW "
            "Goodricke Tea Estates Solar Programme developed by Tata Power Renewable Energy and Sustvest. More on the "
            "<a href=\"capex-solar-epc.html\">CAPEX solar EPC page</a>.",
         ],
         sources=[]),
    dict(id="solar-for-assam-tea-estates", tag="Tea Estates", date="2026-10-02",
         title="Solar for Assam's Tea Estates: Lessons from 19 On-Grid Plants",
         summary="From Koomber, inaugurated by the Chief Minister, to Orangajuli and Borpatra: what we have learned building solar in Assam's tea gardens.",
         takeaways=["Tea garden owners may use up to 5% of their land for solar, as announced by the Chief Minister of Assam",
                    "Assam targets 6,000 MW of installed green-energy capacity by 2030",
                    "Tea factories run heavy daytime loads: a near-perfect match for solar"],
         paras=[
            "Tea processing is energy hungry: withering, rolling, drying and sorting all run through the day, and many estates still lean on "
            "diesel generators. That daytime load is exactly when a solar plant produces, which is why Assam's tea gardens have become one of "
            "India's most promising markets for captive solar.",
            "Policy is pushing the same way. The Chief Minister of Assam, Dr Himanta Biswa Sarma, has announced that tea garden owners may use "
            "up to <strong>5% of their land</strong> for solar generation, and the state targets <strong>6,000 MW</strong> of green-energy "
            "capacity by 2030.",
            "Arrays Ingenieria has built 19 on-grid plants in Assam's tea gardens, including the <a href=\"project-koomber-tea-estate-595kwp-solar-cm-inauguration.html\">595 kWp "
            "plant at Koomber</a> inaugurated by the Chief Minister on 1 October 2026, <a href=\"project-orangajuli-tea-estate-450kw-solar.html\">450 kWp at Orangajuli</a> "
            "and <a href=\"project-barpatra-tea-estate-230kw-solar.html\">230 kWp at Borpatra</a>, and plants for Jay Shree Tea. The lessons: "
            "plan for monsoon access and drainage, synchronise the plant with the estate's DG sets, start the APDCL net-metering paperwork "
            "early, and protect the plant from cattle and wildlife with proper fencing. Read the full <a href=\"solar-for-tea-estates.html\">solar for tea estates guide</a>.",
         ],
         sources=[SRC_CM]),
    dict(id="choose-solar-epc-partner", tag="Buyer's Guide", date="2026-10-02",
         title="How to Choose a Solar EPC and Installation Partner in India: 10 Questions",
         summary="Ten questions to ask any solar EPC or installation contractor before you sign, from track record and safety to approvals and handover.",
         takeaways=["Ask for documented projects, purchase orders and client certificates, not just photos",
                    "Check ISO 9001, 14001 and 45001 and how safety is managed on site",
                    "Make sure civil works, approvals and commissioning are in scope, in writing"],
         paras=[
            "A solar plant runs for 25 years or more, and most of its problems start during construction. Before you sign, ask any EPC or "
            "installation partner these ten questions:",
            "<strong>1.</strong> Which comparable plants have you built, and can I see the purchase orders or client certificates? "
            "<strong>2.</strong> Who are your partners and clients, and will they vouch for you? <strong>3.</strong> Are you ISO 9001, "
            "ISO 14001 and ISO 45001 certified? <strong>4.</strong> Who supervises the site day to day? <strong>5.</strong> Are pile "
            "foundations, fencing, drainage and other civil works in your scope? <strong>6.</strong> Which module and inverter makes will you "
            "use, and are they ALMM-listed where required? <strong>7.</strong> Who handles net-metering and DISCOM approvals? "
            "<strong>8.</strong> How will the plant be tested and commissioned, and what documents do I receive at handover? "
            "<strong>9.</strong> What does O&amp;M support look like after handover? <strong>10.</strong> How will you keep the site safe?",
            "We are happy to answer every one of them. Arrays Ingenieria is an <a href=\"ex-servicemen-led-msme.html\">ex-servicemen-led MSME</a>, "
            "ISO 9001, 14001 and 45001 certified, with work for Tata Power, Jay Shree Tea, Goodricke, Sustvest and Super Smelters documented "
            "on our <a href=\"clients.html\">clients page</a> and in our <a href=\"achievements.html\">certificates</a>.",
         ],
         sources=[]),
    dict(id="pm-surya-ghar-subsidy", tag="Homes", date="2026-10-02",
         title="PM Surya Ghar Subsidy 2026: Amounts, Targets and How to Apply",
         summary="The PM Surya Ghar subsidy explained: up to Rs 78,000 for a 3 kW home system, and a target of 75 lakh households by December 2026.",
         takeaways=["Up to Rs 30,000 for 1 kW, Rs 60,000 for 2 kW and Rs 78,000 for 3 kW or more",
                    "75 lakh households targeted for rooftop solar by December 2026; 1 crore overall",
                    "Apply on the national portal and choose a registered vendor in your state"],
         paras=[
            "<strong>PM Surya Ghar: Muft Bijli Yojana</strong> was launched on 13 February 2024 and approved by the Union Cabinet with an "
            "outlay of Rs 75,021 crore. It aims to put rooftop solar on <strong>one crore homes</strong>, and the government has targeted "
            "<strong>75 lakh households by December 2026</strong>.",
            "Central financial assistance covers 60% of system cost up to 2 kW and 40% of the additional cost between 2 and 3 kW. At "
            "benchmark prices that is <strong>Rs 30,000 for 1 kW, Rs 60,000 for 2 kW and Rs 78,000 for 3 kW or more</strong>. Homeowners "
            "apply on the national portal, pick a registered vendor, and the subsidy is credited after installation and inspection.",
            "The scheme is for homes. Arrays Ingenieria focuses on commercial, industrial and tea-estate plants, which fall outside it; see "
            "<a href=\"solar-schemes-india.html\">all government solar schemes</a> for the incentives that apply to businesses.",
         ],
         sources=[SRC_SURYA, SRC_SURYA_CAB]),
    dict(id="pm-kusum-2026", tag="Farmers", date="2026-10-02",
         title="PM-KUSUM in 2026: New Deadlines for Component A and C",
         summary="MNRE has extended financial closure for PM-KUSUM Component A and C projects to 30 November 2026, with completion by 31 March 2027.",
         takeaways=["Component A: grid-connected solar plants of up to 2 MW on farmers' land",
                    "Financial closure for Component A and C extended to 30 November 2026",
                    "Project completion deadline: 31 March 2027"],
         paras=[
            "PM-KUSUM supports farmers, cooperatives, panchayats and FPOs. <strong>Component A</strong> funds decentralised ground- or "
            "stilt-mounted grid-connected solar plants of up to 2 MW on farm land, with the power bought by DISCOMs; "
            "<strong>Component C</strong> solarises grid-connected agriculture pumps, individually or at feeder level.",
            "Developers have struggled with loan appraisal and sanction, so MNRE has extended the deadline for <strong>financial closure of "
            "Component A and C projects to 30 November 2026</strong>, while keeping <strong>31 March 2027</strong> as the completion date.",
            "That leaves a tight construction window. A Component A plant is a ground-mount plant: survey, <a href=\"service-piling.html\">pile "
            "foundations</a>, <a href=\"service-civil.html\">fencing and civil works</a>, structures, modules, cabling, testing and "
            "commissioning. That is the work our crews do every day, and we can start as soon as financial closure is in place.",
         ],
         sources=[SRC_KUSUM]),
    dict(id="rooftop-vs-ground-mount", tag="System Design", date="2026-10-02",
         title="Rooftop vs Ground-Mount Solar: Which Is Right for You?",
         summary="Roof or open land? How to choose between rooftop and ground-mount solar for a factory, estate or institution.",
         takeaways=["Rooftop uses space you already have; capacity is limited by roof area and strength",
                    "Ground-mount suits larger capacities and allows the best tilt and easy cleaning",
                    "Many sites combine both"],
         paras=[
            "<strong>Rooftop solar</strong> uses your existing roof, which suits factories, warehouses, institutions and commercial buildings "
            "that want to offset on-site consumption without using land. It is quick to build and keeps the roof cooler. The limit is "
            "shadow-free roof area and the structural strength of the roof.",
            "<strong>Ground-mount solar</strong> is built on open land and suits larger capacities, from a few hundred kilowatts to hundreds "
            "of megawatts. It allows the best tilt and orientation, easy cleaning and access, and is the format used in utility parks and tea "
            "estates. It needs land and sound foundations, which is why our <a href=\"service-piling.html\">piling</a> and "
            "<a href=\"service-civil.html\">civil works</a> teams matter.",
            "Many clients combine a rooftop array with a ground-mount plant. Our engineers recommend the mix after a site survey: see "
            "<a href=\"service-rooftop.html\">rooftop solar</a> and <a href=\"service-ground-mount.html\">ground-mount solar</a>.",
         ],
         sources=[]),
    dict(id="net-metering", tag="Grid", date="2026-10-02",
         title="Net-Metering in India, Explained",
         summary="How net-metering works, why rules differ by state, and what the approval process with your DISCOM looks like.",
         takeaways=["A bi-directional meter records both import and export",
                    "You are billed on the net units; surplus may earn credits under state rules",
                    "Approvals and inspections are handled with your state DISCOM"],
         paras=[
            "<strong>Net-metering</strong> lets a grid-connected solar plant export surplus power to the grid. A bi-directional meter records "
            "the units you draw and the units you export, and your bill is based on the net. Daytime generation offsets your consumption "
            "directly.",
            "Rules, caps and settlement periods are set by each state's electricity regulator and DISCOM, so the process differs by state. At "
            "<a href=\"project-barpatra-tea-estate-230kw-solar.html\">Borpatra Tea Estate</a> we obtained the net-metering and statutory "
            "approvals from APDCL, including the technical inspections, so the plant could start on schedule.",
         ],
         sources=[]),
    dict(id="solar-om-roi", tag="O&M", date="2026-10-02",
         title="Why O&M Is the Secret to Long-Term Solar ROI",
         summary="A solar plant is a 25-year asset. How operations and maintenance protect generation and returns.",
         takeaways=["Soiling, shading and loose connections quietly cut generation",
                    "Preventive maintenance and monitoring protect returns",
                    "Good documentation at handover makes O&M easier"],
         paras=[
            "A solar plant is a 25-year asset, and its return depends on keeping it at peak output for all of those years. Dust, shading, a "
            "failing inverter or a loose connection can quietly erode generation.",
            "Professional <strong>operations and maintenance</strong> protects the investment with preventive servicing, module cleaning, "
            "inspections, inverter upkeep and performance monitoring, plus support with statutory compliance. Learn more about our "
            "<a href=\"service-om.html\">O&amp;M and support</a>.",
         ],
         sources=[]),
]

# 2026 additions: recent projects, policy changes and "who are you" questions
# people (and AI assistants) ask about the company.
FAQ[1:1] = [
    ("Is Arrays Ingenieria (Ingenieria) an ex-servicemen-led company?",
     "Yes. Arrays Ingenieria Pvt. Ltd., known as Ingenieria, is an ex-servicemen-led MSME founded in 2018 by Lt. Gen. Ashish Ranjan "
     "Prasad (Retd), its Chief Executive Officer. Veterans lead its project teams under the motto \"Olive Green to Go Green\"."),
    ("Did Arrays Ingenieria build the Koomber Tea Estate solar plant inaugurated by the Chief Minister of Assam?",
     "Yes. Arrays Ingenieria was the installation partner for the 595 kWp ground-mounted, on-grid solar plant at Koomber Tea Estate, "
     "Cachar, inaugurated by Chief Minister Dr Himanta Biswa Sarma on 1 October 2026. It is part of the 3.11 MW Goodricke Tea Estates "
     "Solar Programme developed by Tata Power Renewable Energy and Sustvest."),
    ("Which tea-estate solar plants did Arrays Ingenieria complete in 2026?",
     "Under the 3.11 MW Goodricke Tea Estates Solar Programme: Orangajuli Tea Garden, Udalguri (450 kWp, inaugurated 4 September 2026), "
     "Borpatra Tea Estate, Sivasagar (230 kWp, inaugurated 25 September 2026) and Koomber Tea Estate, Cachar (595 kWp, inaugurated by the "
     "Chief Minister on 1 October 2026)."),
]
FAQ[-1:-1] = [
    ("What is the GST rate on solar panels in 2026?",
     "5%. The 56th GST Council cut GST on solar cells, modules and other renewable-energy devices from 12% to 5% with effect from "
     "22 September 2025. How GST applies to a full EPC contract depends on the contract, so confirm with your tax adviser."),
    ("What is ALMM List-II and does it affect my solar project?",
     "ALMM List-II lists approved solar PV cell manufacturers. From 1 June 2026, projects covered by MNRE's ALMM order must use modules "
     "from List-I that are made with cells from List-II. We specify the listed makes each project needs."),
    ("How do I contact Arrays Ingenieria?",
     "Email arraysingenieria@gmail.com or use the form on the contact page. Tell us the site location, roof or land area and your "
     "monthly electricity use, and an engineer will get back to you."),
]
GLOSSARY += [
    ("ALMM List-II", "MNRE's approved list of solar PV cell manufacturers. From 1 June 2026, projects covered by the ALMM order must use "
                     "List-I modules made with List-II cells."),
    ("Financial closure", "The point at which a project's funding (equity and loans) is fully tied up, so construction can start. PM-KUSUM "
                          "Component A and C projects must reach it by 30 November 2026."),
    ("Ex-servicemen-led MSME", "A micro, small or medium enterprise run by former members of the armed forces. Arrays Ingenieria is one, "
                               "founded by Lt. Gen. A.R. Prasad (Retd)."),
    ("Panchamrit", "The five climate commitments India announced at COP26 in 2021, including 500 GW of non-fossil capacity by 2030 and net "
                   "zero by 2070."),
    ("Puja (commissioning ceremony)", "A traditional prayer held at a new plant, as at the inverters of the "
                                      "Borpatra Tea Estate solar plant at its inauguration in September 2026."),
]


# ------------------------------------------------- purchase-order record ----
# Additional project detail. No order counts, values or billing details are published.
TPSSL = "Tata Power Solar Systems Ltd."
TPREL = "Tata Power Renewable Energy Ltd."
GENERIC_GROUND = "assets/photos/arrays-ingenieria-utility-scale-ground-mount-solar-power-plant.jpg"
GENERIC_ROOF = "assets/photos/arrays-ingenieria-industrial-rooftop-solar-array.jpg"


def _project(file):
    return next(p for p in PROJECTS if p["file"] == file)


_p = _project("project-super-smelters-1980kwp-rooftop-solar.html")
_p.update(partner=f"{TPSSL} (EPC)", role="Installation & commissioning, BOS works and module cleaning system", year="2024",
          scope=["Installation & commissioning of the 1980 kW sheet-roof plant", "Balance-of-system (BOS) materials and additional cabling",
                 "Cable trays and earth excavation", "Earthing strip and self-drilling fasteners",
                 "Module cleaning system: supply and services", "Testing and commissioning"])
_p["body"].append("In 2024 Tata Power Solar engaged Arrays Ingenieria for the installation & commissioning of the 1980 kW sheet-roof "
                  "plant, the BOS materials and additional cabling, cable trays and earth excavation, the earthing strip, and the supply "
                  "and service of the module cleaning system.")

_p = _project("project-tata-motors-jamshedpur-5-5mw-solar-piling.html")
_p.update(name="Tata Motors, Jamshedpur: Piling, Civil Works and I&C for 5.5 MW Solar",
          title="5.5 MW Solar Piling & I&C, Tata Motors | Arrays Ingenieria",
          desc="Case study: piling, civil works, installation & commissioning and a pre-cast boundary wall for the 5.5 MW Tata Motors solar plant at Jojobera, Jamshedpur.",
          role="Piling, civil works, installation & commissioning", year="2023-2024",
          scope=["Pile foundations (300 mm dia, 1.8 m deep) and pull-out tests", "Land development and a pre-cast boundary wall",
                 "Installation & commissioning of the 5.579 MWp plant at Jojobera Yard", "Module cleaning system",
                 "Gate fabrication, temporary water supply and statutory liaison"])
_p["body"].append("Further orders followed through 2023 and 2024: land development, pull-out tests on the piles, gate fabrication, a "
                  "temporary water supply, liaison with government offices and, from December 2023, the installation & commissioning of "
                  "the 5.579 MWp plant at Jojobera Yard together with its module cleaning system.")

_p = _project("project-dcm-hisar-10mw-solar-civil-works.html")
_p.update(name="DCM Textile, Hisar: Civil Works, Piling and I&C for Solar",
          title="DCM Hisar Solar Civil Works & I&C | Arrays Ingenieria",
          desc="Case study: civil works for the 10 MW plant, I&C of the 2.1 MW rooftop plant and piling and I&C of a 500 kWp ground-mount plant at DCM Textile, Hisar.",
          role="Civil works, piling, installation & commissioning", year="2021-2026",
          scope=["Civil works and pile foundations for the 10 MW ground-mount plant", "Installation & commissioning of the 2.1 MW rooftop plant",
                 "Canopy erection and conventional earthing", "CEIG approval and module cleaning system",
                 "Piling and I&C of a 500 kWp ground-mount plant (2025-26)"])
_p["body"] += ["DCM has been a repeat site. In 2022 Tata Power Solar engaged Arrays Ingenieria for the installation & commissioning of the "
               "2.1 MW rooftop plant at Hisar, with its CEIG approval, module cleaning system, canopy and conventional earthing.",
               "In 2025-26 the company piled, installed and commissioned a further 500 kWp ground-mount plant at DCM Textile for Tata "
               "Power Renewable Energy."]

_p = _project("project-yiapl-14-36mw-solar-civil-fencing.html")
_p.update(name="Noida International Airport (YIAPL): 14.36 MW Solar, Piling & Fencing",
          title="14.36 MW Solar at Noida Airport (YIAPL) | Arrays Ingenieria",
          desc="Case study: pile foundations and chain-link fencing by Arrays Ingenieria for the 14.36 MW YIAPL solar project at Noida International Airport, Tata Power.",
          location="Noida International Airport, Gautam Buddh Nagar, Uttar Pradesh",
          client="YIAPL (Yamuna International Airport Pvt. Ltd.)", partner=f"{TPREL} (EPC)",
          role="Pile foundations, supply, civil works & fencing", year="2025",
          scope=["Pile foundations, 300 mm diameter, 1.8 m to 2.3 m deep", "Supply, civil work and erection of chain-link fencing (about 6.25 km tentative length)",
                 "All manpower, machinery and material for the fencing"])
_p["intro"] = ("Pile foundations and chain-link perimeter fencing for the 14.36 MW solar power project of YIAPL, the company building "
               "Noida International Airport in Uttar Pradesh.")
_p["body"] = ["In 2025 Tata Power Renewable Energy engaged Arrays Ingenieria for the construction of pile foundations "
              "(300 mm diameter, 1.8 m to 2.3 m deep) and for the supply, civil work and erection of chain-link fencing, with a "
              "tentative fence length of about 6.25 km, at the 14.36 MW YIAPL solar power project.",
              "A plant of this size needs its foundations in and its perimeter secured before installation crews can move in."]

_p = _project("project-tcpl-vaishali-319kwp-rooftop-solar.html")
_p.update(partner=f"{TPSSL} (EPC)", role="Installation & commissioning, BOS works and module cleaning system",
          scope=["Installation & commissioning of the 319.06 kW sheet-roof plant", "BOS materials, cable glands and lugs",
                 "Module cleaning system services", "Grid connection"])
_p["body"].insert(1, "In 2024 Tata Power Solar engaged the company for the installation & commissioning of the 319.06 kW sheet-roof plant, "
                     "its BOS materials, cable glands and lugs, and the module cleaning system services.")

PROJECTS += [
    dict(
        file="project-amalgamated-plantations-assam-tea-estates-solar.html",
        name="Amalgamated Plantations, Assam: Solar Across Tea Estates",
        short="Amalgamated Plantations, Assam · about 5 MW",
        title="Amalgamated Plantations Tea Estate Solar | Arrays Ingenieria",
        desc="Case study: piling, BOS works and installation & commissioning of ground-mount solar plants at Amalgamated Plantations tea estates in Assam for Tata Power.",
        capacity="About 5 MW across tea estates (3.8 MWp piled at 11 sites)", kind="Ground-mount, on-grid, multi-site",
        location="Chubwa, Kakajan, Powai, Nonoi, Diffloo, Nahortoli, Naharkatia, Namrup, Borhat and other estates, Assam",
        client="Amalgamated Plantations Pvt. Ltd. (APPL)", partner=f"{TPSSL} / {TPREL} (EPC)",
        role="Pile foundations, BOS works, installation & commissioning, module cleaning", year="2022-2026",
        cat="ground", tag="Tea Estates · Multi-Site I&C",
        hero="assets/photos/arrays-ingenieria-appl-kakajan-tea-estate-solar-assam.jpg",
        hero_alt="Solar plant at APPL's Kakajan Tea Estate, Assam, built with Arrays Ingenieria",
        intro="Ground-mount solar plants at the tea estates of Amalgamated Plantations (APPL) across Assam: foundations, balance of "
              "system, installation and commissioning, estate by estate.",
        body=["From 2022 Tata Power engaged Arrays Ingenieria on the Amalgamated Plantations programme in Assam's tea belt. The first "
              "orders covered BOS works for the plantation sites and the shifting of material from the central warehouse to each estate.",
              "In 2023 the company built pile foundations (300 mm diameter, 2.7 m long) for 11 sites totalling 3.8 MWp, and installed "
              "and commissioned the ground-mount plants at Chubwa (499 kWp), Kakajan (741 kWp) and Powai (750 kWp).",
              "Phase 2 followed in 2024: installation & commissioning at Nonoi (374 kW) and Diffloo (360 kW), orders for Nahortoli "
              "(482 kW), RHRC (122 kW), Achabam (272 kW), Naharkatia (440 kW), Namrup (408 kW) and Borhat (347 kW), and a module "
              "cleaning service across the programme.",
              "In 2026 the company carried out BOS works, piling and material transport on the 2862 kWp Amalgamated project for "
              "SolarGridX Ventures (Sustvest)."],
        scope=["Pile foundations, 300 mm diameter, 2.7 m long, at 11 sites (3.8 MWp)", "Earth pits, equipment foundations and module mounting structures",
               "Installation & commissioning of the ground-mount plants", "BOS materials: cables, glands and lugs",
               "Module cleaning system service", "Material shifting from the central warehouse to each estate"],
        photos=[("assets/photos/arrays-ingenieria-appl-kakajan-tea-estate-solar-assam.jpg", "Solar plant at APPL's Kakajan Tea Estate, Assam, built with Arrays Ingenieria")],
        docs=[], coverage=[],
        services=["solar-installation-commissioning.html", "service-piling.html", "service-ground-mount.html", "solar-for-tea-estates.html"],
    ),
    dict(
        file="project-rossell-india-assam-tea-estates-solar.html",
        name="Rossell India Tea Estates, Assam: Ground-Mount Solar I&C",
        short="Rossell India, Assam · 4 tea estates",
        title="Rossell India Tea Estate Solar Plants | Arrays Ingenieria",
        desc="Case study: piling, BOS works and installation & commissioning of ground-mount solar plants at four Rossell India tea estates in Assam, for Tata Power.",
        capacity="302 kW, 493.24 kWp, 170.51 kWp and 367 kW", kind="Ground-mount, on-grid",
        location="Kharikatia, Nagrijuli, Romai and Dikom Tea Estates, Assam",
        client="Rossell India Ltd.", partner=f"{TPSSL} / {TPREL} (EPC)",
        role="Pile foundations, BOS works, installation & commissioning, module cleaning", year="2023-2026",
        cat="ground", tag="Tea Estates · Ground-Mount I&C",
        hero=GENERIC_GROUND, hero_alt="Ground-mount solar plant built by Arrays Ingenieria (representative photo)",
        intro="Four ground-mount solar plants for Rossell India's tea estates in Assam, each built from the foundations up to "
              "commissioning by Arrays Ingenieria for Tata Power.",
        body=["Kharikatia Tea Estate (302 kW, 2023) came first: pile construction, installation & commissioning of the ground-mount "
              "plant and its BOS works.",
              "At Nagrijuli Tea Estate the company piled the site in 2024 and installed and commissioned the 493.24 kWp plant in "
              "2025, with its BOS materials, additional cabling and module cleaning system. Romai Tea Estate (170.51 kWp) followed "
              "the same pattern in 2025, and in 2026 the company piled, supplied BOS materials for, and installed and commissioned "
              "the 367 kW plant at Dikom Tea Estate."],
        scope=["Pile foundations", "Earth pits, equipment foundations and module mounting structures",
               "Installation & commissioning of each ground-mount plant", "BOS materials, inverter stands and additional cabling",
               "Module cleaning system services"],
        photos=[], docs=[], coverage=[],
        services=["solar-installation-commissioning.html", "service-piling.html", "service-ground-mount.html", "solar-for-tea-estates.html"],
    ),
    dict(
        file="project-balaji-action-sitarganj-4mwp-solar.html",
        name="Balaji Action Buildwell, Sitarganj: Solar I&C, BOS and Civil Works",
        short="Balaji Action, Uttarakhand · I&C and civil",
        title="Solar I&C and Civil Works, Balaji Action | Arrays Ingenieria",
        desc="Case study: installation & commissioning, BOS, civil works and CEIG approvals for the 4000.32 kWp Balaji Action Buildwell solar project, Sitarganj.",
        capacity="4000.32 kWp project (as described in the BOS order)", kind="Sheet-roof I&C (ordered as 3 MWp) and ground-mount civil works",
        location="Sitarganj, Uttarakhand", client="Balaji Action Buildwell Pvt. Ltd.", partner=f"{TPSSL} (EPC)",
        role="Installation & commissioning, BOS, civil works and approvals", year="2022-2023",
        cat="rooftop", tag="Industrial · Rooftop I&C",
        hero="assets/photos/arrays-ingenieria-balaji-action-tesa-sitarganj-rooftop-solar.jpg",
        hero_alt="Balaji Action Buildwell rooftop solar plant at Sitarganj, Uttarakhand, by Arrays Ingenieria",
        intro="Installation & commissioning, balance-of-system works, civil works and approvals on Balaji Action Buildwell's solar project "
              "at Sitarganj, Uttarakhand, for Tata Power Solar.",
        body=["The orders describe the project in more than one way, and we show each scope as it was ordered rather than adding the "
              "figures together: rooftop BOS services for a project of 4000.32 kWp, installation & commissioning of a sheet-roof plant "
              "described as 3 MWp, and civil works with pile foundations for a ground-mount plant also described as 3 MWp.",
              "Tata Power Solar's 2022 orders also covered a labour colony for the site crew and the CEIG approvals for the project.",
              "Further orders in 2023 covered additional I&C work, an ITB canopy, additional cable trays, fire extinguishers and sand "
              "buckets, and cable lugs: the details that take a large plant from installed to inspected and handed over."],
        scope=["Installation & commissioning of the 3 MWp sheet-roof plant", "Rooftop BOS services for the 4000.32 kWp project",
               "Civil work and pile foundations for the ground-mount portion", "CEIG approvals", "ITB canopy, cable trays and fire safety equipment",
               "Labour colony for the site crew"],
        photos=[("assets/photos/arrays-ingenieria-balaji-action-tesa-sitarganj-rooftop-solar.jpg", "Balaji Action Buildwell rooftop solar plant at Sitarganj, Uttarakhand, by Arrays Ingenieria")],
        docs=[], coverage=[],
        services=["solar-installation-commissioning.html", "service-rooftop.html", "service-civil.html"],
    ),
    dict(
        file="project-srmb-steel-durgapur-rooftop-solar.html",
        name="SRMB Steel, Durgapur: Rooftop Solar I&C in Three Phases",
        short="SRMB Steel, West Bengal · 3 phases",
        title="SRMB Steel Durgapur Rooftop Solar I&C | Arrays Ingenieria",
        desc="Case study: installation & commissioning and BOS works for SRMB Steel's 1895.4 kWp, 1060 kWp and 1.69 MWp sheet-roof solar plants at Durgapur, West Bengal.",
        capacity="1895.4 kWp, 1060 kWp and 1.69 MWp", kind="Industrial sheet roof",
        location="Durgapur, West Bengal", client="SRMB Steel (SRMB Srijan Ltd.)", partner=f"{TPSSL} (EPC)",
        role="Installation & commissioning, BOS works, module cleaning", year="2022-2023",
        cat="rooftop", tag="Industrial · Rooftop I&C",
        hero=GENERIC_ROOF, hero_alt="Industrial rooftop solar array installed by Arrays Ingenieria (representative photo)",
        intro="Three rooftop solar phases on the sheet roofs of SRMB Steel's plant at Durgapur, West Bengal, built by Arrays Ingenieria "
              "for Tata Power Solar.",
        body=["In 2022 Tata Power Solar placed orders with Arrays Ingenieria for the installation & commissioning of the 1895.4 kWp "
              "sheet-roof plant and of the 1060 kWp Phase 2 plant, and for the rooftop BOS services of the 1.69 MWp Phase III.",
              "The scope ran from earth pits and equipment foundations to module mounting structures, cabling, testing and "
              "commissioning, followed by the module cleaning service and the cable glands and lugs for each phase in 2023."],
        scope=["Earth pits and equipment foundations (ACDB, inverters, ITB)", "Module mounting structure installation",
               "Installation & commissioning of the 1895.4 kWp and 1060 kWp plants", "Rooftop BOS services for the 1.69 MWp Phase III",
               "Module cleaning system service", "Module shifting"],
        photos=[], docs=[], coverage=[],
        services=["solar-installation-commissioning.html", "service-rooftop.html"],
    ),
    dict(
        file="project-apar-industries-jharsuguda-1-2mwp-rooftop-solar.html",
        name="Apar Industries, Jharsuguda: 1.2 MWp Rooftop Solar I&C",
        short="Apar Industries, Odisha · 1.2 MWp",
        title="1.2 MWp Rooftop Solar, Apar Industries | Arrays Ingenieria",
        desc="Case study: installation & commissioning, BOS, skylight safety mesh and CEIG approval for the 1.2 MWp Apar Industries sheet-roof solar plant, Jharsuguda.",
        capacity="1.2 MWp (1203 kWp)", kind="Industrial sheet roof", location="Jharsuguda, Odisha",
        client="Apar Industries Ltd.", partner=f"{TPSSL} (EPC)",
        role="Installation & commissioning, BOS, safety mesh and CEIG approval", year="2023",
        cat="rooftop", tag="Industrial · Rooftop I&C",
        hero="assets/photos/arrays-ingenieria-rooftop-solar-installation-clean-power.jpg",
        hero_alt="Rooftop solar installation by Arrays Ingenieria (representative photo)",
        intro="A 1.2 MWp solar plant on the sheet roofs of Apar Industries at Jharsuguda, Odisha, installed and commissioned by "
              "Arrays Ingenieria for Tata Power Solar.",
        body=["Tata Power Solar's 2023 orders covered the installation & commissioning of the 1.2 MWp sheet-roof plant, its rooftop "
              "BOS services, and the fabrication, supply and installation of skylight safety mesh across the roof.",
              "Arrays Ingenieria also handled the CEIG approval and liaison for the 1203 kWp plant, and supplied the earthing strip, "
              "RS485 communication cable and cable glands later in the year."],
        scope=["Installation & commissioning of the 1.2 MWp sheet-roof plant", "Rooftop BOS services",
               "Fabrication, supply and installation of skylight safety mesh", "CEIG approval and liaison",
               "Earthing strip, RS485 cable and cable glands"],
        photos=[], docs=[], coverage=[],
        services=["solar-installation-commissioning.html", "service-rooftop.html"],
    ),
]

# Work-experience record, one row per site. Columns: years, site, capacity, state, our scope.
TRACK_RECORD = [
    ("2021-25", "DCM Textile, Hisar", "10 MW, 2.1 MW and 500 kWp", "Haryana", "Civil works and piling, rooftop I&C, canopy, earthing, CEIG approval, module cleaning"),
    ("2021", "Ramnagar solar project", "2.71 MWp ground-mount", "Uttarakhand", "Civil works and piling, I&C, module cleaning"),
    ("2021", "Tata Motors, Pantnagar (Phase 4)", "2 MWp", "Uttarakhand", "Civil works and pile foundations"),
    ("2021-23", "SRMB Steel, Durgapur", "1895.4 kWp, 1060 kWp, 1.69 MWp", "West Bengal", "Rooftop I&C, BOS, module cleaning, module shifting"),
    ("2022-23", "Balaji Action Buildwell, Sitarganj", "4000.32 kWp", "Uttarakhand", "Rooftop I&C, BOS, civil works and piling, CEIG approvals, labour colony"),
    ("2022-23", "Pernod Ricard India, Behror", "250 kW ground-mount", "Rajasthan", "Piling, I&C, BOS, CEIG approval, module cleaning, land levelling"),
    ("2022-24", "Amalgamated Plantations (APPL) tea estates", "About 5 MW, 12+ estates", "Assam", "Piling, I&C, BOS, module cleaning, logistics"),
    ("2022-23", "Tata Steel, Jamshedpur (incl. floating solar)", "", "Jharkhand", "Module cleaning systems, ballast lifting hooks"),
    ("2022", "Special Bureau rooftops, Kolkata, Patna and Agartala", "28.16, 14.08 and 15.515 kWp", "WB, Bihar, Tripura", "Rooftop BOS services"),
    ("2022, 2026", "Goodyear (North Region)", "1000.845 kWp", "", "BOS supply, transport and installation"),
    ("2022-24", "RSSB, Raipur and Bhati (Chhatarpur)", "63 kWp and 96 kW", "Chhattisgarh, Delhi", "CEIG and net-metering approval, BOS cabling, module cleaning"),
    ("2023", "Apar Industries, Jharsuguda", "1.2 MWp", "Odisha", "Rooftop I&C, BOS, skylight mesh, CEIG approval"),
    ("2023", "Singhania Tea Estate, Jalpaiguri", "400 kW ground-mount", "West Bengal", "Pile foundations and civil works"),
    ("2023", "TCPL, Siliguri", "24 kWp", "West Bengal", "Rooftop BOS, module cleaning"),
    ("2023-24", "Poolawadi Wind Farm", "", "", "Supply of 1.1 kV XLPE armoured power cable"),
    ("2023-24", "Tata Motors, Jojobera Yard, Jamshedpur", "5.579 MWp", "Jharkhand", "Piling, civil works, boundary wall, I&C, module cleaning, liaison"),
    ("2023-24", "Tata Croma, Gurugram", "500 kWp", "Haryana", "Rooftop I&C, BOS, skylight mesh, module cleaning"),
    ("2023-26", "Rossell India tea estates", "302 kW, 493.24 kWp, 170.51 kWp, 367 kW", "Assam", "Piling, I&C, BOS, module cleaning"),
    ("2024", "Tata Consumer Products (TCPL), Vaishali", "319.06 kW", "Bihar", "Rooftop I&C, BOS, module cleaning"),
    ("2024", "RSPL, Roorkee", "417 kWp", "Uttarakhand", "Rooftop I&C, BOS, skylight mesh, module cleaning"),
    ("2024", "Super Smelters, Jamuria", "1980 kW", "West Bengal", "Rooftop I&C, BOS, cable trays, module cleaning"),
    ("2024-25", "A K Automatics, Rohtak", "531 kWp", "Haryana", "Rooftop I&C, BOS, module cleaning"),
    ("2025", "SECI 300 MW solar project, Koppal", "300 MW", "Karnataka", "Pile foundations; DC installation: tracker modules, string combiner boxes, cable trenching and terminations"),
    ("2025", "YIAPL, Noida International Airport", "14.36 MW", "Uttar Pradesh", "Pile foundations, chain-link fencing"),
    ("2026", "Luhit Tea Estate, Golaghat", "488 kWp", "Assam", "I&C with BOS services"),
    ("2026", "Monokholi and Kadamba Tea Estates", "220 kWp and 234 kWp", "Assam", "I&C with BOS services"),
    ("2026", "Amalgamated project for SolarGridX (Sustvest)", "2862 kWp", "Assam", "BOS works, piling, transport"),
    ("2026", "Orangajuli Tea Estate (Goodricke)", "450 kWp", "Assam", "BOS: earthing pits"),
    ("2026", "Harmutty Tea Estate (Goodricke), North Lakhimpur", "400 kWp", "Assam", "Installation & commissioning; inaugurated 7 Oct 2026"),
]

HM = "assets/harmutty/arrays-ingenieria-ex-servicemen-led-harmutty-tea-estate-400kwp-solar-"
PROJECTS.append(dict(
    file="project-harmutty-tea-estate-400kwp-solar.html",
    name="Harmutty Tea Estate: 400 kWp Ground-Mounted Solar Plant",
    short="Harmutty Tea Estate, Assam · 400 kWp",
    title="400 kWp Solar, Harmutty Tea Estate Assam | Arrays Ingenieria",
    desc="Case study: installation and commissioning of the 400 kWp ground-mounted on-grid solar plant at Goodricke's Harmutty Tea Estate, inaugurated 7 Oct 2026.",
    capacity="400 kWp", kind="Ground-mounted, on-grid", location="Harmutty, Laluk, North Lakhimpur district, Assam 784160",
    client="Harmutty Tea Estate (Goodricke Group)", partner="Jointly developed by Tata Power Solar, Goodricke and Sustvest",
    role="Implementing partner: installation & commissioning", year="2026 (inaugurated 7 October 2026)",
    cat="ground", tag="Tea Estate · Ground-Mount I&C",
    hero=HM + "ground-mount-array-inauguration-banner.jpg",
    intro="Installation and commissioning of the 400 kWp ground-mounted, on-grid solar power plant at Goodricke's Harmutty Tea Estate "
          "in Laluk, North Lakhimpur, on the north bank of the Brahmaputra in Assam, inaugurated on 7 October 2026.",
    body=["The plant was jointly developed by Tata Power Solar, Goodricke (\"The Tea People\") and Sustvest, the same partners behind the "
          "Goodricke tea-estate solar plants at Koomber, Orangajuli and Borpatra. Arrays Ingenieria was the implementing partner for "
          "installation and commissioning, as the inauguration banner records.",
          "The 400 kWp array stands on fixed ground-mounted structures beside the tea bushes near Harmutty Tea Factory, feeding an AC "
          "distribution board that connects the plant to the estate's supply. The earthing pits are numbered and tagged with their test "
          "date and measured resistance, as we do on every plant, so the estate team can keep up the annual tests.",
          "The plant was inaugurated on 7 October 2026, a week after the Chief Minister of Assam opened our Koomber plant. "
          "The inauguration banner sets it in the national and state context: supporting India's Solar Mission, advancing the Prime "
          "Minister's Panchamrit goals and contributing to Assam's green-energy growth vision.",
          "Goodricke then presented Arrays Ingenieria with a certificate of appreciation for the installation and commissioning, "
          "acknowledging the team's professionalism, technical expertise and commitment, and its dedication, engineering excellence and "
          "meticulous approach throughout the execution of the project."],
    scope=["Installation of the 400 kWp ground-mounted module mounting structures and modules",
           "DC cabling, inverters and the AC distribution board (ACDB)", "Earthing pits with tested and tagged resistance values",
           "Grid connection (on-grid) and testing", "Commissioning and handover for the inauguration on 7 October 2026"],
    photos=[(HM + "ground-mount-array-inauguration-banner.jpg", "The 400 kWp ground-mounted solar array at Harmutty Tea Estate, North Lakhimpur, Assam, with the inauguration banner, installed and commissioned by Arrays Ingenieria"),
            (HM + "acdb-inauguration-ribbon.jpg", "AC distribution board of the 400 kWp Harmutty Tea Estate solar plant decorated with ribbon and banana plants for the inauguration, 7 October 2026"),
            (HM + "inauguration-banner.jpg", "Inauguration banner of the 400 kWp ground-mounted on-grid solar plant at Harmutty Tea Estate, 7 October 2026: Tata Power Solar, Goodricke, Sustvest and Ingenieria (installation & commissioning)"),
            (HM + "certificate-of-appreciation-handover.jpg", "Goodricke's certificate of appreciation for the 400 kWp Harmutty Tea Estate solar plant handed to Arrays Ingenieria at the tea estate office")],
    docs=[("assets/certs/goodricke-appreciation-harmutty-400kwp-arrays-ingenieria.jpg", "Goodricke certificate of appreciation: installation & commissioning of the 400 kWp ground-mounted on-grid plant at Harmutty Tea Estate")],
    coverage=[],
    services=["solar-installation-commissioning.html", "service-ground-mount.html", "solar-for-tea-estates.html"],
))

# Case-study order: the Chief Minister's inauguration, then installation & commissioning work, then piling and civil works.
_ORDER = ["koomber", "jayshree", "orangajuli", "barpatra", "harmutty", "super-smelters", "amalgamated", "rossell", "balaji", "srmb", "apar",
          "tcpl", "assam-1711", "tata-motors", "dcm", "yiapl", "seci"]
PROJECTS.sort(key=lambda p: next(i for i, k in enumerate(_ORDER) if k in p["file"]))

_p = _project("project-seci-300mw-koppal-pile-foundation.html")
_p.update(name="SECI 300 MW Solar Project, Koppal: Piling and DC Installation",
          role="Pile foundations and DC installation", year="2025 (agreement dated 17 February 2025)",
          scope=["Pile foundations, 300 mm diameter, about 1.7 m deep, for the module mounting structures",
                 "Loading and installation of 112-module interior and exterior trackers", "Installation of string combiner boxes",
                 "Termination of 1C x 240 and 300 sq mm cables", "Cable trenching, sand bedding, protection bricks, route markers and warning tape",
                 "DWC HDPE pipe and RCC hume pipe crossings"])
_p["body"] = ["Tata Power Renewable Energy Ltd. (TPREL) issued Arrays Ingenieria an outline agreement on 17 February 2025 for the "
              "construction of pile foundations at the 300 MW SECI project.",
              "In July 2025 TPREL extended the company's role on the same project to DC installation: loading and installing modules "
              "on 112-module interior and exterior trackers, installing string combiner boxes, terminating the main DC cables, and "
              "trenching and laying the cable routes.",
              "Pile foundations carry the module mounting structures of a ground-mount plant, so their depth, alignment and levels "
              "decide how the rest of the plant goes up. Arrays Ingenieria's veteran-led site teams work to the EPC's specifications and schedule."]

# ------------------------------------------------ case-study detail ----
# Timelines (month of each order), on-site challenges and the I&C scope, for the solar case studies.
_project("project-amalgamated-plantations-assam-tea-estates-solar.html").update(
    ic_scope="ground",
    phases=[("Aug-Nov 2022", "BOS services and logistics", "Balance-of-system services for the plantation sites, and shifting of material from the central warehouse to Chubwa, Kakajan and Powai."),
            ("Nov 2022", "Installation & commissioning, phase 1", "Ground-mount plants at Chubwa (499 kWp), Kakajan (741 kWp) and Powai (750 kWp)."),
            ("Dec 2022", "Pile foundations", "Augered piles, 300 mm diameter, for the plantation plants."),
            ("Mar 2023", "Equipment foundations", "Material and labour for ACDB foundations at Kakajan and Powai, and further material shifting."),
            ("Sep-Oct 2023", "Phase 2 begins", "I&C at Nonoi (374 kW) and Diffloo (360 kW); orders for Nahortoli, RHRC, Achabam, Naharkatia, Namrup and Borhat; cable glands and lugs."),
            ("Oct 2023", "Piling at 11 sites", "Pile foundations, 300 mm diameter and 2.7 m long, for 11 sites totalling 3.8 MWp."),
            ("Jan 2024", "Module cleaning", "Module cleaning service across the programme."),
            ("Mar-Aug 2024", "BOS completion and support", "Glands and lugs at Diffloo, Naharkatia, Nonoi, Nahortoli, Namrup and Borhat; module shifting between estates and module replacement support."),
            ("2026", "2862 kWp project for SolarGridX", "Transport of materials, BOS works and piling on the 2862 kWp Amalgamated project for SolarGridX Ventures (Sustvest).")],
    detail=[("Many estates, one standard", "With a dozen estates spread across Upper Assam, the job was as much logistics as engineering: material moved from a central warehouse, crews rotated between gardens, and every site was built and documented the same way."),
            ("Soil and monsoon", "Tea-garden land is soft and wet for much of the year. Augered piles sized for each site, and equipment raised on proper foundations, keep the plants stable and dry through Assam's monsoon."),
            ("Working inside live estates", "Plants sit near factories, labour lines and plantation roads. Work was planned around the plucking season and estate traffic, with safety lines and posters on every site.")])

_project("project-rossell-india-assam-tea-estates-solar.html").update(
    ic_scope="ground",
    phases=[("Mar-Apr 2023", "Kharikatia Tea Estate, 302 kW", "Installation & commissioning of the ground-mount plant, pile construction and rooftop-services BOS."),
            ("Sep 2023", "Kharikatia close-out", "Cable glands and final BOS items."),
            ("Oct-Nov 2024", "Nagrijuli Tea Estate, 493.24 kWp", "Installation & commissioning, BOS materials, pile foundations and module cleaning services."),
            ("Dec 2024-Jan 2025", "Nagrijuli additions", "Additional BOS cabling."),
            ("Jan-Apr 2025", "Romai Tea Estate, 170.51 kWp", "BOS materials, pile foundations, installation & commissioning, module cleaning, inverter stands and additional BOS."),
            ("Dec 2025-Feb 2026", "Dikom Tea Estate, 367 kW", "Installation & commissioning, piling services and BOS materials.")],
    detail=[("Four estates, four sizes", "From 170 kWp at Romai to 493 kWp at Nagrijuli, each plant was sized to the estate's load and land, but built to the same EPC specification and checklists."),
            ("Repeat client, rising scale", "Rossell's estates came back for a second, third and fourth plant between 2023 and 2026, each time with the full chain of piling, BOS, I&C and cleaning."),
            ("Foundations first", "Piling was done ahead of installation on every estate, so structures went up level and true on soft tea-garden soil.")])

_project("project-balaji-action-sitarganj-4mwp-solar.html").update(
    ic_scope="rooftop",
    phases=[("May 2022", "Rooftop services for 4000.32 kWp", "BOS services for the full project."),
            ("Jun 2022", "Labour colony", "Construction of a labour colony for the site crew."),
            ("Jul 2022", "I&C and approvals", "Installation & commissioning of the 3 MWp sheet-roof plant; CEIG approvals for the project."),
            ("Aug-Sep 2022", "Safety and ground-mount civil works", "Portable fire extinguishers and sand buckets; civil works and pile foundations for the ground-mount plant (ordered as 3 MWp)."),
            ("Dec 2022-Feb 2023", "BOS completion", "Further rooftop services, cable lugs and additional cable trays."),
            ("Mar 2023", "Final works", "ITB canopy and additional I&C works.")],
    detail=[("Roof and ground on one site", "A large sheet-roof plant and ground-mount civil works meant two very different jobs, height work and piling, on one industrial campus."),
            ("A camp for the crew", "With a large crew on site for months, a proper labour colony was part of the scope: decent living conditions are part of working safely."),
            ("Approvals as part of the job", "CEIG approvals for the project were in our scope, so inspection was planned into the schedule rather than added at the end.")])

_project("project-srmb-steel-durgapur-rooftop-solar.html").update(
    ic_scope="rooftop",
    phases=[("Dec 2021", "1895.4 kWp sheet-roof plant", "Installation & commissioning order for the first and largest phase."),
            ("Jun-Jul 2022", "Rooftop services", "BOS services for the 1895.4 kWp phase and for Phase III (1.69 MWp)."),
            ("Aug 2022", "Phase 2: 1060 kWp", "Installation & commissioning of the 1060 kWp sheet-roof plant and its module cleaning system."),
            ("Nov 2022", "Module shifting", "Module shifting work at the 1.615 MW SRMB Srijan plant."),
            ("Mar 2023", "Close-out", "Cable glands and lugs for the 1.06 MWp and 1.895 MWp phases.")],
    detail=[("Steel-plant roofs", "Steel-plant sheds are high, hot and busy. Lifting material safely to the roof, lifelines and skylight protection came before any module went up."),
            ("Phase after phase", "Three phases on one campus over two years meant matching each new phase to the earlier ones, from string layouts to labelling."),
            ("Cleaning built in", "Industrial dust makes cleaning essential, so the module cleaning system was installed and commissioned with the plant.")])

_project("project-apar-industries-jharsuguda-1-2mwp-rooftop-solar.html").update(
    ic_scope="rooftop",
    phases=[("Feb 2023", "Installation & commissioning", "I&C of the 1.2 MWp sheet-roof plant and its rooftop BOS services."),
            ("Mar 2023", "Skylight safety mesh", "Fabrication, supply and installation of skylight guard mesh across the roof."),
            ("Jun 2023", "Communication and earthing", "Earthing strip and RS485 communication cable."),
            ("Jul 2023", "CEIG approval", "CEIG approval and liaison for the 1203 kWp plant."),
            ("Aug-Sep 2023", "Close-out", "Additional skylight mesh and cable glands.")],
    detail=[("Safety over translucent sheets", "The roof had many skylight sheets. Fabricated guard mesh over them protects installers and, for years afterwards, the cleaning crews."),
            ("Inspection-ready", "With the CEIG approval in our scope, test records and drawings were prepared to the inspector's formats from the start."),
            ("Monitoring", "RS485 communication cabling links the inverters to monitoring, so the owner can see the plant's output every day.")])

_project("project-super-smelters-1980kwp-rooftop-solar.html").update(
    ic_scope="rooftop",
    phases=[("Apr 2024", "Installation & commissioning", "I&C of the 1980 kW sheet-roof plant, its BOS materials and additional cable, and the module cleaning system."),
            ("Jun 2024", "Fixings", "Self-drilling screws for the sheet-roof structures."),
            ("Jul 2024", "Cable trays and excavation", "Additional cable-tray services and earth excavation."),
            ("Aug 2024", "Earthing strip", "Earthing strip for the plant."),
            ("Inauguration", "Plant inaugurated", "Inaugurated by Super Smelters' director, with Lt. Gen. Ashish Ranjan Prasad (Retd) present; Super Smelters issued a letter of appreciation.")])

_project("project-tcpl-vaishali-319kwp-rooftop-solar.html").update(
    ic_scope="rooftop",
    phases=[("Mar 2024", "Installation & commissioning", "I&C of the 319.06 kW sheet-roof plant, its BOS materials and module cleaning services."),
            ("Apr 2024", "In the news", "Dainik Bhaskar's Hajipur edition reported the plant on 3 April 2024."),
            ("May 2024", "Close-out", "Cable glands and lugs.")])

_project("project-tata-motors-jamshedpur-5-5mw-solar-piling.html").update(
    ic_scope="ground",
    phases=[("Feb 2023", "Pre-cast boundary wall", "Supply, civil work and erection of the pre-cast boundary wall."),
            ("Apr 2023", "Pull-out tests and cleaning", "Pull-out tests on the piles; module cleaning system for the plant."),
            ("Jun 2023", "Land development", "Land development for the plant."),
            ("Jul 2023", "Piling and civil work", "Pile foundations, 300 mm diameter and 1.8 m deep, and civil works for the 5.579 MWp plant at Jojobera Yard."),
            ("Sep 2023", "Installation & commissioning", "I&C of the 5.579 MWp plant; gate fabrication and installation."),
            ("Oct 2023-Feb 2024", "Site services and liaison", "Temporary water supply, and liaison with government offices and local bodies.")],
    detail=[("A complete site package", "From land development and the boundary wall to piling, installation and liaison, almost every site trade on this plant was in our hands."),
            ("Proving the piles", "Pull-out tests confirmed that the piles would hold the structures against wind uplift before installation began."),
            ("Inside an industrial yard", "Working within Tata Motors' Jojobera Yard meant strict access, safety and housekeeping rules throughout.")])

_project("project-dcm-hisar-10mw-solar-civil-works.html").update(
    phases=[("Jun-Sep 2021", "10 MW civil works", "Civil works and pile foundations with pile caps for the 9979 kWp ground-mount plant, and electrical equipment foundations."),
            ("Apr-Jun 2022", "2.1 MW rooftop I&C", "Installation & commissioning of the 2.1 MW rooftop plant, its module cleaning system and CEIG approval."),
            ("Aug-Dec 2022", "BOS, canopy and earthing", "Rooftop BOS services, canopy installation and conventional earthing for the 2.1 MWp plant."),
            ("Sep 2023", "Close-out", "Hardware, glands and lugs."),
            ("Aug-Dec 2025", "500 kWp ground-mount", "BOS, installation & commissioning and piling for a further 500.96 kWp ground-mount plant.")],
    detail=[("A repeat site over five years", "DCM Textile's Hisar mill brought us back for civil works, a rooftop plant and a ground-mount plant between 2021 and 2025."),
            ("Haryana's hard ground", "Pile foundations with pile caps were designed for the site's soil and wind loads."),
            ("Inspection and safety", "CEIG approval and conventional earthing were part of the rooftop scope, so the plant was handed over inspection-ready.")])

_project("project-seci-300mw-koppal-pile-foundation.html").update(
    phases=[("17 Feb 2025", "Outline agreement", "Agreement for the construction of pile foundations at the 300 MW SECI project, Koppal."),
            ("Mar 2025", "Piling", "Augered piles, 300 mm diameter and about 1.75 m deep."),
            ("Apr-Jul 2025", "DC installation", "Loading and installing modules on 112-module interior and exterior trackers, string combiner boxes, cable terminations and trenching."),
            ("Jul 2025", "Further piling", "Pile foundations, 300 mm diameter and 1.7 m deep, with extra items.")],
    detail=[("Scale", "Utility-scale piling means thousands of piles set to tight tolerances of position, depth and level, every day, for weeks."),
            ("Trackers", "Tracker structures demand accurate piles: a misaligned pile stops a tracker row from moving freely."),
            ("From civil to electrical", "Moving from piling to DC installation on the same project shows how one veteran-led team can cover several trades on a large site.")])

_project("project-yiapl-14-36mw-solar-civil-fencing.html").update(
    phases=[("Mar 2025", "Pile foundations", "Construction of pile foundations, 300 mm diameter, 1.8 m, 2 m and 2.3 m deep."),
            ("Jun 2025", "Chain-link fencing", "Supply, civil work and erection of chain-link fencing, tentative length about 6.25 km.")],
    detail=[("An airport site", "Work at Noida International Airport runs under strict access and safety control, with every crew and vehicle accounted for."),
            ("Kilometres of fence", "Around 6.25 km of chain-link fencing means steady, surveyed progress: posts set in concrete, mesh tensioned, gates aligned."),
            ("Piles to suit the ground", "Three pile depths were used, matched to the ground conditions across the 14.36 MW site.")])
