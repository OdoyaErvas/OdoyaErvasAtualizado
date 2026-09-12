import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Music, Loader2 } from "lucide-react";

// Componente legado intencionalmente silencioso.
const SOUNDS = [
  { id: "chuva", label: "Chuva e Floresta", url: "https://assets.mixkit.co/active_storage/sfx/2418/2418-84.wav" }, // som loopable curto
  { id: "singing-bowl", label: "Tigela tibetana", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
];

export default function AmbientPlayer() {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(SOUNDS[trackIndex].url);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [trackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      setLoading(true);
      try {
        await audioRef.current.play();
        setPlaying(true);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Erro ao reproduzir som ambiente:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const nextTrack = () => {
    const nextIdx = (trackIndex + 1) % SOUNDS.length;
    setTrackIndex(nextIdx);
    setPlaying(false);
  };

  return (
    <div className="fixed bottom-24 left-5 z-40 flex items-center gap-2 rounded-full border border-plum-200 bg-white/90 p-1.5 shadow-lg shadow-plum-900/10 backdrop-blur transition-all duration-300 md:bottom-28">
      <button
        onClick={togglePlay}
        disabled={loading}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
          playing ? "bg-plum-700 text-cream-50" : "bg-plum-50 text-plum-700 hover:bg-plum-100"
        }`}
        title={playing ? "Pausar som ambiente" : "Ouvir som ambiente espiritual"}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : playing ? (
          <Volume2 size={14} className="animate-pulse" />
        ) : (
          <VolumeX size={14} />
        )}
      </button>

      {playing && (
        <div className="flex items-center gap-2 pr-3">
          <button
            onClick={nextTrack}
            className="flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-plum-700 hover:text-plum-900"
          >
            <Music size={11} /> {SOUNDS[trackIndex].label}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="h-1 w-12 cursor-pointer appearance-none rounded-full bg-plum-100 accent-plum-700"
            title="Volume"
          />
        </div>
      )}
    </div>
  );
}
