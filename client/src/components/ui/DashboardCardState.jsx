const DashboardCardState = ({ Icon, label, value, gradientFrom, gradientVia, borderColor, iconGradientFrom, iconGradientTo }) => {
  return (
    <div className={`relative bg-linear-to-br ${gradientFrom} ${gradientVia} to-transparent border ${borderColor} rounded-2xl p-6 overflow-hidden`}>
      <div className="relative z-10">
        <div className={`w-12 h-12 bg-linear-to-br ${iconGradientFrom} ${iconGradientTo} rounded-xl flex items-center justify-center mb-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <p className="text-sm font-medium text-base dark:text-base-dark mb-1">{label}</p>
        <p className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">{value}</p>
      </div>
    </div>
  );
};

export default DashboardCardState;
