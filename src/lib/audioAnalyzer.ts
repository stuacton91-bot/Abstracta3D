export class AudioAnalyzer {
  private static instance: AudioAnalyzer;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): AudioAnalyzer {
    if (!AudioAnalyzer.instance) {
      AudioAnalyzer.instance = new AudioAnalyzer();
    }
    return AudioAnalyzer.instance;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);
      
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.isInitialized = true;
    } catch (err) {
      console.error("Microphone access denied or not available.", err);
    }
  }

  getAudioData() {
    if (!this.isInitialized || !this.analyser || !this.dataArray) {
      return { bass: 0, mid: 0, treble: 0 };
    }

    this.analyser.getByteFrequencyData(this.dataArray as any);
    
    const bufferLength = this.analyser.frequencyBinCount;
    
    // Split the frequencies into bass, mid, treble
    let bassSum = 0;
    let midSum = 0;
    let trebleSum = 0;

    const third = Math.floor(bufferLength / 3);

    for (let i = 0; i < bufferLength; i++) {
      const val = this.dataArray[i] / 255; // Normalize 0 to 1
      if (i < third) bassSum += val;
      else if (i < third * 2) midSum += val;
      else trebleSum += val;
    }

    return {
      bass: bassSum / third,
      mid: midSum / third,
      treble: trebleSum / (bufferLength - third * 2)
    };
  }

  getIsInitialized() {
    return this.isInitialized;
  }
}

export const audioAnalyzer = AudioAnalyzer.getInstance();
