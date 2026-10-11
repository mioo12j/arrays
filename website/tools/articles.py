"""
Long-form solar guides: one page per article (Insights). Imported by build.py.

Every policy figure carries a source in the article's "sources" list. Facts were checked on 11 October 2026;
where only a draft or a secondary report exists, the text says so. Body blocks:
  "plain string"                      a paragraph (inline HTML allowed, internal links as page.html)
  ("h3", text)                        a sub-heading
  ("ul", [items]) / ("ol", [items])   lists
  ("table", caption, [head], [rows])  a responsive table (first cell of each row is the row header)
  ("note", title, text) / ("warn", title, text)   call-out boxes
  ("fig", src, alt, caption)          a photo (opens in the photo viewer)
  ("yt", coverage_id)                 a YouTube report from COVERAGE (click to play)
  ("stats", [(number, label)])        key-number tiles
  ("steps", [(title, text)])          a numbered process
  ("quote", text, cite)               a quotation
  ("cta", text)                       a call to action
"""

UPDATED = "2026-10-11"

# ---------------------------------------------------------------- images ----
K = "assets/koomber/arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-"
B = "assets/borpatra/arrays-ingenieria-ex-servicemen-led-borpatra-tea-estate-230kwp-solar-"
P = "assets/photos/arrays-ingenieria-"
IMG = {
    "utility": (P + "utility-scale-ground-mount-solar-power-plant.jpg", "Utility-scale ground-mount solar power plant built by Arrays Ingenieria"),
    "rooftop": (P + "rooftop-solar-installation-clean-power.jpg", "Rooftop solar installation by Arrays Ingenieria"),
    "industrial": (P + "industrial-rooftop-solar-array.jpg", "Industrial rooftop solar array installed by Arrays Ingenieria"),
    "cm_modules": (K + "solar-cm-inspects-solar-modules.jpg", "The Chief Minister of Assam inspects the solar modules at the 595 kWp Koomber Tea Estate plant installed by Arrays Ingenieria"),
    "koomber": (K + "ground-mount-solar-plant.jpg", "The 595 kWp ground-mounted on-grid solar plant at Koomber Tea Estate, Assam, installed by Arrays Ingenieria"),
    "koomber_tour": (K + "solar-cm-tours-plant-with-team.jpg", "Arrays Ingenieria takes the Chief Minister of Assam around the Koomber Tea Estate solar plant"),
    "koomber_ribbon": (K + "solar-cm-inaugurates-595kwp-solar-plant-ribbon-cutting.jpg", "Chief Minister Dr Himanta Biswa Sarma inaugurates the 595 kWp Koomber Tea Estate solar plant"),
    "bp_modules": (B + "modules.jpg", "Solar modules of the 230 kWp ground-mounted plant at Borpatra Tea Estate, Assam, installed by Arrays Ingenieria"),
    "bp_acdb": (B + "manager-acdb.jpg", "The AC distribution board of the 230 kWp Borpatra Tea Estate solar plant, Assam"),
    "bp_banner": (B + "banner-acdb.jpg", "Inauguration banner beside the AC distribution board of the 230 kWp Borpatra Tea Estate solar plant"),
    "bp_puja": (B + "inverter-puja.jpg", "Puja at an inverter of the 230 kWp Borpatra Tea Estate solar plant before the inauguration"),
    "supersmelters": (P + "super-smelters-1980kwp-solar-plant-asansol.jpg", "Super Smelters 1980.3 kWp industrial rooftop solar plant, West Bengal, installed by Arrays Ingenieria"),
    "jayshree": (P + "jayshree-tea-estate-1mw-ground-mount-solar-sonari-assam.jpg", "Jay Shree Tea 1 MW ground-mount solar plant at Sonari, Assam, installed by Arrays Ingenieria"),
    "towkok": (P + "towkok-tea-estate-535kwp-ground-mount-solar-assam.jpg", "Towkok Tea Estate 535 kWp ground-mount solar plant, Assam"),
    "manjushree": (P + "manjushree-tea-estate-500kwp-ground-mount-solar-assam.jpg", "Manjushree Tea Estate 500 kWp ground-mount solar plant, Assam"),
    "dcm": (P + "dcm-hisar-10mw-ground-mount-solar-civil-works.jpg", "Ground-mount solar plant civil works at DCM Textile, Hisar, by Arrays Ingenieria"),
    "assam_rooftop": (P + "assam-1711kwp-on-grid-rooftop-solar.jpg", "On-grid solar PV project in Assam by Arrays Ingenieria"),
    "ramnagar": (P + "ramnagar-uttarakhand-ground-mount-solar.jpg", "Ground-mount solar plant at Ramnagar, Uttarakhand"),
    "balaji": (P + "balaji-action-tesa-sitarganj-rooftop-solar.jpg", "Sheet-roof solar plant at Balaji Action Buildwell, Sitarganj, Uttarakhand"),
    "earthing": (P + "solar-plant-earthing-electrical-safety-works.jpg", "Earthing and electrical safety works on a solar plant by Arrays Ingenieria"),
    "piling": (P + "seci-300mw-koppal-karnataka-solar-pile-foundation.jpg", "Pile-foundation works for the 300 MW SECI solar project at Koppal, Karnataka"),
    "tml": (P + "tata-motors-jamshedpur-5-5mw-solar-piling.jpg", "Piling for the 5.5 MW solar plant at Tata Motors, Jamshedpur"),
    "fencing": (P + "yiapl-14-36mw-solar-civil-works-fencing-uttar-pradesh.jpg", "Civil works and chain-link fencing for a 14.36 MW solar project in Uttar Pradesh"),
    "appl": (P + "appl-kakajan-tea-estate-solar-assam.jpg", "Solar plant at Kakajan Tea Estate, Assam"),
    "orangajuli": (P + "ex-servicemen-led-orangajuli-tea-estate-450kwp-solar-inauguration-ribbon.jpg", "Ribbon-cutting at the 450 kW Orangajuli Tea Estate solar plant, Assam"),
    "commissioning": ("assets/press/arrays-ingenieria-solar-plant-commissioning-ceremony.jpg", "Commissioning ceremony at a solar plant built by Arrays Ingenieria"),
}

# --------------------------------------------------------------- sources ----
S = {
    "mnre_progress": ("MNRE: Physical progress, cumulative as on 30 September 2026", "https://mnre.gov.in/en/physical-progress/"),
    "mnre_jan": ("MNRE on X: solar capacity 140.6 GW as of January 2026", "https://x.com/mnreindia/status/2024823382630687102"),
    "pib_re": ("PIB: India ranks third globally in renewable energy installed capacity", "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2250039"),
    "mnre_jul": ("SolarQuarter, 12 Aug 2026, citing MNRE data", "https://solarquarter.com/2026/08/12/indias-solar-capacity-surpasses-164-gw-as-2026-installations-approach-29-gw-by-july-end/"),
    "cop26": ("PIB: PM's national statement at COP26, 1 Nov 2021", "https://pib.gov.in/PressReleasePage.aspx?PRID=1768712"),
    "gst": ("pv magazine India, 4 Sep 2025: GST on solar cells, modules cut to 5%", "https://www.pv-magazine-india.com/2025/09/04/gst-on-solar-cells-modules-cut-to-5/"),
    "gst_hsn": ("Tally Solutions: Solar HSN codes and GST rates 2026", "https://tallysolutions.com/gst/solar-hsn-code-gst-rate/"),
    "gst_hc": ("Taxscan: GST on solar EPC contracts at 8.9% under the 70:30 formula (Andhra Pradesh High Court)", "https://www.taxscan.in/top-stories/gst-on-solar-epc-contracts-to-be-levied-at-under-formula-andhra-pradesh-hc-sets-aside-assessment-1440012"),
    "almm": ("PIB: MNRE amends the ALMM Order 2019 (List-II for solar cells)", "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2082901"),
    "budget25": ("Energetica India: Union Budget 2025-26 cuts duty on solar cells and modules to 20%", "https://www.energetica-india.net/news/union-budget-2025-26-solar-cells-and-modules-duty-cut-to-20-percent"),
    "budget26": ("pv magazine India, 2 Feb 2026: Union Budget 2026-27 and solar inputs", "https://www.pv-magazine-india.com/2026/02/02/indias-union-budget-2026-27-removes-import-duties-on-solar-glass-inputs-lithium-battery-cell-machinery-and-critical-minerals-processing-equipment/"),
    "china_brief": ("China Briefing: An investor's guide to solar manufacturing in India", "https://www.china-briefing.com/china-outbound-news/an-investors-guide-to-solar-manufacturing-in-india"),
    "dep_2025": ("Taxguru: Depreciation under the Income-tax Act, 2025", "https://taxguru.in/income-tax/depreciation-income-tax-act-2025-section-34-rates-provisions.html"),
    "netmeter_2021": ("Mercom India: Net metering approved for rooftop solar up to 500 kW", "https://www.mercomindia.com/government-approves-net-metering-rooftop-solar"),
    "draft_rules_2026": ("Mercom India: Government proposes amendments to Electricity (Rights of Consumers) Rules, March 2026", "https://www.mercomindia.com/government-proposes-amendments-to-electricity-consumer-rights-rules"),
    "draft_rules_resi": ("RESI India: Draft Electricity (Rights of Consumers) Amendment Rules, 2026", "https://www.resiindia.org/post/draft-electricity-rights-of-consumers-amendment-rules-2026-enabling-mandated-bess-for-500-kw-so"),
    "goar": ("Green Energy Open Access Registry (GOAR) portal", "https://greenopenaccess.in/"),
    "geoa_ieefa": ("IEEFA: Impact of the Green Energy Open Access Rules, 2022", "https://ieefa.org/resources/impact-green-energy-open-access-rules-2022"),
    "geoa_amend": ("Eco-Business: Amendment to India's electricity rules brings green energy to smaller consumers", "https://www.eco-business.com/news/amendment-to-indias-electricity-rules-seen-to-bring-green-energy-to-more-small-consumers/"),
    "ists": ("T&D India: Waiver of ISTS charges on renewable energy to be phased out", "https://www.tndindia.com/waiver-of-ists-charges-on-renewable-energy-to-be-phased-out/"),
    "surya": ("PIB: 75 lakh households targeted for rooftop solar by December 2026", "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2268992"),
    "surya_cab": ("PIB, 29 Feb 2024: Cabinet approves PM Surya Ghar: Muft Bijli Yojana", "https://pib.gov.in/PressReleasePage.aspx?PRID=2010133"),
    "surya_portal": ("PM Surya Ghar national portal", "https://pmsuryaghar.gov.in/"),
    "kusum_pib": ("PIB, 6 Aug 2024: PM-KUSUM", "https://pib.gov.in/PressReleasePage.aspx?PRID=2042069"),
    "kusum_fc": ("Energetica India: MNRE extends PM-KUSUM financial closure deadline to 30 November", "https://energetica-india.net/news/mnre-extends-pm-kusum-financial-closure-deadline-to-nov-30"),
    "kusum_mar": ("Renewable Watch, 31 Mar 2026: MNRE extends timelines for projects under PM-KUSUM", "https://renewablewatch.in/2026/03/31/mnre-extends-timelines-for-projects-under-pm-kusum-scheme/"),
    "cm_assam": ("Himanta Biswa Sarma, Rewriting Assam's Energy Future, 22 Sep 2026", "https://himantabiswa.substack.com/p/rewriting-assams-energy-future"),
    "assam_dte": ("Down To Earth: Assam targets 3,500 MW solar surge", "https://www.downtoearth.org.in/renewable-energy/assam-targets-3500-mw-solar-surge-with-strong-push-for-rooftop-and-agri-voltaics"),
    "assam_tea": ("The Statesman: Use of solar power in Assam's tea gardens", "https://www.thestatesman.com/supplements/north/use-of-solar-power-in-assams-tea-gardens-1503403895.html"),
    "hub_orangajuli": ("Hub Network: Assam tea garden gets 450 kWp solar plant", "https://hubnetwork.in/assam-tea-garden-gets-450-kwp-solar-plant-as-clean-energy-push-gathers-pace/"),
    "sentinel_koomber": ("The Sentinel: Himanta Biswa Sarma inaugurates 595 kWp solar plant at Koomber Tea Estate", "https://www.sentinelassam.com/breakingnews/assam-himanta-biswa-sarma-inaugurates-595-kwp-solar-plant-at-koomber-tea-estate"),
    "qco": ("PIB: MNRE notifies the revised Quality Control Order for solar photovoltaic products", "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2097219"),
    "qco_inv": ("Saur Energy: MNRE extends self-certification for solar inverters above 200 kW", "https://www.saurenergy.com/solar-energy-news/mnre-extends-self-certification-for-200-kw-with-solar-inverters-till-dec-31-2026-12151390"),
    "ess_mop": ("Mercom India: Government mandates two-hour energy storage in solar tenders", "https://www.mercomindia.com/government-mandates-two-hour-energy-storage-integration-in-solar-tenders"),
    "ess_pv": ("pv magazine India, 20 Feb 2025: Power ministry mandates co-located storage with solar", "https://www.pv-magazine-india.com/2025/02/20/power-ministry-mandates-co-locating-energy-storage-with-solar-projects/"),
    "ess_market": ("Energy-Storage.News: India's energy storage market in 2025", "https://www.energy-storage.news/indias-energy-storage-market-in-2025-from-tenders-to-scaled-deployment/"),
    "bess_2025": ("Mercom India: Top policies that shaped India's BESS market in 2025", "https://www.mercomindia.com/top-policies-that-shaped-the-indian-bess-market-in-2025"),
}


def src(*keys):
    return [S[k] for k in keys]


ARTICLES = []
A = ARTICLES.append

# ======================================================================== 1
A(dict(
    file="india-solar-capacity-2026.html", short="India solar capacity 2026", tag="Market Update", date="2026-10-02", updated=UPDATED,
    old_ids=["india-solar-2026"],
    title="India's Solar Capacity in 2026: 171 GW and What It Means for Your Business",
    seo_title="India Solar Capacity 2026: 171 GW | Arrays Ingenieria",
    desc="India reached 171.05 GW of solar by 30 September 2026. What the growth, the rooftop boom and the 500 GW goal mean for a business planning solar.",
    summary="MNRE data put India's solar fleet at 171.05 GW on 30 September 2026. Where the growth is, why rooftop and C&I solar are surging, and how to plan a plant in a crowded market.",
    hero=IMG["utility"], keywords=["India solar capacity 2026", "MNRE solar data", "rooftop solar India", "500 GW target", "solar EPC India"],
    takeaways=["India had <strong>171.05 GW</strong> of solar on 30 September 2026, per MNRE's physical-progress data",
               "That is about 30 GW more than the 140.6 GW MNRE reported for January 2026",
               "Grid-connected rooftop solar has reached 33.41 GW; ground-mounted plants make up 125.65 GW",
               "Renewables (excluding large hydro, as MNRE counts them) total about 299 GW, on the road to 500 GW of non-fossil capacity by 2030",
               "The scarce resource is now skilled installation and commissioning: book your EPC partner and approvals early"],
    sections=[
        dict(h="The numbers in one place", blocks=[
            "India's solar build-out keeps setting records. The Ministry of New and Renewable Energy (MNRE) publishes cumulative installed "
            "capacity every month, and its table for <strong>30 September 2026</strong> shows <strong>171.05 GW</strong> of solar. "
            "That is up from 150.26 GW on 31 March 2026 and 164.59 GW on 31 July 2026, and roughly 30 GW more than the 140.6 GW MNRE "
            "reported for January 2026.",
            ("stats", [("171.05 GW", "Solar installed, 30 Sep 2026"), ("125.65 GW", "Ground-mounted plants"), ("33.41 GW", "Grid-connected rooftop"),
                       ("~299 GW", "Total renewable capacity (MNRE)")]),
            ("table", "India's solar capacity by segment, cumulative as on 30 September 2026 (MNRE)",
             ["Segment", "Installed capacity", "What it covers"],
             [["Ground-mounted solar", "125.65 GW", "Utility-scale parks and open-access or captive plants on land"],
              ["Grid-connected rooftop", "33.41 GW", "Homes, factories, warehouses, institutions and commercial buildings"],
              ["Hybrid projects (solar part)", "5.36 GW", "Solar in wind-solar hybrid projects"],
              ["Off-grid solar", "6.63 GW", "Solar pumps, mini-grids and standalone systems"],
              ["<strong>Total solar</strong>", "<strong>171.05 GW</strong>", "All of the above"]]),
            "Two trends stand out. Rooftop solar, long the laggard, has accelerated sharply thanks to PM Surya Ghar for homes and to "
            "factories and commercial buildings cutting their power bills. And ground-mounted plants keep growing through utility tenders "
            "and through companies building captive and open-access plants for their own use.",
        ]),
        dict(h="Why India is building so fast", blocks=[
            "The direction is set at the highest level. At COP26 in Glasgow in 2021 the Prime Minister announced the <strong>Panchamrit</strong> "
            "commitments, the first of which is <strong>500 GW of non-fossil electricity capacity by 2030</strong>. Non-fossil sources passed "
            "half of India's installed power capacity in June 2025, five years ahead of the original goal.",
            "Policy then makes solar cheaper and easier to adopt:",
            ("ul", ["<strong>GST on solar equipment fell from 12% to 5%</strong> from 22 September 2025, lowering the upfront cost of every plant (see <a href=\"gst-on-solar-india.html\">our GST guide</a>).",
                    "<strong>Accelerated depreciation</strong> lets a business that owns its plant write off the cost quickly (see <a href=\"accelerated-depreciation-solar.html\">depreciation explained</a>).",
                    "<strong>PM Surya Ghar</strong> subsidises rooftop solar for homes and <strong>PM-KUSUM</strong> solarises farms and feeders.",
                    "<strong>Green Energy Open Access</strong> rules let consumers with as little as 100 kW of load buy green power from plants elsewhere.",
                    "<strong>ALMM</strong> and import duties steer buyers towards Indian-made modules and, since 1 June 2026, Indian-made cells."]),
            "For a business the economics are now simple: a well-built plant on your own roof or land produces power for 25 years at a cost "
            "per unit well below most commercial and industrial grid tariffs, and the cost of the plant is recovered in a few years.",
        ]),
        dict(h="Where the growth is coming from", blocks=[
            ("h3", "Utility-scale parks and tenders"),
            "Large solar parks, such as the 300 MW SECI project at Koppal in Karnataka where Arrays Ingenieria has done pile foundations and DC "
            "installation, still account for most new megawatts. New tenders increasingly ask for co-located battery storage (see "
            "<a href=\"battery-storage-with-solar.html\">storage with solar</a>).",
            ("h3", "Commercial and industrial (C&I) rooftops"),
            "Factories with large sheet roofs are among the best sites in the country: the roof already exists, consumption is during the day "
            "and tariffs are high. Our rooftop work runs from small commercial roofs to almost 2 MW on a single industrial roof, at "
            "smelters, steel and textile plants, consumer-goods units and retail warehouses.",
            ("fig",) + IMG["supersmelters"] + ("The 1980.3 kWp sheet-roof plant at Super Smelters, Jamuria, West Bengal, installed and commissioned by Arrays Ingenieria with Tata Power Solar.",),
            ("h3", "Tea estates and agro-industry"),
            "Assam's tea gardens have become a solar story of their own: estates with steady daytime factory load, diesel-generator back-up and "
            "spare land are building ground-mount plants. The Chief Minister of Assam inaugurated our 595 kWp plant at Koomber Tea Estate on "
            "1 October 2026 (see <a href=\"solar-for-assam-tea-estates-guide.html\">solar for Assam's tea estates</a>).",
        ]),
        dict(h="What this means if you are planning a plant", blocks=[
            "Record volumes are good news for prices and choice, but they create bottlenecks in three places:",
            ("ol", ["<strong>Skilled installation crews.</strong> Experienced installation & commissioning teams, piling rigs and supervisors are booked months ahead in the peak season.",
                    "<strong>Approvals.</strong> DISCOM feasibility, net-metering or open-access approval and the Electrical Inspector's (CEIG) inspection all take time, and queues grow when everyone builds at once.",
                    "<strong>Compliant equipment.</strong> ALMM-listed modules (with List-II cells for covered projects) and BIS-certified inverters must be specified and documented from the start."]),
            "The practical answer is to start early and choose a partner who has done the work before, at scale and with documents to show "
            "for it. Ask for case studies, client certificates and references; our checklist of <a href=\"choose-solar-epc-partner.html\">10 questions "
            "to ask a solar EPC</a> is a good place to start.",
            ("cta", "Planning a rooftop or ground-mount plant for 2026-27? Our engineers will size it, cost it and map the approvals for you."),
        ]),
        dict(h="How Arrays Ingenieria fits in", blocks=[
            "Arrays Ingenieria is an ex-servicemen-led solar EPC and installation & commissioning (I&C) company. We build on the CAPEX model, "
            "where you own the plant, and we work as the installation partner for EPC majors and developers. Our work runs Pan-India: tea-estate "
            "ground-mount plants in Assam, industrial rooftops in West Bengal, Odisha, Bihar, Haryana and Uttarakhand, and piling, fencing "
            "and civil works on utility-scale projects.",
            ("fig",) + IMG["koomber_ribbon"] + ("The Chief Minister of Assam inaugurates the 595 kWp Koomber Tea Estate plant on 1 October 2026, installed by Arrays Ingenieria under the Goodricke programme with Tata Power Renewable Energy and Sustvest.",),
        ]),
    ],
    faq=[("How much solar capacity does India have in 2026?",
          "MNRE's physical-progress data show 171.05 GW of solar installed as on 30 September 2026: 125.65 GW ground-mounted, 33.41 GW grid-connected rooftop, 5.36 GW in hybrid projects and 6.63 GW off-grid."),
         ("What is India's renewable energy target for 2030?",
          "500 GW of non-fossil fuel electricity capacity by 2030, the first of the Panchamrit commitments the Prime Minister announced at COP26 in 2021."),
         ("Is it a good time for a business to install solar?",
          "For most commercial and industrial consumers, yes: GST on solar equipment is 5%, a business owner can claim accelerated depreciation, and a well-built plant generates for 25 years at a cost per unit below typical C&I tariffs. Book installation crews and approvals early because demand is high."),
         ("Where can I check the latest official solar figures?",
          "MNRE publishes cumulative installed capacity every month on its physical-progress page (mnre.gov.in). PIB press releases summarise the milestones.")],
    sources=src("mnre_progress", "mnre_jan", "pib_re", "mnre_jul", "cop26"),
    related=["gst-on-solar-india.html", "capex-vs-opex-solar.html", "choose-solar-epc-partner.html"],
    cases=["project-koomber-tea-estate-595kwp-solar-cm-inauguration.html", "project-super-smelters-1980kwp-rooftop-solar.html", "project-seci-300mw-koppal-pile-foundation.html"],
    services=["capex-solar-epc.html", "solar-installation-commissioning.html", "service-ground-mount.html", "service-rooftop.html"],
))

# ======================================================================== 2
A(dict(
    file="gst-on-solar-india.html", short="GST on solar 2026", tag="Tax", date="2026-10-02", updated=UPDATED,
    old_ids=["gst-on-solar-5-percent"],
    title="GST on Solar in India (2026): 5% on Equipment, About 8.9% on EPC Contracts",
    seo_title="GST on Solar in India 2026: 5% Rate | Arrays Ingenieria",
    desc="GST on solar modules is 5% since 22 September 2025. How the 70:30 rule puts EPC contracts near 8.9%, input tax credit and a worked example.",
    summary="The GST Council cut GST on solar devices from 12% to 5% from 22 September 2025. How it applies to modules, inverters and full EPC contracts, what the 70:30 rule means, and how much a plant saves.",
    hero=IMG["rooftop"], keywords=["GST on solar panels", "GST on solar EPC", "70:30 GST solar", "solar HSN code", "GST rate solar 2026"],
    takeaways=["GST on solar cells, modules and specified renewable-energy devices is <strong>5%</strong>, cut from 12% with effect from <strong>22 September 2025</strong>",
               "For a solar plant supplied with installation services, a deemed <strong>70% goods : 30% services</strong> split applies, which works out to about <strong>8.9%</strong> overall",
               "The Andhra Pradesh High Court (December 2025) upheld the 70:30 method for a solar EPC contract and set aside an 18% assessment",
               "A business using the plant for taxable supplies can usually claim input tax credit: confirm with your tax adviser",
               "On a Rs 1 crore plant the cut is worth roughly Rs 2.5 lakh to Rs 4.9 lakh, depending on how the contract is structured"],
    sections=[
        dict(h="What changed and when", blocks=[
            "At its <strong>56th meeting on 3 September 2025</strong>, the GST Council cut the rate on solar cells, solar modules and other "
            "renewable-energy devices from <strong>12% to 5%</strong>, effective <strong>22 September 2025</strong>. It was part of a wider "
            "rate rationalisation, and for solar it reversed the increase from 5% to 12% made in 2021.",
            "Because equipment is the largest part of what a solar plant costs, the cut flows almost directly into a lower project price and "
            "a shorter payback.",
            ("table", "GST on common solar items after 22 September 2025",
             ["Item", "Typical HSN", "GST rate"],
             [["Solar PV cells and modules", "8541", "5%"],
              ["Solar power generators and specified parts (as listed in the rate notification), such as grid-tie inverters for solar systems", "8501 / 8504", "5% where covered by the solar-devices entry"],
              ["Installation, civil and electrical services supplied on their own", "9954 / 9987", "18%"],
              ["Solar plant supplied with services (EPC), deemed split", "Mixed", "70% at 5% + 30% at 18% = about 8.9%"]]),
            ("warn", "Check the exact entry",
             "Whether a particular component (structures, cables, batteries, monitoring hardware) falls under the 5% solar-devices entry depends on the "
             "wording of the rate notification and how the item is supplied. Your supplier's invoice and your tax adviser should agree on the HSN."),
        ]),
        dict(h="How GST works on a full EPC contract: the 70:30 rule", blocks=[
            "Most plants are bought as a package: modules, inverters, structures and cables plus the design, installation and commissioning. "
            "Since 2019 the GST rules have deemed such a supply of a solar power generating system with services to be <strong>70% goods and "
            "30% services</strong>. The goods part is taxed at the solar rate and the services part at 18%.",
            ("table", "Effective GST on a solar EPC contract under the 70:30 rule",
             ["Period", "Goods (70%)", "Services (30%)", "Effective rate"],
             [["Before 1 Oct 2021", "5%", "18%", "8.9%"],
              ["1 Oct 2021 to 21 Sep 2025", "12%", "18%", "13.8%"],
              ["From 22 Sep 2025", "5%", "18%", "<strong>8.9%</strong>"]]),
            "Tax officers have sometimes argued that a solar EPC contract is a works contract for immovable property taxable at 18% in full. "
            "In <strong>December 2025 the Andhra Pradesh High Court</strong>, in a case brought by a module maker and EPC company, held that the "
            "70:30 formula applies to such a contract and directed the tax to be recomputed at about 8.9%. The judgment is binding only in that "
            "state, but it is persuasive elsewhere.",
            ("note", "Our practice",
             "We set out supply and services clearly in every CAPEX contract and invoice them in line with the applicable rule, so the tax treatment "
             "is transparent from the quotation onwards."),
        ]),
        dict(h="Input tax credit: can your business claim the GST back?", blocks=[
            "A registered business that uses the solar plant in the course of making taxable supplies (a factory, a warehouse, a tea factory "
            "selling made tea) can generally claim input tax credit on the GST paid on the plant, treating it as a capital good. That makes the "
            "GST itself largely a cash-flow item rather than a cost.",
            "Credit can be restricted where the power is used for exempt supplies, where the plant is treated as immovable property under your "
            "facts, or where the books treat it in a particular way. The rules are nuanced, so confirm the position for your business with your "
            "chartered accountant before you budget the project.",
        ]),
        dict(h="Worked example: what the cut saves on a Rs 1 crore plant", blocks=[
            "Take a commercial plant whose pre-tax contract value is <strong>Rs 1 crore</strong>.",
            ("table", "GST payable on a Rs 1 crore solar EPC contract (illustrative)",
             ["Scenario", "Rate applied", "GST before the cut", "GST after the cut", "Saving"],
             [["EPC contract, 70:30 rule", "13.8% to 8.9%", "Rs 13.8 lakh", "Rs 8.9 lakh", "<strong>Rs 4.9 lakh</strong>"],
              ["Equipment only (installation billed separately)", "12% to 5% on Rs 70 lakh", "Rs 8.4 lakh", "Rs 3.5 lakh", "<strong>Rs 4.9 lakh</strong>"],
              ["Modules only (about 35-40% of cost)", "12% to 5% on Rs 37.5 lakh", "Rs 4.5 lakh", "Rs 1.9 lakh", "Rs 2.6 lakh"]]),
            "For a business that cannot claim input tax credit, the saving is a straight reduction in project cost. For one that can, it reduces "
            "the cash locked up until the credit is used. Either way, payback improves.",
            ("cta", "Want a quotation with the 5% rate and the 70:30 split shown line by line? Tell us about your site."),
        ]),
        dict(h="Other taxes that affect a solar project", blocks=[
            ("ul", ["<strong>Customs duty</strong> on imported cells and modules (see <a href=\"solar-import-duty-india.html\">solar import duty in 2026</a>).",
                    "<strong>Accelerated depreciation</strong> on the plant for a business owner (see <a href=\"accelerated-depreciation-solar.html\">our depreciation guide</a>).",
                    "<strong>Electricity duty</strong> on self-consumed power, which some states levy or waive for captive solar under their solar policies.",
                    "<strong>Open-access charges</strong> if the plant is off-site (see <a href=\"green-energy-open-access.html\">Green Energy Open Access</a>)."]),
        ]),
    ],
    faq=[("What is the GST rate on solar panels in 2026?",
          "5%. The GST Council cut the rate on solar cells, modules and other specified renewable-energy devices from 12% to 5% with effect from 22 September 2025."),
         ("What is the GST on a solar EPC contract?",
          "Where a solar power generating system is supplied with installation services, 70% of the value is treated as goods (5%) and 30% as services (18%), an effective rate of about 8.9%."),
         ("Is the 70:30 rule upheld by the courts?",
          "In December 2025 the Andhra Pradesh High Court held that the 70:30 formula applies to a solar EPC contract and set aside an 18% assessment. It is binding in Andhra Pradesh and persuasive elsewhere."),
         ("Can my company claim input tax credit on a solar plant?",
          "Usually yes, if the plant is used in making taxable supplies and is treated as a capital good in your books. Restrictions can apply, so confirm with your chartered accountant."),
         ("Does GST apply to O&M and module cleaning services?",
          "Yes. Standalone services such as operation and maintenance or module cleaning are generally taxed at 18%.")],
    sources=src("gst", "gst_hsn", "gst_hc"),
    related=["accelerated-depreciation-solar.html", "solar-import-duty-india.html", "capex-vs-opex-solar.html"],
    cases=["project-super-smelters-1980kwp-rooftop-solar.html", "project-jayshree-tea-1mw-solar-assam.html"],
    services=["capex-solar-epc.html", "service-epc.html"],
))

# ======================================================================== 3
A(dict(
    file="almm-list-ii-solar-cells.html", short="ALMM List-II (cells)", tag="Policy", date="2026-10-02", updated=UPDATED,
    old_ids=["almm-list-ii-solar-cells"],
    title="ALMM List-I and List-II Explained: The Made-in-India Rule for Solar Modules and Cells",
    seo_title="ALMM List-II for Solar Cells 2026 | Arrays Ingenieria",
    desc="Since 1 June 2026, projects under MNRE's ALMM order need List-I modules made with List-II cells. Who it covers, exemptions and how to comply.",
    summary="MNRE's Approved List of Models and Manufacturers now covers solar cells as well as modules. What List-I and List-II mean, which projects they bind, the exemptions, and how to stay compliant.",
    hero=IMG["cm_modules"], keywords=["ALMM List-II", "ALMM solar cells", "ALMM order 2019", "DCR solar modules", "MNRE ALMM 2026"],
    takeaways=["ALMM List-I covers solar <strong>modules</strong>; List-II, for solar <strong>cells</strong>, applies from <strong>1 June 2026</strong>",
               "Covered projects must use List-I modules that are themselves made with List-II cells",
               "Projects whose bid deadline fell on or before the amendment are exempt from the cell requirement; net-metering and open-access projects commissioned before 1 June 2026 were exempted too",
               "MNRE has signalled a third list, for wafers, later in the decade (reported for June 2028)",
               "Ask for the ALMM listing, the model number and the cell source in writing before you order modules"],
    sections=[
        dict(h="What ALMM is and why it exists", blocks=[
            "The <strong>Approved List of Models and Manufacturers (ALMM)</strong> is a register kept by the Ministry of New and Renewable "
            "Energy. Only the module models and manufacturers on it may be used in the projects the ALMM Order covers. MNRE issued the order "
            "in 2019 to make sure that solar plants built with public support or for public utilities use reliable equipment from verified "
            "factories, and to build up manufacturing in India.",
            "Until 2026 the order had one list, <strong>List-I for solar PV modules</strong>. MNRE then amended the ALMM Order 2019 to add "
            "<strong>List-II for solar PV cells</strong>, with effect from <strong>1 June 2026</strong>.",
        ]),
        dict(h="List-I and List-II side by side", blocks=[
            ("table", "The ALMM lists in 2026",
             ["List", "Covers", "In force from", "What a covered project must do"],
             [["List-I", "Solar PV modules (model and factory)", "2021 (original order of 2019)", "Use only modules from List-I"],
              ["List-II", "Solar PV cells (manufacturer and factory)", "1 June 2026", "Use List-I modules made with List-II cells"],
              ["List-III (signalled)", "Wafers", "Reported for June 2028; not yet in force", "Watch for MNRE's notification"]]),
            "In practice List-II means that a covered project needs modules whose <strong>cells were also made in an ALMM-listed Indian "
            "factory</strong>. A module assembled in India from imported cells stays on List-I but no longer satisfies a project that needs "
            "List-II cells.",
        ]),
        dict(h="Which projects must comply", blocks=[
            "The order applies to projects set out in it, chiefly:",
            ("ul", ["Government and government-assisted projects, including those under central schemes",
                    "Projects selling power to the government or to DISCOMs, such as plants built under central or state tenders",
                    "Projects under schemes that require it, such as PM-KUSUM and PM Surya Ghar (which already insist on domestic-content modules)",
                    "Net-metering and open-access projects, which MNRE has brought within the order's scope, subject to the exemptions below"]),
            ("h3", "The exemptions"),
            ("ul", ["Projects whose <strong>bid submission deadline was on or before the date of the List-II amendment</strong> are excused from the cell requirement, though they still need List-I modules.",
                    "Net-metering and open-access projects <strong>commissioned before 1 June 2026</strong> were exempt from sourcing List-II cells."]),
            ("warn", "Purely private captive plants",
             "Whether a privately funded captive plant must use ALMM modules depends on how it connects and sells power, and on your state's "
             "rules. Many clients choose ALMM equipment anyway for quality and future flexibility. Check the position for your project before ordering."),
        ]),
        dict(h="What it means for price and supply", blocks=[
            "Indian cell capacity is growing quickly but is smaller than module capacity, so modules with domestic cells (often called DCR "
            "modules) carry a premium over modules with imported cells. Lead times can also be longer in peak months.",
            "Plan for it: fix the module specification at the design stage, get written confirmation of the ALMM listing and cell source from "
            "the supplier, and lock delivery dates into the project schedule.",
        ]),
        dict(h="How to check compliance before you order", blocks=[
            ("steps", [("Find the list", "Download the current List-I and List-II from MNRE's ALMM pages; the lists are updated regularly."),
                       ("Match the model", "Check the exact module model number, wattage and factory address against List-I."),
                       ("Trace the cells", "Ask the module maker for the cell manufacturer and factory, and check it against List-II."),
                       ("Keep the paper trail", "Keep invoices, the ALMM extract and the maker's declaration. DISCOMs, scheme portals and inspectors can ask for them."),
                       ("Inspect on delivery", "Match nameplates and serial numbers on site with the documents before installation starts.")]),
            ("fig",) + IMG["bp_modules"] + ("Modules on a ground-mount tea-estate plant in Assam. On every project we match nameplates and documents to the specification before installation.",),
            "Arrays Ingenieria does not manufacture modules or inverters. On CAPEX projects we specify ALMM-listed or client-approved makes, and on "
            "installation contracts we check and record what arrives on site, so the documents are ready when the DISCOM or inspector asks.",
        ]),
    ],
    faq=[("What is ALMM List-II?",
          "The list of approved solar cell manufacturers, added to MNRE's ALMM Order 2019. From 1 June 2026 covered projects must use List-I modules that are made with List-II cells."),
         ("Is ALMM mandatory for rooftop solar?",
          "It is mandatory for projects covered by the order, including scheme-backed rooftop solar such as PM Surya Ghar. For other rooftop plants it depends on the connection and the state rules; many owners choose ALMM equipment anyway."),
         ("What are DCR modules?",
          "Domestic Content Requirement modules: modules made with Indian cells. Schemes such as PM Surya Ghar and PM-KUSUM require them."),
         ("Will there be an ALMM list for wafers?",
          "MNRE has signalled a List-III for wafers, reported for June 2028. It is not yet in force; watch for the notification.")],
    sources=src("almm", "china_brief", "budget25"),
    related=["solar-import-duty-india.html", "solar-quality-standards-bis-cea.html", "pm-surya-ghar-subsidy.html"],
    cases=["project-koomber-tea-estate-595kwp-solar-cm-inauguration.html", "project-barpatra-tea-estate-230kw-solar.html"],
    services=["capex-solar-epc.html", "service-epc.html"],
))

# ======================================================================== 4
A(dict(
    file="solar-import-duty-india.html", short="Solar import duty 2026", tag="Policy", date=UPDATED, updated=UPDATED,
    title="Solar Import Duty in India (2026): Customs on Modules and Cells, and What Budget 2026-27 Changed",
    seo_title="Solar Import Duty in India 2026 | Arrays Ingenieria",
    desc="Customs duty on imported solar modules and cells in 2026: BCD at 20% plus AIDC, Budget 2026-27 changes, anti-dumping and what buyers should do.",
    summary="Customs duty on imported solar equipment was restructured in Budget 2025-26 and adjusted again in Budget 2026-27. The rates, the reasoning, and how they shape module prices and your choice of supplier.",
    hero=IMG["bp_modules"], keywords=["solar import duty India", "BCD solar modules", "AIDC solar", "customs duty solar cells 2026", "Budget 2026-27 solar"],
    takeaways=["Budget 2025-26 cut Basic Customs Duty (BCD) on modules from 40% to 20% and on cells from 25% to 20%, and added an Agriculture Infrastructure and Development Cess (AIDC)",
               "With AIDC, the combined duty on imported modules stays around 40% and on cells around 27.5%, so domestic equipment keeps its edge",
               "Budget 2026-27 removed duty on an input for solar glass and let certain wafer-input exemptions lapse from 1 April 2026",
               "Anti-dumping duty on Chinese-origin cells and modules has been recommended; check the current notification before you import",
               "Together with ALMM, the duty structure means most C&I and scheme projects now use Indian-made modules"],
    sections=[
        dict(h="Why import duty matters for a solar plant", blocks=[
            "Modules are the single biggest equipment cost in a solar plant, and much of the world's module and cell supply is made in China. "
            "India uses customs duty, together with the <a href=\"almm-list-ii-solar-cells.html\">ALMM lists</a> and production-linked incentives, "
            "to make Indian manufacturing competitive. For a buyer, duty decides whether an imported module is cheaper than an Indian one once it "
            "lands, and therefore what your plant costs.",
        ]),
        dict(h="The rates after Budget 2025-26", blocks=[
            "The Union Budget presented on 1 February 2025 reorganised the duty on solar cells and modules. The headline BCD rate came down, but "
            "a cess was added so that the total protection stayed broadly the same.",
            ("table", "Customs duty on imported solar cells and modules (after Budget 2025-26)",
             ["Item", "BCD before", "BCD after", "AIDC added", "Combined, approximately"],
             [["Solar PV modules", "40%", "20%", "20%", "About 40% (plus social welfare surcharge where applicable)"],
              ["Solar PV cells", "25%", "20%", "7.5%", "About 27.5%"]]),
            ("note", "Why restructure at all?",
             "Moving part of the duty into a cess changes how revenue is shared between the Centre and the states and how some exemptions apply, "
             "while keeping the price signal for importers roughly where it was."),
        ]),
        dict(h="What Budget 2026-27 changed", blocks=[
            "The Budget presented on 1 February 2026 did not change the headline rates on modules and cells. It focused on the supply chain:",
            ("ul", ["It removed the basic customs duty on <strong>sodium antimonate</strong>, an input used to make solar glass in India.",
                    "Commentary on the Budget notes that BCD exemptions on <strong>silicon for un-diffused wafers</strong> and related inputs were allowed to lapse from 1 April 2026, as India builds its own wafer capacity.",
                    "It extended relief on equipment for lithium-ion battery cell manufacturing and critical-mineral processing, which matters for storage."]),
        ]),
        dict(h="Anti-dumping and other trade remedies", blocks=[
            "Beyond customs duty, India can impose anti-dumping duty when imports are sold below fair value. In September 2025 the Directorate "
            "General of Trade Remedies (DGTR) recommended anti-dumping duties on solar cells and modules of Chinese origin. Whether, when and at "
            "what rates they apply depends on the Finance Ministry's notification, so check the current status before you place an import order.",
        ]),
        dict(h="What this means for buyers", blocks=[
            ("table", "Imported versus Indian modules for common project types (2026)",
             ["Project type", "Domestic (ALMM / DCR) modules required?", "Practical choice"],
             [["PM Surya Ghar, PM-KUSUM", "Yes, DCR", "Indian modules with Indian cells"],
              ["Government and DISCOM-linked projects", "Yes, ALMM List-I with List-II cells", "Indian modules with Indian cells"],
              ["Net-metering and open-access C&I plants", "Within ALMM's scope, subject to exemptions", "Mostly Indian ALMM modules"],
              ["Private captive plants outside ALMM's scope", "Depends on connection and state rules", "Compare landed cost, warranty and documentation"]]),
            "For most commercial and industrial buyers the decision has shifted firmly towards Indian modules: duty and cess close much of the "
            "price gap, ALMM makes them mandatory for many connections, and service and warranty claims are simpler with a manufacturer in India.",
            ("cta", "Not sure which module route suits your project? We will compare options and paperwork before you commit."),
        ]),
    ],
    faq=[("What is the customs duty on solar panels in India in 2026?",
          "After Budget 2025-26, BCD on modules is 20% with a 20% AIDC added, a combined level of about 40%. Budget 2026-27 did not change these headline rates."),
         ("What is the duty on imported solar cells?",
          "BCD of 20% plus 7.5% AIDC, about 27.5% combined, after Budget 2025-26."),
         ("Is there anti-dumping duty on Chinese solar modules?",
          "DGTR recommended anti-dumping duties on Chinese-origin cells and modules in September 2025. Check the Finance Ministry's notification for the current status before importing."),
         ("Do I have to use Indian modules?",
          "For scheme-backed and government-linked projects, yes. For other projects it depends on ALMM's scope for your connection and on state rules; compare landed cost, warranty and documentation.")],
    sources=src("budget25", "budget26", "china_brief", "almm"),
    related=["almm-list-ii-solar-cells.html", "gst-on-solar-india.html", "india-solar-capacity-2026.html"],
    cases=["project-super-smelters-1980kwp-rooftop-solar.html"],
    services=["capex-solar-epc.html", "service-epc.html"],
))

# ======================================================================== 5
A(dict(
    file="accelerated-depreciation-solar.html", short="Accelerated depreciation", tag="Tax", date=UPDATED, updated=UPDATED,
    title="Accelerated Depreciation on Solar in India: How a Business Recovers the Cost Faster",
    seo_title="Accelerated Depreciation on Solar 2026 | Arrays Ingenieria",
    desc="A business that owns its solar plant can claim 40% depreciation on written-down value. How it works under the Income-tax Act, 2025, with an example.",
    summary="Owning your solar plant lets you write it off at 40% a year on the written-down value. How accelerated depreciation works from April 2026 under the new Income-tax Act, the half-year rule, and a worked example.",
    hero=IMG["supersmelters"], keywords=["accelerated depreciation solar", "40% depreciation solar India", "Income-tax Act 2025 depreciation", "solar tax benefit business", "CAPEX solar tax"],
    takeaways=["Solar power generating systems sit in the renewable-energy block of the depreciation schedule at <strong>40% on the written-down value (WDV)</strong>",
               "The <strong>Income-tax Act, 2025</strong> applies from <strong>1 April 2026</strong>; the 40% rate for qualifying solar assets is reported to continue under it",
               "Only the <strong>owner</strong> of the plant claims it, which is why it matters for the CAPEX model and not for OPEX or PPA deals",
               "An asset used for less than 180 days in its first year gets half the year's depreciation",
               "On a Rs 1 crore plant, about Rs 78 lakh is written off in the first three full years"],
    sections=[
        dict(h="What accelerated depreciation means", blocks=[
            "Depreciation is the deduction a business takes each year for the wear of an asset it owns. Ordinary plant and machinery is written "
            "off at 15% a year on the written-down value. Renewable-energy devices, including <strong>solar power generating systems</strong>, "
            "are allowed a much higher rate: <strong>40% a year on WDV</strong>. Because the deduction lowers taxable profit, the plant pays "
            "back part of its own cost through tax savings in the first few years.",
        ]),
        dict(h="What changed in April 2026: the Income-tax Act, 2025", blocks=[
            "India's new <strong>Income-tax Act, 2025</strong> replaced the 1961 Act from <strong>1 April 2026</strong>. It uses the idea of a "
            "\"tax year\" and renumbers the sections: the depreciation provision that was Section 32 now sits elsewhere in the new Act (reported "
            "as Section 34). Tax commentators report that the depreciation schedule for renewable-energy devices, including the 40% rate for "
            "qualifying solar assets, continues.",
            ("warn", "Confirm with your chartered accountant",
             "The new Act's schedule, rules and transition provisions decide the exact block, rate and conditions for your assets. Matters for "
             "years before 1 April 2026 stay under the 1961 Act. Check your position before you rely on the figures in this guide."),
        ]),
        dict(h="Who can claim it", blocks=[
            ("ul", ["The <strong>owner</strong> of the plant, using it for business: a factory, warehouse, hospital, school run as a business, tea estate or commercial building.",
                    "Not the consumer in an OPEX, RESCO or PPA arrangement, where the developer owns the plant and claims the depreciation itself.",
                    "Not households, which do not compute business income on their homes; for them PM Surya Ghar's subsidy is the support."]),
            "That is the single biggest financial difference between owning a plant (CAPEX) and buying its power (OPEX). See <a href=\"capex-vs-opex-solar.html\">CAPEX vs OPEX solar</a>.",
        ]),
        dict(h="Worked example: a Rs 1 crore plant", blocks=[
            "Assume a company installs a plant costing <strong>Rs 1 crore</strong> (net of any input tax credit), puts it to use early in the year "
            "(more than 180 days), and pays tax at an effective <strong>25.17%</strong> (the 22% concessional corporate rate plus surcharge and cess).",
            ("table", "Depreciation at 40% WDV on a Rs 1 crore solar plant (illustrative)",
             ["Year", "Opening WDV", "Depreciation at 40%", "Tax saved at 25.17%", "Cumulative tax saved"],
             [["Year 1", "Rs 100.0 lakh", "Rs 40.0 lakh", "Rs 10.1 lakh", "Rs 10.1 lakh"],
              ["Year 2", "Rs 60.0 lakh", "Rs 24.0 lakh", "Rs 6.0 lakh", "Rs 16.1 lakh"],
              ["Year 3", "Rs 36.0 lakh", "Rs 14.4 lakh", "Rs 3.6 lakh", "Rs 19.7 lakh"],
              ["Year 4", "Rs 21.6 lakh", "Rs 8.6 lakh", "Rs 2.2 lakh", "Rs 21.9 lakh"],
              ["Year 5", "Rs 13.0 lakh", "Rs 5.2 lakh", "Rs 1.3 lakh", "Rs 23.2 lakh"]]),
            "Roughly a fifth of the plant's cost comes back as tax saved within five years, on top of the savings on the power bill. If the "
            "plant is commissioned late in the year and used for less than 180 days, year one's deduction halves to Rs 20 lakh and the rest "
            "carries forward in the WDV.",
            ("note", "Timing tip",
             "Because of the 180-day rule, commissioning in the first half of the financial year (before early October) can double the first-year "
             "deduction compared with commissioning in the last quarter. Plan the project schedule with your finance team."),
        ]),
        dict(h="Putting it together with GST and power savings", blocks=[
            "For a business owner, the full picture of a solar plant's return has three parts:",
            ("ol", ["<strong>Power savings:</strong> every unit generated replaces a unit bought from the grid at your commercial or industrial tariff.",
                    "<strong>Tax savings:</strong> 40% WDV depreciation reduces tax in the early years.",
                    "<strong>Lower upfront cost:</strong> GST on solar equipment is 5% and, for most businesses, recoverable as input tax credit (see <a href=\"gst-on-solar-india.html\">GST on solar</a>)."]),
            "With all three, payback for a well-sited C&I plant is often in the range of three to five years, after which the plant keeps "
            "generating for two decades more.",
            ("cta", "Want a payback estimate with depreciation built in? Send us your last 12 power bills."),
        ]),
    ],
    faq=[("What is the depreciation rate on solar panels in India?",
          "Solar power generating systems are in the renewable-energy block at 40% on the written-down value, for business owners."),
         ("Does accelerated depreciation continue under the Income-tax Act, 2025?",
          "The new Act applies from 1 April 2026, and commentators report that the 40% rate for qualifying solar assets continues under its depreciation schedule. Confirm the exact provision and conditions with your chartered accountant."),
         ("Can I claim depreciation on a solar plant under a PPA?",
          "No. Under a PPA or OPEX model the developer owns the plant and claims the depreciation. You claim it only if you own the plant (CAPEX)."),
         ("What is the 180-day rule?",
          "An asset put to use for less than 180 days in the year of acquisition gets only half of that year's depreciation. The remainder is claimed in later years.")],
    sources=src("dep_2025", "gst"),
    related=["capex-vs-opex-solar.html", "gst-on-solar-india.html", "choose-solar-epc-partner.html"],
    cases=["project-super-smelters-1980kwp-rooftop-solar.html", "project-apar-industries-jharsuguda-1-2mwp-rooftop-solar.html", "project-srmb-steel-durgapur-rooftop-solar.html"],
    services=["capex-solar-epc.html"],
))

# ======================================================================== 6
A(dict(
    file="capex-vs-opex-solar.html", short="CAPEX vs OPEX solar", tag="Business Models", date="2026-10-02", updated=UPDATED,
    old_ids=["capex-vs-opex-solar"],
    title="CAPEX vs OPEX (RESCO) Solar: Which Model Suits Your Business?",
    seo_title="CAPEX vs OPEX Solar: Which Pays? | Arrays Ingenieria",
    desc="Own the plant (CAPEX) or pay per unit (OPEX, RESCO, PPA)? Cost, savings, depreciation, risk and contracts compared for Indian businesses in 2026.",
    summary="Own your solar plant and keep every unit, or pay a developer per unit with no upfront cost? A side-by-side comparison of CAPEX and OPEX solar, with the numbers that decide it.",
    hero=IMG["jayshree"], keywords=["CAPEX vs OPEX solar", "RESCO solar India", "solar PPA India", "own vs lease solar", "CAPEX solar EPC"],
    takeaways=["<strong>CAPEX:</strong> you pay for the plant, own it, keep all the savings and claim 40% depreciation",
               "<strong>OPEX / RESCO:</strong> a developer builds and owns the plant and sells you power per unit, usually for 15 to 25 years",
               "CAPEX gives the highest lifetime savings; OPEX preserves cash and moves performance risk to the developer",
               "Contract length, exit clauses, roof or land rights and tariff escalation decide whether an OPEX deal is good",
               "Arrays Ingenieria builds on the CAPEX model and installs for developers who run OPEX projects"],
    sections=[
        dict(h="The two models in one minute", blocks=[
            "Under <strong>CAPEX</strong> (capital expenditure) you buy the plant. An EPC contractor designs, supplies, builds and commissions it; "
            "you own it from day one, and every unit it generates is power you do not buy from the grid.",
            "Under <strong>OPEX</strong>, also called RESCO (renewable energy service company) or a PPA (power purchase agreement), a developer "
            "builds and owns the plant on your roof or land and sells you its power at an agreed tariff per unit for a long term. You pay nothing "
            "upfront, but you share the savings with the developer.",
        ]),
        dict(h="Side-by-side comparison", blocks=[
            ("table", "CAPEX and OPEX solar compared",
             ["Factor", "CAPEX (you own)", "OPEX / RESCO / PPA (developer owns)"],
             [["Upfront cost", "Full plant cost", "None or minimal"],
              ["Who owns the plant", "You", "The developer, for the contract term"],
              ["Savings on power bill", "Highest: every unit is yours", "Lower: you pay the PPA tariff per unit"],
              ["Depreciation (40% WDV)", "You claim it", "Developer claims it"],
              ["Operation and maintenance", "Your responsibility (or an O&M contract)", "Developer's responsibility"],
              ["Performance risk", "Yours (protected by warranties)", "Developer's (you pay only for units delivered)"],
              ["Contract term", "EPC contract plus warranties", "Typically 15 to 25 years"],
              ["Balance sheet", "Asset on your books", "Usually an operating expense"],
              ["Typical payback", "About 3 to 5 years for C&I", "Not applicable; savings from day one"]]),
        ]),
        dict(h="The numbers that decide it", blocks=[
            ("h3", "Your tariff and your tax position"),
            "The higher your grid tariff and the more of the day your site consumes power, the faster a CAPEX plant pays back. A business paying "
            "corporate tax gains more from depreciation (see <a href=\"accelerated-depreciation-solar.html\">our depreciation guide</a>).",
            ("h3", "Your cost of capital"),
            "If cash is tight or reserved for core expansion, OPEX lets you start saving without spending. Some businesses fund CAPEX plants with "
            "term loans; banks lend readily against solar because the savings are predictable.",
            ("h3", "Your horizon on the site"),
            "If you own the building or land and will be there for 25 years, CAPEX usually wins. If your lease is short, an OPEX contract that "
            "matches the lease, or a CAPEX plant designed to be relocated, may suit better.",
        ]),
        dict(h="What to check in an OPEX or PPA contract", blocks=[
            ("ul", ["<strong>Tariff and escalation:</strong> a fixed tariff or a small escalation; compare it with your grid tariff path.",
                    "<strong>Term and early exit:</strong> the buy-out price if you sell the building or want to own the plant early.",
                    "<strong>Minimum offtake:</strong> whether you must pay for units you cannot use (for example on holidays).",
                    "<strong>Roof and land rights:</strong> access, roof repairs and what happens if you need to re-roof.",
                    "<strong>Performance guarantee:</strong> a generation guarantee and compensation for shortfall.",
                    "<strong>End of term:</strong> whether the plant transfers to you, and in what condition."]),
        ]),
        dict(h="Which model for which business", blocks=[
            ("table", "A quick guide",
             ["Your situation", "Usually better"],
             [["Profitable business, owns the site, wants the highest lifetime savings", "CAPEX"],
              ["Tea estate with land and steady factory load in the season", "CAPEX (ground-mount)"],
              ["Cash-constrained, or capital reserved for core expansion", "OPEX / PPA"],
              ["Short lease on the premises", "OPEX matched to the lease, or a relocatable CAPEX plant"],
              ["Developer or EPC major needing site crews", "Hire an I&C partner"]]),
            "We build on the CAPEX model for owners, and we are the <a href=\"solar-installation-commissioning.html\">installation & commissioning</a> "
            "partner for EPC companies and developers who run OPEX and utility projects, so we see both sides.",
            ("fig",) + IMG["jayshree"] + ("Jay Shree Tea's 1035 kWp across Towkok and Manjushree Tea Estates: a CAPEX ground-mount project built under Tata Power's EPC, with DG synchronisation at each estate.",),
            ("cta", "Tell us your bills, roof or land, and plans; we will show you CAPEX numbers you can compare with any PPA offer."),
        ]),
    ],
    faq=[("What is the difference between CAPEX and OPEX solar?",
          "Under CAPEX you pay for and own the plant and keep all its savings. Under OPEX (RESCO or PPA) a developer owns the plant and sells you its power per unit with no upfront cost."),
         ("Which is cheaper over 25 years?",
          "CAPEX, because you do not pay the developer's margin on every unit and you claim depreciation. OPEX trades some of that saving for no upfront cost and less performance risk."),
         ("Can I switch from OPEX to owning the plant later?",
          "Many PPAs include a buy-out option at set points in the term. Check the buy-out schedule before you sign."),
         ("Does Arrays Ingenieria offer OPEX or PPA?",
          "No. We build CAPEX plants that you own, and we install and commission plants for developers and EPC companies that offer OPEX.")],
    sources=src("dep_2025", "gst"),
    related=["accelerated-depreciation-solar.html", "gst-on-solar-india.html", "choose-solar-epc-partner.html"],
    cases=["project-jayshree-tea-1mw-solar-assam.html", "project-super-smelters-1980kwp-rooftop-solar.html", "project-balaji-action-sitarganj-4mwp-solar.html"],
    services=["capex-solar-epc.html", "solar-installation-commissioning.html"],
))

# ======================================================================== 7
A(dict(
    file="net-metering-india.html", short="Net metering in India", tag="Grid & Regulation", date="2026-10-02", updated=UPDATED,
    old_ids=["net-metering"],
    title="Net Metering in India (2026): Net Billing, Gross Metering, ToD Tariffs and the Draft 2026 Rules",
    seo_title="Net Metering in India 2026: Rules | Arrays Ingenieria",
    desc="Net metering, net billing and gross metering in India in 2026: the 500 kW limit, time-of-day tariffs, the draft 2026 rules and the approval steps.",
    summary="How your solar plant connects to the DISCOM and how exported units are paid for: net metering, net billing and gross metering, the 500 kW rule, time-of-day tariffs, the draft 2026 amendments, and the step-by-step approval process.",
    hero=IMG["bp_acdb"], keywords=["net metering India", "net metering 500 kW", "net billing gross metering", "ToD tariff solar", "Electricity Rights of Consumers Rules 2026"],
    takeaways=["Under the Electricity (Rights of Consumers) Rules as amended in 2021, net metering is allowed up to <strong>500 kW or the sanctioned load</strong>, whichever is lower; above that, net billing or gross metering applies",
               "Your <strong>state regulator</strong> sets the detailed rules: settlement period, rate for surplus units, banking and charges",
               "Time-of-day tariffs make daytime solar hours cheaper and evening peaks dearer, which favours self-consumption",
               "A <strong>draft amendment of March 2026</strong> proposes net-metering charges above 5 kW and storage for systems above 500 kW; it was a draft when this guide was checked",
               "Approvals typically run: application, technical feasibility, agreement, installation, inspection, meter, synchronisation"],
    sections=[
        dict(h="Three ways a solar plant can connect", blocks=[
            ("table", "Net metering, net billing and gross metering",
             ["Arrangement", "How it works", "Best for"],
             [["Net metering", "One bidirectional meter. Exports offset imports unit for unit within the settlement period; surplus is paid at a rate set by the regulator or carried forward.", "Homes and small to mid C&I plants that consume most of their output"],
              ["Net billing (net feed-in)", "Imports are billed at your tariff; exports are credited at a separate, usually lower, feed-in rate.", "Larger plants where the regulator prefers to price exports separately"],
              ["Gross metering", "All generation is exported and paid at a feed-in tariff; all consumption is billed separately.", "Plants built mainly to sell power"]]),
            "Behind-the-meter self-consumption, with no export at all, is a fourth option. Where the plant is sized below your daytime load, "
            "almost every unit is used on site and the export arrangement matters less.",
        ]),
        dict(h="The national framework: the 500 kW rule", blocks=[
            "The <strong>Electricity (Rights of Consumers) Rules, 2020</strong>, as amended in 2021, made net metering available to prosumers for "
            "systems up to <strong>500 kW or the sanctioned load, whichever is lower</strong>. Systems above that can be connected under net billing "
            "or gross metering. The rules also set timelines for DISCOMs to process connections, and later amendments simplified the process for "
            "small rooftop systems.",
            "Within that framework each <strong>State Electricity Regulatory Commission</strong> writes its own regulations: the settlement period "
            "(monthly or annual), the rate paid for surplus units, banking, the charges payable and the paperwork. Always read your own state's "
            "current regulations; in Assam that is the Assam Electricity Regulatory Commission and APDCL's procedures.",
        ]),
        dict(h="Time-of-day tariffs: why daytime solar is worth more", blocks=[
            "The 2023 amendment to the consumer rules introduced <strong>time-of-day (ToD) tariffs</strong>, first for commercial and industrial "
            "consumers and then for most others as smart meters roll out. During the solar hours the tariff is lower than normal; during the "
            "evening peak it is higher. For a solar owner that means:",
            ("ul", ["Units you <strong>self-consume</strong> during the day still save money, though the saving per unit depends on your daytime rate.",
                    "Shifting flexible loads (pumping, chilling, batch processes, charging) into the solar hours increases savings.",
                    "Storage becomes more attractive where evening peak rates are high (see <a href=\"battery-storage-with-solar.html\">battery storage with solar</a>)."]),
        ]),
        dict(h="The draft 2026 amendment: what is proposed", blocks=[
            "On <strong>12 March 2026</strong> the Ministry of Power published a draft amendment to the consumer rules for comment until 11 April "
            "2026, with a proposed start of 1 October 2026. Among the proposals reported:",
            ("ul", ["Where a state has no net-metering rules of its own, net metering up to <strong>500 kW or the sanctioned load</strong>, whichever is lower.",
                    "State commissions may levy <strong>net-metering charges on systems above 5 kW</strong>, reflecting network and storage costs; small residential systems would be spared.",
                    "Renewable installations above <strong>500 kW</strong> may need energy storage.",
                    "Demand response, wider ToD tariffs, faster connections and automatic review of abnormal bills."]),
            ("warn", "Draft, not final",
             "When this guide was checked we had not seen the final notification. If you are planning a plant above 5 kW, and especially above 500 kW, "
             "check the final rules and your state's regulations before fixing the design."),
        ]),
        dict(h="Step by step: getting a net-metered connection", blocks=[
            ("steps", [("Application", "Apply to your DISCOM (online in most states) with the plant capacity, sanctioned load and site details."),
                       ("Technical feasibility", "The DISCOM checks the transformer and feeder can take the plant; limits on the share of transformer capacity apply."),
                       ("Agreement", "Sign the net-metering or connection agreement and pay the fees."),
                       ("Installation", "Your EPC installs the plant to the approved design, with the protections the DISCOM requires (anti-islanding inverter, isolators, earthing)."),
                       ("Inspection", "The DISCOM, and the Electrical Inspector (CEIG) where the voltage or capacity requires it, inspects the installation."),
                       ("Meter and synchronisation", "The bidirectional or generation meter is fixed and tested, and the plant is synchronised with the grid.")]),
            ("fig",) + IMG["bp_acdb"] + ("The AC distribution board at the 230 kWp Borpatra Tea Estate plant. We obtained the net-metering and statutory approvals from APDCL for this plant.",),
            ("cta", "We handle net-metering and CEIG paperwork as part of every CAPEX project. Ask us what your state requires."),
        ]),
    ],
    faq=[("What is the net-metering limit in India?",
          "Under the national consumer rules as amended in 2021, net metering is available up to 500 kW or the sanctioned load, whichever is lower. States set the details."),
         ("What is the difference between net metering and net billing?",
          "Net metering offsets exported units against imported units one for one. Net billing bills imports at your tariff and credits exports at a separate, usually lower, rate."),
         ("Are there new net-metering rules in 2026?",
          "The Ministry of Power published a draft amendment in March 2026 proposing, among other things, net-metering charges above 5 kW and storage for systems above 500 kW. Check whether it has been notified in final form."),
         ("How long does net-metering approval take?",
          "It depends on the state and capacity. The national rules set maximum timelines for DISCOMs; in practice allow several weeks, longer where the Electrical Inspector must inspect.")],
    sources=src("netmeter_2021", "draft_rules_2026", "draft_rules_resi"),
    related=["green-energy-open-access.html", "battery-storage-with-solar.html", "solar-plant-commissioning-checklist.html"],
    cases=["project-barpatra-tea-estate-230kw-solar.html", "project-tcpl-vaishali-319kwp-rooftop-solar.html"],
    services=["capex-solar-epc.html", "service-rooftop.html"],
))

# ======================================================================== 8
A(dict(
    file="green-energy-open-access.html", short="Green Energy Open Access", tag="Grid & Regulation", date=UPDATED, updated=UPDATED,
    title="Green Energy Open Access in India: Buy Solar Power from Off-Site Plants from 100 kW",
    seo_title="Green Energy Open Access India 2026 | Arrays Ingenieria",
    desc="Green Energy Open Access lets consumers from 100 kW buy solar from off-site plants. Eligibility, charges, banking, GOAR and the ISTS waiver phase-out.",
    summary="Can't fit enough solar on your roof? Green Energy Open Access lets consumers from 100 kW buy power from a solar plant elsewhere. Eligibility, approvals, charges, banking, and the ISTS waiver phase-out.",
    hero=IMG["dcm"], keywords=["green energy open access", "open access solar 100 kW", "GOAR portal", "ISTS waiver solar", "captive solar open access"],
    takeaways=["The <strong>Green Energy Open Access Rules, 2022</strong> cut the eligibility threshold from 1 MW to <strong>100 kW</strong>; captive consumers have no minimum",
               "A 2023 amendment lets consumers <strong>aggregate connections</strong> in the same electricity division to reach 100 kW",
               "Applications go through the national <strong>GOAR</strong> portal, with deemed approval if not decided in time",
               "Charges (wheeling, transmission, cross-subsidy and other surcharges) are set by state regulators and decide the economics",
               "The full <strong>ISTS charges waiver</strong> ended for projects commissioned after 30 June 2025 and is phasing out in steps"],
    sections=[
        dict(h="What open access is", blocks=[
            "Open access lets an electricity consumer buy power from a generator of its choice and have it delivered through the transmission and "
            "distribution network, paying charges for using the wires. With <strong>green energy open access</strong> the generator is a "
            "renewable plant, typically a ground-mount solar plant on cheaper land elsewhere in the state, owned by you (captive) or by a developer "
            "(third-party).",
            "It suits businesses whose roof or land cannot host a plant big enough for their consumption: textile mills, cement and steel units, "
            "data centres, hospitals and large commercial campuses.",
        ]),
        dict(h="The 2022 rules and the 2023 amendment", blocks=[
            ("table", "Key features of the Green Energy Open Access Rules",
             ["Feature", "What the rules provide"],
             [["Eligibility", "Consumers with contracted demand or sanctioned load of 100 kW or more (down from 1 MW); captive consumers have no load limit"],
              ["Aggregation (2023 amendment)", "Several connections of the same consumer within the same electricity division can be pooled to reach 100 kW"],
              ["Single window", "Applications through the national Green Energy Open Access Registry (GOAR) portal"],
              ["Timelines", "Applications to be decided within a fixed period, otherwise deemed approved"],
              ["Banking", "Surplus green power can be banked, at least on a monthly basis, subject to charges set by the regulator"],
              ["Charges", "Transmission, wheeling, cross-subsidy and other surcharges as fixed by the state commission, with limits on how fast some can rise"],
              ["Green certificates", "Consumers can obtain green energy certificates for the power they buy"]]),
            ("warn", "State rules differ",
             "Each state's regulator has to adopt and implement the rules, and some states apply their own thresholds or charges. Check your state's "
             "current open-access regulations and charges before modelling a project."),
        ]),
        dict(h="Captive or third-party?", blocks=[
            ("table", "Two ways to use open access",
             ["Model", "Who owns the plant", "Key condition", "Charges"],
             [["Captive", "You (or a group captive company you hold at least 26% of)", "You consume at least 51% of the plant's output", "Cross-subsidy and additional surcharges generally not payable"],
              ["Third-party", "A developer", "PPA at an agreed tariff", "All applicable open-access charges"]]),
            "Captive projects usually give the lowest landed cost because surcharges fall away, but they need equity or a group-captive structure. "
            "The plant itself is an ordinary ground-mount solar plant: piling, structures, modules, inverters, a substation and a transmission line "
            "to the grid.",
            ("fig",) + IMG["dcm"] + ("Civil works for the 10 MW ground-mount solar plant at DCM Textile, Hisar: the kind of plant that open-access and captive projects are built around.",),
        ]),
        dict(h="ISTS charges: the waiver is phasing out", blocks=[
            "Inter-state transmission (ISTS) charges were fully waived for solar and wind projects commissioned up to <strong>30 June 2025</strong>, "
            "for 25 years. For projects commissioned after that, the waiver phases out in steps: the Ministry of Power's schedule levies 25% of "
            "the applicable charges on projects commissioned in the first year after June 2025, then 50%, then 75%, with full charges for projects "
            "commissioned after June 2028. Co-located battery storage projects have separate, more generous terms.",
            "For an inter-state open-access deal, this makes commissioning dates matter: a project commissioned earlier keeps a larger waiver for its "
            "whole life.",
        ]),
        dict(h="How to evaluate an open-access project", blocks=[
            ("steps", [("Map your demand", "Contracted demand, consumption profile and tariff over 12 months."),
                       ("Check eligibility and state charges", "Threshold, aggregation, banking and the full list of charges in your state."),
                       ("Choose the model", "Captive, group captive or third-party PPA."),
                       ("Find the site", "Land, irrigation-free terrain, evacuation to a nearby substation, soil for piling."),
                       ("Model the landed cost", "Generation cost plus all charges and losses, compared with your grid tariff."),
                       ("Apply on GOAR", "With the plant and consumer details; track approvals and connectivity.")]),
            ("cta", "Building a captive ground-mount plant? We do the piling, civil works, fencing and installation & commissioning."),
        ]),
    ],
    faq=[("Who is eligible for green energy open access?",
          "Consumers with contracted demand or sanctioned load of 100 kW or more, and captive consumers with no minimum. Several connections in the same electricity division can be aggregated."),
         ("Where do I apply for green open access?",
          "Through the national Green Energy Open Access Registry (GOAR) portal, greenopenaccess.in, and your state's nodal agency."),
         ("Is the ISTS charge waiver still available?",
          "The full waiver applied to projects commissioned up to 30 June 2025. After that it phases out in steps, with full charges for projects commissioned after June 2028."),
         ("Is open access cheaper than rooftop solar?",
          "Not always. Rooftop solar avoids network charges entirely. Open access makes sense when you need more green power than your roof can host; the state's charges decide the economics.")],
    sources=src("goar", "geoa_ieefa", "geoa_amend", "ists"),
    related=["net-metering-india.html", "capex-vs-opex-solar.html", "rooftop-vs-ground-mount-solar.html"],
    cases=["project-dcm-hisar-10mw-solar-civil-works.html", "project-yiapl-14-36mw-solar-civil-fencing.html", "project-seci-300mw-koppal-pile-foundation.html"],
    services=["service-ground-mount.html", "service-piling.html", "service-civil.html"],
))

# ======================================================================== 9
A(dict(
    file="pm-surya-ghar-subsidy.html", short="PM Surya Ghar 2026", tag="Schemes", date="2026-10-02", updated=UPDATED,
    old_ids=["pm-surya-ghar-subsidy"],
    title="PM Surya Ghar: Muft Bijli Yojana 2026: Subsidy, Eligibility and How to Apply",
    seo_title="PM Surya Ghar Subsidy 2026 Guide | Arrays Ingenieria",
    desc="PM Surya Ghar gives homes up to Rs 78,000 for rooftop solar. Subsidy by size, housing-society support, loans, eligibility and how to apply in 2026.",
    summary="India's rooftop solar scheme for homes: up to Rs 78,000 central subsidy, support for housing societies, low-cost loans and the national portal. What you get, who qualifies, and the steps from application to subsidy.",
    hero=IMG["assam_rooftop"], keywords=["PM Surya Ghar subsidy", "Muft Bijli Yojana 2026", "rooftop solar subsidy India", "PM Surya Ghar apply", "solar subsidy 3 kW"],
    takeaways=["Central subsidy: <strong>Rs 30,000 for 1 kW, Rs 60,000 for 2 kW, Rs 78,000 for 3 kW or more</strong>",
               "Housing societies and RWAs get <strong>Rs 18,000 per kW</strong> for common facilities, up to 500 kW",
               "Approved by the Cabinet on 29 February 2024 with an outlay of <strong>Rs 75,021 crore</strong>; the government's target is 75 lakh households by December 2026, on the way to 1 crore",
               "Modules must be Indian-made (DCR), installed by a registered vendor, and the application made on the national portal",
               "Many states add their own top-up subsidy; check your DISCOM"],
    sections=[
        dict(h="What the scheme offers", blocks=[
            "<strong>PM Surya Ghar: Muft Bijli Yojana</strong> was launched by the Prime Minister on 13 February 2024 and approved by the Union "
            "Cabinet on 29 February 2024 with an outlay of <strong>Rs 75,021 crore</strong>. It aims to put rooftop solar on one crore homes so "
            "that each can generate up to about 300 units a month, and the government's milestone is <strong>75 lakh households by December 2026</strong>.",
            ("table", "Central financial assistance under PM Surya Ghar",
             ["Category", "Support", "Notes"],
             [["Homes, 1 kW", "Rs 30,000", "60% of benchmark cost for the first 2 kW"],
              ["Homes, 2 kW", "Rs 60,000", ""],
              ["Homes, 3 kW or more", "Rs 78,000 (cap)", "40% of the additional cost between 2 and 3 kW; no extra subsidy above 3 kW"],
              ["Housing societies / RWAs (common facilities, EV charging)", "Rs 18,000 per kW", "Up to 500 kW, at 3 kW per house"],
              ["Special category states and UTs", "Higher benchmark support where notified", "Including the North-Eastern states"]]),
            ("stats", [("Rs 78,000", "Maximum central subsidy per home"), ("1 crore", "Homes targeted"), ("Rs 75,021 cr", "Scheme outlay"), ("~300 units", "Free power a month, the aim")]),
        ]),
        dict(h="Who can apply", blocks=[
            ("ul", ["An Indian household with its own roof suitable for solar panels",
                    "A valid electricity connection in the household's name",
                    "No earlier central subsidy for rooftop solar on the same connection",
                    "Housing societies and RWAs for common loads, through the society"]),
        ]),
        dict(h="How to apply, step by step", blocks=[
            ("steps", [("Register", "On the national portal (pmsuryaghar.gov.in) with your state, DISCOM, consumer number and mobile number."),
                       ("Apply", "Fill in the rooftop solar application; the DISCOM checks feasibility."),
                       ("Choose a registered vendor", "Pick a vendor registered with your DISCOM; agree capacity and price."),
                       ("Install", "The vendor installs the system with DCR modules and a compliant inverter."),
                       ("Net meter and inspection", "Submit plant details, apply for the net meter; the DISCOM inspects and commissions."),
                       ("Subsidy", "After the commissioning certificate is generated on the portal, submit bank details; the subsidy is credited to your account.")]),
            "Collateral-free loans of around 7% are available from public-sector banks for residential systems up to 3 kW, and the portal links to "
            "lenders. Model solar villages in each district receive additional support.",
        ]),
        dict(h="Getting the most from a home system", blocks=[
            ("ul", ["Size to your consumption: a 3 kW system typically generates around 12 units a day in most of India, depending on sunshine and orientation.",
                    "Use a shade-free, south-facing area where you can; avoid water tanks and parapets casting shadows.",
                    "Ask for the DCR module certificate, inverter BIS certificate and warranty documents.",
                    "Keep the panels clean: dust can cut output noticeably in dry months (see <a href=\"solar-om-module-cleaning.html\">O&M and module cleaning</a>)."]),
        ]),
        dict(h="Where Arrays Ingenieria fits", blocks=[
            "PM Surya Ghar is a scheme for homes and housing societies. Arrays Ingenieria focuses on commercial, industrial and tea-estate plants, "
            "which fall outside it, and on installation & commissioning for developers. For businesses, the equivalent levers are "
            "<a href=\"accelerated-depreciation-solar.html\">accelerated depreciation</a>, the <a href=\"gst-on-solar-india.html\">5% GST rate</a> "
            "and <a href=\"net-metering-india.html\">net metering</a> or <a href=\"green-energy-open-access.html\">open access</a>.",
            ("cta", "Running a business, school, hospital or housing society with a large roof? We can design a plant that pays back fast."),
        ]),
    ],
    faq=[("How much subsidy do I get under PM Surya Ghar?",
          "Rs 30,000 for 1 kW, Rs 60,000 for 2 kW and Rs 78,000 for 3 kW or more. Housing societies get Rs 18,000 per kW for common facilities up to 500 kW."),
         ("Can a business get the PM Surya Ghar subsidy?",
          "No. The scheme is for residential households and housing societies. Businesses benefit instead from accelerated depreciation, 5% GST and net metering or open access."),
         ("Do I need Indian-made panels?",
          "Yes. Systems under the scheme must use domestically manufactured (DCR) modules and be installed by a vendor registered with your DISCOM."),
         ("How long does the subsidy take?",
          "After installation, inspection and net-meter commissioning, the commissioning certificate is generated on the portal and the subsidy is paid to your bank account, typically within weeks.")],
    sources=src("surya_cab", "surya", "surya_portal"),
    related=["net-metering-india.html", "pm-kusum-scheme.html", "almm-list-ii-solar-cells.html"],
    cases=["project-assam-1711kwp-on-grid-solar.html"],
    services=["service-rooftop.html", "capex-solar-epc.html"],
))

# ======================================================================= 10
A(dict(
    file="pm-kusum-scheme.html", short="PM-KUSUM 2026", tag="Schemes", date="2026-10-02", updated=UPDATED,
    old_ids=["pm-kusum-2026"],
    title="PM-KUSUM in 2026: Components A, B and C, New Deadlines and What Comes Next",
    seo_title="PM-KUSUM Scheme 2026: Deadlines | Arrays Ingenieria",
    desc="PM-KUSUM in 2026: solar plants on farmland, solar pumps and feeder solarisation, the support on offer, the extended deadlines and the proposed 2.0.",
    summary="India's farm solar scheme: up to 2 MW plants on farmers' land, standalone solar pumps and solarised feeders. What each component offers, the 2026 deadline extensions, and the proposed PM-KUSUM 2.0.",
    hero=IMG["ramnagar"], keywords=["PM-KUSUM 2026", "PM KUSUM component A", "solar pump subsidy", "feeder level solarisation", "PM KUSUM 2.0"],
    takeaways=["<strong>Component A:</strong> grid-connected solar plants of 500 kW to 2 MW on farmers' land, with the power bought by the DISCOM",
               "<strong>Component B:</strong> standalone solar pumps for farms off the grid, with central and state support",
               "<strong>Component C:</strong> solarising existing grid-connected pumps, individually or by whole agricultural feeders",
               "2026: financial closure for Components A and C extended to <strong>30 November 2026</strong>; completion by <strong>31 March 2027</strong>, with no further extension",
               "A <strong>PM-KUSUM 2.0</strong> with a dedicated agri-PV component has been announced but not yet launched"],
    sections=[
        dict(h="What PM-KUSUM is", blocks=[
            "<strong>Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan (PM-KUSUM)</strong> was launched in March 2019 to give farmers "
            "energy security and an extra income from solar, while cutting the diesel and subsidised grid power used for irrigation. It was "
            "scaled up and extended in the years since, and in 2026 it is in its final stretch.",
        ]),
        dict(h="The three components", blocks=[
            ("table", "PM-KUSUM at a glance",
             ["Component", "What gets built", "Who benefits", "Support (typical)"],
             [["A", "Grid-connected ground- or stilt-mounted solar plants of 500 kW to 2 MW on barren, fallow or farm land, usually within 5 km of a substation", "Farmers, groups, cooperatives, panchayats, FPOs, and developers on their land", "DISCOM buys the power at a pre-fixed tariff; DISCOMs receive a performance-based incentive"],
              ["B", "Standalone off-grid solar pumps", "Individual farmers", "Central support of 30% of benchmark cost (50% in the North-East, hill states and islands), plus state support"],
              ["C", "Solarisation of existing grid-connected pumps (individual) or of whole agricultural feeders (feeder-level solarisation)", "Farmers on grid-connected pumps; DISCOMs for feeders", "Central support of 30% (50% in special-category states) for individual pumps; central support for feeder-level plants"]]),
            ("note", "Why feeder-level solarisation matters",
             "Instead of panels on every farm, a ground-mount solar plant of a few megawatts feeds an entire agricultural feeder. Farmers get daytime "
             "power for irrigation, and the plant is an ordinary utility-style build: land, piling, structures, modules, inverters and a substation connection."),
        ]),
        dict(h="The 2026 deadlines", blocks=[
            ("table", "PM-KUSUM timelines as revised in 2026",
             ["Milestone", "Applies to", "Date"],
             [["Financial closure", "Components A and C", "<strong>30 November 2026</strong> (extended from 30 September 2026)"],
              ["Completion (commissioning)", "Projects with PPA signed or NTP issued on or before 31 December 2025", "<strong>31 March 2027</strong>; no further extension, per MNRE"],
              ["Commissioning, individual pumps", "Component B and Component C (individual pump solarisation)", "30 September 2026 under the March 2026 revision; check for later updates"]]),
            "The extension of financial closure was granted because developers had trouble getting loans appraised and sanctioned in time. MNRE "
            "has said there will be no extension of the completion deadline beyond 31 March 2027, so projects that are not under construction "
            "by early 2027 are at real risk.",
        ]),
        dict(h="What is next: PM-KUSUM 2.0", blocks=[
            "The Union Minister for New and Renewable Energy has said a <strong>PM-KUSUM 2.0</strong> will follow, with a dedicated component of about "
            "<strong>10 GW for agri-photovoltaics</strong> (solar panels raised above crops so that farming and generation share the same land). "
            "When this guide was checked the new scheme had not been formally notified, so its support levels and eligibility are not yet known.",
        ]),
        dict(h="Building a Component A or feeder plant: what matters on site", blocks=[
            ("ul", ["<strong>Land and soil:</strong> a soil test decides the pile design; farmland often needs deeper piles than hard ground.",
                    "<strong>Evacuation:</strong> the distance to the substation and the line route drive cost and approvals.",
                    "<strong>Security:</strong> chain-link fencing and lighting protect modules on open farmland.",
                    "<strong>Domestic content:</strong> scheme plants must use DCR modules (see <a href=\"almm-list-ii-solar-cells.html\">ALMM explained</a>).",
                    "<strong>Schedule:</strong> with the March 2027 cut-off, piling and structures must start early enough to leave time for commissioning and inspection."]),
            ("fig",) + IMG["fencing"] + ("Civil works and chain-link fencing for a 14.36 MW solar project in Uttar Pradesh: the same site works a Component A or feeder-level plant needs.",),
            ("cta", "Developing a PM-KUSUM Component A or feeder-level plant? We do piling, fencing, civil works and installation & commissioning."),
        ]),
    ],
    faq=[("What is PM-KUSUM Component A?",
          "Grid-connected solar plants of 500 kW to 2 MW on farmers' land, with the power bought by the DISCOM at a pre-fixed tariff."),
         ("What is the last date for PM-KUSUM projects?",
          "Financial closure for Components A and C has been extended to 30 November 2026, and completion is due by 31 March 2027 for projects with PPA or NTP by 31 December 2025, with no further extension."),
         ("How much subsidy is there on a solar pump?",
          "Central support is 30% of the benchmark cost (50% in the North-East, hill states and islands), with state support on top; the farmer's share varies by state."),
         ("Has PM-KUSUM 2.0 been launched?",
          "It has been announced, with about 10 GW for agri-photovoltaics, but it had not been formally notified when this guide was checked.")],
    sources=src("kusum_pib", "kusum_mar", "kusum_fc"),
    related=["pm-surya-ghar-subsidy.html", "rooftop-vs-ground-mount-solar.html", "almm-list-ii-solar-cells.html"],
    cases=["project-yiapl-14-36mw-solar-civil-fencing.html", "project-seci-300mw-koppal-pile-foundation.html", "project-dcm-hisar-10mw-solar-civil-works.html"],
    services=["service-ground-mount.html", "service-piling.html", "service-civil.html"],
))

# ======================================================================= 11
A(dict(
    file="solar-for-assam-tea-estates-guide.html", short="Solar for Assam tea estates", tag="Tea Estates", date="2026-10-02", updated=UPDATED,
    old_ids=["solar-for-assam-tea-estates"],
    title="Solar for Assam's Tea Estates: Policy, Design and Lessons from Our Plants",
    seo_title="Solar for Assam Tea Estates: 2026 Guide | Arrays Ingenieria",
    desc="Why Assam's tea estates are going solar: the 2026 policy, the 5% land rule, DG synchronisation, APDCL approvals and lessons from our tea plants.",
    summary="Tea estates are among the best solar sites in India: daytime factory load, diesel back-up to cut and land to spare. Assam's policy, how to design for the plucking season, and what we have learnt building plants from Koomber to Harmutty.",
    hero=IMG["koomber"], keywords=["solar for tea estates", "Assam tea garden solar", "Assam solar policy 2026", "APDCL net metering", "DG synchronisation solar"],
    takeaways=["Assam's Chief Minister has announced that tea garden owners may use up to <strong>5% of their land</strong> for solar generation",
               "Assam's targets: about <strong>3,500 MW of solar</strong> by 2030 under its solar policy and <strong>6,000 MW of green energy</strong> overall",
               "Tea factories run hard from about March to November, in daylight, which is exactly when solar generates",
               "Synchronising solar with the estate's diesel generators cuts diesel use when the grid fails",
               "The Chief Minister inaugurated our 595 kWp Koomber plant on 1 October 2026; Goodricke has recognised our work at Koomber, Borpatra and Harmutty"],
    sections=[
        dict(h="Why tea estates suit solar so well", blocks=[
            ("ul", ["<strong>Daytime load.</strong> Withering, rolling, fermenting and drying run through the day in the plucking season.",
                    "<strong>Diesel back-up.</strong> Grid interruptions in rural Assam mean estates run DG sets; every solar unit that replaces diesel saves far more than a grid unit.",
                    "<strong>Land.</strong> Many estates have strips of non-plantation land near the factory, ideal for ground-mount plants.",
                    "<strong>Long horizon.</strong> Estates are run for generations, so a 25-year asset fits naturally."]),
            ("stats", [("5%", "Of tea-garden land allowed for solar"), ("3,500 MW", "Assam solar target by 2030"), ("6,000 MW", "Assam green-energy goal, 2030"), ("595 kWp", "Koomber, inaugurated by the CM")]),
        ]),
        dict(h="Assam's policy in 2026", blocks=[
            "In September 2026 the Chief Minister, Dr Himanta Biswa Sarma, wrote that tea garden owners may use up to <strong>5% of their land</strong> "
            "for solar generation, as part of the state's goal of <strong>6,000 MW of installed green energy capacity by 2030</strong>. The state's "
            "solar promotion policy targets about <strong>3,500 MW of solar by 2030</strong>, with a push for rooftop plants and agri-voltaics, and "
            "caps solar on tea-garden land at 5% of the landholding.",
            "Assam's clean-energy policy for industry has also offered tea, coffee and rubber units buying power from APDCL features such as "
            "<strong>annual energy banking</strong>, so that surplus solar from the lean months can be drawn in the busy season, with grid-connected "
            "rooftop plants capped at 1,000 kW per location under that policy.",
            ("warn", "Check the current notification",
             "Several Assam policies and orders apply, and their names and terms have changed over time. Confirm the current banking, capacity and "
             "approval rules with APDCL and the Assam Electricity Regulatory Commission before fixing a design."),
        ]),
        dict(h="Designing for the plucking season", blocks=[
            ("table", "Design choices for a tea-estate plant",
             ["Question", "What we look at", "Typical answer"],
             [["How big?", "Factory load in season, off-season load, sanctioned load, transformer capacity", "Sized to daytime factory load in season, within net-metering and transformer limits"],
              ["Rooftop or ground?", "Factory roof condition and orientation; available non-plantation land", "Ground-mount on spare land is common; it avoids old roofs"],
              ["Diesel?", "Number and size of DG sets, how often the grid fails", "Synchronise solar with the DG sets so solar runs during outages"],
              ["Export?", "Off-season and Sunday surplus", "Net metering or banking with APDCL"],
              ["Foundations?", "Soil, water table, flooding history", "Pile foundations sized to the soil test; raised structures in low-lying land"]]),
            "At Jay Shree Tea's Towkok and Manjushree estates, the scope included synchronising each plant with two DG sets per site, letting the "
            "estates run solar alongside their generators instead of shutting it down when the grid fails.",
        ]),
        dict(h="The Koomber inauguration", blocks=[
            "On <strong>1 October 2026</strong> the Chief Minister of Assam inaugurated the <strong>595 kWp</strong> ground-mounted on-grid plant at "
            "Koomber Tea Estate in Cachar, part of the 3.11 MW Goodricke Tea Estates Solar Programme with Tata Power Renewable Energy and Sustvest, "
            "with Arrays Ingenieria as installation partner.",
            ("yt", "prerana-bharati-koomber-video"),
            ("fig",) + IMG["koomber_tour"] + ("The Arrays Ingenieria team takes the Chief Minister around the Koomber plant after the inauguration.",),
        ]),
        dict(h="Lessons from our tea-estate plants", blocks=[
            ("ol", ["<strong>Plan around the season.</strong> Build in the lean months so the plant is ready before plucking peaks.",
                    "<strong>Respect the estate.</strong> Work around labour lines, nurseries and drainage; keep the site clean and safe.",
                    "<strong>Get the approvals moving early.</strong> APDCL feasibility, net metering and inspection take time.",
                    "<strong>Engineer for rain.</strong> Assam's monsoon demands good drainage, raised equipment pads and proper earthing and lightning protection.",
                    "<strong>Hand over properly.</strong> Train the estate electrician, leave drawings and test reports, and set a cleaning routine."]),
            ("table", "Some of our tea-estate plants in Assam",
             ["Estate", "Capacity", "Our role"],
             [["Koomber Tea Estate (Goodricke), Cachar", "595 kWp", "Installation partner; inaugurated by the CM, 1 Oct 2026"],
              ["Towkok and Manjushree (Jay Shree Tea), Sonari", "1035 kWp", "Supply, installation & commissioning, DG synchronisation"],
              ["Orangajuli Tea Estate (Goodricke), Udalguri", "450 kW", "Installation partner; commissioned on Janmashtami 2026"],
              ["Harmutty Tea Estate (Goodricke), North Lakhimpur", "400 kWp", "Installation & commissioning; inaugurated 7 Oct 2026"],
              ["Borpatra Tea Estate (Goodricke), Sivasagar", "230 kWp", "Turnkey implementation, APDCL approvals"],
              ["Rossell India estates", "170 kWp to 493 kWp", "Piling, installation & commissioning"],
              ["Amalgamated Plantations estates", "About 5 MW across estates", "Piling, BOS, installation & commissioning"]]),
            ("cta", "Running a tea estate in Assam or the Dooars? Let us look at your factory load and your land."),
        ]),
    ],
    faq=[("Can tea gardens in Assam use their land for solar?",
          "Yes. The Chief Minister has announced that tea garden owners may use up to 5% of their land for solar generation, and the state's solar policy caps solar on tea-garden land at 5% of the landholding."),
         ("Can solar work with a tea estate's diesel generators?",
          "Yes. With a DG synchronisation controller the solar plant keeps running during grid outages alongside the generators, cutting diesel use."),
         ("Rooftop or ground-mount for a tea factory?",
          "Ground-mount on spare non-plantation land is often better: it avoids old factory roofs and can be sized to the load. Rooftop works where the roof is sound and well oriented."),
         ("What size of plant suits a tea estate?",
          "Most estates we work with install between about 200 kWp and 600 kWp, sized to the factory's daytime load in the plucking season and to grid limits.")],
    sources=src("cm_assam", "assam_dte", "assam_tea", "sentinel_koomber", "hub_orangajuli"),
    related=["net-metering-india.html", "rooftop-vs-ground-mount-solar.html", "capex-vs-opex-solar.html"],
    cases=["project-koomber-tea-estate-595kwp-solar-cm-inauguration.html", "project-jayshree-tea-1mw-solar-assam.html", "project-harmutty-tea-estate-400kwp-solar.html"],
    services=["solar-for-tea-estates.html", "service-ground-mount.html", "solar-installation-commissioning.html"],
))

# ======================================================================= 12
A(dict(
    file="choose-solar-epc-partner.html", short="Choosing a solar EPC", tag="Buyer's Guide", date="2026-10-02", updated=UPDATED,
    old_ids=["choose-solar-epc-partner"],
    title="How to Choose a Solar EPC and Installation Partner in India: 12 Questions to Ask",
    seo_title="How to Choose a Solar EPC in India | Arrays Ingenieria",
    desc="12 questions to ask before hiring a solar EPC or installation partner in India: track record, documents, equipment, safety, approvals and warranties.",
    summary="The partner you choose decides how your plant performs for 25 years. Twelve questions to ask any solar EPC or installation contractor, what good answers look like, and the red flags to walk away from.",
    hero=IMG["koomber_tour"], keywords=["solar EPC company India", "choose solar installer", "solar EPC checklist", "solar contractor questions", "best solar EPC"],
    takeaways=["Ask for <strong>documented</strong> projects: purchase orders, client certificates and site visits, not just photos",
               "Check who will actually be on site: in-house crews and supervisors, or labour subcontracted at the last minute",
               "Insist on ALMM-listed modules and BIS-certified inverters named in the contract",
               "Ask how the contractor handles safety, approvals (DISCOM, CEIG) and testing at handover",
               "Compare quotations on the same specification; the cheapest bid often hides thinner cables, weaker structures or missing items"],
    sections=[
        dict(h="Why the partner matters more than the panel", blocks=[
            "Two plants built with identical modules can perform very differently. Structure design, cable sizing, earthing, string layout, "
            "workmanship at every connector and the quality of commissioning tests decide how much power the plant makes and how safely it runs "
            "for 25 years. That is the contractor's work.",
        ]),
        dict(h="The 12 questions", blocks=[
            ("table", "Questions to ask a solar EPC or installation partner",
             ["#", "Question", "A good answer looks like"],
             [["1", "Which comparable plants have you built?", "Named projects of similar size and type, with locations and dates"],
              ["2", "Can I see purchase orders, completion or appreciation certificates?", "Documents from clients and EPC majors, and references you can call"],
              ["3", "Who will be on site?", "Named project manager and site engineer; in-house crews for critical work"],
              ["4", "Which modules and inverters, exactly?", "Make, model and ALMM / BIS status written into the contract"],
              ["5", "How is the structure designed?", "Wind-load design for your location, galvanising spec, roof or pile calculations"],
              ["6", "How are cables sized and routed?", "Voltage-drop calculation, UV-resistant DC cable, proper trays and glands"],
              ["7", "How do you earth and protect the plant?", "Separate DC and AC earthing, lightning protection, surge devices, tested earth resistance"],
              ["8", "Who handles approvals?", "The contractor files DISCOM, net-metering and CEIG paperwork"],
              ["9", "What tests will you hand over?", "Insulation resistance, polarity, string Voc/Isc, earth resistance, inverter settings, as-built drawings"],
              ["10", "What is your safety system?", "Permits, PPE, work-at-height and electrical isolation procedures, toolbox talks, ISO 45001"],
              ["11", "What warranties and guarantees?", "Manufacturer warranties passed on, workmanship warranty, performance commitment"],
              ["12", "What happens after handover?", "O&M or module-cleaning options, a contact for faults, response times"]]),
        ]),
        dict(h="Red flags", blocks=[
            ("ul", ["\"Tier-1 equivalent\" modules or unnamed inverters in the quotation",
                    "No earthing or lightning-protection design, or a lump sum for \"BOS\" with no detail",
                    "A price far below others on the same specification",
                    "No site visit before quoting",
                    "Reluctance to put approvals, testing or handover documents in the contract"]),
        ]),
        dict(h="How to compare quotations fairly", blocks=[
            ("steps", [("Fix the specification", "Capacity (kWp DC and kW AC), module and inverter class, structure type, cable sizes."),
                       ("Ask for a bill of quantities", "Line items for modules, inverters, structures, cables, earthing, LA, ACDB/DCDB, civil works, approvals."),
                       ("Compare like with like", "Normalise each quote to the same scope; add the missing items to the cheaper ones."),
                       ("Check the generation estimate", "The same location and assumptions should give similar yields; an outlier needs explaining."),
                       ("Read the contract", "Payment milestones tied to progress, delay and performance clauses, warranty start dates.")]),
        ]),
        dict(h="Our answers", blocks=[
            "Arrays Ingenieria is an ex-servicemen-led company certified to ISO 9001, ISO 14001 and ISO 45001. Our <a href=\"projects.html\">projects "
            "page</a> lists our work, and our case studies carry the client certificates and press coverage behind them. We do not manufacture "
            "modules or inverters, so we specify and document the makes your project requires.",
            ("fig",) + IMG["koomber_tour"] + ("Our team with the Chief Minister of Assam at the Koomber Tea Estate plant, 1 October 2026.",),
            ("cta", "Put our answers to the test: ask us all 12 questions about your project."),
        ]),
    ],
    faq=[("How do I check a solar EPC company's track record?",
          "Ask for named projects of similar size, client purchase orders or certificates, and references you can call. Visit a working plant if you can."),
         ("Should the EPC contract name the module and inverter brands?",
          "Yes. The make, model and certification (ALMM for modules, BIS for inverters) should be written into the contract and the bill of quantities."),
         ("What documents should I get at handover?",
          "As-built drawings, test reports (insulation, polarity, string voltages and currents, earth resistance), inverter settings, warranty certificates, approvals and an O&M manual."),
         ("Is the cheapest solar quote a bad idea?",
          "Not always, but compare quotations on the same specification and bill of quantities. Large price gaps usually come from thinner cables, lighter structures or missing items.")],
    sources=src("qco", "almm"),
    related=["solar-plant-commissioning-checklist.html", "solar-quality-standards-bis-cea.html", "capex-vs-opex-solar.html"],
    cases=["project-koomber-tea-estate-595kwp-solar-cm-inauguration.html", "project-super-smelters-1980kwp-rooftop-solar.html", "project-amalgamated-plantations-assam-tea-estates-solar.html"],
    services=["capex-solar-epc.html", "solar-installation-commissioning.html", "quality-safety.html"],
))

# ======================================================================= 13
A(dict(
    file="rooftop-vs-ground-mount-solar.html", short="Rooftop vs ground-mount", tag="System Design", date="2026-10-02", updated=UPDATED,
    old_ids=["rooftop-vs-ground-mount"],
    title="Rooftop vs Ground-Mount Solar: Which Is Right for Your Site?",
    seo_title="Rooftop vs Ground-Mount Solar Guide | Arrays Ingenieria",
    desc="Rooftop or ground-mount solar? Cost, space, structure, roof safety, piling, fencing, approvals and maintenance compared, with lessons from our sites.",
    summary="Use the roof you already have, or build on land? A practical comparison of rooftop and ground-mount solar: cost, space, structure, safety, foundations, approvals and maintenance.",
    hero=IMG["balaji"], keywords=["rooftop vs ground mount solar", "ground mounted solar plant", "industrial rooftop solar", "sheet roof solar", "solar pile foundation"],
    takeaways=["Rooftop uses space you already have and avoids land, fencing and piling costs",
               "Ground-mount gives freedom to size, orient and maintain the plant, and avoids old or weak roofs",
               "Industrial sheet roofs need a structural check, purlin-mounted structures and skylight safety mesh",
               "Ground-mount needs a soil test, pile foundations sized to it, fencing and drainage",
               "Many sites combine both: rooftop on the sound sheds, ground-mount on spare land"],
    sections=[
        dict(h="The short answer", blocks=[
            ("table", "Rooftop and ground-mount solar compared",
             ["Factor", "Rooftop", "Ground-mount"],
             [["Space", "Uses existing roofs", "Needs land (roughly 4 to 5 acres per MW for fixed-tilt)"],
              ["Cost per kWp", "Usually lower: no land, fencing or piling", "Higher civil cost, but scale can offset it"],
              ["Size", "Limited by roof area and strength", "Sized to need (and land available)"],
              ["Orientation and tilt", "Follows the roof", "Optimised for yield"],
              ["Structure", "Purlin clamps or ballast; roof-load check essential", "Piles or foundations to the soil test"],
              ["Safety", "Work at height; skylight mesh, lifelines, walkways", "Ground-level work; fencing and security"],
              ["Maintenance", "Access via walkways; roof-wash systems", "Easy access; vegetation control"],
              ["Best for", "Factories, warehouses, commercial buildings", "Tea estates, open-access and captive plants, farms"]]),
        ]),
        dict(h="Rooftop: what makes a good roof", blocks=[
            ("ul", ["<strong>Strength:</strong> a structural engineer confirms the roof and purlins can carry the added load and wind uplift.",
                    "<strong>Remaining life:</strong> re-roof first if the sheets have only a few years left; removing a plant to re-roof is costly.",
                    "<strong>Shade-free area:</strong> watch for parapets, tanks, chimneys and neighbouring buildings.",
                    "<strong>Safety for life:</strong> skylight safety mesh over translucent sheets, lifelines and walkways for cleaning crews."]),
            ("fig",) + IMG["balaji"] + ("A sheet-roof plant at Sitarganj, Uttarakhand. On industrial roofs we install skylight safety mesh so nobody falls through translucent sheets during installation or cleaning.",),
        ]),
        dict(h="Ground-mount: what makes a good site", blocks=[
            ("ul", ["<strong>Soil test first:</strong> it decides pile depth and diameter, and whether augered or driven piles suit.",
                    "<strong>Drainage and flooding:</strong> low-lying land needs raised structures and drains.",
                    "<strong>Evacuation:</strong> the distance to your meter or the grid connection point.",
                    "<strong>Security:</strong> chain-link fencing, gates and lighting.",
                    "<strong>Land rules:</strong> in Assam, tea gardens may use up to 5% of their land for solar (see <a href=\"solar-for-assam-tea-estates-guide.html\">our tea-estate guide</a>)."]),
            ("fig",) + IMG["piling"] + ("Pile foundations on a utility-scale project. Depth, alignment and levels set the quality of everything built on top.",),
        ]),
        dict(h="When to combine both", blocks=[
            "Plenty of sites use both: rooftop on sound sheds near the main load, ground-mount on spare land for the rest. The two can feed the same "
            "distribution board or separate meters, depending on your connection and state rules.",
            ("cta", "Not sure which suits your site? Send us a roof photo or a land sketch and your bills."),
        ]),
    ],
    faq=[("Is rooftop solar cheaper than ground-mount?",
          "Usually per kWp, because there is no land, fencing or piling. Ground-mount can be competitive at larger scale and gives more freedom in size and orientation."),
         ("How much land does a 1 MW ground-mount solar plant need?",
          "Roughly 4 to 5 acres for a fixed-tilt plant, depending on module efficiency, row spacing and the shape of the land."),
         ("Can any factory roof take solar panels?",
          "Not always. A structural check of the sheets, purlins and trusses is essential, and old roofs should be replaced before installation."),
         ("Why do sheet roofs need skylight mesh?",
          "Translucent skylight sheets cannot take a person's weight. Safety mesh under or over them protects installers and cleaning crews.")],
    sources=src("cm_assam", "qco"),
    related=["solar-for-assam-tea-estates-guide.html", "green-energy-open-access.html", "solar-om-module-cleaning.html"],
    cases=["project-balaji-action-sitarganj-4mwp-solar.html", "project-apar-industries-jharsuguda-1-2mwp-rooftop-solar.html", "project-rossell-india-assam-tea-estates-solar.html"],
    services=["service-rooftop.html", "service-ground-mount.html", "service-piling.html"],
))

# ======================================================================= 14
A(dict(
    file="solar-om-module-cleaning.html", short="Solar O&M and cleaning", tag="O&M", date="2026-10-02", updated=UPDATED,
    old_ids=["solar-om-roi"],
    title="Solar O&M and Module Cleaning: Protecting 25 Years of Returns",
    seo_title="Solar O&M and Module Cleaning Guide | Arrays Ingenieria",
    desc="Why operation and maintenance decides a solar plant's return: module cleaning systems, inspections, thermography, earthing checks and a schedule.",
    summary="A solar plant has no moving parts, but it still needs care. Module cleaning, inspections, thermography, inverter and earthing checks, and a practical maintenance schedule that keeps generation where it should be.",
    hero=IMG["towkok"], keywords=["solar O&M India", "solar module cleaning system", "solar plant maintenance", "performance ratio solar", "solar thermography"],
    takeaways=["Dust and bird droppings can cut output noticeably between cleanings, especially in dry, dusty months",
               "A fixed <strong>module cleaning system</strong> (pipes, valves and nozzles) makes regular washing quick and safe",
               "Track the <strong>performance ratio</strong> monthly; a falling ratio is the first sign of a problem",
               "Thermography and string-current checks find hot spots, failed bypass diodes and loose connectors early",
               "Earthing resistance and lightning protection should be tested every year, before the monsoon"],
    sections=[
        dict(h="Why O&M decides your return", blocks=[
            "A solar plant's return comes from the units it generates over 25 years. Losing even a few per cent of output every year to dirt, "
            "tripping inverters or failed strings adds up to years of lost payback. Good operation and maintenance (O&M) protects that output, "
            "and keeps the plant safe.",
        ]),
        dict(h="Module cleaning: how, how often and with what", blocks=[
            ("table", "Cleaning options compared",
             ["Method", "How it works", "Suits"],
             [["Manual with hose and brush", "Crews wash with water and soft brushes", "Small plants; sites with easy, safe access"],
              ["Fixed module cleaning system (MCS)", "A permanent HDPE or uPVC pipe network with valves and hose points across the array", "Rooftop and ground plants of any size; fast and safe"],
              ["Robotic cleaning", "Waterless or low-water robots run along the rows", "Large, uniform utility plants"]]),
            "Cleaning frequency depends on dust, rain and bird activity: often every one to two weeks in dry, dusty months and less in the monsoon. "
            "Use soft or demineralised water where possible, never abrasive tools, and clean in the early morning or late afternoon so cold water "
            "does not hit hot glass.",
            ("note", "What we install",
             "Most of our plants include a module cleaning system: an HDPE or uPVC pipe network from the water tapping point to hose points across "
             "the array, so the estate or factory team can wash the modules safely without walking on them."),
        ]),
        dict(h="The maintenance schedule", blocks=[
            ("table", "A practical O&M schedule",
             ["Frequency", "Task"],
             [["Daily / remote", "Check inverter status and generation on the monitoring portal; investigate alarms"],
              ["Weekly to fortnightly", "Module cleaning (more often in dusty months); visual check for damage and shading"],
              ["Monthly", "Compare generation with expected; calculate performance ratio; check string currents"],
              ["Quarterly", "Inspect DC and AC connections, cable trays, glands and labels; clean inverter filters and vents"],
              ["Half-yearly", "Thermographic (infrared) scan of modules and boards; torque check on terminations"],
              ["Yearly, before monsoon", "Test earth-pit resistance, lightning arrestors and surge protection; check structure bolts and corrosion"]]),
        ]),
        dict(h="Reading the numbers: performance ratio", blocks=[
            "The <strong>performance ratio (PR)</strong> compares what the plant actually generated with what it should have generated for the "
            "sunlight it received. It strips out the weather, so a falling PR points to a plant problem: dirt, a failed string, an inverter "
            "derating, or shading from new growth. Track it monthly and act when it drops.",
        ]),
        dict(h="Common faults and what causes them", blocks=[
            ("ul", ["<strong>Hot spots</strong> on modules: cracked cells, failed bypass diodes or persistent shading; found by thermography.",
                    "<strong>Low string current:</strong> a loose MC4 connector, a damaged cable or a dirty or shaded row.",
                    "<strong>Inverter trips:</strong> grid voltage excursions, insulation faults (often moisture in junction boxes) or overheating.",
                    "<strong>Earth faults after rain:</strong> damaged DC cable insulation or water ingress; test insulation resistance."]),
            ("cta", "Want a module cleaning system or an O&M plan for an existing plant? We install and service both."),
        ]),
    ],
    faq=[("How often should solar panels be cleaned in India?",
          "Typically every one to two weeks in dry, dusty months and less often in the monsoon. Watch generation: a drop after dry spells shows when cleaning is due."),
         ("What is a module cleaning system?",
          "A permanent network of pipes, valves and hose points across a solar array that lets crews wash modules quickly and safely without walking on them."),
         ("What is a good performance ratio?",
          "Well-built and well-maintained plants commonly run at about 75% to 85%, depending on climate and design. The trend matters more than the figure."),
         ("Do solar plants need maintenance during the monsoon?",
          "Less cleaning, but more electrical attention: check earthing, lightning protection and insulation before and after heavy rain.")],
    sources=src("qco"),
    related=["solar-plant-commissioning-checklist.html", "solar-quality-standards-bis-cea.html", "rooftop-vs-ground-mount-solar.html"],
    cases=["project-super-smelters-1980kwp-rooftop-solar.html", "project-tata-motors-jamshedpur-5-5mw-solar-piling.html", "project-jayshree-tea-1mw-solar-assam.html"],
    services=["service-om.html", "solar-installation-commissioning.html"],
))

# ======================================================================= 15
A(dict(
    file="solar-quality-standards-bis-cea.html", short="Solar quality standards", tag="Standards & Safety", date=UPDATED, updated=UPDATED,
    title="Solar Quality and Safety Norms in India (2026): BIS, the Quality Control Order, CEA and CEIG",
    seo_title="Solar Standards in India: BIS, CEIG | Arrays Ingenieria",
    desc="Quality and safety norms for solar plants in India in 2026: the BIS Quality Control Order, key IS/IEC standards for each part and CEIG approval.",
    summary="What makes a solar plant compliant in 2026: the BIS Quality Control Order for modules, inverters and batteries, the standards each component should meet, the Electrical Inspector's approval, and site safety.",
    hero=IMG["earthing"], keywords=["solar quality control order", "BIS solar inverter", "IS 16221", "CEIG approval solar", "solar safety standards India"],
    takeaways=["The revised <strong>Solar Systems, Devices and Components Goods Order, 2025</strong> (notified 27 January 2025) requires BIS certification for modules, solar inverters and storage batteries",
               "Large inverters (above 200 kW) were given extra time to certify, reportedly to the end of 2026",
               "Modules must also meet ALMM where it applies (see our ALMM guide)",
               "Plants above the voltage and capacity thresholds need the <strong>Electrical Inspector's (CEIG) approval</strong> before energisation under the CEA safety regulations",
               "Earthing, lightning protection, surge protection and documented commissioning tests are what keep a plant safe for 25 years"],
    sections=[
        dict(h="Three layers of compliance", blocks=[
            ("ol", ["<strong>Product certification:</strong> each component meets its Indian Standard and carries the BIS mark (and, for modules, ALMM where applicable).",
                    "<strong>Design and installation:</strong> the plant is designed and built to the electrical safety regulations and good practice.",
                    "<strong>Inspection and approval:</strong> the DISCOM and, where required, the Electrical Inspector approve the plant before it is energised."]),
        ]),
        dict(h="The BIS Quality Control Order", blocks=[
            "MNRE notified the revised <strong>Solar Systems, Devices and Components Goods (Requirement for Compulsory Registration) Order, 2025</strong> "
            "in the Gazette on <strong>27 January 2025</strong>, effective after a 180-day transition. It covers <strong>solar PV modules, inverters for "
            "solar PV applications and storage batteries</strong>. These must conform to the notified Indian Standards and carry the BIS Standard Mark "
            "under a BIS licence; products made only for export are exempt.",
            "Inverters above 200 kW were allowed extra time. MNRE extended the self-certification window for them, reportedly to "
            "<strong>31 December 2026</strong>, during which makers need valid IEC certificates matching the Indian Standards.",
        ]),
        dict(h="The standards each component should meet", blocks=[
            ("table", "Common standards for solar plant components",
             ["Component", "Standards to ask for", "What they cover"],
             [["Crystalline PV modules", "IS 14286 / IEC 61215; IS/IEC 61730", "Design qualification and type approval; safety"],
              ["Grid-tied inverters", "IS 16221 (Parts 1 and 2) / IEC 62109; IS 16169", "Safety of power converters; islanding-prevention test"],
              ["DC cables", "IS 17293 / EN 50618 type solar cables", "UV-resistant, double-insulated cables for PV"],
              ["AC power cables", "IS 7098 (XLPE)", "Armoured LT cables to the distribution board"],
              ["Earthing", "IS 3043", "Code of practice for earthing"],
              ["Lightning protection", "IS/IEC 62305", "Lightning protection of structures"],
              ["Commissioning and documentation", "IEC 62446-1", "System documentation, commissioning tests and inspection"],
              ["Storage batteries", "Notified IS for the battery type", "Covered by the 2025 Quality Control Order"]]),
            ("warn", "Standards are revised",
             "BIS revises standards and adds parts over time, and sources differ on which part covers what. Ask the supplier for the BIS licence and "
             "test reports for the exact model supplied, and keep them in the project file."),
        ]),
        dict(h="CEA safety regulations and CEIG approval", blocks=[
            "The Central Electricity Authority's <strong>safety and electric supply regulations</strong> set the rules for electrical installations, "
            "including clearances, earthing, protection and inspection. Installations above the specified voltage, and in many states above a set "
            "capacity, must be inspected and approved by the <strong>Electrical Inspector</strong> (the Chief Electrical Inspector to Government, "
            "CEIG, in many states) before they are energised.",
            ("steps", [("Drawing approval", "Submit single-line diagram, layout and equipment details for approval where the state requires it."),
                       ("Build to the approved design", "Install with the specified protection, earthing and clearances."),
                       ("Test", "Insulation resistance, earth resistance, protection settings and relay tests, recorded on the prescribed formats."),
                       ("Inspection", "The Electrical Inspector inspects the installation and the test records."),
                       ("Approval to energise", "With approval, the DISCOM completes metering and synchronisation.")]),
            ("note", "Our practice",
             "We handle CEIG approvals and liaison as part of our scope on many projects, from rooftop plants on industrial sheds to ground-mount plants, "
             "and keep the test records the inspector expects."),
        ]),
        dict(h="Safety on site", blocks=[
            ("ul", ["Permit-to-work and electrical isolation (lock-out, tag-out) before any work on live DC or AC circuits",
                    "Work-at-height controls on roofs: lifelines, harnesses, edge protection and skylight safety mesh",
                    "PPE suited to the task: helmets, insulated gloves, safety shoes, eye protection",
                    "Daily toolbox talks and supervision by trained engineers",
                    "A safety management system certified to ISO 45001"]),
            ("fig",) + IMG["earthing"] + ("Earthing and electrical safety works on a solar plant: a 25-year plant is only as safe as its earthing and protection.",),
            ("cta", "Need a plant that passes inspection first time? Our veteran-led crews build to the standards and document every test."),
        ]),
    ],
    faq=[("Do solar inverters need BIS certification?",
          "Yes. Under the 2025 Quality Control Order, inverters for solar PV applications must carry the BIS Standard Mark. Inverters above 200 kW were given extra time, reportedly to the end of 2026."),
         ("Which standards should solar modules meet?",
          "IS 14286 / IEC 61215 for design qualification and IS/IEC 61730 for safety, and ALMM listing where the project falls under the ALMM order."),
         ("What is CEIG approval for solar?",
          "Approval by the Electrical Inspector that the installation meets the CEA safety regulations, required before energising plants above the specified voltage or, in many states, above a set capacity."),
         ("What tests should be done at commissioning?",
          "Insulation resistance, polarity, string open-circuit voltage and short-circuit current, earth resistance, protection settings and functional checks, documented to IEC 62446-1.")],
    sources=src("qco", "qco_inv", "almm"),
    related=["solar-plant-commissioning-checklist.html", "almm-list-ii-solar-cells.html", "choose-solar-epc-partner.html"],
    cases=["project-apar-industries-jharsuguda-1-2mwp-rooftop-solar.html", "project-balaji-action-sitarganj-4mwp-solar.html", "project-dcm-hisar-10mw-solar-civil-works.html"],
    services=["quality-safety.html", "solar-installation-commissioning.html"],
))

# ======================================================================= 16
A(dict(
    file="battery-storage-with-solar.html", short="Battery storage with solar", tag="Storage", date=UPDATED, updated=UPDATED,
    title="Battery Storage with Solar in India (2026): Mandates, Incentives and When It Pays",
    seo_title="Battery Storage with Solar in India | Arrays Ingenieria",
    desc="Battery storage with solar in India: the 2-hour storage rule in tenders, VGF for BESS, ISTS waiver terms, the draft 500 kW rule and when it pays.",
    summary="Storage is becoming part of India's solar story. The two-hour co-located storage advisory for tenders, the viability gap funding for batteries, transmission waivers, the draft rule for large prosumers, and when a battery makes sense for a business.",
    hero=IMG["manjushree"], keywords=["battery storage solar India", "BESS VGF", "co-located storage solar tender", "solar plus storage", "energy storage India 2026"],
    takeaways=["A February 2025 Power Ministry advisory asks for <strong>two-hour co-located storage equal to 10% of solar capacity</strong> in future solar tenders",
               "Viability gap funding (VGF) supports battery storage; a second tranche of about <strong>Rs 5,400 crore</strong> was announced in 2025",
               "Co-located battery projects commissioned by <strong>30 June 2028</strong> keep an ISTS charges waiver under the 2025 amendment",
               "The <strong>draft 2026 consumer-rules amendment</strong> proposes storage for renewable installations above 500 kW",
               "For C&I owners, storage pays where evening tariffs are high, diesel back-up is costly or export is restricted"],
    sections=[
        dict(h="Why storage is arriving now", blocks=[
            "Solar generates in the middle of the day; demand peaks in the evening. As solar grows past 170 GW, grids need to move cheap daytime "
            "energy into the evening. Battery prices have fallen sharply, so policy is now nudging storage into new solar projects.",
        ]),
        dict(h="The policy picture", blocks=[
            ("table", "Storage policy in India, 2025-2026",
             ["Measure", "What it does", "Status"],
             [["Co-located storage in solar tenders", "Two-hour storage equal to 10% of the solar capacity in future tenders by implementing agencies and states", "Ministry of Power advisory, February 2025; applies to future tenders, not existing projects or PM Surya Ghar"],
              ["Viability gap funding for BESS", "Central support to make grid batteries viable", "Second tranche of about Rs 5,400 crore announced in 2025"],
              ["ISTS charges waiver", "Waiver for co-located BESS commissioned by 30 June 2028 (where power is consumed outside the host state), and for pumped storage awarded by that date", "Amended in June 2025"],
              ["Storage for large prosumers", "Renewable installations above 500 kW may need storage", "Proposed in the March 2026 draft consumer-rules amendment"]]),
            ("warn", "Advisory, draft and final",
             "Some of these are advisories or drafts. Tender documents and final notifications decide what is binding for a given project."),
        ]),
        dict(h="When a battery pays for a business", blocks=[
            ("ul", ["<strong>Evening peak tariffs:</strong> with time-of-day tariffs, shifting solar into the peak is worth more (see <a href=\"net-metering-india.html\">net metering and ToD</a>).",
                    "<strong>Diesel back-up:</strong> estates and factories that run DG sets during outages can cut diesel use.",
                    "<strong>Export limits:</strong> where exports are capped or poorly paid, storing surplus beats spilling it.",
                    "<strong>Demand charges:</strong> trimming peaks can lower contract demand."]),
            "Where none of these apply, a solar plant sized to daytime load, without storage, usually gives the fastest payback.",
        ]),
        dict(h="Designing solar-plus-storage", blocks=[
            ("ul", ["Decide the job: peak shifting, back-up, or both. That sets kW and kWh.",
                    "Choose the coupling: AC-coupled batteries are simpler to add to an existing plant; DC-coupled suit new builds.",
                    "Specify certified batteries and a battery management system; storage batteries fall under the BIS Quality Control Order.",
                    "Plan fire safety, ventilation and space, and get the approvals the DISCOM and Electrical Inspector require."]),
            ("cta", "Thinking about adding storage to an existing plant? We can review your load and tariff first."),
        ]),
    ],
    faq=[("Is battery storage mandatory with solar in India?",
          "Not for most existing or private projects. A February 2025 advisory asks for two-hour storage equal to 10% of capacity in future solar tenders, and a 2026 draft proposes storage for installations above 500 kW."),
         ("What is VGF for battery storage?",
          "Viability gap funding: central support that covers part of the cost of grid battery projects to make them viable. A second tranche of about Rs 5,400 crore was announced in 2025."),
         ("Does a factory need a battery with rooftop solar?",
          "Usually not. A plant sized to daytime load gives the fastest payback. Storage pays where evening tariffs are high, diesel back-up is costly or exports are restricted.")],
    sources=src("ess_pv", "ess_mop", "ess_market", "bess_2025", "draft_rules_resi", "qco"),
    related=["net-metering-india.html", "green-energy-open-access.html", "india-solar-capacity-2026.html"],
    cases=["project-jayshree-tea-1mw-solar-assam.html"],
    services=["capex-solar-epc.html", "service-ground-mount.html"],
))

# ======================================================================= 17
A(dict(
    file="solar-plant-commissioning-checklist.html", short="Commissioning checklist", tag="Installation & Commissioning", date=UPDATED, updated=UPDATED,
    title="Solar Plant Installation and Commissioning: The Complete Step-by-Step Checklist",
    seo_title="Solar Installation & Commissioning Steps | Arrays Ingenieria",
    desc="Step by step through installing and commissioning a solar plant in India: civil works, structures, modules, cabling, earthing, tests and handover.",
    summary="What actually happens between the purchase order and the day a solar plant goes live. Every stage of installation and commissioning, the tests that prove the plant is safe, and the documents you should receive at handover.",
    hero=IMG["bp_puja"], keywords=["solar installation and commissioning", "solar commissioning checklist", "solar I&C process", "solar plant testing", "solar handover documents"],
    takeaways=["Installation runs in a fixed order: civil works, structures, modules, DC cabling, inverters, AC side, earthing and protection",
               "Every connection is a potential fault: torque, crimping, gland sealing and labelling matter",
               "Commissioning proves the plant: insulation resistance, polarity, string voltages and currents, earth resistance, protection and grid tests",
               "Inspection and approvals (DISCOM, CEIG) come before energisation",
               "At handover you should receive as-built drawings, test reports, warranties, approvals and an O&M manual"],
    sections=[
        dict(h="Before anyone picks up a tool", blocks=[
            ("ul", ["Approved layout and single-line diagram; structure and foundation design",
                    "Safety plan, permits and inductions for every worker; the client's site rules signed off",
                    "Material receipt checks: module and inverter models, serial numbers and certificates matched to the specification",
                    "A storage area that keeps modules flat, dry and secure"]),
        ]),
        dict(h="Stage by stage: installation", blocks=[
            ("steps", [("Civil works", "Earth-pit chambers and covers, equipment foundations for inverters, ACDB and ITB, cable trenches, and for ground-mount plants the piles or foundations, drainage and fencing."),
                       ("Module mounting structures", "Erect and align the structures to the design tilt and levels; torque every bolt; on sheet roofs, fix to purlins with the right clamps and seal every penetration."),
                       ("Module installation", "Mount modules with the specified clamps and torque; keep gaps for expansion; do not stand on modules."),
                       ("DC cabling and stringing", "Connect module to module and run string cables in UV-protected conduit or trays to the combiner boxes or inverters; crimp MC4 connectors with the right tool; label every string."),
                       ("Inverters", "Mount inverters on their stands or foundations with ventilation clearance; terminate DC and AC cables; configure grid settings."),
                       ("AC side", "Lay armoured AC cables to the ACDB and the point of connection; terminate with proper glands and lugs."),
                       ("Earthing and protection", "Separate DC and AC earthing with tested earth pits; lightning arrestors; surge protection devices; equipotential bonding of structures."),
                       ("Ancillaries", "Module cleaning system, walkways or lifelines, safety signage, fire extinguishers and monitoring.")]),
            ("fig",) + IMG["bp_banner"] + ("The AC distribution board and inauguration banner at the 230 kWp Borpatra Tea Estate plant, Assam: the point where the solar plant meets the estate's supply.",),
        ]),
        dict(h="Commissioning: the tests that prove the plant", blocks=[
            ("table", "Commissioning tests and what they show",
             ["Test", "What it checks", "Typical acceptance"],
             [["Visual inspection", "Damage, mounting, cable routing, labels, clearances", "No defects; matches drawings"],
              ["Polarity and continuity", "Every string wired correctly", "Correct polarity on every string"],
              ["String open-circuit voltage (Voc)", "Correct number of modules and no faulty ones", "Within a few per cent of expected for the conditions"],
              ["String short-circuit or operating current", "Strings performing alike", "Strings matched within tolerance for the irradiance"],
              ["Insulation resistance", "No leakage from DC conductors to earth", "Above the minimum for the system voltage"],
              ["Earth resistance", "Earthing system effective", "Within the design value"],
              ["Inverter functional tests", "Start-up, grid synchronisation, anti-islanding and protection settings", "Operates and trips as specified"],
              ["Performance check", "Output against irradiance", "Consistent with the design yield"]]),
            "Tests are recorded on formats that follow IEC 62446-1 and the DISCOM's and Electrical Inspector's requirements, so the same records "
            "serve the client, the approvals and future O&M.",
        ]),
        dict(h="Inspection, approvals and going live", blocks=[
            ("ol", ["DISCOM inspection and, where required, the Electrical Inspector's (CEIG) inspection",
                    "Installation of the bidirectional or generation meter",
                    "Synchronisation with the grid and, at tea estates and factories with diesel back-up, with the DG sets",
                    "Commissioning certificate and, for scheme projects, portal updates"]),
        ]),
        dict(h="What you should receive at handover", blocks=[
            ("ul", ["As-built layout and single-line diagram",
                    "Test reports for every string and every test above",
                    "Equipment list with serial numbers, warranty certificates and BIS / ALMM documents",
                    "Approvals: DISCOM, net-metering or open-access, CEIG",
                    "O&M manual, cleaning procedure and a contact for faults",
                    "Training for the site electrician or estate team"]),
            "On many of our projects the installation & commissioning scope also includes collecting the warranty certificates and the client's "
            "I&C-cum-handover certificate, so the plant owner and the EPC both close the project with a complete file.",
            ("cta", "Need an installation & commissioning partner for a rooftop or ground-mount plant? Our veteran-led crews work Pan-India."),
        ]),
    ],
    faq=[("What does installation and commissioning (I&C) of a solar plant include?",
          "Civil works for equipment, mounting structures, module installation, DC and AC cabling, inverters, earthing and protection, then testing, inspection, grid synchronisation and handover."),
         ("How long does it take to install a 1 MW solar plant?",
          "With materials on site and approvals moving, installation of a 1 MW rooftop or ground-mount plant typically takes several weeks; approvals can add more. Weather and site access matter."),
         ("What tests are done when a solar plant is commissioned?",
          "Visual inspection, polarity and continuity, string Voc and current, insulation resistance, earth resistance, inverter functional and protection tests, and a performance check."),
         ("What documents should I get after solar installation?",
          "As-built drawings, test reports, equipment and warranty documents, approvals, an O&M manual and training for your team.")],
    sources=src("qco", "netmeter_2021"),
    related=["solar-quality-standards-bis-cea.html", "solar-om-module-cleaning.html", "choose-solar-epc-partner.html"],
    cases=["project-amalgamated-plantations-assam-tea-estates-solar.html", "project-rossell-india-assam-tea-estates-solar.html", "project-srmb-steel-durgapur-rooftop-solar.html"],
    services=["solar-installation-commissioning.html", "service-rooftop.html", "service-ground-mount.html"],
))
