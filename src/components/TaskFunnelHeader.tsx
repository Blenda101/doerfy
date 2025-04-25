import React from 'react';
import { Filter } from 'lucide-react';
import { TasksHeader } from './TasksHeader';
import { TimeBoxConfig } from './TimeBoxDialog';
import { Theme } from '../utils/theme';

interface TaskFunnelHeaderProps {
  onAddTimeBox: (config: TimeBoxConfig) => void;
  theme?: Theme;
}

export const TaskFunnelHeader: React.FC<TaskFunnelHeaderProps> = ({
  onAddTimeBox,
  theme = 'light'
}) => {
  return (
    <TasksHeader
      title="Time Box"
      icon={<Filter />}
      onAddItem={() => onAddTimeBox({
        id: crypto.randomUUID(),
        name: '',
        description: '',
      })}
      addItemLabel="Add Time Box"
      theme={theme}
    />
  );
};