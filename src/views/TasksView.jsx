export default function TasksView({ tasks, onToggleTask, onAddTask, onDeleteTask, doneTasks, filteredTasks, taskFilter, setTaskFilter, newTask, setNewTask }) {
  return (
    <div className="view">
      <div className="sh mb20">
        <span className="st">All Tasks</span>
        <span className="chip green">{doneTasks}/{tasks.length} completed</span>
      </div>
      <div className="card mb20">
        <div className="tadd-row" style={{ marginBottom: 14 }}>
          <input
            className="tadd-input"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onAddTask(); }}
            placeholder="+ New task..."
          />
          <button className="btn-p" style={{ padding: '8px 14px', borderRadius: 8 }} onClick={onAddTask}>Add</button>
        </div>
        <div className="flex aic g8" style={{ marginBottom: 14, flexWrap: 'wrap' }}>
          {['all', 'pending', 'done'].map(f => (
            <button
              key={f}
              className={'pomo-tab' + (taskFilter === f ? ' active' : '')}
              style={{ flex: 'none', padding: '5px 14px' }}
              onClick={() => setTaskFilter(f)}
            >
              {f === 'all' ? 'All' : (f === 'pending' ? 'Pending' : 'Completed')}
            </button>
          ))}
        </div>
        <div className="task-list stagger">
          {filteredTasks.map((t, i) => (
            <div
              key={t.id}
              className={'task-item' + (t.done ? ' done' : '')}
              onClick={() => onToggleTask(tasks.indexOf(t))}
            >
              <div className={'tcheck' + (t.done ? ' on' : '')}>
                {t.done && <span>✓</span>}
              </div>
              <span className={'ttxt' + (t.done ? ' done' : '')}>{t.text}</span>
              {t.subject && (
                <span className={'badge ' + (t.subject.color || 'blue')}>{t.subject.name}</span>
              )}
              <span className={'tpri ' + (t.pri === 'high' ? 'phi' : (t.pri === 'medium' ? 'pmd' : 'plo'))}>
                {t.pri === 'high' ? 'High' : (t.pri === 'medium' ? 'Medium' : 'Low')}
              </span>
              <button
                className="task-del-btn"
                onClick={e => { e.stopPropagation(); onDeleteTask(t.id); }}
                title="Delete task"
              >✕</button>
            </div>
          ))}
        </div>
      </div>
      <div className="track thick">
        <div className="fill green" style={{ width: Math.round(doneTasks / tasks.length * 100) + '%' }}></div>
      </div>
    </div>
  );
}
