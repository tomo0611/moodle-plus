export type ParsedAssignments = {
    eventId: number;
    instanceId: number;
    courseName: string;
    assignmentTitle: string;
    moduleName: string;
    startDate?: number;
    dueDate: number;
    url: string;
    actionAvailable?: boolean;
    hasSubmitted: boolean | 'unknown';
};
