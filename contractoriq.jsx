import React, { useState, useEffect, useRef } from 'react';

const DARK={bg:"#0b0f1c",surf:"#141928",card:"#1a2236",raised:"#232f45",border:"#2c3a52",accent:"#00ffcc",a2:"#ff7a45",a3:"#a78bfa",text:"#f0f6ff",sub:"#8fa3c0",green:"#4ade80",red:"#f87171",gold:"#fbbf24"};
const LIGHT={bg:"#e8eef5",surf:"#ffffff",card:"#f5f8fc",raised:"#dce4ef",border:"#a8b8cc",accent:"#005f8a",a2:"#a02800",a3:"#4c1d95",text:"#050d1a",sub:"#1a2d45",green:"#0f4c25",red:"#8b0000",gold:"#7a4a00"};
const C=DARK;
const _K=(C)=>(x={})=>({background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"18px",...x});
const gc=g=>g==="A"?C.green:g==="B"?C.accent:g==="C"?C.gold:C.red;
const inp={width:"100%",padding:"11px 13px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:9,color:C.text,fontSize:13,boxSizing:"border-box",fontFamily:"inherit",outline:"none"};
const lbl={fontSize:10,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5,display:"block"};

function Bar({pct,color,h=8}){return <div style={{background:"#0a0f1a",borderRadius:4,height:h,overflow:"hidden"}}><div style={{width:`${Math.min(pct,100)}%`,background:color,height:"100%",borderRadius:4,transition:"width 0.7s"}}/></div>;}
function Nav({i,max,prev,next,label}){return <div style={{display:"flex",gap:6,alignItems:"center"}}><button onClick={prev} disabled={i===0} style={{width:28,height:28,borderRadius:7,background:C.raised,border:`1px solid ${C.border}`,color:i===0?C.border:C.text,cursor:i===0?"default":"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button><span style={{fontSize:12,fontWeight:700,color:"#00ffcc",minWidth:42,textAlign:"center"}}>{label}</span><button onClick={next} disabled={i===max} style={{width:28,height:28,borderRadius:7,background:C.raised,border:`1px solid ${C.border}`,color:i===max?C.border:C.text,cursor:i===max?"default":"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button></div>;}
function Tag({color,children}){return <span style={{padding:"3px 9px",borderRadius:20,fontSize:11,background:`${color}18`,border:`1px solid ${color}44`,color}}>{children}</span>;}

function scoreMove(m){
  const miles=m.miles||m.mi||0,rate=m.rate||m.rt||0,fsc=m.fsc||m.fc||0,type=m.type||m.t||"L";
  const rpm=miles>0?(rate+fsc)/miles:0;
  const isRoundTrip=type==="RT"||m.isRoundTrip===true,isFlatRate=!isRoundTrip&&fsc===0&&rate>=100,hasFSC=fsc>0,isDropHook=isFlatRate&&miles<=30;
  let s=0,tags=[];
  if(rpm>=3.5){s+=40;tags.push("💰 Premium RPM");}else if(rpm>=2.5){s+=25;tags.push("✅ Good RPM");}else if(rpm>=2.0){s+=15;tags.push("📊 Fair RPM");}else if(rpm>=1.8){s+=10;tags.push("⚠️ Low RPM");}else tags.push("🚫 Below Cost");
  if(isRoundTrip){s+=25;tags.push("🔄 Round Trip");}else if(type==="L"){s+=20;tags.push("📦 Loaded");}else{s+=5;tags.push("🔁 Empty");}
  if(hasFSC){s+=15;tags.push("⛽ FSC Included");}else if(isRoundTrip||isFlatRate){s+=15;tags.push("💵 Flat Rate All-In");}
  if(isDropHook){s+=10;tags.push("🪝 Drop & Hook");}else if(miles>=70&&miles<=100){s+=10;tags.push("📍 Sweet Spot");}else if(miles>100){s+=5;tags.push("🛣️ Long Haul");}
  return{score:s,grade:s>=70?"A":s>=50?"B":s>=30?"C":"D",rpm:rpm.toFixed(2),tags,isRoundTrip,isFlatRate,isDropHook,hasFSC};
}

async function ai(msgs,sys){
  try{
    const apiKey=typeof __ANTHROPIC_KEY__!=="undefined"&&__ANTHROPIC_KEY__?__ANTHROPIC_KEY__:(window.__CIQ_KEY__||"");
    if(!apiKey)return "⚠️ AI features require setup. Contact support at getcontractoriq.com";
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:1500,system:sys||"You are a helpful trucking business advisor.",messages:msgs})});
    if(!r.ok){const e=await r.text();return "⚠️ API Error "+r.status+": "+e.slice(0,100);}
    const d=await r.json();
    if(d.error)return "⚠️ "+d.error.message;
    const txt=d.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"";
    return txt||"I received your message but had no response. Please try again.";
  }catch(err){return "⚠️ Connection error: "+err.message;}
}

function copyText(t){if(navigator.clipboard?.writeText)navigator.clipboard.writeText(t).catch(()=>fbCopy(t));else fbCopy(t);}
function fbCopy(t){const e=document.createElement("textarea");e.value=t;e.style.cssText="position:fixed;opacity:0";document.body.appendChild(e);e.focus();e.select();document.execCommand("copy");document.body.removeChild(e);}

const W=[
  {vendor:"CPG",week:"09",label:"Week 09",from:"02/23/2026",to:"03/01/2026",gross:1865.26,net:338.55,totalDeductions:1565.10,rebate:38.39,gallons:255.92,
   deds:[{l:"Parking Lot/Security",a:40.00},{l:"OCC/ACC Insurance",a:32.64},{l:"Escrow Regular",a:100.00},{l:"Fuel Advance (TA Baltimore)",a:607.32},{l:"ELD Usage Fee",a:10.00},{l:"Event Recorder Fee",a:10.00},{l:"Bobtail Insurance",a:10.61},{l:"License Plate Program",a:55.00},{l:"Physical Damage Insurance",a:33.64},{l:"Fuel Advance (Pilot 179)",a:645.28},{l:"2290 Escrow Fund",a:10.00},{l:"Roadside Assistance Insurance",a:10.61}],
   moves:[{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},{t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:270,fc:37.49},{t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:37.49},{t:"E",fr:"LANCASPA",to:"DUNDALMD",mi:73,rt:128,fc:35.15},{t:"L",fr:"DUNDALMD",to:"LANCASPA",mi:73,rt:192,fc:35.15},{t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:195,fc:37.49},{t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:37.49}]},
  {vendor:"CPG",week:"10",label:"Week 10",from:"03/02/2026",to:"03/08/2026",gross:5263.42,net:3014.69,totalDeductions:2311.96,rebate:63.17,gallons:421.14,
   deds:[{l:"Parking Lot/Security",a:40.00},{l:"Event Recorder Fee",a:10.00},{l:"Physical Damage Insurance",a:33.64},{l:"Fuel Advance (Pilot 179)",a:568.35},{l:"ELD Usage Fee",a:10.00},{l:"Fuel Advance (Pilot Carneys Point)",a:745.00},{l:"2290 Escrow Fund",a:10.00},{l:"License Plate Program",a:55.00},{l:"Roadside Assistance Insurance",a:10.61},{l:"Bobtail Insurance",a:10.61},{l:"Fuel Advance (Pilot 179)",a:686.11},{l:"OCC/ACC Insurance",a:32.64},{l:"Escrow Regular",a:100.00}],
   moves:[{t:"E",fr:"MIDD1PA",to:"ELIZABNJ",mi:163,rt:326,fc:153.66},{t:"L",fr:"DUNDALMD",to:"MIDD1PA",mi:90,rt:186,fc:0},{t:"L",fr:"ELIZABNJ",to:"DUNDALMD",mi:173,rt:447.71,fc:273.04},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},{t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:195,fc:37.49},{t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:37.49},{t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:38.18},{t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:195,fc:37.49},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},{t:"L",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:270,fc:38.18},{t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:38.18}]},
  {vendor:"CPG",week:"11",label:"Week 11",from:"03/09/2026",to:"03/15/2026",gross:5070.70,net:2816.36,totalDeductions:2309.91,rebate:55.44,gallons:369.59,
   deds:[{l:"2290 Escrow Fund",a:10.00},{l:"License Plate Program",a:55.00},{l:"Event Recorder Fee",a:10.00},{l:"Parking Lot/Security",a:40.00},{l:"Escrow Regular",a:100.00},{l:"ELD Usage Fee",a:10.00},{l:"Fuel Advance (Pilot 179)",a:926.30},{l:"Roadside Assistance Insurance",a:10.61},{l:"OCC/ACC Insurance",a:32.64},{l:"Physical Damage Insurance",a:33.64},{l:"Fuel Advance (Pilot 179)",a:276.89},{l:"Fuel Advance (Pilot 150)",a:794.22},{l:"Bobtail Insurance",a:10.61}],
   moves:[{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"L",fr:"DUNDALMD",to:"GREENCPA",mi:94,rt:202,fc:53.47},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},{t:"E",fr:"MIDD1PA",to:"ELIZABNJ",mi:163,rt:326,fc:153.66},{t:"L",fr:"ELIZABNJ",to:"DUNDALMD",mi:173,rt:706.38,fc:189.85},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},{t:"L",fr:"DUNDALMD",to:"GREENCPA",mi:94,rt:202,fc:53.47},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"E",fr:"CHAM1PA",to:"BALTIMMD",mi:106,rt:147,fc:61.20},{t:"L",fr:"BALTIMMD",to:"CHAM1PA",mi:106,rt:220,fc:61.20},{t:"E",fr:"GREENCPA",to:"DUNDALMD",mi:94,rt:135,fc:53.47},{t:"L",fr:"DUNDALMD",to:"DUNDALMD",mi:10,rt:100,fc:0},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0}]},
  {vendor:"CPG",week:"12",label:"Week 12",from:"03/16/2026",to:"03/22/2026",gross:3479.98,net:1424.28,totalDeductions:2103.24,rebate:47.34,gallons:315.59,
   deds:[{l:"Fuel Highway Taxes",a:6.56},{l:"2290 Escrow Fund",a:10.00},{l:"Bobtail Insurance",a:10.61},{l:"Escrow Regular",a:100.00},{l:"ELD Usage Fee",a:10.00},{l:"OCC/ACC Insurance",a:32.64},{l:"Physical Damage Insurance",a:33.64},{l:"Fuel Advance (Pilot 179)",a:841.95},{l:"Parking Lot/Security",a:40.00},{l:"Event Recorder Fee",a:10.00},{l:"Fuel Advance (Pilot 179)",a:942.23},{l:"Roadside Assistance Insurance",a:10.61},{l:"License Plate Program",a:55.00}],
   moves:[{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},{t:"L",fr:"SPARROMD",to:"MONROVMD",mi:51,rt:168,fc:32.93},{t:"E",fr:"MONROVMD",to:"DUNDALMD",mi:49,rt:180,fc:0},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},{t:"L",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},{t:"L",fr:"HAGERSMD",to:"BALTIMMD",mi:72,rt:200,fc:0},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"E",fr:"GREENCPA",to:"DUNDALMD",mi:94,rt:135,fc:53.47},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},{t:"E",fr:"NEWCASDE",to:"DUNDALMD",mi:67,rt:122,fc:41.92},{t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:195,fc:45.95},{t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:45.95},{t:"L",fr:"DUNDALMD",to:"YORKPA",mi:63,rt:180,fc:38.92},{t:"E",fr:"YORKPA",to:"DUNDALMD",mi:63,rt:120,fc:38.92},{t:"L",fr:"DUNDALMD",to:"NEWCASDE",mi:66,rt:110,fc:41.92}]},
  {vendor:"CPG",week:"13",label:"Week 13",from:"03/23/2026",to:"03/29/2026",gross:4688.64,net:2857.82,totalDeductions:1870.04,rebate:38.95,gallons:259.64,
   deds:[{l:"OCC/ACC Insurance",a:32.64},{l:"Fuel Advance (Pilot 179)",a:313.31},{l:"Roadside Assistance Insurance",a:10.61},{l:"Physical Damage Insurance",a:33.64},{l:"Fuel Advance (Pilot 150)",a:843.93},{l:"ELD Usage Fee",a:10.00},{l:"2290 Escrow Fund",a:10.00},{l:"Bobtail Insurance",a:10.61},{l:"Escrow Regular",a:100.00},{l:"Fuel Advance (Pilot 179)",a:400.30},{l:"Event Recorder Fee",a:10.00},{l:"License Plate Program",a:55.00},{l:"Parking Lot/Security",a:40.00}],
   moves:[{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:300,fc:0},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"L",fr:"SPARROMD",to:"HAGERSMD",mi:84,rt:298,fc:51.36},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},{t:"E",fr:"GREENCPA",to:"DUNDALMD",mi:94,rt:135,fc:57.40},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:200,fc:0},{t:"L",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:48.33},{t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:270,fc:48.33},{t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:195,fc:48.33},{t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:48.33},{t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:195,fc:48.33},{t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:48.33},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"L",fr:"DUNDALMD",to:"GREENCPA",mi:94,rt:214.50,fc:57.40}]},
  {vendor:"CPG",week:"14",label:"Week 14",from:"03/30/2026",to:"04/05/2026",gross:3783.73,net:2227.91,totalDeductions:1587.99,rebate:31.83,gallons:212.17,
   deds:[{l:"Fuel Advance (Pilot 179)",a:910.88},{l:"Event Recorder Fee",a:10.00},{l:"Roadside Assistance Insurance",a:10.61},{l:"License Plate Program",a:55.00},{l:"Fuel Advance (Pilot 179)",a:367.95},{l:"Bobtail Insurance",a:10.15},{l:"OCC/ACC Insurance",a:31.22},{l:"Parking Lot/Security",a:40.00},{l:"2290 Escrow Fund",a:10.00},{l:"Physical Damage Insurance",a:32.18},{l:"Escrow Regular",a:100.00},{l:"ELD Usage Fee",a:10.00}],
   moves:[{t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:195,fc:52.36},{t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:52.36},{t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:195,fc:52.36},{t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:52.36},{t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:195,fc:52.36},{t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:52.36},{t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:195,fc:52.36},{t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:52.36},{t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:52.36},{t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:245,fc:52.36},{t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:52.36},{t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:245,fc:52.36},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:200,fc:0},{t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:52.36},{t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:245,fc:48.33},{t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:195,fc:52.36},{t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:52.36}]},
  {vendor:"CPG",week:"15",label:"Week 15",from:"04/06/2026",to:"04/12/2026",gross:5705.45,net:3000.28,totalDeductions:2764.49,rebate:58.91,gallons:392.70,
   deds:[{l:"Event Recorder Fee",a:10.00},{l:"ELD Usage Fee",a:10.00},{l:"Parking Lot/Security",a:40.00},{l:"License Plate Program",a:55.00},{l:"Roadside Assistance Insurance",a:10.61},{l:"OCC/ACC Insurance",a:31.22},{l:"Insurance Liability Limiter",a:14.47},{l:"Escrow Regular",a:100.00},{l:"Bobtail Insurance",a:10.15},{l:"Physical Damage Insurance",a:32.18},{l:"2290 Escrow Fund",a:10.00},{l:"Fuel Advance (Pilot 150)",a:253.00},{l:"Fuel Advance (Pilot 179)",a:865.53},{l:"Fuel Advance (Pilot 179)",a:881.87},{l:"Fuel Advance (Pilot 179)",a:440.46}],
   moves:[{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:132,fc:57.66},{t:"L",fr:"DUNDALMD",to:"GREENCPA",mi:94,rt:202,fc:64.45},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:198,fc:57.66},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:132,fc:57.66},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:132,fc:57.66},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:132,fc:57.66},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:198,fc:57.66},{t:"E",fr:"GREENCPA",to:"DUNDALMD",mi:94,rt:135,fc:62.18},{t:"L",fr:"DUNDALMD",to:"GREENCPA",mi:93,rt:122,fc:0},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:198,fc:57.66},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:132,fc:57.66},{t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:245,fc:52.36},{t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:54.27},{t:"E",fr:"GREENCPA",to:"DUNDALMD",mi:94,rt:135,fc:64.45},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:198,fc:57.66},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:162,fc:57.66},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:132,fc:57.66},{t:"L",fr:"BALTIMMD",to:"WILLIAMD",mi:77,rt:245,fc:54.27},{t:"E",fr:"WILLIAMD",to:"BALTIMMD",mi:77,rt:130,fc:54.27},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:198,fc:57.66},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:198,fc:57.66},{t:"E",fr:"HAGERSMD",to:"DUNDALMD",mi:82,rt:132,fc:57.66},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:198,fc:57.66},{t:"L",fr:"DUNDALMD",to:"HAGERSMD",mi:81,rt:198,fc:57.66},{t:"L",fr:"DUNDALMD",to:"GREENCPA",mi:94,rt:202,fc:64.45}]},
];

const DEMO_W=[
  {vendor:"JDT",week:"01",label:"Week 01",from:"01/06/2025",to:"01/10/2025",gross:4200.00,net:2310.00,totalDeductions:1890.00,rebate:45.00,gallons:280.00,deds:[{l:"Operations Fee",a:840.00},{l:"Fuel Advance",a:750.00},{l:"Insurance",a:200.00},{l:"Escrow",a:100.00}],moves:[{mi:62,rt:210,fc:45,t:"L"},{mi:58,rt:195,fc:42,t:"L"},{mi:71,rt:230,fc:48,t:"L"},{mi:45,rt:150,fc:38,t:"E"},{mi:68,rt:220,fc:46,t:"L"}]},
  {vendor:"JDT",week:"02",label:"Week 02",from:"01/13/2025",to:"01/17/2025",gross:4850.00,net:2667.50,totalDeductions:2182.50,rebate:52.00,gallons:310.00,deds:[{l:"Operations Fee",a:970.00},{l:"Fuel Advance",a:890.00},{l:"Insurance",a:200.00},{l:"Escrow",a:122.50}],moves:[{mi:65,rt:225,fc:47,t:"L"},{mi:72,rt:240,fc:50,t:"L"},{mi:55,rt:185,fc:40,t:"L"},{mi:68,rt:220,fc:46,t:"L"},{mi:48,rt:160,fc:39,t:"E"}]},
  {vendor:"JDT",week:"03",label:"Week 03",from:"01/20/2025",to:"01/24/2025",gross:3900.00,net:2145.00,totalDeductions:1755.00,rebate:38.00,gallons:265.00,deds:[{l:"Operations Fee",a:780.00},{l:"Fuel Advance",a:720.00},{l:"Insurance",a:200.00},{l:"Escrow",a:55.00}],moves:[{mi:58,rt:190,fc:41,t:"L"},{mi:62,rt:205,fc:44,t:"L"},{mi:70,rt:228,fc:47,t:"L"},{mi:52,rt:172,fc:38,t:"E"}]},
];

const VENDORS={
  JDT:{name:"Demo Driver Co",short:"DEMO",icon:"🚛",color:"#00ffcc",unit:""},
  CPG:{name:"Lilwemma Services Co",short:"CPG",icon:"⚓",color:"#00ffcc",unit:"BAL975"},
  STG:{name:"STG Drayage",short:"STG",icon:"⚓",color:"#a78bfa",unit:""},
  AMZ:{name:"Amazon Freight",short:"AMZ",icon:"📦",color:"#ff7a45",unit:""},
  OTH:{name:"Other",short:"OTH",icon:"🏢",color:"#fbbf24",unit:""},
};

function detectVendor(w){
  if(w.vendor&&VENDORS[w.vendor])return w.vendor;
  const text=JSON.stringify(w).toLowerCase();
  if(text.includes("seagirt")||text.includes("stg drayage")||text.includes("107h089")||text.includes("ports america"))return "STG";
  if(text.includes("containerport")||text.includes("hagersmd")||text.includes("dundalmd")||text.includes("williamd")||text.includes("baltimmd")||text.includes("bal975")||text.includes("pilot 179")||text.includes("pilot 150"))return "CPG";
  if(text.includes("amazon")||text.includes("amz")||text.includes("flex"))return "AMZ";
  return "OTH";
}

function mergeExtraPay(moves){
  const result=[];
  for(const m of moves){
    const mi=m.mi||m.miles||0,rt=m.rt||m.rate||0,fc=m.fc||m.fsc||0,fr=m.fr||m.from||"",to=m.to||"",t=m.t||m.type||"L";
    const isExtra=(mi===0)||(mi>0&&rt>0&&rt<100&&fc===0);
    if(isExtra){
      const prev=[...result].reverse().find(r=>{const rf=r.fr||r.from||"",rt2=r.to||"",rt3=r.t||r.type||"L";return rf===fr&&rt2===to&&rt3===t&&(r.mi||r.miles||0)>0;});
      if(prev){prev.rt=(prev.rt||prev.rate||0)+rt;prev.fc=(prev.fc||prev.fsc||0)+fc;prev.extraPay=(prev.extraPay||0)+rt;continue;}
    }
    result.push({...m,extraPay:0});
  }
  return result;
}

function pairRoundTrips(moves){
  const result=[],used=new Set();
  moves.forEach((m,i)=>{
    if(used.has(i))return;
    const mi=m.mi||m.miles||0,rt=m.rt||m.rate||0,fc=m.fc||m.fsc||0,fr=m.fr||m.from||"",to=m.to||"",t=m.t||m.type||"L",isFlatRate=fc===0&&rt>=100;
    if(!isFlatRate){result.push(m);return;}
    let matchIdx=-1;
    moves.forEach((m2,j)=>{
      if(used.has(j)||j===i)return;
      const rt2=m2.rt||m2.rate||0,fc2=m2.fc||m2.fsc||0,fr2=m2.fr||m2.from||"",to2=m2.to||"",t2=m2.t||m2.type||"L";
      if(fc2===0&&rt2>=100&&fr===to2&&to===fr2&&t!==t2&&matchIdx===-1)matchIdx=j;
    });
    if(matchIdx!==-1){
      const m2=moves[matchIdx],emptyLeg=t==="E"?m:m2,loadedLeg=t==="L"?m:m2;
      const totalMi=(emptyLeg.mi||emptyLeg.miles||0)+(loadedLeg.mi||loadedLeg.miles||0);
      const totalPay=(emptyLeg.rt||emptyLeg.rate||0)+(loadedLeg.rt||loadedLeg.rate||0);
      result.push({t:"RT",type:"RT",fr:loadedLeg.fr||loadedLeg.from||"",to:loadedLeg.to||"",mi:totalMi,miles:totalMi,rt:totalPay,rate:totalPay,fc:0,fsc:0,extraPay:0,isRoundTrip:true,emptyPay:emptyLeg.rt||emptyLeg.rate||0,loadedPay:loadedLeg.rt||loadedLeg.rate||0,emptyMi:emptyLeg.mi||emptyLeg.miles||0,loadedMi:loadedLeg.mi||loadedLeg.miles||0});
      used.add(i);used.add(matchIdx);
    } else result.push(m);
  });
  return result;
}

function grpDeds(deds,gross){
  const fuel=deds.filter(d=>["fuel advance","fuel","diesel"].some(k=>d.l.toLowerCase().includes(k))&&!d.l.toLowerCase().includes("escrow")).reduce((s,d)=>s+d.a,0);
  const ins=deds.filter(d=>["physical damage","bobtail","occ/acc","roadside"].some(k=>d.l.toLowerCase().includes(k))).reduce((s,d)=>s+d.a,0);
  const ops=deds.filter(d=>["eld","event recorder","parking","license","highway tax"].some(k=>d.l.toLowerCase().includes(k))).reduce((s,d)=>s+d.a,0);
  return [
    {icon:"⛽",label:"Fuel Advances",amt:fuel,color:"#f87171",pct:(fuel/gross*100).toFixed(1)},
    {icon:"🛡️",label:"Insurance",amt:ins,color:"#fbbf24",pct:(ins/gross*100).toFixed(1)},
    {icon:"🔧",label:"Operations",amt:ops,color:"#00ffcc",pct:(ops/gross*100).toFixed(1)},
  ];
}

function getDeviceFingerprint(){
  try{
    var cv=document.createElement("canvas"),ctx=cv.getContext("2d");ctx.fillText("ciq_fp",10,10);
    var fp=cv.toDataURL()+navigator.userAgent+screen.width+"x"+screen.height+navigator.language+(navigator.hardwareConcurrency||"");
    var hash=0;for(var i=0;i<fp.length;i++){hash=((hash<<5)-hash)+fp.charCodeAt(i);hash|=0;}
    return "fp_"+Math.abs(hash).toString(36);
  }catch(e){return "fp_default";}
}

export default function ContractorIQv26(){

  if(typeof document!=='undefined'&&!document.getElementById('ciq-elite-css')){
    const s=document.createElement('style');s.id='ciq-elite-css';
    s.textContent=`
      @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
      @keyframes rotate-radial{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
      @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
      @keyframes fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      .stat-grad{background:linear-gradient(135deg,#00ffcc,#a5f3fc,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;background-size:200% auto;animation:shimmer 3s linear infinite}
      .shimmer-vendor{background:linear-gradient(-45deg,#0d1525,#1a2436,#0a0e1a,#162033);background-size:400% 400%;animation:rotate-radial 8s ease infinite}
      .tab-active-glow{box-shadow:0 0 14px rgba(0,255,204,0.5)!important}
    `;
    document.head.appendChild(s);
  }

  const [tab,setTab]=useState("dashboard");
  const [sD,setSD]=useState(7);
  const [sM,setSM]=useState(7);
  const [sH,setSH]=useState(7);
  const [sR,setSR]=useState(7);
  const [wide,setWide]=useState(window.innerWidth>700);
  const [darkMode,setDarkMode]=useState(()=>{try{const s=localStorage.getItem("ciq_theme");return s?s==="dark":true;}catch{return true;}});
  const C=darkMode?DARK:LIGHT;
  const K=_K(C);
  useEffect(()=>{document.body.style.background=C.bg;document.body.style.color=C.text;},[darkMode]);
  const [searchQ,setSearchQ]=useState("");
  const [searchResult,setSearchResult]=useState("");
  const [searchLoading,setSearchLoading]=useState(false);
  useState(()=>{try{const key="ciq_visits",visits=JSON.parse(localStorage.getItem(key)||"[]");visits.push({t:Date.now(),ua:navigator.userAgent.slice(0,60),ref:document.referrer.slice(0,80)||"direct"});if(visits.length>100)visits.splice(0,visits.length-100);localStorage.setItem(key,JSON.stringify(visits));}catch(e){}});
  const [offer,setOffer]=useState({miles:"",rate:"",fsc:"",type:"L"});
  const [offerRes,setOfferRes]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [newMove,setNewMove]=useState({type:"L",from:"",to:"",miles:"",rate:"",fsc:""});
  const [extra,setExtra]=useState([]);
  const [scanning,setScanning]=useState(false);
  const [scanResult,setScanResult]=useState(null);
  const [scanMsg,setScanMsg]=useState("");
  const [scanForm,setScanForm]=useState({week:"",from:"",to:"",gross:"",net:"",deds:"",moves:""});
  const [vendorPick,setVendorPick]=useState("CPG");
  const [fuelMPG,setFuelMPG]=useState(5.2);
  const [fuelPrice,setFuelPrice]=useState(6.22);
  const [milesBuffer,setMilesBuffer]=useState(5);
  const [focusMode,setFocusMode]=useState(false);
  const [showSettings,setShowSettings]=useState(false);
  const [showMenu,setShowMenu]=useState(false);
  const [showAbout,setShowAbout]=useState(false);
  const [showInsurance,setShowInsurance]=useState(false);
  const [showQR,setShowQR]=useState(false);
  const [showMarket,setShowMarket]=useState(false);
  const [showReviews,setShowReviews]=useState(false);
  const [showIconKey,setShowIconKey]=useState(false);
  const [showFleet,setShowFleet]=useState(false);
  const [reviews,setReviews]=useState(()=>{try{return JSON.parse(localStorage.getItem("ciq_reviews")||"[]");}catch{return [];}});
  const [reviewForm,setReviewForm]=useState({name:"",role:"",stars:5,text:""});
  const [addingReview,setAddingReview]=useState(false);
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
  const [isPro,setIsPro]=useState(()=>{if(typeof window!=="undefined"&&window.location.hostname.includes("navy"))return true;try{return localStorage.getItem("ciq_pro")==="true";}catch{return false;}});
  const [trialStart,setTrialStart]=useState(()=>{try{const t=localStorage.getItem("ciq_trial_start");return t?parseInt(t):null;}catch{return null;}});
  const [showUpgrade,setShowUpgrade]=useState(false);
  const [ownerTaps,setOwnerTaps]=useState(0);
  const [upgradeSrc,setUpgradeSrc]=useState("");
  const [oUses,setOUses]=useState(()=>{try{return parseInt(localStorage.getItem("ciq_o_uses")||"0");}catch{return 0;}});
  const [aiUses,setAiUses]=useState(()=>{try{return parseInt(localStorage.getItem("ciq_ai_uses")||"0");}catch{return 0;}});
  const [dismissedAds,setDismissedAds]=useState(()=>{try{const s=localStorage.getItem("ciq_dis_ads");return s?JSON.parse(s):[];}catch{return [];}});
  const DEFAULT_TICKER=[{proName:"AMEX:SPY",title:"S&P 500"},{proName:"AMEX:DIA",title:"Dow 30"},{proName:"NASDAQ:QQQ",title:"Nasdaq"},{proName:"AMEX:IWM",title:"Russell 2000"},{proName:"CBOE:VIX",title:"VIX"},{proName:"AMEX:GLD",title:"Gold ETF"},{proName:"AMEX:USO",title:"Oil ETF"},{proName:"COINBASE:BTCUSD",title:"Bitcoin"},{proName:"NYSE:XOM",title:"Exxon"},{proName:"NASDAQ:JBHT",title:"J.B. Hunt"}];
  const [tickerSyms,setTickerSyms]=useState(()=>{try{const s=localStorage.getItem("ciq_ticker");return s?JSON.parse(s):DEFAULT_TICKER;}catch{return DEFAULT_TICKER;}});
  const [showTickerEdit,setShowTickerEdit]=useState(false);
  const [tickerInput,setTickerInput]=useState("");
  const [scanMode,setScanMode]=useState("upload");
  const [pasteText,setPasteText]=useState("");
  const [pdfUrl,setPdfUrl]=useState("");
  const [pasteResult,setPasteResult]=useState(null);
  const [pasteLoading,setPasteLoading]=useState(false);
  const fileRef=useRef(null);
  const imgRef=useRef(null);
  const expRef=useRef(null);
  const docRef=useRef(null);
  const [chat,setChat]=useState([{r:"a",t:"👋 Welcome to ContractorIQ! Upload your first settlement or explore demo mode. Ask me anything about your trucking business."}]);
  const [chatIn,setChatIn]=useState("");
  const [chatLoad,setChatLoad]=useState(false);
  const [aiMode,setAiMode]=useState("chat");
  const [aiOut,setAiOut]=useState("");
  const [aiLoad,setAiLoad]=useState(false);
  const [manForm,setManForm]=useState({week:"",from:"",to:"",gross:"",net:"",deductions:"",moves:""});
  const [addedW,setAddedW]=useState(()=>{try{const s=localStorage.getItem("ciq_addedWeeks");return s?JSON.parse(s):[];}catch{return [];}});
  const [addMsg,setAddMsg]=useState("");
  const [dlWk,setDlWk]=useState(null);
  const chatEnd=useRef(null);

  const ownerDataAvailable=typeof window!=="undefined"&&window.location.hostname.includes("navy");
  const [demoMode,setDemoMode]=useState(()=>{
    if(typeof window!=="undefined"&&window.location.hostname.includes("navy"))return false;
    try{const d=localStorage.getItem("ciq_demo"),hasWeeks=localStorage.getItem("ciq_addedWeeks"),added=hasWeeks?JSON.parse(hasWeeks):[];if(d==="false"&&added.length>0)return false;return true;}catch{return true;}
  });
  const isOwnerMode=typeof window!=="undefined"&&(window.location.hostname.includes("navy")||window.location.search.includes("owner=true"));
  const [showWelcome,setShowWelcome]=useState(()=>{
    if(isOwnerMode)return false;
    try{
      const hasDismissed=localStorage.getItem("ciq_welcome_done"),hasAddedWeeks=localStorage.getItem("ciq_addedWeeks"),addedParsed=hasAddedWeeks?JSON.parse(hasAddedWeeks):[];
      if(hasDismissed==="true"&&addedParsed.length>0)return false;
      if(hasDismissed==="true"&&localStorage.getItem("ciq_pro")==="true")return false;
      return true;
    }catch{return true;}
  });
  const [deviceFp]=useState(()=>getDeviceFingerprint());

  useEffect(()=>{const h=()=>setWide(window.innerWidth>700);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:"smooth"});},[chat]);
  useEffect(()=>{try{localStorage.setItem("ciq_addedWeeks",JSON.stringify(addedW));}catch(e){}},[addedW]);
  useEffect(()=>{try{localStorage.setItem("ciq_profile",JSON.stringify(profile));}catch(e){};},[profile]);
  useEffect(()=>{try{localStorage.setItem("ciq_expenses",JSON.stringify(expenses));}catch(e){};},[expenses]);
  useEffect(()=>{try{localStorage.setItem("ciq_docs",JSON.stringify(docs));}catch(e){};},[docs]);
  useEffect(()=>{try{localStorage.setItem("ciq_o_uses",String(oUses));}catch(e){};},[oUses]);
  useEffect(()=>{try{localStorage.setItem("ciq_ai_uses",String(aiUses));}catch(e){};},[aiUses]);
  useEffect(()=>{try{localStorage.setItem("ciq_dis_ads",JSON.stringify(dismissedAds));}catch(e){};},[dismissedAds]);
  useEffect(()=>{try{localStorage.setItem("ciq_ticker",JSON.stringify(tickerSyms));}catch(e){};},[tickerSyms]);

  const baseW=ownerDataAvailable?W:[];
  const allW=demoMode?[...DEMO_W]:[...baseW,...addedW];
  const visibleW=allW.filter(w=>{const vk=detectVendor(w);if(activeOnlyVendor&&vk!==activeOnlyVendor)return false;if(hiddenVendors.includes(vk))return false;return true;});
  const safeW=visibleW.length>0?visibleW:(allW.length>0?allW:DEMO_W);
  const vendorKeys=Object.keys(VENDORS);
  const vendorStats=vendorKeys.map(vk=>{const vw=allW.filter(w=>detectVendor(w)===vk);if(!vw.length)return null;const vGross=vw.reduce((s,w)=>s+w.gross,0),vNet=vw.reduce((s,w)=>s+w.net,0),vDed=vw.reduce((s,w)=>s+w.totalDeductions,0);return{...VENDORS[vk],key:vk,weeks:vw.length,gross:vGross,net:vNet,ded:vDed,margin:vGross>0?(vNet/vGross*100).toFixed(1):"0.0"};}).filter(Boolean);
  const allMoves=allW.flatMap(w=>pairRoundTrips(mergeExtraPay(w.moves||[])).map(m=>({type:m.t||m.type,from:m.fr||m.from,to:m.to,miles:m.mi||m.miles||0,rate:m.rt||m.rate||0,fsc:m.fc||m.fsc||0,extraPay:m.extraPay||0,isRoundTrip:m.isRoundTrip||false,emptyPay:m.emptyPay||0,loadedPay:m.loadedPay||0,emptyMi:m.emptyMi||0,loadedMi:m.loadedMi||0,wk:w.week})));
  const tGross=allW.reduce((s,w)=>s+w.gross,0),tNet=allW.reduce((s,w)=>s+w.net,0),tDed=allW.reduce((s,w)=>s+w.totalDeductions,0);
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
  const dw=allW[sD]||allW[allW.length-1];const dg=wg(dw);
  const dwDeds=dw.deds||[];
  const dwGroups=grpDeds(dwDeds,dw.gross);
  const dwGroupTotal=dwGroups.reduce((s,g)=>s+g.amt,0);
  const mwBase=allW[sM]||allW[allW.length-1];
  const mwMoves=pairRoundTrips(mergeExtraPay([...(mwBase.moves||[]),...(sM===allW.length-1?extra:[])])).map(m=>({type:m.t||m.type,from:m.fr||m.from,to:m.to,miles:m.mi||m.miles||0,rate:m.rt||m.rate||0,fsc:m.fc||m.fsc||0,extraPay:m.extraPay||0,isRoundTrip:m.isRoundTrip||false,emptyPay:m.emptyPay||0,loadedPay:m.loadedPay||0}));
  const mwMi=mwMoves.reduce((s,m)=>s+m.miles,0);
  const mwRPM=mwMi>0?(mwMoves.reduce((s,m)=>s+m.rate+m.fsc,0)/mwMi).toFixed(2):"0.00";
  const mwLd=mwMoves.length>0?Math.round(mwMoves.filter(m=>m.type==="L").length/mwMoves.length*100):0;
  const hw=allW[sH]||allW[allW.length-1];
  const latFuel=(latest.deds||[]).filter(d=>d.l.toLowerCase().includes("fuel")).reduce((s,d)=>s+d.a,0);
  const SYS=`Expert drayage business advisor for YOUR COMPANY, CDL owner-operator, Baltimore MD. Real settlement data: ${allW.map(function(w){return "W"+w.week+": Gross $"+w.gross+", Net $"+w.net+", Margin "+(w.net/w.gross*100).toFixed(1)+"%, "+(w.moves||[]).length+" moves";}).join(" | ")}. YTD: Gross $${tGross.toFixed(0)}, Net $${tNet.toFixed(0)}, Margin ${margin}%, Avg RPM $${avgRPM}, Loaded ${ldPct}%. Be specific, practical, use real numbers. Under 300 words.`;

  async function scanPDF(file,fileType){
    setScanning(true);setScanResult(null);setScanMsg("");
    try{
      const apiKey=typeof __ANTHROPIC_KEY__!=="undefined"&&__ANTHROPIC_KEY__?__ANTHROPIC_KEY__:(window.__CIQ_KEY__||"");
      if(!apiKey){setScanMsg("⚠️ API key not configured.");setScanning(false);return;}
      const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
      const isImage=fileType==="image"||file.type.startsWith("image/");
      const mediaType=isImage?(file.type||"image/jpeg"):"application/pdf";
      const contentBlock=isImage?{type:"image",source:{type:"base64",media_type:mediaType,data:b64}}:{type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}};
      const resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:4000,messages:[{role:"user",content:[contentBlock,{type:"text",text:`This is a drayage/trucking settlement statement. Extract ALL data and return ONLY valid JSON with no other text, no markdown:\n{"week":"15","from":"04/06/2026","to":"04/12/2026","gross":0.00,"net":0.00,"totalDeductions":0.00,"rebate":0.00,"moves":[{"t":"L","fr":"BALTIMMD","to":"WILLIAMD","mi":77,"rt":195,"fc":52.36}],"deds":[{"l":"Fuel Advance (Pilot 179)","a":500.00}]}`}]}]})});
      if(!resp.ok){const errText=await resp.text();if(resp.status===401)setScanMsg("⚠️ API key invalid.");else setScanMsg(`⚠️ API Error ${resp.status}. Try Paste Text instead.`);setScanning(false);return;}
      const d=await resp.json();
      if(d.error){setScanMsg("⚠️ AI Error: "+d.error.message);setScanning(false);return;}
      const txt=d.content?.map(b=>b.text||"").join("").trim();
      const jsonStart=txt.indexOf("{"),jsonEnd=txt.lastIndexOf("}")+1;
      if(jsonStart===-1){setScanMsg("⚠️ AI could not extract data. Try Paste Text.");setScanning(false);return;}
      let jsonStr=txt.slice(jsonStart,jsonEnd);
      try{JSON.parse(jsonStr);}catch(truncErr){let depth=0;for(const c of jsonStr){if(c==="{"||c==="[")depth++;else if(c==="}"||c==="]")depth--;}if(depth>0)jsonStr+="]".repeat(Math.max(0,jsonStr.split("[").length-jsonStr.split("]").length))+"}".repeat(Math.max(0,jsonStr.split("{").length-jsonStr.split("}").length));}
      const parsed=JSON.parse(jsonStr);
      parsed.label=`Week ${String(parsed.week).padStart(2,"0")}`;parsed.week=String(parsed.week).padStart(2,"0");
      setScanResult(parsed);setScanMsg(`✅ Week ${parsed.week} read — Gross $${Number(parsed.gross).toFixed(2)}, Net $${Number(parsed.net).toFixed(2)}, ${parsed.moves?.length||0} moves found`);
    }catch(e){setScanMsg("⚠️ Error: "+e.message+". Try Paste Text instead.");}
    setScanning(false);
  }

  async function runSearch(q){
    const query=q||searchQ;if(!query||!query.trim())return;
    setSearchLoading(true);setSearchResult("");
    try{
      const apiKey=import.meta.env.VITE_ANTHROPIC_KEY||(window.__CIQ_KEY__||"");
      let locationCtx="";
      try{const pos=await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{timeout:4000,maximumAge:60000}));locationCtx=`User GPS: lat ${pos.coords.latitude.toFixed(4)}, lng ${pos.coords.longitude.toFixed(4)}.`;}catch(e){}
      const resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:600,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:`You are a helpful assistant for a truck driver. ${locationCtx} Answer concisely: ${query}. Max 150 words. Use bullet points for lists.`}]})});
      const d=await resp.json();const txt=d.content?.filter(b=>b.type==="text").map(b=>b.text||"").join("").trim();
      setSearchResult(txt||"No results found.");
    }catch(e){setSearchResult("⚠️ Search unavailable.");}
    setSearchLoading(false);
  }

  function confirmScan(){
    if(!scanResult)return;
    if(allW.find(w=>w.week===scanResult.week)){setScanMsg("⚠️ Week "+scanResult.week+" already exists.");return;}
    setAddedW(p=>[...p,{...scanResult,vendor:detectVendor(scanResult),moves:scanResult.moves||[],deds:scanResult.deds||[]}]);
    setScanMsg(`✅ Week ${scanResult.week} added!`);setScanResult(null);
  }

  async function parsePasteText(){
    if(!pasteText.trim())return;
    setPasteLoading(true);setPasteResult(null);setScanMsg("");
    const prompt=`You are a data extraction expert for drayage/trucking settlement statements. Extract ALL data and return ONLY valid JSON.\n\nRequired format:\n{"week":"01","from":"01/06/2025","to":"01/10/2025","gross":4200.00,"net":2310.00,"totalDeductions":1890.00,"rebate":45.00,"moves":[{"t":"L","fr":"Port Terminal","to":"Distribution Center","mi":65,"rt":220,"fc":46}],"deds":[{"l":"Operations Fee","a":840.00}]}\n\nSettlement text:\n${pasteText.slice(0,6000)}`;
    try{
      const resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":(typeof __ANTHROPIC_KEY__!=="undefined"&&__ANTHROPIC_KEY__?__ANTHROPIC_KEY__:(window.__CIQ_KEY__||"")),"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:3000,messages:[{role:"user",content:prompt}]})});
      const d=await resp.json();const txt=d.content?.map(b=>b.text||"").join("").trim();
      const s=txt.indexOf("{"),e=txt.lastIndexOf("}")+1;if(s===-1)throw new Error("no json");
      const parsed=JSON.parse(txt.slice(s,e));
      parsed.week=String(parsed.week||"00").padStart(2,"0");parsed.label=`Week ${parsed.week}`;
      parsed.gross=Number(parsed.gross)||0;parsed.net=Number(parsed.net)||0;parsed.totalDeductions=Number(parsed.totalDeductions)||0;
      parsed.rebate=Number(parsed.rebate)||0;parsed.moves=Array.isArray(parsed.moves)?parsed.moves:[];parsed.deds=Array.isArray(parsed.deds)?parsed.deds:[];
      setPasteResult(parsed);setScanMsg(`✅ Read Week ${parsed.week} — Gross $${parsed.gross.toFixed(2)}, Net $${parsed.net.toFixed(2)}, ${parsed.moves.length} moves`);
    }catch(err){setScanMsg("⚠️ Could not parse. Try Type Numbers tab.");}
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
    if(mode==="report"){sys="Write professional plain-text business reports for drayage owner-operators. No markdown. Clear, numbered sections.";prompt=`Weekly settlement report for ${w.label} (${w.from}-${w.to}).\nGross: $${w.gross} | Net: $${w.net} | Margin: ${(w.net/w.gross*100).toFixed(1)}%\nFuel: $${fuel.toFixed(0)} | Moves: ${w.moves.length} | YTD Net: $${tNet.toFixed(0)}\nWrite: 1) Week Summary 2) Top Profit Leak 3) Action Item 4) Outlook. Under 200 words.`;}
    if(mode==="bizplan"){sys="Write professional business plans for small trucking companies. Plain text, no markdown.";prompt=`Business plan for YOUR COMPANY seeking loan to expand 1 to 2 trucks.\nYTD Gross: $${tGross.toFixed(2)} over ${allW.length} weeks\nYTD Net: $${tNet.toFixed(2)} | Margin: ${margin}%\nAvg Weekly Net: $${(tNet/allW.length).toFixed(2)}\nWrite 5 sections: Executive Summary, Business Description, Financial Performance, Loan Request, Growth Strategy. ~400 words.`;}
    if(mode==="funding"){sys="Small business funding advisor specializing in trucking.";prompt=`Owner-operator of YOUR COMPANY seeking funding to add 2nd truck.\nYTD Gross: $${tGross.toFixed(2)} | Net margin: ${margin}% | Avg weekly net: $${(tNet/allW.length).toFixed(2)}\nProvide: 1) Top 3 lenders for trucking 2) SBA programs 3) Trucking financing options 4) Maryland CDFI lenders 5) Documents needed 6) Realistic loan amounts 7) Next step this week`;}
    try{const r=await ai([{role:"user",content:prompt}],sys);setAiOut(r);}
    catch{setAiOut("⚠️ Error. Try again.");}
    setAiLoad(false);
  }

  function addWeek(){
    const {week,from,to,gross,net,deductions,moves}=manForm;
    if(!week||!gross||!net)return;
    const wn=week.padStart(2,"0");
    if(allW.find(w=>w.week===wn)){setAddMsg("⚠️ Week "+wn+" already exists.");setTimeout(()=>setAddMsg(""),3000);return;}
    setAddedW(p=>[...p,{vendor:vendorPick,week:wn,label:`Week ${wn}`,from:from||"",to:to||"",gross:parseFloat(gross)||0,net:parseFloat(net)||0,totalDeductions:parseFloat(deductions)||0,rebate:0,moves:Array.from({length:parseInt(moves)||0},()=>({t:"L",fr:"?",to:"?",mi:0,rt:0,fc:0})),deds:[]}]);
    setAddMsg(`✅ Week ${wn} added!`);setManForm({week:"",from:"",to:"",gross:"",net:"",deductions:"",moves:""});
    setTimeout(()=>setAddMsg(""),4000);
  }

  async function readReceipt(file){
    setExpScan(true);setExpScanMsg("Reading receipt...");
    try{
      const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
      const isImg=file.type.startsWith("image/");const block=isImg?{type:"image",source:{type:"base64",media_type:file.type||"image/jpeg",data:b64}}:{type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}};
      const resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":(typeof __ANTHROPIC_KEY__!=="undefined"&&__ANTHROPIC_KEY__?__ANTHROPIC_KEY__:(window.__CIQ_KEY__||"")),"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:400,messages:[{role:"user",content:[block,{type:"text",text:'Read this receipt. Return ONLY valid JSON: {"date":"MM/DD/YYYY","vendor":"store name","amount":0.00,"category":"Parts|Labor|Tires|Maintenance|Fuel|Permits|Other","desc":"what was purchased"}'}]}]})});
      const d=await resp.json();const raw=d.content?.map(b=>b.text||"").join("")||"{}";
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
      var isImg=file.type.startsWith("image/");var block=isImg?{type:"image",source:{type:"base64",media_type:file.type||"image/jpeg",data:b64}}:{type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}};
      var resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":(typeof __ANTHROPIC_KEY__!=="undefined"&&__ANTHROPIC_KEY__?__ANTHROPIC_KEY__:(window.__CIQ_KEY__||"")),"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:300,messages:[{role:"user",content:[block,{type:"text",text:'Read this. Return ONLY JSON: {"date":"MM/DD/YYYY","title":"document title","category":"Maintenance|Inspection|Insurance|Registration|Medical|Permit|Other","note":"brief summary"}'}]}]})});
      var d=await resp.json();var parsed=JSON.parse((d.content?d.content.map(function(b){return b.text||"";}).join(""):"{}").replace(/```json|```/g,"").trim());
      setDocForm(function(p){return {...p,date:parsed.date||p.date,title:parsed.title||"",category:parsed.category||"Maintenance",note:parsed.note||""};});setDocScanMsg("Read — review and save");
    }catch(e){setDocScanMsg("Could not read — enter manually");}
    setDocScan(false);
  }

  function printReport(){
    var name=profile.name||"YOUR COMPANY",unit=profile.unit||"UNIT#";
    var expRows=expenses.map(function(e){return "<tr><td>"+e.date+"</td><td>"+e.category+"</td><td>"+e.desc+"</td><td>-$"+parseFloat(e.amount||0).toFixed(2)+"</td></tr>";}).join("");
    var docRows=docs.map(function(d){return "<tr><td>"+d.date+"</td><td>"+d.category+"</td><td>"+d.title+"</td><td>"+d.note+"</td></tr>";}).join("");
    var expSec=expRows?"<h2>Extra Expenses</h2><table><thead><tr><th>Date</th><th>Cat</th><th>Desc</th><th>Amt</th></tr></thead><tbody>"+expRows+"</tbody></table>":"";
    var docSec=docRows?"<h2>Documents on File</h2><table><thead><tr><th>Date</th><th>Type</th><th>Title</th><th>Notes</th></tr></thead><tbody>"+docRows+"</tbody></table>":"";
    var html="<!DOCTYPE html><html><head><meta charset='UTF-8'/><title>Report</title><style>body{font-family:Arial,sans-serif;padding:28px;font-size:13px}h2{font-size:12px;font-weight:700;margin:20px 0 8px;text-transform:uppercase;border-bottom:2px solid #000}table{width:100%;border-collapse:collapse}th{text-align:left;padding:6px 8px;background:#f5f5f5;font-size:10px;text-transform:uppercase;border-bottom:2px solid #ddd}td{padding:6px 8px;border-bottom:1px solid #eee}</style></head><body><h1>ContractorIQ Report</h1><p>"+name+" - "+unit+" - "+new Date().toLocaleDateString()+"</p><p>YTD Gross: $"+tGross.toFixed(2)+" | YTD Net: $"+tNet.toFixed(2)+" | Margin: "+margin+"% | Weeks: "+allW.length+"</p>"+expSec+docSec+"</body></html>";
    var w=window.open("","_blank");if(w){w.document.write(html);w.document.close();w.focus();setTimeout(function(){w.print();},500);}
  }

  function emailReport(){
    var name=profile.name||"YOUR COMPANY";var sub="ContractorIQ Report - "+name+" - "+new Date().toLocaleDateString();
    var body="Business Report\n\nYTD Gross: $"+tGross.toFixed(2)+"\nYTD Net: $"+tNet.toFixed(2)+"\nMargin: "+margin+"%\nWeeks: "+allW.length+"\n\nGenerated by ContractorIQ";
    window.location.href="mailto:?subject="+encodeURIComponent(sub)+"&body="+encodeURIComponent(body);
  }

  function generatePDF(w){
    const groups=grpDeds(w.deds,w.gross);
    const dedRows=w.deds.filter(d=>!d.l.toLowerCase().includes("escrow")).sort((a,b)=>b.a-a.a).map(d=>`<tr><td>${d.l}</td><td style="text-align:right;color:${d.a>200?"#f87171":"#f0f6ff"}">${(d.a/w.gross*100).toFixed(1)}%</td><td style="text-align:right;font-weight:700;color:${d.a>200?"#f87171":"#f0f6ff"}">$${d.a.toFixed(2)}</td></tr>`).join("");
    const moveRows=w.moves.map((m,i)=>{const s=scoreMove({miles:m.mi,rate:m.rt,fsc:m.fc,type:m.t});return`<tr><td><span style="padding:2px 7px;border-radius:4px;font-size:11px;background:${m.t==="L"?"#14532d":"#431407"};color:${m.t==="L"?"#86efac":"#fcd34d"}">${m.t==="L"?"LOAD":"EMPTY"}</span></td><td>${m.fr}→${m.to}</td><td>${m.mi}</td><td>$${m.rt}</td><td style="color:${m.fc>0?"#00ffcc":"#8fa3c0"}">${m.fc>0?"$"+m.fc:"—"}</td><td>$${(m.rt+m.fc).toFixed(2)}</td><td style="color:${+s.rpm>=2.5?"#4ade80":"#f87171"}">${s.rpm}</td><td style="color:${gc(s.grade)}">${s.grade}</td></tr>`}).join("");
    const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>DrayageIQ — ${w.label}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:monospace;background:#0b0f1c;color:#f0f6ff;padding:28px;font-size:13px}h1{font-size:20px;font-weight:800;color:#00ffcc}h2{font-size:13px;color:#00ffcc;margin:22px 0 10px;text-transform:uppercase;border-bottom:1px solid #2c3a52;padding-bottom:5px}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}.kpi{background:#1a2236;border:1px solid #2c3a52;border-radius:9px;padding:12px;text-align:center}.kpi .v{font-size:18px;font-weight:800;margin:5px 0}.kpi .l{font-size:9px;color:#8fa3c0;text-transform:uppercase}table{width:100%;border-collapse:collapse;font-size:12px}th{text-align:left;padding:7px;color:#8fa3c0;font-size:10px;text-transform:uppercase;border-bottom:1px solid #2c3a52}td{padding:8px;border-bottom:1px solid rgba(44,58,82,0.5)}.footer{margin-top:24px;padding-top:12px;border-top:1px solid #2c3a52;font-size:10px;color:#8fa3c0;text-align:center}</style></head><body><h1>🚛 DrayageIQ — Settlement Report</h1><p style="color:#8fa3c0;font-size:11px;margin-top:5px">YOUR COMPANY · BAL975 · ${w.label} · ${w.from} – ${w.to}</p><div class="kpis"><div class="kpi"><div class="l">Gross</div><div class="v" style="color:#00ffcc">$${w.gross.toLocaleString("en-US",{minimumFractionDigits:2})}</div></div><div class="kpi"><div class="l">Net Pay</div><div class="v" style="color:#4ade80">$${w.net.toLocaleString("en-US",{minimumFractionDigits:2})}</div></div><div class="kpi"><div class="l">Margin</div><div class="v" style="color:#4ade80">${(w.net/w.gross*100).toFixed(1)}%</div></div><div class="kpi"><div class="l">Moves</div><div class="v" style="color:#a78bfa">${w.moves.length}</div></div></div><h2>Deductions</h2><table><thead><tr><th>Item</th><th>% Gross</th><th>Amount</th></tr></thead><tbody>${dedRows}</tbody></table><h2>Moves</h2><table><thead><tr><th>Type</th><th>Route</th><th>Mi</th><th>Rate</th><th>FSC</th><th>Total</th><th>RPM</th><th>Grade</th></tr></thead><tbody>${moveRows}</tbody></table><div class="footer">DrayageIQ · YOUR COMPANY · ${w.label} · ${new Date().toLocaleString()}</div></body></html>`;
    const blob=new Blob([html],{type:"text/html"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`DrayageIQ-Week${w.week}-2026.html`;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
  }

  const HELP={
    trend:{t:"Net Pay by Week",b:"Each bar shows what you took home in a given week. Tap any bar to sync all cards below."},
    deductions:{t:"Where Your Money Goes",b:"Every deduction grouped into three categories. Use arrows to compare different weeks."},
    health:{t:"Performance by Carrier",b:"Green is strong, gold is worth watching, red needs attention."},
    grades:{t:"Weekly Performance Grades",b:"Each week evaluated against your own history. Look for your best weeks and understand what made them different."},
    savings:{t:"Funds Being Held",b:"Funds held for future use — track these so you know what is being set aside."},
    movePerf:{t:"Route Performance",b:"Every route with a performance rating. Use when evaluating new offers."},
    offerScorer:{t:"Offer Evaluator",b:"Enter offer details to get an instant read before accepting a load. Takes seconds."},
    fullHistory:{t:"Complete Route Log",b:"Every route from every week in one place, sorted from most recent."},
    expenses:{t:"Extra Expenses",b:"Track out-of-pocket costs not on your settlement — parts, repairs, tires, labor."},
    kpis:{t:"Business Snapshot",b:"Your running totals across every week shown."},
    aiChat:{t:"AI Business Advisor",b:"Your private advisor that knows your actual numbers."},
    addSettlement:{t:"Add Settlement Week",b:"Upload your weekly settlement so the app can track your earnings over time."},
    dashboard:{t:"Business Dashboard",b:"Your financial command center. Every number comes directly from your settlement statements."},
    actionPlan:{t:"Weekly Action Plan",b:"Three specific actions generated from your real data this week."},
    benchmarks:{t:"Industry Benchmarks",b:"Your real numbers vs national averages for drayage owner-operators."},
    topBottom:{t:"Top & Bottom Moves",b:"Focus mode — shows your 3 highest and 3 lowest earning routes."},
    vendorCards:{t:"Your Carriers",b:"Summary for each company you haul for."},
  };

  const trialDaysLeft=trialStart?Math.max(0,5-Math.floor((Date.now()-trialStart)/(1000*60*60*24))):0;
  const hasAccess=isPro||(trialStart&&trialDaysLeft>0);
  const FREE_AI=3,FREE_OS=5;
  const aiLocked=!hasAccess&&aiUses>=FREE_AI;
  const osLocked=!hasAccess&&oUses>=FREE_OS;
  const openUpgrade=(src)=>{setUpgradeSrc(src);setShowUpgrade(true);};
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
            <div style={{fontSize:12,color:C.sub,lineHeight:1.6}}>{upgradeSrc==="ai"?"You've used your "+FREE_AI+" free AI messages.":upgradeSrc==="scorer"?"You've used your "+FREE_OS+" free offer scores.":"Upgrade to access the full decision engine."}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
            <button onClick={()=>window.open("https://buy.stripe.com/aFa8wP7FLbMY4Ua0Ls9MY00","_blank")} style={{padding:"16px",borderRadius:12,background:"linear-gradient(135deg,"+C.gold+",#f59e0b)",color:"#000",fontWeight:800,fontSize:14,border:"none",cursor:"pointer",fontFamily:"inherit"}}><div>🔥 Start 5-Day Test Drive</div><div style={{fontSize:11,fontWeight:400,marginTop:3}}>Just $1 — full access, cancel anytime</div></button>
            <button onClick={()=>window.open("https://buy.stripe.com/fZufZh2lr2co3Q6am29MY01","_blank")} style={{padding:"16px",borderRadius:12,background:"linear-gradient(135deg,"+C.accent+","+C.a3+")",color:"#000",fontWeight:800,fontSize:14,border:"none",cursor:"pointer",fontFamily:"inherit"}}><div>⚡ Go Pro — $19.99/month</div><div style={{fontSize:11,fontWeight:400,marginTop:3}}>Unlimited everything · No ads · Cancel anytime</div></button>
            <button onClick={()=>window.open("https://buy.stripe.com/3cIcN5f8d5oAeuKeCi9MY02","_blank")} style={{padding:"14px",borderRadius:12,background:C.raised,border:"1px solid "+C.gold+"55",color:"#fbbf24",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}><div>💎 Founding Member — $97 one-time</div><div style={{fontSize:10,fontWeight:400,color:C.sub,marginTop:2}}>Everything forever · First 50 spots only</div></button>
          </div>
          <button onClick={()=>setShowUpgrade(false)} style={{width:"100%",padding:"10px",borderRadius:9,background:"transparent",border:"1px solid "+C.border,color:C.sub,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Maybe later</button>
        </div>
      </div>
    );
  };

  const helpBtn=(id)=>(
    <button onClick={e=>{e.stopPropagation();setHelpCard(helpCard===id?null:id);}} style={{width:17,height:17,borderRadius:"50%",background:C.raised,border:"1px solid "+C.border,color:C.sub,fontSize:9,cursor:"pointer",fontFamily:"inherit",flexShrink:0,display:"inline-flex",alignItems:"center",justifyContent:"center",fontWeight:700,marginLeft:5}}>?</button>
  );
  const NoBadge=()=>(
    <div style={{marginTop:12,padding:"8px 11px",background:C.gold+"12",borderRadius:9,border:"1px solid "+C.gold+"35",display:"flex",alignItems:"flex-start",gap:7}}>
      <span style={{fontSize:13,flexShrink:0,marginTop:1}}>💰</span>
      <div style={{fontSize:9,lineHeight:1.6}}><span style={{fontWeight:800,color:C.gold}}>WE DON'T COMPETE WITH DAT OR TRUCKLOGICS. </span><span style={{color:C.sub}}>We Show You Where You're Losing Money and Help You Fix It With AI Technology.</span></div>
    </div>
  );
  const helpModal=(id)=>{
    if(helpCard!==id)return null;const h=HELP[id];if(!h)return null;
    return(<div style={{margin:"6px 0 10px",padding:"11px 13px",background:C.a3+"12",borderRadius:9,border:"1px solid "+C.a3+"33",fontSize:11,color:C.sub,lineHeight:1.7,position:"relative"}}><div style={{fontWeight:700,color:"#a78bfa",marginBottom:4,fontSize:12}}>{h.t}</div><div>{h.b}</div><button onClick={()=>setHelpCard(null)} style={{position:"absolute",top:7,right:9,background:"none",border:"none",color:C.sub,fontSize:14,cursor:"pointer",lineHeight:1}}>×</button></div>);
  };
  const TB=({t,l})=><button onClick={()=>setTab(t)} style={{flex:1,padding:"9px 4px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:11,letterSpacing:"0.04em",textTransform:"uppercase",border:"none",background:tab===t?C.accent:C.raised,color:tab===t?"#000":C.sub,transition:"all 0.2s",boxShadow:tab===t?`0 0 14px ${C.accent}66,0 0 28px ${C.accent}22`:"none"}}>{l}</button>;

  return(
    <div style={{fontFamily:"'IBM Plex Mono',monospace",background:C.bg,minHeight:"100vh",color:C.text}}>
      {upgradeModal()}

      {/* INSURANCE MODAL */}
      {showInsurance&&(
        <div style={{position:"fixed",inset:0,zIndex:9999,background:"#080c16",display:"flex",flexDirection:"column"}} onClick={()=>setShowInsurance(false)}>
          <div style={{background:"#0d1525",borderBottom:"1px solid #2c3a52",padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}} onClick={e=>e.stopPropagation()}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:17,fontWeight:800,color:"#f0f6ff"}}>🛡️ Protect Your Income</div>
            <button onClick={()=>setShowInsurance(false)} style={{padding:"7px 14px",borderRadius:9,background:"#1a2436",border:"1px solid #2c3a52",color:"#8fa3c0",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>✕ Close</button>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"20px 16px 80px"}} onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:800,color:"#f0f6ff",marginBottom:8}}>Protect Your Income</div>
              <div style={{fontSize:12,color:"#8fa3c0",lineHeight:1.7}}>As a 1099 worker you have <span style={{color:"#f87171",fontWeight:700}}>zero employer protection</span>. That changes today.</div>
            </div>
            {[{icon:"⛽",label:"Term Life",tag:"Most Popular",tagColor:"#00ffcc",desc:"Pure income replacement. If you die, your family gets paid."},{icon:"🛡️",label:"Disability/Accident",tag:"Critical for Drivers",tagColor:"#f87171",desc:"A personal policy pays YOU directly if injured on the job."},{icon:"💰",label:"Whole Life / IUL",tag:"Build Wealth",tagColor:"#fbbf24",desc:"Tax-free retirement savings. No 401k? This IS your plan."},{icon:"🙏",label:"Final Expense",tag:"Easy to Qualify",tagColor:"#a78bfa",desc:"Covers funeral costs and final bills. No medical exam needed."}].map(p=>(
              <div key={p.label} style={{background:"#0d1525",borderRadius:12,padding:"14px",marginBottom:12,border:"1px solid #2c3a52"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><span style={{fontSize:22}}>{p.icon}</span><span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:700,color:"#f0f6ff"}}>{p.label}</span><span style={{padding:"2px 8px",borderRadius:20,background:p.tagColor+"22",border:`1px solid ${p.tagColor}44`,color:p.tagColor,fontSize:9,fontWeight:800}}>{p.tag}</span></div>
                <div style={{fontSize:11,color:"#8fa3c0",lineHeight:1.6}}>{p.desc}</div>
              </div>
            ))}
            <div style={{background:"linear-gradient(135deg,#1a1a3a,#0d1525)",borderRadius:16,padding:"18px 16px",marginBottom:14,border:"2px solid #a78bfa55"}}>
              <div style={{fontSize:10,fontWeight:800,color:"#a78bfa",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>🛡️ Your Trusted Agents</div>
              {[{name:"Nelle Kigembe",role:"Licensed Insurance Producer",zone:"🌊 West Coast",color:"#a78bfa",link:"https://calendly.com/nellekigembe/60min?utm_source=contractoriq&utm_medium=app&utm_campaign=protect_income"},{name:"Wemma Kigembe",role:"Licensed Producer · ContractorIQ Founder",zone:"🏛️ DMV Area",color:"#00ffcc",link:"https://calendly.com/wkigembe-crvm/30min?utm_source=contractoriq&utm_medium=app&utm_campaign=protect_income"}].map(ag=>(
                <div key={ag.name} style={{display:"flex",gap:12,alignItems:"flex-start",background:"#ffffff08",borderRadius:12,padding:"13px",marginBottom:10}}>
                  <div style={{width:48,height:48,borderRadius:"50%",background:`linear-gradient(135deg,${ag.color},${ag.color}88)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>👤</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:800,color:"#f0f6ff",marginBottom:2}}>{ag.name}</div>
                    <div style={{fontSize:9,color:ag.color,fontWeight:700,marginBottom:6}}>{ag.role}</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}><span style={{padding:"2px 8px",borderRadius:20,background:ag.color+"18",border:`1px solid ${ag.color}44`,color:ag.color,fontSize:9,fontWeight:700}}>{ag.zone}</span><span style={{padding:"2px 8px",borderRadius:20,background:"#00aa8818",border:"1px solid #00aa8844",color:"#00aa88",fontSize:9,fontWeight:700}}>🌎 Nationwide</span></div>
                    <button onClick={()=>window.open(ag.link,"_blank")} style={{padding:"7px 14px",borderRadius:9,background:`linear-gradient(135deg,${ag.color},${ag.color}88)`,color:"#000",fontSize:10,fontWeight:800,border:"none",cursor:"pointer",fontFamily:"inherit"}}>📅 Book Free Call</button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={()=>setShowInsurance(false)} style={{width:"100%",padding:"11px",borderRadius:10,background:"transparent",border:"1px solid #2c3a52",color:"#8fa3c0",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Maybe Later</button>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {showQR&&(
        <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.95)",display:"flex",flexDirection:"column"}} onClick={()=>setShowQR(false)}>
          <div style={{background:C.card,borderRadius:"0 0 20px 20px",padding:"16px",flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:17,fontWeight:800,color:C.text}}>📱 Transfer Data via QR</div>
            <button onClick={()=>setShowQR(false)} style={{padding:"7px 14px",borderRadius:9,background:C.raised,border:`1px solid ${C.border}`,color:C.sub,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>✕ Close</button>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"20px 16px"}} onClick={e=>e.stopPropagation()}>
            <div style={{background:C.card,borderRadius:20,padding:"24px",marginBottom:16,textAlign:"center",border:`2px solid #a78bfa44`}}>
              <div style={{fontSize:11,fontWeight:700,color:"#a78bfa",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:16}}>Scan on your other device</div>
              <div style={{background:"#fff",borderRadius:16,padding:16,display:"inline-block",marginBottom:14}}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent("CIQDATA:"+btoa(JSON.stringify({addedW,profile:{name:profile?.name||"",company:profile?.company||""},exported:new Date().toISOString()})).substring(0,1800))}`} alt="QR Code" style={{width:220,height:220,display:"block"}}/>
              </div>
              <div style={{fontSize:11,color:C.sub,lineHeight:1.7}}>Open ContractorIQ on your other device → Menu → Transfer Data via QR → Scan this code</div>
            </div>
          </div>
        </div>
      )}

      {/* MARKET MODAL */}
      {showMarket&&(
        <div style={{position:"fixed",inset:0,zIndex:9999,background:C.bg,display:"flex",flexDirection:"column"}}>
          <div style={{background:C.surf,borderBottom:`1px solid ${C.border}`,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:17,fontWeight:800,color:C.text}}>📊 Market Overview</div>
            <button onClick={()=>setShowMarket(false)} style={{padding:"8px 14px",borderRadius:9,background:C.raised,border:`1px solid ${C.border}`,color:C.sub,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>✕ Close</button>
          </div>
          <div style={{flex:1,overflow:"hidden"}}>
            <iframe scrolling="no" allowTransparency="true" frameBorder="0" src="https://s.tradingview.com/embed-widget/market-overview/?locale=en#%7B%22colorTheme%22%3A%22dark%22%2C%22dateRange%22%3A%221D%22%2C%22showChart%22%3Atrue%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%7D" style={{width:"100%",height:"100%",display:"block"}} title="Market Overview"/>
          </div>
        </div>
      )}

      {/* REVIEWS MODAL */}
      {showReviews&&(
        <div style={{position:"fixed",inset:0,zIndex:9999,background:C.bg,display:"flex",flexDirection:"column"}}>
          <div style={{background:C.surf,borderBottom:`1px solid ${C.border}`,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:17,fontWeight:800,color:C.text}}>⭐ Customer Reviews</div>
            <button onClick={()=>setShowReviews(false)} style={{padding:"7px 14px",borderRadius:9,background:C.raised,border:`1px solid ${C.border}`,color:C.sub,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>✕ Close</button>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"16px 16px 80px"}}>
            {!addingReview&&<button onClick={()=>setAddingReview(true)} style={{width:"100%",padding:"13px",borderRadius:12,background:`linear-gradient(135deg,${C.a3}22,${C.accent}15)`,border:`2px solid ${C.a3}44`,color:C.a3,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:16}}>✍️ Write a Review</button>}
            {addingReview&&(
              <div style={{background:C.card,borderRadius:14,padding:"16px",marginBottom:16,border:`2px solid ${C.a3}44`}}>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,color:C.text,marginBottom:12}}>✍️ Share Your Experience</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                  <div><div style={{fontSize:10,color:C.sub,fontWeight:700,marginBottom:4}}>YOUR NAME</div><input value={reviewForm.name} onChange={e=>setReviewForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Marcus D." style={{width:"100%",padding:"9px 12px",borderRadius:8,background:C.bg,border:`1px solid ${C.border}`,color:C.text,fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/></div>
                  <div><div style={{fontSize:10,color:C.sub,fontWeight:700,marginBottom:4}}>YOUR ROLE</div><input value={reviewForm.role} onChange={e=>setReviewForm(p=>({...p,role:e.target.value}))} placeholder="e.g. Owner-Operator" style={{width:"100%",padding:"9px 12px",borderRadius:8,background:C.bg,border:`1px solid ${C.border}`,color:C.text,fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/></div>
                </div>
                <div style={{marginBottom:10}}><div style={{fontSize:10,color:C.sub,fontWeight:700,marginBottom:6}}>RATING</div><div style={{display:"flex",gap:6}}>{[1,2,3,4,5].map(s=><button key={s} onClick={()=>setReviewForm(p=>({...p,stars:s}))} style={{fontSize:24,background:"none",border:"none",cursor:"pointer",opacity:s<=reviewForm.stars?1:0.3,padding:0}}>⭐</button>)}</div></div>
                <div style={{marginBottom:12}}><div style={{fontSize:10,color:C.sub,fontWeight:700,marginBottom:4}}>YOUR REVIEW</div><textarea value={reviewForm.text} onChange={e=>setReviewForm(p=>({...p,text:e.target.value}))} rows={4} style={{width:"100%",padding:"10px 12px",borderRadius:8,background:C.bg,border:`1px solid ${C.border}`,color:C.text,fontSize:12,fontFamily:"inherit",outline:"none",resize:"none",boxSizing:"border-box"}}/></div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>{if(!reviewForm.name.trim()||!reviewForm.text.trim())return;const newR=[{...reviewForm,date:new Date().toLocaleDateString("en-US",{month:"short",year:"numeric"})},...reviews];setReviews(newR);try{localStorage.setItem("ciq_reviews",JSON.stringify(newR));}catch(e){}setReviewForm({name:"",role:"",stars:5,text:""});setAddingReview(false);}} style={{flex:1,padding:"11px",borderRadius:10,background:`linear-gradient(135deg,${C.accent},${C.a3})`,color:"#000",fontSize:12,fontWeight:800,border:"none",cursor:"pointer",fontFamily:"inherit"}}>✅ Submit</button>
                  <button onClick={()=>setAddingReview(false)} style={{padding:"11px 16px",borderRadius:10,background:C.raised,border:`1px solid ${C.border}`,color:C.sub,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                </div>
              </div>
            )}
            {reviews.length===0&&!addingReview&&<div style={{textAlign:"center",padding:"32px 16px",color:C.sub}}><div style={{fontSize:40,marginBottom:12}}>⭐</div><div style={{fontSize:14,fontWeight:700,color:C.text}}>Be the first to review!</div></div>}
            {reviews.map((r,i)=>(
              <div key={i} style={{background:C.card,borderRadius:14,padding:"16px",marginBottom:12,border:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:700,color:C.text}}>{r.name}</div>{r.role&&<div style={{fontSize:10,color:C.sub,marginTop:2}}>{r.role}</div>}</div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:14}}>{"⭐".repeat(r.stars)}</div><div style={{fontSize:10,color:C.sub,marginTop:2}}>{r.date}</div></div>
                </div>
                <div style={{fontSize:12,color:C.text,lineHeight:1.7}}>{r.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FLEET MODAL */}
      {showFleet&&(
        <div style={{position:"fixed",inset:0,zIndex:9999,background:C.bg,display:"flex",flexDirection:"column"}}>
          <div style={{background:C.surf,borderBottom:`1px solid ${C.border}`,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:17,fontWeight:800,color:C.text}}>🚛 Fleet Pricing</div>
            <button onClick={()=>setShowFleet(false)} style={{padding:"7px 14px",borderRadius:9,background:C.raised,border:`1px solid ${C.border}`,color:C.sub,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>✕ Close</button>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"16px 16px 80px"}}>
            {[{tier:"Solo Driver",trucks:"1 truck",price:"$19.99",period:"/mo",color:"#00ffcc",tag:"Current Plan",features:["Full settlement analysis","AI chat advisor","PDF scanner","Insurance booking"]},{tier:"Small Fleet",trucks:"2–5 trucks",price:"$49",period:"/mo",color:"#a78bfa",tag:"Popular",features:["Everything in Solo","Multi-unit dashboard","Per-truck performance","Fleet-wide totals"]},{tier:"Growing Fleet",trucks:"6–9 trucks",price:"$89",period:"/mo",color:"#fbbf24",tag:"Best Value",features:["Everything in Small Fleet","Advanced analytics","Quarterly report","Phone support"]},{tier:"Enterprise L99",trucks:"10+ trucks",price:"$149",period:"/mo",color:"#f87171",tag:"🚀 L99",features:["Everything above","Unlimited trucks","White-label option","Dedicated manager"]}].map(p=>(
              <div key={p.tier} style={{background:C.card,borderRadius:16,padding:"18px",marginBottom:14,border:`2px solid ${p.color}44`,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${p.color},${p.color}44)`}}/>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:800,color:C.text}}>{p.tier}</div><div style={{fontSize:11,color:C.sub,marginTop:2}}>🚛 {p.trucks}</div></div>
                  <div style={{textAlign:"right"}}><div style={{padding:"3px 10px",borderRadius:20,background:`${p.color}20`,border:`1px solid ${p.color}44`,color:p.color,fontSize:9,fontWeight:800,marginBottom:6}}>{p.tag}</div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,fontWeight:800,color:p.color}}>{p.price}<span style={{fontSize:11}}>{p.period}</span></div></div>
                </div>
                {p.features.map(feat=><div key={feat} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}><span style={{color:p.color,fontSize:11,fontWeight:800,flexShrink:0}}>✓</span><span style={{fontSize:11,color:C.sub}}>{feat}</span></div>)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ICON KEY MODAL */}
      {showIconKey&&(
        <div style={{position:"fixed",inset:0,zIndex:9999,background:C.bg,display:"flex",flexDirection:"column"}}>
          <div style={{background:C.surf,borderBottom:`1px solid ${C.border}`,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:17,fontWeight:800,color:C.text}}>🔑 Icon Guide</div>
            <button onClick={()=>setShowIconKey(false)} style={{padding:"7px 14px",borderRadius:9,background:C.raised,border:`1px solid ${C.border}`,color:C.sub,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>✕ Close</button>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"16px 16px 80px"}}>
            {[{section:"📊 Nav Tabs",items:[{icon:"📊",name:"Dash",desc:"Main dashboard"},{icon:"📋",name:"Docs",desc:"Document Analyzer — upload settlement PDFs"},{icon:"🧠",name:"AI",desc:"AI chat — ask anything about your business"},{icon:"🚀",name:"Growth",desc:"Growth tools — reports, expenses, settlements"}]},{section:"💰 Cost Groups",items:[{icon:"⛽",name:"Fuel",desc:"All fuel advance charges from carrier"},{icon:"🛡️",name:"Insurance",desc:"Physical damage, bobtail, OCC/ACC"},{icon:"🔧",name:"Operations",desc:"ELD, event recorder, parking, license plate"}]},{section:"🎨 Colors",items:[{icon:"🟢",name:"Teal / Green",desc:"Good — profit, positive numbers"},{icon:"🔴",name:"Red",desc:"High cost or loss"},{icon:"🟡",name:"Gold",desc:"Warning or caution"},{icon:"🟣",name:"Purple",desc:"Savings, escrow, AI feature"}]}].map(section=>(
              <div key={section.section} style={{marginBottom:20}}>
                <div style={{fontSize:11,fontWeight:800,color:C.a3,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10,paddingBottom:6,borderBottom:`1px solid ${C.border}`}}>{section.section}</div>
                {section.items.map(item=>(
                  <div key={item.name} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"8px 0",borderBottom:`1px solid ${C.border}22`}}>
                    <div style={{width:36,height:36,borderRadius:9,background:`${C.a3}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{item.icon}</div>
                    <div><div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:2}}>{item.name}</div><div style={{fontSize:11,color:C.sub,lineHeight:1.5}}>{item.desc}</div></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABOUT MODAL */}
      {showAbout&&(
        <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",padding:"16px",backdropFilter:"blur(4px)"}}>
          <div style={{background:C.card,borderRadius:24,padding:"28px 22px",maxWidth:420,width:"100%",border:`1px solid ${C.border}`,boxShadow:"0 32px 80px rgba(0,0,0,0.9)"}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:40,marginBottom:12}}>💰</div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,fontWeight:800,color:C.text,marginBottom:8}}>About ContractorIQ</div>
              <div style={{fontSize:11,color:C.sub,lineHeight:1.8}}>Your personal profit analyst — built for every gig worker who deserves to know the truth about their business.</div>
            </div>
            <div style={{padding:"10px 14px",background:`${C.gold}15`,border:`2px solid ${C.gold}55`,borderRadius:12,marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:800,color:"#fbbf24",marginBottom:4}}>⚡ WE DON'T COMPETE WITH DAT OR TRUCKLOGICS.</div>
              <div style={{fontSize:11,color:"#fbbf24",lineHeight:1.6}}>We Show You Where You're Losing Money and Help You Fix It With AI Technology.</div>
            </div>
            <button onClick={()=>setShowAbout(false)} style={{width:"100%",padding:"13px",borderRadius:12,background:`linear-gradient(135deg,${C.accent},${C.a3})`,color:"#000",fontWeight:800,fontSize:13,border:"none",cursor:"pointer",fontFamily:"inherit"}}>Got It 🚀</button>
          </div>
        </div>
      )}

      {/* ══ NEW CINEMATIC WELCOME SCREEN — Full-screen split (Rockwell style) ══ */}
      {showWelcome&&(
        <div style={{position:"fixed",inset:0,zIndex:9999,background:"#080c16",display:"flex",flexDirection:wide?"row":"column",overflowY:"auto"}}>

          {/* LEFT PANEL */}
          <div style={{flex:wide?"0 0 44%":"1",minHeight:wide?"100vh":"auto",padding:wide?"48px 44px":"32px 22px",display:"flex",flexDirection:"column",justifyContent:"flex-start",position:"relative",overflowY:"auto",overflowX:"hidden"}}>
            <div style={{position:"absolute",top:"15%",left:"-15%",width:"65%",height:"55%",background:"radial-gradient(ellipse,rgba(0,255,204,0.09) 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>
            <div style={{position:"absolute",bottom:"10%",right:"-10%",width:"50%",height:"45%",background:"radial-gradient(ellipse,rgba(167,139,250,0.07) 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>
            <div style={{position:"relative",zIndex:1}}>

              {/* Logo */}
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:wide?44:28}}>
                <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#00ffcc,#a78bfa)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,boxShadow:"0 0 16px rgba(0,255,204,0.3)"}}>🚛</div>
                <div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:17,fontWeight:800,background:"linear-gradient(135deg,#ffffff,#a5f3fc,#c4b5fd)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>ContractorIQ</div>
                  <div style={{fontSize:9,color:"#3a5060",letterSpacing:"0.06em",marginTop:1}}>by Lilwemma Services</div>
                </div>
              </div>

              {/* Headline */}
              <div style={{marginBottom:wide?28:20}}>
                <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:wide?34:26,fontWeight:800,color:"#f0f6ff",lineHeight:1.08,margin:"0 0 12px",letterSpacing:"-0.02em"}}>
                  Stop Guessing.<br/>Start Knowing.
                </h1>
                <p style={{fontSize:12,color:"#6a8099",lineHeight:1.78,margin:0}}>
                  Upload your settlement and see exactly where every dollar goes — gross, net, deductions, margin — in 30 seconds. Not hours.
                </p>
              </div>

              {/* Primary Upload CTA */}
              <button onClick={()=>{
                try{localStorage.setItem("ciq_welcome_done","true");localStorage.setItem("ciq_demo","false");}catch(e){}
                setDemoMode(false);setShowWelcome(false);setTab("growth");
              }} style={{width:"100%",padding:"17px 18px",borderRadius:14,background:"linear-gradient(135deg,#00ffcc,#a78bfa)",color:"#000",fontWeight:800,fontSize:13,border:"none",cursor:"pointer",fontFamily:"inherit",marginBottom:wide?18:14,display:"flex",alignItems:"center",gap:12,boxShadow:"0 0 32px rgba(0,255,204,0.22),0 4px 24px rgba(0,0,0,0.35)"}}>
                <span style={{fontSize:22,flexShrink:0}}>📤</span>
                <div style={{textAlign:"left"}}>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif"}}>Upload My Settlement</div>
                  <div style={{fontSize:10,fontWeight:500,opacity:0.65,marginTop:2}}>30 seconds · Private · No account needed</div>
                </div>
              </button>

              {/* Urgency strip */}
              <div style={{padding:"8px 14px",background:"rgba(248,113,113,0.07)",borderRadius:9,border:"1px solid rgba(251,191,36,0.28)",marginBottom:wide?18:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:10,fontWeight:800,color:"#fbbf24"}}>⏰ PRICE GOING UP SOON</div>
                <div style={{fontSize:9,color:"#5a7090"}}>$19.99 → $39.99</div>
              </div>

              {/* Plan grid 2×2 */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:wide?22:16}}>

                {/* $1 Trial */}
                <div onClick={()=>window.open("https://buy.stripe.com/aFa8wP7FLbMY4Ua0Ls9MY00","_blank")} style={{background:"rgba(251,191,36,0.05)",border:"1px solid rgba(251,191,36,0.22)",borderRadius:13,padding:"15px 12px",cursor:"pointer",textAlign:"center"}}>
                  <div style={{fontSize:22,marginBottom:6}}>🔥</div>
                  <div style={{fontSize:11,fontWeight:800,color:"#fbbf24",marginBottom:3}}>5-Day Trial</div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:800,color:"#fbbf24",margin:"3px 0 4px"}}>$1</div>
                  <div style={{fontSize:9,color:"#4a6080",lineHeight:1.55}}>Full access<br/>Cancel anytime</div>
                </div>

                {/* Pro — hero card */}
                <div onClick={()=>window.open("https://buy.stripe.com/fZufZh2lr2co3Q6am29MY01","_blank")} style={{background:"linear-gradient(145deg,rgba(0,255,204,0.07),rgba(167,139,250,0.07))",border:"2px solid #00ffcc",borderRadius:13,padding:"15px 12px",cursor:"pointer",textAlign:"center",position:"relative",boxShadow:"0 0 22px rgba(0,255,204,0.18)"}}>
                  <div style={{position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#00ffcc,#a78bfa)",borderRadius:20,padding:"2px 11px",fontSize:8,fontWeight:800,color:"#000",whiteSpace:"nowrap"}}>⭐ POPULAR</div>
                  <div style={{fontSize:22,marginBottom:4}}>💰</div>
                  <div style={{fontSize:11,fontWeight:800,color:"#00ffcc",marginBottom:2}}>Go Pro</div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:800,color:"#00ffcc",margin:"2px 0"}}>$19.99</div>
                  <div style={{fontSize:9,color:"#00ffcc",opacity:0.6,marginBottom:4}}>/month</div>
                  <div style={{fontSize:9,color:"#4a6080",lineHeight:1.55}}>Unlimited AI<br/>No ads</div>
                </div>

                {/* Founding $97 */}
                <div onClick={()=>window.open("https://buy.stripe.com/3cIcN5f8d5oAeuKeCi9MY02","_blank")} style={{background:"rgba(167,139,250,0.05)",border:"1px solid rgba(167,139,250,0.22)",borderRadius:13,padding:"15px 12px",cursor:"pointer",textAlign:"center"}}>
                  <div style={{fontSize:22,marginBottom:6}}>💎</div>
                  <div style={{fontSize:11,fontWeight:800,color:"#a78bfa",marginBottom:3}}>Founding</div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:800,color:"#a78bfa",margin:"3px 0 4px"}}>$97<span style={{fontSize:9,fontWeight:400,color:"#4a6080"}}> once</span></div>
                  <div style={{fontSize:9,color:"#4a6080",lineHeight:1.55}}>Everything forever<br/>First 50 only</div>
                </div>

                {/* Free Demo */}
                <div onClick={()=>{setDemoMode(true);try{localStorage.setItem("ciq_demo","true");localStorage.setItem("ciq_welcome_done","true");}catch(e){}setShowWelcome(false);}} style={{background:"rgba(44,58,82,0.3)",border:"1px solid rgba(44,58,82,0.7)",borderRadius:13,padding:"15px 12px",cursor:"pointer",textAlign:"center"}}>
                  <div style={{fontSize:22,marginBottom:6}}>👀</div>
                  <div style={{fontSize:11,fontWeight:800,color:"#4a6080",marginBottom:3}}>Try Demo</div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:800,color:"#3a5060",margin:"3px 0 4px"}}>FREE</div>
                  <div style={{fontSize:9,color:"#3a5060",lineHeight:1.55}}>Sample data<br/>No signup</div>
                </div>
              </div>

              {/* Value tip */}
              <div style={{display:"flex",alignItems:"flex-start",gap:9,padding:"10px 13px",background:"rgba(251,191,36,0.05)",borderRadius:10,border:"1px solid rgba(251,191,36,0.16)",marginBottom:wide?20:14}}>
                <span style={{fontSize:13,flexShrink:0,marginTop:1}}>⚡</span>
                <div style={{fontSize:10,color:"#fbbf24",lineHeight:1.65}}><strong>One avoided bad load = $300–$800 back in your pocket.</strong> ContractorIQ pays for itself immediately.</div>
              </div>

              <div style={{fontSize:9,color:"#1e2a3a",textAlign:"center"}}>© 2026 ContractorIQ · getcontractoriq.com · All Rights Reserved</div>
            </div>
          </div>

          {/* RIGHT PANEL — desktop only */}
          {wide&&(
            <div style={{flex:1,background:"linear-gradient(160deg,#0f1825 0%,#0a0f1c 50%,#0d1520 100%)",borderLeft:"1px solid #192535",padding:"32px 36px",display:"flex",flexDirection:"column",justifyContent:"center",position:"relative",overflowY:"auto",overflowX:"hidden"}}>
              <div style={{position:"absolute",top:"5%",right:"0%",width:"55%",height:"50%",background:"radial-gradient(ellipse,rgba(167,139,250,0.06) 0%,transparent 70%)",pointerEvents:"none"}}/>
              <div style={{position:"relative",zIndex:1}}>

                {/* Headline */}
                <div style={{fontSize:10,fontWeight:700,color:"#00ffcc",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:10}}>Scan. Track. Grow.</div>
                <h2 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:wide?30:24,fontWeight:800,color:"#f0f6ff",lineHeight:1.08,margin:"0 0 10px",letterSpacing:"-0.02em"}}>
                  Settlement analysis<br/>made effortless.
                </h2>
                <p style={{fontSize:11,color:"#5a7590",lineHeight:1.65,margin:"0 0 16px"}}>
                  Built for drayage owner-operators — simple, smart, and efficient.
                </p>

                {/* 4 Feature tiles — compact */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
                  {[
                    {icon:"💰",label:"Income Leakage",desc:"See where money disappears"},
                    {icon:"⏱️",label:"30 Seconds",desc:"Upload to full analysis"},
                    {icon:"🧠",label:"AI Advisor",desc:"Knows your real numbers"},
                    {icon:"📊",label:"5+ Weeks Tracked",desc:"Every route, every dollar"},
                  ].map(function(f){return(
                    <div key={f.label} style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"14px 13px",border:"1px solid rgba(255,255,255,0.07)"}}>
                      <div style={{fontSize:24,marginBottom:6}}>{f.icon}</div>
                      <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:700,color:"#d0daf0",marginBottom:3}}>{f.label}</div>
                      <div style={{fontSize:10,color:"#3a5570",lineHeight:1.5}}>{f.desc}</div>
                    </div>
                  );})}
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* DEVICE MISMATCH */}
      {deviceMismatch&&(<div style={{background:C.red+"18",borderBottom:"1px solid "+C.red+"44",padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{fontSize:11,color:"#f87171",fontWeight:700}}>⚠️ Account detected on new device — please re-verify your subscription</div><button onClick={()=>window.open("https://buy.stripe.com/fZufZh2lr2co3Q6am29MY01","_blank")} style={{padding:"4px 10px",borderRadius:6,background:C.red+"22",border:"1px solid "+C.red+"55",color:"#f87171",fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>Verify</button></div>)}

      {/* DATA MODE TOGGLE */}
      <div style={{background:demoMode?"linear-gradient(135deg,"+C.a3+"22,"+C.accent+"12)":C.bg,borderBottom:"1px solid "+(demoMode?C.a3+"44":C.border),padding:"9px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
        <div><div style={{fontSize:11,color:demoMode?C.a3:C.accent,fontWeight:700}}>{demoMode?"👀 Demo Mode — Sample data":"✅ My Data Mode — Your real numbers"}</div><div style={{fontSize:9,color:C.sub,marginTop:1}}>{demoMode?"Tap to switch to your real settlement data":"Tap to explore with demo sample data"}</div></div>
        <button onClick={()=>{const next=!demoMode;setDemoMode(next);try{localStorage.setItem("ciq_demo",String(next));}catch(e){}if(!next)setTab("growth");}} style={{padding:"6px 12px",borderRadius:7,background:demoMode?"linear-gradient(135deg,"+C.accent+","+C.a3+")":"linear-gradient(135deg,"+C.a3+"44,"+C.accent+"44)",border:"1px solid "+(demoMode?"transparent":C.a3+"66"),color:demoMode?"#000":C.a3,fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:800,flexShrink:0}}>{demoMode?"📤 Use My Data":"👀 View Demo"}</button>
      </div>

      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=Space+Grotesk:wght@500;600;700;800&display=swap" rel="stylesheet"/>

      {/* MARKET TICKER — Live prices via TradingView + user-customizable */}
      <div style={{background:"#070b15",borderBottom:"1px solid #1a2535"}}>

        {/* Ticker tape row */}
        <div style={{display:"flex",alignItems:"stretch",height:46}}>
          <iframe
            key={tickerSyms.map(function(s){return s.proName;}).join(",")}
            src={"https://s.tradingview.com/embed-widget/ticker-tape/?locale=en#"+encodeURIComponent(JSON.stringify({
              symbols:tickerSyms,
              showSymbolLogo:false,
              colorTheme:"dark",
              isTransparent:true,
              displayMode:"compact",
              locale:"en"
            }))}
            style={{flex:1,height:46,border:"none",display:"block",minWidth:0}}
            title="Live Market Ticker"
          />
          <button
            onClick={()=>setShowTickerEdit(function(p){return !p;})}
            title="Customize your ticker"
            style={{width:40,background:showTickerEdit?"#0f1e14":"#070b15",border:"none",borderLeft:"1px solid #1a2535",color:showTickerEdit?"#00ffcc":"#2c4030",cursor:"pointer",fontSize:16,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",outline:"none"}}>
            {showTickerEdit?"✓":"+"}
          </button>
        </div>

        {/* Customize panel */}
        {showTickerEdit&&(
          <div style={{background:"#0d1420",borderTop:"1px solid #1a2535",padding:"12px 14px"}}>

            {/* Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:"#00ffcc",letterSpacing:"0.06em"}}>📈 My Market Tracker</div>
                <div style={{fontSize:9,color:"#2c4030",marginTop:2}}>{tickerSyms.length} symbols · prices update live</div>
              </div>
              <button onClick={()=>setShowTickerEdit(false)} style={{padding:"4px 10px",borderRadius:7,background:"#0f1e14",border:"1px solid #00ffcc44",color:"#00ffcc",fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>Done ✓</button>
            </div>

            {/* Active symbols — removable chips */}
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
              {tickerSyms.map(function(s,i){return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:20,background:"#141928",border:"1px solid #2c3a52"}}>
                  <span style={{fontSize:10,color:"#8fa3c0",fontWeight:600,fontFamily:"'IBM Plex Mono',monospace"}}>{s.title||s.proName.split(":").pop()}</span>
                  <button onClick={()=>setTickerSyms(function(p){return p.filter(function(_,j){return j!==i;});})} style={{background:"none",border:"none",color:"#3a5060",fontSize:13,cursor:"pointer",padding:0,lineHeight:1,display:"flex",alignItems:"center",fontFamily:"inherit"}}>×</button>
                </div>
              );})}
            </div>

            {/* Add symbol input */}
            <div style={{display:"flex",gap:7,marginBottom:10}}>
              <input
                value={tickerInput}
                onChange={function(e){setTickerInput(e.target.value.toUpperCase());}}
                onKeyDown={function(e){
                  if(e.key==="Enter"&&tickerInput.trim()){
                    var raw=tickerInput.trim();
                    var proName=raw.includes(":")?raw:"NASDAQ:"+raw;
                    var title=proName.split(":").pop();
                    if(!tickerSyms.find(function(s){return s.proName===proName;})){
                      setTickerSyms(function(p){return [...p,{proName:proName,title:title}];});
                    }
                    setTickerInput("");
                  }
                }}
                placeholder="Type symbol: AAPL · TSLA · NYSE:CVX · COINBASE:ETHUSD"
                style={{flex:1,padding:"8px 12px",background:"#141928",border:"1px solid #2c3a52",borderRadius:9,color:"#f0f6ff",fontSize:11,fontFamily:"'IBM Plex Mono',monospace",outline:"none"}}
              />
              <button onClick={function(){
                var raw=tickerInput.trim();
                if(!raw)return;
                var proName=raw.includes(":")?raw:"NASDAQ:"+raw;
                var title=proName.split(":").pop();
                if(!tickerSyms.find(function(s){return s.proName===proName;})){
                  setTickerSyms(function(p){return [...p,{proName:proName,title:title}];});
                }
                setTickerInput("");
              }} style={{padding:"8px 16px",borderRadius:9,background:"linear-gradient(135deg,#00ffcc,#a78bfa)",color:"#000",fontSize:11,fontWeight:800,border:"none",cursor:"pointer",fontFamily:"inherit",flexShrink:0,whiteSpace:"nowrap"}}>+ Add</button>
            </div>

            {/* Quick-add presets */}
            <div style={{fontSize:9,color:"#2c4030",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Quick Add</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
              {[
                {proName:"NASDAQ:AAPL",  title:"Apple"},
                {proName:"NASDAQ:TSLA",  title:"Tesla"},
                {proName:"NASDAQ:NVDA",  title:"NVIDIA"},
                {proName:"NASDAQ:GOOGL", title:"Google"},
                {proName:"NASDAQ:AMZN",  title:"Amazon"},
                {proName:"NYSE:CVX",     title:"Chevron"},
                {proName:"NYSE:ODFL",    title:"Old Dominion"},
                {proName:"NYSE:UNP",     title:"Union Pacific"},
                {proName:"NYSE:UPS",     title:"UPS"},
                {proName:"COINBASE:ETHUSD",title:"Ethereum"},
                {proName:"AMEX:TLT",     title:"Bonds ETF"},
                {proName:"NASDAQ:META",  title:"Meta"},
              ].map(function(p){
                var active=!!tickerSyms.find(function(s){return s.proName===p.proName;});
                return(
                  <button key={p.proName} onClick={function(){
                    if(active){setTickerSyms(function(prev){return prev.filter(function(s){return s.proName!==p.proName;});});}
                    else{setTickerSyms(function(prev){return [...prev,p];});}
                  }} style={{padding:"4px 10px",borderRadius:20,background:active?"#00ffcc18":"#141928",border:"1px solid "+(active?"#00ffcc44":"#2c3a52"),color:active?"#00ffcc":"#8fa3c0",fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:active?700:400}}>
                    {active?"✓ ":""}{p.title}
                  </button>
                );
              })}
            </div>

            {/* Format hint + reset */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8,borderTop:"1px solid #1a2535"}}>
              <div style={{fontSize:9,color:"#1e2a3a",lineHeight:1.6}}>Format: TICKER or EXCHANGE:TICKER<br/>e.g. AAPL · NYSE:CVX · COINBASE:BTCUSD</div>
              <button onClick={function(){setTickerSyms(DEFAULT_TICKER);}} style={{fontSize:9,color:"#2c4030",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:0,textDecoration:"underline"}}>↺ Reset defaults</button>
            </div>
          </div>
        )}
      </div>

      {/* HEADER */}
      <div style={{background:C.surf,borderBottom:`1px solid ${C.border}`,padding:"13px 16px",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:9,background:`linear-gradient(135deg,${C.accent},${C.a3})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🚛</div>
            <div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:15,background:"linear-gradient(135deg,#ffffff,#a5f3fc,#c4b5fd)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>DrayageIQ</div>
              <div style={{fontSize:10,color:C.sub}}>{hideOwnerName?"●●●●●":demoMode?"Demo Driver":(profile.name||"Your Business")} · {allW.length>0?allW.length+" weeks":"No data yet"}</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}><div style={{fontSize:10,color:C.sub}}>YTD Gross</div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:800,color:C.accent}}>${tGross.toLocaleString("en-US",{minimumFractionDigits:2})}</div></div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <div style={{display:"flex",gap:6,alignItems:"center",overflowX:"auto",scrollbarWidth:"none",flex:1}}>
            <TB t="dashboard" l="📊 Dash"/>
            <TB t="loads" l="📋 Docs"/>
            <TB t="ai" l="🧠 AI"/>
            <TB t="growth" l="🚀 Growth"/>
            <button onClick={()=>setShowInsurance(true)} style={{padding:"8px 12px",borderRadius:8,background:"linear-gradient(135deg,#a78bfa22,#6d28d922)",border:"2px solid #a78bfa",boxShadow:"0 0 12px #a78bfa33",color:"#a78bfa",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0,whiteSpace:"nowrap"}}>🛡️ Protect</button>
            <button onClick={()=>setShowQR(true)} style={{padding:"8px 12px",borderRadius:8,background:`${C.a3}15`,border:`1px solid ${C.a3}44`,color:C.a3,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0,whiteSpace:"nowrap"}}>📱 QR</button>
            <button onClick={()=>setFocusMode(p=>!p)} style={{padding:"8px 12px",borderRadius:8,background:focusMode?C.gold:`${C.gold}22`,border:`2px solid ${C.gold}`,color:focusMode?"#000":C.gold,fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"inherit",flexShrink:0,whiteSpace:"nowrap"}}>{focusMode?"⚡ ON":"⚡ Focus"}</button>
          </div>
          <div style={{display:"flex",gap:5,alignItems:"center",flexShrink:0}}>
            <div style={{position:"relative"}}>
              <button onClick={()=>setShowMenu(p=>!p)} style={{padding:"8px 12px",borderRadius:8,background:showMenu?`${C.a3}22`:C.raised,border:`1px solid ${showMenu?C.a3:C.border}`,color:showMenu?C.a3:C.sub,fontSize:10,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5,fontWeight:700,whiteSpace:"nowrap"}}>
                <span>☰</span><span>Menu</span>
              </button>
              {showMenu&&(
                <div style={{position:"fixed",top:108,right:8,background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:8,zIndex:9999,minWidth:190,boxShadow:"0 8px 32px rgba(0,0,0,0.6)"}}>
                  <button onClick={()=>{setShowAbout(true);setShowMenu(false);}} style={{width:"100%",padding:"10px 12px",borderRadius:8,background:C.raised,border:`1px solid ${C.border}`,color:C.text,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:5,display:"flex",alignItems:"center",gap:8}}><span>💰</span><span style={{fontWeight:600}}>About ContractorIQ</span></button>
                  <button onClick={()=>{setShowMarket(true);setShowMenu(false);}} style={{width:"100%",padding:"10px 12px",borderRadius:8,background:`${C.green}12`,border:`1px solid ${C.green}33`,color:C.green,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:5,display:"flex",alignItems:"center",gap:8}}><span>📈</span><span style={{fontWeight:600}}>Market Overview</span></button>
                  <button onClick={()=>{setShowReviews(true);setShowMenu(false);}} style={{width:"100%",padding:"10px 12px",borderRadius:8,background:`${C.gold}12`,border:`1px solid ${C.gold}33`,color:C.gold,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:5,display:"flex",alignItems:"center",gap:8}}><span>⭐</span><span style={{fontWeight:600}}>Customer Reviews</span>{reviews.length>0&&<span style={{marginLeft:"auto",fontSize:9,color:C.gold,fontWeight:700}}>{reviews.length}</span>}</button>
                  <button onClick={()=>{setShowIconKey(true);setShowMenu(false);}} style={{width:"100%",padding:"10px 12px",borderRadius:8,background:`${C.a3}12`,border:`1px solid ${C.a3}33`,color:C.a3,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:5,display:"flex",alignItems:"center",gap:8}}><span>🔑</span><span style={{fontWeight:600}}>Icon Guide</span></button>
                  <button onClick={()=>{setShowFleet(true);setShowMenu(false);}} style={{width:"100%",padding:"10px 12px",borderRadius:8,background:`${C.gold}12`,border:`1px solid ${C.gold}33`,color:C.gold,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:5,display:"flex",alignItems:"center",gap:8}}><span>🚛</span><span style={{fontWeight:600}}>Fleet Pricing</span><span style={{marginLeft:"auto",fontSize:9,background:C.gold,color:"#000",padding:"2px 7px",borderRadius:8,fontWeight:800}}>NEW</span></button>
                  <button onClick={()=>{setShowProfile(p=>!p);setShowSettings(false);setShowMenu(false);}} style={{width:"100%",padding:"10px 12px",borderRadius:8,background:showProfile?`${C.gold}15`:C.raised,border:`1px solid ${showProfile?C.gold:C.border}`,color:showProfile?C.gold:(profile.setupDone?C.green:C.text),fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:5,display:"flex",alignItems:"center",gap:8}}><span>👤</span><span style={{fontWeight:600}}>My Profile</span>{profile.setupDone&&<span style={{marginLeft:"auto",fontSize:10,color:C.green}}>✅</span>}</button>
                  <button onClick={()=>{setShowSettings(p=>!p);setShowProfile(false);setShowMenu(false);}} style={{width:"100%",padding:"10px 12px",borderRadius:8,background:showSettings?`${C.a3}15`:C.raised,border:`1px solid ${showSettings?C.a3:C.border}`,color:showSettings?C.a3:C.text,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:5,display:"flex",alignItems:"center",gap:8}}><span>⚙️</span><span style={{fontWeight:600}}>Display Settings</span></button>
                  <button onClick={()=>{const next=!darkMode;setDarkMode(next);try{localStorage.setItem("ciq_theme",next?"dark":"light");}catch(e){}setShowMenu(false);}} style={{width:"100%",padding:"10px 12px",borderRadius:8,background:C.raised,border:`1px solid ${C.border}`,color:C.text,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",alignItems:"center",gap:8}}><span>{darkMode?"☀️":"🌙"}</span><span style={{fontWeight:600}}>{darkMode?"Light Mode":"Dark Mode"}</span></button>
                </div>
              )}
            </div>
            {isPro?(
              <div onClick={()=>{setIsPro(false);try{localStorage.removeItem("ciq_pro");localStorage.removeItem("ciq_trial_start");localStorage.removeItem("ciq_ai_uses");localStorage.removeItem("ciq_o_uses");}catch(e){}}} style={{padding:"6px 10px",borderRadius:8,background:"linear-gradient(135deg,"+C.accent+"22,"+C.a3+"22)",border:"1px solid "+C.accent+"55",fontSize:9,fontWeight:800,color:"#00ffcc",letterSpacing:"0.05em",flexShrink:0,cursor:"pointer"}}>PRO ✓</div>
            ):trialDaysLeft>0?(
              <div style={{padding:"6px 9px",borderRadius:8,background:C.gold+"20",border:"1px solid "+C.gold+"55",fontSize:9,fontWeight:700,color:"#fbbf24",flexShrink:0}}>{trialDaysLeft}d left</div>
            ):(
              <button onClick={()=>{const t=ownerTaps+1;setOwnerTaps(t);if(t>=5){setIsPro(true);setOwnerTaps(0);try{localStorage.setItem("ciq_pro","true");localStorage.removeItem("ciq_ai_uses");localStorage.removeItem("ciq_o_uses");}catch(e){}}else{openUpgrade("header");}}} style={{padding:"7px 11px",borderRadius:8,background:"linear-gradient(135deg,"+C.gold+",#f59e0b)",border:"none",fontSize:10,fontWeight:800,color:"#000",cursor:"pointer",fontFamily:"inherit",flexShrink:0,whiteSpace:"nowrap"}}>{ownerTaps>0?`(${ownerTaps}/5)`:"Upgrade"}</button>
            )}
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div style={{background:`linear-gradient(135deg,${C.a3}18,${C.accent}12)`,borderBottom:`2px solid ${C.a3}55`,padding:"10px 14px"}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:8,background:C.surf,borderRadius:12,padding:"0 12px",border:`2px solid ${C.a3}66`}}>
            <span style={{fontSize:15,flexShrink:0}}>{searchLoading?"⏳":"🔍"}</span>
            <input value={searchQ||""} onChange={e=>setSearchQ(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&(searchQ||"").trim())runSearch();}} placeholder="Search weather, gas, truck stops, traffic..." style={{background:"none",border:"none",color:C.text,fontSize:12,fontFamily:"inherit",padding:"11px 0",width:"100%",outline:"none"}}/>
            {(searchQ||"").trim()&&<button onClick={()=>{setSearchQ("");setSearchResult("");}} style={{background:"none",border:"none",color:C.sub,fontSize:18,cursor:"pointer",padding:"0 4px",flexShrink:0}}>×</button>}
          </div>
          <button onClick={()=>runSearch()} disabled={!(searchQ||"").trim()||searchLoading} style={{padding:"11px 16px",borderRadius:12,background:!(searchQ||"").trim()||searchLoading?C.raised:`linear-gradient(135deg,${C.a3},${C.accent})`,color:!(searchQ||"").trim()||searchLoading?C.sub:"#000",fontWeight:800,fontSize:12,border:"none",cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{searchLoading?"⏳ ...":"Search"}</button>
        </div>
        {!searchResult&&!searchLoading&&(
          <div style={{display:"flex",gap:6,marginTop:8,overflowX:"auto",paddingBottom:2}}>
            {["⛅ Weather","⛽ Gas prices","🚛 Truck stops I-70","🛣️ Traffic I-95","🔧 Mechanic near me"].map(s=>(
              <button key={s} onClick={()=>{const q=s.replace(/^[^\s]+\s/,"");setSearchQ(q);setTimeout(()=>runSearch(q),50);}} style={{padding:"5px 11px",borderRadius:20,background:`${C.a3}15`,border:`1px solid ${C.a3}44`,color:"#a78bfa",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0,whiteSpace:"nowrap"}}>{s}</button>
            ))}
          </div>
        )}
        {searchResult&&(
          <div style={{marginTop:10,padding:"12px 14px",background:C.card,borderRadius:10,border:`1px solid ${C.a3}55`,fontSize:12,color:C.text,lineHeight:1.8,whiteSpace:"pre-wrap"}}>
            {searchResult}<button onClick={()=>{setSearchResult("");setSearchQ("");}} style={{display:"block",marginTop:8,background:"none",border:"none",color:C.sub,fontSize:11,cursor:"pointer",fontFamily:"inherit",padding:0}}>✕ Clear</button>
          </div>
        )}
      </div>

      {/* SETTINGS PANEL */}
      {showSettings&&(
        <div style={{background:C.surf,borderBottom:`1px solid ${C.border}`,padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:C.text}}>⚙️ Display Settings</div>
            <button onClick={()=>setShowSettings(false)} style={{background:"none",border:"none",color:C.sub,fontSize:18,cursor:"pointer"}}>×</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:wide?"repeat(3,1fr)":"1fr",gap:10}}>
            <div style={{background:C.card,borderRadius:11,padding:"12px",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:9}}>Show / Hide Vendors</div>
              {vendorKeys.filter(vk=>allW.some(w=>detectVendor(w)===vk)).map(vk=>{
                const v=VENDORS[vk],hidden=hiddenVendors.includes(vk),isOnly=activeOnlyVendor===vk;
                return(<div key={vk} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:8,height:8,borderRadius:"50%",background:v.color,opacity:hidden?0.3:1}}/><span style={{fontSize:11,color:hidden?C.sub:C.text}}>{v.short}</span></div>
                  <div style={{display:"flex",gap:5}}>
                    <button onClick={()=>{setActiveOnlyVendor(isOnly?null:vk);setHiddenVendors([]);}} style={{padding:"3px 8px",borderRadius:5,background:isOnly?`${v.color}22`:"transparent",border:`1px solid ${isOnly?v.color:C.border}`,color:isOnly?v.color:C.sub,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>{isOnly?"Only ✓":"Only"}</button>
                    <button onClick={()=>setHiddenVendors(p=>hidden?p.filter(x=>x!==vk):[...p,vk])} style={{padding:"3px 8px",borderRadius:5,background:hidden?`${C.red}22`:"transparent",border:`1px solid ${hidden?C.red:C.border}`,color:hidden?C.red:C.sub,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>{hidden?"Show":"Hide"}</button>
                  </div>
                </div>);
              })}
            </div>
            <div style={{background:C.card,borderRadius:11,padding:"12px",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:9}}>Privacy</div>
              {[{label:"Hide owner name",val:hideOwnerName,set:setHideOwnerName},{label:"Hide unit number",val:hideUnitNum,set:setHideUnitNum}].map(item=>(
                <div key={item.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <span style={{fontSize:11,color:C.text}}>{item.label}</span>
                  <button onClick={()=>item.set(p=>!p)} style={{width:40,height:20,borderRadius:10,background:item.val?C.accent:C.border,border:"none",cursor:"pointer",position:"relative",flexShrink:0}}><div style={{width:14,height:14,borderRadius:"50%",background:"white",position:"absolute",top:3,left:item.val?23:3,transition:"left 0.15s"}}/></button>
                </div>
              ))}
            </div>
            <div style={{background:C.card,borderRadius:11,padding:"12px",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:9}}>Active Filters</div>
              <div style={{fontSize:11,color:visibleW.length===allW.length?C.sub:C.gold,marginBottom:6}}>{visibleW.length===allW.length?"✓ All weeks visible":"⚠️ "+visibleW.length+" of "+allW.length+" weeks shown"}</div>
              <button onClick={()=>{setHiddenVendors([]);setActiveOnlyVendor(null);setHideOwnerName(false);setHideUnitNum(false);}} style={{width:"100%",marginTop:10,padding:"6px",borderRadius:6,background:"transparent",border:`1px solid ${C.border}`,color:C.sub,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>Reset All</button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE PANEL */}
      {showProfile&&(
        <div style={{background:C.surf,borderBottom:`1px solid ${C.border}`,padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div><div style={{fontSize:12,fontWeight:700,color:C.text}}>👤 Your Profile</div><div style={{fontSize:10,color:C.sub,marginTop:2}}>AI uses this to personalize every analysis</div></div>
            <button onClick={()=>setShowProfile(false)} style={{background:"none",border:"none",color:C.sub,fontSize:18,cursor:"pointer"}}>×</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:wide?"repeat(3,1fr)":"1fr",gap:10}}>
            <div style={{background:C.card,borderRadius:11,padding:"12px",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:9}}>Who You Are</div>
              {[{label:"Your Name",key:"name",ph:"Owner Name"},{label:"Company",key:"company",ph:"YOUR COMPANY"},{label:"Truck / Unit",key:"unit",ph:"UNIT#"}].map(field=>(
                <div key={field.key} style={{marginBottom:9}}>
                  <div style={{fontSize:9,color:C.sub,marginBottom:3,fontWeight:600,textTransform:"uppercase"}}>{field.label}</div>
                  <input value={profile[field.key]||""} onChange={e=>setProfile(p=>({...p,[field.key]:e.target.value}))} placeholder={field.ph} style={{width:"100%",padding:"8px 10px",background:C.raised,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,fontSize:12,boxSizing:"border-box",fontFamily:"inherit",outline:"none"}}/>
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
              {[{label:"Target Weekly Net ($)",key:"targetWeeklyNet",ph:"3500"},{label:"Truck Baseline MPG",key:"targetMPG",ph:"5.2"}].map(field=>(
                <div key={field.key} style={{marginBottom:9}}>
                  <div style={{fontSize:9,color:C.sub,marginBottom:3,fontWeight:600,textTransform:"uppercase"}}>{field.label}</div>
                  <input value={profile[field.key]||""} onChange={e=>setProfile(p=>({...p,[field.key]:e.target.value}))} placeholder={field.ph} style={{width:"100%",padding:"8px 10px",background:C.raised,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,fontSize:12,boxSizing:"border-box",fontFamily:"inherit",outline:"none"}}/>
                </div>
              ))}
              <div style={{marginBottom:9}}>
                <div style={{fontSize:9,color:C.sub,marginBottom:3,fontWeight:600,textTransform:"uppercase"}}>Notes for AI</div>
                <textarea value={profile.notes||""} onChange={e=>setProfile(p=>({...p,notes:e.target.value}))} placeholder="e.g. I run Hagerstown to Dundalk daily..." style={{width:"100%",height:72,padding:"8px 10px",background:C.raised,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,fontSize:11,boxSizing:"border-box",fontFamily:"inherit",outline:"none",resize:"none",lineHeight:1.5}}/>
              </div>
              <button onClick={()=>{setProfile(p=>({...p,setupDone:true}));setShowProfile(false);}} style={{width:"100%",padding:"9px",borderRadius:8,background:`linear-gradient(135deg,${C.gold},${C.gold})`,color:"#000",fontWeight:700,fontSize:12,border:"none",cursor:"pointer",fontFamily:"inherit"}}>💾 Save Profile</button>
              {profile.setupDone&&<div style={{fontSize:9,color:C.green,textAlign:"center",marginTop:5}}>✅ Saved — AI is personalized</div>}
            </div>
          </div>
        </div>
      )}

      <div style={{padding:"16px",maxWidth:1100,margin:"0 auto"}}>

      {/* ══ DASHBOARD TAB ═══════════════════════════════════════════════════ */}
      {tab==="dashboard"&&(
        <div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
            <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:800,margin:0,letterSpacing:"-0.02em"}}>{demoMode?"👀 Demo Mode — Sample Data":profile.setupDone&&profile.name?"Welcome back, "+profile.name.split(" ")[0]+" 👋":"Business Dashboard"}</h1>
            {helpBtn("dashboard")}
          </div>
          {helpModal("dashboard")}
          <p style={{color:C.sub,fontSize:11,marginTop:0,marginBottom:14}}>{visibleW.length} weeks · {vendorStats.length} vendor{vendorStats.length>1?"s":""} · tap bars to navigate</p>

          {/* VALUE REMINDER */}
          {(()=>{
            const badLoads=allMoves.filter(function(m){return scoreMove(m).grade==="D";}).length;
            const insightCount=visibleW.length+allMoves.length+expenses.length;
            if(insightCount<3)return null;
            return(
              <div style={{padding:"10px 14px",background:"linear-gradient(135deg,"+C.a3+"12,"+C.accent+"08)",borderRadius:9,border:"1px solid "+C.a3+"33",fontSize:11,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                <div><div style={{fontWeight:700,color:"#a78bfa",marginBottom:1}}>💡 ContractorIQ is working for you</div><div style={{fontSize:10,color:C.sub}}>{insightCount} data points tracked · {badLoads>0?badLoads+" low-value routes flagged":allMoves.length+" routes analyzed"}</div></div>
                {!hasAccess&&<button onClick={()=>openUpgrade("value")} style={{padding:"5px 11px",borderRadius:7,background:"linear-gradient(135deg,"+C.gold+",#f59e0b)",color:"#000",fontSize:10,fontWeight:700,border:"none",cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>Upgrade</button>}
              </div>
            );
          })()}

          {focusMode&&(<div style={{padding:"10px 14px",background:`${C.gold}12`,borderRadius:9,border:`1px solid ${C.gold}33`,fontSize:11,color:"#fbbf24",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span>⚡ <strong>Focus Mode ON</strong> — Key numbers only.</span><button onClick={()=>setFocusMode(false)} style={{padding:"4px 10px",borderRadius:6,background:"transparent",border:`1px solid ${C.gold}55`,color:"#fbbf24",fontSize:10,cursor:"pointer",fontFamily:"inherit",flexShrink:0,marginLeft:10}}>Show All</button></div>)}

          {/* VENDOR CARDS */}
          {vendorStats.length>0&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:9}}>📋 By Vendor / Carrier</div>
              <div style={{display:"grid",gridTemplateColumns:wide?`repeat(${Math.min(vendorStats.length,3)},1fr)`:"1fr",gap:10,marginBottom:10}}>
                {vendorStats.map(v=>(
                  <div key={v.key} style={{background:"linear-gradient(-45deg,#0d1525,#1a2436,#0a0e1a,#162033)",backgroundSize:"400% 400%",animation:"rotate-radial 8s ease infinite",borderRadius:12,padding:"14px",border:`1px solid ${v.color}33`,position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${v.color},${v.color}44)`,borderRadius:"12px 12px 0 0"}}/>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>{v.icon}</span><div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:700,color:v.color}}>{v.name}</div><div style={{fontSize:9,color:C.sub,marginTop:1}}>{v.weeks} week{v.weeks>1?"s":""} · {v.unit||"Multiple units"}</div></div></div>
                      <div style={{padding:"3px 9px",borderRadius:20,background:`${v.color}18`,border:`1px solid ${v.color}44`,fontSize:10,fontWeight:700,color:v.color}}>{v.margin}%</div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                      {[{l:"Gross",val:`$${(v.gross/1000).toFixed(1)}k`,c:v.color},{l:"Net",val:`$${(v.net/1000).toFixed(1)}k`,c:C.green},{l:"Deducted",val:`$${(v.ded/1000).toFixed(1)}k`,c:C.red}].map(s=>(
                        <div key={s.l} style={{background:C.bg,borderRadius:7,padding:"7px 8px",border:`1px solid ${C.border}`,textAlign:"center"}}><div style={{fontSize:9,color:C.sub,textTransform:"uppercase",marginBottom:3}}>{s.l}</div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,color:s.c}}>{s.val}</div></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {vendorStats.length>1&&(
                <div style={{background:C.surf,borderRadius:10,padding:"11px 14px",border:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>🏢</span><div><div style={{fontSize:11,fontWeight:700,color:C.text}}>All Vendors Combined</div><div style={{fontSize:9,color:C.sub,marginTop:1}}>{allW.length} total weeks</div></div></div>
                  <div style={{display:"flex",gap:12,alignItems:"center"}}>
                    <div style={{textAlign:"right"}}><div style={{fontSize:9,color:C.sub}}>Total Net</div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:800,color:C.green}}>${tNet.toLocaleString("en-US",{minimumFractionDigits:2})}</div></div>
                    <div style={{padding:"5px 11px",borderRadius:8,background:`${C.green}18`,border:`1px solid ${C.green}44`}}><div style={{fontSize:9,color:C.sub}}>Margin</div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:800,color:C.green}}>{margin}%</div></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MAIN KPIs */}
          <div style={{display:"grid",gridTemplateColumns:wide?"repeat(4,1fr)":"repeat(2,1fr)",gap:12,marginBottom:14}}>
            {[{l:"YTD Gross",v:`$${tGross.toLocaleString("en-US",{minimumFractionDigits:2})}`,s:`All ${allW.length} weeks`,c:C.accent,g:"linear-gradient(135deg,#00ffcc,#a5f3fc,#a78bfa)"},{l:"YTD Net",v:`$${tNet.toLocaleString("en-US",{minimumFractionDigits:2})}`,s:`${margin}% margin`,c:C.green,g:"linear-gradient(135deg,#00ffcc,#34d399)"},{l:"Deductions",v:`$${tDed.toLocaleString("en-US",{minimumFractionDigits:2})}`,s:"All expenses",c:C.red,g:"linear-gradient(135deg,#f87171,#fca5a5)"},{l:"Avg RPM",v:`$${avgRPM}`,s:`${tMi.toLocaleString()} mi`,c:C.a3,g:"linear-gradient(135deg,#a78bfa,#c4b5fd)"}].map(k=>(
              <div key={k.l} style={{...K({borderTop:`3px solid ${k.c}`,padding:"16px"}),boxShadow:"0 2px 12px rgba(0,0,0,0.2)"}}>
                <div style={{fontSize:9,color:C.sub,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{k.l}</div>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:800,background:k.g,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",backgroundSize:"200% auto",animation:"shimmer 3s linear infinite"}}>{k.v}</div>
                <div style={{fontSize:10,color:C.sub,marginTop:5}}>{k.s}</div>
              </div>
            ))}
          </div>
          <NoBadge/>

          {/* PROTECT INCOME */}
          {!demoMode&&tNet>0&&(
            <div style={{background:`linear-gradient(135deg,${C.a3}15,${C.gold}10)`,borderRadius:14,padding:"14px 16px",marginBottom:12,border:`1px solid ${C.a3}44`,display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:28,flexShrink:0}}>🛡️</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:800,color:C.text,marginBottom:2}}>Protect Your Income</div>
                <div style={{fontSize:10,color:C.sub,lineHeight:1.6}}>You've earned <strong style={{color:C.accent}}>${tNet.toLocaleString("en-US",{maximumFractionDigits:0})}</strong> net this year. As a 1099 worker you have <strong style={{color:C.gold}}>zero employer coverage.</strong></div>
              </div>
              <button onClick={()=>setShowInsurance(true)} style={{padding:"8px 11px",borderRadius:9,background:`linear-gradient(135deg,${C.a3},${C.accent})`,color:"#000",fontWeight:800,fontSize:10,border:"none",cursor:"pointer",fontFamily:"inherit",flexShrink:0,whiteSpace:"nowrap"}}>📅 Free Review</button>
            </div>
          )}

          {/* TREND CHART — key-based bar selection (W15 fix) */}
          <div style={K({marginBottom:16,padding:"14px 16px"})}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.08em"}}>📈 Weekly Net Pay Trend{helpBtn("trend")}</div>
              <div style={{display:"flex",gap:10}}>{vendorStats.map(v=><div key={v.key} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:"50%",background:v.color}}/><span style={{fontSize:9,color:C.sub}}>{v.short}</span></div>)}</div>
            </div>
            {helpModal("trend")}
            <div style={{display:"flex",alignItems:"flex-end",gap:4,height:80,padding:"0 2px"}}>
              {allW.map((w,i)=>{
                const maxNet=Math.max(...allW.map(x=>x.net));
                const h=Math.max(8,(w.net/maxNet)*68);
                const vc=VENDORS[detectVendor(w)]?.color||C.accent;
                const isSelected=sD===i;
                return(
                  <div key={w.week+i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"pointer",maxWidth:44}}
                    onClick={()=>{
                      const ki=allW.findIndex(function(x){return x.week===w.week&&(x.from||"")===(w.from||"");});
                      const ni=ki>=0?ki:i;
                      setSD(ni);setSM(ni);setSH(ni);
                    }}>
                    <div style={{fontSize:8,color:isSelected?vc:C.sub,fontWeight:isSelected?800:500,lineHeight:1,marginBottom:1}}>${(w.net/1000).toFixed(1)}k</div>
                    <div style={{width:"70%",height:h,borderRadius:"3px 3px 0 0",background:vc,opacity:isSelected?1:0.7,boxShadow:isSelected?`0 0 8px ${vc}66`:"none",transition:"all 0.15s",minWidth:6}}/>
                    <div style={{fontSize:7,color:isSelected?C.text:C.sub,fontWeight:isSelected?700:400,marginTop:2,lineHeight:1}}>W{w.week}</div>
                    <div style={{width:4,height:4,borderRadius:"50%",background:vc,opacity:0.8,marginTop:1}}/>
                  </div>
                );
              })}
            </div>
            <div style={{fontSize:9,color:C.sub,marginTop:8,textAlign:"center"}}>Tap any bar to sync all cards · W{allW[sD]?.week} selected</div>
          </div>

          {/* DEDUCTIONS + HEALTH */}
          <div style={{display:"grid",gridTemplateColumns:wide?"1.35fr 1fr":"1fr",gap:14,marginBottom:16}}>
            <div style={K()}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700}}>🔍 Deduction Breakdown{helpBtn("deductions")}</div>
                <Nav i={sD} max={allW.length-1} prev={()=>setSD(p=>p-1)} next={()=>setSD(p=>p+1)} label={"W"+dw.week}/>
              </div>
              {helpModal("deductions")}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:C.bg,borderRadius:9,border:`1px solid ${dg.c}44`,marginBottom:14}}>
                <div><div style={{fontSize:10,color:C.sub}}>{dw.from} – {dw.to}</div><div style={{fontSize:13,color:C.text,marginTop:3}}>Net <strong style={{color:dg.c}}>${dw.net.toLocaleString("en-US",{minimumFractionDigits:2})}</strong> · <strong style={{color:dg.c}}>{(dw.net/dw.gross*100).toFixed(1)}%</strong></div></div>
                <div style={{padding:"6px 13px",borderRadius:9,background:`${dg.c}18`,border:`1px solid ${dg.c}55`,textAlign:"center",flexShrink:0}}><div style={{fontSize:18}}>{dg.i}</div><div style={{fontSize:10,fontWeight:800,color:dg.c}}>{dg.l}</div></div>
              </div>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Cost Groups</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9,marginBottom:10}}>
                  {dwGroups.map(g=>(
                    <div key={g.label} style={{background:C.bg,borderRadius:10,padding:"12px 8px",border:`1px solid ${g.color}55`,textAlign:"center"}}>
                      <div style={{fontSize:20,marginBottom:5}}>{g.icon}</div>
                      <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:17,fontWeight:800,color:g.color}}>${g.amt.toFixed(0)}</div>
                      <div style={{fontSize:9,color:C.sub,marginTop:3,textTransform:"uppercase",letterSpacing:"0.04em"}}>{g.label}</div>
                      <div style={{marginTop:7}}><Tag color={g.color}>{g.pct}% gross</Tag></div>
                    </div>
                  ))}
                </div>
                <div style={{height:10,borderRadius:5,overflow:"hidden",display:"flex",marginBottom:6}}>
                  {dwGroups.map(g=><div key={g.label} style={{flex:Math.max(g.amt,1),background:g.color,opacity:0.85}}/>)}
                </div>
                <div style={{display:"flex",gap:12,justifyContent:"center",marginBottom:12}}>
                  {dwGroups.map(g=><div key={g.label} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,borderRadius:2,background:g.color}}/><span style={{fontSize:9,color:C.sub}}>{g.label}</span></div>)}
                </div>
              </div>

              {/* ⛽ FUEL VS MILES MPG CARD */}
              {(()=>{
                const reportedMiles=(dw.moves||[]).reduce(function(s,m){return s+(m.mi||m.miles||0);},0);
                const dwFuelCost=(dw.deds||[]).filter(function(d){return d.l.toLowerCase().includes("fuel advance");}).reduce(function(s,d){return s+d.a;},0);
                const hasRealGallons=dw.gallons&&dw.gallons>0;
                const gallonsBought=hasRealGallons?dw.gallons:(fuelPrice>0?dwFuelCost/fuelPrice:0);
                const gallonsSource=hasRealGallons?"from settlement":"estimated";
                const settlementMPG=gallonsBought>0?reportedMiles/gallonsBought:0;
                const truckBeatBaseline=settlementMPG>=fuelMPG;
                const mpgDiff=Math.abs(settlementMPG-fuelMPG).toFixed(2);
                const verdictColor=truckBeatBaseline?C.green:C.red;
                const gallonsAtBaseline=fuelMPG>0?reportedMiles/fuelMPG:0;
                const costAtBaseline=gallonsAtBaseline*fuelPrice;
                const galDiff=gallonsBought-gallonsAtBaseline;
                const unpaidMiles=Math.round(reportedMiles*milesBuffer/100);
                const gallonsUnpaid=settlementMPG>0?unpaidMiles/settlementMPG:0;
                const unpaidCost=gallonsUnpaid*fuelPrice;
                return(
                  <div style={{background:`${verdictColor}08`,borderRadius:12,border:`1px solid ${verdictColor}33`,padding:"14px",marginBottom:14}}>

                    {/* Header */}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <span style={{fontSize:16}}>⛽</span>
                        <span style={{fontSize:12,fontWeight:700,color:C.text}}>Fuel vs Miles · W{dw.week}</span>
                      </div>
                      <span style={{padding:"3px 10px",borderRadius:20,background:`${verdictColor}18`,border:`1px solid ${verdictColor}44`,fontSize:11,fontWeight:700,color:verdictColor}}>
                        {truckBeatBaseline?"✅ Efficient":"⚠️ Below Baseline"}
                      </span>
                    </div>

                    {/* Big MPG number */}
                    <div style={{padding:"14px",background:`${verdictColor}10`,borderRadius:10,border:`1px solid ${verdictColor}33`,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:10,color:C.sub,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>Settlement MPG — {gallonsSource}</div>
                        <div style={{fontSize:11,color:C.sub,marginBottom:5}}>{reportedMiles.toLocaleString()} paid miles ÷ {gallonsBought.toFixed(1)} gallons bought</div>
                        <div style={{fontSize:12,fontWeight:700,color:verdictColor}}>
                          {truckBeatBaseline
                            ?`✅ +${mpgDiff} MPG above your ${fuelMPG} baseline — running efficient`
                            :`⚠️ ${mpgDiff} MPG below your ${fuelMPG} baseline — burning excess fuel`}
                        </div>
                      </div>
                      <div style={{textAlign:"center",flexShrink:0,marginLeft:16}}>
                        <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:40,fontWeight:900,color:verdictColor,lineHeight:1}}>{settlementMPG>0?settlementMPG.toFixed(2):"—"}</div>
                        <div style={{fontSize:9,color:C.sub,marginTop:2}}>MPG this week</div>
                        <div style={{fontSize:9,color:C.sub,marginTop:1}}>Target: {fuelMPG} MPG</div>
                      </div>
                    </div>

                    {/* 3 stat tiles */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                      {[
                        {l:"Miles Paid",v:`${reportedMiles.toLocaleString()} mi`,sub:"Settlement reported",c:C.accent},
                        {l:`At ${fuelMPG} MPG`,v:`${gallonsAtBaseline.toFixed(0)} gal`,sub:`Cost $${costAtBaseline.toFixed(0)}`,c:C.sub},
                        {l:"Fuel Advances",v:`$${dwFuelCost.toFixed(0)}`,sub:`~${gallonsBought.toFixed(0)} gal`,c:C.sub},
                      ].map(function(s){return(
                        <div key={s.l} style={{background:C.bg,borderRadius:9,padding:"10px 8px",border:`1px solid ${C.border}`,textAlign:"center"}}>
                          <div style={{fontSize:9,color:C.sub,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4,lineHeight:1.3}}>{s.l}</div>
                          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:800,color:s.c}}>{s.v}</div>
                          <div style={{fontSize:9,color:C.sub,marginTop:3,lineHeight:1.4}}>{s.sub}</div>
                        </div>
                      );})}
                    </div>

                    {/* Unpaid miles warning */}
                    {unpaidMiles>0&&(
                      <div style={{padding:"10px 13px",background:`${C.red}10`,borderRadius:9,border:`1px solid ${C.red}44`,marginBottom:12}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div>
                            <div style={{fontSize:12,fontWeight:700,color:C.red}}>🚫 ~{unpaidMiles} unpaid miles — out of pocket</div>
                            <div style={{fontSize:10,color:C.sub,marginTop:2}}>Drove these miles, broker paid $0. Burned ~{gallonsUnpaid.toFixed(0)} gal at your own cost.</div>
                          </div>
                          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:900,color:"#f87171",flexShrink:0,marginLeft:10}}>-${unpaidCost.toFixed(0)}</div>
                        </div>
                      </div>
                    )}

                    {/* Calibration sliders */}
                    <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12}}>
                      <div style={{fontSize:9,color:"#fbbf24",fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.07em"}}>⚙️ Calibrate to your truck</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>

                        {/* MPG baseline */}
                        <div style={{background:C.bg,borderRadius:9,padding:"10px",border:`1px solid ${C.border}`}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                            <div style={{fontSize:10,color:C.sub,fontWeight:600}}>Baseline MPG</div>
                            <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:800,color:C.accent}}>{fuelMPG.toFixed(1)}</span>
                          </div>
                          <input type="range" min="3.5" max="9.0" step="0.1" value={fuelMPG}
                            onChange={function(e){setFuelMPG(parseFloat(e.target.value));}}
                            style={{width:"100%",accentColor:C.accent,cursor:"pointer",marginBottom:4}}/>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:8}}>
                            <span style={{color:"#f87171"}}>3.5 poor</span>
                            <span style={{color:"#4ade80"}}>9.0 great</span>
                          </div>
                          <div style={{fontSize:9,color:C.sub,marginTop:5,lineHeight:1.5}}>Green when your actual MPG beats this number</div>
                        </div>

                        {/* Price per gallon */}
                        <div style={{background:C.bg,borderRadius:9,padding:"10px",border:`1px solid ${C.border}`}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                            <div style={{fontSize:10,color:C.sub,fontWeight:600}}>Price / Gallon</div>
                            <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:800,color:fuelPrice>=6?C.red:C.gold}}>${fuelPrice.toFixed(2)}</span>
                          </div>
                          <input type="range" min="3.50" max="8.00" step="0.01" value={fuelPrice}
                            onChange={function(e){setFuelPrice(parseFloat(e.target.value));}}
                            style={{width:"100%",accentColor:C.accent,cursor:"pointer",marginBottom:4}}/>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:8}}>
                            <span style={{color:"#4ade80"}}>$3.50</span>
                            <span style={{color:"#f87171"}}>$8.00</span>
                          </div>
                          <div style={{fontSize:9,color:C.sub,marginTop:5,lineHeight:1.5}}>{hasRealGallons?"Real gallons from settlement":"Match your Pilot receipt for accuracy"}</div>
                        </div>
                      </div>

                      {/* Unpaid miles buffer */}
                      <div style={{background:unpaidMiles>0?`${C.red}08`:C.bg,borderRadius:9,padding:"10px",border:`1px solid ${unpaidMiles>0?C.red+"33":C.border}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                          <div>
                            <div style={{fontSize:10,color:C.sub,fontWeight:600}}>Unreported Miles Buffer</div>
                            <div style={{fontSize:9,color:C.sub,marginTop:1}}>Wrong turns, yard moves, short legs not on settlement</div>
                          </div>
                          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:800,color:unpaidMiles>0?C.red:C.sub}}>+{milesBuffer}%</span>
                        </div>
                        <input type="range" min="0" max="15" step="1" value={milesBuffer}
                          onChange={function(e){setMilesBuffer(parseInt(e.target.value));}}
                          style={{width:"100%",accentColor:"#f87171",cursor:"pointer"}}/>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:8,marginTop:4}}>
                          <span style={{color:"#4ade80"}}>0% = no hidden miles</span>
                          <span style={{color:"#f87171"}}>15% = big hidden cost</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

                            {!focusMode&&[...dwDeds].filter(d=>!d.l.toLowerCase().includes("escrow")).sort((a,b)=>b.a-a.a).map((d,i)=>{
                const pct=(d.a/dw.gross*100).toFixed(1),big=d.a>200;
                return(<div key={i} style={{marginBottom:9}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}><span style={{fontSize:11,color:C.sub,flex:1}}>{d.l}</span><div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}><Tag color={big?C.red:C.gold}>{pct}%</Tag><span style={{fontSize:12,fontWeight:700,color:big?C.red:C.text,minWidth:64,textAlign:"right"}}>${d.a.toFixed(2)}</span></div></div><Bar pct={d.a/dw.totalDeductions*100} color={big?C.red:d.a>50?C.gold:C.accent}/></div>);
              })}
              <div style={{marginTop:12,paddingTop:11,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:11,color:C.sub}}>Total Deductions</span>
                <div style={{display:"flex",gap:9,alignItems:"center"}}><Tag color={C.red}>{(dw.totalDeductions/dw.gross*100).toFixed(1)}% of gross</Tag><span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:800,color:C.red}}>${dw.totalDeductions.toFixed(2)}</span></div>
              </div>
            </div>

            {/* RIGHT COL */}
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={K()}>
                <div style={{fontSize:11,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>📊 Business Health{helpBtn("health")}</div>
                {helpModal("health")}
                {vendorStats.map((v,vi)=>{
                  const vw=allW.filter(w=>detectVendor(w)===v.key),vGross=vw.reduce((s,w)=>s+w.gross,0),vNet=vw.reduce((s,w)=>s+w.net,0),vMargin=vGross>0?(vNet/vGross*100).toFixed(1):"0.0";
                  const vMoves=vw.flatMap(w=>w.moves||[]),vLoaded=vMoves.length>0?Math.round(vMoves.filter(m=>m.t==="L"||m.type==="L").length/vMoves.length*100):0;
                  const vFuel=vw.reduce((s,w)=>s+(w.deds||[]).filter(d=>d.l.toLowerCase().includes("fuel")).reduce((ss,d)=>ss+d.a,0),0),vFuelPct=vGross>0?(vFuel/vGross*100).toFixed(0):0;
                  return(<div key={v.key} style={{marginBottom:vi<vendorStats.length-1?16:0,paddingBottom:vi<vendorStats.length-1?16:0,borderBottom:vi<vendorStats.length-1?`1px solid ${C.border}`:"none"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:16}}>{v.icon}</span><span style={{fontSize:11,fontWeight:700,color:v.color}}>{demoMode?"Demo Driver Co":(profile.company||profile.name||v.name)}</span></div>
                      <Tag color={v.color}>{vMargin}% margin</Tag>
                    </div>
                    {[{l:"Net Margin",pct:+vMargin,txt:`${vMargin}%`,c:+vMargin>20?C.green:C.red},{l:"Loaded %",pct:vLoaded,txt:`${vLoaded}%`,c:vLoaded>=60?C.green:C.gold},{l:"Fuel/Gross",pct:+vFuelPct,txt:`${vFuelPct}%`,c:C.red}].map(m=>(
                      <div key={m.l} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:10,color:C.sub}}>{m.l}</span><span style={{fontSize:11,fontWeight:700,color:m.c}}>{m.txt}</span></div><Bar pct={Math.min(m.pct,100)} color={m.c}/></div>
                    ))}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginTop:10}}>
                      {[{l:"Weeks",v:`${vw.length}`,c:v.color},{l:"YTD Net",v:`$${(vNet/1000).toFixed(1)}k`,c:C.green},{l:"Moves",v:`${vMoves.length}`,c:C.a3}].map(s=>(
                        <div key={s.l} style={{background:C.bg,borderRadius:7,padding:"7px 8px",border:`1px solid ${C.border}`,textAlign:"center"}}><div style={{fontSize:8,color:C.sub,textTransform:"uppercase",marginBottom:3}}>{s.l}</div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,color:s.c}}>{s.v}</div></div>
                      ))}
                    </div>
                  </div>);
                })}
              </div>

              <div style={K()}>
                <div style={{fontSize:11,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>🏆 Week Grades{helpBtn("grades")}</div>
                {helpModal("grades")}
                {vendorStats.map((v,vi)=>{
                  const vwi=allW.map((w,i)=>({w,i})).filter(({w})=>detectVendor(w)===v.key);
                  const vAvg=vwi.length>0?vwi.reduce((s,{w})=>s+w.net/w.gross*100,0)/vwi.length:0;
                  return(<div key={v.key} style={{marginBottom:vi<vendorStats.length-1?14:0,paddingBottom:vi<vendorStats.length-1?14:0,borderBottom:vi<vendorStats.length-1?`1px solid ${C.border}`:"none"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}><span style={{fontSize:13}}>{v.icon}</span><span style={{fontSize:10,fontWeight:700,color:v.color}}>{v.short}</span><span style={{fontSize:9,color:C.sub}}>avg {vAvg.toFixed(1)}%</span></div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {vwi.map(({w,i})=>{const g=wg(w);return(<div key={w.week} onClick={()=>setSH(i)} style={{padding:"5px 9px",borderRadius:7,background:i===sH?`${v.color}30`:`${v.color}12`,border:`2px solid ${i===sH?v.color:v.color+"33"}`,textAlign:"center",cursor:"pointer",minWidth:52}}><div style={{fontSize:8,color:C.sub}}>W{w.week}</div><div style={{fontSize:10,fontWeight:800,color:v.color}}>{g.i}</div><div style={{fontSize:8,color:v.color,opacity:0.8}}>{g.l}</div></div>);})}
                    </div>
                  </div>);
                })}
              </div>

              <div style={K({background:"linear-gradient(135deg,#0f1f14,#0f102a)",border:`1px solid ${C.green}44`})}>
                <div style={{fontSize:11,fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>💰 Savings & Escrow{helpBtn("savings")}</div>
                {helpModal("savings")}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                  {[{l:"YTD Escrow",v:`$${(tEscReg+tEsc290).toFixed(0)}`,c:C.a3},{l:"YTD Rebates",v:`$${tRebates.toFixed(2)}`,c:C.green}].map(s=>(
                    <div key={s.l} style={{background:C.bg,borderRadius:9,padding:"10px",border:`1px solid ${C.border}`,textAlign:"center"}}><div style={{fontSize:9,color:C.sub,textTransform:"uppercase",marginBottom:4}}>{s.l}</div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:17,fontWeight:800,color:s.c}}>{s.v}</div></div>
                  ))}
                </div>
                <div style={{marginBottom:5}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,color:C.sub}}>Escrow Progress</span><span style={{fontSize:11,fontWeight:700,color:C.a3}}>${(tEscReg+tEsc290).toFixed(0)} / $2,500</span></div>
                  <Bar pct={(tEscReg+tEsc290)/2500*100} color={C.a3}/>
                </div>
              </div>
            </div>
          </div>

          {/* MOVE PERFORMANCE */}
          {!focusMode&&<div style={K()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700}}>🚛 Move Performance{helpBtn("movePerf")}</div>
              <Nav i={sM} max={allW.length-1} prev={()=>setSM(p=>p-1)} next={()=>setSM(p=>p+1)} label={`W${mwBase.week}`}/>
            </div>
            {helpModal("movePerf")}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:14}}>
              {[{l:"Gross",v:`$${mwBase.gross.toLocaleString("en-US",{minimumFractionDigits:2})}`,c:C.accent},{l:"Net",v:`$${mwBase.net.toLocaleString("en-US",{minimumFractionDigits:2})}`,c:C.green},{l:"Avg RPM",v:`$${mwRPM}`,c:C.a3},{l:"Loaded %",v:`${mwLd}%`,c:mwLd>=60?C.green:C.gold}].map(s=>(
                <div key={s.l} style={{background:C.bg,borderRadius:9,padding:"10px",border:`1px solid ${C.border}`,textAlign:"center"}}><div style={{fontSize:9,color:C.sub,textTransform:"uppercase",marginBottom:4}}>{s.l}</div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:700,color:s.c}}>{s.v}</div></div>
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

          {/* ACTION PLAN */}
          {(()=>{
            const lw=safeW[sD]||safeW[safeW.length-1];
            const lwFuel=(lw.deds||[]).filter(function(d){return d.l.toLowerCase().includes("fuel");}).reduce(function(s,d){return s+d.a;},0);
            const lwLoaded=lw.moves&&lw.moves.length>0?Math.round(lw.moves.filter(function(m){return m.t==="L"||m.type==="L";}).length/lw.moves.length*100):0;
            const targetNet=parseFloat(profile.targetWeeklyNet)||3000,gap=targetNet-lw.net,avgRPMnum=parseFloat(avgRPM)||0;
            const actions=[];
            if(lw.net<targetNet&&gap>0)actions.push({icon:"💰",color:"#fbbf24",title:"Close the $"+Math.round(gap).toLocaleString()+" gap to your weekly target",detail:"W"+lw.week+" net was $"+lw.net.toFixed(0)+". "+Math.ceil(gap/250)+" additional loaded runs at your average rate would close this gap."});
            if(lwLoaded<60)actions.push({icon:"📦",color:"#00ffcc",title:"Boost your loaded percentage — currently "+lwLoaded+"%",detail:"Less than 60% loaded miles hurts your revenue per mile. Prioritize back-to-back loaded moves."});
            if(lwFuel>800)actions.push({icon:"⛽",color:"#f87171",title:"Fuel cost of $"+Math.round(lwFuel).toLocaleString()+" is high this week",detail:"Check if your settlement MPG is below baseline. High fuel advances could mean inefficient routes."});
            if(avgRPMnum<2.5)actions.push({icon:"📈",color:"#a78bfa",title:"Avg RPM of $"+avgRPM+" is below $2.50 target",detail:"Review your route mix and decline D-grade offers — they cost more than they pay."});
            const topActions=actions.slice(0,3);if(topActions.length===0)return null;
            return(
              <div style={K({marginBottom:16})}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700}}>🎯 Weekly Action Plan{helpBtn("actionPlan")}</div>
                  <div style={{fontSize:9,padding:"2px 7px",borderRadius:5,background:C.green+"20",color:C.green,fontWeight:700,marginLeft:"auto"}}>W{lw.week} · {topActions.length} actions</div>
                </div>
                {helpModal("actionPlan")}
                <div style={{display:"flex",flexDirection:"column",gap:9}}>
                  {topActions.map(function(a,idx){return(
                    <div key={idx} style={{display:"flex",gap:10,padding:"11px 12px",background:C.bg,borderRadius:9,border:"1px solid "+a.color+"44"}}>
                      <div style={{width:32,height:32,borderRadius:8,background:a.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{a.icon}</div>
                      <div><div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:3}}>{a.title}</div><div style={{fontSize:10,color:C.sub,lineHeight:1.6}}>{a.detail}</div></div>
                    </div>
                  );})}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ══ LOADS / DOCS TAB ════════════════════════════════════════════════ */}
      {tab==="loads"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",marginBottom:14,background:"#f8717110",borderRadius:12,border:"2px solid #f87171"}}>
            <div><div style={{fontSize:12,fontWeight:800,color:"#f87171"}}>🔴 Reset All Data</div><div style={{fontSize:10,color:C.sub,marginTop:2}}>Wipes uploaded weeks, profile, settings</div></div>
            <button onClick={()=>{if(window.confirm("RESET ALL DATA? Cannot be undone.")){try{localStorage.clear();}catch(e){}window.location.reload();}}} style={{padding:"8px 18px",borderRadius:9,background:"#f87171",color:"#000",fontSize:12,fontWeight:800,border:"none",cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>Reset</button>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
            <div><h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:800,margin:0}}>📋 Document Analyzer</h1><p style={{color:C.sub,fontSize:11,marginTop:4,marginBottom:0}}>Upload · Scan · Score · Analyze</p></div>
            <button onClick={()=>setShowAdd(p=>!p)} style={{padding:"10px 16px",borderRadius:9,background:C.accent,color:"#000",fontWeight:700,fontSize:12,border:"none",cursor:"pointer"}}>+ Add Move</button>
          </div>

          <div style={K({border:`1px solid ${C.a3}55`,marginBottom:16})}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <div style={{width:38,height:38,borderRadius:10,background:`${C.a3}18`,border:`1px solid ${C.a3}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>📄</div>
              <div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700}}>Add Settlement Week{helpBtn("addSettlement")}</div><div style={{fontSize:11,color:C.sub,marginTop:2}}>Upload PDF · Paste text · Type numbers</div></div>
            </div>
            {helpModal("addSettlement")}
            <input ref={fileRef} type="file" accept="application/pdf,.pdf" style={{display:"none"}} onChange={e=>{const file=e.target.files[0];if(file){setScanMode("scan");scanPDF(file,"pdf");}e.target.value="";}}/>
            <input ref={imgRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>{const file=e.target.files[0];if(file){setScanMode("scan");scanPDF(file,"image");}e.target.value="";}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:16}}>
              {[{m:"scan",icon:"📤",label:"Upload PDF",desc:"Tap to scan"},{m:"paste",icon:"📋",label:"Paste Text",desc:"Copy & paste"},{m:"form",icon:"✏️",label:"Type In",desc:"Manual"},{m:"tips",icon:"💡",label:"How To",desc:"Guide"}].map(t=>(
                <button key={t.m} onClick={()=>{setScanMode(t.m);if(t.m==="scan")fileRef.current?.click();}} style={{padding:"9px 4px",borderRadius:9,background:scanMode===t.m?`${C.a3}25`:C.raised,border:`1px solid ${scanMode===t.m?C.a3:C.border}`,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                  <div style={{fontSize:16,marginBottom:3}}>{t.icon}</div><div style={{fontSize:10,fontWeight:700,color:scanMode===t.m?C.a3:C.text}}>{t.label}</div><div style={{fontSize:9,color:C.sub}}>{t.desc}</div>
                </button>
              ))}
            </div>

            {scanMode==="scan"&&(
              <div>
                {!scanning&&!scanResult&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                    <button onClick={()=>fileRef.current?.click()} style={{padding:"22px 10px",borderRadius:14,background:`linear-gradient(135deg,${C.a3}20,${C.accent}15)`,border:`2px solid ${C.a3}`,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                      <div style={{fontSize:32,marginBottom:8}}>📂</div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:800,color:"#a78bfa",marginBottom:4}}>Open PDF File</div><div style={{fontSize:10,color:C.sub,lineHeight:1.5}}>Browse your Downloads or Files app</div>
                    </button>
                    <button onClick={()=>imgRef.current?.click()} style={{padding:"22px 10px",borderRadius:14,background:`linear-gradient(135deg,${C.gold}15,${C.a3}10)`,border:`2px solid ${C.gold}`,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                      <div style={{fontSize:32,marginBottom:8}}>📷</div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:800,color:"#fbbf24",marginBottom:4}}>Take a Photo</div><div style={{fontSize:10,color:C.sub,lineHeight:1.5}}>Photo of printed statement</div>
                    </button>
                  </div>
                )}
                {scanning&&<div style={{textAlign:"center",padding:"32px 16px"}}><div style={{fontSize:42,marginBottom:12}}>⏳</div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:800,color:"#a78bfa",marginBottom:6}}>AI Reading Your Settlement...</div><div style={{height:4,background:C.raised,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:"70%",background:`linear-gradient(90deg,${C.a3},${C.accent})`,borderRadius:4}}/></div></div>}
                {scanResult&&!scanning&&(
                  <div style={{background:C.bg,borderRadius:10,border:`1px solid ${C.a3}44`,padding:14}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#a78bfa",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.08em"}}>✅ PDF Read — Review & Confirm</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:12}}>
                      {[{l:"Week",v:`Week ${scanResult.week}`},{l:"Gross",v:`$${Number(scanResult.gross||0).toFixed(2)}`},{l:"Net Pay",v:`$${Number(scanResult.net||0).toFixed(2)}`},{l:"Moves",v:`${scanResult.moves?.length||0} found`}].map(s=>(
                        <div key={s.l} style={{background:C.raised,borderRadius:8,padding:"9px 11px",border:`1px solid ${C.border}`}}><div style={{fontSize:9,color:C.sub,textTransform:"uppercase",marginBottom:3}}>{s.l}</div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,color:C.text}}>{s.v}</div></div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:10}}>
                      <button onClick={confirmScan} style={{flex:1,padding:"13px",borderRadius:9,background:`linear-gradient(135deg,${C.accent},${C.a3})`,color:"#000",fontWeight:800,fontSize:13,border:"none",cursor:"pointer"}}>✅ Save Week {scanResult.week}</button>
                      <button onClick={()=>{setScanResult(null);setScanMsg("");}} style={{padding:"13px 16px",borderRadius:9,background:"transparent",color:C.sub,fontWeight:700,border:`1px solid ${C.border}`,cursor:"pointer"}}>✕</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {scanMode==="paste"&&(
              <div>
                <div style={{padding:"10px 13px",background:`${C.a3}10`,borderRadius:8,border:`1px solid ${C.a3}33`,fontSize:11,color:C.sub,marginBottom:12,lineHeight:1.8}}><strong style={{color:C.a3}}>How:</strong> Open your settlement PDF → tap <strong style={{color:C.text}}>Select All</strong> → <strong style={{color:C.text}}>Copy</strong> → paste below. AI reads everything instantly.</div>
                <textarea value={pasteText} onChange={e=>setPasteText(e.target.value)} placeholder={"Paste your full settlement text here...\n\nExample:\nWeek No: 15-2026  Week From: 04/06/2026  Week To: 04/12/2026\nTotal Gross: $5,705.45\nNet Check Amount $3,000.28"} style={{...inp,height:160,resize:"vertical",lineHeight:1.6,fontSize:12,marginBottom:12}}/>
                <button onClick={parsePasteText} disabled={!pasteText.trim()||pasteLoading} style={{width:"100%",padding:"14px",borderRadius:9,background:(!pasteText.trim()||pasteLoading)?C.raised:`linear-gradient(135deg,${C.a3},${C.accent})`,color:"#000",fontWeight:800,fontSize:13,border:"none",cursor:(!pasteText.trim()||pasteLoading)?"not-allowed":"pointer",marginBottom:10}}>{pasteLoading?"⏳ AI Reading...":"🧠 Read & Extract Settlement"}</button>
              </div>
            )}

            {scanMode==="form"&&(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                  {[{k:"week",l:"Week #",ph:"15"},{k:"moves",l:"# of Moves",ph:"20"},{k:"from",l:"Week From",ph:"04/06/2026"},{k:"to",l:"Week To",ph:"04/12/2026"},{k:"gross",l:"Gross $",ph:"4688.64"},{k:"deds",l:"Deductions $",ph:"1870.04"}].map(field=>(
                    <div key={field.k}><div style={{fontSize:10,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>{field.l}</div><input value={scanForm[field.k]||""} onChange={e=>setScanForm(p=>({...p,[field.k]:e.target.value}))} placeholder={field.ph} style={inp}/></div>
                  ))}
                  <div style={{gridColumn:"1/-1"}}><div style={{fontSize:10,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>Net Pay $</div><input value={scanForm.net||""} onChange={e=>setScanForm(p=>({...p,net:e.target.value}))} placeholder="2857.82" style={{...inp,border:`1px solid ${C.accent}55`}}/></div>
                  <div style={{gridColumn:"1/-1"}}>
                    <div style={{fontSize:10,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Carrier / Vendor</div>
                    <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                      {Object.entries(VENDORS).map(([k,v])=><button key={k} onClick={()=>setVendorPick(k)} style={{padding:"7px 13px",borderRadius:8,background:vendorPick===k?`${v.color}22`:C.raised,border:`1px solid ${vendorPick===k?v.color:C.border}`,color:vendorPick===k?v.color:C.sub,fontSize:11,fontWeight:vendorPick===k?700:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}><span>{v.icon}</span><span>{v.short}</span></button>)}
                    </div>
                  </div>
                </div>
                <button onClick={()=>{const {week,from,to,gross,net,deds,moves}=scanForm;if(!week||!gross||!net){setScanMsg("⚠️ Week #, Gross, and Net are required.");return;}const wNum=String(week).padStart(2,"0");if(addedW.find(w=>w.week===wNum)){setScanMsg("⚠️ Week "+wNum+" already exists.");return;}setAddedW(p=>[...p,{vendor:vendorPick,week:wNum,label:`Week ${wNum}`,from:from||"",to:to||"",gross:parseFloat(gross)||0,net:parseFloat(net)||0,totalDeductions:parseFloat(deds)||0,rebate:0,moves:Array.from({length:parseInt(moves)||0},()=>({t:"L",fr:"?",to:"?",mi:0,rt:0,fc:0})),deds:[]}]);setScanMsg(`✅ Week ${wNum} saved`);setScanForm({week:"",from:"",to:"",gross:"",net:"",deds:"",moves:""});}} disabled={!scanForm.week||!scanForm.gross||!scanForm.net} style={{width:"100%",padding:"14px",borderRadius:9,background:(!scanForm.week||!scanForm.gross||!scanForm.net)?C.raised:`linear-gradient(135deg,${C.accent},${C.a3})`,color:"#000",fontWeight:800,fontSize:13,border:"none",cursor:(!scanForm.week||!scanForm.gross||!scanForm.net)?"not-allowed":"pointer",marginBottom:10}}>✅ Save Settlement Week</button>
              </div>
            )}

            {scanMode==="tips"&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {[{icon:"📤",title:"Upload PDF (Best)",color:"#a78bfa",steps:["Tap 'Upload PDF' tab above","Tap the big button — file picker opens","Find your settlement PDF in Downloads","AI reads everything — tap Save"]},{icon:"📋",title:"Paste Text",color:"#00ffcc",steps:["Open PDF → Select All → Copy","Switch here → Paste Text tab → paste","Tap 'Read & Extract' — done in seconds"]},{icon:"🔢",title:"Key numbers to find",color:"#fbbf24",steps:["Week # → top: 'Week No: 15-2026'","Gross → bottom: 'Gross Check Amount'","Net → bottom: 'Net Check Amount'"]}].map(s=>(
                  <div key={s.title} style={{background:C.bg,borderRadius:10,padding:"13px",border:`1px solid ${s.color}44`}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:9}}><span style={{fontSize:18}}>{s.icon}</span><span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:700,color:s.color}}>{s.title}</span></div>
                    {s.steps.map((st,i)=><div key={i} style={{display:"flex",gap:9,marginBottom:6}}><span style={{color:s.color,fontWeight:700,fontSize:12,flexShrink:0}}>{i+1}.</span><span style={{fontSize:11,color:C.sub,lineHeight:1.6}}>{st}</span></div>)}
                  </div>
                ))}
              </div>
            )}

            {pasteResult&&(
              <div style={{background:C.bg,borderRadius:10,border:`1px solid ${C.a3}44`,padding:14,marginTop:10}}>
                <div style={{fontSize:11,fontWeight:700,color:"#a78bfa",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.08em"}}>📋 Extracted — Review & Confirm</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:12}}>
                  {[{l:"Week",v:`Week ${pasteResult.week}`},{l:"Gross",v:`$${Number(pasteResult.gross||0).toFixed(2)}`},{l:"Net Pay",v:`$${Number(pasteResult.net||0).toFixed(2)}`},{l:"Moves",v:`${pasteResult.moves?.length||0} moves`}].map(s=>(
                    <div key={s.l} style={{background:C.raised,borderRadius:8,padding:"9px 11px",border:`1px solid ${C.border}`}}><div style={{fontSize:9,color:C.sub,textTransform:"uppercase",marginBottom:3}}>{s.l}</div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,color:C.text}}>{s.v}</div></div>
                  ))}
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>{const wNum=String(pasteResult.week).padStart(2,"0");if(allW.find(w=>w.week===wNum)){setScanMsg("⚠️ Week "+wNum+" already exists.");setPasteResult(null);return;}const safeWk={...pasteResult,week:wNum,label:`Week ${wNum}`,moves:Array.isArray(pasteResult.moves)?pasteResult.moves:[],deds:Array.isArray(pasteResult.deds)?pasteResult.deds:[],rebate:pasteResult.rebate||0};safeWk.vendor=detectVendor(safeWk);setAddedW(p=>[...p,safeWk]);setScanMsg(`✅ Week ${wNum} saved!`);setPasteResult(null);setPasteText("");setScanMode("form");}} style={{flex:1,padding:"13px",borderRadius:9,background:`linear-gradient(135deg,${C.accent},${C.a3})`,color:"#000",fontWeight:800,fontSize:13,border:"none",cursor:"pointer"}}>✅ Save Week {pasteResult.week}</button>
                  <button onClick={()=>{setPasteResult(null);setScanMsg("");}} style={{padding:"13px 16px",borderRadius:9,background:"transparent",color:C.text,fontWeight:700,border:`1px solid ${C.border}`,cursor:"pointer"}}>✕</button>
                </div>
              </div>
            )}
            {scanMsg&&<div style={{padding:"11px 14px",background:scanMsg.startsWith("⚠️")?`${C.red}12`:`${C.green}12`,borderRadius:9,border:`1px solid ${scanMsg.startsWith("⚠️")?C.red:C.green}44`,fontSize:12,color:scanMsg.startsWith("⚠️")?C.red:C.green,marginTop:10}}>{scanMsg}</div>}
            {addedW.length>0&&(
              <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${C.border}`}}>
                <div style={{fontSize:10,fontWeight:700,color:"#a78bfa",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:9}}>✅ Saved Weeks ({addedW.length})</div>
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {addedW.map((w,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 13px",background:C.bg,borderRadius:9,border:`1px solid ${C.a3}55`}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:8,height:8,borderRadius:"50%",background:C.a3,boxShadow:`0 0 5px ${C.a3}`}}/><div><div style={{fontSize:12,fontWeight:700,color:C.text}}>{w.label} <Tag color={C.a3}>Added</Tag></div><div style={{fontSize:10,color:C.sub,marginTop:2}}>{w.from||""}{w.to?` – ${w.to}`:""} · {w.moves?.length||0} moves</div></div></div>
                      <div style={{textAlign:"right"}}><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,color:C.green}}>${Number(w.net).toLocaleString("en-US",{minimumFractionDigits:2})}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* OFFER SCORER */}
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
              <button onClick={()=>{if(!hasAccess&&oUses>=FREE_OS){openUpgrade("scorer");return;}setOfferRes(scoreMove({miles:+offer.miles,rate:+offer.rate,fsc:+offer.fsc,type:offer.type}));if(!hasAccess)setOUses(function(p){return p+1;});}} style={{width:"100%",padding:"13px",borderRadius:9,background:`linear-gradient(135deg,${C.accent},${C.a3})`,color:"#000",fontWeight:800,fontSize:13,border:"none",cursor:"pointer"}}>{osLocked?"🔒 Unlock Offer Scorer":"Score This Offer"}{!hasAccess&&!osLocked?" ("+(FREE_OS-oUses)+" free left)":""}</button>
            </div>
            <div style={K({display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12,minHeight:200,border:offerRes?`2px solid ${gc(offerRes.grade)}`:`1px solid ${C.border}`})}>
              {offerRes?(<><div style={{display:"flex",gap:16,alignItems:"center",width:"100%"}}><div style={{width:76,height:76,borderRadius:14,background:`${gc(offerRes.grade)}18`,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${gc(offerRes.grade)}`,flexShrink:0}}><span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:34,fontWeight:900,color:gc(offerRes.grade)}}>{offerRes.grade}</span></div><div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:26,fontWeight:800,color:gc(offerRes.grade)}}>{offerRes.score}/100</div><div style={{fontSize:12,color:C.sub,marginTop:2}}>RPM: <strong style={{color:C.text}}>${offerRes.rpm}/mi</strong></div><div style={{fontSize:13,color:C.text,fontWeight:700,marginTop:4}}>{offerRes.grade==="A"?"🔥 Take it!":offerRes.grade==="B"?"👍 Good offer":offerRes.grade==="C"?"🤔 Marginal":"❌ Pass"}</div></div></div><div style={{display:"flex",flexWrap:"wrap",gap:6,width:"100%"}}>{offerRes.tags.map(t=><Tag key={t} color={C.sub}>{t}</Tag>)}</div></>):(<><div style={{fontSize:38}}>📋</div><div style={{color:C.sub,fontSize:13}}>Enter offer details to score</div><div style={{fontSize:11,color:C.sub}}>A=take it · B=good · C=marginal · D=pass</div></>)}
            </div>
          </div>
          <NoBadge/>

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

          {/* FULL HISTORY */}
          <div style={K()}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,marginBottom:6}}>📁 Full History — {allMoves.length} moves · {allW.length} weeks{helpBtn("fullHistory")}</div>
            {helpModal("fullHistory")}
            <div style={{overflowX:"auto",overflowY:"auto",maxHeight:420,borderRadius:8,border:`1px solid ${C.border}`}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                <thead><tr style={{borderBottom:`2px solid ${C.border}`,background:C.raised}}>{["Wk","Vendor","Type","Route","Mi","Rate","FSC","Total","RPM","Grade"].map(h=><th key={h} style={{textAlign:"left",padding:"9px 6px",color:C.sub,fontWeight:700,fontSize:10,textTransform:"uppercase",whiteSpace:"nowrap",position:"sticky",top:0,background:C.raised,zIndex:2}}>{h}</th>)}</tr></thead>
                <tbody>{allMoves.slice().reverse().map((m,i)=>{
                  const s=scoreMove(m),vk=allW.find(w=>w.week===m.wk)?detectVendor(allW.find(w=>w.week===m.wk)):"CPG",vc=VENDORS[vk]?.color||C.accent;
                  return(<tr key={i} style={{borderBottom:`1px solid ${C.border}`,background:m.isRoundTrip?`${C.a3}10`:i%2?`${C.border}30`:"transparent"}}>
                    <td style={{padding:"8px 6px",color:C.sub,fontWeight:600}}>W{m.wk}</td>
                    <td style={{padding:"8px 6px"}}><span style={{padding:"2px 7px",borderRadius:5,fontSize:9,fontWeight:700,background:`${vc}22`,color:vc}}>{vk}</span></td>
                    <td style={{padding:"8px 6px"}}>{m.isRoundTrip?<span style={{padding:"2px 7px",borderRadius:5,fontSize:10,fontWeight:700,background:`${C.a3}30`,color:C.a3}}>🔄 RT</span>:<span style={{padding:"2px 7px",borderRadius:5,fontSize:10,fontWeight:700,background:m.type==="L"?`${C.green}25`:`${C.gold}25`,color:m.type==="L"?C.green:C.gold}}>{m.type}</span>}</td>
                    <td style={{padding:"8px 6px",color:C.text,whiteSpace:"nowrap"}}>{m.from}↔{m.to}{m.extraPay>0&&<span style={{marginLeft:4,padding:"1px 4px",borderRadius:4,fontSize:9,fontWeight:700,background:`${C.gold}22`,color:C.gold}}>+${m.extraPay}</span>}</td>
                    <td style={{padding:"8px 6px",color:C.text}}>{m.miles}</td>
                    <td style={{padding:"8px 6px",color:C.text}}>${m.rate.toFixed(2)}</td>
                    <td style={{padding:"8px 6px",color:m.fsc>0?C.accent:C.sub}}>{m.fsc>0?`$${m.fsc.toFixed(2)}`:"—"}</td>
                    <td style={{padding:"8px 6px",color:C.text,fontWeight:600}}>${(m.rate+m.fsc).toFixed(2)}</td>
                    <td style={{padding:"8px 6px",color:+s.rpm>=2.5?C.green:+s.rpm>=2.0?C.gold:C.red,fontWeight:700}}>${s.rpm}</td>
                    <td style={{padding:"8px 6px"}}><Tag color={gc(s.grade)}>{s.grade}</Tag></td>
                  </tr>);
                })}</tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══ AI TAB ════════════════════════════════════════════════════════════ */}
      {tab==="ai"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:800,margin:0}}>AI Intelligence</h1>
          <div style={K({background:C.surf})}>
            <div style={{fontSize:10,fontWeight:700,color:"#00ffcc",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.1em"}}>📊 Snapshot</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9}}>
              {[{l:"Net Margin",v:`${margin}%`,c:+margin>=20?C.green:C.red},{l:"Avg RPM",v:`$${avgRPM}`,c:+avgRPM>=2.5?C.green:C.gold},{l:"Loaded %",v:`${ldPct}%`,c:ldPct>=60?C.green:C.gold},{l:"Fuel/Gross",v:`${(latFuel/latest.gross*100).toFixed(0)}%`,c:C.red},{l:"Total Moves",v:`${allMoves.length}`,c:C.text},{l:"YTD Net",v:`$${tNet.toLocaleString("en-US",{minimumFractionDigits:0})}`,c:C.green}].map(s=>(
                <div key={s.l} style={{background:C.card,borderRadius:9,padding:"11px 9px",border:`1px solid ${C.border}`,textAlign:"center"}}><div style={{fontSize:9,color:C.sub,marginBottom:4,textTransform:"uppercase"}}>{s.l}</div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:800,color:s.c}}>{s.v}</div></div>
              ))}
            </div>
          </div>
          <div style={K()}>
            <div style={{fontSize:11,fontWeight:700,color:C.sub,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.08em"}}>🛠️ AI Tools</div>
            <div style={{display:"grid",gridTemplateColumns:wide?"repeat(4,1fr)":"repeat(2,1fr)",gap:8,marginBottom:14}}>
              {[{mode:"chat",icon:"💬",label:"Chat",desc:"Ask anything"},{mode:"report",icon:"📊",label:"Weekly Report",desc:"Settlement summary"},{mode:"bizplan",icon:"📄",label:"Business Plan",desc:"For bank / SBA loan"},{mode:"funding",icon:"🏦",label:"Find Funding",desc:"Lenders & programs"}].map(t=>(
                <button key={t.mode} onClick={()=>{setAiMode(t.mode);setAiOut("");}} style={{padding:"12px 8px",borderRadius:10,background:aiMode===t.mode?`${C.accent}20`:C.raised,border:`1px solid ${aiMode===t.mode?C.accent:C.border}`,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                  <div style={{fontSize:20,marginBottom:5}}>{t.icon}</div><div style={{fontSize:11,fontWeight:700,color:aiMode===t.mode?C.accent:C.text}}>{t.label}</div><div style={{fontSize:9,color:C.sub,marginTop:2}}>{t.desc}</div>
                </button>
              ))}
            </div>
            {aiMode==="report"&&(
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:700,color:C.sub,marginBottom:8,textTransform:"uppercase"}}>Select Week</div>
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                  {allW.map((w,i)=><button key={w.week} onClick={()=>{setSR(i);setAiOut("");}} style={{padding:"7px 12px",borderRadius:8,background:i===sR?`${C.gold}20`:C.raised,border:`1px solid ${i===sR?C.gold:C.border}`,color:i===sR?C.gold:C.text,fontSize:11,fontWeight:i===sR?700:500,cursor:"pointer",fontFamily:"inherit"}}>{w.label}{i===allW.length-1?" ★":""}</button>)}
                </div>
              </div>
            )}
            {aiMode!=="chat"&&<button onClick={()=>runAITool(aiMode)} disabled={aiLoad} style={{width:"100%",padding:"14px",borderRadius:9,background:aiLoad?C.raised:aiMode==="bizplan"?`linear-gradient(135deg,${C.a3},${C.accent})`:aiMode==="funding"?`linear-gradient(135deg,${C.gold},${C.a2})`:C.accent,color:"#000",fontWeight:800,fontSize:13,border:"none",cursor:aiLoad?"not-allowed":"pointer",marginBottom:12}}>{aiLoad?"⏳ Writing...":aiMode==="report"?`⚡ Generate ${((allW[sR]||allW[allW.length-1]||safeW[safeW.length-1]||{label:"Weekly"}).label)} Report`:aiMode==="bizplan"?"📄 Generate Business Plan":"🏦 Find Funding Options"}</button>}
            {aiOut&&(
              <div style={{background:C.bg,borderRadius:10,border:`1px solid ${C.border}`,padding:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#00ffcc",textTransform:"uppercase",letterSpacing:"0.08em"}}>{aiMode==="report"?"📊 Weekly Report":aiMode==="bizplan"?"📄 Business Plan":"🏦 Funding Guide"}</div>
                  <button onClick={()=>copyText(aiOut)} style={{padding:"7px 14px",borderRadius:8,background:C.accent,border:"none",color:"#000",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>📋 Copy</button>
                </div>
                <pre style={{fontSize:12,color:C.text,lineHeight:1.85,whiteSpace:"pre-wrap",margin:0,fontFamily:"'IBM Plex Mono',monospace"}}>{aiOut}</pre>
              </div>
            )}
          </div>
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
                {chatLoad&&<div style={{display:"flex",gap:8,alignItems:"flex-end"}}><div style={{width:26,height:26,borderRadius:7,background:C.surf,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>🧠</div><div style={{padding:"11px 14px",background:C.card,borderRadius:11,border:`1px solid ${C.border}`,color:"#00ffcc",fontSize:13}}>⏳ Thinking...</div></div>}
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

      {/* ══ GROWTH TAB ═══════════════════════════════════════════════════════ */}
      {tab==="growth"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:800,margin:0}}>🚀 Growth Tools</h1><p style={{color:C.sub,fontSize:11,marginTop:4,marginBottom:0}}>Add weeks · Download reports · Scale your fleet</p></div>

          <div style={K({border:`1px solid ${C.accent}44`})}>
            <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:14}}>
              <div style={{width:38,height:38,borderRadius:10,background:`${C.accent}18`,border:`1px solid ${C.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>📄</div>
              <div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700}}>Add Settlement Week</div><div style={{fontSize:11,color:C.sub,marginTop:2}}>Enter numbers from your statement · 30 seconds</div></div>
            </div>
            <div style={{padding:"10px 14px",background:`${C.gold}10`,borderRadius:9,border:`1px solid ${C.gold}33`,fontSize:11,color:C.sub,marginBottom:14,lineHeight:1.7}}>💡 <strong style={{color:C.gold}}>Tip:</strong> Use <strong style={{color:C.a3}}>📷 Scan PDF</strong> in the Doc Analyzer tab to auto-fill everything from your PDF. Or enter manually below.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:13}}>
              {[["week","Week #","e.g. 15"],["moves","# Moves","e.g. 20"],["from","From Date","MM/DD/YYYY"],["to","To Date","MM/DD/YYYY"],["gross","Gross $","e.g. 4688.64"],["deductions","Deductions $","e.g. 1870.04"]].map(([k,l,ph])=>(
                <div key={k}><label style={lbl}>{l}</label><input value={manForm[k]} onChange={e=>setManForm(p=>({...p,[k]:e.target.value}))} placeholder={ph} style={inp}/></div>
              ))}
              <div style={{gridColumn:"1/-1"}}><label style={lbl}>Net Pay $</label><input value={manForm.net} onChange={e=>setManForm(p=>({...p,net:e.target.value}))} placeholder="e.g. 2857.82" style={inp}/></div>
            </div>
            <button onClick={addWeek} disabled={!manForm.week||!manForm.gross||!manForm.net} style={{width:"100%",padding:"14px",borderRadius:9,background:(!manForm.week||!manForm.gross||!manForm.net)?C.raised:`linear-gradient(135deg,${C.accent},${C.a3})`,color:"#000",fontWeight:800,fontSize:13,border:"none",cursor:(!manForm.week||!manForm.gross||!manForm.net)?"not-allowed":"pointer",marginBottom:10}}>+ Add This Settlement Week</button>
            {addMsg&&<div style={{padding:"10px 14px",background:addMsg.startsWith("⚠️")?`${C.red}12`:`${C.green}12`,borderRadius:9,border:`1px solid ${addMsg.startsWith("⚠️")?C.red:C.green}44`,fontSize:12,color:addMsg.startsWith("⚠️")?C.red:C.green}}>{addMsg}</div>}
          </div>

          <div style={{padding:"12px 14px",background:"#f8717108",borderRadius:12,border:"2px solid #f8717144",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
            <div><div style={{fontSize:12,fontWeight:700,color:"#f87171",marginBottom:2}}>🔴 Reset All Data</div><div style={{fontSize:10,color:C.sub}}>Wipes all uploaded weeks, profile & settings.</div></div>
            <button onClick={()=>{if(window.confirm("RESET ALL DATA? This cannot be undone.")){try{localStorage.clear();}catch(e){}window.location.reload();}}} style={{padding:"9px 16px",borderRadius:9,background:"#f87171",color:"#000",fontSize:11,fontWeight:800,border:"none",cursor:"pointer",fontFamily:"inherit",flexShrink:0,whiteSpace:"nowrap"}}>Reset</button>
          </div>

          <div style={K()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700}}>📋 All Settlements ({allW.length} weeks · ${allW.reduce((s,w)=>s+w.gross,0).toLocaleString("en-US",{minimumFractionDigits:2})} YTD)</div>
              {addedW.length>0&&<button onClick={()=>{if(window.confirm(`Remove all ${addedW.length} added weeks?`)){setAddedW([]);}}} style={{padding:"6px 12px",borderRadius:8,background:`${C.red}15`,border:`1px solid ${C.red}44`,color:"#f87171",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>🗑 Clear Added</button>}
            </div>
            <div style={{padding:"9px 13px",background:addedW.length>0?`${C.green}10`:`${C.border}30`,borderRadius:8,border:`1px solid ${addedW.length>0?C.green+"33":C.border}`,fontSize:11,color:addedW.length>0?C.green:C.sub,marginBottom:12,display:"flex",alignItems:"center",gap:7}}>
              <span>{addedW.length>0?"💾":"📭"}</span><span>{addedW.length>0?`${addedW.length} added week${addedW.length>1?"s":""} saved to this device`:"No added weeks saved yet"}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[...allW].reverse().map((w,i)=>{
                const g=wg(w),isNew=!W.find(hw=>hw.week===w.week),lastW=W.length>0?W[W.length-1]:null,isLast=lastW?w.week===lastW.week&&!isNew:false;
                return(<div key={w.week+i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",background:C.bg,borderRadius:10,border:`1px solid ${isLast?C.accent+"55":isNew?C.a3+"55":C.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:11}}>
                    <div style={{width:9,height:9,borderRadius:"50%",background:isNew?C.a3:isLast?C.accent:g.c,boxShadow:`0 0 5px ${isNew?C.a3:isLast?C.accent:g.c}`}}/>
                    <div><div style={{fontSize:12,fontWeight:700,color:C.text,display:"flex",alignItems:"center",gap:7}}>{w.label}{isLast&&<Tag color={C.accent}>Latest</Tag>}{isNew&&<Tag color={C.a3}>Added</Tag>}</div><div style={{fontSize:10,color:C.sub,marginTop:2}}>{w.from}{w.to?` – ${w.to}`:""} · {w.moves.length} moves</div></div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{textAlign:"right"}}><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,color:C.green}}>${w.net.toLocaleString("en-US",{minimumFractionDigits:2})}</div><Tag color={g.c}>{g.i} {g.l}</Tag></div>
                    {!isNew&&<button onClick={()=>{setDlWk(w.week);setTimeout(()=>{generatePDF(w);setDlWk(null);},100);}} disabled={dlWk===w.week} style={{padding:"8px 12px",borderRadius:8,background:dlWk===w.week?C.raised:`${C.a3}18`,border:`1px solid ${C.a3}55`,color:dlWk===w.week?C.sub:C.a3,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{dlWk===w.week?"...":"⬇ PDF"}</button>}
                  </div>
                </div>);
              })}
            </div>
          </div>

          {/* DOC VAULT */}
          <div style={K({marginBottom:14})}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700}}>📋 Document Vault</div>
              <button onClick={()=>setShowDocForm(p=>!p)} style={{padding:"6px 12px",borderRadius:8,background:showDocForm?`${C.red}20`:`${C.accent}18`,border:`1px solid ${showDocForm?C.red:C.accent}55`,color:showDocForm?C.red:C.accent,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{showDocForm?"✕ Cancel":"+ Add Record"}</button>
            </div>
            <div style={{fontSize:10,color:C.sub,marginBottom:10}}>DOT maintenance logs · Inspection reports · Insurance · Registration · Compliance docs</div>
            {showDocForm&&(
              <div style={{background:C.bg,borderRadius:10,padding:"13px",border:`1px solid ${C.border}`,marginBottom:12}}>
                <div style={{padding:"9px 12px",background:`${C.a3}10`,borderRadius:8,border:`1px dashed ${C.a3}44`,marginBottom:10,textAlign:"center",cursor:"pointer"}} onClick={()=>docRef.current&&docRef.current.click()}>
                  <input ref={docRef} type="file" accept="image/*,.pdf" style={{display:"none"}} onChange={e=>{if(e.target.files[0])readDoc(e.target.files[0]);}}/>
                  <div style={{fontSize:12,color:"#a78bfa",fontWeight:600}}>{docScan?"⏳ Reading...":"📷 Scan Document — AI reads and categorizes"}</div>
                  {docScanMsg&&<div style={{fontSize:10,color:C.green,marginTop:4}}>{docScanMsg}</div>}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                  <div><div style={{fontSize:9,color:C.sub,marginBottom:3,textTransform:"uppercase",fontWeight:600}}>Date</div><input type="date" value={docForm.date} onChange={e=>setDocForm(p=>({...p,date:e.target.value}))} style={{width:"100%",padding:"8px 10px",background:C.raised,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,fontSize:12,boxSizing:"border-box",fontFamily:"inherit",outline:"none"}}/></div>
                  <div><div style={{fontSize:9,color:C.sub,marginBottom:3,textTransform:"uppercase",fontWeight:600}}>Title</div><input value={docForm.title} onChange={e=>setDocForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Annual DOT Inspection" style={{width:"100%",padding:"8px 10px",background:C.raised,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,fontSize:12,boxSizing:"border-box",fontFamily:"inherit",outline:"none"}}/></div>
                </div>
                <div style={{marginBottom:8}}><div style={{fontSize:9,color:C.sub,marginBottom:4,textTransform:"uppercase",fontWeight:600}}>Category</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{["Maintenance","Inspection","Insurance","Registration","Medical","Permit","Other"].map(cat=><button key={cat} onClick={()=>setDocForm(p=>({...p,category:cat}))} style={{padding:"4px 9px",borderRadius:5,background:docForm.category===cat?`${C.accent}22`:"transparent",border:`1px solid ${docForm.category===cat?C.accent:C.border}`,color:docForm.category===cat?C.accent:C.sub,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>{cat}</button>)}</div></div>
                <div style={{marginBottom:10}}><div style={{fontSize:9,color:C.sub,marginBottom:3,textTransform:"uppercase",fontWeight:600}}>Notes</div><input value={docForm.note} onChange={e=>setDocForm(p=>({...p,note:e.target.value}))} placeholder="e.g. Passed — next due 04/2027" style={{width:"100%",padding:"8px 10px",background:C.raised,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,fontSize:12,boxSizing:"border-box",fontFamily:"inherit",outline:"none"}}/></div>
                <button onClick={()=>{if(!docForm.title)return;setDocs(p=>[{id:Date.now(),date:docForm.date||new Date().toLocaleDateString(),category:docForm.category,title:docForm.title,note:docForm.note},...p]);setDocForm({date:"",category:"Maintenance",title:"",note:""});setDocScanMsg("");setShowDocForm(false);}} style={{width:"100%",padding:"9px",borderRadius:8,background:`linear-gradient(135deg,${C.accent},${C.a3})`,color:"#000",fontWeight:700,fontSize:12,border:"none",cursor:"pointer",fontFamily:"inherit"}}>💾 Save Record</button>
              </div>
            )}
            {docs.length>0?(
              <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:260,overflowY:"auto"}}>
                {docs.map(d=>(
                  <div key={d.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",background:C.bg,borderRadius:8,border:`1px solid ${C.border}`}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}><span style={{padding:"1px 6px",borderRadius:4,fontSize:9,fontWeight:700,background:`${C.accent}18`,color:C.accent}}>{d.category}</span><span style={{fontSize:9,color:C.sub}}>{d.date}</span></div>
                      <div style={{fontSize:12,color:C.text,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.title}</div>
                      {d.note&&<div style={{fontSize:10,color:C.sub}}>{d.note}</div>}
                    </div>
                    <button onClick={()=>setDocs(p=>p.filter(x=>x.id!==d.id))} style={{background:"none",border:"none",color:C.sub,fontSize:14,cursor:"pointer",padding:"0 4px",marginLeft:8,flexShrink:0}}>×</button>
                  </div>
                ))}
              </div>
            ):(
              <div style={{textAlign:"center",padding:"16px",color:C.sub,fontSize:11}}>No documents yet. Add DOT inspection records, maintenance logs, insurance, or compliance paperwork.</div>
            )}
          </div>

          {/* EXPORT */}
          <NoBadge/>
          <div style={K({marginBottom:80})}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,marginBottom:6}}>📤 Export Report</div>
            <div style={{fontSize:10,color:C.sub,marginBottom:12}}>YTD financials + expenses + documents. Print or email to your accountant, broker, or lender.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <button onClick={printReport} style={{padding:"14px",borderRadius:10,background:`${C.accent}18`,border:`1px solid ${C.accent}55`,color:"#00ffcc",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><span style={{fontSize:22}}>🖨️</span><span>Print Report</span><span style={{fontSize:9,fontWeight:400,color:C.sub}}>Opens print dialog</span></button>
              <button onClick={emailReport} style={{padding:"14px",borderRadius:10,background:`${C.a3}18`,border:`1px solid ${C.a3}55`,color:"#a78bfa",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><span style={{fontSize:22}}>📧</span><span>Email Report</span><span style={{fontSize:9,fontWeight:400,color:C.sub}}>Opens mail app</span></button>
            </div>
            <div style={{padding:"8px 12px",background:C.bg,borderRadius:8,border:`1px solid ${C.border}`,fontSize:10,color:C.sub}}>{allW.length} weeks · {expenses.length} expenses · {docs.length} documents</div>
          </div>
        </div>
      )}

      </div>

      {/* LEGAL FOOTER */}
      <div style={{background:C.bg,borderTop:"1px solid "+C.border,padding:"14px 16px"}}>
        <div style={{fontSize:9,color:C.sub,lineHeight:1.8,textAlign:"center",maxWidth:600,margin:"0 auto"}}>
          <div style={{fontWeight:700,color:C.sub,marginBottom:6,fontSize:10,letterSpacing:"0.05em",textTransform:"uppercase"}}>⚖️ Legal Disclaimer</div>
          <div style={{marginBottom:6}}><strong style={{color:C.sub}}>Not Financial or Legal Advice.</strong> ContractorIQ is an informational tool only. Nothing on this platform constitutes financial, legal, tax, or professional business advice. Always consult a qualified professional before making business decisions.</div>
          <div style={{marginBottom:6}}><strong style={{color:C.sub}}>Your Data Stays On Your Device.</strong> All settlement data is stored locally on your device only. ContractorIQ does not transmit, store, sell, or share your personal or financial data on any server.</div>
          <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid "+C.border,fontSize:8,color:C.border}}>© {new Date().getFullYear()} ContractorIQ · All Rights Reserved · getcontractoriq.com</div>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:200,background:C.surf,borderTop:"1px solid "+C.border,display:"flex",alignItems:"stretch",height:58,boxShadow:"0 -4px 20px rgba(0,0,0,0.4)"}}>
        {[{t:"dashboard",icon:"📊",label:"Dash"},{t:"loads",icon:"📋",label:"Analyzer"},{t:"ai",icon:"🧠",label:"AI"},{t:"growth",icon:"🚀",label:"Growth"}].map(item=>(
          <button key={item.t} onClick={()=>{setTab(item.t);window.scrollTo({top:0,behavior:"smooth"});}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:"6px 0",borderTop:"2px solid "+(tab===item.t?C.accent:"transparent"),transition:"border-color 0.15s"}}>
            <span style={{fontSize:18,lineHeight:1}}>{item.icon}</span>
            <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",color:tab===item.t?C.accent:C.sub}}>{item.label}</span>
          </button>
        ))}
      </div>
      <div style={{height:58}}/>
    </div>
  );
}
