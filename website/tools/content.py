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
        hero="assets/photos/proj-jayshree.jpg",
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
        photos=[("assets/photos/proj-jayshree.jpg", "Jayshree Tea Estate ground-mount solar plant in Sonari, Assam, built by Arrays Ingenieria"),
                ("assets/photos/proj-towkok.jpg", "Towkok Tea Estate 535 kWp ground-mount solar plant, Assam, by Arrays Ingenieria"),
                ("assets/photos/proj-manjushree.jpg", "Manjushree Tea Estate 500 kWp ground-mount solar plant, Assam, by Arrays Ingenieria"),
                ("assets/photos/proj-grid1035.jpg", "1035 kWp grid-connected solar system for Jay Shree Tea, built by Arrays Ingenieria")],
        docs=[("assets/orders/po-jayshree-1035.jpg", "Jay Shree Tea purchase order, 2 Dec 2024: supply, installation & commissioning of 1035 kWp"),
              ("assets/certs/appreciation-jayshree-towkok.jpg", "Jay Shree Tea certificate of appreciation: 535 kWp, Towkok Tea Estate"),
              ("assets/certs/appreciation-jayshree-500kwp.jpg", "Jay Shree Tea certificate of appreciation: 500 kWp ground-mount solar")],
        coverage=["sentinel-jayshree", "jayshree-towkok"],
        services=["capex-solar-epc.html", "solar-installation-commissioning.html", "service-ground-mount.html", "solar-for-tea-estates.html"],
    ),
    dict(
        file="project-orangajuli-tea-estate-450kw-solar.html",
        name="Orangajuli Tea Estate: 450 kW Ground-Mount Solar Plant",
        short="Orangajuli Tea Estate, Assam · 450 kW",
        title="450 kW Solar, Orangajuli Tea Estate | Arrays Ingenieria",
        desc="Case study: 450 kW grid-connected ground-mount solar plant at Goodricke's Orangajuli Tea Estate, Udalguri, Assam, commissioned on Janmashtami 2026.",
        capacity="450 kW", kind="Ground-mount, grid-connected", location="Orangajuli, Panerihaat, Udalguri district, Assam",
        client="Orangajuli Tea Estate (Goodricke Group)", partner="Tata Power Renewable Energy Ltd. & Sustvest (3.11 MW programme)",
        role="Installation partner", year="2026 (commissioned 4 September 2026)",
        cat="ground", tag="Tea Estate · Ground-Mount",
        hero="assets/photos/orangajuli-450kw-solar-inauguration-assam.jpg",
        intro="A 450 kW grid-connected ground-mount solar plant at Orangajuli Tea Estate, Panerihaat, in Udalguri, Assam, commissioned "
              "on Janmashtami, 4 September 2026, and inaugurated by the estate manager, Daljit Singh Maan.",
        body=[
            "The plant is part of a 3.11 MW solar programme for Goodricke Group's tea estates, developed jointly by Tata Power Renewable "
            "Energy Ltd. and Sustvest, with Arrays Ingenieria as the installation partner.",
            "With Orangajuli, Arrays Ingenieria reported that it had completed the installation and commissioning of solar plants at 18 "
            "tea gardens in Assam. The launch was reported by the Hindi daily Prerna Bharati and filmed by NE Reports.",
        ],
        scope=["Installation of the ground-mount solar plant", "Grid connection", "Testing and commissioning"],
        photos=[("assets/photos/orangajuli-450kw-solar-inauguration-assam.jpg",
                 "Ribbon-cutting at the 450 kW Orangajuli Tea Estate solar plant in Udalguri, Assam, built by Arrays Ingenieria")],
        docs=[("assets/news/prerna-bharati-orangajuli-450kw-solar-ingenieria.jpg", "Prerna Bharati, 5 Sep 2026: report on the Orangajuli plant")],
        coverage=["ne-reports-orangajuli", "hub-network-orangajuli", "prerna-bharati-orangajuli"],
        services=["solar-installation-commissioning.html", "service-ground-mount.html", "solar-for-tea-estates.html"],
    ),
    dict(
        file="project-barpatra-tea-estate-230kw-solar.html",
        name="Barpatra (Borpatra) Tea Estate: 230 kW On-Grid Solar Plant",
        short="Barpatra Tea Estate, Assam · 230 kW",
        title="230 kW Solar, Barpatra Tea Estate | Arrays Ingenieria",
        desc="Case study: 230 kW on-grid ground-mount solar at Goodricke's Barpatra (Borpatra) Tea Estate, Sonari, Assam, with net-metering approvals from APDCL.",
        capacity="230 kW", kind="Ground-mount, on-grid (net-metered)", location="Sonari, Assam",
        client="Barpatra Tea Estate (Goodricke Group)", partner="Tata Power Renewable Energy Ltd. & Sustvest (3.11 MW programme)",
        role="Turnkey implementation partner", year="2026 (commissioned September 2026)",
        cat="ground", tag="Tea Estate · Ground-Mount",
        hero="assets/news/barpatra-tea-estate-230kw-solar-newspaper-print.jpg",
        intro="A 230 kW on-grid ground-mount solar plant at Goodricke Group's Barpatra (Borpatra) Tea Estate in Sonari, Assam, formally "
              "inaugurated by the estate manager, Satish Pandey, in September 2026.",
        body=[
            "The plant is part of the 3.11 MW commercial & industrial solar programme for Goodricke's estates, developed jointly by Tata "
            "Power Renewable Energy Ltd. and Sustvest, with Arrays Ingenieria as the turnkey implementation partner.",
            "Arrays Ingenieria obtained the net-metering and statutory approvals from Assam Power Distribution Company Ltd. (APDCL), "
            "including technical inspection by the Namrup SDE and the APDCL Dibrugarh TRD department, so the plant could start on schedule.",
            "Barpatra brought the company's count to 19 on-grid solar plants in Assam's tea gardens, as reported in the Hindi press on "
            "25 September 2026.",
            "Under its motto \"Olive Green to Go Green\", Arrays Ingenieria brings military-grade discipline and engineering precision "
            "to building critical clean-energy infrastructure. For its team of veterans, working in renewable energy is a \"second "
            "innings of national service\", contributing directly to sustainable nation-building.",
        ],
        impact=dict(
            heading="Driving the PM's Panchamrit and Assam's green-energy goals",
            paras=[
                "By cutting reliance on fossil fuels in the energy-intensive tea-processing sector, the Barpatra solar installation "
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
        photos=[("assets/news/barpatra-tea-estate-230kw-solar-newspaper-print.jpg",
                 "Printed newspaper report on the 230 kW Barpatra (Borpatra) Tea Estate solar plant by Arrays Ingenieria")],
        docs=[("assets/news/barpatra-tea-estate-230kw-solar-ingenieria.jpg", "Hindi newspaper report, 25 Sep 2026")],
        coverage=["barpatra-230kw", "sonari-live"],
        services=["solar-installation-commissioning.html", "service-epc.html", "solar-for-tea-estates.html"],
    ),
    dict(
        file="project-super-smelters-1980kwp-rooftop-solar.html",
        name="Super Smelters: 1980.3 kWp Rooftop Solar Plant",
        short="Super Smelters, West Bengal · 1980.3 kWp",
        title="1980.3 kWp Rooftop Solar, Super Smelters | Arrays Ingenieria",
        desc="Case study: a 1980.3 kWp industrial rooftop solar plant at Super Smelters Ltd., Jamuria, West Bengal, built with Tata Power Solar.",
        capacity="1980.3 kWp (about 2 MW)", kind="Industrial rooftop", location="Jamuria (Asansol), West Bengal",
        client="Super Smelters Ltd.", partner="Tata Power Solar",
        role="Implementation partner", year="Commissioned and inaugurated",
        cat="rooftop", tag="Industrial · Rooftop",
        hero="assets/photos/proj-supersmelters.jpg",
        intro="A 1980.3 kWp rooftop solar power plant, about 2 MW, on the open roofs of Super Smelters Ltd., described by the local "
              "press as the largest industrial unit in the Jamuria industrial area of West Bengal.",
        body=[
            "The plant was built in collaboration with Tata Power Solar, with Arrays Ingenieria as implementation partner. It was "
            "inaugurated by Super Smelters' director, Sanjay Singhania, with Lt. Gen. Ashish Ranjan Prasad (Retd) of Arrays Ingenieria present.",
            "Super Smelters issued Arrays Ingenieria a letter of appreciation for the project, and the inauguration was covered by Sanmarg "
            "and other Hindi dailies.",
        ],
        scope=["Rooftop solar installation", "Electrical works", "Testing and commissioning"],
        photos=[("assets/photos/proj-supersmelters.jpg", "Super Smelters 1980.3 kWp rooftop solar plant in West Bengal, built by Arrays Ingenieria with Tata Power Solar"),
                ("assets/press/event-inauguration.jpg", "Inauguration of the 1980.3 kWp Super Smelters solar plant, Arrays Ingenieria"),
                ("assets/photos/proj-rooftop-pano.jpg", "Large industrial rooftop solar array installed by Arrays Ingenieria")],
        docs=[("assets/certs/appreciation-super-smelters.jpg", "Super Smelters Ltd. letter of appreciation, 1980.3 kWp solar plant")],
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
        hero="assets/photos/proj-seci.jpg",
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
        photos=[("assets/photos/proj-seci.jpg", "SECI 300 MW solar park pile-foundation works at Koppal, Karnataka, by Arrays Ingenieria")],
        docs=[("assets/orders/wo-tatapower-seci.jpg", "Tata Power (TPREL) outline agreement, 17 Feb 2025: pile foundation work, 300 MW SECI, Koppal")],
        coverage=[],
        services=["service-piling.html", "service-civil.html", "solar-installation-commissioning.html"],
    ),
    dict(
        file="project-dcm-hisar-10mw-solar-civil-works.html",
        name="DCM Textile, Hisar: Civil Works for a 10 MW Solar Plant",
        short="DCM Hisar, Haryana · 10 MW civil",
        title="10 MW Solar Civil Works, DCM Hisar | Arrays Ingenieria",
        desc="Case study: civil works for the 9979 kWp (10 MW) solar plant at DCM Textile, Hisar, Haryana, under a Tata Power work order.",
        capacity="9979 kWp (10 MW)", kind="Ground-mount, civil works", location="Hisar, Haryana",
        client="Tata Power", partner="DCM Textile (plant owner)",
        role="Civil works contractor", year="2021 (work order dated 18 June 2021)",
        cat="civil", tag="Industrial · Civil Works",
        hero="assets/photos/proj-dcm-hisar.jpg",
        intro="Civil works for a 9979 kWp (10 MW) ground-mount solar plant at DCM Textile in Hisar, Haryana.",
        body=[
            "Tata Power issued Arrays Ingenieria the work order on 18 June 2021 for civil works at the 9979 kWp plant. Tata Power "
            "has since engaged the company for piling, civil works and installation on projects across India.",
        ],
        scope=["Civil works for the 10 MW ground-mount plant", "Work to Tata Power specifications"],
        photos=[("assets/photos/proj-dcm-hisar.jpg", "DCM Hisar 10 MW ground-mount solar project civil works, Haryana, by Arrays Ingenieria")],
        docs=[("assets/orders/wo-tatapower-dcm.jpg", "Tata Power work order, 18 Jun 2021: civil works at 9979 kWp DCM Textile, Hisar")],
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
        hero="assets/photos/proj-tml.jpg",
        intro="Piling and civil works for the 5.5 MW solar plant at Tata Motors in Jamshedpur, Jharkhand.",
        body=[
            "Tata Power issued Arrays Ingenieria the work order on 27 July 2023 for piling and civil work for the 5.5 MW plant at Tata "
            "Motors, Jamshedpur. The scope included a pre-cast boundary wall around the plant.",
        ],
        scope=["Pile foundations for the module mounting structures", "Civil works", "Pre-cast boundary wall"],
        photos=[("assets/photos/proj-tml.jpg", "Tata Motors 5.5 MW solar piling and civil works in Jamshedpur by Arrays Ingenieria"),
                ("assets/photos/proj-precast.jpg", "Pre-cast boundary wall for the Tata Motors solar plant, Jamshedpur, by Arrays Ingenieria")],
        docs=[("assets/orders/wo-tatapower-tml.jpg", "Tata Power work order, 27 Jul 2023: piling & civil work for TML 5.5 MW, Jamshedpur")],
        coverage=[],
        services=["service-piling.html", "service-civil.html"],
    ),
    dict(
        file="project-yiapl-14-36mw-solar-civil-fencing.html",
        name="YIAPL: 14.36 MW Solar Project, Supply, Civil Works & Fencing",
        short="YIAPL, Uttar Pradesh · 14.36 MW",
        title="14.36 MW Solar Civil Works & Fencing, UP | Arrays Ingenieria",
        desc="Case study: supply, civil works and chain-link fencing for the 14.36 MW YIAPL solar power project in Uttar Pradesh.",
        capacity="14.36 MW", kind="Ground-mount, civil & fencing", location="Uttar Pradesh",
        client="YIAPL", partner="",
        role="Supply, civil works & fencing", year="",
        cat="civil", tag="Utility-Scale · Civil & Fencing",
        hero="assets/photos/proj-yiapl.jpg",
        intro="Supply, civil works and chain-link fencing for the 14.36 MW YIAPL solar power project in Uttar Pradesh.",
        body=[
            "A plant of this size needs its perimeter secured and its civil works finished before installation crews can move in. "
            "Arrays Ingenieria delivered the supply, civil work and chain-link fencing for the site.",
        ],
        scope=["Supply of materials", "Civil works", "Chain-link perimeter fencing"],
        photos=[("assets/photos/proj-yiapl.jpg", "YIAPL 14.36 MW solar power project civil works and fencing in Uttar Pradesh by Arrays Ingenieria")],
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
        hero="assets/photos/how-photo.jpg",
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
        photos=[("assets/news/news-bhaskar-tcpl.jpg", "Dainik Bhaskar report on the 319 kWp rooftop solar plant by Arrays Ingenieria in Vaishali, Bihar")],
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
        hero="assets/photos/proj-assam-rooftop.jpg",
        intro="Supply of components and installation & commissioning of a 1711.66 kWp on-grid solar PV project in Assam.",
        body=[
            "SolarGridX Ventures Pvt. Ltd., which trades as Sustvest, appointed Arrays Ingenieria as contractor by a purchase order "
            "dated 25 March 2026, for the supply of components and the installation and commissioning of the project.",
            "It is a clear example of the company's installation & commissioning (I&C) work for solar developers: the developer "
            "finances and owns the project, and Arrays Ingenieria's veteran-led crews build and commission it.",
        ],
        scope=["Supply of components (as per the contract annexure)", "Installation", "Commissioning"],
        photos=[("assets/photos/proj-assam-rooftop.jpg", "1711.66 kWp on-grid solar PV project in Assam by Arrays Ingenieria")],
        docs=[("assets/orders/po-sustvest-assam.jpg", "Sustvest (SolarGridX) purchase order, 25 Mar 2026: supply, installation & commissioning of 1711.66 kWp")],
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
     "Yes. At Barpatra Tea Estate in Assam we obtained the net-metering and statutory approvals from APDCL, including its technical "
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
    ("Tata Power Renewable Energy Ltd. / Tata Power Solar", "EPC partner",
     "Pile foundations for the 300 MW SECI project at Koppal, civil works for the 10 MW DCM Textile plant, piling and civil works for "
     "Tata Motors' 5.5 MW plant, and implementation of tea-estate and industrial plants built under Tata Power's EPC contracts.",
     ["project-seci-300mw-koppal-pile-foundation.html", "project-dcm-hisar-10mw-solar-civil-works.html",
      "project-tata-motors-jamshedpur-5-5mw-solar-piling.html", "project-super-smelters-1980kwp-rooftop-solar.html"]),
    ("Jay Shree Tea & Industries Ltd. (BK Birla Group)", "Client",
     "1035 kWp across Towkok and Manjushree Tea Estates, and solar plants at the Dewan, Labac and Burtoll gardens of the Dewan Group of Tea Estates.",
     ["project-jayshree-tea-1mw-solar-assam.html"]),
    ("Goodricke Group", "Plant owner",
     "Solar plants at Koomber (595 kWp, inaugurated by the Chief Minister of Assam), Orangajuli (450 kW) and Barpatra (230 kW) Tea Estates under the 3.11 MW programme with Tata Power Renewable Energy and Sustvest.",
     ["project-koomber-tea-estate-595kwp-solar-cm-inauguration.html", "project-orangajuli-tea-estate-450kw-solar.html", "project-barpatra-tea-estate-230kw-solar.html"]),
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
    ("Tata Steel", "Plant owner", "A solar project at Noamundi, Jharkhand.", []),
    ("Amalgamated Plantations (APPL)", "Plant owner", "A solar project at Kakajan Tea Estate, Assam.", []),
    ("YIAPL", "Client", "Supply, civil works and chain-link fencing for a 14.36 MW solar project in Uttar Pradesh.",
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
    dict(num="1", suffix=" crore", label="Households targeted for rooftop solar under PM Surya Ghar",
         url="https://pib.gov.in/PressReleasePage.aspx?PRID=2010133"),
]

# -------------------------------------------------------------- schemes ----
# (title, who it is for, points, how we fit in, source name, source url)
SCHEMES = [
    ("PM Surya Ghar: Muft Bijli Yojana", "Homes",
     ["Launched by the Prime Minister on 13 February 2024; approved by the Union Cabinet on 29 February 2024 with an outlay of Rs 75,021 crore",
      "Central financial assistance of 60% of system cost for 2 kW and 40% of the additional cost between 2 and 3 kW, capped at 3 kW",
      "At benchmark prices: Rs 30,000 for 1 kW, Rs 60,000 for 2 kW and Rs 78,000 for 3 kW or more",
      "Collateral-free loans of around 7% for residential systems up to 3 kW; applications through the National Portal"],
     "The scheme is aimed at households. Our focus is commercial, industrial and tea-estate plants, which fall outside it.",
     "PIB, 29 Feb 2024", "https://pib.gov.in/PressReleasePage.aspx?PRID=2010133"),
    ("PM-KUSUM", "Farmers, cooperatives, panchayats, FPOs",
     ["Launched in March 2019 and scaled up in January 2024",
      "Component A: decentralised ground- or stilt-mounted grid-connected solar plants of up to 2 MW on farmers' land, with the power bought by DISCOMs at a pre-fixed tariff",
      "Component B: standalone solar agriculture pumps in off-grid areas",
      "Component C: solarisation of grid-connected agriculture pumps, individually or at feeder level"],
     "Component A plants are ground-mount plants of up to 2 MW: the pile foundations, civil works, installation and commissioning we do every day.",
     "PIB, 6 Aug 2024", "https://pib.gov.in/PressReleasePage.aspx?PRID=2042069"),
    ("Solar in Assam's tea gardens", "Tea estates in Assam",
     ["The Chief Minister of Assam has announced that tea garden owners may use up to 5% of their land for solar generation",
      "Assam's target is 6,000 MW of installed green energy capacity by 2030"],
     "We have built 19 on-grid plants in Assam's tea gardens and know the estates, the land, DG synchronisation and APDCL approvals.",
     "Himanta Biswa Sarma, 22 Sep 2026", "https://himantabiswa.substack.com/p/rewriting-assams-energy-future"),
    ("Accelerated depreciation", "Businesses that own their plant",
     ["A business that owns a solar plant can depreciate it faster than ordinary assets under the Income Tax Act, lowering tax in the early years",
      "Available only when you own the plant, which is why it matters for the CAPEX model"],
     "Every plant we build on the CAPEX model belongs to the client, so the benefit is theirs. Check the current rate with your tax adviser.",
     "Income Tax Act, 1961", ""),
    ("Net metering", "Grid-connected consumers",
     ["Power exported to the grid is offset against power drawn, under the rules of your state DISCOM and electricity regulator"],
     "We handle the net-metering application and inspections; at Barpatra Tea Estate we obtained the approvals from APDCL.",
     "State electricity regulations", ""),
    ("ALMM: approved modules", "Government-linked projects",
     ["MNRE's Approved List of Models and Manufacturers sets which solar modules may be used in government-linked projects"],
     "We are not a manufacturer, so we specify the ALMM-listed or client-approved makes each project requires.",
     "Ministry of New and Renewable Energy", ""),
]

# ------------------------------------------------------------- timeline ----
# (date label, iso, title, text, link)
TIMELINE = [
    ("Oct 2018", "2018-10", "Company founded",
     "Arrays Ingenieria Pvt. Ltd. is incorporated in New Delhi. Founded by Lt. Gen. Ashish Ranjan Prasad (Retd), it sets out to give fellow veterans a second innings in green energy.", "about.html"),
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
    ("Sep 2026", "2026-09", "Orangajuli and Barpatra",
     "450 kW at Orangajuli on Janmashtami and 230 kW at Barpatra: 19 on-grid plants in Assam's tea gardens.", "solar-for-tea-estates.html"),
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
        ("Orangajuli Tea Estate: 450 kW, Udalguri", "project-orangajuli-tea-estate-450kw-solar.html"),
        ("Barpatra (Borpatra) Tea Estate: 230 kW, Sonari", "project-barpatra-tea-estate-230kw-solar.html"),
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

# ------------------------------------------------- Koomber inauguration ----
# Inaugurated by the Chief Minister of Assam, 1 October 2026. Facts from The
# Sentinel, the CM's Office and MLA Kaushik Rai's posts, and the company's own
# press release; photo captions describe only what each photo shows.
K = "assets/koomber/"
KOOMBER_ALBUM = [
    (K + "cm-inaugurates-595kwp-solar-plant-ribbon-cutting.jpg", "Chief Minister Dr Himanta Biswa Sarma cuts the ribbon to inaugurate the 595 kWp solar plant at Koomber Tea Estate"),
    (K + "cm-cuts-ribbon-595kwp-solar-plant-koomber.jpg", "The Chief Minister of Assam cuts the ribbon at the Koomber Tea Estate solar plant"),
    (K + "arrays-ingenieria-welcomes-cm-with-assamese-gamosa.jpg", "Shri Ranveer Singh of Arrays Ingenieria welcomes the Chief Minister with a traditional Assamese gamosa"),
    (K + "gamosa-welcome-cm-arrays-ingenieria.jpg", "The Chief Minister is felicitated with a gamosa by Arrays Ingenieria at the inauguration"),
    (K + "cm-tours-koomber-solar-plant-with-arrays-ingenieria.jpg", "Arrays Ingenieria takes the Chief Minister around the 595 kWp ground-mount solar plant"),
    (K + "koomber-tea-estate-595kwp-ground-mount-solar-plant.jpg", "The 595 kWp ground-mounted on-grid solar plant at Koomber Tea Estate, built by Arrays Ingenieria"),
    (K + "cm-speaks-at-koomber-solar-plant-site.jpg", "The Chief Minister speaks at the Koomber solar plant site"),
    (K + "cm-reviews-koomber-solar-plant-with-mlas.jpg", "The Chief Minister with MLAs and officials at the solar plant"),
    (K + "cm-inspects-solar-modules-koomber-tea-estate.jpg", "The Chief Minister inspects the solar modules at Koomber Tea Estate"),
    (K + "cm-himanta-biswa-sarma-arrives-koomber-tea-estate.jpg", "The Chief Minister of Assam arrives at Koomber Tea Estate"),
    (K + "cm-at-ribbon-koomber-solar-plant.jpg", "Before the ribbon-cutting at the Koomber solar plant"),
    (K + "ribbon-ceremony-koomber-tea-garden.jpg", "The ribbon ceremony at Koomber Tea Garden"),
    (K + "cm-enters-koomber-solar-plant-after-inauguration.jpg", "The Chief Minister walks into the solar plant after the inauguration"),
    (K + "cm-on-site-at-koomber-solar-plant.jpg", "The Chief Minister on site at the Koomber solar plant"),
    (K + "cm-and-officials-at-koomber-solar-site.jpg", "The Chief Minister with officials at the solar site"),
    (K + "arrays-ingenieria-greets-cm-at-inauguration-banner.jpg", "Arrays Ingenieria greets the Chief Minister at the inauguration banner"),
    (K + "cm-greeted-by-arrays-ingenieria-team.jpg", "The Arrays Ingenieria team greets the Chief Minister"),
    (K + "gamosa-felicitation-cm-koomber.jpg", "Gamosa felicitation of the Chief Minister at Koomber"),
    (K + "koomber-595kwp-solar-inauguration-banner.jpg", "Inauguration banner: 595 kWp solar plant at Koomber Tea Garden, with Tata Power Solar, Goodricke, Sustvest and Arrays Ingenieria"),
    (K + "arrays-ingenieria-welcome-banner-lt-gen-prasad.jpg", "Arrays Ingenieria's welcome banner for the Chief Minister, with Lt. Gen. A.R. Prasad (Retd)"),
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
    capacity="595 kWp", kind="Ground-mounted, on-grid", location="Koomber Tea Estate, Cachar district (Barak Valley), Assam",
    client="Koomber Tea Estate (Goodricke Group)", partner="Tata Power Renewable Energy Ltd. & Sustvest (3.11 MW programme)",
    role="Installation partner", year="2026 (inaugurated 1 October 2026)",
    cat="ground", tag="Tea Estate · Inaugurated by the CM",
    hero=K + "cm-inaugurates-595kwp-solar-plant-ribbon-cutting.jpg",
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
        "The inauguration was announced by the Chief Minister's Office on X and Facebook, posted by MLA Kaushik Rai, and reported "
        "by The Sentinel on its website, Facebook and Instagram.",
    ],
    scope=["Installation of the 595 kWp ground-mounted plant", "Electrical works and grid connection",
           "Testing and commissioning", "Handover for inauguration"],
    photos=KOOMBER_ALBUM[:6],
    album=KOOMBER_ALBUM,
    people=KOOMBER_PEOPLE,
    docs=[],
    coverage=["sentinel-koomber"],
    official=["cmo-assam-koomber", "kaushik-rai-koomber"],
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
