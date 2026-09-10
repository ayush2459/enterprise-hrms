"use client";
import { useEffect, useMemo, useState } from "react";
import { Search, Sparkles, Activity, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

const ITEMS = [
["Dashboard","/dashboard","overview metrics analytics home"],
["Employees","/employees","people staff employee directory"],
["Recruitment","/recruitment","jobs hiring candidate applicant"],
["Onboarding","/onboarding","joining new hire onboarding"],
["Attendance","/attendance","present absent punch attendance"],
["Leaves","/leaves","leave holiday request absence"],
["Payroll","/payroll","salary pay payslip compensation"],
["Performance","/performance","review rating goal performance"],
["Documents","/documents","document file contract letter"],
["Teams","/teams","team department organization"],
["Insurance","/insurance","benefit insurance coverage"],
["Leave Policies","/leave-policies","policy leave type quota"],
["Background Checks","/background-check","bgv verification background"],
["Policies","/policies","policy compliance rule"],
["Settings","/settings","configuration preferences admin"],
] as const;

export function PageCommandCenter({title,description,actionLabel,actionHref}:{
 title:string; description:string; actionLabel?:string; actionHref?:string
}) {
 const router=useRouter(); const [q,setQ]=useState(""); const [sync,setSync]=useState(new Date());
 useEffect(()=>{const id=setInterval(()=>setSync(new Date()),15000);return()=>clearInterval(id)},[]);
 const results=useMemo(()=>{const x=q.trim().toLowerCase();if(!x)return [];
 return ITEMS.map(i=>({i,score:i[0].toLowerCase()===x?100:i[0].toLowerCase().startsWith(x)?50:i.join(" ").toLowerCase().includes(x)?20:0}))
 .filter(x=>x.score).sort((a,b)=>b.score-a.score).slice(0,6).map(x=>x.i)},[q]);
 const go=(href:string)=>{setQ("");router.push(href)};
 return <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-5 text-white">
   <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <div><div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-blue-100"><Sparkles size={13}/>People Intelligence</div>
    <h1 className="text-2xl font-bold tracking-tight">{title}</h1><p className="mt-1 text-sm text-blue-100">{description}</p></div>
    {actionLabel&&actionHref&&<button onClick={()=>go(actionHref)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900">{actionLabel}<ArrowUpRight size={16}/></button>}
   </div>
  </div>
  <div className="relative border-b border-slate-100 px-4 py-3">
   <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"><Search size={17} className="text-slate-400"/>
    <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&results[0])go(results[0][1])}} placeholder="Search employees, pages, actions..." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"/>
    <kbd className="hidden rounded-md border bg-white px-1.5 py-0.5 text-[10px] text-slate-400 sm:block">⌘ K</kbd>
   </div>
   {results.length>0&&<div className="absolute left-4 right-4 top-[calc(100%-4px)] z-50 overflow-hidden rounded-xl border bg-white shadow-xl">{results.map(i=><button key={i[1]} onClick={()=>go(i[1])} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"><span><b className="block text-sm text-slate-900">{i[0]}</b><small className="text-xs text-slate-400">{i[2]}</small></span><ArrowUpRight size={15}/></button>)}</div>}
  </div>
  <div className="flex items-center justify-between px-4 py-2.5 text-[11px] text-slate-400"><span className="flex items-center gap-1.5"><Activity size={13} className="text-emerald-500"/>Live workspace</span><span>Synced {sync.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</span></div>
 </section>
}
