/* PLUTOCRAT v11 — plutocrat-data-core.js */
/* Layer 1 — Pure Data. No DOM. No logic. No state mutation. */
/* Contains: LDATA, MANUAL_LOCS, PROFILES, SALARY_TRAP_QUOTES, */
/*           ASSET_DEFS, BUCKET_INFO, LIABILITIES, TEMPTATION_LIABILITIES, WINS, DEALS */

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
   /* NOTE: profile desc says "below 16" but code checks freeTime()>=8 (timeUsed<=16).
      Kept consistent with code: freeTime>=8 means timeUsed<=16. */
   unique:'If free time reaches 8 or more, earn bonus income each month. Delegation pays.'},
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
/* All costs and income in Indian Rupees — sc() scales to local currency at runtime */
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

/* ─── TEMPTATION LIABILITIES ─── */
/* Used by lifestyle temptation event when cash > 3x expenses */
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
/* All min/max values in Indian Rupees — sc() scales at runtime */
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
