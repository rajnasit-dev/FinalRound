const IconCard = ({ Icon, iconBgColor, iconColor, children }) => {
  return (
    <div className="flex items-start gap-4 p-4 bg-primary dark:bg-primary-dark rounded-lg border border-base-dark dark:border-base hover:border-secondary dark:hover:border-secondary-dark transition-colors">
      <div className={`p-2 rounded-lg ${iconBgColor} ${iconColor}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default IconCard;
