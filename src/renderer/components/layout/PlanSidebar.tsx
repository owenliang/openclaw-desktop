import React from 'react';
import type { Plan } from '../../types/message';

interface Props {
  plan: Plan;
}

function getStateIcon(state: string): string {
  switch (state) {
    case 'done': return '\u2713';
    case 'in_progress': return '\u27F3';
    case 'abandoned': return '\u2717';
    default: return '\u25CB';
  }
}

function getStateText(state: string): string {
  switch (state) {
    case 'done': return '已完成';
    case 'in_progress': return '进行中';
    case 'abandoned': return '已放弃';
    default: return '待处理';
  }
}

export default function PlanSidebar({ plan }: Props) {
  return (
    <div className="plan-panel">
      <div className="plan-panel-header">
        <strong>{plan.name || '计划'}</strong>
      </div>
      {plan.description && <div className="plan-description">{plan.description}</div>}
      {plan.subtasks && plan.subtasks.length > 0 && (
        <div className="plan-subtasks">
          {plan.subtasks.map((subtask, idx) => (
            <div key={idx} className={`subtask-item subtask-${subtask.state}`}>
              <div className="subtask-state" title={getStateText(subtask.state)}>
                {getStateIcon(subtask.state)}
              </div>
              <div className="subtask-content">
                <div className="subtask-name">{subtask.name}</div>
                {subtask.description && (
                  <div className="subtask-description">{subtask.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
