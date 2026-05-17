'use client';

import { useStore } from '@/store/useStore';
import { Coffee, Star, ChevronRight, Timer, Thermometer, Scale, ChevronDown, ChevronUp, Droplets, Save, Trash2, Edit2, Check, X, Play, Pause, RotateCcw, Wrench, ArrowRight, ShoppingCart, Sun, Info, Lock, LockOpen } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { BrewingMethod, BrewingPreset, BrewingStep, Equipment } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { playChime, playDoubleBeep } from '@/lib/audio';

const GRIND_LEVELS = ['Fine', 'Medium-Fine', 'Medium', 'Medium-Coarse', 'Coarse'];

const GRIND_VISUALS: Record<string, string> = {
  'Fine': 'grind_visual_fine',
  'Medium-Fine': 'grind_visual_medium_fine',
  'Medium': 'grind_visual_medium',
  'Medium-Coarse': 'grind_visual_medium_coarse',
  'Coarse': 'grind_visual_coarse'
};

export default function BrewingPage() {
  const { methods, equipment, presets, addPreset, removePreset, isGuest } = useStore();
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<BrewingMethod | null>(null);
  const [showOther, setShowOther] = useState(false);
  
  // Param editing state
  const [dose, setDose] = useState(15);
  const [water, setWater] = useState(250);
  const [temp, setTemp] = useState(94);
  const [grind, setGrind] = useState('Medium-Fine');
  const [ratio, setRatio] = useState(16.7);
  const [isSaving, setIsSaving] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // 'coffee' | 'water' | 'ratio'
  const [lockedParam, setLockedParam] = useState<'coffee' | 'water' | 'ratio'>('ratio');

  // Timer State
  const [showTimer, setShowTimer] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [elapsedInStep, setElapsedInStep] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [wakeLock, setWakeLock] = useState<any>(null);

  // Screen Wake Lock Logic
  useEffect(() => {
    const requestWakeLock = async () => {
      if (typeof window !== 'undefined' && 'wakeLock' in navigator && timerActive) {
        try {
          const wl = await (navigator as any).wakeLock.request('screen');
          setWakeLock(wl);
          wl.addEventListener('release', () => {
            setWakeLock(null);
          });
        } catch (err: any) {
          console.error(`${err.name}, ${err.message}`);
        }
      } else if (wakeLock && !timerActive) {
        wakeLock.release().then(() => setWakeLock(null));
      }
    };
    requestWakeLock();
    return () => {
      if (wakeLock) wakeLock.release();
    };
  }, [timerActive]);

  const getScaledInstruction = (
    instruction: string,
    step: BrewingStep,
    currentDose: number,
    currentWater: number,
    allSteps: BrewingStep[]
  ) => {
    if (!allSteps.length) return instruction;
    
    const lastStep = allSteps[allSteps.length - 1];
    const originalTotalWater = lastStep.target_water || 250;
    
    const doseStep = allSteps.find(s => 
      s.instruction.toLowerCase().includes('coffee') || 
      s.instruction.toLowerCase().includes('dose') ||
      s.instruction.toLowerCase().includes('café') ||
      s.instruction.toLowerCase().includes('кофе') ||
      s.instruction.toLowerCase().includes('ყავა')
    );
    const originalDose = doseStep?.target_water || 15;

    const waterScale = currentWater / originalTotalWater;
    const doseScale = currentDose / originalDose;

    return instruction.replace(/(\d+(?:\.\d+)?)g\b/g, (match, p1) => {
      const val = parseFloat(p1);
      
      if (val === step.target_water) {
        if (step === doseStep) return `${Math.round(val * doseScale)}g`;
        return `${Math.round(val * waterScale)}g`;
      }

      if (val === originalDose) return `${Math.round(val * doseScale)}g`;

      const matchingStep = allSteps.find(s => s.target_water === val);
      if (matchingStep) {
        if (matchingStep === doseStep) return `${Math.round(val * doseScale)}g`;
        return `${Math.round(val * waterScale)}g`;
      }

      return match;
    });
  };

  useEffect(() => {
    if (selectedMethod) {
      setPresetName(`${selectedMethod.displayName} Default`);
      
      if (selectedMethod.steps && selectedMethod.steps.length > 0) {
        const steps = selectedMethod.steps;
        const lastStep = steps[steps.length - 1];
        const originalTotalWater = lastStep.target_water || 250;
        
        const doseStep = steps.find(s => 
          s.instruction.toLowerCase().includes('coffee') || 
          s.instruction.toLowerCase().includes('dose') ||
          s.instruction.toLowerCase().includes('café') ||
          s.instruction.toLowerCase().includes('кофе') ||
          s.instruction.toLowerCase().includes('ყავა')
        );
        const originalDose = doseStep?.target_water || 15;

        setDose(originalDose);
        setWater(originalTotalWater);
        setRatio(Math.round((originalTotalWater / originalDose) * 10) / 10);
      }
    }
  }, [selectedMethod]);

  const handleDoseChange = (newDose: number) => {
    const d = Math.max(0.1, Math.round(newDose * 10) / 10);
    setDose(d);
    if (lockedParam === 'water') {
      setRatio(Math.round((water / d) * 10) / 10);
    } else {
      // ratio is locked or coffee is locked (but we are changing it)
      setWater(Math.round(d * ratio));
    }
  };

  const handleWaterChange = (newWater: number) => {
    const w = Math.max(1, Math.round(newWater));
    setWater(w);
    if (lockedParam === 'coffee') {
      setRatio(Math.round((w / dose) * 10) / 10);
    } else {
      // ratio is locked or water is locked (but we are changing it)
      setDose(Math.round((w / ratio) * 10) / 10);
    }
  };

  const handleRatioChange = (newRatio: number) => {
    const r = Math.round(newRatio * 10) / 10;
    setRatio(r);
    if (lockedParam === 'coffee') {
      setWater(Math.round(dose * r));
    } else if (lockedParam === 'water') {
      setDose(Math.round((water / r) * 10) / 10);
    } else {
      // ratio is locked but we are changing it
      setWater(Math.round(dose * r));
    }
  };

  // Timer Logic
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setElapsedInStep(prev => prev + 1);
        setTotalElapsed(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]);

  const currentMethodSteps = selectedMethod?.steps || [];
  const currentStep = currentMethodSteps[currentStepIndex];
  const totalDuration = currentMethodSteps.reduce((acc, s) => acc + (s.duration || 0), 0);

  const handleNextStep = () => {
    if (currentStepIndex < currentMethodSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setElapsedInStep(0);
      playChime();
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200);
    } else {
      setTimerActive(false);
      setCurrentStepIndex(currentMethodSteps.length);
      playDoubleBeep();
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }
  };

  useEffect(() => {
    if (currentStep && currentStep.duration > 0 && elapsedInStep >= currentStep.duration) {
      handleNextStep();
    }
  }, [elapsedInStep, currentStep, currentStepIndex, currentMethodSteps.length]);

  const ownedNames = equipment.filter(e => e.isOwned).map(e => e.internal_name.toLowerCase());
  const kettleNames = equipment.filter(e => e.category === 'kettle').map(e => e.internal_name.toLowerCase());
  
  if (methods.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-6 text-center">
        <p className="text-stone-600 dark:text-stone-400 animate-pulse font-medium">{t.discovering_methods}</p>
      </div>
    );
  }

  // Kettles are optional, they don't block a method from being available
  const availableMethods = methods.filter(m => 
    m.requiredEquipment.every((reqName: string) => {
      const lowerReq = reqName.toLowerCase();
      if (kettleNames.includes(lowerReq)) return true;
      return ownedNames.includes(lowerReq);
    })
  );
  
  const otherMethods = methods.filter(m => 
    !m.requiredEquipment.every((reqName: string) => {
      const lowerReq = reqName.toLowerCase();
      if (kettleNames.includes(lowerReq)) return true;
      return ownedNames.includes(lowerReq);
    })
  );

  const methodPresets = presets.filter(p => p.method_id === selectedMethod?.id);

  const applyPreset = (p: BrewingPreset) => {
    setDose(p.coffee_dose);
    setWater(p.water_yield);
    setTemp(p.temperature);
    setGrind(p.grind_size);
    if (p.ratio) setRatio(p.ratio);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getMissingForMethod = (method: BrewingMethod) => {
    return method.requiredEquipment.filter(req => !ownedNames.includes(req.toLowerCase()));
  };

  const isV60 = selectedMethod?.displayName.toLowerCase().includes('v60');

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-6 pb-24 text-stone-900 dark:text-stone-100">
      <h1 className="text-3xl font-black mb-8 short:mb-4">{t.brewing}</h1>
      
      <div className="space-y-10 short:space-y-6">
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-4 px-2">{t.available_methods}</h2>
          <div className="bg-white dark:bg-stone-900 rounded-3xl overflow-hidden border border-stone-100 dark:border-stone-800 shadow-sm">
            {availableMethods.length > 0 ? availableMethods.map((method, idx) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method)}
                className={`w-full flex items-center justify-between p-5 short:p-4 text-left active:bg-stone-50 dark:active:bg-stone-800 transition-colors ${
                  idx !== availableMethods.length - 1 ? 'border-b border-stone-50 dark:border-stone-800' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                   <div className="bg-stone-700/10 p-2 rounded-lg">
                     <Coffee className="text-stone-700 dark:text-stone-300" size={20} />
                   </div>
                   <span className="font-bold dark:text-stone-200">{method.displayName}</span>
                </div>
                <ChevronRight size={18} className="text-stone-400" />
              </button>
            )) : (
              <div className="p-8 text-center space-y-6">
                <div className="bg-stone-50 dark:bg-stone-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                   <Wrench className="text-stone-300 dark:text-stone-600" size={32} />
                </div>
                <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">{t.unlock_methods}</p>
                <button 
                  onClick={() => router.push('/equipment')}
                  className="bg-stone-700 text-white px-8 py-3 rounded-full font-black text-sm shadow-lg active:scale-95 transition-all flex items-center space-x-2 mx-auto"
                >
                  <span>{t.go_to_equipment}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </section>

        {otherMethods.length > 0 && (
          <section>
            <button 
              onClick={() => setShowOther(!showOther)}
              className="w-full flex justify-between items-center mb-4 px-2 text-left group"
            >
              <h2 className="text-xs font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 group-hover:text-stone-700 transition-colors">{t.other_methods}</h2>
              <div className="text-stone-400 dark:text-stone-500 group-hover:text-stone-700 transition-colors">
                {showOther ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>
            {showOther && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                {otherMethods.map((method) => {
                  const missing = getMissingForMethod(method);
                  return (
                    <div key={method.id} className="bg-white/50 dark:bg-stone-900/50 rounded-3xl p-5 border border-dashed border-stone-200 dark:border-stone-800 opacity-80">
                       <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                             <Coffee className="text-stone-400" size={18} />
                             <span className="font-bold dark:text-stone-300">{method.displayName}</span>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md border border-red-100 dark:border-red-900/30">{t.missing_equipment}</span>
                       </div>
                       
                       <div className="flex flex-wrap gap-2">
                          {missing.map(mName => {
                             const eqItem = equipment.find(e => e.internal_name.toLowerCase() === mName.toLowerCase());
                             return (
                               <button 
                                 key={mName}
                                 onClick={() => eqItem && router.push(`/equipment?item=${eqItem.slug}`)}
                                 className="bg-stone-100 dark:bg-stone-800 hover:bg-stone-700 hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center space-x-2"
                               >
                                 <ShoppingCart size={10} />
                                 <span>{t[mName as keyof typeof t] || mName}</span>
                               </button>
                             );
                          })}
                       </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <section>
          <h2 className="text-xs font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-4 px-2">{t.my_presets}</h2>
          <div className="space-y-3">
             {presets.length > 0 ? presets.map(p => (
               <button 
                 key={p.id}
                 onClick={() => {
                   const method = methods.find(m => m.id === p.method_id);
                   if (method) {
                     setSelectedMethod(method);
                     applyPreset(p);
                   }
                 }}
                 className="w-full bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm flex justify-between items-center group"
               >
                 <div className="text-left">
                   <p className="font-bold dark:text-stone-200">{p.name}</p>
                   <div className="flex flex-wrap items-center gap-2 mt-1">
                     <p className="text-[10px] font-black uppercase tracking-widest text-stone-600">
                        {p.coffee_dose}g / {p.water_yield}ml • {t.ratio}: 1:{p.ratio?.toFixed(1) || (p.water_yield/p.coffee_dose).toFixed(1)}
                     </p>
                     <span className="text-[8px] font-bold bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-stone-500 uppercase tracking-tight">
                        {t.last_brewed}: 2d ago
                     </span>
                     <span className="text-[8px] font-bold bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded text-green-600 uppercase tracking-tight">
                        {t.efficiency_score}: 94%
                     </span>
                   </div>
                 </div>
                 <ChevronRight size={18} className="text-stone-400 group-hover:text-stone-700 transition-colors" />
               </button>
             )) : (
               <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 text-center border border-stone-100 dark:border-stone-800 shadow-sm">
                 <Star className="mx-auto text-stone-300 dark:text-stone-700 mb-4" size={40} />
                 <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">{t.no_presets}</p>
               </div>
             )}
          </div>
        </section>
      </div>

      {selectedMethod && (
        <div className="fixed inset-0 bg-stone-950 z-[60] flex flex-col overflow-y-auto">
          <header className="p-6 short:px-6 short:py-3 flex items-center justify-between sticky top-0 bg-stone-950/80 backdrop-blur-md z-10">
             <button onClick={() => setSelectedMethod(null)} className="text-stone-400 hover:text-white text-sm font-black uppercase tracking-widest transition-colors">{t.close}</button>
             <h3 className="font-black text-xl short:text-lg text-white">{t.brewing} {selectedMethod.displayName}</h3>
             <button onClick={() => setShowSaveDialog(true)} className="bg-stone-900 p-2 rounded-full text-stone-400 hover:text-stone-700 transition-colors"><Save size={20} /></button>
          </header>
          
          <main className="flex-1 p-8 short:p-6 space-y-12 short:space-y-6 max-w-md mx-auto w-full">
            <div className="space-y-4 short:space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h4 className="text-3xl short:text-2xl font-black text-white">{t.perfect_cup}</h4>
                {isV60 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full flex items-center space-x-1 animate-in fade-in zoom-in duration-500">
                    <Star size={10} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500">
                      {t.recipe_source}: James Hoffmann
                    </span>
                  </div>
                )}
              </div>
              <p className="text-stone-300 short:text-sm leading-relaxed font-medium">{selectedMethod.description}</p>

              {isV60 && (
                <button 
                  onClick={() => window.open('https://www.youtube.com/watch?v=aqyq43r62Xg', '_blank')}
                  className="flex items-center space-x-2 text-stone-400 hover:text-white transition-all group active:scale-95"
                >
                  <div className="bg-white/10 p-2 rounded-xl group-hover:bg-red-500/20 transition-colors">
                    <Play size={16} className="text-red-500" fill="currentColor" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.watch_tutorial}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className={`p-5 short:p-4 rounded-3xl short:rounded-2xl border transition-all space-y-4 short:space-y-2 relative group ${lockedParam === 'coffee' ? 'bg-stone-700/10 border-stone-700/30 ring-1 ring-stone-700/20 shadow-lg' : 'bg-stone-900 border-stone-800 shadow-sm'}`}>
                  <button 
                    onClick={() => setLockedParam(lockedParam === 'coffee' ? 'ratio' : 'coffee')}
                    className={`absolute top-3 right-3 transition-all p-2 rounded-xl z-10 ${lockedParam === 'coffee' ? 'text-stone-700 bg-stone-700/20 ring-1 ring-stone-700/30 shadow-inner' : 'text-stone-600 hover:text-stone-400 bg-stone-950/50 hover:bg-stone-950'}`}
                    title={lockedParam === 'coffee' ? t.unlock_param : t.lock_param}
                  >
                    {lockedParam === 'coffee' ? <Lock size={16} /> : <LockOpen size={16} />}
                  </button>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-stone-500">
                      <Scale size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{t.shisha}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <button onClick={() => handleDoseChange(dose - 0.5)} className="text-stone-500 hover:text-stone-700 transition-colors p-1"><ChevronDown size={24} /></button>
                    <div className="flex flex-col items-center">
                      <div className="flex items-end space-x-1">
                        <input type="number" value={dose} onChange={e => handleDoseChange(parseFloat(e.target.value))} className="bg-transparent text-3xl short:text-xl font-black text-white w-16 text-center outline-none focus:text-stone-700 transition-colors" />
                        <span className="text-stone-500 font-bold mb-1">g</span>
                      </div>
                      {lockedParam !== 'coffee' && (
                        <span className="text-[8px] font-black uppercase tracking-widest text-stone-700/40 animate-pulse">{t.recalculate_this}</span>
                      )}
                    </div>
                    <button onClick={() => handleDoseChange(dose + 0.5)} className="text-stone-500 hover:text-stone-700 transition-colors p-1"><ChevronUp size={24} /></button>
                  </div>
               </div>
               <div className={`p-5 short:p-4 rounded-3xl short:rounded-2xl border transition-all space-y-4 short:space-y-2 relative group ${lockedParam === 'water' ? 'bg-stone-700/10 border-stone-700/30 ring-1 ring-stone-700/20 shadow-lg' : 'bg-stone-900 border-stone-800 shadow-sm'}`}>
                  <button 
                    onClick={() => setLockedParam(lockedParam === 'water' ? 'ratio' : 'water')}
                    className={`absolute top-3 right-3 transition-all p-2 rounded-xl z-10 ${lockedParam === 'water' ? 'text-stone-700 bg-stone-700/20 ring-1 ring-stone-700/30 shadow-inner' : 'text-stone-600 hover:text-stone-400 bg-stone-950/50 hover:bg-stone-950'}`}
                    title={lockedParam === 'water' ? t.unlock_param : t.lock_param}
                  >
                    {lockedParam === 'water' ? <Lock size={16} /> : <LockOpen size={16} />}
                  </button>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-stone-500">
                      <Droplets size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{t.water}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <button onClick={() => handleWaterChange(water - 10)} className="text-stone-500 hover:text-stone-700 transition-colors p-1"><ChevronDown size={24} /></button>
                    <div className="flex flex-col items-center">
                      <div className="flex items-end space-x-1">
                        <input type="number" value={water} onChange={e => handleWaterChange(parseFloat(e.target.value))} className="bg-transparent text-3xl short:text-xl font-black text-white w-20 text-center outline-none focus:text-stone-700 transition-colors" />
                        <span className="text-stone-500 font-bold mb-1">ml</span>
                      </div>
                      {lockedParam !== 'water' && (
                        <span className="text-[8px] font-black uppercase tracking-widest text-stone-700/40 animate-pulse">{t.recalculate_this}</span>
                      )}
                    </div>
                    <button onClick={() => handleWaterChange(water + 10)} className="text-stone-500 hover:text-stone-700 transition-colors p-1"><ChevronUp size={24} /></button>
                  </div>
               </div>
               <div className="bg-stone-900 p-5 short:p-4 rounded-3xl short:rounded-2xl border border-stone-800 space-y-2 short:space-y-1 relative">
                  <div className="flex items-center space-x-2 text-stone-500">
                    <Thermometer size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t.temp}</span>
                  </div>
                  <div className="flex items-end space-x-1">
                    <input type="number" value={temp} onChange={e => setTemp(parseFloat(e.target.value))} className="bg-transparent text-2xl short:text-xl font-black text-white w-16 outline-none focus:text-stone-700 transition-colors" />
                    <span className="text-stone-500 font-bold mb-1">°C</span>
                  </div>
               </div>
               <div className="bg-stone-900 p-5 short:p-4 rounded-3xl short:rounded-2xl border border-stone-800 space-y-4 short:space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-stone-500">
                      <Wrench size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{t.grind_size}</span>
                      <button 
                        onClick={() => alert(`${t.grind_info_title}\n\n${t.grind_info_desc}`)}
                        className="text-stone-600 hover:text-stone-400 transition-colors"
                        title={t.grind_info_desc}
                      >
                        <Info size={12} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => {
                        const idx = GRIND_LEVELS.indexOf(grind);
                        if (idx > 0) setGrind(GRIND_LEVELS[idx - 1]);
                      }} 
                      className="text-stone-500 hover:text-stone-700 transition-colors"
                    ><ChevronDown size={20} /></button>
                    
                    <div className="text-center overflow-hidden">
                      <p className="text-sm font-black text-white leading-none truncate">{t[`grind_${grind.toLowerCase().replace('-', '_')}` as keyof typeof t] || grind}</p>
                      <p className="text-[7px] font-black uppercase tracking-tighter text-stone-700 mt-1 truncate">
                        {t[GRIND_VISUALS[grind] as keyof typeof t]}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => {
                        const idx = GRIND_LEVELS.indexOf(grind);
                        if (idx < GRIND_LEVELS.length - 1) setGrind(GRIND_LEVELS[idx + 1]);
                      }} 
                      className="text-stone-500 hover:text-stone-700 transition-colors"
                    ><ChevronUp size={20} /></button>
                  </div>
               </div>
            </div>

            <div className={`p-6 short:p-4 rounded-3xl short:rounded-2xl border transition-all space-y-4 short:space-y-2 ${lockedParam === 'ratio' ? 'bg-stone-700/10 border-stone-700/30 ring-1 ring-stone-700/20 shadow-lg' : 'bg-stone-900 border-stone-800 shadow-sm'}`}>
               <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-stone-500">
                    <Timer size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t.ratio} {t.precision}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg short:text-base font-black text-white">{t.ratio}: 1:{ratio.toFixed(1)}</span>
                    <button 
                      onClick={() => setLockedParam(lockedParam === 'ratio' ? 'water' : 'ratio')}
                      className={`transition-all p-2 rounded-xl ${lockedParam === 'ratio' ? 'text-stone-700 bg-stone-700/20 ring-1 ring-stone-700/30 shadow-inner' : 'text-stone-600 hover:text-stone-400 bg-stone-950/50 hover:bg-stone-950'}`}
                      title={lockedParam === 'ratio' ? t.unlock_param : t.lock_param}
                    >
                      {lockedParam === 'ratio' ? <Lock size={16} /> : <LockOpen size={16} />}
                    </button>
                  </div>
               </div>
               <input 
                 type="range" 
                 min="10" 
                 max="20" 
                 step="0.1" 
                 value={ratio} 
                 onChange={(e) => handleRatioChange(parseFloat(e.target.value))}
                 className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-stone-700"
               />
               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-stone-600">
                  <span>1:10 ({t.strong})</span>
                  <span>1:20 ({t.light})</span>
               </div>
            </div>

            <div className="space-y-8 short:space-y-4">
               <h4 className="font-black uppercase tracking-widest text-xs text-stone-500">{t.steps}</h4>
               {currentMethodSteps.length > 0 ? currentMethodSteps.map((step, i) => (
                 <div key={i} className="flex space-x-5">
                    <span className="text-stone-500 font-black text-3xl short:text-2xl opacity-50 italic">{i+1}</span>
                    <p className="text-stone-100 short:text-sm font-bold leading-relaxed">
                      {getScaledInstruction(step.instruction, step, dose, water, currentMethodSteps)}
                    </p>
                 </div>
               )) : (
                  <p className="text-stone-500 italic">{t.no_steps}</p>
               )}
            </div>

            <button 
              onClick={() => { setTotalElapsed(0); setElapsedInStep(0); setCurrentStepIndex(0); setShowTimer(true); }}
              className="w-full bg-stone-700 text-white py-6 short:py-4 rounded-3xl short:rounded-2xl font-black shadow-2xl flex items-center justify-center space-x-3 active:scale-[0.98] transition-all sticky bottom-4"
            >
              <Timer size={24} strokeWidth={3} className="short:w-5 short:h-5" />
              <span className="text-lg short:text-base">{t.start_timer}</span>
            </button>
          </main>
        </div>
      )}

      {/* Timer Overlay */}
      {showTimer && selectedMethod && (
        <div className="fixed inset-0 bg-stone-950 z-[100] flex flex-col items-center justify-center p-8 short:p-4 text-center overflow-hidden">
           <button onClick={() => { setShowTimer(false); setTimerActive(false); }} className="absolute top-8 right-8 short:top-4 short:right-4 text-stone-500 hover:text-white transition-colors"><X size={32} className="short:w-6 short:h-6" /></button>
           
           {wakeLock && (
             <div className="absolute top-8 left-8 short:top-4 short:left-4 flex items-center space-x-2 text-stone-500 animate-pulse">
               <Sun size={16} className="short:w-3 short:h-3" />
               <span className="text-[10px] short:text-[8px] font-black uppercase tracking-widest">{t.screen_awake}</span>
             </div>
           )}

           <div className="mb-12 short:mb-6">
              <p className="text-stone-500 font-black uppercase tracking-[0.3em] text-sm short:text-xs mb-4 short:mb-2">{t.brewing} {selectedMethod.displayName}</p>
              <h2 className="text-7xl short:text-5xl font-black text-white tabular-nums tracking-tighter">{formatTime(totalElapsed)}</h2>
           </div>
           {currentStep ? (
             <div className="space-y-12 short:space-y-6 max-w-md animate-in fade-in zoom-in duration-500 w-full">
                <div className="space-y-4 short:space-y-2">
                   <p className="text-stone-500 font-bold uppercase tracking-widest text-xs short:text-[10px]">{t.step} {currentStepIndex + 1} {t.of} {currentMethodSteps.length}</p>
                   <h3 className="text-3xl short:text-xl font-black text-white leading-tight px-4">
                     {getScaledInstruction(currentStep.instruction, currentStep, dose, water, currentMethodSteps)}
                   </h3>
                   {currentStep.target_water && (
                     <div className="bg-stone-700/20 text-stone-400 py-2 px-4 rounded-full inline-block font-black text-sm short:text-xs border border-stone-700/30 animate-pulse">
                        {t.target}: {Math.round((currentStep.target_water / (currentMethodSteps[currentMethodSteps.length - 1].target_water || 250)) * water)}g
                     </div>
                   )}
                   
                   {currentMethodSteps[currentStepIndex + 1] && (
                     <div className="mt-4 short:mt-2 opacity-50 px-6">
                       <p className="text-[10px] short:text-[8px] font-black uppercase tracking-widest text-stone-500 mb-1">{t.next_step}</p>
                       <p className="text-sm short:text-xs font-bold text-stone-300 line-clamp-1">
                         {getScaledInstruction(currentMethodSteps[currentStepIndex + 1].instruction, currentMethodSteps[currentStepIndex + 1], dose, water, currentMethodSteps)}
                       </p>
                     </div>
                   )}
                </div>
                {currentStep.duration > 0 ? (
                  <div className="relative w-48 h-48 short:w-32 short:h-32 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 192 192">
                      <circle cx="96" cy="96" r="88" className="stroke-stone-900 fill-none" strokeWidth="12" />
                      <circle 
                        cx="96" 
                        cy="96" 
                        r="88" 
                        className="stroke-stone-600 fill-none transition-all duration-1000 ease-linear" 
                        strokeWidth="12" 
                        strokeDasharray={552} 
                        strokeDashoffset={552 - (elapsedInStep / currentStep.duration) * 552} 
                        style={{ filter: 'drop-shadow(0 0 8px rgba(186, 115, 61, 0.5))' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-4xl short:text-2xl font-black text-white tabular-nums">{currentStep.duration - elapsedInStep}</span>
                       <span className="text-[10px] short:text-[8px] font-bold uppercase text-stone-500">{t.seconds}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 short:space-y-3">
                    <div className="w-48 h-48 short:w-32 short:h-32 mx-auto flex flex-col items-center justify-center border-4 border-dashed border-stone-800 rounded-full bg-stone-900/30">
                       <span className="text-4xl short:text-2xl font-black text-white tabular-nums">{elapsedInStep}s</span>
                       <span className="text-[10px] short:text-[8px] font-bold uppercase text-stone-500">{t.seconds}</span>
                    </div>
                    <p className="text-stone-500 font-bold text-sm short:text-xs animate-pulse">{t.waiting_for_you}</p>
                  </div>
                )}
                <div className="flex items-center justify-center space-x-6 short:space-x-4">
                   <button 
                     onClick={() => { setTotalElapsed(0); setElapsedInStep(0); setCurrentStepIndex(0); setTimerActive(false); }} 
                     className="w-14 h-14 short:w-12 short:h-12 rounded-full bg-stone-900 text-stone-600 flex items-center justify-center border border-stone-800 active:scale-90 transition-all hover:text-stone-400"
                     title={t.reset}
                   >
                     <RotateCcw size={20} className="short:w-4 short:h-4" />
                   </button>
                   
                   <button 
                     onClick={() => setTimerActive(!timerActive)} 
                     className={`w-24 h-24 short:w-20 short:h-20 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 ${timerActive ? 'bg-stone-900 text-white border border-stone-800' : 'bg-stone-700 text-white'}`}
                   >
                     {timerActive ? <Pause size={40} className="short:w-8 short:h-8" fill="currentColor" /> : <Play size={40} className="ml-1 short:w-8 short:h-8" fill="currentColor" />}
                   </button>

                   <button 
                     onClick={handleNextStep} 
                     className={`w-14 h-14 short:w-12 short:h-12 rounded-full flex flex-col items-center justify-center transition-all active:scale-90 border ${currentStep.duration === 0 ? 'bg-stone-700 text-white border-stone-700 shadow-lg' : 'bg-stone-900 text-white border-stone-800'}`}
                   >
                     <ChevronRight size={24} className="short:w-5 short:h-5" />
                     <span className="text-[8px] short:text-[6px] font-black uppercase tracking-widest">{t.next}</span>
                   </button>
                </div>
             </div>
           ) : (
             <div className="space-y-8 short:space-y-4 animate-in fade-in duration-700">
                <div className="w-24 h-24 short:w-16 short:h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 short:mb-3"><Check className="text-green-500 short:w-8 short:h-8" size={48} strokeWidth={4} /></div>
                <h3 className="text-4xl short:text-2xl font-black text-white">{t.enjoy_shisha}</h3>
                <button onClick={() => { setShowTimer(false); setSelectedMethod(null); }} className="bg-stone-700 text-white px-12 short:px-8 py-5 short:py-3 rounded-3xl short:rounded-2xl font-black text-xl short:text-lg shadow-2xl">{t.back_to_journey}</button>
             </div>
           )}

           {/* Overall Progress Bar */}
           <div className="fixed bottom-0 left-0 w-full h-1 bg-stone-900 z-[110]">
              <div 
                className="h-full bg-stone-700 transition-all duration-1000 ease-linear"
                style={{ width: `${Math.min(100, (totalElapsed / Math.max(1, totalDuration)) * 100)}%` }}
              />
           </div>
        </div>
      )}
    </div>
  );
}
