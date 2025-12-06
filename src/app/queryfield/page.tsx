
import React, { useState } from 'react';

const QueryByField = () => {
  const [filter, setFilter] = useState({ field: 'hall', value: '' });
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const q = query(collection( 'camp_registrations'), where(filter.field, '==', filter.value));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => doc.data());
    setResults(data);
  };

  return (
    <div className="p-4">
      <select onChange={(e) => setFilter({ ...filter, field: e.target.value })}>
        <option value="hall">Hall</option>
        <option value="floor">Floor</option>
        <option value="category">Category</option>
      </select>

      <input type="text" placeholder="Enter value" onChange={(e) => setFilter({ ...filter, value: e.target.value })} />
      <button onClick={handleSearch} className="bg-[#85C061] text-white px-4 py-2 rounded">Search</button>

      <ul className="mt-4">
        {results.map((user, idx) => (
          <li key={idx}>{user.firstName} - {user.hall}, {user.floor}, {user.category}</li>
        ))}
      </ul>
    </div>
  );
};

export default QueryByField;
