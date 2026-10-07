// SVG icons — no external dependency
import React from 'react';
const I = ({ d, size=16, color='currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',flexShrink:0,...props.style}} {...props}>
    {Array.isArray(d) ? d.map((p,i) => <path key={i} d={p}/>) : <path d={d}/>}
  </svg>
);
const C = ({ cx,cy,r, size=16, color='currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',flexShrink:0,...props.style}} {...props}>
    <circle cx={cx} cy={cy} r={r}/>
  </svg>
);

export const LayoutDashboard = ({size=16,...p}) => <I size={size} d={['M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z','M9 22V12h6v10']} {...p}/>;
export const Settings = ({size=16,...p}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',flexShrink:0,...p.style}} {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
export const Package = ({size=16,...p}) => <I size={size} d={['M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z','M3.27 6.96L12 12.01l8.73-5.05','M12 22.08V12']} {...p}/>;
export const Tag = ({size=16,...p}) => <I size={size} d={['M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z']} {...p}><line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="3"/></I>;
export const MapPin = ({size=16,...p}) => <I size={size} d={['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z']} {...p}><circle cx="12" cy="10" r="3" fill="none"/></I>;
export const ShoppingBag = ({size=16,...p}) => <I size={size} d={['M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z','M3 6h18','M16 10a4 4 0 01-8 0']} {...p}/>;
export const BarChart2 = ({size=16,...p}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',flexShrink:0,...p.style}} {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
export const PencilLine = ({size=16,...p}) => <I size={size} d={['M12 20h9','M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z']} {...p}/>;
export const LogOut = ({size=16,...p}) => <I size={size} d={['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9']} {...p}/>;
export const ArrowRight = ({size=16,...p}) => <I size={size} d={['M5 12h14','M12 5l7 7-7 7']} {...p}/>;
export const Plus = ({size=16,...p}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',flexShrink:0,...p.style}} {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
export const Save = ({size=16,...p}) => <I size={size} d={['M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z','M17 21v-8H7v8','M7 3v5h8']} {...p}/>;
export const Trash2 = ({size=16,...p}) => <I size={size} d={['M3 6h18','M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2','M10 11v6','M14 11v6']} {...p}/>;
export const RefreshCw = ({size=16,...p}) => <I size={size} d={['M23 4v6h-6','M1 20v-6h6','M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15']} {...p}/>;
export const Check = ({size=16,...p}) => <I size={size} d={['M20 6L9 17l-5-5']} {...p}/>;
export const AlertCircle = ({size=16,...p}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',flexShrink:0,...p.style}} {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
export const Loader2 = ({size=16,...p}) => <I size={size} d={['M21 12a9 9 0 11-6.219-8.56']} {...p}/>;
export const TrendingUp = ({size=16,...p}) => <I size={size} d={['M23 6l-9.5 9.5-5-5L1 18','M17 6h6v6']} {...p}/>;
export const ToggleLeft = ({size=16,...p}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',flexShrink:0,...p.style}} {...p}><rect x="1" y="5" width="22" height="14" rx="7" ry="7"/><circle cx="8" cy="12" r="3"/></svg>;
export const ToggleRight = ({size=16,...p}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',flexShrink:0,...p.style}} {...p}><rect x="1" y="5" width="22" height="14" rx="7" ry="7"/><circle cx="16" cy="12" r="3"/></svg>;
export const Lock = ({size=16,...p}) => <I size={size} d={['M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z','M7 11V7a5 5 0 0110 0v4']} {...p}/>;
export const Search = ({size=16,...p}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',flexShrink:0,...p.style}} {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
export const X = ({size=16,...p}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',flexShrink:0,...p.style}} {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
export const DollarSign = ({size=16,...p}) => <I size={size} d={['M12 1v22','M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6']} {...p}/>;
export const FileText = ({size=16,...p}) => <I size={size} d={['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z','M14 2v6h6','M16 13H8','M16 17H8','M10 9H8']} {...p}/>;
export const Phone = ({size=16,...p}) => <I size={size} d={['M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.4 10.8 19.79 19.79 0 01.36 2.18 2 2 0 012.34 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.41 7.45a16 16 0 006.14 6.14l1.62-1.62a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.2v2.72z']} {...p}/>;
export const Mail = ({size=16,...p}) => <I size={size} d={['M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z','M22 6l-10 7L2 6']} {...p}/>;
export const MapPinned = ({size=16,...p}) => <I size={size} d={['M18 8c0 4.5-6 9-6 9S6 12.5 6 8a6 6 0 1112 0z','M12 8m-2 0a2 2 0 104 0 2 2 0 10-4 0','M2 20h20']} {...p}/>;
export const Pencil = ({size=16,...p}) => <I size={size} d={['M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7','M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z']} {...p}/>;
