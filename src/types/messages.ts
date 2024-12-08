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
