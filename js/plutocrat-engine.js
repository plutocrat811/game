/* PLUTOCRAT v11 — plutocrat-engine.js */
/* Layer 2 — All state, all logic, all rendering. Reads Layer 1 (plutocrat-data.js). */

'use strict';

(function(){

/* ─── LOCATION ─── */
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

/* ─── CURRENCY SCALING ─── */
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

/* ─── GAME STATE ─── */
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
  /* v11 additions */
  managerMonthlySalary:0,    /* mandatory monthly expense when manager hired */
  scenariosFired:[],         /* ids of scenarios already shown */
  pendingScenario:null,      /* scenario object waiting to be shown */
  survivalStep:0,            /* 0=none 1=liquidate 2=mortgage 3=bankrupt */
  bankruptcyLog:[]           /* copy of log at bankruptcy for display */
};

/* ─── HELPERS ─── */
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
  var base=G.expenses.reduce(function(s,e){return s+e.amount;},0)
    +G.liabilities.reduce(function(s,l){return s+l.monthly;},0)
    +(G.housing?G.housing.cost:0)+(G.grocery?G.grocery.cost:0)
    +G.passiveExpense+G.loanMonthlyPayment+mgrSalary;
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
function checkWin(){
  var exp=totalExp();recalc();var mp=G.monthsPlayed;var np=netPassive();
  if(G.consolidationPhase&&G.consecutivePassiveCoverageMonths>=3&&np>=exp*3)return WINS[3];
  if(np>0&&np>=exp&&freeTime()>=20&&mp>=5)return WINS[2];
  if(G.cash>=sc(1000000))return WINS[1];
  if(np>0&&np>=exp&&mp>=3)return WINS[0];
  return null;
}

/* ─── CARD DECK ─── */
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

/* ─── SCENARIO CHECK ─── */
function checkScenario(){
  /* Returns first eligible scenario not yet fired, or null */
  for(var i=0;i<DEAL_SCENARIOS.length;i++){
    var sc_obj=DEAL_SCENARIOS[i];
    if(G.scenariosFired.indexOf(sc_obj.id)>-1)continue;
    if(G.month<(sc_obj.minMonth||1))continue;
    if(sc_obj.profiles.indexOf('all')===-1&&sc_obj.profiles.indexOf(G.profile)===-1)continue;
    /* Fire at most one per 3 months and only when player has some assets or cash stake */
    var lastFired=G.scenariosFired.length;
    if(lastFired>0&&G.monthsPlayed-G.lastScenarioMonth<3)continue;
    if(G.cash<sc(20000)&&G.assets.length===0)continue;
    return sc_obj;
  }
  return null;
}

/* ─── SETTLE MONTH — sole cash movement engine ─── */
/* Manager marks items done only. ALL cash movement here. */
function settleMonth(){
  recalc();
  var collectedIncome=0;
  var salaryTaxAmt=0;var passiveTaxAmt=0;var paidExp=0;
  var seBonus=(G.profile==='selfemployed'&&freeTime()>=8)?sc(20000):0;

  if(G.monthIncomes){
    G.monthIncomes.forEach(function(item){
      if(item.done&&item.amount>0&&!item.cashTaken){
        collectedIncome+=item.amount;
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

  /* FIX: allow cash to go negative so checkCashShortage fires correctly */
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

/* ─── CASH SHORTAGE CHECK ─── */
/* Returns true if cash shortage detected after settle. Steps through survival sequence. */
function checkCashShortage(){
  var exp=totalExp();
  if(G.cash<0||(G.cash===0&&exp>0)){
    /* Find cheapest non-mortgaged sellable asset */
    var sellable=G.assets.filter(function(a){
      return !a.newThisMonth&&a.type!=='delegation'&&!a.mortgage;
    });
    if(sellable.length>0){
      sellable.sort(function(a,b){return (a.income||0)-(b.income||0);});
      G.survivalStep=1;
      G.survivalAsset=sellable[0];
    } else {
      /* Check for mortgageable assets */
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

/* ─── MORTGAGE HELPERS ─── */
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

/* ─── MODAL ─── */
function showModal(title,body,btns){
  var bhtml=btns.map(function(b){return '<button class="btn '+b.cls+'" onclick="'+b.fn+'" style="margin:4px">'+b.label+'</button>';}).join('');
  var m=gel('modal');m.style.display='block';
  m.innerHTML='<div style="position:fixed;inset:0;background:rgba(0,0,0,0.88);display:flex;align-items:center;justify-content:center;padding:20px;z-index:201" onclick="PG.closeModal()"><div class="modal-box" onclick="event.stopPropagation()"><div class="modal-title">'+title+'</div><div class="modal-body">'+body+'</div><div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px">'+bhtml+'</div></div></div>';
}
function closeModal(){var m=gel('modal');m.style.display='none';m.innerHTML='';}

/* ─── INCOME / EXPENSE BUILDERS ─── */
function buildMonthIncomes(){
  var sal=salary();var list=[];
  if(sal>0)list.push({id:'salary',label:G.profile==='selfemployed'?'Business revenue':'Salary',amount:sal,type:'salary',done:false,mandatory:true,isSalary:true});
  G.assets.forEach(function(a,i){
    if(!a.newThisMonth&&a.income>0&&!a.vacantThisMonth)
      list.push({id:'asset_inc_'+i,label:a.name+(a.count>1?' x'+a.count:''),amount:a.income,type:'passive income',done:false,mandatory:false,isPassive:true,assetIdx:i});
    if(!a.newThisMonth&&a.vacantThisMonth)
      list.push({id:'asset_vac_'+i,label:a.name+' (vacant / suspended)',amount:0,type:'passive income — skipped',done:true,mandatory:false});
  });
  return list;
}
function buildMonthExpenses(){
  var list=[];
  var spike=G.blackSwanExpenseSpike||0;
  var inf=G.inflationFactor||1;
  function adj(n){return Math.round(n*(1+spike)*inf);}
  if(G.housing)list.push({id:'housing',label:'Rent — '+G.housing.name,amount:adj(G.housing.cost),type:'fixed',locked:true,mandatory:true,done:false,skippedMonths:0});
  if(G.grocery)list.push({id:'grocery',label:'Groceries — '+G.grocery.name,amount:adj(G.grocery.cost),type:'fixed',locked:true,mandatory:true,done:false,skippedMonths:0});
  if(G.loanMonthlyPayment>0)list.push({id:'loan_interest',label:'Loan interest payment',amount:adj(G.loanMonthlyPayment),type:'debt service',locked:true,mandatory:true,done:false,skippedMonths:0});
  if(G.hasManager&&G.managerMonthlySalary>0)
    list.push({id:'mgr_salary',label:'Manager salary',amount:adj(G.managerMonthlySalary),type:'delegation',locked:true,mandatory:true,done:false,skippedMonths:0});
  G.assets.forEach(function(a,i){
    if(!a.newThisMonth&&a.expense>0)
      list.push({id:'asset_exp_'+i,label:a.name+' — maintenance / fees',amount:adj(a.expense),type:'asset expense',locked:false,mandatory:false,done:false,skippedMonths:0});
    /* Mortgage payment as mandatory expense */
    if(!a.newThisMonth&&a.mortgage){
      list.push({id:'mortgage_'+i,label:a.name+' — mortgage payment',amount:adj(a.mortgage.monthlyPayment),type:'mortgage',locked:true,mandatory:true,done:false,skippedMonths:0,isMortgage:true,assetIdx:i});
    }
  });
  G.expenses.forEach(function(e){list.push(Object.assign({},e,{amount:adj(e.amount),done:false,skippedMonths:0}));});
  G.liabilities.forEach(function(l){list.push({id:'liab_'+l.id,label:l.name+' (monthly)',amount:adj(l.monthly),type:'liability',locked:false,mandatory:false,done:false,skippedMonths:0});});
  G.carriedExpenses.forEach(function(ce){
    list.push({id:ce.id+'_carried',label:ce.label+' (overdue — '+ce.monthsSkipped+' month'+(ce.monthsSkipped>1?'s':'')+' skipped)',amount:ce.amount,type:'overdue',locked:false,mandatory:false,done:false,skippedMonths:ce.monthsSkipped,isCarried:true,originalId:ce.id});
  });
  return list;
}
function allIncomeDone(){if(!G.monthIncomes||!G.monthIncomes.length)return true;return G.monthIncomes.every(function(i){return i.done;});}
function allMandatoryExpDone(){
  if(!G.monthExpenses)return false;
  var m=G.monthExpenses.filter(function(i){return i.mandatory;});
  if(!m.length)return true;
  return m.every(function(i){return i.done;});
}
function canPass(){return allIncomeDone()&&allMandatoryExpDone();}

/* ─── MANAGER PAY WITH PRIORITY ─── */
/* Manager pays mandatory first, then optional, stops if cash exhausted */
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
    /* If mandatory and cannot afford — leave undone. settleMonth handles carry. */
  });
}

/* ─── RENDER ENGINE ─── */
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
    survival:rSurvival,bankruptcy:rBankruptcy
  };
  if(map[G.screen])map[G.screen](s);
}

/* ─────────────────────────────────────────
   SCREEN RENDERERS
─────────────────────────────────────────── */

function rTitle(s){
  s.innerHTML='<div class="hero">'
    +'<div class="big">PLUTOCRAT</div>'
    +'<div class="tagline">by Billionaire by 20</div>'
    +'<div class="quote">'
    +'A business that requires your time is <em>just another job</em>.<br>'
    +'Real wealth is when assets work — <em>and you don\'t have to</em>.<br>'
    +'The goal is not money. <em>The goal is time.</em>'
    +'</div>'
    +'<div style="font-size:11px;color:var(--text3);margin-bottom:32px;line-height:1.8">Location: <span style="color:var(--gold)">'+LOC.country+(LOC.city&&LOC.city!==LOC.country?', '+LOC.city:'')+'</span> &nbsp;&nbsp; Currency: <span style="color:var(--gold)">'+LOC.currency+'</span></div>'
    +'<div class="brow" style="justify-content:center;gap:12px">'
    +'<button class="btn btn-gold" onclick="PG.start()">Begin your ascent</button>'
    +'<button class="btn btn-ghost" onclick="PG.changeLoc()">Change location</button>'
    +'</div></div>';
}

function rSetupLoc(s){
  s.innerHTML='<div class="ch" style="font-size:20px;margin-bottom:8px">Select your location</div>'
    +'<div style="font-size:12px;color:var(--text3);margin-bottom:22px;line-height:1.6">Choose the country that matches your currency and cost of living.</div>'
    +'<div class="loc-grid">'
    +MANUAL_LOCS.map(function(l){
      return '<div class="loc-card'+(LOC.country===LDATA[l.code].country?' active':'')+'" onclick="PG.setLoc(\''+l.code+'\')">'
        +'<div class="loc-name">'+l.label+'</div>'
        +'<div class="loc-cur">'+l.cur+'</div></div>';
    }).join('')
    +'</div>'
    +'<div class="brow">'
    +'<button class="btn btn-ghost" onclick="PG.fromLoc()">Back</button>'
    +'<button class="btn btn-gold" onclick="PG.fromLoc()">Confirm location</button>'
    +'</div>';
}

function rName(s){
  s.innerHTML='<div class="ch" style="font-size:20px;margin-bottom:8px">What is your name?</div>'
    +'<div style="font-size:12px;color:var(--text3);margin-bottom:24px">This is your game. It should feel like your life.</div>'
    +'<div class="inp-inline">'
    +'<input class="inp" id="ninp" placeholder="Enter your name" maxlength="30" value="'+G.playerName+'" onkeydown="if(event.key===\'Enter\')PG.setName()"/>'
    +'<button class="btn btn-gold" onclick="PG.setName()">Continue</button>'
    +'</div>';
  setTimeout(function(){var i=gel('ninp');if(i)i.focus();},80);
}

function rProfile(s){
  var h='<div class="ch" style="font-size:20px;margin-bottom:6px">Choose your profile, '+G.playerName+'</div>'
    +'<div style="font-size:12px;color:var(--text3);margin-bottom:20px">Your starting point shapes your challenges — not your destiny</div>'
    +'<div class="pgrid">';
  PROFILES.forEach(function(p){
    h+='<div class="pcard'+(G.profile===p.id?' active':'')+'" onclick="PG.pick(\''+p.id+'\')">'
      +'<div class="pbadge '+p.badge+'">'+p.badgeText+'</div>'
      +'<div class="pname">'+p.name+'</div><div class="psub">'+p.tag+'</div>'
      +'<div class="pstat">Cash: <span>'+fmt(sc(p.cash))+'</span></div>'
      +'<div class="pstat">Time used: <span>'+p.timeUsed+'/24</span></div>'
      +'<div class="pstat">Salary: <span>'+fmt(sc(p.salaryBase))+'/mo</span></div>'
      +'<div class="pstat">Tax rate: <span>'+p.taxRate+'%</span></div>'
      +'<div class="pdesc">'+p.desc+'</div>'
      +'<div style="font-size:11px;color:var(--blue);margin-top:8px;line-height:1.6">'+p.unique+'</div>'
      +'</div>';
  });
  h+='</div><div class="brow"><button class="btn btn-gold" onclick="PG.confirmProfile()" '+(G.profile?'':'disabled')+'>Lock in profile</button></div>';
  s.innerHTML=h;
}

function rHousing(s){
  var h='<div class="ch" style="font-size:20px;margin-bottom:6px">Where do you live?</div>'
    +'<div style="font-size:12px;color:var(--text3);margin-bottom:20px">Rent is paid every month — it cannot be skipped.</div>'
    +'<div class="choice-grid">';
  LOC.housing.forEach(function(hh){
    h+='<div class="choice-card'+(G.housing&&G.housing.id===hh.id?' active':'')+'" onclick="PG.setHousing(\''+hh.id+'\')">'
      +'<div class="choice-name">'+hh.name+'</div>'
      +'<div class="choice-cost">'+fmt(hh.cost)+'/month</div>'
      +'<div class="choice-desc">'+hh.desc+'</div>'
      +(hh.perk?'<div class="choice-perk">'+hh.perk+'</div>':'')
      +'</div>';
  });
  h+='</div><div class="brow">'
    +'<button class="btn btn-ghost" onclick="PG.backToProfile()">Back</button>'
    +'<button class="btn btn-gold" onclick="PG.toGrocery()" '+(G.housing?'':'disabled')+'>Next — groceries</button>'
    +'</div>';
  s.innerHTML=h;
}

function rGrocery(s){
  var h='<div class="ch" style="font-size:20px;margin-bottom:6px">Where do you buy groceries?</div>'
    +'<div style="font-size:12px;color:var(--text3);margin-bottom:20px">Groceries are paid every month — cannot be skipped.</div>'
    +'<div class="choice-grid">';
  LOC.groceries.forEach(function(gr){
    h+='<div class="choice-card'+(G.grocery&&G.grocery.id===gr.id?' active':'')+'" onclick="PG.setGrocery(\''+gr.id+'\')">'
      +'<div class="choice-name">'+gr.name+'</div>'
      +'<div class="choice-cost">'+fmt(gr.cost)+'/month</div>'
      +'<div class="choice-desc">'+gr.desc+'</div>'
      +'</div>';
  });
  h+='</div><div class="brow">'
    +'<button class="btn btn-ghost" onclick="PG.backToHousing()">Back</button>'
    +'<button class="btn btn-gold" onclick="PG.startGame()" '+(G.grocery?'':'disabled')+'>Start game</button>'
    +'</div>';
  s.innerHTML=h;
}

function rIdentityShift(s){
  s.innerHTML='<div class="identity-screen">'
    +'<div class="identity-inner">'
    +'<div class="identity-pre">A moment of clarity</div>'
    +'<div class="identity-headline">Last night, while you slept,<br>money arrived.</div>'
    +'<div class="identity-body">'
    +'You did nothing.<br>'
    +'You made no calls. You sent no emails. You attended no meetings.<br>'
    +'And yet — <em>money arrived</em>.<br><br>'
    +'This is not luck. This is not magic.<br>'
    +'This is what happens when you stop selling your time<br>'
    +'and start building <em>systems that work without you</em>.<br><br>'
    +'Welcome to the other side.'
    +'</div>'
    +'<button class="btn btn-gold" onclick="PG.acknowledgeIdentityShift()" style="font-size:13px;padding:14px 36px;letter-spacing:2px">I understand</button>'
    +'</div></div>';
}

function rConsolidation(s){
  s.innerHTML='<div style="text-align:center;padding:48px 20px">'
    +'<div style="font-size:9px;letter-spacing:4px;text-transform:uppercase;color:var(--text3);margin-bottom:16px">Phase shift</div>'
    +'<div class="ch" style="font-size:30px;margin-bottom:20px">The game changes now.</div>'
    +'<div style="font-size:14px;color:var(--text2);line-height:2.2;max-width:560px;margin:0 auto 28px;font-style:italic">'
    +'Getting rich and <em>staying rich</em> are completely different skills.<br>'
    +'You have escaped the rat race.<br>'
    +'Now the challenge is to <em>never go back</em>.'
    +'</div>'
    +'<div style="background:var(--bg2);border:1px solid var(--border-gold);border-radius:10px;padding:22px;max-width:500px;margin:0 auto 28px;text-align:left">'
    +'<div style="font-size:11px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:14px">Consolidation phase — new rules</div>'
    +'<div style="font-size:12px;color:var(--text2);line-height:2">'
    +'● Inflation erodes your passive income by 2% per year<br>'
    +'● Assets occasionally need reinvestment to maintain yield<br>'
    +'● New win: sustain 3x passive coverage for 3 consecutive months<br>'
    +'● Black swan events become more severe'
    +'</div></div>'
    +'<button class="btn btn-gold" onclick="PG.enterConsolidation()" style="font-size:13px;padding:14px 36px">Enter consolidation phase</button>'
    +'</div>';
}

function rGame(s){
  recalc();
  var ft=freeTime();var exp=totalExp();var win=checkWin();var tpct=timePct();
  var incDone=allIncomeDone();var expDone=allMandatoryExpDone();var cp=canPass();
  var np=netPassive();var overdueCount=G.carriedExpenses.length;
  var taxOwed=salaryTax();

  var h='<div class="ch" style="font-size:11px;letter-spacing:3px;margin-bottom:14px">'+G.playerName+'\'s board — Year '+G.year+', Month '+G.month+(G.consolidationPhase?' &nbsp;<span style="color:var(--orange);font-size:9px">CONSOLIDATION</span>':'')+'</div>';

  /* Calendar */
  h+='<div class="cal"><div class="cal-head"><div class="cal-year">Year '+G.year+'</div><div style="font-size:10px;color:var(--text3)">Month '+G.month+' of 12</div></div><div class="cal-months">';
  for(var mi=1;mi<=12;mi++){var mc=mi<G.month?'done':mi===G.month?'current':'';h+='<div class="cal-m '+mc+'"></div>';}
  h+='</div></div>';

  /* HUD row 1 */
  h+='<div class="hud hud4">'
    +'<div class="hbox"><div class="hlbl">Cash</div><div class="hval">'+fmt(G.cash)+'</div></div>'
    +'<div class="hbox"><div class="hlbl">Gross passive</div><div class="hval '+(G.passiveIncome>0?'g':'')+'">'+fmt(G.passiveIncome)+'</div></div>'
    +'<div class="hbox"><div class="hlbl">Net passive</div><div class="hval '+(np>0?'g':'r')+'">'+fmtS(np)+'</div></div>'
    +'<div class="hbox"><div class="hlbl">Total expenses</div><div class="hval r">'+fmt(exp)+'</div></div>'
    +'</div>';

  /* HUD row 2 */
  h+='<div class="hud hud4" style="margin-bottom:14px">'
    +'<div class="hbox"><div class="hlbl">Free time</div><div class="hval" style="color:'+timeColor()+'">'+ft+'/24</div></div>'
    +'<div class="hbox"><div class="hlbl">Tax rate</div><div class="hval o">'+G.taxRate+'%</div></div>'
    +'<div class="hbox"><div class="hlbl">Discipline</div><div class="hval '+(G.disciplineScore>=5?'g':G.disciplineScore>=2?'':'r')+'">'+G.disciplineScore+'</div></div>'
    +(G.loanAmount>0
      ?'<div class="hbox"><div class="hlbl">Loan balance</div><div class="hval r">'+fmt(G.loanAmount)+'</div></div>'
      :'<div class="hbox"><div class="hlbl">Passive coverage</div><div class="hval '+(np>=exp?'g':'r')+'">'+Math.round((np/Math.max(1,exp))*100)+'%</div></div>')
    +'</div>';

  /* Time bar */
  h+='<div style="margin-bottom:16px">'
    +'<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3);margin-bottom:5px"><span>Time freedom</span><span style="color:'+timeColor()+'">'+tpct+'%</span></div>'
    +'<div style="background:var(--bg3);border-radius:3px;height:5px;overflow:hidden"><div style="height:5px;border-radius:3px;width:'+tpct+'%;background:'+timeColor()+';transition:width 0.5s"></div></div>'
    +'</div>';

  /* Dealmaker reputation bar */
  if(G.profile==='dealmaker'){
    h+='<div style="background:var(--bg2);border:1px solid rgba(154,106,204,.3);border-radius:6px;padding:11px 16px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center">'
      +'<div><div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--purple);margin-bottom:4px">Reputation</div>'
      +'<div class="hval p" style="font-size:16px">'+G.reputation+'/10</div></div>'
      +'<div style="font-size:11px;color:var(--text3)">Deals closed: '+G.dealsDone+'</div>'
      +'</div>';
  }

  /* Manager strip */
  if(G.hasManager){
    h+='<div class="manager-strip">'
      +'<div><div class="manager-strip-label">Manager / PA — Active</div>'
      +'<div class="manager-strip-cost">'+fmt(G.managerMonthlySalary)+'/mo salary — mandatory expense</div></div>'
      +'<button class="btn btn-red" style="padding:7px 16px;font-size:10px" onclick="PG.fireManager()">Fire</button>'
      +'</div>';
  }

  /* Notices */
  if(win&&win.tier<=3&&!G.consolidationPhase)h+='<div class="notice ngold">WIN CONDITION MET — '+win.title+' &nbsp;<button class="btn btn-gold" onclick="PG.triggerWin()" style="padding:5px 14px;font-size:10px;margin-left:8px">Claim</button></div>';
  if(win&&win.tier===4)h+='<div class="notice ngold">LEGACY WIN — '+win.title+' &nbsp;<button class="btn btn-gold" onclick="PG.claimWin()" style="padding:5px 14px;font-size:10px;margin-left:8px">Claim</button></div>';
  if(np>0&&np>=exp&&!win&&!G.consolidationPhase)h+='<div class="notice ngreen">'+G.playerName+', passive income covers all expenses. You could stop working today.</div>';
  if(G.consolidationPhase&&G.consecutivePassiveCoverageMonths>0)h+='<div class="notice ngold">Consolidation: '+G.consecutivePassiveCoverageMonths+'/3 months of 3x passive coverage achieved.</div>';
  if(ft===0)h+='<div class="notice nred">0 free time. Fully trapped. Delegate immediately.</div>';
  if(ft>0&&ft<=8)h+='<div class="notice nred">Only '+ft+' free time units. Deal-making is restricted. Delegate to free up time.</div>';
  if(overdueCount>0)h+='<div class="notice norange">'+overdueCount+' overdue expense'+(overdueCount>1?'s':'')+' carried. Pay before they compound further.</div>';
  if(G.blackSwanExpenseSpike>0)h+='<div class="notice nred">Black swan effect active — all expenses elevated this month.</div>';
  if(G.consolidationPhase)h+='<div class="notice norange">Inflation factor: '+G.inflationFactor.toFixed(2)+'x — your cost of living grows every year. Keep passive income growing faster.</div>';

  /* Lifestyle temptation */
  if(G.lifestyleTemptationPending){
    h+='<div class="temptation-card">'
      +'<div class="temptation-title">The temptation is real.</div>'
      +'<div class="temptation-body">You have '+fmt(G.cash)+' in cash — more than 3x your monthly expenses.<br>Your friends are upgrading. The lifestyle is calling. Everyone will notice.<br><br>This is the moment that separates the wealthy from the formerly wealthy.</div>'
      +'<div class="brow" style="justify-content:center">'
      +'<button class="btn btn-green" onclick="PG.resistTemptation()" style="padding:10px 28px">Resist (+1 discipline)</button>'
      +'<button class="btn btn-red" onclick="PG.indulgeTemptation()" style="padding:10px 28px">Indulge (add liability)</button>'
      +'</div></div>';
  }

  /* Monthly checklist */
  h+='<div class="sec">Monthly checklist</div>'
    +'<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:16px">'
    +'<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:12px"><span style="color:var(--text2)">Income collected</span><span style="color:'+(incDone?'var(--green)':'var(--red)')+'">'+( incDone?'Done ✓':'Pending')+'</span></div>'
    +'<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:12px"><span style="color:var(--text2)">Mandatory expenses paid</span><span style="color:'+(expDone?'var(--green)':'var(--red)')+'">'+( expDone?'Done ✓':'Pending')+'</span></div>'
    +'<div style="display:flex;justify-content:space-between;padding:7px 0;font-size:12px"><span style="color:var(--text2)">Salary tax this month</span><span style="color:var(--orange)">'+fmt(taxOwed)+' ('+G.taxRate+'%)</span></div>'
    +'</div>';

  /* Assets list */
  if(G.assets.length>0){
    h+='<div class="sec">Assets ('+G.assets.length+')</div><div class="alist">';
    G.assets.forEach(function(a,i){
      var netInc=(a.income||0)-(a.expense||0);
      var binfo=BUCKET_INFO[a.bucket||'cf'];
      var mv=assetMarketValue(a);
      h+='<div class="arow'+(a.newThisMonth?' new':'')+(a.mortgage?' mortgaged':'')+'"><div style="flex:1"><div class="aname">'+a.name+(a.count>1?' x'+a.count:'')+(a.mortgage?'<span class="mortgage-badge">MORTGAGED</span>':'')+'</div>'
        +(a.newThisMonth
          ?'<div style="font-size:9px;color:var(--blue);margin-top:2px;letter-spacing:1px">OWNED — income starts next month</div>'
          :'<div class="atype">'+(binfo?'<span class="stag '+binfo.tagCls+'">'+binfo.label+'</span> ':'')+a.type+'</div>')
        +'</div>'
        +'<div class="aright">'
        +(a.newThisMonth
          ?'<div style="font-size:11px;color:var(--blue)">Activates next month</div>'
          :'<div class="ainc">+'+fmt(a.income)+'/mo gross</div>'
           +'<div class="aexp">−'+fmt(a.expense)+'/mo costs</div>'
           +(a.mortgage?'<div class="aexp">−'+fmt(a.mortgage.monthlyPayment)+'/mo mortgage</div>':'')
           +'<div class="anet" style="color:'+(netInc>0?'var(--green)':'var(--red)')+'">'+fmtS(netInc)+' net</div>'
        )
        +'<div class="atime '+(a.time===0?'f':'c')+'">'+( a.time===0?'0 time':'−'+a.time+' units')+'</div>'
        +(a.newThisMonth?'':'<span class="asell" onclick="PG.sellAsset('+i+')">Sell</span>')
        /* Mortgage button — shown on real estate not new, not already mortgaged */
        +((!a.newThisMonth&&a.type==='real estate'&&!a.mortgage)
          ?'<span class="amortgage" onclick="PG.mortgageAsset('+i+')">Mortgage</span>':'')
        /* Repay button when mortgaged */
        +((!a.newThisMonth&&a.mortgage)
          ?'<span class="arepay" onclick="PG.repayMortgage('+i+')">Repay</span>':'')
        +'</div></div>';
    });
    h+='</div>';
  } else {
    h+='<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:18px;text-align:center;margin-bottom:16px;font-size:12px;color:var(--text3);font-style:italic;line-height:1.9">'+G.playerName+', you own nothing that works while you sleep.</div>';
  }

  /* Liabilities list with Drop habit button */
  if(G.liabilities.length>0){
    h+='<div class="sec">Liabilities</div><div class="alist">';
    G.liabilities.forEach(function(l,li){
      h+='<div class="arow"><div><div class="aname">'+l.name+'</div><div class="atype">'+l.type+(l.perk?' · '+l.perk:'')+'</div></div>'
        +'<div class="aright"><div class="ainc" style="color:var(--red)">−'+fmt(l.monthly)+'/mo</div>'
        +'<span class="adrop" onclick="PG.dropHabit('+li+')">Drop habit</span>'
        +'</div></div>';
    });
    h+='</div>';
  }

  /* Log */
  if(G.log.length){
    var showAll=G.showFullLog;
    h+='<div class="sec">Activity log'
      +(G.log.length>5?'<span style="float:right;font-size:10px;color:var(--text3);cursor:pointer;font-weight:400" onclick="PG.toggleLog()">'+(showAll?'Show less ▲':'Show all ('+G.log.length+') ▼')+'</span>':'')
      +'</div><div class="log">';
    (showAll?G.log:G.log.slice(0,5)).forEach(function(l){h+='<div class="logline">'+l+'</div>';});
    h+='</div>';
  }

  /* Actions */
  var dealLocked=ft<1;
  var buyWarning=ft<=4&&ft>0;
  h+='<div class="sec">Actions</div><div class="brow">'
    +'<button class="btn btn-green" onclick="PG.goCollect()">Collect income'+(incDone?' ✓':'')+'</button>'
    +'<button class="btn btn-red" onclick="PG.goPayExp()">Pay expenses'+(expDone?' ✓':'')+(overdueCount>0?' ('+overdueCount+' overdue)':'')+'</button>'
    +'<button class="btn btn-gold'+(buyWarning?' btn-dim':'')+'" onclick="PG.goBuy()">Buy assets</button>'
    +(np>0?'<button class="btn btn-blue" onclick="PG.goBorrow()">Borrow capital</button>':'')
    +(G.profile==='dealmaker'
      ?(dealLocked
        ?'<button class="btn btn-dim" title="No free time to make deals">Make a deal (no time)</button>'
        :'<button class="btn btn-purple" onclick="PG.goDeals()">Make a deal</button>')
      :'')
    +'</div>'
    +'<div class="brow">'
    +(cp
      ?'<button class="btn btn-ghost" onclick="PG.passMonth()">Pass this month — next month</button>'
      :'<button class="btn btn-dim" onclick="PG.passBlocked()">Pass this month — next month</button>')
    +'</div>';

  s.innerHTML=h;
}

function rCollect(s){
  if(!G.monthIncomes)G.monthIncomes=buildMonthIncomes();
  var items=G.monthIncomes;
  var done=items.filter(function(i){return i.done;}).length;
  var total=items.reduce(function(s,i){return i.done&&i.amount>0?s+i.amount:s;},0);
  var trapQuote=SALARY_TRAP_QUOTES[(G.monthsPlayed)%SALARY_TRAP_QUOTES.length];

  var h='<div class="ch" style="font-size:18px;margin-bottom:6px">Collect income</div>'
    +'<div style="font-size:12px;color:var(--text3);margin-bottom:14px">Year '+G.year+', Month '+G.month+' — each source collected exactly once this month</div>';

  if(G.hasManager)h+='<div class="notice ngreen">Your Manager / PA collected all income. Full report below.</div>';
  else h+='<div class="notice ngold">Each income source received exactly once per month.</div>';

  h+='<div style="font-size:11px;color:var(--text3);margin-bottom:16px">'+done+' of '+items.length+' handled &nbsp;·&nbsp; Total: <span style="color:var(--green)">'+fmt(total)+'</span></div>';

  items.forEach(function(item,idx){
    var taxLine='';
    if(item.isSalary&&!item.done){var t=salaryTax();taxLine='<div style="font-size:10px;color:var(--orange);margin-top:3px">Tax deducted: '+fmt(t)+' ('+G.taxRate+'%)</div>';}
    if(item.isPassive&&!item.done){var pt=passiveTax(item.amount);taxLine='<div style="font-size:10px;color:var(--orange);margin-top:3px">Passive tax: '+fmt(pt)+' ('+Math.round(G.taxRate/2)+'%)</div>';}
    h+='<div class="item-row'+(item.done?' done':'')+'"><div class="item-label">'
      +'<div class="item-name">'+item.label+'</div>'
      +'<div class="item-sub">'+item.type+'</div>'
      +taxLine+'</div>'
      +'<div class="item-amt inc">'+(item.amount>0?'+'+fmt(item.amount):'—')+'</div>'
      +(item.done
        ?'<span style="font-size:11px;color:var(--green)">'+(item.amount===0?'Skipped':'Collected ✓')+'</span>'
        :'<button class="btn btn-green" style="padding:8px 16px;font-size:11px" onclick="PG.collectOne('+idx+')">Collect</button>')
      +'</div>';
  });

  var hasSalary=items.some(function(i){return i.isSalary;});
  if(hasSalary){h+='<div class="notice nred" style="margin-top:14px;font-style:italic">"'+trapQuote+'"</div>';}
  h+='<div class="brow"><button class="btn btn-ghost" onclick="PG.goGame()">Back to board</button></div>';
  s.innerHTML=h;
}

function rPayExp(s){
  if(!G.monthExpenses)G.monthExpenses=buildMonthExpenses();
  var items=G.monthExpenses;
  var done=items.filter(function(i){return i.done;}).length;
  var total=items.reduce(function(s,i){return i.done?s+i.amount:s;},0);
  var overdueItems=items.filter(function(i){return i.isCarried;});

  var h='<div class="ch" style="font-size:18px;margin-bottom:6px">Pay expenses</div>'
    +'<div style="font-size:12px;color:var(--text3);margin-bottom:14px">Year '+G.year+', Month '+G.month+' — mandatory expenses cannot be skipped</div>';

  if(G.hasManager)h+='<div class="notice ngreen">Your Manager / PA handled all payments in priority order.</div>';
  else h+='<div class="notice ngold">Mandatory expenses cannot be skipped. Non-mandatory ones carry over — with interest.</div>';
  if(overdueItems.length>0)h+='<div class="notice norange">'+overdueItems.length+' overdue — skipping again adds a 10% late fee next month.</div>';

  h+='<div style="font-size:11px;color:var(--text3);margin-bottom:16px">'+done+' of '+items.length+' handled &nbsp;·&nbsp; Total paid: <span style="color:var(--red)">'+fmt(total)+'</span></div>';

  items.forEach(function(item,idx){
    var isOverdue=item.isCarried;
    h+='<div class="item-row'+(item.done?' done':'')+(item.mandatory?' mandatory':isOverdue?' overdue':'')+'"><div class="item-label">'
      +'<div class="item-name">'+item.label
      +(item.mandatory?'<span style="font-size:9px;color:var(--red);letter-spacing:1px;text-transform:uppercase;margin-left:6px">mandatory</span>':'')
      +(isOverdue?'<span style="font-size:9px;color:var(--orange);letter-spacing:1px;text-transform:uppercase;margin-left:6px">overdue</span>':'')
      +'</div>'
      +'<div class="item-sub">'+item.type+'</div></div>'
      +'<div class="item-amt exp">−'+fmt(item.amount)+'</div>';
    if(item.done)h+='<span style="font-size:11px;color:var(--text3)">Paid ✓</span>';
    else if(item.mandatory)h+='<button class="btn btn-red" style="padding:8px 16px;font-size:11px" onclick="PG.payOne('+idx+')">Pay</button>';
    else h+='<div style="display:flex;gap:6px"><button class="btn btn-red" style="padding:8px 14px;font-size:11px" onclick="PG.payOne('+idx+')">Pay</button><button class="btn btn-ghost" style="padding:8px 14px;font-size:11px" onclick="PG.skipOne('+idx+')">Skip</button></div>';
    h+='</div>';
  });
  h+='<div class="brow"><button class="btn btn-ghost" onclick="PG.goGame()">Back to board</button></div>';
  s.innerHTML=h;
}

function rBuy(s){
  recalc();
  var ft=freeTime();
  var h='<div class="ch" style="font-size:18px;margin-bottom:6px">Buy assets or liabilities</div>'
    +'<div style="font-size:12px;color:var(--text3);margin-bottom:14px">You own the asset immediately. Income and expenses start from next month.</div>'
    +'<div class="hud hud2" style="margin-bottom:14px">'
    +'<div class="hbox"><div class="hlbl">Available cash</div><div class="hval">'+fmt(G.cash)+'</div></div>'
    +'<div class="hbox"><div class="hlbl">Net passive/mo</div><div class="hval '+(netPassive()>0?'g':'r')+'">'+fmtS(netPassive())+'</div></div>'
    +'</div>';

  if(ft<=4&&ft>0)h+='<div class="notice nred">Low free time. Prioritise delegation assets — buy back your time.</div>';
  if(G.delegDiscount)h+='<div class="notice nblue">Delegation 50% off this month.</div>';
  if(G.opmDiscount)h+='<div class="notice nblue">OPM card — next investment 25% off.</div>';

  var bucketOrder=['cf','ap','eq','dl'];
  bucketOrder.forEach(function(bkey){
    var binfo=BUCKET_INFO[bkey];
    var bucketAssets=ASSET_DEFS.filter(function(item){return item.bucket===bkey;});
    h+='<div class="sec" style="margin-top:18px"><span class="bucket-label '+binfo.cls+'">'+binfo.label+'</span> &nbsp;'+binfo.desc+'</div>';
    h+='<div class="sgrid">';
    bucketAssets.forEach(function(item){
      var owned=G.assets.find(function(a){return a.id===item.id&&!a.newThisMonth;});
      var isMgr=item.id==='hire_mgr';
      if(isMgr&&G.hasManager){h+='<div class="scard sdim"><div class="sname">'+item.name+' ✓</div><div class="scost">Already hired</div><div class="sdesc">Manager salary: '+fmt(G.managerMonthlySalary)+'/mo</div></div>';return;}
      if(!item.repeatable&&owned){h+='<div class="scard sdim"><div class="sname">'+item.name+' ✓</div><div class="scost">Owned</div><div class="sdesc">'+item.desc+'</div></div>';return;}

      var cost=item.cost;
      if(G.delegDiscount&&item.type==='delegation')cost=Math.floor(cost*0.5);
      if(G.opmDiscount&&item.type!=='delegation')cost=Math.floor(cost*0.75);

      /* Manager: 0 upfront, recruitment fee instead */
      var displayCost=isMgr?sc(5000):sc(cost);
      var mgrSalary=isMgr?sc(12000):0;
      var sopMaint=item.id==='build_sop'?sc(2000):0;
      var sc_inc=sc(item.income);var sc_exp=sc(item.expense);var sc_net=sc_inc-sc_exp;
      var canAfford=G.cash>=displayCost;

      h+='<div class="scard'+(canAfford?'':' sdim')+'" onclick="'+(canAfford?'PG.buyAsset(\''+item.id+'\','+displayCost+','+item.time+','+sc_inc+','+sc_exp+',\''+item.type+'\',\''+item.name.replace(/'/g,"\\'")+'\','+item.repeatable+',\''+item.bucket+'\')':'')+'">'
        +'<div class="sname">'+item.name+(item.type==='delegation'?'<span class="stag tag-del">delegate</span>':'')+(item.repeatable?'<span class="stag tag-stack">stackable</span>':'')+(owned&&item.repeatable?' x'+(owned.count||1):'')+'</div>'
        +(isMgr
          ?'<div class="scost">Recruitment fee: '+fmt(displayCost)+'</div><div class="sexp">Salary: '+fmt(mgrSalary)+'/mo (mandatory)</div>'
          :item.id==='build_sop'
            ?'<div class="scost">Cost: '+fmt(displayCost)+'</div><div class="sexp">Monthly maintenance: '+fmt(sopMaint)+'/mo</div>'
            :'<div class="scost">Cost: '+fmt(displayCost)+(canAfford?'':' — need '+fmt(displayCost-G.cash)+' more')+'</div>')
        +(sc_inc>0?'<div class="sinc">+'+fmt(sc_inc)+'/mo income</div>':'')
        +(sc_exp>0&&!isMgr?'<div class="sexp">−'+fmt(sc_exp)+'/mo costs</div>':'')
        +(sc_inc>0?'<div class="snet" style="color:'+(sc_net>0?'var(--green)':'var(--red)')+'">'+fmtS(sc_net)+' net/mo</div>':'')
        +'<div class="stime '+(item.time<=0?'f':'c')+'">Time: '+(item.time===0?'0 units':item.time>0?'+'+item.time+' units':item.time+' units')+'</div>'
        +'<div class="sdesc">'+item.desc+'</div></div>';
    });
    h+='</div>';
  });

  h+='<div class="sec" style="margin-top:18px">Liabilities — things that cost you every month</div><div class="sgrid">';
  LIABILITIES.forEach(function(item){
    var owned=G.liabilities.find(function(l){return l.id===item.id;});
    var sc_cost=sc(item.cost);var sc_mo=sc(item.monthly);
    var canAfford=sc_cost===0||G.cash>=sc_cost;
    h+='<div class="scard'+(owned?' sdim':!canAfford?' sdim':'')+'" onclick="'+(owned||!canAfford?'':'PG.buyLiability(\''+item.id+'\','+sc_cost+','+sc_mo+')')+'">'
      +'<div class="sname">'+item.name+'<span class="stag tag-liab">liability</span>'+(item.type==='status'?'<span class="stag tag-status">status</span>':'')+(owned?' ✓':'')+'</div>'
      +(sc_cost>0?'<div class="scost">Purchase: '+fmt(sc_cost)+'</div>':'<div class="scost">No upfront cost</div>')
      +'<div class="sinc" style="color:var(--red)">−'+fmt(sc_mo)+'/mo ongoing</div>'
      +(item.perk?'<div style="font-size:10px;color:var(--purple);margin-bottom:5px">'+item.perk+'</div>':'')
      +'<div class="sdesc">'+item.desc+'</div></div>';
  });
  h+='</div>';

  h+='<div class="sec">Change housing</div><div class="choice-grid">';
  LOC.housing.forEach(function(hh){
    h+='<div class="choice-card'+(G.housing&&G.housing.id===hh.id?' active':'')+'" onclick="PG.changeHousing(\''+hh.id+'\')">'
      +'<div class="choice-name">'+hh.name+(G.housing&&G.housing.id===hh.id?' (current)':'')+'</div>'
      +'<div class="choice-cost">'+fmt(hh.cost)+'/mo</div>'
      +'<div class="choice-desc">'+hh.desc+'</div>'
      +(hh.perk?'<div class="choice-perk">'+hh.perk+'</div>':'')+'</div>';
  });
  h+='</div><div class="sec">Change groceries</div><div class="choice-grid">';
  LOC.groceries.forEach(function(gr){
    h+='<div class="choice-card'+(G.grocery&&G.grocery.id===gr.id?' active':'')+'" onclick="PG.changeGrocery(\''+gr.id+'\')">'
      +'<div class="choice-name">'+gr.name+(G.grocery&&G.grocery.id===gr.id?' (current)':'')+'</div>'
      +'<div class="choice-cost">'+fmt(gr.cost)+'/mo</div>'
      +'<div class="choice-desc">'+gr.desc+'</div>'+'</div>';
  });
  h+='</div>';
  h+='<div class="brow"><button class="btn btn-ghost" onclick="PG.goGame()">Back to board</button></div>';
  s.innerHTML=h;
}

function rDeals(s){
  var ft=freeTime();
  var h='<div class="ch" style="font-size:18px;margin-bottom:6px">Make a deal</div>'
    +'<div style="font-size:12px;color:var(--text3);margin-bottom:14px">You make money connecting value — not owning it. Reputation is everything.</div>'
    +'<div class="hud hud3" style="margin-bottom:14px">'
    +'<div class="hbox"><div class="hlbl">Cash</div><div class="hval">'+fmt(G.cash)+'</div></div>'
    +'<div class="hbox"><div class="hlbl">Reputation</div><div class="hval p">'+G.reputation+'/10</div></div>'
    +'<div class="hbox"><div class="hlbl">Free time</div><div class="hval" style="color:'+timeColor()+'">'+ft+'/24</div></div>'
    +'</div>'
    +'<div class="notice npurple">Failed deals cost reputation only — not money. Build reputation by closing small deals first.</div>';

  var cats={};
  DEALS.forEach(function(d){if(!cats[d.cat])cats[d.cat]=[];cats[d.cat].push(d);});
  Object.keys(cats).forEach(function(cat){
    h+='<div class="sec">'+cat+'</div>';
    cats[cat].forEach(function(deal){
      var repLocked=G.reputation<deal.repReq;
      var timeLocked=ft<deal.time;
      var prereqLocked=!dealPrereqMet(deal);
      var locked=repLocked||timeLocked||prereqLocked;
      var missing=prereqLocked?missingPrereqs(deal):[];
      h+='<div class="deal-card'+(locked?' deal-locked':'')+'" onclick="'+(locked?'':'PG.executeDeal(\''+deal.id+'\')')+'">'
        +'<div class="deal-name">'+deal.name+'</div>'
        +'<div class="deal-meta">'
        +'<span class="deal-tag" style="background:rgba(154,106,204,.12);color:var(--purple);border:1px solid rgba(154,106,204,.25)">Rep: '+deal.repReq+'</span>'
        +'<span class="deal-tag" style="background:rgba(74,138,204,.12);color:var(--blue);border:1px solid rgba(74,138,204,.25)">Time: '+deal.time+'</span>'
        +'<span class="deal-tag" style="background:rgba(58,170,106,.12);color:var(--green);border:1px solid rgba(58,170,106,.25)">'+fmt(sc(deal.min))+'–'+fmt(sc(deal.max))+'</span>'
        +'<span class="deal-tag" style="background:rgba(201,168,76,.08);color:var(--gold);border:1px solid var(--border-gold)">'+Math.round(deal.rate*100)+'% success</span>'
        +(deal.prereq&&deal.prereq.length?'<span class="deal-tag" style="background:rgba(204,140,44,.1);color:var(--orange);border:1px solid rgba(204,140,44,.3)">pipeline</span>':'')
        +'</div>'
        +'<div style="font-size:11px;color:var(--text2);line-height:1.7">'+deal.desc+'</div>'
        +(repLocked?'<div class="deal-prereq-missing">Needs reputation '+deal.repReq+'</div>':'')
        +(timeLocked?'<div class="deal-prereq-missing">Needs '+deal.time+' free time units</div>':'')
        +(prereqLocked&&missing.length>0?'<div class="deal-prereq-missing">Complete first: <span>'+missing.join(', ')+'</span></div>':'')
        +'</div>';
    });
  });
  h+='<div class="brow"><button class="btn btn-ghost" onclick="PG.goGame()">Back to board</button></div>';
  s.innerHTML=h;
}

function rEvent(s){
  var e=G.eventCard;
  var isBlackSwan=e.type==='blackswan';
  var ecls=e.type==='opportunity'?'epos':e.type==='setback'?'eneg':e.type==='market'?'epurp':isBlackSwan?'eneg':'eneu';
  s.innerHTML='<div class="ch" style="font-size:11px;letter-spacing:3px;margin-bottom:18px">'+(isBlackSwan?'⚠ BLACK SWAN EVENT':'Event card')+' — Y'+G.year+' M'+G.month+'</div>'
    +'<div class="ecard '+e.type+'">'
    +'<div class="etype '+e.type+'">'+(isBlackSwan?'BLACK SWAN':e.type.toUpperCase())+'</div>'
    +'<div class="etitle">'+e.title+'</div>'
    +'<div class="ebody">'+e.body+'</div>'
    +'<div class="eeffect '+ecls+'">'+e.effect+'</div>'
    +'</div>'
    +'<div class="brow"><button class="btn btn-gold" onclick="PG.acceptEvent()">Accept outcome</button></div>';
}

/* ─── SMART RESPONSE SCREEN ─── */
function rSmartResponse(s){
  var e=G.eventCard;
  var resp=EVENT_RESPONSES[e.title];
  if(!resp){G.screen='endmonth';render();return;}
  var tier=resp.check(G);
  var data=resp[tier];
  var tierLabel=tier==='prepared'?'Well prepared':tier==='partial'?'Partially prepared':'Unprepared';
  var tierCls=tier;

  var h='<div class="ch" style="font-size:11px;letter-spacing:3px;margin-bottom:18px">Event response — Y'+G.year+' M'+G.month+'</div>'
    +'<div class="ecard '+e.type+'">'
    +'<div class="etype '+e.type+'">'+e.type.toUpperCase()+'</div>'
    +'<div class="etitle">'+e.title+'</div>'
    +'<div class="ebody">'+e.body+'</div>'
    +'</div>'
    +'<div class="response-screen">'
    +'<div class="response-header">'
    +'<div class="response-tier '+tierCls+'">'+tierLabel+'</div>'
    +'<div style="font-size:14px;color:var(--text);font-weight:600;margin-bottom:8px">'+data.title+'</div>'
    +'<div style="font-size:12px;color:var(--text2);line-height:1.8">'+data.body+'</div>'
    +'<div style="font-size:10px;color:var(--text3);margin-top:8px;font-style:italic">'+data.why+'</div>'
    +'</div>'
    +'</div>'
    +'<div class="brow"><button class="btn btn-gold" onclick="PG.acceptSmartResponse()">Accept outcome</button></div>';
  s.innerHTML=h;
}

function rEnd(s){
  recalc();
  var ft=freeTime();
  var exp=totalExp();
  var result=G._lastSettleResult||{collectedIncome:0,totalTax:0,paidExp:0,net:0,seBonus:0,newCarried:[]};
  var np=netPassive();
  var win=checkWin();
  var nm=G.month>=12?1:G.month+1;var ny=G.month>=12?G.year+1:G.year;

  var h='<div class="ch" style="font-size:18px;margin-bottom:6px">Month '+G.month+' settled</div>'
    +'<div style="font-size:12px;color:var(--text3);margin-bottom:18px">Year '+G.year+'</div>'
    +'<div class="hud hud4" style="margin-bottom:16px">'
    +'<div class="hbox"><div class="hlbl">Income collected</div><div class="hval g" style="font-size:13px">'+fmt(result.collectedIncome)+'</div></div>'
    +'<div class="hbox"><div class="hlbl">Tax paid</div><div class="hval o" style="font-size:13px">'+fmt(result.totalTax)+'</div></div>'
    +'<div class="hbox"><div class="hlbl">Expenses paid</div><div class="hval r" style="font-size:13px">'+fmt(result.paidExp)+'</div></div>'
    +'<div class="hbox"><div class="hlbl">Net this month</div><div class="hval" style="font-size:13px;color:'+(result.net>=0?'var(--green)':'var(--red)')+'">'+fmtS(result.net)+'</div></div>'
    +'</div>'
    +'<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:14px">'
    +(result.seBonus>0?'<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:12px"><span style="color:var(--text2)">SE delegation bonus</span><span style="color:var(--green);font-weight:600">+'+fmt(result.seBonus)+'</span></div>':'')
    +'<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:12px"><span style="color:var(--text2)">Total cash now</span><span style="font-weight:600">'+fmt(G.cash)+'</span></div>'
    +'<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:12px"><span style="color:var(--text2)">Net passive/mo</span><span style="color:'+(np>0?'var(--green)':'var(--red)')+';font-weight:600">'+fmtS(np)+'/mo</span></div>'
    +'<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:12px"><span style="color:var(--text2)">Tax rate</span><span style="color:var(--orange);font-weight:600">'+G.taxRate+'%</span></div>'
    +'<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:12px"><span style="color:var(--text2)">Free time</span><span style="color:'+timeColor()+';font-weight:600">'+ft+'/24</span></div>'
    +'<div style="display:flex;justify-content:space-between;padding:7px 0;font-size:12px"><span style="color:var(--text2)">Passive coverage</span><span style="color:'+(np>=exp?'var(--green)':'var(--red)')+';font-weight:600">'+Math.round((np/Math.max(1,exp))*100)+'%</span></div>'
    +'</div>';

  if(result.newCarried&&result.newCarried.length>0)h+='<div class="notice norange">'+result.newCarried.length+' expense'+(result.newCarried.length>1?'s':'')+' carried to next month. Late fees apply from month 2.</div>';
  if(G.passiveIncome===0)h+='<div class="notice nred">Zero passive income. If you stopped working — everything stops.</div>';
  if(ft<=4&&ft>0)h+='<div class="notice nred">Only '+ft+' free time. Delegate now.</div>';
  if(ft===0)h+='<div class="notice nred">0 free time. Your business owns you completely.</div>';
  if(win)h+='<div class="notice ngold">WIN UNLOCKED — '+win.title+'</div>';
  if(G.profile==='employee'&&G.assets.length===0)h+='<div class="notice nblue">Employee trap: Salary grew +'+fmt(sc(5000))+' — but you are still fully dependent on it.</div>';
  if(result.totalTax>0)h+='<div class="notice norange">Taxes paid this month: '+fmt(result.totalTax)+'. Delegation assets reduce your tax rate by 5% each.</div>';

  h+='<div class="brow">'
    +(win&&!G.consolidationPhase&&win.tier<=3?'<button class="btn btn-gold" onclick="PG.triggerWin()">Claim victory ✦</button>':'')
    +(win&&win.tier===4?'<button class="btn btn-gold" onclick="PG.claimWin()">Claim legacy ★</button>':'')
    +'<button class="btn btn-green" onclick="PG.nextMonth()">Next month — Y'+ny+' M'+nm+'</button>'
    +'</div>';
  s.innerHTML=h;
}

function rBorrow(s){
  recalc();
  var np=netPassive();
  var maxLoan=Math.max(0,np*3);
  var h='<div class="ch" style="font-size:20px;margin-bottom:6px">Leverage — borrow capital</div>'
    +'<div style="font-size:12px;color:var(--text3);margin-bottom:18px;line-height:1.8">The wealthy use debt as a tool — not a burden. Borrow to buy cashflow assets. Never borrow to fund lifestyle.</div>'
    +'<div class="hud hud3" style="margin-bottom:18px">'
    +'<div class="hbox"><div class="hlbl">Net passive/mo</div><div class="hval '+(np>0?'g':'r')+'">'+fmtS(np)+'</div></div>'
    +'<div class="hbox"><div class="hlbl">Max borrow (3x passive)</div><div class="hval">'+fmt(maxLoan)+'</div></div>'
    +'<div class="hbox"><div class="hlbl">Current loan</div><div class="hval '+(G.loanAmount>0?'r':'')+'">'+fmt(G.loanAmount)+'</div></div>'
    +'</div>';

  if(np<=0){
    h+='<div class="notice nred">You need positive passive income before you can borrow. Lenders need to see your assets working.</div>';
  } else if(G.loanAmount>0){
    h+='<div class="notice norange">Active loan: '+fmt(G.loanAmount)+' — Monthly interest: '+fmt(G.loanMonthlyPayment)+' (mandatory expense)<br>Repaying early saves you interest every month.</div>'
      +'<div class="brow">'
      +'<button class="btn btn-green" onclick="PG.repayLoan()">Repay full loan ('+fmt(G.loanAmount)+')</button>'
      +'<button class="btn btn-ghost" onclick="PG.goGame()">Back to board</button>'
      +'</div>';
  } else {
    var loan1=Math.round(np*1);var loan2=Math.round(np*2);var loan3=Math.round(np*3);
    var int1=Math.round(loan1*0.08/12);var int2=Math.round(loan2*0.08/12);var int3=Math.round(loan3*0.08/12);
    h+='<div class="notice ngold">8% annual interest — mandatory monthly payment. Use borrowed capital to buy assets, not liabilities.</div>'
      +'<div class="sec">Choose loan size</div>'
      +'<div class="sgrid">'
      +'<div class="scard" onclick="PG.takeLoan('+loan1+','+int1+')">'
        +'<div class="sname">Conservative — 1x passive</div>'
        +'<div class="scost">Borrow: '+fmt(loan1)+'</div>'
        +'<div class="sexp">Monthly interest: '+fmt(int1)+'</div>'
        +'<div class="sdesc">Borrow equal to one month\'s passive income. Low risk. Good for one asset purchase.</div>'
        +'</div>'
      +'<div class="scard" onclick="PG.takeLoan('+loan2+','+int2+')">'
        +'<div class="sname">Moderate — 2x passive</div>'
        +'<div class="scost">Borrow: '+fmt(loan2)+'</div>'
        +'<div class="sexp">Monthly interest: '+fmt(int2)+'</div>'
        +'<div class="sdesc">Borrow twice your monthly passive. Meaningful leverage. Requires asset discipline.</div>'
        +'</div>'
      +'<div class="scard" onclick="PG.takeLoan('+loan3+','+int3+')">'
        +'<div class="sname">Aggressive — 3x passive</div>'
        +'<div class="scost">Borrow: '+fmt(loan3)+'</div>'
        +'<div class="sexp">Monthly interest: '+fmt(int3)+'</div>'
        +'<div class="sdesc">Maximum leverage. Deploy immediately into cashflow assets or the interest destroys you.</div>'
        +'</div>'
      +'</div>';
  }
  h+='<div class="brow"><button class="btn btn-ghost" onclick="PG.goGame()">Back to board</button></div>';
  s.innerHTML=h;
}

/* ─── SCENARIO SCREEN ─── */
function rScenario(s){
  var sc_obj=G.pendingScenario;if(!sc_obj){G.screen='game';render();return;}
  var h='<div class="ch" style="font-size:11px;letter-spacing:3px;margin-bottom:18px">Historical deal scenario — Y'+G.year+' M'+G.month+'</div>'
    +'<div class="ecard scenario">'
    +'<div class="etype scenario">Deal scenario</div>'
    +'<div class="etitle">'+sc_obj.title+'</div>'
    +'<div class="ebody">'+sc_obj.setup+'</div>'
    +'</div>'
    +'<div class="sec" style="margin-top:14px">Your decision</div>'
    +'<div class="scenario-choices">';
  sc_obj.choices.forEach(function(ch){
    h+='<div class="scenario-choice" onclick="PG.chooseScenario(\''+sc_obj.id+'\',\''+ch.id+'\')">'
      +'<div class="sc-label">'+ch.label+'</div>'
      +'<div class="sc-desc">'+ch.desc+'</div>'
      +'<div class="sc-hint">'+ch.hint+'</div>'
      +'</div>';
  });
  h+='</div>';
  s.innerHTML=h;
}

function rScenarioOutcome(s){
  var out=G.pendingOutcome;if(!out){G.screen='game';render();return;}
  var h='<div class="ch" style="font-size:11px;letter-spacing:3px;margin-bottom:18px">What happened — Y'+G.year+' M'+G.month+'</div>'
    +'<div class="scenario-outcome">'
    +'<div class="outcome-title">'+out.title+'</div>'
    +'<div class="outcome-body">'+out.body+'</div>'
    +'<div class="eeffect '+(out.effectLabel&&out.effectLabel.indexOf('+')===0?'epos':'eneu')+'">'+out.effectLabel+'</div>'
    +'<div class="outcome-lesson"><em>The lesson:</em> '+out.lesson+'</div>'
    +'</div>'
    +'<div class="brow"><button class="btn btn-gold" onclick="PG.finishScenario()">Continue</button></div>';
  s.innerHTML=h;
}

/* ─── SURVIVAL SCREEN ─── */
function rSurvival(s){
  var step=G.survivalStep;
  var h='';
  if(step===1){
    var a=G.survivalAsset;
    var def=ASSET_DEFS.find(function(d){return d.id===a.id||a.id.indexOf(d.id)===0;});
    var sellP=def?def.sellVal(a):sc(50000);
    h='<div class="survival-card">'
      +'<div class="survival-step">Step 1 of 3 — forced liquidation</div>'
      +'<div class="survival-title">Asset-rich. Cash-poor.</div>'
      +'<div class="survival-body">You are out of cash and cannot cover your mandatory expenses.<br><br>'
      +'Your cheapest available asset — <strong>'+a.name+'</strong> — can be force-sold at market value to survive this month.</div>'
      +'<div style="font-size:13px;color:var(--gold);margin-bottom:18px">Sale proceeds: '+fmt(sellP)+'</div>'
      +'<div class="brow" style="justify-content:center">'
      +'<button class="btn btn-red" onclick="PG.forceSellSurvival('+sellP+')">Force-sell '+a.name+' — survive this month</button>'
      +'</div>'
      +'</div>';
  } else if(step===2){
    var ma=G.survivalMortgageAsset;
    var mv2=assetMarketValue(ma);
    var mortgageProceeds=Math.floor(mv2*0.6);
    h='<div class="survival-card">'
      +'<div class="survival-step">Step 2 of 3 — emergency mortgage</div>'
      +'<div class="survival-title">Borrowing against your own asset to survive.</div>'
      +'<div class="survival-body">No sellable assets available. An emergency mortgage has been placed on <strong>'+ma.name+'</strong>.<br><br>'
      +'You will receive '+fmt(mortgageProceeds)+' now. Interest payments begin next month at 18% per annum.</div>'
      +'<div class="brow" style="justify-content:center">'
      +'<button class="btn btn-orange" onclick="PG.emergencyMortgage()">Accept emergency mortgage</button>'
      +'</div>'
      +'</div>';
  } else {
    h='<div style="text-align:center;padding:40px 20px">'
      +'<div style="font-size:9px;letter-spacing:4px;text-transform:uppercase;color:var(--red);margin-bottom:24px">System failure</div>'
      +'<div class="ch" style="font-size:26px;color:var(--red);margin-bottom:16px">Bankruptcy</div>'
      +'<div style="font-size:13px;color:var(--text2);margin-bottom:22px">No assets to sell. No assets to mortgage. You cannot meet your obligations.</div>'
      +'<button class="btn btn-red" onclick="PG.declareBankruptcy()">See what happened</button>'
      +'</div>';
  }
  s.innerHTML=h;
}

function rBankruptcy(s){
  var h='<div class="bankruptcy">'
    +'<div class="bk-title">Bankruptcy</div>'
    +'<div class="bk-sub">The money ran out before the lesson did</div>'
    +'<div class="bk-lesson">Every fortune begins with discipline.<br>Every bankruptcy begins with a skipped lesson.<br>The numbers do not lie. <em>You did.</em></div>'
    +'<div class="bk-timeline">'
    +'<div class="bk-timeline-title">What happened</div>';
  (G.bankruptcyLog||[]).slice(0,12).forEach(function(entry){
    h+='<div class="bk-entry">'+entry+'</div>';
  });
  h+='</div>'
    +'<div class="brow" style="justify-content:center">'
    +'<button class="btn btn-gold" onclick="PG.reset()">Play again</button>'
    +'</div>'
    +'<div style="font-size:9px;letter-spacing:3px;color:var(--text3);text-transform:uppercase;margin-top:24px">Billionaire by 20 — Think like a plutocrat</div>'
    +'</div>';
  s.innerHTML=h;
}

function rWin(s){
  recalc();var ft=freeTime();var win=checkWin()||WINS[0];var exp=totalExp();
  var np=netPassive();
  /* Asset breakdown */
  var assetBreakdown='';
  G.assets.forEach(function(a){
    var net=(a.income||0)-(a.expense||0);
    assetBreakdown+='<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border);font-size:11px">'
      +'<span style="color:var(--text2)">'+a.name+(a.count>1?' x'+a.count:'')+'</span>'
      +'<span style="color:'+(net>0?'var(--green)':'var(--red)')+'">'+fmtS(net)+'/mo</span>'
      +'</div>';
  });
  /* Category breakdown for dealmaker */
  var dealBreakdown='';
  if(G.profile==='dealmaker'&&G.dealsDone>0){
    dealBreakdown='<div style="margin-bottom:6px;font-size:10px;color:var(--text3);letter-spacing:1px;text-transform:uppercase">Deals by category</div>';
    Object.keys(G.dealsDoneByCategory).forEach(function(cat){
      dealBreakdown+='<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:11px">'
        +'<span style="color:var(--text2)">'+cat+'</span>'
        +'<span style="color:var(--purple)">'+G.dealsDoneByCategory[cat]+' deals</span>'
        +'</div>';
    });
  }
  s.innerHTML='<div class="win">'
    +'<div class="wt">'+win.label+' Victory — Y'+G.year+' M'+G.month+'</div>'
    +'<div class="wc">'+win.crown+'</div>'
    +'<div class="wh">'+win.title+'</div>'
    +'<div class="wb">'+win.desc+'</div>'
    +'<div class="hud hud2" style="max-width:400px;margin:0 auto 24px">'
    +'<div class="hbox"><div class="hlbl">Final cash</div><div class="hval">'+fmt(G.cash)+'</div></div>'
    +'<div class="hbox"><div class="hlbl">Net passive/mo</div><div class="hval g">'+fmtS(np)+'</div></div>'
    +'<div class="hbox"><div class="hlbl">Expenses/mo</div><div class="hval r">'+fmt(exp)+'</div></div>'
    +'<div class="hbox"><div class="hlbl">Free time</div><div class="hval" style="color:'+timeColor()+'">'+ft+'/24</div></div>'
    +'</div>'
    +'<div style="font-size:11px;color:var(--text3);margin-bottom:4px">'+G.monthsPlayed+' months &nbsp;·&nbsp; '+prof().name+' &nbsp;·&nbsp; '+LOC.country+'</div>'
    +'<div style="font-size:11px;color:var(--gold);margin-bottom:20px">Discipline: '+G.disciplineScore+' &nbsp;·&nbsp; Tax rate: '+G.taxRate+'% &nbsp;·&nbsp; Reputation: '+G.reputation+'/10</div>'
    +(G.assets.length>0
      ?'<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:14px;max-width:400px;margin:0 auto 20px;text-align:left">'
        +'<div style="font-size:10px;color:var(--text3);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">'+G.assets.length+' assets built</div>'
        +assetBreakdown
        +'</div>'
      :'')
    +(dealBreakdown
      ?'<div style="background:var(--bg2);border:1px solid rgba(154,106,204,.3);border-radius:8px;padding:14px;max-width:400px;margin:0 auto 20px;text-align:left">'
        +dealBreakdown
        +'<div style="font-size:11px;color:var(--purple);margin-top:6px">'+G.dealsDone+' total deals closed</div>'
        +'</div>'
      :'')
    +(G.liabilities.length>0
      ?'<div style="font-size:11px;color:var(--red);margin-bottom:16px">'+G.liabilities.length+' liabilit'+(G.liabilities.length>1?'ies':'y')+' still active at victory</div>'
      :'<div style="font-size:11px;color:var(--green);margin-bottom:16px">Zero liabilities at victory. Clean balance sheet.</div>')
    +'<button class="btn btn-gold" onclick="PG.reset()" style="margin-bottom:22px">Play again</button>'
    +'<div style="font-size:9px;letter-spacing:3px;color:var(--text3);text-transform:uppercase;margin-top:14px">Billionaire by 20 — Think like a plutocrat</div>'
    +'</div>';
}

/* ─────────────────────────────────────────
   PUBLIC API — window.PG
─────────────────────────────────────────── */
window.PG={
  closeModal:closeModal,

  /* Setup flow */
  start:function(){G.screen='setup_name';render();},
  changeLoc:function(){G.screen='setup_loc';render();},
  setLoc:function(code){applyLoc(code);render();},
  fromLoc:function(){G.screen='title';render();},
  setName:function(){var v=(gel('ninp').value||'').trim();if(!v)return;G.playerName=v;G.screen='setup_profile';render();},
  pick:function(id){G.profile=id;render();},
  confirmProfile:function(){
    if(!G.profile)return;
    var p=prof();
    G.cash=sc(p.cash);G.timeUsed=p.timeUsed;G.salaryGrowthBonus=0;G.taxRate=p.taxRate;
    G.screen='setup_housing';render();
  },
  backToProfile:function(){G.screen='setup_profile';render();},
  backToHousing:function(){G.screen='setup_housing';render();},
  setHousing:function(id){G.housing=LOC.housing.find(function(h){return h.id===id;});render();},
  toGrocery:function(){if(!G.housing)return;G.screen='setup_grocery';render();},
  setGrocery:function(id){G.grocery=LOC.groceries.find(function(g){return g.id===id;});render();},

  startGame:function(){
    if(!G.grocery)return;
    G.expenses=[];G.assets=[];G.liabilities=[];G.carriedExpenses=[];
    G.dealsDoneByCategory={};G.dealsDoneById=[];
    G.disciplineScore=0;G.loanAmount=0;G.loanMonthlyPayment=0;
    G.identityShiftShown=false;G.lifestyleTemptationPending=false;G.lifestyleTemptationShown=false;
    G.blackSwanDrawnThisYear=false;G.blackSwanExpenseSpike=0;
    G.consolidationPhase=false;G.consecutivePassiveCoverageMonths=0;G.inflationFactor=1;
    G.hasManager=false;G.managerMonthlySalary=0;
    G.scenariosFired=[];G.pendingScenario=null;G.survivalStep=0;G.bankruptcyLog=[];
    G.lastScenarioMonth=0;
    if(G.profile==='inheritor'){
      G.assets.push({id:'family_prop_1',name:'Family property',type:'real estate',bucket:'cf',
        income:sc(8000),expense:sc(1500),time:0,count:1,newThisMonth:false,monthsOwned:0});
    }
    shuffleDeck();recalc();
    addLog('Game started. '+G.playerName+', '+prof().name+', '+LOC.country+'.');
    G.screen='game';render();
  },

  /* Board navigation */
  goGame:function(){G.screen='game';render();},
  toggleLog:function(){G.showFullLog=!G.showFullLog;render();},
  goBorrow:function(){G.screen='borrow';render();},
  goBuy:function(){G.screen='buy';render();},
  goDeals:function(){
    if(freeTime()<1){showModal('No free time','Delegate tasks first to free up time for deals.',[{label:'OK',cls:'btn-ghost',fn:'PG.closeModal();'}]);return;}
    G.screen='deals';render();
  },
  goCollect:function(){
    if(!G.monthIncomes)G.monthIncomes=buildMonthIncomes();
    if(G.hasManager){
      G.monthIncomes.forEach(function(i){
        if(!i.done){
          var tax=i.isSalary?salaryTax():i.isPassive?passiveTax(i.amount):0;
          G.cash+=(i.amount-tax);
          i.done=true;
          i.cashTaken=true;
        }
      });
    }
    var hasPassiveReady=G.monthIncomes.some(function(i){return i.isPassive&&i.amount>0;});
    if(hasPassiveReady&&!G.identityShiftShown){G.screen='identity_shift';render();return;}
    G.screen='collect';render();
  },
  goPayExp:function(){
    if(!G.monthExpenses)G.monthExpenses=buildMonthExpenses();
    if(G.hasManager){managerAutoPayExpenses();}
    G.screen='pay_expenses';render();
  },

  /* Income / expense actions */
  collectOne:function(idx){
    var item=G.monthIncomes&&G.monthIncomes[idx];
    if(!item||item.done)return;
    var tax=item.isSalary?salaryTax():item.isPassive?passiveTax(item.amount):0;
    G.cash+=(item.amount-tax);
    item.done=true;
    item.cashTaken=true;
    render();
  },
  payOne:function(idx){
    var item=G.monthExpenses&&G.monthExpenses[idx];
    if(!item||item.done)return;
    if(G.cash<item.amount){
      showModal('Insufficient cash',
        'You need '+fmt(item.amount)+' to pay <strong>'+item.label+'</strong>.<br><br>You have '+fmt(G.cash)+'. Collect income first or sell an asset.',
        [{label:'OK',cls:'btn-ghost',fn:'PG.closeModal();'}]);
      return;
    }
    G.cash-=item.amount;
    item.done=true;
    item.cashTaken=true;
    if(item.isCarried){G.carriedExpenses=G.carriedExpenses.filter(function(c){return c.id!==item.originalId;});}
    render();
  },
  skipOne:function(idx){
    var item=G.monthExpenses&&G.monthExpenses[idx];
    if(!item||item.done||item.mandatory)return;
    item.done=true;item.skipped=true;item.skippedMonths=(item.skippedMonths||0)+1;
    addLog('Skipped: '+item.label+' — carries to next month.');render();
  },

  /* Asset / liability actions */
  buyAsset:function(id,cost,time,income,expense,type,name,repeatable,bucket){
    if(G.cash<cost)return;
    var owned=G.assets.find(function(a){return a.id===id&&!a.newThisMonth;});
    if(!repeatable&&owned)return;
    G.cash-=cost;
    if(id==='hire_mgr'){
      G.hasManager=true;G.timeUsed=Math.max(0,G.timeUsed+time);
      G.taxRate=Math.max(5,G.taxRate-5);
      G.managerMonthlySalary=sc(12000);
      addLog('Manager/PA hired. Recruitment fee: '+fmt(cost)+'. Monthly salary: '+fmt(G.managerMonthlySalary)+'. Tax rate now '+G.taxRate+'%.');
    } else if(type==='delegation'){
      G.timeUsed=Math.max(0,G.timeUsed+time);
      G.taxRate=Math.max(5,G.taxRate-5);
      addLog('Delegated: '+name+'. Time freed. Tax rate now '+G.taxRate+'%.');
      G.assets.push({id:id,name:name,type:type,bucket:bucket||'dl',income:income,expense:expense,time:time||0,count:1,newThisMonth:true,monthsOwned:0});
    } else if(owned&&repeatable){
      G.assets.push({id:id+'_stack_'+G.month+'_'+G.year,name:name,type:type,bucket:bucket||'cf',income:income,expense:expense,time:time||0,count:1,newThisMonth:true,monthsOwned:0,stackParent:id});
      addLog('Stacked: '+name+'. +'+fmt(income-expense)+' net/mo from next month.');
    } else {
      G.assets.push({id:id,name:name,type:type,bucket:bucket||'cf',income:income,expense:expense,time:time||0,count:1,newThisMonth:true,monthsOwned:0});
      addLog('Acquired: '+name+'. Owned now. Income starts next month.');
    }
    if(G.opmDiscount)G.opmDiscount=false;
    G.delegDiscount=false;recalc();render();
  },
  sellAsset:function(idx){
    var a=G.assets[idx];if(!a||a.newThisMonth)return;
    var def=ASSET_DEFS.find(function(d){return a.id===d.id||a.id.indexOf(d.id)===0;});
    var sellPrice=def?def.sellVal(a):sc(50000);
    if(a.mortgage){var net=sellPrice-a.mortgage.balance;sellPrice=Math.max(0,net);}
    showModal('Sell '+a.name,
      'Market value: <span style="color:var(--gold);font-size:16px;font-weight:600">'+fmt(sellPrice)+'</span>'+(a.mortgage?'<br><span style="font-size:11px;color:var(--orange)">Mortgage balance deducted</span>':'')+'<br><br>Monthly income of '+fmt(a.income)+'/mo will stop.',
      [{label:'Confirm sale',cls:'btn-red',fn:'PG.confirmSell('+idx+','+sellPrice+');PG.closeModal();'},
       {label:'Keep asset',cls:'btn-ghost',fn:'PG.closeModal();'}]);
  },
  confirmSell:function(idx,price){
    var a=G.assets[idx];if(!a)return;
    G.cash+=price;addLog('Sold: '+a.name+'. Received '+fmt(price)+'.');
    G.assets.splice(idx,1);recalc();render();
  },
  buyLiability:function(id,cost,monthly){
    var item=LIABILITIES.find(function(x){return x.id===id;});if(!item)return;
    if(cost>0&&G.cash<cost)return;
    if(G.liabilities.find(function(l){return l.id===id;}))return;
    if(cost>0)G.cash-=cost;
    G.liabilities.push(Object.assign({},item,{cost:cost,monthly:monthly}));
    addLog('Liability: '+item.name+'.'+(item.perk?' Unlocks: '+item.perk:''));render();
  },
  changeHousing:function(id){
    G.housing=LOC.housing.find(function(h){return h.id===id;});
    if(G.monthExpenses){var he=G.monthExpenses.find(function(e){return e.id==='housing';});if(he){he.label='Rent — '+G.housing.name;he.amount=G.housing.cost;he.done=false;}}
    addLog('Housing changed: '+G.housing.name+'. '+fmt(G.housing.cost)+'/mo.');render();
  },
  changeGrocery:function(id){
    G.grocery=LOC.groceries.find(function(g){return g.id===id;});
    if(G.monthExpenses){var ge=G.monthExpenses.find(function(e){return e.id==='grocery';});if(ge){ge.label='Groceries — '+G.grocery.name;ge.amount=G.grocery.cost;ge.done=false;}}
    addLog('Groceries changed: '+G.grocery.name+'. '+fmt(G.grocery.cost)+'/mo.');render();
  },

  /* Mortgage */
  mortgageAsset:function(idx){
    var a=G.assets[idx];
    if(!a||a.newThisMonth||a.mortgage)return;
    var mv=assetMarketValue(a);var principal=Math.floor(mv*0.6);var monthly=Math.round(principal*0.10/12);
    showModal('Mortgage '+a.name,
      'Borrow up to 60% of market value.<br><br>'
      +'Market value: '+fmt(mv)+'<br>'
      +'Mortgage proceeds: <span style="color:var(--orange);font-weight:600">'+fmt(principal)+'</span><br>'
      +'Monthly payment: <span style="color:var(--red)">'+fmt(monthly)+'/mo</span> (10% p.a. — mandatory)<br><br>'
      +'One mortgage per asset. You can repay at any time.',
      [{label:'Take mortgage',cls:'btn-orange',fn:'PG.confirmMortgage('+idx+');PG.closeModal();'},
       {label:'Cancel',cls:'btn-ghost',fn:'PG.closeModal();'}]);
  },
  confirmMortgage:function(idx){mortgageAsset(idx);render();},
  repayMortgage:function(idx){repayMortgage(idx);},

  /* Manager */
  fireManager:function(){
    showModal('Fire manager',
      'Firing the manager will:<br><br>● Stop automation immediately<br>● Remove the '+fmt(G.managerMonthlySalary)+'/mo mandatory salary expense<br>● You will need to collect and pay manually again.',
      [{label:'Fire manager',cls:'btn-red',fn:'PG.confirmFireManager();PG.closeModal();'},
       {label:'Keep manager',cls:'btn-ghost',fn:'PG.closeModal();'}]);
  },
  confirmFireManager:function(){
    G.hasManager=false;G.timeUsed=Math.min(24,G.timeUsed+3);
    addLog('Manager fired. Monthly salary saved: '+fmt(G.managerMonthlySalary)+'/mo.');
    G.managerMonthlySalary=0;
    /* Remove manager salary from current month expenses if present */
    if(G.monthExpenses){G.monthExpenses=G.monthExpenses.filter(function(e){return e.id!=='mgr_salary';});}
    render();
  },

  /* Drop habit */
  dropHabit:function(idx){
    var l=G.liabilities[idx];if(!l)return;
    var ldef=LIABILITIES.find(function(x){return x.id===l.id;});
    var exitVal=ldef&&ldef.exitValue?Math.round(l.cost*ldef.exitValue):0;
    var msg='Drop <strong>'+l.name+'</strong>?<br><br>Monthly expense of '+fmt(l.monthly)+' stops immediately.'+(exitVal>0?'<br>You recover '+fmt(exitVal)+' from the sale.':'<br>Zero exit value.')+'<br><br><span style="color:var(--green);font-size:12px">+2 discipline score</span>';
    showModal('Drop habit',msg,
      [{label:'Drop it',cls:'btn-green',fn:'PG.confirmDropHabit('+idx+');PG.closeModal();'},
       {label:'Keep',cls:'btn-ghost',fn:'PG.closeModal();'}]);
  },
  confirmDropHabit:function(idx){
    var l=G.liabilities[idx];if(!l)return;
    var ldef=LIABILITIES.find(function(x){return x.id===l.id;});
    var exitVal=ldef&&ldef.exitValue?Math.round(l.cost*ldef.exitValue):0;
    if(exitVal>0)G.cash+=exitVal;
    G.disciplineScore+=2;
    addLog('Dropped habit: '+l.name+'. +2 discipline. '+( exitVal>0?'Recovered '+fmt(exitVal)+'.':'Zero exit value.')+'  "You cut the expense. But the urge will return."');
    G.liabilities.splice(idx,1);
    /* Remove from current month expenses if present */
    if(G.monthExpenses){G.monthExpenses=G.monthExpenses.filter(function(e){return e.id!=='liab_'+l.id;});}
    render();
  },

  /* Deals */
  executeDeal:function(id){
    var deal=DEALS.find(function(d){return d.id===id;});if(!deal)return;
    if(G.reputation<deal.repReq||freeTime()<deal.time||!dealPrereqMet(deal))return;
    G.timeUsed=Math.min(24,G.timeUsed+deal.time);
    var success=Math.random()<deal.rate;
    if(success){
      var earn=sc(deal.min)+Math.floor(Math.random()*sc(deal.max-deal.min));
      G.cash+=earn;G.reputation=Math.min(10,G.reputation+1);G.dealsDone++;
      if(!G.dealsDoneByCategory[deal.cat])G.dealsDoneByCategory[deal.cat]=0;
      G.dealsDoneByCategory[deal.cat]++;
      G.dealsDoneById.push(deal.id);
      addLog('Deal: '+deal.name+'. +'+fmt(earn)+'. Rep: '+G.reputation+'/10.');
      showModal('Deal closed',deal.name+'<br><br><span style="color:var(--green);font-size:20px;font-weight:600">+'+fmt(earn)+'</span><br><span style="font-size:11px;color:var(--text3)">Reputation: '+G.reputation+'/10 &nbsp;·&nbsp; Deals: '+G.dealsDone+'</span>',
        [{label:'Continue',cls:'btn-gold',fn:'PG.closeModal();PG.goGame();'}]);
    } else {
      G.reputation=Math.max(0,G.reputation-1);
      addLog('Deal failed: '+deal.name+'. Rep: '+G.reputation+'/10.');
      showModal('Deal failed',deal.name+'<br><br><span style="color:var(--red);font-size:13px">Reputation dropped to '+G.reputation+'/10</span><br><span style="font-size:11px;color:var(--text3)">No money lost. Only reputation.</span>',
        [{label:'Accept',cls:'btn-ghost',fn:'PG.closeModal();PG.goGame();'}]);
    }
  },

  /* Month flow */
  passBlocked:function(){
    var mi=!allIncomeDone();var me=!allMandatoryExpDone();
    var msg='Before passing this month:<br><br>';
    if(mi)msg+='<span style="color:var(--red)">● Income not fully collected</span><br>';
    if(me)msg+='<span style="color:var(--red)">● Mandatory expenses not paid</span><br>';
    var btns=[];
    if(mi)btns.push({label:'Collect income',cls:'btn-green',fn:'PG.closeModal();PG.goCollect();'});
    if(me)btns.push({label:'Pay expenses',cls:'btn-red',fn:'PG.closeModal();PG.goPayExp();'});
    btns.push({label:'Cancel',cls:'btn-ghost',fn:'PG.closeModal();'});
    showModal('Month not complete',msg,btns);
  },
  passMonth:function(){
    if(!canPass()){PG.passBlocked();return;}
    /* Check for scenario trigger */
    var sc_check=checkScenario();
    if(sc_check){
      G.pendingScenario=sc_check;
      G.screen='scenario';render();return;
    }
    /* Draw event card */
    if(G.month===6&&!G.blackSwanDrawnThisYear){
      G.blackSwanDrawnThisYear=true;
      G.eventCard=drawBlackSwan();
    } else {
      G.eventCard=drawCard();
    }
    /* Check for smart response */
    var hasSmartResp=G.eventCard&&EVENT_RESPONSES[G.eventCard.title];
    G.screen=hasSmartResp?'smart_response':'event';
    render();
  },
  acceptEvent:function(){
    if(G.eventCard&&G.eventCard.fn)G.eventCard.fn(G);
    G.delegDiscount=false;G.opmDiscount=false;
    G._lastSettleResult=settleMonth();
    /* FIX: check for cash shortage after settle — route to survival if needed */
    if(checkCashShortage()){G.screen='survival';render();return;}
    G.screen='endmonth';
    render();
  },
  acceptSmartResponse:function(){
    var e=G.eventCard;
    var resp=EVENT_RESPONSES&&EVENT_RESPONSES[e.title];
    if(resp){
      var tier=resp.check(G);
      resp[tier].damage(G);
    }
    G.delegDiscount=false;G.opmDiscount=false;
    G._lastSettleResult=settleMonth();
    /* FIX: check for cash shortage after settle — route to survival if needed */
    if(checkCashShortage()){G.screen='survival';render();return;}
    G.screen='endmonth';
    render();
  },

  /* Scenario actions */
  chooseScenario:function(scenId,choiceId){
    var sc_obj=DEAL_SCENARIOS.find(function(x){return x.id===scenId;});
    if(!sc_obj)return;
    G.scenariosFired.push(scenId);
    G.lastScenarioMonth=G.monthsPlayed;
    var out=sc_obj.outcomes[choiceId];
    if(out.effect)out.effect(G);
    G.pendingOutcome=out;
    G.screen='scenario_outcome';render();
  },
  finishScenario:function(){
    G.pendingScenario=null;G.pendingOutcome=null;
    /* Now draw regular event */
    if(G.month===6&&!G.blackSwanDrawnThisYear){
      G.blackSwanDrawnThisYear=true;
      G.eventCard=drawBlackSwan();
    } else {
      G.eventCard=drawCard();
    }
    var hasSmartResp=G.eventCard&&EVENT_RESPONSES[G.eventCard.title];
    G.screen=hasSmartResp?'smart_response':'event';
    render();
  },

  /* Survival */
  forceSellSurvival:function(price){
    var a=G.survivalAsset;
    var idx=G.assets.indexOf(a);
    if(idx>-1){G.assets.splice(idx,1);}
    G.cash+=price;
    addLog('FORCED SALE: '+a.name+' sold for '+fmt(price)+'. "You are asset-rich and cash-poor."');
    G.survivalStep=0;recalc();G.screen='game';render();
  },
  emergencyMortgage:function(){
    var a=G.survivalMortgageAsset;
    var idx=G.assets.indexOf(a);
    if(idx>-1){
      var mv=assetMarketValue(a);
      var principal=Math.floor(mv*0.6);
      var monthly=Math.round(principal*0.18/12); /* 18% emergency rate */
      a.mortgage={principal:principal,monthlyPayment:monthly,balance:principal,emergency:true};
      G.cash+=principal;
      addLog('EMERGENCY MORTGAGE: '+a.name+'. Received '+fmt(principal)+'. Rate: 18% p.a. "You borrowed against your own asset to survive the month."');
    }
    G.survivalStep=0;recalc();G.screen='game';render();
  },
  declareBankruptcy:function(){
    G.bankruptcyLog=G.log.slice();
    G.screen='bankruptcy';render();
  },

  /* Loan */
  takeLoan:function(amount,monthly){
    if(G.loanAmount>0){showModal('Loan active','Repay your current loan before taking a new one.',[{label:'OK',cls:'btn-ghost',fn:'PG.closeModal();'}]);return;}
    G.cash+=amount;G.loanAmount=amount;G.loanMonthlyPayment=monthly;
    addLog('Borrowed: '+fmt(amount)+'. Monthly interest: '+fmt(monthly)+'. Deploy into assets immediately.');
    G.screen='game';render();
  },
  repayLoan:function(){
    if(G.cash<G.loanAmount){showModal('Insufficient cash','You need '+fmt(G.loanAmount)+' to repay the loan. You have '+fmt(G.cash)+'.',[{label:'OK',cls:'btn-ghost',fn:'PG.closeModal();'}]);return;}
    G.cash-=G.loanAmount;
    addLog('Loan repaid: '+fmt(G.loanAmount)+'. No more interest payments.');
    G.loanAmount=0;G.loanMonthlyPayment=0;
    G.screen='game';render();
  },

  /* Temptation */
  resistTemptation:function(){
    G.lifestyleTemptationPending=false;G.lifestyleTemptationShown=true;
    G.disciplineScore++;
    addLog('Resisted lifestyle temptation. Discipline: '+G.disciplineScore);
    showModal('Discipline',
      'You chose not to upgrade.<br><br><span style="color:var(--green);font-size:18px;font-weight:600">+1 Discipline</span><br><br><span style="font-size:12px;color:var(--text3)">The wealthy are not wealthy because they earn more. They are wealthy because they resist more.</span>',
      [{label:'Continue',cls:'btn-gold',fn:'PG.closeModal();PG.goGame();'}]);
  },
  indulgeTemptation:function(){
    G.lifestyleTemptationPending=false;G.lifestyleTemptationShown=true;
    var available=TEMPTATION_LIABILITIES.filter(function(t){return !G.liabilities.find(function(l){return l.id===t.id;});});
    if(available.length){
      var chosen=available[Math.floor(Math.random()*available.length)];
      var sc_mo=sc(chosen.monthly);
      G.liabilities.push({id:chosen.id,name:chosen.name,cost:0,monthly:sc_mo,type:'lifestyle',desc:'Lifestyle indulgence.',perk:'',exitValue:0});
      addLog('Lifestyle indulgence: '+chosen.name+'. +'+fmt(sc_mo)+'/mo permanent expense.');
      showModal('Indulgence',
        'You upgraded.<br><br><span style="color:var(--red);font-size:14px">'+chosen.name+' added — '+fmt(sc_mo)+'/mo forever</span><br><br><span style="font-size:12px;color:var(--text3)">Lifestyle inflation is permanent. Your expenses just rose. Your income did not.</span>',
        [{label:'Accept',cls:'btn-ghost',fn:'PG.closeModal();PG.goGame();'}]);
    } else {
      G.disciplineScore++;
      showModal('Nothing left to buy','You have already indulged in everything available. Congratulations on your expensive taste.<br><br><span style="color:var(--green)">+1 Discipline by default</span>',
        [{label:'Continue',cls:'btn-gold',fn:'PG.closeModal();PG.goGame();'}]);
    }
  },

  /* Win flow */
  acknowledgeIdentityShift:function(){G.identityShiftShown=true;G.screen='collect';render();},
  triggerWin:function(){G.screen='consolidation';render();},
  enterConsolidation:function(){
    G.consolidationPhase=true;G.consecutivePassiveCoverageMonths=0;
    addLog('Consolidation phase entered. New challenge: sustain 3x passive coverage for 3 months.');
    G.screen='game';render();
  },
  claimWin:function(){G.screen='win';render();},

  /* Next month */
  nextMonth:function(){
    if(G.month>=12){G.month=1;G.year++;G.blackSwanDrawnThisYear=false;}
    else{G.month++;}

    /* Mortgage foreclosure check */
    G.assets.forEach(function(a){
      if(!a.newThisMonth&&a.mortgage){
        if(G.cash<a.mortgage.monthlyPayment){
          /* Foreclosure — force sell at 80% */
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
        if(a.regulatorySuspended>0){a.regulatorySuspended--;if(a.regulatorySuspended===0)addLog(a.name+' regulatory suspension lifted.');}
        toKeep.push(a);
      }
    });
    toMerge.forEach(function(m){
      var parent=toKeep.find(function(a){return a.id===m.stackParent;});
      if(parent){parent.income+=m.income;parent.expense+=m.expense;parent.count=(parent.count||1)+1;}
      else{m.id=m.stackParent;delete m.stackParent;toKeep.push(m);}
    });
    G.assets=toKeep;

    G.monthIncomes=null;G.monthExpenses=null;G.eventCard=null;
    G.lifestyleTemptationPending=false;G.lifestyleTemptationShown=false;
    recalc();G.screen='game';render();
  },

  /* Reset */
  reset:function(){
    Object.assign(G,{
      screen:'title',playerName:'',profile:null,month:1,year:1,cash:0,
      expenses:[],assets:[],liabilities:[],log:[],eventDeck:[],usedEvents:[],eventCard:null,
      hasManager:false,housing:null,grocery:null,monthIncomes:null,monthExpenses:null,
      delegDiscount:false,opmDiscount:false,passiveIncome:0,passiveExpense:0,
      salaryGrowthBonus:0,monthsPlayed:0,timeUsed:0,reputation:3,dealsDone:0,
      dealsDoneByCategory:{},dealsDoneById:[],carriedExpenses:[],
      disciplineScore:0,taxRate:30,loanAmount:0,loanMonthlyPayment:0,
      identityShiftShown:false,lifestyleTemptationPending:false,lifestyleTemptationShown:false,
      blackSwanDrawnThisYear:false,blackSwanExpenseSpike:0,
      consolidationPhase:false,consecutivePassiveCoverageMonths:0,inflationFactor:1,
      hasManager:false,managerMonthlySalary:0,
      scenariosFired:[],pendingScenario:null,survivalStep:0,bankruptcyLog:[],lastScenarioMonth:0
    });
    render();
  }
};

/* ─── INIT ─── */
function init(){
  detectLocation(function(success){
    G.screen=success?'title':'setup_loc';
    render();
  });
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init);
} else {
  setTimeout(init,0);
}

})();
