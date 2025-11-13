import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Clock, CloudSun, Droplet, QrCode, RotateCcw, Sunrise, Sunset } from 'lucide-react';
import clsx from 'clsx';
import { useWeather } from '../../hooks/useWeather';

const statusColors = {
  paid: 'bg-green-100 text-green-700 dark:bg-green-600/20 dark:text-green-200',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600/30 dark:text-yellow-100',
  awaiting_payment: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600/30 dark:text-yellow-100',
  expired: 'bg-red-100 text-red-700 dark:bg-red-600/20 dark:text-red-200',
};

const formatCountdown = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = String(Math.floor(total / 60)).padStart(2, '0');
  const seconds = String(total % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const formatTime = (value) => (value ? value.slice(0, 5) : '-');
const formatTemp = (value) => (typeof value === 'number' ? `${Math.round(value)}\u00B0C` : '-');
const formatPercent = (value) => (typeof value === 'number' ? `${Math.round(value)}%` : '-');
const formatHourFromISO = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const TicketCard = ({ order, onShowQr, onContinuePayment }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [weatherOpen, setWeatherOpen] = useState(false);
  const canViewTicket = order.status === 'paid';

  const { data: weatherData, isFetching: weatherLoading, isError: weatherError } = useWeather(
    order.visit_date,
    weatherOpen && canViewTicket
  );

  const weatherSummary = useMemo(() => {
    if (!weatherData) return null;
    const daily = weatherData.daily || {};
    const hourly = weatherData.hourly || {};
    const idx = 0;

    const targetTime = order.start_time?.slice(0, 5);
    const hourlyTimes = hourly.time || [];
    const hourlyIndex = targetTime ? hourlyTimes.findIndex((time) => time.includes(`${targetTime}`)) : -1;
    const pointer = hourlyIndex >= 0 ? hourlyIndex : 0;

    return {
      maxTemp: daily.temperature_2m_max?.[idx],
      rainChance: daily.precipitation_probability_max?.[idx],
      sunrise: daily.sunrise?.[idx],
      sunset: daily.sunset?.[idx],
      uvIndex: daily.uv_index_max?.[idx],
      slotTemp: hourly.temperature_2m?.[pointer],
      slotRain: hourly.precipitation_probability?.[pointer],
      slotCloud: hourly.cloud_cover?.[pointer],
    };
  }, [weatherData, order.start_time]);

  useEffect(() => {
    if (!order.expires_at || order.status !== 'awaiting_payment') {
      setTimeLeft(null);
      return undefined;
    }

    const update = () => {
      const diff = new Date(order.expires_at).getTime() - Date.now();
      setTimeLeft(diff > 0 ? diff : 0);
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [order.expires_at, order.status]);

  const canContinue = order.status === 'awaiting_payment' && (timeLeft === null || timeLeft > 0);

  return (
    <motion.div layout className="glass-panel rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ebony/60 dark:text-cream/70">{order.ticket_name}</p>
          <h3 className="text-xl font-semibold">{order.order_code}</h3>
        </div>
        <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold', statusColors[order.status] || 'bg-gray-100 text-gray-600')}>
          {order.status.replace('_', ' ')}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-ebony/70 dark:text-cream/70">
        <span className="flex items-center gap-2"><Calendar size={16} /> {order.visit_date}</span>
        <span className="flex items-center gap-2"><Clock size={16} /> {formatTime(order.start_time)} - {formatTime(order.end_time)}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-semibold text-gold">Rp {Number(order.amount).toLocaleString('id-ID')}</span>
        {canViewTicket && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onShowQr?.(order)}
              className="inline-flex items-center gap-2 rounded-full border border-gold px-4 py-2 text-xs font-semibold text-gold"
            >
              <QrCode size={16} /> Lihat Tiket
            </button>
            <button
              onClick={() => setWeatherOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full border border-cream/70 px-4 py-2 text-xs font-semibold text-ebony hover:bg-cream/40 dark:text-cream"
            >
              <CloudSun size={16} /> Detail Cuaca
            </button>
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {weatherOpen && canViewTicket && (
          <motion.div
            key="weather-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mt-4 overflow-hidden rounded-2xl border border-cream/60 bg-white/70 p-4 text-xs shadow-inner dark:border-white/10 dark:bg-white/5"
          >
            {weatherLoading && <p className="text-ebony/60 dark:text-cream/60">Sedang mengambil data cuaca...</p>}
            {weatherError && <p className="text-red-600">Tidak dapat memuat cuaca untuk slot ini.</p>}
            {!weatherLoading && !weatherError && weatherSummary && (
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-ebony/60 dark:text-cream/60">Suhu Slot</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                    <CloudSun size={14} /> {formatTemp(weatherSummary.slotTemp)}
                  </p>
                  <p className="text-[11px] text-ebony/60 dark:text-cream/60">Maks harian {formatTemp(weatherSummary.maxTemp)}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-ebony/60 dark:text-cream/60">Peluang Hujan</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                    <Droplet size={14} /> {formatPercent(weatherSummary.slotRain ?? weatherSummary.rainChance)}
                  </p>
                  <p className="text-[11px] text-ebony/60 dark:text-cream/60">Tutupan awan {formatPercent(weatherSummary.slotCloud)}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-ebony/60 dark:text-cream/60">Sunrise</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                    <Sunrise size={14} /> {formatHourFromISO(weatherSummary.sunrise)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-ebony/60 dark:text-cream/60">Sunset</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                    <Sunset size={14} /> {formatHourFromISO(weatherSummary.sunset)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-ebony/60 dark:text-cream/60">UV Index</p>
                  <p className="mt-1 text-sm font-semibold">{weatherSummary.uvIndex ?? '-'}</p>
                  <p className="text-[11px] text-ebony/60 dark:text-cream/60">Siapkan sunblock & selendang tipis</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {order.status === 'awaiting_payment' && (
        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <span>
            Sisa waktu pembayaran: <strong>{timeLeft !== null ? formatCountdown(timeLeft) : '-'}</strong>
          </span>
          <button
            onClick={() => canContinue && onContinuePayment?.(order)}
            disabled={!canContinue}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-4 py-2 text-xs font-semibold text-ebony disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RotateCcw size={14} /> Lanjutkan Pembayaran
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default TicketCard;