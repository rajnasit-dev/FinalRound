const Container = ({ children, className = "" }) => {
  return (
    <div className={`bg-card-background dark:bg-card-background-dark rounded-xl p-6 border border-base-dark dark:border-base ${className}`}>
      {children}
    </div>
  );
};

export default Container;
