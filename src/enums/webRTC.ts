export enum WebRTCActions {
    JOIN_TO_CHANNEL = 'joinToChannel',
    USER_WANT_TO_JOIN = 'userWantToJoin',
    TO_JOINED_USER = 'TO_JOINED_USER',
    ANSWER_TO_NEW_USER = 'ANSWER_TO_NEW_USER',
    NEW_ICE_CANDIDATE = 'new-ice-candidate',
    ICE_CANDIDATE = 'ice-candidate'
}

export enum TrackKind {
    VIDEO = 'video',
    AUDIO = 'audio'
}