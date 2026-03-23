/* PLUTOCRAT v11 — plutocrat-data-events.js */
/* Layer 1 — Pure Data. No DOM. No logic. No state mutation. */
/* Contains: ALL_EVENTS, BLACK_SWAN_EVENTS, EVENT_RESPONSES */
/* Depends on: window.sc, window.netPassive, window.totalExp, window.recalc */
/* Load order: after plutocrat-data-core.js, before plutocrat-engine-core.js */

'use strict';

/* ─── REGULAR EVENT CARDS (20 events, shuffled each game) ─── */
/* FEATURE 3 FIX — "Lifestyle inflation" event now fires rLifestyleInflation screen */
/* instead of silently adding expense. The fn is replaced by a trigger flag. */
var ALL_EVENTS=[
  {type:'opportunity',title:'Angel deal on the table',
   body:'An investor offers to fund your next venture for 20% equity. Vision from you, capital from them.',
   effect:'+80,000 injected',
   fn:function(G){G.cash+=sc(80000);}},

  {type:'setback',title:'Self-employed trap activated',
   body:'You fell sick for 2 weeks. Business made zero. No systems. No income.',
   effect:'-50,000 lost',
   fn:function(G){G.cash=Math.max(0,G.cash-sc(50000));}},

  {type:'lesson',title:'The time audit revelation',
   body:'80% of what you do could be done by someone paid far less.',
   effect:'Delegation 50% off this month',
   fn:function(G){G.delegDiscount=true;}},

  {type:'opportunity',title:'Investment windfall',
   body:'One of your assets had an exceptional quarter.',
   effect:'+30,000 bonus',
   fn:function(G){G.cash+=sc(30000);}},

  /* FEATURE 3 — Lifestyle inflation now sets a pending flag instead of auto-adding expense.
     The engine picks this up in checkSpecialEvents() and routes to rLifestyleInflation screen.
     The amount and label are stored so the screen can display them clearly. */
  {type:'setback',title:'Lifestyle inflation',
   body:'Good month. You upgraded. Expenses never came back down.',
   effect:'Lifestyle inflation event — you decide',
   isLifestyleInflation:true,
   inflationAmount:8000,
   inflationLabel:'Lifestyle upgrade',
   fn:function(G){
     /* Set pending flag — engine will route to lifestyle inflation screen */
     G.pendingLifestyleInflation={
       amount:sc(8000),
       label:'Lifestyle upgrade (Y'+G.year+' M'+G.month+')',
       id:'lif_'+G.month+'_'+G.year
     };
   }},

  {type:'opportunity',title:'Joint venture carry',
   body:'You connected two parties who needed each other. 15% carry.',
   effect:'+45,000 carry',
   fn:function(G){G.cash+=sc(45000);}},

  {type:'setback',title:'Single point of failure',
   body:'Your biggest client walked. Revenue dropped 60% overnight.',
   effect:'-40,000',
   fn:function(G){G.cash=Math.max(0,G.cash-sc(40000));}},

  {type:'opportunity',title:'Delegation breakthrough',
   body:'Your team handled the entire month without a single call to you.',
   effect:'-4 time units freed permanently',
   fn:function(G){G.timeUsed=Math.max(0,G.timeUsed-4);}},

  {type:'lesson',title:'The plutocrat realisation',
   body:'Net worth is not salary. It is the value of assets producing income without requiring your time.',
   effect:'Wisdom card',
   fn:function(){}},

  {type:'market',title:'Bull market quarter',
   body:'Everything went up. Patience rewarded again.',
   effect:'+25,000',
   fn:function(G){G.cash+=sc(25000);}},

  {type:'market',title:'Market correction',
   body:'The market dipped. The panicked sold. The patient held.',
   effect:'-20,000',
   fn:function(G){G.cash=Math.max(0,G.cash-sc(20000));}},

  {type:'opportunity',title:'Royalty stream unlocked',
   body:'Something you created once now generates recurring revenue forever.',
   effect:'+12,000/mo new passive stream',
   fn:function(G){
     G.assets.push({
       id:'royalty_'+G.month,
       name:'Royalty stream',
       type:'passive',
       bucket:'cf',
       income:sc(12000),
       expense:sc(200),
       time:0,
       count:1,
       newThisMonth:true,
       monthsOwned:0
     });
     recalc(G);
   }},

  {type:'setback',title:'Medical emergency',
   body:'Unplanned medical costs. No passive income means you felt every unit.',
   effect:'-45,000',
   fn:function(G){G.cash=Math.max(0,G.cash-sc(45000));}},

  {type:'lesson',title:"OPM — Other People's Money",
   body:'The wealthy rarely use their own money. Leverage is the tool.',
   effect:'Next investment 25% off',
   fn:function(G){G.opmDiscount=true;}},

  {type:'opportunity',title:'Strategic partnership',
   body:'A complementary business wants to cross-promote. Zero cost.',
   effect:'+22,000',
   fn:function(G){G.cash+=sc(22000);}},

  {type:'setback',title:'Rental vacancy',
   body:'Your rental property sat empty this month. Zero rent. Maintenance still ran.',
   effect:'Rental income skipped this month',
   fn:function(G){
     G.assets.forEach(function(a){
       if(a.type==='real estate'&&!a.newThisMonth)a.vacantThisMonth=true;
     });
   }},

  {type:'setback',title:'Property damage',
   body:'Tenant caused significant damage. Emergency repair bill arrived.',
   effect:'-30,000 unexpected repair',
   fn:function(G){G.cash=Math.max(0,G.cash-sc(30000));}},

  {type:'setback',title:'Platform demonetisation',
   body:'Your content channel was demonetised for a month. Zero ad revenue.',
   effect:'Content channel income skipped this month',
   fn:function(G){
     G.assets.forEach(function(a){
       if(a.id==='content')a.vacantThisMonth=true;
     });
   }},

  {type:'market',title:'Startup IPO exit',
   body:'A startup you backed went public. Early believers rewarded.',
   effect:'+60,000',
   fn:function(G){G.cash+=sc(60000);}},

  {type:'lesson',title:'Time is the only non-renewable resource',
   body:'You can make more money. You cannot make more time.',
   effect:'1 time unit freed this month',
   fn:function(G){G.timeUsed=Math.max(0,G.timeUsed-1);}}
];

/* ─── BLACK SWAN EVENTS (6 events, once per year, fire at month 6 by default) ─── */
var BLACK_SWAN_EVENTS=[
  {type:'blackswan',title:'Market crash',
   body:'Global markets collapsed 40%. Portfolios wiped. Leveraged investors destroyed. Cash holders survived.',
   effect:'50% of cash wiped',
   fn:function(G){G.cash=Math.floor(G.cash*0.5);}},

  {type:'blackswan',title:'Legal dispute',
   body:'A deal gone wrong. Legal fees and settlement costs arrive without warning. Protect everything.',
   effect:'-60% of cash in legal costs',
   fn:function(G){G.cash=Math.floor(G.cash*0.4);}},

  {type:'blackswan',title:'Health crisis',
   body:'Six months of treatment. Business paused. Income disrupted. The one thing money cannot fully solve.',
   effect:'-40% of cash + 1 month income suspended',
   fn:function(G){
     G.cash=Math.floor(G.cash*0.6);
     G.assets.forEach(function(a){if(!a.newThisMonth)a.vacantThisMonth=true;});
   }},

  {type:'blackswan',title:'Regulatory shutdown',
   body:'A new law shut down your primary revenue stream overnight. No warning. No appeal.',
   effect:'Largest asset suspended for 2 months',
   fn:function(G){
     var active=G.assets.filter(function(a){return !a.newThisMonth;});
     if(active.length){
       active.sort(function(a,b){return b.income-a.income;});
       active[0].vacantThisMonth=true;
       active[0].regulatorySuspended=2;
     }
   }},

  {type:'blackswan',title:'Key person dependency',
   body:'Your most important partner left. Took clients, relationships and half the deal pipeline.',
   effect:'-35% cash + reputation drops 2',
   fn:function(G){
     G.cash=Math.floor(G.cash*0.65);
     G.reputation=Math.max(0,G.reputation-2);
   }},

  {type:'blackswan',title:'Currency devaluation',
   body:'The local currency lost 30% of value overnight. Import costs spiked. Asset values dropped.',
   effect:'All expenses increase 20% this month',
   fn:function(G){G.blackSwanExpenseSpike=0.20;}}
];

/* ─── SMART EVENT RESPONSES ─── */
/* Each black swan event type has 3 tiers: unprepared, partial, prepared */
/* Conditions evaluated against G state at event time */
/* Depends on window.netPassive and window.totalExp globals exposed by engine core */
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
      damage:function(G){
        G.assets.forEach(function(a){if(a.type==='real estate'&&!a.newThisMonth)a.vacantThisMonth=true;});
      }
    },
    partial:{
      title:'Cash buffer absorbed the vacancy.',
      body:'Your reserves covered the missing month. No income, but no crisis either.',
      why:'Your cash buffer was between 3x and 6x monthly expenses.',
      damage:function(G){
        G.assets.forEach(function(a){if(a.type==='real estate'&&!a.newThisMonth)a.vacantThisMonth=true;});
      }
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
      damage:function(G){
        G.cash=Math.floor(G.cash*0.5);
        if(G.loanAmount>0)G.cash=Math.floor(G.cash*0.8);
      }
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
      var np=netPassive();
      var exp=totalExp();
      var hasManager=G.hasManager;
      if(np>=exp&&hasManager)return 'prepared';
      if(np>=exp||hasManager)return 'partial';
      return 'unprepared';
    },
    unprepared:{
      title:'Total income loss.',
      body:'No systems. No passive income. Everything stopped when you stopped. Six months of recovery with zero income.',
      why:'You are the business. When you cannot work, the business cannot work.',
      damage:function(G){
        G.cash=Math.floor(G.cash*0.6);
        G.assets.forEach(function(a){if(!a.newThisMonth)a.vacantThisMonth=true;});
      }
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
      damage:function(G){
        G.assets.forEach(function(a){if(a.id==='content')a.vacantThisMonth=true;});
      }
    },
    partial:{
      title:'Content hit. Everything else held.',
      body:'The channel went dark but your other income streams continued. The total damage was contained.',
      why:'Multiple income streams or SOP meant the content loss was partial.',
      damage:function(G){
        G.assets.forEach(function(a){if(a.id==='content')a.vacantThisMonth=true;});
      }
    },
    prepared:{
      title:'Minimal impact. Recovery started immediately.',
      body:'Multiple streams absorbed the content loss. SOP meant the recovery plan was already documented.',
      why:'Diversification and systems turned a setback into a minor disruption.',
      damage:function(G){
        G.assets.forEach(function(a){if(a.id==='content')a.vacantThisMonth=true;});
      }
    }
  },

  'Legal dispute':{
    check:function(G){
      var cashRatio=G.cash/Math.max(1,totalExp());
      var hasSOP=G.assets.find(function(a){return a.id==='build_sop'&&!a.newThisMonth;});
      var highDiscipline=G.disciplineScore>=5;
      if(hasSOP&&cashRatio>=6)return 'prepared';
      if(hasSOP||cashRatio>=4||highDiscipline)return 'partial';
      return 'unprepared';
    },
    unprepared:{
      title:'Full legal cost absorbed.',
      body:'No documented systems, no cash buffer. Legal fees consumed 60% of your reserves. Deals with undocumented terms carry maximum exposure.',
      why:'No SOP and low cash reserves meant you had zero protection when the dispute arrived.',
      damage:function(G){G.cash=Math.floor(G.cash*0.4);}
    },
    partial:{
      title:'Partial protection held.',
      body:'Some documentation or cash buffer reduced the damage. The dispute was costly but survivable.',
      why:'Either documented processes or a cash buffer provided partial defence.',
      damage:function(G){G.cash=Math.floor(G.cash*0.7);}
    },
    prepared:{
      title:'Documented and defended.',
      body:'Every agreement had paper trails. Legal fees were covered by your buffer. The dispute resolved quickly because your systems made your position clear.',
      why:'SOP documentation and strong cash reserves gave your legal team what they needed.',
      damage:function(G){G.cash=Math.floor(G.cash*0.88);}
    }
  },

  'Key person dependency':{
    check:function(G){
      var hasSOP=G.assets.find(function(a){return a.id==='build_sop'&&!a.newThisMonth;});
      var hasManager=G.hasManager;
      var streams=G.assets.filter(function(a){return !a.newThisMonth&&a.income>0;}).length;
      if(hasSOP&&hasManager)return 'prepared';
      if(hasSOP||hasManager||(streams>=3))return 'partial';
      return 'unprepared';
    },
    unprepared:{
      title:'Everything walked out the door with them.',
      body:'No documented processes. No redundancy. One person leaving took clients, relationships and the deal pipeline. The business was the person — not the system.',
      why:'Without SOP or a manager, your operation had no institutional memory.',
      damage:function(G){
        G.cash=Math.floor(G.cash*0.65);
        G.reputation=Math.max(0,G.reputation-2);
      }
    },
    partial:{
      title:'Painful but recoverable.',
      body:'You lost some of the pipeline. But either your systems preserved the client relationships or your manager bridged the gap. You rebuilt within the month.',
      why:'One layer of protection — SOP, manager, or diversified income — absorbed the impact.',
      damage:function(G){
        G.cash=Math.floor(G.cash*0.82);
        G.reputation=Math.max(0,G.reputation-1);
      }
    },
    prepared:{
      title:'The system did not miss a beat.',
      body:'Documented processes meant nobody could walk out with institutional knowledge. Your manager had full context. The departure was an inconvenience, not a crisis.',
      why:'SOP plus manager meant your business ran on systems, not on people.',
      damage:function(G){G.cash=Math.floor(G.cash*0.95);}
    }
  },

  'Medical emergency':{
    check:function(G){
      var np=netPassive();
      var exp=totalExp();
      var cashRatio=G.cash/Math.max(1,exp);
      var hasManager=G.hasManager;
      if(np>=exp&&hasManager&&cashRatio>=6)return 'prepared';
      if(np>=exp||hasManager||cashRatio>=4)return 'partial';
      return 'unprepared';
    },
    unprepared:{
      title:'Stopped earning. Still spending.',
      body:'No passive income. No manager. When you could not work, everything stopped except the bills. Six weeks of zero income with full expenses.',
      why:'Without passive income or systems, your income was entirely dependent on your physical presence.',
      damage:function(G){G.cash=Math.floor(G.cash*0.55);}
    },
    partial:{
      title:'Partial continuity.',
      body:'Either your passive income covered the basics or your manager kept things moving. Not both — but enough to prevent a crisis.',
      why:'One layer of protection held while the other was missing.',
      damage:function(G){G.cash=Math.floor(G.cash*0.78);}
    },
    prepared:{
      title:'The portfolio did not need you to recover.',
      body:'Passive income covered all expenses. Manager kept operations running. The emergency was personal — not financial. Your systems gave you the space to heal.',
      why:'Strong passive income, manager automation, and cash buffer created a complete safety net.',
      damage:function(){}
    }
  },

  'Single point of failure':{
    check:function(G){
      var streams=G.assets.filter(function(a){return !a.newThisMonth&&a.income>0;}).length;
      var cats=[];
      G.assets.forEach(function(a){
        if(!a.newThisMonth&&a.bucket&&cats.indexOf(a.bucket)===-1)cats.push(a.bucket);
      });
      var diversified=cats.length>=3;
      if(streams>=4&&diversified)return 'prepared';
      if(streams>=2||diversified)return 'partial';
      return 'unprepared';
    },
    unprepared:{
      title:'One client gone. Everything gone.',
      body:'Your biggest client walked. Revenue dropped 60% instantly. When one source is your entire income, it is not a business — it is a dependency.',
      why:'Single income source with no diversification meant this was a total failure.',
      damage:function(G){G.cash=Math.max(0,G.cash-sc(40000));}
    },
    partial:{
      title:'Significant hit. Others held.',
      body:'The major client leaving hurt. But at least one other stream continued. The wound was real, but the patient survived.',
      why:'Some diversification meant the damage was partial, not fatal.',
      damage:function(G){G.cash=Math.max(0,G.cash-sc(20000));}
    },
    prepared:{
      title:'Diversification absorbed it completely.',
      body:'Four income streams. Three asset buckets. When one source contracted, the others continued without interruption. The client walked — your income did not.',
      why:'True diversification across multiple streams and buckets made this a non-event.',
      damage:function(){}
    }
  },

  'Market correction':{
    check:function(G){
      var hasDiversified=G.assets.filter(function(a){return !a.newThisMonth;}).length>=2;
      var hasLoan=G.loanAmount>0;
      var highDiscipline=G.disciplineScore>=4;
      if(hasDiversified&&highDiscipline&&!hasLoan)return 'prepared';
      if(hasDiversified||highDiscipline)return 'partial';
      return 'unprepared';
    },
    unprepared:{
      title:'Fully exposed to the correction.',
      body:'Concentrated position with active debt. The correction amplified every vulnerability. Leveraged positions in falling markets are how fortunes are lost.',
      why:'Single asset type and active loan magnified the downside.',
      damage:function(G){
        G.cash=Math.max(0,G.cash-sc(20000));
        if(G.loanAmount>0)G.cash=Math.floor(G.cash*0.85);
      }
    },
    partial:{
      title:'Dipped but recovered.',
      body:'Some diversification softened the blow. The correction was felt but not devastating. A reminder that markets always move in both directions.',
      why:'Partial diversification or discipline provided a buffer against the full impact.',
      damage:function(G){G.cash=Math.max(0,G.cash-sc(8000));}
    },
    prepared:{
      title:'Bought the dip.',
      body:'Diversified portfolio. No debt. High discipline. While others were selling in panic, your position was stable enough to consider buying more. The correction was a gift.',
      why:'Discipline and diversification turned a correction into a buying opportunity.',
      damage:function(G){G.cash+=sc(10000);}
    }
  },

  'Property damage':{
    check:function(G){
      var cashRatio=G.cash/Math.max(1,totalExp());
      var hasManager=G.hasManager;
      if(hasManager&&cashRatio>=5)return 'prepared';
      if(hasManager||cashRatio>=3)return 'partial';
      return 'unprepared';
    },
    unprepared:{
      title:'Emergency repair. No buffer. No manager.',
      body:'The damage was significant and the repair bill arrived without warning. No cash reserve meant the repair came directly from your operating funds.',
      why:'No cash buffer and no manager meant you absorbed the full cost with no protection.',
      damage:function(G){G.cash=Math.max(0,G.cash-sc(30000));}
    },
    partial:{
      title:'Covered — just.',
      body:'Either your cash reserve absorbed it or your manager handled the contractor. The repair was expensive but the damage to your finances was manageable.',
      why:'One layer of protection held.',
      damage:function(G){G.cash=Math.max(0,G.cash-sc(15000));}
    },
    prepared:{
      title:'Manager handled it. Buffer covered it.',
      body:'Your manager identified the problem, sourced the contractor, and oversaw the repair. Your cash reserve covered the cost without touching your investment capital.',
      why:'Manager plus strong cash reserves turned an emergency into a managed expense.',
      damage:function(G){G.cash=Math.max(0,G.cash-sc(5000));}
    }
  }
};
