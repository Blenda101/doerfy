import { TimeBox } from "../types/timeBox";

export const defaultTimeBoxes: TimeBox[] = [
  {
    id: "queue",
    name: "Do Queue",
    description: "Tasks waiting to be started",
    sort_order: 0,
    expireThreshold: 0,
    warnThreshold: 0,
  },
  {
    id: "do",
    name: "Do",
    description: "Tasks ready to be worked on",
    warnThreshold: 24,
    expireThreshold: 30,
    sort_order: 1,
  },
  {
    id: "doing",
    name: "Doing",
    description: "Tasks currently in progress",
    warnThreshold: 6,
    expireThreshold: 7,
    sort_order: 2,
  },
  {
    id: "today",
    name: "Do Today",
    description: "Tasks that need to be completed today",
    warnThreshold: 1,
    expireThreshold: 1,
    sort_order: 3,
  },
  {
    id: "done",
    name: "Done",
    description: "Completed tasks",
    sort_order: 4,
    expireThreshold: 0,
    warnThreshold: 0,
  },
];
