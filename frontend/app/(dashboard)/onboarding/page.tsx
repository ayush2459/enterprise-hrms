"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Circle, FileCheck2, Users } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/common/Loader";
import { onboardingService } from "@/services/onboarding.service";
import type { OnboardingStatus } from "@/types";

function ChecklistGroup({ label, items }: { label:string; items:{label:string;complete:boolean}[] }) { return <div><p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p><ul className="space-y-2">{items.map(item=><li key={item.label} className="flex items-center gap-2 text-xs">{item.complete?<CheckCircle2 size={15} className="text-green-600"/>:<Circle size={15} className="text-gray-300"/>}<span className={item.complete?"text-gray-800":"text-gray-500"}>{item.label}</span></li>)}</ul></div>; }

export default function OnboardingPage(){
 const [rows,setRows]=useState<OnboardingStatus[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState<string|null>(null),[filter,setFilter]=useState("all");
 const load=()=>{setLoading(true);onboardingService.list().then(setRows).catch(()=>setError("Could not load onboarding data. This view is HR-only.")).finally(()=>setLoading(false));};
 useEffect(()=>{load();},[]);
 const enriched=useMemo(()=>rows.map(r=>{const all=[...r.documents,...r.bgv];const done=all.filter(x=>x.complete).length;return {...r,progress:all.length?Math.round(done/all.length*100):0,pending:all.filter(x=>!x.complete).length};}),[rows]);
 const filtered=enriched.filter(r=>filter==="all"||(filter==="complete"&&r.progress===100)||(filter==="pending"&&r.progress<100));
 const complete=enriched.filter(r=>r.progress===100).length,pending=enriched.filter(r=>r.progress<100).length,avg=enriched.length?Math.round(enriched.reduce((a,r)=>a+r.progress,0)/enriched.length):0;
 const handleComplete=async(id:string)=>{try{await onboardingService.markComplete(id);load();}catch{setError("Could not mark onboarding complete.");}};
 return <><Topbar title="Onboarding" subtitle="New-hire progress, checklists & pending actions"/><div className="space-y-6 p-8">
  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><Metric icon={Users} label="Onboarding" value={rows.length}/><Metric icon={CheckCircle2} label="Completed" value={complete}/><Metric icon={AlertCircle} label="Pending" value={pending}/><Metric icon={FileCheck2} label="Average progress" value={avg} suffix="%"/></div>
  <Card className="p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-gray-900">Onboarding tracker</p><p className="text-xs text-gray-400">Every new hire has a visible completion path</p></div><div className="flex gap-1 rounded-xl bg-gray-100 p-1">{[["all","All"],["pending","Pending"],["complete","Complete"]].map(([v,l])=><button key={v} onClick={()=>setFilter(v)} className={`rounded-lg px-3 py-1.5 text-xs ${filter===v?"bg-white font-medium shadow-sm text-gray-900":"text-gray-500"}`}>{l}</button>)}</div></div></Card>
  {error&&<p className="text-sm text-red-500">{error}</p>}
  {loading?<Loader label="Loading onboarding checklist..."/>:filtered.length===0?<Card className="py-16 text-center text-gray-400">No onboarding records match this view.</Card>:<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{filtered.map(row=><Card key={row.employee_id} className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-gray-900">{row.full_name}</p>{row.date_of_joining&&<p className="mt-1 text-xs text-gray-400">Joining {new Date(row.date_of_joining).toLocaleDateString()}</p>}</div><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${row.progress===100?"bg-green-50 text-green-700":"bg-amber-50 text-amber-700"}`}>{row.progress}% complete</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-brand transition-all" style={{width:`${row.progress}%`}}/></div><div className="mt-4 grid grid-cols-2 gap-5"><ChecklistGroup label="Documents" items={row.documents}/><ChecklistGroup label="Background verification" items={row.bgv}/></div><div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4"><p className="text-xs text-gray-500">{row.pending} pending action{row.pending===1?"":"s"}</p><Button onClick={()=>handleComplete(row.employee_id)} disabled={!row.all_complete} className="px-3 py-1.5 text-xs">{row.all_complete?"Complete onboarding":"Complete checklist first"}</Button></div></Card>)}</div>}
 </div></>;
}
function Metric({icon:Icon,label,value,suffix=""}:{icon:any;label:string;value:number;suffix?:string}){return <Card className="p-4"><div className="w-fit rounded-xl bg-gray-100 p-2"><Icon size={17} className="text-gray-600"/></div><p className="mt-3 text-xs text-gray-500">{label}</p><p className="mt-1 text-2xl font-semibold text-gray-900">{value}{suffix}</p></Card>}
