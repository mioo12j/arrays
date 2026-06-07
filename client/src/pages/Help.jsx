import { useState } from 'react';
import {
  Rocket, LayoutDashboard, ArrowUpRight, ArrowDownLeft, FileText, Banknote,
  Building2, UserRound, Users, Calculator, FolderKanban, BarChart3, CloudUpload,
  ShieldCheck, Languages, Search,
} from 'lucide-react';
import { Card, PageHeader } from '../components/ui/index.jsx';
import { useI18n } from '../context/I18nContext.jsx';

// Each section is fully bilingual so the guide reads naturally in either
// language, regardless of the dictionary used for the rest of the UI.
const SECTIONS = [
  {
    id: 'start', icon: Rocket,
    en: {
      title: 'Getting Started & Logging In',
      steps: [
        'The app runs on this computer. To start it: open the project folder, then start the server and the app (your IT person sets up a one-click shortcut for this).',
        'Open the app in your web browser. You will see the login screen.',
        'Log in with your ID and password. The Operator does the daily data entry; the Admin views and exports everything on the web.',
        'Use the language button at the top-right (EN / हिं) to switch the whole app between English and Hindi at any time.',
        'To sign out, click your name at the top-right and choose “Sign out”.',
      ],
    },
    hi: {
      title: 'शुरुआत करें और लॉगिन करें',
      steps: [
        'यह ऐप इसी कंप्यूटर पर चलता है। इसे शुरू करने के लिए: प्रोजेक्ट फ़ोल्डर खोलें, फिर सर्वर और ऐप चालू करें (आपका आईटी व्यक्ति इसके लिए एक-क्लिक शॉर्टकट बना देता है)।',
        'ऐप को अपने वेब ब्राउज़र में खोलें। आपको लॉगिन स्क्रीन दिखेगी।',
        'अपनी ID और पासवर्ड से लॉगिन करें। ऑपरेटर रोज़ाना डेटा भरता है; एडमिन वेब पर सब कुछ देखता और निर्यात करता है।',
        'ऊपर-दाईं ओर भाषा बटन (EN / हिं) से किसी भी समय पूरे ऐप को हिंदी और अंग्रेज़ी के बीच बदलें।',
        'साइन आउट करने के लिए, ऊपर-दाईं ओर अपने नाम पर क्लिक करें और “साइन आउट” चुनें।',
      ],
    },
  },
  {
    id: 'dashboard', icon: LayoutDashboard,
    en: {
      title: 'Dashboard',
      steps: [
        'The Dashboard is the home screen. It shows live totals: total money paid out, total money received, pending receivables and your net position.',
        'It also shows pending invoices, payments waiting for an invoice, reconciliation pending, and active projects.',
        'Use it for a quick health-check of the business. Click any module in the left menu to go deeper.',
      ],
    },
    hi: {
      title: 'डैशबोर्ड',
      steps: [
        'डैशबोर्ड होम स्क्रीन है। यह लाइव कुल दिखाता है: कुल भुगतान, कुल प्राप्ति, लंबित प्राप्य राशि और आपकी शुद्ध स्थिति।',
        'यह लंबित चालान, चालान की प्रतीक्षा कर रहे भुगतान, लंबित समाधान और सक्रिय परियोजनाएँ भी दिखाता है।',
        'व्यवसाय की त्वरित जाँच के लिए इसका उपयोग करें। गहराई में जाने के लिए बाईं ओर मेनू में किसी भी मॉड्यूल पर क्लिक करें।',
      ],
    },
  },
  {
    id: 'payments', icon: ArrowUpRight,
    en: {
      title: 'Outgoing Payments (money you pay out)',
      steps: [
        'Open “Outgoing Payments” from the left menu, then click “New Payment”.',
        'Click “Upload Proof” and choose the payment screenshot or PDF. The system reads the amount, date, reference number, beneficiary and remark for you.',
        'Check the read values and correct anything that is wrong.',
        'Choose whether you are paying a Vendor or an Employee, then pick the name. Add the category, project/site and material type if needed.',
        'Write the Additional Comment — this is mandatory. Explain what the payment was for (e.g. “Advance for 2 ton steel — Phase 4”).',
        'Click “Save Payment”. The vendor/employee ledger updates automatically.',
        'Click any row in the list to open it and see every detail of that payment.',
        'If an invoice is still pending, use the “Attach” button on the row to add the invoice file later.',
      ],
    },
    hi: {
      title: 'जावक भुगतान (जो पैसा आप देते हैं)',
      steps: [
        'बाएँ मेनू से “जावक भुगतान” खोलें, फिर “नया भुगतान” पर क्लिक करें।',
        '“प्रमाण अपलोड करें” पर क्लिक करें और भुगतान का स्क्रीनशॉट या PDF चुनें। सिस्टम आपके लिए राशि, दिनांक, संदर्भ संख्या, लाभार्थी और टिप्पणी पढ़ लेता है।',
        'पढ़े गए मानों की जाँच करें और जो भी ग़लत हो उसे सही करें।',
        'चुनें कि आप विक्रेता को भुगतान कर रहे हैं या कर्मचारी को, फिर नाम चुनें। आवश्यकता हो तो श्रेणी, परियोजना/साइट और सामग्री प्रकार जोड़ें।',
        'अतिरिक्त टिप्पणी लिखें — यह अनिवार्य है। बताएँ कि भुगतान किस लिए था (जैसे “2 टन स्टील के लिए अग्रिम — फेज़ 4”)।',
        '“भुगतान सहेजें” पर क्लिक करें। विक्रेता/कर्मचारी का खाता स्वतः अपडेट हो जाता है।',
        'उस भुगतान का हर विवरण देखने के लिए सूची में किसी भी पंक्ति पर क्लिक करें।',
        'यदि चालान अभी लंबित है, तो पंक्ति पर “संलग्न करें” बटन से बाद में चालान फ़ाइल जोड़ें।',
      ],
    },
  },
  {
    id: 'receipts', icon: ArrowDownLeft,
    en: {
      title: 'Incoming Receipts (money you receive)',
      steps: [
        'Open “Incoming Receipts”, then click “New Receipt”.',
        'You can upload the bank credit screenshot to auto-read the amount, date and reference, or type them in.',
        'Select the Client and, if relevant, the linked invoice and project.',
        'Enter any TDS, retention or other deductions — the client ledger accounts for these correctly.',
        'Click “Save Receipt”. The client’s receivable balance updates automatically.',
        'Click any row to view the full details of a receipt.',
      ],
    },
    hi: {
      title: 'आवक प्राप्तियाँ (जो पैसा आपको मिलता है)',
      steps: [
        '“आवक प्राप्तियाँ” खोलें, फिर “नई प्राप्ति” पर क्लिक करें।',
        'राशि, दिनांक और संदर्भ स्वतः पढ़ने के लिए आप बैंक क्रेडिट स्क्रीनशॉट अपलोड कर सकते हैं, या उन्हें टाइप कर सकते हैं।',
        'ग्राहक चुनें और, यदि लागू हो, तो संबद्ध चालान और परियोजना चुनें।',
        'कोई TDS, रोक राशि या अन्य कटौती दर्ज करें — ग्राहक का खाता इन्हें सही ढंग से समायोजित करता है।',
        '“प्राप्ति सहेजें” पर क्लिक करें। ग्राहक की प्राप्य राशि स्वतः अपडेट हो जाती है।',
        'किसी प्राप्ति का पूरा विवरण देखने के लिए किसी भी पंक्ति पर क्लिक करें।',
      ],
    },
  },
  {
    id: 'invoices', icon: FileText,
    en: {
      title: 'Invoices',
      steps: [
        'Open “Invoices” to see all proforma and GST tax invoices with their settlement status.',
        'Click “New Invoice” to create one by hand, or “Import” to read an invoice file automatically (operator only).',
        'Enter the invoice number, client, dates and amounts. The total is calculated for you.',
        'As receipts come in against an invoice, its balance and status update automatically.',
      ],
    },
    hi: {
      title: 'चालान',
      steps: [
        'सभी प्रोफ़ॉर्मा और GST कर चालान उनकी निपटान स्थिति के साथ देखने के लिए “चालान” खोलें।',
        'हाथ से बनाने के लिए “नया चालान” पर क्लिक करें, या किसी चालान फ़ाइल को स्वतः पढ़ने के लिए “आयात” पर (केवल ऑपरेटर)।',
        'चालान संख्या, ग्राहक, दिनांक और राशियाँ दर्ज करें। कुल आपके लिए गणना हो जाता है।',
        'जैसे-जैसे चालान के विरुद्ध प्राप्तियाँ आती हैं, उसका शेष और स्थिति स्वतः अपडेट होती जाती है।',
      ],
    },
  },
  {
    id: 'reconciliation', icon: Banknote,
    en: {
      title: 'Bank Reconciliation',
      steps: [
        'Open “Bank Reconciliation” and click “Upload Statement” (operator only).',
        'Choose your bank statement (PDF, Excel or CSV). The system reads every debit and credit line.',
        'It automatically matches transactions to your recorded payments and receipts, and flags what needs review.',
        'Open a statement to review unmatched lines and confirm or correct the matches.',
      ],
    },
    hi: {
      title: 'बैंक समाधान',
      steps: [
        '“बैंक समाधान” खोलें और “विवरण अपलोड करें” पर क्लिक करें (केवल ऑपरेटर)।',
        'अपना बैंक विवरण चुनें (PDF, Excel या CSV)। सिस्टम हर नामे और जमा पंक्ति पढ़ता है।',
        'यह लेन-देन को आपके दर्ज भुगतान और प्राप्तियों से स्वतः मिलाता है, और समीक्षा हेतु चिह्नित करता है।',
        'बेमेल पंक्तियों की समीक्षा करने और मिलान की पुष्टि या सुधार करने के लिए कोई विवरण खोलें।',
      ],
    },
  },
  {
    id: 'vendors', icon: Building2,
    en: {
      title: 'Vendor Master',
      steps: [
        'Open “Vendor Master” to see every vendor with their total paid, outstanding balance and pending invoices.',
        'Click “New Vendor” to add one, or “Import List” to bring in many at once from an Excel/CSV file (operator only).',
        'Add a vendor’s bank account number — the system then auto-matches future bank transactions to that vendor.',
        'Click a vendor to open their full ledger and export it.',
      ],
    },
    hi: {
      title: 'विक्रेता मास्टर',
      steps: [
        'हर विक्रेता को उनके कुल भुगतान, बकाया शेष और लंबित चालान के साथ देखने के लिए “विक्रेता मास्टर” खोलें।',
        'एक जोड़ने के लिए “नया विक्रेता” पर क्लिक करें, या एक Excel/CSV फ़ाइल से एक साथ कई लाने के लिए “सूची आयात” पर (केवल ऑपरेटर)।',
        'विक्रेता का बैंक खाता नंबर जोड़ें — फिर सिस्टम भविष्य के बैंक लेन-देन को उस विक्रेता से स्वतः मिला देता है।',
        'किसी विक्रेता की पूरी खाता-बही खोलने और निर्यात करने के लिए उस पर क्लिक करें।',
      ],
    },
  },
  {
    id: 'employees', icon: UserRound,
    en: {
      title: 'Employees',
      steps: [
        'Open “Employees” to manage salaries, labour and advances paid to staff.',
        'Click “New Employee” to add someone. Each employee has their own ledger.',
        'When you record an outgoing payment, choose “Employee” as the payee type to post it to their ledger.',
      ],
    },
    hi: {
      title: 'कर्मचारी',
      steps: [
        'कर्मचारियों को दिए गए वेतन, श्रम और अग्रिम प्रबंधित करने के लिए “कर्मचारी” खोलें।',
        'किसी को जोड़ने के लिए “नया कर्मचारी” पर क्लिक करें। हर कर्मचारी की अपनी खाता-बही होती है।',
        'जावक भुगतान दर्ज करते समय, उसे कर्मचारी की खाता-बही में डालने के लिए प्राप्तकर्ता प्रकार में “कर्मचारी” चुनें।',
      ],
    },
  },
  {
    id: 'clients', icon: Users,
    en: {
      title: 'Clients',
      steps: [
        'Open “Clients” to see receivables: total billed, received, outstanding and overdue per client.',
        'Click “New Client” to add one. Receipts you record against a client reduce their outstanding balance.',
        'Click a client to open their ledger and export a statement.',
      ],
    },
    hi: {
      title: 'ग्राहक',
      steps: [
        'प्राप्य राशि देखने के लिए “ग्राहक” खोलें: प्रति ग्राहक कुल बिल, प्राप्त, बकाया और अतिदेय।',
        'एक जोड़ने के लिए “नया ग्राहक” पर क्लिक करें। ग्राहक के विरुद्ध दर्ज की गई प्राप्तियाँ उनका बकाया शेष घटाती हैं।',
        'किसी ग्राहक की खाता-बही खोलने और विवरण निर्यात करने के लिए उस पर क्लिक करें।',
      ],
    },
  },
  {
    id: 'quotes', icon: Calculator,
    en: {
      title: 'Quotes & Estimation',
      steps: [
        'Open “Quotes & Estimation” to prepare solar project quotations.',
        'Click “New Quote”, enter the system size and costs, and the tool calculates margin, GST and the final price.',
        'Save and export a professional quotation PDF to send to the client.',
      ],
    },
    hi: {
      title: 'कोटेशन और अनुमान',
      steps: [
        'सौर परियोजना कोटेशन तैयार करने के लिए “कोटेशन और अनुमान” खोलें।',
        '“नया कोट” पर क्लिक करें, सिस्टम का आकार और लागत दर्ज करें, और उपकरण मार्जिन, GST और अंतिम मूल्य की गणना करता है।',
        'ग्राहक को भेजने के लिए एक पेशेवर कोटेशन PDF सहेजें और निर्यात करें।',
      ],
    },
  },
  {
    id: 'projects', icon: FolderKanban,
    en: {
      title: 'Projects & Sites',
      steps: [
        'Open “Projects & Sites” to organise work by project, each with its own sites.',
        'Click “New Project”, then add sites inside it. Expenditure and profitability are tracked site-wise.',
        'Tag payments to a project/site so costs roll up correctly.',
      ],
    },
    hi: {
      title: 'परियोजनाएँ और साइटें',
      steps: [
        'काम को परियोजना के अनुसार व्यवस्थित करने के लिए “परियोजनाएँ और साइटें” खोलें, हर परियोजना की अपनी साइटें होती हैं।',
        '“नई परियोजना” पर क्लिक करें, फिर उसके अंदर साइटें जोड़ें। व्यय और लाभप्रदता साइट-वार ट्रैक होती है।',
        'भुगतान को किसी परियोजना/साइट से जोड़ें ताकि लागत सही ढंग से जुड़ती जाए।',
      ],
    },
  },
  {
    id: 'reports', icon: BarChart3,
    en: {
      title: 'Reports & Exports',
      steps: [
        'Open “Reports & Exports” for management-ready reports in Excel and PDF.',
        'On the Payments and Receipts pages, use the date filters (This Month, This FY, Custom) and then click Excel or PDF to export exactly what is shown.',
        'Vendor and client ledgers can be exported from their own pages.',
        'Anyone — including the Admin — can export. Exports never change your data.',
      ],
    },
    hi: {
      title: 'रिपोर्ट और निर्यात',
      steps: [
        'Excel और PDF में प्रबंधन-तैयार रिपोर्ट के लिए “रिपोर्ट और निर्यात” खोलें।',
        'भुगतान और प्राप्तियाँ पृष्ठों पर, दिनांक फ़िल्टर (इस माह, इस वित्त-वर्ष, कस्टम) का उपयोग करें और फिर जो दिख रहा है उसे ठीक वैसा ही निर्यात करने के लिए Excel या PDF पर क्लिक करें।',
        'विक्रेता और ग्राहक खाता-बही उनके अपने पृष्ठों से निर्यात की जा सकती हैं।',
        'कोई भी — एडमिन सहित — निर्यात कर सकता है। निर्यात आपके डेटा को कभी नहीं बदलता।',
      ],
    },
  },
  {
    id: 'publish', icon: CloudUpload,
    en: {
      title: 'Publish to Cloud',
      steps: [
        'Your data and files live on this computer, which keeps everything fast and private.',
        'When you have finished entering data, open “Data Management” and click “Publish to Cloud Now”.',
        'This sends only the data (not the heavy files) to the cloud, so the Admin can review everything on the web.',
        'You can publish as often as you like — each publish refreshes the cloud copy with the latest figures.',
      ],
    },
    hi: {
      title: 'क्लाउड पर प्रकाशित करें',
      steps: [
        'आपका डेटा और फ़ाइलें इसी कंप्यूटर पर रहती हैं, जिससे सब कुछ तेज़ और निजी रहता है।',
        'डेटा भरना पूरा होने पर, “डेटा प्रबंधन” खोलें और “अभी क्लाउड पर प्रकाशित करें” पर क्लिक करें।',
        'यह केवल डेटा (भारी फ़ाइलें नहीं) क्लाउड पर भेजता है, ताकि एडमिन वेब पर सब कुछ देख सके।',
        'आप जितनी बार चाहें प्रकाशित कर सकते हैं — हर प्रकाशन क्लाउड प्रति को नवीनतम आँकड़ों से ताज़ा कर देता है।',
      ],
    },
  },
  {
    id: 'roles', icon: ShieldCheck,
    en: {
      title: 'Roles & Who Can Do What',
      steps: [
        'Operator — does all daily data entry on this computer: adds payments, receipts, invoices, uploads proofs and statements, and publishes to the cloud.',
        'Admin — logs in on the web to view and export everything. To keep the free cloud fast, the Admin cannot run imports or uploads (those happen on the operator’s computer).',
        'Editor — the protected super-user with every power, plus the Data Management tools (Load Demo Data, Clear All Data).',
        'Everyone can export and view reports. Only the operator and editor can import/upload.',
      ],
    },
    hi: {
      title: 'भूमिकाएँ और कौन क्या कर सकता है',
      steps: [
        'ऑपरेटर — इसी कंप्यूटर पर सारा रोज़ाना डेटा भरता है: भुगतान, प्राप्तियाँ, चालान जोड़ता है, प्रमाण व विवरण अपलोड करता है, और क्लाउड पर प्रकाशित करता है।',
        'एडमिन — सब कुछ देखने और निर्यात करने के लिए वेब पर लॉगिन करता है। मुफ़्त क्लाउड को तेज़ रखने हेतु एडमिन आयात या अपलोड नहीं कर सकता (वे ऑपरेटर के कंप्यूटर पर होते हैं)।',
        'एडिटर — सुरक्षित सुपर-यूज़र, हर शक्ति के साथ, और डेटा प्रबंधन उपकरण (डेमो डेटा लोड करें, सारा डेटा हटाएँ)।',
        'हर कोई निर्यात कर सकता है और रिपोर्ट देख सकता है। केवल ऑपरेटर और एडिटर ही आयात/अपलोड कर सकते हैं।',
      ],
    },
  },
  {
    id: 'gst', icon: FileText,
    en: {
      title: 'GST Compliance — e-Invoice & e-Way Bill',
      steps: [
        'Open the "GST Compliance" section in the left menu. The workspace shows e-Invoices on one side and e-Way Bills on the other — they are separate legal documents.',
        'To raise an e-Invoice: click "New e-Invoice", fill the document, seller, buyer and item blocks (the buyer GSTIN has a "Check" button to validate it), then Save. If you leave the document number blank it is auto-numbered from the series.',
        'Open the draft, click "Validate", then "Submit → IRN". The system registers it and returns the IRN, acknowledgement number and signed QR code. Download the PDF or signed JSON anytime.',
        'To make an e-Way Bill: open an e-Invoice and use "Generate EWB from this invoice", or create one directly. Add Part B (vehicle / transport document) and click "Generate EWB".',
        'The top banner always tells you the mode: amber "SIMULATION" (safe practice — nothing is sent to the government) or red "LIVE".',
        'Use the Reconciliation Center, Alerts, Activity Log and API Health (under GST Compliance) to stay on top of mismatches, expiring e-way bills and failures.',
      ],
    },
    hi: {
      title: 'GST अनुपालन — e-Invoice और e-Way Bill',
      steps: [
        'बाएँ मेनू में "GST Compliance" खोलें। कार्यक्षेत्र एक ओर e-Invoice और दूसरी ओर e-Way Bill दिखाता है — ये अलग-अलग कानूनी दस्तावेज़ हैं।',
        'e-Invoice बनाने हेतु: "New e-Invoice" पर क्लिक करें, दस्तावेज़, विक्रेता, खरीदार और आइटम भरें (खरीदार GSTIN को जाँचने के लिए "Check" बटन है), फिर सहेजें। दस्तावेज़ संख्या खाली छोड़ने पर शृंखला से स्वतः नंबर मिलता है।',
        'ड्राफ्ट खोलें, "Validate" फिर "Submit → IRN" पर क्लिक करें। सिस्टम इसे दर्ज करता है और IRN, पावती संख्या व हस्ताक्षरित QR कोड लौटाता है। कभी भी PDF या signed JSON डाउनलोड करें।',
        'e-Way Bill बनाने हेतु: किसी e-Invoice से "Generate EWB" का उपयोग करें, या सीधे बनाएँ। Part B (वाहन / परिवहन दस्तावेज़) जोड़ें और "Generate EWB" पर क्लिक करें।',
        'ऊपर की पट्टी हमेशा मोड बताती है: एम्बर "SIMULATION" (सुरक्षित अभ्यास — सरकार को कुछ नहीं भेजा जाता) या लाल "LIVE"।',
        'बेमेल, समाप्त हो रहे e-way bill और विफलताओं पर नज़र रखने के लिए Reconciliation, Alerts, Activity Log और API Health का उपयोग करें।',
      ],
    },
  },
  {
    id: 'security', icon: ShieldCheck,
    en: {
      title: 'Security Verification (2-step) for sensitive actions',
      steps: [
        'Legally sensitive actions — cancelling an IRN or e-Way Bill, restoring a backup — require two-step verification.',
        'Step 1: re-enter your account password to confirm it is really you.',
        'Step 2: enter the verification code. In Simulation the code is shown on screen; in production it is emailed to your registered address.',
        'You get a limited number of tries; too many wrong codes temporarily lock the attempt. Every attempt (success or failure, with time and IP) is written to the permanent audit log.',
        'Maker-checker: the person who prepares a document is not the same person who submits or cancels it — that needs an Admin (checker).',
      ],
    },
    hi: {
      title: 'संवेदनशील कार्यों हेतु सुरक्षा सत्यापन (2-चरण)',
      steps: [
        'कानूनी रूप से संवेदनशील कार्य — IRN या e-Way Bill रद्द करना, बैकअप पुनर्स्थापित करना — दो-चरणीय सत्यापन माँगते हैं।',
        'चरण 1: यह पुष्टि करने हेतु कि यह वाकई आप हैं, अपना खाता पासवर्ड फिर से दर्ज करें।',
        'चरण 2: सत्यापन कोड दर्ज करें। Simulation में कोड स्क्रीन पर दिखता है; production में यह आपके पंजीकृत पते पर ईमेल किया जाता है।',
        'आपको सीमित प्रयास मिलते हैं; बहुत अधिक ग़लत कोड प्रयास को अस्थायी रूप से लॉक कर देते हैं। हर प्रयास (सफल या असफल, समय व IP सहित) स्थायी ऑडिट लॉग में दर्ज होता है।',
        'Maker-checker: जो दस्तावेज़ तैयार करता है वही उसे जमा या रद्द नहीं करता — इसके लिए एडमिन (चेकर) चाहिए।',
      ],
    },
  },
  {
    id: 'gstterms', icon: FileText,
    en: {
      title: 'GST terms explained (plain language)',
      steps: [
        'GSTIN — the 15-character GST registration number of a business. The first 2 digits are the state; the system checks its format and check-digit.',
        'HSN — the product/service code that decides the tax rate. Goods invoices for turnover above ₹5 crore must use at least a 6-digit HSN.',
        'e-Invoice — a regular invoice that has been registered with the government portal (the IRP).',
        'IRP — the Invoice Registration Portal that registers e-invoices and returns the IRN.',
        'IRN — the unique Invoice Reference Number the IRP gives back, along with an acknowledgement number and a signed QR code. It is the legal proof of registration.',
        'e-Way Bill — a separate transport document required when goods move. It has two parts.',
        'Part A — the supply/invoice details (who, what, value). Part B — the transport details (vehicle number, or transport document for rail/air/ship).',
        'GSP — a GST Suvidha Provider: the licensed channel through which software talks to the government portals in Live mode.',
        'Maker-Checker — the person who prepares a document (maker/operator) is not the one who submits or cancels it (checker/admin). This prevents mistakes and fraud.',
        'Audit Mode — a read-only login for auditors: they can view and export everything but cannot change anything.',
        'Simulation vs Live — Simulation practises everything safely with no real government submission; Live submits real compliance data. The banner at the top always tells you which mode you are in.',
      ],
    },
    hi: {
      title: 'GST शब्द सरल भाषा में',
      steps: [
        'GSTIN — किसी व्यवसाय का 15-अक्षर का GST पंजीकरण नंबर। पहले 2 अंक राज्य हैं; सिस्टम इसका प्रारूप व चेक-डिजिट जाँचता है।',
        'HSN — उत्पाद/सेवा कोड जो कर दर तय करता है। ₹5 करोड़ से ऊपर टर्नओवर के माल चालान में कम-से-कम 6-अंकीय HSN आवश्यक है।',
        'e-Invoice — एक सामान्य चालान जो सरकारी पोर्टल (IRP) पर पंजीकृत हो चुका है।',
        'IRP — Invoice Registration Portal, जो e-invoice पंजीकृत करता है और IRN लौटाता है।',
        'IRN — IRP द्वारा दिया गया अनूठा Invoice Reference Number, पावती संख्या व हस्ताक्षरित QR कोड सहित — पंजीकरण का कानूनी प्रमाण।',
        'e-Way Bill — माल परिवहन के समय आवश्यक एक अलग दस्तावेज़, जिसके दो भाग होते हैं।',
        'Part A — आपूर्ति/चालान विवरण; Part B — परिवहन विवरण (वाहन संख्या, या रेल/वायु/जहाज़ हेतु परिवहन दस्तावेज़)।',
        'GSP — GST Suvidha Provider: Live मोड में सॉफ़्टवेयर जिसके माध्यम से सरकारी पोर्टल से बात करता है।',
        'Maker-Checker — जो दस्तावेज़ तैयार करता है (ऑपरेटर) वही उसे जमा/रद्द नहीं करता (एडमिन)। यह ग़लती व धोखाधड़ी रोकता है।',
        'Audit Mode — ऑडिटर हेतु केवल-पठन लॉगिन: सब देख व निर्यात कर सकते हैं, बदल नहीं सकते।',
        'Simulation बनाम Live — Simulation सब कुछ सुरक्षित अभ्यास कराता है, कोई वास्तविक सरकारी प्रस्तुति नहीं; Live वास्तविक डेटा भेजता है। ऊपर की पट्टी हमेशा मोड बताती है।',
      ],
    },
  },
  {
    id: 'troubleshooting', icon: Search,
    en: {
      title: 'Fixing common errors',
      steps: [
        'App won’t open / blank page: make sure the engine is running — double-click "Start ARRAYS ERP", or open http://localhost:4000. If still stuck, restart the computer (PostgreSQL starts automatically).',
        '"Internal server error" on upload: the file type or size may be unsupported — use PDF, image, or Excel/CSV under the size limit. Re-try; the error detail names the cause.',
        'Invoice won’t submit: click "Validate" first — every red error must be fixed. Common ones: invalid GSTIN (use the Check button), HSN must be 6-digit for turnover above ₹5 cr, item or value missing.',
        '"Duplicate document number": that number already exists in this branch. Use a different number, or confirm the override with a reason.',
        'e-Way Bill rejected: road transport needs a valid vehicle number; rail/air/ship need a transport document number and date. Distance must be 0–4000 km.',
        '"Security verification required": this action needs the 2-step password + code. Complete it to proceed.',
        'Admin can’t see Import/Upload buttons: that is by design — imports run on the operator’s computer to keep the cloud fast. Use the operator login for data entry.',
        'Check the Diagnostics page (admin) — it tells you instantly if the database, storage, backup, adapter or any engine has a problem, with a recommended fix.',
      ],
    },
    hi: {
      title: 'सामान्य त्रुटियाँ ठीक करना',
      steps: [
        'ऐप नहीं खुल रहा / खाली पृष्ठ: सुनिश्चित करें कि इंजन चल रहा है — "Start ARRAYS ERP" डबल-क्लिक करें, या http://localhost:4000 खोलें। फिर भी अटके तो कंप्यूटर पुनः चालू करें (PostgreSQL स्वतः शुरू होता है)।',
        'अपलोड पर "Internal server error": फ़ाइल प्रकार/आकार असमर्थित हो सकता है — सीमा के भीतर PDF, छवि, या Excel/CSV उपयोग करें। पुनः प्रयास करें; त्रुटि विवरण कारण बताता है।',
        'चालान जमा नहीं हो रहा: पहले "Validate" करें — हर लाल त्रुटि ठीक करनी होगी। आम: अमान्य GSTIN (Check बटन), ₹5 करोड़ से ऊपर टर्नओवर पर HSN 6-अंकीय आवश्यक, आइटम/मूल्य गायब।',
        '"Duplicate document number": यह संख्या इस शाखा में पहले से है। अलग संख्या उपयोग करें, या कारण सहित ओवरराइड पुष्टि करें।',
        'e-Way Bill अस्वीकृत: सड़क परिवहन को वैध वाहन संख्या चाहिए; रेल/वायु/जहाज़ को परिवहन दस्तावेज़ संख्या व दिनांक। दूरी 0–4000 किमी होनी चाहिए।',
        '"Security verification required": इस कार्य हेतु 2-चरण पासवर्ड + कोड चाहिए। आगे बढ़ने के लिए पूरा करें।',
        'एडमिन को Import/Upload बटन नहीं दिखते: यह जानबूझकर है — आयात ऑपरेटर के कंप्यूटर पर चलते हैं ताकि क्लाउड तेज़ रहे। डेटा प्रविष्टि हेतु ऑपरेटर लॉगिन उपयोग करें।',
        'Diagnostics पृष्ठ (एडमिन) देखें — यह तुरंत बताता है कि डेटाबेस, स्टोरेज, बैकअप, एडाप्टर या किसी इंजन में समस्या है या नहीं, सुझाए गए समाधान सहित।',
      ],
    },
  },
  {
    id: 'language', icon: Languages,
    en: {
      title: 'Changing the Language',
      steps: [
        'Click the language button (EN / हिं) at the top-right of any screen.',
        'The entire app instantly switches between English and Hindi — menus, buttons, labels and tables.',
        'Your choice is remembered the next time you open the app, so language is never a barrier.',
      ],
    },
    hi: {
      title: 'भाषा बदलना',
      steps: [
        'किसी भी स्क्रीन के ऊपर-दाईं ओर भाषा बटन (EN / हिं) पर क्लिक करें।',
        'पूरा ऐप तुरंत अंग्रेज़ी और हिंदी के बीच बदल जाता है — मेनू, बटन, लेबल और तालिकाएँ।',
        'अगली बार ऐप खोलने पर आपकी पसंद याद रखी जाती है, ताकि भाषा कभी बाधा न बने।',
      ],
    },
  },
];

export default function Help() {
  const { lang } = useI18n();
  const [q, setQ] = useState('');
  const isHi = lang === 'hi';

  const query = q.trim().toLowerCase();
  const visible = SECTIONS.filter((s) => {
    if (!query) return true;
    const c = s[isHi ? 'hi' : 'en'];
    return (
      c.title.toLowerCase().includes(query) ||
      c.steps.some((st) => st.toLowerCase().includes(query))
    );
  });

  return (
    <div>
      <PageHeader
        title={isHi ? 'सहायता और उपयोगकर्ता मार्गदर्शिका' : 'Help & User Guide'}
        subtitle={
          isHi
            ? 'सरल चरणों में हर सुविधा की पूरी मार्गदर्शिका। ऊपर की पट्टी से भाषा बदलें (EN / हिं)।'
            : 'A complete guide to every feature, in simple steps. Switch the language from the top bar (EN / हिं).'
        }
      />

      {/* Search */}
      <Card className="mb-4 !p-3">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder={isHi ? 'सहायता में खोजें…' : 'Search help…'}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            data-no-i18n
          />
        </div>
      </Card>

      {/* Quick links */}
      {!query && (
        <div className="mb-5 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <s.icon size={13} /> {s[isHi ? 'hi' : 'en'].title}
            </a>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {visible.map((s) => {
          const c = s[isHi ? 'hi' : 'en'];
          return (
            <Card key={s.id} id={s.id} className="scroll-mt-20">
              <div className="flex items-start gap-4">
                <div className="shrink-0 rounded-xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-900/30">
                  <s.icon size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{c.title}</h3>
                  <ol className="mt-3 space-y-2">
                    {c.steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </Card>
          );
        })}
        {visible.length === 0 && (
          <Card><p className="text-center text-sm text-slate-400">{isHi ? 'कोई परिणाम नहीं मिला।' : 'No matching help topics.'}</p></Card>
        )}
      </div>
    </div>
  );
}
