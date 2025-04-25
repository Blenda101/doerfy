import React from 'react';
import { TaskHistoryItem } from '../types/task';

interface TaskHistoryTableProps {
  history: TaskHistoryItem[];
}

export const TaskHistoryTable: React.FC<TaskHistoryTableProps> = ({ history }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!Array.isArray(history)) {
    return (
      <div className="w-full p-4 text-center text-gray-500">
        No history available
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-4 font-medium">Time Box</th>
              <th className="text-left py-2 px-4 font-medium">Days in Stage</th>
              <th className="text-left py-2 px-4 font-medium">Entry Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index} className="border-b last:border-0">
                <td className="py-2 px-4 capitalize">
                  {item.timeStage}
                </td>
                <td className="py-2 px-4">
                  {item.daysInStage !== undefined ? `${item.daysInStage} days` : '-'}
                </td>
                <td className="py-2 px-4">
                  {formatDate(item.entryDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};