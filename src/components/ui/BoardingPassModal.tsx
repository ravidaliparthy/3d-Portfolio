import React, { useState } from 'react';
import { X, Download, Ticket, Sparkles, User, Building, ShieldCheck } from 'lucide-react';
import { type Station } from '../../data';

interface BoardingPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: Station;
}

export const BoardingPassModal: React.FC<BoardingPassModalProps> = ({ isOpen, onClose, station }) => {
  const [passengerName, setPassengerName] = useState('Distinguished Guest');
  const [affiliation, setAffiliation] = useState('Technical Reviewer');
  const [cabinClass, setCabinClass] = useState('Executive First Class');

  if (!isOpen) return null;

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 580;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Luxury Obsidian-Forest Background
    const bgGradient = ctx.createLinearGradient(0, 0, 1200, 580);
    bgGradient.addColorStop(0, '#04140e');
    bgGradient.addColorStop(0.5, '#082016');
    bgGradient.addColorStop(1, '#020b08');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1200, 580);

    // 2. Fine Security Guilloche Lattice Lines
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1200; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 100, 580);
      ctx.stroke();
    }

    // 3. Gold Metallic Outer & Inner Border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.strokeRect(28, 28, 1144, 524);

    ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(36, 36, 1128, 508);

    // 4. Perforation Vertical Tear-Line (separating main stub from boarding pass)
    const tearX = 860;
    ctx.setLineDash([10, 8]);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tearX, 36);
    ctx.lineTo(tearX, 544);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // 5. Header Banner (Left Section)
    ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
    ctx.fillRect(40, 40, tearX - 44, 80);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('THE RAVI EXPRESS — SOUVENIR TRANSIT PASS', 64, 86);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('CENTRAL MILESTONE EXPRESS • VERIFIED GUEST ACCESS', 64, 108);

    // 6. Passenger Details
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px monospace';
    ctx.fillText('PASSENGER NAME', 64, 168);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(passengerName || 'Distinguished Guest', 64, 210);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px monospace';
    ctx.fillText('ORGANIZATION / ROLE', 64, 260);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(affiliation || 'Engineering Reviewer', 64, 296);

    // 7. Route & Class
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px monospace';
    ctx.fillText('ORIGIN CONCOURSE', 64, 355);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('STN 01: ORIGIN', 64, 385);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px monospace';
    ctx.fillText('DESTINATION', 340, 355);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('HYDERABAD GRAND CENTRAL', 340, 385);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px monospace';
    ctx.fillText('CLASS TIER', 64, 435);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(cabinClass.toUpperCase(), 64, 465);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px monospace';
    ctx.fillText('SEAT / BAY', 340, 435);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(station.ticket.seat || 'CAR-01 FIRST', 340, 465);

    // 8. Security Watermark & Stamp (Bottom Left)
    ctx.fillStyle = '#64748b';
    ctx.font = '11px monospace';
    ctx.fillText('ISSUED FOR: DALIPARTHY RAVI KRISHNA CHARAN PORTFOLIO EXPEDITION', 64, 520);

    // 9. Right Stub Section (Boarding Gate Stub)
    ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
    ctx.fillRect(tearX + 6, 40, 1144 - tearX - 10, 80);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('BOARDING STUB', tearX + 32, 86);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText('PASSENGER', tearX + 32, 168);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText((passengerName || 'Guest').slice(0, 16), tearX + 32, 198);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText('CABIN CLASS', tearX + 32, 245);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(cabinClass.slice(0, 18), tearX + 32, 275);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText('STATUS', tearX + 32, 320);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('VERIFIED PASS', tearX + 32, 348);

    // 10. Barcode Simulation on Stub
    ctx.fillStyle = '#f59e0b';
    const barStartY = 410;
    const barHeight = 85;
    for (let bx = tearX + 32; bx < 1120; bx += 7) {
      const w = ((bx * 13) % 4) + 1.5;
      ctx.fillRect(bx, barStartY, w, barHeight);
    }

    // Direct Image Download
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `The-Ravi-Express-Pass-${(passengerName || 'Guest').replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 z-[100] pointer-events-auto flex items-center justify-center bg-black/95 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Personalized Souvenir Boarding Pass"
    >
      {/* Luxury Railway Ticket Vault Container */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border-2 border-amber-400/60 bg-[#020b06] p-6 sm:p-8 shadow-[0_0_80px_rgba(0,0,0,0.99),0_30px_90px_rgba(0,0,0,1)] pointer-events-auto my-auto text-left">
        
        {/* Overhead Rivet Accents */}
        <div className="pointer-events-none absolute top-3 left-3 h-2.5 w-2.5 rounded-full bg-amber-400/80 shadow" />
        <div className="pointer-events-none absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-amber-400/80 shadow" />

        {/* Modal Header */}
        <div className="mb-6 flex items-center justify-between border-b border-amber-400/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/25 border border-amber-400/60 text-amber-300 shadow-md">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight drop-shadow-sm">Souvenir Boarding Pass</h2>
              <p className="text-xs text-amber-400 font-bold">Customize and print your official pass on the Ravi Express</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-amber-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Customization Inputs */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-amber-400 mb-1.5">
              Your Name (Passenger)
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-emerald-400" />
              <input
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-xl border-2 border-emerald-500/40 bg-[#04140b] py-2.5 pl-10 pr-4 text-xs font-bold text-white placeholder-slate-400 focus:border-amber-400 focus:outline-none pointer-events-auto shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-amber-400 mb-1.5">
                Affiliation / Role
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-3 h-4 w-4 text-emerald-400" />
                <input
                  type="text"
                  value={affiliation}
                  onChange={(e) => setAffiliation(e.target.value)}
                  placeholder="e.g. Google / Tech Lead"
                  className="w-full rounded-xl border-2 border-emerald-500/40 bg-[#04140b] py-2.5 pl-10 pr-4 text-xs font-bold text-white placeholder-slate-400 focus:border-amber-400 focus:outline-none pointer-events-auto shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-amber-400 mb-1.5">
                Cabin Class
              </label>
              <select
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value)}
                className="w-full rounded-xl border-2 border-emerald-500/40 bg-[#04140b] py-2.5 px-3.5 text-xs font-bold text-white focus:border-amber-400 focus:outline-none pointer-events-auto cursor-pointer"
              >
                <option value="Executive First Class" className="bg-slate-950 text-white">Executive First Class</option>
                <option value="VIP Technical Recruiter" className="bg-slate-950 text-white">VIP Technical Recruiter</option>
                <option value="Distinguished Engineering Lead" className="bg-slate-950 text-white">Distinguished Engineering Lead</option>
                <option value="Research Fellow Observer" className="bg-slate-950 text-white">Research Fellow Observer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced Visual Ticket Preview with Cutout Notches */}
        <div className="relative mb-6 rounded-2xl border-2 border-amber-400/50 bg-[#04140b] p-5 font-mono text-xs shadow-2xl overflow-hidden">
          
          {/* Ticket Punch Notches on sides */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-[#010805] border border-amber-400/40" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-[#010805] border border-amber-400/40" />

          {/* Ticket Header */}
          <div className="flex justify-between items-center border-b border-amber-400/25 pb-2.5 mb-3.5">
            <span className="text-amber-300 font-black tracking-widest text-[11px] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              THE RAVI EXPRESS • TRANSIT PASS
            </span>
            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] text-amber-300 font-black border border-amber-400/40">
              {cabinClass}
            </span>
          </div>

          {/* Ticket Body Grid */}
          <div className="grid grid-cols-2 gap-3 text-slate-200 mb-3.5 text-[11px]">
            <div>
              <span className="text-[10px] text-emerald-400 block uppercase font-bold">Passenger</span>
              <span className="text-white font-black text-xs">{passengerName || 'Distinguished Guest'}</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-400 block uppercase font-bold">Affiliation</span>
              <span className="text-amber-300 font-bold">{affiliation || 'Engineering Reviewer'}</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-400 block uppercase font-bold">Routing</span>
              <span className="text-white font-mono font-semibold">ORIGIN ➔ HYDERABAD TERMINUS</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-400 block uppercase font-bold">Seat & Gate</span>
              <span className="text-amber-300 font-mono font-black">CAR-01 • TRACK 01</span>
            </div>
          </div>

          {/* Barcode & Verification Footer */}
          <div className="pt-2 border-t border-dashed border-amber-400/25 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-300 text-[10px] font-bold">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>OFFICIALLY VERIFIED EXPEDITION PASS</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(14)].map((_, i) => (
                <div key={i} className={`h-4 w-${(i % 3) + 1} bg-amber-400`} />
              ))}
            </div>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 py-3 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/30 hover:from-amber-300 hover:to-amber-400 hover:scale-[1.01] transition-all cursor-pointer pointer-events-auto"
        >
          <Download className="h-4 w-4" />
          <span>Download High-Res Souvenir Pass (1200x580 PNG)</span>
        </button>
      </div>
    </div>
  );
};
