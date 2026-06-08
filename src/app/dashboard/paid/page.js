'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CameraCapture from '@/components/ui/CameraCapture';

export default function PaidTransactionPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState([]);
  const [vendorId, setVendorId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [receiptBase64, setReceiptBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/vendors')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setVendors(data);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !receiptBase64 || !vendorId) {
      setMessage('Error: Please enter an amount, select a vendor, and capture a receipt.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // 1. Upload Image to Google Drive
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image: receiptBase64 })
      });
      const uploadResult = await uploadRes.json();
      
      let receiptUrl = '';
      if (uploadRes.ok) {
        receiptUrl = uploadResult.url;
      } else {
        throw new Error(uploadResult.error || 'Failed to upload receipt');
      }

      // 2. Log PAID transaction with receiptUrl
      const txRes = await fetch('/api/engine/paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: vendorId,
          amountPaid: amount,
          paymentMode: paymentMode,
          details: notes,
          receiptUrl: receiptUrl
        })
      });

      const txResult = await txRes.json();
      if (txRes.ok) {
        setMessage('Transaction Successful! Expense logged.');
        setAmount('');
        setNotes('');
        setVendorId('');
        setReceiptBase64(null);
      } else {
        throw new Error(txResult.error);
      }
    } catch (err) {
      setMessage('Failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', marginTop: '2rem' }}>
      <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>Log PAID Transaction</h2>
      <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Log expenses to vendors and upload receipts.</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <select 
          value={vendorId} 
          onChange={(e) => setVendorId(e.target.value)}
          style={{ padding: '0.75rem', background: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '8px' }}
          required
        >
          <option value="" disabled>Select Vendor...</option>
          {vendors.map(v => (
            <option key={v._id} value={v._id}>
              {v.vendorName} (Balance: {v.balanceDue})
            </option>
          ))}
        </select>

        <input 
          type="number" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount Paid ($)"
          style={{ padding: '0.75rem', background: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '8px' }}
          required
          min="0.01"
          step="0.01"
        />

        <select 
          value={paymentMode} 
          onChange={(e) => setPaymentMode(e.target.value)}
          style={{ padding: '0.75rem', background: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '8px' }}
          required
        >
          <option value="Cash">Cash</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Card">Card</option>
        </select>

        <input 
          type="text" 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes"
          style={{ padding: '0.75rem', background: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '8px' }}
        />

        <div style={{ padding: '1rem', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
          <CameraCapture onCapture={(base64) => setReceiptBase64(base64)} />
        </div>

        <button 
          type="submit" 
          disabled={loading || !receiptBase64}
          style={{ padding: '1rem', background: receiptBase64 ? '#10b981' : '#334155', color: 'white', border: 'none', borderRadius: '8px', cursor: receiptBase64 ? 'pointer' : 'not-allowed', fontWeight: 'bold', marginTop: '1rem' }}
        >
          {loading ? 'Processing & Uploading...' : 'Submit Expense'}
        </button>

        <button 
          type="button" 
          onClick={() => router.push('/')}
          style={{ padding: '1rem', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer' }}
        >
          Back to Main
        </button>
      </form>

      {message && <p style={{ marginTop: '1rem', color: message.includes('Error') || message.includes('Failed') ? '#ef4444' : '#10b981' }}>{message}</p>}
    </div>
  );
}
