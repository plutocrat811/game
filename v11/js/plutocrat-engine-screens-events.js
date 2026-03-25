/* PLUTOCRAT v11 — plutocrat-engine-screens-events.js */
/* Layer 2 — Screen renderers: events, outcomes, win, survival */
/* Screens: rEvent, rSmartResponse, rEnd, rScenario, rScenarioOutcome, */
/*          rLegend, rSurvival, rBankruptcy, rWin, rLifestyleInflation */
/* Load order: after plutocrat-engine-screens-game.js */
/* Standalone file — reads engine internals via window._PGInternal bridge */

'use strict';

/* ─── Aliases from _PGInternal bridge ─── */
/* Data-layer globals (EVENT_RESPONSES, DEAL_SCENARIOS, LEGEND_EVENTS, */
/* ASSET_DEFS, WINS) are still window-level and need no aliasing. */
var G=window._PGInternal.G;
var LOC=window._PGInternal.LOC;
var fmt=function(n){return window._PGInternal.fmt(n);};
var fmtS=function(n){return window._PGInternal.fmtS(n);};
var sc=function(n){return window._PGInternal.sc(n);};
var render=function(){window._PGInternal.render();};
var recalc=function(){window._PGInternal.recalc();};
var freeTime=function(){return window._PGInternal.freeTime();};
var timeColor=function(){return window._PGInternal.timeColor();};
var totalExp=function(){return window._PGInternal.totalExp();};
var netPassive=function(){return window._PGInternal.netPassive();};
var checkWin=function(){return window._PGInternal.checkWin();};
var prof=function(){return window._PGInternal.prof();};
var assetMarketValue=function(a){return window._PGInternal.assetMarketValue(a);};

/* ─── EVENT CARD ─── */
/* BUG 2 FIX — renamed duplicate var f declarations to fRed and fGreen */
function rEvent(s){
  var e=G.eventCard;
  var isBlackSwan=e.type==='blackswan';
  var isOpportunity=e.type==='opportunity'||e.type==='market';
  var ecls=e.type==='opportunity'?'epos':e.type==='setback'?'eneg':e.type==='market'?'epurp':isBlackSwan?'eneg':'eneu';

  s.innerHTML='<div class="ch" style="font-size:11px;letter-spacing:3px;margin-bottom:18px">'
    +(isBlackSwan?'⚠ BLACK SWAN EVENT':'Event card')+' — Y'+G.year+' M'+G.month+'</div>'
    +'<div class="ecard '+e.type+'">'
    +'<div class="etype '+e.type+'">'+(isBlackSwan?'BLACK SWAN':e.type.toUpperCase())+'</div>'
    +'<div class="etitle">'+e.title+'</div>'
    +'<div class="ebody">'+e.body+'</div>'
    +'<div class="eeffect '+ecls+'">'+e.effect+'</div>'
    +'</div>'
    +'<div class="brow"><button class="btn btn-gold" onclick="PG.acceptEvent()">Accept outcome</button></div>';

  /* Visual flash — BUG 2 FIX: fRed and fGreen instead of both being var f */
  if(isBlackSwan){
    var fRed=document.createElement('div');
    fRed.className='event-flash flash-red';
    document.body.appendChild(fRed);
    setTimeout(function(){if(fRed.parentNode)fRed.parentNode.removeChild(fRed);},600);
  } else if(isOpportunity){
    var fGreen=document.createElement('div');
    fGreen.className='event-flash flash-green';
    document.body.appendChild(fGreen);
    setTimeout(function(){if(fGreen.parentNode)fGreen.parentNode.removeChild(fGreen);},400);
  }
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

  s.innerHTML='<div class="ch" style="font-size:11px;letter-spacing:3px;margin-bottom:18px">Event response — Y'+G.year+' M'+G.month+'</div>'
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
}

/* ─── END OF MONTH SUMMARY ─── */
function rEnd(s){
  recalc();
  var ft=freeTime();
  var exp=totalExp();
  var result=G._lastSettleResult||{collectedIncome:0,totalTax:0,paidExp:0,net:0,seBonus:0,newCarried:[]};
  var np=netPassive();
  var win=checkWin();
  var nm=G.month>=12?1:G.month+1;
  var ny=G.month>=12?G.year+1:G.year;

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

  if(result.newCarried&&result.newCarried.length>0)
    h+='<div class="notice norange">'+result.newCarried.length+' expense'+(result.newCarried.length>1?'s':'')+' carried to next month. Late fees apply from month 2.</div>';
  if(G.passiveIncome===0)
    h+='<div class="notice nred">Zero passive income. If you stopped working — everything stops.</div>';
  if(ft<=4&&ft>0)h+='<div class="notice nred">Only '+ft+' free time. Delegate now.</div>';
  if(ft===0)h+='<div class="notice nred">0 free time. Your business owns you completely.</div>';
  if(win)h+='<div class="notice ngold">WIN UNLOCKED — '+win.title+'</div>';
  if(G.profile==='employee'&&G.assets.length===0)
    h+='<div class="notice nblue">Employee trap: Salary grew +'+fmt(sc(5000))+' — but you are still fully dependent on it.</div>';
  if(result.totalTax>0)
    h+='<div class="notice norange">Taxes paid this month: '+fmt(result.totalTax)+'. Delegation assets reduce your tax rate by 5% each.</div>';

  h+='<div class="brow">'
    +(win&&!G.consolidationPhase&&win.tier<=3?'<button class="btn btn-gold" onclick="PG.triggerWin()">Claim victory ✦</button>':'')
    +(win&&win.tier===4?'<button class="btn btn-gold" onclick="PG.claimWin()">Claim legacy ★</button>':'')
    +'<button class="btn btn-green" onclick="PG.nextMonth()">Next month — Y'+ny+' M'+nm+'</button>'
    +'</div>';
  s.innerHTML=h;
}

/* ─── SCENARIO SCREEN ─── */
/* Renamed sc_obj → scenarioObj throughout, consistent with engine-core.js */
function rScenario(s){
  var scenarioObj=G.pendingScenario;
  if(!scenarioObj){G.screen='game';render();return;}
  var h='<div class="ch" style="font-size:11px;letter-spacing:3px;margin-bottom:18px">Historical deal scenario — Y'+G.year+' M'+G.month+'</div>'
    +'<div class="ecard scenario">'
    +'<div class="etype scenario">Deal scenario</div>'
    +'<div class="etitle">'+scenarioObj.title+'</div>'
    +'<div class="ebody">'+scenarioObj.setup+'</div>'
    +'</div>'
    +'<div class="sec" style="margin-top:14px"><span>Your decision</span></div>'
    +'<div class="scenario-choices">';
  scenarioObj.choices.forEach(function(ch){
    h+='<div class="scenario-choice" onclick="PG.chooseScenario(\''+scenarioObj.id+'\',\''+ch.id+'\')">'
      +'<div class="sc-label">'+ch.label+'</div>'
      +'<div class="sc-desc">'+ch.desc+'</div>'
      +'<div class="sc-hint">'+ch.hint+'</div>'
      +'</div>';
  });
  h+='</div>';
  s.innerHTML=h;
}

/* ─── SCENARIO OUTCOME ─── */
function rScenarioOutcome(s){
  var out=G.pendingOutcome;
  if(!out){G.screen='game';render();return;}
  var h='<div class="ch" style="font-size:11px;letter-spacing:3px;margin-bottom:18px">What happened — Y'+G.year+' M'+G.month+'</div>'
    +'<div class="scenario-outcome">'
    +'<div class="outcome-title">'+out.title+'</div>'
    +'<div class="outcome-body">'+out.body+'</div>'
    /* BUG 17 FIX — classify effectLabel colour by first character:
       '+' → epos (green), '−' → eneg (red), anything else → eneu (neutral) */
    +'<div class="eeffect '+(out.effectLabel?(out.effectLabel.indexOf('+')===0?'epos':out.effectLabel.indexOf('−')===0?'eneg':'eneu'):'eneu')+'">'+out.effectLabel+'</div>'
    +'<div class="outcome-lesson"><em>The lesson:</em> '+out.lesson+'</div>'
    +'</div>'
    +'<div class="brow"><button class="btn btn-gold" onclick="PG.finishScenario()">Continue</button></div>';
  s.innerHTML=h;
}

/* ─── LEGEND EVENT ─── */
function rLegend(s){
  var leg=G.pendingLegend;
  if(!leg){G.screen='game';render();return;}
  s.innerHTML='<div class="ch" style="font-size:11px;letter-spacing:3px;margin-bottom:18px">A moment worth remembering — Y'+G.year+' M'+G.month+'</div>'
    +'<div class="ecard legend" style="text-align:center">'
    +'<div class="etype legend">LEGEND</div>'
    +'<div class="etitle">'+leg.title+'</div>'
    +'<div class="ebody">'+leg.body+'</div>'
    +'<div class="eeffect eneu" style="margin-bottom:16px">'+leg.effectLabel+'</div>'
    +'<div class="outcome-lesson" style="font-size:12px;color:var(--text3);font-style:italic;line-height:1.8;border-top:1px solid var(--border);padding-top:14px;margin-top:4px"><em>The lesson:</em> '+leg.lesson+'</div>'
    +'</div>'
    +'<div class="brow"><button class="btn btn-gold" onclick="PG.acknowledgeLegend()">Carry this forward</button></div>';
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

/* ─── BANKRUPTCY ─── */
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

/* ─── WIN SCREEN ─── */
function rWin(s){
  recalc();
  var ft=freeTime();
  var win=checkWin()||WINS[0];
  var exp=totalExp();
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

  /* Deal breakdown for dealmaker */
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

/* ─── LIFESTYLE INFLATION CHOICE — Feature 3 ─── */
/* Replaces the silent auto-add behaviour. Player chooses Accept or Resist. */
function rLifestyleInflation(s){
  var pending=G.pendingLifestyleInflation;
  if(!pending){G.screen='game';render();return;}

  /* Feature 5 — profile-aware messaging */
  var isDealmaker=G.profile==='dealmaker';
  var titleText=isDealmaker?'A lifestyle upgrade opportunity.':'The lifestyle inflation trap.';
  var bodyText=isDealmaker
    ?'Your success demands a higher standard of living. This is not just comfort — it is positioning. The right lifestyle opens the right rooms.'
    +'<br><br>This expense can be paused or stopped at any time. While active, it unlocks deal access and reputation perks. While paused or stopped, those perks are suspended.'
    :'Good month. Your lifestyle upgraded. Expenses never come back down on their own.'
    +'<br><br>You can accept this upgrade — then pause or stop it later using the expense controls. Or resist now and keep your discipline score clean.';
  var resistLabel=isDealmaker?'Resist — stay lean, lose the perks (+1 discipline)':'Resist — stay disciplined (+1 discipline)';
  var acceptLabel=isDealmaker?'Accept — strategic positioning (adds '+fmt(pending.amount)+'/mo, reversible)':'Accept — lifestyle upgrades (adds '+fmt(pending.amount)+'/mo, reversible)';

  s.innerHTML='<div class="ch" style="font-size:11px;letter-spacing:3px;margin-bottom:18px">Lifestyle event — Y'+G.year+' M'+G.month+'</div>'
    +'<div class="lifestyle-inflation-card">'
    +'<div class="lifestyle-inflation-title">'+titleText+'</div>'
    +'<div class="lifestyle-inflation-body">'+bodyText+'</div>'
    +'<div class="lifestyle-inflation-amount">+'+fmt(pending.amount)+'/mo</div>'
    +'<div class="lifestyle-inflation-perm">Permanent until you pause or stop it</div>'
    +'<div class="brow" style="justify-content:center">'
    +'<button class="btn btn-green" onclick="PG.resistLifestyleInflation()" style="padding:12px 24px">'+resistLabel+'</button>'
    +'<button class="btn btn-red" onclick="PG.acceptLifestyleInflation()" style="padding:12px 24px">'+acceptLabel+'</button>'
    +'</div>'
    +(isDealmaker?'<div class="exp-dealmaker-warning" style="margin-top:14px">Pausing or stopping this after accepting will suspend associated deal access and reputation perks until re-enabled.</div>':'')
    +'</div>'
    +'<div class="brow"><button class="btn btn-ghost" onclick="PG.goGame()">Decide later</button></div>';
}
