import React, { useEffect } from 'react';
import { useChatStore } from './stores/chatStore';
import { useUIStore } from './stores/uiStore';
import LeftDrawer from './components/layout/LeftDrawer';
import Header from './components/layout/Header';
import PlanSidebar from './components/layout/PlanSidebar';
import ChatView from './components/chat/ChatView';
import CronView from './components/cron/CronView';
import CronJobsPanel from './components/cron/CronJobsPanel';
import SettingsModal from './components/layout/SettingsModal';

export default function App() {
  const initSession = useChatStore((s) => s.initSession);
  const newChat = useChatStore((s) => s.newChat);
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const currentPlan = useChatStore((s) => s.currentPlan);
  const cronPanelOpen = useUIStore((s) => s.cronPanelOpen);
  const theme = useUIStore((s) => s.theme);
  const settingsOpen = useUIStore((s) => s.settingsOpen);

  useEffect(() => {
    initSession();
  }, []);

  useEffect(() => {
    if (window.electronAPI?.onSwitchToCron) {
      return window.electronAPI.onSwitchToCron(() => {
        setActiveTab('cron');
      });
    }
  }, []);

  useEffect(() => {
    if (window.electronAPI?.onMenuNewChat) {
      return window.electronAPI.onMenuNewChat(() => {
        newChat();
      });
    }
  }, []);

  return (
    <div id="app-root" data-theme={theme}>
      <LeftDrawer />
      <div className="main-content">
        <Header />
        <div className="content-area" style={{ display: activeTab === 'chat' ? 'flex' : 'none' }}>
          <ChatView />
        </div>
        <div className="content-area" style={{ display: activeTab === 'cron' ? 'flex' : 'none' }}>
          <CronView />
        </div>
      </div>
      {activeTab === 'chat' && currentPlan && <PlanSidebar plan={currentPlan} />}
      {activeTab === 'cron' && cronPanelOpen && <CronJobsPanel />}
      {settingsOpen && <SettingsModal />}
    </div>
  );
}
