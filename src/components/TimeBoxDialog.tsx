import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Filter } from 'lucide-react';
import { cn } from '../lib/utils';

export interface TimeBoxConfig {
  id: string;
  name: string;
  description: string;
  warnThreshold?: number;
  expireThreshold?: number;
}

interface TimeBoxDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: TimeBoxConfig) => void;
  initialConfig?: TimeBoxConfig;
}

export const TimeBoxDialog: React.FC<TimeBoxDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig,
}) => {
  const [config, setConfig] = useState<TimeBoxConfig>({
    id: '',
    name: '',
    description: '',
    warnThreshold: undefined,
    expireThreshold: undefined,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    } else {
      setConfig({
        id: crypto.randomUUID(),
        name: '',
        description: '',
        warnThreshold: undefined,
        expireThreshold: undefined,
      });
    }
    setError(null);
  }, [initialConfig, isOpen]);

  const validateThresholds = (warn?: number, expire?: number): boolean => {
    if (!expire && warn !== undefined) {
      setConfig(prev => ({ ...prev, warnThreshold: undefined }));
      setError('Warning threshold requires expiry threshold to be set');
      return false;
    }

    if (warn === undefined || expire === undefined) return true;
    
    if (warn >= expire) {
      setError('Warning threshold must be less than expiry threshold');
      return false;
    }
    
    if (warn < 0 || expire < 0) {
      setError('Thresholds cannot be negative');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleWarnThresholdChange = (value: string) => {
    const newWarn = value ? parseInt(value) : undefined;
    if (validateThresholds(newWarn, config.expireThreshold)) {
      setConfig({ ...config, warnThreshold: newWarn });
    }
  };

  const handleExpireThresholdChange = (value: string) => {
    const newExpire = value ? parseInt(value) : undefined;
    if (!newExpire) {
      setConfig(prev => ({ ...prev, expireThreshold: newExpire, warnThreshold: undefined }));
    } else if (validateThresholds(config.warnThreshold, newExpire)) {
      setConfig({ ...config, expireThreshold: newExpire });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateThresholds(config.warnThreshold, config.expireThreshold)) {
      return;
    }
    onSave(config);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "sm:max-w-[425px]",
        "dark:bg-slate-800 dark:border-slate-700"
      )}>
        <DialogHeader className="flex flex-row items-center gap-2">
          <Filter className="w-5 h-5 text-[#5036b0] dark:text-[#8B5CF6]" />
          <DialogTitle className="text-xl font-light dark:text-slate-200">
            {initialConfig ? 'Edit Time Box' : 'Add Time Box'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="dark:text-slate-200">Name</Label>
            <Input
              id="name"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              placeholder="Enter time box name"
              required
              className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="dark:text-slate-200">Description</Label>
            <Textarea
              id="description"
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              placeholder="Enter description"
              className="h-20 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expireThreshold" className="dark:text-slate-200">Expiry Threshold (days)</Label>
              <Input
                id="expireThreshold"
                type="number"
                min="0"
                value={config.expireThreshold || ''}
                onChange={(e) => handleExpireThresholdChange(e.target.value)}
                placeholder="Days until expiry"
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warnThreshold" className="dark:text-slate-200">Warning Threshold (days)</Label>
              <Input
                id="warnThreshold"
                type="number"
                min="0"
                value={config.warnThreshold || ''}
                onChange={(e) => handleWarnThresholdChange(e.target.value)}
                placeholder="Days until warning"
                disabled={!config.expireThreshold}
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
              />
            </div>
          </div>
          {error && (
            <div className="text-red-500 dark:text-red-400 text-sm">{error}</div>
          )}
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!!error}
              className="dark:bg-purple-600 dark:text-white dark:hover:bg-purple-700"
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};