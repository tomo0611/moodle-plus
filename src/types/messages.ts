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

export type PostMessageDataFromExtension = {
    'moodlePlus:misc:getVersion': {
        type: 'moodlePlus:misc:getVersion';
        payload: {
            version: string;
        };
    }
    'moodlePlus:upcomingAssignments:ignoreAssignments': {
        type: 'moodlePlus:upcomingAssignments:ignoreAssignments';
        payload: {
            instanceIds: number[];
        };
    }
};

export type PostMessageDataFromInjectedScript = {
    'moodlePlus:misc:requestGetVersion': {
        type: 'moodlePlus:misc:requestGetVersion';
    }
    'moodlePlus:misc:injectedScriptLoaded': {
        type: 'moodlePlus:misc:injectedScriptLoaded';
    }
};
