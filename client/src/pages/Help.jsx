import { useState } from 'react';
import {
  Rocket, LayoutDashboard, ArrowUpRight, ArrowDownLeft, FileText, Banknote,
  Building2, Users, Calculator, BarChart3, CloudUpload, ShieldCheck, Languages,
  Search, Truck, DatabaseBackup, LifeBuoy, Save, ClipboardList, ReceiptText, UserCog,
} from 'lucide-react';
import { Card, PageHeader } from '../components/ui/index.jsx';
import { useI18n } from '../context/I18nContext.jsx';

// Each section reads as flowing paragraphs (not bullet points), written for the
// single operator who runs the day-to-day work. Fully bilingual.
const SECTIONS = [
  {
    id: 'start', icon: Rocket,
    en: {
      title: 'Getting started & signing in',
      body: [
        'The software runs on this computer. To start it, open the project folder and launch the app (your IT person usually sets up a one-click shortcut), then open it in your web browser — you will see the sign-in screen. Log in with the ID and password you were given.',
        'You are the operator, which means you can do everything: create, edit and delete records, raise invoices and e-invoices, make delivery challans and e-way bills, and manage vendors and offices. Nothing waits for anyone else’s approval. The top-right of every screen has a language button (EN / हिं) to switch the whole app between English and Hindi at any moment, and your name where you sign out.',
      ],
    },
    hi: {
      title: 'शुरुआत करें और साइन इन करें',
      body: [
        'यह सॉफ़्टवेयर इसी कंप्यूटर पर चलता है। इसे शुरू करने के लिए प्रोजेक्ट फ़ोल्डर खोलें और ऐप चालू करें (आपका आईटी व्यक्ति आमतौर पर एक-क्लिक शॉर्टकट बना देता है), फिर इसे वेब ब्राउज़र में खोलें — आपको साइन-इन स्क्रीन दिखेगी। आपको दी गई ID और पासवर्ड से लॉगिन करें।',
        'आप ऑपरेटर हैं, यानी आप सब कुछ कर सकते हैं: रिकॉर्ड बनाना, बदलना और हटाना, इनवॉइस व e-invoice बनाना, डिलीवरी चालान व e-way bill बनाना, और विक्रेता व कार्यालय प्रबंधित करना। किसी और की मंज़ूरी की प्रतीक्षा नहीं होती। हर स्क्रीन के ऊपर-दाईं ओर भाषा बटन (EN / हिं) है जिससे पूरा ऐप कभी भी अंग्रेज़ी–हिंदी में बदलें, और आपका नाम जहाँ से आप साइन आउट करते हैं।',
      ],
    },
  },
  {
    id: 'operate', icon: UserCog,
    en: {
      title: 'How you work — direct, no approvals',
      body: [
        'This software is built for a single operator, so there are no approval queues, no “pending manager sign-off”, and no waiting. Whenever you create or change something — a delivery challan, an invoice, an e-invoice, a vendor, an office or a payment — it saves immediately and is yours to use right away.',
        'Even though there are no approvals, every action is still recorded permanently in the audit trail (who did what and when), and the system protects your work in the background: it warns you before you leave a half-finished form, quietly saves a draft so a crash never loses your typing, and takes an automatic backup of everything every two hours.',
      ],
    },
    hi: {
      title: 'आप कैसे काम करते हैं — सीधे, बिना मंज़ूरी',
      body: [
        'यह सॉफ़्टवेयर एकल ऑपरेटर के लिए बना है, इसलिए कोई मंज़ूरी कतार नहीं, कोई “मैनेजर की स्वीकृति बाकी” नहीं, और कोई प्रतीक्षा नहीं। जब भी आप कुछ बनाते या बदलते हैं — चालान, इनवॉइस, e-invoice, विक्रेता, कार्यालय या भुगतान — वह तुरंत सहेजा जाता है और तुरंत उपयोग के लिए तैयार होता है।',
        'मंज़ूरी न होने पर भी, हर क्रिया स्थायी रूप से ऑडिट ट्रेल में दर्ज होती है (किसने, क्या, कब किया), और सिस्टम पृष्ठभूमि में आपके काम की रक्षा करता है: अधूरा फ़ॉर्म छोड़ने से पहले चेतावनी देता है, ड्राफ्ट चुपचाप सहेजता है ताकि क्रैश में टाइपिंग न खोए, और हर दो घंटे में सब कुछ का स्वतः बैकअप लेता है।',
      ],
    },
  },
  {
    id: 'dashboard', icon: LayoutDashboard,
    en: {
      title: 'The Dashboard',
      body: [
        'The Dashboard is your home screen and a quick health-check of the business. The top rows show live money figures — total paid out, total received, pending receivables and your net position — followed by counts of pending invoices, payments still waiting for an invoice, reconciliation pending and active projects.',
        'Below that, a “Production & Data” strip shows how much you have on record (vendors, offices, invoices, e-invoices, challans, e-way bills), when the last backup ran and how healthy it is, how much storage is used, and when you last published to the cloud. Click any tile to jump straight into that area.',
      ],
    },
    hi: {
      title: 'डैशबोर्ड',
      body: [
        'डैशबोर्ड आपकी होम स्क्रीन और व्यवसाय की त्वरित जाँच है। ऊपर की पंक्तियाँ लाइव धन आँकड़े दिखाती हैं — कुल भुगतान, कुल प्राप्ति, लंबित प्राप्य और शुद्ध स्थिति — फिर लंबित इनवॉइस, इनवॉइस की प्रतीक्षा कर रहे भुगतान, लंबित समाधान और सक्रिय परियोजनाओं की गिनती।',
        'उसके नीचे, “Production & Data” पट्टी दिखाती है कि आपके पास कितना रिकॉर्ड है (विक्रेता, कार्यालय, इनवॉइस, e-invoice, चालान, e-way bill), अंतिम बैकअप कब चला और कितना स्वस्थ है, कितना स्टोरेज उपयोग हुआ, और आपने आख़िरी बार क्लाउड पर कब प्रकाशित किया। किसी भी टाइल पर क्लिक कर सीधे उस क्षेत्र में जाएँ।',
      ],
    },
  },
  {
    id: 'payments', icon: ArrowUpRight,
    en: {
      title: 'Outgoing Payments (money you pay out)',
      body: [
        'Open “Outgoing Payments” to record money leaving the business. Click New, choose whether you are paying a vendor or an employee, pick the name, and enter the amount and date. You can tag the payment to a project, site, category and material so costs roll up correctly in reports and project profitability.',
        'If the money relates to a purchase, mark whether the vendor’s invoice has been received and attach the bill. When you later import a bank statement, the system matches each transaction to the right vendor automatically using the account number, so your books and the bank stay in step.',
      ],
    },
    hi: {
      title: 'जावक भुगतान (जो पैसा आप देते हैं)',
      body: [
        '“जावक भुगतान” खोलकर व्यवसाय से जाने वाला पैसा दर्ज करें। New पर क्लिक करें, चुनें कि आप विक्रेता को दे रहे हैं या कर्मचारी को, नाम चुनें, और राशि व दिनांक भरें। भुगतान को परियोजना, साइट, श्रेणी और सामग्री से जोड़ें ताकि लागत रिपोर्ट और परियोजना लाभप्रदता में सही जुड़े।',
        'यदि पैसा किसी खरीद से जुड़ा है, तो चिह्नित करें कि विक्रेता का बिल मिला या नहीं और बिल संलग्न करें। बाद में बैंक स्टेटमेंट आयात करने पर, सिस्टम खाता संख्या से हर लेनदेन को सही विक्रेता से स्वतः मिलाता है, ताकि आपकी बही और बैंक मेल खाते रहें।',
      ],
    },
  },
  {
    id: 'receipts', icon: ArrowDownLeft,
    en: {
      title: 'Incoming Receipts (money you receive)',
      body: [
        'Open “Incoming Receipts” to record money coming in from clients. Enter the client, the credited amount and date, and link it to the invoice it settles. You can capture deductions such as TDS, retention and other amounts separately so the true outstanding on each invoice stays accurate.',
        'As receipts are linked, each invoice automatically moves from raised to partially paid to paid, and the client’s outstanding balance updates on its own — so you always know who still owes you and how much.',
      ],
    },
    hi: {
      title: 'आवक प्राप्तियाँ (जो पैसा आपको मिलता है)',
      body: [
        '“आवक प्राप्तियाँ” खोलकर ग्राहकों से आने वाला पैसा दर्ज करें। ग्राहक, जमा राशि व दिनांक भरें और जिस इनवॉइस का निपटान है उससे जोड़ें। TDS, अवधारण (retention) और अन्य कटौतियाँ अलग से दर्ज करें ताकि हर इनवॉइस का वास्तविक बकाया सही रहे।',
        'जैसे-जैसे प्राप्तियाँ जुड़ती हैं, हर इनवॉइस स्वतः raised → आंशिक भुगतान → भुगतान में बदलती है, और ग्राहक का बकाया स्वयं अपडेट होता है — इसलिए आपको हमेशा पता रहता है कि किस पर कितना बकाया है।',
      ],
    },
  },
  {
    id: 'reconciliation', icon: Banknote,
    en: {
      title: 'Bank Reconciliation',
      body: [
        'Open “Bank Reconciliation” and import your bank statement (the IDBI format is understood automatically, even multi-line entries). The system reads every transaction, then matches it to the right vendor or client using the account number and beneficiary name, marking each line as matched or needing a quick review.',
        'Where it cannot decide, you map the account to a vendor once and it will remember that mapping for every future statement. This keeps the software’s records and the actual bank perfectly aligned, and surfaces any payment or receipt you may have forgotten to enter.',
      ],
    },
    hi: {
      title: 'बैंक समाधान',
      body: [
        '“बैंक समाधान” खोलकर अपना बैंक स्टेटमेंट आयात करें (IDBI प्रारूप, यहाँ तक कि बहु-पंक्ति प्रविष्टियाँ भी, स्वतः समझा जाता है)। सिस्टम हर लेनदेन पढ़ता है, फिर खाता संख्या और लाभार्थी नाम से उसे सही विक्रेता/ग्राहक से मिलाता है, और हर पंक्ति को मिलान हुआ या त्वरित समीक्षा चाहिए के रूप में चिह्नित करता है।',
        'जहाँ निर्णय न हो पाए, वहाँ खाते को एक बार विक्रेता से मैप करें और वह हर भविष्य के स्टेटमेंट के लिए याद रखेगा। इससे सॉफ़्टवेयर के रिकॉर्ड और वास्तविक बैंक पूरी तरह मेल खाते हैं, और कोई भूला हुआ भुगतान/प्राप्ति सामने आ जाती है।',
      ],
    },
  },
  {
    id: 'vendors', icon: Building2,
    en: {
      title: 'Vendors',
      body: [
        'The Vendor Master holds every supplier you pay, with their GSTIN, bank account and IFSC. Each vendor can have more than one bank account, and these accounts are what the bank-reconciliation matching uses — so keeping them accurate means statements match themselves.',
        'You can add a vendor at any time, and new vendors are also created automatically when you import a beneficiary list or a bank statement that mentions someone not yet on file. Open any vendor to see its full ledger — everything you have paid them, running balance included.',
      ],
    },
    hi: {
      title: 'विक्रेता',
      body: [
        'विक्रेता मास्टर में हर आपूर्तिकर्ता होता है जिसे आप भुगतान करते हैं — उसके GSTIN, बैंक खाते और IFSC के साथ। हर विक्रेता के एक से अधिक बैंक खाते हो सकते हैं, और यही खाते बैंक-समाधान मिलान में उपयोग होते हैं — इसलिए इन्हें सही रखने से स्टेटमेंट स्वयं मेल खाते हैं।',
        'आप कभी भी विक्रेता जोड़ सकते हैं, और जब आप लाभार्थी सूची या बैंक स्टेटमेंट आयात करते हैं जिसमें कोई नया नाम हो, तो नए विक्रेता स्वतः बन जाते हैं। किसी भी विक्रेता को खोलकर उसकी पूरी बही देखें — आपने उसे जो भुगतान किया, चालू शेष सहित।',
      ],
    },
  },
  {
    id: 'clients', icon: Users,
    en: {
      title: 'Clients',
      body: [
        'Clients are the customers you bill. Keep each client’s name, GSTIN and address on file so they flow straight into invoices and e-invoices without retyping. Opening a client shows its ledger — what you have billed, what has been received and the outstanding balance — so collections are always clear.',
      ],
    },
    hi: {
      title: 'ग्राहक',
      body: [
        'ग्राहक वे हैं जिन्हें आप बिल करते हैं। हर ग्राहक का नाम, GSTIN और पता रखें ताकि वे बिना दोबारा टाइप किए सीधे इनवॉइस और e-invoice में आ जाएँ। ग्राहक खोलने पर उसकी बही दिखती है — आपने क्या बिल किया, क्या प्राप्त हुआ और कितना बकाया है — ताकि वसूली हमेशा स्पष्ट रहे।',
      ],
    },
  },
  {
    id: 'invoices', icon: ReceiptText,
    en: {
      title: 'Invoices — standard and e-Invoice in one place',
      body: [
        'The Invoices screen shows two kinds of bill side by side, clearly colour-coded: a blue “Standard Invoice” badge for normal commercial bills, and a green “GST E-Invoice” badge for those registered on the government portal (with an IRN). The columns tell you the number, type, customer, date, amount, status, any linked e-way bill and who created it.',
        'To raise a standard invoice click New Invoice, pick the customer (or type a name and GSTIN), set the place of supply, and add items line by line with HSN, quantity, rate and GST percent. The software works out CGST and SGST for a sale within your state, or IGST for another state, and shows the running total live. Mark it Draft, Issued or Cancelled, add notes, and you are done — no approval needed.',
        'Invoices and e-way bills stay connected both ways. From an invoice you can link an existing e-way bill or create one from it; opening either record shows the other, so the goods movement and the bill are never out of sync.',
      ],
    },
    hi: {
      title: 'इनवॉइस — स्टैंडर्ड और e-Invoice एक ही जगह',
      body: [
        'इनवॉइस स्क्रीन दो तरह के बिल साथ-साथ दिखाती है, स्पष्ट रंग-कोडित: सामान्य व्यापारिक बिलों के लिए नीला “Standard Invoice” बैज, और सरकारी पोर्टल पर पंजीकृत (IRN वाले) के लिए हरा “GST E-Invoice” बैज। कॉलम बताते हैं — संख्या, प्रकार, ग्राहक, दिनांक, राशि, स्थिति, जुड़ा e-way bill और किसने बनाया।',
        'स्टैंडर्ड इनवॉइस बनाने के लिए New Invoice पर क्लिक करें, ग्राहक चुनें (या नाम व GSTIN टाइप करें), आपूर्ति का स्थान चुनें, और मदें एक-एक कर HSN, मात्रा, दर व GST% सहित जोड़ें। अपने राज्य के भीतर बिक्री पर सॉफ़्टवेयर CGST+SGST और दूसरे राज्य पर IGST निकालता है, और कुल लाइव दिखाता है। इसे Draft, Issued या Cancelled चिह्नित करें, टिप्पणी जोड़ें — बस हो गया, किसी मंज़ूरी की ज़रूरत नहीं।',
        'इनवॉइस और e-way bill दोनों तरफ़ से जुड़े रहते हैं। इनवॉइस से आप मौजूदा e-way bill जोड़ सकते हैं या नया बना सकते हैं; कोई भी रिकॉर्ड खोलने पर दूसरा दिखता है, ताकि माल की आवाजाही और बिल कभी अलग न हों।',
      ],
    },
  },
  {
    id: 'challans', icon: ClipboardList,
    en: {
      title: 'Delivery Challans',
      body: [
        'A delivery challan moves goods when you are not raising a tax invoice yet — job work, branch or warehouse transfer, repair, testing, demonstration, exhibition, goods on approval, returnable packaging and similar movements allowed under GST Rule 55. Open “Delivery Challans”, click New Challan, choose the type, and fill the consignor (from) and consignee (to) details.',
        'Add the goods with HSN, quantity, rate and GST, and the software decides CGST+SGST or IGST and shows the live total. Enter the transport details and any e-way bill number. Because you are the operator there are no approvals: save and dispatch directly. Afterwards mark the challan delivered with the receiver’s name, record a return if goods come back, generate a linked e-way bill, or convert the challan into a tax invoice — the link between them is kept. Download the challan PDF (English or Hindi) to send with the vehicle.',
      ],
    },
    hi: {
      title: 'डिलीवरी चालान',
      body: [
        'डिलीवरी चालान तब माल भेजता है जब आप अभी टैक्स इनवॉइस नहीं बना रहे — जॉब वर्क, शाखा/गोदाम स्थानांतरण, मरम्मत, परीक्षण, प्रदर्शन, प्रदर्शनी, अनुमोदन पर माल, वापसी योग्य पैकेजिंग आदि (GST नियम 55)। “Delivery Challans” खोलें, New Challan पर क्लिक करें, प्रकार चुनें, और भेजने वाले (from) व पाने वाले (to) का विवरण भरें।',
        'माल को HSN, मात्रा, दर व GST सहित जोड़ें; सॉफ़्टवेयर CGST+SGST या IGST तय करता है और कुल लाइव दिखाता है। परिवहन विवरण और कोई e-way bill संख्या भरें। आप ऑपरेटर हैं इसलिए कोई मंज़ूरी नहीं: सीधे सहेजें और डिस्पैच करें। बाद में पाने वाले का नाम लेकर डिलीवर चिह्नित करें, माल लौटने पर वापसी दर्ज करें, जुड़ा e-way bill बनाएँ, या चालान को टैक्स इनवॉइस में बदलें — दोनों का संबंध सुरक्षित रहता है। वाहन के साथ भेजने हेतु चालान PDF (अंग्रेज़ी या हिंदी) डाउनलोड करें।',
      ],
    },
  },
  {
    id: 'quotes', icon: Calculator,
    en: {
      title: 'Quotations & solar proposals',
      body: [
        'Open “Quotes & Estimation” and click New Quote. Enter the client, system size in kW, the per-watt rate and the bill of quantities (modules, inverter, structure, balance of system). The tool computes subtotal, contingency, margin, taxable value, GST and the grand total automatically, and you can add a government subsidy to show the net effective cost.',
        'The downloadable PDF is fully branded with your logo, signature, stamp and terms, and includes a “Why Go Solar” section — annual savings, payback period, 25-year return, clean units generated, CO₂ avoided, trees-equivalent and a savings chart — so the customer can see how worthwhile switching to solar is. These figures are indicative estimates based on typical Indian generation and tariff rise.',
      ],
    },
    hi: {
      title: 'कोटेशन और सौर प्रस्ताव',
      body: [
        '“कोटेशन और अनुमान” खोलकर New Quote पर क्लिक करें। ग्राहक, सिस्टम आकार (kW), प्रति-वाट दर और सामग्री सूची (मॉड्यूल, इन्वर्टर, स्ट्रक्चर, BOS) भरें। उपकरण उप-योग, आकस्मिकता, मार्जिन, कर-योग्य मूल्य, GST और कुल राशि स्वतः निकालता है, और शुद्ध प्रभावी लागत दिखाने हेतु सरकारी सब्सिडी जोड़ सकते हैं।',
        'डाउनलोड होने वाला PDF आपके लोगो, हस्ताक्षर, मुहर और शर्तों के साथ पूरी तरह ब्रांडेड है, और इसमें “Why Go Solar” अनुभाग है — वार्षिक बचत, पेबैक अवधि, 25-वर्षीय लाभ, स्वच्छ यूनिट, टाला गया CO₂, वृक्ष-समतुल्य और बचत चार्ट — ताकि ग्राहक देख सके कि सौर पर जाना कितना लाभदायक है। ये आँकड़े सामान्य भारतीय उत्पादन व टैरिफ वृद्धि पर आधारित सांकेतिक अनुमान हैं।',
      ],
    },
  },
  {
    id: 'gst', icon: ShieldCheck,
    en: {
      title: 'GST Compliance — e-Invoice & e-Way Bill',
      body: [
        'Open “GST Compliance” to prepare e-Invoices and e-Way Bills — they are separate legal documents and sit side by side. Build an e-Invoice with the buyer, items and values; the software validates every field locally and flags problems before anything is submitted. An e-Way Bill carries the transport details (vehicle, transporter, distance) for moving goods.',
        'When you have your three GSTINs (Greater Noida, Bihar and Delhi) you switch between them from the branch selector at the top, and each office numbers its own documents. Because a live GST API is not provided to you, filing is done offline: the software builds the e-Invoice (or e-Way Bill) JSON, you click “Upload on GST Portal”, log in and bulk-upload the file, and the portal returns the IRN, Ack number and signed PDF. Open the document here, choose “Enter IRN” and upload that signed PDF — the IRN, Ack number and QR are read automatically and the finished, branded document is produced.',
      ],
    },
    hi: {
      title: 'GST अनुपालन — e-Invoice और e-Way Bill',
      body: [
        '“GST Compliance” खोलकर e-Invoice और e-Way Bill तैयार करें — ये अलग कानूनी दस्तावेज़ हैं और साथ-साथ रहते हैं। खरीदार, मदों व मूल्यों के साथ e-Invoice बनाएँ; सॉफ़्टवेयर हर फ़ील्ड को स्थानीय रूप से जाँचता है और जमा करने से पहले समस्याएँ बताता है। e-Way Bill माल की आवाजाही के परिवहन विवरण (वाहन, ट्रांसपोर्टर, दूरी) रखता है।',
        'जब आपके तीन GSTIN (ग्रेटर नोएडा, बिहार और दिल्ली) होते हैं, तो आप ऊपर शाखा चयनकर्ता से उनके बीच बदलते हैं, और हर कार्यालय अपने दस्तावेज़ अलग से नंबर करता है। सरकारी पोर्टल से जुड़ाव तैयार और मॉड्यूलर है: अभी यह सुरक्षित सिमुलेशन में चलता है ताकि आप पूरी प्रक्रिया अभ्यास कर सकें, और जब आपके लाइव GST प्रमाण-पत्र आएँगे तो यह बिना किसी पुनर्निर्माण के असली IRN पर बदल जाएगा।',
      ],
    },
  },
  {
    id: 'reports', icon: BarChart3,
    en: {
      title: 'Reports, exports & download language',
      body: [
        'Open “Reports” for management-ready summaries, and use the Excel or PDF buttons on the Payments, Receipts, ledger and challan screens to export exactly what is on the screen, filtered by the date range you chose. Vendor, client and employee ledgers each export from their own page.',
        'Every document and report download — invoices, e-way bills, quotations, delivery challans and reports — can be produced in English or Hindi. When you click a PDF or Excel button a small pop-up asks which language you want; the headings, labels and totals translate while names, GSTINs, dates and amounts stay as they are, which is the normal format for Indian bilingual documents.',
      ],
    },
    hi: {
      title: 'रिपोर्ट, निर्यात और डाउनलोड भाषा',
      body: [
        '“Reports” खोलकर प्रबंधन-तैयार सारांश पाएँ, और Payments, Receipts, बही व चालान स्क्रीन पर Excel/PDF बटन से वही निकालें जो स्क्रीन पर है, आपके चुने दिनांक-दायरे से फ़िल्टर होकर। विक्रेता, ग्राहक और कर्मचारी बही अपने-अपने पृष्ठ से निर्यात होती हैं।',
        'हर दस्तावेज़ और रिपोर्ट डाउनलोड — इनवॉइस, e-way bill, कोटेशन, चालान और रिपोर्ट — अंग्रेज़ी या हिंदी में बनाई जा सकती है। PDF या Excel बटन दबाते ही एक छोटा पॉपअप भाषा पूछता है; शीर्षक, लेबल और कुल अनुवादित होते हैं जबकि नाम, GSTIN, दिनांक व राशि वैसे ही रहते हैं — भारतीय द्विभाषी दस्तावेज़ों का सामान्य प्रारूप।',
      ],
    },
  },
  {
    id: 'backup', icon: DatabaseBackup,
    en: {
      title: 'Backup & Publish to Cloud — one click',
      body: [
        'Both are always one click away. Click your name at the top-right and you will see “Create Backup” and “Publish to Cloud” right there. Create Backup saves the entire software — every record and every uploaded file — into one timestamped file on this computer; the software also does this automatically every two hours, so you are protected even if you forget. Publish to Cloud uploads a copy of your data so the admin can view and export it on the web; your heavy files (proofs, statements) stay on this computer.',
        'For the full picture, open “Backup & Restore” (also in the menu and the left sidebar). There you can run a backup, verify it, run a safe disaster-recovery test that never touches live data, download a backup to keep off-site, and set how many backups to keep. When you sign out, the software offers to take a fresh backup first so a day’s work is never left unprotected.',
      ],
    },
    hi: {
      title: 'बैकअप और क्लाउड पर प्रकाशन — एक क्लिक',
      body: [
        'दोनों हमेशा एक क्लिक दूर हैं। ऊपर-दाईं ओर अपने नाम पर क्लिक करें — वहीं “Create Backup” और “Publish to Cloud” दिखेंगे। Create Backup पूरे सॉफ़्टवेयर को — हर रिकॉर्ड और हर अपलोड फ़ाइल — इसी कंप्यूटर पर एक समयांकित फ़ाइल में सहेजता है; सॉफ़्टवेयर यह हर दो घंटे में स्वतः भी करता है, इसलिए भूलने पर भी आप सुरक्षित हैं। Publish to Cloud आपके डेटा की एक प्रति अपलोड करता है ताकि एडमिन वेब पर देख व निर्यात कर सके; आपकी भारी फ़ाइलें (प्रूफ़, स्टेटमेंट) इसी कंप्यूटर पर रहती हैं।',
        'पूरी जानकारी के लिए “Backup & Restore” खोलें (मेनू और बाएँ साइडबार में भी)। वहाँ आप बैकअप ले सकते हैं, सत्यापित कर सकते हैं, एक सुरक्षित आपदा-पुनर्प्राप्ति परीक्षण चला सकते हैं जो लाइव डेटा को नहीं छूता, बैकअप डाउनलोड कर ऑफ-साइट रख सकते हैं, और कितने बैकअप रखने हैं तय कर सकते हैं। साइन आउट करते समय, सॉफ़्टवेयर पहले एक ताज़ा बैकअप लेने का सुझाव देता है ताकि दिन का काम कभी असुरक्षित न रहे।',
      ],
    },
  },
  {
    id: 'recovery', icon: LifeBuoy,
    en: {
      title: 'Recovery Center — undo mistakes',
      body: [
        'Open the “Recovery Center” whenever something goes wrong. Anything you deleted — an invoice, an e-way bill or a delivery challan — is listed here and can be brought back with a single Recover click; nothing is ever truly lost. The same screen shows your recovery points (backups), where you can verify a backup’s integrity or download it, and links to the full audit trail of every change.',
        'Restoring from a backup is additive and safe: it brings back missing records without overwriting what you already have, so you can recover from a problem without fear of wiping today’s work.',
      ],
    },
    hi: {
      title: 'रिकवरी सेंटर — गलतियाँ पूर्ववत करें',
      body: [
        'कुछ गलत होने पर “Recovery Center” खोलें। आपने जो हटाया — इनवॉइस, e-way bill या डिलीवरी चालान — वह यहाँ सूचीबद्ध होता है और एक Recover क्लिक से वापस आ जाता है; कुछ भी सचमुच नहीं खोता। वही स्क्रीन आपके रिकवरी पॉइंट (बैकअप) दिखाती है, जहाँ आप बैकअप की अखंडता जाँच या डाउनलोड कर सकते हैं, और हर बदलाव के पूरे ऑडिट ट्रेल के लिंक देती है।',
        'बैकअप से पुनर्स्थापना योगात्मक और सुरक्षित है: यह गायब रिकॉर्ड वापस लाती है पर मौजूदा डेटा को अधिलेखित नहीं करती, इसलिए आप आज का काम मिटने के डर के बिना किसी समस्या से उबर सकते हैं।',
      ],
    },
  },
  {
    id: 'protection', icon: Save,
    en: {
      title: 'Never lose your work',
      body: [
        'The software quietly protects whatever you are typing. While you fill an invoice or a challan, your work is auto-saved as a draft on this computer, so if the browser closes, the power goes off or the screen is shut by accident, you will be offered to restore that draft the next time you open the form. If you try to leave a form with unsaved changes, the software warns you first rather than letting the work vanish.',
        'Together with the automatic two-hourly backups and the offer to back up before you sign out, this means a normal mishap — a crash, a power cut, a closed tab — does not cost you your data.',
      ],
    },
    hi: {
      title: 'अपना काम कभी न खोएँ',
      body: [
        'सॉफ़्टवेयर चुपचाप आपकी टाइपिंग की रक्षा करता है। इनवॉइस या चालान भरते समय आपका काम इसी कंप्यूटर पर ड्राफ्ट के रूप में स्वतः सहेजा जाता है, इसलिए यदि ब्राउज़र बंद हो जाए, बिजली चली जाए या स्क्रीन गलती से बंद हो जाए, तो अगली बार फ़ॉर्म खोलने पर आपको वह ड्राफ्ट पुनर्स्थापित करने का विकल्प मिलेगा। बिना सहेजे फ़ॉर्म छोड़ने पर सॉफ़्टवेयर पहले चेतावनी देता है, ताकि काम गायब न हो।',
        'हर दो घंटे के स्वतः बैकअप और साइन आउट से पहले बैकअप के सुझाव के साथ, इसका अर्थ है कि सामान्य दुर्घटना — क्रैश, बिजली कटौती, बंद टैब — आपका डेटा नहीं छीनती।',
      ],
    },
  },
  {
    id: 'security', icon: ShieldCheck,
    en: {
      title: 'Security verification for sensitive actions',
      body: [
        'A few sensitive actions — such as cancelling a document or restoring from a backup — ask for an extra step: you confirm your password and a short verification code before they go through. This protects against accidental or unauthorised changes. Complete the two steps when prompted and the action proceeds; everything is recorded in the audit trail with the time and your name.',
      ],
    },
    hi: {
      title: 'संवेदनशील कार्यों हेतु सुरक्षा सत्यापन',
      body: [
        'कुछ संवेदनशील कार्य — जैसे दस्तावेज़ रद्द करना या बैकअप से पुनर्स्थापना — एक अतिरिक्त चरण माँगते हैं: आगे बढ़ने से पहले आप अपना पासवर्ड और एक छोटा सत्यापन कोड पुष्टि करते हैं। यह आकस्मिक या अनधिकृत बदलाव से बचाता है। संकेत मिलने पर दोनों चरण पूरे करें और कार्य आगे बढ़ता है; सब कुछ समय और आपके नाम सहित ऑडिट ट्रेल में दर्ज होता है।',
      ],
    },
  },
  {
    id: 'language', icon: Languages,
    en: {
      title: 'Changing the language',
      body: [
        'Click the language button (EN / हिं) at the top-right of any screen and the entire app instantly switches between English and Hindi — menus, buttons, labels and tables. Your choice is remembered the next time you open the software, so language is never a barrier. Separately, each document you download can be in English or Hindi, chosen from the pop-up at download time.',
      ],
    },
    hi: {
      title: 'भाषा बदलना',
      body: [
        'किसी भी स्क्रीन के ऊपर-दाईं ओर भाषा बटन (EN / हिं) पर क्लिक करें और पूरा ऐप तुरंत अंग्रेज़ी–हिंदी में बदल जाता है — मेनू, बटन, लेबल और तालिकाएँ। अगली बार सॉफ़्टवेयर खोलने पर आपकी पसंद याद रहती है, इसलिए भाषा कभी बाधा नहीं बनती। अलग से, हर डाउनलोड किया दस्तावेज़ अंग्रेज़ी या हिंदी में हो सकता है, जो डाउनलोड के समय पॉपअप से चुना जाता है।',
      ],
    },
  },
  {
    id: 'troubleshooting', icon: Search,
    en: {
      title: 'Fixing common problems',
      body: [
        'If the app will not open or shows a blank page, make sure the engine is running — use the “Start ARRAYS ERP” shortcut or open the local web address; if it is still stuck, restart the computer, as the database starts automatically. If a file upload fails, the file type or size may be unsupported, so use a PDF, image or Excel/CSV within the size limit and try again — the error text names the cause.',
        'If an invoice will not submit, run Validate first and fix each red error (common ones are an invalid GSTIN, a missing item or value, or an HSN that needs more digits). A “duplicate document number” message means that number already exists for that office — use a different number, or confirm the override with a reason. If something looks wrong, the Recovery Center lets you bring back deleted records, and the audit trail shows exactly what changed and when.',
      ],
    },
    hi: {
      title: 'सामान्य समस्याएँ ठीक करना',
      body: [
        'यदि ऐप न खुले या खाली पृष्ठ दिखे, तो सुनिश्चित करें कि इंजन चल रहा है — “Start ARRAYS ERP” शॉर्टकट उपयोग करें या स्थानीय वेब पता खोलें; फिर भी अटके तो कंप्यूटर पुनः चालू करें, क्योंकि डेटाबेस स्वतः शुरू होता है। यदि फ़ाइल अपलोड विफल हो, तो फ़ाइल प्रकार/आकार असमर्थित हो सकता है, इसलिए सीमा के भीतर PDF, छवि या Excel/CSV उपयोग करें — त्रुटि पाठ कारण बताता है।',
        'यदि इनवॉइस जमा न हो, पहले Validate करें और हर लाल त्रुटि ठीक करें (आम: अमान्य GSTIN, गायब मद/मूल्य, या HSN जिसमें अधिक अंक चाहिए)। “duplicate document number” संदेश का अर्थ है वह संख्या इस कार्यालय में पहले से है — अलग संख्या उपयोग करें या कारण सहित ओवरराइड पुष्टि करें। कुछ गलत लगे तो Recovery Center से हटाए रिकॉर्ड वापस लाएँ, और ऑडिट ट्रेल दिखाता है कि क्या और कब बदला।',
      ],
    },
  },
];

const CATS = [
  { id: 'all', en: 'All topics', hi: 'सभी विषय' },
  { id: 'start', en: 'Getting Started', hi: 'शुरुआत' },
  { id: 'workflows', en: 'Daily Workflows', hi: 'रोज़ के कार्य' },
  { id: 'gst', en: 'GST Compliance', hi: 'GST अनुपालन' },
  { id: 'safety', en: 'Backup & Safety', hi: 'बैकअप व सुरक्षा' },
  { id: 'help', en: 'Troubleshooting', hi: 'समस्या-समाधान' },
];
const CAT_OF = {
  start: 'start', operate: 'start', dashboard: 'start', language: 'start',
  payments: 'workflows', receipts: 'workflows', reconciliation: 'workflows', vendors: 'workflows',
  clients: 'workflows', invoices: 'workflows', challans: 'workflows', quotes: 'workflows', reports: 'workflows',
  gst: 'gst',
  backup: 'safety', recovery: 'safety', protection: 'safety', security: 'safety',
  troubleshooting: 'help',
};

export default function Help() {
  const { lang } = useI18n();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const isHi = lang === 'hi';

  const query = q.trim().toLowerCase();
  const visible = SECTIONS.filter((s) => {
    if (cat !== 'all' && CAT_OF[s.id] !== cat) return false;
    if (!query) return true;
    const c = s[isHi ? 'hi' : 'en'];
    return c.title.toLowerCase().includes(query) || c.body.some((p) => p.toLowerCase().includes(query));
  });
  const grouped = CATS.filter((k) => k.id !== 'all')
    .map((k) => ({ cat: k, items: visible.filter((s) => CAT_OF[s.id] === k.id) }))
    .filter((g) => g.items.length > 0);

  return (
    <div>
      <PageHeader
        title={isHi ? 'सहायता और उपयोगकर्ता मार्गदर्शिका' : 'Help & User Guide'}
        subtitle={isHi
          ? 'हर सुविधा की पूरी मार्गदर्शिका, सरल भाषा में। ऊपर की पट्टी से भाषा बदलें (EN / हिं)।'
          : 'A complete, plain-language guide to every feature. Switch the language from the top bar (EN / हिं).'}
      />

      <Card className="mb-4 !p-3">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder={isHi ? 'सहायता में खोजें…' : 'Search help…'} value={q} onChange={(e) => setQ(e.target.value)} data-no-i18n />
        </div>
      </Card>

      <div className="mb-4 flex flex-wrap gap-2">
        {CATS.map((k) => (
          <button key={k.id} onClick={() => setCat(k.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${cat === k.id ? 'bg-brand-600 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}>
            {k[isHi ? 'hi' : 'en']}
          </button>
        ))}
      </div>

      {!query && (
        <div className="mb-5 flex flex-wrap gap-2">
          {visible.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              <s.icon size={13} /> {s[isHi ? 'hi' : 'en'].title}
            </a>
          ))}
        </div>
      )}

      <div className="space-y-6">
        {grouped.map((g) => (
          <section key={g.cat.id}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-400">
              {g.cat[isHi ? 'hi' : 'en']}
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800">{g.items.length}</span>
            </h2>
            <div className="space-y-4">
              {g.items.map((s) => {
                const c = s[isHi ? 'hi' : 'en'];
                return (
                  <Card key={s.id} id={s.id} className="scroll-mt-20">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 rounded-xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-900/30">
                        <s.icon size={22} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{c.title}</h3>
                        {c.body.map((p, i) => (
                          <p key={i} className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{p}</p>
                        ))}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
        {visible.length === 0 && (
          <Card><p className="text-center text-sm text-slate-400">{isHi ? 'कोई परिणाम नहीं मिला।' : 'No matching help topics.'}</p></Card>
        )}
      </div>
    </div>
  );
}
