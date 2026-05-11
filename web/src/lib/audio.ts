'use client';

export const playChime = () => {
  if (typeof window === 'undefined') return;
  
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
  oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5); // A4

  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.5);
};

export const playDoubleBeep = () => {
  if (typeof window === 'undefined') return;
  
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const beep = (time: number) => {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1046.50, time); // C6
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.1, time + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    oscillator.start(time);
    oscillator.stop(time + 0.2);
  };

  beep(audioCtx.currentTime);
  beep(audioCtx.currentTime + 0.25);
};
