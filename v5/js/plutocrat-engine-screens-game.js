/* PLUTOCRAT v11 — plutocrat-engine-screens-game.js */
/* Layer 2 — Screen renderers: active game board loop */
/* Screens: rGame, rCollect, rPayExp, rBuy, rDeals, rBorrow, rHudBreakup */
/* Load order: after plutocrat-engine-screens-setup.js */
/* Standalone file — reads engine internals via window._PGInternal bridge */

'use strict';

/* ─── Aliases from _PGInternal bridge ─── */
/* Data-layer globals (ASSET_DEFS, BUCKET_INFO, LIABILITIES, DEALS, */
/* DEALMAKER_PASSIVE_DEALS, SALARY_TRAP_QUOTES) are still window-level. */
var G=window._PGInternal.G;
var LOC=window._PGInternal.LOC;
var fmt=function(n){return window._PGInternal.fmt(n);};
var fmtS=function(n){return window._PGInternal.fmtS(n);};
var sc=function(n){return window._PGInternal.sc(n);};
var render=function(){window._PGInternal.render();};
var recalc=function(){window._PGInternal.recalc();};
var freeTime=function(){return window._PGInternal.freeTime();};
var timePct=function(){return window._PGInternal.timePct();};
var timeColor=function(){return window._PGInternal.timeColor();};
var totalExp=function(){return window._PGInternal.totalExp();};
var netPassive=function(){return window._PGInternal.netPassive();};
var checkWin=function(){return window._PGInternal.checkWin();};
var salaryTax=function(){return window._PGInternal.salaryTax();};
var passiveTax=function(n){return window._PGInternal.passiveTax(n);};
var allIncomeDone=function(){return window._PGInternal.allIncomeDone();};
var allMandatoryExpDone=function(){return window._PGInternal.allMandatoryExpDone();};
var canPass=function(){return window._PGInternal.canPass();};
var dealPrereqMet=function(d){return window._PGInternal.dealPrereqMet(d);};
var missingPrereqs=function(d){return window._PGInternal.missingPrereqs(d);};
var buildMonthIncomes=function(){return window._PGInternal.buildMonthIncomes();};
var buildMonthExpenses=function(){return window._PGInternal.buildMonthExpenses();};

/* ─── GAME BOARD ─── */
function rGame(s){
  recalc();
  var ft=freeTime();var exp=totalExp();var win=checkWin();var tpct=timePct();
  var incDone=allIncomeDone();var expDone=allMandatoryExpDone();var cp=canPass();
  var np=netPassive();var overdueCount=G.carriedExpenses.length;
  var taxOwed=salaryTax();

  var h='<div class="ch" style="font-size:11px;letter-spacing:3px;margin-bottom:14px">'
    +G.playerName+'\'s board — Year '+G.year+', Month '+G.month
    +(G.consolidationPhase?' &nbsp;<span style="color:var(--orange);font-size:9px">CONSOLIDATION</span>':'')
    +'</div>';

  /* Calendar */
  h+='<div class="cal"><div class="cal-head">'
    +'<div class="cal-year">Year '+G.year+'</div>'
    +'<div style="font-size:10px;color:var(--text3)">Month '+G.month+' of 12</div>'
    +'</div><div class="cal-months">';
  for(var mi=1;mi<=12;mi++){
    var mc=mi<G.month?'done':mi===G.month?'current':'';
    h+='<div class="cal-m '+mc+'"></div>';
  }
  h+='</div></div>';

  /* HUD row 1 — Feature 1: each hbox is clickable, opens breakup screen */
  h+='<div class="hud hud4">'
    +'<div class="hbox" onclick="PG.openHud(\'cash\')" title="See cash breakdown">'
    +'<div class="hlbl">Cash</div><div class="hval">'+fmt(G.cash)+'</div></div>'
    +'<div class="hbox" onclick="PG.openHud(\'gross_passive\')" title="See gross passive breakdown">'
    +'<div class="hlbl">Gross passive</div><div class="hval '+(G.passiveIncome>0?'g':'')+'">'+fmt(G.passiveIncome)+'</div></div>'
    +'<div class="hbox" onclick="PG.openHud(\'net_passive\')" title="See net passive breakdown">'
    +'<div class="hlbl">Net passive</div><div class="hval '+(np>0?'g':'r')+'">'+fmtS(np)+'</div></div>'
    +'<div class="hbox" onclick="PG.openHud(\'expenses\')" title="See expense breakdown">'
    +'<div class="hlbl">Total expenses</div><div class="hval r">'+fmt(exp)+'</div></div>'
    +'</div>';

  /* HUD row 2 */
  h+='<div class="hud hud4" style="margin-bottom:14px">'
    +'<div class="hbox" onclick="PG.openHud(\'free_time\')" title="See time breakdown">'
    +'<div class="hlbl">Free time</div><div class="hval" style="color:'+timeColor()+'">'+ft+'/24</div></div>'
    +'<div class="hbox" onclick="PG.openHud(\'tax\')" title="See tax info">'
    +'<div class="hlbl">Tax rate</div><div class="hval o">'+G.taxRate+'%</div></div>'
    +'<div class="hbox" onclick="PG.openHud(\'discipline\')" title="See discipline info">'
    +'<div class="hlbl">Discipline</div><div class="hval '+(G.disciplineScore>=5?'g':G.disciplineScore>=2?'':'r')+'">'+G.disciplineScore+'</div></div>'
    +(G.loanAmount>0
      ?'<div class="hbox" onclick="PG.openHud(\'loan\')" title="See loan info">'
       +'<div class="hlbl">Loan balance</div><div class="hval r">'+fmt(G.loanAmount)+'</div></div>'
      :'<div class="hbox" onclick="PG.openHud(\'coverage\')" title="See passive coverage info">'
       +'<div class="hlbl">Passive coverage</div><div class="hval '+(np>=exp?'g':'r')+'">'+Math.round((np/Math.max(1,exp))*100)+'%</div></div>')
    +'</div>';

  /* Time bar */
  h+='<div style="margin-bottom:16px">'
    +'<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3);margin-bottom:5px">'
    +'<span>Time freedom</span><span style="color:'+timeColor()+'">'+tpct+'%</span></div>'
    +'<div style="background:var(--bg3);border-radius:3px;height:5px;overflow:hidden">'
    +'<div style="height:5px;border-radius:3px;width:'+tpct+'%;background:'+timeColor()+';transition:width 0.5s"></div>'
    +'</div></div>';

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
  if(win&&win.tier<=3&&!G.consolidationPhase)
    h+='<div class="notice ngold">WIN CONDITION MET — '+win.title
      +' &nbsp;<button class="btn btn-gold" onclick="PG.triggerWin()" style="padding:5px 14px;font-size:10px;margin-left:8px">Claim</button></div>';
  if(win&&win.tier===4)
    h+='<div class="notice ngold">LEGACY WIN — '+win.title
      +' &nbsp;<button class="btn btn-gold" onclick="PG.claimWin()" style="padding:5px 14px;font-size:10px;margin-left:8px">Claim</button></div>';

  /* Dramatic passive cover moment — fires once */
  /* BUG 16 FIX — G.passiveFirstFireSeen is no longer set here. It is set
     only when the player explicitly dismisses the moment via
     PG.dismissPassiveMoment() in actions.js. Setting it inside a render
     function caused any intermediate re-render to hide the card permanently
     before the player had a chance to see it. */
  if(np>0&&np>=exp&&!G.passiveFirstFireSeen&&!G.consolidationPhase){
    h+='<div class="passive-cover-moment" id="pcm">'
      +'<div class="pcm-inner">'
      +'<div class="pcm-pre">The moment you have been building toward</div>'
      +'<div class="pcm-headline">Your assets now cover<br>every expense you have.</div>'
      +'<div class="pcm-numbers">'
      +'<div class="pcm-num"><div class="pcm-num-label">Passive income</div><div class="pcm-num-val g">'+fmt(np)+'/mo</div></div>'
      +'<div class="pcm-num"><div class="pcm-num-label">Total expenses</div><div class="pcm-num-val r">'+fmt(exp)+'/mo</div></div>'
      +'<div class="pcm-num"><div class="pcm-num-label">Coverage</div><div class="pcm-num-val" style="color:var(--gold)">'+Math.round((np/Math.max(1,exp))*100)+'%</div></div>'
      +'</div>'
      +'<div class="pcm-body">'
      +'You did not ask for permission.<br>'
      +'You did not wait for the right moment.<br>'
      +'You built, month by month, until the machines outearned the man.<br><br>'
      +'<em>This is what financial freedom looks like from the inside.</em>'
      +'</div>'
      +'<button class="btn btn-gold" onclick="PG.dismissPassiveMoment()" style="font-size:13px;padding:14px 40px;letter-spacing:2px;margin-top:8px">I understand what I have built</button>'
      +'</div></div>';
  } else if(np>0&&np>=exp&&!win&&!G.consolidationPhase){
    h+='<div class="notice ngreen">'+G.playerName+', passive income covers all expenses. You could stop working today.</div>';
  }

  if(G.consolidationPhase&&G.consecutivePassiveCoverageMonths>0)
    h+='<div class="notice ngold">Consolidation: '+G.consecutivePassiveCoverageMonths+'/3 months of 3x passive coverage achieved.</div>';
  if(ft===0)h+='<div class="notice nred">0 free time. Fully trapped. Delegate immediately.</div>';
  if(ft>0&&ft<=8)h+='<div class="notice nred">Only '+ft+' free time units. Deal-making is restricted. Delegate to free up time.</div>';
  if(overdueCount>0)h+='<div class="notice norange">'+overdueCount+' overdue expense'+(overdueCount>1?'s':'')+' carried. Pay before they compound further.</div>';
  if(G.blackSwanExpenseSpike>0)h+='<div class="notice nred">Black swan effect active — all expenses elevated this month.</div>';
  if(G.consolidationPhase)h+='<div class="notice norange">Inflation factor: '+G.inflationFactor.toFixed(2)+'x — your cost of living grows every year. Keep passive income growing faster.</div>';

  /* First time tutorial */
  if(G.month===1&&G.year===1&&!G.tutorialDismissed){
    h+='<div style="background:rgba(201,168,76,0.08);border:1px solid var(--border-gold);border-radius:8px;padding:16px;margin-bottom:14px">'
      +'<div style="font-size:10px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">First time? Here is how to play</div>'
      +'<div style="font-size:12px;color:var(--text2);line-height:2">'
      +'① <strong>Collect income</strong> — collect your salary and any passive income<br>'
      +'② <strong>Pay expenses</strong> — pay mandatory expenses. Skip optional ones if needed<br>'
      +'③ <strong>Buy assets</strong> — invest cash into assets that pay you every month<br>'
      +'④ <strong>Pass the month</strong> — move to the next month and face an event<br><br>'
      +'<span style="color:var(--text3)">Goal: build enough passive income to cover all your expenses. Then you are free.</span>'
      +'</div>'
      +'<button class="btn btn-ghost" style="margin-top:12px;font-size:11px;padding:7px 18px" onclick="PG.dismissTutorial()">Got it — dismiss</button>'
      +'</div>';
  }

  /* Lifestyle temptation */
  if(G.lifestyleTemptationPending){
    h+='<div class="temptation-card">'
      +'<div class="temptation-title">The temptation is real.</div>'
      +'<div class="temptation-body">You have '+fmt(G.cash)+' in cash — more than 3x your monthly expenses.<br>'
      +'Your friends are upgrading. The lifestyle is calling. Everyone will notice.<br><br>'
      +'This is the moment that separates the wealthy from the formerly wealthy.</div>'
      +'<div class="brow" style="justify-content:center">'
      +'<button class="btn btn-green" onclick="PG.resistTemptation()" style="padding:10px 28px">Resist (+1 discipline)</button>'
      +'<button class="btn btn-red" onclick="PG.indulgeTemptation()" style="padding:10px 28px">Indulge (add liability)</button>'
      +'</div></div>';
  }

  /* Monthly checklist */
  h+='<div class="sec"><span>Monthly checklist</span></div>'
    +'<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:16px">'
    +'<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:12px">'
    +'<span style="color:var(--text2)">Income collected</span>'
    +'<span style="color:'+(incDone?'var(--green)':'var(--red)')+'">'+(incDone?'Done ✓':'Pending')+'</span></div>'
    +'<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:12px">'
    +'<span style="color:var(--text2)">Mandatory expenses paid</span>'
    +'<span style="color:'+(expDone?'var(--green)':'var(--red)')+'">'+(expDone?'Done ✓':'Pending')+'</span></div>'
    +'<div style="display:flex;justify-content:space-between;padding:7px 0;font-size:12px">'
    +'<span style="color:var(--text2)">Salary tax this month</span>'
    +'<span style="color:var(--orange)">'+fmt(taxOwed)+' ('+G.taxRate+'%)</span></div>'
    +'</div>';

  /* Assets list */
  if(G.assets.length>0){
    h+='<div class="sec"><span>Assets ('+G.assets.length+')</span></div><div class="alist">';
    G.assets.forEach(function(a,i){
      var netInc=(a.income||0)-(a.expense||0);
      var binfo=BUCKET_INFO[a.bucket||'cf'];
      h+='<div class="arow'+(a.newThisMonth?' new':'')+(a.mortgage?' mortgaged':'')+'"><div style="flex:1">'
        +'<div class="aname">'+a.name+(a.count>1?' x'+a.count:'')+(a.mortgage?'<span class="mortgage-badge">MORTGAGED</span>':'')+'</div>'
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
        +'<div class="atime '+(a.time===0?'f':'c')+'">'+(a.time===0?'0 time':'−'+a.time+' units')+'</div>'
        +(a.newThisMonth?'':'<span class="asell" onclick="PG.sellAsset('+i+')">Sell</span>')
        +((!a.newThisMonth&&a.type==='real estate'&&!a.mortgage)
          ?'<span class="amortgage" onclick="PG.mortgageAsset('+i+')">Mortgage</span>':'')
        +((!a.newThisMonth&&a.mortgage)
          ?'<span class="arepay" onclick="PG.repayMortgage('+i+')">Repay ('+fmt(a.mortgage.balance)+')</span>':'')
        +'</div></div>';
    });
    h+='</div>';
  } else {
    h+='<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:18px;text-align:center;margin-bottom:16px;font-size:12px;color:var(--text3);font-style:italic;line-height:1.9">'
      +G.playerName+', you own nothing that works while you sleep.</div>';
  }

  /* Liabilities list */
  if(G.liabilities.length>0){
    h+='<div class="sec"><span>Liabilities</span></div><div class="alist">';
    G.liabilities.forEach(function(l,li){
      var pausedInfo=l.paused?'<span class="exp-paused-badge">PAUSED '+l.pausedMonthsRemaining+'mo</span>':'';
      var stoppedInfo=l.stopped?'<span class="exp-stopped-badge">STOPPED</span>':'';
      h+='<div class="arow"><div style="flex:1">'
        +'<div class="aname">'+l.name+' '+pausedInfo+stoppedInfo+'</div>'
        +'<div class="atype">'+l.type+(l.perk?' · '+l.perk:'')+'</div>'
        /* Feature 5 — Dealmaker gets strategic warning on drop */
        +(G.profile==='dealmaker'&&l.perk?'<div class="exp-dealmaker-warning">Dropping this removes: '+l.perk+'</div>':'')
        +'</div>'
        +'<div class="aright">'
        +(l.stopped?'<div class="ainc" style="color:var(--text3)">Stopped</div>':l.paused?'<div class="ainc" style="color:var(--orange)">Paused</div>':'<div class="ainc" style="color:var(--red)">−'+fmt(l.monthly)+'/mo</div>')
        +'<span class="adrop" onclick="PG.dropHabit('+li+')">Drop habit</span>'
        /* Feature 2 — pause / stop controls for liabilities */
        +(l.stopped?'<span class="adrop" onclick="PG.resumeExpense(\'liab\','+li+')" style="color:var(--green)">Re-add</span>'
          :l.paused?'<span class="adrop" onclick="PG.resumeExpense(\'liab\','+li+')" style="color:var(--green)">Resume</span>'
          :'<span class="adrop" onclick="PG.pauseExpense(\'liab\','+li+')">Pause</span>'
           +'<span class="adrop" onclick="PG.stopExpense(\'liab\','+li+')" style="color:var(--red)">Stop</span>')
        +'</div></div>';
    });
    h+='</div>';
  }

  /* Activity log — BUG 1 FIX: toggle log-expanded class instead of height cap */
  if(G.log.length){
    var showAll=G.showFullLog;
    /* FIX 3 — .sec uses flexbox, so the toggle span sits opposite the label naturally */
    h+='<div class="sec">'
      +'<span>Activity log</span>'
      +(G.log.length>5?'<span style="font-size:10px;color:var(--text3);cursor:pointer;font-weight:400" onclick="PG.toggleLog()">'+(showAll?'Show less ▲':'Show all ('+G.log.length+') ▼')+'</span>':'')
      +'</div>'
      +'<div class="log'+(showAll?' log-expanded':'')+'">';
    (showAll?G.log:G.log.slice(0,5)).forEach(function(l){h+='<div class="logline">'+l+'</div>';});
    h+='</div>';
  }

  /* Actions */
  var dealLocked=ft<1;
  var buyWarning=ft<=4&&ft>0;
  h+='<div class="sec"><span>Actions</span></div><div class="brow">'
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

/* ─── COLLECT INCOME ─── */
function rCollect(s){
  if(!G.monthIncomes)G.monthIncomes=buildMonthIncomes();
  var items=G.monthIncomes;
  var done=items.filter(function(i){return i.done;}).length;
  var total=items.reduce(function(sum,i){return i.done&&i.amount>0?sum+i.amount:sum;},0);
  /* BUG 22 FIX — monthsPlayed increments in settleMonth(), after this screen.
     Use +1 so the quote index advances correctly from month 1. */
  var trapQuote=SALARY_TRAP_QUOTES[(G.monthsPlayed+1)%SALARY_TRAP_QUOTES.length];

  var h='<div class="ch" style="font-size:18px;margin-bottom:6px">Collect income</div>'
    +'<div style="font-size:12px;color:var(--text3);margin-bottom:14px">Year '+G.year+', Month '+G.month+' — each source collected exactly once this month</div>';

  if(G.hasManager)h+='<div class="notice ngreen">Your Manager / PA collected all income. Full report below.</div>';
  else h+='<div class="notice ngold">Each income source received exactly once per month.</div>';

  h+='<div style="font-size:11px;color:var(--text3);margin-bottom:16px">'+done+' of '+items.length+' handled &nbsp;·&nbsp; Total: <span style="color:var(--green)">'+fmt(total)+'</span></div>';

  items.forEach(function(item,idx){
    var taxLine='';
    if(item.isSalary&&!item.done){
      var t=salaryTax();
      taxLine='<div style="font-size:10px;color:var(--orange);margin-top:3px">Tax deducted: '+fmt(t)+' ('+G.taxRate+'%)</div>';
    }
    if(item.isPassive&&!item.done){
      var pt=passiveTax(item.amount);
      taxLine='<div style="font-size:10px;color:var(--orange);margin-top:3px">Passive tax: '+fmt(pt)+' ('+Math.round(G.taxRate/2)+'%)</div>';
    }
    h+='<div class="item-row'+(item.done?' done':'')+'"><div class="item-label">'
      +'<div class="item-name">'+item.label+'</div>'
      +'<div class="item-sub">'+item.type+'</div>'
      +taxLine
      +'</div>'
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

/* ─── PAY EXPENSES ─── */
function rPayExp(s){
  if(!G.monthExpenses)G.monthExpenses=buildMonthExpenses();
  var items=G.monthExpenses;
  var done=items.filter(function(i){return i.done;}).length;
  var total=items.reduce(function(sum,i){return i.done?sum+i.amount:sum;},0);
  var overdueItems=items.filter(function(i){return i.isCarried;});

  var h='<div class="ch" style="font-size:18px;margin-bottom:6px">Pay expenses</div>'
    +'<div style="font-size:12px;color:var(--text3);margin-bottom:14px">Year '+G.year+', Month '+G.month+' — mandatory expenses cannot be skipped</div>';

  if(G.hasManager)h+='<div class="notice ngreen">Your Manager / PA handled all payments in priority order.</div>';
  else h+='<div class="notice ngold">Mandatory expenses cannot be skipped. Non-mandatory ones carry over — with interest.</div>';
  if(overdueItems.length>0)h+='<div class="notice norange">'+overdueItems.length+' overdue — skipping again adds a 10% late fee next month.</div>';

  h+='<div style="font-size:11px;color:var(--text3);margin-bottom:16px">'+done+' of '+items.length+' handled &nbsp;·&nbsp; Total paid: <span style="color:var(--red)">'+fmt(total)+'</span></div>';

  items.forEach(function(item,idx){
    var isOverdue=item.isCarried;
    /* Feature 2 — get the original liability or expense for pause/stop controls */
    var isLiab=item.id&&item.id.indexOf('liab_')===0;
    var liabIdx=item.liabIdx!==undefined?item.liabIdx:-1;

    h+='<div class="item-row'+(item.done?' done':'')+(item.mandatory?' mandatory':isOverdue?' overdue':'')+'"><div class="item-label">'
      +'<div class="item-name">'+item.label
      +(item.mandatory?'<span style="font-size:9px;color:var(--red);letter-spacing:1px;text-transform:uppercase;margin-left:6px">mandatory</span>':'')
      +(isOverdue?'<span style="font-size:9px;color:var(--orange);letter-spacing:1px;text-transform:uppercase;margin-left:6px">overdue</span>':'')
      +'</div>'
      +'<div class="item-sub">'+item.type+'</div>'
      /* Feature 2 — show pause/stop controls on non-mandatory, non-overdue, non-done items */
      +(!item.mandatory&&!isOverdue&&!item.done&&isLiab&&liabIdx>=0
        ?'<div class="exp-control-row">'
         +'<span style="font-size:10px;color:var(--text3);cursor:pointer;text-decoration:underline" onclick="PG.pauseExpense(\'liab\','+liabIdx+')">Pause next month</span>'
         +'<span style="font-size:10px;color:var(--red);cursor:pointer;text-decoration:underline;margin-left:8px" onclick="PG.stopExpense(\'liab\','+liabIdx+')">Stop from next month</span>'
         +'</div>':'')
      +'</div>'
      +'<div class="item-amt exp">−'+fmt(item.amount)+'</div>';
    if(item.done)h+='<span style="font-size:11px;color:var(--text3)">Paid ✓</span>';
    else if(item.mandatory)h+='<button class="btn btn-red" style="padding:8px 16px;font-size:11px" onclick="PG.payOne('+idx+')">Pay</button>';
    else h+='<div style="display:flex;gap:6px">'
      +'<button class="btn btn-red" style="padding:8px 14px;font-size:11px" onclick="PG.payOne('+idx+')">Pay</button>'
      +'<button class="btn btn-ghost" style="padding:8px 14px;font-size:11px" onclick="PG.skipOne('+idx+')">Skip</button>'
      +'</div>';
    h+='</div>';
  });
  h+='<div class="brow"><button class="btn btn-ghost" onclick="PG.goGame()">Back to board</button></div>';
  s.innerHTML=h;
}

/* ─── BUY ASSETS / LIABILITIES ─── */
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
      if(isMgr&&G.hasManager){
        h+='<div class="scard sdim"><div class="sname">'+item.name+' ✓</div>'
          +'<div class="scost">Already hired</div>'
          +'<div class="sdesc">Manager salary: '+fmt(G.managerMonthlySalary)+'/mo</div></div>';
        return;
      }
      if(!item.repeatable&&owned){
        h+='<div class="scard sdim"><div class="sname">'+item.name+' ✓</div>'
          +'<div class="scost">Owned</div><div class="sdesc">'+item.desc+'</div></div>';
        return;
      }
      var cost=item.cost;
      if(G.delegDiscount&&item.type==='delegation')cost=Math.floor(cost*0.5);
      if(G.opmDiscount&&item.type!=='delegation')cost=Math.floor(cost*0.75);
      var displayCost=isMgr?sc(5000):sc(cost);
      var mgrSalary=isMgr?sc(12000):0;
      var sopMaint=item.id==='build_sop'?sc(2000):0;
      var sc_inc=sc(item.income);var sc_exp=sc(item.expense);var sc_net=sc_inc-sc_exp;
      var canAfford=G.cash>=displayCost;
      h+='<div class="scard'+(canAfford?'':' sdim')+'" onclick="'+(canAfford?'PG.buyAsset(\''+item.id+'\','+displayCost+','+item.time+','+sc_inc+','+sc_exp+',\''+item.type+'\',\''+item.name.replace(/'/g,"\\'")+'\','+item.repeatable+',\''+item.bucket+'\')':'')+'">'
        +'<div class="sname">'+item.name
        +(item.type==='delegation'?'<span class="stag tag-del">delegate</span>':'')
        +(item.repeatable?'<span class="stag tag-stack">stackable</span>':'')
        +(owned&&item.repeatable?' x'+(owned.count||1):'')+'</div>'
        +(isMgr
          ?'<div class="scost">Recruitment fee: '+fmt(displayCost)+'</div><div class="sexp">Salary: '+fmt(mgrSalary)+'/mo (mandatory)</div>'
          :item.id==='build_sop'
            ?'<div class="scost">Cost: '+fmt(displayCost)+'</div><div class="sexp">Monthly maintenance: '+fmt(sopMaint)+'/mo</div>'
            :'<div class="scost">Cost: '+fmt(displayCost)+(canAfford?'':' — need '+fmt(displayCost-G.cash)+' more')+'</div>')
        +(sc_inc>0?'<div class="sinc">+'+fmt(sc_inc)+'/mo income</div>':'')
        +(sc_exp>0&&!isMgr?'<div class="sexp">−'+fmt(sc_exp)+'/mo costs</div>':'')
        +(sc_inc>0?'<div class="snet" style="color:'+(sc_net>0?'var(--green)':'var(--red)')+'">'+fmtS(sc_net)+' net/mo</div>':'')
        +'<div class="stime '+(item.time<0?'f':item.time===0?'f':'c')+'">Time: '+(item.time===0?'0 units':item.time<0?'frees '+Math.abs(item.time)+' units':'+'+item.time+' units')+'</div>'
        +'<div class="sdesc">'+item.desc+'</div></div>';
    });
    h+='</div>';
  });

  /* Dealmaker passive income deals */
  if(G.profile==='dealmaker'&&typeof DEALMAKER_PASSIVE_DEALS!=='undefined'){
    var dmAvailable=DEALMAKER_PASSIVE_DEALS.filter(function(d){return d.condition(G);});
    if(dmAvailable.length>0){
      h+='<div class="sec" style="margin-top:18px"><span class="bucket-label bucket-cf">Dealmaker</span> &nbsp;Convert your reputation into recurring passive income</div>';
      h+='<div class="sgrid">';
      dmAvailable.forEach(function(item){
        var owned=G.assets.find(function(a){return a.id===item.id&&!a.newThisMonth;});
        var sc_inc=sc(item.income);var sc_exp=sc(item.expense);var sc_net=sc_inc-sc_exp;
        var repOk=G.reputation>=item.repReq;
        var timeOk=freeTime()>=item.time;
        var canBuy=repOk&&timeOk;
        h+='<div class="scard'+(canBuy?'':' sdim')+'" onclick="'+(canBuy?'PG.buyAsset(\''+item.id+'\',0,'+item.time+','+sc_inc+','+sc_exp+',\''+item.type+'\',\''+item.name.replace(/'/g,"\\'")+'\','+item.repeatable+',\''+item.bucket+'\')':'')+'">'
          +'<div class="sname">'+item.name+'<span class="stag tag-cf">passive</span>'+(owned&&item.repeatable?' x'+(owned.count||1):'')+'</div>'
          +'<div class="scost">No upfront cost — reputation currency</div>'
          +'<div style="font-size:10px;color:var(--purple);margin-bottom:4px">Requires: Rep '+item.repReq+' · '+item.time+' time units</div>'
          +'<div class="sinc">+'+fmt(sc_inc)+'/mo income</div>'
          +'<div class="sexp">−'+fmt(sc_exp)+'/mo costs</div>'
          +'<div class="snet" style="color:'+(sc_net>0?'var(--green)':'var(--red)')+'">'+fmtS(sc_net)+' net/mo</div>'
          +'<div class="sdesc">'+item.desc+'</div></div>';
      });
      h+='</div>';
    }
  }

  /* Liabilities shop */
  h+='<div class="sec" style="margin-top:18px"><span>Liabilities — things that cost you every month</span></div><div class="sgrid">';
  LIABILITIES.forEach(function(item){
    var owned=G.liabilities.find(function(l){return l.id===item.id;});
    var sc_cost=sc(item.cost);var sc_mo=sc(item.monthly);
    var canAfford=sc_cost===0||G.cash>=sc_cost;
    /* Feature 5 — Dealmaker: liabilities are investments, not burdens */
    var isDealmaker=G.profile==='dealmaker';
    h+='<div class="scard'+(owned?' sdim':!canAfford?' sdim':'')+'" onclick="'+(owned||!canAfford?'':'PG.buyLiability(\''+item.id+'\','+sc_cost+','+sc_mo+')')+'">'
      +'<div class="sname">'+item.name+'<span class="stag tag-liab">liability</span>'+(item.type==='status'?'<span class="stag tag-status">status</span>':'')+(owned?' ✓':'')+'</div>'
      +(sc_cost>0?'<div class="scost">Purchase: '+fmt(sc_cost)+'</div>':'<div class="scost">No upfront cost</div>')
      +(isDealmaker&&item.perk
        ?'<div class="sinc" style="color:var(--purple)">Strategic: '+item.perk+'</div>'
        :'<div class="sinc" style="color:var(--red)">−'+fmt(sc_mo)+'/mo ongoing</div>')
      +(item.perk?'<div style="font-size:10px;color:var(--purple);margin-bottom:5px">'+item.perk+'</div>':'')
      +'<div class="sdesc">'+item.desc+'</div></div>';
  });
  h+='</div>';

  /* Change housing */
  h+='<div class="sec" style="margin-top:18px"><span>Change housing</span></div><div class="choice-grid">';
  LOC.housing.forEach(function(hh){
    h+='<div class="choice-card'+(G.housing&&G.housing.id===hh.id?' active':'')+'" onclick="PG.changeHousing(\''+hh.id+'\')">'
      +'<div class="choice-name">'+hh.name+(G.housing&&G.housing.id===hh.id?' (current)':'')+'</div>'
      +'<div class="choice-cost">'+fmt(hh.cost)+'/mo</div>'
      +'<div class="choice-desc">'+hh.desc+'</div>'
      +(hh.perk?'<div class="choice-perk">'+hh.perk+'</div>':'')
      +'</div>';
  });
  h+='</div>';

  /* Change groceries */
  h+='<div class="sec"><span>Change groceries</span></div><div class="choice-grid">';
  LOC.groceries.forEach(function(gr){
    h+='<div class="choice-card'+(G.grocery&&G.grocery.id===gr.id?' active':'')+'" onclick="PG.changeGrocery(\''+gr.id+'\')">'
      +'<div class="choice-name">'+gr.name+(G.grocery&&G.grocery.id===gr.id?' (current)':'')+'</div>'
      +'<div class="choice-cost">'+fmt(gr.cost)+'/mo</div>'
      +'<div class="choice-desc">'+gr.desc+'</div>'
      +'</div>';
  });
  h+='</div>';
  h+='<div class="brow"><button class="btn btn-ghost" onclick="PG.goGame()">Back to board</button></div>';
  s.innerHTML=h;
}

/* ─── DEALS ─── */
function rDeals(s){
  var ft=freeTime();
  var filter=G.dealFilter||'all';
  var cats={};
  DEALS.forEach(function(d){if(!cats[d.cat])cats[d.cat]=[];cats[d.cat].push(d);});
  var allCats=Object.keys(cats);
  var availCount=DEALS.filter(function(d){
    return G.reputation>=d.repReq&&ft>=d.time&&dealPrereqMet(d);
  }).length;

  var h='<div class="ch" style="font-size:18px;margin-bottom:6px">Make a deal</div>'
    +'<div style="font-size:12px;color:var(--text3);margin-bottom:14px">You make money connecting value — not owning it. Reputation is everything.</div>'
    +'<div class="hud hud3" style="margin-bottom:14px">'
    +'<div class="hbox"><div class="hlbl">Cash</div><div class="hval">'+fmt(G.cash)+'</div></div>'
    +'<div class="hbox"><div class="hlbl">Reputation</div><div class="hval p">'+G.reputation+'/10</div></div>'
    +'<div class="hbox"><div class="hlbl">Free time</div><div class="hval" style="color:'+timeColor()+'">'+ft+'/24</div></div>'
    +'</div>'
    +'<div class="notice npurple">Failed deals cost reputation only — not money. Build reputation by closing small deals first.</div>';

  /* Filter bar */
  h+='<div class="deal-filter-bar">'
    +'<span style="font-size:10px;color:var(--text3);letter-spacing:2px;text-transform:uppercase;margin-right:4px">Filter:</span>'
    +'<button class="btn '+(filter==='all'?'btn-purple':'btn-ghost')+'" style="padding:6px 14px;font-size:10px" onclick="PG.setDealFilter(\'all\')">All ('+DEALS.length+')</button>'
    +'<button class="btn '+(filter==='available'?'btn-green':'btn-ghost')+'" style="padding:6px 14px;font-size:10px" onclick="PG.setDealFilter(\'available\')">Available now ('+availCount+')</button>'
    +allCats.map(function(cat){
      return '<button class="btn '+(filter===cat?'btn-gold':'btn-ghost')+'" style="padding:6px 14px;font-size:10px" onclick="PG.setDealFilter(\''+cat+'\')">'+cat+' ('+cats[cat].length+')</button>';
    }).join('')
    +'</div>';

  var catsToShow=filter==='all'||filter==='available'?allCats:[filter];
  var anyShown=false;

  catsToShow.forEach(function(cat){
    var deals=cats[cat]||[];
    if(filter==='available'){
      deals=deals.filter(function(d){return G.reputation>=d.repReq&&ft>=d.time&&dealPrereqMet(d);});
    }
    if(!deals.length)return;
    anyShown=true;
    h+='<div class="sec"><span>'+cat+'</span></div>';
    deals.forEach(function(deal){
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
        +(prereqLocked&&missing.length?'<div class="deal-prereq-missing">Complete first: <span>'+missing.join(', ')+'</span></div>':'')
        +'</div>';
    });
  });

  if(!anyShown){
    h+='<div style="text-align:center;padding:32px 20px;color:var(--text3);font-size:12px;font-style:italic">'
      +'No deals match this filter right now.<br>'
      +(filter==='available'?'Build reputation or free up time to unlock more deals.':'')
      +'</div>';
  }
  h+='<div class="brow"><button class="btn btn-ghost" onclick="PG.goGame()">Back to board</button></div>';
  s.innerHTML=h;
}

/* ─── BORROW CAPITAL ─── */
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
    h+='<div class="notice ngold">8% annual interest — mandatory from next month. Use borrowed capital to buy assets, not liabilities.</div>'
      +'<div class="sec"><span>Choose loan size</span></div>'
      +'<div class="sgrid">'
      +'<div class="scard" onclick="PG.takeLoan('+loan1+','+int1+')">'
        +'<div class="sname">Conservative — 1x passive</div>'
        +'<div class="scost">Borrow: '+fmt(loan1)+'</div>'
        +'<div class="sexp">Monthly interest: '+fmt(int1)+' (starts next month)</div>'
        +'<div class="sdesc">Borrow equal to one month\'s passive income. Low risk. Good for one asset purchase.</div>'
        +'</div>'
      +'<div class="scard" onclick="PG.takeLoan('+loan2+','+int2+')">'
        +'<div class="sname">Moderate — 2x passive</div>'
        +'<div class="scost">Borrow: '+fmt(loan2)+'</div>'
        +'<div class="sexp">Monthly interest: '+fmt(int2)+' (starts next month)</div>'
        +'<div class="sdesc">Borrow twice your monthly passive. Meaningful leverage. Requires asset discipline.</div>'
        +'</div>'
      +'<div class="scard" onclick="PG.takeLoan('+loan3+','+int3+')">'
        +'<div class="sname">Aggressive — 3x passive</div>'
        +'<div class="scost">Borrow: '+fmt(loan3)+'</div>'
        +'<div class="sexp">Monthly interest: '+fmt(int3)+' (starts next month)</div>'
        +'<div class="sdesc">Maximum leverage. Deploy immediately into cashflow assets or the interest destroys you.</div>'
        +'</div>'
      +'</div>';
  }
  h+='<div class="brow"><button class="btn btn-ghost" onclick="PG.goGame()">Back to board</button></div>';
  s.innerHTML=h;
}

/* ─── HUD BREAKUP — Feature 1 ─── */
/* Opened by clicking any HUD box. Shows full breakdown + inline actions. */
function rHudBreakup(s){
  var key=G.hudBreakupKey||'cash';
  var h='<div class="ch" style="font-size:11px;letter-spacing:3px;margin-bottom:18px">HUD Breakup — Y'+G.year+' M'+G.month+'</div>';

  if(key==='cash'){
    h+='<div class="hud-breakup">'
      +'<div class="hud-breakup-title">Cash</div>'
      +'<div class="hud-breakup-total">'+fmt(G.cash)+'</div>'
      +'<div class="hud-breakup-info">Your liquid cash balance. Includes all income collected minus all expenses paid this month. Does not include asset market values.</div>'
      +'</div>';
    /* Show collect-able incomes directly */
    if(G.monthIncomes){
      h+='<div class="sec"><span>Pending income this month</span></div>';
      G.monthIncomes.forEach(function(item,idx){
        if(item.done)return;
        h+='<div class="item-row"><div class="item-label">'
          +'<div class="item-name">'+item.label+'</div>'
          +'<div class="item-sub">'+item.type+'</div></div>'
          +'<div class="item-amt inc">+'+fmt(item.amount)+'</div>'
          +'<button class="btn btn-green" style="padding:8px 14px;font-size:11px" onclick="PG.collectOne('+idx+');PG.openHud(\'cash\')">Collect</button>'
          +'</div>';
      });
    }
  } else if(key==='gross_passive'){
    h+='<div class="hud-breakup">'
      +'<div class="hud-breakup-title">Gross Passive Income</div>'
      +'<div class="hud-breakup-total">'+fmt(G.passiveIncome)+'/mo</div>'
      +'<div class="hud-breakup-list">';
    G.assets.filter(function(a){return !a.newThisMonth&&a.income>0;}).forEach(function(a){
      h+='<div class="hud-breakup-row">'
        +'<div><div class="hud-breakup-label">'+a.name+(a.count>1?' x'+a.count:'')+'</div>'
        +'<div class="hud-breakup-sub">'+a.type+'</div></div>'
        +'<div class="hud-breakup-val" style="color:var(--green)">+'+fmt(a.income)+'/mo</div>'
        +'</div>';
    });
    if(G.assets.filter(function(a){return !a.newThisMonth&&a.income>0;}).length===0)
      h+='<div class="hud-breakup-info">No active passive income yet. Buy assets from the Buy screen.</div>';
    h+='</div></div>';
  } else if(key==='net_passive'){
    var np=netPassive();
    h+='<div class="hud-breakup">'
      +'<div class="hud-breakup-title">Net Passive Income</div>'
      +'<div class="hud-breakup-total" style="color:'+(np>0?'var(--green)':'var(--red)')+'">'+fmtS(np)+'/mo</div>'
      +'<div class="hud-breakup-list">'
      +'<div class="hud-breakup-row"><div class="hud-breakup-label">Gross passive</div><div class="hud-breakup-val" style="color:var(--green)">+'+fmt(G.passiveIncome)+'</div></div>'
      +'<div class="hud-breakup-row"><div class="hud-breakup-label">Asset expenses</div><div class="hud-breakup-val" style="color:var(--red)">−'+fmt(G.passiveExpense)+'</div></div>'
      +'</div>'
      +'<div class="hud-breakup-info">Net passive = gross passive income minus all asset maintenance and running costs. Goal: make this exceed your total expenses.</div>'
      +'</div>';
  } else if(key==='expenses'){
    var exp=totalExp();
    h+='<div class="hud-breakup">'
      +'<div class="hud-breakup-title">Total Monthly Expenses</div>'
      +'<div class="hud-breakup-total" style="color:var(--red)">'+fmt(exp)+'/mo</div>'
      +'<div class="hud-breakup-list">';
    if(G.housing)h+='<div class="hud-breakup-row"><div class="hud-breakup-label">'+G.housing.name+'</div><div class="hud-breakup-val" style="color:var(--red)">−'+fmt(G.housing.cost)+'</div></div>';
    if(G.grocery)h+='<div class="hud-breakup-row"><div class="hud-breakup-label">'+G.grocery.name+'</div><div class="hud-breakup-val" style="color:var(--red)">−'+fmt(G.grocery.cost)+'</div></div>';
    if(G.loanMonthlyPayment>0)h+='<div class="hud-breakup-row"><div class="hud-breakup-label">Loan interest</div><div class="hud-breakup-val" style="color:var(--red)">−'+fmt(G.loanMonthlyPayment)+'</div></div>';
    if(G.hasManager)h+='<div class="hud-breakup-row"><div class="hud-breakup-label">Manager salary</div><div class="hud-breakup-val" style="color:var(--red)">−'+fmt(G.managerMonthlySalary)+'</div></div>';
    G.assets.forEach(function(a){if(!a.newThisMonth&&a.expense>0)h+='<div class="hud-breakup-row"><div class="hud-breakup-label">'+a.name+' maintenance</div><div class="hud-breakup-val" style="color:var(--red)">−'+fmt(a.expense)+'</div></div>';});
    G.liabilities.forEach(function(l){if(!l.paused&&!l.stopped)h+='<div class="hud-breakup-row"><div class="hud-breakup-label">'+l.name+'</div><div class="hud-breakup-val" style="color:var(--red)">−'+fmt(l.monthly)+'</div></div>';});
    h+='</div></div>';
    /* Show payable expenses with inline pay action */
    if(G.monthExpenses){
      h+='<div class="sec"><span>Pay expenses directly</span></div>';
      G.monthExpenses.forEach(function(item,idx){
        if(item.done)return;
        h+='<div class="item-row'+(item.mandatory?' mandatory':'')+'"><div class="item-label">'
          +'<div class="item-name">'+item.label+'</div>'
          +'<div class="item-sub">'+item.type+'</div></div>'
          +'<div class="item-amt exp">−'+fmt(item.amount)+'</div>'
          +(item.mandatory
            ?'<button class="btn btn-red" style="padding:8px 14px;font-size:11px" onclick="PG.payOne('+idx+');PG.openHud(\'expenses\')">Pay</button>'
            :'<button class="btn btn-ghost" style="padding:8px 14px;font-size:11px" onclick="PG.payOne('+idx+');PG.openHud(\'expenses\')">Pay</button>')
          +'</div>';
      });
    }
  } else if(key==='free_time'){
    h+='<div class="hud-breakup">'
      +'<div class="hud-breakup-title">Free Time</div>'
      +'<div class="hud-breakup-total" style="color:'+timeColor()+'">'+freeTime()+' / 24 units</div>'
      +'<div class="hud-breakup-list">'
      +'<div class="hud-breakup-row"><div class="hud-breakup-label">Total time units</div><div class="hud-breakup-val">24</div></div>'
      +'<div class="hud-breakup-row"><div class="hud-breakup-label">Time committed</div><div class="hud-breakup-val" style="color:var(--red)">'+G.timeUsed+'</div></div>'
      +'<div class="hud-breakup-row"><div class="hud-breakup-label">Free time remaining</div><div class="hud-breakup-val" style="color:'+timeColor()+'">'+freeTime()+'</div></div>'
      +'</div>'
      +'<div class="hud-breakup-info">Free time &lt; 8: deal-making is restricted. Buy delegation assets to free up time and earn delegation bonus (self-employed).</div>'
      +'</div>';
  } else if(key==='tax'){
    h+='<div class="hud-breakup">'
      +'<div class="hud-breakup-title">Tax Rate</div>'
      +'<div class="hud-breakup-total" style="color:var(--orange)">'+G.taxRate+'%</div>'
      +'<div class="hud-breakup-info">Salary is taxed at '+G.taxRate+'%. Passive income is taxed at '+Math.round(G.taxRate/2)+'% (half rate). Each delegation asset (Manager, SOP) reduces your tax rate by 5%. Minimum tax rate is 5%.</div>'
      +'</div>';
  } else if(key==='discipline'){
    h+='<div class="hud-breakup">'
      +'<div class="hud-breakup-title">Discipline Score</div>'
      +'<div class="hud-breakup-total" style="color:'+(G.disciplineScore>=5?'var(--green)':G.disciplineScore>=2?'var(--gold)':'var(--red)')+'">'+G.disciplineScore+' points</div>'
      +'<div class="hud-breakup-info">Discipline grows when you resist lifestyle temptation, make wise scenario choices, and encounter legend events. Higher discipline improves event outcomes and reduces black swan damage.</div>'
      +'</div>';
  } else if(key==='coverage'){
    var np2=netPassive();var exp2=totalExp();
    var pct=Math.round((np2/Math.max(1,exp2))*100);
    h+='<div class="hud-breakup">'
      +'<div class="hud-breakup-title">Passive Coverage</div>'
      +'<div class="hud-breakup-total" style="color:'+(np2>=exp2?'var(--green)':'var(--red)')+'">'+pct+'%</div>'
      +'<div class="hud-breakup-list">'
      +'<div class="hud-breakup-row"><div class="hud-breakup-label">Net passive/mo</div><div class="hud-breakup-val" style="color:var(--green)">'+fmtS(np2)+'</div></div>'
      +'<div class="hud-breakup-row"><div class="hud-breakup-label">Total expenses/mo</div><div class="hud-breakup-val" style="color:var(--red)">'+fmt(exp2)+'</div></div>'
      +'</div>'
      +'<div class="hud-breakup-info">100% coverage = passive income covers all expenses. You could stop working today. Goal: reach and sustain 100%+ coverage.</div>'
      +'</div>';
  } else if(key==='loan'){
    h+='<div class="hud-breakup">'
      +'<div class="hud-breakup-title">Active Loan</div>'
      +'<div class="hud-breakup-total" style="color:var(--red)">'+fmt(G.loanAmount)+'</div>'
      +'<div class="hud-breakup-list">'
      +'<div class="hud-breakup-row"><div class="hud-breakup-label">Loan balance</div><div class="hud-breakup-val" style="color:var(--red)">'+fmt(G.loanAmount)+'</div></div>'
      +'<div class="hud-breakup-row"><div class="hud-breakup-label">Monthly interest</div><div class="hud-breakup-val" style="color:var(--red)">'+fmt(G.loanMonthlyPayment)+'/mo</div></div>'
      +'</div>'
      +'<div class="hud-breakup-info">Loan interest is a mandatory expense. Repay as soon as passive income from deployed capital exceeds the monthly interest cost.</div>'
      +'<div class="brow"><button class="btn btn-green" onclick="PG.repayLoan()">Repay full loan</button></div>'
      +'</div>';
  }

  h+='<div class="brow"><button class="btn btn-ghost" onclick="PG.goGame()">Back to board</button></div>';
  s.innerHTML=h;
}
