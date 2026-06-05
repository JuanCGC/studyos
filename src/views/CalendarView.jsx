export default function CalendarView({ calYear, calMonth, calLabel, calCells, prevMonth, nextMonth }) {
  return (
    <div className="view">
      <div className="calh mb20">
        <button className="calnav" style={{ fontSize: 20, padding: '5px 12px' }} onClick={prevMonth}>‹</button>
        <span className="calmonth" style={{ fontSize: 18, fontWeight: 700 }}>{calLabel}</span>
        <button className="calnav" style={{ fontSize: 20, padding: '5px 12px' }} onClick={nextMonth}>›</button>
      </div>
      <div className="cal-full-grid mb20">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} className="cal-full-dl">{d}</div>
        ))}
        {calCells.map(c => (
          <div key={c.key} className={'cal-full-day' + (c.today ? ' today' : '') + (c.inMonth ? '' : ' other')}>
            <div className={'cfd-num' + (c.today ? ' today' : '')}>{c.d}</div>
            {(c.events || []).map(ev => (
              <div key={ev.id} className={'cal-event ' + (ev.urg ? 'ceve-urg' : 'ceve-norm')}>{ev.title}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
