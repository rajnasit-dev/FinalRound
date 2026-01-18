const CardStat = ({ Icon, iconColor, bgColor, label, value }) => {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center`}>
        <Icon className={`${iconColor} w-5 h-5`} />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {value}
        </p>
      </div>
    </div>
  );
};

export default CardStat;
