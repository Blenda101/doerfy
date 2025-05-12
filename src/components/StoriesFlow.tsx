import React, { useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { StoryWithRelations } from '../types/story';
import { Theme } from '../utils/theme';
import { cn } from '../lib/utils';

interface StoriesFlowProps {
  stories: StoryWithRelations[];
  theme?: Theme;
  onStorySelect: (story: StoryWithRelations) => void;
}

const NODE_WIDTH = 280;
const NODE_HEIGHT = 120;

const stripHtmlTags = (html: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

// Node Components
const ThemeNode: React.FC<any> = ({ data }) => (
  <div 
    className={cn(
      "p-4 rounded-lg shadow-lg cursor-pointer",
      "bg-[#5036b0] dark:bg-[#8B5CF6]",
      "w-[280px] h-[120px] overflow-hidden"
    )}
    onClick={() => data.onSelect(data.story)}
  >
    <h3 className="text-white font-bold text-lg mb-2 truncate">{data.story.title}</h3>
    {data.story.vision && (
      <div className="text-white/80 text-sm line-clamp-3">
        {stripHtmlTags(data.story.vision)}
      </div>
    )}
  </div>
);

const MegaDoNode: React.FC<any> = ({ data }) => (
  <div 
    className={cn(
      "p-4 rounded-lg shadow-lg cursor-pointer",
      "bg-blue-500 dark:bg-blue-600",
      "w-[280px] h-[120px] overflow-hidden"
    )}
    onClick={() => data.onSelect(data.story)}
  >
    <h3 className="text-white font-bold text-lg mb-2 truncate">{data.story.title}</h3>
    {data.story.description && (
      <div className="text-white/80 text-sm line-clamp-3">
        {stripHtmlTags(data.story.description)}
      </div>
    )}
  </div>
);

const ProjectNode: React.FC<any> = ({ data }) => (
  <div 
    className={cn(
      "p-4 rounded-lg shadow-lg cursor-pointer",
      "bg-green-500 dark:bg-green-600",
      "w-[280px] h-[120px] overflow-hidden"
    )}
    onClick={() => data.onSelect(data.story)}
  >
    <h3 className="text-white font-bold text-lg mb-2 truncate">{data.story.title}</h3>
    {data.story.description && (
      <div className="text-white/80 text-sm line-clamp-3">
        {stripHtmlTags(data.story.description)}
      </div>
    )}
  </div>
);

const TodoNode: React.FC<any> = ({ data }) => (
  <div 
    className={cn(
      "p-4 rounded-lg shadow-lg cursor-pointer",
      "bg-red-500 dark:bg-red-600",
      "w-[280px] h-[120px] overflow-hidden"
    )}
    onClick={() => data.onSelect(data.story)}
  >
    <h3 className="text-white font-bold text-lg mb-2 truncate">{data.story.title}</h3>
    {data.story.description && (
      <div className="text-white/80 text-sm line-clamp-3">
        {stripHtmlTags(data.story.description)}
      </div>
    )}
  </div>
);

const nodeTypes: NodeTypes = {
  theme: ThemeNode,
  mega_do: MegaDoNode,
  project: ProjectNode,
  todo: TodoNode,
};

const StoriesFlow: React.FC<StoriesFlowProps> = ({
  stories,
  theme = 'light',
  onStorySelect,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const organizeNodesHierarchically = useCallback((stories: StoryWithRelations[]) => {
    const VERTICAL_SPACING = 200;
    const HORIZONTAL_SPACING = NODE_WIDTH * 1.5;

    // Group stories by their parent to build the hierarchy
    const childrenMap = stories.reduce((acc, story) => {
      if (story.parentId) {
        if (!acc[story.parentId]) {
          acc[story.parentId] = [];
        }
        acc[story.parentId].push(story);
      }
      return acc;
    }, {} as { [key: string]: StoryWithRelations[] });

    // Find root nodes (themes without parents)
    const rootNodes = stories.filter(story => !story.parentId && story.type === 'theme');

    const processedNodes: Node[] = [];
    const processedEdges: Edge[] = [];

    // Process each level starting from root nodes
    const processNode = (
      story: StoryWithRelations,
      level: number,
      position: number,
      totalInLevel: number
    ) => {
      // Calculate x position to center nodes within their level
      const x = (position + 1) * (HORIZONTAL_SPACING / (totalInLevel + 1)) - HORIZONTAL_SPACING / 2;
      const y = level * VERTICAL_SPACING;

      // Create node
      processedNodes.push({
        id: story.id,
        type: story.type,
        position: { x, y },
        data: { story, onSelect: onStorySelect },
        style: { width: NODE_WIDTH, height: NODE_HEIGHT },
      });

      // Create edge if there's a parent
      if (story.parentId) {
        processedEdges.push({
          id: `${story.parentId}-${story.id}`,
          source: story.parentId,
          target: story.id,
          type: 'smoothstep',
        });
      }

      // Process children
      const children = childrenMap[story.id] || [];
      children.forEach((child, index) => {
        processNode(child, level + 1, index, children.length);
      });
    };

    // Start processing from root nodes
    rootNodes.forEach((root, index) => {
      processNode(root, 0, index, rootNodes.length);
    });

    return { nodes: processedNodes, edges: processedEdges };
  }, [onStorySelect]);

  React.useEffect(() => {
    const { nodes: layoutNodes, edges: layoutEdges } = organizeNodesHierarchically(stories);
    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [stories, organizeNodesHierarchically]);

  return (
    <div className="w-full h-[calc(100vh-200px)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        className={cn(
          "bg-white rounded-lg border",
          theme === 'dark' && "bg-slate-900 border-slate-700"
        )}
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'theme':
                return theme === 'dark' ? '#8B5CF6' : '#5036b0';
              case 'mega_do':
                return theme === 'dark' ? '#3B82F6' : '#2563EB';
              case 'project':
                return theme === 'dark' ? '#22C55E' : '#16A34A';
              case 'todo':
                return theme === 'dark' ? '#EF4444' : '#DC2626';
              default:
                return '#888';
            }
          }}
        />
      </ReactFlow>
    </div>
  );
};

export default StoriesFlow;