// アイコン情報の型
interface MoodleIcon {
    key: string;
    component: string;
    alttext: string;
    iconurl: string;
    iconclass: string;
}

// コース情報の型
interface MoodleCourse {
    id: number;
    fullname: string;
    shortname: string;
    idnumber: string;
    summary: string;
    summaryformat: number;
    startdate: number;
    enddate: number;
    visible: boolean;
    showactivitydates: boolean;
    showcompletionconditions: boolean | null;
    fullnamedisplay: string;
    viewurl: string;
    courseimage: string;
    progress: number;
    hasprogress: boolean;
    isfavourite: boolean;
    hidden: boolean;
    showshortname: boolean;
    coursecategory: string;
}

interface MoodleAction {
    actionable: boolean;
    itemcount: number;
    name: string;
    showitemcount: boolean;
    url: string;
}

// イベントの型
interface MoodleEvent {
    action?: MoodleAction;
    id: number;
    name: string;
    description: string;
    descriptionformat: number;
    location: string;
    categoryid: number | null;
    groupid: number | null;
    userid: number;
    repeatid: number | null;
    eventcount: number | null;
    component: string;
    modulename: string;
    activityname: string;
    activitystr: string;
    instance: number;
    eventtype: string;
    timestart: number;
    timeduration: number;
    timesort: number;
    timeusermidnight: number;
    visible: boolean;
    timemodified: number;
    overdue: boolean;
    icon: MoodleIcon;
    course: MoodleCourse;
    subscription: {
        displayeventsource: boolean;
    };
    canedit: boolean;
    candelete: boolean;
    deleteurl: string;
    editurl: string;
    viewurl: string;
    formattedtime: string;
    formattedlocation: string;
    isactionevent: boolean;
    iscourseevent: boolean;
    iscategoryevent: boolean;
    groupname: string | null;
    normalisedeventtype: string;
    normalisedeventtypetext: string;
    purpose: string;
    url: string;
    islastday: boolean;
    popupname: string;
    mindaytimestamp: number;
    mindayerror: string;
    draggable: boolean;
}
