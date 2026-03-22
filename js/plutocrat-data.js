/* PLUTOCRAT v11 — plutocrat-data.js */
/* Layer 1 — Pure Data. No DOM. No logic. No state mutation. */

'use strict';

/* ─── LOCATION DATA ─── */
var LDATA={
  US:{currency:'$',country:'USA',city:'USA',
    housing:[
      {id:'shared',name:'Shared apartment',cost:600,desc:'Roommates.',perk:''},
      {id:'studio',name:'Studio apartment',cost:1200,desc:'Own space.',perk:''},
      {id:'one_bed',name:'1-bedroom',cost:2000,desc:'Decent area.',perk:''},
      {id:'two_bed',name:'2-bedroom',cost:3200,desc:'Good area.',perk:'Unlocks professional network'},
      {id:'luxury_apt',name:'Luxury apartment',cost:6000,desc:'Prime location.',perk:'Unlocks HNI opportunities'},
      {id:'house',name:'Own house',cost:12000,desc:'Mortgage.',perk:'Unlocks elite events'}
    ],
    groceries:[
      {id:'walmart',name:'Walmart',cost:300,desc:'Budget essentials.'},
      {id:'kroger',name:'Kroger',cost:500,desc:'Mid-range.'},
      {id:'wholefoods',name:'Whole Foods',cost:900,desc:'Premium organic.'},
      {id:'delivery',name:'Premium delivery',cost:1500,desc:'Convenience + premium.'}
    ]
  },
  AU:{currency:'A$',country:'Australia',city:'Australia',
    housing:[
      {id:'shared',name:'Share house',cost:700,desc:'Housemates.',perk:''},
      {id:'studio',name:'Studio apartment',cost:1400,desc:'Own space.',perk:''},
      {id:'one_bed',name:'1-bedroom',cost:2200,desc:'Good suburb.',perk:''},
      {id:'two_bed',name:'2-bedroom',cost:3500,desc:'Prime suburb.',perk:'Unlocks professional network'},
      {id:'luxury_apt',name:'Luxury apartment',cost:7000,desc:'City centre.',perk:'Unlocks HNI opportunities'},
      {id:'house',name:'House',cost:15000,desc:'Mortgage.',perk:'Unlocks elite events'}
    ],
    groceries:[
      {id:'aldi',name:'Aldi',cost:200,desc:'Budget value.'},
      {id:'woolworths',name:'Woolworths',cost:400,desc:'Mid-range.'},
      {id:'harris',name:'Harris Farm',cost:900,desc:'Premium fresh.'}
    ]
  },
  GB:{currency:'£',country:'UK',city:'UK',
    housing:[
      {id:'shared',name:'Shared house',cost:500,desc:'Flatmates.',perk:''},
      {id:'studio',name:'Studio flat',cost:900,desc:'Own space.',perk:''},
      {id:'one_bed',name:'1-bed flat',cost:1400,desc:'Good borough.',perk:''},
      {id:'two_bed',name:'2-bed flat',cost:2200,desc:'Prime location.',perk:'Unlocks professional network'},
      {id:'luxury_apt',name:'Luxury flat',cost:5000,desc:'Prime London.',perk:'Unlocks HNI opportunities'},
      {id:'house',name:'House',cost:10000,desc:'Statement.',perk:'Unlocks elite events'}
    ],
    groceries:[
      {id:'lidl',name:'Lidl / Aldi',cost:150,desc:'Budget value.'},
      {id:'tesco',name:'Tesco',cost:280,desc:'Mid-range.'},
      {id:'waitrose',name:'Waitrose',cost:500,desc:'Premium.'},
      {id:'harrods',name:'Harrods Food Hall',cost:1200,desc:'Ultra premium.'}
    ]
  },
  SG:{currency:'S$',country:'Singapore',city:'Singapore',
    housing:[
      {id:'hdb_shared',name:'HDB shared room',cost:700,desc:'Shared HDB flat.',perk:''},
      {id:'hdb_flat',name:'HDB flat',cost:2500,desc:'Own HDB unit.',perk:''},
      {id:'condo',name:'Condominium',cost:5000,desc:'Private condo.',perk:'Unlocks professional network'},
      {id:'luxury_condo',name:'Luxury condo',cost:10000,desc:'Prime district.',perk:'Unlocks HNI opportunities'},
      {id:'landed',name:'Landed property',cost:25000,desc:'Statement.',perk:'Unlocks elite events'}
    ],
    groceries:[
      {id:'ntuc',name:'NTUC FairPrice',cost:300,desc:'Everyday essentials.'},
      {id:'cold_storage',name:'Cold Storage',cost:900,desc:'Premium quality.'},
      {id:'marketplace',name:'The Market Place',cost:1800,desc:'Gourmet premium.'}
    ]
  },
  AE:{currency:'AED',country:'UAE',city:'UAE',
    housing:[
      {id:'shared',name:'Shared accommodation',cost:1500,desc:'Shared villa or flat.',perk:''},
      {id:'studio',name:'Studio apartment',cost:3000,desc:'Own space.',perk:''},
      {id:'one_bed',name:'1-bedroom',cost:5000,desc:'Decent community.',perk:''},
      {id:'two_bed',name:'2-bedroom',cost:8000,desc:'Good area.',perk:'Unlocks professional network'},
      {id:'luxury_apt',name:'Luxury apartment',cost:18000,desc:'Marina or Downtown.',perk:'Unlocks HNI opportunities'},
      {id:'villa',name:'Villa',cost:40000,desc:'Statement.',perk:'Unlocks elite events'}
    ],
    groceries:[
      {id:'lulu',name:'LuLu Hypermarket',cost:600,desc:'Value essentials.'},
      {id:'carrefour',name:'Carrefour',cost:900,desc:'Mid-range.'},
      {id:'waitrose',name:'Waitrose UAE',cost:1800,desc:'Premium.'},
      {id:'gourmet',name:'Gourmet Gulf',cost:3500,desc:'Ultra premium.'}
    ]
  },
  IN:{currency:'₹',country:'India',city:'India',
    housing:[
      {id:'chawl',name:'Chawl / shared room',cost:4000,desc:'Bare minimum.',perk:''},
      {id:'budget_flat',name:'Budget 1BHK',cost:8000,desc:'Small flat in outskirts.',perk:''},
      {id:'mid_flat',name:'Mid-range 2BHK',cost:15000,desc:'Decent locality.',perk:''},
      {id:'premium_flat',name:'Premium apartment',cost:28000,desc:'Gated society.',perk:'Unlocks upper-middle client events'},
      {id:'luxury_apt',name:'Luxury high-rise',cost:55000,desc:'Prime location.',perk:'Unlocks HNI opportunities'},
      {id:'villa',name:'Villa / bungalow',cost:100000,desc:'Statement property.',perk:'Unlocks elite network events'}
    ],
    groceries:[
      {id:'kirana',name:'Local kirana',cost:2000,desc:'Basic necessities only.'},
      {id:'dmart',name:'D-Mart',cost:4000,desc:'Value for money.'},
      {id:'reliance',name:'Reliance Fresh',cost:7000,desc:'Better quality.'},
      {id:'premium',name:"Nature's Basket",cost:14000,desc:'Organic, premium imports.'}
    ]
  }
};

var MANUAL_LOCS=[
  {code:'US',label:'USA',cur:'$'},
  {code:'AU',label:'Australia',cur:'A$'},
  {code:'GB',label:'UK',cur:'£'},
  {code:'SG',label:'Singapore',cur:'S$'},
  {code:'AE',label:'UAE',cur:'AED'},
  {code:'IN',label:'India',cur:'₹'}
];

/* ─── PROFILES ─── */
var PROFILES=[
  {id:'employee',name:'Employee',tag:'Safe but stuck',badge:'bwarn',badgeText:'Trapped',
   cash:150000,timeUsed:18,salaryBase:45000,taxRate:30,
   desc:'Stable salary. Zero assets. Your financial life depends on one employer.',
   unique:'Each month you skip buying assets, salary grows. The golden handcuff tightens.'},
  {id:'selfemployed',name:'Self-employed',tag:'Golden cage',badge:'bwarn',badgeText:'Hard mode',
   cash:240000,timeUsed:20,salaryBase:80000,taxRate:25,
   desc:'High income. No time. No assets. You are the business. You stop — it stops.',
   unique:'If time used drops below 16, earn bonus income each month. Delegation pays.'},
  {id:'inheritor',name:'Inheritor',tag:'Head start, no skills',badge:'bgold',badgeText:'Easy start',
   cash:100000,timeUsed:10,salaryBase:30000,taxRate:20,
   desc:'One passive stream inherited. Time available. Zero business instinct.',
   unique:'Starts with a family property generating passive income.'},
  {id:'dealmaker',name:'Dealmaker',tag:'Highest ceiling',badge:'bblue',badgeText:'Expert',
   cash:0,timeUsed:8,salaryBase:0,taxRate:15,
   desc:'Zero cash. Maximum leverage. You make money connecting value — not owning it.',
   unique:'45+ real-world deal types. Reputation is your balance sheet.'}
];

/* ─── SALARY TRAP QUOTES ─── */
var SALARY_TRAP_QUOTES=[
  'Your employer owns 8 hours of your day. Every single day. Forever — until you decide otherwise.',
  'A salary is the price your employer pays to own your most productive hours.',
  'You traded time for money. The problem: you cannot get the time back.',
  'Your income stopped the moment you stopped. That is not wealth. That is a wage.',
  'The salary feels safe. That feeling is the trap.',
  'You are one decision — your employer\'s decision — from zero income.',
  'Every month you collect a salary without buying assets, the handcuff tightens.',
  'Comfort is the enemy of freedom. The salary provides comfort. Nothing more.',
  'Your employer is getting rich from your time. Are you?',
  'The golden handcuff: paid well enough to stay, not enough to leave.',
  'Security is an illusion. The only real security is income that does not require your presence.',
  'You work hard. Your assets should work harder.'
];

/* ─── ASSET DEFINITIONS ─── */
var ASSET_DEFS=[
  {id:'index_fund',name:'Index fund',bucket:'cf',cost:50000,income:3000,expense:200,time:0,type:'investment',repeatable:true,
   sellVal:function(a){return Math.round(sc(50000)*(1+(a.monthsOwned||0)*0.005));},
   desc:'Pure passive. Stack for compounding. Money works 24/7 without you.'},
  {id:'rental',name:'Rental property',bucket:'cf',cost:200000,income:15000,expense:3500,time:1,type:'real estate',repeatable:true,
   sellVal:function(a){return Math.round(sc(200000)*(1+(a.monthsOwned||0)*0.008));},
   desc:'Rental income minus maintenance, tax and insurance. Tenant pays your mortgage.'},
  {id:'franchise',name:'Franchise unit',bucket:'eq',cost:300000,income:25000,expense:6000,time:0,type:'business',repeatable:true,
   sellVal:function(a){return Math.round(sc(300000)*(1+(a.monthsOwned||0)*0.004));},
   desc:'System built. You own a proven machine. Royalty and ops costs deducted monthly.'},
  {id:'stocks',name:'Stock portfolio',bucket:'ap',cost:80000,income:5500,expense:300,time:0,type:'investment',repeatable:true,
   sellVal:function(a){return Math.round(sc(80000)*(1+(a.monthsOwned||0)*0.006));},
   desc:'Dividends plus capital appreciation. Ownership in real businesses.'},
  {id:'license_ip',name:'License your IP',bucket:'cf',cost:40000,income:8000,expense:500,time:0,type:'passive',repeatable:false,
   sellVal:function(){return sc(40000);},
   desc:'Create once. License forever. Royalties minus platform and legal fees.'},
  {id:'p2p',name:'P2P lending',bucket:'cf',cost:30000,income:2500,expense:100,time:0,type:'investment',repeatable:true,
   sellVal:function(){return sc(30000);},
   desc:'Your money lends to borrowers. Interest income minus platform fee.'},
  {id:'etf',name:'Dividend ETF',bucket:'ap',cost:60000,income:4000,expense:150,time:0,type:'investment',repeatable:true,
   sellVal:function(a){return Math.round(sc(60000)*(1+(a.monthsOwned||0)*0.005));},
   desc:'Diversified ownership. Quarterly dividends. Low expense ratio.'},
  {id:'content',name:'Content channel',bucket:'eq',cost:20000,income:5000,expense:1200,time:2,type:'business',repeatable:false,
   sellVal:function(){return sc(20000);},
   desc:'Build once. Audience generates revenue. Ad income minus hosting and tools.'},
  {id:'hire_mgr',name:'Hire manager / PA',bucket:'dl',cost:0,income:0,expense:0,time:-3,type:'delegation',repeatable:false,
   sellVal:function(){return 0;},
   desc:'Automates all income and expense handling. Frees 3 time units. Reduces tax rate by 5%. Costs recruitment fee + monthly salary.'},
  {id:'build_sop',name:'Build systems (SOP)',bucket:'dl',cost:30000,income:0,expense:2000,time:-2,type:'delegation',repeatable:false,
   sellVal:function(){return 0;},
   desc:'Document everything. 2 time units freed permanently. Reduces tax rate by 5%. Small monthly maintenance cost.'}
];

/* ─── BUCKET INFO ─── */
var BUCKET_INFO={
  cf:{label:'Cashflow',cls:'bucket-cf',tagCls:'tag-cf',desc:'Pays you every month regardless of market conditions. The plutocrat\'s foundation.'},
  ap:{label:'Appreciation',cls:'bucket-ap',tagCls:'tag-ap',desc:'Grows in value over time. Sell higher than you bought. Wealth compounds silently.'},
  eq:{label:'Equity',cls:'bucket-eq',tagCls:'tag-eq',desc:'You own a system, not a job. The business runs without your daily presence.'},
  dl:{label:'Delegation',cls:'bucket-dl',tagCls:'tag-del',desc:'Buy back your time. The wealthy don\'t do — they direct.'}
};

/* ─── LIABILITIES ─── */
var LIABILITIES=[
  {id:'budget_car',name:'Budget car',cost:200000,monthly:8000,type:'lifestyle',desc:'Basic transport.',perk:'',exitValue:0.30},
  {id:'luxury_car',name:'Luxury car',cost:800000,monthly:25000,type:'status',desc:'Signals status.',perk:'Unlocks HNI client opportunities',exitValue:0.30},
  {id:'wardrobe',name:'Premium wardrobe',cost:50000,monthly:5000,type:'status',desc:'Dress for the clients you want.',perk:'Unlocks luxury deal opportunities',exitValue:0},
  {id:'club_member',name:'Club membership',cost:100000,monthly:8000,type:'status',desc:'Exclusive circles.',perk:'Unlocks elite network events',exitValue:0},
  {id:'gadgets',name:'Latest gadgets',cost:80000,monthly:3000,type:'lifestyle',desc:'Depreciates fast.',perk:'',exitValue:0},
  {id:'fine_dining',name:'Fine dining habit',cost:0,monthly:15000,type:'status',desc:'Build relationships over meals.',perk:'Unlocks high-value partnerships',exitValue:0}
];

var TEMPTATION_LIABILITIES=[
  {id:'budget_car',name:'Budget car',monthly:8000},
  {id:'gadgets',name:'Latest gadgets',monthly:3000},
  {id:'fine_dining',name:'Fine dining habit',monthly:15000},
  {id:'wardrobe',name:'Premium wardrobe',monthly:5000}
];

/* ─── WIN CONDITIONS ─── */
var WINS=[
  {tier:1,crown:'◈',label:'Tier I',title:'Rat race escaped',desc:'Net passive income covers all expenses. You no longer need to work. Work is now a choice — not a sentence.'},
  {tier:2,crown:'◉',label:'Tier II',title:'Legacy portfolio built',desc:'Total wealth crossed a major milestone. Generational wealth begins here.'},
  {tier:3,crown:'✦',label:'Tier III',title:'Leisure class achieved',desc:'Zero time required. Income still flows. Complete freedom from both time anxiety and money anxiety.'},
  {tier:4,crown:'★',label:'Tier IV',title:'Plutocrat legacy',desc:'Passive income sustained 3x expenses for 3 consecutive months. You have crossed into the leisure class permanently.'}
];

/* ─── DEALS (45 across 14 categories) ─── */
var DEALS=[
  {id:'d1',cat:'Telecom',name:'Airvoice tower lease',desc:'Airvoice needs tower sites. You know landowners. Broker the lease.',repReq:0,time:1,min:20000,max:50000,rate:0.80,prereq:[]},
  {id:'d2',cat:'Telecom',name:'Conecta distributor deal',desc:'Conecta Mobile expanding. Onboard distributors. Take margin.',repReq:1,time:2,min:35000,max:70000,rate:0.75,prereq:[]},
  {id:'d3',cat:'Telecom',name:'Signalplus retail franchise',desc:'Source franchisees for Signalplus. Take 20% fee.',repReq:3,time:2,min:60000,max:120000,rate:0.70,prereq:['d1','d2']},
  {id:'d4',cat:'Real Estate',name:'Property flip (OPM)',desc:'Find undervalued property. Bring investor capital. Take carry.',repReq:0,time:2,min:30000,max:80000,rate:0.75,prereq:[]},
  {id:'d5',cat:'Real Estate',name:'Commercial lease brokering',desc:'Find tenants for empty spaces. Take 2 months brokerage.',repReq:1,time:1,min:25000,max:60000,rate:0.80,prereq:[]},
  {id:'d6',cat:'Real Estate',name:'Land banking syndicate',desc:'Pool investors to buy land near expansion zones.',repReq:4,time:3,min:80000,max:200000,rate:0.65,prereq:['d4','d5']},
  {id:'d7',cat:'Real Estate',name:'REIT structuring',desc:'Structure a real estate investment trust. Requires 3 real estate deals done.',repReq:6,time:4,min:150000,max:350000,rate:0.60,prereq:['d4','d5','d6']},
  {id:'d8',cat:'Food and Beverage',name:'Burger Palace franchise deal',desc:'Find franchisee operators in new cities. Take 25% of fee.',repReq:2,time:2,min:50000,max:100000,rate:0.75,prereq:[]},
  {id:'d9',cat:'Food and Beverage',name:'Coffee Crown licensing',desc:'Source licensed kiosk operators. Take broker fee.',repReq:2,time:2,min:40000,max:90000,rate:0.78,prereq:[]},
  {id:'d10',cat:'Food and Beverage',name:'SpiceRoute cloud kitchen JV',desc:'Structure JV for cloud kitchen partners in metros.',repReq:3,time:3,min:60000,max:140000,rate:0.70,prereq:['d8','d9']},
  {id:'d11',cat:'Food and Beverage',name:'FarmFresh distribution deal',desc:'Onboard distributors for FarmFresh organic brand.',repReq:1,time:1,min:20000,max:55000,rate:0.80,prereq:[]},
  {id:'d12',cat:'Technology',name:'SaaSBridge licensing deal',desc:'Close 3 enterprise deals. Take 15% of contract value.',repReq:2,time:2,min:45000,max:110000,rate:0.72,prereq:[]},
  {id:'d13',cat:'Technology',name:'AppNest acqui-hire',desc:'Find a startup for AppNest to acquire for talent.',repReq:4,time:3,min:100000,max:250000,rate:0.62,prereq:['d12','d14']},
  {id:'d14',cat:'Technology',name:'CloudStack reseller deal',desc:'Onboard resellers in new markets.',repReq:2,time:2,min:30000,max:80000,rate:0.75,prereq:[]},
  {id:'d15',cat:'Technology',name:'DataVault angel round',desc:'Syndicate seed round. Requires 2 tech deals done. Take 2% fee plus 15% carry.',repReq:5,time:3,min:120000,max:300000,rate:0.60,prereq:['d12','d14']},
  {id:'d16',cat:'Manufacturing',name:'SupplyLink OEM deal',desc:'Match SupplyLink with factories. Take broker margin.',repReq:1,time:2,min:30000,max:70000,rate:0.75,prereq:[]},
  {id:'d17',cat:'Manufacturing',name:'ExportBridge trade deal',desc:'Connect to international buyers. Take 10% commission.',repReq:3,time:2,min:50000,max:120000,rate:0.68,prereq:['d16']},
  {id:'d18',cat:'Manufacturing',name:'PackRight supply contract',desc:'Structure packaging supply contract. Take finder fee.',repReq:1,time:1,min:20000,max:50000,rate:0.82,prereq:[]},
  {id:'d19',cat:'Media',name:'ViralVault content syndication',desc:'License content to platforms. Take 20% of licensing fee.',repReq:2,time:2,min:35000,max:80000,rate:0.72,prereq:[]},
  {id:'d20',cat:'Media',name:'StreamNow distribution deal',desc:'Close OTT distribution deal for indie film.',repReq:3,time:2,min:60000,max:150000,rate:0.65,prereq:['d19']},
  {id:'d21',cat:'Media',name:'PrintPulse IP licensing',desc:'Structure brand licensing deal for magazine events.',repReq:2,time:1,min:25000,max:65000,rate:0.75,prereq:[]},
  {id:'d22',cat:'Education',name:'LearnSpark franchise',desc:'Source franchisee operators for coaching centres.',repReq:2,time:2,min:40000,max:90000,rate:0.76,prereq:[]},
  {id:'d23',cat:'Education',name:'CurriculumX licensing',desc:'License teaching system to schools.',repReq:3,time:2,min:50000,max:100000,rate:0.70,prereq:['d22']},
  {id:'d24',cat:'Education',name:'SkillBridge corporate deal',desc:'Close corporate training contracts.',repReq:2,time:2,min:45000,max:110000,rate:0.72,prereq:[]},
  {id:'d25',cat:'Retail',name:'WhiteLabel wholesale deal',desc:'Connect manufacturer to retail brand. Take margin.',repReq:1,time:1,min:20000,max:55000,rate:0.80,prereq:[]},
  {id:'d26',cat:'Retail',name:'ShelfSpace distribution',desc:'Get new FMCG brand into supermarket chains.',repReq:2,time:2,min:35000,max:80000,rate:0.73,prereq:['d25']},
  {id:'d27',cat:'Retail',name:'MallPrime retail licensing',desc:'License pop-up spaces. Take 15% of operator revenue.',repReq:3,time:2,min:55000,max:130000,rate:0.68,prereq:['d25','d26']},
  {id:'d28',cat:'Finance',name:'LoanLink syndication',desc:'Syndicate large MSME loan. Take arrangement fee.',repReq:4,time:3,min:80000,max:200000,rate:0.65,prereq:['d29','d30']},
  {id:'d29',cat:'Finance',name:'InsureMax distribution deal',desc:'Onboard insurance agents. Take override commission.',repReq:2,time:1,min:25000,max:60000,rate:0.78,prereq:[]},
  {id:'d30',cat:'Finance',name:'WealthBridge MF distribution',desc:'Onboard mutual fund distributors.',repReq:2,time:2,min:30000,max:70000,rate:0.75,prereq:[]},
  {id:'d31',cat:'Healthcare',name:'MediChain clinic franchise',desc:'Source operators for diagnostic franchise.',repReq:3,time:2,min:60000,max:130000,rate:0.70,prereq:['d32']},
  {id:'d32',cat:'Healthcare',name:'PharmaLink distribution',desc:'Onboard distributors in new regions.',repReq:2,time:2,min:35000,max:80000,rate:0.73,prereq:[]},
  {id:'d33',cat:'Healthcare',name:'MediEquip leasing deal',desc:'Structure equipment leasing deals with hospitals.',repReq:3,time:2,min:50000,max:120000,rate:0.68,prereq:['d32']},
  {id:'d34',cat:'Hospitality',name:'StayEasy hotel management',desc:'Source hotel owners for management contracts.',repReq:3,time:2,min:55000,max:130000,rate:0.70,prereq:['d35']},
  {id:'d35',cat:'Hospitality',name:'TasteCraft restaurant franchise',desc:'Source franchisee operators in new cities.',repReq:2,time:2,min:45000,max:100000,rate:0.74,prereq:[]},
  {id:'d36',cat:'Logistics',name:'LastMile delivery contract',desc:'Close e-commerce contracts for logistics firm.',repReq:2,time:2,min:35000,max:85000,rate:0.75,prereq:[]},
  {id:'d37',cat:'Logistics',name:'ColdStore warehouse leasing',desc:'Find FMCG brands to lease cold storage.',repReq:1,time:1,min:20000,max:55000,rate:0.80,prereq:[]},
  {id:'d38',cat:'Energy',name:'SolarGrid installation contract',desc:'Close rooftop solar contracts with factories.',repReq:2,time:2,min:40000,max:100000,rate:0.73,prereq:[]},
  {id:'d39',cat:'Energy',name:'FuelNet distribution deal',desc:'Onboard transport companies for fuel additive.',repReq:1,time:1,min:20000,max:50000,rate:0.78,prereq:[]},
  {id:'d40',cat:'Agriculture',name:'GrainBridge commodity trade',desc:'Connect to food processors. Take 3% of trade.',repReq:1,time:1,min:25000,max:60000,rate:0.78,prereq:[]},
  {id:'d41',cat:'Agriculture',name:'ColdVault storage leasing',desc:'Source farmers needing cold storage.',repReq:1,time:1,min:15000,max:40000,rate:0.82,prereq:[]},
  {id:'d42',cat:'Agriculture',name:'AgriExport trade deal',desc:'Connect farm exporters to overseas buyers.',repReq:3,time:2,min:60000,max:150000,rate:0.65,prereq:['d40','d41']},
  {id:'d43',cat:'Investment',name:'Investment syndication',desc:'Pool HNI investors for large deal. Take 2% plus 20% carry.',repReq:5,time:4,min:100000,max:300000,rate:0.60,prereq:['d44']},
  {id:'d44',cat:'Investment',name:'Business acquisition deal',desc:'Find buyer for struggling business. Take 20% finder fee.',repReq:3,time:3,min:80000,max:200000,rate:0.65,prereq:[]},
  {id:'d45',cat:'Investment',name:'Equity stake flip',desc:'Take equity instead of fees. Help grow. Flip to next investor.',repReq:6,time:4,min:150000,max:500000,rate:0.55,prereq:['d43','d44']}
];

/* ─── HISTORICAL DEAL SCENARIOS ─── */
/* Profile keys: employee, selfemployed, inheritor, dealmaker, all */
/* Each scenario has: id, profile[], trigger condition fn, setup, choices[], outcomes{} */

var DEAL_SCENARIOS=[

  /* ── TYPE 1: REFUSED THE BUYER ── */
  {
    id:'sc_social_refusal',
    profiles:['dealmaker','selfemployed'],
    minMonth:3,
    title:'The Billion-Dollar Walk-Out',
    setup:'A struggling search giant — Yohoo — approaches your most promising venture. Their offer: buy it for what feels like a life-changing sum. Your board is excited. The number has many zeros. But you believe you are only 10% of the way there. Yohoo\'s own platform is shrinking. They are buying your future to save their past.',
    choices:[
      {
        id:'sell',
        label:'Take the money',
        desc:'Accept Yohoo\'s offer. The cash is real. The future is uncertain.',
        hint:'A certain win today. But what if you are right about the future?'
      },
      {
        id:'refuse',
        label:'Walk out of the meeting',
        desc:'Decline the offer. Bet on your own vision. Accept the risk.',
        hint:'The founder who did this was called insane by his board. He was 22.'
      },
      {
        id:'counter',
        label:'Counter at 10x their offer',
        desc:'Stay in the room but price yourself out. If they say yes, it is worth it.',
        hint:'The price that makes walking away easy is the price that respects your future.'
      }
    ],
    outcomes:{
      sell:{
        title:'You took the money.',
        body:'Yohoo paid. You celebrated. Three years later your venture — now absorbed into Yohoo\'s dying infrastructure — was shut down quietly. The product that could have changed everything became a footnote in a press release.',
        lesson:'The acquirer does not buy your vision. They buy what threatens theirs — then bury it.',
        effect:function(G){G.cash+=sc(500000);G.disciplineScore=Math.max(0,G.disciplineScore-1);},
        effectLabel:'+cash (short-term win, long-term lesson)'
      },
      refuse:{
        title:'You walked out.',
        body:'Your board thought you had lost your mind. For 18 months it felt like a mistake. Then growth compounded. Then the numbers became undeniable. The same company that offered you one came back offering a hundred.',
        lesson:'Knowing your value is the most expensive negotiation skill you will ever develop.',
        effect:function(G){G.disciplineScore+=2;G.reputation=Math.min(10,G.reputation+2);},
        effectLabel:'+2 discipline, +2 reputation'
      },
      counter:{
        title:'They said no. You kept building.',
        body:'The counter shocked them. They declined. You stayed independent. The pressure of almost-selling sharpened your focus. You built faster. Three years later you had outgrown the offer price entirely.',
        lesson:'A price that makes you comfortable walking away is not greed — it is clarity.',
        effect:function(G){G.disciplineScore+=1;G.reputation=Math.min(10,G.reputation+1);},
        effectLabel:'+1 discipline, +1 reputation'
      }
    }
  },

  {
    id:'sc_search_no',
    profiles:['dealmaker','selfemployed'],
    minMonth:2,
    title:'Nobody Wanted the Search Engine',
    setup:'Two students built a search engine called Gooble. It is technically brilliant but has no business model. They tried to sell it for a million dollars to the dominant portal of the time — Excitel. You are on the other side of the table. Your team says it is a toy. The market says search is solved. The asking price is laughably small.',
    choices:[
      {
        id:'pass',
        label:'Pass — search is already solved',
        desc:'Decline the acquisition. Your portal is profitable. This is a distraction.',
        hint:'This is what Excitel actually did.'
      },
      {
        id:'buy',
        label:'Buy it for the asking price',
        desc:'One million is nothing. The technology is real. Buy it and figure out the model later.',
        hint:'Nobody in the room could see the model. That was the opportunity.'
      },
      {
        id:'invest',
        label:'Take a small stake instead',
        desc:'Do not acquire fully. Invest a small amount for equity and watch what happens.',
        hint:'Sometimes the right move is a toe in the water, not a full dive.'
      }
    ],
    outcomes:{
      pass:{
        title:'You passed.',
        body:'Gooble went on to raise funding elsewhere. Within five years they were the most visited site on the internet. Within ten years they were the most valuable company in history. The portal you protected is now a memory.',
        lesson:'The people who think the problem is solved are always the last to see the solution.',
        effect:function(G){G.disciplineScore=Math.max(0,G.disciplineScore-1);},
        effectLabel:'−1 discipline (costly blindness)'
      },
      buy:{
        title:'You bought Gooble.',
        body:'One million dollars. Everyone laughed at you for a year. Then Gooble became the foundation of everything. The business model emerged. The advertising engine was built. You owned a piece of the future for the price of a conference room renovation.',
        lesson:'Distressed assets in the right category are the best deals nobody takes.',
        effect:function(G){G.cash+=sc(300000);G.disciplineScore+=2;G.reputation=Math.min(10,G.reputation+2);},
        effectLabel:'+cash, +2 discipline, +2 reputation'
      },
      invest:{
        title:'You took a small stake.',
        body:'Not enough to control. Enough to benefit. When Gooble became Gooble, your small stake returned fifty times your investment. Not the best outcome possible — but far better than the people who passed entirely.',
        lesson:'Partial conviction is still conviction. Not everything requires full commitment.',
        effect:function(G){G.cash+=sc(150000);G.disciplineScore+=1;},
        effectLabel:'+cash, +1 discipline'
      }
    }
  },

  /* ── TYPE 2: NOBODY WANTED IT ── */
  {
    id:'sc_streaming_early',
    profiles:['inheritor','employee'],
    minMonth:4,
    title:'The DVD Company Nobody Took Seriously',
    setup:'A small DVD-by-mail company called Streamflix has pivoted to streaming video online. Every major studio was offered the chance to buy it for under 50 million dollars. They all passed — "nobody wants to watch movies on a computer." You have some capital. The founder is still selling.',
    choices:[
      {
        id:'pass',
        label:'Pass — the model makes no sense',
        desc:'Physical media is the business. Online streaming has no margins.',
        hint:'This is what every studio actually decided.'
      },
      {
        id:'buy',
        label:'Buy a stake at the current valuation',
        desc:'The technology is real. The behaviour shift is coming. Get in early.',
        hint:'The studios who passed spent billions trying to catch up later.'
      },
      {
        id:'wait',
        label:'Watch for one more year before deciding',
        desc:'Wait for proof before committing capital.',
        hint:'Waiting for certainty means paying certainty prices.'
      }
    ],
    outcomes:{
      pass:{
        title:'You passed.',
        body:'The studios passed too. Then broadband improved. Then smartphones arrived. Then Streamflix had a hundred million subscribers. The studios spent fifty billion dollars building competing services — for a company they could have owned for fifty million.',
        lesson:'Incumbents always undervalue what disrupts them. Until it is too late.',
        effect:function(G){G.disciplineScore=Math.max(0,G.disciplineScore-1);},
        effectLabel:'−1 discipline'
      },
      buy:{
        title:'You bought in early.',
        body:'The first two years felt slow. Then everything accelerated. The behaviour shift you believed in arrived faster than expected. Your early stake compounded into something generational.',
        lesson:'Distribution is worth more than content. Always.',
        effect:function(G){G.cash+=sc(400000);G.disciplineScore+=2;},
        effectLabel:'+cash, +2 discipline'
      },
      wait:{
        title:'You waited too long.',
        body:'By the time the proof arrived, the price had multiplied. You invested at a much higher valuation. You still made money — but a fraction of what early conviction would have returned.',
        lesson:'Waiting for certainty means paying certainty prices. The return is in the uncertainty.',
        effect:function(G){G.cash+=sc(80000);G.disciplineScore+=1;},
        effectLabel:'+small cash gain, +1 discipline'
      }
    }
  },

  /* ── TYPE 3: COMPETED AND WON / LOST ── */
  {
    id:'sc_messaging_war',
    profiles:['dealmaker','inheritor'],
    minMonth:5,
    title:'The Messaging War',
    setup:'Chatpulse — a messaging app with 400 million users and zero revenue — is being acquired. Two giants are bidding: Gooble at 1 billion and Facepage at 19 billion. You advise one of the bidders. The gap is enormous. Gooble thinks Facepage is irrational. Facepage thinks Gooble is being cheap with the future.',
    choices:[
      {
        id:'gooble_side',
        label:'Advise Gooble — hold the rational bid',
        desc:'19 billion for zero revenue is insane. Discipline is not overpaying.',
        hint:'Gooble lost the bid. Then built a competitor. The competitor failed.'
      },
      {
        id:'facepage_side',
        label:'Advise Facepage — pay whatever it takes',
        desc:'400 million users is not a product. It is a moat. Pay for the moat.',
        hint:'Facepage paid 19 billion. Within five years Chatpulse was worth more than that.'
      },
      {
        id:'advise_counter',
        label:'Advise Chatpulse to reject both and stay independent',
        desc:'Neither offer reflects the true value. Stay independent and raise at your own terms.',
        hint:'Independence has a price. So does dependence.'
      }
    ],
    outcomes:{
      gooble_side:{
        title:'Gooble held the line. And lost.',
        body:'Rational discipline cost them the deal. Facepage paid 19 billion and acquired not just an app but a generation. Gooble built Whatchat to compete. It never caught up.',
        lesson:'In a platform war, the winner pays for the future. The loser pays to catch up.',
        effect:function(G){G.reputation=Math.max(0,G.reputation-1);},
        effectLabel:'−1 reputation'
      },
      facepage_side:{
        title:'Facepage paid 19 billion.',
        body:'The press called it reckless for a week. Then Chatpulse became the primary communication platform for a billion people. The acquisition was called one of the greatest in history.',
        lesson:'You are not buying what a company is. You are buying what it will become.',
        effect:function(G){G.cash+=sc(200000);G.reputation=Math.min(10,G.reputation+2);G.disciplineScore+=1;},
        effectLabel:'+cash, +2 reputation, +1 discipline'
      },
      advise_counter:{
        title:'Chatpulse stayed independent — briefly.',
        body:'The rejection of both bids created leverage. Chatpulse raised a new round at a higher valuation. Six months later Facepage returned with a larger offer. Independence was a negotiating tool, not a destination.',
        lesson:'Sometimes the best response to an offer is a better offer — not a yes.',
        effect:function(G){G.cash+=sc(100000);G.reputation=Math.min(10,G.reputation+1);},
        effectLabel:'+cash, +1 reputation'
      }
    }
  },

  {
    id:'sc_video_platform',
    profiles:['dealmaker','inheritor'],
    minMonth:4,
    title:'The Video Platform Nobody Valued',
    setup:'Gooble is acquiring Viewtube — a video sharing platform — for 1.65 billion dollars. Every media company calls it insane. "It has no content. It has no rights. It has user-generated noise." You have a seat at the table. The media executives are laughing. Gooble is serious.',
    choices:[
      {
        id:'side_media',
        label:'Side with the media executives — overvalued',
        desc:'Without content rights, video hosting is a liability not an asset.',
        hint:'The media companies who laughed are mostly gone now.'
      },
      {
        id:'side_gooble',
        label:'Side with Gooble — buy the distribution',
        desc:'Content is temporary. Distribution is permanent. Viewtube owns attention.',
        hint:'Gooble paid 1.65 billion. Viewtube became the second most visited site on earth.'
      },
      {
        id:'buy_stake',
        label:'Take your own stake in Viewtube before the deal closes',
        desc:'If Gooble sees this value, get in before they finalise.',
        hint:'The best deals happen before the headline.'
      }
    ],
    outcomes:{
      side_media:{
        title:'You sided with the wrong room.',
        body:'Gooble bought Viewtube anyway. Within three years it was the second most visited site on earth. The media companies who laughed spent the next decade trying to compete with what they dismissed.',
        lesson:'Platforms that distribute attention are worth more than the content on them.',
        effect:function(G){G.disciplineScore=Math.max(0,G.disciplineScore-1);},
        effectLabel:'−1 discipline'
      },
      side_gooble:{
        title:'You saw what the media executives missed.',
        body:'Distribution always wins. Content is rented. Attention is owned. Viewtube became the default destination for human curiosity. The 1.65 billion looked cheap within two years.',
        lesson:'Distribution beats content. Every time. In every era.',
        effect:function(G){G.cash+=sc(150000);G.disciplineScore+=1;G.reputation=Math.min(10,G.reputation+1);},
        effectLabel:'+cash, +1 discipline, +1 reputation'
      },
      buy_stake:{
        title:'You moved before the headline.',
        body:'Smart money moves before the announcement. Your stake was acquired as part of the Gooble deal at a premium. The return was immediate and significant.',
        lesson:'The best price is always before everyone else sees the value.',
        effect:function(G){G.cash+=sc(250000);G.reputation=Math.min(10,G.reputation+2);},
        effectLabel:'+cash, +2 reputation'
      }
    }
  },

  /* ── TYPE 4: DEAL CLOSED BUT DESTROYED BOTH ── */
  {
    id:'sc_phone_funeral',
    profiles:['dealmaker','selfemployed'],
    minMonth:6,
    title:'The Acquisition That Killed Two Giants',
    setup:'Mikrocorp is acquiring Nokria\'s handset division for 7.2 billion dollars. The stated goal: dominate mobile. Nokria was once the world\'s most valuable brand. Mikrocorp has cash and ambition. Your firm is advising. The synergy deck looks compelling. But the culture gap is a canyon.',
    choices:[
      {
        id:'advise_proceed',
        label:'Advise the deal proceeds — strategic necessity',
        desc:'Mobile is the future. Neither company can win alone. Together they can compete.',
        hint:'This is what the boards decided. The result was catastrophic.'
      },
      {
        id:'advise_stop',
        label:'Advise against — the cultures cannot merge',
        desc:'The financials look right. The human reality does not. Acquisitions are culture mergers first.',
        hint:'The deal destroyed both companies\' mobile ambitions within three years.'
      },
      {
        id:'advise_restructure',
        label:'Advise a licensing deal instead of acquisition',
        desc:'Mikrocorp licenses Nokria\'s patents. No cultural merger. No integration risk.',
        hint:'The value was in the IP, not the organisation.'
      }
    ],
    outcomes:{
      advise_proceed:{
        title:'The deal closed. Then everything else closed.',
        body:'7.2 billion was paid. Integration began immediately and failed immediately. Mikrocorp wrote off 7.6 billion within three years. The combined entity held less than 1% of the smartphone market. Two giants became one slow-moving failure.',
        lesson:'Buying a sinking ship does not teach you to swim. It makes you sink together.',
        effect:function(G){G.cash=Math.max(0,G.cash-sc(200000));G.disciplineScore=Math.max(0,G.disciplineScore-1);G.reputation=Math.max(0,G.reputation-1);},
        effectLabel:'−cash, −1 discipline, −1 reputation'
      },
      advise_stop:{
        title:'You called it correctly.',
        body:'Your recommendation was ignored. The deal proceeded. Exactly as you predicted, integration failed. But your analysis was documented. Your reputation as someone who reads people — not just numbers — grew significantly.',
        lesson:'The best due diligence is not financial. It is cultural.',
        effect:function(G){G.disciplineScore+=2;G.reputation=Math.min(10,G.reputation+2);},
        effectLabel:'+2 discipline, +2 reputation'
      },
      advise_restructure:{
        title:'A licensing structure saved the IP value.',
        body:'Nokria licensed its patents to Mikrocorp without the cultural merger. Both companies preserved their independence. Mikrocorp got the technology. Nokria monetised assets without dismantling itself.',
        lesson:'The right structure matters more than the right price.',
        effect:function(G){G.cash+=sc(180000);G.reputation=Math.min(10,G.reputation+2);G.disciplineScore+=1;},
        effectLabel:'+cash, +2 reputation, +1 discipline'
      }
    }
  },

  {
    id:'sc_media_merger',
    profiles:['inheritor','dealmaker'],
    minMonth:5,
    title:'The Merger That Destroyed Everything',
    setup:'Timewarner and AOLnet are merging in a 165 billion dollar deal — the largest in history. The pitch: old media meets new internet. Every banker in the world is salivating at the fees. Your firm has a position. You can advise, invest, or stay out.',
    choices:[
      {
        id:'invest',
        label:'Invest — this is the future of media',
        desc:'Old media plus internet equals dominance. Get in before the announcement.',
        hint:'Shareholders lost 200 billion dollars in value from this deal.'
      },
      {
        id:'stay_out',
        label:'Stay out — two weak strategies do not make one strong one',
        desc:'AOLnet is declining. Timewarner is scared. Fear-based mergers destroy value.',
        hint:'The analysts who avoided this saved their clients from catastrophic loss.'
      },
      {
        id:'short',
        label:'Position against — this will destroy value',
        desc:'If you are right about the cultural mismatch, the destruction will be significant.',
        hint:'The brave move when everyone is celebrating is to ask what could go wrong.'
      }
    ],
    outcomes:{
      invest:{
        title:'The merger destroyed your investment.',
        body:'200 billion dollars of shareholder value evaporated. Two companies that needed each other for the wrong reasons merged and became a monument to hubris. Your position was worth a fraction of its entry price within two years.',
        lesson:'Size is not synergy. Two weak strategies do not become one strong one.',
        effect:function(G){G.cash=Math.max(0,G.cash-sc(150000));G.disciplineScore=Math.max(0,G.disciplineScore-1);},
        effectLabel:'−cash, −1 discipline'
      },
      stay_out:{
        title:'You stayed out. You kept your capital.',
        body:'While others were celebrating the deal of the century, you saw fear dressed as strategy. Staying out was not timidity — it was discipline. Capital preserved is capital available for the next real opportunity.',
        lesson:'Not losing is sometimes the best investment decision you will ever make.',
        effect:function(G){G.disciplineScore+=2;},
        effectLabel:'+2 discipline'
      },
      short:{
        title:'You positioned against the consensus.',
        body:'It took longer than expected for the destruction to show. But it showed. The cultural collapse was total. Your contrarian position returned significantly as the reality of the merger became undeniable.',
        lesson:'The brave move when everyone is celebrating is the one nobody wants to take.',
        effect:function(G){G.cash+=sc(300000);G.disciplineScore+=2;G.reputation=Math.min(10,G.reputation+2);},
        effectLabel:'+cash, +2 discipline, +2 reputation'
      }
    }
  },

  /* ── TYPE 5: DEALS THAT BUILT EMPIRES ── */
  {
    id:'sc_photo_app',
    profiles:['dealmaker','inheritor'],
    minMonth:4,
    title:'13 Employees. No Revenue. One Billion Dollars.',
    setup:'Facepage is about to buy Photogram — a photo sharing app with 13 employees and no revenue — for one billion dollars. Your network has a stake in Photogram. You can sell now at a guaranteed 10x return, or stay and trust the Facepage thesis that this becomes something much larger.',
    choices:[
      {
        id:'sell_now',
        label:'Sell your stake now — 10x is extraordinary',
        desc:'A guaranteed 10x return is the dream. Take it.',
        hint:'Photogram became worth 100 billion inside a decade.'
      },
      {
        id:'hold',
        label:'Hold through the acquisition and beyond',
        desc:'If Facepage is paying one billion for zero revenue, they see something enormous.',
        hint:'The founder held. The early investors who held became very wealthy.'
      },
      {
        id:'negotiate',
        label:'Negotiate a partial exit — take half, hold half',
        desc:'Secure some gains. Keep upside exposure.',
        hint:'Partial conviction can be the most rational position.'
      }
    ],
    outcomes:{
      sell_now:{
        title:'10x felt like everything. Until it was nothing.',
        body:'You sold at 10x. Then Photogram became worth 100 billion. Your 10x was 0.1% of the total story. The return felt extraordinary until you saw what holding would have returned.',
        lesson:'Selling too early is the most expensive mistake in venture. Great assets compound beyond imagination.',
        effect:function(G){G.cash+=sc(200000);G.disciplineScore=Math.max(0,G.disciplineScore-1);},
        effectLabel:'+cash (but lesson paid)'
      },
      hold:{
        title:'You held. The compounding was extraordinary.',
        body:'Photogram became one of the greatest acquisitions in history. The 13 employees became the foundation of a billion-user platform. Your stake compounded into generational wealth.',
        lesson:'You are not buying what a company is. You are buying what it will become.',
        effect:function(G){G.cash+=sc(600000);G.disciplineScore+=2;G.reputation=Math.min(10,G.reputation+2);},
        effectLabel:'+cash, +2 discipline, +2 reputation'
      },
      negotiate:{
        title:'Half out. Half compounding.',
        body:'You secured real gains and kept real upside. Not the maximum return — but a responsible balance of certainty and ambition. The held half returned extraordinary multiples.',
        lesson:'Taking some chips off the table is not weakness — it is longevity.',
        effect:function(G){G.cash+=sc(350000);G.disciplineScore+=1;G.reputation=Math.min(10,G.reputation+1);},
        effectLabel:'+cash, +1 discipline, +1 reputation'
      }
    }
  },

  /* ── EMPLOYEE-SPECIFIC SCENARIOS ── */
  {
    id:'sc_stock_options',
    profiles:['employee'],
    minMonth:3,
    title:'The Options Nobody Wanted',
    setup:'Your employer — a small tech startup — offers you stock options instead of a salary raise. The options are worth nothing today. The company might fail. Most of your colleagues are taking the cash raise instead. The startup\'s product is genuinely different from anything in the market.',
    choices:[
      {
        id:'take_cash',
        label:'Take the salary raise — cash is real',
        desc:'Options might be worthless. Salary is guaranteed.',
        hint:'The colleagues who chose cash at companies like Applix in 1997 still regret it.'
      },
      {
        id:'take_options',
        label:'Take the options — bet on the company',
        desc:'If the company works, the options could be worth everything.',
        hint:'Options in a great company at an early stage are the most underpriced asset in existence.'
      },
      {
        id:'negotiate_both',
        label:'Negotiate half salary raise and half options',
        desc:'Take some security and some upside.',
        hint:'The rational middle — but the extraordinary return only comes from full conviction.'
      }
    ],
    outcomes:{
      take_cash:{
        title:'You took the safe path.',
        body:'The salary raise felt good. Three years later the startup went public. Your colleagues who took options became millionaires. You received your salary every month — exactly as promised. Nothing more.',
        lesson:'A salary is the price your employer pays to own your time. Options are the price of owning the future.',
        effect:function(G){G.cash+=sc(50000);G.disciplineScore=Math.max(0,G.disciplineScore-1);},
        effectLabel:'+small cash, −1 discipline'
      },
      take_options:{
        title:'The options vested. Everything changed.',
        body:'Two years of vesting. One IPO. Your options were worth a hundred times the salary raise you declined. The risk that felt enormous at the time looks obvious in hindsight.',
        lesson:'The biggest financial risk is never taking one.',
        effect:function(G){G.cash+=sc(400000);G.disciplineScore+=2;},
        effectLabel:'+cash, +2 discipline'
      },
      negotiate_both:{
        title:'Half security. Half future.',
        body:'A smaller options grant than the full bet, but real upside nonetheless. When the company went public, your partial position returned meaningfully — not life-changing, but significant.',
        lesson:'Partial conviction still beats no conviction.',
        effect:function(G){G.cash+=sc(180000);G.disciplineScore+=1;},
        effectLabel:'+cash, +1 discipline'
      }
    }
  },

  /* ── SELF-EMPLOYED SPECIFIC ── */
  {
    id:'sc_sell_or_keep',
    profiles:['selfemployed'],
    minMonth:6,
    title:'The Offer for Your Business',
    setup:'You built something real. A strategic buyer approaches with an offer to acquire your business for 15x annual revenue. The number is significant. But the business is growing 40% per year. The buyer knows this. They are offering now because they believe it will be worth much more in two years.',
    choices:[
      {
        id:'sell',
        label:'Sell — 15x is extraordinary',
        desc:'Exit. Deploy the capital into passive assets. Build the next thing.',
        hint:'There is no wrong answer here. Only different futures.'
      },
      {
        id:'keep',
        label:'Keep — 40% growth compounds fast',
        desc:'At this growth rate, 15x today is 3x in two years.',
        hint:'But growth always slows. And buyers do not always return.'
      },
      {
        id:'partial',
        label:'Sell 40% — take cash, keep control',
        desc:'Bring in a partner. Fund the growth. Keep the upside.',
        hint:'Strategic capital with retained control is a different game entirely.'
      }
    ],
    outcomes:{
      sell:{
        title:'You sold. You deployed. You moved.',
        body:'The capital from the sale went into assets that worked without you. For the first time, income arrived while you slept. The business you built became the launchpad for a different life.',
        lesson:'The purpose of building a business is not to own it forever. It is to create options.',
        effect:function(G){G.cash+=sc(800000);G.disciplineScore+=1;},
        effectLabel:'+significant cash, +1 discipline'
      },
      keep:{
        title:'You held. The growth continued — until it did not.',
        body:'Two more years of 40% growth. Then the market shifted. The buyer moved on. A new offer came — at 8x. The window at 15x had closed. You still built something valuable, but the optimal exit had passed.',
        lesson:'Great businesses have optimal exit windows. They do not stay open forever.',
        effect:function(G){G.cash+=sc(300000);G.disciplineScore+=1;},
        effectLabel:'+cash (but below optimal)'
      },
      partial:{
        title:'Strategic capital changed the trajectory.',
        body:'The 40% stake brought in a partner with distribution the business could not have built alone. Revenue accelerated. Two years later the full business sold at 25x. The partial sale was the best decision.',
        lesson:'The right partner with capital is worth more than full control of a smaller thing.',
        effect:function(G){G.cash+=sc(500000);G.disciplineScore+=2;G.reputation=Math.min(10,G.reputation+2);},
        effectLabel:'+cash, +2 discipline, +2 reputation'
      }
    }
  },

  /* ── INHERITOR SPECIFIC ── */
  {
    id:'sc_family_land',
    profiles:['inheritor'],
    minMonth:3,
    title:'The Family Land Offer',
    setup:'A developer approaches with an offer to buy the family land at current market value. The land has been in your family for three generations. It generates modest rental income. The developer\'s offer is significant — but the land sits near an upcoming infrastructure project that will triple its value in five years. Only people who read the government planning notices know this.',
    choices:[
      {
        id:'sell_now',
        label:'Sell at current market value',
        desc:'The cash is real. The infrastructure project might not happen.',
        hint:'Most families in this position sold. The infrastructure project always happened.'
      },
      {
        id:'hold',
        label:'Hold — the infrastructure project changes everything',
        desc:'You have read the notices. The value will triple. Patience is the strategy.',
        hint:'Information asymmetry is the oldest edge in real estate.'
      },
      {
        id:'develop',
        label:'Develop it yourself before the project completes',
        desc:'Do not wait for the government. Build on it now and capture the uplift.',
        hint:'The active move requires capital and risk. But the return is direct.'
      }
    ],
    outcomes:{
      sell_now:{
        title:'You sold at yesterday\'s price.',
        body:'The cash arrived. Then the infrastructure project was announced publicly. The land tripled in value within three years. The developer who bought from you made ten times your sale price.',
        lesson:'Information advantage is only an advantage if you act on it.',
        effect:function(G){G.cash+=sc(300000);G.disciplineScore=Math.max(0,G.disciplineScore-1);},
        effectLabel:'+cash (below potential), −1 discipline'
      },
      hold:{
        title:'Patience delivered.',
        body:'The infrastructure project was announced. The land tripled. You did nothing except not sell. Inaction, when you hold the right asset, is the highest-return strategy available.',
        lesson:'The best investment decision is often the one you do not make.',
        effect:function(G){G.cash+=sc(600000);G.disciplineScore+=2;},
        effectLabel:'+significant cash, +2 discipline'
      },
      develop:{
        title:'You built. The infrastructure amplified everything.',
        body:'Development costs were significant. But the infrastructure project delivered exactly what the notices promised. Your developed asset in the path of progress returned far more than the raw land would have.',
        lesson:'Assets in the path of progress compound faster than assets waiting for progress.',
        effect:function(G){G.cash+=sc(800000);G.disciplineScore+=1;G.reputation=Math.min(10,G.reputation+1);},
        effectLabel:'+significant cash, +1 discipline, +1 reputation'
      }
    }
  },

  /* ── UNIVERSAL SCENARIOS (all profiles) ── */
  {
    id:'sc_market_crash',
    profiles:['employee','selfemployed','inheritor','dealmaker'],
    minMonth:6,
    title:'The Crash Everyone Saw Coming',
    setup:'Markets are falling. Every headline says sell. Your advisor is nervous. Your portfolio is down 35%. The same assets that were expensive six months ago are now on sale. Panic is the dominant emotion in the room. You have cash reserves.',
    choices:[
      {
        id:'sell',
        label:'Sell — protect what is left',
        desc:'Stop the bleeding. Move to cash. Wait for clarity.',
        hint:'Selling in a crash locks in the loss permanently.'
      },
      {
        id:'hold',
        label:'Hold — do not crystallise the loss',
        desc:'Stay invested. Markets recover. Patience is the strategy.',
        hint:'Every crash in history was eventually followed by a recovery.'
      },
      {
        id:'buy',
        label:'Buy more — everything is on sale',
        desc:'Fear is the discount. Deploy reserves into assets at 35% off.',
        hint:'The investors who bought in the crash of 2008 made generational returns by 2015.'
      }
    ],
    outcomes:{
      sell:{
        title:'You sold at the bottom.',
        body:'The market recovered within eighteen months. You locked in a 35% loss permanently. The assets you sold at the bottom were worth double your purchase price three years later. Panic is the most expensive emotion in investing.',
        lesson:'The market always recovers. The investor who sells in panic never fully does.',
        effect:function(G){G.cash+=sc(50000);G.disciplineScore=Math.max(0,G.disciplineScore-2);},
        effectLabel:'+small cash (from sales), −2 discipline'
      },
      hold:{
        title:'You held. The recovery came.',
        body:'Eighteen months of discomfort. Then the recovery arrived. Your portfolio returned to its original value — then exceeded it. Holding is not passive. It requires more courage than selling.',
        lesson:'Doing nothing in a crash is one of the hardest and most valuable skills in wealth-building.',
        effect:function(G){G.disciplineScore+=2;},
        effectLabel:'+2 discipline'
      },
      buy:{
        title:'You bought the fear.',
        body:'Deploying capital when everyone else was fleeing required extraordinary conviction. Three years later your crash purchases had returned over 100%. The investors who bought at the bottom made careers from that decision.',
        lesson:'Maximum fear is minimum price. That is the only time to buy.',
        effect:function(G){G.cash+=sc(350000);G.disciplineScore+=3;G.reputation=Math.min(10,G.reputation+1);},
        effectLabel:'+cash, +3 discipline, +1 reputation'
      }
    }
  },

  {
    id:'sc_free_disruption',
    profiles:['employee','selfemployed','dealmaker'],
    minMonth:4,
    title:'Free Is a Business Model',
    setup:'Jiotel enters your market offering completely free data — zero cost, unlimited usage. Every incumbent analyst says it is unsustainable. "They will run out of money in six months." You have a significant investment in one of the incumbents. You also have the opportunity to move capital into Jiotel\'s parent company.',
    choices:[
      {
        id:'stay_incumbent',
        label:'Stay with the incumbent — free cannot last',
        desc:'Jiotel is burning cash. The incumbents have infrastructure and profits.',
        hint:'Three incumbent carriers went bankrupt within 18 months of Jiotel\'s launch.'
      },
      {
        id:'move_to_jiotel',
        label:'Move capital to Jiotel\'s parent — free is the strategy',
        desc:'Free is not a cost. It is a customer acquisition strategy at scale.',
        hint:'Jiotel gained 400 million users in 18 months. The incumbents never recovered.'
      },
      {
        id:'split',
        label:'Split — hedge between incumbent and disruptor',
        desc:'Reduce incumbent exposure. Take a position in the disruptor.',
        hint:'Hedging is rational. But full conviction in the right direction pays more.'
      }
    ],
    outcomes:{
      stay_incumbent:{
        title:'The incumbents did not survive.',
        body:'Three carriers went bankrupt. The fourth was forced to sell at distressed prices. Your incumbent investment lost 80% of its value. Jiotel had 400 million users and was building a digital empire on top of its network.',
        lesson:'Free is a business model. The incumbents always find out too late.',
        effect:function(G){G.cash=Math.max(0,G.cash-sc(200000));G.disciplineScore=Math.max(0,G.disciplineScore-1);},
        effectLabel:'−cash, −1 discipline'
      },
      move_to_jiotel:{
        title:'You moved with the disruption.',
        body:'400 million users. Then financial services. Then commerce. Then entertainment. Jiotel became the infrastructure for an entire digital economy. Your early position in the parent company compounded across every new vertical.',
        lesson:'The disruptor who wins the network war wins everything built on top of it.',
        effect:function(G){G.cash+=sc(500000);G.disciplineScore+=2;G.reputation=Math.min(10,G.reputation+1);},
        effectLabel:'+cash, +2 discipline, +1 reputation'
      },
      split:{
        title:'The hedge softened the blow.',
        body:'The incumbent position was painful. The Jiotel position was extraordinary. Combined, the portfolio was positive — and the lesson about hedging disruption was learned at a manageable cost.',
        lesson:'A hedge against disruption is always worth less than full conviction in the right direction.',
        effect:function(G){G.cash+=sc(150000);G.disciplineScore+=1;},
        effectLabel:'+cash, +1 discipline'
      }
    }
  }
];

/* ─── REGULAR EVENT CARDS ─── */
var ALL_EVENTS=[
  {type:'opportunity',title:'Angel deal on the table',body:'An investor offers to fund your next venture for 20% equity. Vision from you, capital from them.',effect:'+80,000 injected',fn:function(G){G.cash+=sc(80000);}},
  {type:'setback',title:'Self-employed trap activated',body:'You fell sick for 2 weeks. Business made zero. No systems. No income.',effect:'-50,000 lost',fn:function(G){G.cash=Math.max(0,G.cash-sc(50000));}},
  {type:'lesson',title:'The time audit revelation',body:'80% of what you do could be done by someone paid far less.',effect:'Delegation 50% off this month',fn:function(G){G.delegDiscount=true;}},
  {type:'opportunity',title:'Investment windfall',body:'One of your assets had an exceptional quarter.',effect:'+30,000 bonus',fn:function(G){G.cash+=sc(30000);}},
  {type:'setback',title:'Lifestyle inflation',body:'Good month. You upgraded. Expenses never came back down.',effect:'+8,000 permanent monthly expense',fn:function(G){G.expenses.push({id:'lif_'+G.month+'_'+G.year,label:'Lifestyle upgrade (Y'+G.year+' M'+G.month+')',amount:sc(8000),type:'discretionary',locked:false,mandatory:false});}},
  {type:'opportunity',title:'Joint venture carry',body:'You connected two parties who needed each other. 15% carry.',effect:'+45,000 carry',fn:function(G){G.cash+=sc(45000);}},
  {type:'setback',title:'Single point of failure',body:'Your biggest client walked. Revenue dropped 60% overnight.',effect:'-40,000',fn:function(G){G.cash=Math.max(0,G.cash-sc(40000));}},
  {type:'opportunity',title:'Delegation breakthrough',body:'Your team handled the entire month without a single call to you.',effect:'-4 time units freed permanently',fn:function(G){G.timeUsed=Math.max(0,G.timeUsed-4);}},
  {type:'lesson',title:'The plutocrat realisation',body:'Net worth is not salary. It is the value of assets producing income without requiring your time.',effect:'Wisdom card',fn:function(){}},
  {type:'market',title:'Bull market quarter',body:'Everything went up. Patience rewarded again.',effect:'+25,000',fn:function(G){G.cash+=sc(25000);}},
  {type:'market',title:'Market correction',body:'The market dipped. The panicked sold. The patient held.',effect:'-20,000',fn:function(G){G.cash=Math.max(0,G.cash-sc(20000));}},
  {type:'opportunity',title:'Royalty stream unlocked',body:'Something you created once now generates recurring revenue forever.',effect:'+12,000/mo new passive stream',fn:function(G){G.assets.push({id:'royalty_'+G.month,name:'Royalty stream',type:'passive',bucket:'cf',income:sc(12000),expense:sc(200),time:0,count:1,newThisMonth:true,monthsOwned:0});recalc(G);}},
  {type:'setback',title:'Medical emergency',body:'Unplanned medical costs. No passive income means you felt every unit.',effect:'-45,000',fn:function(G){G.cash=Math.max(0,G.cash-sc(45000));}},
  {type:'lesson',title:"OPM — Other People's Money",body:'The wealthy rarely use their own money. Leverage is the tool.',effect:'Next investment 25% off',fn:function(G){G.opmDiscount=true;}},
  {type:'opportunity',title:'Strategic partnership',body:'A complementary business wants to cross-promote. Zero cost.',effect:'+22,000',fn:function(G){G.cash+=sc(22000);}},
  {type:'setback',title:'Rental vacancy',body:'Your rental property sat empty this month. Zero rent. Maintenance still ran.',effect:'Rental income skipped this month',fn:function(G){G.assets.forEach(function(a){if(a.type==='real estate'&&!a.newThisMonth)a.vacantThisMonth=true;});}},
  {type:'setback',title:'Property damage',body:'Tenant caused significant damage. Emergency repair bill arrived.',effect:'-30,000 unexpected repair',fn:function(G){G.cash=Math.max(0,G.cash-sc(30000));}},
  {type:'setback',title:'Platform demonetisation',body:'Your content channel was demonetised for a month. Zero ad revenue.',effect:'Content channel income skipped this month',fn:function(G){G.assets.forEach(function(a){if(a.id==='content')a.vacantThisMonth=true;});}},
  {type:'market',title:'Startup IPO exit',body:'A startup you backed went public. Early believers rewarded.',effect:'+60,000',fn:function(G){G.cash+=sc(60000);}},
  {type:'lesson',title:'Time is the only non-renewable resource',body:'You can make more money. You cannot make more time.',effect:'1 time unit freed this month',fn:function(G){G.timeUsed=Math.max(0,G.timeUsed-1);}}
];

/* ─── BLACK SWAN EVENTS ─── */
var BLACK_SWAN_EVENTS=[
  {type:'blackswan',title:'Market crash',body:'Global markets collapsed 40%. Portfolios wiped. Leveraged investors destroyed. Cash holders survived.',effect:'50% of cash wiped',fn:function(G){G.cash=Math.floor(G.cash*0.5);}},
  {type:'blackswan',title:'Legal dispute',body:'A deal gone wrong. Legal fees and settlement costs arrive without warning. Protect everything.',effect:'-60% of cash in legal costs',fn:function(G){G.cash=Math.floor(G.cash*0.4);}},
  {type:'blackswan',title:'Health crisis',body:'Six months of treatment. Business paused. Income disrupted. The one thing money cannot fully solve.',effect:'-40% of cash + 1 month income suspended',fn:function(G){G.cash=Math.floor(G.cash*0.6);G.assets.forEach(function(a){if(!a.newThisMonth)a.vacantThisMonth=true;});}},
  {type:'blackswan',title:'Regulatory shutdown',body:'A new law shut down your primary revenue stream overnight. No warning. No appeal.',effect:'Largest asset suspended for 2 months',fn:function(G){var active=G.assets.filter(function(a){return !a.newThisMonth;});if(active.length){active.sort(function(a,b){return b.income-a.income;});active[0].vacantThisMonth=true;active[0].regulatorySuspended=2;}}},
  {type:'blackswan',title:'Key person dependency',body:'Your most important partner left. Took clients, relationships and half the deal pipeline.',effect:'-35% cash + reputation drops 2',fn:function(G){G.cash=Math.floor(G.cash*0.65);G.reputation=Math.max(0,G.reputation-2);}},
  {type:'blackswan',title:'Currency devaluation',body:'The local currency lost 30% of value overnight. Import costs spiked. Asset values dropped.',effect:'All expenses increase 20% this month',fn:function(G){G.blackSwanExpenseSpike=0.20;}}
];

/* ─── SMART EVENT RESPONSES ─── */
/* Each event type has 3 tiers: unprepared, partial, prepared */
/* Conditions evaluated against G at event time */
var EVENT_RESPONSES={
  'Rental vacancy':{
    check:function(G){
      var cashRatio=G.cash/Math.max(1,totalExp());
      var hasManager=G.hasManager;
      if(hasManager||cashRatio>=6)return 'prepared';
      if(cashRatio>=3)return 'partial';
      return 'unprepared';
    },
    unprepared:{
      title:'Full vacancy loss.',
      body:'No cash buffer. No manager. The empty month hit you directly. You had no protection built.',
      why:'Your cash reserves were below 3x monthly expenses and you had no manager.',
      damage:function(G){G.assets.forEach(function(a){if(a.type==='real estate'&&!a.newThisMonth)a.vacantThisMonth=true;});}
    },
    partial:{
      title:'Cash buffer absorbed the vacancy.',
      body:'Your reserves covered the missing month. No income, but no crisis either.',
      why:'Your cash buffer was between 3x and 6x monthly expenses.',
      damage:function(G){G.assets.forEach(function(a){if(a.type==='real estate'&&!a.newThisMonth)a.vacantThisMonth=true;});}
    },
    prepared:{
      title:'Manager handled it. Zero impact.',
      body:'Your manager found a replacement tenant quickly. The vacancy lasted days, not months.',
      why:'Your manager or strong cash reserves meant this was a non-event.',
      damage:function(){}
    }
  },
  'Market crash':{
    check:function(G){
      var hasDiversified=G.assets.filter(function(a){return !a.newThisMonth;}).length>=3;
      var highDiscipline=G.disciplineScore>=5;
      var hasLoan=G.loanAmount>0;
      if(hasDiversified&&highDiscipline&&!hasLoan)return 'prepared';
      if(hasDiversified||highDiscipline)return 'partial';
      return 'unprepared';
    },
    unprepared:{
      title:'Full crash impact.',
      body:'Concentrated position. Active loan. No discipline buffer. The crash hit everything.',
      why:'Single asset type, low discipline score, and active debt amplified the damage.',
      damage:function(G){G.cash=Math.floor(G.cash*0.5);if(G.loanAmount>0)G.cash=Math.floor(G.cash*0.8);}
    },
    partial:{
      title:'Partial protection held.',
      body:'Diversification or discipline reduced the impact. Not zero — but manageable.',
      why:'Some diversification or discipline score gave partial protection.',
      damage:function(G){G.cash=Math.floor(G.cash*0.75);}
    },
    prepared:{
      title:'Buying opportunity. No damage.',
      body:'Diversified portfolio. No debt. High discipline. The crash was a sale, not a crisis.',
      why:'Your preparation turned a black swan into an opportunity.',
      damage:function(G){G.cash+=sc(50000);}
    }
  },
  'Health crisis':{
    check:function(G){
      var np=netPassive();var exp=totalExp();
      var hasManager=G.hasManager;
      if(np>=exp&&hasManager)return 'prepared';
      if(np>=exp||hasManager)return 'partial';
      return 'unprepared';
    },
    unprepared:{
      title:'Total income loss.',
      body:'No systems. No passive income. Everything stopped when you stopped. Six months of recovery with zero income.',
      why:'You are the business. When you cannot work, the business cannot work.',
      damage:function(G){G.cash=Math.floor(G.cash*0.6);G.assets.forEach(function(a){if(!a.newThisMonth)a.vacantThisMonth=true;});}
    },
    partial:{
      title:'Partial continuity.',
      body:'Either your manager kept things running or your passive income covered expenses. Not both — but enough to survive.',
      why:'One layer of protection held. The other was missing.',
      damage:function(G){G.cash=Math.floor(G.cash*0.8);}
    },
    prepared:{
      title:'Zero financial impact.',
      body:'Passive income covered all expenses. Manager kept business running. You recovered without financial trauma.',
      why:'Passive income plus systems meant the crisis was personal — not financial.',
      damage:function(){}
    }
  },
  'Platform demonetisation':{
    check:function(G){
      var incomeStreams=G.assets.filter(function(a){return !a.newThisMonth&&a.income>0;}).length;
      var hasSOP=G.assets.find(function(a){return a.id==='build_sop'&&!a.newThisMonth;});
      if(incomeStreams>=3&&hasSOP)return 'prepared';
      if(incomeStreams>=2||hasSOP)return 'partial';
      return 'unprepared';
    },
    unprepared:{
      title:'Total content income lost.',
      body:'Single income stream. No systems. The demonetisation wiped your entire revenue for the month.',
      why:'One income stream means one point of failure. It failed.',
      damage:function(G){G.assets.forEach(function(a){if(a.id==='content')a.vacantThisMonth=true;});}
    },
    partial:{
      title:'Content hit. Everything else held.',
      body:'The channel went dark but your other income streams continued. The total damage was contained.',
      why:'Multiple income streams or SOP meant the content loss was partial.',
      damage:function(G){G.assets.forEach(function(a){if(a.id==='content')a.vacantThisMonth=true;});}
    },
    prepared:{
      title:'Minimal impact. Recovery started immediately.',
      body:'Multiple streams absorbed the content loss. SOP meant the recovery plan was already documented.',
      why:'Diversification and systems turned a setback into a minor disruption.',
      damage:function(G){G.assets.forEach(function(a){if(a.id==='content')a.vacantThisMonth=true;});}
    }
  }
};
