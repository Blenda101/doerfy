import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Sidebar } from '../../components/Sidebar';
import { TasksHeader } from '../../components/TasksHeader';
import { FilterHeader } from '../../components/FilterHeader';
import { FilterPanel } from '../../components/FilterPanel';
import { PropertySheet } from '../../components/PropertySheet';
import { PtbTimeBox } from '../PtbTimeBox/PtbTimeBox';
import { TaskList } from '../TaskList/TaskList';
import { Calendar } from '../Calendar/Calendar';
import { AddListDialog } from '../../components/AddListDialog';
import { Theme, getInitialTheme, setTheme as setThemeUtil } from '../../utils/theme';
import { useFilterStore } from '../../store/filterStore';
import { loadTasks } from '../../utils/storage';
import { createSampleTasks } from '../../utils/sampleData';
import { cn } from '../../lib/utils';
import { Filter, ListIcon, CalendarIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Tasks: React.FC = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTaskTab') || 'timebox';
  });
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [isAddListOpen, setIsAddListOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'filter' | 'property' | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [tasks, setTasks] = useState([]);
  const { filterTasks } = useFilterStore();

  useEffect(() => {
    setThemeUtil(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('activeTaskTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const loadTaskData = async () => {
      try {
        // Create sample tasks first
        await createSampleTasks();
        toast.success('Sample tasks created successfully');
        
        // Then load all tasks
        const loadedTasks = await loadTasks();
        setTasks(loadedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
        toast.error('Error creating sample tasks');
      }
    };

    loadTaskData();
  }, []);

  const handlePanelClose = () => {
    setActivePanel(null);
    setSelectedTaskId(null);
  };

  const handleFilterClick = () => {
    if (activePanel === 'filter') {
      setActivePanel(null);
    } else {
      setActivePanel('filter');
      if (selectedTaskId) {
        setSelectedTaskId(null);
      }
    }
  };

  const handleTaskSelect = (taskId: string) => {
    if (activePanel === 'property' && selectedTaskId === taskId) {
      setActivePanel(null);
      setSelectedTaskId(null);
    } else {
      setActivePanel('property');
      setSelectedTaskId(taskId);
    }
  };

  const getHeaderProps = () => {
    switch (activeTab) {
      case 'timebox':
        return {
          title: 'Time Box',
          icon: <Filter />,
          addItemLabel: 'Add Time Box'
        };
      case 'lists':
        return {
          title: 'Lists',
          icon: <ListIcon />,
          addItemLabel: 'Add List',
          isAddListOpen,
          setIsAddListOpen
        };
      case 'calendar':
        return {
          title: 'Calendar',
          icon: <CalendarIcon />,
          addItemLabel: 'Add Event'
        };
      default:
        return {
          title: 'Tasks',
          icon: <Filter />,
          addItemLabel: 'Add Task'
        };
    }
  };

  const filteredTasks = filterTasks(tasks, activeTab as 'timebox' | 'lists' | 'calendar');

  const tabs = (
    <TabsList className="bg-transparent border-b-0">
      <TabsTrigger 
        value="timebox"
        className="flex items-center gap-2 data-[state=active]:bg-transparent"
      >
        <Filter className="w-4 h-4" />
        Time Box
      </TabsTrigger>
      <TabsTrigger 
        value="lists"
        className="flex items-center gap-2 data-[state=active]:bg-transparent"
      >
        <ListIcon className="w-4 h-4" />
        Lists
      </TabsTrigger>
      <TabsTrigger 
        value="calendar"
        className="flex items-center gap-2 data-[state=active]:bg-transparent"
      >
        <CalendarIcon className="w-4 h-4" />
        Calendar
      </TabsTrigger>
    </TabsList>
  );

  return (
    <div className={cn(
      "flex h-screen",
      theme === 'dark' ? 'dark bg-[#0F172A]' : 'bg-white'
    )}>
      <Sidebar
        isSidebarExpanded={isSidebarExpanded}
        theme={theme}
        onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
        onToggleTheme={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}
      />
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="flex-1 flex flex-col h-full"
      >
        <TasksHeader 
          {...getHeaderProps()} 
          theme={theme} 
          tabs={tabs}
          onFilterClick={handleFilterClick}
        />
        <FilterHeader theme={theme} view={activeTab as 'timebox' | 'lists' | 'calendar'} />
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto">
            <TabsContent value="timebox" className="flex-1 m-0">
              <PtbTimeBox 
                theme={theme} 
                tasks={filteredTasks}
                onTaskSelect={handleTaskSelect}
                selectedTaskId={selectedTaskId}
              />
            </TabsContent>
            <TabsContent value="lists" className="flex-1 m-0">
              <TaskList 
                theme={theme} 
                isAddListOpen={isAddListOpen} 
                setIsAddListOpen={setIsAddListOpen}
              />
            </TabsContent>
            <TabsContent value="calendar" className="flex-1 m-0">
              <Calendar 
                theme={theme} 
                tasks={filteredTasks}
                onTaskSelect={handleTaskSelect}
                selectedTaskId={selectedTaskId}
              />
            </TabsContent>
          </div>
          {activePanel === 'filter' && (
            <div className={cn(
              "w-[400px] transition-transform duration-300 ease-in-out transform",
              "border-l",
              theme === 'dark' ? "border-[#334155]" : "border-gray-200"
            )}>
              <FilterPanel
                onClose={handlePanelClose}
                view={activeTab as 'timebox' | 'lists' | 'calendar'}
                theme={theme}
              />
            </div>
          )}
          {activePanel === 'property' && selectedTaskId && (
            <div className={cn(
              "w-[635px] transition-transform duration-300 ease-in-out transform",
              "border-l",
              theme === 'dark' ? "border-[#334155] bg-[#1E293B]" : "border-gray-200"
            )}>
              <PropertySheet
                task={tasks.find(t => t.id === selectedTaskId)}
                onClose={handlePanelClose}
                onTaskUpdate={(updatedTask) => {
                  setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
                }}
                theme={theme}
                availableLists={Array.from(new Set(tasks.map(t => t.list)))}
              />
            </div>
          )}
        </div>
      </Tabs>

      <AddListDialog
        isOpen={isAddListOpen}
        onClose={() => setIsAddListOpen(false)}
        onSave={(config) => {
          setIsAddListOpen(false);
        }}
      />
    </div>
  );
};