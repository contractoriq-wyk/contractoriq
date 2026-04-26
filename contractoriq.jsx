import React, { useState, useEffect, useRef } from 'react';

const DARK={bg:"#0b0f1c",surf:"#141928",card:"#1a2236",raised:"#232f45",border:"#2c3a52",accent:"#00ffcc",a2:"#ff7a45",a3:"#a78bfa",text:"#f0f6ff",sub:"#a8bdd4",green:"#4ade80",red:"#f87171",gold:"#fbbf24"};
const LIGHT={bg:"#e8eef5",surf:"#ffffff",card:"#f5f8fc",raised:"#dce4ef",border:"#a8b8cc",accent:"#005f8a",a2:"#a02800",a3:"#4c1d95",text:"#050d1a",sub:"#1a2d45",green:"#0f4c25",red:"#8b0000",gold:"#7a4a00"};
const C=DARK; // default — overridden by component state
const _K=(C)=>(x={})=>({background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"18px",boxShadow:"0 2px 12px rgba(0,0,0,0.15)",...x});
const gc=g=>g==="A"?C.green:g==="B"?C.accent:g==="C"?C.gold:C.red;
const inp={width:"100%",padding:"11px 13px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:9,color:C.text,fontSize:13,boxSizing:"border-box",fontFamily:"inherit",outline:"none"};
const lbl={fontSize:10,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5,display:"block"};

function Bar({pct,color,h=8}){return <div style={{background:"#0a0f1a",borderRadius:4,height:h,overflow:"hidden"}}><div style={{width:`${Math.min(pct,100)}%`,background:color,height:"100%",borderRadius:4,transition:"width 0.7s"}}/></div>;}
function Nav({i,max,prev,next,label}){return <div style={{display:"flex",gap:6,alignItems:"center"}}><button onClick={prev} disabled={i===0} style={{width:28,height:28,borderRadius:7,background:C.raised,border:`1px solid ${C.border}`,color:i===0?C.border:C.text,cursor:i===0?"default":"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button><span style={{fontSize:12,fontWeight:700,color:C.accent,minWidth:42,textAlign:"center"}}>{label}</span><button onClick={next} disabled={i===max} style={{width:28,height:28,borderRadius:7,background:C.raised,border:`1px solid ${C.border}`,color:i===max?C.border:C.text,cursor:i===max?"default":"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button></div>;}
function Tag({color,children}){return <span style={{padding:"3px 9px",borderRadius:20,fontSize:11,background:`${color}18`,border:`1px solid ${color}44`,color}}>{children}</span>;}

function scoreMove(m){
  const miles=m.miles||m.mi||0;
  const rate=m.rate||m.rt||0;
  const fsc=m.fsc||m.fc||0;
  const type=m.type||m.t||"L";
  const rpm=miles>0?(rate+fsc)/miles:0;

  // Detect move pay type
  const isRoundTrip = type==="RT"||m.isRoundTrip===true;
  const isFlatRate  = !isRoundTrip && fsc===0 && rate>=100;
  const hasFSC      = fsc>0;
  const isDropHook  = isFlatRate && miles<=30;

  let s=0,tags=[];

  // RPM scoring
  if(rpm>=3.5){s+=40;tags.push("💰 Premium RPM");}
  else if(rpm>=2.5){s+=25;tags.push("✅ Good RPM");}
  else if(rpm>=2.0){s+=15;tags.push("📊 Fair RPM");}
  else if(rpm>=1.8){s+=10;tags.push("⚠️ Low RPM");}
  else tags.push("🚫 Below Cost");

  // Load type
  if(isRoundTrip){s+=25;tags.push("🔄 Round Trip");}
  else if(type==="L"){s+=20;tags.push("📦 Loaded");}
  else{s+=5;tags.push("🔁 Empty");}

  // Pay structure bonus
  if(hasFSC){s+=15;tags.push("⛽ FSC Included");}
  else if(isRoundTrip){s+=15;tags.push("💵 Flat Rate All-In");}
  else if(isFlatRate){s+=15;tags.push("💵 Flat Rate All-In");}

  // Distance bonus
  if(isDropHook){s+=10;tags.push("🪝 Drop & Hook");}
  else if(miles>=70&&miles<=100){s+=10;tags.push("📍 Sweet Spot");}
  else if(miles>100){s+=5;tags.push("🛣️ Long Haul");}

  return{score:s,grade:s>=70?"A":s>=50?"B":s>=30?"C":"D",rpm:rpm.toFixed(2),tags,isRoundTrip,isFlatRate,isDropHook,hasFSC};
}

async function ai(msgs,sys){
  try{
    const apiKey=typeof __ANTHROPIC_KEY__!=="undefined"&&__ANTHROPIC_KEY__?__ANTHROPIC_KEY__:(window.__CIQ_KEY__||"");
    if(!apiKey)return "⚠️ AI features require setup. Contact support at getcontractoriq.com";
    const r=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
      body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:1500,system:sys||"You are a helpful trucking business advisor.",messages:msgs})
    });
    if(!r.ok){const e=await r.text();return "⚠️ API Error "+r.status+": "+e.slice(0,100);}
    const d=await r.json();
    if(d.error)return "⚠️ "+d.error.message;
    const txt=d.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"";
    return txt||"I received your message but had no response. Please try again.";
  }catch(err){return "⚠️ Connection error: "+err.message;}
}

function copyText(t){if(navigator.clipboard?.writeText)navigator.clipboard.writeText(t).catch(()=>fbCopy(t));else fbCopy(t);}
function fbCopy(t){const e=document.createElement("textarea");e.value=t;e.style.cssText="position:fixed;opacity:0";document.body.appendChild(e);e.focus();e.select();document.execCommand("copy");document.body.removeChild(e);}

// ── DATA ─────────────────────────────────────────────────────────────────────
const W=[
  {vendor:"CPG",week:"09",label:"Week 09",from:"02/23/2026",to:"03/01/2026",gross:1865.26,net:338.55,totalDeductions:1565.10,rebate:38.39,gallons:255.92,
   deds:[
     {l:"Parking Lot/Security",a:40.00},{l:"OCC/ACC Insurance",a:32.64},{l:"Escrow Regular",a:100.00},
     {l:"Fuel Advance (TA Baltimore)",a:607.32},{l:"ELD Usage Fee",a:10.00},{l:"Event Recorder Fee",a:10.00},
     {l:"Bobtail Insurance",a:10.61},{l:"License Plate Program",a:55.00},{l:"Physical Damage Insurance",a:33.64},
     {l:"Fuel Advance (Pilot 179)",a:645.28},{l:"2290 Escrow Fund",a:10.00},{l:"Roadside Assistance Insurance",a:10.61}
   ],
   moves:[
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},
     {t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:270,fc:37.49},
     {t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:37.49},
     {t:"E",fr:"LANCASPA",to:"DUNDALMD",mi:73,rt:128,fc:35.15},
     {t:"L",fr:"DUNDALMD",to:"LANCASPA",mi:73,rt:192,fc:35.15},
     {t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:195,fc:37.49},
     {t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:37.49}
   ]},
  {vendor:"CPG",week:"10",label:"Week 10",from:"03/02/2026",to:"03/08/2026",gross:5263.42,net:3014.69,totalDeductions:2311.96,rebate:63.17,gallons:421.14,
   deds:[
     {l:"Parking Lot/Security",a:40.00},{l:"Event Recorder Fee",a:10.00},{l:"Physical Damage Insurance",a:33.64},
     {l:"Fuel Advance (Pilot 179)",a:568.35},{l:"ELD Usage Fee",a:10.00},{l:"Fuel Advance (Pilot Carneys Point)",a:745.00},
     {l:"2290 Escrow Fund",a:10.00},{l:"License Plate Program",a:55.00},{l:"Roadside Assistance Insurance",a:10.61},
     {l:"Bobtail Insurance",a:10.61},{l:"Fuel Advance (Pilot 179)",a:686.11},{l:"OCC/ACC Insurance",a:32.64},
     {l:"Escrow Regular",a:100.00}
   ],
   moves:[
     {t:"E",fr:"MIDD1PA",to:"ELIZABNJ",mi:163,rt:326,fc:153.66},
     {t:"L",fr:"DUNDALMD",to:"MIDD1PA",mi:90,rt:186,fc:0},
     {t:"L",fr:"ELIZABNJ",to:"DUNDALMD",mi:173,rt:447.71,fc:273.04},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},
     {t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:195,fc:37.49},
     {t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:37.49},
     {t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:38.18},
     {t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:195,fc:37.49},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},
     {t:"L",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:270,fc:38.18},
     {t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:38.18}
   ]},
  {vendor:"CPG",week:"11",label:"Week 11",from:"03/09/2026",to:"03/15/2026",gross:5070.70,net:2816.36,totalDeductions:2309.91,rebate:55.44,gallons:369.59,
   deds:[
     {l:"2290 Escrow Fund",a:10.00},{l:"License Plate Program",a:55.00},{l:"Event Recorder Fee",a:10.00},
     {l:"Parking Lot/Security",a:40.00},{l:"Escrow Regular",a:100.00},{l:"ELD Usage Fee",a:10.00},
     {l:"Fuel Advance (Pilot 179)",a:926.30},{l:"Roadside Assistance Insurance",a:10.61},
     {l:"OCC/ACC Insurance",a:32.64},{l:"Physical Damage Insurance",a:33.64},
     {l:"Fuel Advance (Pilot 179)",a:276.89},{l:"Fuel Advance (Pilot 150)",a:794.22},
     {l:"Bobtail Insurance",a:10.61}
   ],
   moves:[
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"L",fr:"DUNDALMD",to:"GREENCPA",mi:94,rt:202,fc:53.47},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},
     {t:"E",fr:"MIDD1PA",to:"ELIZABNJ",mi:163,rt:326,fc:153.66},
     {t:"L",fr:"ELIZABNJ",to:"DUNDALMD",mi:173,rt:706.38,fc:189.85},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},
     {t:"L",fr:"DUNDALMD",to:"GREENCPA",mi:94,rt:202,fc:53.47},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"E",fr:"CHAM1PA",to:"BALTIMMD",mi:106,rt:147,fc:61.20},
     {t:"L",fr:"BALTIMMD",to:"CHAM1PA",mi:106,rt:220,fc:61.20},
     {t:"E",fr:"GREENCPA",to:"DUNDALMD",mi:94,rt:135,fc:53.47},
     {t:"L",fr:"DUNDALMD",to:"DUNDALMD",mi:10,rt:100,fc:0},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0}
   ]},
  {vendor:"CPG",week:"12",label:"Week 12",from:"03/16/2026",to:"03/22/2026",gross:3479.98,net:1424.28,totalDeductions:2103.24,rebate:47.34,gallons:315.59,
   deds:[
     {l:"Fuel Highway Taxes",a:6.56},{l:"2290 Escrow Fund",a:10.00},{l:"Bobtail Insurance",a:10.61},
     {l:"Escrow Regular",a:100.00},{l:"ELD Usage Fee",a:10.00},{l:"OCC/ACC Insurance",a:32.64},
     {l:"Physical Damage Insurance",a:33.64},{l:"Fuel Advance (Pilot 179)",a:841.95},
     {l:"Parking Lot/Security",a:40.00},{l:"Event Recorder Fee",a:10.00},
     {l:"Fuel Advance (Pilot 179)",a:942.23},{l:"Roadside Assistance Insurance",a:10.61},
     {l:"License Plate Program",a:55.00}
   ],
   moves:[
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},
     {t:"L",fr:"SPARROMD",to:"MONROVMD",mi:51,rt:168,fc:32.93},
     {t:"E",fr:"MONROVMD",to:"DUNDALMD",mi:49,rt:180,fc:0},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},
     {t:"L",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},
     {t:"L",fr:"HAGERSMD",to:"BALTIMMD",mi:72,rt:200,fc:0},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"E",fr:"GREENCPA",to:"DUNDALMD",mi:94,rt:135,fc:53.47},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},
     {t:"E",fr:"NEWCASDE",to:"DUNDALMD",mi:67,rt:122,fc:41.92},
     {t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:195,fc:45.95},
     {t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:45.95},
     {t:"L",fr:"DUNDALMD",to:"YORKPA",mi:63,rt:180,fc:38.92},
     {t:"E",fr:"YORKPA",to:"DUNDALMD",mi:63,rt:120,fc:38.92},
     {t:"L",fr:"DUNDALMD",to:"NEWCASDE",mi:66,rt:110,fc:41.92}
   ]},
  {vendor:"CPG",week:"13",label:"Week 13",from:"03/23/2026",to:"03/29/2026",gross:4688.64,net:2857.82,totalDeductions:1870.04,rebate:38.95,gallons:259.64,
   deds:[
     {l:"OCC/ACC Insurance",a:32.64},{l:"Fuel Advance (Pilot 179)",a:313.31},
     {l:"Roadside Assistance Insurance",a:10.61},{l:"Physical Damage Insurance",a:33.64},
     {l:"Fuel Advance (Pilot 150)",a:843.93},{l:"ELD Usage Fee",a:10.00},
     {l:"2290 Escrow Fund",a:10.00},{l:"Bobtail Insurance",a:10.61},
     {l:"Escrow Regular",a:100.00},{l:"Fuel Advance (Pilot 179)",a:400.30},
     {l:"Event Recorder Fee",a:10.00},{l:"License Plate Program",a:55.00},
     {l:"Parking Lot/Security",a:40.00}
   ],
   moves:[
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:300,fc:0},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"L",fr:"SPARROMD",to:"HAGERSMD",mi:84,rt:298,fc:51.36},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},
     {t:"E",fr:"GREENCPA",to:"DUNDALMD",mi:94,rt:135,fc:57.40},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},
     {t:"L",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:48.33},
     {t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:270,fc:48.33},
     {t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:195,fc:48.33},
     {t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:48.33},
     {t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:195,fc:48.33},
     {t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:48.33},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"L",fr:"DUNDALMD",to:"GREENCPA",mi:94,rt:214.50,fc:57.40}
   ]},
  {vendor:"CPG",week:"14",label:"Week 14",from:"03/30/2026",to:"04/05/2026",gross:3783.73,net:2227.91,totalDeductions:1587.99,rebate:31.83,gallons:212.17,
   deds:[
     {l:"Fuel Advance (Pilot 179)",a:910.88},{l:"Event Recorder Fee",a:10.00},
     {l:"Roadside Assistance Insurance",a:10.61},{l:"License Plate Program",a:55.00},
     {l:"Fuel Advance (Pilot 179)",a:367.95},{l:"Bobtail Insurance",a:10.15},
     {l:"OCC/ACC Insurance",a:31.22},{l:"Parking Lot/Security",a:40.00},
     {l:"2290 Escrow Fund",a:10.00},{l:"Physical Damage Insurance",a:32.18},
     {l:"Escrow Regular",a:100.00},{l:"ELD Usage Fee",a:10.00}
   ],
   moves:[
     {t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:195,fc:52.36},
     {t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:52.36},
     {t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:195,fc:52.36},
     {t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:52.36},
     {t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:195,fc:52.36},
     {t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:52.36},
     {t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:195,fc:52.36},
     {t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:52.36},
     {t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:52.36},
     {t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:245,fc:52.36},
     {t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:52.36},
     {t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:245,fc:52.36},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},
     {t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:52.36},
     {t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:245,fc:48.33},
     {t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:195,fc:52.36},
     {t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:52.36}
   ]},
  {vendor:"CPG",week:"15",label:"Week 15",from:"04/06/2026",to:"04/12/2026",gross:5705.45,net:3000.28,totalDeductions:2764.49,rebate:58.91,gallons:392.70,
   deds:[
     {l:"Event Recorder Fee",a:10.00},{l:"ELD Usage Fee",a:10.00},{l:"Parking Lot/Security",a:40.00},
     {l:"License Plate Program",a:55.00},{l:"Roadside Assistance Insurance",a:10.61},
     {l:"OCC/ACC Insurance",a:31.22},{l:"Insurance Liability Limiter",a:14.47},
     {l:"Escrow Regular",a:100.00},{l:"Bobtail Insurance",a:10.15},
     {l:"Physical Damage Insurance",a:32.18},{l:"2290 Escrow Fund",a:10.00},
     {l:"Fuel Advance (Pilot 150)",a:253.00},{l:"Fuel Advance (Pilot 179)",a:865.53},
     {l:"Fuel Advance (Pilot 179)",a:881.87},{l:"Fuel Advance (Pilot 179)",a:440.46}
   ],
   moves:[
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:132,fc:57.66},
     {t:"L",fr:"DUNDALMD",to:"GREENCPA",mi:94,rt:202,fc:64.45},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:198,fc:57.66},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:132,fc:57.66},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:132,fc:57.66},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:132,fc:57.66},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:198,fc:57.66},
     {t:"E",fr:"GREENCPA",to:"DUNDALMD",mi:94,rt:135,fc:62.18},
     {t:"L",fr:"DUNDALMD",to:"GREENCPA",mi:93,rt:122,fc:0},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:198,fc:57.66},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:132,fc:57.66},
     {t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:245,fc:52.36},
     {t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:54.27},
     {t:"E",fr:"GREENCPA",to:"DUNDALMD",mi:94,rt:135,fc:64.45},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:198,fc:57.66},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:162,fc:57.66},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:132,fc:57.66},
     {t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:245,fc:54.27},
     {t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:54.27},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:198,fc:57.66},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:198,fc:57.66},
     {t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:132,fc:57.66},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:198,fc:57.66},
     {t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:198,fc:57.66},
     {t:"L",fr:"DUNDALMD",to:"GREENCPA",mi:94,rt:202,fc:64.45}
   ]},
];

// ── DEMO DATA (shown in demo mode only) ───────────────────────────────────
const DEMO_W=[
  {vendor:"JDT",week:"01",label:"Week 01",from:"01/06/2025",to:"01/10/2025",gross:4200.00,net:2310.00,totalDeductions:1890.00,rebate:45.00,gallons:280.00,
   deds:[{l:"Operations Fee",a:840.00},{l:"Fuel Advance",a:750.00},{l:"Insurance",a:200.00},{l:"Escrow",a:100.00}],
   moves:[{mi:62,rt:210,fc:45,t:"L"},{mi:58,rt:195,fc:42,t:"L"},{mi:71,rt:230,fc:48,t:"L"},{mi:45,rt:150,fc:38,t:"E"},{mi:68,rt:220,fc:46,t:"L"}]},
  {vendor:"JDT",week:"02",label:"Week 02",from:"01/13/2025",to:"01/17/2025",gross:4850.00,net:2667.50,totalDeductions:2182.50,rebate:52.00,gallons:310.00,
   deds:[{l:"Operations Fee",a:970.00},{l:"Fuel Advance",a:890.00},{l:"Insurance",a:200.00},{l:"Escrow",a:122.50}],
   moves:[{mi:65,rt:225,fc:47,t:"L"},{mi:72,rt:240,fc:50,t:"L"},{mi:55,rt:185,fc:40,t:"L"},{mi:68,rt:220,fc:46,t:"L"},{mi:48,rt:160,fc:39,t:"E"}]},
  {vendor:"JDT",week:"03",label:"Week 03",from:"01/20/2025",to:"01/24/2025",gross:3900.00,net:2145.00,totalDeductions:1755.00,rebate:38.00,gallons:265.00,
   deds:[{l:"Operations Fee",a:780.00},{l:"Fuel Advance",a:720.00},{l:"Insurance",a:200.00},{l:"Escrow",a:55.00}],
   moves:[{mi:58,rt:190,fc:41,t:"L"},{mi:62,rt:205,fc:44,t:"L"},{mi:70,rt:228,fc:47,t:"L"},{mi:52,rt:172,fc:38,t:"E"}]},
];


// ── VENDOR CONFIG ─────────────────────────────────────────────────────────────
const VENDORS={
  JDT: {name:"Demo Driver Co",       short:"DEMO", icon:"🚛", color:"#00ffcc",  unit:""},
  CPG: {name:"Lilwemma Services Co", short:"CPG", icon:"⚓", color:"#00ffcc",  unit:"BAL975"},
  STG: {name:"STG Drayage",          short:"STG", icon:"⚓", color:"#a78bfa",  unit:""},
  AMZ: {name:"Amazon Freight",       short:"AMZ", icon:"📦", color:"#ff7a45",  unit:""},
  OTH: {name:"Other",                short:"OTH", icon:"🏢", color:"#fbbf24",  unit:""},
};

function detectVendor(w){
  if(w.vendor&&VENDORS[w.vendor])return w.vendor;
  // Check all text content of the week — moves, deds, labels
  const text=JSON.stringify(w).toLowerCase();
  if(text.includes("seagirt")||text.includes("stg drayage")||text.includes("107h089")||text.includes("ports america")||text.includes("new stg"))return "STG";
  if(text.includes("containerport")||text.includes("hagersmd")||text.includes("dundalmd")||text.includes("williamd")||text.includes("baltimmd")||text.includes("bal975")||text.includes("pilot 179")||text.includes("pilot 150"))return "CPG";
  if(text.includes("amazon")||text.includes("amz")||text.includes("flex"))return "AMZ";
  return "OTH";
}

// Merge extra-pay lines into their parent move so RPM and move count are accurate.
// Extra pay = same route (fr+to+type) with mi===0, OR rate<100 with no FSC (overweight, toll, surcharge add-on).
// Total revenue is always preserved — we just fold the extra $ into the parent leg.
function mergeExtraPay(moves){
  const result=[];
  for(const m of moves){
    const mi=m.mi||m.miles||0;
    const rt=m.rt||m.rate||0;
    const fc=m.fc||m.fsc||0;
    const fr=m.fr||m.from||"";
    const to=m.to||"";
    const t=m.t||m.type||"L";
    const isExtra=(mi===0)||(mi>0&&rt>0&&rt<100&&fc===0);
    if(isExtra){
      const prev=[...result].reverse().find(r=>{
        const rf=r.fr||r.from||""; const rt2=r.to||""; const rt3=r.t||r.type||"L";
        return rf===fr&&rt2===to&&rt3===t&&(r.mi||r.miles||0)>0;
      });
      if(prev){
        prev.rt=(prev.rt||prev.rate||0)+rt;
        prev.fc=(prev.fc||prev.fsc||0)+fc;
        prev.extraPay=(prev.extraPay||0)+rt;
        continue;
      }
    }
    result.push({...m,extraPay:0});
  }
  return result;
}

// Pair flat-rate Empty + Loaded legs that form a complete round trip.
// CPG pays $200 empty + $200 loaded = $400 all-in for HAGERSMD↔DUNDALMD round trips.
// Rule: flat-rate (fc=0, rt>=100) E leg A→B paired with flat-rate L leg B→A = one trip.
// Paired moves show as a single "ROUND TRIP" entry with combined miles, pay, and RPM.
function pairRoundTrips(moves){
  const result=[];
  const used=new Set();
  moves.forEach((m,i)=>{
    if(used.has(i))return;
    const mi=m.mi||m.miles||0;
    const rt=m.rt||m.rate||0;
    const fc=m.fc||m.fsc||0;
    const fr=m.fr||m.from||"";
    const to=m.to||"";
    const t=m.t||m.type||"L";
    const isFlatRate=fc===0&&rt>=100;
    if(!isFlatRate){result.push(m);return;}
    // Look for an unpaired flat-rate leg going the opposite direction
    let matchIdx=-1;
    moves.forEach((m2,j)=>{
      if(used.has(j)||j===i)return;
      const mi2=m2.mi||m2.miles||0;
      const rt2=m2.rt||m2.rate||0;
      const fc2=m2.fc||m2.fsc||0;
      const fr2=m2.fr||m2.from||"";
      const to2=m2.to||"";
      const t2=m2.t||m2.type||"L";
      const isFlatRate2=fc2===0&&rt2>=100;
      const isOpposite=fr===to2&&to===fr2&&t!==t2;
      if(isFlatRate2&&isOpposite&&matchIdx===-1)matchIdx=j;
    });
    if(matchIdx!==-1){
      const m2=moves[matchIdx];
      const emptyLeg=t==="E"?m:m2;
      const loadedLeg=t==="L"?m:m2;
      const totalMi=(emptyLeg.mi||emptyLeg.miles||0)+(loadedLeg.mi||loadedLeg.miles||0);
      const totalPay=(emptyLeg.rt||emptyLeg.rate||0)+(loadedLeg.rt||loadedLeg.rate||0);
      result.push({
        t:"RT", type:"RT",
        fr:loadedLeg.fr||loadedLeg.from||"",
        to:loadedLeg.to||"",
        mi:totalMi, miles:totalMi,
        rt:totalPay, rate:totalPay,
        fc:0, fsc:0,
        extraPay:0,
        isRoundTrip:true,
        emptyPay:emptyLeg.rt||emptyLeg.rate||0,
        loadedPay:loadedLeg.rt||loadedLeg.rate||0,
        emptyMi:emptyLeg.mi||emptyLeg.miles||0,
        loadedMi:loadedLeg.mi||loadedLeg.miles||0,
      });
      used.add(i);used.add(matchIdx);
    } else {
      result.push(m);
    }
  });
  return result;
}

function grpDeds(deds,gross){
  // FUEL: any deduction with "fuel" in the label (covers "Fuel Advance", "Fuel", "Diesel" etc)
  const fuelKw=["fuel advance","fuel","diesel"];
  const fuel=deds.filter(d=>fuelKw.some(k=>d.l.toLowerCase().includes(k))&&!d.l.toLowerCase().includes("escrow")).reduce((s,d)=>s+d.a,0);
  // INSURANCE: specific insurance product names
  const insKw=["physical damage","bobtail","occ/acc","roadside assistance","liability limiter","occ acc","occupational","accident"];
  const ins=deds.filter(d=>insKw.some(k=>d.l.toLowerCase().includes(k))).reduce((s,d)=>s+d.a,0);
  // OPERATIONS: admin/compliance fees
  const opsKw=["eld","event recorder","parking","license plate","highway tax","toll","2290","ifta"];
  const ops=deds.filter(d=>opsKw.some(k=>d.l.toLowerCase().includes(k))&&!d.l.toLowerCase().includes("escrow")).reduce((s,d)=>s+d.a,0);
  // ESCROW: savings — shown separately, NOT a true cost
  const escrow=deds.filter(d=>d.l.toLowerCase().includes("escrow")).reduce((s,d)=>s+d.a,0);
  // OTHER: anything not caught above
  const other=deds.filter(d=>{
    const l=d.l.toLowerCase();
    return !fuelKw.some(k=>l.includes(k))&&
           !insKw.some(k=>l.includes(k))&&
           !opsKw.some(k=>l.includes(k))&&
           !l.includes("escrow");
  }).reduce((s,d)=>s+d.a,0);
  const groups=[
    {icon:"⛽",label:"Fuel",       amt:fuel,  color:C.red,  pct:(fuel/gross*100).toFixed(1)},
    {icon:"🛡️",label:"Insurance", amt:ins,   color:C.gold, pct:(ins/gross*100).toFixed(1)},
    {icon:"🔧",label:"Operations", amt:ops,   color:C.accent,pct:(ops/gross*100).toFixed(1)},
    {icon:"🏦",label:"Escrow",     amt:escrow,color:C.a3,   pct:(escrow/gross*100).toFixed(1),isSavings:true},
  ];
  if(other>0) groups.push({icon:"📋",label:"Other",amt:other,color:"#8fa3c0",pct:(other/gross*100).toFixed(1)});
  return groups.filter(g=>g.amt>0);
}

// ── APP ───────────────────────────────────────────────────────────────────────

// ── DEVICE FINGERPRINT (sharing prevention) ──────────────────────────────────
function getDeviceFingerprint(){
  try{
    var cv=document.createElement("canvas");
    var ctx=cv.getContext("2d");
    ctx.fillText("ciq_fp",10,10);
    var fp=cv.toDataURL()+navigator.userAgent+screen.width+"x"+screen.height+navigator.language+(navigator.hardwareConcurrency||"");
    var hash=0;
    for(var i=0;i<fp.length;i++){hash=((hash<<5)-hash)+fp.charCodeAt(i);hash|=0;}
    return "fp_"+Math.abs(hash).toString(36);
  }catch(e){return "fp_default";}
}

export default function ContractorIQv26(){
  const [tab,setTab]=useState("dashboard");
  const [sD,setSD]=useState(()=>Math.max(0,allW.length-1)); // selDed — default to latest week
  const [sM,setSM]=useState(()=>Math.max(0,allW.length-1)); // selMove
  const [sH,setSH]=useState(()=>Math.max(0,allW.length-1)); // selHealth
  const [sR,setSR]=useState(7); // selReport
  const [wide,setWide]=useState(window.innerWidth>700);
  const [darkMode,setDarkMode]=useState(()=>{try{const s=localStorage.getItem("ciq_theme");return s?s==="dark":true;}catch{return true;}});
  const C=darkMode?DARK:LIGHT;
  const K=_K(C); // bind card style helper to current theme
  // Sync body background with theme
  useEffect(()=>{document.body.style.background=C.bg;document.body.style.color=C.text;},[darkMode]);
  const [searchQ,setSearchQ]=useState("");
  const [searchResult,setSearchResult]=useState("");
  const [searchLoading,setSearchLoading]=useState(false);
  // ── Visitor tracking ──
  useState(()=>{
    try{
      const key="ciq_visits";
      const visits=JSON.parse(localStorage.getItem(key)||"[]");
      visits.push({t:Date.now(),ua:navigator.userAgent.slice(0,60),ref:document.referrer.slice(0,80)||"direct"});
      // Keep last 100 visits only
      if(visits.length>100)visits.splice(0,visits.length-100);
      localStorage.setItem(key,JSON.stringify(visits));
    }catch(e){}
  });
  // Loads
  const [offer,setOffer]=useState({miles:"",rate:"",fsc:"",type:"L"});
  const [offerRes,setOfferRes]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [newMove,setNewMove]=useState({type:"L",from:"",to:"",miles:"",rate:"",fsc:""});
  const [extra,setExtra]=useState([]);
  // PDF scan
  const [scanning,setScanning]=useState(false);
  const [scanResult,setScanResult]=useState(null);
  const [scanMsg,setScanMsg]=useState("");
  const [scanForm,setScanForm]=useState({week:"",from:"",to:"",gross:"",net:"",deds:"",moves:""});
  const [vendorPick,setVendorPick]=useState("CPG");
  const [fuelMPG,setFuelMPG]=useState(5.2);   // truck baseline MPG — your truck's known average
  const [fuelPrice,setFuelPrice]=useState(6.22); // price/gallon — match your Pilot receipt
  const [milesBuffer,setMilesBuffer]=useState(5); // % buffer for unreported miles
  const [focusMode,setFocusMode]=useState(false);
  const [showSettings,setShowSettings]=useState(false);
  const [showMenu,setShowMenu]=useState(false);
  const [showAbout,setShowAbout]=useState(false);
  const [showMarket,setShowMarket]=useState(false);
  const [showInsurance,setShowInsurance]=useState(false);
  const [favStocks,setFavStocks]=useState(()=>{try{return JSON.parse(localStorage.getItem("ciq_favstocks")||'["AAPL","TSLA","NVDA"]');}catch{return ["AAPL","TSLA","NVDA"];}});
  const [addingStock,setAddingStock]=useState(false);
  const [newStock,setNewStock]=useState("");
  const [hiddenVendors,setHiddenVendors]=useState([]);
  const [hideOwnerName,setHideOwnerName]=useState(false);
  const [hideUnitNum,setHideUnitNum]=useState(false);
  const [activeOnlyVendor,setActiveOnlyVendor]=useState(null);
  const [helpCard,setHelpCard]=useState(null);
  const [showProfile,setShowProfile]=useState(false);
  const [profile,setProfile]=useState(()=>{try{const s=localStorage.getItem("ciq_profile");return s?JSON.parse(s):{name:"",company:"",unit:"",type:"owner-operator",goal:"",targetWeeklyNet:"",targetMPG:"5.2",notes:"",setupDone:false};}catch{return{name:"",company:"",unit:"",type:"owner-operator",goal:"",targetWeeklyNet:"",targetMPG:"5.2",notes:"",setupDone:false};}});
  const [expenses,setExpenses]=useState(()=>{try{const s=localStorage.getItem("ciq_expenses");return s?JSON.parse(s):[];}catch{return[];}});
  const [showExpenseForm,setShowExpenseForm]=useState(false);
  const [expForm,setExpForm]=useState({date:"",category:"Parts",desc:"",amount:"",note:"",weekRef:""});
  const [expScan,setExpScan]=useState(false);
  const [expScanMsg,setExpScanMsg]=useState("");
  const [docs,setDocs]=useState(()=>{try{const s=localStorage.getItem("ciq_docs");return s?JSON.parse(s):[];}catch{return[];}});
  const [showDocForm,setShowDocForm]=useState(false);
  const [docForm,setDocForm]=useState({date:"",category:"Maintenance",title:"",note:""});
  const [docScan,setDocScan]=useState(false);
  const [docScanMsg,setDocScanMsg]=useState("");
  // ── MONETIZATION ──────────────────────────────────────────────────────
  const [isPro,setIsPro]=useState(()=>{if(typeof window!=="undefined"&&window.location.hostname.includes("navy"))return true;try{return localStorage.getItem("ciq_pro")==="true";}catch{return false;}});
  const [trialStart,setTrialStart]=useState(()=>{try{const t=localStorage.getItem("ciq_trial_start");return t?parseInt(t):null;}catch{return null;}});
  const [showUpgrade,setShowUpgrade]=useState(false);
  const [ownerTaps,setOwnerTaps]=useState(0);
  const [upgradeSrc,setUpgradeSrc]=useState("");
  const [oUses,setOUses]=useState(()=>{try{return parseInt(localStorage.getItem("ciq_o_uses")||"0");}catch{return 0;}});
  const [aiUses,setAiUses]=useState(()=>{try{return parseInt(localStorage.getItem("ciq_ai_uses")||"0");}catch{return 0;}});
  const [dismissedAds,setDismissedAds]=useState(()=>{try{const s=localStorage.getItem("ciq_dis_ads");return s?JSON.parse(s):[];}catch{return [];}});
  const [scanMode,setScanMode]=useState("upload");
  const [pasteText,setPasteText]=useState("");
  const [pdfUrl,setPdfUrl]=useState("");
  const [pasteResult,setPasteResult]=useState(null);
  const [pasteLoading,setPasteLoading]=useState(false);
  const fileRef=useRef(null);
  const imgRef=useRef(null);
  const expRef=useRef(null);
  const docRef=useRef(null);
  // AI chat
  const [chat,setChat]=useState([{r:"a",t:"👋 Welcome to ContractorIQ! Upload your first settlement or explore demo mode. Ask me anything about your trucking business."}]);
  const [chatIn,setChatIn]=useState("");
  const [chatLoad,setChatLoad]=useState(false);
  // AI tools
  const [aiMode,setAiMode]=useState("chat"); // chat | report | bizplan | funding
  const [aiOut,setAiOut]=useState("");
  const [aiLoad,setAiLoad]=useState(false);
  // Growth
  const [manForm,setManForm]=useState({week:"",from:"",to:"",gross:"",net:"",deductions:"",moves:""});
  const [addedW,setAddedW]=useState(()=>{
    try{const s=localStorage.getItem("ciq_addedWeeks");return s?JSON.parse(s):[];}catch{return [];}
  });
  const [addMsg,setAddMsg]=useState("");
  const [dlWk,setDlWk]=useState(null);
  const chatEnd=useRef(null);

  // ── DEMO / ONBOARDING ────────────────────────────────────────────────────────
  // Real owner data (W array) only available on dev/navy site
  const ownerDataAvailable=typeof window!=="undefined"&&window.location.hostname.includes("navy");

  const [demoMode,setDemoMode]=useState(()=>{
    // Owner/dev site — always default to REAL data
    if(typeof window!=="undefined"&&window.location.hostname.includes("navy"))return false;
    // Customer sites — always start in demo until they upload their own data
    try{
      const d=localStorage.getItem("ciq_demo");
      const hasWeeks=localStorage.getItem("ciq_addedWeeks");
      const added=hasWeeks?JSON.parse(hasWeeks):[];
      if(d==="false"&&added.length>0)return false; // They have their own data
      return true; // Default to demo for all customers
    }catch{return true;}
  });
  const isOwnerMode=typeof window!=="undefined"&&(window.location.hostname.includes("navy")||window.location.search.includes("owner=true"));
  const [showWelcome,setShowWelcome]=useState(()=>{
    if(isOwnerMode)return false;
    try{
      const hasDismissed=localStorage.getItem("ciq_welcome_done");
      const hasAddedWeeks=localStorage.getItem("ciq_addedWeeks");
      const addedParsed=hasAddedWeeks?JSON.parse(hasAddedWeeks):[];
      // Only skip welcome if they explicitly dismissed AND have their own data
      if(hasDismissed==="true"&&addedParsed.length>0)return false;
      // If they subscribed (isPro) and dismissed, skip too
      if(hasDismissed==="true"&&localStorage.getItem("ciq_pro")==="true")return false;
      return true;
    }catch{return true;}
  });
  const [deviceFp]=useState(()=>getDeviceFingerprint());

  // ── Persistence ───────────────────────────────────────────────────────────
  useEffect(()=>{const h=()=>setWide(window.innerWidth>700);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:"smooth"});},[chat]);
  useEffect(()=>{try{localStorage.setItem("ciq_addedWeeks",JSON.stringify(addedW));}catch(e){console.warn("Storage unavailable",e);}},[addedW]);
  useEffect(()=>{try{localStorage.setItem("ciq_profile",JSON.stringify(profile));}catch(e){};},[profile]);
  useEffect(()=>{try{localStorage.setItem("ciq_expenses",JSON.stringify(expenses));}catch(e){};},[expenses]);
  useEffect(()=>{try{localStorage.setItem("ciq_docs",JSON.stringify(docs));}catch(e){};},[docs]);
  useEffect(()=>{try{localStorage.setItem("ciq_o_uses",String(oUses));}catch(e){};},[oUses]);
  useEffect(()=>{try{localStorage.setItem("ciq_ai_uses",String(aiUses));}catch(e){};},[aiUses]);
  useEffect(()=>{try{localStorage.setItem("ciq_dis_ads",JSON.stringify(dismissedAds));}catch(e){};},[dismissedAds]);

  // ── Derived ───────────────────────────────────────────────────────────────
  // CRITICAL: Real owner data (W) only available on navy dev site
  const baseW=ownerDataAvailable?W:[];
  // In demo mode: show ONLY demo weeks — never mix in owner data
  // In real mode: show owner weeks + customer uploaded weeks
  const allW=demoMode?[...DEMO_W]:[...baseW,...addedW];
  const visibleW=allW.filter(w=>{
    const vk=detectVendor(w);
    if(activeOnlyVendor&&vk!==activeOnlyVendor)return false;
    if(hiddenVendors.includes(vk))return false;
    return true;
  });
  const safeW=visibleW.length>0?visibleW:(allW.length>0?allW:DEMO_W);

  // ── Vendor breakdown ──────────────────────────────────────────────────────
  const vendorKeys=Object.keys(VENDORS);
  const vendorStats=vendorKeys.map(vk=>{
    const vw=allW.filter(w=>detectVendor(w)===vk);
    if(!vw.length)return null;
    const vGross=vw.reduce((s,w)=>s+w.gross,0);
    const vNet=vw.reduce((s,w)=>s+w.net,0);
    const vDed=vw.reduce((s,w)=>s+w.totalDeductions,0);
    return{...VENDORS[vk],key:vk,weeks:vw.length,gross:vGross,net:vNet,ded:vDed,margin:vGross>0?(vNet/vGross*100).toFixed(1):"0.0"};
  }).filter(Boolean);
  const allMoves=allW.flatMap(w=>pairRoundTrips(mergeExtraPay(w.moves||[])).map(m=>({type:m.t||m.type,from:m.fr||m.from,to:m.to,miles:m.mi||m.miles||0,rate:m.rt||m.rate||0,fsc:m.fc||m.fsc||0,extraPay:m.extraPay||0,isRoundTrip:m.isRoundTrip||false,emptyPay:m.emptyPay||0,loadedPay:m.loadedPay||0,emptyMi:m.emptyMi||0,loadedMi:m.loadedMi||0,wk:w.week})));
  const tGross=allW.reduce((s,w)=>s+w.gross,0);
  const tNet=allW.reduce((s,w)=>s+w.net,0);
  const tDed=allW.reduce((s,w)=>s+w.totalDeductions,0);
  const tMi=allMoves.reduce((s,m)=>s+m.miles,0);
  const avgRPM=tMi>0?(allMoves.reduce((s,m)=>s+m.rate+m.fsc,0)/tMi).toFixed(2):"0.00";
  const ldPct=allMoves.length>0?Math.round(allMoves.filter(m=>m.type==="L").length/allMoves.length*100):0;
  const margin=(tNet/tGross*100).toFixed(1);
  const latest=allW[allW.length-1];
  const avgM=allW.reduce((s,w)=>s+w.net/w.gross*100,0)/allW.length;
  const wg=w=>{const m=w.net/w.gross*100;return m>=avgM*1.2?{l:"HIGH",c:C.green,i:"🔥"}:m>=avgM*0.8?{l:"NORMAL",c:C.accent,i:"✅"}:{l:"LOW",c:C.red,i:"⚠️"};};
  const tEscReg=allW.reduce((s,w)=>s+((w.deds||[]).find(d=>d.l==="Escrow Regular")?.a||0),0);
  const tEsc290=allW.reduce((s,w)=>s+((w.deds||[]).find(d=>d.l==="2290 Escrow")?.a||0),0);
  const tRebates=allW.reduce((s,w)=>s+(w.rebate||0),0);
  const dw=allW[sD]||allW[allW.length-1]; const dg=wg(dw);
  const dwDeds=dw.deds||[];
  const dwGroups=grpDeds(dwDeds,dw.gross);
  const dwGroupTotal=dwGroups.reduce((s,g)=>s+g.amt,0);
  const mwBase=allW[sM]||allW[allW.length-1];
  const mwMoves=pairRoundTrips(mergeExtraPay([...(mwBase.moves||[]),...(sM===allW.length-1?extra:[])])).map(m=>({type:m.t||m.type,from:m.fr||m.from,to:m.to,miles:m.mi||m.miles||0,rate:m.rt||m.rate||0,fsc:m.fc||m.fsc||0,extraPay:m.extraPay||0,isRoundTrip:m.isRoundTrip||false,emptyPay:m.emptyPay||0,loadedPay:m.loadedPay||0}));
  const mwMi=mwMoves.reduce((s,m)=>s+m.miles,0);
  const mwRPM=mwMi>0?(mwMoves.reduce((s,m)=>s+m.rate+m.fsc,0)/mwMi).toFixed(2):"0.00";
  const mwLd=mwMoves.length>0?Math.round(mwMoves.filter(m=>m.type==="L").length/mwMoves.length*100):0;
  const hw=allW[sH]||allW[allW.length-1]; const hwg=wg(hw);
  const hwFuel=(hw.deds||[]).filter(d=>d.l.toLowerCase().includes("fuel")).reduce((s,d)=>s+d.a,0);
  const hwLd=(hw.moves||[]).length>0?Math.round((hw.moves||[]).filter(m=>m.t==="L"||m.type==="L").length/(hw.moves||[]).length*100):0;
  const hwM=(hw.net/hw.gross*100).toFixed(1);
  const hwER=(hw.deds||[]).find(d=>d.l==="Escrow Regular")?.a||0;
  const hwE2=(hw.deds||[]).find(d=>d.l==="2290 Escrow")?.a||0;
  const latFuel=(latest.deds||[]).filter(d=>d.l.toLowerCase().includes("fuel")).reduce((s,d)=>s+d.a,0);

  const SYS=`Expert drayage business advisor for YOUR COMPANY, CDL owner-operator, your carrier, Baltimore MD. Real settlement data: ${allW.map(function(w){return "W"+w.week+": Gross $"+w.gross+", Net $"+w.net+", Margin "+(w.net/w.gross*100).toFixed(1)+"%, "+(w.moves||[]).length+" moves";}).join(" | ")}. YTD: Gross $${tGross.toFixed(0)}, Net $${tNet.toFixed(0)}, Margin ${margin}%, Avg RPM $${avgRPM}, Loaded ${ldPct}%. Be specific, practical, use real numbers. Under 300 words.`;

  // ── PDF Scanner ───────────────────────────────────────────────────────────
  async function scanPDF(file, fileType){
    setScanning(true);setScanResult(null);setScanMsg("");
    try{
      const apiKey=typeof __ANTHROPIC_KEY__!=="undefined"&&__ANTHROPIC_KEY__?__ANTHROPIC_KEY__:(window.__CIQ_KEY__||"");
      if(!apiKey){setScanMsg("⚠️ API key not configured. Go to Vercel dashboard → Settings → Environment Variables → add ANTHROPIC_KEY");setScanning(false);return;}
      const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
      const isImage=fileType==="image"||file.type.startsWith("image/");
      const mediaType=isImage?(file.type||"image/jpeg"):"application/pdf";
      const contentBlock=isImage
        ?{type:"image",source:{type:"base64",media_type:mediaType,data:b64}}
        :{type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}};
      const resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:4000,messages:[{role:"user",content:[contentBlock,{type:"text",text:`This is a drayage/trucking settlement statement. Extract ALL data and return ONLY valid JSON with no other text, no markdown:\n{"week":"15","from":"04/06/2026","to":"04/12/2026","gross":0.00,"net":0.00,"totalDeductions":0.00,"rebate":0.00,"moves":[{"t":"L","fr":"BALTIMMD","to":"WILLIAMD","mi":77,"rt":195,"fc":52.36}],"deds":[{"l":"Fuel Advance (Pilot 179)","a":500.00}]}`}]}]})});
      if(!resp.ok){
        const errText=await resp.text();
        if(resp.status===401)setScanMsg("⚠️ API key invalid or expired. Check Vercel Environment Variables.");
        else if(resp.status===400)setScanMsg("⚠️ PDF format not supported. Try the Paste Text method instead.");
        else setScanMsg(`⚠️ API Error ${resp.status}. Try Paste Text method instead.`);
        setScanning(false);return;
      }
      const d=await resp.json();
      if(d.error){setScanMsg("⚠️ AI Error: "+d.error.message+". Try Paste Text instead.");setScanning(false);return;}
      const txt=d.content?.map(b=>b.text||"").join("").trim();
      const jsonStart=txt.indexOf("{");
      const jsonEnd=txt.lastIndexOf("}")+1;
      if(jsonStart===-1){setScanMsg("⚠️ AI could not extract data from this file. Try the Paste Text method — copy text from PDF and paste it.");setScanning(false);return;}
      let jsonStr=txt.slice(jsonStart,jsonEnd);
      // Fix truncated JSON — if moves array is cut off, close it gracefully
      try{JSON.parse(jsonStr);}catch(truncErr){
        // Try to close open arrays/objects
        let depth=0;for(const c of jsonStr){if(c==="{"||c==="[")depth++;else if(c==="}"||c==="]")depth--;}
        if(depth>0)jsonStr+="]".repeat(Math.max(0,jsonStr.split("[").length-jsonStr.split("]").length))+"}".repeat(Math.max(0,jsonStr.split("{").length-jsonStr.split("}").length));
      }
      const parsed=JSON.parse(jsonStr);
      parsed.label=`Week ${String(parsed.week).padStart(2,"0")}`;
      parsed.week=String(parsed.week).padStart(2,"0");
      setScanResult(parsed);
      setScanMsg(`✅ Week ${parsed.week} read — Gross $${Number(parsed.gross).toFixed(2)}, Net $${Number(parsed.net).toFixed(2)}, ${parsed.moves?.length||0} moves found`);
    }catch(e){
      setScanMsg("⚠️ Error: "+e.message+". Try the Paste Text tab instead — copy all text from your PDF and paste it.");
    }
    setScanning(false);
  }

  async function runSearch(q){
    const query=q||searchQ;
    if(!query||!query.trim())return;
    setSearchLoading(true);setSearchResult("");
    try{
      const apiKey=import.meta.env.VITE_ANTHROPIC_KEY||(window.__CIQ_KEY__||"");

      // Get real GPS location first
      let locationContext="";
      try{
        const pos=await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{timeout:4000,maximumAge:60000}));
        const lat=pos.coords.latitude.toFixed(4);
        const lng=pos.coords.longitude.toFixed(4);
        locationContext=`The user's current GPS location is latitude ${lat}, longitude ${lng}. Use this EXACT location for any nearby searches - do NOT use Baltimore or any default city.`;
      }catch(geoErr){
        locationContext="Location access denied. Ask the user to share their city if they need local results.";
      }

      const resp=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({
          model:"claude-sonnet-4-5",
          max_tokens:600,
          tools:[{type:"web_search_20250305",name:"web_search"}],
          messages:[{role:"user",content:`You are a helpful assistant for a truck driver or gig worker. ${locationContext} Answer this question concisely and practically: ${query}. Keep answer under 200 words. Use bullet points for lists. Include specific names and addresses when searching for nearby places.`}]
        })
      });
      const d=await resp.json();
      const txt=d.content?.filter(b=>b.type==="text").map(b=>b.text||"").join("").trim();
      setSearchResult(txt||"No results found. Try rephrasing your search.");
    }catch(e){
      setSearchResult("⚠️ Search unavailable. Check your connection and try again.");
    }
    setSearchLoading(false);
  }

  function confirmScan(){
    if(!scanResult)return;
    if(allW.find(w=>w.week===scanResult.week)){setScanMsg("⚠️ Week "+scanResult.week+" already exists.");return;}
    setAddedW(p=>[...p,{...scanResult,vendor:detectVendor(scanResult),moves:scanResult.moves||[],deds:scanResult.deds||[]}]);
    setScanMsg(`✅ Week ${scanResult.week} added to your data!`);setScanResult(null);
  }

  async function parsePasteText(){
    if(!pasteText.trim())return;
    setPasteLoading(true);setPasteResult(null);setScanMsg("");
    const prompt=`You are a data extraction expert for drayage/trucking settlement statements. This could be from any carrier. Extract ALL data and return ONLY valid JSON — no explanation, no markdown, just the JSON object.

Required JSON format:
{"week":"01","from":"01/06/2025","to":"01/10/2025","gross":4200.00,"net":2310.00,"totalDeductions":1890.00,"rebate":45.00,"moves":[{"t":"L","fr":"Port Terminal","to":"Distribution Center","mi":65,"rt":220,"fc":46}],"deds":[{"l":"Operations Fee","a":840.00},{"l":"Fuel Advance","a":750.00}]}

Extraction rules:
- week: find the week number. Look for "Week No:", settlement date, or period covered. For STG statements use the week number from settlement date (e.g. 2/11/2026 = week 06 of 2026). For ContainerPort look for "Week No: 15-2026"
- from/to: date range the settlement covers (MM/DD/YYYY)
- gross: total revenue BEFORE deductions. Look for "Settlement Revenue", "Total Gross", "Unit Total before deductions", "Gross Check Amount"
- net: amount actually paid to driver. Look for "Settled To you", "Net Check Amount", "Net Amount"
- totalDeductions: total amount deducted (use positive number)
- rebate: fuel rebate if any, else 0
- moves: every single move/load. t=L(loaded) or E(empty), fr=pickup location short name, to=delivery location short name, mi=miles, rt=linehaul rate, fc=fuel surcharge
- deds: every deduction line. l=description, a=amount as positive number (ignore credits/reimbursements with negative amounts — those are money BACK to driver)

Settlement text to parse:
${pasteText.slice(0,6000)}`;

    try{
      const resp=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":(typeof __ANTHROPIC_KEY__!=="undefined"&&__ANTHROPIC_KEY__?__ANTHROPIC_KEY__:(window.__CIQ_KEY__||"")),"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:3000,messages:[{role:"user",content:prompt}]})
      });
      const d=await resp.json();
      const txt=d.content?.map(b=>b.text||"").join("").trim();
      const s=txt.indexOf("{");
      const e=txt.lastIndexOf("}")+1;
      if(s===-1)throw new Error("no json");
      const parsed=JSON.parse(txt.slice(s,e));
      // Normalize
      parsed.week=String(parsed.week||"00").padStart(2,"0");
      parsed.label=`Week ${parsed.week}`;
      parsed.gross=Number(parsed.gross)||0;
      parsed.net=Number(parsed.net)||0;
      parsed.totalDeductions=Number(parsed.totalDeductions)||0;
      parsed.rebate=Number(parsed.rebate)||0;
      parsed.moves=Array.isArray(parsed.moves)?parsed.moves:[];
      parsed.deds=Array.isArray(parsed.deds)?parsed.deds:[];
      setPasteResult(parsed);
      setScanMsg(`✅ Read Week ${parsed.week} — Gross $${parsed.gross.toFixed(2)}, Net $${parsed.net.toFixed(2)}, ${parsed.moves.length} moves, ${parsed.deds.length} deductions`);
    }catch(err){
      setScanMsg("⚠️ Could not parse. Try again or use Type Numbers tab.");
      console.error(err);
    }
    setPasteLoading(false);
  }

  async function readPdfUrl(){
    if(!pdfUrl.trim())return;
    setPasteLoading(true);setPasteResult(null);setScanMsg("");
    try{
      // Convert Google Drive share URL to direct download URL
      let url=pdfUrl.trim();
      const gdMatch=url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if(gdMatch){
        url=`https://drive.google.com/uc?export=download&id=${gdMatch[1]}`;
      }
      // Fetch the PDF as base64 via our API
      const fetchResp=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":(typeof __ANTHROPIC_KEY__!=="undefined"&&__ANTHROPIC_KEY__?__ANTHROPIC_KEY__:(window.__CIQ_KEY__||"")),"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({
          model:"claude-sonnet-4-5",
          max_tokens:3000,
          messages:[{role:"user",content:[
            {type:"document",source:{type:"url",url:url}},
            {type:"text",text:`You are a data extraction expert for drayage/trucking settlement statements from any carrier. Extract ALL data and return ONLY valid JSON — no explanation, no markdown:
{"week":"01","from":"01/06/2025","to":"01/10/2025","gross":4200.00,"net":2310.00,"totalDeductions":1890.00,"rebate":45.00,"moves":[{"t":"L","fr":"Port Terminal","to":"Distribution Center","mi":65,"rt":220,"fc":46}],"deds":[{"l":"Operations Fee","a":840.00},{"l":"Fuel Advance","a":750.00}]}
Rules: week=number only, gross=total revenue before deductions, net=amount paid to driver, moves every row (t=L/E, fr=pickup, to=delivery, mi=miles, rt=linehaul rate, fc=fuel surcharge), deds=EVERY deduction line as positive number INCLUDING escrow, insurance, ELD, parking, fuel advances — skip only items with negative amounts (those are reimbursements/credits back to driver).`}
          ]}]
        })
      });
      const d=await fetchResp.json();
      if(d.error){throw new Error(d.error.message||"API error");}
      const txt=d.content?.map(b=>b.text||"").join("").trim();
      const s=txt.indexOf("{");const e=txt.lastIndexOf("}")+1;
      if(s===-1)throw new Error("no json");
      const parsed=JSON.parse(txt.slice(s,e));
      parsed.week=String(parsed.week||"00").padStart(2,"0");
      parsed.label=`Week ${parsed.week}`;
      parsed.gross=Number(parsed.gross)||0;
      parsed.net=Number(parsed.net)||0;
      parsed.totalDeductions=Number(parsed.totalDeductions)||0;
      parsed.rebate=Number(parsed.rebate)||0;
      parsed.moves=Array.isArray(parsed.moves)?parsed.moves:[];
      parsed.deds=Array.isArray(parsed.deds)?parsed.deds:[];
      setPasteResult(parsed);
      setScanMsg(`✅ PDF Read — Week ${parsed.week}, Gross $${parsed.gross.toFixed(2)}, Net $${parsed.net.toFixed(2)}, ${parsed.moves.length} moves`);
    }catch(err){
      setScanMsg("⚠️ Could not read PDF link. Make sure it's a public/shared link. Try Paste Text instead.");
    }
    setPasteLoading(false);
  }


  async function sendChat(){
    if(!chatIn.trim()||chatLoad)return;
    if(!hasAccess&&aiUses>=FREE_AI){openUpgrade("ai");return;}
    const m={r:"u",t:chatIn};const h=[...chat,m];
    setChat(h);setChatIn("");setChatLoad(true);
    if(!hasAccess)setAiUses(function(p){return p+1;});
    try{const r=await ai(h.map(x=>({role:x.r==="a"?"assistant":"user",content:x.t})),SYS);setChat(p=>[...p,{r:"a",t:r}]);}
    catch{setChat(p=>[...p,{r:"a",t:"⚠️ Error. Try again."}]);}
    setChatLoad(false);
  }

  async function runAITool(mode){
    setAiMode(mode);setAiOut("");setAiLoad(true);
    const w=allW[sR]||allW[allW.length-1]||safeW[safeW.length-1];
    const fuel=w.deds.filter(d=>d.l.toLowerCase().includes("fuel")).reduce((s,d)=>s+d.a,0);
    let prompt="",sys="";

    if(mode==="report"){
      sys="Write professional plain-text business reports for drayage owner-operators. No markdown. Clear, numbered sections.";
      prompt=`Weekly settlement report for ${w.label} (${w.from}–${w.to}).
Gross: $${w.gross} | Net: $${w.net} | Margin: ${(w.net/w.gross*100).toFixed(1)}%
Fuel cost: $${fuel.toFixed(0)} (${(fuel/w.gross*100).toFixed(0)}% of gross)
Moves: ${w.moves.length} | YTD Gross: $${tGross.toFixed(0)} | YTD Net: $${tNet.toFixed(0)}
Write: 1) Week Summary 2) Top Profit Leak 3) Action Item 4) Outlook. Under 200 words. Plain text only.`;
    }

    if(mode==="bizplan"){
      sys="You write professional business plans for small trucking companies seeking bank financing. Use clear sections, specific numbers, professional tone. Plain text, no markdown symbols.";
      prompt=`Write a complete business plan for YOUR COMPANY seeking a small business loan to expand from 1 to 2 trucks.

Real financial data:
- YTD Gross Revenue: $${tGross.toFixed(2)} over ${allW.length} weeks
- YTD Net Income: $${tNet.toFixed(2)}
- Net Margin: ${margin}%
- Average Weekly Gross: $${(tGross/allW.length).toFixed(2)}
- Average Weekly Net: $${(tNet/allW.length).toFixed(2)}
- Best Week: $${Math.max(...allW.map(w=>w.net)).toFixed(2)} net
- Equipment: 1 truck, unit UNIT#
- Contract: Your Carrier, Baltimore MD
- Owner: Owner Name, CDL operator

Write a professional business plan with these sections:
1. Executive Summary
2. Business Description
3. Financial Performance (use the real numbers above)
4. Loan Request & Use of Funds
5. Repayment Projections
6. Growth Strategy

This plan will be presented to a bank or SBA lender. Make it professional, credible, and compelling. Use real numbers throughout. About 400-500 words.`;
    }

    if(mode==="funding"){
      sys="You are a small business funding advisor specializing in trucking and transportation companies. Provide specific, actionable guidance with real institution names, programs, and contact information.";
      prompt=`I am Owner Name, owner of YOUR COMPANY, a CDL drayage owner-operator working with my carrier.

Financial snapshot:
- YTD Gross: $${tGross.toFixed(2)} in ${allW.length} weeks
- Net margin: ${margin}%
- Weekly average net: $${(tNet/allW.length).toFixed(2)}
- 1 truck, looking to add a second

I need advice on where to get funding to grow my business. Please provide:
1. Top 3 specific lenders or programs for trucking owner-operators (with names, websites, phone numbers where possible)
2. SBA loan programs that apply to my situation
3. Trucking-specific financing options (equipment loans, lease-to-own)
4. CDFI and minority business lenders in Maryland
5. What documents I need to apply
6. Realistic loan amounts I could qualify for based on my income
7. One specific next step I should take this week

Be specific with real institution names and programs, not generic advice.`;
    }

    try{const r=await ai([{role:"user",content:prompt}],sys);setAiOut(r);}
    catch{setAiOut("⚠️ Error. Try again.");}
    setAiLoad(false);
  }

  // ── Manual add week ───────────────────────────────────────────────────────
  function addWeek(){
    const {week,from,to,gross,net,deductions,moves}=manForm;
    if(!week||!gross||!net)return;
    const wn=week.padStart(2,"0");
    if(allW.find(w=>w.week===wn)){setAddMsg("⚠️ Week "+wn+" already exists.");setTimeout(()=>setAddMsg(""),3000);return;}
    setAddedW(p=>[...p,{vendor:vendorPick,week:wn,label:`Week ${wn}`,from:from||"",to:to||"",gross:parseFloat(gross)||0,net:parseFloat(net)||0,totalDeductions:parseFloat(deductions)||0,rebate:0,moves:Array.from({length:parseInt(moves)||0},()=>({t:"L",fr:"?",to:"?",mi:0,rt:0,fc:0})),deds:[]}]);
    setAddMsg(`✅ Week ${wn} added!`);
    setManForm({week:"",from:"",to:"",gross:"",net:"",deductions:"",moves:""});
    setTimeout(()=>setAddMsg(""),4000);
  }

  async function readReceipt(file){
    setExpScan(true);setExpScanMsg("Reading receipt...");
    try{
      const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
      const isImg=file.type.startsWith("image/");
      const block=isImg?{type:"image",source:{type:"base64",media_type:file.type||"image/jpeg",data:b64}}:{type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}};
      const resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":(typeof __ANTHROPIC_KEY__!=="undefined"&&__ANTHROPIC_KEY__?__ANTHROPIC_KEY__:(window.__CIQ_KEY__||"")),"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:400,messages:[{role:"user",content:[block,{type:"text",text:'Read this receipt. Return ONLY valid JSON: {"date":"MM/DD/YYYY","vendor":"store name","amount":0.00,"category":"Parts|Labor|Tires|Maintenance|Fuel|Permits|Other","desc":"what was purchased"}'}]}]})});
      const d=await resp.json();
      const raw=d.content?.map(b=>b.text||"").join("")||"{}";
      const parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());
      setExpForm(p=>({...p,date:parsed.date||p.date,category:parsed.category||"Parts",desc:parsed.desc||"",amount:parsed.amount?.toString()||"",note:"From: "+(parsed.vendor||"")}));
      setExpScanMsg("Receipt read — review and save");
    }catch(e){setExpScanMsg("Could not read — enter manually");}
    setExpScan(false);
  }

  async function readDoc(file){
    setDocScan(true);setDocScanMsg("Reading...");
    try{
      var b64=await new Promise(function(res,rej){var r=new FileReader();r.onload=function(){res(r.result.split(",")[1]);};r.onerror=rej;r.readAsDataURL(file);});
      var isImg=file.type.startsWith("image/");
      var block=isImg?{type:"image",source:{type:"base64",media_type:file.type||"image/jpeg",data:b64}}:{type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}};
      var resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":(typeof __ANTHROPIC_KEY__!=="undefined"&&__ANTHROPIC_KEY__?__ANTHROPIC_KEY__:(window.__CIQ_KEY__||"")),"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:300,messages:[{role:"user",content:[block,{type:"text",text:'Read this. Return ONLY JSON: {"date":"MM/DD/YYYY","title":"document title","category":"Maintenance|Inspection|Insurance|Registration|Medical|Permit|Other","note":"brief summary"}'}]}]})});
      var d=await resp.json();
      var parsed=JSON.parse((d.content?d.content.map(function(b){return b.text||"";}).join(""):"{}").replace(/```json|```/g,"").trim());
      setDocForm(function(p){return {...p,date:parsed.date||p.date,title:parsed.title||"",category:parsed.category||"Maintenance",note:parsed.note||""};});
      setDocScanMsg("Read — review and save");
    }catch(e){setDocScanMsg("Could not read — enter manually");}
    setDocScan(false);
  }

  function printReport(){
    var name=profile.name||"YOUR COMPANY";
    var unit=profile.unit||"UNIT#";
    var expRows=expenses.map(function(e){
      var wk=e.weekRef?("W"+e.weekRef):"None";
      return "<tr><td>"+e.date+"</td><td>"+e.category+"</td><td>"+e.desc+"</td><td>-$"+parseFloat(e.amount||0).toFixed(2)+"</td><td>"+wk+"</td></tr>";
    }).join("");
    var docRows=docs.map(function(d){
      return "<tr><td>"+d.date+"</td><td>"+d.category+"</td><td>"+d.title+"</td><td>"+d.note+"</td></tr>";
    }).join("");
    var expSec=expRows?"<h2>Extra Expenses</h2><table><thead><tr><th>Date</th><th>Cat</th><th>Desc</th><th>Amt</th><th>Wk</th></tr></thead><tbody>"+expRows+"</tbody></table>":"";
    var docSec=docRows?"<h2>Documents on File</h2><table><thead><tr><th>Date</th><th>Type</th><th>Title</th><th>Notes</th></tr></thead><tbody>"+docRows+"</tbody></table>":"";
    var html="<!DOCTYPE html><html><head><meta charset=\"UTF-8\"/><title>Report</title>"
      +"<style>body{font-family:Arial,sans-serif;padding:28px;font-size:13px;color:#111}"
      +"h1{font-size:20px;font-weight:800;margin-bottom:4px}"
      +"h2{font-size:12px;font-weight:700;margin:20px 0 8px;text-transform:uppercase;border-bottom:2px solid #000;padding-bottom:4px}"
      +".meta{font-size:11px;color:#666;margin-bottom:18px}"
      +".grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px}"
      +".kpi{border:1px solid #ddd;border-radius:6px;padding:10px;text-align:center}"
      +".kv{font-size:16px;font-weight:800}.kl{font-size:9px;color:#888;text-transform:uppercase;margin-top:2px}"
      +"table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12px}"
      +"th{text-align:left;padding:6px 8px;background:#f5f5f5;font-size:10px;text-transform:uppercase;border-bottom:2px solid #ddd}"
      +"td{padding:6px 8px;border-bottom:1px solid #eee}"
      +".footer{font-size:10px;color:#888;text-align:center;margin-top:20px;padding-top:12px;border-top:1px solid #ddd}"
      +"</style></head><body>"
      +"<h1>ContractorIQ Report</h1><div class=\"meta\">"+name+" - "+unit+" - "+new Date().toLocaleDateString()+"</div>"
      +"<div class=\"grid\">"
      +"<div class=\"kpi\"><div class=\"kv\">$"+tGross.toLocaleString("en-US",{minimumFractionDigits:2})+"</div><div class=\"kl\">YTD Gross</div></div>"
      +"<div class=\"kpi\"><div class=\"kv\">$"+tNet.toLocaleString("en-US",{minimumFractionDigits:2})+"</div><div class=\"kl\">YTD Net</div></div>"
      +"<div class=\"kpi\"><div class=\"kv\">"+margin+"%</div><div class=\"kl\">Margin</div></div>"
      +"<div class=\"kpi\"><div class=\"kv\">"+allW.length+"</div><div class=\"kl\">Weeks</div></div>"
      +"</div>"
      +expSec+docSec
      +"<div class=\"footer\">ContractorIQ - "+name+" - "+unit+"</div>"
      +"</body></html>";
    var w=window.open("","_blank");
    if(w){w.document.write(html);w.document.close();w.focus();setTimeout(function(){w.print();},500);}
  }

  function emailReport(){
    var name=profile.name||"YOUR COMPANY";
    var sub="ContractorIQ Report - "+name+" - "+new Date().toLocaleDateString();
    var body="Business Report\n\nYTD Gross: $"+tGross.toFixed(2)+"\nYTD Net: $"+tNet.toFixed(2)+"\nMargin: "+margin+"%\nWeeks: "+allW.length+"\nExpenses: "+expenses.length+"\nDocuments: "+docs.length+"\n\nGenerated by ContractorIQ";
    window.location.href="mailto:?subject="+encodeURIComponent(sub)+"&body="+encodeURIComponent(body);
  }

  function generatePDF(w){
    const groups=grpDeds(w.deds,w.gross);
    const dedRows=w.deds.filter(d=>!d.l.toLowerCase().includes("escrow")).sort((a,b)=>b.a-a.a).map(d=>`<tr><td>${d.l}</td><td style="text-align:right;color:${d.a>200?"#f87171":"#f0f6ff"}">${(d.a/w.gross*100).toFixed(1)}%</td><td style="text-align:right;font-weight:700;color:${d.a>200?"#f87171":"#f0f6ff"}">$${d.a.toFixed(2)}</td></tr>`).join("");
    const moveRows=w.moves.map((m,i)=>{const s=scoreMove({miles:m.mi,rate:m.rt,fsc:m.fc,type:m.t});return`<tr style="background:${i%2===0?"transparent":"rgba(255,255,255,0.03)"}"><td><span style="padding:2px 7px;border-radius:4px;font-size:11px;background:${m.t==="L"?"#14532d":"#431407"};color:${m.t==="L"?"#86efac":"#fcd34d"}">${m.t==="L"?"LOAD":"EMPTY"}</span></td><td>${m.fr}→${m.to}</td><td style="text-align:right">${m.mi}</td><td style="text-align:right">$${m.rt}</td><td style="text-align:right;color:${m.fc>0?"#00ffcc":"#8fa3c0"}">${m.fc>0?"$"+m.fc:"—"}</td><td style="text-align:right;font-weight:700">$${(m.rt+m.fc).toFixed(2)}</td><td style="text-align:right;color:${+s.rpm>=2.5?"#4ade80":"#f87171"};font-weight:700">$${s.rpm}</td><td style="text-align:center;color:${gc(s.grade)};font-weight:700">${s.grade}</td></tr>`}).join("");
    const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>DrayageIQ — ${w.label}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;background:#0b0f1c;color:#f0f6ff;padding:28px;font-size:13px}h1{font-family:Arial,sans-serif;font-size:20px;font-weight:800;color:#00ffcc}h2{font-size:13px;font-weight:700;color:#00ffcc;margin:22px 0 10px;text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid #2c3a52;padding-bottom:5px}.header{display:flex;justify-content:space-between;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #2c3a52}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}.kpi{background:#1a2236;border:1px solid #2c3a52;border-radius:9px;padding:12px;text-align:center}.kpi .v{font-size:18px;font-weight:800;margin:5px 0 3px}.kpi .l{font-size:9px;color:#8fa3c0;text-transform:uppercase}.groups{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px}.grp{background:#1a2236;border-radius:9px;padding:12px;text-align:center;border:1px solid #2c3a52}.grp .gv{font-size:16px;font-weight:800;margin:4px 0 2px}table{width:100%;border-collapse:collapse;font-size:12px}th{text-align:left;padding:7px 9px;color:#8fa3c0;font-weight:700;font-size:10px;text-transform:uppercase;border-bottom:1px solid #2c3a52}td{padding:8px 9px;border-bottom:1px solid rgba(44,58,82,0.5);color:#f0f6ff}.footer{margin-top:24px;padding-top:12px;border-top:1px solid #2c3a52;font-size:10px;color:#8fa3c0;text-align:center}@media print{body{background:#fff;color:#000}.kpi,.grp{background:#f5f5f5;border-color:#ccc}}</style></head><body>
<div class="header"><div><h1>🚛 DrayageIQ — Settlement Report</h1><div style="color:#8fa3c0;font-size:11px;margin-top:5px">YOUR COMPANY · UNIT# · Your Carrier</div><div style="color:#8fa3c0;font-size:11px;margin-top:2px">${w.label} · ${w.from} – ${w.to}</div></div><div style="text-align:right;font-size:11px;color:#8fa3c0"><div>Generated ${new Date().toLocaleDateString()}</div></div></div>
<div class="kpis"><div class="kpi"><div class="l">Gross</div><div class="v" style="color:#00ffcc">$${w.gross.toLocaleString("en-US",{minimumFractionDigits:2})}</div></div><div class="kpi"><div class="l">Net Pay</div><div class="v" style="color:#4ade80">$${w.net.toLocaleString("en-US",{minimumFractionDigits:2})}</div></div><div class="kpi"><div class="l">Margin</div><div class="v" style="color:#4ade80">${(w.net/w.gross*100).toFixed(1)}%</div></div><div class="kpi"><div class="l">Moves</div><div class="v" style="color:#a78bfa">${w.moves.length}</div></div></div>
<h2>Cost Groups</h2><div class="groups">${groups.map(function(g){return '<div class="grp" style="border-color:'+g.color+'44"><div style="font-size:20px">'+g.icon+'</div><div class="gv" style="color:'+g.color+'">$'+g.amt.toFixed(0)+'</div><div style="font-size:9px;color:#8fa3c0">'+g.label+'</div><div style="font-size:10px;color:'+g.color+';margin-top:3px">'+g.pct+'% of gross</div></div>';}).join("")}</div>
<h2>Deduction Breakdown</h2><table><thead><tr><th>Item</th><th style="text-align:right">% Gross</th><th style="text-align:right">Amount</th></tr></thead><tbody>${dedRows}</tbody><tfoot><tr style="border-top:2px solid #2c3a52"><td style="font-weight:700">Total Deductions</td><td style="text-align:right;color:#f87171;font-weight:700">${(w.totalDeductions/w.gross*100).toFixed(1)}%</td><td style="text-align:right;font-weight:800;font-size:14px;color:#f87171">$${w.totalDeductions.toFixed(2)}</td></tr></tfoot></table>
<h2>Move Performance</h2><table><thead><tr><th>Type</th><th>Route</th><th style="text-align:right">Mi</th><th style="text-align:right">Rate</th><th style="text-align:right">FSC</th><th style="text-align:right">Total</th><th style="text-align:right">RPM</th><th style="text-align:center">Grade</th></tr></thead><tbody>${moveRows}</tbody></table>
<div class="footer">DrayageIQ · YOUR COMPANY · ${w.label} · ${new Date().toLocaleString()}</div></body></html>`;
    const blob=new Blob([html],{type:"text/html"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=`DrayageIQ-Week${w.week}-2026.html`;
    document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
  }

  const HELP={
    trend:{t:"Net Pay by Week",b:"Each bar shows what you took home in a given week. Taller bar means a stronger week. Different colors represent different carriers. Tap any bar to pull up full details for that week across all sections."},
    deductions:{t:"Where Your Money Goes",b:"Every deduction taken from your gross before you get paid, grouped into three categories. Use the arrows to compare different weeks and spot patterns over time."},
    health:{t:"Performance by Carrier",b:"A quick view of how strong your numbers are for each carrier. Colors give you an instant signal — green is strong, gold is worth watching, red needs attention."},
    grades:{t:"Weekly Performance Grades",b:"Each week is evaluated against your own history — not an outside benchmark. A strong grade means you performed well compared to your own normal. Look for your best weeks and understand what made them different."},
    savings:{t:"Funds Being Held",b:"Some deductions are not permanent costs — they are funds held for future use. These amounts are typically returned to you or applied toward known future expenses. Track these so you always know what is being set aside."},
    movePerf:{t:"Route Performance",b:"Every route you ran is listed here with a performance rating. Use this when evaluating new offers — knowing your history makes it easier to make good decisions quickly."},
    offerScorer:{t:"Offer Evaluator",b:"Before accepting a load, enter the key details here to get an instant read on whether it makes sense for your business. The result is based on your real numbers. Use this every time a broker calls — it takes seconds."},
    fullHistory:{t:"Complete Route Log",b:"Every route from every week in one place, sorted from most recent. Column headers stay visible as you scroll so you never lose track of what you are looking at."},
    expenses:{t:"Extra Expenses",b:"Track costs that do not show up on your settlement — parts, repairs, tires, labor, or anything you pay out of pocket. These are real costs that affect what you actually keep. Your settlement data is never changed."},
    vendorCards:{t:"Your Carriers",b:"Each card shows a summary for one company you haul for. Use this to understand which relationships are working best for your business and compare performance across carriers."},
    kpis:{t:"Business Snapshot",b:"Your running totals across every week shown. Gross is total billed before deductions. Net is what actually deposited. Check these weekly to stay on top of your financial health."},
    aiChat:{t:"AI Business Advisor",b:"Your private advisor that knows your actual numbers. Ask it anything about your business. The more data you add over time, the more useful and accurate its guidance becomes."},
    addSettlement:{t:"Add Settlement Week",b:"Upload your weekly settlement here so the app can track your earnings over time. Paste the text from your PDF, or share a Google Drive link. The app reads every move, every deduction, and stores the week automatically."},
    dashboard:{t:"Business Dashboard",b:"Your financial command center. Every number comes directly from your settlement statements. Compare carriers on the vendor cards, spot your best weeks on the trend chart, and see where deductions come from."},
    actionPlan:{t:"Weekly Action Plan",b:"Three specific actions generated from your real data this week. These are not generic tips — they come from your actual settlement numbers, deductions, and performance history. New actions are generated each time your data changes."},
    benchmarks:{t:"Industry Benchmarks",b:"Compares your real numbers against published national averages for drayage and owner-operator trucking. These benchmarks come from ZipRecruiter, Indeed, ATRI, and Salary.com data through 2025. Your margin percentage is the strongest indicator of efficiency — it reflects how much of every gross dollar you actually keep after carrier deductions."},
    topBottom:{t:"Top & Bottom Moves",b:"Focus mode shortcut — shows your 3 highest-earning and 3 lowest-earning routes at a glance. Use this to quickly identify your best routes and which ones to avoid or renegotiate."},
  };
  // ── PRO / TRIAL ──────────────────────────────────────────────────────────
  const trialDaysLeft=trialStart?Math.max(0,5-Math.floor((Date.now()-trialStart)/(1000*60*60*24))):0;
  const hasAccess=isPro||(trialStart&&trialDaysLeft>0);
  const FREE_AI=3; const FREE_OS=5;
  const aiLocked=!hasAccess&&aiUses>=FREE_AI;
  const osLocked=!hasAccess&&oUses>=FREE_OS;

  const openUpgrade=(src)=>{setUpgradeSrc(src);setShowUpgrade(true);};

  // Simulated activate (real app connects to Stripe)
  const activateTrial=()=>{
    const now=Date.now();
    setTrialStart(now);
    try{
      localStorage.setItem("ciq_trial_start",String(now));
      localStorage.setItem("ciq_device_fp",deviceFp);
    }catch(e){}
    setShowUpgrade(false);
  };
  const activatePro=()=>{
    setIsPro(true);
    try{
      localStorage.setItem("ciq_pro","true");
      localStorage.setItem("ciq_device_fp",deviceFp);
    }catch(e){}
    setShowUpgrade(false);
  };
  // Check if access is being used on a different device (sharing detection)
  const storedFp=()=>{try{return localStorage.getItem("ciq_device_fp");}catch{return null;}};
  const deviceMismatch=(isPro||trialStart)&&storedFp()&&storedFp()!==deviceFp;

  const upgradeModal=()=>{
    if(!showUpgrade)return null;
    return(
      <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div style={{background:C.card,borderRadius:20,padding:"28px 22px",maxWidth:360,width:"100%",border:"1px solid "+C.border,boxShadow:"0 24px 60px rgba(0,0,0,0.6)"}}>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:36,marginBottom:8}}>🚛</div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:800,color:C.text,marginBottom:6}}>Unlock ContractorIQ</div>
            <div style={{fontSize:12,color:C.sub,lineHeight:1.6}}>
              {upgradeSrc==="ai"?"You've used your "+FREE_AI+" free AI messages.":upgradeSrc==="scorer"?"You've used your "+FREE_OS+" free offer scores.":"Upgrade to access the full decision engine."}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
            <button onClick={()=>window.open("https://buy.stripe.com/aFa8wP7FLbMY4Ua0Ls9MY00","_blank")} style={{padding:"16px",borderRadius:12,background:"linear-gradient(135deg,"+C.gold+",#f59e0b)",color:"#000",fontWeight:800,fontSize:14,border:"none",cursor:"pointer",fontFamily:"inherit"}}>
              <div>🔥 Start 5-Day Test Drive</div>
              <div style={{fontSize:11,fontWeight:400,marginTop:3}}>Just $1 — full access, cancel anytime</div>
            </button>
            <button onClick={()=>window.open("https://buy.stripe.com/fZufZh2lr2co3Q6am29MY01","_blank")} style={{padding:"16px",borderRadius:12,background:"linear-gradient(135deg,"+C.accent+","+C.a3+")",color:"#000",fontWeight:800,fontSize:14,border:"none",cursor:"pointer",fontFamily:"inherit"}}>
              <div>⚡ Go Pro — $19.99/month</div>
              <div style={{fontSize:11,fontWeight:400,marginTop:3}}>Unlimited everything · No ads · Cancel anytime</div>
            </button>
            <button onClick={()=>window.open("https://buy.stripe.com/3cIcN5f8d5oAeuKeCi9MY02","_blank")} style={{padding:"14px",borderRadius:12,background:C.raised,border:"1px solid "+C.gold+"55",color:C.gold,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
              <div>💎 Founding Member — $97 one-time</div>
              <div style={{fontSize:10,fontWeight:400,color:C.sub,marginTop:2}}>Everything forever · First 50 spots only · No monthly fee</div>
            </button>
          </div>
          <div style={{padding:"10px 12px",background:C.bg,borderRadius:9,fontSize:10,color:C.sub,lineHeight:1.7,marginBottom:14}}>
            💡 One avoided bad load = $300–$800 saved. The app pays for itself the first time you use the Offer Scorer.
          </div>
          <button onClick={()=>setShowUpgrade(false)} style={{width:"100%",padding:"10px",borderRadius:9,background:"transparent",border:"1px solid "+C.border,color:C.sub,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>
            Maybe later
          </button>
          {!hasAccess&&<div style={{textAlign:"center",fontSize:9,color:C.sub,marginTop:8}}>Demo mode · {FREE_AI-aiUses} AI messages · {FREE_OS-oUses} offer scores remaining</div>}
        </div>
      </div>
    );
  };

  const helpBtn=(id)=>(
    <button onClick={e=>{e.stopPropagation();setHelpCard(helpCard===id?null:id);}} style={{width:17,height:17,borderRadius:"50%",background:C.raised,border:"1px solid "+C.border,color:C.sub,fontSize:9,cursor:"pointer",fontFamily:"inherit",flexShrink:0,display:"inline-flex",alignItems:"center",justifyContent:"center",fontWeight:700,marginLeft:5}}>?</button>
  );

  const NoBadge=()=>(
    <div style={{marginTop:12,padding:"10px 14px",background:C.gold+"10",borderRadius:12,border:"1px solid "+C.gold+"30",display:"flex",alignItems:"center",gap:8,boxShadow:"0 1px 6px rgba(0,0,0,0.1)"}}>
      <span style={{fontSize:13,flexShrink:0,marginTop:1}}>💰</span>
      <div style={{fontSize:9,lineHeight:1.6}}>
        <span style={{fontWeight:800,color:C.gold}}>WE DON'T COMPETE WITH DAT OR TRUCKLOGICS. </span>
        <span style={{color:C.sub}}>We Show You Where You're Losing Money and Help You Fix It With AI Technology.</span>
      </div>
    </div>
  );
  const helpModal=(id)=>{
    if(helpCard!==id)return null;
    const h=HELP[id];
    if(!h)return null;
    return(
      <div style={{margin:"6px 0 10px",padding:"11px 13px",background:C.a3+"12",borderRadius:9,border:"1px solid "+C.a3+"33",fontSize:12,color:C.sub,lineHeight:1.7,position:"relative"}}>
        <div style={{fontWeight:700,color:C.a3,marginBottom:4,fontSize:12}}>{h.t}</div>
        <div>{h.b}</div>
        <button onClick={()=>setHelpCard(null)} style={{position:"absolute",top:7,right:9,background:"none",border:"none",color:C.sub,fontSize:14,cursor:"pointer",lineHeight:1}}>×</button>
      </div>
    );
  };
  const TB=({t,l})=><button onClick={()=>setTab(t)} style={{flex:"0 0 auto",padding:"0 14px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:10,letterSpacing:"0.04em",textTransform:"uppercase",border:"none",background:tab===t?C.accent:C.raised,color:tab===t?"#000":C.sub,transition:"all 0.2s",whiteSpace:"nowrap",height:38,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:tab===t?"0 2px 8px rgba(0,0,0,0.2)":"none"}}>{l}</button>;

  return(
    <div style={{fontFamily:"'IBM Plex Mono',monospace",background:C.bg,minHeight:"100vh",color:C.text}}>
      {upgradeModal()}
      {/* ── WELCOME SCREEN ── */}
      {/* ── INSURANCE / PROTECT YOUR INCOME MODAL ── */}
      {showInsurance&&(
        <div style={{position:"fixed",inset:0,zIndex:9999,background:"#080c16",display:"flex",flexDirection:"column"}}>
          {/* Close header */}
          <div style={{background:"#0d1525",borderBottom:"1px solid #2c3a52",padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:800,color:"#f0f6ff"}}>🛡️ Protect Your Income</div>
            <button onClick={()=>setShowInsurance(false)} style={{padding:"8px 14px",borderRadius:9,background:"#1a2436",border:"1px solid #2c3a52",color:"#8fa3c0",fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>✕ Close</button>
          </div>
          <div style={{background:"#080c16",flex:1,overflowY:"auto",padding:"20px 20px 80px",width:"100%"}}>

            {/* Header */}
            <div style={{textAlign:"center",marginBottom:18}}>
              <div style={{width:68,height:68,borderRadius:"50%",background:"linear-gradient(135deg,#a78bfa,#6d28d9)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:34,boxShadow:"0 0 0 6px #a78bfa20"}}>🛡️</div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:21,fontWeight:800,color:C.text,marginBottom:6}}>Protect Your Income</div>
              <div style={{fontSize:12,color:C.sub,lineHeight:1.7}}>You work hard for every dollar. But what happens to your family if you can't work? As a 1099 worker you have <strong style={{color:C.red}}>zero employer protection.</strong> That changes today.</div>
            </div>

            {/* Emotional hook with real numbers */}
            <div style={{background:`linear-gradient(135deg,${C.a3}18,${C.accent}10)`,borderRadius:12,padding:"14px",marginBottom:16,border:`1px solid ${C.a3}44`}}>
              <div style={{fontSize:11,fontWeight:800,color:C.a3,marginBottom:6}}>💡 YOUR NUMBERS TELL THE STORY</div>
              <div style={{fontSize:11,color:C.text,lineHeight:1.8}}>
                You earned <strong style={{color:C.accent}}>${tNet>0?tNet.toLocaleString("en-US",{minimumFractionDigits:2}):"--"}</strong> net this year working as an independent contractor. <strong>No employer. No benefits. No safety net.</strong> One accident, one illness, one bad week — and it all stops. <span style={{color:C.gold,fontWeight:700}}>Life insurance changes that.</span>
              </div>
            </div>

            {/* Why gig workers are the perfect market */}
            <div style={{background:C.bg,borderRadius:12,padding:"13px",marginBottom:14,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,fontWeight:800,color:C.gold,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>⚡ Why Every 1099 Worker Needs This</div>
              {[
                {i:"🚫",t:"No employer benefits",d:"No group life, no disability, no 401k. You are 100% on your own."},
                {i:"💸",t:"Income instability",d:"Gig income fluctuates. Life insurance locks in protection when you're earning."},
                {i:"🏦",t:"Tax advantages",d:"Certain products like IUL build tax-free wealth — perfect for self-employed."},
                {i:"🤝",t:"Warm, trusted relationship",d:"You already use ContractorIQ. This is the same person looking out for you."},
              ].map(r=>(
                <div key={r.t} style={{display:"flex",gap:10,marginBottom:10}}>
                  <span style={{fontSize:16,flexShrink:0,marginTop:1}}>{r.i}</span>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:C.text}}>{r.t}</div>
                    <div style={{fontSize:10,color:C.sub,lineHeight:1.5,marginTop:1}}>{r.d}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Products */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:800,color:C.sub,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>📋 Products We'll Discuss On Your Free Call</div>
              {[
                {name:"Term Life",icon:"🏠",color:"#00aa88",tag:"Most Popular",desc:"Pure income replacement. If you die, your family gets paid. Simple, affordable, powerful. Replaces the income you bring home every week."},
                {name:"Disability / Accident",icon:"🦺",color:"#f59e0b",tag:"Critical for Drivers",desc:"You already pay for OCC/ACC through your carrier — but it's limited. A personal disability policy pays YOU directly if you're injured and can't drive."},
                {name:"Whole Life / IUL",icon:"📈",color:"#a78bfa",tag:"Build Wealth",desc:"Tax-free retirement savings that grows even when the market drops. No 401k? This IS your retirement plan. Especially powerful for self-employed."},
                {name:"Final Expense",icon:"💙",color:"#6d28d9",tag:"Easy to Qualify",desc:"Covers funeral costs and final bills. No medical exam needed. Protects your family from being left with debt on top of grief."},
              ].map(p=>(
                <div key={p.name} style={{background:C.bg,borderRadius:10,padding:"12px 13px",marginBottom:8,border:`1px solid ${p.color}33`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                    <span style={{fontSize:18}}>{p.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:800,color:p.color}}>{p.name}</span>
                        <span style={{fontSize:8,background:p.color+"22",color:p.color,padding:"2px 7px",borderRadius:10,fontWeight:700,border:`1px solid ${p.color}44`}}>{p.tag}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{fontSize:10,color:C.sub,lineHeight:1.65,paddingLeft:26}}>{p.desc}</div>
                </div>
              ))}
            </div>

            {/* What happens on the call */}
            <div style={{background:`${C.gold}10`,borderRadius:12,padding:"12px 14px",marginBottom:16,border:`1px solid ${C.gold}33`}}>
              <div style={{fontSize:10,fontWeight:800,color:C.gold,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.07em"}}>📞 What Happens on Your Free Call</div>
              {["We review your real income numbers together","You learn which products fit YOUR situation","No pressure. No jargon. Just real education.","Walk away knowing exactly what you need and why."].map((s,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:5}}>
                  <span style={{color:C.gold,fontWeight:800,fontSize:11,flexShrink:0}}>{i+1}.</span>
                  <span style={{fontSize:12,color:C.text,lineHeight:1.6}}>{s}</span>
                </div>
              ))}
            </div>

            {/* Agent Section */}
            <div style={{background:"linear-gradient(135deg,#1a1a3a,#0d1525)",borderRadius:16,padding:"18px 16px",marginBottom:14,border:"2px solid #a78bfa55"}}>
              <div style={{fontSize:10,fontWeight:800,color:"#a78bfa",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>🛡️ Your Trusted Agent — Ready to Help</div>

              {/* Agent Cards */}
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>

                {/* Nelle - West Coast */}
                <div style={{display:"flex",gap:12,alignItems:"flex-start",background:"#ffffff08",borderRadius:12,padding:"13px"}}>
                  <div style={{width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,#a78bfa,#6d28d9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0,border:"2px solid #a78bfa66"}}>👩🏾</div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:800,color:"#f0f6ff",marginBottom:1}}>Nelle Kigembe</div>
                    <div style={{fontSize:9,color:"#a78bfa",fontWeight:700,marginBottom:5}}>Licensed Insurance Producer</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:7}}>
                      <span style={{padding:"2px 8px",borderRadius:20,background:"#a78bfa18",border:"1px solid #a78bfa44",color:"#a78bfa",fontSize:9,fontWeight:700}}>🌊 West Coast</span>
                      <span style={{padding:"2px 8px",borderRadius:20,background:"#00aa8818",border:"1px solid #00aa8844",color:"#00aa88",fontSize:9,fontWeight:700}}>🌎 Nationwide</span>
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <a href="tel:757-395-7841" style={{padding:"5px 9px",borderRadius:7,background:"#1a2436",border:"1px solid #2c3a52",color:"#00ffcc",fontSize:9,fontWeight:700,textDecoration:"none"}}>📞 757-395-7841</a>
                      <button onClick={()=>window.open("https://calendly.com/nellekigembe/60min?utm_source=contractoriq&utm_medium=app&utm_campaign=protect_income&utm_content=west_coast","_blank")} style={{padding:"5px 9px",borderRadius:7,background:"linear-gradient(135deg,#a78bfa,#6d28d9)",border:"none",color:"#fff",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>📅 Book with Nelle</button>
                    </div>
                  </div>
                </div>

                {/* Owner - DMV */}
                <div style={{display:"flex",gap:12,alignItems:"flex-start",background:"#ffffff08",borderRadius:12,padding:"13px"}}>
                  <div style={{width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,#00ffcc,#0077aa)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0,border:"2px solid #00ffcc66"}}>👨🏾</div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:800,color:"#f0f6ff",marginBottom:1}}>Wemma Kigembe</div>
                    <div style={{fontSize:9,color:"#00ffcc",fontWeight:700,marginBottom:5}}>Licensed Insurance Producer · ContractorIQ Founder</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:7}}>
                      <span style={{padding:"2px 8px",borderRadius:20,background:"#00ffcc18",border:"1px solid #00ffcc44",color:"#00ffcc",fontSize:9,fontWeight:700}}>🏛️ DMV Area</span>
                      <span style={{padding:"2px 8px",borderRadius:20,background:"#00aa8818",border:"1px solid #00aa8844",color:"#00aa88",fontSize:9,fontWeight:700}}>🌎 Nationwide</span>
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <button onClick={()=>window.open("https://calendly.com/wkigembe-crvm/30min?utm_source=contractoriq&utm_medium=app&utm_campaign=protect_income&utm_content=dmv","_blank")} style={{padding:"5px 9px",borderRadius:7,background:"linear-gradient(135deg,#00ffcc,#0077aa)",border:"none",color:"#000",fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>📅 Book with Wemma</button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Multi-Agent Vision */}
            <div style={{background:"#0d1525",borderRadius:12,padding:"14px",marginBottom:16,border:"1px solid #1e2a3a"}}>
              <div style={{fontSize:10,fontWeight:800,color:"#4a6080",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>🗺️ Coverage Coming Nationwide</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[
                  {zone:"🌊 West Coast",status:"✅ Available",agent:"Nelle Kigembe",color:"#00aa88"},
                  {zone:"🗽 East Coast",status:"🔜 Coming Soon",agent:"Agent Needed",color:"#4a6080"},
                  {zone:"🌵 South",status:"🔜 Coming Soon",agent:"Agent Needed",color:"#4a6080"},
                  {zone:"❄️ North/Midwest",status:"🔜 Coming Soon",agent:"Agent Needed",color:"#4a6080"},
                ].map(z=>(
                  <div key={z.zone} style={{background:"#1a2436",borderRadius:9,padding:"10px",border:`1px solid ${z.color}33`}}>
                    <div style={{fontSize:12,marginBottom:3}}>{z.zone}</div>
                    <div style={{fontSize:9,fontWeight:700,color:z.color,marginBottom:2}}>{z.status}</div>
                    <div style={{fontSize:9,color:"#4a6080"}}>{z.agent}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:9,color:"#4a6080",marginTop:10,textAlign:"center",fontStyle:"italic"}}>Are you a licensed agent? Contact us to join our network.</div>
            </div>

            <button onClick={()=>setShowInsurance(false)} style={{width:"100%",padding:"11px",borderRadius:10,background:"transparent",border:`1px solid ${C.border}`,color:C.sub,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
              Maybe Later
            </button>
          </div>
        </div>
      )}

      {/* ── MARKET OVERVIEW MODAL ── FULL PAGE ── */}
      {showMarket&&(
        <div style={{position:"fixed",inset:0,zIndex:9999,background:"#080c16",display:"flex",flexDirection:"column"}}>
          {/* Top bar */}
          <div style={{background:"#0d1525",borderBottom:"1px solid #1e2a3a",padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
            <div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:800,color:"#f0f6ff"}}>📈 Market Overview</div>
              <div style={{fontSize:10,color:"#4a6080",marginTop:1}}>Live data · Tap any symbol for chart</div>
            </div>
            <button onClick={()=>setShowMarket(false)} style={{padding:"8px 14px",borderRadius:9,background:"#1a2436",border:"1px solid #2c3a52",color:"#8fa3c0",fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>✕ Close</button>
          </div>

          {/* TradingView ticker tape */}
          <div style={{background:"#0d1525",borderBottom:"1px solid #1e2a3a",flexShrink:0}}>
            <iframe scrolling="no" allowTransparency="true" frameBorder="0"
              src="https://s.tradingview.com/embed-widget/ticker-tape/?locale=en#%7B%22symbols%22%3A%5B%7B%22description%22%3A%22S%26P%20500%22%2C%22proName%22%3A%22AMEX%3ASPY%22%7D%2C%7B%22description%22%3A%22Dow%2030%22%2C%22proName%22%3A%22AMEX%3ADIA%22%7D%2C%7B%22description%22%3A%22Nasdaq%22%2C%22proName%22%3A%22NASDAQ%3AQQQ%22%7D%2C%7B%22description%22%3A%22Russell%202000%22%2C%22proName%22%3A%22AMEX%3AIWM%22%7D%2C%7B%22description%22%3A%22VIX%22%2C%22proName%22%3A%22CBOE%3AVIX%22%7D%2C%7B%22description%22%3A%22Gold%22%2C%22proName%22%3A%22TVC%3AGOLD%22%7D%2C%7B%22description%22%3A%22Crude%20Oil%22%2C%22proName%22%3A%22TVC%3AUSOIL%22%7D%2C%7B%22description%22%3A%22Bitcoin%22%2C%22proName%22%3A%22COINBASE%3ABTCUSD%22%7D%5D%2C%22showSymbolLogo%22%3Atrue%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%2C%22displayMode%22%3A%22adaptive%22%2C%22locale%22%3A%22en%22%7D"
              style={{width:"100%",height:72,display:"block"}} title="Market Ticker"/>
          </div>

          {/* Main content scrollable */}
          <div style={{flex:1,overflowY:"auto",padding:"14px 14px 80px"}}>

            {/* TradingView Market Overview Widget */}
            <div style={{borderRadius:14,overflow:"hidden",marginBottom:14,border:"1px solid #1e2a3a"}}>
              <iframe scrolling="no" allowTransparency="true" frameBorder="0"
                src="https://s.tradingview.com/embed-widget/market-overview/?locale=en#%7B%22colorTheme%22%3A%22dark%22%2C%22dateRange%22%3A%221D%22%2C%22showChart%22%3Atrue%2C%22locale%22%3A%22en%22%2C%22largeChartUrl%22%3A%22%22%2C%22isTransparent%22%3Atrue%2C%22showSymbolLogo%22%3Atrue%2C%22showFloatingTooltip%22%3Atrue%2C%22plotLineColorGrowing%22%3A%22rgba(41%2C%2098%2C%20255%2C%201)%22%2C%22plotLineColorFalling%22%3A%22rgba(41%2C%2098%2C%20255%2C%201)%22%2C%22gridLineColor%22%3A%22rgba(42%2C%2046%2C%2057%2C%200)%22%2C%22scaleFontColor%22%3A%22rgba(209%2C%20212%2C%20220%2C%201)%22%2C%22belowLineFillColorGrowing%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.12)%22%2C%22belowLineFillColorFalling%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.12)%22%2C%22belowLineFillColorGrowingBottom%22%3A%22rgba(41%2C%2098%2C%20255%2C%200)%22%2C%22belowLineFillColorFallingBottom%22%3A%22rgba(41%2C%2098%2C%20255%2C%200)%22%2C%22symbolActiveColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.12)%22%2C%22tabs%22%3A%5B%7B%22title%22%3A%22US%20Indices%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22AMEX%3ASPY%22%2C%22d%22%3A%22S%26P%20500%22%7D%2C%7B%22s%22%3A%22AMEX%3ADIA%22%2C%22d%22%3A%22Dow%2030%22%7D%2C%7B%22s%22%3A%22NASDAQ%3AQQQ%22%2C%22d%22%3A%22Nasdaq%22%7D%2C%7B%22s%22%3A%22AMEX%3AIWM%22%2C%22d%22%3A%22Russell%202000%22%7D%2C%7B%22s%22%3A%22CBOE%3AVIX%22%2C%22d%22%3A%22VIX%22%7D%5D%7D%2C%7B%22title%22%3A%22Commodities%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22TVC%3AGOLD%22%2C%22d%22%3A%22Gold%22%7D%2C%7B%22s%22%3A%22TVC%3AUSOIL%22%2C%22d%22%3A%22Crude%20Oil%22%7D%2C%7B%22s%22%3A%22TVC%3ASILVER%22%2C%22d%22%3A%22Silver%22%7D%5D%7D%2C%7B%22title%22%3A%22Crypto%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22COINBASE%3ABTCUSD%22%2C%22d%22%3A%22Bitcoin%22%7D%2C%7B%22s%22%3A%22BINANCE%3AETHUSDT%22%2C%22d%22%3A%22Ethereum%22%7D%5D%7D%5D%7D"
                style={{width:"100%",height:680,display:"block"}} title="Market Overview"/>
            </div>

            {/* Personal Favorites */}
            <div style={{background:"#0d1525",borderRadius:14,padding:"14px",marginBottom:14,border:"1px solid #1e2a3a"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,color:"#8fa3c0",textTransform:"uppercase",letterSpacing:"0.08em"}}>⭐ My Favorite Stocks</div>
                <button onClick={()=>setAddingStock(true)} style={{padding:"4px 10px",borderRadius:7,background:"#1a2436",border:"1px solid #2c3a52",color:"#00ffcc",fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>+ Add</button>
              </div>
              {addingStock&&(
                <div style={{display:"flex",gap:6,marginBottom:10}}>
                  <input value={newStock} onChange={e=>setNewStock(e.target.value.toUpperCase())}
                    onKeyDown={e=>{if(e.key==="Enter"&&newStock.trim()){const n=[...favStocks,newStock.trim()];setFavStocks(n);try{localStorage.setItem("ciq_favstocks",JSON.stringify(n));}catch(ex){}setNewStock("");setAddingStock(false);}}}
                    placeholder="Type symbol e.g. AAPL" maxLength={8}
                    style={{flex:1,padding:"8px 12px",borderRadius:8,background:"#1a2436",border:"2px solid #00ffcc",color:"#00ffcc",fontSize:12,fontFamily:"inherit",outline:"none"}}
                    autoFocus/>
                  <button onClick={()=>{if(newStock.trim()){const n=[...favStocks,newStock.trim()];setFavStocks(n);try{localStorage.setItem("ciq_favstocks",JSON.stringify(n));}catch(ex){}}setNewStock("");setAddingStock(false);}}
                    style={{padding:"8px 14px",borderRadius:8,background:"#00ffcc",color:"#000",fontWeight:800,fontSize:12,border:"none",cursor:"pointer",fontFamily:"inherit"}}>✓ Add</button>
                  <button onClick={()=>{setAddingStock(false);setNewStock("");}}
                    style={{padding:"8px 10px",borderRadius:8,background:"transparent",color:"#4a6080",fontSize:14,border:"none",cursor:"pointer"}}>✕</button>
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                {favStocks.map(sym=>(
                  <div key={sym} style={{background:"#1a2436",borderRadius:10,padding:"10px",border:"1px solid #2c3a52",textAlign:"center",position:"relative"}}>
                    <button onClick={()=>{const n=favStocks.filter(s=>s!==sym);setFavStocks(n);try{localStorage.setItem("ciq_favstocks",JSON.stringify(n));}catch(ex){}}}
                      style={{position:"absolute",top:4,right:4,background:"none",border:"none",color:"#2c3a52",fontSize:11,cursor:"pointer",lineHeight:1}}>✕</button>
                    <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:800,color:"#00ffcc",marginBottom:2}}>{sym}</div>
                    <button onClick={()=>setSearchQ(sym+" stock price today change")}
                      style={{padding:"4px 8px",borderRadius:6,background:"#0d1525",border:"1px solid #2c3a52",color:"#8fa3c0",fontSize:9,cursor:"pointer",fontFamily:"inherit",marginTop:4,width:"100%"}}
                      onMouseDown={()=>setTimeout(()=>runSearch(sym+" stock price today change"),100)}>
                      📊 Get Price
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Searches */}
            <div style={{background:"#0d1525",borderRadius:14,padding:"14px",marginBottom:14,border:"1px solid #1e2a3a"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#8fa3c0",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>🔍 Quick Market Searches</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {["Market news today","S&P 500 today","Best dividend stocks 2026","Trucking stocks","IUL vs 401k","Best ETFs for 1099 workers","Fuel futures price","Bitcoin price today","Fed interest rate","Recession 2026"].map(q=>(
                  <button key={q} onClick={()=>{setShowMarket(false);setSearchQ(q);setTimeout(()=>runSearch(q),100);}}
                    style={{padding:"6px 12px",borderRadius:20,background:"#1a2436",border:"1px solid #00aa8844",color:"#00aa88",fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* External Links */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <button onClick={()=>window.open("https://finance.google.com","_blank")}
                style={{padding:"13px",borderRadius:12,background:"linear-gradient(135deg,#15803d,#16a34a)",color:"#fff",fontWeight:800,fontSize:12,border:"none",cursor:"pointer",fontFamily:"inherit"}}>
                📊 Google Finance
              </button>
              <button onClick={()=>window.open("https://finance.yahoo.com","_blank")}
                style={{padding:"13px",borderRadius:12,background:"#1a2436",border:"1px solid #2c3a52",color:"#f0f6ff",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                📈 Yahoo Finance
              </button>
            </div>
          </div>
        </div>
      )}

            {/* ── ABOUT US MODAL ── */}
      {showAbout&&(
        <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"16px",backdropFilter:"blur(4px)",overflowY:"auto"}}>
          <div style={{background:C.card,borderRadius:24,padding:"28px 22px",maxWidth:420,width:"100%",border:`1px solid ${C.border}`,boxShadow:"0 32px 80px rgba(0,0,0,0.9)",marginTop:"auto",marginBottom:"auto"}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{width:68,height:68,borderRadius:"50%",background:"linear-gradient(135deg,#fbbf24,#f59e0b)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:36,boxShadow:"0 0 0 6px #fbbf2420"}}>💰</div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,fontWeight:800,color:C.text,marginBottom:8}}>About ContractorIQ</div>
              <div style={{fontSize:12,color:C.sub,lineHeight:1.8,marginBottom:14}}>Your personal profit analyst — built for every gig worker and independent contractor who deserves to know the truth about their business.</div>
              <div style={{padding:"10px 14px",background:`${C.gold}15`,border:`2px solid ${C.gold}55`,borderRadius:12,marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:800,color:C.gold,marginBottom:4}}>⚡ WE DON'T COMPETE WITH DAT OR TRUCKLOGICS.</div>
                <div style={{fontSize:11,color:C.gold,lineHeight:1.6}}>We Show You Where You're Losing Money and Help You Fix It With AI Technology — for a fraction of what they charge.</div>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:18}}>
              {[
                {i:"📊",t:"Know Your Real Numbers",d:"Upload your settlement and see exactly where every dollar goes — gross, net, deductions, margin — all in seconds."},
                {i:"⚡",t:"Score Every Load Before You Accept",d:"Never take a bad load again. Our AI scores every offer and tells you if it's worth your time and fuel."},
                {i:"🧠",t:"AI That Knows YOUR Business",d:"Unlike generic AI, ContractorIQ's advisor is trained on your actual settlement data. Ask it anything about your money."},
                {i:"🔒",t:"Your Data Stays Private",d:"Everything lives on your device. No servers. No data selling. No third-party access. Ever."},
                {i:"💡",t:"Built for Every 1099 Worker",d:"Owner-operators, OTR drivers, drayage, Uber, Lyft, DoorDash, delivery — if you're a contractor, this tool is for you."},
              ].map(r=>(
                <div key={r.t} style={{display:"flex",gap:12,padding:"10px 12px",background:C.bg,borderRadius:10,border:`1px solid ${C.border}`}}>
                  <span style={{fontSize:20,flexShrink:0,marginTop:2}}>{r.i}</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:3}}>{r.t}</div>
                    <div style={{fontSize:12,color:C.sub,lineHeight:1.7}}>{r.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{padding:"12px 14px",background:`${C.accent}12`,borderRadius:10,border:`1px solid ${C.accent}33`,marginBottom:16,textAlign:"center"}}>
              <div style={{fontSize:12,fontWeight:800,color:C.accent,marginBottom:4}}>🎯 Our Mission</div>
              <div style={{fontSize:12,color:C.sub,lineHeight:1.7}}>To help every independent contractor stop guessing and start knowing — so you can build the business and life you deserve. One avoided bad load saves $300–$800. ContractorIQ pays for itself immediately.</div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:7,marginBottom:16}}>
              {["🚛 Owner-Op","🛣️ OTR Driver","⚓ Drayage","🚗 Rideshare","🛵 Dasher","📦 Delivery","💼 Any 1099"].map(g=>(
                <span key={g} style={{padding:"4px 10px",borderRadius:20,fontSize:10,background:`${C.accent}12`,border:`1px solid ${C.accent}25`,color:C.accent,fontWeight:600}}>{g}</span>
              ))}
            </div>
            <button onClick={()=>setShowAbout(false)} style={{width:"100%",padding:"13px",borderRadius:12,background:`linear-gradient(135deg,${C.accent},${C.a3})`,color:"#000",fontWeight:800,fontSize:13,border:"none",cursor:"pointer",fontFamily:"inherit"}}>
              Got It — Let's Get Started 🚀
            </button>
          </div>
        </div>
      )}


      {showWelcome&&(
        <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"12px 16px",backdropFilter:"blur(4px)",overflowY:"auto"}}>
          <div style={{background:C.card,borderRadius:24,padding:"28px 22px",maxWidth:400,width:"100%",border:"1px solid "+C.border,boxShadow:"0 32px 80px rgba(0,0,0,0.9)",marginTop:"auto",marginBottom:"auto"}}>

            <div style={{textAlign:"center",marginBottom:18}}>
              <div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#fbbf24,#f59e0b)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:40,boxShadow:"0 0 0 6px #fbbf2420"}}>💰</div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,fontWeight:800,color:C.text,marginBottom:8,lineHeight:1.2}}>Stop Guessing.<br/>Start Knowing.</div>
              <div style={{fontSize:12,color:C.sub,lineHeight:1.65,marginBottom:12}}>ContractorIQ is your personal profit analyst — built for every gig worker who wants to see <span style={{color:C.accent,fontWeight:700}}>exactly where the money goes</span> and what to do about it. In seconds. Not hours.</div>
              <div style={{padding:"10px 14px",background:C.gold+"15",border:"2px solid "+C.gold+"60",borderRadius:12,textAlign:"left"}}>
                <div style={{fontSize:11,fontWeight:800,color:C.gold,marginBottom:4,letterSpacing:"0.03em"}}>⚡ WE DON'T COMPETE WITH DAT OR TRUCKLOGICS.</div>
                <div style={{fontSize:11,color:C.gold,lineHeight:1.6}}>We <strong>Show You Where You're Losing Money</strong> and <strong>Help You Fix It With AI Technology</strong> — for a fraction of what they charge.</div>
              </div>
            </div>

            <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:7,marginBottom:18}}>
              {["🚛 Owner-Op","🛣️ OTR Driver","⚓ Drayage","🚗 Rideshare","🛵 Dasher","📦 Delivery","💼 Any 1099"].map(g=>(
                <span key={g} style={{padding:"4px 10px",borderRadius:20,fontSize:10,background:C.accent+"10",border:"1px solid "+C.accent+"25",color:C.accent,fontWeight:600}}>{g}</span>
              ))}
            </div>

            {/* Upload CTA — TOP */}
            <button onClick={()=>{
              try{localStorage.setItem("ciq_welcome_done","true");localStorage.setItem("ciq_demo","false");}catch(e){}
              setDemoMode(false);setShowWelcome(false);setTab("growth");
            }} style={{width:"100%",padding:"13px 14px",borderRadius:14,background:"linear-gradient(135deg,"+C.accent+","+C.a3+")",color:"#000",fontWeight:800,fontSize:13,border:"none",cursor:"pointer",fontFamily:"inherit",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <span style={{fontSize:18}}>📤</span>
              <div style={{textAlign:"left"}}>
                <div>Upload My Settlement — See My Real Numbers</div>
                <div style={{fontSize:10,fontWeight:500,opacity:0.65,marginTop:1}}>30 seconds. Private to you. No account needed.</div>
              </div>
            </button>

            {/* ── URGENCY BANNER ── */}
            <div style={{background:"linear-gradient(135deg,"+C.red+"22,"+C.gold+"18)",border:"1px solid "+C.gold+"55",borderRadius:10,padding:"8px 12px",marginBottom:12,textAlign:"center"}}>
              <div style={{fontSize:11,fontWeight:800,color:C.gold}}>⏰ PRICE GOING UP SOON</div>
              <div style={{fontSize:9,color:C.sub,marginTop:2}}>Lock in $19.99/mo before we raise to $39.99. Limited time only.</div>
            </div>

            {/* ── PRICING GRID ── */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.08em",textAlign:"center",marginBottom:10}}>Choose Your Plan</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>

                {/* FREE TRIAL — $1 */}
                <div onClick={()=>window.open("https://buy.stripe.com/aFa8wP7FLbMY4Ua0Ls9MY00","_blank")} style={{background:C.raised,border:"1px solid "+C.gold+"44",borderRadius:14,padding:"12px 10px",cursor:"pointer",textAlign:"center"}}>
                  <div style={{fontSize:18,marginBottom:4}}>🔥</div>
                  <div style={{fontSize:11,fontWeight:800,color:C.gold}}>5-Day Trial</div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,fontWeight:800,color:C.gold,margin:"4px 0"}}>$1</div>
                  <div style={{fontSize:12,color:C.sub,lineHeight:1.7}}>Full access<br/>Cancel anytime</div>
                </div>

                {/* PRO — $19.99 — HERO CARD */}
                <div onClick={()=>window.open("https://buy.stripe.com/fZufZh2lr2co3Q6am29MY01","_blank")} style={{background:"linear-gradient(145deg,#00ffcc22,#a78bfa22)",border:"2px solid "+C.accent,borderRadius:14,padding:"12px 10px",cursor:"pointer",textAlign:"center",position:"relative",boxShadow:"0 0 24px "+C.accent+"44, 0 4px 20px rgba(0,0,0,0.4)"}}>
                  {/* BEST VALUE badge */}
                  <div style={{position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,"+C.accent+","+C.a3+")",borderRadius:20,padding:"3px 12px",fontSize:8,fontWeight:800,color:"#000",whiteSpace:"nowrap",boxShadow:"0 2px 8px "+C.accent+"55"}}>⭐ MOST POPULAR</div>
                  <div style={{fontSize:20,marginBottom:2}}>💰</div>
                  <div style={{fontSize:12,fontWeight:800,color:C.accent}}>Go Pro</div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:26,fontWeight:800,color:C.accent,margin:"2px 0",lineHeight:1}}>$19.99</div>
                  <div style={{fontSize:9,color:C.accent,opacity:0.7,marginBottom:4}}>/month</div>
                  <div style={{fontSize:12,color:C.sub,lineHeight:1.7}}>Unlimited AI · No ads<br/>Cancel anytime</div>
                  <div style={{marginTop:6,padding:"3px 0",background:C.red+"22",borderRadius:6,border:"1px solid "+C.red+"44"}}>
                    <div style={{fontSize:8,color:C.red,fontWeight:700}}>🔺 Goes to $39.99 soon</div>
                  </div>
                </div>

                {/* FOUNDING MEMBER — $97 */}
                <div onClick={()=>window.open("https://buy.stripe.com/3cIcN5f8d5oAeuKeCi9MY02","_blank")} style={{background:C.raised,border:"1px solid "+C.a3+"55",borderRadius:14,padding:"12px 10px",cursor:"pointer",textAlign:"center"}}>
                  <div style={{fontSize:18,marginBottom:4}}>💎</div>
                  <div style={{fontSize:11,fontWeight:800,color:C.a3}}>Founding Member</div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,fontWeight:800,color:C.a3,margin:"4px 0"}}>$97<span style={{fontSize:9,fontWeight:400,color:C.sub}}> once</span></div>
                  <div style={{fontSize:12,color:C.sub,lineHeight:1.7}}>Everything forever<br/>First 50 spots only</div>
                </div>

                {/* FREE DEMO */}
                <div onClick={()=>{
                  setDemoMode(true);
                  try{localStorage.setItem("ciq_demo","true");localStorage.setItem("ciq_welcome_done","true");}catch(e){}
                  setShowWelcome(false);
                }} style={{background:C.raised,border:"1px solid "+C.border,borderRadius:14,padding:"12px 10px",cursor:"pointer",textAlign:"center"}}>
                  <div style={{fontSize:18,marginBottom:4}}>👀</div>
                  <div style={{fontSize:11,fontWeight:800,color:C.sub}}>Try Demo</div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,fontWeight:800,color:C.sub,margin:"4px 0"}}>FREE</div>
                  <div style={{fontSize:12,color:C.sub,lineHeight:1.7}}>Sample data<br/>No account needed</div>
                </div>

              </div>
            </div>

            {/* Footer tip */}
            <div style={{display:"flex",alignItems:"flex-start",gap:8,padding:"10px 12px",background:C.gold+"10",borderRadius:10,border:"1px solid "+C.gold+"30"}}>
              <span style={{fontSize:14,flexShrink:0}}>⚡</span>
              <div style={{fontSize:10,color:C.gold,lineHeight:1.6}}><strong>One avoided bad load = $300–$800 back in your pocket.</strong> ContractorIQ pays for itself the first time you use it.</div>
            </div>

          </div>
        </div>
      )}

      {/* ── DEVICE MISMATCH WARNING (sharing prevention) ── */}
      {deviceMismatch&&(
        <div style={{background:C.red+"18",borderBottom:"1px solid "+C.red+"44",padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:11,color:C.red,fontWeight:700}}>⚠️ Account detected on new device — please re-verify your subscription</div>
          <button onClick={()=>window.open("https://buy.stripe.com/fZufZh2lr2co3Q6am29MY01","_blank")} style={{padding:"4px 10px",borderRadius:6,background:C.red+"22",border:"1px solid "+C.red+"55",color:C.red,fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>Verify</button>
        </div>
      )}

      {/* ── DEMO MODE BANNER ── */}
      {/* ── DATA MODE TOGGLE — always visible ── */}
      <div style={{background:demoMode?"linear-gradient(135deg,"+C.a3+"22,"+C.accent+"12)":C.bg,borderBottom:"1px solid "+(demoMode?C.a3+"44":C.border),padding:"9px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
        <div>
          <div style={{fontSize:11,color:demoMode?C.a3:C.accent,fontWeight:700}}>{demoMode?"👀 Demo Mode — Sample data":"✅ My Data Mode — Your real numbers"}</div>
          <div style={{fontSize:9,color:C.sub,marginTop:1}}>{demoMode?"Tap to switch to your real settlement data":"Tap to explore with demo sample data"}</div>
        </div>
        <button onClick={()=>{
          const next=!demoMode;
          setDemoMode(next);
          try{localStorage.setItem("ciq_demo",String(next));}catch(e){}
          if(!next)setTab("growth");
        }} style={{padding:"6px 12px",borderRadius:7,background:demoMode?"linear-gradient(135deg,"+C.accent+","+C.a3+")":"linear-gradient(135deg,"+C.a3+"44,"+C.accent+"44)",border:"1px solid "+(demoMode?"transparent":C.a3+"66"),color:demoMode?"#000":C.a3,fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:800,flexShrink:0}}>
          {demoMode?"📤 Use My Data":"👀 View Demo"}
        </button>
      </div>

      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=Space+Grotesk:wght@500;600;700;800&display=swap" rel="stylesheet"/>

      {/* ── MARKET TICKER BAR ── scrolling tape ── */}
      <div style={{background:"#0a0e1a",borderBottom:"1px solid #1e2a3a",overflow:"hidden"}}>
        {/* TradingView Ticker Tape - scrolling/spinning */}
        <iframe
          scrolling="no"
          allowTransparency="true"
          frameBorder="0"
          src="https://s.tradingview.com/embed-widget/ticker-tape/?locale=en#%7B%22symbols%22%3A%5B%7B%22description%22%3A%22S%26P%20500%22%2C%22proName%22%3A%22AMEX%3ASPY%22%7D%2C%7B%22description%22%3A%22Dow%2030%22%2C%22proName%22%3A%22AMEX%3ADIA%22%7D%2C%7B%22description%22%3A%22Nasdaq%22%2C%22proName%22%3A%22NASDAQ%3AQQQ%22%7D%2C%7B%22description%22%3A%22Russell%202000%22%2C%22proName%22%3A%22AMEX%3AIWM%22%7D%2C%7B%22description%22%3A%22VIX%22%2C%22proName%22%3A%22CBOE%3AVIX%22%7D%2C%7B%22description%22%3A%22Gold%22%2C%22proName%22%3A%22TVC%3AGOLD%22%7D%2C%7B%22description%22%3A%22Crude%20Oil%22%2C%22proName%22%3A%22TVC%3AUSOIL%22%7D%2C%7B%22description%22%3A%22Bitcoin%22%2C%22proName%22%3A%22COINBASE%3ABTCUSD%22%7D%2C%7B%22description%22%3A%22Apple%22%2C%22proName%22%3A%22NASDAQ%3AAAPL%22%7D%2C%7B%22description%22%3A%22Tesla%22%2C%22proName%22%3A%22NASDAQ%3ATSLA%22%7D%2C%7B%22description%22%3A%22Nvidia%22%2C%22proName%22%3A%22NASDAQ%3ANVDA%22%7D%5D%2C%22showSymbolLogo%22%3Atrue%2C%22isTransparent%22%3Atrue%2C%22displayMode%22%3A%22adaptive%22%2C%22colorTheme%22%3A%22dark%22%2C%22locale%22%3A%22en%22%7D"
          style={{width:"100%",height:72,display:"block"}}
          title="Market Ticker Tape"
        />
        {/* Personal Favorites Row */}
        <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",overflowX:"auto",borderTop:"1px solid #1e2a3a"}}>
          <span style={{fontSize:9,color:"#4a6080",fontWeight:700,flexShrink:0,textTransform:"uppercase",letterSpacing:"0.06em"}}>MY STOCKS</span>
          {favStocks.map(sym=>(
            <button key={sym} onClick={()=>{setShowMarket(true);setTimeout(()=>{setSearchQ(sym+" stock price today");runSearch(sym+" stock price today");},200);}}
              style={{padding:"3px 9px",borderRadius:8,background:"#1a2436",border:"1px solid #2c3a52",color:"#00ffcc",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0,display:"flex",alignItems:"center",gap:5}}>
              📈 {sym}
              <span onClick={e=>{e.stopPropagation();const n=favStocks.filter(s=>s!==sym);setFavStocks(n);try{localStorage.setItem("ciq_favstocks",JSON.stringify(n));}catch(ex){}}}
                style={{color:"#4a6080",fontSize:12,lineHeight:1,marginLeft:2,cursor:"pointer"}}>×</span>
            </button>
          ))}
          {addingStock?(
            <div style={{display:"flex",gap:4,flexShrink:0}}>
              <input value={newStock} onChange={e=>setNewStock(e.target.value.toUpperCase())}
                onKeyDown={e=>{if(e.key==="Enter"&&newStock.trim()){const n=[...favStocks,newStock.trim()];setFavStocks(n);try{localStorage.setItem("ciq_favstocks",JSON.stringify(n));}catch(ex){}setNewStock("");setAddingStock(false);}}}
                placeholder="AAPL" maxLength={6}
                style={{width:60,padding:"3px 8px",borderRadius:7,background:"#1a2436",border:"1px solid #00ffcc",color:"#00ffcc",fontSize:11,fontFamily:"inherit",outline:"none"}}
                autoFocus/>
              <button onClick={()=>{if(newStock.trim()){const n=[...favStocks,newStock.trim()];setFavStocks(n);try{localStorage.setItem("ciq_favstocks",JSON.stringify(n));}catch(ex){}}setNewStock("");setAddingStock(false);}}
                style={{padding:"3px 8px",borderRadius:7,background:"#00ffcc",color:"#000",fontSize:10,fontWeight:800,border:"none",cursor:"pointer",fontFamily:"inherit"}}>✓</button>
              <button onClick={()=>{setAddingStock(false);setNewStock("");}}
                style={{padding:"3px 7px",borderRadius:7,background:"transparent",color:"#4a6080",fontSize:12,border:"none",cursor:"pointer"}}>×</button>
            </div>
          ):(
            <button onClick={()=>setAddingStock(true)}
              style={{padding:"3px 9px",borderRadius:8,background:"transparent",border:"1px dashed #2c3a52",color:"#4a6080",fontSize:10,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>
              + Add
            </button>
          )}
        </div>
      </div>

      {/* HEADER */}
      <div style={{background:C.surf,borderBottom:`1px solid ${C.border}`,padding:"11px 14px",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:9,background:`linear-gradient(135deg,${C.accent},${C.a3})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🚛</div>
            <div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:15}}>DrayageIQ</div>
              <div style={{fontSize:10,color:C.sub}}>{hideOwnerName?"●●●●●":demoMode?"Demo Driver":(profile.name||"Your Business")} · {allW.length>0?allW.length+" weeks":"No data yet"}</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:10,color:C.sub}}>YTD Gross</div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:800,color:C.accent}}>${tGross.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {/* Scrollable nav tabs */}
          <div style={{display:"flex",gap:6,alignItems:"center",overflowX:"auto",flex:1,scrollbarWidth:"none",WebkitOverflowScrolling:"touch",paddingBottom:2}}>
            <TB t="dashboard" l="📊 Dash"/>
            <TB t="loads" l="📋 Docs"/>
            <TB t="growth" l="🚀 Growth"/>
            <button onClick={()=>setShowInsurance(true)} style={{padding:"0 12px",borderRadius:8,background:"linear-gradient(135deg,#a78bfa22,#6d28d922)",border:"2px solid #a78bfa55",color:"#a78bfa",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0,whiteSpace:"nowrap",height:40,display:"flex",alignItems:"center",gap:4}}>🛡️ Protect</button>
            <TB t="ai" l="🧠 AI"/>
            <button onClick={()=>setFocusMode(p=>!p)}
              style={{padding:"0 12px",borderRadius:8,background:focusMode?C.gold:`linear-gradient(135deg,${C.gold}33,${C.gold}15)`,border:`2px solid ${C.gold}`,color:focusMode?"#000":C.gold,fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"inherit",flexShrink:0,whiteSpace:"nowrap",height:40,display:"flex",alignItems:"center",gap:4}}>
              {focusMode?"⚡":"⚡ Focus"}
            </button>
          </div>
          {/* Menu + PRO — fixed outside scroll so dropdown never clips */}
          <div style={{display:"flex",gap:5,alignItems:"center",flexShrink:0}}>
            <div style={{position:"relative"}}>
              <button onClick={()=>setShowMenu(p=>!p)}
                style={{padding:"0 12px",borderRadius:8,background:showMenu?`${C.a3}22`:C.raised,border:`1px solid ${showMenu?C.a3:C.border}`,color:showMenu?C.a3:C.sub,fontSize:10,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5,height:40,whiteSpace:"nowrap",fontWeight:700}}>
                <span>☰</span><span>Menu</span>
              </button>
              {showMenu&&(
                <div style={{position:"fixed",top:"auto",right:8,background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:8,zIndex:9998,minWidth:190,boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
                  <button onClick={()=>{setShowAbout(true);setShowMenu(false);}}
                    style={{width:"100%",padding:"10px 12px",borderRadius:8,background:C.raised,border:`1px solid ${C.border}`,color:C.text,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:5,display:"flex",alignItems:"center",gap:8}}>
                    <span>💰</span><span style={{fontWeight:600}}>About ContractorIQ</span>
                  </button>
                  <button onClick={()=>{setShowMarket(true);setShowMenu(false);}}
                    style={{width:"100%",padding:"10px 12px",borderRadius:8,background:`${C.green}12`,border:`1px solid ${C.green}33`,color:C.green,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:5,display:"flex",alignItems:"center",gap:8}}>
                    <span>📈</span><span style={{fontWeight:600}}>Market Overview</span>
                  </button>
                  <button onClick={()=>{setShowProfile(p=>!p);setShowSettings(false);setShowMenu(false);}}
                    style={{width:"100%",padding:"10px 12px",borderRadius:8,background:showProfile?`${C.gold}15`:C.raised,border:`1px solid ${showProfile?C.gold:C.border}`,color:showProfile?C.gold:(profile.setupDone?C.green:C.text),fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:5,display:"flex",alignItems:"center",gap:8}}>
                    <span>👤</span><span style={{fontWeight:600}}>My Profile</span>
                    {profile.setupDone&&<span style={{marginLeft:"auto",fontSize:10,color:C.green}}>✅</span>}
                  </button>
                  <button onClick={()=>{setShowSettings(p=>!p);setShowProfile(false);setShowMenu(false);}}
                    style={{width:"100%",padding:"10px 12px",borderRadius:8,background:showSettings?`${C.a3}15`:C.raised,border:`1px solid ${showSettings?C.a3:C.border}`,color:showSettings?C.a3:C.text,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:5,display:"flex",alignItems:"center",gap:8}}>
                    <span>⚙️</span><span style={{fontWeight:600}}>Display Settings</span>
                  </button>
                  <button onClick={()=>{const next=!darkMode;setDarkMode(next);try{localStorage.setItem("ciq_theme",next?"dark":"light");}catch(e){}setShowMenu(false);}}
                    style={{width:"100%",padding:"10px 12px",borderRadius:8,background:C.raised,border:`1px solid ${C.border}`,color:C.text,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",alignItems:"center",gap:8}}>
                    <span>{darkMode?"☀️":"🌙"}</span><span style={{fontWeight:600}}>{darkMode?"Light Mode":"Dark Mode"}</span>
                  </button>
                </div>
              )}
            </div>
            {isPro?(
              <div onClick={()=>{setIsPro(false);try{localStorage.removeItem("ciq_pro");localStorage.removeItem("ciq_trial_start");localStorage.removeItem("ciq_ai_uses");localStorage.removeItem("ciq_o_uses");}catch(e){}}} style={{padding:"6px 10px",borderRadius:8,background:"linear-gradient(135deg,"+C.accent+"33,"+C.a3+"22)",border:"1px solid "+C.accent+"66",fontSize:9,fontWeight:800,color:C.accent,cursor:"pointer",whiteSpace:"nowrap",boxShadow:"0 0 10px "+C.accent+"33",letterSpacing:"0.06em"}}>PRO ✓</div>
            ):trialDaysLeft>0?(
              <div style={{padding:"6px 9px",borderRadius:8,background:C.gold+"20",border:"1px solid "+C.gold+"55",fontSize:9,fontWeight:700,color:C.gold,flexShrink:0}}>{trialDaysLeft}d left</div>
            ):(
              <button onClick={()=>{const t=ownerTaps+1;setOwnerTaps(t);if(t>=5){setIsPro(true);setOwnerTaps(0);try{localStorage.setItem("ciq_pro","true");localStorage.removeItem("ciq_ai_uses");localStorage.removeItem("ciq_o_uses");}catch(e){}}else{openUpgrade("header");}}} style={{padding:"7px 11px",borderRadius:8,background:"linear-gradient(135deg,"+C.gold+",#f59e0b)",border:"none",fontSize:10,fontWeight:800,color:"#000",cursor:"pointer",fontFamily:"inherit",flexShrink:0,whiteSpace:"nowrap"}}>{ownerTaps>0?`(${ownerTaps}/5)`:"Upgrade"}</button>
            )}
          </div>
        </div>
      </div>

      {/* ── SMART SEARCH BAR ── highlighted below header ── */}
      <div style={{background:`linear-gradient(135deg,${C.a3}15,${C.accent}08)`,borderBottom:`1px solid ${C.a3}33`,padding:"10px 14px"}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:8,background:C.surf,borderRadius:10,padding:"0 12px",border:`2px solid ${C.a3}`,boxShadow:`0 0 14px ${C.a3}33`}}>
            <span style={{fontSize:14,flexShrink:0,color:C.a3}}>{searchLoading?"⏳":"🔍"}</span>
            <input value={searchQ||""} onChange={e=>setSearchQ(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&(searchQ||"").trim())runSearch();}} placeholder="Search weather · gas prices · truck stops · traffic..." style={{background:"none",border:"none",color:C.text,fontSize:12,fontFamily:"inherit",padding:"11px 0",width:"100%",outline:"none"}}/>
            {(searchQ||"").trim()&&<button onClick={()=>{setSearchQ("");setSearchResult("");}} style={{background:"none",border:"none",color:C.sub,fontSize:16,cursor:"pointer",padding:"0 4px",flexShrink:0}}>×</button>}
          </div>
          <button onClick={()=>runSearch()} disabled={!(searchQ||"").trim()||searchLoading} style={{padding:"11px 16px",borderRadius:10,background:!(searchQ||"").trim()||searchLoading?C.raised:`linear-gradient(135deg,${C.a3},${C.accent})`,color:!(searchQ||"").trim()||searchLoading?C.sub:"#000",fontWeight:800,fontSize:12,border:"none",cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>Go</button>
        </div>
        {!searchResult&&!searchLoading&&(
          <div style={{display:"flex",gap:6,marginTop:8,overflowX:"auto",paddingBottom:2}}>
            {["⛅ Weather","⛽ Gas prices","🚛 Truck stops","🛣️ Traffic I-95","⛽ Diesel prices"].map(s=>(
              <button key={s} onClick={()=>{setSearchQ(s.replace(/^[^\s]+\s/,""));setTimeout(()=>runSearch(s.replace(/^[^\s]+\s/,"")),50);}} style={{padding:"5px 11px",borderRadius:20,background:C.raised,border:`1px solid ${C.a3}55`,color:C.a3,fontSize:11,cursor:"pointer",fontFamily:"inherit",flexShrink:0,whiteSpace:"nowrap",fontWeight:700}}>{s}</button>
            ))}
          </div>
        )}
        {searchResult&&(
          <div style={{marginTop:10,padding:"12px 14px",background:C.card,borderRadius:10,border:`1px solid ${C.a3}44`,fontSize:13,color:C.text,lineHeight:1.9,whiteSpace:"pre-wrap"}}>
            {searchResult}
            <button onClick={()=>{setSearchResult("");setSearchQ("");}} style={{display:"block",marginTop:8,background:"none",border:"none",color:C.sub,fontSize:11,cursor:"pointer",fontFamily:"inherit",padding:0}}>✕ Clear</button>
          </div>
        )}
      </div>

      {/* ── SETTINGS PANEL ── */}
      {showSettings&&(
        <div style={{background:C.surf,borderBottom:`1px solid ${C.border}`,padding:"14px 16px"}}>
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:C.text}}>⚙️ Display Settings</div>
              <button onClick={()=>setShowSettings(false)} style={{background:"none",border:"none",color:C.sub,fontSize:18,cursor:"pointer"}}>×</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:wide?"repeat(3,1fr)":"1fr",gap:10}}>
              <div style={{background:C.card,borderRadius:11,padding:"12px",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:10,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:9}}>Show / Hide Vendors</div>
                {vendorKeys.filter(vk=>allW.some(w=>detectVendor(w)===vk)).map(vk=>{
                  const v=VENDORS[vk];const hidden=hiddenVendors.includes(vk);const isOnly=activeOnlyVendor===vk;
                  return(
                    <div key={vk} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:v.color,opacity:hidden?0.3:1}}/>
                        <span style={{fontSize:11,color:hidden?C.sub:C.text}}>{v.short} — {v.name}</span>
                      </div>
                      <div style={{display:"flex",gap:5}}>
                        <button onClick={()=>{setActiveOnlyVendor(isOnly?null:vk);setHiddenVendors([]);}} style={{padding:"3px 8px",borderRadius:5,background:isOnly?`${v.color}22`:"transparent",border:`1px solid ${isOnly?v.color:C.border}`,color:isOnly?v.color:C.sub,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>{isOnly?"Only ✓":"Only"}</button>
                        <button onClick={()=>setHiddenVendors(p=>hidden?p.filter(x=>x!==vk):[...p,vk])} style={{padding:"3px 8px",borderRadius:5,background:hidden?`${C.red}22`:"transparent",border:`1px solid ${hidden?C.red:C.border}`,color:hidden?C.red:C.sub,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>{hidden?"Show":"Hide"}</button>
                      </div>
                    </div>
                  );
                })}
                {(hiddenVendors.length>0||activeOnlyVendor)&&<button onClick={()=>{setHiddenVendors([]);setActiveOnlyVendor(null);}} style={{width:"100%",padding:"5px",borderRadius:6,background:`${C.green}15`,border:`1px solid ${C.green}33`,color:C.green,fontSize:10,cursor:"pointer",fontFamily:"inherit",marginTop:4}}>↺ Show All</button>}
              </div>
              <div style={{background:C.card,borderRadius:11,padding:"12px",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:10,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:9}}>Privacy</div>
                {[{label:"Hide owner name",val:hideOwnerName,set:setHideOwnerName},{label:"Hide unit number (UNIT#)",val:hideUnitNum,set:setHideUnitNum}].map(item=>(
                  <div key={item.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <span style={{fontSize:11,color:C.text}}>{item.label}</span>
                    <button onClick={()=>item.set(p=>!p)} style={{width:40,height:20,borderRadius:10,background:item.val?C.accent:C.border,border:"none",cursor:"pointer",position:"relative",flexShrink:0}}>
                      <div style={{width:14,height:14,borderRadius:"50%",background:"white",position:"absolute",top:3,left:item.val?23:3,transition:"left 0.15s"}}/>
                    </button>
                  </div>
                ))}
                <div style={{fontSize:12,color:C.sub,lineHeight:1.7,marginTop:6}}>Use when sharing screenshots. Data stays saved — display only.</div>
              </div>
              <div style={{background:C.card,borderRadius:11,padding:"12px",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:10,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:9}}>Active Filters</div>
                <div style={{fontSize:11,color:visibleW.length===allW.length?C.sub:C.gold,marginBottom:6}}>{visibleW.length===allW.length?"✓ All weeks visible":"⚠️ "+visibleW.length+" of "+allW.length+" weeks shown"}</div>
                {activeOnlyVendor&&<div style={{fontSize:10,color:C.gold,marginBottom:4}}>👁 Only: {VENDORS[activeOnlyVendor]?.short}</div>}
                {hiddenVendors.length>0&&<div style={{fontSize:10,color:C.red,marginBottom:4}}>🚫 Hidden: {hiddenVendors.join(", ")}</div>}
                {hideOwnerName&&<div style={{fontSize:10,color:C.accent}}>🔒 Name hidden</div>}
                <button onClick={()=>{setHiddenVendors([]);setActiveOnlyVendor(null);setHideOwnerName(false);setHideUnitNum(false);}} style={{width:"100%",marginTop:10,padding:"6px",borderRadius:6,background:"transparent",border:`1px solid ${C.border}`,color:C.sub,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>Reset All</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PROFILE PANEL ── */}
      {showProfile&&(
        <div style={{background:C.surf,borderBottom:`1px solid ${C.border}`,padding:"14px 16px"}}>
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:C.text}}>👤 Your Profile</div>
                <div style={{fontSize:11,color:C.sub,marginTop:2}}>AI uses this to personalize every analysis</div>
              </div>
              <button onClick={()=>setShowProfile(false)} style={{background:"none",border:"none",color:C.sub,fontSize:18,cursor:"pointer"}}>×</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:wide?"repeat(3,1fr)":"1fr",gap:10}}>
              <div style={{background:C.card,borderRadius:11,padding:"12px",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:10,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:9}}>Who You Are</div>
                {[{label:"Your Name",key:"name",ph:"Owner Name"},{label:"Company",key:"company",ph:"YOUR COMPANY"},{label:"Truck / Unit",key:"unit",ph:"UNIT#"}].map(f=>(
                  <div key={f.key} style={{marginBottom:9}}>
                    <div style={{fontSize:9,color:C.sub,marginBottom:3,fontWeight:600,textTransform:"uppercase"}}>{f.label}</div>
                    <input value={profile[f.key]||""} onChange={e=>setProfile(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} style={{width:"100%",padding:"8px 10px",background:C.raised,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,fontSize:12,boxSizing:"border-box",fontFamily:"inherit",outline:"none"}}/>
                  </div>
                ))}
              </div>
              <div style={{background:C.card,borderRadius:11,padding:"12px",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:10,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:9}}>Your Goal</div>
                {["Maximize weekly net","Reduce fuel costs","Add 2nd truck","Pay off loan","Build savings","Understand margins"].map(g=>(
                  <button key={g} onClick={()=>setProfile(p=>({...p,goal:p.goal===g?"":g}))} style={{width:"100%",padding:"6px 10px",borderRadius:6,background:profile.goal===g?`${C.gold}18`:"transparent",border:`1px solid ${profile.goal===g?C.gold:C.border}`,color:profile.goal===g?C.gold:C.sub,fontSize:11,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:5}}>{g}</button>
                ))}
              </div>
              <div style={{background:C.card,borderRadius:11,padding:"12px",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:10,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:9}}>Targets</div>
                {[{label:"Target Weekly Net ($)",key:"targetWeeklyNet",ph:"3500"},{label:"Truck Baseline MPG",key:"targetMPG",ph:"5.2"}].map(f=>(
                  <div key={f.key} style={{marginBottom:9}}>
                    <div style={{fontSize:9,color:C.sub,marginBottom:3,fontWeight:600,textTransform:"uppercase"}}>{f.label}</div>
                    <input value={profile[f.key]||""} onChange={e=>setProfile(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} style={{width:"100%",padding:"8px 10px",background:C.raised,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,fontSize:12,boxSizing:"border-box",fontFamily:"inherit",outline:"none"}}/>
                  </div>
                ))}
                <div style={{marginBottom:9}}>
                  <div style={{fontSize:9,color:C.sub,marginBottom:3,fontWeight:600,textTransform:"uppercase"}}>Notes for AI</div>
                  <textarea value={profile.notes||""} onChange={e=>setProfile(p=>({...p,notes:e.target.value}))} placeholder="e.g. I run Hagerstown to Dundalk daily..." style={{width:"100%",height:72,padding:"8px 10px",background:C.raised,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,fontSize:11,boxSizing:"border-box",fontFamily:"inherit",outline:"none",resize:"none",lineHeight:1.5}}/>
                </div>
                <button onClick={()=>{setProfile(p=>({...p,setupDone:true}));setShowProfile(false);}} style={{width:"100%",padding:"9px",borderRadius:8,background:`linear-gradient(135deg,${C.gold},${C.gold2||C.gold})`,color:"#000",fontWeight:700,fontSize:12,border:"none",cursor:"pointer",fontFamily:"inherit"}}>💾 Save Profile</button>
                {profile.setupDone&&<div style={{fontSize:9,color:C.green,textAlign:"center",marginTop:5}}>✅ Saved — AI is personalized</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{padding:"16px",maxWidth:1100,margin:"0 auto"}}>

      {/* ══ DASHBOARD ════════════════════════════════════════════════════════ */}
      {tab==="dashboard"&&(
        <div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
            <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:800,margin:0,letterSpacing:"-0.02em"}}>
              {demoMode?"👀 Demo Mode — Sample Data":profile.setupDone&&profile.name?"Welcome back, "+profile.name.split(" ")[0]+" 👋":"Business Dashboard"}
            </h1>
            {helpBtn("dashboard")}
          </div>
          {helpModal("dashboard")}
          <p style={{color:C.sub,fontSize:11,marginTop:0,marginBottom:14}}>{visibleW.length} weeks{visibleW.length<allW.length?" of "+allW.length:""} · {vendorStats.length} vendor{vendorStats.length>1?"s":""} · tap bars to navigate</p>

          {!profile.setupDone&&(
            <div style={{padding:"10px 14px",background:`${C.a3}10`,borderRadius:9,border:`1px solid ${C.a3}33`,fontSize:11,color:C.a3,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
              <span>👋 New here? Tap <strong>👤</strong> to set your profile. Tap <strong>?</strong> on any card to learn what it does.</span>
              <button onClick={()=>setShowProfile(true)} style={{padding:"5px 10px",borderRadius:6,background:`${C.a3}22`,border:`1px solid ${C.a3}55`,color:C.a3,fontSize:10,cursor:"pointer",fontFamily:"inherit",flexShrink:0,fontWeight:700}}>Set Up →</button>
            </div>
          )}
          {profile.setupDone&&profile.goal&&(
            <div style={{padding:"7px 14px",background:`${C.gold}08`,borderRadius:8,border:`1px solid ${C.gold}22`,fontSize:10,color:C.sub,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
              <span style={{color:C.gold}}>🎯</span>
              <span>Goal: <strong style={{color:C.gold}}>{profile.goal}</strong></span>
            </div>
          )}

          {/* ── VALUE REMINDER ── */}
          {(()=>{
            const badLoads=allMoves.filter(function(m){const s=scoreMove(m);return s.grade==="D";}).length;
            const savedEst=badLoads*400;
            const insightCount=visibleW.length+allMoves.length+expenses.length;
            if(insightCount<3)return null;
            return(
              <div style={{padding:"10px 14px",background:"linear-gradient(135deg,"+C.a3+"12,"+C.accent+"08)",borderRadius:9,border:"1px solid "+C.a3+"33",fontSize:11,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                <div>
                  <div style={{fontWeight:700,color:C.a3,marginBottom:1}}>💡 ContractorIQ is working for you</div>
                  <div style={{fontSize:10,color:C.sub}}>{insightCount} data points tracked · {badLoads>0?badLoads+" low-value route"+(badLoads>1?"s":"")+" flagged":allMoves.length+" routes analyzed"}{savedEst>0?" · ~$"+savedEst.toLocaleString()+" in poor loads identified":""}</div>
                </div>
                {!hasAccess&&<button onClick={()=>openUpgrade("value")} style={{padding:"5px 11px",borderRadius:7,background:"linear-gradient(135deg,"+C.gold+",#f59e0b)",color:"#000",fontSize:10,fontWeight:700,border:"none",cursor:"pointer",fontFamily:"inherit",flexShrink:0,whiteSpace:"nowrap"}}>Upgrade</button>}
              </div>
            );
          })()}

          {/* ── CONTEXT ADS (free tier only, max 2 per session) ── */}
          {!hasAccess&&(()=>{
            const latestW=safeW[safeW.length-1];
            const latestFuel=(latestW.deds||[]).filter(function(d){return d.l.toLowerCase().includes("fuel");}).reduce(function(s,d){return s+d.a;},0);
            const latestNet=latestW.net;
            const latestGrades=allMoves.slice(-10).map(function(m){return scoreMove(m).grade;});
            const hasDgrade=latestGrades.filter(function(g){return g==="D";}).length>=2;
            const marginPct=tGross>0?(tNet/tGross*100):0;
            const ads=[
              {id:"fuel",show:latestFuel>900&&!dismissedAds.includes("fuel"),
               icon:"⛽",color:C.gold,partner:"Comdata Fuel Card",
               headline:"Your fuel cost was $"+Math.round(latestFuel)+" last week",
               body:"Comdata cardholders save an average of $180/week on diesel. Check your savings estimate.",
               cta:"See My Savings →",url:"https://www.comdata.com/solutions/fleet-cards/"},
              {id:"factor",show:latestNet<2000&&!dismissedAds.includes("factor"),
               icon:"💵",color:C.green,partner:"OTR Capital",
               headline:"Tight week? Get paid same-day",
               body:"OTR Capital funds your invoices in 24 hours. No long-term contract. Rates from 1.5%.",
               cta:"Check Qualification →",url:"https://www.otrcapital.com/"},
              {id:"loads",show:hasDgrade&&!dismissedAds.includes("loads"),
               icon:"📦",color:C.accent,partner:"DAT Load Board",
               headline:latestGrades.filter(function(g){return g==="D";}).length+" of your recent routes graded D",
               body:"DAT One has 183M+ loads posted monthly. Find higher-paying routes near Baltimore.",
               cta:"Browse Load Board →",url:"https://www.dat.com/"},
              {id:"tax",show:marginPct<55&&!dismissedAds.includes("tax"),
               icon:"🧾",color:C.a3,partner:"ATBS",
               headline:"Most owner-operators overpay taxes by $4,200/yr",
               body:"ATBS specializes in trucking tax prep. Their average client saves more than the cost of this app.",
               cta:"Get a Free Estimate →",url:"https://www.atbs.com/"},
            ].filter(function(a){return a.show;}).slice(0,2);
            if(ads.length===0)return null;
            return(
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
                {ads.map(function(ad){
                  return(
                    <div key={ad.id} style={{background:C.bg,borderRadius:10,padding:"12px 13px",border:"1px solid "+ad.color+"44",position:"relative"}}>
                      <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                        <div style={{width:36,height:36,borderRadius:9,background:ad.color+"18",border:"1px solid "+ad.color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{ad.icon}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                            <span style={{fontSize:9,padding:"1px 6px",borderRadius:4,background:ad.color+"18",color:ad.color,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em"}}>Partner Tip</span>
                            <span style={{fontSize:9,color:C.sub}}>{ad.partner}</span>
                          </div>
                          <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:3}}>{ad.headline}</div>
                          <div style={{fontSize:10,color:C.sub,lineHeight:1.55,marginBottom:8}}>{ad.body}</div>
                          <a href={ad.url} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",padding:"6px 13px",borderRadius:7,background:ad.color+"22",border:"1px solid "+ad.color+"55",color:ad.color,fontSize:11,fontWeight:700,textDecoration:"none"}}>{ad.cta}</a>
                        </div>
                        <button onClick={()=>setDismissedAds(function(p){const n=[...p,ad.id];try{localStorage.setItem("ciq_dis_ads",JSON.stringify(n));}catch(e){}return n;})} style={{background:"none",border:"none",color:C.sub,fontSize:14,cursor:"pointer",padding:"0 2px",flexShrink:0,lineHeight:1}}>×</button>
                      </div>
                    </div>
                  );
                })}
                <div style={{fontSize:9,color:C.sub,textAlign:"center"}}>Sponsored · <button onClick={()=>openUpgrade("ads")} style={{background:"none",border:"none",color:C.accent,fontSize:9,cursor:"pointer",fontFamily:"inherit",padding:0}}>Go Pro to remove ads</button></div>
              </div>
            );
          })()}

          {/* Focus Mode banner */}
          {focusMode&&(
            <div style={{padding:"10px 14px",background:`${C.gold}12`,borderRadius:9,border:`1px solid ${C.gold}33`,fontSize:11,color:C.gold,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>⚡ <strong>Focus Mode ON</strong> — Key numbers only.</span>
              <button onClick={()=>setFocusMode(false)} style={{padding:"4px 10px",borderRadius:6,background:"transparent",border:`1px solid ${C.gold}55`,color:C.gold,fontSize:10,cursor:"pointer",fontFamily:"inherit",flexShrink:0,marginLeft:10}}>Show All</button>
            </div>
          )}

          {/* ── Vendor Cards ── */}
          {vendorStats.length>0&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:9}}>📋 By Vendor / Carrier</div>
              <div style={{display:"grid",gridTemplateColumns:wide?`repeat(${Math.min(vendorStats.length,3)},1fr)`:"1fr",gap:10,marginBottom:10}}>
                {vendorStats.map(v=>(
                  <div key={v.key} style={{background:C.card,borderRadius:12,padding:"14px",border:`2px solid ${v.color}44`,position:"relative",overflow:"hidden"}}>
                    {/* Color accent strip */}
                    <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:v.color,borderRadius:"12px 12px 0 0"}}/>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:20}}>{v.icon}</span>
                        <div>
                          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:700,color:v.color}}>{v.name}</div>
                          <div style={{fontSize:9,color:C.sub,marginTop:1}}>{v.weeks} week{v.weeks>1?"s":""} · {v.unit||"Multiple units"}</div>
                        </div>
                      </div>
                      <div style={{padding:"3px 9px",borderRadius:20,background:`${v.color}18`,border:`1px solid ${v.color}44`,fontSize:10,fontWeight:700,color:v.color}}>{v.margin}%</div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                      {[
                        {l:"Gross",    val:`$${(v.gross/1000).toFixed(1)}k`, c:v.color},
                        {l:"Net",      val:`$${(v.net/1000).toFixed(1)}k`,   c:C.green},
                        {l:"Deducted", val:`$${(v.ded/1000).toFixed(1)}k`,   c:C.red},
                      ].map(s=>(
                        <div key={s.l} style={{background:C.bg,borderRadius:7,padding:"7px 8px",border:`1px solid ${C.border}`,textAlign:"center"}}>
                          <div style={{fontSize:9,color:C.sub,textTransform:"uppercase",marginBottom:3}}>{s.l}</div>
                          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,color:s.c}}>{s.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* Combined total row when multiple vendors */}
              {vendorStats.length>1&&(
                <div style={{background:C.surf,borderRadius:10,padding:"11px 14px",border:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:16}}>🏢</span>
                    <div>
                      <div style={{fontSize:11,fontWeight:700,color:C.text}}>All Vendors Combined</div>
                      <div style={{fontSize:9,color:C.sub,marginTop:1}}>{allW.length} total weeks · {vendorStats.map(v=>v.name).join(" + ")}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:12,alignItems:"center"}}>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:9,color:C.sub}}>Total Gross</div>
                      <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:800,color:C.accent}}>${tGross.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:9,color:C.sub}}>Total Net</div>
                      <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:800,color:C.green}}>${tNet.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
                    </div>
                    <div style={{padding:"5px 11px",borderRadius:8,background:`${C.green}18`,border:`1px solid ${C.green}44`}}>
                      <div style={{fontSize:9,color:C.sub}}>Margin</div>
                      <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:800,color:C.green}}>{margin}%</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Main KPIs ── */}
          <div style={{display:"grid",gridTemplateColumns:wide?"repeat(4,1fr)":"repeat(2,1fr)",gap:12,marginBottom:8}}>
            {[{l:"YTD Gross",v:`$${tGross.toLocaleString("en-US",{minimumFractionDigits:2})}`,s:`All ${allW.length} weeks`,c:C.accent},{l:"YTD Net",v:`$${tNet.toLocaleString("en-US",{minimumFractionDigits:2})}`,s:`${margin}% margin`,c:C.green},{l:"Deductions",v:`$${tDed.toLocaleString("en-US",{minimumFractionDigits:2})}`,s:"All expenses",c:C.red},{l:"Avg RPM",v:`$${avgRPM}`,s:`${tMi.toLocaleString()} mi`,c:C.a3}].map(k=>(
              <div key={k.l} style={K({borderTop:`3px solid ${k.c}`,padding:"16px",background:C.card,boxShadow:"0 2px 8px rgba(0,0,0,0.12)"})}>
                <div style={{fontSize:10,color:C.sub,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>{k.l}</div>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,fontWeight:800,color:k.c}}>{k.v}</div>
                <div style={{fontSize:10,color:C.sub,marginTop:4}}>{k.s}</div>
              </div>
            ))}
          </div>
          <NoBadge/>

          {/* ── PROTECT YOUR INCOME CARD ── */}
          {!demoMode&&tNet>0&&(
            <div style={{background:`linear-gradient(135deg,${C.a3}15,${C.gold}10)`,borderRadius:14,padding:"14px 16px",marginBottom:12,border:`1px solid ${C.a3}44`,display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:28,flexShrink:0}}>🛡️</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:800,color:C.text,marginBottom:2}}>Protect Your Income</div>
                <div style={{fontSize:10,color:C.sub,lineHeight:1.6}}>You've earned <strong style={{color:C.accent}}>${tNet.toLocaleString("en-US",{maximumFractionDigits:0})}</strong> net this year. As a 1099 worker you have <strong style={{color:C.gold}}>zero employer coverage.</strong> Book a free life insurance review.</div>
              </div>
              <button onClick={()=>setShowInsurance(true)} style={{padding:"8px 11px",borderRadius:9,background:"linear-gradient(135deg,#a78bfa,#6d28d9)",color:"#fff",fontWeight:800,fontSize:10,border:"none",cursor:"pointer",fontFamily:"inherit",flexShrink:0,whiteSpace:"nowrap"}}>
                🛡️ Meet Nelle
              </button>
            </div>
          )}

          {/* Trend — color coded by vendor */}
          <div style={{...K({marginBottom:16,padding:"14px 16px"}),overflow:"visible"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.08em"}}>📈 Weekly Net Pay Trend{helpBtn("trend")}</div>
            </div>
            {helpModal("trend")}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:0}}>
              <div/>
              <div style={{display:"flex",gap:10}}>
                {vendorStats.map(v=>(
                  <div key={v.key} style={{display:"flex",alignItems:"center",gap:4}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:v.color}}/>
                    <span style={{fontSize:9,color:C.sub}}>{v.short}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bars */}
            <div style={{display:"flex",alignItems:"flex-end",gap:3,height:120,padding:"0 2px",overflowX:"auto",overflowY:"visible"}}>
              {[...allW].sort((a,b)=>{
                const ay=a.from?parseInt(a.from.split('/')[2]||'2025'):2025;
                const by=b.from?parseInt(b.from.split('/')[2]||'2025'):2025;
                if(ay!==by)return ay-by;
                return parseInt(a.week)-parseInt(b.week);
              }).map((w,si)=>{
                // ⭐ KEY FIX: find real index in unsorted allW so sD points to correct week
                const realIdx=allW.findIndex(x=>x.week===w.week&&x.from===w.from&&x.vendor===w.vendor);
                const maxNet=Math.max(...allW.map(x=>x.net));
                const h=Math.max(32,(w.net/maxNet)*100);
                const vc=VENDORS[detectVendor(w)]?.color||C.accent;
                const isSelected=sD===realIdx;
                const label=`$${(w.net/1000).toFixed(1)}k`;
                return(
                  <div key={w.week+si} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:0,cursor:"pointer",maxWidth:44,minWidth:28}}
                    onClick={()=>{setSD(realIdx);setSM(realIdx);setSH(realIdx);}}>
                    {/* Bar with label INSIDE at top */}
                    <div style={{
                      width:"80%",height:h,minWidth:8,
                      borderRadius:"5px 5px 0 0",
                      background:isSelected?vc:`${vc}88`,
                      boxShadow:isSelected?`0 0 12px ${vc}99`:"none",
                      transition:"all 0.2s",
                      position:"relative",
                      display:"flex",flexDirection:"column",
                      alignItems:"center",justifyContent:"flex-start",
                      paddingTop:3,
                    }}>
                      <span style={{fontSize:8,fontWeight:800,color:"#000",opacity:0.85,lineHeight:1,whiteSpace:"nowrap",textShadow:"none"}}>
                        {label}
                      </span>
                    </div>
                    {/* Week label */}
                    <div style={{fontSize:7,color:isSelected?C.text:C.sub,fontWeight:isSelected?700:400,marginTop:3,lineHeight:1,whiteSpace:"nowrap"}}>
                      W{w.week}
                    </div>
                    {/* Vendor dot */}
                    <div style={{width:5,height:5,borderRadius:"50%",background:vc,marginTop:2}}/>
                  </div>
                );
              })}
                    </div>
                    {/* Vendor dot */}
                    <div style={{width:5,height:5,borderRadius:"50%",background:vc,marginTop:2}}/>
                  </div>
                );
              })}
            </div>

            <div style={{fontSize:9,color:C.sub,marginTop:8,textAlign:"center"}}>
              Tap any bar to sync all cards · W{allW[sD]?.week} selected
            </div>
          </div>

          {/* Deductions + Savings/Health */}
          <div style={{display:"grid",gridTemplateColumns:wide?"1.35fr 1fr":"1fr",gap:14,marginBottom:16}}>

            {/* Deduction Breakdown */}
            <div style={K()}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700}}>🔍 Deduction Breakdown{helpBtn("deductions")}</div>
                <Nav i={sD} max={allW.length-1} prev={()=>setSD(p=>p-1)} next={()=>setSD(p=>p+1)} label={"W"+dw.week}/>
              </div>
              {helpModal("deductions")}
              {/* Week badge */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:C.bg,borderRadius:9,border:`1px solid ${dg.c}44`,marginBottom:14}}>
                <div>
                  <div style={{fontSize:10,color:C.sub}}>{dw.from} – {dw.to}</div>
                  <div style={{fontSize:13,color:C.text,marginTop:3}}>Net <strong style={{color:dg.c}}>${dw.net.toLocaleString("en-US",{minimumFractionDigits:2})}</strong> · <strong style={{color:dg.c}}>{(dw.net/dw.gross*100).toFixed(1)}%</strong></div>
                </div>
                <div style={{padding:"6px 13px",borderRadius:9,background:`${dg.c}18`,border:`1px solid ${dg.c}55`,textAlign:"center",flexShrink:0}}>
                  <div style={{fontSize:18}}>{dg.i}</div>
                  <div style={{fontSize:10,fontWeight:800,color:dg.c}}>{dg.l}</div>
                </div>
              </div>

              {/* ── COST GROUPS ── */}
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Cost Groups</div>
                <div style={{display:"grid",gridTemplateColumns:dwGroups.length<=3?"repeat(3,1fr)":dwGroups.length===4?"repeat(4,1fr)":"repeat(3,1fr)",gap:9,marginBottom:10}}>
                  {dwGroups.map(g=>(
                    <div key={g.label} style={{background:C.bg,borderRadius:10,padding:"12px 8px",border:`2px solid ${g.isSavings?"#a78bfa55":g.color+"55"}`,textAlign:"center",position:"relative"}}>
                      {g.isSavings&&<div style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",background:"#a78bfa",color:"#fff",fontSize:8,fontWeight:800,padding:"2px 7px",borderRadius:10,whiteSpace:"nowrap"}}>SAVINGS</div>}
                      <div style={{fontSize:20,marginBottom:5}}>{g.icon}</div>
                      <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:17,fontWeight:800,color:g.isSavings?"#a78bfa":g.color}}>${g.amt.toFixed(0)}</div>
                      <div style={{fontSize:9,color:C.sub,marginTop:3,textTransform:"uppercase",letterSpacing:"0.04em"}}>{g.label}</div>
                      <div style={{marginTop:7}}><Tag color={g.isSavings?"#a78bfa":g.color}>{g.pct}% gross</Tag></div>
                    </div>
                  ))}
                </div>
                {/* Stacked bar */}
                <div style={{height:10,borderRadius:5,overflow:"hidden",display:"flex",marginBottom:6}}>
                  {dwGroups.map(g=><div key={g.label} style={{flex:Math.max(g.amt,1),background:g.color,opacity:0.85}}/>)}
                  {(dw.totalDeductions-dwGroupTotal)>0&&<div style={{flex:dw.totalDeductions-dwGroupTotal,background:C.raised}}/>}
                </div>
                <div style={{display:"flex",gap:12,justifyContent:"center",marginBottom:12}}>
                  {dwGroups.map(g=><div key={g.label} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,borderRadius:2,background:g.color}}/><span style={{fontSize:9,color:C.sub}}>{g.label}</span></div>)}
                </div>
                <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12,marginBottom:14}}>


                  {/* ── FUEL EFFICIENCY CARD ── */}
                  {(()=>{
                    // ══ FIXED SETTLEMENT FACTS — nothing changes these ══════════
                    const reportedMiles = (dw.moves||[]).reduce((s,m)=>s+(m.mi||m.miles||0),0);
                    const dwFuelCost    = (dw.deds||[]).filter(d=>["fuel advance","fuel","diesel"].some(k=>d.l.toLowerCase().includes(k))&&!d.l.toLowerCase().includes("escrow")).reduce((s,d)=>s+d.a,0);

                    // ══ ACTUAL GALLONS — from settlement data if available ═══
                    // Use dw.gallons (from rebate note) if present — this is the real number
                    // Fallback: estimate from fuel cost ÷ price slider (less accurate)
                    const hasRealGallons = dw.gallons && dw.gallons > 0;
                    const gallonsBought  = hasRealGallons ? dw.gallons : (fuelPrice>0 ? dwFuelCost/fuelPrice : 0);
                    const gallonsSource  = hasRealGallons ? "from settlement" : "estimated";

                    // ══ SETTLEMENT MPG — permanent truth, never changes with sliders ══
                    // When actual gallons are known, this number is 100% fixed
                    // Price slider does NOT affect this when real gallons are stored
                    const settlementMPG  = gallonsBought>0 ? reportedMiles/gallonsBought : 0;

                    // ══ MPG VERDICT — the only source of red/green ═══════════
                    // Rule: settlementMPG vs fuelMPG baseline
                    //   settlementMPG > fuelMPG → truck ran BETTER than baseline → GREEN
                    //   settlementMPG < fuelMPG → truck ran WORSE than baseline  → RED
                    //
                    // High MPG = efficient = good = green (more miles per gallon)
                    // Low MPG  = wasteful  = bad  = red   (fewer miles per gallon)
                    // High price/gal = bad for wallet but does NOT change this verdict
                    // Low price/gal  = good for wallet but does NOT change this verdict
                    const truckBeatBaseline = settlementMPG >= fuelMPG;
                    const mpgDiff   = Math.abs(settlementMPG - fuelMPG).toFixed(2);
                    const verdictColor = truckBeatBaseline ? C.green : C.red;

                    // ══ FUEL COST INFO — informational only, never drives verdict ══
                    // What the miles SHOULD have cost at baseline MPG and your price
                    const gallonsAtBaseline = fuelMPG>0 ? reportedMiles/fuelMPG : 0;
                    const costAtBaseline    = gallonsAtBaseline * fuelPrice;
                    // Difference in gallons vs baseline (+ = over, - = under)
                    const galDiff = gallonsBought - gallonsAtBaseline;
                    const costDiff = galDiff * fuelPrice; // + means extra spent, - means saved

                    // ══ BUFFER — hidden expense, always red ═════════════════
                    const unpaidMiles   = Math.round(reportedMiles * milesBuffer/100);
                    const gallonsUnpaid = settlementMPG>0 ? unpaidMiles/settlementMPG : 0;
                    const unpaidCost    = gallonsUnpaid * fuelPrice;

                    return(
                      <div style={{background:`${verdictColor}08`,borderRadius:12,border:`1px solid ${verdictColor}33`,padding:"14px",marginBottom:14}}>

                        {/* Header */}
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                          <div style={{display:"flex",alignItems:"center",gap:7}}>
                            <span style={{fontSize:16}}>⛽</span>
                            <span style={{fontSize:12,fontWeight:700,color:C.text}}>Fuel vs Miles Check</span>
                          </div>
                          <span style={{padding:"3px 10px",borderRadius:20,background:`${verdictColor}18`,border:`1px solid ${verdictColor}44`,fontSize:11,fontWeight:700,color:verdictColor}}>
                            {truckBeatBaseline ? "✅ Above Baseline" : "⚠️ Below Baseline"}
                          </span>
                        </div>

                        {/* Settlement MPG — big number, permanent truth */}
                        <div style={{padding:"14px",background:`${verdictColor}10`,borderRadius:10,border:`1px solid ${verdictColor}33`,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                          <div style={{flex:1}}>
                            <div style={{fontSize:10,color:C.sub,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>Settlement MPG This Week</div>
                            <div style={{fontSize:11,color:C.sub,marginBottom:4}}>{reportedMiles.toLocaleString()} paid miles ÷ {gallonsBought.toFixed(1)} gal ({gallonsSource})</div>
                            <div style={{fontSize:12,fontWeight:700,color:verdictColor}}>
                              {truckBeatBaseline
                                ? `✅ +${mpgDiff} above your ${fuelMPG} MPG baseline — efficient`
                                : `⚠️ -${mpgDiff} below your ${fuelMPG} MPG baseline — overconsuming`}
                            </div>
                          </div>
                          <div style={{textAlign:"center",flexShrink:0,marginLeft:16}}>
                            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:40,fontWeight:900,color:verdictColor,lineHeight:1}}>{settlementMPG.toFixed(2)}</div>
                            <div style={{fontSize:9,color:C.sub,marginTop:2}}>MPG actual</div>
                          </div>
                        </div>

                        {/* Three columns — info only, no color judgments */}
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                          {[
                            {l:"Miles (Paid)",       v:`${reportedMiles.toLocaleString()} mi`,  sub:"Settlement reported",                c:C.accent},
                            {l:`At ${fuelMPG} MPG`,  v:`${gallonsAtBaseline.toFixed(0)} gal`,   sub:`Baseline cost $${costAtBaseline.toFixed(0)}`, c:C.sub},
                            {l:"Fuel Cost",           v:`$${dwFuelCost.toFixed(0)}`,             sub:`~${gallonsBought.toFixed(0)} gal est`, c:C.sub},
                          ].map(s=>(
                            <div key={s.l} style={{background:C.bg,borderRadius:9,padding:"10px 8px",border:`1px solid ${C.border}`,textAlign:"center"}}>
                              <div style={{fontSize:9,color:C.sub,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4,lineHeight:1.3}}>{s.l}</div>
                              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:800,color:s.c}}>{s.v}</div>
                              <div style={{fontSize:9,color:C.sub,marginTop:3,lineHeight:1.4}}>{s.sub}</div>
                            </div>
                          ))}
                        </div>

                        {/* Fuel cost vs baseline — informational, grey border only */}
                        <div style={{padding:"10px 13px",background:C.raised,borderRadius:9,border:`1px solid ${C.border}`,marginBottom:12}}>
                          <div style={{fontSize:11,color:C.sub}}>
                            {galDiff>5
                              ? `Bought ~${galDiff.toFixed(0)} more gallons than ${fuelMPG} MPG baseline needed — possible over-fueling ($${costDiff.toFixed(0)} extra)`
                              : galDiff<-5
                              ? `Bought ~${Math.abs(galDiff).toFixed(0)} fewer gallons than baseline — efficiency saved ~$${Math.abs(costDiff).toFixed(0)}`
                              : `Gallons bought vs baseline — within normal range`}
                          </div>
                          <div style={{fontSize:9,color:C.sub,marginTop:4}}>ℹ️ This estimate depends on your $/gal setting — set to your actual Pilot price for accuracy</div>
                        </div>

                        {/* Unpaid miles — buffer driven, always red */}
                        {unpaidMiles>0&&(
                          <div style={{padding:"10px 13px",background:`${C.red}10`,borderRadius:9,border:`1px solid ${C.red}44`,marginBottom:12}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                              <div>
                                <div style={{fontSize:12,fontWeight:700,color:C.red}}>🚫 ~{unpaidMiles} unpaid miles — your expense</div>
                                <div style={{fontSize:11,color:C.sub,marginTop:2}}>Drove these miles, broker paid $0. Burned ~{gallonsUnpaid.toFixed(0)} gal at your cost.</div>
                              </div>
                              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:900,color:C.red,flexShrink:0,marginLeft:10}}>-${unpaidCost.toFixed(0)}</div>
                            </div>
                          </div>
                        )}

                        {/* Sliders */}
                        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12}}>
                          <div style={{fontSize:9,color:C.gold,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.07em"}}>⚙️ Calibrate — set once for your truck</div>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>

                            {/* MPG baseline — higher = more efficient = green verdict */}
                            <div style={{background:C.bg,borderRadius:9,padding:"10px",border:`1px solid ${C.border}`}}>
                              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                                <div style={{fontSize:10,color:C.sub,fontWeight:600}}>Truck Baseline MPG</div>
                                <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:800,color:C.accent}}>{fuelMPG.toFixed(1)}</span>
                              </div>
                              <input type="range" min="3.5" max="9.0" step="0.1" value={fuelMPG}
                                onChange={e=>setFuelMPG(parseFloat(e.target.value))}
                                style={{width:"100%",accentColor:C.accent,cursor:"pointer",marginBottom:4}}/>
                              <div style={{display:"flex",justifyContent:"space-between",fontSize:8}}>
                                <span style={{color:C.red}}>3.5 🔴 poor</span>
                                <span style={{color:C.green}}>9.0 🟢 great</span>
                              </div>
                              <div style={{fontSize:9,color:C.sub,marginTop:5,lineHeight:1.5}}>Set to your truck's known average. Card turns GREEN when settlement MPG beats this.</div>
                            </div>

                            {/* Price per gallon — calibration only, affects dollar display only */}
                            <div style={{background:C.bg,borderRadius:9,padding:"10px",border:`1px solid ${C.border}`}}>
                              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                                <div style={{fontSize:10,color:C.sub,fontWeight:600}}>Price Per Gallon</div>
                                <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:800,color:fuelPrice>=6?C.red:C.gold}}>${fuelPrice.toFixed(2)}</span>
                              </div>
                              <input type="range" min="3.50" max="8.00" step="0.01" value={fuelPrice}
                                onChange={e=>setFuelPrice(parseFloat(e.target.value))}
                                style={{width:"100%",accentColor:C.accent,cursor:"pointer",marginBottom:4}}/>
                              <div style={{display:"flex",justifyContent:"space-between",fontSize:8}}>
                                <span style={{color:C.green}}>$3.50 🟢 cheap</span>
                                <span style={{color:C.red}}>$8.00 🔴 expensive</span>
                              </div>
                              <div style={{fontSize:9,color:C.sub,marginTop:5,lineHeight:1.5}}>{hasRealGallons?"Real gallons from your settlement. Price only affects dollar estimates below.":"Match your Pilot receipt. Affects gallon estimate when real gallons not stored — NOT the green/red verdict."}</div>
                            </div>
                          </div>

                          {/* Miles buffer */}
                          <div style={{background:unpaidMiles>0?`${C.red}08`:C.bg,borderRadius:9,padding:"10px",border:`1px solid ${unpaidMiles>0?C.red+"33":C.border}`}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                              <div>
                                <div style={{fontSize:10,color:C.sub,fontWeight:600}}>Unreported Miles Buffer</div>
                                <div style={{fontSize:9,color:C.sub,marginTop:1}}>Wrong turns, yard moves, short routes</div>
                              </div>
                              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:800,color:unpaidMiles>0?C.red:C.sub}}>+{milesBuffer}%</span>
                            </div>
                            <input type="range" min="0" max="15" step="1" value={milesBuffer}
                              onChange={e=>setMilesBuffer(parseInt(e.target.value))}
                              style={{width:"100%",accentColor:C.red,cursor:"pointer",marginBottom:4}}/>
                            <div style={{display:"flex",justifyContent:"space-between",fontSize:8}}>
                              <span style={{color:C.green}}>0% = no hidden cost</span>
                              <span style={{color:C.red}}>15% = big expense 🔴</span>
                            </div>
                            {milesBuffer===0
                              ? <div style={{fontSize:9,color:C.sub,marginTop:5}}>Slide right to show cost of miles driven but not paid for by broker.</div>
                              : <div style={{fontSize:9,color:C.red,marginTop:5}}>Higher % = more unpaid miles = more money out of your pocket. Never rewarding.</div>}
                          </div>
                        </div>
                      </div>
                    );
                  })()}


                  {!focusMode&&<div style={{fontSize:10,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Line Items</div>}
                </div>
              </div>

              {/* Individual deduction bars — hidden in focus mode */}
              {!focusMode&&[...dwDeds].sort((a,b)=>b.a-a.a).map((d,i)=>{
                const pct=(d.a/dw.gross*100).toFixed(1);const big=d.a>200;
                const isEscrow=d.l.toLowerCase().includes("escrow");
                return(
                  <div key={i} style={{marginBottom:9}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                      <span style={{fontSize:12,color:isEscrow?C.a3:C.text,flex:1}}>{d.l}{isEscrow&&<span style={{fontSize:9,color:C.a3,marginLeft:5,fontWeight:700}}>SAVINGS</span>}</span>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                        <Tag color={isEscrow?C.a3:big?C.red:C.gold}>{pct}%</Tag>
                        <span style={{fontSize:12,fontWeight:700,color:isEscrow?C.a3:big?C.red:C.text,minWidth:64,textAlign:"right"}}>${d.a.toFixed(2)}</span>
                      </div>
                    </div>
                    <Bar pct={d.a/dw.totalDeductions*100} color={isEscrow?C.a3:big?C.red:d.a>50?C.gold:C.accent}/>
                  </div>
                );
              })}
              <div style={{marginTop:12,paddingTop:11,borderTop:`1px solid ${C.border}`}}>
                {/* Escrow shown separately as SAVINGS */}
                {dwDeds.filter(d=>d.l.toLowerCase().includes("escrow")).length>0&&(
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,padding:"8px 12px",background:"#a78bfa12",borderRadius:8,border:"1px solid #a78bfa33"}}>
                    <span style={{fontSize:11,color:"#a78bfa",fontWeight:700}}>🏦 Escrow (Your Savings)</span>
                    <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:800,color:"#a78bfa"}}>
                      +${dwDeds.filter(d=>d.l.toLowerCase().includes("escrow")).reduce((s,d)=>s+d.a,0).toFixed(2)}
                    </span>
                  </div>
                )}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:11,color:C.sub}}>Total Costs (excl. escrow)</span>
                  <div style={{display:"flex",gap:9,alignItems:"center"}}>
                    <Tag color={C.red}>{((dw.totalDeductions - dwDeds.filter(d=>d.l.toLowerCase().includes("escrow")).reduce((s,d)=>s+d.a,0))/dw.gross*100).toFixed(1)}% of gross</Tag>
                    <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:800,color:C.red}}>
                      ${(dw.totalDeductions - dwDeds.filter(d=>d.l.toLowerCase().includes("escrow")).reduce((s,d)=>s+d.a,0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right col */}
            <div style={{display:"flex",flexDirection:"column",gap:14}}>

              {/* Business Health — per vendor */}
              <div style={K()}>
                <div style={{fontSize:11,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>📊 Business Health{helpBtn("health")}</div>
                {helpModal("health")}
                {vendorStats.map((v,vi)=>{
                  const vw=allW.filter(w=>detectVendor(w)===v.key);
                  const vGross=vw.reduce((s,w)=>s+w.gross,0);
                  const vNet=vw.reduce((s,w)=>s+w.net,0);
                  const vMargin=vGross>0?(vNet/vGross*100).toFixed(1):"0.0";
                  const vMoves=vw.flatMap(w=>w.moves||[]);
                  const vLoaded=vMoves.length>0?Math.round(vMoves.filter(m=>m.t==="L"||m.type==="L").length/vMoves.length*100):0;
                  const vFuel=vw.reduce((s,w)=>s+(w.deds||[]).filter(d=>d.l.toLowerCase().includes("fuel")).reduce((ss,d)=>ss+d.a,0),0);
                  const vFuelPct=vGross>0?(vFuel/vGross*100).toFixed(0):0;
                  return(
                    <div key={v.key} style={{marginBottom:vi<vendorStats.length-1?16:0,paddingBottom:vi<vendorStats.length-1?16:0,borderBottom:vi<vendorStats.length-1?`1px solid ${C.border}`:"none"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <span style={{fontSize:16}}>{v.icon}</span>
                          <span style={{fontSize:11,fontWeight:700,color:v.color}}>
                            {demoMode
                              ? "Demo Driver Co"
                              : (profile.company||profile.name||v.name)
                            }
                          </span>
                        </div>
                        <Tag color={v.color}>{vMargin}% margin</Tag>
                      </div>
                      {[
                        {l:"Net Margin",  pct:+vMargin,  txt:`${vMargin}%`,  c:+vMargin>20?C.green:C.red},
                        {l:"Loaded %",   pct:vLoaded,   txt:`${vLoaded}%`,  c:vLoaded>=60?C.green:C.gold},
                        {l:"Fuel/Gross", pct:+vFuelPct, txt:`${vFuelPct}%`, c:C.red},
                      ].map(m=>(
                        <div key={m.l} style={{marginBottom:8}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                            <span style={{fontSize:10,color:C.sub}}>{m.l}</span>
                            <span style={{fontSize:11,fontWeight:700,color:m.c}}>{m.txt}</span>
                          </div>
                          <Bar pct={Math.min(m.pct,100)} color={m.c}/>
                        </div>
                      ))}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginTop:10}}>
                        {[
                          {l:"Weeks",v:`${vw.length}`,             c:v.color},
                          {l:"YTD Net",v:`$${(vNet/1000).toFixed(1)}k`, c:C.green},
                          {l:"Moves",v:`${vMoves.length}`,          c:C.a3},
                        ].map(s=>(
                          <div key={s.l} style={{background:C.bg,borderRadius:7,padding:"7px 8px",border:`1px solid ${C.border}`,textAlign:"center"}}>
                            <div style={{fontSize:8,color:C.sub,textTransform:"uppercase",marginBottom:3}}>{s.l}</div>
                            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,color:s.c}}>{s.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Week Grades — per vendor */}
              <div style={K()}>
                <div style={{fontSize:11,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>🏆 Week Grades{helpBtn("grades")}</div>
                {helpModal("grades")}
                {vendorStats.map((v,vi)=>{
                  const vwi=allW.map((w,i)=>({w,i})).filter(({w})=>detectVendor(w)===v.key);
                  const vAvg=vwi.length>0?vwi.reduce((s,{w})=>s+w.net/w.gross*100,0)/vwi.length:0;
                  return(
                    <div key={v.key} style={{marginBottom:vi<vendorStats.length-1?14:0,paddingBottom:vi<vendorStats.length-1?14:0,borderBottom:vi<vendorStats.length-1?`1px solid ${C.border}`:"none"}}>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
                        <span style={{fontSize:13}}>{v.icon}</span>
                        <span style={{fontSize:10,fontWeight:700,color:v.color}}>{v.short}</span>
                        <span style={{fontSize:9,color:C.sub}}>avg {vAvg.toFixed(1)}%</span>
                      </div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                        {vwi.map(({w,i})=>{const g=wg(w);return(
                          <div key={w.week} onClick={()=>setSH(i)} style={{padding:"5px 9px",borderRadius:7,background:i===sH?`${v.color}30`:`${v.color}12`,border:`2px solid ${i===sH?v.color:v.color+"33"}`,textAlign:"center",cursor:"pointer",minWidth:52}}>
                            <div style={{fontSize:8,color:C.sub}}>W{w.week}</div>
                            <div style={{fontSize:10,fontWeight:800,color:v.color}}>{g.i}</div>
                            <div style={{fontSize:8,color:v.color,opacity:0.8}}>{g.l}</div>
                          </div>
                        );})}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Savings & Escrow */}
              <div style={K({background:"linear-gradient(135deg,#0f1f14,#0f102a)",border:`1px solid ${C.green}44`})}>
                <div style={{fontSize:11,fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>💰 Savings & Escrow{helpBtn("savings")}</div>
                {helpModal("savings")}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                  {[{l:"YTD Escrow",v:`$${(tEscReg+tEsc290).toFixed(0)}`,c:C.a3},{l:"YTD Rebates",v:`$${tRebates.toFixed(2)}`,c:C.green}].map(s=>(
                    <div key={s.l} style={{background:C.bg,borderRadius:9,padding:"10px",border:`1px solid ${C.border}`,textAlign:"center"}}>
                      <div style={{fontSize:9,color:C.sub,textTransform:"uppercase",marginBottom:4}}>{s.l}</div>
                      <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:17,fontWeight:800,color:s.c}}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginBottom:5}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:10,color:C.sub}}>Escrow Progress</span>
                    <span style={{fontSize:11,fontWeight:700,color:C.a3}}>${(tEscReg+tEsc290).toFixed(0)} / $2,500</span>
                  </div>
                  <Bar pct={(tEscReg+tEsc290)/2500*100} color={C.a3}/>
                </div>
              </div>

            </div>
          </div>

          {/* ── EXPENSES CARD ── */}
          {(()=>{
            const EXP_CATS=["Parts","Labor","Tires","Maintenance","Fuel","Permits","Other"];
            const CAT_C={"Parts":C.red,"Labor":C.gold,"Tires":C.sub,"Maintenance":C.accent,"Fuel":C.red,"Permits":C.a3,"Other":C.sub};
            const expTotal=expenses.reduce((s,e)=>s+parseFloat(e.amount||0),0);
            const expThis=expenses.filter(e=>e.weekRef===dw.week).reduce((s,e)=>s+parseFloat(e.amount||0),0);
            const trueNet=dw.net-expThis;
            const byCat=EXP_CATS.map(cat=>({cat,amt:expenses.filter(e=>e.category===cat).reduce((s,e)=>s+parseFloat(e.amount||0),0)})).filter(e=>e.amt>0);
            return(
              <div style={K({marginBottom:16})}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700}}>🔧 Extra Expenses{helpBtn("expenses")}</div>
                  <button onClick={()=>setShowExpenseForm(p=>!p)} style={{padding:"6px 12px",borderRadius:8,background:showExpenseForm?`${C.red}20`:`${C.accent}18`,border:`1px solid ${showExpenseForm?C.red:C.accent}55`,color:showExpenseForm?C.red:C.accent,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                    {showExpenseForm?"✕ Cancel":"+ Add"}
                  </button>
                </div>
                {helpModal("expenses")}

                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
                  {[
                    {l:"All Time",v:"$"+expTotal.toFixed(2),c:expTotal>0?C.red:C.sub},
                    {l:"Week "+dw.week,v:"$"+expThis.toFixed(2),c:expThis>0?C.red:C.sub},
                    {l:"True Net W"+dw.week,v:"$"+trueNet.toFixed(2),c:trueNet>0?C.green:C.red},
                  ].map(s=>(
                    <div key={s.l} style={{background:C.bg,borderRadius:9,padding:"10px 8px",border:`1px solid ${C.border}`,textAlign:"center"}}>
                      <div style={{fontSize:9,color:C.sub,textTransform:"uppercase",marginBottom:3}}>{s.l}</div>
                      <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:800,color:s.c}}>{s.v}</div>
                    </div>
                  ))}
                </div>

                {showExpenseForm&&(
                  <div style={{background:C.bg,borderRadius:10,padding:"13px",border:`1px solid ${C.border}`,marginBottom:12}}>
                    <div style={{padding:"9px 12px",background:`${C.a3}10`,borderRadius:8,border:`1px dashed ${C.a3}44`,marginBottom:10,textAlign:"center",cursor:"pointer"}} onClick={()=>expRef.current&&expRef.current.click()}>
                      <input ref={expRef} type="file" accept="image/*,.pdf" style={{display:"none"}} onChange={e=>{if(e.target.files[0])readReceipt(e.target.files[0]);}}/>
                      <div style={{fontSize:12,color:C.a3,fontWeight:600}}>{expScan?"⏳ Reading...":"📷 Upload Receipt — AI reads it"}</div>
                      {expScanMsg&&<div style={{fontSize:10,color:expScanMsg.startsWith("Receipt")?C.green:C.red,marginTop:4}}>{expScanMsg}</div>}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                      <div>
                        <div style={{fontSize:9,color:C.sub,marginBottom:3,textTransform:"uppercase",fontWeight:600}}>Date</div>
                        <input type="date" value={expForm.date} onChange={e=>setExpForm(p=>({...p,date:e.target.value}))} style={{width:"100%",padding:"8px 10px",background:C.raised,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,fontSize:12,boxSizing:"border-box",fontFamily:"inherit",outline:"none"}}/>
                      </div>
                      <div>
                        <div style={{fontSize:9,color:C.sub,marginBottom:3,textTransform:"uppercase",fontWeight:600}}>Amount ($)</div>
                        <input type="number" step="0.01" value={expForm.amount} onChange={e=>setExpForm(p=>({...p,amount:e.target.value}))} placeholder="0.00" style={{width:"100%",padding:"8px 10px",background:C.raised,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,fontSize:12,boxSizing:"border-box",fontFamily:"inherit",outline:"none"}}/>
                      </div>
                    </div>
                    <div style={{marginBottom:8}}>
                      <div style={{fontSize:9,color:C.sub,marginBottom:4,textTransform:"uppercase",fontWeight:600}}>Category</div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                        {EXP_CATS.map(cat=>(
                          <button key={cat} onClick={()=>setExpForm(p=>({...p,category:cat}))} style={{padding:"4px 9px",borderRadius:5,background:expForm.category===cat?`${CAT_C[cat]||C.sub}22`:"transparent",border:`1px solid ${expForm.category===cat?CAT_C[cat]||C.sub:C.border}`,color:expForm.category===cat?CAT_C[cat]||C.sub:C.sub,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>{cat}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                      <div>
                        <div style={{fontSize:9,color:C.sub,marginBottom:3,textTransform:"uppercase",fontWeight:600}}>Description</div>
                        <input value={expForm.desc} onChange={e=>setExpForm(p=>({...p,desc:e.target.value}))} placeholder="e.g. Brake pads" style={{width:"100%",padding:"8px 10px",background:C.raised,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,fontSize:12,boxSizing:"border-box",fontFamily:"inherit",outline:"none"}}/>
                      </div>
                      <div>
                        <div style={{fontSize:9,color:C.sub,marginBottom:3,textTransform:"uppercase",fontWeight:600}}>Link to Week</div>
                        <select value={expForm.weekRef||""} onChange={e=>setExpForm(p=>({...p,weekRef:e.target.value}))} style={{width:"100%",padding:"8px 10px",background:C.raised,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,fontSize:12,boxSizing:"border-box",fontFamily:"inherit",outline:"none",cursor:"pointer"}}>
                          <option value="">— None —</option>
                          {[...allW].reverse().map(w=><option key={w.week} value={w.week}>{w.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <button onClick={()=>{
                      if(!expForm.amount||!expForm.desc)return;
                      setExpenses(p=>[{id:Date.now(),date:expForm.date||new Date().toLocaleDateString(),category:expForm.category,desc:expForm.desc,amount:parseFloat(expForm.amount)||0,note:expForm.note,weekRef:expForm.weekRef||""},...p]);
                      setExpForm({date:"",category:"Parts",desc:"",amount:"",note:"",weekRef:""});
                      setExpScanMsg("");setShowExpenseForm(false);
                    }} style={{width:"100%",padding:"9px",borderRadius:8,background:`linear-gradient(135deg,${C.accent},${C.a3})`,color:"#000",fontWeight:700,fontSize:12,border:"none",cursor:"pointer",fontFamily:"inherit"}}>
                      💾 Save Expense
                    </button>
                  </div>
                )}

                {byCat.length>0&&(
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                    {byCat.map(e=><div key={e.cat} style={{padding:"3px 9px",borderRadius:5,background:`${CAT_C[e.cat]||C.sub}15`,border:`1px solid ${CAT_C[e.cat]||C.sub}33`,fontSize:10,color:CAT_C[e.cat]||C.sub,fontWeight:600}}>{e.cat} ${e.amt.toFixed(0)}</div>)}
                  </div>
                )}

                {expenses.length>0?(
                  <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:220,overflowY:"auto"}}>
                    {expenses.map(e=>(
                      <div key={e.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 11px",background:C.bg,borderRadius:8,border:`1px solid ${C.border}`}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                            <span style={{padding:"1px 6px",borderRadius:4,fontSize:9,fontWeight:700,background:`${CAT_C[e.category]||C.sub}18`,color:CAT_C[e.category]||C.sub}}>{e.category}</span>
                            {e.weekRef&&<span style={{fontSize:9,color:C.sub}}>W{e.weekRef}</span>}
                            <span style={{fontSize:9,color:C.sub}}>{e.date}</span>
                          </div>
                          <div style={{fontSize:11,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.desc}</div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0,marginLeft:8}}>
                          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,color:C.red}}>-${parseFloat(e.amount).toFixed(2)}</span>
                          <button onClick={()=>setExpenses(p=>p.filter(x=>x.id!==e.id))} style={{background:"none",border:"none",color:C.sub,fontSize:14,cursor:"pointer",padding:"0 2px"}}>×</button>
                        </div>
                      </div>
                    ))}
                    <div style={{padding:"7px 11px",background:`${C.red}10`,borderRadius:7,border:`1px solid ${C.red}22`,display:"flex",justifyContent:"space-between",fontSize:11}}>
                      <span style={{color:C.sub}}>{expenses.length} expense{expenses.length>1?"s":""}</span>
                      <span style={{color:C.red,fontWeight:700}}>Total: -${expTotal.toFixed(2)}</span>
                    </div>
                  </div>
                ):(
                  <div style={{textAlign:"center",padding:"16px",color:C.sub,fontSize:11}}>No expenses yet. Add parts, labor, tires — any cost not on your settlement.</div>
                )}
              </div>
            );
          })()}

          {/* Move Performance — hidden in focus mode */}
          {!focusMode&&<div style={K()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700}}>🚛 Move Performance{helpBtn("movePerf")}</div>
            </div>{helpModal("movePerf")}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div/><Nav i={sM} max={allW.length-1} prev={()=>setSM(p=>p-1)} next={()=>setSM(p=>p+1)} label={`W${mwBase.week}`}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:14}}>
              {[{l:"Gross",v:`$${mwBase.gross.toLocaleString("en-US",{minimumFractionDigits:2})}`,c:C.accent},{l:"Net",v:`$${mwBase.net.toLocaleString("en-US",{minimumFractionDigits:2})}`,c:C.green},{l:"Avg RPM",v:`$${mwRPM}`,c:C.a3},{l:"Loaded %",v:`${mwLd}%`,c:mwLd>=60?C.green:C.gold}].map(s=>(
                <div key={s.l} style={{background:C.bg,borderRadius:9,padding:"10px",border:`1px solid ${C.border}`,textAlign:"center"}}>
                  <div style={{fontSize:9,color:C.sub,textTransform:"uppercase",marginBottom:4}}>{s.l}</div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:700,color:s.c}}>{s.v}</div>
                </div>
              ))}
            </div>
            <div style={{overflowX:"auto",overflowY:"auto",maxHeight:320,borderRadius:8,border:`1px solid ${C.border}`}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{borderBottom:`2px solid ${C.border}`,background:C.raised}}>{["Type","Route","Mi","Rate","FSC","Total","RPM","Grade"].map(h=><th key={h} style={{textAlign:"left",padding:"9px 9px",color:C.sub,fontWeight:700,fontSize:10,textTransform:"uppercase",whiteSpace:"nowrap",position:"sticky",top:0,background:C.raised,zIndex:2}}>{h}</th>)}</tr></thead>
                <tbody>{mwMoves.map((m,i)=>{const s=scoreMove(m);return(
                  <tr key={i} style={{borderBottom:`1px solid ${C.border}`,background:i%2?"#ffffff06":"transparent"}}>
                    <td style={{padding:"9px"}}><span style={{padding:"3px 8px",borderRadius:5,fontSize:10,fontWeight:700,background:m.type==="L"?`${C.green}25`:`${C.gold}25`,color:m.type==="L"?C.green:C.gold}}>{m.type==="L"?"LOAD":"EMPTY"}</span></td>
                    <td style={{padding:"9px",color:C.text,whiteSpace:"nowrap",fontSize:11}}>{m.from}→{m.to}</td>
                    <td style={{padding:"9px",color:C.text}}>{m.miles}</td>
                    <td style={{padding:"9px",color:C.text}}>${m.rate}</td>
                    <td style={{padding:"9px",color:m.fsc>0?C.accent:C.sub}}>{m.fsc>0?`$${m.fsc}`:"—"}</td>
                    <td style={{padding:"9px",color:C.text,fontWeight:600}}>${(m.rate+m.fsc).toFixed(2)}</td>
                    <td style={{padding:"9px",color:+s.rpm>=2.5?C.green:C.red,fontWeight:700}}>${s.rpm}</td>
                    <td style={{padding:"9px"}}><Tag color={gc(s.grade)}>{s.grade}</Tag></td>
                  </tr>
                );})}
                </tbody>
              </table>
            </div>
          </div>}

          {/* ── WEEKLY ACTION PLAN ── */}
          {(()=>{
            const lw=safeW[sD]||safeW[safeW.length-1];
            const lwGrade=wg(lw);
            const lwFuel=(lw.deds||[]).filter(function(d){return d.l.toLowerCase().includes("fuel");}).reduce(function(s,d){return s+d.a;},0);
            const lwLoaded=lw.moves&&lw.moves.length>0?Math.round(lw.moves.filter(function(m){return m.t==="L"||m.type==="L";}).length/lw.moves.length*100):0;
            const targetNet=parseFloat(profile.targetWeeklyNet)||3000;
            const gap=targetNet-lw.net;
            const avgRPMnum=parseFloat(avgRPM)||0;
            const actions=[];
            if(lw.net<targetNet&&gap>0)actions.push({icon:"💰",color:C.gold,title:"Close the $"+Math.round(gap).toLocaleString()+" gap to your weekly target",detail:"W"+lw.week+" net was $"+lw.net.toFixed(0)+". "+Math.ceil(gap/250)+" additional loaded runs at your average rate would close this gap. Use the Offer Scorer before accepting any new load."});
            if(lwLoaded<60)actions.push({icon:"📦",color:C.accent,title:"Boost your loaded percentage — currently "+lwLoaded+"%",detail:"Less than 60% loaded miles hurts your revenue per mile. Prioritize back-to-back loaded moves and use DAT or the CPG board to minimize empty legs."});
            if(lwFuel>800)actions.push({icon:"⛽",color:C.red,title:"Fuel cost of $"+Math.round(lwFuel).toLocaleString()+" is high this week",detail:"Check if your settlement MPG is below your "+fuelMPG+" MPG baseline. High fuel advances could mean inefficient routes or over-fueling. Enroll in a fuel card program to recover 5–12% in savings."});
            if(avgRPMnum<2.5)actions.push({icon:"📈",color:C.a3,title:"Avg RPM of $"+avgRPM+" is below the $2.50 target",detail:"Your revenue per mile is below the efficiency threshold. Review your route mix in Move Performance and decline any new D-grade offers — they cost more than they pay."});
            if(tNet/tGross<0.5)actions.push({icon:"🔍",color:C.red,title:"Net margin of "+(tNet/tGross*100).toFixed(1)+"% needs attention",detail:"You're keeping less than 50 cents of every dollar earned. Review deduction breakdown for cost categories that can be reduced — especially operations fees and insurance options."});
            if(allMoves.filter(function(m){return scoreMove(m).grade==="A";}).length<3)actions.push({icon:"🔥",color:C.green,title:"Find more Grade A routes — you have fewer than 3 this period",detail:"Grade A routes are your profit engine. Check your top earning moves in Full History and ask CPG for more volume on those specific lanes."});
            const topActions=actions.slice(0,3);
            if(topActions.length===0)return null;
            return(
              <div style={K({marginBottom:16})}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700}}>🎯 Weekly Action Plan{helpBtn("actionPlan")}</div>
                  <div style={{fontSize:9,padding:"2px 7px",borderRadius:5,background:C.green+"20",color:C.green,fontWeight:700,marginLeft:"auto"}}>W{lw.week} · {topActions.length} actions</div>
                </div>
                {helpModal("actionPlan")}
                <div style={{fontSize:10,color:C.sub,marginBottom:10}}>Based on your real data — specific, actionable, updated each week</div>
                <div style={{display:"flex",flexDirection:"column",gap:9}}>
                  {topActions.map(function(a,idx){
                    return(
                      <div key={idx} style={{display:"flex",gap:10,padding:"11px 12px",background:C.bg,borderRadius:9,border:"1px solid "+a.color+"44"}}>
                        <div style={{width:32,height:32,borderRadius:8,background:a.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{a.icon}</div>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:3}}>{a.title}</div>
                          <div style={{fontSize:10,color:C.sub,lineHeight:1.6}}>{a.detail}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

        </div>
      )}

      {/* ══ LOADS ════════════════════════════════════════════════════════════ */}
      {tab==="loads"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
            <div>
              <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:800,margin:0}}>📋 Document Analyzer</h1>
              <p style={{color:C.sub,fontSize:11,marginTop:4,marginBottom:0}}>Upload · Scan · Score · Analyze · Full history</p>
            </div>
            <button onClick={()=>setShowAdd(p=>!p)} style={{padding:"10px 16px",borderRadius:9,background:C.accent,color:"#000",fontWeight:700,fontSize:12,border:"none",cursor:"pointer"}}>+ Add Move</button>
          </div>


          {/* Settlement Input Card */}
          <div style={K({border:`1px solid ${C.a3}55`,marginBottom:16})}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <div style={{width:38,height:38,borderRadius:10,background:`${C.a3}18`,border:`1px solid ${C.a3}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>📄</div>
              <div>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700}}>Add Settlement Week{helpBtn("addSettlement")}</div>
                <div style={{fontSize:11,color:C.sub,marginTop:2}}>Upload PDF · Paste text · Type numbers</div>
              </div>
            </div>
            {helpModal("addSettlement")}

            {/* hidden file input - PDF only */}
            <input ref={fileRef} type="file" accept="application/pdf,.pdf" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f){setScanMode("scan");scanPDF(f,"pdf");}e.target.value="";}}/>
            {/* hidden file input - camera/photo */}
            <input ref={imgRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f){setScanMode("scan");scanPDF(f,"image");}e.target.value="";}}/>

            {/* Mode tabs */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:16}}>
              {[
                {m:"scan",  icon:"📤", label:"Upload PDF", desc:"Tap to scan"},
                {m:"paste", icon:"📋", label:"Paste Text",  desc:"Copy & paste"},
                {m:"form",  icon:"✏️", label:"Type In",    desc:"Manual"},
                {m:"tips",  icon:"💡", label:"How To",     desc:"Guide"},
              ].map(t=>(
                <button key={t.m} onClick={()=>{setScanMode(t.m);if(t.m==="scan")fileRef.current?.click();}}
                  style={{padding:"9px 4px",borderRadius:9,background:scanMode===t.m?`${C.a3}25`:C.raised,border:`1px solid ${scanMode===t.m?C.a3:C.border}`,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                  <div style={{fontSize:16,marginBottom:3}}>{t.icon}</div>
                  <div style={{fontSize:10,fontWeight:700,color:scanMode===t.m?C.a3:C.text}}>{t.label}</div>
                  <div style={{fontSize:9,color:C.sub}}>{t.desc}</div>
                </button>
              ))}
            </div>

            {/* ── MODE: SCAN / UPLOAD PDF ── */}
            {scanMode==="scan"&&(
              <div>
                {!scanning&&!scanResult&&(
                  <div style={{marginBottom:12}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                      {/* PDF from Files */}
                      <button onClick={()=>fileRef.current?.click()} style={{padding:"22px 10px",borderRadius:14,background:`linear-gradient(135deg,${C.a3}20,${C.accent}15)`,border:`2px solid ${C.a3}`,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                        <div style={{fontSize:32,marginBottom:8}}>📂</div>
                        <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:800,color:C.a3,marginBottom:4}}>Open PDF File</div>
                        <div style={{fontSize:10,color:C.sub,lineHeight:1.5}}>Browse your Downloads or Files app</div>
                      </button>
                      {/* Camera / Photo */}
                      <button onClick={()=>imgRef.current?.click()} style={{padding:"22px 10px",borderRadius:14,background:`linear-gradient(135deg,${C.gold}15,${C.a3}10)`,border:`2px solid ${C.gold}`,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                        <div style={{fontSize:32,marginBottom:8}}>📷</div>
                        <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:800,color:C.gold,marginBottom:4}}>Take a Photo</div>
                        <div style={{fontSize:10,color:C.sub,lineHeight:1.5}}>Photo of printed statement</div>
                      </button>
                    </div>
                    <div style={{padding:"10px 12px",background:`${C.gold}10`,borderRadius:9,border:`1px solid ${C.gold}30`,fontSize:10,color:C.sub,lineHeight:1.7}}>
                      💡 <strong style={{color:C.gold}}>Tip:</strong> Use <strong style={{color:C.text}}>Open PDF File</strong> if your settlement is saved as a PDF in Downloads. Use <strong style={{color:C.text}}>Take a Photo</strong> if you have a printed copy.
                    </div>
                  </div>
                )}
                {scanning&&(
                  <div style={{textAlign:"center",padding:"32px 16px"}}>
                    <div style={{fontSize:42,marginBottom:12}}>⏳</div>
                    <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:800,color:C.a3,marginBottom:6}}>AI Reading Your Settlement...</div>
                    <div style={{fontSize:11,color:C.sub,marginBottom:16}}>Extracting all moves, deductions, and totals</div>
                    <div style={{height:4,background:C.raised,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:"70%",background:`linear-gradient(90deg,${C.a3},${C.accent})`,borderRadius:4}}/></div>
                  </div>
                )}
                {scanResult&&!scanning&&(
                  <div style={{background:C.bg,borderRadius:10,border:`1px solid ${C.a3}44`,padding:14}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.a3,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.08em"}}>✅ PDF Read — Review & Confirm</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:12}}>
                      {[
                        {l:"Week",v:`Week ${scanResult.week}`},
                        {l:"Dates",v:`${scanResult.from||"?"}–${scanResult.to||"?"}`},
                        {l:"Gross",v:`$${Number(scanResult.gross||0).toFixed(2)}`},
                        {l:"Net Pay",v:`$${Number(scanResult.net||0).toFixed(2)}`},
                        {l:"Deductions",v:`$${Number(scanResult.totalDeductions||0).toFixed(2)}`},
                        {l:"Margin",v:`${scanResult.gross>0?(scanResult.net/scanResult.gross*100).toFixed(1):0}%`},
                        {l:"Moves",v:`${scanResult.moves?.length||0} found`},
                        {l:"Ded. Lines",v:`${scanResult.deds?.length||0} items`},
                      ].map(s=>(
                        <div key={s.l} style={{background:C.raised,borderRadius:8,padding:"9px 11px",border:`1px solid ${C.border}`}}>
                          <div style={{fontSize:9,color:C.sub,textTransform:"uppercase",marginBottom:3}}>{s.l}</div>
                          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,color:C.text}}>{s.v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:10,marginBottom:10}}>
                      <button onClick={confirmScan} style={{flex:1,padding:"13px",borderRadius:9,background:`linear-gradient(135deg,${C.accent},${C.a3})`,color:"#000",fontWeight:800,fontSize:13,border:"none",cursor:"pointer"}}>✅ Save Week {scanResult.week}</button>
                      <button onClick={()=>{setScanResult(null);setScanMsg("");}} style={{padding:"13px 16px",borderRadius:9,background:"transparent",color:C.sub,fontWeight:700,border:`1px solid ${C.border}`,cursor:"pointer"}}>✕</button>
                    </div>
                    <button onClick={()=>{setScanResult(null);setScanMsg("");fileRef.current?.click();}} style={{width:"100%",padding:"10px",borderRadius:9,background:C.raised,border:`1px solid ${C.border}`,color:C.sub,fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>📤 Upload a Different PDF</button>
                  </div>
                )}
                {!scanning&&!scanResult&&<div style={{display:"none"}}/>}
              </div>
            )}

            {/* ── MODE: PASTE TEXT ── */}
            {scanMode==="paste"&&(
              <div>
                <div style={{padding:"10px 13px",background:`${C.a3}10`,borderRadius:8,border:`1px solid ${C.a3}33`,fontSize:11,color:C.sub,marginBottom:12,lineHeight:1.8}}>
                  <strong style={{color:C.a3}}>How:</strong> Open your settlement PDF in any app → tap <strong style={{color:C.text}}>Select All</strong> → tap <strong style={{color:C.text}}>Copy</strong> → come back here and paste below. AI reads everything instantly.
                </div>
                <div style={{fontSize:10,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Paste settlement text here</div>
                <textarea
                  value={pasteText}
                  onChange={e=>setPasteText(e.target.value)}
                  placeholder={"Paste your full settlement text here...\n\nExample:\nSettlement Statement 673863\nWeek No: 15-2026  Week From: 04/06/2026  Week To: 04/12/2026\nIBP003320000/001  1  L  04/07/26  UNIT#  BALTIMMD  WILLIAMD  77  195.00  52.36\n...\nTotal Gross: $4,200.00\nNet Check Amount $2,500.00"}
                  style={{...inp,height:160,resize:"vertical",lineHeight:1.6,fontSize:12,marginBottom:12}}
                />
                <button
                  onClick={parsePasteText}
                  disabled={!pasteText.trim()||pasteLoading}
                  style={{width:"100%",padding:"14px",borderRadius:9,background:(!pasteText.trim()||pasteLoading)?C.raised:`linear-gradient(135deg,${C.a3},${C.accent})`,color:"#000",fontWeight:800,fontSize:13,border:"none",cursor:(!pasteText.trim()||pasteLoading)?"not-allowed":"pointer",marginBottom:10}}>
                  {pasteLoading?"⏳ AI Reading...":"🧠 Read & Extract Settlement"}
                </button>
              </div>
            )}

            {/* ── MODE: FORM ── */}
            {scanMode==="form"&&(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                  {[
                    {k:"week",  l:"Week #",       ph:"15",         hint:"'Week No: 15-2026' → 15"},
                    {k:"moves", l:"# of Moves",   ph:"20",         hint:"Count rows on statement"},
                    {k:"from",  l:"Week From",    ph:"04/06/2026", hint:"Start date"},
                    {k:"to",    l:"Week To",      ph:"04/12/2026", hint:"End date"},
                    {k:"gross", l:"Gross $",      ph:"4688.64",    hint:"Gross Check Amount"},
                    {k:"deds",  l:"Deductions $", ph:"1870.04",    hint:"Total Deductions"},
                  ].map(f=>(
                    <div key={f.k}>
                      <div style={{fontSize:10,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>{f.l}</div>
                      <input value={scanForm[f.k]||""} onChange={e=>setScanForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={inp}/>
                      <div style={{fontSize:9,color:C.sub,marginTop:3}}>{f.hint}</div>
                    </div>
                  ))}
                  <div style={{gridColumn:"1/-1"}}>
                    <div style={{fontSize:10,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>Net Pay $</div>
                    <input value={scanForm.net||""} onChange={e=>setScanForm(p=>({...p,net:e.target.value}))} placeholder="2857.82" style={{...inp,border:`1px solid ${C.accent}55`}}/>
                    <div style={{fontSize:9,color:C.sub,marginTop:3}}>Net Check Amount — bottom of statement</div>
                  </div>
                  <div style={{gridColumn:"1/-1"}}>
                    <div style={{fontSize:10,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Carrier / Vendor</div>
                    <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                      {Object.entries(VENDORS).filter(([k])=>k!=="OTH").map(([k,v])=>(
                        <button key={k} onClick={()=>setVendorPick(k)}
                          style={{padding:"7px 13px",borderRadius:8,background:vendorPick===k?`${v.color}22`:C.raised,border:`1px solid ${vendorPick===k?v.color:C.border}`,color:vendorPick===k?v.color:C.sub,fontSize:11,fontWeight:vendorPick===k?700:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>
                          <span>{v.icon}</span><span>{v.short}</span>
                        </button>
                      ))}
                      <button onClick={()=>setVendorPick("OTH")}
                        style={{padding:"7px 13px",borderRadius:8,background:vendorPick==="OTH"?`${C.gold}22`:C.raised,border:`1px solid ${vendorPick==="OTH"?C.gold:C.border}`,color:vendorPick==="OTH"?C.gold:C.sub,fontSize:11,fontWeight:vendorPick==="OTH"?700:500,cursor:"pointer",fontFamily:"inherit"}}>
                        🏢 Other
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={()=>{
                    const {week,from,to,gross,net,deds,moves}=scanForm;
                    if(!week||!gross||!net){setScanMsg("⚠️ Week #, Gross, and Net are required.");return;}
                    const wNum=String(week).padStart(2,"0");
                    if(addedW.find(w=>w.week===wNum)){setScanMsg("⚠️ Week "+wNum+" already exists.");return;}
                    setAddedW(p=>[...p,{vendor:vendorPick,week:wNum,label:`Week ${wNum}`,from:from||"",to:to||"",gross:parseFloat(gross)||0,net:parseFloat(net)||0,totalDeductions:parseFloat(deds)||0,rebate:0,moves:Array.from({length:parseInt(moves)||0},()=>({t:"L",fr:"?",to:"?",mi:0,rt:0,fc:0})),deds:[]}]);
                    setScanMsg(`✅ Week ${wNum} saved — ${VENDORS[vendorPick]?.name} · Net $${parseFloat(net).toFixed(2)}`);
                    setScanForm({week:"",from:"",to:"",gross:"",net:"",deds:"",moves:""});
                  }}
                  disabled={!scanForm.week||!scanForm.gross||!scanForm.net}
                  style={{width:"100%",padding:"14px",borderRadius:9,background:(!scanForm.week||!scanForm.gross||!scanForm.net)?C.raised:`linear-gradient(135deg,${C.accent},${C.a3})`,color:"#000",fontWeight:800,fontSize:13,border:"none",cursor:(!scanForm.week||!scanForm.gross||!scanForm.net)?"not-allowed":"pointer",marginBottom:10}}>
                  ✅ Save Settlement Week
                </button>
              </div>
            )}

            {/* ── MODE: TIPS ── */}
            {scanMode==="tips"&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {[
                  {icon:"📤",title:"Upload PDF (Best & Easiest)",color:C.a3,steps:["Tap the 'Upload PDF' tab above","Tap the big upload button — your phone's file picker opens","Find your settlement PDF in Downloads or Files","AI reads everything — review numbers and tap Save"]},
                  {icon:"📋",title:"Paste Text (Alternative)",color:C.accent,steps:["Open your settlement PDF in any app","Tap and hold → Select All → Copy","Switch back here → tap Paste Text tab → paste","Tap 'Read & Extract' — AI fills everything in seconds"]},
                  {icon:"✏️",title:"Type Numbers",color:C.accent,steps:["Open PDF side by side or on another device","Switch to 'Type Numbers' tab","Enter Week #, Gross, Net, Deductions","Tap Save — done in 30 seconds"]},
                  {icon:"🔢",title:"Key numbers to find",color:C.gold,steps:["Week # → top of statement: 'Week No: 15-2026'","Gross → bottom: 'Gross Check Amount'","Net → bottom: 'Net Check Amount'","Deductions → 'Total Deductions' or subtract net from gross"]},
                ].map(s=>(
                  <div key={s.title} style={{background:C.bg,borderRadius:10,padding:"13px",border:`1px solid ${s.color}44`}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:9}}>
                      <span style={{fontSize:18}}>{s.icon}</span>
                      <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:700,color:s.color}}>{s.title}</span>
                    </div>
                    {s.steps.map((st,i)=>(
                      <div key={i} style={{display:"flex",gap:9,marginBottom:6}}>
                        <span style={{color:s.color,fontWeight:700,fontSize:12,flexShrink:0}}>{i+1}.</span>
                        <span style={{fontSize:12,color:C.sub,lineHeight:1.7}}>{st}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Paste preview */}
            {pasteResult&&(
              <div style={{background:C.bg,borderRadius:10,border:`1px solid ${C.a3}44`,padding:14,marginTop:10}}>
                <div style={{fontSize:11,fontWeight:700,color:C.a3,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.08em"}}>📋 Extracted — Review & Confirm</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:12}}>
                  {[
                    {l:"Week",       v:`Week ${pasteResult.week}`},
                    {l:"Dates",      v:`${pasteResult.from||"?"}–${pasteResult.to||"?"}`},
                    {l:"Gross",      v:`$${Number(pasteResult.gross||0).toFixed(2)}`},
                    {l:"Net Pay",    v:`$${Number(pasteResult.net||0).toFixed(2)}`},
                    {l:"Deductions", v:`$${Number(pasteResult.totalDeductions||0).toFixed(2)}`},
                    {l:"Margin",     v:`${pasteResult.gross>0?(pasteResult.net/pasteResult.gross*100).toFixed(1):0}%`},
                    {l:"Moves",      v:`${pasteResult.moves?.length||0} moves`},
                    {l:"Ded. Lines", v:`${pasteResult.deds?.length||0} items`},
                  ].map(s=>(
                    <div key={s.l} style={{background:C.raised,borderRadius:8,padding:"9px 11px",border:`1px solid ${C.border}`}}>
                      <div style={{fontSize:9,color:C.sub,textTransform:"uppercase",marginBottom:3}}>{s.l}</div>
                      <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,color:C.text}}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>{
                    const wNum=String(pasteResult.week).padStart(2,"0");
                    if(allW.find(w=>w.week===wNum)){setScanMsg("⚠️ Week "+wNum+" already exists.");setPasteResult(null);return;}
                    const safeW={
                      ...pasteResult,
                      week:wNum,
                      label:`Week ${wNum}`,
                      moves:Array.isArray(pasteResult.moves)?pasteResult.moves:[],
                      deds:Array.isArray(pasteResult.deds)?pasteResult.deds:[],
                      rebate:pasteResult.rebate||0,
                    };
                    safeW.vendor=detectVendor(safeW);
                    setAddedW(p=>[...p,safeW]);
                    setScanMsg(`✅ Week ${wNum} saved! Go to 🚀 Growth tab → All Settlements to see it.`);
                    setPasteResult(null);setPasteText("");
                    setScanMode("form");
                  }} style={{flex:1,padding:"13px",borderRadius:9,background:`linear-gradient(135deg,${C.accent},${C.a3})`,color:"#000",fontWeight:800,fontSize:13,border:"none",cursor:"pointer"}}>
                    ✅ Save Week {pasteResult.week}
                  </button>
                  <button onClick={()=>{setPasteResult(null);setScanMsg("");}} style={{padding:"13px 16px",borderRadius:9,background:"transparent",color:C.text,fontWeight:700,border:`1px solid ${C.border}`,cursor:"pointer"}}>✕</button>
                </div>
              </div>
            )}

            {/* Status message */}
            {scanMsg&&(
              <div style={{padding:"11px 14px",background:scanMsg.startsWith("⚠️")?`${C.red}12`:`${C.green}12`,borderRadius:9,border:`1px solid ${scanMsg.startsWith("⚠️")?C.red:C.green}44`,fontSize:12,color:scanMsg.startsWith("⚠️")?C.red:C.green,marginTop:10,display:"flex",alignItems:"center",gap:8}}>
                {scanMsg}
              </div>
            )}

            {/* Recently added weeks — show right here so user sees them immediately */}
            {addedW.length>0&&(
              <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${C.border}`}}>
                <div style={{fontSize:10,fontWeight:700,color:C.a3,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:9}}>✅ Saved Weeks ({addedW.length})</div>
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {addedW.map((w,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 13px",background:C.bg,borderRadius:9,border:`1px solid ${C.a3}55`}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,flex:1}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:C.a3,boxShadow:`0 0 5px ${C.a3}`,flexShrink:0}}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,fontWeight:700,color:C.text}}>{w.label} <Tag color={C.a3}>Added</Tag></div>
                          <div style={{fontSize:11,color:C.sub,marginTop:2}}>{w.from}{w.to?` – ${w.to}`:""} · {w.moves?.length||0} moves · {w.deds?.length||0} deductions</div>
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,color:C.green}}>${Number(w.net).toLocaleString("en-US",{minimumFractionDigits:2})}</div>
                          <div style={{fontSize:10,color:C.sub}}>{w.gross>0?(w.net/w.gross*100).toFixed(1):0}% margin</div>
                        </div>
                        <button
                          onClick={()=>{
                            if(window.confirm(`Delete ${w.label}? This cannot be undone.`)){
                              setAddedW(p=>p.filter((_,j)=>j!==i));
                              setScanMsg(`🗑️ ${w.label} deleted`);
                            }
                          }}
                          style={{padding:"6px 10px",borderRadius:8,background:`${C.red}15`,border:`1px solid ${C.red}44`,color:C.red,fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:700,flexShrink:0}}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>


          {/* Offer Scorer */}
          <div style={{display:"grid",gridTemplateColumns:wide?"1fr 1fr":"1fr",gap:14,marginBottom:16}}>
            <div style={K()}>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,marginBottom:14}}>⚡ Instant Offer Scorer{helpBtn("offerScorer")}</div>
            {helpModal("offerScorer")}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:13}}>
                {[["miles","Miles"],["rate","Rate $"],["fsc","FSC $"]].map(([k,l])=>(
                  <div key={k}><label style={lbl}>{l}</label><input value={offer[k]} onChange={e=>setOffer(p=>({...p,[k]:e.target.value}))} placeholder={l} style={inp}/></div>
                ))}
                <div><label style={lbl}>Type</label><select value={offer.type} onChange={e=>setOffer(p=>({...p,type:e.target.value}))} style={{...inp,cursor:"pointer"}}><option value="L">Loaded</option><option value="E">Empty</option></select></div>
              </div>
              <button onClick={()=>{
                if(!hasAccess&&oUses>=FREE_OS){openUpgrade("scorer");return;}
                setOfferRes(scoreMove({miles:+offer.miles,rate:+offer.rate,fsc:+offer.fsc,type:offer.type}));
                if(!hasAccess)setOUses(function(p){return p+1;});
              }} style={{width:"100%",padding:"13px",borderRadius:9,background:`linear-gradient(135deg,${C.accent},${C.a3})`,color:"#000",fontWeight:800,fontSize:13,border:"none",cursor:"pointer"}}>
                {osLocked?"🔒 Unlock Offer Scorer":"Score This Offer"}{!hasAccess&&!osLocked?" ("+( FREE_OS-oUses)+" free left)":""}
              </button>
            </div>
            <div style={K({display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12,minHeight:200,border:offerRes?`2px solid ${gc(offerRes.grade)}`:`1px solid ${C.border}`})}>
              {offerRes?(<>
                <div style={{display:"flex",gap:16,alignItems:"center",width:"100%"}}>
                  <div style={{width:76,height:76,borderRadius:14,background:`${gc(offerRes.grade)}18`,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${gc(offerRes.grade)}`,flexShrink:0}}>
                    <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:34,fontWeight:900,color:gc(offerRes.grade)}}>{offerRes.grade}</span>
                  </div>
                  <div>
                    <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:26,fontWeight:800,color:gc(offerRes.grade)}}>{offerRes.score}/100</div>
                    <div style={{fontSize:12,color:C.sub,marginTop:2}}>RPM: <strong style={{color:C.text}}>${offerRes.rpm}/mi</strong></div>
                    <div style={{fontSize:13,color:C.text,fontWeight:700,marginTop:4}}>{offerRes.grade==="A"?"🔥 Take it!":offerRes.grade==="B"?"👍 Good offer":offerRes.grade==="C"?"🤔 Marginal":"❌ Pass"}</div>
                  </div>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,width:"100%"}}>{offerRes.tags.map(t=><Tag key={t} color={C.sub}>{t}</Tag>)}</div>
              </>):(<><div style={{fontSize:38}}>📋</div><div style={{color:C.sub,fontSize:13}}>Enter offer details to score</div><div style={{fontSize:11,color:C.sub}}>A=take it · B=good · C=marginal · D=pass</div></>)}
            </div>
          </div>
          <NoBadge/>

          {/* Add Move */}
          {showAdd&&(
            <div style={K({marginBottom:16,border:`1px solid ${C.accent}55`})}>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,marginBottom:14}}>📝 Record New Move</div>
              <div style={{display:"grid",gridTemplateColumns:wide?"repeat(3,1fr)":"repeat(2,1fr)",gap:10}}>
                {[["from","From","BALTIMMD"],["to","To","WILLIAMD"],["miles","Miles","77"],["rate","Rate $","195"],["fsc","FSC $","52.36"]].map(([k,l,ph])=>(
                  <div key={k}><label style={lbl}>{l}</label><input value={newMove[k]} onChange={e=>setNewMove(p=>({...p,[k]:e.target.value}))} placeholder={ph} style={inp}/></div>
                ))}
                <div><label style={lbl}>Type</label><select value={newMove.type} onChange={e=>setNewMove(p=>({...p,type:e.target.value}))} style={{...inp,cursor:"pointer"}}><option value="L">Loaded</option><option value="E">Empty</option></select></div>
              </div>
              <div style={{display:"flex",gap:10,marginTop:14}}>
                <button onClick={()=>{setExtra(p=>[...p,{t:newMove.type,fr:newMove.from,to:newMove.to,mi:+newMove.miles,rt:+newMove.rate,fc:+newMove.fsc}]);setNewMove({type:"L",from:"",to:"",miles:"",rate:"",fsc:""});setShowAdd(false);}} style={{padding:"10px 22px",borderRadius:9,background:C.green,color:"#000",fontWeight:700,border:"none",cursor:"pointer"}}>Save Move</button>
                <button onClick={()=>setShowAdd(false)} style={{padding:"10px 22px",borderRadius:9,background:"transparent",color:C.text,fontWeight:700,border:`1px solid ${C.border}`,cursor:"pointer"}}>Cancel</button>
              </div>
            </div>
          )}

          {/* History */}
          <div style={K()}>
            {focusMode?(
              /* FOCUS MODE: Top 3 best + Top 3 worst */
              <div>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,marginBottom:4}}>⚡ Top & Bottom Moves{helpBtn("topBottom")}</div>
                {helpModal("topBottom")}
                <div style={{fontSize:10,color:C.sub,marginBottom:14}}>Focus mode — tap 📋 FULL to see all {allMoves.length} moves</div>
                {[
                  {label:"🔥 Top 3 Best", color:C.green, moves:[...allMoves].sort((a,b)=>parseFloat(scoreMove(b).rpm)-parseFloat(scoreMove(a).rpm)).slice(0,3)},
                  {label:"⚠️ Top 3 Worst", color:C.red,  moves:[...allMoves].filter(m=>m.miles>0).sort((a,b)=>parseFloat(scoreMove(a).rpm)-parseFloat(scoreMove(b).rpm)).slice(0,3)},
                ].map(group=>(
                  <div key={group.label} style={{marginBottom:14}}>
                    <div style={{fontSize:10,fontWeight:700,color:group.color,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{group.label}</div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {group.moves.map((m,i)=>{
                        const s=scoreMove(m);
                        const vk=allW.find(w=>w.week===m.wk)?detectVendor(allW.find(w=>w.week===m.wk)):"CPG";
                        const vc=VENDORS[vk]?.color||C.accent;
                        return(
                          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",background:C.bg,borderRadius:9,border:`1px solid ${group.color}33`}}>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <span style={{padding:"2px 6px",borderRadius:5,fontSize:9,fontWeight:700,background:`${vc}22`,color:vc,flexShrink:0}}>{vk}</span>
                              <span style={{padding:"2px 6px",borderRadius:5,fontSize:9,fontWeight:700,background:m.type==="L"?"#14532d":m.isRoundTrip?`${C.a3}30`:"#431407",color:m.type==="L"?"#86efac":m.isRoundTrip?C.a3:"#fcd34d",flexShrink:0}}>{m.isRoundTrip?"RT":m.type}</span>
                              <span style={{fontSize:11,color:C.text}}>{m.from}→{m.to}</span>
                              <span style={{fontSize:10,color:C.sub}}>W{m.wk}</span>
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                              <span style={{fontSize:11,fontWeight:700,color:group.color}}>${s.rpm}/mi</span>
                              <Tag color={gc(s.grade)}>{s.grade}</Tag>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ):(
              /* FULL MODE: complete history with vendor tags */
              <div>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,marginBottom:6}}>📁 Full History — {allMoves.length} moves · {allW.length} weeks{helpBtn("fullHistory")}</div>
                {helpModal("fullHistory")}
                <div style={{overflowX:"auto",overflowY:"auto",maxHeight:420,borderRadius:8,border:`1px solid ${C.border}`}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                    <thead><tr style={{borderBottom:`2px solid ${C.border}`,background:C.raised}}>{["Wk","Vendor","Type","Route","Mi","Rate","FSC","Total","RPM","Grade"].map(h=><th key={h} style={{textAlign:"left",padding:"9px 6px",color:C.sub,fontWeight:700,fontSize:10,textTransform:"uppercase",whiteSpace:"nowrap",position:"sticky",top:0,background:C.raised,zIndex:2}}>{h}</th>)}</tr></thead>
                    <tbody>{allMoves.slice().reverse().map((m,i)=>{
                      const s=scoreMove(m);
                      const vk=allW.find(w=>w.week===m.wk)?detectVendor(allW.find(w=>w.week===m.wk)):"CPG";
                      const vc=VENDORS[vk]?.color||C.accent;
                      return(
                        <tr key={i} style={{borderBottom:`1px solid ${C.border}`,background:m.isRoundTrip?`${C.a3}10`:i%2?`${C.border}30`:"transparent"}}>
                          <td style={{padding:"8px 6px",color:C.sub,fontWeight:600}}>W{m.wk}</td>
                          <td style={{padding:"8px 6px"}}>
                            <span style={{padding:"2px 7px",borderRadius:5,fontSize:9,fontWeight:700,background:`${vc}22`,color:vc}}>{vk}</span>
                          </td>
                          <td style={{padding:"8px 6px"}}>
                            {m.isRoundTrip
                              ? <span style={{padding:"2px 7px",borderRadius:5,fontSize:10,fontWeight:700,background:`${C.a3}30`,color:C.a3}}>🔄 RT</span>
                              : <span style={{padding:"2px 7px",borderRadius:5,fontSize:10,fontWeight:700,background:m.type==="L"?`${C.green}25`:`${C.gold}25`,color:m.type==="L"?C.green:C.gold}}>{m.type}</span>
                            }
                            {s.isDropHook&&<span style={{marginLeft:3,padding:"1px 4px",borderRadius:4,fontSize:9,fontWeight:700,background:`${C.a3}22`,color:C.a3}}>D&H</span>}
                            {s.isFlatRate&&!s.isDropHook&&!m.isRoundTrip&&<span style={{marginLeft:3,padding:"1px 4px",borderRadius:4,fontSize:9,fontWeight:700,background:`${C.gold}22`,color:C.gold}}>FLAT</span>}
                          </td>
                          <td style={{padding:"8px 6px",color:C.text,whiteSpace:"nowrap"}}>
                            {m.from}↔{m.to}
                            {m.isRoundTrip&&<div style={{fontSize:9,color:C.sub,marginTop:1}}>E:{m.emptyMi}mi ${m.emptyPay} + L:{m.loadedMi}mi ${m.loadedPay}</div>}
                            {m.extraPay>0&&<span style={{marginLeft:4,padding:"1px 4px",borderRadius:4,fontSize:9,fontWeight:700,background:`${C.gold}22`,color:C.gold}}>+${m.extraPay}</span>}
                          </td>
                          <td style={{padding:"8px 6px",color:C.text}}>{m.miles}</td>
                          <td style={{padding:"8px 6px",color:m.isRoundTrip?C.a3:C.text,fontWeight:m.isRoundTrip?700:400}}>${m.rate.toFixed(2)}</td>
                          <td style={{padding:"8px 6px",color:m.fsc>0?C.accent:s.isFlatRate||m.isRoundTrip?C.gold:C.sub}}>{m.fsc>0?`$${m.fsc.toFixed(2)}`:s.isFlatRate||m.isRoundTrip?"all-in":"—"}</td>
                          <td style={{padding:"8px 6px",color:m.isRoundTrip?C.a3:C.text,fontWeight:600}}>${(m.rate+m.fsc).toFixed(2)}</td>
                          <td style={{padding:"8px 6px",color:+s.rpm>=2.5?C.green:+s.rpm>=2.0?C.gold:C.red,fontWeight:700}}>${s.rpm}</td>
                          <td style={{padding:"8px 6px"}}><Tag color={gc(s.grade)}>{s.grade}</Tag></td>
                        </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ AI INTEL ═════════════════════════════════════════════════════════ */}
      {tab==="ai"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:800,margin:0}}>AI Intelligence</h1>

          {/* Snapshot */}
          <div style={K({background:C.surf})}>
            <div style={{fontSize:10,fontWeight:700,color:C.accent,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.1em"}}>📊 Snapshot</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9}}>
              {[{l:"Net Margin",v:`${margin}%`,c:+margin>=20?C.green:C.red},{l:"Avg RPM",v:`$${avgRPM}`,c:+avgRPM>=2.5?C.green:C.gold},{l:"Loaded %",v:`${ldPct}%`,c:ldPct>=60?C.green:C.gold},{l:"Fuel/Gross",v:`${(latFuel/latest.gross*100).toFixed(0)}%`,c:C.red},{l:"Total Moves",v:`${allMoves.length}`,c:C.text},{l:"YTD Net",v:`$${tNet.toLocaleString("en-US",{minimumFractionDigits:0})}`,c:C.green}].map(s=>(
                <div key={s.l} style={{background:C.card,borderRadius:9,padding:"11px 9px",border:`1px solid ${C.border}`,textAlign:"center"}}>
                  <div style={{fontSize:9,color:C.sub,marginBottom:4,textTransform:"uppercase"}}>{s.l}</div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:800,color:s.c}}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Tools */}
          <div style={K()}>
            <div style={{fontSize:11,fontWeight:700,color:C.sub,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.08em"}}>🛠️ AI Tools</div>
            <div style={{display:"grid",gridTemplateColumns:wide?"repeat(4,1fr)":"repeat(2,1fr)",gap:8,marginBottom:14}}>
              {[
                {mode:"chat",   icon:"💬", label:"Chat",          desc:"Ask anything"},
                {mode:"report", icon:"📊", label:"Weekly Report", desc:"Settlement summary"},
                {mode:"bizplan",icon:"📄", label:"Business Plan", desc:"For bank / SBA loan"},
                {mode:"funding",icon:"🏦", label:"Find Funding",  desc:"Lenders & programs"},
              ].map(t=>(
                <button key={t.mode} onClick={()=>{setAiMode(t.mode);setAiOut("");}}
                  style={{padding:"12px 8px",borderRadius:10,background:aiMode===t.mode?`${C.accent}20`:C.raised,border:`1px solid ${aiMode===t.mode?C.accent:C.border}`,cursor:"pointer",fontFamily:"inherit",textAlign:"center",transition:"all 0.15s"}}>
                  <div style={{fontSize:20,marginBottom:5}}>{t.icon}</div>
                  <div style={{fontSize:11,fontWeight:700,color:aiMode===t.mode?C.accent:C.text}}>{t.label}</div>
                  <div style={{fontSize:9,color:C.sub,marginTop:2}}>{t.desc}</div>
                </button>
              ))}
            </div>

            {/* Week selector for report */}
            {aiMode==="report"&&(
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:700,color:C.sub,marginBottom:8,textTransform:"uppercase"}}>Select Week</div>
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                  {allW.map((w,i)=>(
                    <button key={w.week} onClick={()=>{setSR(i);setAiOut("");}}
                      style={{padding:"7px 12px",borderRadius:8,background:i===sR?`${C.gold}20`:C.raised,border:`1px solid ${i===sR?C.gold:C.border}`,color:i===sR?C.gold:C.text,fontSize:11,fontWeight:i===sR?700:500,cursor:"pointer",fontFamily:"inherit"}}>
                      {w.label}{i===allW.length-1?" ★":""}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action button */}
            {aiMode!=="chat"&&(
              <button onClick={()=>runAITool(aiMode)} disabled={aiLoad}
                style={{width:"100%",padding:"14px",borderRadius:9,background:aiLoad?C.raised:aiMode==="bizplan"?`linear-gradient(135deg,${C.a3},${C.accent})`:aiMode==="funding"?`linear-gradient(135deg,${C.gold},${C.a2})`:C.accent,color:"#000",fontWeight:800,fontSize:13,border:"none",cursor:aiLoad?"not-allowed":"pointer",marginBottom:12}}>
                {aiLoad?"⏳ Writing...":aiMode==="report"?`⚡ Generate ${((allW[sR]||allW[allW.length-1]||safeW[safeW.length-1]||{label:"Weekly"}).label)} Report`:aiMode==="bizplan"?"📄 Generate Business Plan for YOUR CO SERVICES":"🏦 Find Funding Options for My Business"}
              </button>
            )}

            {/* AI Output */}
            {aiOut&&(
              <div style={{background:C.bg,borderRadius:10,border:`1px solid ${C.border}`,padding:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:"0.08em"}}>
                    {aiMode==="report"?"📊 Weekly Report":aiMode==="bizplan"?"📄 Business Plan":aiMode==="funding"?"🏦 Funding Guide":""}
                  </div>
                  <button onClick={()=>copyText(aiOut)} style={{padding:"7px 14px",borderRadius:8,background:C.accent,border:"none",color:"#000",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>📋 Copy</button>
                </div>
                <pre style={{fontSize:12,color:C.text,lineHeight:1.85,whiteSpace:"pre-wrap",margin:0,fontFamily:"'IBM Plex Mono',monospace"}}>{aiOut}</pre>
              </div>
            )}
          </div>

          {/* Quick questions + Search Widget */}
          {aiMode==="chat"&&(
            <div style={K()}>
              <div style={{fontSize:10,fontWeight:700,color:C.sub,marginBottom:11,textTransform:"uppercase",letterSpacing:"0.1em"}}>⚡ Quick Questions</div>
              <div style={{display:"grid",gridTemplateColumns:wide?"repeat(2,1fr)":"1fr",gap:7}}>
                {["Where am I losing the most money?","What's my biggest profit leak?","How can I increase my net pay?","Which routes give the best RPM?","Give me a 4-week income forecast","Should I take more Hagerstown loads?","How much are fuel advances really costing me?","What should my target weekly net be?"].map(q=>(
                  <button key={q} onClick={()=>setChatIn(q)} style={{padding:"11px 13px",borderRadius:9,background:C.raised,border:`1px solid ${C.border}`,color:C.text,fontSize:12,textAlign:"left",cursor:"pointer",fontFamily:"inherit",lineHeight:1.5}}>{q}</button>
                ))}
              </div>
            </div>
          )}

          {/* Chat */}
          {aiMode==="chat"&&(
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,display:"flex",flexDirection:"column",overflow:"hidden"}}>
              <div style={{padding:"13px 16px",background:C.surf,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:9}}>
                <div style={{width:9,height:9,borderRadius:"50%",background:C.green,boxShadow:`0 0 7px ${C.green}`}}/>
                <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700}}>🧠 AI Chat</span>
                <span style={{fontSize:10,color:C.sub,marginLeft:"auto"}}>{allMoves.length} moves · {allW.length} weeks</span>
              </div>
              <div style={{overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:11,background:C.bg,minHeight:280,maxHeight:400}}>
                {chat.map((m,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:m.r==="u"?"flex-end":"flex-start",gap:8,alignItems:"flex-end"}}>
                    {m.r==="a"&&<div style={{width:26,height:26,borderRadius:7,background:C.surf,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🧠</div>}
                    <div style={{maxWidth:"80%",padding:"11px 14px",borderRadius:11,fontSize:13,lineHeight:1.8,background:m.r==="u"?C.accent:C.card,color:m.r==="u"?"#000":C.text,border:m.r==="a"?`1px solid ${C.border}`:"none",whiteSpace:"pre-wrap",fontWeight:m.r==="u"?600:400}}>{m.t}</div>
                    {m.r==="u"&&<div style={{width:26,height:26,borderRadius:7,background:C.surf,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>👤</div>}
                  </div>
                ))}
                {chatLoad&&<div style={{display:"flex",gap:8,alignItems:"flex-end"}}><div style={{width:26,height:26,borderRadius:7,background:C.surf,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>🧠</div><div style={{padding:"11px 14px",background:C.card,borderRadius:11,border:`1px solid ${C.border}`,color:C.accent,fontSize:13}}>⏳ Thinking...</div></div>}
                <div ref={chatEnd}/>
              </div>
              <div style={{padding:"11px 13px",background:C.surf,borderTop:`1px solid ${C.border}`,display:"flex",gap:9}}>
                <input value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder={aiLocked?"Upgrade to continue chatting...":"Ask anything about your business..."} style={{...inp,flex:1}} disabled={aiLocked}/>
                <button onClick={aiLocked?()=>openUpgrade("ai"):sendChat} disabled={chatLoad} style={{padding:"11px 18px",borderRadius:9,background:aiLocked?C.gold:chatLoad?C.raised:C.accent,color:aiLocked?"#000":chatLoad?"#888":"#000",fontWeight:800,border:"none",cursor:chatLoad?"not-allowed":"pointer",fontSize:13,flexShrink:0}}>{aiLocked?"🔒":chatLoad?"...":"Send"}</button>
              </div>
            </div>
          )}
          <NoBadge/>
        </div>
      )}
      {tab==="growth"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:800,margin:0}}>🚀 Growth Tools</h1>
            <p style={{color:C.sub,fontSize:11,marginTop:4,marginBottom:0}}>Add weeks · Download reports · Scale your fleet</p>
          </div>

          {/* Add Settlement */}
          <div style={K({border:`1px solid ${C.accent}44`})}>
            <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:14}}>
              <div style={{width:38,height:38,borderRadius:10,background:`${C.accent}18`,border:`1px solid ${C.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>📄</div>
              <div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700}}>Add Settlement Week</div><div style={{fontSize:11,color:C.sub,marginTop:2}}>Enter numbers from your statement · 30 seconds</div></div>
            </div>
            <div style={{padding:"10px 14px",background:`${C.gold}10`,borderRadius:9,border:`1px solid ${C.gold}33`,fontSize:11,color:C.sub,marginBottom:14,lineHeight:1.7}}>
              💡 <strong style={{color:C.gold}}>Tip:</strong> Use the <strong style={{color:C.a3}}>📷 Scan PDF</strong> button in the Doc Analyzer tab to auto-fill everything from your PDF. Or enter manually below.
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:13}}>
              {[["week","Week #","e.g. 15","Header says 'Week No:'"],["moves","# Moves","e.g. 20","Count rows"],["from","From Date","MM/DD/YYYY","Start date"],["to","To Date","MM/DD/YYYY","End date"],["gross","Gross $","e.g. 4688.64","Gross Check Amount"],["deductions","Deductions $","e.g. 1870.04","Total deducted"]].map(([k,l,ph,hint])=>(
                <div key={k}><label style={lbl}>{l}</label><input value={manForm[k]} onChange={e=>setManForm(p=>({...p,[k]:e.target.value}))} placeholder={ph} style={inp}/><div style={{fontSize:9,color:C.sub,marginTop:3}}>{hint}</div></div>
              ))}
              <div style={{gridColumn:"1/-1"}}><label style={lbl}>Net Pay $</label><input value={manForm.net} onChange={e=>setManForm(p=>({...p,net:e.target.value}))} placeholder="e.g. 2857.82" style={inp}/><div style={{fontSize:9,color:C.sub,marginTop:3}}>Net Check Amount</div></div>
            </div>
            <button onClick={addWeek} disabled={!manForm.week||!manForm.gross||!manForm.net}
              style={{width:"100%",padding:"14px",borderRadius:9,background:(!manForm.week||!manForm.gross||!manForm.net)?C.raised:`linear-gradient(135deg,${C.accent},${C.a3})`,color:"#000",fontWeight:800,fontSize:13,border:"none",cursor:(!manForm.week||!manForm.gross||!manForm.net)?"not-allowed":"pointer",marginBottom:10}}>
              + Add This Settlement Week
            </button>
            {addMsg&&<div style={{padding:"10px 14px",background:addMsg.startsWith("⚠️")?`${C.red}12`:`${C.green}12`,borderRadius:9,border:`1px solid ${addMsg.startsWith("⚠️")?C.red:C.green}44`,fontSize:12,color:addMsg.startsWith("⚠️")?C.red:C.green}}>{addMsg}</div>}
          </div>

          {/* All Settlements */}
          <div style={K()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700}}>
                📋 All Settlements ({allW.length} weeks · ${allW.reduce((s,w)=>s+w.gross,0).toLocaleString("en-US",{minimumFractionDigits:2})} YTD)
              </div>
              {addedW.length>0&&(
                <button onClick={()=>{if(window.confirm(`Remove all ${addedW.length} added weeks?`)){setAddedW([]);}}}
                  style={{padding:"6px 12px",borderRadius:8,background:`${C.red}15`,border:`1px solid ${C.red}44`,color:C.red,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>
                  🗑 Clear Added
                </button>
              )}
            </div>
            {/* Storage status */}
            <div style={{padding:"9px 13px",background:addedW.length>0?`${C.green}10`:`${C.border}30`,borderRadius:8,border:`1px solid ${addedW.length>0?C.green+"33":C.border}`,fontSize:11,color:addedW.length>0?C.green:C.sub,marginBottom:12,display:"flex",alignItems:"center",gap:7}}>
              <span>{addedW.length>0?"💾":"📭"}</span>
              <span>{addedW.length>0?`${addedW.length} added week${addedW.length>1?"s":""} saved to this device — survives app restarts`:"No added weeks saved yet — weeks you add will persist here"}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[...allW].reverse().map((w,i)=>{const g=wg(w);const isNew=!W.find(hw=>hw.week===w.week);const lastW=W.length>0?W[W.length-1]:null;const isLast=lastW?w.week===lastW.week&&!isNew:false;return(
                <div key={w.week+i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",background:C.bg,borderRadius:10,border:`1px solid ${isLast?C.accent+"55":isNew?C.a3+"55":C.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:11}}>
                    <div style={{width:9,height:9,borderRadius:"50%",background:isNew?C.a3:isLast?C.accent:g.c,boxShadow:`0 0 5px ${isNew?C.a3:isLast?C.accent:g.c}`}}/>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:C.text,display:"flex",alignItems:"center",gap:7}}>
                        {w.label}{isLast&&<Tag color={C.accent}>Latest</Tag>}{isNew&&<Tag color={C.a3}>Added</Tag>}
                      </div>
                      <div style={{fontSize:11,color:C.sub,marginTop:2}}>{w.from}{w.to?` – ${w.to}`:""} · {w.moves.length} moves</div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,color:C.green}}>${w.net.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
                      <Tag color={g.c}>{g.i} {g.l}</Tag>
                    </div>
                    {!isNew&&<button onClick={()=>{setDlWk(w.week);setTimeout(()=>{generatePDF(w);setDlWk(null);},100);}} disabled={dlWk===w.week} style={{padding:"8px 12px",borderRadius:8,background:dlWk===w.week?C.raised:`${C.a3}18`,border:`1px solid ${C.a3}55`,color:dlWk===w.week?C.sub:C.a3,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{dlWk===w.week?"...":"⬇ PDF"}</button>}
                  </div>
                </div>
              );})}
            </div>
            <div style={{marginTop:12,padding:"10px 14px",background:C.bg,borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,color:C.sub,lineHeight:1.7}}>
              💡 Tap <strong style={{color:C.a3}}>⬇ PDF</strong> to download a full report. Open in browser → Share → Print → Save as PDF.
            </div>
          </div>

          {/* Fleet Comparison */}
          <div style={K({border:`1px solid ${C.a3}44`})}>
            <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:14}}>
              <div style={{width:38,height:38,borderRadius:10,background:`${C.a3}18`,border:`1px solid ${C.a3}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19}}>🚛</div>
              <div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700}}>Driver / Unit Comparison</div><div style={{fontSize:11,color:C.sub,marginTop:2}}>Track performance as your fleet grows</div></div>
            </div>
            <div style={{overflowX:"auto",overflowY:"auto",maxHeight:280,borderRadius:8,border:`1px solid ${C.border}`}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{borderBottom:`2px solid ${C.border}`,background:C.raised}}>{["Driver","Unit","Wks","Gross","Net","Margin","Status"].map(h=><th key={h} style={{textAlign:"left",padding:"9px 10px",color:C.sub,fontWeight:700,fontSize:10,textTransform:"uppercase",whiteSpace:"nowrap",position:"sticky",top:0,background:C.raised,zIndex:2}}>{h}</th>)}</tr></thead>
                <tbody>
                  <tr>
                    <td style={{padding:"12px 10px",color:C.text,fontWeight:600,fontFamily:"'Space Grotesk',sans-serif"}}>{(profile.name||"Your Name").toUpperCase()}</td>
                    <td style={{padding:"12px 10px"}}><Tag color={C.accent}>UNIT#</Tag></td>
                    <td style={{padding:"12px 10px",color:C.text}}>{allW.length}</td>
                    <td style={{padding:"12px 10px",fontFamily:"'Space Grotesk',sans-serif",color:C.accent,fontWeight:700}}>${tGross.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
                    <td style={{padding:"12px 10px",fontFamily:"'Space Grotesk',sans-serif",color:C.green,fontWeight:700}}>${tNet.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
                    <td style={{padding:"12px 10px"}}><Tag color={C.green}>{margin}%</Tag></td>
                    <td style={{padding:"12px 10px"}}><Tag color={C.green}>● ACTIVE</Tag></td>
                  </tr>
                  <tr><td colSpan={7} style={{padding:"12px 10px",textAlign:"center",color:C.sub,fontSize:11,borderTop:`1px dashed ${C.border}`}}>+ Add another driver as your fleet grows</td></tr>
                </tbody>
              </table>
            </div>
            <div style={{marginTop:12,padding:"10px 14px",background:C.bg,borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,color:C.sub,lineHeight:1.7}}>
              💡 <strong style={{color:C.text}}>Fleet tip:</strong> At 3 trucks fixed costs drop ~40% per unit. Your {margin}% margin supports a second unit profitably.
            </div>
          </div>

          {/* ── DOCUMENT VAULT ── */}
          <div style={K({marginBottom:14})}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700}}>📋 Document Vault</div>
              <button onClick={()=>setShowDocForm(p=>!p)} style={{padding:"6px 12px",borderRadius:8,background:showDocForm?`${C.red}20`:`${C.accent}18`,border:`1px solid ${showDocForm?C.red:C.accent}55`,color:showDocForm?C.red:C.accent,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                {showDocForm?"✕ Cancel":"+ Add Record"}
              </button>
            </div>
            <div style={{fontSize:10,color:C.sub,marginBottom:10}}>DOT maintenance logs · Inspection reports · Insurance · Registration · Compliance docs</div>
            {showDocForm&&(
              <div style={{background:C.bg,borderRadius:10,padding:"13px",border:`1px solid ${C.border}`,marginBottom:12}}>
                <div style={{padding:"9px 12px",background:`${C.a3}10`,borderRadius:8,border:`1px dashed ${C.a3}44`,marginBottom:10,textAlign:"center",cursor:"pointer"}} onClick={()=>docRef.current&&docRef.current.click()}>
                  <input ref={docRef} type="file" accept="image/*,.pdf" style={{display:"none"}} onChange={e=>{if(e.target.files[0])readDoc(e.target.files[0]);}}/>
                  <div style={{fontSize:12,color:C.a3,fontWeight:600}}>{docScan?"⏳ Reading...":"📷 Scan Document — AI reads and categorizes"}</div>
                  {docScanMsg&&<div style={{fontSize:10,color:C.green,marginTop:4}}>{docScanMsg}</div>}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                  <div>
                    <div style={{fontSize:9,color:C.sub,marginBottom:3,textTransform:"uppercase",fontWeight:600}}>Date</div>
                    <input type="date" value={docForm.date} onChange={e=>setDocForm(p=>({...p,date:e.target.value}))} style={{width:"100%",padding:"8px 10px",background:C.raised,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,fontSize:12,boxSizing:"border-box",fontFamily:"inherit",outline:"none"}}/>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:C.sub,marginBottom:3,textTransform:"uppercase",fontWeight:600}}>Title</div>
                    <input value={docForm.title} onChange={e=>setDocForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Annual DOT Inspection" style={{width:"100%",padding:"8px 10px",background:C.raised,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,fontSize:12,boxSizing:"border-box",fontFamily:"inherit",outline:"none"}}/>
                  </div>
                </div>
                <div style={{marginBottom:8}}>
                  <div style={{fontSize:9,color:C.sub,marginBottom:4,textTransform:"uppercase",fontWeight:600}}>Category</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {["Maintenance","Inspection","Insurance","Registration","Medical","Permit","Other"].map(cat=>(
                      <button key={cat} onClick={()=>setDocForm(p=>({...p,category:cat}))} style={{padding:"4px 9px",borderRadius:5,background:docForm.category===cat?`${C.accent}22`:"transparent",border:`1px solid ${docForm.category===cat?C.accent:C.border}`,color:docForm.category===cat?C.accent:C.sub,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>{cat}</button>
                    ))}
                  </div>
                </div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:9,color:C.sub,marginBottom:3,textTransform:"uppercase",fontWeight:600}}>Notes</div>
                  <input value={docForm.note} onChange={e=>setDocForm(p=>({...p,note:e.target.value}))} placeholder="e.g. Passed — next due 04/2027" style={{width:"100%",padding:"8px 10px",background:C.raised,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,fontSize:12,boxSizing:"border-box",fontFamily:"inherit",outline:"none"}}/>
                </div>
                <button onClick={()=>{
                  if(!docForm.title)return;
                  setDocs(p=>[{id:Date.now(),date:docForm.date||new Date().toLocaleDateString(),category:docForm.category,title:docForm.title,note:docForm.note},...p]);
                  setDocForm({date:"",category:"Maintenance",title:"",note:""});
                  setDocScanMsg("");setShowDocForm(false);
                }} style={{width:"100%",padding:"9px",borderRadius:8,background:`linear-gradient(135deg,${C.accent},${C.a3})`,color:"#000",fontWeight:700,fontSize:12,border:"none",cursor:"pointer",fontFamily:"inherit"}}>
                  💾 Save Record
                </button>
              </div>
            )}
            {docs.length>0?(
              <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:260,overflowY:"auto"}}>
                {docs.map(d=>(
                  <div key={d.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",background:C.bg,borderRadius:8,border:`1px solid ${C.border}`}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                        <span style={{padding:"1px 6px",borderRadius:4,fontSize:9,fontWeight:700,background:`${C.accent}18`,color:C.accent}}>{d.category}</span>
                        <span style={{fontSize:9,color:C.sub}}>{d.date}</span>
                      </div>
                      <div style={{fontSize:12,color:C.text,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.title}</div>
                      {d.note&&<div style={{fontSize:10,color:C.sub}}>{d.note}</div>}
                    </div>
                    <button onClick={()=>setDocs(p=>p.filter(x=>x.id!==d.id))} style={{background:"none",border:"none",color:C.sub,fontSize:14,cursor:"pointer",padding:"0 4px",marginLeft:8,flexShrink:0}}>×</button>
                  </div>
                ))}
                <div style={{padding:"6px 12px",background:`${C.a3}10`,borderRadius:7,border:`1px solid ${C.a3}22`,fontSize:10,color:C.a3,textAlign:"center"}}>{docs.length} document{docs.length>1?"s":""} on file</div>
              </div>
            ):(
              <div style={{textAlign:"center",padding:"16px",color:C.sub,fontSize:11}}>No documents yet. Add DOT inspection records, maintenance logs, insurance, or any compliance paperwork.</div>
            )}
          </div>

          {/* ── INDUSTRY BENCHMARKS ── */}
          {(()=>{
            const avgWkGross=tGross/allW.length;
            const avgWkNet=tNet/allW.length;
            const annNet=avgWkNet*52;
            const natWkGross=4395; const natWkNet=2434;
            const mPct=tGross>0?(tNet/tGross*100):0;
            const gVsN=Math.round(avgWkGross/natWkGross*100);
            const nVsN=Math.round(avgWkNet/natWkNet*100);
            const mStatus=mPct>=60?"above":mPct>=40?"within":"below";
            const aStatus=annNet>=120000?"top":annNet>=70000?"within":"below";
            const rows=[
              {l:"Avg Weekly Gross", yours:"$"+Math.round(avgWkGross).toLocaleString(), bench:"$4,395 (ZipRecruiter)", pct:gVsN, ok:gVsN>=90},
              {l:"Avg Weekly Net",   yours:"$"+Math.round(avgWkNet).toLocaleString(),   bench:"$2,434 (Indeed / NDS)", pct:nVsN, ok:nVsN>=90},
              {l:"Net Margin",       yours:mPct.toFixed(1)+"%",  bench:"40–60% industry avg", pct:null, ok:mStatus!=="below", tag:mStatus==="above"?"✅ Above range":mStatus==="within"?"✅ Within range":"⚠️ Below range"},
              {l:"Annualized Net",   yours:"$"+Math.round(annNet/1000)+"k",  bench:"$70k–$120k range", pct:null, ok:aStatus!=="below", tag:aStatus==="top"?"✅ Top of range":aStatus==="within"?"✅ Within range":"⚠️ Below range"},
            ];
            return(
              <div style={K({marginBottom:14})}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700}}>📊 Industry Benchmarks{helpBtn("benchmarks")}</div>
                </div>
                {helpModal("benchmarks")}
                <div style={{fontSize:10,color:C.sub,marginBottom:12}}>Your numbers vs national drayage owner-operator averages · ZipRecruiter · Indeed · ATRI 2025</div>

                <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
                  {rows.map(function(row){
                    return(
                      <div key={row.l} style={{background:C.bg,borderRadius:9,padding:"11px 12px",border:"1px solid "+C.border}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                          <div style={{fontSize:10,color:C.sub,textTransform:"uppercase",letterSpacing:"0.05em",fontWeight:600}}>{row.l}</div>
                          <div style={{fontSize:9,padding:"2px 8px",borderRadius:5,background:(row.ok?C.green:C.gold)+"22",color:row.ok?C.green:C.gold,fontWeight:700}}>
                            {row.pct!==null?row.pct+"% of avg":row.tag}
                          </div>
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div>
                            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:17,fontWeight:800,color:row.ok?C.green:C.gold}}>{row.yours}</div>
                            <div style={{fontSize:9,color:C.sub,marginTop:1}}>Your average</div>
                          </div>
                          <div style={{fontSize:16,color:C.border}}>vs</div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontSize:12,fontWeight:700,color:C.text}}>{row.bench}</div>
                            <div style={{fontSize:9,color:C.sub,marginTop:1}}>National benchmark</div>
                          </div>
                        </div>
                        {row.pct!==null&&(
                          <div style={{marginTop:8,height:4,borderRadius:3,background:C.raised,overflow:"hidden"}}>
                            <div style={{height:"100%",width:Math.min(row.pct,110)+"%",background:row.ok?C.green:C.gold,borderRadius:3}}/>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div style={{background:C.bg,borderRadius:11,padding:"13px 14px",border:"1px solid "+C.border}}>
                  <div style={{fontSize:10,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:9}}>Bottom Line</div>
                  {[
                    {ok:gVsN>=90, text:"Gross earnings at "+gVsN+"% of the national average. "+(gVsN>=95?"Running strong.":(gVsN>=85?"Exclude your partial W09 and you hit the national average.":"More loaded miles will close this gap."))},
                    {ok:nVsN>=90, text:"Weekly net at "+nVsN+"% of the National Drayage Services benchmark. Less than one good load separates you."},
                    {ok:true,     text:"Net margin of "+mPct.toFixed(1)+"% is "+(mStatus==="above"?"above":"within")+" the 40–60% industry range. Your deduction efficiency is healthy."},
                    {ok:aStatus!=="below", text:"Annualized net of $"+Math.round(annNet/1000)+"k is "+(aStatus==="top"?"near the top of":"within")+" the $70k–$120k industry range."},
                  ].map(function(item,idx){
                    return(
                      <div key={idx} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:7}}>
                        <span style={{flexShrink:0,fontSize:13}}>{item.ok?"✅":"⚠️"}</span>
                        <div style={{fontSize:11,color:C.text,lineHeight:1.55}}>{item.text}</div>
                      </div>
                    );
                  })}
                  <div style={{marginTop:8,padding:"9px 11px",background:C.a3+"12",borderRadius:8,border:"1px solid "+C.a3+"33",fontSize:11,color:C.a3,fontWeight:600,lineHeight:1.55}}>
                    {gVsN>=95&&nVsN>=95?"You are running above the national average.":gVsN>=85&&nVsN>=85?"You are running close to the national average.":"There is room to close the gap."} Your low weeks (W09, W12) pull the average down — floor those at $2,500+ net and you land in the top 15% nationally.
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── VISITOR TRACKING (dev/owner only) ── */}
          {ownerDataAvailable&&(()=>{
            try{
              const visits=JSON.parse(localStorage.getItem("ciq_visits")||"[]");
              const today=new Date().toDateString();
              const todayV=visits.filter(v=>new Date(v.t).toDateString()===today).length;
              const week=visits.filter(v=>(Date.now()-v.t)<7*24*3600*1000).length;
              const total=visits.length;
              const sources=[...new Set(visits.map(v=>v.ref||"direct"))].slice(0,4);
              return(
                <div style={K({border:`1px solid ${C.a3}44`,marginBottom:16})}>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,marginBottom:12}}>📊 Visitor Tracking</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
                    {[{l:"Today",v:todayV,c:C.accent},{l:"This Week",v:week,c:C.a3},{l:"Total",v:total,c:C.gold}].map(s=>(
                      <div key={s.l} style={{background:C.bg,borderRadius:9,padding:"10px",textAlign:"center",border:`1px solid ${C.border}`}}>
                        <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,fontWeight:800,color:s.c}}>{s.v}</div>
                        <div style={{fontSize:10,color:C.sub,marginTop:3}}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{fontSize:10,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Traffic Sources</div>
                  {sources.map((s,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`,fontSize:11}}>
                      <span style={{color:C.text}}>{s||"direct"}</span>
                      <span style={{color:C.sub}}>{visits.filter(v=>(v.ref||"direct")===s).length} visits</span>
                    </div>
                  ))}
                  <div style={{fontSize:9,color:C.sub,marginTop:8,fontStyle:"italic"}}>Note: Visits tracked per browser session on this device. For full analytics connect Google Analytics.</div>
                </div>
              );
            }catch(e){return null;}
          })()}

          {/* ── EXPORT ── */}
          <NoBadge/>
          <div style={K({marginBottom:80})}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,marginBottom:6}}>📤 Export Report</div>
            <div style={{fontSize:10,color:C.sub,marginBottom:12}}>YTD financials + expenses + documents. Print or email to your accountant, broker, or lender.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <button onClick={printReport} style={{padding:"14px",borderRadius:10,background:`${C.accent}18`,border:`1px solid ${C.accent}55`,color:C.accent,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <span style={{fontSize:22}}>🖨️</span>
                <span>Print Report</span>
                <span style={{fontSize:9,fontWeight:400,color:C.sub}}>Opens print dialog</span>
              </button>
              <button onClick={emailReport} style={{padding:"14px",borderRadius:10,background:`${C.a3}18`,border:`1px solid ${C.a3}55`,color:C.a3,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <span style={{fontSize:22}}>📧</span>
                <span>Email Report</span>
                <span style={{fontSize:9,fontWeight:400,color:C.sub}}>Opens mail app</span>
              </button>
            </div>
            <div style={{padding:"8px 12px",background:C.bg,borderRadius:8,border:`1px solid ${C.border}`,fontSize:10,color:C.sub}}>
              {allW.length} weeks · {expenses.length} expenses · {docs.length} documents
            </div>
          </div>

        </div>
      )}

      </div>

      {/* ── BOTTOM NAV — mobile tab switcher ── */}
      {/* ── SOCIAL MEDIA FOOTER ── */}
      <div style={{background:C.surf,borderTop:`1px solid ${C.border}`,padding:"18px 16px",textAlign:"center"}}>
        <div style={{fontSize:10,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14}}>Follow Us · Share · Connect</div>
        <div style={{display:"flex",justifyContent:"center",gap:12,flexWrap:"wrap",marginBottom:12}}>
          {[
            {name:"Facebook",icon:"📘",color:"#1877F2",url:"https://facebook.com"},
            {name:"Instagram",icon:"📸",color:"#E1306C",url:"https://instagram.com"},
            {name:"TikTok",icon:"🎵",color:"#00F2EA",url:"https://tiktok.com"},
            {name:"YouTube",icon:"▶️",color:"#FF0000",url:"https://youtube.com"},
            {name:"WhatsApp",icon:"💬",color:"#25D366",url:"https://wa.me"},
            {name:"LinkedIn",icon:"💼",color:"#0A66C2",url:"https://linkedin.com"},
            {name:"X/Twitter",icon:"𝕏",color:"#f0f6ff",url:"https://x.com"},
          ].map(s=>(
            <button key={s.name} onClick={()=>window.open(s.url,"_blank")}
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,padding:"10px 12px",borderRadius:12,background:C.raised,border:`1px solid ${C.border}`,cursor:"pointer",fontFamily:"inherit",minWidth:56,transition:"all 0.15s"}}
              onMouseOver={e=>e.currentTarget.style.borderColor=s.color}
              onMouseOut={e=>e.currentTarget.style.borderColor=C.border}>
              <span style={{fontSize:22}}>{s.icon}</span>
              <span style={{fontSize:9,fontWeight:700,color:C.sub}}>{s.name}</span>
            </button>
          ))}
        </div>
        <div style={{fontSize:10,color:C.sub,lineHeight:1.7}}>
          Share ContractorIQ with a fellow driver 🚛 · Help them know their numbers · Tag us <strong style={{color:C.accent}}>@ContractorIQ</strong>
        </div>
      </div>

      {/* ── LEGAL DISCLAIMER FOOTER ── */}
      <div style={{background:C.bg,borderTop:"1px solid "+C.border,padding:"14px 16px",marginBottom:0}}>
        <div style={{fontSize:9,color:C.sub,lineHeight:1.8,textAlign:"center",maxWidth:600,margin:"0 auto"}}>
          <div style={{fontWeight:700,color:C.sub,marginBottom:6,fontSize:10,letterSpacing:"0.05em",textTransform:"uppercase"}}>⚖️ Legal Disclaimer</div>
          <div style={{marginBottom:6}}>
            <strong style={{color:C.sub}}>Not Financial or Legal Advice.</strong> ContractorIQ is an informational tool only. All data, analysis, AI responses, offer scores, and business insights provided are for educational and informational purposes only. Nothing on this platform constitutes financial, legal, tax, or professional business advice. Always consult a qualified professional before making business decisions.
          </div>
          <div style={{marginBottom:6}}>
            <strong style={{color:C.sub}}>Your Data Stays On Your Device.</strong> All settlement data you upload or enter is stored locally on your device only. ContractorIQ does not transmit, store, sell, or share your personal or financial data on any server. You are solely responsible for the data you enter and how you use the results.
          </div>
          <div style={{marginBottom:6}}>
            <strong style={{color:C.sub}}>No Earnings Guarantee.</strong> Results, scores, and projections shown in this app are estimates based on data you provide. ContractorIQ makes no guarantee of income, profit, or business outcomes. Actual results will vary based on market conditions, carrier contracts, fuel prices, and individual circumstances.
          </div>
          <div style={{marginBottom:6}}>
            <strong style={{color:C.sub}}>Use At Your Own Risk.</strong> ContractorIQ, its owners, developers, and affiliates are not liable for any financial loss, business decision, or damages arising from the use of this application. By using this tool you agree to these terms.
          </div>
          <div style={{marginBottom:4}}>
            <strong style={{color:C.sub}}>AI Technology Disclaimer.</strong> AI-generated responses are produced by Anthropic Claude and may not always be accurate, complete, or current. Do not rely solely on AI output for critical business or financial decisions.
          </div>
          <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid "+C.border,fontSize:8,color:C.border}}>
            © {new Date().getFullYear()} ContractorIQ · All Rights Reserved · getcontractoriq.com · By using this app you accept our Terms of Use and Privacy Policy.
          </div>
        </div>
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:200,background:C.surf,borderTop:"1px solid "+C.border,display:"flex",alignItems:"stretch",height:58,boxShadow:"0 -4px 20px rgba(0,0,0,0.4)"}}>
        {[
          {t:"dashboard", icon:"📊", label:"Dash"},
          {t:"loads", icon:"📋", label:"Docs"},
          {t:"growth",    icon:"🚀", label:"Growth"},
          {t:"ai",        icon:"🧠", label:"AI"},
        ].map(item=>(
          <button key={item.t} onClick={()=>{setTab(item.t);window.scrollTo({top:0,behavior:"smooth"});}}
            style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:"6px 0",borderTop:"2px solid "+(tab===item.t?C.accent:"transparent"),transition:"border-color 0.15s"}}>
            <span style={{fontSize:18,lineHeight:1}}>{item.icon}</span>
            <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",color:tab===item.t?C.accent:C.sub}}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Spacer so content clears the bottom nav */}
      <div style={{height:58}}/>
    </div>
  );
}
