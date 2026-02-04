const DashboardCardState = ({ Icon, label, value, gradientFrom, gradientVia, borderColor, iconGradientFrom, iconGradientTo, onClick }) => {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component 
      onClick={onClick}
      className={`group relative bg-card-background dark:bg-card-background-dark border-2 ${borderColor} rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-opacity-100 ${onClick ? 'cursor-pointer w-full text-left' : ''}`}
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientVia} to-transparent opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        <div className={`w-14 h-14 bg-gradient-to-br ${iconGradientFrom} ${iconGradientTo} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <p className="text-sm font-semibold text-base dark:text-base-dark mb-2 uppercase tracking-wide">{label}</p>
        <p className="text-4xl font-bold text-text-primary dark:text-text-primary-dark">{value}</p>
      </div>

      {/* Decorative corner accent */}
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br ${iconGradientFrom} ${iconGradientTo} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
    </Component>
  );
};

export default DashboardCardState;
