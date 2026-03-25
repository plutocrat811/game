/* PLUTOCRAT v11 — plutocrat-engine-actions-b.js */
/* Public API Part B: asset/liability buy/sell, mortgage, manager, */
/* habits, deals, month flow (passMonth, acceptEvent, acceptSmartResponse, */
/* legend, scenario), win flow */
/* Load order: after plutocrat-engine-actions-a.js */
/* Standalone file — accesses internals via window._PGInternal */

'use strict';

/* ─── Local aliases to _PGInternal for readability ─── */
var _ib=window._PGInternal;
var G=_ib.G;
var render=function(){_ib.render();};
var fmt=function(n){return _ib.fmt(n);};
var sc=function(n){return _ib.sc(n);};
var addLog=function(msg){_ib.addLog(msg);};
var autosave=function(){_ib.autosave();};
var recalc=function(){_ib.recalc();};
var showModal=function(t,b,btns){_ib.showModal(t,b,btns);};
var freeTime=function(){return _ib.freeTime();};
var settleMonth=function(){return _ib.settleMonth();};
var checkCashShortage=function(){return _ib.checkCashShortage();};
var checkScenario=function(){return _ib.checkScenario();};
var checkLegend=function(){return _ib.checkLegend();};
var canPass=function(){return _ib.canPass();};
var allIncomeDone=function(){return _ib.allIncomeDone();};
var allMandatoryExpDone=function(){return _ib.allMandatoryExpDone();};
var dealPrereqMet=function(d){return _ib.dealPrereqMet(d);};
var mortgageAsset=function(idx){return _ib.mortgageAsset(idx);};
var repayMortgage=function(idx){_ib.repayMortgage(idx);};
var assetMarketValue=function(a){return _ib.assetMarketValue(a);};
var drawCard=function(){return _ib.drawCard();};
var drawBlackSwan=function(){return _ib.drawBlackSwan();};

/* ─────────────────────────────────────────
   BUILD window.PG — Part B
   Extends window.PG built by Part A.
─────────────────────────────────────────── */
window.PG=window.PG||{};

Object.assign(window.PG,{

  /* ── Asset / liability actions ── */
  buyAsset:function(id,cost,time,income,expense,type,name,repeatable,bucket){
    if(G.cash<cost)return;
    var owned=G.assets.find(function(a){return a.id===id&&!a.newThisMonth;});
    if(!repeatable&&owned)return;
    G.cash-=cost;
    if(id==='hire_mgr'){
      G.hasManager=true;
      /* BUG 15 FIX — store exact time consumed so fireManager restores it precisely */
      G.managerTimeUsed=time;
      G.timeUsed=Math.max(0,G.timeUsed+time);
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
      'Market value: <span style="color:var(--gold);font-size:16px;font-weight:600">'+fmt(sellPrice)+'</span>'
      +(a.mortgage?'<br><span style="font-size:11px;color:var(--orange)">Mortgage balance deducted</span>':'')
      +'<br><br>Monthly income of '+fmt(a.income)+'/mo will stop.',
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
    G.liabilities.push(Object.assign({},item,{cost:cost,monthly:monthly,paused:false,stopped:false,pausedMonthsRemaining:0}));
    addLog('Liability: '+item.name+'.'+(item.perk?' Unlocks: '+item.perk:''));render();
  },

  changeHousing:function(id){
    G.housing=_ib.LOC.housing.find(function(h){return h.id===id;});
    var spike=G.blackSwanExpenseSpike||0;var inf=G.inflationFactor||1;
    var adjCost=Math.round(G.housing.cost*(1+spike)*inf);
    if(G.monthExpenses){
      var he=G.monthExpenses.find(function(e){return e.id==='housing';});
      if(he){he.label='Rent — '+G.housing.name;he.amount=adjCost;he.done=false;}
    }
    addLog('Housing changed: '+G.housing.name+'. '+fmt(adjCost)+'/mo.');render();
  },

  changeGrocery:function(id){
    G.grocery=_ib.LOC.groceries.find(function(g){return g.id===id;});
    var spike=G.blackSwanExpenseSpike||0;var inf=G.inflationFactor||1;
    var adjCost=Math.round(G.grocery.cost*(1+spike)*inf);
    if(G.monthExpenses){
      var ge=G.monthExpenses.find(function(e){return e.id==='grocery';});
      if(ge){ge.label='Groceries — '+G.grocery.name;ge.amount=adjCost;ge.done=false;}
    }
    addLog('Groceries changed: '+G.grocery.name+'. '+fmt(adjCost)+'/mo.');render();
  },

  /* ── Mortgage ── */
  mortgageAsset:function(idx){
    var a=G.assets[idx];
    if(!a||a.newThisMonth||a.mortgage)return;
    var mv=assetMarketValue(a);
    var principal=Math.floor(mv*0.6);
    var monthly=Math.round(principal*0.10/12);
    showModal('Mortgage '+a.name,
      'Borrow up to 60% of market value.<br><br>'
      +'Market value: '+fmt(mv)+'<br>'
      +'Mortgage proceeds: <span style="color:var(--orange);font-weight:600">'+fmt(principal)+'</span><br>'
      +'Monthly payment: <span style="color:var(--red)">'+fmt(monthly)+'/mo</span> (10% p.a. — mandatory)<br><br>'
      +'One mortgage per asset. Balance reduces each month. Repay at any time.',
      [{label:'Take mortgage',cls:'btn-orange',fn:'PG.confirmMortgage('+idx+');PG.closeModal();'},
       {label:'Cancel',cls:'btn-ghost',fn:'PG.closeModal();'}]);
  },
  confirmMortgage:function(idx){mortgageAsset(idx);render();},
  repayMortgage:function(idx){repayMortgage(idx);},

  /* ── Manager ── */
  fireManager:function(){
    showModal('Fire manager',
      'Firing the manager will:<br><br>'
      +'● Stop automation immediately<br>'
      +'● Remove the '+fmt(G.managerMonthlySalary)+'/mo mandatory salary expense<br>'
      +'● You will need to collect and pay manually again.',
      [{label:'Fire manager',cls:'btn-red',fn:'PG.confirmFireManager();PG.closeModal();'},
       {label:'Keep manager',cls:'btn-ghost',fn:'PG.closeModal();'}]);
  },
  confirmFireManager:function(){
    G.hasManager=false;
    /* BUG 15 FIX — restore exactly the time the manager consumed at hire,
       not a hardcoded +3. Falls back to 3 for legacy saves without managerTimeUsed. */
    var timeToRestore=G.managerTimeUsed?Math.abs(G.managerTimeUsed):3;
    G.timeUsed=Math.min(24,G.timeUsed+timeToRestore);
    /* BUG 14 FIX — restore the 5% tax reduction applied at hire.
       Previously firing manager was a permanent free tax cut. */
    G.taxRate=Math.min(30,G.taxRate+5);
    addLog('Manager fired. Tax rate restored to '+G.taxRate+'%. Monthly salary saved: '+fmt(G.managerMonthlySalary)+'/mo.');
    G.managerMonthlySalary=0;
    G.managerTimeUsed=0;
    if(G.monthExpenses){
      G.monthExpenses=G.monthExpenses.filter(function(e){return e.id!=='mgr_salary';});
    }
    render();
  },

  /* ── Drop habit ── */
  dropHabit:function(idx){
    var l=G.liabilities[idx];if(!l)return;
    var ldef=LIABILITIES.find(function(x){return x.id===l.id;});
    var exitVal=ldef&&ldef.exitValue?Math.round(l.cost*ldef.exitValue):0;
    var perkWarn=G.profile==='dealmaker'&&l.perk
      ?'<br><span style="color:var(--orange);font-size:11px">⚠ This will permanently remove: '+l.perk+'</span>'
      :'';
    var msg='Drop <strong>'+l.name+'</strong>?'+perkWarn
      +'<br><br>Monthly expense of '+fmt(l.monthly)+' stops immediately.'
      +(exitVal>0?'<br>You recover '+fmt(exitVal)+' from the sale.':'<br>Zero exit value.')
      +'<br><br><span style="color:var(--green);font-size:12px">+2 discipline score</span>';
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
    addLog('Dropped habit: '+l.name+'. +2 discipline. '+(exitVal>0?'Recovered '+fmt(exitVal)+'.':'Zero exit value.')+' "You cut the expense. But the urge will return."');
    G.liabilities.splice(idx,1);
    if(G.monthExpenses){
      G.monthExpenses=G.monthExpenses.filter(function(e){return e.id!=='liab_'+l.id;});
    }
    render();
  },

  /* ── Deals ── */
  executeDeal:function(id){
    var deal=DEALS.find(function(d){return d.id===id;});if(!deal)return;
    if(G.reputation<deal.repReq||freeTime()<deal.time||!dealPrereqMet(deal))return;
    var success=Math.random()<deal.rate;
    if(success){
      G.timeUsed=Math.min(24,G.timeUsed+deal.time);
      var earn=sc(deal.min)+Math.floor(Math.random()*sc(deal.max-deal.min));
      G.cash+=earn;G.reputation=Math.min(10,G.reputation+1);G.dealsDone++;
      if(!G.dealsDoneByCategory[deal.cat])G.dealsDoneByCategory[deal.cat]=0;
      G.dealsDoneByCategory[deal.cat]++;
      G.dealsDoneById.push(deal.id);
      addLog('Deal: '+deal.name+'. +'+fmt(earn)+'. Rep: '+G.reputation+'/10.');
      showModal('Deal closed',
        deal.name+'<br><br>'
        +'<span style="color:var(--green);font-size:20px;font-weight:600">+'+fmt(earn)+'</span><br>'
        +'<span style="font-size:11px;color:var(--text3)">Reputation: '+G.reputation+'/10 &nbsp;·&nbsp; Deals: '+G.dealsDone+'</span>',
        [{label:'Continue',cls:'btn-gold',fn:'PG.closeModal();PG.goGame();'}]);
    } else {
      G.timeUsed=Math.min(24,G.timeUsed+deal.time);
      G.reputation=Math.max(0,G.reputation-1);
      addLog('Deal failed: '+deal.name+'. Rep: '+G.reputation+'/10.');
      showModal('Deal failed',
        deal.name+'<br><br>'
        +'<span style="color:var(--red);font-size:13px">Reputation dropped to '+G.reputation+'/10</span><br>'
        +'<span style="font-size:11px;color:var(--text3)">No money lost. Only reputation.</span>',
        [{label:'Accept',cls:'btn-ghost',fn:'PG.closeModal();PG.goGame();'}]);
    }
  },

  /* ── Month flow ── */
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

    /* BUG 9 FIX — if a stale pendingLifestyleInflation survived a save/load
       on the lifestyle_inflation screen, route to it so the player can resolve
       it before the month settles. This is the only safe path from this screen. */
    if(G.pendingLifestyleInflation){
      G.screen='lifestyle_inflation';render();return;
    }

    /* Check for legend event */
    var legCheck=checkLegend();
    if(legCheck){
      G.pendingLegend=legCheck;
      G.legendFired.push(legCheck.id);
      G.lastLegendMonth=G.monthsPlayed;
      if(legCheck.effect)legCheck.effect(G);
      G.screen='legend';render();return;
    }

    /* Check for scenario trigger */
    var scenarioCheck=checkScenario();
    if(scenarioCheck){
      G.pendingScenario=scenarioCheck;
      /* BUG 5 FIX — set lastScenarioMonth at commit time not inside finder */
      G.lastScenarioMonth=G.monthsPlayed;
      G.screen='scenario';render();return;
    }

    /* Draw event card */
    var bsMonth=G.blackSwanMonth||6;
    if(G.month===bsMonth&&!G.blackSwanDrawnThisYear){
      G.blackSwanDrawnThisYear=true;
      G.eventCard=drawBlackSwan();
    } else {
      G.eventCard=drawCard();
    }
    var hasSmartResp=G.eventCard&&EVENT_RESPONSES[G.eventCard.title];
    G.screen=hasSmartResp?'smart_response':'event';
    render();
  },

  acceptEvent:function(){
    if(G.eventCard&&G.eventCard.fn)G.eventCard.fn(G);
    if(G.pendingLifestyleInflation){
      G.screen='lifestyle_inflation';render();return;
    }
    G.delegDiscount=false;G.opmDiscount=false;
    G._lastSettleResult=settleMonth();
    autosave();
    if(checkCashShortage()){G.screen='survival';render();return;}
    G.screen='endmonth';render();
  },

  /* BUG 7 FIX — acceptSmartResponse() now calls G.eventCard.fn(G) FIRST
     before applying smart response damage. Previously fn was never called,
     so events like "Rental vacancy" never set vacantThisMonth — meaning
     rental income was incorrectly collected during a smart response month. */
  acceptSmartResponse:function(){
    var e=G.eventCard;
    if(e&&e.fn)e.fn(G);
    var resp=EVENT_RESPONSES&&EVENT_RESPONSES[e.title];
    if(resp){var tier=resp.check(G);resp[tier].damage(G);}
    G.delegDiscount=false;G.opmDiscount=false;
    G._lastSettleResult=settleMonth();
    autosave();
    if(checkCashShortage()){G.screen='survival';render();return;}
    G.screen='endmonth';render();
  },

  acknowledgeLegend:function(){
    G.pendingLegend=null;
    var scenarioCheck=checkScenario();
    if(scenarioCheck){
      G.pendingScenario=scenarioCheck;
      /* BUG 5 FIX — set lastScenarioMonth at commit time */
      G.lastScenarioMonth=G.monthsPlayed;
      G.screen='scenario';render();return;
    }
    var bsMonth=G.blackSwanMonth||6;
    if(G.month===bsMonth&&!G.blackSwanDrawnThisYear){
      G.blackSwanDrawnThisYear=true;G.eventCard=drawBlackSwan();
    } else {G.eventCard=drawCard();}
    var hasSmartResp=G.eventCard&&EVENT_RESPONSES[G.eventCard.title];
    G.screen=hasSmartResp?'smart_response':'event';render();
  },

  /* ── Scenario actions ── */
  chooseScenario:function(scenId,choiceId){
    var scenarioObj=DEAL_SCENARIOS.find(function(x){return x.id===scenId;});
    if(!scenarioObj)return;
    G.scenariosFired.push(scenId);
    /* BUG 5 FIX — lastScenarioMonth set here at player commit, not in finder */
    G.lastScenarioMonth=G.monthsPlayed;
    var out=scenarioObj.outcomes[choiceId];
    if(out.effect)out.effect(G);
    G.pendingOutcome=out;
    G.screen='scenario_outcome';render();
  },
  finishScenario:function(){
    G.pendingScenario=null;G.pendingOutcome=null;
    var bsMonth=G.blackSwanMonth||6;
    if(G.month===bsMonth&&!G.blackSwanDrawnThisYear){
      G.blackSwanDrawnThisYear=true;G.eventCard=drawBlackSwan();
    } else {G.eventCard=drawCard();}
    var hasSmartResp=G.eventCard&&EVENT_RESPONSES[G.eventCard.title];
    G.screen=hasSmartResp?'smart_response':'event';render();
  },

  /* ── Win flow ── */
  /* BUG 4 FIX — when manager auto-collected, route identity shift
     acknowledgement back to game board not collect screen */
  acknowledgeIdentityShift:function(){
    G.identityShiftShown=true;
    G.screen=G.hasManager?'game':'collect';
    render();
  },
  triggerWin:function(){G.screen='consolidation';render();},
  enterConsolidation:function(){
    G.consolidationPhase=true;G.consecutivePassiveCoverageMonths=0;
    addLog('Consolidation phase entered. New challenge: sustain 3x passive coverage for 3 months.');
    G.screen='game';render();
  },
  claimWin:function(){G.screen='win';render();}

}); /* end Object.assign Part B */
