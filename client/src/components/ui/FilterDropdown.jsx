const FilterDropdown = ({ value, onChange, options}) => {
  return (
    <div className="w-full md:w-48">
      <select
        value={value}
        onChange={onChange}
        className="w-full h-full px-4 py-3 bg-card-background dark:bg-card-background-dark border border-base-dark dark:border-base rounded-lg dark:focus:border-base-dark/50 focus:border-base/50 focus:outline-none cursor-pointer"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterDropdown;
