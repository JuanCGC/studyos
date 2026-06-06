export default function HttpCheatSheetSidebar({ isOpen, onClose }) {
  const methods = [
    { verb: 'GET', color: 'bg-emerald-500/15 text-emerald-400', safe: true, idempotent: true, desc: 'Retrieve a resource. No side effects.' },
    { verb: 'POST', color: 'bg-sky-500/15 text-sky-400', safe: false, idempotent: false, desc: 'Create a new resource. Server assigns ID.' },
    { verb: 'PUT', color: 'bg-amber-500/15 text-amber-400', safe: false, idempotent: true, desc: 'Full replacement. Same payload = same result.' },
    { verb: 'PATCH', color: 'bg-orange-500/15 text-orange-400', safe: false, idempotent: false, desc: 'Partial update of an existing resource.' },
    { verb: 'DELETE', color: 'bg-rose-500/15 text-rose-400', safe: false, idempotent: true, desc: 'Remove a resource. Repeated calls return 404.' },
  ];

  const statusGroups = [
    {
      group: '2xx Success',
      codes: [
        { code: '200', label: 'OK', desc: 'Request succeeded. Body has the resource.' },
        { code: '201', label: 'Created', desc: 'Resource built. Check Location header for URL.' },
        { code: '204', label: 'No Content', desc: 'Success but no body (DELETE/PUT often).' },
      ],
    },
    {
      group: '4xx Client Error',
      codes: [
        { code: '400', label: 'Bad Request', desc: 'Malformed JSON or invalid params.' },
        { code: '401', label: 'Unauthorized', desc: 'Missing or invalid auth credentials.' },
        { code: '403', label: 'Forbidden', desc: 'Authenticated but not allowed.' },
        { code: '404', label: 'Not Found', desc: 'Resource does not exist at that URL.' },
        { code: '405', label: 'Method Not Allowed', desc: 'Verb not supported for this endpoint.' },
        { code: '409', label: 'Conflict', desc: 'Duplicate or state conflict (e.g. unique constraint).' },
        { code: '422', label: 'Unprocessable', desc: 'Request body is semantically invalid.' },
        { code: '429', label: 'Too Many Requests', desc: 'Rate limit hit. Check Retry-After header.' },
      ],
    },
    {
      group: '5xx Server Error',
      codes: [
        { code: '500', label: 'Internal Server Error', desc: 'Generic server failure. Check logs.' },
        { code: '502', label: 'Bad Gateway', desc: 'Upstream server returned invalid response.' },
        { code: '503', label: 'Service Unavailable', desc: 'Server overloaded or in maintenance.' },
        { code: '504', label: 'Gateway Timeout', desc: 'Upstream did not respond in time.' },
      ],
    },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      )}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-80 md:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <i className="ph ph-book-open text-indigo-400 text-lg"></i>
            <span className="text-sm font-semibold text-slate-200 tracking-wide uppercase">HTTP Cheat Sheet</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded hover:bg-slate-800"
          >
            <i className="ph ph-x text-lg"></i>
          </button>
        </div>

        <div className="overflow-y-auto h-full pb-32 px-5 pt-5 space-y-6">
          {/* HTTP Methods */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Methods</div>
            <div className="space-y-2">
              {methods.map(m => (
                <div key={m.verb} className="flex items-center gap-3 py-2 border-b border-slate-800/60 last:border-0">
                  <span className={`font-mono font-bold text-xs px-2.5 py-1 rounded ${m.color}`}>
                    {m.verb}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-400 leading-snug">{m.desc}</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {m.safe && <span className="text-[10px] text-emerald-500 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded">Safe</span>}
                    {m.idempotent && <span className="text-[10px] text-amber-500 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded">Idemp</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Codes */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Status Codes</div>
            <div className="space-y-4">
              {statusGroups.map(g => (
                <div key={g.group}>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{g.group}</div>
                  <div className="space-y-1">
                    {g.codes.map(c => (
                      <div key={c.code} className="flex items-baseline gap-3 py-1.5 px-2 rounded hover:bg-slate-800/40">
                        <span className="font-mono font-bold text-xs text-slate-200 w-8 shrink-0">{c.code}</span>
                        <span className="text-[11px] text-slate-400 min-w-[80px] shrink-0">{c.label}</span>
                        <span className="text-[11px] text-slate-500 leading-snug">{c.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
