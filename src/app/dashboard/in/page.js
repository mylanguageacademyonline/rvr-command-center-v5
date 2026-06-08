'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InTransactionPage() {
  const router = useRouter();
  const [inventory, setInventory] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setInventory(data);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem || !amount) return;

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/engine/in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryId: selectedItem,
          amountToAdd: amount
        })
      });

      const result = await res.json();
      if (res.ok) {
        setMessage('Transaction Successful! Added ' + amount + ' to inventory.');
        setAmount('');
        setSelectedItem('');
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (err) {
      setMessage('Failed to process transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', marginTop: '2rem' }}>
      <h2 style={{ color: '#3b82f6', marginBottom: '1rem' }}>Log IN Transaction</h2>
      <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Receive goods and update inventory.</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <select 
          value={selectedItem} 
          onChange={(e) => setSelectedItem(e.target.value)}
          style={{ padding: '0.75rem', background: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '8px' }}
          required
        >
          <option value="" disabled>Select Item...</option>
          {inventory.map(item => (
            <option key={item._id} value={item._id}>
              {item.itemName || item.name} (Current: {item.currentStock})
            </option>
          ))}
        </select>
        
        <input 
          type="number" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount received"
          style={{ padding: '0.75rem', background: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '8px' }}
          required
          min="1"
        />

        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '1rem' }}
        >
          {loading ? 'Processing...' : 'Submit IN'}
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
