export const PING = 1;

export const AUTHENTICATION_GET_SERVER_ADDR = 29;
export const AUTHENTICATION_SEND_AUTHENTICATE = 179;
export const AUTHENTICATION_RECEIVE_AUTHENTICATE = 162;

export const PUSH_NOTIFICATION_REGISTER_DEVICE_SEND = 38;
export const PUSH_NOTIFICATION_REGISTER_DEVICE_RECEIVE = 39;
export const PUSH_NOTIFICATION_UNREGISTER_DEVICE_SEND = 40;
export const PUSH_NOTIFICATION_UNREGISTER_DEVICE_RECEIVE = 41;

export const APPLICATION_CHANGE_STATE = 105;

export const FREE_CALL_START = 186;
export const FREE_CALL_DATA = 187;
export const FREE_CALL_STATUS_CHANGED = 188;
export const FREE_CALL_STATUS_CHANGED_BY_ME = 199;

export const CALLOUT_START_SEND = 500;
export const CALLOUT_START_INITIAL = 610;
export const CALLOUT_START_DONE = 504;
export const CALLOUT_DATA_SEND = 501;
export const CALLOUT_STOP_SEND = 502;
export const CALLOUT_DATA_STATUS_CHANGED = 503;

export const CALLIN_START = 505;
export const CALLIN_STATUS_CHANGED = 506;
export const CALLIN_STATUS_CHANGED_BY_ME = 508;
export const CALLIN_START_PUSH = 602;

export const PAID_CALL_LOG_RETURN = 601;
export const PAID_CALL_LOGS_GET = 509;

export const CONVERSATION_GET_LIST_MODIFIED = 170;
export const CONVERSATION_DELETE = 171;

export const MESSAGE_GET_LIST_UNREAD = 173;
export const MESSAGE_GET_LIST_MODIFIED = 169;
export const MESSAGE_GET_LIST_MODIFIED_FILES = 191;

export const MESSAGE_SERVER_WITH_USER_TYPE_TEXT = 5;
export const MESSAGE_NEW_WITH_USER_TYPE_TEXT = 72;
export const MESSAGE_HAS_NEW_WITH_USER_TYPE_TEXT = 73;
export const MESSAGE_WITH_USER_TYPE_STICKER = 104;
export const MESSAGE_WITH_USER_TYPE_FILE = 121;
export const MESSAGE_WITH_USER_TYPE_LOCATION = 113;
export const MESSAGE_NEW_WITH_GROUP = 45;
export const MESSAGE_HAS_NEW_WITH_GROUP = 146;

export const MESSAGE_FROM_ME_WITH_USER = 174;
export const MESSAGE_FROM_ME_WITH_USER_JSON = 175;
export const MESSAGE_FROM_ME_WITH_GROUP = 176;

export const MESSAGE_STATUS_CHANGE_DELIVERED_WITH_USER = 167;
export const MESSAGE_STATUS_CHANGE_SEEN = 153;
export const MESSAGE_STATUS_CHANGE_CANCELLED_WITH_USER = 127;
export const MESSAGE_STATUS_CHANGE_DELIVERED_WITH_GROUP = 74;
export const MESSAGE_STATUS_CHANGE_CANCELLED_WITH_GROUP = 151;

export const MESSAGE_DELETE = 168;

export const MESSAGE_TYPING_WITH_USER = 142;
export const MESSAGE_TYPING_WITH_GROUP = 149;

export const USER_GET_INFO_BY_IDS = 164;
export const USER_GET_INFO_BY_USERNAMES = 165;

export const GROUP_CREATE = 42;
export const ON_GROUP_CREATED = 143;
export const GROUP_INVITE = 44;
export const ON_GROUP_INVITED = 144;
export const GROUP_LEAVE = 43;
export const ON_GROUP_LEFT = 145;
export const GROUP_RENAME = 150;
export const ON_GROUP_RENAMED = 152;
export const GROUP_CHANGE_ADMIN = 159;
export const ON_GROUP_ADMIN_CHANGED = 160;
export const GROUP_JOIN_PUBLIC = 197;

export const GROUP_GET_DETAILS = 148;
export const GROUP_GET_LIST_PRIVATE = 147;
export const GROUP_GET_LIST_PUBLIC = 198;

export const STICKER_GET_LIST = 112;