/* PLUTOCRAT v11 — plutocrat-engine-actions-c.js */
/* Public API Part C: survival, loan, nextMonth, reset, init trigger */
/* Load order: last JS file, after plutocrat-engine-actions-b.js */
/* Standalone file — accesses internals via window._PGInternal */
/* No IIFE — engine-core.js opens and closes its own IIFE. */

'use strict';

/* ─── Local aliases to _PGInternal for readability ─── */
var _ic=window._PGInternal;
var G=_ic.G;
var render=function(){_ic.render();};
var fmt=function(n){return _ic.fmt(n);};
var addLog=function(msg){_ic.addLog(msg);};
var autosave=function(){_ic.autosave();};
var recalc=function(){_ic.recalc();};
var showModal=function(t,b,btns){_ic.showModal(t,b,btns);};
var assetMarketValue=function(a){return _ic.assetMarketValue(a);};
var nextMonth=function(){_ic.nextMonth();};
var resetGame=function(){_ic.resetGame();};

/* ─────────────────────────────────────────
   BUILD window.PG — Part C
   Extends window.PG built by Parts A and B.
─────────────────────────────────────────── */
window.PG=window.PG||{};

Object.assign(window.PG,{

  /* ── Survival ── */
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
      var monthly=Math.round(principal*0.18/12);
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

  /* ── Loan ── */
  takeLoan:function(amount,monthly){
    if(G.loanAmount>0){
      showModal('Loan active','Repay your current loan before taking a new one.',
        [{label:'OK',cls:'btn-ghost',fn:'PG.closeModal();'}]);
      return;
    }
    G.cash+=amount;
    G.loanAmount=amount;
    G.loanMonthlyPayment=monthly;
    G.loanStartsNextMonth=true;
    addLog('Borrowed: '+fmt(amount)+'. Monthly interest: '+fmt(monthly)+' (starts next month). Deploy into assets immediately.');
    G.screen='game';render();
  },

  repayLoan:function(){
    if(G.cash<G.loanAmount){
      showModal('Insufficient cash',
        'You need '+fmt(G.loanAmount)+' to repay the loan. You have '+fmt(G.cash)+'.',
        [{label:'OK',cls:'btn-ghost',fn:'PG.closeModal();'}]);
      return;
    }
    G.cash-=G.loanAmount;
    addLog('Loan repaid: '+fmt(G.loanAmount)+'. No more interest payments.');
    G.loanAmount=0;G.loanMonthlyPayment=0;G.loanStartsNextMonth=false;
    G.screen='game';render();
  },

  /* ── Next month ── */
  nextMonth:function(){nextMonth();},

  /* ── Reset ── */
  reset:function(){resetGame();}

}); /* end Object.assign Part C */

/* ─────────────────────────────────────────
   INIT — trigger on DOM ready
   Calls _PGInternal.init() instead of the
   old window._pgInit which no longer exists.
─────────────────────────────────────────── */
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',function(){_ic.init();});
} else {
  setTimeout(function(){_ic.init();},0);
}
