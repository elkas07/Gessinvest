import React, { useState, useMemo, useEffect } from 'react';

interface Column<T> {
  header: string;
  render: (item: T) => React.ReactNode;
  sortKey?: keyof T;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  maxHeight?: string;
  searchPlaceholder?: string;
  initialPageSize?: number;
}

const DataTable = <T extends Record<string, any>>({ 
  data, 
  columns, 
  title, 
  maxHeight = '750px',
  searchPlaceholder = "Rechercher un dossier...",
  initialPageSize = 10
}: DataTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(item => 
        Object.values(item).some(val => String(val).toLowerCase().includes(lowerSearch))
      );
    }
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [data, searchTerm, sortConfig]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(start, start + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

  return (
    <div className="bg-white rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border-4 border-slate-50 overflow-hidden flex flex-col h-full transition-all">
      <div className="p-16 border-b-4 border-slate-50 bg-white z-20 space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          {title && (
            <div>
              <h3 className="font-black text-slate-800 tracking-tighter text-4xl uppercase italic underline decoration-[#ff6b35] decoration-8 underline-offset-[16px]">{title}</h3>
              <p className="text-base text-slate-400 font-black uppercase tracking-[0.4em] mt-6">{filteredAndSortedData.length} résultats identifiés</p>
            </div>
          )}
          <div className="relative flex-1 max-w-xl">
            <span className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none text-slate-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-20 pr-8 py-7 bg-slate-50 border-4 border-slate-100 rounded-[2rem] text-2xl focus:outline-none focus:ring-[20px] focus:ring-[#ff6b35]/5 focus:border-[#ff6b35] transition-all font-black italic shadow-inner"
            />
          </div>
        </div>
      </div>

      <div className="overflow-auto custom-scrollbar flex-1" style={{ maxHeight }}>
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-3xl border-b-4 border-slate-100">
            <tr>
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`p-10 text-base font-black text-slate-400 uppercase tracking-[0.4em] ${col.sortKey ? 'cursor-pointer hover:text-[#ff6b35] transition-colors' : ''}`}
                  onClick={() => col.sortKey && handleSort(col.sortKey)}
                >
                  <div className="flex items-center gap-4">
                    {col.header}
                    {col.sortKey && (
                      <span className="text-slate-300 text-2xl">
                        {sortConfig?.key === col.sortKey ? (
                          sortConfig.direction === 'asc' ? '↑' : '↓'
                        ) : '⇅'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y-4 divide-slate-50">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-56 text-center text-slate-400 font-black text-3xl italic uppercase tracking-[0.3em]">
                  Aucun dossier trouvé
                </td>
              </tr>
            ) : (
              paginatedData.map((item, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-50/80 transition-all group">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="p-10 text-xl font-black text-slate-800 whitespace-nowrap italic">
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && (
        <div className="px-16 py-10 bg-slate-50 border-t-4 border-slate-100 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-12">
            <span className="text-base font-black text-slate-400 uppercase tracking-[0.4em]">Vue:</span>
            <select 
              value={pageSize} 
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-white border-4 border-slate-200 rounded-2xl px-10 py-4 text-base font-black outline-none focus:border-[#ff6b35] shadow-xl"
            >
              {[5, 10, 25, 50].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-20 h-20 rounded-2xl border-4 border-slate-200 bg-white disabled:opacity-30 font-black text-3xl hover:border-[#ff6b35] transition-all shadow-xl"
            >
              ←
            </button>
            <span className="text-xl font-black uppercase tracking-[0.2em] text-slate-500 mx-8 italic">Page {currentPage} / {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-20 h-20 rounded-2xl border-4 border-slate-200 bg-white disabled:opacity-30 font-black text-3xl hover:border-[#ff6b35] transition-all shadow-xl"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;