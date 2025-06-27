import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const mockData = [
  { month: 'Jan 2024', income: 50000, expenses: 30000, savings: 20000 },
  { month: 'Feb 2024', income: 52000, expenses: 32000, savings: 20000 },
  { month: 'Mar 2024', income: 51000, expenses: 31000, savings: 20000 },
  { month: 'Apr 2024', income: 53000, expenses: 34000, savings: 19000 },
  { month: 'May 2024', income: 54000, expenses: 35000, savings: 19000 },
  { month: 'Jun 2024', income: 55000, expenses: 36000, savings: 19000 },
];

const Charts = ({ monthlyData }) => {
  const data = (monthlyData && monthlyData.length > 0) ? monthlyData : mockData;

  return (
    <div style={{ width: '100%', maxWidth: 800, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: 24 }}>
      <h3 style={{ textAlign: 'center', marginBottom: 24 }}>Monthly Income, Expenses & Savings</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={v => `₹${v.toLocaleString('en-IN')}`} />
          <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`} />
          <Legend />
          <Line type="monotone" dataKey="income" stroke="#388e3c" strokeWidth={3} dot={{ r: 4 }} name="Income" />
          <Line type="monotone" dataKey="expenses" stroke="#f44336" strokeWidth={3} dot={{ r: 4 }} name="Expenses" />
          {data.some(d => d.savings !== undefined) && (
            <Line type="monotone" dataKey="savings" stroke="#007bff" strokeWidth={3} dot={{ r: 4 }} name="Savings" />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Charts; 