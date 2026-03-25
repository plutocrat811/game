/* PLUTOCRAT v11 — plutocrat-engine-screens-setup.js */
/* Layer 2 — Screen renderers: setup flow, identity shift, consolidation */
/* Screens: rTitle, rSetupLoc, rName, rProfile, rHousing, rGrocery, */
/*          rIdentityShift, rConsolidation */
/* Load order: after plutocrat-engine-core.js */
/* Standalone file — reads engine internals via window._PGInternal bridge */

'use strict';

/* ─── Aliases from _PGInternal bridge ─── */
/* Data-layer globals (PROFILES, LDATA, MANUAL_LOCS) are still window-level */
/* and need no aliasing. Only engine-core internals need the bridge. */
var G=window._PGInternal.G;
var LOC=window._PGInternal.LOC;
var SAVE_KEY=window._PGInternal.SAVE_KEY;
var fmt=function(n){return window._PGInternal.fmt(n);};
var sc=function(n){return window._PGInternal.sc(n);};
var gel=function(id){return window._PGInternal.gel(id);};

/* ─── TITLE SCREEN ─── */
function rTitle(s){
  var hasSave=false;
  try{hasSave=!!localStorage.getItem(SAVE_KEY);}catch(e){}
  s.innerHTML='<div class="hero">'
    +'<div class="big">PLUTOCRAT</div>'
    +'<div class="tagline">by Billionaire by 20</div>'
    +'<div class="quote">'
    +'A business that requires your time is <em>just another job</em>.<br>'
    +'Real wealth is when assets work — <em>and you don\'t have to</em>.<br>'
    +'The goal is not money. <em>The goal is time.</em>'
    +'</div>'
    +'<div style="font-size:11px;color:var(--text3);margin-bottom:32px;line-height:1.8">'
    +'Location: <span style="color:var(--gold)">'+LOC.country+(LOC.city&&LOC.city!==LOC.country?', '+LOC.city:'')+'</span>'
    +' &nbsp;&nbsp; Currency: <span style="color:var(--gold)">'+LOC.currency+'</span>'
    +'</div>'
    +'<div class="brow" style="justify-content:center;gap:12px">'
    +(hasSave?'<button class="btn btn-gold" onclick="PG.continueSave()">Continue game</button>':'')
    +'<button class="btn '+(hasSave?'btn-ghost':'btn-gold')+'" onclick="PG.start()">'+(hasSave?'New game':'Begin your ascent')+'</button>'
    +'<button class="btn btn-ghost" onclick="PG.changeLoc()">Change location</button>'
    +'</div></div>';
}

/* ─── LOCATION SELECTOR ─── */
function rSetupLoc(s){
  s.innerHTML='<div class="ch" style="font-size:20px;margin-bottom:8px">Select your location</div>'
    +'<div style="font-size:12px;color:var(--text3);margin-bottom:22px;line-height:1.6">Choose the country that matches your currency and cost of living.</div>'
    +'<div class="loc-grid">'
    +MANUAL_LOCS.map(function(l){
      return '<div class="loc-card'+(LOC.country===LDATA[l.code].country?' active':'')+'" onclick="PG.setLoc(\''+l.code+'\')">'
        +'<div class="loc-name">'+l.label+'</div>'
        +'<div class="loc-cur">'+l.cur+'</div>'
        +'</div>';
    }).join('')
    +'</div>'
    +'<div class="brow">'
    +'<button class="btn btn-ghost" onclick="PG.fromLoc()">Back</button>'
    /* BUG 19 FIX — Confirm calls PG.confirmLoc(), not PG.fromLoc().
       Both went to title before — now Confirm is a deliberate action
       and Back is a cancellation. PG.confirmLoc() wired in actions.js. */
    +'<button class="btn btn-gold" onclick="PG.confirmLoc()">Confirm location</button>'
    +'</div>';
}

/* ─── NAME ENTRY ─── */
function rName(s){
  s.innerHTML='<div class="ch" style="font-size:20px;margin-bottom:8px">What is your name?</div>'
    +'<div style="font-size:12px;color:var(--text3);margin-bottom:24px">This is your game. It should feel like your life.</div>'
    +'<div class="inp-inline">'
    +'<input class="inp" id="ninp" placeholder="Enter your name" maxlength="30" value="'+G.playerName+'"'
    +' onkeydown="if(event.key===\'Enter\')PG.setName()"/>'
    +'<button class="btn btn-gold" onclick="PG.setName()">Continue</button>'
    +'</div>';
  setTimeout(function(){var i=gel('ninp');if(i)i.focus();},80);
}

/* ─── PROFILE SELECTION ─── */
function rProfile(s){
  var h='<div class="ch" style="font-size:20px;margin-bottom:6px">Choose your profile, '+G.playerName+'</div>'
    +'<div style="font-size:12px;color:var(--text3);margin-bottom:20px">Your starting point shapes your challenges — not your destiny</div>'
    +'<div class="pgrid">';
  PROFILES.forEach(function(p){
    h+='<div class="pcard'+(G.profile===p.id?' active':'')+'" onclick="PG.pick(\''+p.id+'\')">'
      +'<div class="pbadge '+p.badge+'">'+p.badgeText+'</div>'
      +'<div class="pname">'+p.name+'</div>'
      +'<div class="psub">'+p.tag+'</div>'
      +'<div class="pstat">Cash: <span>'+fmt(sc(p.cash))+'</span></div>'
      +'<div class="pstat">Time used: <span>'+p.timeUsed+'/24</span></div>'
      +'<div class="pstat">Salary: <span>'+fmt(sc(p.salaryBase))+'/mo</span></div>'
      +'<div class="pstat">Tax rate: <span>'+p.taxRate+'%</span></div>'
      +'<div class="pdesc">'+p.desc+'</div>'
      +'<div style="font-size:11px;color:var(--blue);margin-top:8px;line-height:1.6">'+p.unique+'</div>'
      +'</div>';
  });
  h+='</div>'
    +'<div class="brow">'
    +'<button class="btn btn-gold" onclick="PG.confirmProfile()" '+(G.profile?'':'disabled')+'>Lock in profile</button>'
    +'</div>';
  s.innerHTML=h;
}

/* ─── HOUSING SELECTION ─── */
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
  h+='</div>'
    +'<div class="brow">'
    +'<button class="btn btn-ghost" onclick="PG.backToProfile()">Back</button>'
    +'<button class="btn btn-gold" onclick="PG.toGrocery()" '+(G.housing?'':'disabled')+'>Next — groceries</button>'
    +'</div>';
  s.innerHTML=h;
}

/* ─── GROCERY SELECTION ─── */
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
  h+='</div>'
    +'<div class="brow">'
    +'<button class="btn btn-ghost" onclick="PG.backToHousing()">Back</button>'
    +'<button class="btn btn-gold" onclick="PG.startGame()" '+(G.grocery?'':'disabled')+'>Start game</button>'
    +'</div>';
  s.innerHTML=h;
}

/* ─── IDENTITY SHIFT ─── */
/* Fires once when player first has passive income */
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

/* ─── CONSOLIDATION PHASE INTRO ─── */
/* Shown after Tier 1-3 win before consolidation begins */
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
    +'</div>'
    +'</div>'
    +'<button class="btn btn-gold" onclick="PG.enterConsolidation()" style="font-size:13px;padding:14px 36px">Enter consolidation phase</button>'
    +'</div>';
}
