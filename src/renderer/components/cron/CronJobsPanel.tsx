import React from 'react';
import { useCronStore } from '../../stores/cronStore';

export default function CronJobsPanel() {
  const { cronJobs, cronJobsLoading } = useCronStore();

  return (
    <div className="cron-jobs-bubble">
      <div className="cron-jobs-bubble-header">
        <h3>定时任务列表 ({cronJobs.length})</h3>
        {cronJobsLoading && <span>...</span>}
      </div>
      <div className="cron-jobs-bubble-list">
        {cronJobs.length === 0 ? (
          <div className="cron-jobs-bubble-empty">暂无定时任务</div>
        ) : (
          cronJobs.map((job, index) => (
            <div key={job.id || index} className="cron-jobs-bubble-item">
              <div className="cron-jobs-bubble-item-header">
                <span className="cron-jobs-bubble-id">
                  {job.id ? job.id.substring(0, 8) : 'unknown'}...
                </span>
                <span className={`cron-jobs-bubble-status ${job.running ? 'running' : 'stopped'}`}>
                  {job.running ? '运行中' : '已停止'}
                </span>
              </div>
              <div className="cron-jobs-bubble-expr">{job.cron_expr}</div>
              <div className="cron-jobs-bubble-desc" title={job.task_description}>
                {job.task_description}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
