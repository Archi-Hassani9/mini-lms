import React from 'react';
import Spinner from './Spinner';

const DataTable = ({ columns, data, loading, emptyMessage = "No data available" }) => {
  if (loading) {
    return <div className="p-5 text-center"><Spinner /></div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-5 glass-card">
        <p className="text-secondary mb-0">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="table-responsive table-custom">
      <table className="table table-borderless m-0">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => (
                <td key={colIndex}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
