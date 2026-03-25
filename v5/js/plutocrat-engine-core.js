/* PLUTOCRAT v11 — plutocrat-engine-core.js */
/* Layer 2 — Core engine: state, logic, helpers, save/load, builders */
/* Load order: after all 3 data files */
/* Exposes: window.PG, window.sc, window.netPassive, window.totalExp, window.recalc */

'use strict';

(function(){

/* ─────────────────────────────────────────
   LOCATION
─────────────────────────────────────────── */
var LOC={currency:'₹',country:'India',city:'India',
  housing:LDATA.IN.housing,groceries:LDATA.IN.groceries};

function applyLoc(code){
  var d=LDATA[code]||LDATA.IN;
  LOC.currency=d.currency;LOC.country=d.country;LOC.city=d.city;
  LOC.housing=d.housing;LOC.groceries=d.groceries;
}

function detectLocation(cb){
  var done=false;
  function finish(code,city){if(done)return;done=true;applyLoc(code||'IN');if(city)LOC.city=city;cb(true);}
  var t=setTimeout(function(){if(!done){done=true;cb(false);}},4000);
  if(typeof fetch!=='undefined'){
    fetch('https://ipapi.co/json/').then(function(r){return r.json();})
      .then(function(d){clearTimeout(t);finish(d.country_code,d.city);}).catch(tryJSONP);
  } else {tryJSONP();}
  function tryJSONP(){
    if(done)return;
    var s=document.createElement('script');
    window._ipCb=function(d){clearTimeout(t);finish(d.country_code,d.city);delete window._ipCb;};
    s.src='https://ipapi.co/jsonp/?callback=_ipCb';
    s.onerror=function(){clearTimeout(t);if(!done){done=true;cb(false);}};
    document.head.appendChild(s);
  }
}

/* ─────────────────────────────────────────
   CURRENCY SCALING
─────────────────────────────────────────── */
var RATES={IN:1,US:0.012,GB:0.0096,AE:0.044,SG:0.016,AU:0.018};
function getCurCode(){
  var c=LOC.currency;
  if(c==='$')return 'US';if(c==='£')return 'GB';
  if(c==='AED')return 'AE';if(c==='S$')return 'SG';if(c==='A$')return 'AU';
  return 'IN';
}
function sc(n){var r=RATES[getCurCode()]||1;return Math.round(n*r);}
function fmt(n){return LOC.currency+Math.abs(Math.round(n)).toLocaleString();}
function fmtS(n){return(n<0?'−':'+')+ LOC.currency+Math.abs(Math.round(n)).toLocaleString();}

/* ─────────────────────────────────────────
   EXPOSE HELPERS TO GLOBAL SCOPE
   Data file functions (sellVal, effect, damage) are defined outside
   the IIFE and call sc(), netPassive(), totalExp(), recalc() at runtime.
─────────────────────────────────────────── */
window.sc=function(n){return sc(n);};
window.netPassive=function(){return netPassive();};
window.totalExp=function(){return totalExp();};
window.recalc=function(){recalc();};

/* ─────────────────────────────────────────
   GAME STATE — G
   All missing fields from briefing added.
   State fields are initialised here, reset() mirrors all of them.
─────────────────────────────────────────── */
var G={
  screen:'title',playerName:'',profile:null,
  month:1,year:1,cash:0,
  expenses:[],assets:[],liabilities:[],log:[],
  eventDeck:[],usedEvents:[],eventCard:null,
  hasManager:false,housing:null,grocery:null,
  monthIncomes:null,monthExpenses:null,
  delegDiscount:false,opmDiscount:false,
  passiveIncome:0,passiveExpense:0,
  salaryGrowthBonus:0,monthsPlayed:0,timeUsed:0,
  reputation:3,dealsDone:0,dealsDoneByCategory:{},dealsDoneById:[],
  carriedExpenses:[],
  disciplineScore:0,taxRate:30,
  loanAmount:0,loanMonthlyPayment:0,
  identityShiftShown:false,
  lifestyleTemptationPending:false,lifestyleTemptationShown:false,
  blackSwanDrawnThisYear:false,blackSwanExpenseSpike:0,
  consolidationPhase:false,consecutivePassiveCoverageMonths:0,inflationFactor:1,
  managerMonthlySalary:0,
  scenariosFired:[],
  pendingScenario:null,
  survivalStep:0,
  bankruptcyLog:[],
  legendFired:[],
  passiveFirstFireSeen:false,
  /* v11 state fields (all from briefing) */
  tutorialDismissed:false,
  showFullLog:false,
  dealFilter:'all',
  lastScenarioMonth:0,
  lastLegendMonth:0,
  survivalAsset:null,
  survivalMortgageAsset:null,
  pendingOutcome:null,
  blackSwanMonth:6,
  _lastSettleResult:null,
  loanStartsNextMonth:false,    /* FIX 2 — loan interest starts next month */
  pendingLegend:null,
  /* Feature 3 — lifestyle inflation choice pending */
  pendingLifestyleInflation:null,
  /* BUG 2 FIX — hudBreakupKey must be in G so it survives save/load */
  hudBreakupKey:'cash'
};

/* ─────────────────────────────────────────
   CORE HELPERS
─────────────────────────────────────────── */
function gel(id){return document.getElementById(id);}
function addLog(msg){G.log.unshift('Y'+G.year+' M'+G.month+': '+msg);if(G.log.length>30)G.log.pop();}

function recalc(){
  G.passiveIncome=G.assets.reduce(function(s,a){return a.newThisMonth?s:s+(a.income||0);},0);
  G.passiveExpense=G.assets.reduce(function(s,a){return a.newThisMonth?s:s+(a.expense||0);},0);
}

function netPassive(){return G.passiveIncome-G.passiveExpense;}

function totalExp(){
  var spike=G.blackSwanExpenseSpike||0;
  var mgrSalary=G.hasManager?G.managerMonthlySalary:0;
  var base=G.expenses.reduce(function(s,e){
    /* Feature 2 — skip paused or stopped expenses from total */
    if(e.paused||e.stopped)return s;
    return s+e.amount;
  },0)
    +G.liabilities.reduce(function(s,l){
      if(l.paused||l.stopped)return s;
      return s+l.monthly;
    },0)
    +(G.housing?G.housing.cost:0)
    +(G.grocery?G.grocery.cost:0)
    +G.passiveExpense
    /* FIX 2 — skip loan payment if it starts next month */
    +(G.loanStartsNextMonth?0:G.loanMonthlyPayment)
    +mgrSalary;
  return Math.round(base*(1+spike)*G.inflationFactor);
}

function freeTime(){return Math.max(0,24-G.timeUsed);}
function timePct(){return Math.round((freeTime()/24)*100);}
function timeColor(){var f=freeTime();return f<=4?'var(--red)':f>=16?'var(--green)':'var(--gold)';}
function prof(){return PROFILES.find(function(p){return p.id===G.profile;});}

function salary(){
  var p=prof();if(!p)return 0;
  var base=sc(p.salaryBase)+(G.salaryGrowthBonus||0);
  if(G.profile==='selfemployed'&&G.timeUsed>=24)return Math.floor(base*0.5);
  return base;
}
function salaryTax(){return Math.round(salary()*(G.taxRate/100));}
function passiveTax(income){var rate=Math.max(5,Math.round(G.taxRate/2));return Math.round(income*(rate/100));}

function dealPrereqMet(deal){
  if(!deal.prereq||!deal.prereq.length)return true;
  return deal.prereq.every(function(pid){return G.dealsDoneById.indexOf(pid)>-1;});
}
function missingPrereqs(deal){
  if(!deal.prereq||!deal.prereq.length)return [];
  return deal.prereq.filter(function(pid){return G.dealsDoneById.indexOf(pid)===-1;})
    .map(function(pid){var d=DEALS.find(function(x){return x.id===pid;});return d?d.name:pid;});
}

function checkLifestyleTemptation(){
  var exp=totalExp();if(exp<=0)return false;
  var ratio=G.cash/Math.max(1,exp);
  if(ratio>=3&&!G.lifestyleTemptationShown){G.lifestyleTemptationPending=true;return true;}
  return false;
}

/* BUG 3 FIX — removed recalc() call from inside checkWin(). */
/* rGame() calls recalc() before checkWin(), so it is already current. */
/* BUG 8 FIX — tiers evaluated in ascending order (I→II→III→IV).        */
/* Previously Tier II (cash) was checked before Tier I (passive coverage) */
/* causing players who hit both simultaneously to skip Tier I entirely.   */
function checkWin(){
  var exp=totalExp();
  var mp=G.monthsPlayed;
  var np=netPassive();
  /* Tier IV — consolidation legacy win (must be in consolidation phase) */
  if(G.consolidationPhase&&G.consecutivePassiveCoverageMonths>=3&&np>=exp*3)return WINS[3];
  /* Tier III — full time freedom + passive coverage */
  if(np>0&&np>=exp&&freeTime()>=18&&mp>=5)return WINS[2];
  /* Tier I — passive covers expenses (checked before Tier II cash milestone) */
  if(np>0&&np>=exp&&mp>=3)return WINS[0];
  /* Tier II — cash milestone */
  if(G.cash>=sc(1000000))return WINS[1];
  return null;
}

/* ─────────────────────────────────────────
   CARD DECK
─────────────────────────────────────────── */
function shuffleDeck(){
  var d=ALL_EVENTS.slice();
  for(var i=d.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=d[i];d[i]=d[j];d[j]=t;}
  G.eventDeck=d;G.usedEvents=[];
}
function drawCard(){
  if(!G.eventDeck.length){shuffleDeck();}
  var c=G.eventDeck.pop();G.usedEvents.push(c);return c;
}
function drawBlackSwan(){
  return BLACK_SWAN_EVENTS[Math.floor(Math.random()*BLACK_SWAN_EVENTS.length)];
}

/* ─────────────────────────────────────────
   SCENARIO CHECK
   Renamed sc_obj → scenarioObj and sc_check → scenarioCheck
   to avoid visual confusion with sc() function name.
─────────────────────────────────────────── */
function checkScenario(){
  for(var i=0;i<DEAL_SCENARIOS.length;i++){
    var scenarioObj=DEAL_SCENARIOS[i];
    if(G.scenariosFired.indexOf(scenarioObj.id)>-1)continue;
    if(G.month<(scenarioObj.minMonth||1))continue;
    if(scenarioObj.profiles.indexOf('all')===-1&&scenarioObj.profiles.indexOf(G.profile)===-1)continue;
    var lastFired=G.scenariosFired.length;
    if(lastFired>0&&G.monthsPlayed-(G.lastScenarioMonth||0)<3)continue;
    if(G.cash<sc(20000)&&G.assets.length===0)continue;
    /* BUG 5 FIX — lastScenarioMonth is set by the caller when the scenario is
       committed, not here. Setting it inside the finder caused the cooldown to
       start one call too early, blocking scenarios for an extra month. */
    return scenarioObj;
  }
  return null;
}

/* ─────────────────────────────────────────
   LEGEND EVENT CHECK
─────────────────────────────────────────── */
function checkLegend(){
  if(!LEGEND_EVENTS||!LEGEND_EVENTS.length)return null;
  if(G.monthsPlayed<8)return null;
  var lastLeg=G.lastLegendMonth||0;
  if(G.monthsPlayed-lastLeg<5)return null;
  var eligible=LEGEND_EVENTS.filter(function(l){return G.legendFired.indexOf(l.id)===-1;});
  if(!eligible.length)return null;
  if(Math.random()>0.25)return null;
  return eligible[Math.floor(Math.random()*eligible.length)];
}

/* ─────────────────────────────────────────
   SETTLE MONTH — sole cash movement engine
   Cash only changes here. cashTaken flag prevents
   double-counting between manual collection and settle tally.
─────────────────────────────────────────── */
function settleMonth(){
  recalc();
  var collectedIncome=0;
  var salaryTaxAmt=0;var passiveTaxAmt=0;var paidExp=0;
  /* Self-employed delegation bonus: freeTime()>=8 means timeUsed<=16 */
  var seBonus=(G.profile==='selfemployed'&&freeTime()>=8)?sc(20000):0;

  if(G.monthIncomes){
    G.monthIncomes.forEach(function(item){
      if(item.done&&item.amount>0&&!item.cashTaken){
        collectedIncome+=item.amount;
        if(item.isSalary)salaryTaxAmt+=salaryTax();
        if(item.isPassive)passiveTaxAmt+=passiveTax(item.amount);
      }
      /* BUG 12 FIX — manager auto-collect marks items cashTaken=true and
         deducts tax at collection time. Add that tax to the tally so the
         end-of-month summary correctly reports total tax paid this month. */
      if(item.done&&item.amount>0&&item.cashTaken){
        if(item.isSalary)salaryTaxAmt+=salaryTax();
        if(item.isPassive)passiveTaxAmt+=passiveTax(item.amount);
      }
    });
  }

  if(G.monthExpenses){
    G.monthExpenses.forEach(function(item){
      if(item.done&&!item.cashTaken){paidExp+=item.amount;}
    });
  }

  var totalTax=salaryTaxAmt+passiveTaxAmt;
  var net=collectedIncome+seBonus-paidExp-totalTax;

  G.cash=G.cash+net;
  G.monthsPlayed++;
  G.blackSwanExpenseSpike=0;

  /* Employee trap — salary grows when no assets */
  if(G.profile==='employee'&&G.assets.filter(function(a){return !a.newThisMonth;}).length===0)
    G.salaryGrowthBonus=(G.salaryGrowthBonus||0)+sc(5000);

  addLog('Month closed. Income:'+fmt(collectedIncome)+' Tax:'+fmt(totalTax)+' Exp:'+fmt(paidExp)+' Net:'+fmtS(net));

  /* Carry skipped non-mandatory expenses with late fee */
  var newCarried=[];
  if(G.monthExpenses){
    G.monthExpenses.forEach(function(item){
      if((!item.done||item.skipped)&&!item.mandatory){
        var monthsSkipped=(item.skippedMonths||0)+1;
        var lateFee=monthsSkipped>=2?Math.round(item.amount*0.1):0;
        var carriedAmt=item.amount+lateFee;
        var originalId=item.isCarried?item.originalId:item.id;
        var existing=newCarried.find(function(c){return c.id===originalId;});
        if(existing){existing.amount+=carriedAmt;existing.monthsSkipped=monthsSkipped;}
        else{newCarried.push({id:originalId,label:item.isCarried?item.label.split(' (overdue')[0]:item.label,amount:carriedAmt,monthsSkipped:monthsSkipped});}
        if(lateFee>0)addLog('Late fee: '+item.label+' +'+fmt(lateFee));
      }
    });
  }
  G.carriedExpenses=newCarried;

  checkLifestyleTemptation();

  var np=netPassive();
  if(G.consolidationPhase){
    var exp=totalExp();
    if(np>=exp*3){G.consecutivePassiveCoverageMonths++;}
    else{G.consecutivePassiveCoverageMonths=0;}
    if(G.month===12){G.inflationFactor=+(G.inflationFactor*1.02).toFixed(4);}
  }

  return{collectedIncome:collectedIncome,totalTax:totalTax,paidExp:paidExp,net:net,seBonus:seBonus,newCarried:newCarried};
}

/* ─────────────────────────────────────────
   CASH SHORTAGE CHECK
   Returns true if shortage detected post-settle.
   Steps through 3-stage survival sequence.
─────────────────────────────────────────── */
function checkCashShortage(){
  var exp=totalExp();
  if(G.cash<0||(G.cash===0&&exp>0)){
    var sellable=G.assets.filter(function(a){
      return !a.newThisMonth&&a.type!=='delegation'&&!a.mortgage;
    });
    if(sellable.length>0){
      sellable.sort(function(a,b){return (a.income||0)-(b.income||0);});
      G.survivalStep=1;
      G.survivalAsset=sellable[0];
    } else {
      var mortgageable=G.assets.filter(function(a){
        return !a.newThisMonth&&a.type==='real estate'&&!a.mortgage;
      });
      if(mortgageable.length>0){
        G.survivalStep=2;
        G.survivalMortgageAsset=mortgageable[0];
      } else {
        G.survivalStep=3;
      }
    }
    return true;
  }
  G.survivalStep=0;
  return false;
}

/* ─────────────────────────────────────────
   MORTGAGE HELPERS
─────────────────────────────────────────── */
function assetMarketValue(a){
  var def=ASSET_DEFS.find(function(d){return d.id===a.id||a.id.indexOf(d.id)===0;});
  return def?def.sellVal(a):sc(50000);
}

function mortgageAsset(assetIdx){
  var a=G.assets[assetIdx];
  if(!a||a.newThisMonth||a.mortgage)return;
  var mv=assetMarketValue(a);
  var principal=Math.floor(mv*0.6);
  var monthlyPayment=Math.round(principal*0.10/12);
  a.mortgage={principal:principal,monthlyPayment:monthlyPayment,balance:principal};
  G.cash+=principal;
  addLog('Mortgaged: '+a.name+'. Received '+fmt(principal)+'. Monthly: '+fmt(monthlyPayment)+'/mo (10% p.a.)');
  return{principal:principal,monthlyPayment:monthlyPayment};
}

function repayMortgage(assetIdx){
  var a=G.assets[assetIdx];
  if(!a||!a.mortgage)return;
  var bal=a.mortgage.balance;
  if(G.cash<bal){
    showModal('Insufficient cash','Need '+fmt(bal)+' to clear mortgage. You have '+fmt(G.cash)+'.',
      [{label:'OK',cls:'btn-ghost',fn:'PG.closeModal();'}]);return;
  }
  G.cash-=bal;
  addLog('Mortgage repaid on '+a.name+'. '+fmt(bal)+' cleared.');
  delete a.mortgage;
  render();
}

/* ─────────────────────────────────────────
   MODAL
─────────────────────────────────────────── */
function showModal(title,body,btns){
  var bhtml=btns.map(function(b){
    return '<button class="btn '+b.cls+'" onclick="'+b.fn+'" style="margin:4px">'+b.label+'</button>';
  }).join('');
  var m=gel('modal');m.style.display='block';
  m.innerHTML='<div style="position:fixed;inset:0;background:rgba(0,0,0,0.88);display:flex;align-items:center;justify-content:center;padding:20px;z-index:201" onclick="PG.closeModal()">'
    +'<div class="modal-box" onclick="event.stopPropagation()">'
    +'<div class="modal-title">'+title+'</div>'
    +'<div class="modal-body">'+body+'</div>'
    +'<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px">'+bhtml+'</div>'
    +'</div></div>';
}
function closeModal(){var m=gel('modal');m.style.display='none';m.innerHTML='';}

/* ─────────────────────────────────────────
   INCOME / EXPENSE BUILDERS
─────────────────────────────────────────── */
function buildMonthIncomes(){
  var sal=salary();var list=[];
  if(sal>0)list.push({id:'salary',label:G.profile==='selfemployed'?'Business revenue':'Salary',
    amount:sal,type:'salary',done:false,mandatory:true,isSalary:true});
  G.assets.forEach(function(a,i){
    if(!a.newThisMonth&&a.income>0&&!a.vacantThisMonth)
      list.push({id:'asset_inc_'+i,label:a.name+(a.count>1?' x'+a.count:''),
        amount:a.income,type:'passive income',done:false,mandatory:false,isPassive:true,assetIdx:i});
    if(!a.newThisMonth&&a.vacantThisMonth)
      list.push({id:'asset_vac_'+i,label:a.name+' (vacant / suspended)',
        amount:0,type:'passive income — skipped',done:true,mandatory:false});
  });
  return list;
}

function buildMonthExpenses(){
  var list=[];
  var spike=G.blackSwanExpenseSpike||0;
  var inf=G.inflationFactor||1;
  function adj(n){return Math.round(n*(1+spike)*inf);}

  if(G.housing)list.push({id:'housing',label:'Rent — '+G.housing.name,amount:adj(G.housing.cost),
    type:'fixed',locked:true,mandatory:true,done:false,skippedMonths:0});
  if(G.grocery)list.push({id:'grocery',label:'Groceries — '+G.grocery.name,amount:adj(G.grocery.cost),
    type:'fixed',locked:true,mandatory:true,done:false,skippedMonths:0});

  /* FIX 2 — skip loan interest if loanStartsNextMonth flag is set */
  if(G.loanMonthlyPayment>0&&!G.loanStartsNextMonth)
    list.push({id:'loan_interest',label:'Loan interest payment',amount:adj(G.loanMonthlyPayment),
      type:'debt service',locked:true,mandatory:true,done:false,skippedMonths:0});

  if(G.hasManager&&G.managerMonthlySalary>0)
    list.push({id:'mgr_salary',label:'Manager salary',amount:adj(G.managerMonthlySalary),
      type:'delegation',locked:true,mandatory:true,done:false,skippedMonths:0});

  G.assets.forEach(function(a,i){
    if(!a.newThisMonth&&a.expense>0)
      list.push({id:'asset_exp_'+i,label:a.name+' — maintenance / fees',amount:adj(a.expense),
        type:'asset expense',locked:false,mandatory:false,done:false,skippedMonths:0});
    if(!a.newThisMonth&&a.mortgage){
      list.push({id:'mortgage_'+i,label:a.name+' — mortgage payment',amount:adj(a.mortgage.monthlyPayment),
        type:'mortgage',locked:true,mandatory:true,done:false,skippedMonths:0,isMortgage:true,assetIdx:i});
    }
  });

  /* Feature 2 — skip paused and stopped expenses from active bill list */
  G.expenses.forEach(function(e){
    if(e.stopped)return; /* stopped: permanently removed from billing */
    if(e.paused&&e.pausedMonthsRemaining>0)return; /* paused: skip while paused */
    list.push(Object.assign({},e,{amount:adj(e.amount),done:false,skippedMonths:0}));
  });

  G.liabilities.forEach(function(l){
    if(l.stopped)return;
    if(l.paused&&l.pausedMonthsRemaining>0)return;
    list.push({id:'liab_'+l.id,label:l.name+' (monthly)',amount:adj(l.monthly),
      type:'liability',locked:false,mandatory:false,done:false,skippedMonths:0,liabIdx:G.liabilities.indexOf(l)});
  });

  G.carriedExpenses.forEach(function(ce){
    list.push({id:ce.id+'_carried',label:ce.label+' (overdue — '+ce.monthsSkipped+' month'+(ce.monthsSkipped>1?'s':'')+' skipped)',
      amount:ce.amount,type:'overdue',locked:false,mandatory:false,done:false,
      skippedMonths:ce.monthsSkipped,isCarried:true,originalId:ce.id});
  });

  return list;
}

/* BUG 6 FIX — allMandatoryExpDone() returns false when monthExpenses is null
   AND there are genuine mandatory expenses (housing, grocery, loan, manager, mortgages).
   Returns true only when null AND there are genuinely no mandatory expense sources. */
function allMandatoryExpDone(){
  if(!G.monthExpenses){
    var hasMandatory=(G.housing)||(G.grocery)||(G.loanMonthlyPayment>0&&!G.loanStartsNextMonth)||(G.hasManager&&G.managerMonthlySalary>0)||(G.assets.some(function(a){return !a.newThisMonth&&a.mortgage;}));
    return !hasMandatory;
  }
  var m=G.monthExpenses.filter(function(i){return i.mandatory;});
  if(!m.length)return true;
  return m.every(function(i){return i.done;});
}

/* FIX 1 — allIncomeDone() returns false when monthIncomes is null,
   forcing player to visit collect screen before passing. */
function allIncomeDone(){
  if(!G.monthIncomes)return false;
  if(!G.monthIncomes.length)return true;
  return G.monthIncomes.every(function(i){return i.done;});
}

function canPass(){return allIncomeDone()&&allMandatoryExpDone();}

/* ─────────────────────────────────────────
   MANAGER AUTO-PAY
   Pays mandatory first, then optional, stops if cash exhausted.
─────────────────────────────────────────── */
function managerAutoPayExpenses(){
  if(!G.monthExpenses)G.monthExpenses=buildMonthExpenses();
  var mandatory=G.monthExpenses.filter(function(i){return i.mandatory&&!i.done;});
  var optional=G.monthExpenses.filter(function(i){return !i.mandatory&&!i.done;});
  var items=mandatory.concat(optional);
  items.forEach(function(item){
    if(item.done)return;
    if(G.cash>=item.amount){
      G.cash=Math.max(0,G.cash-item.amount);
      item.done=true;
      item.cashTaken=true;
    }
  });
}

/* ─────────────────────────────────────────
   BUG 10 FIX — MORTGAGE PRINCIPAL REDUCTION
   Applied in nextMonth() for each mortgaged asset.
   interest = balance * rate/12
   principalReduction = monthlyPayment - interest
   balance = Math.max(0, balance - principalReduction)
─────────────────────────────────────────── */
function reduceMortgageBalances(){
  G.assets.forEach(function(a){
    if(a.mortgage&&a.mortgage.balance>0){
      var rate=a.mortgage.emergency?0.18:0.10;
      var interest=a.mortgage.balance*(rate/12);
      var principalReduction=a.mortgage.monthlyPayment-interest;
      if(principalReduction>0){
        a.mortgage.balance=Math.max(0,Math.round(a.mortgage.balance-principalReduction));
      }
    }
  });
}

/* ─────────────────────────────────────────
   BUG 5 FIX — flash CSS injection removed.
   .event-flash is now defined cleanly in plutocrat.css only.
   The injection block that checked for pg-flash-style is gone.
─────────────────────────────────────────── */

/* ─────────────────────────────────────────
   SAVE / LOAD
─────────────────────────────────────────── */
var SAVE_KEY='plutocrat_v11_save';
function saveGame(){
  try{
    var data=JSON.stringify(G);
    localStorage.setItem(SAVE_KEY,data);
  }catch(e){}
}
function loadGame(){
  try{
    var data=localStorage.getItem(SAVE_KEY);
    if(!data)return false;
    var saved=JSON.parse(data);
    var safeScreens=['game','collect','pay_expenses','buy','deals','borrow','endmonth','win','bankruptcy'];
    if(safeScreens.indexOf(saved.screen)===-1)saved.screen='game';
    Object.assign(G,saved);
    recalc();
    return true;
  }catch(e){return false;}
}
function clearSave(){
  try{localStorage.removeItem(SAVE_KEY);}catch(e){}
}
function autosave(){
  try{saveGame();}catch(e){}
}

/* ─────────────────────────────────────────
   RENDER ENGINE — dispatch table
   Screens are defined in plutocrat-engine-screens.js
─────────────────────────────────────────── */
function render(){
  var tr=gel('tright');
  var setupScreens=['title','setup_loc','setup_name','setup_profile','setup_housing','setup_grocery'];
  if(setupScreens.indexOf(G.screen)>-1){tr.innerHTML='';}
  else{
    recalc();
    tr.innerHTML=G.playerName+' &nbsp;Y'+G.year+' M'+G.month
      +'<br>'+fmt(G.cash)+' &nbsp;net passive: '+fmtS(netPassive())
      +(G.consolidationPhase?' &nbsp;<span style="color:var(--gold)">CONSOLIDATION</span>':'');
  }
  var s=gel('screen');s.innerHTML='';
  var map={
    title:rTitle,setup_loc:rSetupLoc,setup_name:rName,setup_profile:rProfile,
    setup_housing:rHousing,setup_grocery:rGrocery,
    game:rGame,collect:rCollect,pay_expenses:rPayExp,
    buy:rBuy,deals:rDeals,event:rEvent,smart_response:rSmartResponse,
    endmonth:rEnd,win:rWin,
    identity_shift:rIdentityShift,consolidation:rConsolidation,borrow:rBorrow,
    scenario:rScenario,scenario_outcome:rScenarioOutcome,
    legend:rLegend,
    survival:rSurvival,bankruptcy:rBankruptcy,
    /* Feature 1 — HUD breakup screen */
    hud_breakup:rHudBreakup,
    /* Feature 3 — lifestyle inflation choice screen */
    lifestyle_inflation:rLifestyleInflation
  };
  if(map[G.screen])map[G.screen](s);
}

/* ─────────────────────────────────────────
   PUBLIC API STUB
   Full window.PG is built by engine-actions-a/b/c.
   This stub ensures closeModal is available immediately
   so any screen rendered before actions load can call it.
─────────────────────────────────────────── */
window.PG={closeModal:closeModal};

/* ─────────────────────────────────────────
   NEXT MONTH
   Contains: mortgage principal reduction (BUG 10),
   asset aging, stack merging, month rollover.
─────────────────────────────────────────── */
function nextMonth(){
  if(G.month>=12){
    G.month=1;G.year++;G.blackSwanDrawnThisYear=false;
    G.blackSwanMonth=3+Math.floor(Math.random()*8);
  }
  else{G.month++;}

  if(G.month===1)G.lifestyleTemptationShown=false;

  /* BUG 10 FIX — reduce mortgage balances based on principal amortisation */
  reduceMortgageBalances();

  /* FIX 2 — clear loanStartsNextMonth flag so loan interest appears from this month */
  G.loanStartsNextMonth=false;

  /* Feature 2 — decrement pause counters */
  G.expenses.forEach(function(e){
    if(e.paused&&e.pausedMonthsRemaining>0){
      e.pausedMonthsRemaining--;
      if(e.pausedMonthsRemaining===0){e.paused=false;addLog(e.label+' resumed after pause.');}
    }
  });
  G.liabilities.forEach(function(l){
    if(l.paused&&l.pausedMonthsRemaining>0){
      l.pausedMonthsRemaining--;
      if(l.pausedMonthsRemaining===0){l.paused=false;addLog(l.name+' resumed after pause.');}
    }
  });

  /* Mortgage foreclosure check */
  G.assets.forEach(function(a){
    if(!a.newThisMonth&&a.mortgage){
      if(G.cash<a.mortgage.monthlyPayment){
        var def=ASSET_DEFS.find(function(d){return d.id===a.id||a.id.indexOf(d.id)===0;});
        var fv=def?Math.floor(def.sellVal(a)*0.8):sc(50000);
        var remaining=Math.max(0,fv-a.mortgage.balance);
        G.cash+=remaining;
        addLog('FORECLOSURE: '+a.name+' sold at 80% value. Mortgage cleared. Net: '+fmt(remaining)+'.');
        a._foreclosed=true;
      }
    }
  });
  G.assets=G.assets.filter(function(a){return !a._foreclosed;});

  /* Age assets, merge stacks */
  var toMerge=[];var toKeep=[];
  G.assets.forEach(function(a){
    if(a.newThisMonth){
      a.newThisMonth=false;
      if(a.stackParent)toMerge.push(a);
      else toKeep.push(a);
    } else {
      a.monthsOwned=(a.monthsOwned||0)+1;
      a.vacantThisMonth=false;
      if(a.regulatorySuspended>0){
        a.regulatorySuspended--;
        if(a.regulatorySuspended===0)addLog(a.name+' regulatory suspension lifted.');
      }
      toKeep.push(a);
    }
  });
  toMerge.forEach(function(m){
    var parent=toKeep.find(function(a){return a.id===m.stackParent;});
    if(parent){parent.income+=m.income;parent.expense+=m.expense;parent.count=(parent.count||1)+1;}
    else{m.id=m.stackParent;delete m.stackParent;toKeep.push(m);}
  });
  G.assets=toKeep;

  /* Reset monthly working state */
  G.monthIncomes=null;G.monthExpenses=null;G.eventCard=null;
  G.lifestyleTemptationPending=false;
  G.survivalAsset=null;G.survivalMortgageAsset=null;

  recalc();G.screen='game';autosave();render();
}

/* ─────────────────────────────────────────
   RESET
   Mirrors all G fields including all v11 additions.
─────────────────────────────────────────── */
function resetGame(){
  clearSave();
  Object.assign(G,{
    screen:'title',playerName:'',profile:null,month:1,year:1,cash:0,
    expenses:[],assets:[],liabilities:[],log:[],eventDeck:[],usedEvents:[],eventCard:null,
    hasManager:false,housing:null,grocery:null,monthIncomes:null,monthExpenses:null,
    delegDiscount:false,opmDiscount:false,passiveIncome:0,passiveExpense:0,
    salaryGrowthBonus:0,monthsPlayed:0,timeUsed:0,reputation:3,dealsDone:0,
    dealsDoneByCategory:{},dealsDoneById:[],carriedExpenses:[],
    disciplineScore:0,taxRate:30,loanAmount:0,loanMonthlyPayment:0,
    identityShiftShown:false,lifestyleTemptationPending:false,lifestyleTemptationShown:false,
    blackSwanDrawnThisYear:false,blackSwanExpenseSpike:0,blackSwanMonth:6,
    consolidationPhase:false,consecutivePassiveCoverageMonths:0,inflationFactor:1,
    managerMonthlySalary:0,
    scenariosFired:[],pendingScenario:null,survivalStep:0,bankruptcyLog:[],
    lastScenarioMonth:0,lastLegendMonth:0,
    tutorialDismissed:false,showFullLog:false,dealFilter:'all',
    survivalAsset:null,survivalMortgageAsset:null,pendingOutcome:null,
    _lastSettleResult:null,passiveFirstFireSeen:false,
    legendFired:[],pendingLegend:null,
    loanStartsNextMonth:false,
    pendingLifestyleInflation:null,
    /* BUG 2 FIX — reset hudBreakupKey to default */
    hudBreakupKey:'cash'
  });
  render();
}

/* ─────────────────────────────────────────
   INIT
─────────────────────────────────────────── */
function init(){
  detectLocation(function(success){
    G.screen=success?'title':'setup_loc';
    render();
  });
}

/* ─────────────────────────────────────────
   EXPOSE INTERNALS VIA window._PGInternal
   engine-actions-a/b/c are standalone files (no shared IIFE).
   They access all core functions through this bridge object.
─────────────────────────────────────────── */
window._PGInternal={
  /* State */
  G:G,LOC:LOC,SAVE_KEY:SAVE_KEY,
  /* Render */
  render:render,
  /* Helpers */
  gel:gel,fmt:fmt,fmtS:fmtS,sc:sc,addLog:addLog,autosave:autosave,
  /* Calc */
  recalc:recalc,netPassive:netPassive,totalExp:totalExp,
  freeTime:freeTime,timePct:timePct,timeColor:timeColor,
  salary:salary,salaryTax:salaryTax,passiveTax:passiveTax,prof:prof,
  /* Checks */
  checkWin:checkWin,checkScenario:checkScenario,checkLegend:checkLegend,
  checkCashShortage:checkCashShortage,checkLifestyleTemptation:checkLifestyleTemptation,
  canPass:canPass,allIncomeDone:allIncomeDone,allMandatoryExpDone:allMandatoryExpDone,
  dealPrereqMet:dealPrereqMet,missingPrereqs:missingPrereqs,
  /* Builders */
  buildMonthIncomes:buildMonthIncomes,buildMonthExpenses:buildMonthExpenses,
  managerAutoPayExpenses:managerAutoPayExpenses,
  /* Card deck */
  shuffleDeck:shuffleDeck,drawCard:drawCard,drawBlackSwan:drawBlackSwan,
  /* Mortgage */
  mortgageAsset:mortgageAsset,repayMortgage:repayMortgage,assetMarketValue:assetMarketValue,
  /* Modal */
  showModal:showModal,closeModal:closeModal,
  /* Save/load */
  saveGame:saveGame,loadGame:loadGame,clearSave:clearSave,
  /* Location */
  applyLoc:applyLoc,
  /* Game flow */
  nextMonth:nextMonth,resetGame:resetGame,settleMonth:settleMonth,
  /* Init */
  init:init
};

/* ─────────────────────────────────────────
   CLOSE IIFE
   engine-core.js opens and closes its own IIFE.
   engine-actions-a/b/c are standalone files that
   access internals via window._PGInternal.
─────────────────────────────────────────── */
})();
