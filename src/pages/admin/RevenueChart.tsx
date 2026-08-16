import { motion } from 'framer-motion';
import { formatINR } from '@/lib/format';
interface Point { date:string; revenue:number; orders:number; }
interface Props { data:Point[]; range:number; }
const formatBucket=(value:string,range:number)=>{const raw=String(value).slice(0,10);const d=new Date(`${raw}T12:00:00`);if(Number.isNaN(d.getTime()))return raw;return range<=30?d.toLocaleDateString('en-IN',{day:'numeric',month:'short'}):d.toLocaleDateString('en-IN',{month:'short',year:'2-digit'});};
export default function RevenueChart({data,range}:Props){
 const points=data.map(p=>({date:String(p.date).slice(0,10),revenue:Number(p.revenue)||0,orders:Number(p.orders)||0}));
 const max=Math.max(...points.map(p=>p.revenue),1); const scrollable=range===30;
 const minWidth=scrollable?Math.max(1000,points.length*44):range===7?Math.max(520,points.length*58):Math.max(700,points.length*86);
 if(!points.length)return <div className="flex h-60 items-center justify-center text-sm text-bakery-ink/45">No revenue data for this period.</div>;
 return <div className="w-full overflow-hidden rounded-2xl bg-bakery-sky/35 p-3 sm:p-5">
  <div className="overflow-x-auto overscroll-x-contain pb-2">
   <div className="relative h-64" style={{minWidth}}>
    <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none">{[0,1,2,3].map(i=><div key={i} className="border-t border-dashed border-bakery-primary/[0.08]"/>)}</div>
    <div className="absolute inset-x-0 bottom-0 top-1 flex items-end" style={{gap:scrollable?10:12}}>
     {points.map((p,i)=>{const height=p.revenue?Math.max(p.revenue/max*92,3):0;const width=scrollable?34:range===7?46:68;return <div key={`${p.date}-${i}`} className="group relative flex h-full shrink-0 items-end justify-center" style={{width}}>
       {p.revenue>0&&<motion.div className="relative w-full rounded-t-md bg-bakery-primary shadow-sm" initial={{height:0,opacity:0}} animate={{height:`${height}%`,opacity:1}} transition={{duration:.8,ease:[.22,1,.36,1],delay:Math.min(i*.025,.7)}} title={`${formatBucket(p.date,range)} · ${formatINR(p.revenue)} · ${p.orders} orders`}>
        <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-bakery-ink px-2 py-1 text-[10px] font-semibold text-white shadow-lg group-hover:block">{formatINR(p.revenue)}</div>
       </motion.div>}
      </div>})}
    </div>
    <div className="absolute inset-x-0 bottom-0 border-t border-bakery-primary/[0.12]"/>
   </div>
   <div className="mt-3" style={{minWidth}}><div className="flex" style={{gap:scrollable?10:12}}>{points.map(p=><div key={`${p.date}-label`} className="shrink-0 text-center text-[9px] text-bakery-ink/50 sm:text-[10px]" style={{width:scrollable?34:range===7?46:68}}>{formatBucket(p.date,range)}</div>)}</div></div>
  </div>
  {scrollable&&<p className="mt-2 text-center text-[10px] text-bakery-ink/35">Swipe left/right to view all 30 days</p>}
 </div>;
}
