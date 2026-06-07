// ============================================
// FIRST-AID GUIDE — offline, static, free.
// Simple Hindi steps for common rural emergencies. Always 108 alongside.
// Content follows standard first-aid (Red Cross / WHO) guidance.
// ============================================

export type FirstAid = {
  id: string;
  icon: string;
  title: string;
  when: string;       // kab — recognise it
  call108: boolean;   // is this a call-108 emergency
  steps: string[];    // YEH KAREIN
  donts: string[];    // YEH NA KAREIN
};

export const FIRST_AID: FirstAid[] = [
  {
    id: "heart-attack", icon: "❤️", title: "Heart Attack / Seene mein dard", call108: true,
    when: "Seene ke beech mein dard/dabav, baayein haath/jabde tak failta dard, paseena, saans phoolna, ghabrahat.",
    steps: [
      "TURANT 108 call karein.",
      "Patient ko aaram se bithayein (ardha-leta), tang kapde dheele karein.",
      "Patient ko hilne-dulne na dein, shaant rakhein.",
      "Agar behosh ho aur saans na ho — CPR shuru karein (seene ke beech zor se dabayein, 100/min).",
    ],
    donts: ["Akele gaadi mat chalane dein.", "Khana-paani mat dein.", "Bina doctor ke koi dawai mat dein."],
  },
  {
    id: "choking", icon: "😮", title: "Dam Ghutna (Choking)", call108: true,
    when: "Kuch gale mein atak gaya — bol/saans nahi paa raha, gala pakad raha, chehra neela.",
    steps: [
      "Peeche se kamar pe jhuka kar kandhon ke beech 5 baar zor se thapki (back blows) dein.",
      "Phir peeche se pet ke upar (naabhi ke upar) dono haath se 5 baar andar-upar dabayein (Heimlich).",
      "Back blows aur Heimlich baari-baari dohrayein jab tak cheez nikle.",
      "Behosh ho jaaye toh CPR shuru karein aur 108 call karein.",
    ],
    donts: ["Ungli daal kar cheez nikalne ki koshish mat karo (aur andar ja sakti hai).", "Choti bachche ke liye alag tareeka — sir neeche jhuka kar peeth thapki."],
  },
  {
    id: "bleeding", icon: "🩸", title: "Tej Khoon Behna", call108: true,
    when: "Gehra zakhm, khoon ruk nahi raha, bahut zyada beh raha.",
    steps: [
      "Saaf kapde/patti se zakhm par SEEDHA zor se dabayein.",
      "Khoon na ruke toh aur kapda upar rakh kar dabate rahein.",
      "Zakhm wale hisse ko dil se upar uthayein.",
      "108 call karein / hospital le jayein.",
    ],
    donts: ["Zakhm mein dhansi cheez (chaaku/kaanch) mat nikalo — uske aaspaas dabao.", "Tourniquet (kas kar baandhna) sirf last option — galat se nuksan."],
  },
  {
    id: "burns", icon: "🔥", title: "Jal Jaana (Burns)", call108: false,
    when: "Aag, garam paani/tel, bijli se jali twacha.",
    steps: [
      "Jali jagah ko 15-20 minute THANDE BEHTE PAANI ke neeche rakhein.",
      "Ring/chudi/tang kapde sujan se pehle nikaal dein.",
      "Saaf, geela kapda dhakein.",
      "Badi/gehri jali ho ya chehra/haath ho toh hospital jayein.",
    ],
    donts: ["Toothpaste, ghee, tel, haldi, ice MAT lagayein.", "Chhaale mat phodo."],
  },
  {
    id: "snakebite", icon: "🐍", title: "Saanp Kaatna", call108: true,
    when: "Saanp ne kaata — do dant ke nishan, dard, sujan, ghabrahat.",
    steps: [
      "Patient ko BILKUL shaant aur sthir rakhein (zyada hilne se zeher failta hai).",
      "Kaate gaye hisse ko dil se NEECHE aur sthir rakhein.",
      "Tang cheezein (ring, ghadi, chudi) nikaal dein.",
      "TURANT hospital le jayein — antivenom wahin milta hai.",
    ],
    donts: ["Zakhm KAATO mat, chuso mat, jalao mat.", "Kas kar mat baandho (tourniquet).", "Jhaad-phoonk mein time mat ganwao."],
  },
  {
    id: "fainting", icon: "😵", title: "Behoshi (Fainting)", call108: false,
    when: "Achanak gir gaya / behosh ho gaya par saans chal rahi hai.",
    steps: [
      "Seedha litayein, pair thode upar uthayein.",
      "Tang kapde dheele karein, hawa aane dein.",
      "Saans check karein — agar na ho toh CPR + 108.",
      "Hosh aane par dheere uthayein, paani pilayein.",
    ],
    donts: ["Munh par paani mat maaro/thappad mat maaro.", "Turant uthane/khilane ki koshish mat karo."],
  },
  {
    id: "seizure", icon: "⚡", title: "Mirgi / Daura (Seizure)", call108: false,
    when: "Body akad kar jhatke aana, behoshi, munh se jhaag.",
    steps: [
      "Aaspaas se chot wali cheezein hatayein, sir ke neeche narm cheez rakhein.",
      "Patient ko karwat (side) par karein taaki saans aur ulti nikal sake.",
      "Daura kitni der chala — time dekhein.",
      "5 minute se zyada chale ya baar-baar aaye toh 108 call karein.",
    ],
    donts: ["Munh mein ungli/chamach/kuch MAT daalo.", "Jhatkon ko zabardasti roko mat.", "Daure ke time paani/dawai mat do."],
  },
  {
    id: "heatstroke", icon: "🥵", title: "Loo / Heat Stroke", call108: true,
    when: "Tez garmi mein tej bukhar, sookhi garam twacha, chakkar, behoshi, confusion.",
    steps: [
      "Turant chhaya/thandi jagah le jayein.",
      "Kapde dheele karein, body par thanda paani/geela kapda lagayein, hawa karein.",
      "Hosh mein ho toh thoda-thoda paani/ORS pilayein.",
      "Behoshi/confusion ho toh 108 call karein.",
    ],
    donts: ["Behosh insaan ko kuch pilane ki koshish mat karo.", "Bahut thanda (ice) ek dam mat lagao gardan/seene par."],
  },
  {
    id: "poisoning", icon: "☠️", title: "Zeher / Poisoning", call108: true,
    when: "Dawai/keetnashak/zehrila cheez kha-pee li, ulti, behoshi, jalan.",
    steps: [
      "108 / zeher helpline call karein.",
      "Jo cheez khayi uska packet/bottle saath rakhein — doctor ko dikhane ke liye.",
      "Behosh ho toh karwat par litayein.",
      "Hosh mein ho aur helpline kahe tabhi kuch dein.",
    ],
    donts: ["KHUD se ulti karane ki koshish mat karo (jab tak helpline na kahe).", "Doodh/paani turant mat do bina poochhe."],
  },
];
