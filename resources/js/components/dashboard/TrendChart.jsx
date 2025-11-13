import { Area, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

const TrendChart = ({ data = [] }) => {
  const sanitized = Array.isArray(data)
    ? data.map((item) => ({
        label: item.label,
        total: Number(item.total || 0),
        tickets: Number(item.tickets || 0),
      }))
    : [];

  return (
    <div className="glass-panel rounded-3xl p-4">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold">Performa 14 Hari Terakhir</h3>
      <span className="text-xs text-ebony/60">Pendapatan vs jumlah tiket</span>
    </div>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={sanitized}>
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4af37" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#d4af37" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            yAxisId="left"
            tickFormatter={(val) => `Rp ${(val / 1000).toFixed(0)}k`}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(val) => `${val} tkt`}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const revenue = payload.find((item) => item.dataKey === 'total');
              const tickets = payload.find((item) => item.dataKey === 'tickets');
              return (
                <div className="rounded-2xl bg-white px-4 py-3 text-xs shadow-lg">
                  <p className="font-semibold">{label}</p>
                  {revenue && <p>Pendapatan: Rp {Number(revenue.value).toLocaleString('id-ID')}</p>}
                  {tickets && <p>Tiket terjual: {tickets.value}</p>}
                </div>
              );
            }}
          />
          <Area yAxisId="left" type="monotone" dataKey="total" stroke="#d4af37" fill="url(#goldGradient)" strokeWidth={2} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="tickets"
            stroke="#6b46c1"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  </div>
  );
};

export default TrendChart;
