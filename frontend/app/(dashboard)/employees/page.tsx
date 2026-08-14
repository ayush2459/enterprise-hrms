"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, FileUp, Search, SlidersHorizontal, UserCheck, UserPlus, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/common/Loader";
import { AddEmployeeModal } from "@/components/employees/AddEmployeeModal";
import { ImportEmployeesModal } from "@/components/employees/ImportEmployeesModal";
import { employeeService } from "@/services/employee.service";
import type { EmployeePublic } from "@/types";

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);

  const loadEmployees = async () => {
    setLoading(true);
    try { setEmployees(await employeeService.list()); }
    catch (error) { console.error("Failed to load employees:", error); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadEmployees(); }, []);

  const departments = useMemo(() => Array.from(new Set(employees.map(e => e.department).filter(Boolean))) as string[], [employees]);
  const statuses = useMemo(() => Array.from(new Set(employees.map(e => e.status))) as string[], [employees]);
  const filtered = useMemo(() => employees.filter(e => {
    const haystack = [e.full_name, e.department, e.designation, e.status].filter(Boolean).join(" ").toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (department === "all" || e.department === department) && (status === "all" || e.status === status);
  }), [employees, query, department, status]);
  const active = employees.filter(e => e.status === "active").length;
  const inactive = employees.length - active;
  const deptCounts = departments.map(d => ({ name: d, count: employees.filter(e => e.department === d).length })).sort((a,b) => b.count-a.count).slice(0,4);

  return <>
    <Topbar title="Employees" subtitle="Workforce directory & people intelligence" />
    <div className="space-y-6 p-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric icon={Users} label="Total workforce" value={employees.length} hint="All employees" />
        <Metric icon={UserCheck} label="Active" value={active} hint={`${employees.length ? Math.round(active / employees.length * 100) : 0}% of workforce`} />
        <Metric icon={Building2} label="Departments" value={departments.length} hint="Unique teams" />
        <Metric icon={Users} label="Filtered" value={filtered.length} hint="Current view" />
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
            <Search size={17} className="text-gray-400" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, department, designation or status..." className="w-full bg-transparent text-sm outline-none" />
            {query && <button onClick={() => setQuery("")}><X size={15} className="text-gray-400" /></button>}
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-500"><SlidersHorizontal size={14} /> Filters</div>
            <select value={department} onChange={e => setDepartment(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-xs"><option value="all">All departments</option>{departments.map(d => <option key={d} value={d}>{d}</option>)}</select>
            <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-xs"><option value="all">All statuses</option>{statuses.map(s => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}</select>
            <Button variant="secondary" onClick={() => setShowImportModal(true)} className="flex items-center gap-2"><FileUp size={15}/> Import</Button>
            <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2"><UserPlus size={15}/> Add Employee</Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {deptCounts.map(d => <Card key={d.name} className="p-4"><p className="text-xs text-gray-400">Department</p><p className="mt-1 font-semibold text-gray-900">{d.name}</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-brand" style={{width:`${employees.length ? d.count/employees.length*100 : 0}%`}} /></div><p className="mt-2 text-xs text-gray-500">{d.count} employees</p></Card>)}
      </div>

      <Card className="overflow-hidden p-0">
        {loading ? <Loader label="Loading employees..." /> : <>
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4"><div><p className="text-sm font-semibold text-gray-900">Employee directory</p><p className="text-xs text-gray-400">{filtered.length} people match the current filters</p></div>{selected.length > 0 && <span className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand">{selected.length} selected</span>}</div>
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-surface-muted text-left text-xs text-gray-500"><tr><th className="px-5 py-3"><input type="checkbox" checked={filtered.length > 0 && selected.length === filtered.length} onChange={e => setSelected(e.target.checked ? filtered.map(x=>x.id) : [])}/></th><th className="px-5 py-3">Employee</th><th className="px-5 py-3">Department</th><th className="px-5 py-3">Designation</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-gray-100">{filtered.map(emp => <tr key={emp.id} onClick={() => router.push(`/employees/${emp.id}`)} className="cursor-pointer hover:bg-gray-50"><td className="px-5 py-3" onClick={e=>e.stopPropagation()}><input type="checkbox" checked={selected.includes(emp.id)} onChange={e=>setSelected(v=>e.target.checked?[...v,emp.id]:v.filter(id=>id!==emp.id))}/></td><td className="px-5 py-3"><p className="font-medium text-gray-900">{emp.full_name}</p><p className="text-xs text-gray-400">Employee profile</p></td><td className="px-5 py-3 text-gray-600">{emp.department ?? "—"}</td><td className="px-5 py-3 text-gray-600">{emp.designation ?? "—"}</td><td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${emp.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{emp.status.replace(/_/g," ")}</span></td></tr>)}{filtered.length===0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">No employees match your filters.</td></tr>}</tbody></table></div>
        </>}
      </Card>
    </div>
    {showAddModal && <AddEmployeeModal onClose={()=>setShowAddModal(false)} onCreated={loadEmployees}/>} {showImportModal && <ImportEmployeesModal onClose={()=>setShowImportModal(false)} onImported={loadEmployees}/>} 
  </>;
}

function Metric({icon: Icon,label,value,hint}:{icon:any;label:string;value:number;hint:string}) { return <Card className="p-4"><div className="flex items-center justify-between"><div className="rounded-xl bg-gray-100 p-2"><Icon size={17} className="text-gray-600"/></div><span className="text-[10px] uppercase tracking-wide text-gray-400">HR</span></div><p className="mt-4 text-xs text-gray-500">{label}</p><p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p><p className="mt-1 text-xs text-gray-400">{hint}</p></Card>; }
