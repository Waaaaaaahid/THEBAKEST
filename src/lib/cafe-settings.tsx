import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { defaultCafeSettings, settingsApi, type CafeSettings } from './api';

const CafeSettingsContext=createContext<{settings:CafeSettings;refresh:()=>Promise<void>}>({settings:defaultCafeSettings,refresh:async()=>{}});
export function CafeSettingsProvider({children}:{children:ReactNode}){
 const [settings,setSettings]=useState<CafeSettings>(defaultCafeSettings);
 const refresh=async()=>{const res=await settingsApi.get();if(res.success&&res.data)setSettings({...defaultCafeSettings,...res.data,openingHours:{...defaultCafeSettings.openingHours,...res.data.openingHours}})};
 useEffect(()=>{let active=true;const poll=async()=>{const res=await settingsApi.get();if(active&&res.success&&res.data)setSettings({...defaultCafeSettings,...res.data,openingHours:{...defaultCafeSettings.openingHours,...res.data.openingHours}})};poll();const t=window.setInterval(poll,3000);return()=>{active=false;window.clearInterval(t)}},[]);
 const value=useMemo(()=>({settings,refresh}),[settings]);
 return <CafeSettingsContext.Provider value={value}>{children}</CafeSettingsContext.Provider>;
}
export function useCafeSettings(){return useContext(CafeSettingsContext)}
