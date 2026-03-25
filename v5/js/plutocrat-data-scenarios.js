/* PLUTOCRAT v11 — plutocrat-data-scenarios.js */
/* Layer 1 — Pure Data. No DOM. No logic. No state mutation. */
/* Contains: DEAL_SCENARIOS, LEGEND_EVENTS, DEALMAKER_PASSIVE_DEALS */
/* Depends on: window.sc */
/* Load order: after plutocrat-data-events.js, before plutocrat-engine-core.js */

'use strict';

/* ─── HISTORICAL DEAL SCENARIOS (15 scenarios, profile-specific) ─── */
/* Profile keys: employee, selfemployed, inheritor, dealmaker, all */
/* Each scenario: id, profiles[], minMonth, title, setup, choices[], outcomes{} */
var DEAL_SCENARIOS=[

  /* ── TYPE 1: REFUSED THE BUYER ── */
  {
    id:'sc_social_refusal',
    profiles:['dealmaker','selfemployed'],
    minMonth:3,
    title:'The Billion-Dollar Walk-Out',
    setup:'A struggling search giant — Yohoo — approaches your most promising venture. Their offer: buy it for what feels like a life-changing sum. Your board is excited. The number has many zeros. But you believe you are only 10% of the way there. Yohoo\'s own platform is shrinking. They are buying your future to save their past.',
    choices:[
      {id:'sell',label:'Take the money',desc:'Accept Yohoo\'s offer. The cash is real. The future is uncertain.',hint:'A certain win today. But what if you are right about the future?'},
      {id:'refuse',label:'Walk out of the meeting',desc:'Decline the offer. Bet on your own vision. Accept the risk.',hint:'The founder who did this was called insane by his board. He was 22.'},
      {id:'counter',label:'Counter at 10x their offer',desc:'Stay in the room but price yourself out. If they say yes, it is worth it.',hint:'The price that makes walking away easy is the price that respects your future.'}
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
      {id:'pass',label:'Pass — search is already solved',desc:'Decline the acquisition. Your portal is profitable. This is a distraction.',hint:'This is what Excitel actually did.'},
      {id:'buy',label:'Buy it for the asking price',desc:'One million is nothing. The technology is real. Buy it and figure out the model later.',hint:'Nobody in the room could see the model. That was the opportunity.'},
      {id:'invest',label:'Take a small stake instead',desc:'Do not acquire fully. Invest a small amount for equity and watch what happens.',hint:'Sometimes the right move is a toe in the water, not a full dive.'}
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
      {id:'pass',label:'Pass — the model makes no sense',desc:'Physical media is the business. Online streaming has no margins.',hint:'This is what every studio actually decided.'},
      {id:'buy',label:'Buy a stake at the current valuation',desc:'The technology is real. The behaviour shift is coming. Get in early.',hint:'The studios who passed spent billions trying to catch up later.'},
      {id:'wait',label:'Watch for one more year before deciding',desc:'Wait for proof before committing capital.',hint:'Waiting for certainty means paying certainty prices.'}
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
      {id:'gooble_side',label:'Advise Gooble — hold the rational bid',desc:'19 billion for zero revenue is insane. Discipline is not overpaying.',hint:'Gooble lost the bid. Then built a competitor. The competitor failed.'},
      {id:'facepage_side',label:'Advise Facepage — pay whatever it takes',desc:'400 million users is not a product. It is a moat. Pay for the moat.',hint:'Facepage paid 19 billion. Within five years Chatpulse was worth more than that.'},
      {id:'advise_counter',label:'Advise Chatpulse to reject both and stay independent',desc:'Neither offer reflects the true value. Stay independent and raise at your own terms.',hint:'Independence has a price. So does dependence.'}
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
      {id:'side_media',label:'Side with the media executives — overvalued',desc:'Without content rights, video hosting is a liability not an asset.',hint:'The media companies who laughed are mostly gone now.'},
      {id:'side_gooble',label:'Side with Gooble — buy the distribution',desc:'Content is temporary. Distribution is permanent. Viewtube owns attention.',hint:'Gooble paid 1.65 billion. Viewtube became the second most visited site on earth.'},
      {id:'buy_stake',label:'Take your own stake in Viewtube before the deal closes',desc:'If Gooble sees this value, get in before they finalise.',hint:'The best deals happen before the headline.'}
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
      {id:'advise_proceed',label:'Advise the deal proceeds — strategic necessity',desc:'Mobile is the future. Neither company can win alone. Together they can compete.',hint:'This is what the boards decided. The result was catastrophic.'},
      {id:'advise_stop',label:'Advise against — the cultures cannot merge',desc:'The financials look right. The human reality does not. Acquisitions are culture mergers first.',hint:'The deal destroyed both companies\' mobile ambitions within three years.'},
      {id:'advise_restructure',label:'Advise a licensing deal instead of acquisition',desc:'Mikrocorp licenses Nokria\'s patents. No cultural merger. No integration risk.',hint:'The value was in the IP, not the organisation.'}
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
      {id:'invest',label:'Invest — this is the future of media',desc:'Old media plus internet equals dominance. Get in before the announcement.',hint:'Shareholders lost 200 billion dollars in value from this deal.'},
      {id:'stay_out',label:'Stay out — two weak strategies do not make one strong one',desc:'AOLnet is declining. Timewarner is scared. Fear-based mergers destroy value.',hint:'The analysts who avoided this saved their clients from catastrophic loss.'},
      {id:'short',label:'Position against — this will destroy value',desc:'If you are right about the cultural mismatch, the destruction will be significant.',hint:'The brave move when everyone is celebrating is to ask what could go wrong.'}
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
      {id:'sell_now',label:'Sell your stake now — 10x is extraordinary',desc:'A guaranteed 10x return is the dream. Take it.',hint:'Photogram became worth 100 billion inside a decade.'},
      {id:'hold',label:'Hold through the acquisition and beyond',desc:'If Facepage is paying one billion for zero revenue, they see something enormous.',hint:'The founder held. The early investors who held became very wealthy.'},
      {id:'negotiate',label:'Negotiate a partial exit — take half, hold half',desc:'Secure some gains. Keep upside exposure.',hint:'Partial conviction can be the most rational position.'}
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
      {id:'take_cash',label:'Take the salary raise — cash is real',desc:'Options might be worthless. Salary is guaranteed.',hint:'The colleagues who chose cash at companies like Applix in 1997 still regret it.'},
      {id:'take_options',label:'Take the options — bet on the company',desc:'If the company works, the options could be worth everything.',hint:'Options in a great company at an early stage are the most underpriced asset in existence.'},
      {id:'negotiate_both',label:'Negotiate half salary raise and half options',desc:'Take some security and some upside.',hint:'The rational middle — but the extraordinary return only comes from full conviction.'}
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
      {id:'sell',label:'Sell — 15x is extraordinary',desc:'Exit. Deploy the capital into passive assets. Build the next thing.',hint:'There is no wrong answer here. Only different futures.'},
      {id:'keep',label:'Keep — 40% growth compounds fast',desc:'At this growth rate, 15x today is 3x in two years.',hint:'But growth always slows. And buyers do not always return.'},
      {id:'partial',label:'Sell 40% — take cash, keep control',desc:'Bring in a partner. Fund the growth. Keep the upside.',hint:'Strategic capital with retained control is a different game entirely.'}
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
      {id:'sell_now',label:'Sell at current market value',desc:'The cash is real. The infrastructure project might not happen.',hint:'Most families in this position sold. The infrastructure project always happened.'},
      {id:'hold',label:'Hold — the infrastructure project changes everything',desc:'You have read the notices. The value will triple. Patience is the strategy.',hint:'Information asymmetry is the oldest edge in real estate.'},
      {id:'develop',label:'Develop it yourself before the project completes',desc:'Do not wait for the government. Build on it now and capture the uplift.',hint:'The active move requires capital and risk. But the return is direct.'}
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
      {id:'sell',label:'Sell — protect what is left',desc:'Stop the bleeding. Move to cash. Wait for clarity.',hint:'Selling in a crash locks in the loss permanently.'},
      {id:'hold',label:'Hold — do not crystallise the loss',desc:'Stay invested. Markets recover. Patience is the strategy.',hint:'Every crash in history was eventually followed by a recovery.'},
      {id:'buy',label:'Buy more — everything is on sale',desc:'Fear is the discount. Deploy reserves into assets at 35% off.',hint:'The investors who bought in the crash of 2008 made generational returns by 2015.'}
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
      {id:'stay_incumbent',label:'Stay with the incumbent — free cannot last',desc:'Jiotel is burning cash. The incumbents have infrastructure and profits.',hint:'Three incumbent carriers went bankrupt within 18 months of Jiotel\'s launch.'},
      {id:'move_to_jiotel',label:'Move capital to Jiotel\'s parent — free is the strategy',desc:'Free is not a cost. It is a customer acquisition strategy at scale.',hint:'Jiotel gained 400 million users in 18 months. The incumbents never recovered.'},
      {id:'split',label:'Split — hedge between incumbent and disruptor',desc:'Reduce incumbent exposure. Take a position in the disruptor.',hint:'Hedging is rational. But full conviction in the right direction pays more.'}
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
  },

  /* ── INHERITOR-SPECIFIC SCENARIOS ── */
  {
    id:'sc_inheritor_trust',
    profiles:['inheritor'],
    minMonth:2,
    title:'The Advisor Who Knew Best',
    setup:'Your family wealth manager has been handling the estate for 20 years. He recommends moving 60% of your inherited portfolio into a "guaranteed" structured product he is selling. Your uncle — a retired businessman — quietly tells you the product has high hidden fees and the manager earns a large commission from it. The manager has never lost money for your family before.',
    choices:[
      {id:'trust_manager',label:'Trust the manager — 20 years of loyalty means something',desc:'He has never failed the family. The product must be sound.',hint:'Commission-driven advice is never truly independent advice.'},
      {id:'trust_uncle',label:'Listen to your uncle — follow the incentives',desc:'Ask who benefits from this recommendation before you decide.',hint:'The best financial advice always comes from someone with nothing to gain.'},
      {id:'do_own_research',label:'Pause — read the product documents yourself before deciding',desc:'Never sign anything you have not personally understood.',hint:'Most financial disasters begin with documents nobody actually read.'}
    ],
    outcomes:{
      trust_manager:{
        title:'The fees compounded. The returns did not.',
        body:'The product performed — but after fees, your actual return was a fraction of the market. The manager earned a significant commission. Your loyalty cost you years of compounding.',
        lesson:'The person selling you a financial product is not your advisor. They are a salesperson.',
        effect:function(G){G.cash=Math.max(0,G.cash-sc(120000));G.disciplineScore=Math.max(0,G.disciplineScore-1);},
        effectLabel:'−cash, −1 discipline'
      },
      trust_uncle:{
        title:'You followed the incentives. You kept the capital.',
        body:'Your uncle was right. The hidden fees would have eroded returns significantly over time. You moved the capital into index funds instead. The manager was offended. The portfolio thanked you.',
        lesson:'Always ask: what does this person earn if I say yes? That answer tells you everything.',
        effect:function(G){G.cash+=sc(80000);G.disciplineScore+=2;},
        effectLabel:'+cash, +2 discipline'
      },
      do_own_research:{
        title:'You read the documents. You found the fees on page 47.',
        body:'Hidden in the fine print was a 3.5% annual management fee and a 5% early exit penalty. You declined the product, moved the capital yourself and earned the full market return. Reading one document saved years of compounding.',
        lesson:'Page 47 is where they hide the truth. Always read page 47.',
        effect:function(G){G.cash+=sc(120000);G.disciplineScore+=3;},
        effectLabel:'+cash, +3 discipline'
      }
    }
  },

  {
    id:'sc_inheritor_business',
    profiles:['inheritor'],
    minMonth:4,
    title:'The Family Business You Did Not Build',
    setup:'Your family owns a profitable manufacturing business. A private equity firm offers to buy it for 15x earnings — a life-changing sum. Your cousins want to sell immediately and split the proceeds. Your father built this business over 30 years and left it to you. The business still has strong cash flow but the industry is changing fast.',
    choices:[
      {id:'sell_all',label:'Sell — take the 15x and deploy into diversified assets',desc:'15x earnings is a premium valuation. The capital can work harder elsewhere.',hint:'Concentrated family business risk is real. Diversification is not betrayal.'},
      {id:'refuse_sell',label:'Refuse to sell — honour what your father built',desc:'This business is legacy, not just income. You will grow it yourself.',hint:'Emotional attachment to assets is the most expensive kind.'},
      {id:'partial_sell',label:'Sell 60% — take capital off the table, keep operational control',desc:'Partner with the PE firm. Take liquidity. Keep upside and legacy.',hint:'The best deal is often the one that gives you both certainty and future.'}
    ],
    outcomes:{
      sell_all:{
        title:'You took the premium. You deployed the capital.',
        body:'15x earnings was a once-in-a-decade valuation. You sold, diversified across five asset classes and generated more passive income than the business ever produced. The industry shifted two years later — the PE firm struggled. You did not.',
        lesson:'Valuation is a moment in time. Diversification is permanent protection.',
        effect:function(G){G.cash+=sc(500000);G.disciplineScore+=2;G.reputation=Math.min(10,G.reputation+1);},
        effectLabel:'+cash, +2 discipline, +1 reputation'
      },
      refuse_sell:{
        title:'Loyalty is not a strategy.',
        body:'You kept the business. The industry shifted. Margins compressed. Two years later a buyer offered 6x — less than half the original offer. Emotional attachment to an asset had a very precise cost.',
        lesson:'Your father built it for your freedom — not for you to be imprisoned by it.',
        effect:function(G){G.cash=Math.max(0,G.cash-sc(100000));G.disciplineScore=Math.max(0,G.disciplineScore-1);},
        effectLabel:'−cash, −1 discipline'
      },
      partial_sell:{
        title:'You took liquidity and kept the legacy.',
        body:'The PE firm brought operational expertise. You brought knowledge and continuity. The business grew. Your diversified capital also grew. You had both — the security of diversification and the upside of ownership.',
        lesson:'The best deals create options — not obligations.',
        effect:function(G){G.cash+=sc(300000);G.disciplineScore+=2;G.reputation=Math.min(10,G.reputation+2);},
        effectLabel:'+cash, +2 discipline, +2 reputation'
      }
    }
  }
];

/* ─── LEGEND EVENTS (6 rare narrative moments) ─── */
/* Fire after month 8, 25% chance per month, spaced minimum 5 months apart */
/* Precede the regular event when triggered */
var LEGEND_EVENTS=[
  {
    id:'leg_patience',
    title:'The Patience Lesson',
    body:'A mentor sits across from you. He has built more wealth than most countries. He says one thing: "The stock market is a device for transferring money from the impatient to the patient." He pauses. "Which one are you right now?"',
    lesson:'Wealth is not built in a month. It is built in the decisions you make every month for years.',
    effect:function(G){G.disciplineScore+=2;},
    effectLabel:'+2 discipline'
  },
  {
    id:'leg_first_passive',
    title:'The First Passive Cheque',
    body:'It arrived while you were asleep. A deposit — not from your work, not from your time, not from your presence. From a system you built months ago and then forgot about. You stared at the notification for a long time.',
    lesson:'The first unit of passive income is worth more than the thousandth. It is proof of a different life.',
    effect:function(G){G.disciplineScore+=1;G.cash+=sc(5000);},
    effectLabel:'+1 discipline, small passive bonus'
  },
  {
    id:'leg_burn_boats',
    title:'Burn the Boats',
    body:'You are offered a safe path back. A former employer calls. The salary is higher than before. The role is prestigious. Your passive income is real but still fragile. This is the moment every builder faces: the retreat is available. Will you take it?',
    lesson:'Safety and freedom are not the same thing. One is an illusion — the question is which one you are choosing.',
    effect:function(G){G.disciplineScore+=3;},
    effectLabel:'+3 discipline'
  },
  {
    id:'leg_compound_letter',
    title:'The Letter from Year Ten',
    body:'You write a letter to yourself — ten years from now. You describe what you are building. The assets. The systems. The time that will be yours. You fold it. You put it away. You go back to work.',
    lesson:'Clarity of future vision is the most powerful motivator available. Most people never write the letter.',
    effect:function(G){G.disciplineScore+=2;G.reputation=Math.min(10,G.reputation+1);},
    effectLabel:'+2 discipline, +1 reputation'
  },
  {
    id:'leg_warning',
    title:'The Warning',
    body:'Your most trusted mentor calls. He has watched you accumulate. He says: "The first million is the hardest. The second destroys more people than the first. You are about to find out which kind of person you are."',
    lesson:'Wealth does not reveal character. It amplifies it.',
    effect:function(G){G.disciplineScore+=1;},
    effectLabel:'+1 discipline'
  },
  {
    id:'leg_optional',
    title:'The Day You Became Optional',
    body:'The month closed. Expenses paid. Income collected. Deals reviewed. You were at the beach. You did not receive a single call. Your operation ran — completely — without your physical presence for the first time.',
    lesson:'The goal was never to be busy. The goal was to become optional.',
    effect:function(G){G.disciplineScore+=2;G.timeUsed=Math.max(0,G.timeUsed-1);},
    effectLabel:'+2 discipline, -1 time used permanently'
  }
];

/* ─── DEALMAKER PASSIVE INCOME DEALS ─── */
/* Shown in the Buy screen exclusively for the Dealmaker profile */
var DEALMAKER_PASSIVE_DEALS=[
  {
    id:'deal_retainer',
    name:'Ongoing retainer contract',
    bucket:'cf',
    cost:0,
    income:18000,
    expense:2000,
    time:2,
    type:'passive',
    repReq:4,
    repeatable:true,
    sellVal:function(a){return Math.round(sc(18000)*12*(a.monthsOwned||1)*0.5);},
    desc:'Convert your best client relationship into a monthly retainer. They pay for access — not outputs. Passive income from your reputation.',
    condition:function(G){return G.dealsDone>=3&&G.reputation>=4;}
  },
  {
    id:'deal_equity_stake',
    name:'Equity stake in closed deal',
    bucket:'eq',
    cost:0,
    income:12000,
    expense:500,
    time:1,
    type:'business',
    repReq:6,
    repeatable:true,
    sellVal:function(a){return Math.round(sc(12000)*18*(a.monthsOwned||1)*0.4);},
    desc:'Instead of taking a fee, take equity. The business you helped build now pays you every month. Risk taken at the deal table — income collected forever.',
    condition:function(G){return G.dealsDone>=6&&G.reputation>=6;}
  }
];
