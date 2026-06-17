// PC통신 다이얼업 접속음을 Web Audio API로 합성한다. (DTMF 다이얼 → answer carrier → 핸드셰이크 노이즈)
type Win = Window & { webkitAudioContext?: typeof AudioContext };

/** 단순 톤(오실레이터 + 게인 감쇠) 한 번. */
function tone(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType,
  peak: number,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(peak, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(start);
  osc.stop(start + dur);
}

/** 화이트노이즈 버퍼 생성. */
function whiteNoiseBuffer(ctx: AudioContext, seconds: number) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/** 모뎀 다이얼업 접속음을 재생한다. */
export function playModemSound() {
  const AudioCtor = window.AudioContext || (window as Win).webkitAudioContext;
  if (!AudioCtor) return;
  const ctx = new AudioCtor();

  const t0 = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = 0.18;
  master.connect(ctx.destination);

  // 1) DTMF 다이얼음: 듀얼톤 3개를 짧게 (전화 거는 소리)
  const dtmfPairs: [number, number][] = [
    [697, 1209],
    [770, 1336],
    [852, 1477],
  ];
  dtmfPairs.forEach((pair, i) => {
    const start = t0 + i * 0.16;
    pair.forEach((freq) => tone(ctx, master, freq, start, 0.13, 'sine', 0.3));
  });

  // 2) Answer carrier: 2100Hz 순음
  const carrierStart = t0 + 0.6;
  tone(ctx, master, 2100, carrierStart, 0.45, 'sine', 0.25);

  // 3) 핸드셰이크: 밴드패스 화이트노이즈 + 스윕 톤 ("쉬이익~")
  const hsStart = t0 + 1.05;
  const hsDur = 1.2;

  const noise = ctx.createBufferSource();
  noise.buffer = whiteNoiseBuffer(ctx, hsDur);
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 1800;
  bandpass.Q.value = 0.6;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.0001, hsStart);
  noiseGain.gain.linearRampToValueAtTime(0.13, hsStart + 0.1);
  noiseGain.gain.linearRampToValueAtTime(0.0001, hsStart + hsDur);
  noise.connect(bandpass);
  bandpass.connect(noiseGain);
  noiseGain.connect(master);
  noise.start(hsStart);
  noise.stop(hsStart + hsDur);

  [1800, 2400].forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, hsStart);
    osc.frequency.linearRampToValueAtTime(freq * 1.08, hsStart + hsDur);
    gain.gain.setValueAtTime(0.05, hsStart);
    gain.gain.exponentialRampToValueAtTime(0.0001, hsStart + hsDur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(hsStart);
    osc.stop(hsStart + hsDur);
  });

  // 재생 종료 후 컨텍스트 해제
  window.setTimeout(() => {
    void ctx.close();
  }, (hsStart - t0 + hsDur + 0.2) * 1000);
}
