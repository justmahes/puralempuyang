import { motion } from 'framer-motion';

const MetricCard = ({ title, value, subtitle, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-panel rounded-3xl p-5"
  >
    <div className="flex items-center justify-between">
      <p className="text-sm text-ebony/60 dark:text-cream/70">{title}</p>
      {Icon && <Icon className="text-gold" size={20} />}
    </div>
    <p className="mt-3 text-2xl font-semibold text-ebony dark:text-cream">{value}</p>
    {subtitle && <p className="text-xs text-ebony/50 dark:text-cream/60">{subtitle}</p>}
  </motion.div>
);

export default MetricCard;
