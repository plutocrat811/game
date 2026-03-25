/* PLUTOCRAT v11 — plutocrat-engine-actions-a.js */
/* Public API Part A: setup flow, navigation, HUD, income/expense, */
/* pause/stop/resume, lifestyle inflation, temptation */
/* Load order: after plutocrat-engine-screens-events.js */
/* Standalone file — accesses internals via window._PGInternal */

'use strict';

/* ─── Local aliases to _PGInternal for readability ─── */
var _i=window._PGInternal;
var G=_i.G;
var render=function(){_i.render();};
var gel=function(id){return _i.gel(id);};
var fmt=function(n){return _i.fmt(n);};
var sc=function(n){return _i.sc(n);};
var addLog=function(msg){_i.addLog(msg);};
var autosave=function(){_i.autosave();};
var recalc=function(){_i.recalc();};
var showModal=function(t,b,btns){_i.showModal(t,b,btns);};
var loadGame=function(){return _i.loadGame();};
var shuffleDeck=function(){_i.shuffleDeck();};
var buildMonthIncomes=function(){return _i.buildMonthIncomes();};
var buildMonthExpenses=function(){return _i.buildMonthExpenses();};
var managerAutoPayExpenses=function(){_i.managerAutoPayExpenses();};
var salaryTax=function(){return _i.salaryTax();};
var passiveTax=function(n){return _i.passiveTax(n);};
var freeTime=function(){return _i.freeTime();};
var prof=function(){return _i.prof();};
var applyLoc=function(code){_i.applyLoc(code);};
var settleMonth=function(){return _i.settleMonth();};
var checkCashShortage=function(){return _i.checkCashShortage();};

/* ─────────────────────────────────────────
   BUILD window.PG — Part A
   Extends the stub set by engine-core.js.
   Parts B and C will add more methods.
─────────────────────────────────────────── */
window.PG=window.PG||{};

Object.assign(window.PG,{

  /* ── Setup flow ── */
  start:function(){G.screen='setup_name';render();},
  changeLoc:function(){G.screen='setup_loc';render();},
  setLoc:function(code){applyLoc(code);render();},
  fromLoc:function(){G.screen='title';render();},

  /* BUG 19 FIX — confirmLoc() is a deliberate confirmation distinct from
     fromLoc() (cancel/back). Both previously called fromLoc() which just
     returned to title — now Confirm is its own named action. */
  confirmLoc:function(){G.screen='title';render();},

  setName:function(){
    var v=(gel('ninp').value||'').trim();
    if(!v)return;
    G.playerName=v;G.screen='setup_profile';render();
  },
  pick:function(id){G.profile=id;render();},
  confirmProfile:function(){
    if(!G.profile)return;
    var p=prof();
    G.cash=sc(p.cash);G.timeUsed=p.timeUsed;G.salaryGrowthBonus=0;G.taxRate=p.taxRate;
    G.screen='setup_housing';render();
  },
  backToProfile:function(){G.screen='setup_profile';render();},
  backToHousing:function(){G.screen='setup_housing';render();},
  setHousing:function(id){
    G.housing=_i.LOC.housing.find(function(h){return h.id===id;});
    render();
  },
  toGrocery:function(){if(!G.housing)return;G.screen='setup_grocery';render();},
  setGrocery:function(id){
    G.grocery=_i.LOC.groceries.find(function(g){return g.id===id;});
    render();
  },

  continueSave:function(){
    if(loadGame()){render();}
    else{showModal('No save found','Could not load save data. Starting a new game.',
      [{label:'OK',cls:'btn-ghost',fn:'PG.closeModal();PG.start();'}]);}
  },

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
    G.lastScenarioMonth=0;G.lastLegendMonth=0;
    G.tutorialDismissed=false;G.showFullLog=false;G.dealFilter='all';
    G.survivalAsset=null;G.survivalMortgageAsset=null;G.pendingOutcome=null;
    G._lastSettleResult=null;G.passiveFirstFireSeen=false;
    G.legendFired=[];G.pendingLegend=null;
    G.loanStartsNextMonth=false;
    /* BUG 9 FIX — clear stale pendingLifestyleInflation on new game start
       so a stale flag from a previous save cannot trigger the screen
       immediately on passMonth() in a fresh game */
    G.pendingLifestyleInflation=null;
    G.hudBreakupKey='cash';

    /* Inheritor starts with family property */
    if(G.profile==='inheritor'){
      G.assets.push({id:'family_prop_1',name:'Family property',type:'real estate',bucket:'cf',
        income:sc(8000),expense:sc(1500),time:0,count:1,newThisMonth:false,monthsOwned:0});
    }
    shuffleDeck();recalc();
    G.blackSwanMonth=6;
    addLog('Game started. '+G.playerName+', '+prof().name+', '+_i.LOC.country+'.');
    G.screen='game';autosave();render();
  },

  /* ── Board navigation ── */
  goGame:function(){G.screen='game';render();},
  toggleLog:function(){G.showFullLog=!G.showFullLog;render();},
  dismissTutorial:function(){G.tutorialDismissed=true;render();},

  /* BUG 16 FIX — passiveFirstFireSeen is now set HERE when the player
     explicitly dismisses the moment, not inside rGame() where any
     intermediate re-render would hide the card before the player sees it. */
  dismissPassiveMoment:function(){
    G.passiveFirstFireSeen=true;
    autosave();render();
  },

  goBorrow:function(){G.screen='borrow';render();},
  goBuy:function(){G.screen='buy';render();},
  goDeals:function(){
    if(freeTime()<1){
      showModal('No free time','Delegate tasks first to free up time for deals.',
        [{label:'OK',cls:'btn-ghost',fn:'PG.closeModal();'}]);
      return;
    }
    G.screen='deals';render();
  },
  setDealFilter:function(f){G.dealFilter=f;render();},

  /* Feature 1 — open HUD breakup screen */
  openHud:function(key){
    G.hudBreakupKey=key;
    G.screen='hud_breakup';
    render();
  },

  /* BUG 4 FIX — when manager is active, income is auto-collected and
     cashTaken=true is set on all items. The identity shift was then
     shown and routed back to the collect screen — which showed everything
     already collected. Fixed: when manager has auto-collected AND passive
     income exists, show identity shift then route directly to game board,
     skipping the redundant collect screen. */
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
      /* BUG 4 FIX — after manager auto-collect, route identity shift
         back to game board not collect screen */
      var hasPassiveReady=G.monthIncomes.some(function(i){return i.isPassive&&i.amount>0;});
      if(hasPassiveReady&&!G.identityShiftShown){G.screen='identity_shift';render();return;}
      G.screen='collect';render();return;
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

  /* ── Income / expense actions ── */
  collectOne:function(idx){
    var item=G.monthIncomes&&G.monthIncomes[idx];
    if(!item||item.done)return;
    var tax=item.isSalary?salaryTax():item.isPassive?passiveTax(item.amount):0;
    G.cash+=(item.amount-tax);
    item.done=true;item.cashTaken=true;
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
    item.done=true;item.cashTaken=true;
    if(item.isCarried){G.carriedExpenses=G.carriedExpenses.filter(function(c){return c.id!==item.originalId;});}
    render();
  },
  skipOne:function(idx){
    var item=G.monthExpenses&&G.monthExpenses[idx];
    if(!item||item.done||item.mandatory)return;
    item.done=true;item.skipped=true;item.skippedMonths=(item.skippedMonths||0)+1;
    addLog('Skipped: '+item.label+' — carries to next month.');render();
  },

  /* ── Feature 2 — Pause / Stop / Resume expense ── */
  pauseExpense:function(type,idx){
    showModal('Pause expense',
      'How many months would you like to pause this?<br><br>'
      +'<div class="brow" style="justify-content:center;margin-top:10px">'
      +'<button class="btn btn-ghost" style="padding:8px 16px" onclick="PG.confirmPause(\''+type+'\','+idx+',1);PG.closeModal();">1 month</button>'
      +'<button class="btn btn-ghost" style="padding:8px 16px" onclick="PG.confirmPause(\''+type+'\','+idx+',3);PG.closeModal();">3 months</button>'
      +'<button class="btn btn-ghost" style="padding:8px 16px" onclick="PG.confirmPause(\''+type+'\','+idx+',6);PG.closeModal();">6 months</button>'
      +'</div><br><span style="font-size:11px;color:var(--text3)">Current month is still owed. Pause starts from next month.</span>',
      [{label:'Cancel',cls:'btn-ghost',fn:'PG.closeModal();'}]);
  },
  confirmPause:function(type,idx,months){
    var target=type==='liab'?G.liabilities[idx]:G.expenses[idx];
    if(!target)return;
    if(G.profile==='dealmaker'&&target.perk){
      addLog('Paused: '+(target.name||target.label)+' for '+months+' months. Deal perk suspended: '+target.perk);
    } else {
      addLog('Paused: '+(target.name||target.label)+' for '+months+' months. Resumes automatically.');
    }
    target.paused=true;
    target.pausedMonthsRemaining=months;
    target.stopped=false;
    render();
  },
  stopExpense:function(type,idx){
    var target=type==='liab'?G.liabilities[idx]:G.expenses[idx];
    if(!target)return;
    var name=target.name||target.label||'expense';
    var warnMsg=G.profile==='dealmaker'&&target.perk
      ?'<span style="color:var(--orange)">⚠ Stopping this will permanently suspend: '+target.perk+'<br>Deal access and reputation perks will be lost until you re-add it.</span><br><br>'
      :'';
    showModal('Stop expense',
      warnMsg+'Stop <strong>'+name+'</strong> from next month?<br><br>'
      +'Current month is still owed. You can re-add it later from the board.',
      [{label:'Stop it',cls:'btn-red',fn:'PG.confirmStop(\''+type+'\','+idx+');PG.closeModal();'},
       {label:'Cancel',cls:'btn-ghost',fn:'PG.closeModal();'}]);
  },
  confirmStop:function(type,idx){
    var target=type==='liab'?G.liabilities[idx]:G.expenses[idx];
    if(!target)return;
    target.stopped=true;
    target.paused=false;
    target.pausedMonthsRemaining=0;
    addLog('Stopped: '+(target.name||target.label)+'. No longer billed from next month.');
    render();
  },
  resumeExpense:function(type,idx){
    var target=type==='liab'?G.liabilities[idx]:G.expenses[idx];
    if(!target)return;
    target.stopped=false;
    target.paused=false;
    target.pausedMonthsRemaining=0;
    addLog('Resumed: '+(target.name||target.label)+'. Billing restarts next month.');
    render();
  },

  /* ── Feature 3 & 4 — Lifestyle inflation choice ── */
  resistLifestyleInflation:function(){
    G.pendingLifestyleInflation=null;
    G.lifestyleTemptationShown=true;
    G.disciplineScore++;
    addLog('Resisted lifestyle inflation. Discipline: '+G.disciplineScore);
    showModal('Discipline held',
      'You chose not to upgrade.<br><br>'
      +'<span style="color:var(--green);font-size:18px;font-weight:600">+1 Discipline</span><br><br>'
      +'<span style="font-size:12px;color:var(--text3)">The lifestyle inflation event can return. It always finds a way.</span>',
      [{label:'Continue',cls:'btn-gold',fn:'PG.closeModal();PG.acceptEventAfterInflation();'}]);
  },
  acceptLifestyleInflation:function(){
    var pending=G.pendingLifestyleInflation;
    if(!pending){return;}
    G.expenses.push({
      id:pending.id,
      label:pending.label,
      amount:pending.amount,
      type:'discretionary',
      locked:false,
      mandatory:false,
      paused:false,
      stopped:false,
      pausedMonthsRemaining:0,
      isLifestyleInflation:true
    });
    G.pendingLifestyleInflation=null;
    G.lifestyleTemptationShown=true;
    addLog('Lifestyle upgrade accepted: '+pending.label+'. +'+fmt(pending.amount)+'/mo. Reversible via expense controls.');
    showModal('Lifestyle upgraded',
      'Expense added: <span style="color:var(--red);font-weight:600">+'+fmt(pending.amount)+'/mo</span><br><br>'
      +'<span style="font-size:12px;color:var(--text3)">You can pause or stop this at any time from the board. Current month is still owed.</span>',
      [{label:'Accept',cls:'btn-ghost',fn:'PG.closeModal();PG.acceptEventAfterInflation();'}]);
  },
  acceptEventAfterInflation:function(){
    G.delegDiscount=false;G.opmDiscount=false;
    G._lastSettleResult=settleMonth();
    autosave();
    if(checkCashShortage()){G.screen='survival';render();return;}
    G.screen='endmonth';render();
  },

  /* ── Temptation (board-level, separate from lifestyle inflation event) ── */
  resistTemptation:function(){
    G.lifestyleTemptationPending=false;G.lifestyleTemptationShown=true;
    G.disciplineScore++;
    addLog('Resisted lifestyle temptation. Discipline: '+G.disciplineScore);
    showModal('Discipline',
      'You chose not to upgrade.<br><br>'
      +'<span style="color:var(--green);font-size:18px;font-weight:600">+1 Discipline</span><br><br>'
      +'<span style="font-size:12px;color:var(--text3)">The wealthy are not wealthy because they earn more. They are wealthy because they resist more.</span>',
      [{label:'Continue',cls:'btn-gold',fn:'PG.closeModal();PG.goGame();'}]);
  },
  indulgeTemptation:function(){
    G.lifestyleTemptationPending=false;G.lifestyleTemptationShown=true;
    var available=TEMPTATION_LIABILITIES.filter(function(t){
      return !G.liabilities.find(function(l){return l.id===t.id;});
    });
    if(available.length){
      var chosen=available[Math.floor(Math.random()*available.length)];
      var scMo=sc(chosen.monthly);
      G.liabilities.push({id:chosen.id,name:chosen.name,cost:0,monthly:scMo,type:'lifestyle',
        desc:'Lifestyle indulgence.',perk:'',exitValue:0,paused:false,stopped:false,pausedMonthsRemaining:0});
      addLog('Lifestyle indulgence: '+chosen.name+'. +'+fmt(scMo)+'/mo permanent expense.');
      showModal('Indulgence',
        'You upgraded.<br><br><span style="color:var(--red);font-size:14px">'+chosen.name+' added — '+fmt(scMo)+'/mo</span><br><br>'
        +'<span style="font-size:12px;color:var(--text3)">You can pause or stop this from the board. Current month still owed.</span>',
        [{label:'Accept',cls:'btn-ghost',fn:'PG.closeModal();PG.goGame();'}]);
    } else {
      G.disciplineScore++;
      showModal('Nothing left to buy',
        'You have already indulged in everything available. Congratulations on your expensive taste.<br><br>'
        +'<span style="color:var(--green)">+1 Discipline by default</span>',
        [{label:'Continue',cls:'btn-gold',fn:'PG.closeModal();PG.goGame();'}]);
    }
  }

}); /* end Object.assign Part A */
