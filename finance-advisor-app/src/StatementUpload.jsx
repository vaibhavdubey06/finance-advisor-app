import React, { useState } from 'react';
import Papa from 'papaparse';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from './AuthProvider';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const StatementUpload = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [type, setType] = useState('bank'); // 'bank' or 'portfolio'

  const handleFileChange = (e) => {
    setError('');
    const f = e.target.files[0];
    if (!f) return;
    if (f.type !== 'text/csv' && !f.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError('File size exceeds 5MB limit.');
      return;
    }
    setFile(f);
    setLoading(true);
    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setLoading(false);
        if (results.errors.length) {
          setError('Failed to parse CSV. Please check your file.');
          return;
        }
        setHeaders(Object.keys(results.data[0] || {}));
        setPreview(results.data.slice(0, 5));
        setStep(2);
      },
      error: () => {
        setLoading(false);
        setError('Failed to parse CSV.');
      },
    });
  };

  const handleConfirm = async () => {
    if (!user) {
      setError('You must be logged in to upload statements.');
      console.log('Upload failed: user not logged in');
      return;
    }
    setLoading(true);
    try {
      console.log('Parsing file:', file);
      const parsedData = await new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length) {
              console.log('PapaParse errors:', results.errors);
              reject(results.errors);
            } else {
              console.log('PapaParse data:', results.data);
              resolve(results.data);
            }
          },
          error: (err) => {
            console.log('PapaParse error:', err);
            reject(err);
          },
        });
      });
      let relevantData = [];
      if (type === 'bank') {
        relevantData = parsedData.map(row => {
          // Remove commas and parse as float
          const deposits = row.Deposits ? parseFloat(row.Deposits.replace(/,/g, '')) : 0;
          const withdrawals = row.Withdrawals ? parseFloat(row.Withdrawals.replace(/,/g, '')) : 0;
          let amount;
          if (deposits && deposits !== 0) amount = deposits;
          else if (withdrawals && withdrawals !== 0) amount = -withdrawals;
          else if (row.Amount) amount = parseFloat(row.Amount.replace(/,/g, ''));
          else if (row.amount) amount = parseFloat(row.amount.replace(/,/g, ''));
          else if (row['Debit/Credit']) amount = parseFloat(row['Debit/Credit'].replace(/,/g, ''));
          else amount = undefined;
          return {
            date: row.Date || row.date,
            description: row.Description || row.description,
            amount,
            balance: row.Balance || row.balance,
          };
        }).filter(item => item.amount !== undefined);
      } else {
        relevantData = parsedData.map(row => ({
          name: row['Stock/Mutual Fund Name'] || row.Name || row.name,
          quantity: row.Quantity || row.quantity,
          avgPrice: row['Average Price'] || row['Avg Price'] || row.avgPrice,
          currentValue: row['Current Value'] || row.currentValue,
        }));
      }
      console.log('Relevant data to upload:', relevantData);
      const col = collection(db, type === 'bank' ? 'transactions' : 'holdings', user.uid, 'items');
      for (const item of relevantData) {
        console.log('Uploading item:', item);
        await addDoc(col, item);
      }
      setStep(3);
      console.log('Upload successful!');
    } catch (err) {
      setError('Failed to upload data. Please try again.');
      console.log('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview([]);
    setHeaders([]);
    setError('');
    setStep(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-teal-700">Upload Statement</h2>
      <div className="mb-4 flex gap-4">
        <button
          className={`py-2 px-4 rounded font-semibold transition-all duration-150
            ${type === 'bank'
              ? 'bg-teal-500 text-white shadow-lg ring-2 ring-teal-300 scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setType('bank')}
        >
          Bank Statement
        </button>
        <button
          className={`py-2 px-4 rounded font-semibold transition-all duration-150
            ${type === 'portfolio'
              ? 'bg-teal-500 text-white shadow-lg ring-2 ring-teal-300 scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setType('portfolio')}
        >
          Portfolio Report
        </button>
      </div>
      {step === 1 && (
        <div>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="mb-4"
          />
          {loading && <div className="text-teal-600">Parsing file...</div>}
        </div>
      )}
      {step === 2 && (
        <div>
          <div className="mb-2 font-semibold">Preview (first 5 rows):</div>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full text-sm border">
              <thead>
                <tr>
                  {headers.map(h => <th key={h} className="border px-2 py-1 bg-gray-100">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i}>
                    {headers.map(h => <td key={h} className="border px-2 py-1">{row[h]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className="bg-teal-600 text-white px-6 py-2 rounded shadow hover:bg-teal-700 mr-2"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Confirm & Save'}
          </button>
          <button
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            onClick={reset}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      )}
      {step === 3 && (
        <div className="text-green-600 font-semibold mb-2">Upload successful!</div>
      )}
      {error && <div className="text-red-600 mt-2 font-medium">{error}</div>}
    </div>
  );
};

export default StatementUpload; 