const Table = ({ columns, data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-base-dark dark:bg-base">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-4 text-left text-sm font-semibold text-text-primary dark:text-text-primary-dark"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-base-dark dark:divide-base">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-base-dark dark:hover:bg-base transition-colors"
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="px-6 py-4 text-sm text-text-primary dark:text-text-primary-dark"
                >
                  {column.Cell ? column.Cell({ row, value: row[column.accessor] }) : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
