import { motion } from 'framer-motion';
import { formatINR } from '@/lib/format';
interface Point { date:string; revenue:number; orders:number; }
interface Props { data:Point[]; range:number; }
const formatBucket=(value:string,range:number)=>{const d=new Date(`${String(value).slice(0,10)}T12:00:00`);if(Number.isNaN(d.getTime()))return String(value).slice(0,10);return range<=30?d.toLocaleDateString('en-IN',{day:'numeric',month:'short'}):d.toLocaleDateString('en-IN',{month:'short',year:'2-digit'});};
export default function RevenueChart({data,range}:Props){
 const points=data.map(p=>({date:String(p.date).slice(0,10),revenue:Number(p.revenue)||0,orders:Number(p.orders)||0}));
 const max=Math.max(...points.map(p=>p.revenue),1);
 const labelCount=range===7?7:range===30?6:range===180?6:7;
 const labelIndexes=Array.from({length:labelCount},(_,i)=>points.length?Math.round(i*(points.length-1)/Math.max(labelCount-1,1)):0).filter((v,i,a)=>a.indexOf(v)===i);
 if(!points.length)return <div className="flex h-60 items-center justify-center text-sm text-bakery-ink/45">No revenue data for this period.</div>;
 return <div className="w-full overflow-hidden rounded-2xl bg-bakery-sky/35 p-3 sm:p-5">
  <div className="relative h-56 sm:h-64">
   <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none">{[0,1,2,3].map(i=><div key={i} className="border-t border-dashed border-bakery-primary/[0.08]"/>)}</div>
   <div className="absolute inset-x-0 bottom-0 top-1 flex items-end gap-1 sm:gap-2">
    {points.map((p,i)=>{const height=p.revenue?Math.max(p.revenue/max*92,3):0;return <div key={`${p.date}-${i}`} className="group relative flex h-full flex-1 items-end justify-center">
      {p.revenue>0&&<motion.div className="relative w-full max-w-10 rounded-t-md bg-bakery-primary shadow-sm sm:max-w-12" initial={{height:0}} animate={{height:`${height}%`}} transition={{duration:.75,ease:[.22,1,.36,1],delay:i*.035}} title={`${formatBucket(p.date,range)} · ${formatINR(p.revenue)} · ${p.orders} orders`}>
       <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-bakery-ink px-2 py-1 text-[10px] font-semibold text-white shadow-lg group-hover:block">{formatINR(p.revenue)}</div>
      </motion.div>}
    </div>})}
   </div>
  </div>
  <div className="mt-3 grid gap-1 text-center text-[9px] text-bakery-ink/45 sm:text-[10px]" style={{gridTemplateColumns:`repeat(${Math.max(labelIndexes.length,1)},minmax(0,1fr))`}}>{labelIndexes.map(i=><span key={`${points[i].date}-label`} className="truncate">{formatBucket(points[i].date,range)}</span>)}</div>
 </div>;
}
