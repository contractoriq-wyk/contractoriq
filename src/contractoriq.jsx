import React, { useState, useEffect, useRef } from 'react';

// Isolated error boundary — if ANYTHING inside FSC Calculator throws,
// this catches it and shows a small error box instead of crashing
// the entire Analyzer tab. This is the safety net previous attempts lacked.
class FSCErrorBoundary extends React.Component {
  constructor(props){
    super(props);
    this.state={hasError:false,errorMsg:""};
  }
  static getDerivedStateFromError(error){
    return {hasError:true,errorMsg:(error&&error.message)||"Unknown error"};
  }
  componentDidCatch(error,info){
    console.error("FSC Calculator crashed:",error,info);
  }
  render(){
    if(this.state.hasError){
      return (
        <div style={{padding:"14px",borderRadius:12,background:"#f8717118",border:"1px solid #f8717155",fontSize:11,color:"#f87171"}}>
          ⚠️ Fuel Surcharge Calculator hit an error and was safely disabled so the rest of the app keeps working.
          <div style={{fontSize:9,marginTop:6,opacity:0.8,fontFamily:"monospace"}}>{this.state.errorMsg}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ═══ APP-LEVEL ERROR BOUNDARY (audit fix #8) ═══
// Catches ANY render crash anywhere in the app (malformed cloud data, an
// unexpected null, a bad deploy) and shows a friendly recovery screen instead
// of the blank white page — the exact failure mode that once took down the
// Mama JJJ site. Data is untouched: a reload almost always recovers.
class AppErrorBoundary extends React.Component {
  constructor(props){
    super(props);
    this.state={hasError:false,errorMsg:""};
  }
  static getDerivedStateFromError(error){
    return {hasError:true,errorMsg:(error&&error.message)||"Unknown error"};
  }
  componentDidCatch(error,info){
    console.error("App crashed:",error,info);
  }
  render(){
    if(this.state.hasError){
      return (
        <div style={{minHeight:"100vh",background:"#0b0f1c",display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'IBM Plex Mono',monospace"}}>
          <div style={{maxWidth:400,textAlign:"center"}}>
            <div style={{fontSize:44,marginBottom:14}}>🔧</div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:19,fontWeight:800,color:"#f0f6ff",marginBottom:10}}>Something hiccupped</div>
            <div style={{fontSize:12,color:"#8fa3c0",lineHeight:1.7,marginBottom:18}}>Don't worry — your data is safe in the cloud. A quick reload usually fixes this.</div>
            <button onClick={function(){window.location.reload();}} style={{padding:"12px 28px",borderRadius:10,background:"linear-gradient(135deg,#00ffcc,#00d4aa)",border:"none",color:"#000",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>↻ Reload App</button>
            <div style={{fontSize:9,color:"#2c3a52",marginTop:16,fontFamily:"monospace",wordBreak:"break-all"}}>{this.state.errorMsg}</div>
            <div style={{fontSize:9,color:"#8fa3c0",marginTop:8}}>Still stuck? Email <a href="mailto:hello@getdrayageiq.com" style={{color:"#00ffcc"}}>hello@getdrayageiq.com</a></div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ═══ BRAND ASSETS (DrayageIQ) ═══
const LOGO_HERO="/images/logo-hero.png";
const LOGO_BANNER="/images/logo-banner.png";
const LOGO_ICON="/images/logo-icon.png";

// ═══ PRICING (swap these at launch — single source of truth) ═══
// App version — bump this with every meaningful release so customers can
// see the product is actively improving. Format: MAJOR.MINOR.PATCH
// Version scheme: MAJOR.MONTH.DAY — bump on EVERY file delivery so you can
// verify at a glance that the deployed site is running the file you just
// uploaded (check the version chip in the Menu or the legal footer).
const APP_VERSION="3.7.16";// bumped builds same-day get a new time stamp below
const APP_VERSION_DATE="Jul 16 · build K";

const PRICING={
  // Tier 1 — Standard ($14.99/mo)
  tier1Url:"https://buy.stripe.com/14A9ATbW1aIU2M2gKq9MY03",
  tier1Price:"$14.99",
  tier1Note:"Unlimited scans · Load tracking · AI guidance",
  // Tier 2 — Pro Smart ($24.99/mo)
  tier2Url:"https://buy.stripe.com/fZu5kDe498AM2M2am29MY04",
  tier2Price:"$24.99",
  tier2Note:"Live diesel · Live weather · Smart AI · Your real numbers",
  // Tier 2 — Annual ($249/yr)
  annualUrl:"https://buy.stripe.com/7sY3cvd05dV6fyOcua9MY05",
  annualPrice:"$249",
  annualNote:"Save $51 · 2 months free · Everything in Pro Smart",
  // Fleet Pro Smart ($39.99/mo, up to 5 trucks)
  fleetUrl:"https://buy.stripe.com/9B64gz4tz5oA4Ua1Pw9MY06",
  fleetPrice:"$39.99",
  fleetNote:"Everything in Pro Smart · Up to 5 trucks · One flat rate",
  // Growing Fleet ($89/mo, 6-10 trucks)
  growingFleetUrl:"https://buy.stripe.com/6oU4gz8JP3gs2M279Q9MY07",
  growingFleetPrice:"$89",
  growingFleetNote:"Everything in Fleet Pro Smart · 6-10 trucks · Advanced analytics & phone support",
  // Legacy (kept for reference)
  trialUrl:"https://buy.stripe.com/aFa8wP7FLbMY4Ua0Ls9MY00",
  trialPrice:"$1",
};

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

// Fully self-contained FSC Calculator component — owns its own state,
// takes only primitive values as props (no shared app state references
// that could behave unexpectedly), wrapped in an error boundary above.
function FuelSurchargeCalculator(props){
  const dieselPrice=props.dieselPrice;
  const mpg=props.mpg;
  const styles=props.styles;
  const showShareFeature=props.showShareFeature;// V4 growth feature — dev-only until approved for release
  const [rate,setRate]=useState("");
  const [miles,setMiles]=useState("");
  const [shareImgUrl,setShareImgUrl]=useState(null);
  // Baseline diesel price is now ADJUSTABLE, not hardcoded, and SHARED with
  // the True FSC audit column (Full History table) via props — so setting
  // it once here keeps everything consistent app-wide. Different carriers
  // use different baselines in their own FSC formulas (confirmed by comparing
  // against a real carrier's published FSC table, which used a materially
  // different methodology than a fixed $2.50 assumption).
  const baselinePrice=String(props.sharedBaseline);
  const setBaselinePrice=function(v){props.setSharedBaseline(parseFloat(v)||0);};
  // Reverse-check: enter what the vendor ACTUALLY paid in FSC dollars, and
  // instantly see the equivalent percentage — answers "vendor paid $51.19
  // FSC on a $195/77mi run, what % is that?" without any manual math.
  const [vendorFscPaid,setVendorFscPaid]=useState("");
  // +/- stepper helper — nudges any numeric field up/down by a fixed amount,
  // building the value as a string so the input stays fully editable too.
  function stepValue(currentStr,delta,decimals,min){
    const current=parseFloat(currentStr)||0;
    const next=Math.max(min!==undefined?min:0,current+delta);
    return next.toFixed(decimals);
  }

  const rateNum=parseFloat(rate);
  const milesNum=parseFloat(miles);
  const baselineNum=parseFloat(baselinePrice);
  const validInput=!isNaN(rateNum)&&!isNaN(milesNum)&&milesNum>0&&rateNum>0&&!isNaN(baselineNum)&&baselineNum>=0;
  let ratePerMile=0;
  let fscPct=0;
  let fscDollar=0;
  if(validInput){
    ratePerMile=rateNum/milesNum;
    const extraCostPerMile=Math.max(0,(dieselPrice-baselineNum)/mpg);
    fscPct=(extraCostPerMile/ratePerMile)*100;
    fscDollar=extraCostPerMile*milesNum;// the actual $ to add to the quote, not just the %
  }

  // Reverse-check: given what the vendor ACTUALLY paid in FSC dollars,
  // what percentage of the linehaul rate does that represent? This answers
  // "vendor paid $51.19 FSC on a $195 rate — what % is that?" instantly.
  const vendorFscPaidNum=parseFloat(vendorFscPaid);
  const vendorCheckValid=validInput&&!isNaN(vendorFscPaidNum)&&vendorFscPaidNum>=0;
  let vendorFscPct=0;
  if(vendorCheckValid){
    vendorFscPct=(vendorFscPaidNum/rateNum)*100;
  }

  return (
    <div style={styles.card}>
      <div style={styles.title}>⛽ Fuel Surcharge Calculator</div>
      <div style={styles.subtitle}>Know exactly what FSC% to quote a client — calculated from today's live diesel price and your real truck MPG.</div>
      <div style={styles.grid}>
        <div>
          <div style={styles.label}>LINEHAUL RATE ($)</div>
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            <button type="button" onClick={function(){setRate(stepValue(rate,-5,2,0));}} style={styles.stepBtn}>−</button>
            <input
              type="text"
              inputMode="decimal"
              value={rate}
              onChange={function(e){setRate(e.target.value);}}
              placeholder="e.g. 250"
              style={{...styles.input,textAlign:"center"}}
            />
            <button type="button" onClick={function(){setRate(stepValue(rate,5,2,0));}} style={styles.stepBtn}>+</button>
          </div>
        </div>
        <div>
          <div style={styles.label}>MILES</div>
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            <button type="button" onClick={function(){setMiles(stepValue(miles,-1,0,0));}} style={styles.stepBtn}>−</button>
            <input
              type="text"
              inputMode="decimal"
              value={miles}
              onChange={function(e){setMiles(e.target.value);}}
              placeholder="e.g. 50"
              style={{...styles.input,textAlign:"center"}}
            />
            <button type="button" onClick={function(){setMiles(stepValue(miles,1,0,0));}} style={styles.stepBtn}>+</button>
          </div>
        </div>
      </div>
      
      <div style={{marginBottom:10,padding:"10px 12px",borderRadius:9,background:"rgba(167,139,250,0.06)",border:"1px solid rgba(167,139,250,0.25)"}}>
        <div style={{...styles.label,color:"#a78bfa"}}>🔎 CHECK A VENDOR'S FSC — What % Did They Actually Pay?</div>
        <div style={{display:"flex",gap:4,alignItems:"center",marginTop:4}}>
          <button type="button" onClick={function(){setVendorFscPaid(stepValue(vendorFscPaid,-1,2,0));}} style={styles.stepBtn}>−</button>
          <input
            type="text"
            inputMode="decimal"
            value={vendorFscPaid}
            onChange={function(e){setVendorFscPaid(e.target.value);}}
            placeholder="e.g. 51.19"
            style={{...styles.input,textAlign:"center"}}
          />
          <button type="button" onClick={function(){setVendorFscPaid(stepValue(vendorFscPaid,1,2,0));}} style={styles.stepBtn}>+</button>
        </div>
        {vendorCheckValid&&(
          <div style={{marginTop:8,textAlign:"center"}}>
            <span style={{fontSize:9,color:"#8fa3c0"}}>Vendor's FSC = </span>
            <span style={{fontSize:16,fontWeight:800,color:"#a78bfa"}}>{vendorFscPct.toFixed(1)}%</span>
            <span style={{fontSize:9,color:"#8fa3c0"}}> of your rate</span>
          </div>
        )}
      </div>
      <div style={styles.resultBox}>
        <div style={styles.resultRow}>
          <span>Live diesel: ${dieselPrice.toFixed(2)}/gal</span>
          <span>Your MPG: {mpg.toFixed(1)}</span>
        </div>
        <div style={styles.rateLine}>Rate per mile: {validInput?ratePerMile.toFixed(2):"—"}</div>
        <div style={styles.fscLine}>Recommended FSC: {validInput?fscPct.toFixed(1):"0.0"}% <span style={styles.fscDollarStyle}>(${validInput?fscDollar.toFixed(2):"0.00"})</span></div>
        {validInput&&<div style={styles.totalLine}>Quote total: ${rateNum.toFixed(2)} + ${fscDollar.toFixed(2)} FSC = <span style={{fontWeight:800,color:"#e5ecf5"}}>${(rateNum+fscDollar).toFixed(2)}</span></div>}
      </div>
      <div style={styles.footnote}>💡 Uses live diesel, your real MPG, and YOUR baseline from Menu → ⚙️ My Numbers — an independent benchmark; your carrier's own FSC table may use a different formula and won't always match exactly.</div>
      {validInput&&(
        <div style={{marginTop:12,paddingTop:12,borderTop:"1px dashed "+ (styles.shareBorder||"#333")}}>
          {!showShareFeature&&(
            <div style={{fontSize:9,color:"#fbbf24",fontWeight:700,marginBottom:8,textAlign:"center"}}>🔒 Coming Soon — Share Your Result</div>
          )}
          <button
            disabled={!showShareFeature}
            onClick={function(){
              if(!showShareFeature)return;
              const canvas=document.createElement("canvas");
              canvas.width=1080;canvas.height=1200;
              const ctx=canvas.getContext("2d");
              const logoImg=new window.Image();
              logoImg.onload=function(){
                // Background
                const grad=ctx.createLinearGradient(0,0,1080,1200);
                grad.addColorStop(0,"#080c16");grad.addColorStop(1,"#111827");
                ctx.fillStyle=grad;ctx.fillRect(0,0,1080,1200);
                ctx.textAlign="center";
                // Real logo image at top, sized proportionally
                const logoW=520;
                const logoH=logoW*(logoImg.height/logoImg.width);
                ctx.drawImage(logoImg,540-logoW/2,50,logoW,logoH);
                // Slogan right under the logo
                ctx.fillStyle="#a78bfa";ctx.font="bold 30px sans-serif";
                ctx.fillText("Settlement analysis made effortless",540,logoH+95);
                // Big FSC number
                ctx.fillStyle="#4ade80";ctx.font="bold 140px sans-serif";
                ctx.fillText(fscPct.toFixed(1)+"%",540,logoH+280);
                ctx.fillStyle="#e5ecf5";ctx.font="bold 60px sans-serif";
                ctx.fillText("$"+fscDollar.toFixed(2)+" FSC",540,logoH+360);
                // Details
                ctx.fillStyle="#8fa3c0";ctx.font="32px sans-serif";
                ctx.fillText("Rate: $"+rateNum.toFixed(2)+" · "+milesNum+" miles",540,logoH+470);
                ctx.fillText("Live diesel: $"+dieselPrice.toFixed(2)+"/gal · "+mpg.toFixed(1)+" MPG",540,logoH+520);
                // Website banner — bold, high-contrast, unmissable even if cropped/screenshotted
                const bannerY=logoH+600;
                ctx.fillStyle="rgba(251,191,36,0.12)";
                ctx.fillRect(0,bannerY,1080,140);
                ctx.strokeStyle="#fbbf24";ctx.lineWidth=2;
                ctx.strokeRect(0,bannerY,1080,140);
                ctx.fillStyle="#8fa3c0";ctx.font="26px sans-serif";
                ctx.fillText("Know your numbers at",540,bannerY+50);
                ctx.fillStyle="#fbbf24";ctx.font="bold 52px sans-serif";
                ctx.fillText("getdrayageiq.com",540,bannerY+112);
                setShareImgUrl(canvas.toDataURL("image/png"));
              };
              logoImg.src=LOGO_HERO;
            }}
            style={{width:"100%",padding:"10px",borderRadius:8,background:showShareFeature?"linear-gradient(135deg,#fbbf24,#f59e0b)":"#1f2937",border:showShareFeature?"none":"1px solid #333",color:showShareFeature?"#000":"#6a7a8f",fontSize:11,fontWeight:800,cursor:showShareFeature?"pointer":"not-allowed",fontFamily:"inherit"}}
          >{showShareFeature?"📸 Generate Shareable Result":"🔒 Generate Shareable Result"}</button>
          {shareImgUrl&&showShareFeature&&(
            <div style={{marginTop:10,textAlign:"center"}}>
              <img src={shareImgUrl} alt="Shareable FSC result card" style={{width:"100%",borderRadius:10,marginBottom:8}}/>
              <a href={shareImgUrl} download="drayageiq-fsc-result.png" style={{display:"inline-block",padding:"8px 16px",borderRadius:8,background:"#4ade8022",border:"1px solid #4ade8055",color:"#4ade80",fontSize:10,fontWeight:700,textDecoration:"none"}}>⬇️ Download to Share</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// Builds a CSV export of Return on Spend + True FSC data for every move.
// Pro Smart feature — lets a driver hand real numbers to a broker or lawyer
// during a rate negotiation, or keep records for their own accounting.
function csvCell(v){
  // Spreadsheet-safe cell: quote-wrap, double internal quotes, and neutralize
  // formula injection (a value starting with = + - @ would execute in Excel).
  let s=String(v==null?"":v);
  if(/^[=+\-@]/.test(s))s="'"+s;
  return '"'+s.replace(/"/g,'""')+'"';
}
function buildFSCReportCSV(allMoves,scoreMoveFn,liveDieselPrice,baselineMPG,fscBaseline){
  const headers=["Week","Date","Customer","Vendor","Type","Route","Miles","Rate","FSC Paid","True FSC ($)","True FSC (%)","FSC Gap ($)","Total","RPM","Grade"];
  const rows=[headers.join(",")];
  allMoves.forEach(function(m){
    const s=scoreMoveFn(m);
    let trueFscDollar=0,trueFscPct=0,fscGap=0;
    if(m.miles>0&&m.rate>0){
      const rpmCheck=m.rate/m.miles;
      const baselinePriceCheck=(typeof fscBaseline==="number"&&fscBaseline>=0)?fscBaseline:2.50;// uses the user's adjustable baseline, same as the in-app True FSC column
      const extraCostCheck=Math.max(0,(liveDieselPrice-baselinePriceCheck)/baselineMPG);
      trueFscPct=(extraCostCheck/rpmCheck)*100;
      trueFscDollar=extraCostCheck*m.miles;
      fscGap=m.fsc-trueFscDollar;
    }
    const route=(m.from||"")+" to "+(m.to||"");
    const row=[
      csvCell("W"+m.wk),
      csvCell(m.dt||""),
      csvCell(m.customer||""),
      csvCell(m.vendor||""),
      m.isRoundTrip?"RT":m.type,
      csvCell(route),
      m.miles,
      m.rate.toFixed(2),
      m.fsc.toFixed(2),
      trueFscDollar.toFixed(2),
      trueFscPct.toFixed(1),
      fscGap.toFixed(2),
      (m.rate+m.fsc).toFixed(2),
      s.rpm,
      s.grade
    ];
    rows.push(row.join(","));
  });
  return rows.join("\n");
}

function scoreMove(m){
  const miles=m.miles||m.mi||0,rate=m.rate||m.rt||0,fsc=m.fsc||m.fc||0,type=m.type||m.t||"L";
  const rpm=miles>0?(rate+fsc)/miles:0;
  const isRoundTrip=type==="RT"||m.isRoundTrip===true,isEmpty=type==="E"&&!isRoundTrip,isFlatRate=!isRoundTrip&&fsc===0&&rate>=100,hasFSC=fsc>0,isDropHook=isFlatRate&&miles<=30;
  let s=0,tags=[];
  // RPM is the dominant factor for EVERY move type — a paid empty at the same rate as
  // a loaded move is NOT worse. Less wear, less fuel burn, less cargo risk, often faster
  // turnaround. The scoring model no longer penalizes "Empty" as a label — it rewards
  // actual pay-per-mile, which is what determines whether a move is good for the business.
  if(rpm>=3.5){s+=45;tags.push("💰 Premium RPM");}else if(rpm>=2.5){s+=32;tags.push("✅ Good RPM");}else if(rpm>=2.0){s+=20;tags.push("📊 Fair RPM");}else if(rpm>=1.8){s+=10;tags.push("⚠️ Low RPM");}else tags.push("🚫 Below Cost");
  if(isRoundTrip){s+=20;tags.push("🔄 Round Trip");}
  else if(isEmpty){s+=15;tags.push("🔁 Paid Empty — less wear & fuel");}
  else{s+=15;tags.push("📦 Loaded");}
  if(hasFSC){s+=15;tags.push("⛽ FSC Included");}else if(isRoundTrip||isFlatRate){s+=15;tags.push("💵 Flat Rate All-In");}
  if(isDropHook){s+=10;tags.push("🪝 Drop & Hook");}else if(miles>=70&&miles<=100){s+=10;tags.push("📍 Sweet Spot");}else if(miles>100){s+=5;tags.push("🛣️ Long Haul");}
  return{score:s,grade:s>=70?"A":s>=50?"B":s>=30?"C":"D",rpm:rpm.toFixed(2),tags,isRoundTrip,isFlatRate,isDropHook,hasFSC,isEmpty};
}

async function ai(msgs,sys){
  try{
            const r=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:1500,system:sys||"You are a helpful trucking business advisor.",messages:msgs})});
    if(!r.ok){const e=await r.text();return "⚠️ API Error "+r.status+": "+e.slice(0,100);}
    const d=await r.json();
    if(d.error)return "⚠️ "+d.error.message;
    const txt=d.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"";
    return txt||"I received your message but had no response. Please try again.";
  }catch(err){return "⚠️ Connection error: "+err.message;}
}

function copyText(t){if(navigator.clipboard?.writeText)navigator.clipboard.writeText(t).catch(()=>fbCopy(t));else fbCopy(t);}
function fbCopy(t){const e=document.createElement("textarea");e.value=t;e.style.cssText="position:fixed;opacity:0";document.body.appendChild(e);e.focus();e.select();document.execCommand("copy");document.body.removeChild(e);}

const W=[];// Hardcoded baseline removed — all real data now comes from Supabase (addedW)

const DEMO_W=[
  {vendor:"JDT",week:"01",label:"Week 01",from:"01/06/2025",to:"01/10/2025",gross:4200.00,net:2310.00,totalDeductions:1890.00,rebate:45.00,gallons:280.00,deds:[{l:"Operations Fee",a:840.00},{l:"Fuel Advance",a:750.00},{l:"Insurance",a:200.00},{l:"Escrow",a:100.00}],moves:[{mi:62,rt:210,fc:45,t:"L"},{mi:58,rt:195,fc:42,t:"L"},{mi:71,rt:230,fc:48,t:"L"},{mi:45,rt:150,fc:38,t:"E"},{mi:68,rt:220,fc:46,t:"L"}]},
  {vendor:"JDT",week:"02",label:"Week 02",from:"01/13/2025",to:"01/17/2025",gross:4850.00,net:2667.50,totalDeductions:2182.50,rebate:52.00,gallons:310.00,deds:[{l:"Operations Fee",a:970.00},{l:"Fuel Advance",a:890.00},{l:"Insurance",a:200.00},{l:"Escrow",a:122.50}],moves:[{mi:65,rt:225,fc:47,t:"L"},{mi:72,rt:240,fc:50,t:"L"},{mi:55,rt:185,fc:40,t:"L"},{mi:68,rt:220,fc:46,t:"L"},{mi:48,rt:160,fc:39,t:"E"}]},
  {vendor:"JDT",week:"03",label:"Week 03",from:"01/20/2025",to:"01/24/2025",gross:3900.00,net:2145.00,totalDeductions:1755.00,rebate:38.00,gallons:265.00,deds:[{l:"Operations Fee",a:780.00},{l:"Fuel Advance",a:720.00},{l:"Insurance",a:200.00},{l:"Escrow",a:55.00}],moves:[{mi:58,rt:190,fc:41,t:"L"},{mi:62,rt:205,fc:44,t:"L"},{mi:70,rt:228,fc:47,t:"L"},{mi:52,rt:172,fc:38,t:"E"}]},
];

const VENDORS={
  JDT:{name:"Demo Driver Co",short:"DEMO",icon:"🚛",color:"#00ffcc",unit:""},
  CPG:{name:"ContainerPort Group",short:"CPG",icon:"⚓",color:"#00ffcc",unit:""},
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

  // Parse a date string like "06/23/26" into a comparable day number.
  // Returns null if unparseable so date-distance falls back safely.
  function parseDay(dt){
    if(!dt)return null;
    const parts=String(dt).split("/");
    if(parts.length<3)return null;
    const mo=parseInt(parts[0],10),da=parseInt(parts[1],10),yr=parseInt(parts[2],10);
    if(isNaN(mo)||isNaN(da)||isNaN(yr))return null;
    // Days since an arbitrary epoch — good enough for relative distance
    return (yr*372)+(mo*31)+da;// approximate day index, fine for same-week comparisons
  }

  // Round trip = two moves on the SAME route reversed (A→B paired with B→A).
  // When multiple candidates exist on the same corridor, prefer the one closest
  // in date (same day first, then nearest), since a round trip can span into
  // the next day but should still be the nearest match, not a random one.
  moves.forEach((m,i)=>{
    if(used.has(i))return;
    const fr=m.fr||m.from||"",to=m.to||"",t=m.t||m.type||"L",myDay=parseDay(m.dt);
    if(!fr||!to){result.push(m);return;}

    let bestIdx=-1,bestDist=Infinity;
    moves.forEach((m2,j)=>{
      if(used.has(j)||j===i)return;
      const fr2=m2.fr||m2.from||"",to2=m2.to||"",t2=m2.t||m2.type||"L";
      // Must be the exact reversed route and opposite load status (one E, one L)
      if(fr===to2&&to===fr2&&t!==t2){
        const day2=parseDay(m2.dt);
        const dist=(myDay!=null&&day2!=null)?Math.abs(myDay-day2):999;// unknown dates = low priority but still eligible
        if(dist<bestDist){bestDist=dist;bestIdx=j;}
      }
    });

    if(bestIdx!==-1){
      const m2=moves[bestIdx],emptyLeg=t==="E"?m:m2,loadedLeg=t==="L"?m:m2;
      const totalMi=(emptyLeg.mi||emptyLeg.miles||0)+(loadedLeg.mi||loadedLeg.miles||0);
      const totalPay=(emptyLeg.rt||emptyLeg.rate||0)+(loadedLeg.rt||loadedLeg.rate||0);
      const totalFsc=(emptyLeg.fc||emptyLeg.fsc||0)+(loadedLeg.fc||loadedLeg.fsc||0);
      result.push({
        t:"RT",type:"RT",
        fr:loadedLeg.fr||loadedLeg.from||"",
        to:loadedLeg.to||"",
        mi:totalMi,miles:totalMi,
        rt:totalPay,rate:totalPay,
        fc:totalFsc,fsc:totalFsc,
        extraPay:0,isRoundTrip:true,
        dt:loadedLeg.dt||emptyLeg.dt||"",// keep the ship date — without this, round trips vanished from date-based analytics and Hot Days undercounted badly
        cust:loadedLeg.cust||emptyLeg.cust||"",
        emptyPay:emptyLeg.rt||emptyLeg.rate||0,
        loadedPay:loadedLeg.rt||loadedLeg.rate||0,
        emptyMi:emptyLeg.mi||emptyLeg.miles||0,
        loadedMi:loadedLeg.mi||loadedLeg.miles||0,
        legCount:2
      });
      used.add(i);used.add(bestIdx);
    } else {
      result.push(m);
    }
  });

  return result;
}

function grpDeds(deds,gross){
  // FUEL: any deduction labeled "FUEL ADVANCE" or containing "fuel"/"diesel" (not escrow/rebate)
  const fuel=deds.filter(d=>d&&d.l&&["fuel advance","fuel","diesel"].some(k=>d.l.toLowerCase().includes(k))&&!d.l.toLowerCase().includes("escrow")&&!d.l.toLowerCase().includes("rebate")).reduce((s,d)=>s+d.a,0);
  // INSURANCE: physical damage, bobtail, occ/acc, occacc, roadside, liability
  const ins=deds.filter(d=>d&&d.l&&["physical damage","bobtail","occ/acc","occacc","roadside","liability limiter"].some(k=>d.l.toLowerCase().includes(k))).reduce((s,d)=>s+d.a,0);
  // OPERATIONS: eld, event recorder, parking, license, highway tax, fuel highway
  const ops=deds.filter(d=>d&&d.l&&["eld","event recorder","parking","license","highway tax","fuel-highway"].some(k=>d.l.toLowerCase().includes(k))).reduce((s,d)=>s+d.a,0);
  // ESCROW: regular and 2290
  const escrowDeds=deds.filter(d=>d&&d.l&&d.l.toLowerCase().includes("escrow")).reduce((s,d)=>s+d.a,0);
  // FUEL ADVANCE details for tooltip/breakdown
  const fuelAdvances=deds.filter(d=>d&&d.l&&d.l.toLowerCase().includes("fuel advance"));
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

// ═══ SUPABASE (cloud login + sync) ═══
const SUPABASE_URL="https://idlcghudcpisyoyokmbb.supabase.co";
const SUPABASE_ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkbGNnaHVkY3Bpc3lveW9rbWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMjUzMzksImV4cCI6MjA5NDYwMTMzOX0.S3O3d8UrgNk5f3GbzqbTloHpQv0FuFKeQJOeIwu8HKA";
let _sb=null;
function getSB(){ if(!_sb && typeof window!=="undefined" && window.supabase){ _sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON); } return _sb; }


// ═══ DESKTOP TICKER — Pure CSS marquee with live prices from /api/ticker ═══
function TVTickerTape({symbols}){
  return(
    <div style={{flex:1,overflow:"hidden",position:"relative",display:"flex",alignItems:"center",background:"#070b15",height:46,minWidth:0}}>
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:24,background:"linear-gradient(to right,#070b15,transparent)",zIndex:3,pointerEvents:"none"}}/>
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:24,background:"linear-gradient(to left,#070b15,transparent)",zIndex:3,pointerEvents:"none"}}/>
      <iframe
        key={symbols.map(s=>s.proName).join(",")}
        src={"https://s.tradingview.com/embed-widget/ticker-tape/?locale=en#"+encodeURIComponent(JSON.stringify({
          symbols:symbols,
          showSymbolLogo:true,
          colorTheme:"dark",
          isTransparent:true,
          displayMode:"regular",
          locale:"en"
        }))}
        style={{width:"100%",height:46,border:"none",display:"block"}}
        title="Live Market Ticker"
        loading="lazy"
      />
    </div>
  );
}


export default function ContractorIQv26(){
  return (<AppErrorBoundary><ContractorIQInner/></AppErrorBoundary>);
}
function ContractorIQInner(){

  if(typeof document!=='undefined'&&!document.getElementById('ciq-elite-css')){
    const s=document.createElement('style');s.id='ciq-elite-css';
    s.textContent=`
      @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
      @keyframes rotate-radial{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
      @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
      @keyframes fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      @keyframes ticker-scroll{0%{transform:translateX(0)}100%{transform:translateX(-33.333%)}}
      .stat-grad{background:linear-gradient(135deg,#00ffcc,#a5f3fc,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;background-size:200% auto;animation:shimmer 3s linear infinite}
      .shimmer-vendor{background:linear-gradient(-45deg,#0d1525,#1a2436,#0a0e1a,#162033);background-size:400% 400%;animation:rotate-radial 8s ease infinite}
      .tab-active-glow{box-shadow:0 0 14px rgba(0,255,204,0.5)!important}
    `;
    document.head.appendChild(s);
  }

  const [tab,setTab]=useState("dashboard");
  const TAB_ORDER=["dashboard","loads","ai","growth","office"];
  const swipeStartRef=useRef(null);
  function handleSwipeStart(e){
    if(e.touches&&e.touches.length===1){
      swipeStartRef.current={x:e.touches[0].clientX,y:e.touches[0].clientY,time:Date.now()};
    }else{
      swipeStartRef.current=null;// ignore multi-touch (pinch-zoom) so it never gets mistaken for a swipe
    }
  }
  function handleSwipeEnd(e){
    if(!swipeStartRef.current)return;
    const start=swipeStartRef.current;
    swipeStartRef.current=null;
    if(!e.changedTouches||e.changedTouches.length!==1)return;
    const dx=e.changedTouches[0].clientX-start.x;
    const dy=e.changedTouches[0].clientY-start.y;
    const elapsed=Date.now()-start.time;
    // Require a deliberate, fast, mostly-horizontal gesture — this avoids
    // accidentally triggering during normal vertical scrolling or slow drags.
    const isHorizontal=Math.abs(dx)>Math.abs(dy)*1.5;
    const isFarEnough=Math.abs(dx)>70;
    const isFastEnough=elapsed<600;
    if(!isHorizontal||!isFarEnough||!isFastEnough)return;
    const currentIndex=TAB_ORDER.indexOf(tab);
    if(currentIndex===-1)return;
    if(dx<0&&currentIndex<TAB_ORDER.length-1){
      setTab(TAB_ORDER[currentIndex+1]);// swipe left → next tab
    }else if(dx>0&&currentIndex>0){
      setTab(TAB_ORDER[currentIndex-1]);// swipe right → previous tab
    }
  }
  const [sD,setSD]=useState(0);// safe fallback; real default-to-latest-week logic runs once allW loads (see below)
  const [sM,setSM]=useState(0);
  const [sH,setSH]=useState(0);
  const [sR,setSR]=useState(7);
  const [wide,setWide]=useState(()=>typeof window==="undefined"?false:window.innerWidth>700);
  const [darkMode,setDarkMode]=useState(()=>{try{const s=localStorage.getItem("ciq_theme");return s?s==="dark":true;}catch{return true;}});
  const C=darkMode?DARK:LIGHT;
  const K=_K(C);
  const toggleCard=(id)=>setCollapsedCards(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
  const isCollapsed=(id)=>collapsedCards.has(id);
  useEffect(()=>{document.body.style.background=C.bg;document.body.style.color=C.text;},[darkMode]);
  useEffect(()=>{
    const vp=document.querySelector("meta[name=viewport]");
    if(vp)vp.content="width=device-width, initial-scale=1.0, minimum-scale=0.5, maximum-scale=5.0, user-scalable=yes";
  },[]);
  const [searchQ,setSearchQ]=useState("");
  const [searchResult,setSearchResult]=useState("");
  const [searchLoading,setSearchLoading]=useState(false);
  useEffect(()=>{try{const key="ciq_visits",visits=JSON.parse(localStorage.getItem(key)||"[]");visits.push({t:Date.now(),ua:navigator.userAgent.slice(0,60),ref:document.referrer.slice(0,80)||"direct"});if(visits.length>100)visits.splice(0,visits.length-100);localStorage.setItem(key,JSON.stringify(visits));}catch(e){}},[]);
  const [offer,setOffer]=useState({miles:"",rate:"",fsc:"",type:"L"});
  const [combineEmpty,setCombineEmpty]=useState(false);// lets you score a Loaded leg + its paired Empty leg as one Round Trip
  const [emptyLeg,setEmptyLeg]=useState({miles:"",rate:"",fsc:""});
  const [offerRes,setOfferRes]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [newMove,setNewMove]=useState({type:"L",from:"",to:"",miles:"",rate:"",fsc:""});
  const [extra,setExtra]=useState([]);
  const [scanning,setScanning]=useState(false);
  const [scanQueue,setScanQueue]=useState([]);// {file, fileType, status, result, error}
  const [scanQueueActive,setScanQueueActive]=useState(false);
  const [scanQueueLog,setScanQueueLog]=useState([]);// summary of completed scans
  const [scanResult,setScanResult]=useState(null);
  const [scanMsg,setScanMsg]=useState("");
  const [scanForm,setScanForm]=useState({week:"",from:"",to:"",gross:"",net:"",deds:"",moves:""});
  const [vendorPick,setVendorPick]=useState("CPG");
  const [fuelMPG,setFuelMPG]=useState(5.2);
  // Shared FSC baseline diesel price — adjustable, since every carrier sets
  // their own baseline in their contract (confirmed against a real carrier's
  // published FSC table, which used a materially different methodology than
  // a fixed $2.50 assumption). Persisted so it's remembered across sessions.
  const [fscBaselinePrice,setFscBaselinePrice]=useState(()=>{try{const s=localStorage.getItem("ciq_fsc_baseline");return s?parseFloat(s):2.50;}catch{return 2.50;}});
  useEffect(()=>{try{localStorage.setItem("ciq_fsc_baseline",String(fscBaselinePrice));}catch(e){}},[fscBaselinePrice]);
  const [fuelPrice,setFuelPrice]=useState(6.22);
  const [mpgAutoSync,setMpgAutoSync]=useState(()=>{try{return localStorage.getItem("ciq_mpg_auto")!=="false";}catch{return true;}});
  useEffect(()=>{try{localStorage.setItem("ciq_mpg_auto",String(mpgAutoSync));}catch(e){}},[mpgAutoSync]);
  const [priceAutoSync,setPriceAutoSync]=useState(()=>{try{return localStorage.getItem("ciq_price_auto")!=="false";}catch{return true;}});
  const [fscLinehaul,setFscLinehaul]=useState({rate:"",miles:""});
  useEffect(()=>{try{localStorage.setItem("ciq_price_auto",String(priceAutoSync));}catch(e){}},[priceAutoSync]);
  const [milesBuffer,setMilesBuffer]=useState(5);
  const [focusMode,setFocusMode]=useState(false);
  const [hotDaysRange,setHotDaysRange]=useState("all");// "4w" | "12w" | "all"
  const [routesRange,setRoutesRange]=useState("all");// Best Routes card filter
  const [showSettings,setShowSettings]=useState(false);
  const [showDigestModal,setShowDigestModal]=useState(false);
  const [showMyNumbers,setShowMyNumbers]=useState(false);// user-owned operating numbers — no app-imposed baselines
  const [showRoadmap,setShowRoadmap]=useState(false);
  const [showReferrals,setShowReferrals]=useState(false);
  const [showDevSignIn,setShowDevSignIn]=useState(false);// dev-mode only — lets you check your REAL account from the testing site
  const [referralCopied,setReferralCopied]=useState(false);
  const [showMenu,setShowMenu]=useState(false);
  const [showAbout,setShowAbout]=useState(false);
  const [showInsurance,setShowInsurance]=useState(false);
  const [showQR,setShowQR]=useState(false);
  const [showMarket,setShowMarket]=useState(false);
  const [showReviews,setShowReviews]=useState(false);
  const [showIconKey,setShowIconKey]=useState(false);
  const [showFleet,setShowFleet]=useState(false);
  const [reviews,setReviews]=useState([]);
  const [reviewsLoading,setReviewsLoading]=useState(true);
  useEffect(()=>{
    // Fetch shared reviews from Supabase — visible to all users
    (async()=>{
      try{
        const c=getSB();
        if(!c){setReviewsLoading(false);return;}
        const {data,error}=await c.from("public_reviews").select("*").order("created_at",{ascending:false});
        if(!error&&data){
          setReviews(data.map(r=>({name:r.name,role:r.role,stars:r.stars,text:r.text,date:new Date(r.created_at).toLocaleDateString("en-US",{month:"short",year:"numeric"})})));
        }
      }catch(e){}
      setReviewsLoading(false);
    })();
  },[]);
  const [reviewForm,setReviewForm]=useState({name:"",role:"",stars:5,text:""});
  const [addingReview,setAddingReview]=useState(false);
  const [hiddenVendors,setHiddenVendors]=useState([]);
  const [hideOwnerName,setHideOwnerName]=useState(false);
  const [hideUnitNum,setHideUnitNum]=useState(false);
  const [hideEmail,setHideEmail]=useState(false);// "Presenter Mode" — for live demos/screen shares
  const [activeOnlyVendor,setActiveOnlyVendor]=useState(null);
  const [helpCard,setHelpCard]=useState(null);
  const [collapsedCards,setCollapsedCards]=useState(new Set());
  const [showOnboarding,setShowOnboarding]=useState(false);
  const [onboardStep,setOnboardStep]=useState(0);
  const [onboardPath,setOnboardPath]=useState(null);// null = path picker showing; "standard"|"smart"|"fleet" once chosen
  const [ownerNotes,setOwnerNotes]=useState(()=>{try{const s=localStorage.getItem("ciq_owner_notes");return s?JSON.parse(s):{};}catch{return {};}});
  useEffect(()=>{try{localStorage.setItem("ciq_owner_notes",JSON.stringify(ownerNotes));}catch(e){};},[ownerNotes]);
  // Fuel fill-up log: array of {date, odometer, gallons, cost, mpg} — each entry closes the PREVIOUS one by
  // calculating miles driven since the last fill-up odometer reading.
  const [fuelFillups,setFuelFillups]=useState(()=>{try{const s=localStorage.getItem("ciq_fuel_fillups");return s?JSON.parse(s):[];}catch{return [];}});
  useEffect(()=>{try{localStorage.setItem("ciq_fuel_fillups",JSON.stringify(fuelFillups));}catch(e){};},[fuelFillups]);
  const [newFillup,setNewFillup]=useState({date:"",odometer:"",gallons:"",cost:""});
  const [showProfile,setShowProfile]=useState(false);
  const [profile,setProfile]=useState(()=>{try{const s=localStorage.getItem("ciq_profile");return s?JSON.parse(s):{name:"",company:"",unit:"",type:"owner-operator",goal:"",targetWeeklyNet:"",targetMPG:"5.2",notes:"",setupDone:false};}catch{return{name:"",company:"",unit:"",type:"owner-operator",goal:"",targetWeeklyNet:"",targetMPG:"5.2",notes:"",setupDone:false};}});
  // Weekly WhatsApp/SMS digest preferences — Pro Smart feature, upcoming V4 release.
  // Storing the opt-in and phone number now so the preference is ready the moment
  // the backend sending service (Twilio or similar) is wired up.
  const [digestOptIn,setDigestOptIn]=useState(false);
  const [digestPhone,setDigestPhone]=useState("");
  // Referral system — generates a stable code per user, tracked in Supabase.
  // Actually GRANTING the free month on Stripe requires a server-side webhook
  // (when a referred signup converts to paid), which is backend work beyond
  // this file — the code below builds the code, link, and tracking UI, ready
  // for that backend to plug into once built.
  const [referralCode,setReferralCode]=useState("");
  const [referredSignups,setReferredSignups]=useState([]);// [{email, signupDate, status:"trial"|"paid"|"expired"}]
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
  const [realIsSmart,setIsSmart]=useState(()=>{if(typeof window!=="undefined"&&window.location.hostname.includes("navy"))return true;try{return localStorage.getItem("ciq_smart")==="true";}catch{return false;}});

  // Dev/testing-only preview toggle — lets a real Pro Smart account temporarily
  // SEE the Standard-tier locked view without touching the actual subscription.
  // Never persisted to Supabase or localStorage on purpose — always resets on reload.
  const [previewAsStandard,setPreviewAsStandard]=useState(false);
  const isSmart=previewAsStandard?false:realIsSmart;// every existing isSmart check in the app automatically respects the preview toggle


  // ═══ PRO SMART FEATURE TOKENS ═══
  // Standard-tier users get ONE free use of each Pro Smart feature every 31 days.
  // Synced to Supabase (not localStorage) so the same token cycle applies across
  // every device — a device switch should never grant an extra free use.
  const [featureTokens,setFeatureTokens]=useState({});// { featureKey: "2026-07-05T12:00:00.000Z" }
  const FEATURE_TRIAL_DAYS=31;
  function canUseFeatureFree(featureKey){
    if(isSmart)return true;// already has full access, tokens are irrelevant
    const lastUsed=featureTokens[featureKey];
    if(!lastUsed)return true;// never used — free token available
    const daysSince=(Date.now()-new Date(lastUsed).getTime())/(1000*60*60*24);
    return daysSince>=FEATURE_TRIAL_DAYS;
  }
  function daysUntilFeatureFree(featureKey){
    const lastUsed=featureTokens[featureKey];
    if(!lastUsed)return 0;
    const daysSince=(Date.now()-new Date(lastUsed).getTime())/(1000*60*60*24);
    return Math.max(0,Math.ceil(FEATURE_TRIAL_DAYS-daysSince));
  }
  function useFeatureToken(featureKey){
    setFeatureTokens(function(p){return {...p,[featureKey]:new Date().toISOString()};});
  }
  const [liveData,setLiveData]=useState({diesel:null,weather:null,dieselPeriod:null});
  const [showUpgrade,setShowUpgrade]=useState(false);
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
  const [chat,setChat]=useState([{r:"a",t:"👋 Welcome to DrayageIQ! Upload your first settlement or explore demo mode. Ask me anything about your trucking business."}]);
  const [chatIn,setChatIn]=useState("");
  const [chatLoad,setChatLoad]=useState(false);
  const [aiMode,setAiMode]=useState("chat");
  const [aiOut,setAiOut]=useState("");
  const [aiLoad,setAiLoad]=useState(false);
  const [manForm,setManForm]=useState({week:"",from:"",to:"",gross:"",net:"",deductions:"",moves:""});
  const [addedW,setAddedW]=useState(()=>{try{const s=localStorage.getItem("ciq_addedWeeks");return s?JSON.parse(s):[];}catch{return [];}});
  const [addMsg,setAddMsg]=useState("");
  const [dlWk,setDlWk]=useState(null);
  const [selWkKeys,setSelWkKeys]=useState(()=>new Set());
  const chatEnd=useRef(null);

  const ownerDataAvailable=typeof window!=="undefined"&&window.location.hostname.includes("navy");
  const [demoMode,setDemoMode]=useState(()=>{
    if(typeof window!=="undefined"&&window.location.hostname.includes("navy"))return false;
    try{const d=localStorage.getItem("ciq_demo"),hasWeeks=localStorage.getItem("ciq_addedWeeks"),added=hasWeeks?JSON.parse(hasWeeks):[];if(d==="false"&&added.length>0)return false;return true;}catch{return true;}
  });
  const isOwnerMode=typeof window!=="undefined"&&window.location.hostname.includes("navy");
  const [showUpgradeWelcome,setShowUpgradeWelcome]=useState(false);
  const [upgradedTier,setUpgradedTier]=useState(null);// "fleet" | "growingfleet" — which plan they just bought
  useEffect(function(){
    if(typeof window==="undefined")return;
    const params=new URLSearchParams(window.location.search);
    const upgraded=params.get("upgraded");
    if(upgraded==="fleet"||upgraded==="growingfleet"){
      setShowUpgradeWelcome(true);
      setUpgradedTier(upgraded);
      // Clean the URL so refreshing doesn't re-trigger this
      const cleanUrl=window.location.pathname;
      window.history.replaceState({},"",cleanUrl);
    }
  },[]);
  const [showWelcome,setShowWelcome]=useState(()=>{
    if(isOwnerMode)return false;
    try{
      const hasDismissed=localStorage.getItem("ciq_welcome_done"),hasAddedWeeks=localStorage.getItem("ciq_addedWeeks"),addedParsed=hasAddedWeeks?JSON.parse(hasAddedWeeks):[];
      if(hasDismissed==="true"&&addedParsed.length>0)return false;
      if(hasDismissed==="true"&&localStorage.getItem("ciq_pro")==="true")return false;
      return true;
    }catch{return true;}
  });
  const [showSignIn,setShowSignIn]=useState(false);
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
  useEffect(()=>{try{localStorage.setItem("ciq_smart",String(realIsSmart));}catch(e){};},[realIsSmart]);// cache the REAL tier — the dev preview toggle must never leak into storage

  // Fetch live diesel + weather for Tier 2 Smart users
  useEffect(()=>{
    if(!isSmart)return;
    async function fetchLive(){
      try{
        // Diesel price (EIA, weekly)
        const dr=await fetch("/api/diesel");
        const dd=dr.ok?await dr.json():null;
        // Weather (needs geolocation)
        let wd=null;
        try{
          const pos=await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{timeout:5000,maximumAge:300000}));
          const wr=await fetch(`/api/weather?lat=${pos.coords.latitude.toFixed(2)}&lon=${pos.coords.longitude.toFixed(2)}`);
          if(wr.ok)wd=await wr.json();
        }catch(e){}
        setLiveData({
          diesel:dd?.price||null,
          dieselPeriod:dd?.period||null,
          weather:wd?.desc?`${wd.city}: ${wd.desc}, ${wd.tempF}°F, wind ${wd.windMph}mph`:null,
        });
      }catch(e){}
    }
    fetchLive();
    const t=setInterval(fetchLive,1800000);// refresh every 30min
    return()=>clearInterval(t);
  },[isSmart]);


  // ═══ AUTH + CLOUD SYNC ═══
  const [user,setUser]=useState(null);
  const [authChecked,setAuthChecked]=useState(false);
  // ═══ ENTITLEMENT REVOCATION GUARD (audit fix #3) ═══
  // localStorage is a CACHE, not a granter. The initializer reads it only to
  // avoid a "Standard flash" for real paying customers while their session
  // loads. But once the auth check completes, anyone WITHOUT a real session
  // on production gets stripped back to free and the stale keys are cleared —
  // this evicts poisoned values (e.g. from the old ?owner=true bypass or a
  // DevTools localStorage edit). Logged-in users are separately corrected by
  // the Supabase plan pull, which is the single source of truth.
  useEffect(()=>{
    if(!authChecked)return;// wait until we actually know the session state
    if(isOwnerMode)return;// navy dev domain keeps its auto-grant
    if(user)return;// logged-in users: Supabase plan column governs, not this
    setIsPro(false);setIsSmart(false);
    try{localStorage.removeItem("ciq_pro");localStorage.removeItem("ciq_smart");}catch(e){}
  },[authChecked,user]);

  const [authEmail,setAuthEmail]=useState("");
  const [authSent,setAuthSent]=useState(false);
  const [authBusy,setAuthBusy]=useState(false);
  const [authMsg,setAuthMsg]=useState("");
  const [cloudLoaded,setCloudLoaded]=useState(false);

  // Show welcome/landing page whenever user is not logged in
  // Show welcome when not logged in (skip for dev/owner mode)
  useEffect(()=>{
    if(!user&&!isOwnerMode) setShowWelcome(true);
  },[user,isOwnerMode]);

  // Check existing session + listen for login/logout
  useEffect(()=>{
    const c=getSB();
    if(!c){ setAuthChecked(true); return; }
    c.auth.getSession().then(({data})=>{
      // Only overwrite with null if we're NOT in owner/dev mode — otherwise
      // this would stomp on the synthetic dev user the moment the page loads,
      // since Supabase always reports "no session" for the fake dev account.
      if(data.session?.user||!isOwnerMode)setUser(data.session?.user||null);
      setAuthChecked(true);
    });
    const {data:sub}=c.auth.onAuthStateChange((_e,session)=>{
      if(session?.user||!isOwnerMode)setUser(session?.user||null);
    });
    return ()=>{ try{sub.subscription.unsubscribe();}catch(e){} };
  },[]);

  // Send magic link
  const sendMagicLink=async()=>{
    const c=getSB();
    if(!c){ setAuthMsg("Sign-in is still loading — please refresh and try again."); return; }
    const email=authEmail.trim();
    if(!email||!email.includes("@")){ setAuthMsg("Please enter a valid email address."); return; }
    setAuthBusy(true); setAuthMsg("");
    const {error}=await c.auth.signInWithOtp({email,options:{emailRedirectTo:window.location.origin}});
    setAuthBusy(false);
    if(error){ setAuthMsg("Error: "+error.message); } else { setAuthSent(true); }
  };

  // Logout
  const doLogout=async()=>{
    const c=getSB(); if(c){ await c.auth.signOut(); }
    setUser(null); setCloudLoaded(false); setAuthSent(false); setAuthEmail("");
    // Clear welcome flag so pricing/welcome shows on next login
    try{localStorage.removeItem("ciq_welcome_done");}catch(e){}
    setShowWelcome(true);
  };

  // Dev Mode: intentionally stays localStorage-only, no cloud backup.
  // We tried a fixed synthetic user_id to enable cloud sync without login,
  // but Supabase's Row-Level Security correctly rejects writes without a
  // genuine authenticated session — and we decided NOT to weaken that
  // security just for dev convenience. Dev-mode data safely persists in
  // the browser's localStorage exactly as it always has; just remember to
  // periodically export or re-enter important test data, since it has no
  // cloud redundancy the way a real logged-in account does.

  // Pull cloud data after login
  useEffect(()=>{
    if(!user){ setCloudLoaded(false); return; }
    setShowWelcome(false);// A real logged-in user should NEVER be stuck on the welcome screen
    const c=getSB(); if(!c) return;
    (async()=>{
      try{
        const {data}=await c.from("user_data").select("data,plan").eq("user_id",user.id).maybeSingle();
        const d=data&&data.data;
        if(d){
          if(d.addedW)setAddedW(d.addedW);
          if(d.profile)setProfile(d.profile);
          if(d.expenses)setExpenses(d.expenses);
          if(d.docs)setDocs(d.docs);
          if(d.reviews)setReviews(d.reviews);
          if(d.fuelFillups)setFuelFillups(d.fuelFillups);// was localStorage-only — meant fill-ups logged on one device never showed on another
          if(d.featureTokens)setFeatureTokens(d.featureTokens);// Pro Smart free-trial tokens, synced so switching devices can't reset the 31-day cycle
          if(d.digestOptIn!==undefined)setDigestOptIn(d.digestOptIn);
          if(d.digestPhone)setDigestPhone(d.digestPhone);
          if(d.referralCode)setReferralCode(d.referralCode);
          if(d.referredSignups)setReferredSignups(d.referredSignups);
        }
        // Generate a stable referral code if this user doesn't have one yet.
        // Format: first 6 chars of their user ID, uppercased — short, unique, easy to share.
        if(!(d&&d.referralCode)){
          const generatedCode=user.id.replace(/-/g,"").slice(0,6).toUpperCase();
          setReferralCode(generatedCode);
        }
        // Set tier from Supabase plan column
        const plan=data?.plan||"free";
        if(plan==="tier2"){
          setIsPro(true);setIsSmart(true);setDarkMode(true);
          try{localStorage.setItem("ciq_pro","true");localStorage.setItem("ciq_smart","true");localStorage.setItem("ciq_theme","dark");}catch(e){}
        }else if(plan==="tier1"){
          setIsPro(true);setIsSmart(false);setDarkMode(false);
          try{localStorage.setItem("ciq_pro","true");localStorage.setItem("ciq_smart","false");localStorage.setItem("ciq_theme","light");}catch(e){}
        }else{
          // Plan says free — but did they PAY before creating this account?
          // (Stripe webhook parks pay-first purchases in pending_plans by email;
          // this claims it onto their account via the secure server endpoint.)
          let claimed=null;
          try{
            const {data:sess}=await c.auth.getSession();
            const tok=sess&&sess.session&&sess.session.access_token;
            if(tok){
              const cr=await fetch("/api/claim-plan",{method:"POST",headers:{Authorization:"Bearer "+tok}});
              if(cr.ok){const cj=await cr.json();claimed=cj&&cj.plan;}
            }
          }catch(e){}
          if(claimed==="tier2"){
            setIsPro(true);setIsSmart(true);setDarkMode(true);
            try{localStorage.setItem("ciq_pro","true");localStorage.setItem("ciq_smart","true");}catch(e){}
          }else if(claimed==="tier1"){
            setIsPro(true);setIsSmart(false);
            try{localStorage.setItem("ciq_pro","true");localStorage.setItem("ciq_smart","false");}catch(e){}
          }else{
            setIsPro(false);setIsSmart(false);
            try{localStorage.setItem("ciq_pro","false");localStorage.setItem("ciq_smart","false");}catch(e){}
          }
        }
      }catch(e){ console.error("cloud pull",e&&e.message); }
      setCloudLoaded(true);
      try{if(!localStorage.getItem("ciq_onboarding_done")){setShowOnboarding(true);setOnboardStep(0);setOnboardPath(null);}}catch(e){}
    })();
  },[user]);

  // Push to cloud on change (debounced), only after initial pull
  // Tracks REAL sync state visible to the user — not just a static label.
  const [syncStatus,setSyncStatus]=useState("idle");// idle | saving | saved | error
  const [lastSyncTime,setLastSyncTime]=useState(null);
  const [syncError,setSyncError]=useState("");
  useEffect(()=>{
    if(!user||!cloudLoaded) return;
    const c=getSB();
    if(!c){setSyncStatus("error");setSyncError("Cloud connection unavailable");return;}
    const blob={addedW,profile,expenses,docs,reviews,fuelFillups,featureTokens,digestOptIn,digestPhone,referralCode,referredSignups};
    setSyncStatus("saving");
    const t=setTimeout(()=>{
      c.from("user_data").upsert({user_id:user.id,data:blob,updated_at:new Date().toISOString()})
        .then(({error})=>{
          if(error){
            console.error("cloud push",error.message);
            setSyncStatus("error");
            setSyncError(error.message||"Save failed");
          }else{
            setSyncStatus("saved");
            setLastSyncTime(new Date());
          }
        })
        .catch(err=>{
          setSyncStatus("error");
          setSyncError(err?.message||"Network error — save failed");
        });
    },1500);
    return ()=>clearTimeout(t);
  },[addedW,profile,expenses,docs,reviews,fuelFillups,featureTokens,digestOptIn,digestPhone,referralCode,referredSignups,user,cloudLoaded]);

  const baseW=[];// W is empty now — all real data comes from Supabase via addedW, same on every device
  const allW=demoMode?[...DEMO_W]:[...baseW,...addedW];

  // Default the dashboard to the MOST RECENT week on load/refresh, not the oldest.
  // sD/sM/sH start at a hardcoded 7 (leftover from old demo data length) — this corrects
  // it to the real last index the moment real data is available, but only once per data-load
  // so it doesn't fight with the user manually browsing to an older week afterward.
  const hasSetInitialWeek=useRef(false);
  useEffect(()=>{
    if(hasSetInitialWeek.current)return;
    // Wait for the REAL data source to settle before locking the initial week.
    // Without this gate, addedW's localStorage fallback (possibly stale/partial)
    // fires first, locks in a wrong index, and the later real Supabase data
    // never gets a chance to correct it — which is why refresh kept landing on Week 16.
    if(user&&!cloudLoaded)return;// logged in but cloud hasn't finished pulling yet — wait
    if(allW.length===0)return;
    const lastIndex=allW.length-1;
    setSD(lastIndex);setSM(lastIndex);setSH(lastIndex);
    hasSetInitialWeek.current=true;
  },[allW.length,cloudLoaded,user]);

  // Auto-sync Baseline MPG from real settlement data — no more manual weekly adjustment.
  // Uses your last 4 weeks' actual (miles/gallons) to compute a rolling real average.
  // User can still override manually by toggling off auto-sync.
  useEffect(()=>{
    if((!isSmart&&!featureTrialActive.mpgAutoSync)||!mpgAutoSync||allW.length===0)return;// auto-sync is a Pro Smart feature (or active free trial)
    const recent=[...allW].slice(-4);
    let totalMiles=0,totalGal=0;
    recent.forEach(w=>{
      const wMiles=(w.moves||[]).reduce((s,m)=>s+(m.mi||m.miles||0),0);
      const wGal=w.gallons>0?w.gallons:0;
      if(wGal>0){totalMiles+=wMiles;totalGal+=wGal;}
    });
    if(totalGal>0){
      const realAvgMPG=totalMiles/totalGal;
      const clamped=Math.max(3.5,Math.min(9.0,Math.round(realAvgMPG*10)/10));
      setFuelMPG(clamped);
    }
  },[allW,mpgAutoSync]);// re-run whenever ANY week data changes (was allW.length — missed updates when scanning/editing same-count weeks)

  // Auto-sync Price/Gallon from the currently-selected week's real fuel advance data —
  // same source as the "Average Fuel Price This Week" card, so both numbers always match.
  useEffect(()=>{
    if((!isSmart&&!featureTrialActive.priceAutoSync)||!priceAutoSync)return;// auto-sync is a Pro Smart feature (or active free trial)
    const dwCheck=allW[sD];
    if(!dwCheck)return;
    const weekFuelA=(dwCheck.deds||[]).filter(d=>d&&d.l&&d.l.toLowerCase().includes("fuel advance")&&d.ppg>0);
    if(weekFuelA.length===0)return;
    const totalGal=weekFuelA.reduce((s,d)=>s+(d.gal||0),0);
    const totalCost=weekFuelA.reduce((s,d)=>s+(d.a||0),0);
    if(totalGal>0){
      const avgPPG=totalCost/totalGal;
      const clamped=Math.max(3.5,Math.min(8.0,Math.round(avgPPG*100)/100));
      setFuelPrice(clamped);
    }
  },[allW,sD,priceAutoSync]);// re-run when week selection or data changes
  const visibleW=allW.filter(w=>{const vk=detectVendor(w);if(activeOnlyVendor&&vk!==activeOnlyVendor)return false;if(hiddenVendors.includes(vk))return false;return true;});
  const safeW=visibleW.length>0?visibleW:(allW.length>0?allW:DEMO_W);
  const vendorKeys=Object.keys(VENDORS);
  const vendorStats=vendorKeys.map(vk=>{const vw=allW.filter(w=>detectVendor(w)===vk);if(!vw.length)return null;const vGross=vw.reduce((s,w)=>s+w.gross,0),vNet=vw.reduce((s,w)=>s+w.net,0),vDed=vw.reduce((s,w)=>s+w.totalDeductions,0);return{...VENDORS[vk],key:vk,weeks:vw.length,gross:vGross,net:vNet,ded:vDed,margin:vGross>0?(vNet/vGross*100).toFixed(1):"0.0"};}).filter(Boolean);
  const allMoves=allW.flatMap(w=>pairRoundTrips(mergeExtraPay(w.moves||[])).map(m=>({type:m.t||m.type,from:m.fr||m.from,to:m.to,miles:m.mi||m.miles||0,rate:m.rt||m.rate||0,fsc:m.fc||m.fsc||0,extraPay:m.extraPay||0,isRoundTrip:m.isRoundTrip||false,emptyPay:m.emptyPay||0,loadedPay:m.loadedPay||0,emptyMi:m.emptyMi||0,loadedMi:m.loadedMi||0,dt:m.dt||"",customer:m.cust||m.customer||"",wk:w.week})));
  const tGross=allW.reduce((s,w)=>s+w.gross,0),tNet=allW.reduce((s,w)=>s+w.net,0),tDed=allW.reduce((s,w)=>s+w.totalDeductions,0);
  const tMi=allMoves.reduce((s,m)=>s+m.miles,0);
  const avgRPM=tMi>0?(allMoves.reduce((s,m)=>s+m.rate+m.fsc,0)/tMi).toFixed(2):"0.00";
  const ldPct=allMoves.length>0?Math.round(allMoves.filter(m=>m.type==="L").length/allMoves.length*100):0;
  const margin=(tNet/tGross*100).toFixed(1);
  const latest=allW[allW.length-1];
  const avgM=allW.reduce((s,w)=>s+w.net/w.gross*100,0)/allW.length;
  const wg=w=>{const m=w.net/w.gross*100;return m>=avgM*1.2?{l:"HIGH",c:C.green,i:"🔥"}:m>=avgM*0.8?{l:"NORMAL",c:C.accent,i:"✅"}:{l:"LOW",c:C.red,i:"⚠️"};};
  // Use actual balance from most recent week that has it, else sum weekly deductions
  const latestEscRegBal=allW.slice().reverse().find(w=>w.escrow_regular_balance>0)?.escrow_regular_balance||0;
  const latestEsc290Bal=allW.slice().reverse().find(w=>w.escrow_290_balance>0)?.escrow_290_balance||0;
  const calcEscReg=allW.reduce((s,w)=>s+((w.deds||[]).find(d=>d.l==="Escrow Regular")?.a||0),0);
  const calcEsc290=allW.reduce((s,w)=>s+((w.deds||[]).find(d=>d.l==="2290 Escrow")?.a||0),0);
  const tEscReg=latestEscRegBal||calcEscReg;
  const tEsc290=latestEsc290Bal||calcEsc290;
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
  const latFuel=Math.max(0,(latest.deds||[]).filter(d=>d.l.toLowerCase().includes("fuel")).reduce((s,d)=>s+d.a,0)-(latest.rebate||0));// net of rebate
  const SYS=`Expert drayage business advisor for YOUR COMPANY, CDL owner-operator, Baltimore MD. Real settlement data: ${allW.map(function(w){return "W"+w.week+": Gross $"+w.gross+", Net $"+w.net+", Margin "+(w.net/w.gross*100).toFixed(1)+"%, "+(w.moves||[]).length+" moves";}).join(" | ")}. YTD: Gross $${tGross.toFixed(0)}, Net $${tNet.toFixed(0)}, Margin ${margin}%, Avg RPM $${avgRPM}, Loaded ${ldPct}%. Be specific, practical, use real numbers. Under 300 words.`;

  // Process multiple PDFs sequentially
  async function processScanQueue(files){
    if(!files||files.length===0)return;
    setScanQueueActive(true);
    setScanQueueLog([]);
    setScanResult(null);
    const log=[];
    for(let i=0;i<files.length;i++){
      const file=files[i];
      setScanQueue(files.length>1?[{name:file.name,index:i,total:files.length,status:"scanning"}]:[]);
      setScanMsg(`⏳ Scanning ${i+1} of ${files.length}: ${file.name}...`);
      setScanning(true);
      try{
        // Reuse scanPDF logic inline
        const isImage=file.type.startsWith("image/");
        const EXTRACT_PROMPT=`You are a precise data extractor for commercial trucking settlement statements. Return ONLY valid JSON — no markdown, no preamble, no commentary.\n\n═══ DEDUCTION EXTRACTION RULES (most critical) ═══\n\nA. Read EVERY deduction line one at a time. Each line that starts with a date or label is its OWN separate entry. NEVER merge two lines into one.\n\nB. FUEL ADVANCES are identified by having an invoice number AND Notes with: Location Name, Gallons, Price Per Gallon, Cost. Extract each fuel advance as:\n   {"l":"FUEL ADVANCE","a":<cost as positive number>,"inv":"<invoice#>","gal":<gallons>,"ppg":<price per gallon>}\n   There can be 1, 2, 3 or more fuel advances per week — extract ALL of them individually.\n\nC. ALL OTHER deductions are fixed recurring items (insurance, fees, escrow, parking, etc). Extract each as:\n   {"l":"<exact label from document>","a":<amount as positive number>}\n   Read the EXACT dollar amount from the document. Do not estimate. Do not combine.\n\nD. VERIFY: After extracting all deductions, sum them up. The total should match the "Deductions" line in the Settlement Summary section. If it does not match within $1.00, re-read the deductions section and find what you missed.\n\nE. REIMBURSEMENTS (Fuel Rebate, Interest, Insurance Rebate) are NOT deductions. They are additions. Extract them separately as the "rebate" total.\n\nF. For escrow balances: read the ACTUAL BALANCE column from the Deductions Statement table at the bottom, NOT the weekly deduction amount.\n\n═══ MOVES EXTRACTION RULES ═══\n\nG. "moves": include ONE entry for EVERY order row in the settlement detail table. Every row starting with an order number (IBP..., OWO..., etc) is a separate move — including ALL legs (leg 1, leg 2, leg 3 are each their own entry). Do not skip, merge, or stop early. Statements can have 20-40+ rows.\n\nH. For move fields: t=L or E (loaded/empty from TP column), fr=From city, to=To city, mi=Miles, rt=Rate, fc=FSC amount, ord=the order number WITHOUT the /001 suffix, leg=the leg number from the Leg# column, dt=the Ship Dtd date for this row exactly as shown (e.g. "06/23/26"). Also extract cust=the Customer/Shipper/Consignee name shown for this row, or empty string if the statement has no customer column.\n\nH2. Extract every move individually with its own ord, leg, and dt fields. Do NOT combine or group any moves yourself — the app groups round trips automatically using the from/to/date data you provide. Just extract each row accurately.\n\n═══ GENERAL RULES ═══\n\nI. All numbers must be plain — no $ signs, no commas, no negative signs (deductions stored as positive).\nJ. If a field is not in the document use 0 for numbers or "" for text. NEVER invent or estimate.\nK. Week number: extract just the number before the dash (e.g. "25-2026" → "25").\n\n═══ CROSS-CHECK BEFORE RETURNING ═══\nL. Confirm: sum of all deds[].a ≈ totalDeductions from Settlement Summary\nM. Confirm: gross - totalDeductions + rebate ≈ net\nN. Confirm: moves count matches order rows in document\n\nFORMAT TEMPLATE:\n{"week":"00","from":"MM/DD/YYYY","to":"MM/DD/YYYY","gross":0,"net":0,"totalDeductions":0,"rebate":0,"gross_ytd":0,"escrow_regular_balance":0,"escrow_290_balance":0,"gallons":0,"price_per_gallon":0,"moves":[{"t":"L","fr":"ORIGIN","to":"DEST","mi":0,"rt":0,"fc":0,"ord":"","leg":1,"dt":"MM/DD/YY","cust":""}],"deds":[{"l":"FUEL ADVANCE","a":0,"inv":"","gal":0,"ppg":0},{"l":"ELD USAGE FEE","a":0},{"l":"INSURANCE LIABILLITY LIMITER","a":0}]}`;
        let pdfText="";
        if(!isImage&&window.pdfjsLib){
          try{
            window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            const buf=await file.arrayBuffer();
            const pdf=await window.pdfjsLib.getDocument({data:buf}).promise;
            let t="";
            for(let p=1;p<=pdf.numPages;p++){const page=await pdf.getPage(p);const c=await page.getTextContent();t+=c.items.map(i=>i.str).join(" ")+"\n";}
            pdfText=t.trim();
          }catch(ex){pdfText="";}
        }
        let reqBody;
        if(pdfText&&pdfText.length>200){
          reqBody={model:"claude-sonnet-4-5",max_tokens:8000,messages:[{role:"user",content:`${EXTRACT_PROMPT}

SETTLEMENT STATEMENT TEXT (read all of it):
${pdfText.slice(0,24000)}`}]};
        }else{
          const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
          const mediaType=isImage?(file.type||"image/jpeg"):"application/pdf";
          const contentBlock=isImage?{type:"image",source:{type:"base64",media_type:mediaType,data:b64}}:{type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}};
          reqBody={model:"claude-sonnet-4-5",max_tokens:8000,betas:["pdfs-2024-09-25"],messages:[{role:"user",content:[contentBlock,{type:"text",text:EXTRACT_PROMPT}]}]};
        }
        const resp=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(reqBody)});
        if(!resp.ok){log.push({name:file.name,status:"error",msg:`API Error ${resp.status}`});continue;}
        const d=await resp.json();
        if(d.error){log.push({name:file.name,status:"error",msg:d.error.message});continue;}
        const txt=d.content?.map(b=>b.text||"").join("").trim();
        const jsonStart=txt.indexOf("{"),jsonEnd=txt.lastIndexOf("}")+1;
        if(jsonStart===-1){log.push({name:file.name,status:"error",msg:"Could not extract data"});continue;}
        let jsonStr=txt.slice(jsonStart,jsonEnd);
        try{JSON.parse(jsonStr);}catch(truncErr){let depth=0;for(const c of jsonStr){if(c==="{"||c==="[")depth++;else if(c==="}"||c==="]")depth--;}if(depth>0)jsonStr+="]".repeat(Math.max(0,jsonStr.split("[").length-jsonStr.split("]").length))+"}".repeat(Math.max(0,jsonStr.split("{").length-jsonStr.split("}").length));}
        const parsed=JSON.parse(jsonStr);
        parsed.label=`Week ${String(parsed.week).padStart(2,"0")}`;
        parsed.week=String(parsed.week).padStart(2,"0");
        const wNum=parsed.week;
        const exists=addedW.find(w=>w.week===wNum);
        if(exists){
          setAddedW(p=>p.map(w=>w.week===wNum?{...parsed,vendor:vendorPick,week:wNum,label:`Week ${wNum}`}:w));
          log.push({name:file.name,status:"updated",week:wNum,gross:parsed.gross,net:parsed.net});
        }else{
          setAddedW(p=>[...p,{...parsed,vendor:vendorPick,week:wNum,label:`Week ${wNum}`}]);
          log.push({name:file.name,status:"saved",week:wNum,gross:parsed.gross,net:parsed.net});
        }
      }catch(e){
        log.push({name:file.name,status:"error",msg:e.message});
      }
      setScanning(false);
      // Small delay between scans to avoid rate limits
      if(i<files.length-1) await new Promise(r=>setTimeout(r,800));
    }
    setScanQueueLog(log);
    setScanQueue([]);
    setScanQueueActive(false);
    setScanning(false);
    const saved=log.filter(l=>l.status==="saved"||l.status==="updated").length;
    const errors=log.filter(l=>l.status==="error").length;
    setScanMsg(`✅ Done — ${saved} week${saved!==1?"s":""} saved${errors>0?`, ${errors} failed`:""}`);
  }

  function confirmScan(){
    if(!scanResult)return;
    const wNum=String(scanResult.week).padStart(2,"0");
    // If week already exists — replace it
    const exists=addedW.find(w=>w.week===wNum);
    let newIndex=-1;
    if(exists){
      setAddedW(p=>{
        const next=p.map(w=>w.week===wNum?{...scanResult,vendor:vendorPick,week:wNum,label:`Week ${wNum}`}:w);
        newIndex=next.findIndex(w=>w.week===wNum);
        return next;
      });
      setScanMsg(`✅ Week ${wNum} updated`);
    }else{
      setAddedW(p=>{
        const next=[...p,{...scanResult,vendor:vendorPick,week:wNum,label:`Week ${wNum}`}];
        newIndex=next.length-1;// newly appended week is always last in addedW
        return next;
      });
      setScanMsg(`✅ Week ${wNum} saved`);
    }
    setScanResult(null);
    // Jump the dashboard to show the week that was JUST scanned, instead of staying on the oldest week
    if(newIndex>=0){
      setTimeout(()=>{setSD(newIndex);setSM(newIndex);setSH(newIndex);},50);
    }
  }

  async function scanPDF(file,fileType){
    setScanning(true);setScanResult(null);setScanMsg("");
    try{
      const isImage=fileType==="image"||file.type.startsWith("image/");
      const EXTRACT_PROMPT=`You are a precise data extractor for commercial trucking settlement statements. Return ONLY valid JSON — no markdown, no preamble, no commentary.\n\n═══ DEDUCTION EXTRACTION RULES (most critical) ═══\n\nA. Read EVERY deduction line one at a time. Each line that starts with a date or label is its OWN separate entry. NEVER merge two lines into one.\n\nB. FUEL ADVANCES are identified by having an invoice number AND Notes with: Location Name, Gallons, Price Per Gallon, Cost. Extract each fuel advance as:\n   {"l":"FUEL ADVANCE","a":<cost as positive number>,"inv":"<invoice#>","gal":<gallons>,"ppg":<price per gallon>}\n   There can be 1, 2, 3 or more fuel advances per week — extract ALL of them individually.\n\nC. ALL OTHER deductions are fixed recurring items (insurance, fees, escrow, parking, etc). Extract each as:\n   {"l":"<exact label from document>","a":<amount as positive number>}\n   Read the EXACT dollar amount from the document. Do not estimate. Do not combine.\n\nD. VERIFY: After extracting all deductions, sum them up. The total should match the "Deductions" line in the Settlement Summary section. If it does not match within $1.00, re-read the deductions section and find what you missed.\n\nE. REIMBURSEMENTS (Fuel Rebate, Interest, Insurance Rebate) are NOT deductions. They are additions. Extract them separately as the "rebate" total.\n\nF. For escrow balances: read the ACTUAL BALANCE column from the Deductions Statement table at the bottom, NOT the weekly deduction amount.\n\n═══ MOVES EXTRACTION RULES ═══\n\nG. "moves": include ONE entry for EVERY order row in the settlement detail table. Every row starting with an order number (IBP..., OWO..., etc) is a separate move — including ALL legs (leg 1, leg 2, leg 3 are each their own entry). Do not skip, merge, or stop early. Statements can have 20-40+ rows.\n\nH. For move fields: t=L or E (loaded/empty from TP column), fr=From city, to=To city, mi=Miles, rt=Rate, fc=FSC amount, ord=the order number WITHOUT the /001 suffix, leg=the leg number from the Leg# column, dt=the Ship Dtd date for this row exactly as shown (e.g. "06/23/26"). Also extract cust=the Customer/Shipper/Consignee name shown for this row, or empty string if the statement has no customer column.\n\nH2. Extract every move individually with its own ord, leg, and dt fields. Do NOT combine or group any moves yourself — the app groups round trips automatically using the from/to/date data you provide. Just extract each row accurately.\n\n═══ GENERAL RULES ═══\n\nI. All numbers must be plain — no $ signs, no commas, no negative signs (deductions stored as positive).\nJ. If a field is not in the document use 0 for numbers or "" for text. NEVER invent or estimate.\nK. Week number: extract just the number before the dash (e.g. "25-2026" → "25").\n\n═══ CROSS-CHECK BEFORE RETURNING ═══\nL. Confirm: sum of all deds[].a ≈ totalDeductions from Settlement Summary\nM. Confirm: gross - totalDeductions + rebate ≈ net\nN. Confirm: moves count matches order rows in document\n\nFORMAT TEMPLATE:\n{"week":"00","from":"MM/DD/YYYY","to":"MM/DD/YYYY","gross":0,"net":0,"totalDeductions":0,"rebate":0,"gross_ytd":0,"escrow_regular_balance":0,"escrow_290_balance":0,"gallons":0,"price_per_gallon":0,"moves":[{"t":"L","fr":"ORIGIN","to":"DEST","mi":0,"rt":0,"fc":0,"ord":"","leg":1,"dt":"MM/DD/YY","cust":""}],"deds":[{"l":"FUEL ADVANCE","a":0,"inv":"","gal":0,"ppg":0},{"l":"ELD USAGE FEE","a":0},{"l":"INSURANCE LIABILLITY LIMITER","a":0}]}`;

      // For text-based PDFs, extract the actual text first (far more accurate than vision on dense tables)
      let pdfText="";
      if(!isImage && window.pdfjsLib){
        try{
          window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          const buf=await file.arrayBuffer();
          const pdf=await window.pdfjsLib.getDocument({data:buf}).promise;
          let t="";
          for(let p=1;p<=pdf.numPages;p++){const page=await pdf.getPage(p);const c=await page.getTextContent();t+=c.items.map(i=>i.str).join(" ")+"\\n";}
          pdfText=t.trim();
        }catch(ex){pdfText="";}
      }

      let reqBody;
      if(pdfText && pdfText.length>200){
        // TEXT PATH — reliable for real (text-based) settlement PDFs
        reqBody={model:"claude-sonnet-4-5",max_tokens:8000,messages:[{role:"user",content:`${EXTRACT_PROMPT}\n\nSETTLEMENT STATEMENT TEXT (read all of it):\n${pdfText.slice(0,24000)}`}]};
      } else {
        // VISION PATH — scanned image PDFs or photos
        const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
        const mediaType=isImage?(file.type||"image/jpeg"):"application/pdf";
        const contentBlock=isImage?{type:"image",source:{type:"base64",media_type:mediaType,data:b64}}:{type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}};
        reqBody={model:"claude-sonnet-4-5",max_tokens:8000,betas:["pdfs-2024-09-25"],messages:[{role:"user",content:[contentBlock,{type:"text",text:EXTRACT_PROMPT}]}]};
      }

      const resp=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(reqBody)});
      if(!resp.ok){if(resp.status===401)setScanMsg("⚠️ API key invalid.");else setScanMsg(`⚠️ API Error ${resp.status}. Try Paste Text instead.`);setScanning(false);return;}
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
      // Get user location
      let locationCtx="";
      let userLat=null,userLon=null;
      try{
        const pos=await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{timeout:4000,maximumAge:60000}));
        userLat=pos.coords.latitude.toFixed(2);
        userLon=pos.coords.longitude.toFixed(2);
        try{
          const geo=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLon}&format=json`);
          const gd=await geo.json();
          const city=gd?.address?.city||gd?.address?.town||gd?.address?.village||gd?.address?.county||"";
          const state=gd?.address?.state||"";
          const zip=gd?.address?.postcode||"";
          locationCtx=`User location: ${city}${state?", "+state:""} ${zip}.`;// city-level only — raw coordinates never go into the AI prompt (privacy)
        }catch(e){
          locationCtx=`User location: near lat ${userLat}, lon ${userLon} (approximate, ~1km).`;
        }
      }catch(e){}

      // Build intelligence briefing for Smart (Tier 2) users
      let briefing="";
      if(isSmart){
        const fetches=[];
        // 1. Live diesel price
        fetches.push(fetch("/api/diesel").then(r=>r.json()).catch(()=>null));
        // 2. Live weather — use GPS if available, else Baltimore (home market)
        const weatherQ=userLat?`/api/weather?lat=${userLat}&lon=${userLon}`:`/api/weather?city=Columbia,MD`;
        fetches.push(fetch(weatherQ).then(r=>r.json()).catch(()=>null));
        const [dp,wp]=await Promise.all(fetches);

        // Build settlement intelligence from user's own data
        const weeks=allW.filter(w=>w.gross>0);
        let settlementCtx="";
        if(weeks.length>0){
          const recent=weeks.slice(-8);
          const avgGross=recent.reduce((s,w)=>s+(w.gross||0),0)/recent.length;
          const avgNet=recent.reduce((s,w)=>s+(w.net||0),0)/recent.length;
          // Miles are stored inside moves as move.mi — sum them per week
          const weekMiles=w=>((w.moves||[]).reduce((s,m)=>s+(m.mi||0),0));
          const avgMiles=recent.reduce((s,w)=>s+weekMiles(w),0)/recent.length;
          const avgRPM=avgMiles>0?(avgGross/avgMiles):0;
          const totalLoads=recent.reduce((s,w)=>s+(w.moves?.length||0),0);
          const avgLoadsPerWeek=totalLoads/recent.length;
          const lastWeek=weeks[weeks.length-1];
          const lastMiles=weekMiles(lastWeek);
          // Build per-week breakdown for last 4 weeks
          const recentFour=weeks.slice(-4);
          const weekLines=recentFour.map(w=>"  Week "+w.week+": Gross $"+(w.gross||0)+", Net $"+(w.net||0)+", Miles "+weekMiles(w)+", Loads "+(w.moves?.length||0)).join("\n");
          settlementCtx="\nDRIVER SETTLEMENT DATA (last "+recent.length+" weeks):\n- Avg weekly gross: $"+avgGross.toFixed(0)+"\n- Avg weekly net: $"+avgNet.toFixed(0)+"\n- Avg miles/week: "+avgMiles.toFixed(0)+"\n- Avg revenue per mile (RPM): $"+avgRPM.toFixed(3)+"/mi\n- Avg loads/week: "+avgLoadsPerWeek.toFixed(1)+"\n- Truck MPG: "+fuelMPG+"\nLast 4 weeks detail:\n"+weekLines;
        }

        // Build live data context
        const livePts=[];
        if(dp?.price) livePts.push(`🛢️ Diesel (national avg): $${dp.price}/gal (EIA, as of ${dp.period})`);
        if(wp?.temp!=null) livePts.push(`🌤️ Weather at your location: ${wp.temp}°F, ${wp.description||wp.condition}, wind ${wp.wind_mph}mph, visibility ${wp.visibility_miles}mi`);
        if(dp?.price&&fuelMPG>0) livePts.push(`⛽ Your fuel cost estimate: $${(dp.price/fuelMPG).toFixed(3)}/mile at ${fuelMPG}MPG`);

        briefing="\n═══ SMART ADVISOR INTELLIGENCE BRIEFING ═══\n"+livePts.join("\n")+"\n"+settlementCtx+"\n═══════════════════════════════════════════";
      }

      // Build system prompt — Tier 1 vs Tier 2
      const isTier2=isSmart;
      const smartRules="You are an elite AI business advisor for a professional commercial drayage truck driver and owner-operator. You have access to their real settlement data, live diesel prices, and live weather. Your job is to give sharp, data-driven answers that help them make more money, cut costs, and run a smarter operation.\n\nRULES:\n- Always use the driver actual numbers from their settlement data when answering\n- When fuel cost matters, calculate using their actual MPG and today live diesel price\n- For load profitability questions, show the math: gross rate, fuel cost, net, RPM\n- Be direct and specific. They are a professional, not a beginner\n- Flag if a load rate is below their historical average RPM\n- For weather questions, use the live reading above\n- ROUND TRIPS: Many drayage moves are round trips — the truck goes out (often empty) and returns (often loaded) on the same route reversed. When a move has type \"RT\", it has already been combined by the app: total miles = both legs combined, total pay = both legs combined, RPM = total pay / total miles. Always treat these as ONE trip. Never re-split them or report them as two separate moves.\n- Format answers clearly with numbers. Max 200 words unless math requires more.\n"+briefing+"\n"+locationCtx;
      const tier1Rules="You are a knowledgeable assistant for a commercial truck driver. Answer using general knowledge. Be honest when real-time data would help — suggest they upgrade to Pro Smart for live data. Answer concisely in 150 words or fewer. Use bullet points for lists. "+locationCtx;
      const systemPrompt=isTier2?smartRules:tier1Rules;

      const resp=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        model:"claude-sonnet-4-5",
        max_tokens:isTier2?800:600,
        messages:[{role:"user",content:systemPrompt+"\n\nQuestion: "+query}]
      })});
      const d=await resp.json();
      const txt=d.content?.filter(b=>b.type==="text").map(b=>b.text||"").join("").trim();
      setSearchResult(txt||"No answer found — try rephrasing your question.");
    }catch(e){setSearchResult("⚠️ Advisor unavailable. Please try again.");}
    setSearchLoading(false);
  }


  async function parsePasteText(){
    if(!pasteText.trim())return;
    setPasteLoading(true);setPasteResult(null);setScanMsg("");
    const prompt=`You are a data extraction expert for drayage/trucking settlement statements. Extract ALL data and return ONLY valid JSON.\n\nRequired format:\n{"week":"01","from":"01/06/2025","to":"01/10/2025","gross":4200.00,"net":2310.00,"totalDeductions":1890.00,"rebate":45.00,"moves":[{"t":"L","fr":"Port Terminal","to":"Distribution Center","mi":65,"rt":220,"fc":46}],"deds":[{"l":"Operations Fee","a":840.00}]}\n\nSettlement text:\n${pasteText.slice(0,6000)}`;
    try{
      const resp=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:3000,messages:[{role:"user",content:prompt}]})});
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
    try{
      // For Pro users: fetch live diesel + weather and inject into prompt
      let liveCtx="";
      if(isPro){
        try{
          // Try GPS first for accurate local weather, fall back to Columbia MD (home market)
          let weatherQ="/api/weather?city=Columbia,MD";
          try{
            const pos=await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{timeout:3000,maximumAge:120000}));
            weatherQ=`/api/weather?lat=${pos.coords.latitude.toFixed(2)}&lon=${pos.coords.longitude.toFixed(2)}`;
          }catch(e){}
          const [dieselRes,wxRes]=await Promise.allSettled([
            fetch("/api/diesel").then(r=>r.json()),
            fetch(weatherQ).then(r=>r.json())
          ]);
          const d=dieselRes.status==="fulfilled"?dieselRes.value:null;
          const w=wxRes.status==="fulfilled"?wxRes.value:null;
          const parts=[];
          if(d?.price) parts.push(`LIVE DIESEL: $${d.price}/gal (EIA ${d.period})`);
          if(w?.temp!=null) parts.push(`LIVE WEATHER Baltimore: ${w.temp}°F, ${w.description}, wind ${w.wind_mph}mph, visibility ${w.visibility_miles}mi`);
          if(parts.length) liveCtx="\n\nLIVE DATA (use these real numbers in your answer):\n"+parts.join("\n");
        }catch(e){}
      }
      const proTag=isPro?"PRO MEMBER — provide deeper analysis, use all live data provided.":"FREE USER — helpful but brief.";
      const enhancedSYS=SYS+"\n\n"+proTag+liveCtx;
      const r=await ai(h.map(x=>({role:x.r==="a"?"assistant":"user",content:x.t})),enhancedSYS);
      setChat(p=>[...p,{r:"a",t:r}]);
    }
    catch{setChat(p=>[...p,{r:"a",t:"⚠️ Error. Try again."}]);}
    setChatLoad(false);
  }

  async function runAITool(mode){
    setAiMode(mode);setAiOut("");setAiLoad(true);
    const w=allW[sR]||allW[allW.length-1]||safeW[safeW.length-1];
    const fuelGross=w.deds.filter(d=>d.l.toLowerCase().includes("fuel")).reduce((s,d)=>s+d.a,0);
    const fuel=Math.max(0,fuelGross-(w.rebate||0));// net of rebate for accurate reporting
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

  // Compress camera photos before upload — phone cameras produce 3-12MB
  // images, and base64-encoding pushes the request past the serverless body
  // limit (~4.5MB), which is why direct camera captures errored. Downscaling
  // to 1600px JPEG brings a 10MB photo to ~300KB with text still readable.
  function compressImage(file){
    return new Promise(function(res,rej){
      const img=new Image();
      const url=URL.createObjectURL(file);
      img.onload=function(){
        try{
          const maxDim=1600;
          let w=img.width,h=img.height;
          if(w>maxDim||h>maxDim){const scale=maxDim/Math.max(w,h);w=Math.round(w*scale);h=Math.round(h*scale);}
          const canvas=document.createElement("canvas");
          canvas.width=w;canvas.height=h;
          canvas.getContext("2d").drawImage(img,0,0,w,h);
          URL.revokeObjectURL(url);
          res(canvas.toDataURL("image/jpeg",0.8).split(",")[1]);
        }catch(e){rej(e);}
      };
      img.onerror=function(){URL.revokeObjectURL(url);rej(new Error("Could not load image"));};
      img.src=url;
    });
  }

  async function readReceipt(file){
    setExpScan(true);setExpScanMsg("Reading receipt...");
    try{
      const isImg=file.type.startsWith("image/");
      const b64=isImg
        ?await compressImage(file)// camera photos get downscaled so they fit the upload limit
        :await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
      const block=isImg?{type:"image",source:{type:"base64",media_type:"image/jpeg",data:b64}}:{type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}};
      const resp=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:400,messages:[{role:"user",content:[block,{type:"text",text:'Read this receipt. Return ONLY valid JSON: {"date":"MM/DD/YYYY","vendor":"store name","amount":0.00,"category":"Parts|Labor|Tires|Maintenance|Fuel|Permits|Other","desc":"what was purchased"}'}]}]})});
      const d=await resp.json();const raw=d.content?.map(b=>b.text||"").join("")||"{}";
      const parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());
      // Clamp AI output before it touches the form (audit fix #7) — reject
      // negative/absurd amounts, non-whitelisted categories, malformed dates.
      const VALID_CATS=["Parts","Labor","Tires","Maintenance","Fuel","Permits","Other"];
      const amtNum=parseFloat(parsed.amount);
      const safeAmount=(!isNaN(amtNum)&&amtNum>0&&amtNum<100000)?amtNum.toFixed(2):"";
      const safeCat=VALID_CATS.includes(parsed.category)?parsed.category:"Other";
      const safeDate=(typeof parsed.date==="string"&&/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(parsed.date))?parsed.date:"";
      const safeDesc=typeof parsed.desc==="string"?parsed.desc.slice(0,120):"";
      const safeVendor=typeof parsed.vendor==="string"?parsed.vendor.slice(0,60):"";
      setExpForm(p=>({...p,date:safeDate||p.date,category:safeCat,desc:safeDesc,amount:safeAmount,note:safeVendor?"From: "+safeVendor:""}));
      setExpScanMsg(safeAmount?"Receipt read — review and save":"Read partially — please check the amount");
    }catch(e){setExpScanMsg("Could not read — enter manually");}
    setExpScan(false);
  }

  async function readDoc(file){
    setDocScan(true);setDocScanMsg("Reading...");
    try{
      var isImg=file.type.startsWith("image/");
      var b64=isImg?await compressImage(file):await new Promise(function(res,rej){var r=new FileReader();r.onload=function(){res(r.result.split(",")[1]);};r.onerror=rej;r.readAsDataURL(file);});
      var block=isImg?{type:"image",source:{type:"base64",media_type:"image/jpeg",data:b64}}:{type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}};
      var resp=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:300,messages:[{role:"user",content:[block,{type:"text",text:'Read this. Return ONLY JSON: {"date":"MM/DD/YYYY","title":"document title","category":"Maintenance|Inspection|Insurance|Registration|Medical|Permit|Other","note":"brief summary"}'}]}]})});
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
    var html="<!DOCTYPE html><html><head><meta charset='UTF-8'/><title>Report</title><style>body{font-family:Arial,sans-serif;padding:28px;font-size:13px}h2{font-size:12px;font-weight:700;margin:20px 0 8px;text-transform:uppercase;border-bottom:2px solid #000}table{width:100%;border-collapse:collapse}th{text-align:left;padding:6px 8px;background:#f5f5f5;font-size:10px;text-transform:uppercase;border-bottom:2px solid #ddd}td{padding:6px 8px;border-bottom:1px solid #eee}</style></head><body><h1>DrayageIQ Report</h1><p>"+name+" - "+unit+" - "+new Date().toLocaleDateString()+"</p><p>YTD Gross: $"+tGross.toFixed(2)+" | YTD Net: $"+tNet.toFixed(2)+" | Margin: "+margin+"% | Weeks: "+allW.length+"</p>"+expSec+docSec+"</body></html>";
    var w=window.open("","_blank");if(w){w.document.write(html);w.document.close();w.focus();setTimeout(function(){w.print();},500);}
  }

  function emailReport(){
    var name=profile.name||"YOUR COMPANY";var sub="DrayageIQ Report - "+name+" - "+new Date().toLocaleDateString();
    var body="Business Report\n\nYTD Gross: $"+tGross.toFixed(2)+"\nYTD Net: $"+tNet.toFixed(2)+"\nMargin: "+margin+"%\nWeeks: "+allW.length+"\n\nGenerated by DrayageIQ";
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
    deductions:{t:"Deduction Breakdown — How to Read This Card",b:"This card splits every dollar deducted from your gross into 4 clear buckets. Use the arrows to navigate between weeks. Tap each bucket to expand and see exactly what was deducted line by line."},
    ded_fuel:{t:"⛽ Fuel Spending",b:"Every fuel advance taken that week. A fuel advance is money pulled from your paycheck to cover diesel purchased on your fuel card. The amount changes every week based on how many gallons you bought and the price per gallon. If this number is unusually high, check your gallons vs miles driven."},
    ded_insurance:{t:"🛡️ Insurance Deductions",b:"These are your recurring insurance premiums deducted weekly: Physical Damage, Bobtail, Occupational Accident, Liability Limiter, and Roadside Assistance. These amounts should be the same every single week. If you see a different number, it may be a billing error — contact your carrier."},
    ded_ops:{t:"⚙️ Operations & Fees",b:"Recurring weekly operational fees: ELD device, Event Recorder, License Plate Program, Parking/Security, and Fuel Highway Taxes. These are mostly fixed costs of running your truck. Monitor these to catch any new fees your carrier adds."},
    ded_escrow:{t:"🏦 Escrow & Savings",b:"Money being held in escrow accounts. ESCROW-REGULAR builds toward your $2,500 target and is returned when you leave the carrier. 2290 ESCROW builds toward your Heavy Highway Vehicle Use Tax. These are YOUR money — they are saved, not spent."},
    bestRoutes:{t:"🛣️ Best Routes",b:"Ranks the lanes you actually run by how well they pay for the miles they demand, using your real settlement history. The 🔥 lane is your proven money-maker — protect it, ask for more of it. The 🧊 lane is your weakest repeated route — worth questioning next time dispatch offers it. Only routes you've run at least twice are ranked, so one lucky (or unlucky) load never skews the picture. Round-trip lanes show with a ⇄. Figures are gross, before weekly deductions."},
    bestRoutes:{t:"🛣️ Best Routes",b:"Ranks the lanes you actually run by how well they pay for the miles they cost you. Both directions of the same corridor are pooled together, and a lane only appears once you've run it at least twice — so one lucky load can't crown a route. 🔥 lanes are your proven winners: accept them every time dispatch offers. 🧊 lanes pay the least for your miles — worth a second thought, or a rate conversation. Figures are gross (rate + FSC, before weekly deductions)."},
    hotDays:{t:"🔥 Hot Days",b:"Reveals which days of the week actually bring you the most work, using the real ship dates on your scanned settlements. The 🔥 marks your consistently strongest day — the one to protect and push hard on. The 🧊 marks your slowest — the safest day to rest, schedule maintenance, or handle office work without leaving real money on the road. Figures are gross (rate + FSC, before weekly deductions), and days you took off never count against a day's standing. Use the time filters to see whether your pattern is shifting with the seasons."},
    fscCalc:{t:"⛽ Fuel Surcharge Calculator",b:"Calculates an independent FSC benchmark based on today's live diesel price, your real truck MPG, and an adjustable baseline diesel price (defaults to $2.50, but you can change it to match your carrier's own baseline if you know it). This is an estimate for your own use — your carrier's actual FSC table may use a different formula and won't always match exactly. This is a Pro Smart feature since it requires live diesel pricing."},
    returnOnSpend:{t:"💰 Return on Spend",b:"For every $1 you spend running your truck (all deductions combined, net of any fuel rebate), how much revenue did you generate? A ratio of 1:3 or higher is IDEAL — you're producing $3+ for every dollar spent. A ratio of 1:1.5 is SAFE — you're still profiting 50 cents on every dollar. Below 1:1.5 means your costs are eating too much into your revenue."},
    health:{t:"Performance by Carrier",b:"Green is strong, gold is worth watching, red needs attention."},
    grades:{t:"Weekly Performance Grades",b:"Each week evaluated against your own history. Look for your best weeks and understand what made them different."},
    savings:{t:"Funds Being Held",b:"Funds held for future use — track these so you know what is being set aside."},
    movePerf:{t:"Route Performance",b:"Every route with a performance rating. Use when evaluating new offers."},
    offerScorer:{t:"Offer Evaluator",b:"Enter offer details to get an instant read before accepting a load. The score is based mainly on your real rate-per-mile (RPM) — a well-paid empty leg scores just as well as a loaded move at the same RPM, since empty miles mean less wear, less fuel burn, and less cargo risk."},
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

  // ═══ Reusable "try Pro Smart free" gate ═══
  // featureTrialActive: tracks which features have been unlocked THIS SESSION
  // (after using the free token) so the unlocked view stays visible without
  // re-checking on every render — separate from featureTokens, which is the
  // permanent 31-day cloud-synced record of when each token was last spent.
  const [featureTrialActive,setFeatureTrialActive]=useState({});
  // featureKey: unique id for this specific feature's token cycle
  // label: human-readable name shown in the lock prompt
  // renderContent: function that renders the REAL feature UI once unlocked
  function renderWithFreeTrial(featureKey,label,renderContent){
    if(isSmart)return renderContent();
    if(featureTrialActive[featureKey])return renderContent();
    const canTry=canUseFeatureFree(featureKey);
    const daysLeft=daysUntilFeatureFree(featureKey);
    return(
      <div style={{padding:"16px",borderRadius:12,background:C.a3+"0d",border:"1px dashed "+C.a3+"44",textAlign:"center"}}>
        <div style={{fontSize:22,marginBottom:6}}>🔒</div>
        <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:4}}>{label} — Pro Smart Feature</div>
        {canTry?(
          <div>
            <div style={{fontSize:10,color:C.sub,marginBottom:10}}>You get one free use of this every 31 days.</div>
            <button onClick={function(){useFeatureToken(featureKey);setFeatureTrialActive(function(p){return {...p,[featureKey]:true};});}} style={{padding:"8px 18px",borderRadius:8,background:"linear-gradient(135deg,#4ade80,#22c55e)",border:"none",color:"#000",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit",marginRight:8}}>🎁 Use My Free Trial</button>
            <button onClick={function(){openUpgrade(featureKey);}} style={{padding:"8px 18px",borderRadius:8,background:"transparent",border:"1px solid "+C.a3+"55",color:C.a3,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Upgrade Instead →</button>
          </div>
        ):(
          <div>
            <div style={{fontSize:10,color:C.sub,marginBottom:10}}>You already used this month's free trial. Available again in {daysLeft} day{daysLeft===1?"":"s"}.</div>
            <button onClick={function(){openUpgrade(featureKey);}} style={{padding:"8px 18px",borderRadius:8,background:"linear-gradient(135deg,"+C.accent+","+C.a3+")",border:"none",color:"#000",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Upgrade to Pro Smart →</button>
          </div>
        )}
      </div>
    );
  }
  const storedFp=()=>{try{return localStorage.getItem("ciq_device_fp");}catch{return null;}};
  const deviceMismatch=(isPro||trialStart)&&storedFp()&&storedFp()!==deviceFp;

  const upgradeModal=()=>{
    if(!showUpgrade)return null;
    return(
      <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div style={{background:C.card,borderRadius:20,padding:"28px 22px",maxWidth:360,width:"100%",border:"1px solid "+C.border,boxShadow:"0 24px 60px rgba(0,0,0,0.6)"}}>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:36,marginBottom:8}}>🚛</div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:800,color:C.text,marginBottom:6}}>Unlock DrayageIQ</div>
            <div style={{fontSize:12,color:C.sub,lineHeight:1.6}}>{upgradeSrc==="ai"?"You've used your "+FREE_AI+" free AI messages.":upgradeSrc==="scorer"?"You've used your "+FREE_OS+" free offer scores.":"Upgrade to access the full decision engine."}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
            <button onClick={()=>window.open(PRICING.tier1Url,"_blank")} style={{padding:"14px",borderRadius:12,background:C.raised,border:"1px solid "+C.a3+"55",color:"#a78bfa",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}><div>📋 Go Standard — {PRICING.tier1Price}/month</div><div style={{fontSize:10,fontWeight:400,color:C.sub,marginTop:2}}>Unlimited scans · AI guidance · Cancel anytime</div></button>
            <button onClick={()=>window.open(PRICING.tier2Url,"_blank")} style={{padding:"16px",borderRadius:12,background:"linear-gradient(135deg,"+C.accent+","+C.a3+")",color:"#000",fontWeight:800,fontSize:14,border:"none",cursor:"pointer",fontFamily:"inherit"}}><div>⚡ Go Pro Smart — {PRICING.tier2Price}/month</div><div style={{fontSize:11,fontWeight:400,marginTop:3}}>Live diesel · Live weather · Smart AI · Cancel anytime</div></button>
            <button onClick={()=>window.open(PRICING.annualUrl,"_blank")} style={{padding:"14px",borderRadius:12,background:C.raised,border:"1px solid "+C.a3+"55",color:"#a78bfa",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}><div>📅 Go Annual — {PRICING.annualPrice}/year</div><div style={{fontSize:10,fontWeight:400,color:C.sub,marginTop:2}}>{PRICING.annualNote} · Cancel anytime</div></button>
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

  // ═══ AUTH GATE (login required) ═══
  if(!authChecked&&!isOwnerMode){
    return(<div style={{fontFamily:"'IBM Plex Mono',monospace",background:C.bg,minHeight:"100vh",color:C.sub,display:"flex",alignItems:"center",justifyContent:"center"}}>Loading…</div>);
  }
  if(!user&&!showWelcome&&!isOwnerMode){
    return(
      <div style={{background:"#080c16",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{color:"#00ffcc",fontFamily:"'IBM Plex Mono',monospace",fontSize:12}}>Loading...</div>
      </div>
    );
  }

  return(
    <div style={{fontFamily:"'IBM Plex Mono',monospace",background:C.bg,minHeight:"100vh",color:C.text}}>
      {upgradeModal()}
      {showOnboarding&&(
        <div style={{position:"fixed",inset:0,zIndex:10000,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 8px 70px"}} onClick={()=>{try{localStorage.setItem("ciq_onboarding_done","true");}catch(e){}setShowOnboarding(false);}}>
          <div style={{background:C.card,borderRadius:20,padding:"22px 18px",maxWidth:440,width:"100%",border:`1px solid ${C.accent}44`,boxShadow:`0 0 40px ${C.accent}22`,maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            {(()=>{
              const steps=[
                {icon:"👋",step:"Welcome",path:"all",title:"Welcome to DrayageIQ!",body:"Your personal trucking business command center. DrayageIQ reads your weekly settlement and shows you exactly where every dollar goes. You stop guessing. You start knowing.",tip:null,action:"Let's Go →"},
                {icon:"📊",step:"Tab 1 — DASH",path:"all",title:"DASH: Your Business Dashboard",body:"DASH is your home screen. At the top: YTD Gross (everything your carrier paid you), YTD Net (what you actually took home), total deductions, and your Avg RPM (revenue per mile). These 4 numbers tell the complete story of your business health.",tip:"💡 Tap any bar in the chart to zoom into that specific week — every card on the page updates instantly.",action:"Next →"},
                {icon:"📈",step:"DASH — Net Pay Trend",path:"all",title:"Weekly Net Pay Trend Chart",body:"Each bar is one settlement week. Taller = better week. The colored line traces the trend — green when pay went up, red when it dropped. This is your income history at a glance. Tap any bar and the entire dashboard syncs to that week.",tip:"💡 Look for patterns — if you always drop in certain months, that's a pattern you can plan around.",action:"Next →"},
                {icon:"🔍",step:"DASH — Deductions",path:"all",title:"Deduction Breakdown: Your Money Map",body:"Splits every dollar taken from your paycheck into 4 buckets: FUEL (red) — fuel advance spending, changes weekly. INSURANCE (purple) — fixed premiums: physical damage, bobtail, OccAcc, roadside. OPERATIONS (gold) — fixed fees: ELD, event recorder, license plate, parking. ESCROW (green) — YOUR savings held by carrier. Below that: your average fuel price per gallon, any fuel rebate earned, and a private Owner Notes box to jot down anything worth remembering about that week.",tip:"💡 Tap any bucket to see every line item. If insurance suddenly shows a different amount, contact your carrier — it may be a billing error.",action:"Next →"},
                {icon:"⛽",step:"DASH — Fuel vs Miles",path:"all",title:"Fuel vs Miles: Truck Health Monitor",body:"Calculates your real MPG from settlement data — actual gallons purchased divided by actual miles driven. Compare it to your baseline target. MPG dropping below your baseline for multiple weeks = early warning sign. Could be a tuneup, tire pressure, or excess idling needed.",tip:"💡 Adjust the Baseline MPG slider to match your truck's known performance for the most accurate analysis.",action:"Next →"},

                {icon:"🔧",step:"Manual Fuel Log",path:"all",title:"Track Your REAL MPG at the Pump",body:"Below Owner Notes in the Deduction Breakdown card, log your odometer reading every time you fuel up — Date, Odometer, Gallons, Cost. DrayageIQ automatically calculates miles driven and true MPG between fill-ups, no math needed. This is your own physical record, separate from the settlement's numbers.",tip:"💡 Compare your logged MPG against the settlement-reported MPG. If they're way off, that's worth investigating — either your truck needs attention or the settlement data has an error.",action:"Next →"},
                {icon:"🏆",step:"DASH — Week Grades",path:"all",title:"Week Grades: Your Weekly Report Card",body:"Every week gets a grade A through F based on your net margin, average RPM, loaded percentage, and trend. A = excellent. B = strong. C = average. D = below your own history. F = something went wrong — check that week's deductions and routes closely. Tap any grade pill to jump to that week.",tip:"💡 DrayageIQ grades you against YOUR own history, not other drivers. The grades reflect YOUR improvement over time.",action:"Next →"},
                {icon:"💰",step:"DASH — Escrow",path:"all",title:"Savings & Escrow: Your Money",body:"Escrow Regular builds toward a $2,500 target — this is YOUR money returned when you leave the carrier. 2290 Escrow covers your federal Heavy Highway Vehicle Use Tax. Both are savings, not fees. The progress bar shows how close you are to your escrow target.",tip:"💡 Never leave a carrier without requesting your escrow balance in writing. DrayageIQ tracks it week by week from your settlements.",action:"Next →"},
                {icon:"🚛",step:"DASH — Move Performance",path:"all",title:"Move Performance: Every Route Analyzed",body:"Shows every load from your settlement — LOAD (paid trip) and EMPTY (unpaid repositioning). DrayageIQ automatically detects round trips — when you go out and come back on the same route reversed — and combines them into one entry so your RPM reflects the true earnings for that trip, not two misleading halves. For each move: origin, destination, miles, rate, FSC, total pay, and RPM grade.",tip:"💡 Grade C moves drag your average down. Next time that load is offered, negotiate the rate or decline.",action:"Next →"},

                {icon:"🔄",step:"Why Round Trips Matter",path:"all",title:"One Trip, Not Two Misleading Halves",body:"Many drayage moves are really one round trip split into two settlement lines — an empty leg going out, a loaded leg coming back (or vice versa). If DrayageIQ reported these separately, the empty leg would look like a terrible $0-$100 'load' dragging down your average, when really it was just half of a normal, profitable trip. By matching legs on the same reversed route and nearby date, your RPM reflects reality.",tip:"💡 This is also why your AI Advisor always talks about round trips as ONE combined trip when answering questions about your routes.",action:"Next →"},
                {icon:"📋",step:"Tab 2 — ANALYZER",path:"all",title:"ANALYZER: Upload Your Settlements",body:"Tap the upload button, pick ONE settlement PDF from Downloads, and the AI reads it in under 30 seconds. No typing. No math. It finds every load, every deduction, every fuel advance, every mile. We keep this one-at-a-time on purpose — it means the AI gives its full attention to each document instead of rushing through a batch, so the numbers you get are as accurate as possible.",tip:"💡 Always review the scanned numbers before confirming. If anything looks off, you can re-scan or manually adjust before it saves.",action:"Next →"},

                {icon:"⚠️",step:"When Numbers Don't Match",path:"all",title:"The Mismatch Warning & Re-scan Button",body:"Sometimes the AI misses a line on a messy or unusual PDF. If the extracted deduction total doesn't match what the document actually shows, you'll see a red warning right in the Deduction Breakdown card for that week — along with a one-tap '🔄 Re-scan This Week' button that jumps straight back to the upload screen.",tip:"💡 This warning exists so you never trust incomplete numbers silently. If you see it, re-scan that week's PDF to fix it.",action:"Next →"},

                {icon:"⚡",step:"Instant Offer Scorer",path:"all",title:"Score Any Load Offer Before You Take It",body:"In the Document Analyzer tab, enter Miles, Rate, and FSC for any offer you're considering — before you even drive it. You'll get an instant A–D grade based mainly on your real rate-per-mile (RPM). A well-paid EMPTY leg scores just as well as a Loaded move at the same RPM — because less wear, less fuel burn, and less cargo risk make a paid empty a genuinely good outcome, not a lesser one.",tip:"💡 The score updates the moment you change any number — test a few rates before you call the broker back.",action:"Next →"},

                {icon:"🔄",step:"Combine an Empty Leg (Round Trip)",path:"all",title:"See the TRUE Round Trip Picture",body:"Many offers are really two legs — a paid load, plus an empty deadhead just to get there. In the Offer Scorer's Type dropdown, pick '🔄 Round Trip (Combine Empty)' and a second set of fields appears for that empty leg's Miles, Rate, and FSC. The tool combines both legs into one true blended RPM — so you see whether the WHOLE trip is worth it, not just the paid half.",tip:"💡 If the empty leg pays nothing, just enter 0 — you'll still see your real combined RPM once that deadhead mileage is factored in.",action:"Next →"},
                {icon:"🧠",step:"Tab 3 — AI",path:"smart",title:"AI Advisor: Ask Anything",body:"Ask real questions in plain English: 'What were my worst weeks?', 'How much did fuel cost me total?', 'Should I take a Baltimore to Hagerstown load at $200?'. It answers using YOUR actual data — not generic advice. Pro Smart members get an extra edge: every answer factors in today's actual national diesel price and the live weather at your location, so advice like 'is this load worth it' accounts for real conditions right now, not guesses.",tip:"💡 Try the quick-tap buttons for instant insights about your routes, RPM trends, and load profitability.",action:"Next →"},
                {icon:"🚀",step:"Tab 4 — GROWTH",path:"smart",title:"GROWTH: Build Your Business",body:"Business Health Score grades your overall operation. Weekly Action Plan gives you 2-3 specific things to do THIS week to improve. Offer Scorer tests any load offer instantly. Get Funded shows real lenders who work with 1099 income — based on your actual documented earnings.",tip:"💡 The Get Funded section uses your real YTD earnings to show loan amounts you likely qualify for. Real money to grow your business.",action:"Next →"},
                {icon:"💰",step:"Return on Spend",path:"smart",title:"1:3 Ideal, 1:1.5 Safe — Your Business Ratio",body:"Right below your Deduction Breakdown total, DrayageIQ shows a simple ratio: for every $1 you spent running your truck this week, how much revenue did you generate? A ratio of 1:3 or higher is IDEAL — you're producing $3+ per dollar spent. 1:1.5 is SAFE — still profitable, just tighter margins. Below that, your costs are eating too much into your revenue.",tip:"💡 This is the single fastest number to check your business health. If it's dropping week over week, dig into your Deduction Breakdown to find why.",action:"Next →"},

              {icon:"💡",step:"Smart Insights",path:"smart",title:"Smart Insights: Your Early Warning System",body:"Right in the Deduction Breakdown card, DrayageIQ compares this week's Fuel, Insurance, and Operations spending against your last 7 weeks. If any category jumps or drops more than 15%, you'll see an alert immediately — like 'Fuel up 23% vs your average'. There's also an Escrow Progress bar showing how close you are to your $2,500 target and how many weeks are left at your current pace.",tip:"💡 This catches problems early — a fee that suddenly doubled, or fuel spending that's creeping up — before it becomes a pattern you don't notice.",action:"Next →"},

              {icon:"🏦",step:"GROWTH — Get Funded",path:"all",title:"Turn Your Settlements Into Real Funding",body:"Every settlement you upload becomes verified, documented proof of income — the exact thing banks and lenders ask for but drivers rarely have organized. The Get Funded card (Growth tab) totals your real YTD earnings and shows actual lenders (equipment loans, working capital, lines of credit) matched to what you likely qualify for, based on YOUR numbers — not a guess. The more weeks you upload, the stronger your income history becomes.",tip:"🔒 Get Funded is a Pro Smart feature. Standard still gets the full Growth toolkit — Health Score, Weekly Action Plan, and Offer Scorer — and can upgrade anytime to unlock lender matching.",action:"Next →"},

              {icon:"📑",step:"GROWTH — Easier Paperwork",path:"smart",title:"DrayageIQ Does the Paperwork For You",body:"Lenders, factoring companies, and even new carriers often ask for proof of earnings, expense history, or a business summary. Instead of digging through old PDFs, DrayageIQ already has your gross, net, deductions, and mileage organized by week. Your data is ready to reference or export whenever someone asks 'show me your numbers' — no scrambling, no missing paperwork.",tip:"💡 Keeping every settlement scanned in DrayageIQ means you're always one tap away from proof of income, whether it's for a loan, an apartment, or a new carrier application.",action:"Next →"},

              {icon:"🩺",step:"GROWTH — Data Health",path:"smart",title:"Data Health: Trust Your Numbers",body:"At the top of the GROWTH tab, Data Health automatically scans EVERY week you've ever uploaded — not just the one you're viewing — checking if the extracted deduction totals match the settlement document. Shows '✅ All Clear' when everything's accurate, or lists exactly which weeks need attention and by how much.",tip:"💡 This is your safety net. Before you show your numbers to a lender or make a big decision based on your data, check Data Health first.",action:"Next →"},

              {icon:"⛽",step:"Fuel Surcharge Calculator",path:"smart",title:"Quote FSC With Confidence — No Math Required",body:"In the Document Analyzer tab, enter any linehaul rate and miles for a load you're considering — even work outside your regular carrier. The calculator instantly shows the fair FSC% AND the actual dollar amount to add, plus your full quote total ready to say out loud to a client. It factors in today's live diesel price, your real truck MPG, and a baseline diesel price you can adjust to match your own carrier's contract.",tip:"💡 Every carrier sets their own FSC baseline — check your carrier's FSC schedule and enter it in the calculator for the closest match. This tool gives you an independent, honest benchmark, not a guaranteed match to any specific carrier's table.",action:"Next →"},

              {icon:"🔥",step:"Hot Days",path:"smart",title:"Know Your Best Money Days",body:"The Hot Days card (Dashboard) reads the real ship dates on every move you've scanned and shows your average revenue per active day, for each day of the week. Your hottest day gets the 🔥 — push hard on those. Your slowest gets the 🧊 — that's your safest day to rest, do maintenance, or handle office work without leaving real money on the table. Filter by 4 weeks, 12 weeks, or all time to spot shifts.",tip:"💡 Patterns are personal — port schedules, your carrier's dispatch habits, and your own routine all shape them. Check after every few weeks of new data.",action:"Next →"},

              {icon:"🛣️",step:"Best Routes",path:"smart",title:"Know Which Lanes Deserve a Yes",body:"The Best Routes card (Office tab) ranks every lane you've run 2+ times by gross pay per mile — the honest way to compare a short port shuttle against a long highway run. Your 🔥 lanes are proven winners: take them every time. Your 🧊 lanes pay the least for the same wear, fuel, and hours — the ones worth declining or renegotiating. Both directions of a corridor count as one lane, so round trips are judged fairly.",tip:"💡 Pay-per-mile beats total pay for choosing between offers — a $400 load can be worse than a $250 one if it eats twice the miles.",action:"Next →"},

              {icon:"🛣️",step:"Best Routes",path:"smart",title:"Know Your Money Lanes",body:"Best Routes (Office tab) ranks every lane you've run 2+ times by real pay-per-mile from your settlements. Your 🔥 lane is proven profit — fight to keep it on your schedule. Your 🧊 lane is your weakest repeat route — now you can push back on it with your own numbers instead of a feeling. Same time filters as Hot Days: 4 weeks, 40 days, 100 days, or your full history.",tip:"💡 Hot Days tells you WHEN to run hard. Best Routes tells you WHERE. Together they turn your settlement pile into a game plan.",action:"Next →"},

              {icon:"🔎",step:"True FSC — Audit Your Vendor",path:"smart",title:"See If You're Being Paid Fairly",body:"In the Full History table (Document Analyzer tab), every move now shows two FSC columns: 'FSC Paid' (what your carrier actually gave you) and 'True FSC' (what a fair-market calculation says it should be, using the same live-diesel-price logic as the Calculator). Green means fair or generous. Red means you were underpaid on that specific move.",tip:"💡 Scroll through your history and look for patterns. If a route or vendor consistently shows red, that's real evidence to bring to a rate negotiation — or a signal to walk away from that lane.",action:"Next →"},

              {icon:"▼",step:"Collapsible Cards",path:"all",title:"Collapse Any Card to Save Space",body:"Every major card — Deduction Breakdown, Week Grades, Move Performance, Weekly Action Plan, and more — has a small ▼ arrow next to its title. Tap it to collapse the card down to just its header, or tap ▶ to expand it again. This keeps your screen clean and lets you focus on exactly what you need to see right now.",tip:"💡 On mobile especially, collapsing cards you don't need makes scrolling much faster.",action:"Next →"},

              {icon:"💎",step:"Choosing Your Plan",path:"all",title:"Standard vs Pro Smart — What's the Difference?",body:"Standard ($14.99/mo) covers everything you need to track your business: unlimited PDF scans, Deduction Breakdown, Move Performance, round trip detection, Week Grades, and Manual Fuel Log. Pro Smart ($24.99/mo) adds the intelligence layer: live diesel prices & weather, an AI that uses YOUR real numbers, Smart Insights alerts, Return on Spend ratio, auto-syncing MPG & fuel price, the Fuel Surcharge Calculator with True FSC vendor auditing, Data Health scanning, and the full Growth tab. Annual saves you 2 months.",tip:"💡 Look for the 🔒 lock icon — it marks Pro Smart features so you always know what's included in your plan.",action:"Next →"},

              {icon:"💳",step:"Canceling Is Easy",path:"all",title:"Cancel Anytime — For Real, In Two Taps",body:"We mean it when we say no contracts. Menu → Manage / Cancel Subscription opens your secure Stripe billing page — enter your email, tap the link Stripe sends you, and you can cancel, update your card, or download invoices yourself. No emailing support, no waiting, no retention games. Cancel and you keep access through the end of what you already paid for, then billing stops — guaranteed by Stripe, not by us remembering.",tip:"💡 Same page also fixes an expired card in seconds, so your data never lapses by accident.",action:"Next →"},

              {icon:"📊",step:"Export Your Reports",path:"smart",title:"Download Your Return on Spend + True FSC Report",body:"In the Full History table (Document Analyzer tab), tap 'Export Return on Spend + True FSC Report (CSV)' to download every move you've ever recorded — with fair-market FSC comparisons built in. Open it in Excel or Google Sheets, hand it to a broker during a rate negotiation, or keep it for your own accounting.",tip:"💡 This is live right now, not a future promise — try it after scanning a few weeks of settlements.",action:"Next →"},

              {icon:"💬",step:"Weekly Digest — Coming Soon",path:"smart",title:"Your Numbers, Sent Straight to Your Phone",body:"In Menu → Weekly Digest, Pro Smart users can already turn this on and save a phone number. Once fully live, you'll get a short WhatsApp or SMS message every week with your net pay, RPM, and any True FSC gap worth knowing — no need to open the app to stay on top of your numbers.",tip:"🔒 This feature is in active development. Your preference is saved now and will activate automatically the moment it launches — no extra setup needed later.",action:"Next →"},

              {icon:"🗺️",step:"See What's Coming Next",path:"all",title:"We Build in the Open",body:"Tap ≡ Menu → What's Coming Next anytime to see a live roadmap of features we're actively building — what's already shipped, what's in testing, and what's planned. We'd rather show you the real progress than surprise you with a locked feature you didn't know was coming.",tip:"💡 Have an idea for what we should build next? Message us on WhatsApp Support — we read every suggestion.",action:"Next →"},

              {icon:"🚀",step:"Invite a Driver",path:"all",title:"Get a Free Month — Share DrayageIQ",body:"In Menu → Invite a Driver, you'll find your own personal referral link. Share it with another driver — when they sign up, they get a free month of Pro Smart. Once they subscribe to any paid plan, YOU get a free month of your current plan too.",tip:"🔒 Automatic reward crediting is still in development — your link works and referrals are tracked now, but the free month is applied manually for the moment. Full automation is coming soon.",action:"Next →"},

              {icon:"🏢",step:"The Office",path:"smart",title:"Your Back-Office — Receipts & True Net",body:"The Office tab (bottom nav) is a dedicated workspace for the paperwork side of your business. Scan a receipt photo and AI reads the date, vendor, amount, and category automatically. Every expense you track gets subtracted from your settlement net pay to show your True Net — what you actually keep after real out-of-pocket costs like repairs, parts, and permits.",tip:"🔒 This is a Pro Smart feature currently in testing ahead of our next version release. Standard tier sees a preview with an upgrade option.",action:"Next →"},

              {icon:"🎁",step:"Try Any Pro Smart Feature Free",path:"all",title:"One Free Trial Every 31 Days — Per Feature",body:"Every Pro Smart feature is fully visible on Standard, never hidden. Tap any locked feature and you'll see '🎁 Use My Free Trial' — one free use, no card required, no commitment. Each feature has its own independent 31-day cycle, so trying the Fuel Surcharge Calculator today doesn't use up your trial for Return on Spend.",tip:"💡 This isn't a countdown trial that expires — it renews every 31 days, forever, feature by feature. Use it whenever it's useful to you.",action:"Next →"},


              {icon:"🚚",step:"Growing Your Fleet",path:"fleet",title:"Fleet Pricing — For Multiple Trucks",body:"Running more than one truck? Tap ≡ Menu → Fleet Pricing to see plans built for small fleets. As you add trucks, DrayageIQ scales with you — each truck's settlements get tracked separately, so you can compare performance across your whole operation, not just one unit.",tip:"💡 Fleet Pricing is marked NEW in the menu — worth a look even if you're solo today and thinking about expanding.",action:"Next →"},

              {icon:"☰",step:"The Menu",path:"all",title:"Your Menu: Profile, Plans & Support",body:"Tap ≡ Menu in the top right anytime. Under Account: your profile settings and plan details. Under App: dark/light mode and display settings. Under Discover: About DrayageIQ, Market Overview, Customer Reviews, and this tour. Under Support: direct WhatsApp help and our video tips channel.",tip:"💡 The menu also shows your current plan badge — ★ PRO SMART or ★ STANDARD — right at the top.",action:"Next →"},

              {icon:"👁",step:"Presenter Mode",path:"all",title:"Hide Your Email for Live Demos",body:"Showing DrayageIQ to a friend, driver, or on a screen share? Right next to your email at the top of the Menu, tap '👁 Presenter Mode' to instantly mask it as ●●●●●@●●●●●.com. Tap again anytime to unhide it. Your real data stays exactly as it is — this only hides your login email from view.",tip:"💡 Great for showing off the app at a truck stop or during a sales pitch without exposing your personal inbox.",action:"Next →"},

              {icon:"✅",step:"You're Ready!",path:"all",title:"You Know Everything Now",body:"Start by uploading your most recent settlement in the ANALYZER tab. Your numbers appear on DASH instantly. Come back every week after your settlement and DrayageIQ keeps track of everything. Tap ≡ Menu → How to Use DrayageIQ anytime for a refresher.",tip:"💡 Every card has a ? button. Tap it anytime for a plain-English reminder of what that card means.",action:"Start Using DrayageIQ ✓"},
              ];
              // Filter steps by chosen path. "all" steps show for everyone.
              // "smart" steps only for Pro Smart / Fleet. "fleet" steps only for Fleet.
              const filteredSteps=steps.filter(function(st){
                if(st.path==="all")return true;
                if(onboardPath==="fleet")return true;// fleet sees everything (smart + fleet + all)
                if(onboardPath==="smart")return st.path==="smart";
                return false;// standard path sees only "all" steps
              });
              const s=filteredSteps[onboardStep];
              const total=filteredSteps.length;

              // ═══ PATH PICKER — shown first, before any tour step ═══
              if(onboardPath===null){
                const pathOptions=[
                  {key:"standard",icon:"📋",name:"Standard",desc:"Core tracking: unlimited scans, deductions, move performance, fuel log.",color:C.a3},
                  {key:"smart",icon:"🧠",name:"Pro Smart",desc:"Everything in Standard, PLUS live data, AI insights, Return on Spend, and the Growth tab.",color:"#00ffcc"},
                  {key:"fleet",icon:"🚚",name:"Fleet Pro Smart",desc:"Everything in Pro Smart, PLUS multi-truck fleet tools and reporting.",color:"#fbbf24"},
                ];
                return(
                  <div>
                    <div style={{textAlign:"center",marginBottom:16}}>
                      <div style={{fontSize:28,marginBottom:8}}>🧭</div>
                      <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:6}}>Choose Your Path</div>
                      <div style={{fontSize:11,color:C.sub,lineHeight:1.5}}>Pick what matches how you work — we'll only show you what's relevant. Every feature is visible either way, with a free monthly trial on anything locked.</div>
                    </div>
                    {pathOptions.map(function(p){
                      return(
                        <div key={p.key} onClick={()=>{setOnboardPath(p.key);setOnboardStep(0);}} style={{padding:"14px",borderRadius:12,background:p.color+"0d",border:"1px solid "+p.color+"44",marginBottom:10,cursor:"pointer"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                            <span style={{fontSize:18}}>{p.icon}</span>
                            <span style={{fontSize:13,fontWeight:800,color:C.text}}>{p.name}</span>
                          </div>
                          <div style={{fontSize:10,color:C.sub,lineHeight:1.5}}>{p.desc}</div>
                        </div>
                      );
                    })}
                    <div onClick={()=>{try{localStorage.setItem("ciq_onboarding_done","true");}catch(e){}setShowOnboarding(false);}} style={{textAlign:"center",fontSize:11,color:C.sub,cursor:"pointer",marginTop:8,textDecoration:"underline"}}>Skip tour</div>
                  </div>
                );
              }

              return(
                <div>
                  <div style={{display:"flex",justifyContent:"center",gap:5,marginBottom:14,flexWrap:"wrap"}}>
                    {filteredSteps.map((_,i)=>(
                      <div key={i} onClick={()=>setOnboardStep(i)} style={{width:i===onboardStep?18:6,height:6,borderRadius:3,background:i===onboardStep?C.accent:i<onboardStep?C.accent+"66":C.border,transition:"all 0.2s",cursor:"pointer"}}/>
                    ))}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <div style={{fontSize:28,flexShrink:0}}>{s.icon}</div>
                    <div>
                      <div style={{fontSize:9,fontWeight:700,color:C.accent,letterSpacing:"0.1em",textTransform:"uppercase"}}>{s.step} · {onboardStep+1}/{total}</div>
                      <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:800,color:C.text,lineHeight:1.1,marginTop:2}}>{s.title}</div>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:C.sub,lineHeight:1.75,marginBottom:s.tip?10:14}}>{s.body}</div>
                  {s.tip&&<div style={{padding:"8px 11px",borderRadius:8,background:`${C.gold}12`,border:`1px solid ${C.gold}33`,fontSize:10,color:C.gold,lineHeight:1.5,marginBottom:14}}>{s.tip}</div>}
                  {s.step==="Choosing Your Plan"&&onboardPath==="standard"&&(
                    <div onClick={()=>{setOnboardPath("smart");setOnboardStep(0);}} style={{padding:"10px 12px",borderRadius:9,background:"#00ffcc12",border:"1px solid #00ffcc44",marginBottom:14,cursor:"pointer",textAlign:"center"}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#00ffcc"}}>🧠 Want to see what Pro Smart offers?</div>
                      <div style={{fontSize:9,color:C.sub,marginTop:2}}>Tap to explore the Pro Smart tour — no commitment</div>
                    </div>
                  )}
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    {onboardStep>0&&<button onClick={()=>setOnboardStep(p=>p-1)} style={{padding:"10px 14px",borderRadius:10,background:C.raised,border:`1px solid ${C.border}`,color:C.sub,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>←</button>}
                    <button onClick={()=>{if(onboardStep<total-1){setOnboardStep(p=>p+1);}else{try{localStorage.setItem("ciq_onboarding_done","true");}catch(e){}setShowOnboarding(false);}}} style={{flex:1,padding:"12px",borderRadius:10,background:`linear-gradient(135deg,${C.accent},${C.a3})`,border:"none",color:"#000",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{s.action}</button>
                  </div>
                  {onboardStep<total-1&&<div onClick={()=>{try{localStorage.setItem("ciq_onboarding_done","true");}catch(e){}setShowOnboarding(false);}} style={{textAlign:"center",marginTop:10,fontSize:10,color:C.sub,cursor:"pointer",padding:"4px"}}>Skip tour</div>}
                </div>
              );
            })()}
          </div>
        </div>
      )}

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
              {[{name:"Nelle Kigembe",role:"Licensed Insurance Producer",zone:"🌊 West Coast",color:"#a78bfa",link:"https://calendly.com/nellekigembe/60min?utm_source=drayageiq&utm_medium=app&utm_campaign=protect_income"},{name:"Wemma Kigembe",role:"Licensed Producer · DrayageIQ Founder",zone:"🏛️ DMV Area",color:"#00ffcc",link:"https://calendly.com/wkigembe-crvm/30min?utm_source=drayageiq&utm_medium=app&utm_campaign=protect_income"}].map(ag=>(
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
              <div style={{fontSize:11,color:C.sub,lineHeight:1.7}}>Open DrayageIQ on your other device → Menu → Transfer Data via QR → Scan this code</div>
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
                  <button onClick={async()=>{
                    if(!reviewForm.name.trim()||!reviewForm.text.trim())return;
                    const optimistic={...reviewForm,date:new Date().toLocaleDateString("en-US",{month:"short",year:"numeric"})};
                    setReviews(p=>[optimistic,...p]);// show immediately
                    setReviewForm({name:"",role:"",stars:5,text:""});
                    setAddingReview(false);
                    try{
                      const c=getSB();
                      if(c){
                        await c.from("public_reviews").insert({name:optimistic.name,role:optimistic.role,stars:optimistic.stars,text:optimistic.text});
                      }
                    }catch(e){}
                  }} style={{flex:1,padding:"11px",borderRadius:10,background:`linear-gradient(135deg,${C.accent},${C.a3})`,color:"#000",fontSize:12,fontWeight:800,border:"none",cursor:"pointer",fontFamily:"inherit"}}>✅ Submit</button>
                  <button onClick={()=>setAddingReview(false)} style={{padding:"11px 16px",borderRadius:10,background:C.raised,border:`1px solid ${C.border}`,color:C.sub,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                </div>
              </div>
            )}
            {reviewsLoading&&<div style={{textAlign:"center",padding:"32px 16px",color:C.sub,fontSize:12}}>Loading reviews...</div>}
            {!reviewsLoading&&reviews.length===0&&!addingReview&&<div style={{textAlign:"center",padding:"32px 16px",color:C.sub}}><div style={{fontSize:40,marginBottom:12}}>⭐</div><div style={{fontSize:14,fontWeight:700,color:C.text}}>Be the first to review!</div></div>}
            {!reviewsLoading&&reviews.length>0&&<div style={{fontSize:9,color:C.sub,marginBottom:12,textAlign:"center"}}>🌐 Reviews are shared publicly with all DrayageIQ users</div>}
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
            {[
              {tier:"Standard",trucks:"1 truck",price:"$14.99",period:"/mo",color:"#a78bfa",tag:"Tier 1",url:"https://buy.stripe.com/14A9ATbW1aIU2M2gKq9MY03",features:["Unlimited PDF scans","Load & mile tracking","Earnings dashboard","AI trucking guidance"]},
              {tier:"Pro Smart",trucks:"1 truck",price:"$24.99",period:"/mo",color:"#00ffcc",tag:"⭐ Most Popular",url:"https://buy.stripe.com/fZu5kDe498AM2M2am29MY04",features:["Everything in Standard","Live diesel prices","Live weather on routes","Smart AI with your real numbers","Load profitability math"]},
              {tier:"Fleet Pro Smart",trucks:"Up to 5 trucks",price:PRICING.fleetPrice,period:"/mo",color:"#4ade80",tag:"⭐ Best Value",url:PRICING.fleetUrl,features:["Everything in Pro Smart","Multi-unit dashboard","Per-truck performance","Fleet-wide totals","One flat rate — no per-truck math"]},
              {tier:"Growing Fleet",trucks:"6–10 trucks",price:PRICING.growingFleetPrice,period:"/mo",color:"#f87171",tag:"Fleet",url:PRICING.growingFleetUrl,features:["Everything in Fleet Pro Smart","Advanced fleet analytics","Quarterly performance report","Phone support"]},
              {tier:"Enterprise",trucks:"11+ trucks",price:"Custom",period:"",color:"#e879f9",tag:"🚀 Enterprise",url:"https://wa.me/14438564727?text=Hi%2C+I%27m+interested+in+DrayageIQ+Enterprise+pricing+for+11%2B+trucks",features:["Everything above","Unlimited trucks","White-label option","Dedicated account manager","Custom integrations"]},
            ].map(p=>(
              <div key={p.tier} style={{background:C.card,borderRadius:16,padding:"18px",marginBottom:14,border:`2px solid ${p.color}44`,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${p.color},${p.color}44)`}}/>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:800,color:C.text}}>{p.tier}</div><div style={{fontSize:11,color:C.sub,marginTop:2}}>🚛 {p.trucks}</div></div>
                  <div style={{textAlign:"right"}}><div style={{padding:"3px 10px",borderRadius:20,background:`${p.color}20`,border:`1px solid ${p.color}44`,color:p.color,fontSize:9,fontWeight:800,marginBottom:6}}>{p.tag}</div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,fontWeight:800,color:p.color}}>{p.price}<span style={{fontSize:11}}>{p.period}</span></div></div>
                </div>
                {p.features.map(feat=><div key={feat} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}><span style={{color:p.color,fontSize:11,fontWeight:800,flexShrink:0}}>✓</span><span style={{fontSize:11,color:C.sub}}>{feat}</span></div>)}
                <button onClick={()=>window.open(p.url,"_blank")} style={{width:"100%",marginTop:14,padding:"12px",borderRadius:10,background:`linear-gradient(135deg,${p.color}22,${p.color}11)`,border:`2px solid ${p.color}55`,color:p.color,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",letterSpacing:"0.04em"}}>{p.price==="Custom"?"Contact Us →":`Get ${p.tier} →`}</button>
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
              <img src={LOGO_BANNER} alt="DrayageIQ" style={{width:"100%",maxWidth:360,height:"auto",borderRadius:10,marginBottom:14}}/>
              <div style={{fontSize:11,color:C.sub,lineHeight:1.8,marginBottom:10}}>Your personal profit analyst — built for every gig worker who deserves to know the truth about their business.</div>
              <div style={{display:"inline-block",padding:"4px 12px",borderRadius:20,background:C.accent+"15",border:"1px solid "+C.accent+"33",fontSize:10,fontWeight:700,color:C.accent}}>Version {APP_VERSION} · {APP_VERSION_DATE}</div>
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
              <div style={{marginBottom:wide?40:26}}>
                <img src={LOGO_HERO} alt="DrayageIQ" style={{width:"100%",maxWidth:wide?420:300,height:"auto",display:"block",filter:"drop-shadow(0 0 30px rgba(0,255,204,0.15))"}}/>
                
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

              {/* Proof-point callout — the real differentiator, visible above the fold */}
              <div style={{padding:"10px 14px",background:"rgba(251,191,36,0.06)",borderRadius:10,border:"1px solid rgba(251,191,36,0.25)",marginBottom:wide?20:16,display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:18,flexShrink:0}}>🔎</span>
                <div style={{fontSize:11,color:"#fbbf24",fontWeight:700,lineHeight:1.5}}>Find out if your carrier is lowballing your fuel surcharge — in 30 seconds. No one else checks this for you.</div>
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

              {/* Secondary CTA — for skeptical visitors who want to understand the tool first */}
              <button onClick={()=>{setOnboardStep(0);setOnboardPath(null);setShowOnboarding(true);}} style={{width:"100%",padding:"13px 18px",borderRadius:12,background:"rgba(167,139,250,0.08)",border:"1px solid rgba(167,139,250,0.3)",color:"#c4b5fd",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",marginBottom:6,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <span style={{fontSize:16}}>🎓</span>
                <span>See How It Works — 2 Minute Tour</span>
              </button>
              <div style={{fontSize:9,color:"#5a7085",textAlign:"center",marginBottom:wide?18:14,lineHeight:1.5}}>Note: many features shown (live data, Smart Insights, Return on Spend, auto-sync) are part of <b style={{color:"#00ffcc"}}>Pro Smart</b>. Standard includes core scanning &amp; tracking.</div>

              {/* Trust strip */}
              <div style={{padding:"8px 14px",background:"rgba(0,255,204,0.05)",borderRadius:9,border:"1px solid rgba(0,255,204,0.2)",marginBottom:wide?12:10,textAlign:"center"}}>
                <div style={{fontSize:10,fontWeight:700,color:"#8fa3c0"}}>💳 Billed monthly or annually · Cancel anytime · No contracts</div>
              </div>

              {/* Social proof — real reviews from Supabase, or honest early-adopter framing if none yet */}
              <div style={{marginBottom:wide?18:14}}>
                {reviews&&reviews.length>0?(
                  <div style={{padding:"12px 14px",background:"rgba(255,255,255,0.03)",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)"}}>
                    <div style={{fontSize:9,fontWeight:700,color:"#6a8099",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>⭐ What Drivers Are Saying ({reviews.length})</div>
                    {reviews.slice(0,1).map(function(r,i){
                      return(
                        <div key={i}>
                          <div style={{fontSize:11,color:"#c8d4e6",fontStyle:"italic",lineHeight:1.6,marginBottom:6}}>"{r.text}"</div>
                          <div style={{fontSize:10,color:"#8fa3c0"}}>— {r.name}{r.role?", "+r.role:""} {"⭐".repeat(r.stars||5)}</div>
                        </div>
                      );
                    })}
                  </div>
                ):(
                  <div style={{padding:"12px 14px",background:"rgba(167,139,250,0.05)",borderRadius:10,border:"1px dashed rgba(167,139,250,0.3)",textAlign:"center"}}>
                    <div style={{fontSize:11,color:"#c4b5fd",fontWeight:700,marginBottom:2}}>🚀 Be one of our first drivers</div>
                    <div style={{fontSize:9,color:"#6a8099"}}>DrayageIQ is brand new — early users get to shape what we build next.</div>
                  </div>
                )}
              </div>

              {/* Plan grid 2×2 */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:wide?22:16}}>

                {/* Standard */}
                <div onClick={()=>window.open(PRICING.tier1Url,"_blank")} style={{background:"rgba(167,139,250,0.05)",border:"1px solid rgba(167,139,250,0.22)",borderRadius:13,padding:"15px 12px",cursor:"pointer",textAlign:"center"}}>
                  <div style={{fontSize:22,marginBottom:6}}>📋</div>
                  <div style={{fontSize:11,fontWeight:800,color:"#a78bfa",marginBottom:3}}>Standard</div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:800,color:"#a78bfa",margin:"3px 0 4px"}}>{PRICING.tier1Price}<span style={{fontSize:9,fontWeight:400,color:"#4a6080"}}> /mo</span></div>
                  <div style={{fontSize:9,color:"#4a6080",lineHeight:1.55}}>Unlimited scans<br/>AI guidance</div>
                </div>

                {/* Pro Smart — hero card */}
                <div onClick={()=>window.open(PRICING.tier2Url,"_blank")} style={{background:"linear-gradient(145deg,rgba(0,255,204,0.07),rgba(167,139,250,0.07))",border:"2px solid #00ffcc",borderRadius:13,padding:"15px 12px",cursor:"pointer",textAlign:"center",position:"relative",boxShadow:"0 0 22px rgba(0,255,204,0.18)"}}>
                  <div style={{position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#00ffcc,#a78bfa)",borderRadius:20,padding:"2px 11px",fontSize:8,fontWeight:800,color:"#000",whiteSpace:"nowrap"}}>⭐ POPULAR</div>
                  <div style={{fontSize:22,marginBottom:4}}>💰</div>
                  <div style={{fontSize:11,fontWeight:800,color:"#00ffcc",marginBottom:2}}>Pro Smart</div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:800,color:"#00ffcc",margin:"2px 0"}}>{PRICING.tier2Price}</div>
                  <div style={{fontSize:9,color:"#00ffcc",opacity:0.6,marginBottom:4}}>/month</div>
                  <div style={{fontSize:9,color:"#4a6080",lineHeight:1.55}}>Live data<br/>Smart AI</div>
                </div>

                {/* Annual */}
                <div onClick={()=>window.open(PRICING.annualUrl,"_blank")} style={{background:"rgba(251,191,36,0.05)",border:"1px solid rgba(251,191,36,0.22)",borderRadius:13,padding:"15px 12px",cursor:"pointer",textAlign:"center"}}>
                  <div style={{fontSize:22,marginBottom:6}}>📅</div>
                  <div style={{fontSize:11,fontWeight:800,color:"#fbbf24",marginBottom:3}}>Annual</div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:800,color:"#fbbf24",margin:"3px 0 4px"}}>{PRICING.annualPrice}<span style={{fontSize:9,fontWeight:400,color:"#4a6080"}}> /yr</span></div>
                  <div style={{fontSize:9,color:"#4a6080",lineHeight:1.55}}>{PRICING.annualNote}<br/>Cancel anytime</div>
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
                <div style={{fontSize:10,color:"#fbbf24",lineHeight:1.65}}><strong>One avoided bad load = $300–$800 back in your pocket.</strong> DrayageIQ pays for itself immediately.</div>
              </div>

              {/* SIGN IN FORM — embedded at bottom of welcome screen */}
              <div style={{marginTop:wide?24:20,padding:"20px",background:"rgba(0,255,204,0.04)",borderRadius:14,border:"1px solid rgba(0,255,204,0.15)"}}>
                <div style={{fontSize:11,fontWeight:800,color:"#00ffcc",letterSpacing:"0.06em",marginBottom:4,textAlign:"center"}}>ALREADY HAVE AN ACCOUNT?</div>
                <div style={{fontSize:10,color:"#4a6080",textAlign:"center",marginBottom:14,lineHeight:1.5}}>Enter your email to get a sign-in link — no password needed.</div>
                {!authSent?(
                  <div>
                    <input value={authEmail} onChange={e=>setAuthEmail(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")sendMagicLink();}} placeholder="you@email.com" type="email" autoComplete="email" style={{width:"100%",padding:"12px",borderRadius:9,background:"#0d1420",border:"1px solid rgba(0,255,204,0.2)",color:"#e2e8f0",fontSize:13,boxSizing:"border-box",fontFamily:"inherit",outline:"none",marginBottom:10,textAlign:"center"}}/>
                    <button onClick={sendMagicLink} disabled={authBusy} style={{width:"100%",padding:"13px",borderRadius:9,background:"linear-gradient(135deg,#00ffcc,#00d4aa)",color:"#000",fontWeight:800,fontSize:13,border:"none",cursor:authBusy?"default":"pointer",fontFamily:"inherit",opacity:authBusy?0.6:1}}>{authBusy?"Sending…":"Email me a sign-in link →"}</button>
                    {authMsg&&<div style={{fontSize:11,color:authMsg.startsWith("Error")?"#f87171":"#8fa3c0",marginTop:8,textAlign:"center"}}>{authMsg}</div>}
                  </div>
                ):(
                  <div style={{textAlign:"center",padding:"10px 0"}}>
                    <div style={{fontSize:24,marginBottom:8}}>📬</div>
                    <div style={{fontSize:12,fontWeight:700,color:"#00ffcc",marginBottom:6}}>Check your email!</div>
                    <div style={{fontSize:11,color:"#6a8099",lineHeight:1.6,marginBottom:12}}>Sent a link to <b style={{color:"#e2e8f0"}}>{authEmail}</b> — open it to sign in.</div>
                    <button onClick={()=>{setAuthSent(false);setAuthMsg("");}} style={{padding:"8px 16px",borderRadius:8,background:"transparent",border:"1px solid #1a2535",color:"#8fa3c0",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>← Try different email</button>
                  </div>
                )}
              </div>

              <div style={{fontSize:9,color:"#1e2a3a",textAlign:"center",marginTop:16}}>© 2026 DrayageIQ · getdrayageiq.com · v{APP_VERSION} ({APP_VERSION_DATE}) · <a href="/privacy" style={{color:"#1e2a3a",textDecoration:"none"}}>Privacy</a> · <a href="/terms" style={{color:"#1e2a3a",textDecoration:"none"}}>Terms</a></div>
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
                  Built for Independent Truckers — Drayage, Solo Owner-Operators, Short Haul, Long Haul.
                </p>

                {/* PRICING TIERS */}
                <div style={{fontSize:10,fontWeight:700,color:"#a78bfa",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>Choose Your Plan</div>
                <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
                  {/* Tier 1 */}
                  <div style={{background:"rgba(167,139,250,0.06)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:12,padding:"14px 16px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:800,color:"#d0daf0"}}>Standard</div>
                      <div style={{fontSize:14,fontWeight:800,color:"#a78bfa"}}>{PRICING.tier1Price}<span style={{fontSize:9,fontWeight:400,color:"#5a7590"}}>/mo</span></div>
                    </div>
                    <div style={{fontSize:10,color:"#5a7590",lineHeight:1.6,marginBottom:10}}>Unlimited PDF scans · Load tracking · Earnings dashboard · AI trucking guidance</div>
                    <a href={PRICING.tier1Url} target="_blank" rel="noreferrer" style={{display:"block",textAlign:"center",padding:"8px",borderRadius:8,background:"rgba(167,139,250,0.15)",border:"1px solid rgba(167,139,250,0.35)",color:"#a78bfa",fontSize:11,fontWeight:700,textDecoration:"none"}}>Get Standard →</a>
                  </div>
                  {/* Tier 2 */}
                  <div style={{background:"rgba(0,255,204,0.06)",border:"1px solid rgba(0,255,204,0.25)",borderRadius:12,padding:"14px 16px",position:"relative"}}>
                    <div style={{position:"absolute",top:-9,right:12,background:"linear-gradient(135deg,#00ffcc,#00d4aa)",borderRadius:20,padding:"2px 10px",fontSize:8,fontWeight:800,color:"#080c16",letterSpacing:"0.08em"}}>MOST POPULAR</div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:800,color:"#d0daf0"}}>Pro Smart</div>
                      <div style={{fontSize:14,fontWeight:800,color:"#00ffcc"}}>{PRICING.tier2Price}<span style={{fontSize:9,fontWeight:400,color:"#5a7590"}}>/mo</span></div>
                    </div>
                    <div style={{fontSize:10,color:"#5a7590",lineHeight:1.6,marginBottom:10}}>Everything in Standard + Live diesel prices · Live weather · Smart AI with your real numbers · Load profitability math</div>
                    <a href={PRICING.tier2Url} target="_blank" rel="noreferrer" style={{display:"block",textAlign:"center",padding:"8px",borderRadius:8,background:"linear-gradient(135deg,rgba(0,255,204,0.2),rgba(0,212,170,0.2))",border:"1px solid rgba(0,255,204,0.4)",color:"#00ffcc",fontSize:11,fontWeight:700,textDecoration:"none"}}>Get Pro Smart →</a>
                  </div>
                  {/* Annual */}
                  <div style={{background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:12,padding:"12px 16px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:800,color:"#d0daf0"}}>Pro Smart Annual</div>
                      <div style={{fontSize:13,fontWeight:800,color:"#fbbf24"}}>{PRICING.annualPrice}<span style={{fontSize:9,fontWeight:400,color:"#5a7590"}}>/yr</span></div>
                    </div>
                    <div style={{fontSize:10,color:"#5a7590",marginBottom:8}}>{PRICING.annualNote}</div>
                    <a href={PRICING.annualUrl} target="_blank" rel="noreferrer" style={{display:"block",textAlign:"center",padding:"7px",borderRadius:8,background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.3)",color:"#fbbf24",fontSize:11,fontWeight:700,textDecoration:"none"}}>Get Annual →</a>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* DEV MODE BANNER — unmissable visual distinction from the real production site */}
      {isOwnerMode&&(
        <div style={{background:"repeating-linear-gradient(45deg,#fbbf24,#fbbf24 10px,#000 10px,#000 20px)",padding:"4px 0",textAlign:"center"}}>
          <span style={{background:"#000",color:"#fbbf24",fontSize:10,fontWeight:800,padding:"2px 14px",borderRadius:20,letterSpacing:"0.05em"}}>🧪 DEV / TESTING SITE — not your real account</span>
        </div>
      )}

      {/* FLEET UPGRADE WELCOME — shown once after successful Stripe checkout redirect */}
      {showUpgradeWelcome&&(
        <div style={{background:"linear-gradient(135deg,#4ade8022,#00ffcc18)",borderBottom:"1px solid #4ade8055",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
          <div>
            <div style={{fontSize:12,color:"#4ade80",fontWeight:800}}>🎉 Welcome to {upgradedTier==="growingfleet"?"Growing Fleet":"Fleet Pro Smart"}!</div>
            <div style={{fontSize:10,color:C.sub,marginTop:2}}>{upgradedTier==="growingfleet"?"Your fleet tools are now unlocked — track up to 10 trucks with advanced analytics and phone support.":"Your fleet tools are now unlocked — track up to 5 trucks separately."}</div>
          </div>
          <button onClick={()=>setShowUpgradeWelcome(false)} style={{padding:"5px 11px",borderRadius:7,background:"#4ade8022",border:"1px solid #4ade8055",color:"#4ade80",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:700,flexShrink:0}}>Got it →</button>
        </div>
      )}

      {/* DEVICE MISMATCH */}
      {deviceMismatch&&!user&&(<div style={{background:C.accent+"12",borderBottom:"1px solid "+C.accent+"33",padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}><div style={{fontSize:11,color:C.accent,fontWeight:700}}>👋 New device? Sign in with your email to restore your subscription — takes 10 seconds.</div><button onClick={()=>{setShowWelcome(true);}} style={{padding:"5px 12px",borderRadius:6,background:C.accent+"22",border:"1px solid "+C.accent+"55",color:C.accent,fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:700,whiteSpace:"nowrap"}}>Sign In</button></div>)}

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
          {/* TradingView Web Component ticker tape — live prices, auto-scrolls */}
          <TVTickerTape key={tickerSyms.map(s=>s.proName).join(",")} symbols={tickerSyms}/>
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
            <img src={LOGO_ICON} alt="DrayageIQ" style={{width:52,height:52,flexShrink:0,filter:"drop-shadow(0 0 8px rgba(0,255,204,0.4))"}}/>
            <div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:15,background:"linear-gradient(135deg,#ffffff,#a5f3fc,#c4b5fd)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>DrayageIQ</div>
              <div style={{fontSize:10,color:C.sub,display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                <span>{hideOwnerName?"●●●●●":demoMode?"Demo Driver":(profile.name||"Your Business")} · {allW.length>0?allW.length+" weeks":"No data yet"}</span>
                {user&&syncStatus==="saved"&&<span style={{color:C.green,fontWeight:700,fontSize:9}}>✅ Data saved{lastSyncTime?" "+lastSyncTime.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):""}</span>}
                {user&&syncStatus==="saving"&&<span style={{color:C.gold,fontWeight:700,fontSize:9}}>⏳ Saving...</span>}
                {user&&syncStatus==="error"&&<span style={{color:C.red,fontWeight:800,fontSize:9}}>⚠️ NOT SAVED — tap Menu</span>}
                {!user&&isOwnerMode&&<span style={{color:C.sub,fontWeight:700,fontSize:9}}>⚠️ Dev Mode — no cloud backup</span>}
              </div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:4,marginBottom:2}}>
              <div style={{fontSize:10,color:C.sub}}>YTD Gross</div>
            </div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:800,color:C.accent}}>${tGross.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <div style={{display:"flex",gap:6,alignItems:"center",overflowX:"auto",scrollbarWidth:"none",flex:1}}>
            <TB t="dashboard" l="📊 Dash"/>
            <TB t="loads" l="📋 Docs"/>
            <TB t="ai" l="🧠 AI"/>
            <TB t="growth" l="🚀 Growth"/>
            <button onClick={()=>setShowInsurance(true)} style={{padding:"8px 12px",borderRadius:8,background:"linear-gradient(135deg,#a78bfa22,#6d28d922)",border:"2px solid #a78bfa",boxShadow:"0 0 12px #a78bfa33",color:"#a78bfa",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0,whiteSpace:"nowrap"}}>🛡️ Protect</button>
            <button onClick={()=>setFocusMode(p=>!p)} style={{padding:"8px 12px",borderRadius:8,background:focusMode?C.gold:`${C.gold}22`,border:`2px solid ${C.gold}`,color:focusMode?"#000":C.gold,fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"inherit",flexShrink:0,whiteSpace:"nowrap"}}>{focusMode?"⚡ ON":"⚡ Focus"}</button>
          </div>
          <div style={{display:"flex",gap:5,alignItems:"center",flexShrink:0}}>
            <div style={{position:"relative"}}>
              <button onClick={()=>setShowMenu(p=>!p)} style={{padding:"8px 12px",borderRadius:8,background:showMenu?`${C.a3}22`:C.raised,border:`1px solid ${showMenu?C.a3:C.border}`,color:showMenu?C.a3:C.sub,fontSize:10,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5,fontWeight:700,whiteSpace:"nowrap"}}>
                <span>☰</span><span>Menu</span>
              </button>
              {showMenu&&(
                <>
                <div style={{position:"fixed",inset:0,zIndex:9998}} onClick={()=>setShowMenu(false)}/>
                <div style={{position:"fixed",top:58,right:8,bottom:60,width:Math.min(window.innerWidth-16,300),background:C.card,border:`1px solid ${C.border}`,borderRadius:16,zIndex:9999,boxShadow:"0 8px 40px rgba(0,0,0,0.8)",display:"flex",flexDirection:"column",overflow:"hidden"}}><div style={{flex:1,minHeight:0,height:0,overflowY:"scroll",WebkitOverflowScrolling:"touch",padding:"8px 6px 20px"}}>

                  {/* Brand banner — shown at top of menu when opened */}
                  <div style={{padding:"4px 2px 10px"}}>
                    <img src={LOGO_BANNER} alt="DrayageIQ" style={{width:"100%",height:"auto",borderRadius:8,display:"block"}}/>
                  </div>

                  {/* Account header */}
                  <div style={{padding:"10px 12px",marginBottom:8,background:`${C.accent}10`,border:`1px solid ${C.accent}25`,borderRadius:10,margin:"0 2px 8px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                      <span style={{fontSize:8,color:C.sub,letterSpacing:"0.08em"}}>SIGNED IN</span><span style={{fontSize:8,color:C.sub,marginLeft:6,opacity:0.7}}>v{APP_VERSION}</span>
                      <button onClick={()=>setHideEmail(p=>!p)} style={{display:"flex",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",padding:0}}>
                        <span style={{fontSize:8,color:hideEmail?C.accent:C.sub,fontWeight:700}}>{hideEmail?"🙈 Hidden":"👁 Presenter Mode"}</span>
                        <div style={{width:26,height:14,borderRadius:8,background:hideEmail?C.accent:C.border,position:"relative",flexShrink:0}}><div style={{width:10,height:10,borderRadius:"50%",background:"white",position:"absolute",top:2,left:hideEmail?14:2,transition:"left 0.15s"}}/></div>
                      </button>
                    </div>
                    <div style={{fontSize:11,color:C.text,fontWeight:700,wordBreak:"break-all",marginBottom:4}}>{hideEmail?"●●●●●@●●●●●.com":(user?.email||"Dev Mode")}</div>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:4}}>
                      {isSmart&&<span style={{fontSize:8,fontWeight:800,color:"#00ffcc",background:"#00ffcc18",border:"1px solid #00ffcc33",borderRadius:20,padding:"1px 7px"}}>★ PRO SMART</span>}
                      {isPro&&!isSmart&&<span style={{fontSize:8,fontWeight:800,color:"#a78bfa",background:"#a78bfa18",border:"1px solid #a78bfa33",borderRadius:20,padding:"1px 7px"}}>★ STANDARD</span>}
                      {previewAsStandard&&<span style={{fontSize:8,fontWeight:800,color:"#fbbf24",background:"#fbbf2418",border:"1px solid #fbbf2444",borderRadius:20,padding:"1px 7px"}}>👁 PREVIEWING STANDARD</span>}
                    </div>
                    {isOwnerMode&&realIsSmart&&(
                      <button onClick={function(){setPreviewAsStandard(function(p){return !p;});}} style={{width:"100%",padding:"6px 10px",borderRadius:7,background:previewAsStandard?"#fbbf2422":C.raised,border:"1px solid "+(previewAsStandard?"#fbbf2455":C.border),color:previewAsStandard?"#fbbf24":C.sub,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:4}}>
                        {previewAsStandard?"👁 Previewing Standard — tap to return to Pro Smart view":"🔍 Dev: Preview as Standard tier"}
                      </button>
                    )}
                    {isOwnerMode&&!user&&(
                      <button onClick={function(){setShowDevSignIn(true);}} style={{width:"100%",padding:"6px 10px",borderRadius:7,background:"#00ffcc12",border:"1px solid #00ffcc33",color:"#00ffcc",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:4}}>
                        🔑 Sign in to check my real account
                      </button>
                    )}
                    {/* REAL sync status — not a static label. Shows actual save state. */}
                    {!user&&isOwnerMode&&<div style={{fontSize:9,color:C.gold}}>⚠️ Dev Mode — not connected to your cloud account</div>}
                    {user&&syncStatus==="saving"&&<div style={{fontSize:9,color:C.sub}}>⏳ Saving...</div>}
                    {user&&syncStatus==="saved"&&lastSyncTime&&<div style={{fontSize:9,color:C.green}}>✅ Saved to cloud · {lastSyncTime.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>}
                    {user&&syncStatus==="error"&&(
                      <div style={{fontSize:9,color:C.red,fontWeight:700}}>
                        ⚠️ Save failed — your data may not be backed up!<br/>
                        <span style={{fontWeight:400,fontSize:8}}>{syncError}</span>
                      </div>
                    )}
                    {user&&syncStatus==="idle"&&<div style={{fontSize:9,color:C.sub}}>☁️ Connected to cloud</div>}
                  </div>

                  {/* ── ACCOUNT ── */}
                  <div style={{fontSize:8,fontWeight:800,color:C.sub,letterSpacing:"0.1em",textTransform:"uppercase",padding:"4px 12px 6px"}}>Account</div>
                  <button onClick={()=>{setShowProfile(true);setShowMenu(false);}} style={{width:"100%",padding:"10px 12px",borderRadius:8,background:C.raised,border:`1px solid ${C.border}`,color:C.text,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:4,display:"flex",alignItems:"center",gap:8,fontWeight:600}}><span>👤</span><span>My Profile</span></button>
                  <a href="https://billing.stripe.com/p/login/aFa8wP7FLbMY4Ua0Ls9MY00" target="_blank" rel="noreferrer" style={{width:"100%",padding:"10px 12px",borderRadius:8,background:C.raised,border:`1px solid ${C.border}`,color:C.text,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:4,display:"flex",alignItems:"center",gap:8,fontWeight:600,textDecoration:"none",boxSizing:"border-box"}}><span>💳</span><div style={{flex:1}}><div>Manage / Cancel Subscription</div><div style={{fontSize:9,fontWeight:400,color:C.sub,marginTop:1}}>Update card, view invoices, or cancel — no email needed</div></div></a>
                  <button onClick={()=>{setShowReferrals(true);setShowMenu(false);}} style={{width:"100%",padding:"10px 12px",borderRadius:8,background:"linear-gradient(135deg,#4ade8015,#00ffcc15)",border:"1px solid #4ade8044",color:"#4ade80",fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:4,display:"flex",alignItems:"center",justifyContent:"space-between",fontWeight:700}}><span style={{display:"flex",alignItems:"center",gap:8}}><span>🚀</span><span>Invite a Driver — Get a Free Month</span></span></button>
                  <button onClick={()=>{setShowWelcome(true);setShowMenu(false);}} style={{width:"100%",padding:"10px 12px",borderRadius:8,background:"rgba(0,255,204,0.08)",border:"1px solid rgba(0,255,204,0.25)",color:"#00ffcc",fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:4,display:"flex",alignItems:"center",gap:8,fontWeight:700}}><span>💎</span><span>View Plans & Pricing</span></button>
                  <button onClick={()=>{doLogout();setShowMenu(false);}} style={{width:"100%",padding:"10px 12px",borderRadius:8,background:`${C.red}12`,border:`1px solid ${C.red}33`,color:C.red,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:4,display:"flex",alignItems:"center",gap:8,fontWeight:600}}><span>🚪</span><span>Sign Out</span></button>

                  {/* Divider */}
                  <div style={{height:1,background:C.border,margin:"8px 6px"}}/>

                  {/* ── APP ── */}
                  <div style={{fontSize:8,fontWeight:800,color:C.sub,letterSpacing:"0.1em",textTransform:"uppercase",padding:"4px 12px 6px"}}>App</div>
                  <button onClick={()=>{setDarkMode(p=>!p);try{localStorage.setItem("ciq_theme",darkMode?"light":"dark");}catch(e){}}} style={{width:"100%",padding:"10px 12px",borderRadius:8,background:C.raised,border:`1px solid ${C.border}`,color:C.text,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:4,display:"flex",alignItems:"center",gap:8,fontWeight:600}}><span>{darkMode?"☀️":"🌙"}</span><span>{darkMode?"Light Mode":"Dark Mode"}</span></button>
                  <button onClick={()=>{setShowSettings(true);setShowMenu(false);}} style={{width:"100%",padding:"10px 12px",borderRadius:8,background:C.raised,border:`1px solid ${C.border}`,color:C.text,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:4,display:"flex",alignItems:"center",gap:8,fontWeight:600}}><span>⚙️</span><span>Display Settings</span></button>
                  <button onClick={()=>{setShowDigestModal(true);setShowMenu(false);}} style={{width:"100%",padding:"10px 12px",borderRadius:8,background:C.raised,border:`1px solid ${C.border}`,color:C.text,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:4,display:"flex",alignItems:"center",justifyContent:"space-between",fontWeight:600}}><span style={{display:"flex",alignItems:"center",gap:8}}><span>💬</span><span>Weekly Digest (WhatsApp/SMS)</span></span><span style={{fontSize:8,fontWeight:800,color:"#fbbf24",background:"#fbbf2418",border:"1px solid #fbbf2444",borderRadius:20,padding:"1px 7px"}}>NEW</span></button>
                  <button onClick={()=>{setShowMyNumbers(true);setShowMenu(false);}} style={{width:"100%",padding:"10px 12px",borderRadius:8,background:C.raised,border:`1px solid ${C.border}`,color:C.text,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:4,display:"flex",alignItems:"center",gap:8,fontWeight:600}}><span>⚙️</span><span>My Numbers — How YOU Operate</span></button>

                  {/* Divider */}
                  <div style={{height:1,background:C.border,margin:"8px 6px"}}/>

                  {/* ── DISCOVER ── */}
                  <div style={{fontSize:8,fontWeight:800,color:C.sub,letterSpacing:"0.1em",textTransform:"uppercase",padding:"4px 12px 6px"}}>Discover</div>
                  <button onClick={()=>{setShowAbout(true);setShowMenu(false);}} style={{width:"100%",padding:"10px 12px",borderRadius:8,background:C.raised,border:`1px solid ${C.border}`,color:C.text,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:4,display:"flex",alignItems:"center",gap:8,fontWeight:600}}><span>🚛</span><span>About DrayageIQ</span></button>
                  <button onClick={()=>{setOnboardStep(0);setOnboardPath(null);setShowOnboarding(true);setShowMenu(false);}} style={{width:"100%",padding:"10px 12px",borderRadius:8,background:`${C.accent}10`,border:`1px solid ${C.accent}25`,color:C.accent,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:4,display:"flex",alignItems:"center",gap:8,fontWeight:600}}><span>🎓</span><span>How to Use DrayageIQ</span></button>
                  <button onClick={()=>{setShowRoadmap(true);setShowMenu(false);}} style={{width:"100%",padding:"10px 12px",borderRadius:8,background:"#a78bfa10",border:"1px solid #a78bfa25",color:"#a78bfa",fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:4,display:"flex",alignItems:"center",justifyContent:"space-between",fontWeight:600}}><span style={{display:"flex",alignItems:"center",gap:8}}><span>🗺️</span><span>What's Coming Next</span></span><span style={{fontSize:8,fontWeight:800,color:"#fbbf24",background:"#fbbf2418",border:"1px solid #fbbf2444",borderRadius:20,padding:"1px 7px"}}>ROADMAP</span></button>
                  <button onClick={()=>{setShowMarket(true);setShowMenu(false);}} style={{width:"100%",padding:"10px 12px",borderRadius:8,background:`${C.green}12`,border:`1px solid ${C.green}33`,color:C.green,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:4,display:"flex",alignItems:"center",gap:8,fontWeight:600}}><span>📊</span><span>Market Overview</span></button>
                  <button onClick={()=>{setShowReviews(true);setShowMenu(false);}} style={{width:"100%",padding:"10px 12px",borderRadius:8,background:`${C.gold}12`,border:`1px solid ${C.gold}33`,color:C.gold,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:4,display:"flex",alignItems:"center",gap:8,fontWeight:600}}><span>⭐</span><span>Customer Reviews</span>{reviews.length>0&&<span style={{marginLeft:"auto",fontSize:9,color:C.gold,fontWeight:700}}>{reviews.length}</span>}</button>
                  <button onClick={()=>{setShowIconKey(true);setShowMenu(false);}} style={{width:"100%",padding:"10px 12px",borderRadius:8,background:`${C.a3}12`,border:`1px solid ${C.a3}33`,color:C.a3,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:4,display:"flex",alignItems:"center",gap:8,fontWeight:600}}><span>🔑</span><span>Icon Guide</span></button>
                  <button onClick={()=>{setShowFleet(true);setShowMenu(false);}} style={{width:"100%",padding:"10px 12px",borderRadius:8,background:C.raised,border:`1px solid ${C.border}`,color:C.text,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:4,display:"flex",alignItems:"center",gap:8,fontWeight:600}}><span>🚛</span><span>Fleet Pricing</span><span style={{marginLeft:"auto",fontSize:8,fontWeight:800,color:"#080c16",background:C.gold,borderRadius:20,padding:"2px 7px"}}>NEW</span></button>

                  {/* Divider */}
                  <div style={{height:1,background:C.border,margin:"8px 6px"}}/>

                  {/* ── SUPPORT ── */}
                  <div style={{fontSize:8,fontWeight:800,color:C.sub,letterSpacing:"0.1em",textTransform:"uppercase",padding:"4px 12px 6px"}}>Support</div>
                  <a href="https://whatsapp.com/channel/0029VazNGCd0bIdZvxjLIB2L" target="_blank" rel="noreferrer" style={{width:"100%",padding:"10px 12px",borderRadius:8,background:"rgba(37,211,102,0.08)",border:"1px solid rgba(37,211,102,0.25)",color:"#25D366",fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:4,display:"flex",alignItems:"center",gap:8,fontWeight:700,textDecoration:"none",boxSizing:"border-box"}}><span>💬</span><div style={{flex:1}}><div>WhatsApp Support</div><div style={{fontSize:9,fontWeight:400,color:C.sub,marginTop:1}}>Join our channel · Get help fast</div></div><span style={{fontSize:8,fontWeight:800,color:"#080c16",background:"#25D366",borderRadius:20,padding:"2px 7px"}}>LIVE</span></a>
                  <a href="https://whatsapp.com/channel/0029VbDOskDBA1esSRzm6w2T" target="_blank" rel="noreferrer" style={{width:"100%",padding:"10px 12px",borderRadius:8,background:"rgba(37,211,102,0.08)",border:"1px solid rgba(37,211,102,0.25)",color:"#25D366",fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:4,display:"flex",alignItems:"center",gap:8,fontWeight:700,textDecoration:"none",boxSizing:"border-box"}}><span>📹</span><div style={{flex:1}}><div>Video Tips</div><div style={{fontSize:9,fontWeight:400,color:C.sub,marginTop:1}}>Quick how-to videos</div></div></a>
                </div>
                </div>
                </>
              )}
            </div>
            {isPro?(null):trialDaysLeft>0?(
              <div style={{padding:"6px 9px",borderRadius:8,background:C.gold+"20",border:"1px solid "+C.gold+"55",fontSize:9,fontWeight:700,color:"#fbbf24",flexShrink:0}}>{trialDaysLeft}d left</div>
            ):(
              <button onClick={()=>openUpgrade("header")} style={{padding:"7px 11px",borderRadius:8,background:"linear-gradient(135deg,"+C.gold+",#f59e0b)",border:"none",fontSize:10,fontWeight:800,color:"#000",cursor:"pointer",fontFamily:"inherit",flexShrink:0,whiteSpace:"nowrap"}}>Upgrade</button>
            )}
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div style={{background:`linear-gradient(135deg,${C.a3}18,${C.accent}12)`,borderBottom:`2px solid ${C.a3}55`,padding:"10px 14px"}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:8,background:C.surf,borderRadius:12,padding:"0 12px",border:`2px solid ${C.a3}66`}}>
            <span style={{fontSize:15,flexShrink:0}}>{searchLoading?"⏳":"🔍"}</span>
            <input value={searchQ||""} onChange={e=>setSearchQ(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&(searchQ||"").trim())runSearch();}} placeholder={isSmart?"Ask anything — I know your numbers, live diesel & weather...":"Ask anything: routes, HOS rules, fuel tips, regs..."} style={{background:"none",border:"none",color:C.text,fontSize:12,fontFamily:"inherit",padding:"11px 0",width:"100%",outline:"none"}}/>
            {(searchQ||"").trim()&&<button onClick={()=>{setSearchQ("");setSearchResult("");}} style={{background:"none",border:"none",color:C.sub,fontSize:18,cursor:"pointer",padding:"0 4px",flexShrink:0}}>×</button>}
          </div>
          <button onClick={()=>runSearch()} disabled={!(searchQ||"").trim()||searchLoading} style={{padding:"11px 16px",borderRadius:12,background:!(searchQ||"").trim()||searchLoading?C.raised:`linear-gradient(135deg,${C.a3},${C.accent})`,color:!(searchQ||"").trim()||searchLoading?C.sub:"#000",fontWeight:800,fontSize:12,border:"none",cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{searchLoading?"⏳ ...":"Search"}</button>
        </div>
        {!searchResult&&!searchLoading&&(
          <div style={{display:"flex",gap:6,marginTop:8,overflowX:"auto",paddingBottom:2}}>
            {(isSmart?["📊 Analyze my RPM trend","⛽ Cost of next load","🌤️ Weather on my route","💰 Should I take this load?","📈 How to improve my net"]:["⛽ MPG tips","📋 HOS rules","🚛 Load planning","💰 Fuel surcharge math","🔧 Tire blowout tips"]).map(s=>(
              <button key={s} onClick={()=>{const q=s.replace(/^[^\s]+\s/,"");setSearchQ(q);setTimeout(()=>runSearch(q),50);}} style={{padding:"5px 11px",borderRadius:20,background:`${C.a3}15`,border:`1px solid ${C.a3}44`,color:"#a78bfa",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0,whiteSpace:"nowrap"}}>{s}</button>
            ))}
          </div>
        )}
        {searchResult&&(
          <div style={{marginTop:10,padding:"12px 14px",background:C.card,borderRadius:10,border:`1px solid ${C.a3}55`,fontSize:12,color:C.text,lineHeight:1.8,whiteSpace:"pre-wrap"}}>
            {searchResult}<div style={{marginTop:8,padding:"7px 10px",borderRadius:8,background:isSmart?`${C.accent}12`:`${C.gold}12`,border:`1px solid ${isSmart?C.accent:C.gold}33`,fontSize:10,color:C.sub,lineHeight:1.5}}>{isSmart?"⚡ Smart AI — answered using your live settlement data, real diesel prices & weather.":"💡 Based on general knowledge — not live data. Upgrade to Pro Smart for live data & deeper answers."}</div><button onClick={()=>{setSearchResult("");setSearchQ("");}} style={{display:"block",marginTop:8,background:"none",border:"none",color:C.sub,fontSize:11,cursor:"pointer",fontFamily:"inherit",padding:0}}>✕ Clear</button>
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

      {/* REFERRAL SYSTEM — visible to ALL tiers, per your original plan */}
      {showReferrals&&(
        <div style={{background:C.surf,borderBottom:`1px solid ${C.border}`,padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div><div style={{fontSize:12,fontWeight:700,color:C.text}}>🚀 Invite a Driver</div><div style={{fontSize:10,color:C.sub,marginTop:2}}>Both of you get a free month when they subscribe</div></div>
            <button onClick={()=>setShowReferrals(false)} style={{background:"none",border:"none",color:C.sub,fontSize:18,cursor:"pointer"}}>×</button>
          </div>
          <div style={{background:C.card,borderRadius:11,padding:"14px",border:`1px solid ${C.border}`,maxWidth:480}}>
            {user?(
              <div>
                <div style={{padding:"10px 12px",borderRadius:9,background:"linear-gradient(135deg,#4ade8012,#00ffcc12)",border:"1px solid #4ade8033",marginBottom:12}}>
                  <div style={{fontSize:9,color:C.sub,marginBottom:6}}>HOW IT WORKS</div>
                  <div style={{fontSize:10,color:C.text,lineHeight:1.6}}>1. Share your link below with another driver<br/>2. They sign up and get <strong style={{color:"#4ade80"}}>1 free month of Pro Smart</strong><br/>3. Once they subscribe to any paid plan, you get <strong style={{color:"#4ade80"}}>1 free month of your current plan</strong></div>
                </div>
                <div style={{fontSize:9,color:C.sub,marginBottom:4}}>YOUR REFERRAL LINK</div>
                <div style={{display:"flex",gap:6,marginBottom:12}}>
                  <input readOnly value={"getdrayageiq.com/?ref="+referralCode} style={{flex:1,padding:"9px 10px",borderRadius:7,background:C.bg,border:`1px solid ${C.border}`,color:C.text,fontSize:11,fontFamily:"monospace"}}/>
                  <button onClick={function(){
                    navigator.clipboard.writeText("https://getdrayageiq.com/?ref="+referralCode).then(function(){
                      setReferralCopied(true);
                      setTimeout(function(){setReferralCopied(false);},2500);
                    });
                  }} style={{padding:"9px 16px",borderRadius:7,background:referralCopied?"#4ade8022":C.accent+"22",border:"1px solid "+(referralCopied?"#4ade80":C.accent)+"55",color:referralCopied?"#4ade80":C.accent,fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{referralCopied?"✓ Copied!":"Copy Link"}</button>
                </div>
                <div style={{fontSize:9,color:C.sub,marginBottom:8}}>YOUR REFERRALS ({referredSignups.length})</div>
                {referredSignups.length===0?(
                  <div style={{textAlign:"center",padding:"16px",color:C.sub,fontSize:10}}>No referrals yet — share your link above to get started</div>
                ):(
                  referredSignups.map(function(r,i){
                    return(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",background:C.bg,borderRadius:7,border:`1px solid ${C.border}`,marginBottom:6}}>
                        <span style={{fontSize:10,color:C.text}}>{r.email}</span>
                        <span style={{fontSize:9,fontWeight:700,color:r.status==="paid"?"#4ade80":r.status==="trial"?"#fbbf24":C.sub}}>{r.status==="paid"?"✅ Paid — reward earned":r.status==="trial"?"⏳ On free trial":"Expired"}</span>
                      </div>
                    );
                  })
                )}
                <div style={{fontSize:8,color:"#fbbf24",fontWeight:700,marginTop:10,textAlign:"center"}}>🧪 Reward crediting is in active development — your link and referrals are tracked now and ready the moment it fully launches.</div>
              </div>
            ):(
              <div style={{textAlign:"center",padding:"12px 4px",color:C.sub,fontSize:11}}>Sign in to get your personal referral link.</div>
            )}
          </div>
        </div>
      )}

      {/* MY NUMBERS — the user's OWN operating figures drive every tool; the app imposes no baseline */}
      {showMyNumbers&&(
        <div style={{background:C.surf,borderBottom:`1px solid ${C.border}`,padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div><div style={{fontSize:12,fontWeight:700,color:C.text}}>⚙️ My Numbers</div><div style={{fontSize:10,color:C.sub,marginTop:2}}>Every calculation runs on YOUR operation — set it once here</div></div>
            <button onClick={()=>setShowMyNumbers(false)} style={{background:"none",border:"none",color:C.sub,fontSize:18,cursor:"pointer"}}>×</button>
          </div>
          <div style={{background:C.card,borderRadius:11,padding:"14px",border:`1px solid ${C.border}`,maxWidth:440}}>
            <div style={{fontSize:9,color:C.sub,marginBottom:4}}>MY FSC BASELINE ($/gal)</div>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
              <button type="button" onClick={function(){setFscBaselinePrice(Math.max(0,+(fscBaselinePrice-0.05).toFixed(2)));}} style={{width:34,height:38,borderRadius:7,background:C.raised,border:"1px solid "+C.border,color:C.text,fontSize:16,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>−</button>
              <input type="text" inputMode="decimal" value={String(fscBaselinePrice)} onChange={function(e){const v=parseFloat(e.target.value);setFscBaselinePrice(isNaN(v)?0:v);}} style={{flex:1,padding:"9px 10px",borderRadius:7,background:C.bg,border:"1px solid "+C.border,color:C.text,fontSize:13,fontFamily:"inherit",textAlign:"center"}}/>
              <button type="button" onClick={function(){setFscBaselinePrice(+(fscBaselinePrice+0.05).toFixed(2));}} style={{width:34,height:38,borderRadius:7,background:C.raised,border:"1px solid "+C.border,color:C.text,fontSize:16,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>+</button>
            </div>
            <div style={{fontSize:9,color:C.sub,lineHeight:1.6,marginBottom:12}}>This is YOUR number, not ours — it's the fuel price your rates were built around. Find it on your carrier's FSC schedule (usually emailed by your terminal) and set it once. The FSC Calculator and every True FSC figure across the app will use it.</div>
            <div style={{padding:"9px 11px",borderRadius:8,background:C.accent+"10",border:"1px solid "+C.accent+"30",fontSize:9,color:C.sub,lineHeight:1.6}}>⛽ <b style={{color:C.accent}}>Your MPG</b> is already yours automatically — it syncs from your real fuel log fill-ups, so efficiency numbers reflect how YOUR truck actually runs, not an industry average.</div>
          </div>
        </div>
      )}

      {/* WEEKLY DIGEST — Pro Smart feature, visible to Standard with padlock */}
      {showDigestModal&&(
        <div style={{background:C.surf,borderBottom:`1px solid ${C.border}`,padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div><div style={{fontSize:12,fontWeight:700,color:C.text}}>💬 Weekly Digest (WhatsApp/SMS)</div><div style={{fontSize:10,color:C.sub,marginTop:2}}>Get your weekly net, RPM, and True FSC gap sent automatically</div></div>
            <button onClick={()=>setShowDigestModal(false)} style={{background:"none",border:"none",color:C.sub,fontSize:18,cursor:"pointer"}}>×</button>
          </div>
          <div style={{background:C.card,borderRadius:11,padding:"14px",border:`1px solid ${C.border}`,maxWidth:420}}>
            {isSmart?(
              <div>
                <div style={{fontSize:10,color:C.sub,lineHeight:1.6,marginBottom:12}}>Every week, we'll send a short message with your net pay, RPM, and any True FSC gap worth knowing about — straight to your phone, no need to open the app.</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <span style={{fontSize:11,color:C.text,fontWeight:700}}>Enable Weekly Digest</span>
                  <button onClick={()=>setDigestOptIn(p=>!p)} style={{width:40,height:20,borderRadius:10,background:digestOptIn?C.accent:C.border,border:"none",cursor:"pointer",position:"relative",flexShrink:0}}><div style={{width:14,height:14,borderRadius:"50%",background:"white",position:"absolute",top:3,left:digestOptIn?23:3,transition:"left 0.15s"}}/></button>
                </div>
                {digestOptIn&&(
                  <div>
                    <div style={{fontSize:9,color:C.sub,marginBottom:4}}>PHONE NUMBER (WhatsApp or SMS)</div>
                    <input type="tel" value={digestPhone} onChange={function(e){setDigestPhone(e.target.value.replace(/[^0-9+()\-\s]/g,"").slice(0,20));}} placeholder="+1 (443) 555-0100" style={{width:"100%",padding:"9px 10px",borderRadius:7,background:C.bg,border:"1px solid "+(digestPhone&&!(digestPhone.replace(/\D/g,"").length>=10&&digestPhone.replace(/\D/g,"").length<=15)?C.red:C.border),color:C.text,fontSize:12,fontFamily:"inherit",boxSizing:"border-box",marginBottom:4}}/>
                    {digestPhone&&!(digestPhone.replace(/\D/g,"").length>=10&&digestPhone.replace(/\D/g,"").length<=15)&&<div style={{fontSize:9,color:C.red,marginBottom:8}}>Enter a full phone number with area code (10–15 digits)</div>}
                    <div style={{fontSize:9,color:"#fbbf24",fontWeight:700}}>🧪 Coming in V4 — your preference is saved and ready the moment this launches.</div>
                  </div>
                )}
              </div>
            ):(
              <div style={{textAlign:"center",padding:"8px 4px"}}>
                <div style={{fontSize:22,marginBottom:6}}>🔒</div>
                <div style={{fontSize:11,fontWeight:700,color:C.text,marginBottom:4}}>Weekly Digest — Pro Smart Feature</div>
                <div style={{fontSize:9,color:C.sub,marginBottom:10}}>Automatic weekly summaries sent to your phone, so you always know your numbers without opening the app.</div>
                <button onClick={()=>openUpgrade("digest")} style={{padding:"7px 16px",borderRadius:8,background:`linear-gradient(135deg,${C.accent},${C.a3})`,border:"none",color:"#000",fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Upgrade to Pro Smart →</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DEV SIGN-IN — lets you check your REAL account without leaving the testing site */}
      {showDevSignIn&&(
        <div style={{background:C.surf,borderBottom:`1px solid ${C.border}`,padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div><div style={{fontSize:12,fontWeight:700,color:C.text}}>🔑 Sign In to Your Real Account</div><div style={{fontSize:10,color:C.sub,marginTop:2}}>Check your actual data from this testing site</div></div>
            <button onClick={()=>setShowDevSignIn(false)} style={{background:"none",border:"none",color:C.sub,fontSize:18,cursor:"pointer"}}>×</button>
          </div>
          <div style={{background:C.card,borderRadius:11,padding:"14px",border:`1px solid ${C.border}`,maxWidth:420}}>
            <div style={{fontSize:9,color:"#fbbf24",fontWeight:700,marginBottom:10,padding:"8px 10px",background:"#fbbf2412",borderRadius:7,border:"1px solid #fbbf2433"}}>⚠️ You're still on the DEV/testing site. Signing in here shows your real cloud data for checking purposes, but stay aware this is not the production site your real customers use.</div>
            {!authSent?(
              <div>
                <input value={authEmail} onChange={e=>setAuthEmail(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")sendMagicLink();}} placeholder="you@email.com" type="email" autoComplete="email" style={{width:"100%",padding:"12px",borderRadius:9,background:C.bg,border:"1px solid "+C.border,color:C.text,fontSize:13,boxSizing:"border-box",fontFamily:"inherit",outline:"none",marginBottom:10,textAlign:"center"}}/>
                <button onClick={sendMagicLink} disabled={authBusy} style={{width:"100%",padding:"13px",borderRadius:9,background:"linear-gradient(135deg,#00ffcc,#00d4aa)",color:"#000",fontWeight:800,fontSize:13,border:"none",cursor:authBusy?"default":"pointer",fontFamily:"inherit",opacity:authBusy?0.6:1}}>{authBusy?"Sending…":"Email me a sign-in link →"}</button>
                {authMsg&&<div style={{fontSize:11,color:authMsg.startsWith("Error")?"#f87171":C.sub,marginTop:8,textAlign:"center"}}>{authMsg}</div>}
              </div>
            ):(
              <div style={{textAlign:"center",padding:"10px 0"}}>
                <div style={{fontSize:24,marginBottom:8}}>📬</div>
                <div style={{fontSize:12,fontWeight:700,color:"#00ffcc",marginBottom:6}}>Check your email!</div>
                <div style={{fontSize:11,color:C.sub,lineHeight:1.6,marginBottom:12}}>Sent a link to <b style={{color:C.text}}>{authEmail}</b> — open it on THIS device to sign in here.</div>
                <button onClick={()=>{setAuthSent(false);setAuthMsg("");}} style={{padding:"8px 16px",borderRadius:8,background:"transparent",border:"1px solid "+C.border,color:C.sub,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>← Try different email</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ROADMAP — public "what's coming next" transparency page */}
      {showRoadmap&&(
        <div style={{background:C.surf,borderBottom:`1px solid ${C.border}`,padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div><div style={{fontSize:12,fontWeight:700,color:C.text}}>🗺️ What's Coming Next</div><div style={{fontSize:10,color:C.sub,marginTop:2}}>Built in the open — here's what we're actively working on</div></div>
            <button onClick={()=>setShowRoadmap(false)} style={{background:"none",border:"none",color:C.sub,fontSize:18,cursor:"pointer"}}>×</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,maxWidth:520}}>
            {[
              {icon:"📸",title:"Shareable Results Card",tier:"Pro Smart",status:"In Testing",desc:"Turn any Fuel Surcharge Calculator result into a clean, branded image to post or share — proof of your real numbers, ready in one tap."},
              {icon:"📊",title:"CSV Export — Return on Spend + True FSC",tier:"Pro Smart",status:"Live Now",desc:"Download your full move history with fair-market FSC comparisons — hand it to a broker, lawyer, or your own records.",live:true},
              {icon:"💬",title:"Weekly Digest (WhatsApp/SMS)",tier:"Pro Smart",status:"In Development",desc:"Your weekly net, RPM, and True FSC gap sent straight to your phone automatically — no need to open the app to stay informed."},
              {icon:"🚀",title:"Referral Rewards",tier:"All Tiers",status:"In Development",desc:"Invite another driver, you both get a free month — your unique link and referral tracking are live now in Menu → Invite a Driver. Automatic reward crediting is coming next."},
              {icon:"🏢",title:"The Office — Receipts & True Net",tier:"Pro Smart",status:"In Testing",desc:"A dedicated back-office tab: scan receipts, track real out-of-pocket expenses, and see your True Net — what you actually keep after every real business cost. Already visible in the app now with a preview lock."},
              {icon:"🏢",title:"Enterprise Fleet (11+ trucks)",tier:"Fleet",status:"Available on Request",desc:"Custom pricing and dedicated support for larger fleet operations. Message us directly to discuss your setup."},
            ].map(function(item,i){
              return(
                <div key={i} style={{background:C.card,borderRadius:11,padding:"12px 14px",border:`1px solid ${item.live?C.green+"44":C.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:16}}>{item.icon}</span>
                      <span style={{fontSize:12,fontWeight:700,color:C.text}}>{item.title}</span>
                    </div>
                    <span style={{fontSize:8,fontWeight:800,color:item.live?C.green:"#fbbf24",background:(item.live?C.green:"#fbbf24")+"18",border:"1px solid "+(item.live?C.green:"#fbbf24")+"44",borderRadius:20,padding:"2px 8px",whiteSpace:"nowrap"}}>{item.status}</span>
                  </div>
                  <div style={{fontSize:10,color:C.sub,lineHeight:1.5,marginBottom:6}}>{item.desc}</div>
                  <div style={{fontSize:9,color:C.a3,fontWeight:700}}>{item.tier}</div>
                </div>
              );
            })}
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

      <div onTouchStart={handleSwipeStart} onTouchEnd={handleSwipeEnd} style={{padding:"16px",maxWidth:1100,margin:"0 auto"}}>

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
                <div><div style={{fontWeight:700,color:"#a78bfa",marginBottom:1}}>💡 DrayageIQ is working for you</div><div style={{fontSize:10,color:C.sub}}>{insightCount} data points tracked · {badLoads>0?badLoads+" low-value routes flagged":allMoves.length+" routes analyzed"}</div></div>
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
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:5}}>
                      {[{l:"Gross",val:`$${(v.gross/1000).toFixed(1)}k`,c:v.color,locked:false},{l:"Net",val:`$${(v.net/1000).toFixed(1)}k`,c:C.green,locked:false},{l:"Deducted",val:`$${(v.ded/1000).toFixed(1)}k`,c:C.red,locked:false},{l:"Return/Spend",val:(isSmart||featureTrialActive.returnOnSpend)?`1:${(v.ded>0?v.gross/v.ded:0).toFixed(1)}`:(canUseFeatureFree("returnOnSpend")?"🎁 Try":"🔒 Pro"),c:(isSmart||featureTrialActive.returnOnSpend)?((v.ded>0?v.gross/v.ded:0)>=3?C.green:(v.ded>0?v.gross/v.ded:0)>=1.5?C.gold:C.red):(canUseFeatureFree("returnOnSpend")?"#4ade80":C.sub),locked:!isSmart&&!featureTrialActive.returnOnSpend}].map(s=>(
                        <div key={s.l} onClick={s.locked?function(){if(canUseFeatureFree("returnOnSpend")){useFeatureToken("returnOnSpend");setFeatureTrialActive(function(p){return {...p,returnOnSpend:true};});}else{openUpgrade("ros");}}:undefined} style={{background:C.bg,borderRadius:7,padding:"7px 8px",border:`1px solid ${C.border}`,textAlign:"center",cursor:s.locked?"pointer":"default"}}><div style={{fontSize:9,color:C.sub,textTransform:"uppercase",marginBottom:3}}>{s.l}</div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,color:s.c}}>{s.val}</div></div>
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
                    {isSmart&&(()=>{const ytdRatio=tDed>0?tGross/tDed:0;const rc=ytdRatio>=3?C.green:ytdRatio>=1.5?C.gold:C.red;return(<div style={{padding:"5px 11px",borderRadius:8,background:`${rc}18`,border:`1px solid ${rc}44`}}><div style={{fontSize:9,color:C.sub}}>YTD Return/Spend</div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:800,color:rc}}>1:{ytdRatio.toFixed(1)}</div></div>);})()}
                    {!isSmart&&<div onClick={()=>openUpgrade("ros")} style={{padding:"5px 11px",borderRadius:8,background:`${C.a3}12`,border:`1px dashed ${C.a3}44`,cursor:"pointer"}}><div style={{fontSize:9,color:C.sub}}>YTD Return/Spend</div><div style={{fontSize:11,fontWeight:700,color:C.accent}}>🔒 Pro Smart</div></div>}
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
            <div style={{position:"relative"}}>
              {/* Trend line SVG overlay */}
              {allW.length>1&&(()=>{
                const maxNet=Math.max(...allW.map(x=>x.net));
                const n=allW.length;
                // The bar's OWN inner box is height:72 (not the outer 80px flex container,
                // which also includes the $X.Xk label above it). Bars are bottom-aligned
                // inside that 72px box via justifyContent:"flex-end". So bar TOP = 72 - h,
                // measured from the TOP of that 72px box — which itself starts at y=8 within
                // the outer 80px SVG viewport (leaving room for the label above).
                // The outer column container is height:80 with alignItems:"flex-end" —
                // meaning content is anchored to the BOTTOM of the 80px zone, not the top.
                // The bar itself sits inside a height:72 inner wrapper, also bottom-aligned.
                // So the bar's visual TOP, measured from the top of the 80px SVG viewport, is:
                // 80 (full height) - 72 (inner wrapper height) + (72 - h) = 80 - h
                const pts=allW.map((w,i)=>{
                  const xPct=((i+0.5)/n)*100;
                  const h=Math.max(8,(w.net/maxNet)*68);
                  const yPx=80-h;
                  return {x:xPct,y:yPx,net:w.net};
                });
                const gradId="tg"+Math.random().toString(36).slice(2,8);
                const pathD=pts.map((p,i)=>(i===0?"M":"L")+p.x.toFixed(2)+","+p.y.toFixed(2)).join(" ");
                return(
                  <svg style={{position:"absolute",top:0,left:0,width:"100%",height:"80px",pointerEvents:"none",zIndex:5}} preserveAspectRatio="none" viewBox="0 0 100 80">
                    <defs>
                      <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
                        {pts.map((p,i)=>{
                          const up=i===0?true:p.net>=pts[i-1].net;
                          const color=up?"#4ade80":"#f87171";
                          return <stop key={i} offset={p.x.toFixed(1)+"%"} stopColor={color}/>;
                        })}
                      </linearGradient>
                    </defs>
                    <path d={pathD} fill="none" stroke={"url(#"+gradId+")"} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" opacity="0.95"/>
                    {pts.map((p,i)=>(
                      <circle key={i} cx={p.x} cy={p.y} r="1.6" fill={i===0?"#8fa3c0":(p.net>=pts[i-1].net?"#4ade80":"#f87171")} stroke="#0b0f1c" strokeWidth="0.5"/>
                    ))}
                  </svg>
                );
              })()}
            <div style={{display:"flex",alignItems:"flex-end",gap:4,height:80,padding:"0 2px"}}>
              {allW.map((w,i)=>{
                const maxNet=Math.max(...allW.map(x=>x.net));
                const h=Math.max(8,(w.net/maxNet)*68);
                const vc=VENDORS[detectVendor(w)]?.color||C.accent;
                const isSelected=sD===i;
                const g=wg(w);
                return(
                  <div key={w.week+i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:0,cursor:"pointer",position:"relative"}}
                    onClick={()=>{
                      const ki=allW.findIndex(function(x){return x.week===w.week&&(x.from||"")===(w.from||"");});
                      const ni=ki>=0?ki:i;
                      setSD(ni);setSM(ni);setSH(ni);
                    }}>
                    {/* Net label on top — hide non-selected when many weeks to prevent overlap */}
                    {(allW.length<=12||isSelected)&&<div style={{fontSize:isSelected?9:6,color:isSelected?vc:C.sub,fontWeight:isSelected?800:500,lineHeight:1,marginBottom:3,whiteSpace:"nowrap",transition:"all 0.15s"}}>${(w.net/1000).toFixed(1)}k</div>}
                    {/* Bar with grade color glow */}
                    <div style={{position:"relative",width:"72%",display:"flex",flexDirection:"column",justifyContent:"flex-end",height:72}}>
                      <div style={{
                        width:"100%",height:h,
                        borderRadius:"4px 4px 0 0",
                        background:isSelected?`linear-gradient(180deg,${vc},${vc}bb)`:vc,
                        opacity:isSelected?1:0.55,
                        boxShadow:isSelected?`0 0 12px ${vc}88,0 0 4px ${vc}44`:"none",
                        transition:"all 0.2s ease",
                        minWidth:6,
                        position:"relative"
                      }}>
                        {/* Grade dot on top of bar */}
                        {isSelected&&<div style={{position:"absolute",top:-5,left:"50%",transform:"translateX(-50%)",width:8,height:8,borderRadius:"50%",background:g.c,border:"2px solid "+C.bg,boxShadow:`0 0 6px ${g.c}`}}/>}
                      </div>
                    </div>
                    {/* Week label — hide non-selected on mobile when 14+ weeks to prevent crowding */}
                    {(wide||allW.length<=10||isSelected)&&<div style={{fontSize:isSelected?8:7,color:isSelected?C.text:C.sub,fontWeight:isSelected?800:400,marginTop:3,lineHeight:1,transition:"all 0.15s"}}>W{w.week}</div>}
                    {/* Selected indicator dot */}
                    {isSelected&&<div style={{width:4,height:4,borderRadius:"50%",background:vc,marginTop:2,boxShadow:`0 0 4px ${vc}`}}/>}
                    <div style={{width:4,height:4,borderRadius:"50%",background:vc,opacity:0.8,marginTop:1}}/>
                  </div>
                );
              })}
            </div>
            </div>
            <div style={{fontSize:9,color:C.sub,marginTop:8,textAlign:"center"}}>Tap any bar to sync all cards · W{allW[sD]?.week} selected</div>
          </div>

          {/* DEDUCTIONS + HEALTH */}
          <div style={{display:"grid",gridTemplateColumns:wide?"1.35fr 1fr":"1fr",gap:14,marginBottom:16}}>
            <div style={K()}>
              {/* Card header */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>🔍 Deduction Breakdown {helpBtn("deductions")}<button onClick={e=>{e.stopPropagation();toggleCard("ded");}} style={{background:"none",border:"none",color:C.sub,fontSize:12,cursor:"pointer",padding:"0 4px",lineHeight:1,fontFamily:"inherit"}}>{isCollapsed("ded")?"▶":"▼"}</button></div>
                <Nav i={sD} max={allW.length-1} prev={()=>setSD(p=>p-1)} next={()=>setSD(p=>p+1)} label={"W"+dw.week}/>
              </div>
              {helpModal("deductions")}
              {!isCollapsed("ded")&&(()=>{
                const deds=(dw.deds||[]).filter(d=>d&&d.l);
                const fuelA=deds.filter(d=>d.l.toLowerCase().includes("fuel advance"));
                const insD=deds.filter(d=>d&&d.l&&["physical damage","bobtail","occacc","occ/acc","roadside","liability limiter"].some(k=>d.l.toLowerCase().includes(k)));
                const opsD=deds.filter(d=>d&&d.l&&["eld","event recorder","parking","license","highway tax","fuel-highway"].some(k=>d.l.toLowerCase().includes(k)));
                const escD=deds.filter(d=>d&&d.l&&d.l.toLowerCase().includes("escrow"));
                const fuelTotal=fuelA.reduce((s,d)=>s+d.a,0);
                const insTotal=insD.reduce((s,d)=>s+d.a,0);
                const opsTotal=opsD.reduce((s,d)=>s+d.a,0);
                const escTotal=escD.reduce((s,d)=>s+d.a,0);
                const dedSum=deds.reduce((s,d)=>s+d.a,0);
                const docTotal=dw.totalDeductions||0;
                const mismatch=docTotal>0&&Math.abs(dedSum-docTotal)>1.50;

                const buckets=[
                  {id:"ded_fuel",icon:"⛽",label:"Fuel",sublabel:"Variable",total:fuelTotal,color:"#f87171",items:fuelA,pct:dw.gross>0?(fuelTotal/dw.gross*100).toFixed(1):0,
                   render:(d,i)=>(
                     <div key={i} style={{padding:"8px 10px",borderBottom:i<fuelA.length-1?`1px solid #f8717122`:"none"}}>
                       <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                         <div style={{flex:1}}>
                           <div style={{fontSize:11,fontWeight:700,color:"#f0f6ff"}}>Fuel Advance {fuelA.length>1?`#${i+1}`:""}</div>
                           {d.gal>0&&<div style={{fontSize:9,color:"#8fa3c0",marginTop:2}}>{d.gal} gal @ ${(d.ppg||0).toFixed(3)}/gal{d.inv?` · INV #${d.inv}`:""}</div>}
                         </div>
                         <div style={{fontSize:12,fontWeight:800,color:"#f87171",flexShrink:0}}>-${d.a.toFixed(2)}</div>
                       </div>
                     </div>
                   )},
                  {id:"ded_insurance",icon:"🛡️",label:"Insurance",sublabel:"Fixed weekly",total:insTotal,color:"#a78bfa",items:insD,pct:dw.gross>0?(insTotal/dw.gross*100).toFixed(1):0,
                   render:(d,i)=>(
                     <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",borderBottom:i<insD.length-1?`1px solid #a78bfa22`:"none"}}>
                       <div style={{fontSize:10,color:"#c4b5fd",flex:1,marginRight:8,lineHeight:1.4}}>{d.l}</div>
                       <div style={{fontSize:11,fontWeight:700,color:"#a78bfa",flexShrink:0}}>${d.a.toFixed(2)}</div>
                     </div>
                   )},
                  {id:"ded_ops",icon:"⚙️",label:"Operations",sublabel:"Fees & taxes",total:opsTotal,color:"#fbbf24",items:opsD,pct:dw.gross>0?(opsTotal/dw.gross*100).toFixed(1):0,
                   render:(d,i)=>(
                     <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",borderBottom:i<opsD.length-1?`1px solid #fbbf2422`:"none"}}>
                       <div style={{fontSize:10,color:"#fde68a",flex:1,marginRight:8,lineHeight:1.4}}>{d.l}</div>
                       <div style={{fontSize:11,fontWeight:700,color:"#fbbf24",flexShrink:0}}>${d.a.toFixed(2)}</div>
                     </div>
                   )},
                  {id:"ded_escrow",icon:"🏦",label:"Escrow",sublabel:"Your savings",total:escTotal,color:"#34d399",items:escD,pct:dw.gross>0?(escTotal/dw.gross*100).toFixed(1):0,
                   render:(d,i)=>(
                     <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",borderBottom:i<escD.length-1?`1px solid #34d39922`:"none"}}>
                       <div style={{fontSize:10,color:"#6ee7b7",flex:1,marginRight:8,lineHeight:1.4}}>{d.l}</div>
                       <div style={{fontSize:11,fontWeight:700,color:"#34d399",flexShrink:0}}>${d.a.toFixed(2)}</div>
                     </div>
                   )},
                ];

                return(
                  <div>
                    {/* Date + net header */}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:C.bg,borderRadius:9,border:`1px solid ${C.border}`,marginBottom:12}}>
                      <div style={{fontSize:10,color:C.sub}}>{dw.from} – {dw.to}</div>
                      <div style={{fontSize:12,fontWeight:800,color:dw.net/dw.gross>0.65?C.green:dw.net/dw.gross>0.55?C.gold:C.red}}>Net ${(dw.net||0).toFixed(2)} · {dw.gross>0?((dw.net||0)/(dw.gross)*100).toFixed(1):0}%</div>
                    </div>

                    {/* Mismatch warning */}
                    {mismatch&&(
                      <div style={{padding:"9px 11px",borderRadius:8,background:`${C.red}15`,border:`1px solid ${C.red}44`,marginBottom:10}}>
                        <div style={{fontSize:10,color:C.red,marginBottom:8}}>⚠️ Totals don't match — document shows ${docTotal.toFixed(2)} but we extracted ${dedSum.toFixed(2)}. This week's data may be incomplete.</div>
                        <button onClick={()=>{setTab("loads");setScanMode("scan");setTimeout(()=>fileRef.current?.click(),150);}} style={{width:"100%",padding:"8px",borderRadius:7,background:`${C.red}20`,border:`1px solid ${C.red}55`,color:C.red,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>🔄 Re-scan This Week</button>
                      </div>
                    )}

                    {/* 4 Summary Blocks */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                      {buckets.map(b=>(
                        <div key={b.id} onClick={()=>setHelpCard(helpCard===b.id+"_open"?null:b.id+"_open")}
                          style={{background:`${b.color}10`,border:`1px solid ${b.color}33`,borderRadius:11,padding:"11px 12px",cursor:"pointer",transition:"all 0.15s",position:"relative"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                            <div style={{display:"flex",alignItems:"center",gap:5}}>
                              <span style={{fontSize:15}}>{b.icon}</span>
                              <div>
                                <div style={{fontSize:11,fontWeight:800,color:"#f0f6ff"}}>{b.label}</div>
                                <div style={{fontSize:8,color:b.color,fontWeight:600}}>{b.sublabel}</div>
                              </div>
                            </div>
                            {helpBtn(b.id)}
                          </div>
                          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:900,color:b.color,marginBottom:2}}>
                            ${b.total.toFixed(0)}
                          </div>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <div style={{fontSize:9,color:"#8fa3c0"}}>{b.pct}% of gross</div>
                            <div style={{fontSize:9,color:b.color,fontWeight:700}}>{b.items.length} item{b.items.length!==1?"s":""} {helpCard===b.id+"_open"?"▲":"▼"}</div>
                          </div>
                          {b.id==="ded_fuel"&&dw.rebate>0&&(()=>{
                            const netFuel=Math.max(0,fuelTotal-dw.rebate);
                            const netPct=dw.gross>0?(netFuel/dw.gross*100).toFixed(1):0;
                            return(
                              <div style={{marginTop:4,paddingTop:4,borderTop:`1px solid ${b.color}22`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                <div style={{fontSize:8,color:"#4ade80"}}>↳ net of rebate</div>
                                <div style={{fontSize:9,color:"#4ade80",fontWeight:700}}>${netFuel.toFixed(0)} · {netPct}%</div>
                              </div>
                            );
                          })()}
                          {/* Mini bar */}
                          <div style={{height:3,background:`${b.color}25`,borderRadius:2,marginTop:7,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${Math.min(b.pct*3,100)}%`,background:b.color,borderRadius:2}}/>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Dropdowns for each bucket */}
                    {buckets.map(b=>(
                      <div key={b.id+"_dd"}>
                        {/* Help modal */}
                        {helpModal(b.id)}
                        {/* Dropdown */}
                        {helpCard===b.id+"_open"&&(
                          <div style={{background:C.bg,border:`1px solid ${b.color}33`,borderRadius:10,marginBottom:10,overflow:"hidden",animation:"fadein 0.15s ease"}}>
                            <div style={{padding:"8px 12px",background:`${b.color}12`,borderBottom:`1px solid ${b.color}22`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                              <div style={{fontSize:10,fontWeight:800,color:b.color,letterSpacing:"0.06em",textTransform:"uppercase"}}>{b.icon} {b.label} Detail</div>
                              <button onClick={e=>{e.stopPropagation();setHelpCard(null);}} style={{background:"none",border:"none",color:"#8fa3c0",fontSize:14,cursor:"pointer",lineHeight:1,padding:0}}>×</button>
                            </div>
                            {b.items.length===0?(
                              <div style={{padding:"12px",fontSize:10,color:"#8fa3c0",textAlign:"center"}}>No {b.label.toLowerCase()} deductions this week</div>
                            ):(
                              <div>
                                {b.items.map((d,i)=>b.render(d,i))}
                                <div style={{padding:"8px 12px",background:`${b.color}08`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                  <div style={{fontSize:9,color:"#8fa3c0",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>{b.label} Total</div>
                                  <div style={{fontSize:13,fontWeight:800,color:b.color}}>{b.id==="ded_escrow"?"+":" -"}${b.total.toFixed(2)}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Grand total bar */}
                    <div style={{padding:"10px 12px",background:C.bg,borderRadius:9,border:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4,marginBottom:10}}>
                      <div style={{fontSize:11,fontWeight:700,color:C.text}}>Total Deductions</div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{fontSize:9,color:C.sub}}>{dw.gross>0?(dedSum/dw.gross*100).toFixed(1):0}% of gross</div>
                        <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:800,color:"#f87171"}}>-${dedSum.toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Return on Spend — Pro Smart, with one free use every 31 days */}
                    {!isSmart&&!featureTrialActive.returnOnSpend&&(
                      <div style={{padding:"9px 12px",borderRadius:10,background:`${C.a3}0d`,border:`1px dashed ${C.a3}44`,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:11,color:C.sub}}>🔒 💰 Return on Spend — Pro Smart</span>
                        {canUseFeatureFree("returnOnSpend")?(
                          <button onClick={function(){useFeatureToken("returnOnSpend");setFeatureTrialActive(function(p){return {...p,returnOnSpend:true};});}} style={{padding:"4px 10px",borderRadius:7,background:"#4ade8022",border:"1px solid #4ade8055",color:"#4ade80",fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>🎁 Try Free</button>
                        ):(
                          <span onClick={()=>openUpgrade("ros")} style={{fontSize:9,color:C.accent,fontWeight:700,cursor:"pointer"}}>Upgrade →</span>
                        )}
                      </div>
                    )}
                    {(isSmart||featureTrialActive.returnOnSpend)&&(()=>{
                      const netCost=Math.max(0.01,dedSum-(dw.rebate||0));
                      const ratio=dw.gross/netCost;
                      const tier=ratio>=3?{label:"IDEAL",color:C.green,icon:"🚀"}:ratio>=1.5?{label:"SAFE",color:C.gold,icon:"✅"}:{label:"BELOW SAFE",color:C.red,icon:"⚠️"};
                      const profitPerDollar=(ratio-1).toFixed(2);
                      const isOpen=helpCard==="ros_open";
                      return(
                        <div style={{borderRadius:10,background:`${tier.color}0d`,border:`1px solid ${tier.color}33`,marginBottom:14,overflow:"hidden"}}>
                          <div onClick={()=>setHelpCard(isOpen?null:"ros_open")} style={{padding:"9px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
                            <div style={{display:"flex",alignItems:"center",gap:7}}>
                              <span style={{fontSize:11,fontWeight:800,color:C.sub}}>💰 Return on Spend</span>
                              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:900,color:tier.color}}>1:{ratio.toFixed(2)}</span>
                              <span style={{padding:"1px 7px",borderRadius:20,background:`${tier.color}20`,border:`1px solid ${tier.color}44`,fontSize:8,fontWeight:800,color:tier.color}}>{tier.icon} {tier.label}</span>
                            </div>
                            <span style={{fontSize:11,color:C.sub}}>{isOpen?"▲":"▼"}</span>
                          </div>
                          {isOpen&&(
                            <div style={{padding:"0 12px 12px"}}>
                              <div style={{fontSize:10,color:C.sub,marginBottom:6}}>Every $1 spent produced ${ratio.toFixed(2)} in revenue</div>
                              <div style={{fontSize:9,color:C.sub,lineHeight:1.5}}>
                                {ratio>=3
                                  ? `Excellent — for every $1 you spent running this week, you profited $${profitPerDollar}. That's well above the 1:3 ideal target.`
                                  : ratio>=1.5
                                  ? `Solid — you're profiting $${profitPerDollar} for every $1 spent, within the safe 1:1.5+ range. Push toward 1:3 by cutting variable costs or boosting RPM.`
                                  : `Below the safe threshold — you're only netting $${profitPerDollar} per $1 spent. Review your fuel efficiency, deductions, and load rates this week.`}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Fuel Rebate Banner */}
                    {dw.rebate>0&&(()=>{
                      const weekFuelA=(dw.deds||[]).filter(d=>d&&d.l&&d.l.toLowerCase().includes("fuel advance")&&d.vendor);
                      const topVendor=weekFuelA.length>0?weekFuelA.reduce((a,b)=>(b.gal||0)>(a.gal||0)?b:a):null;
                      const vendorLabel=topVendor?`${topVendor.vendor}${topVendor.city?", "+topVendor.city:""}`:null;
                      return(
                        <div style={{padding:"10px 12px",borderRadius:9,background:`${C.green}10`,border:`1px solid ${C.green}33`,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontSize:14}}>💰</span>
                            <div>
                              <div style={{fontSize:11,fontWeight:700,color:C.text}}>Fuel Rebate Earned</div>
                              <div style={{fontSize:9,color:C.sub,marginTop:1}}>{vendorLabel?`From ${vendorLabel}`:"Cash back from your fuel vendor this week"}</div>
                            </div>
                          </div>
                          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:800,color:C.green}}>+${dw.rebate.toFixed(2)}</div>
                        </div>
                      );
                    })()}

                    {/* Average Fuel Price This Week */}
                    {(()=>{
                      const weekFuelA=(dw.deds||[]).filter(d=>d&&d.l&&d.l.toLowerCase().includes("fuel advance")&&d.ppg>0);
                      if(weekFuelA.length===0)return null;
                      const totalGal=weekFuelA.reduce((s,d)=>s+(d.gal||0),0);
                      const totalCost=weekFuelA.reduce((s,d)=>s+(d.a||0),0);
                      const avgPPG=totalGal>0?totalCost/totalGal:0;
                      const priceColor=avgPPG>=5?C.red:avgPPG>=4?C.gold:C.green;
                      return(
                        <div style={{padding:"10px 12px",borderRadius:9,background:`${priceColor}0d`,border:`1px solid ${priceColor}33`,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontSize:14}}>⛽</span>
                            <div>
                              <div style={{fontSize:11,fontWeight:700,color:C.text}}>Average Fuel Price This Week</div>
                              <div style={{fontSize:9,color:C.sub,marginTop:1}}>{totalGal.toFixed(1)} gallons across {weekFuelA.length} fill-up{weekFuelA.length!==1?"s":""}</div>
                            </div>
                          </div>
                          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:800,color:priceColor}}>${avgPPG.toFixed(3)}/gal</div>
                        </div>
                      );
                    })()}

                    {/* Smart Insights — Pro Smart, with one free use every 31 days */}
                    {!isSmart&&!featureTrialActive.smartInsights&&(
                      <div style={{padding:"14px",borderRadius:9,background:`${C.a3}0d`,border:`1px dashed ${C.a3}44`,marginBottom:14,textAlign:"center"}}>
                        <div style={{fontSize:20,marginBottom:4}}>🔒</div>
                        <div style={{fontSize:11,fontWeight:700,color:C.text,marginBottom:2}}>Smart Insights — Pro Smart Feature</div>
                        <div style={{fontSize:9,color:C.sub,marginBottom:8}}>Get automatic alerts when your fuel, insurance, or ops costs jump unusually — before it becomes a pattern.</div>
                        {canUseFeatureFree("smartInsights")?(
                          <div>
                            <button onClick={function(){useFeatureToken("smartInsights");setFeatureTrialActive(function(p){return {...p,smartInsights:true};});}} style={{padding:"7px 14px",borderRadius:8,background:"linear-gradient(135deg,#4ade80,#22c55e)",border:"none",color:"#000",fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"inherit",marginRight:6}}>🎁 Use My Free Trial</button>
                            <button onClick={()=>openUpgrade("insights")} style={{padding:"7px 14px",borderRadius:8,background:"transparent",border:`1px solid ${C.a3}55`,color:C.a3,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Upgrade Instead →</button>
                          </div>
                        ):(
                          <div>
                            <div style={{fontSize:9,color:C.sub,marginBottom:6}}>Free trial used — available again in {daysUntilFeatureFree("smartInsights")} day{daysUntilFeatureFree("smartInsights")===1?"":"s"}.</div>
                            <button onClick={()=>openUpgrade("insights")} style={{padding:"7px 16px",borderRadius:8,background:`linear-gradient(135deg,${C.accent},${C.a3})`,border:"none",color:"#000",fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Upgrade to Pro Smart →</button>
                          </div>
                        )}
                      </div>
                    )}
                    {(isSmart||featureTrialActive.smartInsights)&&(()=>{
                      const recentW=allW.slice(Math.max(0,allW.findIndex(w=>w.week===dw.week)-7),allW.findIndex(w=>w.week===dw.week)+1);
                      const histW=recentW.length>1?recentW.slice(0,-1):[];
                      const avgOf=(cat)=>{
                        if(histW.length===0)return null;
                        const vals=histW.map(w=>{
                          const wd=(w.deds||[]).filter(d=>d&&d.l);
                          if(cat==="fuel")return wd.filter(d=>d.l.toLowerCase().includes("fuel advance")).reduce((s,d)=>s+d.a,0);
                          if(cat==="insurance")return wd.filter(d=>["physical damage","bobtail","occacc","occ/acc","roadside","liability limiter"].some(k=>d.l.toLowerCase().includes(k))).reduce((s,d)=>s+d.a,0);
                          if(cat==="ops")return wd.filter(d=>["eld","event recorder","parking","license","highway tax"].some(k=>d.l.toLowerCase().includes(k))).reduce((s,d)=>s+d.a,0);
                          return 0;
                        });
                        return vals.reduce((a,b)=>a+b,0)/vals.length;
                      };
                      const catTotals={fuel:fuelTotal,insurance:insTotal,ops:opsTotal};
                      const movers=Object.keys(catTotals).map(cat=>{
                        const avg=avgOf(cat);
                        if(avg===null||avg===0)return null;
                        const pctChange=((catTotals[cat]-avg)/avg)*100;
                        return {cat,pctChange,current:catTotals[cat],avg};
                      }).filter(Boolean).filter(m=>Math.abs(m.pctChange)>15).sort((a,b)=>Math.abs(b.pctChange)-Math.abs(a.pctChange));
                      const topMover=movers[0];
                      const catLabel={fuel:"Fuel",insurance:"Insurance",ops:"Operations"};
                      const catIcon={fuel:"⛽",insurance:"🛡️",ops:"⚙️"};

                      const escTarget=2500;
                      const escBalance=dw.escrow_regular_balance||0;
                      const escPct=Math.min(100,(escBalance/escTarget)*100);
                      const weeklyEscrow=100;
                      const weeksLeft=escBalance<escTarget?Math.ceil((escTarget-escBalance)/weeklyEscrow):0;

                      return(
                        <div style={{marginBottom:14}}>
                          <div style={{fontSize:9,fontWeight:800,color:C.sub,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>💡 Smart Insights</div>

                          {topMover&&(
                            <div style={{padding:"10px 12px",borderRadius:9,background:topMover.pctChange>0?`${C.red}10`:`${C.green}10`,border:`1px solid ${topMover.pctChange>0?C.red:C.green}33`,marginBottom:8,display:"flex",alignItems:"flex-start",gap:8}}>
                              <span style={{fontSize:14,flexShrink:0}}>{topMover.pctChange>0?"⚠️":"✅"}</span>
                              <div style={{fontSize:10,color:C.text,lineHeight:1.5}}>
                                <b>{catIcon[topMover.cat]} {catLabel[topMover.cat]}</b> {topMover.pctChange>0?"up":"down"} <b style={{color:topMover.pctChange>0?C.red:C.green}}>{Math.abs(topMover.pctChange).toFixed(0)}%</b> vs your {histW.length}-week average (${topMover.avg.toFixed(0)} → ${topMover.current.toFixed(0)})
                              </div>
                            </div>
                          )}

                          {escBalance>0&&escBalance<escTarget&&(
                            <div style={{padding:"10px 12px",borderRadius:9,background:`${C.a3}10`,border:`1px solid ${C.a3}33`,marginBottom:8}}>
                              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                                <div style={{fontSize:10,color:C.text,fontWeight:700}}>🏦 Escrow Progress</div>
                                <div style={{fontSize:10,color:C.a3,fontWeight:700}}>${escBalance.toFixed(0)} / ${escTarget}</div>
                              </div>
                              <div style={{height:5,background:C.bg,borderRadius:3,overflow:"hidden",marginBottom:5}}>
                                <div style={{height:"100%",width:escPct+"%",background:C.a3,borderRadius:3}}/>
                              </div>
                              <div style={{fontSize:9,color:C.sub}}>{weeksLeft>0?`~${weeksLeft} weeks left at $100/wk`:"Target reached!"}</div>
                            </div>
                          )}

                          {!topMover&&!(escBalance>0&&escBalance<escTarget)&&(
                            <div style={{padding:"10px 12px",borderRadius:9,background:C.bg,border:`1px solid ${C.border}`,fontSize:10,color:C.sub}}>
                              ✅ Deductions look stable — no unusual changes detected this week.
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Owner Notes */}
                    <div style={{marginBottom:14}}>
                      <div style={{fontSize:9,fontWeight:800,color:C.sub,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>📝 Owner Notes — W{dw.week}</div>
                      <textarea
                        value={ownerNotes[dw.week]||""}
                        onChange={e=>setOwnerNotes(p=>({...p,[dw.week]:e.target.value}))}
                        placeholder="e.g. Called carrier about the $55 license fee — confirmed permanent..."
                        style={{width:"100%",minHeight:64,padding:"10px 12px",borderRadius:9,background:C.bg,border:`1px solid ${C.border}`,color:C.text,fontSize:11,fontFamily:"inherit",resize:"vertical",boxSizing:"border-box",lineHeight:1.5}}
                      />
                    </div>

                    {/* Manual Fuel Log — real pump-to-pump fill-up tracking */}
                    <div>
                      <div style={{fontSize:9,fontWeight:800,color:C.sub,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>⛽ Manual Fuel Log — Real MPG Tracker</div>
                      <div style={{fontSize:9,color:C.sub,lineHeight:1.5,marginBottom:10}}>Log your odometer every time you fuel up. DrayageIQ calculates miles driven and real MPG automatically between fill-ups — no manual math needed.</div>

                      {(()=>{
                        const sorted=[...fuelFillups].sort((a,b)=>new Date(a.date)-new Date(b.date));
                        const lastFillup=sorted[sorted.length-1]||null;

                        const addFillup=()=>{
                          if(!newFillup.date||!newFillup.odometer||!newFillup.gallons||!newFillup.cost)return;
                          const odo=parseFloat(newFillup.odometer);
                          const gal=parseFloat(newFillup.gallons);
                          const cost=parseFloat(newFillup.cost);
                          let miles=null,mpg=null;
                          if(lastFillup){
                            miles=odo-parseFloat(lastFillup.odometer);
                            if(miles>0&&gal>0)mpg=(miles/gal).toFixed(2);
                          }
                          setFuelFillups(p=>[...p,{date:newFillup.date,odometer:odo,gallons:gal,cost:cost,milesSinceLast:miles,mpg:mpg}]);
                          setNewFillup({date:"",odometer:"",gallons:"",cost:""});
                        };

                        return(
                          <div>
                            {/* Add new fill-up form */}
                            <div style={{background:C.bg,borderRadius:9,border:`1px solid ${C.border}`,padding:12,marginBottom:12}}>
                              <div style={{fontSize:9,fontWeight:700,color:C.accent,marginBottom:8,textTransform:"uppercase"}}>{lastFillup?"Log Next Fill-Up":"Log Your First Fill-Up"}</div>
                              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                                <div>
                                  <div style={{fontSize:8,color:C.sub,marginBottom:3}}>DATE</div>
                                  <input type="date" value={newFillup.date} onChange={e=>setNewFillup(p=>({...p,date:e.target.value}))} style={{width:"100%",padding:"8px 9px",borderRadius:7,background:C.card,border:`1px solid ${C.border}`,color:C.text,fontSize:11,fontFamily:"inherit",boxSizing:"border-box"}}/>
                                </div>
                                <div>
                                  <div style={{fontSize:8,color:C.sub,marginBottom:3}}>ODOMETER (mi)</div>
                                  <input type="number" value={newFillup.odometer} onChange={e=>setNewFillup(p=>({...p,odometer:e.target.value}))} placeholder="e.g. 145820" style={{width:"100%",padding:"8px 9px",borderRadius:7,background:C.card,border:`1px solid ${C.border}`,color:C.text,fontSize:11,fontFamily:"inherit",boxSizing:"border-box"}}/>
                                </div>
                                <div>
                                  <div style={{fontSize:8,color:C.sub,marginBottom:3}}>GALLONS PUMPED</div>
                                  <input type="number" value={newFillup.gallons} onChange={e=>setNewFillup(p=>({...p,gallons:e.target.value}))} placeholder="e.g. 120" style={{width:"100%",padding:"8px 9px",borderRadius:7,background:C.card,border:`1px solid ${C.border}`,color:C.text,fontSize:11,fontFamily:"inherit",boxSizing:"border-box"}}/>
                                </div>
                                <div>
                                  <div style={{fontSize:8,color:C.sub,marginBottom:3}}>TOTAL COST ($)</div>
                                  <input type="number" value={newFillup.cost} onChange={e=>setNewFillup(p=>({...p,cost:e.target.value}))} placeholder="e.g. 590" style={{width:"100%",padding:"8px 9px",borderRadius:7,background:C.card,border:`1px solid ${C.border}`,color:C.text,fontSize:11,fontFamily:"inherit",boxSizing:"border-box"}}/>
                                </div>
                              </div>
                              {lastFillup&&<div style={{fontSize:9,color:C.sub,marginBottom:8}}>Last fill-up: {lastFillup.odometer.toLocaleString()} mi on {lastFillup.date}</div>}
                              <button onClick={addFillup} style={{width:"100%",padding:"9px",borderRadius:8,background:`linear-gradient(135deg,${C.accent},${C.a3})`,border:"none",color:"#000",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>+ Log Fill-Up</button>
                            </div>

                            {/* Most recent calculated MPG */}
                            {lastFillup&&lastFillup.mpg&&(
                              <div style={{padding:"10px 12px",borderRadius:9,background:`${C.green}0d`,border:`1px solid ${C.green}33`,marginBottom:10}}>
                                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                  <div>
                                    <div style={{fontSize:10,color:C.text,fontWeight:700}}>Real MPG (Last Fill-Up)</div>
                                    <div style={{fontSize:9,color:C.sub,marginTop:1}}>{lastFillup.milesSinceLast.toFixed(0)} mi driven since previous fill-up</div>
                                  </div>
                                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:800,color:C.green}}>{lastFillup.mpg}</div>
                                </div>
                              </div>
                            )}

                            {/* History */}
                            {sorted.length>0&&(
                              <div>
                                <div style={{fontSize:8,fontWeight:700,color:C.sub,marginBottom:6,textTransform:"uppercase"}}>Fill-Up History ({sorted.length}) — tap ✕ to remove</div>
                                <div style={{maxHeight:160,overflowY:"auto"}}>
                                  {[...sorted].reverse().map((f,i)=>{
                                    const origIdx=fuelFillups.findIndex(x=>x.date===f.date&&x.odometer===f.odometer&&x.gallons===f.gallons);
                                    return(
                                      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 9px",background:C.bg,borderRadius:6,marginBottom:4,fontSize:9}}>
                                        <span style={{color:C.sub}}>{f.date} · {f.odometer.toLocaleString()} mi · {f.gallons} gal</span>
                                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                                          <span style={{color:f.mpg?C.accent:C.sub,fontWeight:700}}>{f.mpg?`${f.mpg} MPG`:"—"}</span>
                                          <button onClick={()=>{if(origIdx>=0)setFuelFillups(p=>p.filter((_,idx)=>idx!==origIdx));}} style={{background:"none",border:"none",color:C.red,fontSize:12,cursor:"pointer",padding:"0 2px",lineHeight:1,fontFamily:"inherit"}}>✕</button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })()}
            </div>

              {/* ⛽ FUEL VS MILES MPG CARD */}
              {(()=>{
                const reportedMiles=(dw.moves||[]).reduce(function(s,m){return s+(m.mi||m.miles||0);},0);
                const dwFuelCost=(dw.deds||[]).filter(function(d){return d&&d.l&&d.l.toLowerCase().includes("fuel advance");}).reduce(function(s,d){return s+d.a;},0);
                const hasRealGallons=dw.gallons&&dw.gallons>0;
                const realPricePerGallon=dw.price_per_gallon&&dw.price_per_gallon>0?dw.price_per_gallon:fuelPrice;
                const gallonsBought=hasRealGallons?dw.gallons:(realPricePerGallon>0?dwFuelCost/realPricePerGallon:0);
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
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <span style={{fontSize:16}}>⛽</span>
                        <span style={{fontSize:12,fontWeight:700,color:C.text}}>Fuel vs Miles · W{dw.week}</span>
                      </div>
                      <span style={{padding:"3px 10px",borderRadius:20,background:`${verdictColor}18`,border:`1px solid ${verdictColor}44`,fontSize:11,fontWeight:700,color:verdictColor}}>
                        {truckBeatBaseline?"✅ Efficient":"⚠️ Below Baseline"}
                      </span>
                    </div>
                    <div style={{padding:"14px",background:`${verdictColor}10`,borderRadius:10,border:`1px solid ${verdictColor}33`,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:10,color:C.sub,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>Settlement MPG — {gallonsSource}</div>
                        <div style={{fontSize:11,color:C.sub,marginBottom:5}}>{reportedMiles.toLocaleString()} paid miles + {gallonsBought.toFixed(1)} gallons bought</div>
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
                    <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12}}>
                      <div style={{fontSize:9,color:"#fbbf24",fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.07em"}}>⚙️ Calibrate to your truck</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                        <div style={{background:C.bg,borderRadius:9,padding:"10px",border:`1px solid ${C.border}`}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                            <div style={{fontSize:10,color:C.sub,fontWeight:600}}>Baseline MPG {mpgAutoSync&&<span style={{fontSize:8,color:C.green,fontWeight:700}}>· AUTO</span>}</div>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <button disabled={mpgAutoSync} onClick={function(){setFuelMPG(function(p){return Math.max(3.5,Math.round((p-0.1)*10)/10);});}} style={{width:26,height:26,borderRadius:7,background:C.raised,border:`1px solid ${C.border}`,color:mpgAutoSync?C.sub:C.text,fontSize:14,fontWeight:800,cursor:mpgAutoSync?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",opacity:mpgAutoSync?0.4:1}}>−</button>
                              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:17,fontWeight:800,color:C.accent,minWidth:32,textAlign:"center"}}>{fuelMPG.toFixed(1)}</span>
                              <button disabled={mpgAutoSync} onClick={function(){setFuelMPG(function(p){return Math.min(9.0,Math.round((p+0.1)*10)/10);});}} style={{width:26,height:26,borderRadius:7,background:C.raised,border:`1px solid ${C.border}`,color:mpgAutoSync?C.sub:C.text,fontSize:14,fontWeight:800,cursor:mpgAutoSync?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",opacity:mpgAutoSync?0.4:1}}>+</button>
                            </div>
                          </div>
                          <input type="range" min="3.5" max="9.0" step="0.1" value={fuelMPG} disabled={mpgAutoSync}
                            onChange={function(e){setFuelMPG(parseFloat(e.target.value));}}
                            style={{width:"100%",accentColor:C.accent,cursor:mpgAutoSync?"not-allowed":"pointer",marginBottom:4,opacity:mpgAutoSync?0.5:1}}/>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:8,marginBottom:6}}>
                            <span style={{color:"#f87171"}}>3.5 poor</span>
                            <span style={{color:"#4ade80"}}>9.0 great</span>
                          </div>
                          {(isSmart||featureTrialActive.mpgAutoSync)?(
                            <button onClick={()=>setMpgAutoSync(p=>!p)} style={{width:"100%",padding:"6px",borderRadius:6,background:mpgAutoSync?`${C.green}15`:`${C.gold}15`,border:`1px solid ${mpgAutoSync?C.green:C.gold}44`,color:mpgAutoSync?C.green:C.gold,fontSize:8,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                              {mpgAutoSync?"✅ Auto-syncing from last 4 weeks — tap to set manually":"⚙️ Manual mode — tap to auto-sync from real data"}
                            </button>
                          ):canUseFeatureFree("mpgAutoSync")?(
                            <button onClick={function(){useFeatureToken("mpgAutoSync");setFeatureTrialActive(function(p){return {...p,mpgAutoSync:true};});setMpgAutoSync(true);}} style={{width:"100%",padding:"6px",borderRadius:6,background:"#4ade8022",border:"1px solid #4ade8055",color:"#4ade80",fontSize:8,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                              🎁 Try free — 1 use every 31 days
                            </button>
                          ):(
                            <button onClick={()=>openUpgrade("autosync")} style={{width:"100%",padding:"6px",borderRadius:6,background:`${C.a3}15`,border:`1px solid ${C.a3}44`,color:C.a3,fontSize:8,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                              🔒 Trial used — upgrade for unlimited access
                            </button>
                          )}
                        </div>
                        <div style={{background:C.bg,borderRadius:9,padding:"10px",border:`1px solid ${C.border}`}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                            <div style={{fontSize:10,color:C.sub,fontWeight:600}}>Price / Gallon {priceAutoSync&&<span style={{fontSize:8,color:C.green,fontWeight:700}}>· AUTO</span>}</div>
                            <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:800,color:fuelPrice>=6?C.red:C.gold}}>${fuelPrice.toFixed(2)}</span>
                          </div>
                          <input type="range" min="3.50" max="8.00" step="0.01" value={fuelPrice} disabled={priceAutoSync}
                            onChange={function(e){setFuelPrice(parseFloat(e.target.value));}}
                            style={{width:"100%",accentColor:C.accent,cursor:priceAutoSync?"not-allowed":"pointer",marginBottom:4,opacity:priceAutoSync?0.5:1}}/>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:8,marginBottom:6}}>
                            <span style={{color:"#4ade80"}}>$3.50</span>
                            <span style={{color:"#f87171"}}>$8.00</span>
                          </div>
                          {(isSmart||featureTrialActive.priceAutoSync)?(
                            <button onClick={()=>setPriceAutoSync(p=>!p)} style={{width:"100%",padding:"6px",borderRadius:6,background:priceAutoSync?`${C.green}15`:`${C.gold}15`,border:`1px solid ${priceAutoSync?C.green:C.gold}44`,color:priceAutoSync?C.green:C.gold,fontSize:8,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                              {priceAutoSync?"✅ Auto-syncing from this week's fuel advances — tap to set manually":"⚙️ Manual mode — tap to auto-sync from real data"}
                            </button>
                          ):canUseFeatureFree("priceAutoSync")?(
                            <button onClick={function(){useFeatureToken("priceAutoSync");setFeatureTrialActive(function(p){return {...p,priceAutoSync:true};});setPriceAutoSync(true);}} style={{width:"100%",padding:"6px",borderRadius:6,background:"#4ade8022",border:"1px solid #4ade8055",color:"#4ade80",fontSize:8,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                              🎁 Try free — 1 use every 31 days
                            </button>
                          ):(
                            <button onClick={()=>openUpgrade("autosync")} style={{width:"100%",padding:"6px",borderRadius:6,background:`${C.a3}15`,border:`1px solid ${C.a3}44`,color:C.a3,fontSize:8,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                              🔒 Trial used — upgrade for unlimited access
                            </button>
                          )}
                          <div style={{fontSize:9,color:C.sub,marginTop:5,lineHeight:1.5}}>{hasRealGallons?"Real gallons from settlement":"Match your fuel receipt for accuracy"}</div>
                        </div>
                      </div>
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
            </div>

          <div style={K()}>
                <div style={{fontSize:11,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>🏆 Week Grades{helpBtn("grades")}<button onClick={e=>{e.stopPropagation();toggleCard("grades");}} style={{background:"none",border:"none",color:C.sub,fontSize:12,cursor:"pointer",padding:"0 4px",lineHeight:1,fontFamily:"inherit"}}>{isCollapsed("grades")?"▶":"▼"}</button></div>
                {helpModal("grades")}
                {!isCollapsed("grades")&&vendorStats.map((v,vi)=>{
                  const vwi=allW.map((w,i)=>({w,i})).filter(({w})=>detectVendor(w)===v.key);
                  const vAvg=vwi.length>0?vwi.reduce((s,{w})=>s+w.net/w.gross*100,0)/vwi.length:0;
                  return(<div key={v.key} style={{marginBottom:vi<vendorStats.length-1?14:0,paddingBottom:vi<vendorStats.length-1?14:0,borderBottom:vi<vendorStats.length-1?`1px solid ${C.border}`:"none"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}><span style={{fontSize:13}}>{v.icon}</span><span style={{fontSize:10,fontWeight:700,color:v.color}}>{v.short}</span><span style={{fontSize:9,color:C.sub}}>avg {vAvg.toFixed(1)}%</span></div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {vwi.map(({w,i})=>{const g=wg(w);return(<div key={w.week} onClick={()=>{setSH(i);setSD(i);}} style={{padding:"5px 9px",borderRadius:7,background:i===sH?`${v.color}30`:`${v.color}12`,border:`2px solid ${i===sH?v.color:v.color+"33"}`,textAlign:"center",cursor:"pointer",minWidth:52}}><div style={{fontSize:8,color:C.sub}}>W{w.week}</div><div style={{fontSize:10,fontWeight:800,color:v.color}}>{g.i}</div><div style={{fontSize:8,color:v.color,opacity:0.8}}>{g.l}</div></div>);})}
                    </div>
                  </div>);
                })}
              </div>

              <div style={K({background:"linear-gradient(135deg,#0f1f14,#0f102a)",border:`1px solid ${C.green}44`})}>
                <div style={{fontSize:11,fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>💰 Savings & Escrow{helpBtn("savings")}</div>
                {helpModal("savings")}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                  {[{l:"Escrow Balance",v:`$${(tEscReg+tEsc290).toFixed(0)}`,c:C.a3,sub:latestEscRegBal>0?"actual from settlement":"calculated"},{l:"YTD Rebates",v:`$${tRebates.toFixed(2)}`,c:C.green,sub:"reimbursements"}].map(s=>(
                    <div key={s.l} style={{background:C.bg,borderRadius:9,padding:"10px",border:`1px solid ${C.border}`,textAlign:"center"}}><div style={{fontSize:9,color:C.sub,textTransform:"uppercase",marginBottom:4}}>{s.l}</div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:17,fontWeight:800,color:s.c}}>{s.v}</div>{s.sub&&<div style={{fontSize:8,color:C.sub,marginTop:3}}>{s.sub}</div>}</div>
                  ))}
                </div>
                <div style={{marginBottom:5}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,color:C.sub}}>Escrow Progress</span><span style={{fontSize:11,fontWeight:700,color:C.a3}}>${(tEscReg+tEsc290).toFixed(0)} / $2,500</span></div>
                  <Bar pct={(tEscReg+tEsc290)/2500*100} color={C.a3}/>
                </div>
              </div>

          {/* MOVE PERFORMANCE */}
          {!focusMode&&<div style={K()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>🚛 Move Performance{helpBtn("movePerf")}<button onClick={e=>{e.stopPropagation();toggleCard("movePerf");}} style={{background:"none",border:"none",color:C.sub,fontSize:12,cursor:"pointer",padding:"0 4px",lineHeight:1,fontFamily:"inherit"}}>{isCollapsed("movePerf")?"▶":"▼"}</button></div>
              <Nav i={sM} max={allW.length-1} prev={()=>setSM(p=>p-1)} next={()=>setSM(p=>p+1)} label={`W${mwBase.week}`}/>
            </div>
            {helpModal("movePerf")}
            <div style={{display:isCollapsed("movePerf")?"none":"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:14}}>
              {[{l:"Gross",v:`$${mwBase.gross.toLocaleString("en-US",{minimumFractionDigits:2})}`,c:C.accent},{l:"Net",v:`$${mwBase.net.toLocaleString("en-US",{minimumFractionDigits:2})}`,c:C.green},{l:"Avg RPM",v:`$${mwRPM}`,c:C.a3},{l:"Loaded %",v:`${mwLd}%`,c:mwLd>=60?C.green:C.gold}].map(s=>(
                <div key={s.l} style={{background:C.bg,borderRadius:9,padding:"10px",border:`1px solid ${C.border}`,textAlign:"center"}}><div style={{fontSize:9,color:C.sub,textTransform:"uppercase",marginBottom:4}}>{s.l}</div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:700,color:s.c}}>{s.v}</div></div>
              ))}
            </div>
            <div style={{display:isCollapsed("movePerf")?"none":"block",overflowX:"auto",overflowY:"auto",maxHeight:320,borderRadius:8,border:`1px solid ${C.border}`}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{borderBottom:`2px solid ${C.border}`,background:C.raised}}>{["Type","Route","Mi","Rate","FSC","Total","RPM","Grade"].map(h=><th key={h} style={{textAlign:"left",padding:"9px 9px",color:C.sub,fontWeight:700,fontSize:10,textTransform:"uppercase",whiteSpace:"nowrap",position:"sticky",top:0,background:C.raised,zIndex:2}}>{h}</th>)}</tr></thead>
                <tbody>{mwMoves.map((m,i)=>{const s=scoreMove(m);return(
                  <tr key={i} style={{borderBottom:`1px solid ${C.border}`,background:i%2?"#ffffff06":"transparent"}}>
                    <td style={{padding:"9px"}}><span style={{padding:"3px 8px",borderRadius:5,fontSize:10,fontWeight:700,background:m.type==="L"?`${C.green}25`:`${C.gold}25`,color:m.type==="L"?C.green:C.gold}}>{m.type==="L"?"LOAD":"EMPTY"}</span></td>
                    <td style={{padding:"9px",color:C.text,whiteSpace:"nowrap",fontSize:11}}>{m.from}→{m.to}{m.customer?<div style={{fontSize:9,color:C.a3,fontWeight:700}}>{m.customer}</div>:null}{m.dt?<div style={{fontSize:8,color:C.sub}}>{m.dt}</div>:null}</td>
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
            const lwFuelGross=(lw.deds||[]).filter(function(d){return d.l.toLowerCase().includes("fuel");}).reduce(function(s,d){return s+d.a;},0);
            const lwFuel=Math.max(0,lwFuelGross-(lw.rebate||0));// net of rebate for accurate alert
            const lwLoaded=lw.moves&&lw.moves.length>0?Math.round(lw.moves.filter(function(m){return m.t==="L"||m.type==="L";}).length/lw.moves.length*100):0;
            const targetNet=parseFloat(profile.targetWeeklyNet)||3000,gap=targetNet-lw.net,avgRPMnum=parseFloat(avgRPM)||0;
            const actions=[];
            if(lw.net<targetNet&&gap>0)actions.push({icon:"💰",color:"#fbbf24",title:"Close the $"+Math.round(gap).toLocaleString()+" gap to your weekly target",detail:"W"+lw.week+" net was $"+lw.net.toFixed(0)+". "+Math.ceil(gap/250)+" additional loaded runs at your average rate would close this gap."});
            if(lwLoaded<60)actions.push({icon:"📦",color:"#00ffcc",title:"Boost your loaded percentage — currently "+lwLoaded+"%",detail:"Less than 60% loaded miles hurts your revenue per mile. Prioritize back-to-back loaded moves."});
            if(lwFuel>800)actions.push({icon:"⛽",color:"#f87171",title:"Fuel cost of $"+Math.round(lwFuel).toLocaleString()+" (net of rebate) is high this week",detail:"Check if your settlement MPG is below baseline. High fuel advances could mean inefficient routes."});
            if(avgRPMnum<2.5)actions.push({icon:"📈",color:"#a78bfa",title:"Avg RPM of $"+avgRPM+" is below $2.50 target",detail:"Review your route mix and decline D-grade offers — they cost more than they pay."});
            const topActions=actions.slice(0,3);if(topActions.length===0)return null;
            return(
              <div style={K({marginBottom:16})}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700}}>🎯 Weekly Action Plan{helpBtn("actionPlan")}<button onClick={e=>{e.stopPropagation();toggleCard("actionPlan");}} style={{background:"none",border:"none",color:C.sub,fontSize:12,cursor:"pointer",padding:"0 4px",lineHeight:1,fontFamily:"inherit"}}>{isCollapsed("actionPlan")?"▶":"▼"}</button></div>
                  <div style={{fontSize:9,padding:"2px 7px",borderRadius:5,background:C.green+"20",color:C.green,fontWeight:700,marginLeft:"auto"}}>W{lw.week} · {topActions.length} actions</div>
                </div>
                {helpModal("actionPlan")}
                <div style={{display:isCollapsed("actionPlan")?"none":"flex",flexDirection:"column",gap:9}}>
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
            <div><div style={{fontSize:12,fontWeight:800,color:"#f87171"}}>🔴 Delete My Data</div><div style={{fontSize:10,color:C.sub,marginTop:2}}>Permanently erases all your data from this device — weeks, profile, expenses, settings. Required for your CCPA right to deletion.</div></div>
            <button onClick={()=>{if(window.confirm("Delete ALL your DrayageIQ data from this device? This permanently erases your weeks, profile, expenses, and settings and cannot be undone.")){try{localStorage.clear();}catch(e){}window.location.reload();}}} style={{padding:"8px 18px",borderRadius:9,background:"#f87171",color:"#000",fontSize:12,fontWeight:800,border:"none",cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>Delete</button>
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
                {scanning&&(
                  <div style={{textAlign:"center",padding:"28px 16px"}}>
                    <div style={{fontSize:42,marginBottom:12}}>⏳</div>
                    <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:800,color:"#a78bfa",marginBottom:6}}>
                      {scanQueue.length>0?scanQueue[0]?.name||"Scanning...":"AI Reading Your Settlement..."}
                    </div>
                    {scanQueue.length>0&&<div style={{fontSize:11,color:C.sub,marginBottom:10}}>File {(scanQueue[0]?.index||0)+1} of {scanQueue[0]?.total||1} — auto-saving each week</div>}
                    <div style={{height:5,background:C.raised,borderRadius:4,overflow:"hidden",marginBottom:6}}>
                      <div style={{height:"100%",background:`linear-gradient(90deg,${C.a3},${C.accent})`,borderRadius:4,transition:"width 0.3s",width:scanQueue.length>0?`${Math.round(((scanQueue[0]?.index||0)/((scanQueue[0]?.total||1)))*100)}%`:"70%"}}/>
                    </div>
                  </div>
                )}
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
            {scanQueueLog.length>1&&(
              <div style={{marginTop:12,background:C.bg,borderRadius:10,border:`1px solid ${C.border}`,padding:12}}>
                <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:"0.08em",marginBottom:8}}>BULK SCAN SUMMARY</div>
                {scanQueueLog.map((l,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:i<scanQueueLog.length-1?`1px solid ${C.border}`:"none"}}>
                    <span style={{fontSize:12}}>{l.status==="error"?"❌":"✅"}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,color:C.text,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.name}</div>
                      {l.status!=="error"&&<div style={{fontSize:10,color:C.sub}}>Week {l.week} · Gross ${Number(l.gross||0).toFixed(0)} · Net ${Number(l.net||0).toFixed(0)} · {l.status==="updated"?"updated":"saved"}</div>}
                      {l.status==="error"&&<div style={{fontSize:10,color:C.red}}>{l.msg}</div>}
                    </div>
                  </div>
                ))}
                <button onClick={()=>setScanQueueLog([])} style={{marginTop:8,width:"100%",padding:"7px",borderRadius:7,background:"transparent",border:`1px solid ${C.border}`,color:C.sub,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>✕ Dismiss</button>
              </div>
            )}
          </div>

          {/* ══ UPLOADED DOCS MANAGER ══ */}
          <div style={{background:"linear-gradient(135deg,"+C.card+","+C.surf+")",border:"1px solid "+C.border,borderRadius:16,overflow:"hidden",marginBottom:14}}>
            <div style={{padding:"13px 16px",background:"linear-gradient(135deg,"+C.a3+"14,"+C.accent+"08)",borderBottom:"1px solid "+C.border}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                <div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:800,color:C.text}}>📁 My Uploaded Settlements<button onClick={e=>{e.stopPropagation();toggleCard("uploads");}} style={{background:"none",border:"none",color:C.sub,fontSize:12,cursor:"pointer",padding:"0 4px",lineHeight:1,fontFamily:"inherit"}}>{isCollapsed("uploads")?"▶":"▼"}</button></div>
                  <div style={{fontSize:10,color:C.sub,marginTop:2}}>{demoMode?"Demo Mode — sample weeks only":allW.length+" uploaded · check box to select · delete selected"}</div>
                </div>
                <div style={{display:"flex",gap:7,flexShrink:0}}>
                  {!demoMode&&allW.length>0&&<button onClick={function(){if(selWkKeys.size===allW.length){setSelWkKeys(new Set());}else{setSelWkKeys(new Set(allW.map(function(w){return w.week+(w.from||"");})));} }} style={{padding:"5px 9px",borderRadius:7,background:C.raised,border:"1px solid "+C.border,color:C.sub,fontSize:10,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{selWkKeys.size===allW.length?"Deselect":"Select All"}</button>}
                  {!demoMode&&selWkKeys.size>0&&<button onClick={function(){if(window.confirm("Delete "+selWkKeys.size+" week"+(selWkKeys.size>1?"s":"")+"?")){setAddedW(function(p){return p.filter(function(w){return !selWkKeys.has(w.week+(w.from||""));});});setSelWkKeys(new Set());}}} style={{padding:"5px 11px",borderRadius:7,background:"#f8717118",border:"2px solid #f87171",color:"#f87171",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>🗑 Delete ({selWkKeys.size})</button>}
                </div>
              </div>
            </div>
            <div style={{padding:"10px 12px",display:isCollapsed("uploads")?"none":"flex",flexDirection:"column",gap:7}}>
              {demoMode&&<div style={{textAlign:"center",padding:"10px",marginBottom:4,background:C.a3+"12",border:"1px solid "+C.a3+"33",borderRadius:8,fontSize:10,color:C.a3,fontWeight:700}}>👀 Showing sample demo weeks only — your real data is hidden while Demo Mode is on</div>}
              {allW.length===0?<div style={{textAlign:"center",padding:"18px",color:C.sub,fontSize:11}}><div style={{fontSize:26,marginBottom:6}}>📭</div><div>No uploads yet — scan a PDF above</div></div>:[...allW].reverse().map(function(w,i){
                const g=wg(w),wKey=w.week+(w.from||""),isSel=selWkKeys.has(wKey);
                return(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 11px",background:isSel?"#f8717108":C.bg,borderRadius:10,border:"1px solid "+(isSel?"#f87171":C.a3+"44"),transition:"all 0.15s",boxShadow:isSel?"0 0 8px #f8717120":"none"}}>
                    <button onClick={function(){setSelWkKeys(function(prev){const next=new Set(prev);if(next.has(wKey))next.delete(wKey);else next.add(wKey);return next;});}} style={{width:20,height:20,borderRadius:5,border:"2px solid "+(isSel?"#f87171":C.border),background:isSel?"#f87171":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
                      {isSel&&<span style={{color:"#000",fontSize:10,fontWeight:900}}>✓</span>}
                    </button>
                    <div style={{width:7,height:7,borderRadius:"50%",background:C.a3,boxShadow:"0 0 5px "+C.a3,flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:700,color:isSel?"#f87171":C.text,display:"flex",alignItems:"center",gap:5}}>{w.label}<Tag color={isSel?"#f87171":C.a3}>{isSel?"✓ Selected":"Uploaded"}</Tag></div>
                      <div style={{fontSize:10,color:C.sub,marginTop:1}}>{w.from}{w.to?" – "+w.to:""} · {w.moves?.length||0} moves</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:700,color:C.green}}>${Number(w.net).toLocaleString("en-US",{minimumFractionDigits:2})}</div>
                      <Tag color={g.c}>{g.i} {g.l}</Tag>
                    </div>
                  </div>
                );
              })}
            </div>
            {!demoMode&&allW.length>0&&<div style={{padding:"8px 14px",borderTop:"1px solid "+C.border,fontSize:10,color:C.sub,textAlign:"center"}}>☑ Select → <span style={{color:"#f87171",fontWeight:700}}>Delete</span> to remove · rescan PDF to update data</div>}
          </div>


          {/* FUEL SURCHARGE CALCULATOR — Pro Smart, with one free use every 31 days for Standard */}
          <div style={{marginBottom:16}}>
            {renderWithFreeTrial("fscCalculator","Fuel Surcharge Calculator",function(){
              return(
                <FSCErrorBoundary>
                  <FuelSurchargeCalculator
                    dieselPrice={Number((liveData&&liveData.diesel)||fuelPrice||4.50)}
                    mpg={Number(fuelMPG||5.2)}
                    showShareFeature={isOwnerMode}
                    sharedBaseline={fscBaselinePrice}
                    setSharedBaseline={setFscBaselinePrice}
                    styles={{
                      card:K(),
                      title:{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,marginBottom:6,color:C.text},
                      subtitle:{fontSize:9,color:C.sub,lineHeight:1.5,marginBottom:12},
                      grid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12},
                      label:{fontSize:8,color:C.sub,marginBottom:3},
                      input:{width:"100%",padding:"8px 9px",borderRadius:7,background:C.bg,border:"1px solid "+C.border,color:C.text,fontSize:12,fontFamily:"inherit",boxSizing:"border-box"},
                      resultBox:{padding:"10px 12px",borderRadius:9,background:C.bg,border:"1px solid "+C.border},
                      resultRow:{display:"flex",justifyContent:"space-between",fontSize:9,color:C.sub,marginBottom:6},
                      rateLine:{fontSize:9,color:C.sub,marginBottom:4},
                      fscLine:{fontSize:14,fontWeight:800,color:C.green},
                      fscDollarStyle:{fontSize:11,fontWeight:600,color:C.sub},
                      totalLine:{fontSize:10,color:C.sub,marginTop:6,paddingTop:6,borderTop:"1px solid "+C.border},
                      footnote:{fontSize:8,color:C.sub,marginTop:8,lineHeight:1.5},
                      stepBtn:{width:32,height:38,borderRadius:7,background:C.raised,border:"1px solid "+C.border,color:C.text,fontSize:16,fontWeight:800,cursor:"pointer",fontFamily:"inherit",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}
                    }}
                  />
                </FSCErrorBoundary>
              );
            })}
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
                <div><label style={lbl}>Type</label><select value={combineEmpty?"RT":offer.type} onChange={function(e){if(e.target.value==="RT"){setCombineEmpty(true);}else{setCombineEmpty(false);setOffer(function(p){return {...p,type:e.target.value};});}}} style={{...inp,cursor:"pointer"}}><option value="L">Loaded</option><option value="E">Empty</option><option value="RT">🔄 Round Trip (Combine Empty)</option></select></div>
              </div>
              {combineEmpty&&(
                <div style={{padding:"10px 11px",borderRadius:9,background:C.bg,border:"1px solid "+C.border,marginBottom:12}}>
                  <div style={{fontSize:9,color:C.sub,marginBottom:8,fontWeight:700}}>EMPTY LEG (the deadhead to get this load)</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                    <div><label style={lbl}>Miles</label><input value={emptyLeg.miles} onChange={function(e){setEmptyLeg(function(p){return {...p,miles:e.target.value};});}} placeholder="Miles" style={inp}/></div>
                    <div><label style={lbl}>Rate $</label><input value={emptyLeg.rate} onChange={function(e){setEmptyLeg(function(p){return {...p,rate:e.target.value};});}} placeholder="Rate $" style={inp}/></div>
                    <div><label style={lbl}>FSC $</label><input value={emptyLeg.fsc} onChange={function(e){setEmptyLeg(function(p){return {...p,fsc:e.target.value};});}} placeholder="FSC $" style={inp}/></div>
                  </div>
                </div>
              )}
              <button onClick={function(){
                if(!hasAccess&&oUses>=FREE_OS){openUpgrade("scorer");return;}
                var combinedMiles=parseFloat(offer.miles)||0;
                var combinedRate=parseFloat(offer.rate)||0;
                var combinedFsc=parseFloat(offer.fsc)||0;
                var moveType=offer.type;
                if(combineEmpty){
                  combinedMiles=combinedMiles+(parseFloat(emptyLeg.miles)||0);
                  combinedRate=combinedRate+(parseFloat(emptyLeg.rate)||0);
                  combinedFsc=combinedFsc+(parseFloat(emptyLeg.fsc)||0);
                  moveType="RT";
                }
                setOfferRes(scoreMove({miles:combinedMiles,rate:combinedRate,fsc:combinedFsc,type:moveType}));
                if(!hasAccess)setOUses(function(p){return p+1;});
              }} style={{width:"100%",padding:"13px",borderRadius:9,background:`linear-gradient(135deg,${C.accent},${C.a3})`,color:"#000",fontWeight:800,fontSize:13,border:"none",cursor:"pointer"}}>{osLocked?"🔒 Unlock Offer Scorer":combineEmpty?"Score Round Trip":"Score This Offer"}{!hasAccess&&!osLocked?" ("+(FREE_OS-oUses)+" free left)":""}</button>
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
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,marginBottom:6}}>📁 Full History — {allMoves.length} moves · {allW.length} weeks{helpBtn("fullHistory")}<button onClick={e=>{e.stopPropagation();toggleCard("fullHist");}} style={{background:"none",border:"none",color:C.sub,fontSize:12,cursor:"pointer",padding:"0 4px",lineHeight:1,fontFamily:"inherit"}}>{isCollapsed("fullHist")?"▶":"▼"}</button></div>

            {/* CSV EXPORT — Pro Smart feature, visible to Standard with padlock */}
            <div style={{marginBottom:10}}>
              {isSmart?(
                <button onClick={function(){
                  const dieselForExport=(liveData&&liveData.diesel)||fuelPrice||4.50;
                  const mpgForExport=fuelMPG||5.2;
                  const csv=buildFSCReportCSV(allMoves,scoreMove,dieselForExport,mpgForExport,fscBaselinePrice);
                  const blob=new Blob([csv],{type:"text/csv"});
                  const url=URL.createObjectURL(blob);
                  const a=document.createElement("a");
                  a.href=url;
                  a.download="drayageiq-return-on-spend-fsc-report.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                }} style={{padding:"7px 14px",borderRadius:8,background:"linear-gradient(135deg,#4ade80,#22c55e)",border:"none",color:"#000",fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>📊 Export Return on Spend + True FSC Report (CSV)</button>
              ):(
                <button disabled style={{padding:"7px 14px",borderRadius:8,background:"#1f2937",border:"1px solid #333",color:"#6a7a8f",fontSize:10,fontWeight:700,cursor:"not-allowed",fontFamily:"inherit"}}>🔒 Export Return on Spend + True FSC Report (CSV) — Pro Smart</button>
              )}
            </div>
            {helpModal("fullHistory")}
            <div style={{display:isCollapsed("fullHist")?"none":"block",overflowX:"auto",overflowY:"auto",maxHeight:420,borderRadius:8,border:`1px solid ${C.border}`}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                <thead><tr style={{borderBottom:`2px solid ${C.border}`,background:C.raised}}>{["Wk","Vendor","Type","Route","Mi","Rate","FSC Paid","True FSC","Total","RPM","Grade"].map(h=><th key={h} style={{textAlign:"left",padding:"9px 6px",color:C.sub,fontWeight:700,fontSize:10,textTransform:"uppercase",whiteSpace:"nowrap",position:"sticky",top:0,background:C.raised,zIndex:2}}>{h}</th>)}</tr></thead>
                <tbody>{allMoves.slice().reverse().map((m,i)=>{
                  const s=scoreMove(m),vk=allW.find(w=>w.week===m.wk)?detectVendor(allW.find(w=>w.week===m.wk)):"CPG",vc=VENDORS[vk]?.color||C.accent;
                  // TRUE FSC — the fair-market FSC this move SHOULD have paid, using the
                  // same live-diesel-price formula as the FSC Calculator. Compare this
                  // against what was actually paid to spot if a vendor is lowballing FSC.
                  const liveDieselForCheck=(liveData&&liveData.diesel)||fuelPrice||4.50;
                  const mpgForCheck=fuelMPG||5.2;
                  let trueFscPct=0,trueFscDollar=0,fscDiff=0;
                  if(m.miles>0&&m.rate>0){
                    const rpmCheck=m.rate/m.miles;
                    const extraCostCheck=Math.max(0,(liveDieselForCheck-fscBaselinePrice)/mpgForCheck);
                    trueFscPct=(extraCostCheck/rpmCheck)*100;
                    trueFscDollar=extraCostCheck*m.miles;
                    fscDiff=m.fsc-trueFscDollar;
                  }
                  const fscIsFair=Math.abs(fscDiff)<=5;// within $5 of fair-market, call it fair
                  const fscColor=fscIsFair?C.green:fscDiff<0?C.red:C.gold;
                  return(<tr key={i} style={{borderBottom:`1px solid ${C.border}`,background:m.isRoundTrip?`${C.a3}10`:i%2?`${C.border}30`:"transparent"}}>
                    <td style={{padding:"8px 6px",color:C.sub,fontWeight:600}}>W{m.wk}</td>
                    <td style={{padding:"8px 6px"}}><span style={{padding:"2px 7px",borderRadius:5,fontSize:9,fontWeight:700,background:`${vc}22`,color:vc}}>{vk}</span></td>
                    <td style={{padding:"8px 6px"}}>{m.isRoundTrip?<span style={{padding:"2px 7px",borderRadius:5,fontSize:10,fontWeight:700,background:`${C.a3}30`,color:C.a3}}>🔄 RT</span>:<span style={{padding:"2px 7px",borderRadius:5,fontSize:10,fontWeight:700,background:m.type==="L"?`${C.green}25`:`${C.gold}25`,color:m.type==="L"?C.green:C.gold}}>{m.type}</span>}</td>
                    <td style={{padding:"8px 6px",color:C.text,whiteSpace:"nowrap"}}>{m.from}↔{m.to}{m.extraPay>0&&<span style={{marginLeft:4,padding:"1px 4px",borderRadius:4,fontSize:9,fontWeight:700,background:`${C.gold}22`,color:C.gold}}>+${m.extraPay}</span>}</td>
                    <td style={{padding:"8px 6px",color:C.text}}>{m.miles}</td>
                    <td style={{padding:"8px 6px",color:C.text}}>${m.rate.toFixed(2)}</td>
                    <td style={{padding:"8px 6px",color:m.fsc>0?C.accent:C.sub}}>{m.fsc>0?`$${m.fsc.toFixed(2)}`:"—"}</td>
                    <td style={{padding:"8px 6px",color:fscColor,fontWeight:700}}>{m.miles>0&&m.rate>0?`$${trueFscDollar.toFixed(2)} (${trueFscPct.toFixed(1)}%)`:"—"}</td>
                    <td style={{padding:"8px 6px",color:C.text,fontWeight:600}}>${(m.rate+m.fsc).toFixed(2)}</td>
                    <td style={{padding:"8px 6px",color:+s.rpm>=2.5?C.green:+s.rpm>=2.0?C.gold:C.red,fontWeight:700}}>${s.rpm}</td>
                    <td style={{padding:"8px 6px"}}><Tag color={gc(s.grade)}>{s.grade}</Tag></td>
                  </tr>);
                })}</tbody>
              </table>
            </div>
          </div>

          {/* ── SAVED WEEKS MANAGER — L99 Elite ── */}
          <div style={{marginTop:16,background:"linear-gradient(135deg,"+C.card+","+C.surf+")",border:"1px solid "+C.border,borderRadius:16,overflow:"hidden"}}>

            {/* Header */}
            <div style={{padding:"13px 16px",background:"linear-gradient(135deg,"+C.a3+"14,"+C.accent+"08)",borderBottom:"1px solid "+C.border}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                <div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:800,color:C.text,marginBottom:2}}>📋 Manage Saved Weeks<button onClick={e=>{e.stopPropagation();toggleCard("savedWeeks");}} style={{background:"none",border:"none",color:C.sub,fontSize:12,cursor:"pointer",padding:"0 4px",lineHeight:1,fontFamily:"inherit"}}>{isCollapsed("savedWeeks")?"▶":"▼"}</button></div>
                  <div style={{fontSize:10,color:C.sub}}>{demoMode?"Demo Mode — sample weeks only":allW.length+" total · tap ☑ to select then delete"}</div>
                </div>
                <div style={{display:"flex",gap:7,flexShrink:0}}>
                  {!demoMode&&allW.length>0&&(
                    <button onClick={function(){
                      if(selWkKeys.size===allW.length){setSelWkKeys(new Set());}
                      else{setSelWkKeys(new Set(allW.map(function(w){return w.week+(w.from||"");})));}
                    }} style={{padding:"5px 9px",borderRadius:8,background:C.raised,border:"1px solid "+C.border,color:C.sub,fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
                      {selWkKeys.size===allW.length?"Deselect":"Select All"}
                    </button>
                  )}
                  {!demoMode&&selWkKeys.size>0&&(
                    <button onClick={function(){
                      if(window.confirm("Delete "+selWkKeys.size+" selected week"+(selWkKeys.size>1?"s":"")+"?")){
                        setAddedW(function(p){return p.filter(function(w){return !selWkKeys.has(w.week+(w.from||""));});});
                        setSelWkKeys(new Set());
                      }
                    }} style={{padding:"5px 12px",borderRadius:8,background:"#f8717122",border:"2px solid #f87171",color:"#f87171",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 0 8px #f8717133"}}>
                      🗑 Delete ({selWkKeys.size})
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Week list */}
            <div style={{padding:"10px 12px",display:isCollapsed("savedWeeks")?"none":"flex",flexDirection:"column",gap:7,maxHeight:320,overflowY:"auto"}}>
              {demoMode&&<div style={{textAlign:"center",padding:"10px",marginBottom:4,background:C.a3+"12",border:"1px solid "+C.a3+"33",borderRadius:8,fontSize:10,color:C.a3,fontWeight:700}}>👀 Showing sample demo weeks only — your real data is hidden while Demo Mode is on</div>}
              {allW.length===0?(
                <div style={{textAlign:"center",padding:"20px",color:C.sub,fontSize:11}}>
                  <div style={{fontSize:28,marginBottom:8}}>📭</div>
                  No uploaded weeks yet — scan a PDF above to add your first settlement
                </div>
              ):(
                [...allW].reverse().map(function(w,i){
                  const g=wg(w);
                  const wKey=w.week+(w.from||"");
                  const isSelected=selWkKeys.has(wKey);
                  return(
                    <div key={w.week+i} style={{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",background:isSelected?"#f8717108":C.bg,borderRadius:10,border:"1px solid "+(isSelected?"#f87171":"#a78bfa55"),transition:"all 0.15s",boxShadow:isSelected?"0 0 10px #f8717118":"none"}}>

                      {/* Checkbox */}
                      <button onClick={function(){
                        setSelWkKeys(function(prev){
                          const next=new Set(prev);
                          if(next.has(wKey))next.delete(wKey);
                          else next.add(wKey);
                          return next;
                        });
                      }} style={{width:22,height:22,borderRadius:6,border:"2px solid "+(isSelected?"#f87171":C.border),background:isSelected?"#f87171":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,transition:"all 0.15s"}}>
                        {isSelected&&<span style={{color:"#000",fontSize:11,fontWeight:900}}>✓</span>}
                      </button>

                      {/* Dot */}
                      <div style={{width:8,height:8,borderRadius:"50%",background:"#a78bfa",boxShadow:"0 0 5px #a78bfa",flexShrink:0}}/>

                      {/* Info */}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:700,color:isSelected?"#f87171":C.text,display:"flex",alignItems:"center",gap:6}}>
                          {w.label}
                          <span style={{padding:"1px 6px",borderRadius:5,fontSize:9,fontWeight:700,background:"#a78bfa22",color:"#a78bfa"}}>Uploaded</span>
                        </div>
                        <div style={{fontSize:10,color:C.sub,marginTop:2}}>{w.from}{w.to?" – "+w.to:""} · {w.moves?.length||0} moves</div>
                      </div>

                      {/* Net + grade */}
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,color:C.green}}>${Number(w.net).toLocaleString("en-US",{minimumFractionDigits:2})}</div>
                        <span style={{padding:"2px 7px",borderRadius:5,fontSize:9,fontWeight:700,background:g.c+"22",color:g.c}}>{g.i} {g.l}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer hint */}
            {!demoMode&&allW.length>0&&(
              <div style={{padding:"9px 16px",borderTop:"1px solid "+C.border,fontSize:10,color:C.sub,textAlign:"center"}}>
                ☑ Check weeks → <span style={{color:"#f87171",fontWeight:700}}>Delete (N)</span> removes selected &nbsp;·&nbsp; Rescan PDF to refresh data
              </div>
            )}
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
              <div style={{fontSize:10,fontWeight:700,color:C.sub,marginBottom:11,textTransform:"uppercase",letterSpacing:"0.1em"}}>⚡ Quick Questions<button onClick={e=>{e.stopPropagation();toggleCard("quickQ");}} style={{background:"none",border:"none",color:C.sub,fontSize:12,cursor:"pointer",padding:"0 4px",lineHeight:1,fontFamily:"inherit"}}>{isCollapsed("quickQ")?"▶":"▼"}</button></div>
              <div style={{display:isCollapsed("quickQ")?"none":"grid",gridTemplateColumns:wide?"repeat(2,1fr)":"1fr",gap:7}}>
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
  <div style={{display:"flex",flexDirection:"column",gap:16,paddingBottom:24}}>

    {/* ── GROWTH INTELLIGENCE HEADER ── */}
    {(()=>{
      const weeklyAvgGross=allW.length>0?tGross/allW.length:0;
      const weeklyAvgNet=allW.length>0?tNet/allW.length:0;
      const monthlyNet=weeklyAvgNet*4.33;
      const annualNet=monthlyNet*12;
      const totalFuel=allW.reduce(function(s,w){return s+(w.deds||[]).filter(function(d){return d.l.toLowerCase().includes("fuel");}).reduce(function(ss,d){return ss+d.a;},0);},0);
      const totalRebates=allW.reduce(function(s,w){return s+(w.rebate||0);},0);
      const netFuelTotal=Math.max(0,totalFuel-totalRebates);// true fuel cost after rebates offset it
      const fuelPct=tGross>0?netFuelTotal/tGross*100:0;// uses NET fuel cost for accurate margin picture
      const allEmptyMoves=allMoves.filter(function(m){return m.type==="E"||m.t==="E";});
      const unpaidEmptyMoves=allEmptyMoves.filter(function(m){return (m.rate||m.rt||0)<=0;});
      const paidEmptyMoves=allEmptyMoves.filter(function(m){return (m.rate||m.rt||0)>0;});
      const emptyMoves=unpaidEmptyMoves.length;// only count UNPAID empties as the real issue
      const emptyPct=allMoves.length>0?Math.round(emptyMoves/allMoves.length*100):0;
      const badLoads=allMoves.filter(function(m){const s=scoreMove(m);return s.grade==="D";}).length;
      const lowWks=allW.filter(function(w){return w.net<2500;}).length;
      const last4=allW.slice(-4);
      const prev4=allW.slice(-8,-4);
      const l4avg=last4.length>0?last4.reduce(function(s,w){return s+w.net;},0)/last4.length:0;
      const p4avg=prev4.length>0?prev4.reduce(function(s,w){return s+w.net;},0)/prev4.length:1;
      const trendPct=p4avg>0?((l4avg-p4avg)/p4avg*100):0;
      const trendUp=trendPct>0;

      const hScore=Math.min(100,Math.round(
        (+margin>=20?25:+margin>=15?18:+margin>=10?10:5)+
        (ldPct>=60?20:ldPct>=50?14:ldPct>=40?8:3)+
        (+avgRPM>=2.5?20:+avgRPM>=2.0?13:+avgRPM>=1.5?7:2)+
        (allW.length>=8?15:allW.length>=4?10:5)+
        (!trendUp||allW.length<4?0:20)
      ));
      const hG=hScore>=80?{g:"A",c:"#4ade80",l:"Excellent"}:hScore>=65?{g:"B",c:"#00ffcc",l:"Strong"}:hScore>=50?{g:"C",c:"#fbbf24",l:"Average"}:hScore>=35?{g:"D",c:"#f97316",l:"Needs Work"}:{g:"F",c:"#f87171",l:"Critical"};

      const pains=[];
      if(fuelPct>38)pains.push({icon:"⛽",title:"Fuel Costs Critical",detail:`$${netFuelTotal.toFixed(0)} net of $${totalRebates.toFixed(0)} rebates — ${fuelPct.toFixed(1)}% of gross. Industry target is under 35%.`,severity:"critical",loss:netFuelTotal*(fuelPct-35)/fuelPct,color:"#f87171"});
      if(emptyPct>42)pains.push({icon:"🚗",title:"Too Many Empty Miles",detail:`${emptyPct}% of your runs are empty. Every empty mile costs you money with zero revenue.`,severity:emptyPct>55?"critical":"moderate",loss:0,color:"#fb923c"});
      if(badLoads>0)pains.push({icon:"📉",title:`${badLoads} D-Grade Loads Accepted`,detail:`${badLoads} load${badLoads>1?"s":""} scored D-grade this period. These low-RPM loads drag down your average.`,severity:"moderate",loss:0,color:"#fbbf24"});
      if(+margin<18)pains.push({icon:"💸",title:"Net Margin Below Target",detail:`Your ${margin}% margin is below the 20% target. You're leaving $${Math.round(tGross*0.02).toLocaleString()} on the table each week.`,severity:+margin<12?"critical":"moderate",loss:tGross*0.02,color:"#f87171"});
      if(lowWks>2)pains.push({icon:"📅",title:`${lowWks} Weeks Under $2,500 Net`,detail:`${lowWks} weeks netted less than $2,500. These are high-risk periods for your cash flow.`,severity:"moderate",loss:0,color:"#fb923c"});

      const strengths=[];
      if(+margin>=20)strengths.push({icon:"💰",title:"Healthy Net Margin",detail:`${margin}% margin puts you in the top tier of owner-operators. You keep more of what you earn.`,color:"#4ade80"});
      const bestVRaw=vendorStats.reduce(function(b,v){return v.margin>b.margin?v:b},{margin:0});
      // In demo mode, label clearly as demo data. In real mode, use the actual carrier name.
      const bestV=demoMode?{...bestVRaw,name:"Demo Driver Co"}:bestVRaw;
      if(bestV.margin>0)strengths.push({icon:"🏆",title:`${bestV.name} at ${bestV.margin}% Margin`,detail:`Your strongest vendor relationship is generating exceptional margins. Prioritize these loads.`,color:"#00ffcc"});
      if(ldPct>=60)strengths.push({icon:"📦",title:`${ldPct}% Loaded Miles`,detail:"Above 60% loaded rate means you're maximizing paid miles. Strong lane discipline.",color:"#a78bfa"});
      if(+avgRPM>=2.5)strengths.push({icon:"📈",title:`$${avgRPM} Average RPM`,detail:"Above $2.50 RPM is excellent for drayage. You're selecting high-value freight consistently.",color:"#fbbf24"});
      if(trendUp&&allW.length>=4)strengths.push({icon:"🚀",title:`Net Pay Up ${trendPct.toFixed(1)}% (Last 4 Weeks)`,detail:"Your recent trend is positive. You're making better decisions than 4 weeks ago.",color:"#4ade80"});
      if(allW.length>=8)strengths.push({icon:"📊",title:`${allW.length} Weeks of Verified Data`,detail:"Lenders and partners trust businesses with consistent financial records. You have a proven track record.",color:"#00ffcc"});
      if(paidEmptyMoves.length>0){
        const paidEmptyTotal=paidEmptyMoves.reduce(function(s,m){return s+(m.rate||m.rt||0);},0);
        if(paidEmptyTotal>0)strengths.push({icon:"🤝",title:`Getting Paid for Repositioning`,detail:`You negotiated pay on ${paidEmptyMoves.length} empty leg${paidEmptyMoves.length!==1?"s":""} totaling $${Math.round(paidEmptyTotal).toLocaleString()} — that's smart negotiation most drivers miss.`,color:"#4ade80"});
      }

      return(
        <div>
          {/* HERO HEADER */}
          <div style={{background:"linear-gradient(135deg,#0a0e1a,#0f1830,#0a1520)",borderRadius:16,padding:"20px 18px",marginBottom:14,border:"1px solid #1e2a3a",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-30,right:-30,width:140,height:140,borderRadius:"50%",background:`radial-gradient(circle,${hG.c}20,transparent 70%)`}}/>
            <div style={{position:"absolute",bottom:-20,left:-20,width:100,height:100,borderRadius:"50%",background:"radial-gradient(circle,#a78bfa15,transparent 70%)"}}/> 
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,position:"relative",zIndex:1}}>
              <div style={{flex:1}}>
                <div style={{fontSize:10,fontWeight:700,color:C.sub,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:6}}>🚀 Business Intelligence</div>
                <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,fontWeight:900,color:"#f0f6ff",margin:"0 0 6px",letterSpacing:"-0.02em"}}>
                  {demoMode?"Demo Business":"Your Business, Decoded"}
                </h1>
                <p style={{fontSize:11,color:C.sub,margin:0,lineHeight:1.6}}>
                  {allW.length} weeks · {allMoves.length} moves · ${(tGross/1000).toFixed(1)}k gross YTD
                </p>
                <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
                  <div style={{padding:"5px 12px",borderRadius:20,background:`${hG.c}18`,border:`1px solid ${hG.c}44`,fontSize:11,fontWeight:700,color:hG.c}}>{hG.l} Business</div>
                  <div style={{padding:"5px 12px",borderRadius:20,background:trendUp?"#4ade8018":"#f8717118",border:`1px solid ${trendUp?"#4ade8044":"#f8717144"}`,fontSize:11,fontWeight:700,color:trendUp?"#4ade80":"#f87171"}}>{trendUp?"📈 Trending Up":"📉 Watch Trend"}</div>
                </div>
              </div>
              {/* HEALTH SCORE RING */}
              <div style={{textAlign:"center",flexShrink:0}}>
                <div style={{width:80,height:80,borderRadius:"50%",background:`conic-gradient(${hG.c} ${hScore*3.6}deg,#1e2a3a ${hScore*3.6}deg)`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",boxShadow:`0 0 20px ${hG.c}44`}}>
                  <div style={{width:62,height:62,borderRadius:"50%",background:"#0a0e1a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                    <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,fontWeight:900,color:hG.c,lineHeight:1}}>{hG.g}</div>
                    <div style={{fontSize:8,color:C.sub,marginTop:1}}>{hScore}/100</div>
                  </div>
                </div>
                <div style={{fontSize:9,color:C.sub,marginTop:5,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>Health Score</div>
              </div>
            </div>

            {/* KPI ROW */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:14,position:"relative",zIndex:1}}>
              {(()=>{
                const totalRebatesAll=allW.reduce((s,w)=>s+(w.rebate||0),0);
                const netCostAll=Math.max(0.01,tDed-totalRebatesAll);
                const monthlyRatio=tGross/netCostAll;// same ratio scales regardless of period since it's proportional
                const ratioColor=monthlyRatio>=3?"#4ade80":monthlyRatio>=1.5?"#fbbf24":"#f87171";
                const rosLocked=!isSmart&&!featureTrialActive.returnOnSpend;
                return[
                {l:"Weekly Net",v:`$${(weeklyAvgNet).toLocaleString("en-US",{maximumFractionDigits:0})}`,c:"#4ade80",locked:false},
                {l:"Monthly Est.",v:`$${(monthlyNet).toLocaleString("en-US",{maximumFractionDigits:0})}`,c:"#00ffcc",locked:false},
                {l:"Annual Est.",v:`$${(annualNet/1000).toFixed(0)}k`,c:"#a78bfa",locked:false},
                {l:"Return/Spend",v:(isSmart||featureTrialActive.returnOnSpend)?`1:${monthlyRatio.toFixed(2)}`:(canUseFeatureFree("returnOnSpend")?"🎁 Try":"🔒 Pro"),c:(isSmart||featureTrialActive.returnOnSpend)?ratioColor:(canUseFeatureFree("returnOnSpend")?"#4ade80":C.sub),locked:rosLocked},
                ];
              })().map(function(k){return(
                <div key={k.l} onClick={k.locked?function(){if(canUseFeatureFree("returnOnSpend")){useFeatureToken("returnOnSpend");setFeatureTrialActive(function(p){return {...p,returnOnSpend:true};});}else{openUpgrade("ros");}}:undefined} style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"9px 8px",border:"1px solid rgba(255,255,255,0.07)",textAlign:"center",cursor:k.locked?"pointer":"default"}}>
                  <div style={{fontSize:8,color:C.sub,textTransform:"uppercase",marginBottom:3}}>{k.l}</div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:800,color:k.c}}>{k.v}</div>
                </div>
              );})}
            </div>
          </div>

          {/* WHAT'S HURTING YOUR BUSINESS */}
          {pains.length>0&&(
            <div style={{borderRadius:14,overflow:"hidden",border:"1px solid #f8717133",marginBottom:14}}>
              <div style={{padding:"12px 16px",background:"linear-gradient(135deg,#f8717115,#fb923c08)",borderBottom:"1px solid #f8717122"}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <div style={{width:32,height:32,borderRadius:8,background:"#f8717122",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>⚠️</div>
                  <div>
                    <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:800,color:"#f87171"}}>What's Weakening Your Business</div>
                    <div style={{fontSize:10,color:C.sub,marginTop:1}}>{pains.length} issue{pains.length>1?"s":""} identified from your data</div>
                  </div>
                </div>
              </div>
              <div style={{padding:"12px",display:"flex",flexDirection:"column",gap:10}}>
                {pains.map(function(p,i){return(
                  <div key={i} style={{display:"flex",gap:12,padding:"12px 13px",background:`${p.color}08`,borderRadius:10,border:`1px solid ${p.color}33`}}>
                    <div style={{width:36,height:36,borderRadius:9,background:`${p.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{p.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                        <div style={{fontSize:12,fontWeight:700,color:C.text}}>{p.title}</div>
                        <span style={{padding:"2px 8px",borderRadius:10,fontSize:9,fontWeight:700,background:`${p.color}20`,color:p.color,textTransform:"uppercase",flexShrink:0,marginLeft:8}}>{p.severity}</span>
                      </div>
                      <div style={{fontSize:11,color:C.sub,lineHeight:1.65}}>{p.detail}</div>
                      {p.loss>0&&<div style={{marginTop:6,fontSize:11,color:"#f87171",fontWeight:700}}>Estimated impact: -${Math.round(p.loss).toLocaleString()}</div>}
                    </div>
                  </div>
                );})}
              </div>
            </div>
          )}

          {/* DATA HEALTH — scan all weeks for extraction mismatches */}
          {(()=>{
            const mismatchWeeks=allW.filter(w=>{
              const dedSum=(w.deds||[]).reduce((s,d)=>s+(d.a||0),0);
              const docTotal=w.totalDeductions||0;
              return docTotal>0&&Math.abs(dedSum-docTotal)>1.50;
            });
            if(mismatchWeeks.length===0)return(
              <div style={{borderRadius:14,padding:"12px 16px",background:`${C.green}0d`,border:`1px solid ${C.green}33`,marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:20}}>✅</span>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:C.green}}>Data Health: All Clear</div>
                  <div style={{fontSize:10,color:C.sub,marginTop:1}}>All {allW.length} weeks match their settlement totals — your numbers are trustworthy.</div>
                </div>
              </div>
            );
            return(
              <div style={{borderRadius:14,overflow:"hidden",border:`1px solid ${C.red}44`,marginBottom:14}}>
                <div style={{padding:"12px 16px",background:`${C.red}12`,borderBottom:`1px solid ${C.red}33`,display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:20}}>⚠️</span>
                  <div>
                    <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:800,color:C.red}}>Data Health: {mismatchWeeks.length} Week{mismatchWeeks.length!==1?"s":""} Need Attention</div>
                    <div style={{fontSize:10,color:C.sub,marginTop:1}}>These weeks have extraction totals that don't match the settlement document</div>
                  </div>
                </div>
                <div style={{padding:"12px 16px"}}>
                  {mismatchWeeks.map(w=>{
                    const dedSum=(w.deds||[]).reduce((s,d)=>s+(d.a||0),0);
                    const gap=Math.abs(dedSum-(w.totalDeductions||0));
                    return(
                      <div key={w.week} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
                        <div>
                          <div style={{fontSize:11,fontWeight:700,color:C.text}}>Week {w.week}</div>
                          <div style={{fontSize:9,color:C.sub}}>Document: ${(w.totalDeductions||0).toFixed(2)} · Extracted: ${dedSum.toFixed(2)}</div>
                        </div>
                        <div style={{fontSize:11,fontWeight:700,color:C.red}}>${gap.toFixed(2)} gap</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* WHAT'S HELPING YOUR BUSINESS */}
          {strengths.length>0&&(
            <div style={{borderRadius:14,overflow:"hidden",border:"1px solid #4ade8033",marginBottom:14}}>
              <div style={{padding:"12px 16px",background:"linear-gradient(135deg,#4ade8015,#00ffcc08)",borderBottom:"1px solid #4ade8022"}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <div style={{width:32,height:32,borderRadius:8,background:"#4ade8022",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>💪</div>
                  <div>
                    <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:800,color:"#4ade80"}}>What's Building Your Business</div>
                    <div style={{fontSize:10,color:C.sub,marginTop:1}}>{strengths.length} strength{strengths.length>1?"s":""} working in your favor</div>
                  </div>
                </div>
              </div>
              <div style={{padding:"12px",display:"grid",gridTemplateColumns:wide?"1fr 1fr":"1fr",gap:9}}>
                {strengths.map(function(s,i){return(
                  <div key={i} style={{display:"flex",gap:10,padding:"11px 12px",background:`${s.color}08`,borderRadius:10,border:`1px solid ${s.color}33`}}>
                    <div style={{width:32,height:32,borderRadius:8,background:`${s.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{s.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,fontWeight:700,color:s.color,marginBottom:3}}>{s.title}</div>
                      <div style={{fontSize:10,color:C.sub,lineHeight:1.6}}>{s.detail}</div>
                    </div>
                  </div>
                );})}
              </div>
            </div>
          )}

          {/* HOW TO PROSPER — ACTION PLAN */}
          <div style={{borderRadius:14,overflow:"hidden",border:"1px solid #a78bfa44",marginBottom:14}}>
            <div style={{padding:"12px 16px",background:"linear-gradient(135deg,#a78bfa15,#00ffcc08)",borderBottom:"1px solid #a78bfa22"}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <div style={{width:32,height:32,borderRadius:8,background:"#a78bfa22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🎯</div>
                <div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:800,color:"#a78bfa"}}>How to Prosper — Your 90-Day Plan</div>
                  <div style={{fontSize:10,color:C.sub,marginTop:1}}>Based on your actual numbers</div>
                </div>
              </div>
            </div>
            <div style={{padding:"12px",display:"flex",flexDirection:"column",gap:10}}>
              {(function(){
                const steps=[];
                if(fuelPct>35)steps.push({n:1,icon:"⛽",title:"Fuel Strategy",action:`Cut fuel advances by 15% → save ~$${Math.round(netFuelTotal*0.15).toLocaleString()}/yr. Use Pilot Flying J Fuel Card for discounts. Pre-plan fuel stops to avoid full-price fills.`,impact:"HIGH"});
                if(emptyPct>25)steps.push({n:2,icon:"📦",title:"Unpaid Empty Miles",action:`${emptyPct}% of your moves are UNPAID empty repositioning (${emptyMoves} moves where you drove for free). Work your dispatcher for backhauls or paid repositioning on these routes. Paid empty legs that are part of a round trip do not count here — this only flags truly unpaid miles.`,impact:"HIGH"});
                steps.push({n:steps.length+1,icon:"📊",title:"Weekly Data Habit",action:`You have ${allW.length} weeks tracked. Drivers who track 52+ weeks earn 23% more annually because they spot trends and negotiate from a position of data — not guesswork.`,impact:"MEDIUM"});
                if(+margin<20)steps.push({n:steps.length+1,icon:"💰",title:`Close the ${(20-+margin).toFixed(1)}% Margin Gap`,action:`At $${(weeklyAvgGross).toFixed(0)} average weekly gross, every 1% margin improvement = $${(weeklyAvgGross*0.01*52).toFixed(0)}/year extra. Reject D-grade loads and negotiate FSC on every load.`,impact:"HIGH"});
                steps.push({n:steps.length+1,icon:"🏦",title:"Access Business Capital",action:`Your ${allW.length} weeks of verified income qualifies you for funding. See the institutions below — your $${(monthlyNet).toFixed(0)}/mo net income is real collateral.`,impact:"GAME CHANGER"});
                return steps.slice(0,4).map(function(s,i){return(
                  <div key={i} style={{display:"flex",gap:12,padding:"12px 13px",background:"#a78bfa08",borderRadius:10,border:"1px solid #a78bfa33"}}>
                    <div style={{width:28,height:28,borderRadius:8,background:"#a78bfa22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,color:"#a78bfa"}}>{s.n}</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                        <div style={{fontSize:12,fontWeight:700,color:C.text}}>{s.icon} {s.title}</div>
                        <span style={{padding:"2px 7px",borderRadius:8,fontSize:9,fontWeight:800,background:s.impact==="GAME CHANGER"?"#fbbf2422":s.impact==="HIGH"?"#f8717122":"#4ade8022",color:s.impact==="GAME CHANGER"?"#fbbf24":s.impact==="HIGH"?"#f87171":"#4ade80",flexShrink:0,marginLeft:6}}>{s.impact}</span>
                      </div>
                      <div style={{fontSize:11,color:C.sub,lineHeight:1.65}}>{s.action}</div>
                    </div>
                  </div>
                );});
              })()}
            </div>
          </div>

          {/* GET FUNDED — Pro Smart only; teaser shown to Standard to make the upgrade worth it */}
          {isSmart?(
          <div style={{borderRadius:14,overflow:"hidden",border:"1px solid #fbbf2444",marginBottom:14}}>
            <div style={{padding:"14px 16px",background:"linear-gradient(135deg,#fbbf2415,#f59e0b08)",borderBottom:"1px solid #fbbf2422"}}>
              <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:8}}>
                <div style={{width:36,height:36,borderRadius:9,background:"#fbbf2422",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🏦</div>
                <div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:800,color:"#fbbf24"}}>Get Funded — Institutions That Trust Your Data<button onClick={e=>{e.stopPropagation();toggleCard("funded");}} style={{background:"none",border:"none",color:C.sub,fontSize:12,cursor:"pointer",padding:"0 4px",lineHeight:1,fontFamily:"inherit"}}>{isCollapsed("funded")?"▶":"▼"}</button></div>
                  <div style={{fontSize:10,color:C.sub,marginTop:2}}>Your verified income qualifies you for real business capital</div>
                </div>
              </div>
              <div style={{display:isCollapsed("funded")?"none":"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                {[
                  {l:"Monthly Income",v:`$${Math.round(monthlyNet).toLocaleString()}`,c:"#4ade80"},
                  {l:"Annual Estimate",v:`$${Math.round(annualNet).toLocaleString()}`,c:"#00ffcc"},
                  {l:"Weeks Verified",v:`${allW.length} wks`,c:"#a78bfa"},
                ].map(function(k){return(
                  <div key={k.l} style={{background:"rgba(255,255,255,0.04)",borderRadius:9,padding:"9px 8px",textAlign:"center"}}>
                    <div style={{fontSize:8,color:C.sub,textTransform:"uppercase",marginBottom:3}}>{k.l}</div>
                    <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:800,color:k.c}}>{k.v}</div>
                  </div>
                );})}
              </div>
            </div>
            <div style={{padding:"12px",display:isCollapsed("funded")?"none":"flex",flexDirection:"column",gap:10}}>
              {[
                {
                  icon:"🦅",name:"OOIDA Business Services",type:"Owner-Operator Focused",
                  range:"$1,000 – $250,000",rate:"Competitive rates for 1099 drivers",
                  why:`OOIDA specializes in owner-operators with 1099 income. Your ${allW.length} weeks of documented gross income is exactly what they need.`,
                  qualify:allW.length>=4,
                  url:"https://www.ooida.com",tag:"Best for O/O",tagColor:"#00ffcc",
                },
                {
                  icon:"🏛️",name:"SBA 7(a) Loan Program",type:"U.S. Small Business Administration",
                  range:"Up to $5,000,000",rate:"Prime + 2.75% — lowest rates available",
                  why:`As a registered business with documented income of $${Math.round(annualNet).toLocaleString()}/yr, you qualify to apply. SBA loans have the lowest interest rates in the market.`,
                  qualify:allW.length>=8,
                  url:"https://www.sba.gov/funding-programs/loans",tag:"Lowest Rates",tagColor:"#fbbf24",
                },
                {
                  icon:"⚡",name:"SBA Microloan",type:"U.S. Small Business Administration",
                  range:"Up to $50,000",rate:"8% – 13% — no collateral required",
                  why:"Designed for small businesses that need capital fast. Less paperwork than 7(a). Perfect for equipment, working capital, or expansion.",
                  qualify:true,
                  url:"https://www.sba.gov/funding-programs/loans/microloans",tag:"Fast Approval",tagColor:"#a78bfa",
                },
                {
                  icon:"🚛",name:"Triumph Business Capital",type:"Freight Factoring",
                  range:"Same-day payment on invoices",rate:"1.5% – 5% factoring rate",
                  why:"Instead of waiting 30–90 days for broker payment, get paid same day. Converts your outstanding loads into immediate cash flow.",
                  qualify:true,
                  url:"https://www.triumphbusiness.com",tag:"Same Day Cash",tagColor:"#4ade80",
                },
                {
                  icon:"🏘️",name:"Community CDFI Lenders",type:"Community Development Finance",
                  range:"$5,000 – $250,000",rate:"Flexible terms for underserved communities",
                  why:"CDFIs are mission-driven lenders that prioritize small business owners. Your documented income history makes you a strong candidate.",
                  qualify:true,
                  url:"https://www.cdfifund.gov/programs-training/programs/cdfi-program",tag:"Community First",tagColor:"#fb923c",
                },
                {
                  icon:"🔧",name:"Equipment Financing",type:"Truck & Trailer Loans",
                  range:"Up to 100% vehicle value",rate:"5% – 15% — vehicle as collateral",
                  why:`Your $${Math.round(monthlyNet).toLocaleString()}/mo documented net income supports an equipment loan payment. Time to own your truck outright.`,
                  qualify:monthlyNet>2000,
                  url:"https://www.atbs.com",tag:"Own Your Truck",tagColor:"#fbbf24",
                },
              ].map(function(f,i){return(
                <div key={i} style={{borderRadius:12,border:`1px solid ${f.qualify?"#fbbf2433":"#2c3a52"}`,overflow:"hidden",opacity:f.qualify?1:0.6}}>
                  <div style={{padding:"11px 13px",background:f.qualify?"linear-gradient(135deg,#fbbf2410,#f59e0b06)":"#141928",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:9}}>
                      <span style={{fontSize:22}}>{f.icon}</span>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:C.text}}>{f.name}</div>
                        <div style={{fontSize:9,color:C.sub,marginTop:1}}>{f.type}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                      <span style={{padding:"2px 8px",borderRadius:8,fontSize:9,fontWeight:700,background:`${f.tagColor}22`,color:f.tagColor,flexShrink:0}}>{f.tag}</span>
                      {f.qualify&&<span style={{fontSize:9,color:"#4ade80",fontWeight:700}}>✅ You Qualify</span>}
                    </div>
                  </div>
                  <div style={{padding:"10px 13px",background:C.bg}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                      <div><div style={{fontSize:9,color:C.sub,textTransform:"uppercase"}}>Range</div><div style={{fontSize:11,fontWeight:700,color:C.text,marginTop:2}}>{f.range}</div></div>
                      <div style={{textAlign:"right"}}><div style={{fontSize:9,color:C.sub,textTransform:"uppercase"}}>Terms</div><div style={{fontSize:11,fontWeight:700,color:"#fbbf24",marginTop:2}}>{f.rate}</div></div>
                    </div>
                    <div style={{fontSize:11,color:C.sub,lineHeight:1.65,marginBottom:9}}>{f.why}</div>
                    <a href={f.url} target="_blank" rel="noopener noreferrer"
                      style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"9px",borderRadius:9,background:f.qualify?`linear-gradient(135deg,#fbbf24,#f59e0b)`:"#1e2a3a",color:f.qualify?"#000":C.sub,fontSize:11,fontWeight:800,textDecoration:"none",border:f.qualify?"none":"1px solid #2c3a52"}}>
                      {f.qualify?"🔗 Learn More & Apply":"🔒 Grow your data first"}
                    </a>
                  </div>
                </div>
              );})}
            </div>
          </div>
          ):(
          <div style={{borderRadius:14,border:"1px solid #fbbf2444",marginBottom:14,padding:"18px 16px",background:"linear-gradient(135deg,#fbbf2410,#f59e0b06)",textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:8}}>🏦</div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:800,color:"#fbbf24",marginBottom:6}}>🔒 Get Funded — Institutions That Trust Your Data</div>
            <div style={{fontSize:11,color:C.sub,lineHeight:1.7,maxWidth:400,margin:"0 auto 14px"}}>Your uploaded settlements become verified proof of income — the exact thing lenders ask for. Pro Smart matches your real YTD earnings against SBA loans, equipment financing, factoring, and lines of credit you likely qualify for.</div>
            <button onClick={function(){openUpgrade("funded");}} style={{padding:"10px 22px",borderRadius:9,background:"linear-gradient(135deg,#fbbf24,#f59e0b)",border:"none",color:"#000",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Unlock with Pro Smart →</button>
          </div>
          )}

          {/* QUICK ADD SETTLEMENT */}
          <div style={{...K(),border:`1px solid ${C.accent}33`}}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:700,marginBottom:10,display:"flex",alignItems:"center",gap:7}}>
              <span>📄</span><span>Quick Add Settlement Week</span>
              <span style={{fontSize:9,color:C.sub,fontWeight:400,marginLeft:"auto"}}>Full scanner in Docs tab</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              {[["week","Week #","19"],["gross","Gross $","5179.29"],["net","Net Pay $","3026.83"],["deds","Deductions $","2537.59"]].map(function(f){return(
                <div key={f[0]}><div style={{fontSize:9,color:C.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{f[1]}</div><input value={manForm[f[0]]||""} onChange={e=>setManForm(p=>({...p,[f[0]]:e.target.value}))} placeholder={f[2]} style={inp}/></div>
              );})}
            </div>
            <button onClick={addWeek} disabled={!manForm.week||!manForm.gross||!manForm.net} style={{width:"100%",padding:"11px",borderRadius:9,background:(!manForm.week||!manForm.gross||!manForm.net)?C.raised:`linear-gradient(135deg,${C.accent},${C.a3})`,color:"#000",fontWeight:800,fontSize:12,border:"none",cursor:(!manForm.week||!manForm.gross||!manForm.net)?"not-allowed":"pointer"}}>+ Add Week</button>
            {addMsg&&<div style={{padding:"9px 12px",background:addMsg.startsWith("⚠️")?`${C.red}12`:`${C.green}12`,borderRadius:8,border:`1px solid ${addMsg.startsWith("⚠️")?C.red:C.green}44`,fontSize:11,color:addMsg.startsWith("⚠️")?C.red:C.green,marginTop:8}}>{addMsg}</div>}
          </div>

          {/* EXPORT */}
          <NoBadge/>
          <div style={{...K(),marginBottom:80}}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:12,fontWeight:700,marginBottom:5}}>📤 Export Financial Report</div>
            <div style={{fontSize:10,color:C.sub,marginBottom:10}}>Print or email your YTD data to your accountant, broker, or lender.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
              <button onClick={printReport} style={{padding:"12px",borderRadius:10,background:`${C.accent}18`,border:`1px solid ${C.accent}44`,color:"#00ffcc",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><span style={{fontSize:20}}>🖨️</span><span>Print</span></button>
              <button onClick={emailReport} style={{padding:"12px",borderRadius:10,background:`${C.a3}18`,border:`1px solid ${C.a3}44`,color:"#a78bfa",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><span style={{fontSize:20}}>📧</span><span>Email</span></button>
            </div>
          </div>
        </div>
      );
    })()}

  </div>
)}
      {/* ══ OFFICE TAB — receipts, expenses, and True Net ══════════════════════ */}
      {tab==="office"&&(function(){
        // True Net must NEVER mix demo sample money with real expenses (audit
        // fix #6). Instead of showing an empty Office to demo users, demo mode
        // gets a fully consistent fake world: demo weeks + demo sample expenses,
        // clearly labeled. The user's REAL expenses stay hidden until they
        // switch to My Data mode — so numbers always come from one world only.
        const DEMO_EXPENSES=[
          {id:"demo1",date:"06/18/2026",category:"Tires",desc:"2 steer tires — Road Ready Tire Shop",amount:"612.00",note:"From: Road Ready Tire"},
          {id:"demo2",date:"06/27/2026",category:"Maintenance",desc:"PM service + oil change",amount:"289.50",note:"From: FleetCare Baltimore"},
          {id:"demo3",date:"07/03/2026",category:"Permits",desc:"Port ID renewal",amount:"75.00",note:"From: Port Authority"},
        ];
        const officeExpenses=demoMode?DEMO_EXPENSES:expenses;// demo = consistent sample world; real expenses stay hidden + protected
        const totalExpenses=officeExpenses.reduce(function(sum,e){return sum+(parseFloat(e.amount)||0);},0);
        const ytdNetFromWeeks=allW.reduce(function(sum,w){return sum+(w.net||0);},0);
        const trueNet=ytdNetFromWeeks-totalExpenses;

        // The Office is a Pro Smart feature, coming in the next version release.
        // Visible to everyone so people know it's coming, but locked for
        // Standard tier — matching the pattern used across other upcoming features.
        if(!isSmart){
          return(
            <div style={{padding:"16px",maxWidth:1100,margin:"0 auto"}}>
              <div style={{textAlign:"center",marginBottom:6}}>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:800,color:C.text}}>🏢 The Office</div>
                <div style={{fontSize:11,color:C.sub,marginTop:2}}>Receipts, expenses, and your True Net — after real out-of-pocket costs</div>
              </div>
              <div style={K({textAlign:"center",padding:"40px 20px",marginTop:20})}>
                <div style={{fontSize:40,marginBottom:14}}>🔒</div>
                <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:8}}>The Office — Pro Smart Feature</div>
                <div style={{fontSize:11,color:C.sub,lineHeight:1.7,maxWidth:400,margin:"0 auto 16px"}}>Scan receipts, track real out-of-pocket expenses, and see your True Net — what you actually keep after fuel, repairs, and every real business cost, not just what the settlement shows.</div>
                <div style={{display:"inline-block",padding:"6px 16px",borderRadius:20,background:"#fbbf2418",border:"1px solid #fbbf2444",fontSize:10,fontWeight:800,color:"#fbbf24",marginBottom:16}}>🧪 Coming in the Next Version Release</div>
                <div>
                  <button onClick={function(){openUpgrade("office");}} style={{padding:"10px 22px",borderRadius:9,background:`linear-gradient(135deg,${C.accent},${C.a3})`,border:"none",color:"#000",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Upgrade to Pro Smart →</button>
                </div>
              </div>
            </div>
          );
        }

        return(
        <div style={{padding:"16px",maxWidth:1100,margin:"0 auto"}}>

          <div style={{textAlign:"center",marginBottom:6}}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:800,color:C.text}}>🏢 The Office</div>
            <div style={{fontSize:11,color:C.sub,marginTop:2}}>Receipts, expenses, and your True Net — after real out-of-pocket costs</div>
          </div>
          {demoMode&&(
            <div style={{padding:"10px 12px",borderRadius:9,background:C.a3+"18",border:"1px solid "+C.a3+"44",fontSize:10,color:C.a3,textAlign:"center",marginTop:12,lineHeight:1.5}}>👀 Demo Mode — these are sample settlement numbers and sample expenses. Switch to <b>My Data Mode</b> (banner up top) to see your real True Net with your tracked expenses.</div>
          )}




          {/* 🔥 HOT DAYS — which weekdays actually make you money */}
          {(function(){
            const DAY_NAMES=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
            function parseDt(dt){
              if(!dt)return null;
              const p=String(dt).split("/");
              if(p.length<3)return null;
              let yr=parseInt(p[2],10);if(isNaN(yr))return null;
              if(yr<100)yr+=2000;
              const d=new Date(yr,parseInt(p[0],10)-1,parseInt(p[1],10));
              return isNaN(d.getTime())?null:d;
            }
            // Filter moves to the selected range using each move's own date
            // Ranges anchor to your NEWEST scanned move — not today's calendar
            // date — because settlements always arrive about a week behind.
            // "7 days" therefore means "the latest 7 days of data you have."
            const allDated=allMoves.map(function(m){return {m:m,d:parseDt(m.dt)};}).filter(function(x){return x.d;});
            const anchor=allDated.length?new Date(Math.max.apply(null,allDated.map(function(x){return x.d.getTime();}))):new Date();
            const cutoff=hotDaysRange==="7d"?new Date(anchor.getTime()-7*864e5):hotDaysRange==="4w"?new Date(anchor.getTime()-28*864e5):hotDaysRange==="40d"?new Date(anchor.getTime()-40*864e5):hotDaysRange==="100d"?new Date(anchor.getTime()-100*864e5):null;
            const dated=allDated.filter(function(x){return !cutoff||x.d>=cutoff;});
            if(dated.length<5){
              return(
                <div style={K({marginBottom:16,textAlign:"center",padding:"18px"})}>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,marginBottom:6}}>🔥 Hot Days — Your Best Money Days</div>
                  <div style={{fontSize:10,color:C.sub,lineHeight:1.6}}>{demoMode?"Switch to My Data Mode and scan settlements to unlock your real day-by-day revenue pattern.":"Not enough dated moves yet in this range — scan more settlements (or widen the filter) and this fills in automatically."}</div>
                </div>
              );
            }
            // Aggregate: revenue + distinct active dates per weekday
            const agg={};// day -> {rev, dates:Set, count}
            dated.forEach(function(x){
              const day=x.d.getDay();
              if(!agg[day])agg[day]={rev:0,dates:new Set(),count:0};
              agg[day].rev+=(x.m.rate||0)+(x.m.fsc||0);
              agg[day].dates.add(x.d.toDateString());
              agg[day].count++;
            });
            const rows=Object.keys(agg).map(function(k){
              const a=agg[k];
              return {day:+k,name:DAY_NAMES[+k],rev:a.rev,perDay:a.rev/a.dates.size,activeDays:a.dates.size,count:a.count};
            }).sort(function(a,b){return a.day-b.day;});
            const maxPerDay=Math.max.apply(null,rows.map(function(r){return r.perDay;}));
            const best=rows.reduce(function(a,b){return b.perDay>a.perDay?b:a;});
            const worst=rows.reduce(function(a,b){return b.perDay<a.perDay?b:a;});
            const avgAll=rows.reduce(function(s,r){return s+r.perDay;},0)/rows.length;
            const bestLift=avgAll>0?((best.perDay-avgAll)/avgAll*100).toFixed(0):0;
            return(
              <div style={K({marginBottom:16})}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,flexWrap:"wrap",gap:6}}>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700}}>🔥 Hot Days — Your Best Money Days{helpBtn("hotDays")}</div>
                  <div style={{display:"flex",gap:4}}>
                    {[["7d","7 days"],["4w","4 wks"],["40d","40 days"],["100d","100 days"],["all","Full"]].map(function(opt){
                      return <button key={opt[0]} onClick={function(){setHotDaysRange(opt[0]);}} style={{padding:"3px 9px",borderRadius:14,background:hotDaysRange===opt[0]?C.accent+"22":"transparent",border:"1px solid "+(hotDaysRange===opt[0]?C.accent+"66":C.border),color:hotDaysRange===opt[0]?C.accent:C.sub,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{opt[1]}</button>;
                    })}
                  </div>
                </div>
                {helpModal("hotDays")}
                {!isSmart?(
                  <div style={{textAlign:"center",padding:"14px 8px"}}>
                    <div style={{fontSize:11,color:C.sub,lineHeight:1.6,marginBottom:10}}>🔒 See exactly which weekdays pay you the most — push hard on hot days, rest easy on slow ones. Based on your real move dates.</div>
                    <button onClick={function(){openUpgrade("hotdays");}} style={{padding:"8px 18px",borderRadius:8,background:`linear-gradient(135deg,${C.accent},${C.a3})`,border:"none",color:"#000",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Unlock with Pro Smart →</button>
                  </div>
                ):(
                  <div>
                    <div style={{fontSize:10,color:C.sub,marginBottom:10}}>Average GROSS revenue (rate + FSC, before deductions) per <i>active</i> day · {dated.length} dated moves</div>
                    <div style={{display:"flex",alignItems:"flex-end",gap:6,height:150,padding:"0 2px"}}>
                      {rows.map(function(r){
                        const isBest=r.day===best.day,isWorst=r.day===worst.day&&rows.length>2;
                        const col=isBest?C.green:isWorst?C.red:C.accent;
                        const hPct=maxPerDay>0?(r.perDay/maxPerDay):0;
                        return(
                          <div key={r.day} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%"}}>
                            <div style={{fontSize:9,fontWeight:800,color:col,marginBottom:3,whiteSpace:"nowrap"}}>${r.perDay.toFixed(0)}</div>
                            <div style={{width:"100%",maxWidth:34,height:Math.max(5,hPct*100)+"px",background:"linear-gradient(180deg,"+col+","+col+"88)",borderRadius:"5px 5px 2px 2px",boxShadow:"0 0 10px "+col+"33"}}/>
                            <div style={{fontSize:9,fontWeight:700,color:isBest?C.green:isWorst?C.red:C.sub,marginTop:4}}>{r.name}{isBest?" 🔥":isWorst?" 🧊":""}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{marginTop:10,padding:"9px 11px",borderRadius:8,background:C.green+"12",border:"1px solid "+C.green+"33",fontSize:10,color:C.green,lineHeight:1.5}}>💡 <b>{DAY_NAMES[best.day]}s</b> are your hottest day — averaging <b>${best.perDay.toFixed(0)}/day</b>, {bestLift}% above your typical day. {rows.length>2?`${DAY_NAMES[worst.day]}s run slowest ($${worst.perDay.toFixed(0)}) — a safer day to rest or handle maintenance.`:""}</div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 🛣️ BEST ROUTES — which lanes actually pay (Pro Smart) */}
          {(function(){
            function parseDt2(dt){
              if(!dt)return null;
              const p=String(dt).split("/");
              if(p.length<3)return null;
              let yr=parseInt(p[2],10);if(isNaN(yr))return null;
              if(yr<100)yr+=2000;
              const d=new Date(yr,parseInt(p[0],10)-1,parseInt(p[1],10));
              return isNaN(d.getTime())?null:d;
            }
            const allDated2=allMoves.map(function(m){return parseDt2(m.dt);}).filter(function(d){return d;});
            const anchor2=allDated2.length?new Date(Math.max.apply(null,allDated2.map(function(d){return d.getTime();}))):new Date();
            const cutoff=routesRange==="7d"?new Date(anchor2.getTime()-7*864e5):routesRange==="4w"?new Date(anchor2.getTime()-28*864e5):routesRange==="40d"?new Date(anchor2.getTime()-40*864e5):routesRange==="100d"?new Date(anchor2.getTime()-100*864e5):null;
            const eligible=allMoves.filter(function(m){
              if(!(m.miles>0&&(m.rate+m.fsc)>0))return false;
              if(!cutoff)return true;
              const d=parseDt2(m.dt);
              return d&&d>=cutoff;
            });
            // Group by corridor (A ⇄ B counts as one lane regardless of direction,
            // so out-legs and back-legs of the same lane pool together honestly)
            const lanes={};
            eligible.forEach(function(m){
              const a=(m.from||"?").trim(),b=(m.to||"?").trim();
              const key=[a,b].sort().join(" ⇄ ");
              if(!lanes[key])lanes[key]={rev:0,mi:0,runs:0,label:key};
              lanes[key].rev+=(m.rate+m.fsc);
              lanes[key].mi+=m.miles;
              lanes[key].runs++;
            });
            const rows=Object.keys(lanes).map(function(k){
              const L=lanes[k];
              return {label:L.label,rpm:L.mi>0?L.rev/L.mi:0,avgPay:L.rev/L.runs,runs:L.runs,rev:L.rev};
            }).filter(function(r){return r.runs>=2;}).sort(function(a,b){return b.rpm-a.rpm;});
            if(rows.length<3){
              return(
                <div style={K({marginBottom:16,textAlign:"center",padding:"18px"})}>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,marginBottom:6}}>🛣️ Best Routes — Your Highest-Paying Lanes</div>
                  <div style={{fontSize:10,color:C.sub,lineHeight:1.6}}>{demoMode?"Switch to My Data Mode and scan settlements to see which of your real lanes pay best.":"Not enough repeated routes in this range yet — this needs lanes you've run at least twice. Widen the filter or keep scanning settlements."}</div>
                </div>
              );
            }
            const top=rows.slice(0,5);
            const flop=rows.length>6?rows.slice(-3).reverse():[];
            const maxRpm=top[0].rpm;
            function laneRow(r,hot){
              return(
                <div key={r.label} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:10,fontWeight:700,color:hot?C.text:C.sub,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.label}</div>
                    <div style={{marginTop:3}}><Bar pct={maxRpm>0?(r.rpm/maxRpm*100):0} color={hot?C.green:C.red} h={7}/></div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0,width:86}}>
                    <div style={{fontSize:11,fontWeight:800,color:hot?C.green:C.red}}>${r.rpm.toFixed(2)}/mi</div>
                    <div style={{fontSize:8,color:C.sub}}>${r.avgPay.toFixed(0)}/run · ×{r.runs}</div>
                  </div>
                </div>
              );
            }
            return(
              <div style={K({marginBottom:16})}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,flexWrap:"wrap",gap:6}}>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700}}>🛣️ Best Routes — Your Highest-Paying Lanes{helpBtn("bestRoutes")}</div>
                  <div style={{display:"flex",gap:4}}>
                    {[["7d","7 days"],["4w","4 wks"],["40d","40 days"],["100d","100 days"],["all","Full"]].map(function(opt){
                      return <button key={opt[0]} onClick={function(){setRoutesRange(opt[0]);}} style={{padding:"3px 9px",borderRadius:14,background:routesRange===opt[0]?C.accent+"22":"transparent",border:"1px solid "+(routesRange===opt[0]?C.accent+"66":C.border),color:routesRange===opt[0]?C.accent:C.sub,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{opt[1]}</button>;
                    })}
                  </div>
                </div>
                {helpModal("bestRoutes")}
                <div style={{fontSize:10,color:C.sub,marginBottom:10}}>Gross pay per mile (rate + FSC) by lane · both directions pooled · lanes run 2+ times</div>
                <div style={{fontSize:9,fontWeight:800,color:C.green,letterSpacing:"0.06em",marginBottom:7}}>🔥 TAKE THESE EVERY TIME</div>
                {top.map(function(r){return laneRow(r,true);})}
                {flop.length>0&&(
                  <div style={{marginTop:12}}>
                    <div style={{fontSize:9,fontWeight:800,color:C.red,letterSpacing:"0.06em",marginBottom:7}}>🧊 THINK TWICE — LOWEST PAY PER MILE</div>
                    {flop.map(function(r){return laneRow(r,false);})}
                  </div>
                )}
                <div style={{marginTop:10,padding:"9px 11px",borderRadius:8,background:C.green+"12",border:"1px solid "+C.green+"33",fontSize:10,color:C.green,lineHeight:1.5}}>💡 Your best lane <b>{top[0].label}</b> pays <b>${top[0].rpm.toFixed(2)}/mile</b>{flop.length>0?` — ${(top[0].rpm/Math.max(0.01,flop[0].rpm)).toFixed(1)}× your weakest repeated lane. When dispatch offers a choice, this list is your answer.`:". When dispatch offers a choice, this list is your answer."}</div>
              </div>
            );
          })()}


          {/* TRUE NET SUMMARY */}
          <div style={{display:"grid",gridTemplateColumns:wide?"1fr 1fr 1fr":"1fr 1fr",gap:12,marginBottom:16,marginTop:14}}>
            <div style={K({textAlign:"center"})}>
              <div style={{fontSize:9,color:C.sub,textTransform:"uppercase",marginBottom:4}}>YTD Net (Settlements)</div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:800,color:C.accent}}>${ytdNetFromWeeks.toLocaleString("en-US",{maximumFractionDigits:0})}</div>
            </div>
            <div style={K({textAlign:"center"})}>
              <div style={{fontSize:9,color:C.sub,textTransform:"uppercase",marginBottom:4}}>Tracked Expenses</div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:800,color:C.red}}>−${totalExpenses.toLocaleString("en-US",{maximumFractionDigits:0})}</div>
            </div>
            <div style={K({textAlign:"center",gridColumn:wide?"auto":"span 2"})}>
              <div style={{fontSize:9,color:C.sub,textTransform:"uppercase",marginBottom:4}}>💰 True Net</div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:800,color:trueNet>=0?C.green:C.red}}>${trueNet.toLocaleString("en-US",{maximumFractionDigits:0})}</div>
            </div>
          </div>

          {/* RECEIPT SCAN / ADD EXPENSE */}
          <div style={K({marginBottom:16})}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,marginBottom:12}}>📸 Scan a Receipt</div>
            <div style={{fontSize:9,color:C.sub,marginBottom:10,lineHeight:1.5}}>Snap or upload a photo of any receipt — parts, tires, maintenance, permits, or other business costs. AI reads it and fills in the details below for you to review.</div>
            <label style={{display:"block",width:"100%",padding:"13px",borderRadius:9,background:`linear-gradient(135deg,${C.accent},${C.a3})`,color:"#000",fontWeight:800,fontSize:13,textAlign:"center",cursor:"pointer",fontFamily:"inherit"}}>
              {expScan?"⏳ "+expScanMsg:"📸 Upload Receipt Photo"}
              <input type="file" accept="image/*,application/pdf" style={{display:"none"}} onChange={function(e){if(e.target.files&&e.target.files[0])readReceipt(e.target.files[0]);}}/>
            </label>
            {!expScan&&expScanMsg&&<div style={{fontSize:10,color:expScanMsg.startsWith("Could not")?C.red:C.green,marginTop:8,textAlign:"center"}}>{expScanMsg}</div>}

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:14}}>
              <div>
                <div style={{fontSize:8,color:C.sub,marginBottom:3}}>DATE</div>
                <input type="text" value={expForm.date} onChange={function(e){setExpForm(function(p){return {...p,date:e.target.value};});}} placeholder="MM/DD/YYYY" style={{width:"100%",padding:"8px 9px",borderRadius:7,background:C.bg,border:"1px solid "+C.border,color:C.text,fontSize:12,fontFamily:"inherit",boxSizing:"border-box"}}/>
              </div>
              <div>
                <div style={{fontSize:8,color:C.sub,marginBottom:3}}>CATEGORY</div>
                <select value={expForm.category} onChange={function(e){setExpForm(function(p){return {...p,category:e.target.value};});}} style={{width:"100%",padding:"8px 9px",borderRadius:7,background:C.bg,border:"1px solid "+C.border,color:C.text,fontSize:12,fontFamily:"inherit",boxSizing:"border-box",cursor:"pointer"}}>
                  {["Parts","Labor","Tires","Maintenance","Fuel","Permits","Other"].map(function(c){return <option key={c} value={c}>{c}</option>;})}
                </select>
              </div>
            </div>
            <div style={{marginTop:8}}>
              <div style={{fontSize:8,color:C.sub,marginBottom:3}}>DESCRIPTION</div>
              <input type="text" value={expForm.desc} onChange={function(e){setExpForm(function(p){return {...p,desc:e.target.value};});}} placeholder="e.g. Brake pads, front" style={{width:"100%",padding:"8px 9px",borderRadius:7,background:C.bg,border:"1px solid "+C.border,color:C.text,fontSize:12,fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
            <div style={{marginTop:8}}>
              <div style={{fontSize:8,color:C.sub,marginBottom:3}}>AMOUNT ($)</div>
              <input type="text" inputMode="decimal" value={expForm.amount} onChange={function(e){setExpForm(function(p){return {...p,amount:e.target.value};});}} placeholder="e.g. 89.99" style={{width:"100%",padding:"8px 9px",borderRadius:7,background:C.bg,border:"1px solid "+C.border,color:C.text,fontSize:12,fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
            <button onClick={function(){
              const amt=parseFloat(expForm.amount);
              if(!expForm.date||!amt||amt<=0){setExpScanMsg("Please fill in date and a valid amount");return;}
              setExpenses(function(p){return [...p,{...expForm,amount:amt,id:Date.now()}];});
              setExpForm({date:"",category:"Parts",desc:"",amount:"",note:"",weekRef:""});
              setExpScanMsg("✅ Expense saved");
              setTimeout(function(){setExpScanMsg("");},3000);
            }} style={{width:"100%",padding:"11px",borderRadius:9,background:C.green,color:"#000",fontWeight:800,fontSize:12,border:"none",cursor:"pointer",fontFamily:"inherit",marginTop:12}}>💾 Save Expense</button>
          </div>

          {/* EXPENSE HISTORY */}
          <div style={K()}>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,marginBottom:10}}>📋 Expense History ({officeExpenses.length}){demoMode&&<span style={{fontSize:8,fontWeight:800,color:C.a3,background:C.a3+"18",border:"1px solid "+C.a3+"44",borderRadius:20,padding:"2px 8px",marginLeft:8}}>👀 SAMPLE DATA</span>}</div>
            {officeExpenses.length===0?(
              <div style={{textAlign:"center",padding:"20px",color:C.sub,fontSize:11}}>
                <div style={{fontSize:26,marginBottom:6}}>🧾</div>
                No expenses tracked yet — scan a receipt above to get started
              </div>
            ):(
              [...officeExpenses].reverse().map(function(e,i){
                return(
                  <div key={e.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:C.bg,borderRadius:8,border:"1px solid "+C.border,marginBottom:8}}>
                    <div>
                      <div style={{fontSize:11,color:C.text,fontWeight:700}}>{e.desc||e.category}</div>
                      <div style={{fontSize:9,color:C.sub,marginTop:2}}>{e.date} · {e.category}{e.note?" · "+e.note:""}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:13,fontWeight:800,color:C.red}}>${parseFloat(e.amount).toFixed(2)}</span>
                      {!demoMode&&<button onClick={function(){setExpenses(function(p){return p.filter(function(x){return x.id!==e.id;});});}} style={{background:"none",border:"none",color:C.sub,fontSize:14,cursor:"pointer",padding:"0 4px"}}>×</button>}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
        );
      })()}

      </div>

      {/* LOGO BEFORE LEGAL FOOTER */}
      <div style={{display:"flex",justifyContent:"center",padding:"24px 16px 8px",background:C.bg}}>
        <img src={LOGO_HERO} alt="DrayageIQ" style={{width:"100%",maxWidth:280,height:"auto",opacity:0.85}}/>

      </div>

      {/* LEGAL FOOTER */}
      <div style={{background:C.bg,borderTop:"1px solid "+C.border,padding:"14px 16px"}}>
        <div style={{fontSize:9,color:C.sub,lineHeight:1.8,textAlign:"center",maxWidth:600,margin:"0 auto"}}>
          <div style={{fontWeight:700,color:C.sub,marginBottom:6,fontSize:10,letterSpacing:"0.05em",textTransform:"uppercase"}}>⚖️ Legal Disclaimer</div>
          <div style={{marginBottom:6}}><strong style={{color:C.sub}}>Not Financial or Legal Advice.</strong> DrayageIQ is an informational tool only. Nothing on this platform — including AI output and funding suggestions — constitutes financial, legal, tax, or professional business advice. Always consult a qualified professional before making business decisions.</div>
          <div style={{marginBottom:6}}><strong style={{color:C.sub}}>Your Data Is Securely Stored.</strong> Your settlement data is encrypted and stored in our secure cloud database (Supabase) so it syncs safely across your devices. When you use AI features, the content you submit is sent securely to our AI provider for processing only. We never sell your data. See our Privacy Policy for details.</div>
          <div style={{display:"flex",gap:14,justifyContent:"center",marginTop:8,flexWrap:"wrap"}}>
            <a href="/privacy.html" style={{color:C.accent,fontSize:10,textDecoration:"none",fontWeight:600}}>Privacy Policy</a>
            <a href="/terms.html" style={{color:C.accent,fontSize:10,textDecoration:"none",fontWeight:600}}>Terms of Service</a>
            <a href="/faq.html" style={{color:C.accent,fontSize:10,textDecoration:"none",fontWeight:600}}>FAQ</a>
            <a href="mailto:hello@getdrayageiq.com" style={{color:C.accent,fontSize:10,textDecoration:"none",fontWeight:600}}>Contact Support</a>
          </div>
          <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid "+C.border,fontSize:8,color:C.border}}>© {new Date().getFullYear()} DrayageIQ · All Rights Reserved · getdrayageiq.com · v{APP_VERSION} ({APP_VERSION_DATE})</div>
        </div>
      </div>



      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:200,background:C.surf,borderTop:"1px solid "+C.border,display:"flex",alignItems:"stretch",height:58,boxShadow:"0 -4px 20px rgba(0,0,0,0.4)"}}>
        {[{t:"dashboard",icon:"📊",label:"Dash"},{t:"loads",icon:"📋",label:"Analyzer"},{t:"ai",icon:"🧠",label:"AI"},{t:"growth",icon:"🚀",label:"Growth"},{t:"office",icon:"🏢",label:"Office"}].map(item=>(
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
