export const IMAGE_BACK = require('../../static/image/classic/back.png');
export const IMAGE_SEARCH = require('../../static/image/classic/search.png');
export const IMAGE_NEW_CHAT= require('../../static/image/classic/new-chat.png');
export const IMAGE_FILE = require('../../static/image/classic/file.png');
export const IMAGE_STICKER = require('../../static/image/classic/sticker.png');
export const IMAGE_ATTACH = require('../../static/image/classic/attach.png');
export const IMAGE_SEND = require('../../static/image/classic/send.png');
export const IMAGE_GALLERY = require('../../static/image/classic/gallery.png');
export const IMAGE_CAMERA = require('../../static/image/classic/camera.png');
export const IMAGE_LOCATION = require('../../static/image/classic/location.png');
export const IMAGE_VOICE = require('../../static/image/classic/voice.png');
export const IMAGE_DRAWING = require('../../static/image/classic/drawing.png');
export const IMAGE_VOICE_CALL = require('../../static/image/classic/voice-call.png');
export const IMAGE_VIDEO_CALL = require('../../static/image/classic/video-call.png');
export const IMAGE_START_CHAT = require('../../static/image/classic/start-chat.png');
export const IMAGE_PENCIL = require('../../static/image/classic/pencil.png');
export const IMAGE_ADD_MEMBER = require('../../static/image/classic/add-member.png');
export const IMAGE_LEAVE = require('../../static/image/classic/leave.png');
export const IMAGE_CHANGE_ADMIN = require('../../static/image/classic/change-admin.png');
export const IMAGE_KICK_MEMBER = require('../../static/image/classic/kick-member.png');
export const IMAGE_JOIN = require('../../static/image/classic/join.png');
export const IMAGE_DONE = require('../../static/image/classic/done.png');
export const IMAGE_CHECK_MARK = require('../../static/image/classic/check-mark.png');


export const SCREEN_BLOCK_STYLE = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    flexDirection: 'column',
};
export const SCREEN_HEADER_BLOCK_STYLE = {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5EC',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
};
export const SCREEN_HEADER_BACK_BUTTON_STYLE = {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'flex-start'
};
export const SCREEN_HEADER_BACK_BUTTON_IMAGE_STYLE = {
    width: 25,
    height: 25
};
export const SCREEN_HEADER_TITLE_TEXT_STYLE = {
    flex: 1,
    paddingRight: 50,
    fontSize: 20,
    fontWeight: '400',
    lineHeight: 25,
    color: '#2F353B',
    textAlign: 'center'
};
export const SCREEN_BODY_BLOCK_STYLE = {
    flex: 1,
    flexDirection: 'column',
    position: 'relative'
};

export const CONNECTION_BLOCK_STYLE = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center'
};
export const CONNECTION_BLOCK_CONNECTING_STYLE = {
    backgroundColor: '#F3C200'
};
export const CONNECTION_BLOCK_CONNECTED_STYLE = {
    backgroundColor: '#26C281'
};
export const CONNECTION_TEXT_STYLE = {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
    color: '#fff'
};

export const EMPTY_BLOCK_STYLE = {
    paddingHorizontal: 15,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
};
export const EMPTY_TEXT_STYLE = {
    fontSize: 25,
    fontWeight: '300',
    lineHeight: 30,
    color: '#BFBFBF'
};

export const SEARCH_BLOCK_STYLE = {
    position: 'relative'
};
export const SEARCH_INPUT_STYLE = {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E1E5EC',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 40,
    lineHeight: 20,
    fontSize: 16,
    fontWeight: '300',
    color: '#95A5A6'
};
export const SEARCH_INPUT_PROPS_STYLE = {
    underlineColorAndroid: 'transparent',
    placeholderTextColor: '#E1E5EC'
};
export const SEARCH_IMAGE_STYLE = {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 30,
    height: 30
};
export const SEARCH_CLEAR_BUTTON_BLOCK_STYLE = {
    position: 'absolute',
    top: 2,
    right: 5,
    width: 30,
    height: 30
};
export const SEARCH_CLEAR_BUTTON_TEXT_STYLE = {
    fontSize: 30,
    fontWeight: '400',
    lineHeight: 30,
    color: '#E1E5EC',
    textAlign: 'center'
};

export const AVATAR_BLOCK_STYLE = {
    width: 50,
    height: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center'
};
export const AVATAR_TEXT_STYLE = {
    fontSize: 20,
    fontWeight: '500',
    color: '#fff'
};

export const TYPING_BLOCK_STYLE = {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 30,
    color: '#2F353B'
};
export const TYPING_BLOCK_BOLD_STYLE = {
    fontWeight: '500'
};

export const FROM_NOW_TIME_TEXT_STYLE = {
    fontSize: 15,
    fontWeight: '300',
    lineHeight: 20,
    color: '#2F353B'
};

export const MESSAGE_STATUS_BLOCK_STYLE = {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    borderStyle: 'solid',
    borderWidth: 2
};
export const MESSAGE_STATUS_BLOCK_SENDING_STYLE = {
    borderColor: '#BFBFBF'
};
export const MESSAGE_STATUS_BLOCK_SENT_STYLE = {
    borderColor: '#F2784B'
};
export const MESSAGE_STATUS_BLOCK_DELIVERED_STYLE = {
    borderColor: '#F2784B',
    backgroundColor: '#F2784B'
};
export const MESSAGE_STATUS_BLOCK_SEEN_STYLE = {
    borderColor: '#fff'
};
export const MESSAGE_STATUS_TEXT_STYLE = {
    fontSize: 12,
    fontWeight: '500'
};
export const MESSAGE_STATUS_TEXT_SENDING_STYLE = {
    color: '#fff'
};
export const MESSAGE_STATUS_TEXT_SENT_STYLE = {
    color: '#F2784B'
};
export const MESSAGE_STATUS_TEXT_DELIVERED_STYLE = {
    color: '#fff'
};
export const MESSAGE_STATUS_TEXT_SEEN_STYLE = {
    color: '#fff'
};


export const CONVERSATIONS_SEARCH_BLOCK_STYLE = {
    marginVertical: 10,
    marginHorizontal: 15,
};
export const CONVERSATIONS_LIST_STYLE = {
    paddingHorizontal: 15,
    flex: 1
};
export const CONVERSATION_NEW_BUTTON_BLOCK_STYLE = {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 45,
    height: 45,
    borderRadius: 50,
    backgroundColor: '#F2784B',
    justifyContent: 'center',
    alignItems: 'center'
};
export const CONVERSATION_NEW_BUTTON_IMAGE_STYLE = {
    width: 25,
    height: 25
};

export const CONVERSATIONS_LIST_CONTENT_CONTAINER_STYLE = {
    paddingBottom: 15
};
export const CONVERSATION_BLOCK_STYLE = {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5EC',
    paddingVertical: 15
};
export const CONVERSATION_AVATAR_CONTAINER_BLOCK_STYLE = {
    position: 'relative'
};
export const CONVERSATION_AVATAR_BLOCK_STYLE = {
    width: 50,
    height: 50
};
export const CONVERSATION_AVATAR_TEXT_STYLE = {
    fontSize: 20
};
export const CONVERSATION_STATUS_BLOCK_STYLE = {
    width: 15,
    height: 15,
    borderRadius: 50,
    backgroundColor: '#95A5A6',
    position: 'absolute',
    top: 0,
    right: 0
};
export const CONVERSATION_STATUS_ONLINE_STYLE = {
    backgroundColor: '#578EBE'
};
export const CONVERSATION_INFORMATION_BLOCK_STYLE = {
    flex: 1,
    marginLeft: 15,
    position: 'relative'
};
export const CONVERSATION_UNREAD_BLOCK_STYLE = {
    width: 20,
    height: 20,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2784B',
    position: 'absolute',
    top: 25,
    right: 0
};
export const CONVERSATION_UNREAD_TEXT_STYLE = {
    fontSize: 12,
    fontWeight: '400',
    color: '#fff'
};
export const CONVERSATION_NAME_TEXT_STYLE = {
    maxWidth: '60%',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
    color: '#2F353B'
};
export const CONVERSATION_LAST_MESSAGE_BLOCK_STYLE = {
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
};
export const CONVERSATION_LAST_MESSAGE_TEXT_STYLE = {
    maxWidth: '85%',
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
    color: '#2F353B'
};
export const CONVERSATION_LAST_MESSAGE_TEXT_BOLD_STYLE = {
    fontWeight: '500'
};
export const CONVERSATION_LAST_MESSAGE_STATUS_BLOCK_STYLE = {
    width: 15,
    height: 15,
    marginLeft: 5
};
export const CONVERSATION_LAST_MESSAGE_STATUS_TEXT_STYLE = {
    fontSize: 8
};
export const CONVERSATION_TYPING_TEXT_STYLE = {
    maxWidth: '85%',
    fontSize: 15,
    lineHeight: 20,
    marginTop: 5
};
export const CONVERSATION_FROM_NOW_BLOCK_STYLE = {
    position: 'absolute',
    top: 0,
    right: 0
};
export const CONVERSATION_FROM_NOW_TEXT_STYLE = {
    fontSize: 14
};


export const CHAT_HEADER_BLOCK_STYLE = {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5EC',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
};
export const CHAT_HEADER_BACK_BUTTON_STYLE = {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'flex-start'
};
export const CHAT_HEADER_BACK_BUTTON_IMAGE_STYLE = {
    width: 25,
    height: 25
};
export const CHAT_HEADER_INFO_BLOCK_STYLE = {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
};
export const CHAT_HEADER_AVATAR_BLOCK_STYLE = {
    width: 40,
    height: 40
};
export const CHAT_HEADER_AVATAR_TEXT_STYLE = {
    fontSize: 18
};
export const CHAT_HEADER_TEXT_BLOCK_STYLE = {
    flex: 1,
    paddingLeft: 10
};
export const CHAT_HEADER_NAME_TEXT_STYLE = {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
    color: '#2F353B',
};
export const CHAT_HEADER_OFFLINE_TEXT_STYLE = {
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 20,
    color: '#95A5A6'
};
export const CHAT_HEADER_ONLINE_TEXT_STYLE = {
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 20,
    color: '#578EBE'
};
export const CHAT_HEADER_MEMBERS_TEXT_STYLE = {
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 20,
    color: '#95A5A6'
};
export const CHAT_HEADER_ACTION_BUTTON_STYLE = {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'flex-end',
};
export const CHAT_HEADER_ACTION_BUTTON_IMAGE_STYLE = {
    width: 35,
    height: 35
};

export const CHAT_TYPING_BLOCK_STYLE = {
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: 20,
    paddingHorizontal: 15
};
export const CHAT_TYPING_TEXT_STYLE = {
    fontSize: 12,
    lineHeight: 15,
    color: '#95A5A6'
};

export const CHAT_INPUT_DISABLED_BLOCK_STYLE = {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#F2784B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
};
export const CHAT_INPUT_DISABLED_TEXT_STYLE = {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: '#fff',
};

export const CHAT_INPUT_BLOCK_STYLE = {
    borderTopWidth: 1,
    borderTopColor: '#E1E5EC',
};
export const CHAT_INPUT_INPUT_BLOCK_STYLE = {
    paddingVertical: 5,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
};
export const CHAT_INPUT_STICKER_BUTTON_BLOCK_STYLE = {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
};
export const CHAT_INPUT_STICKER_BUTTON_IMAGE_STYLE = {
    width: 25,
    height: 25,
};
export const CHAT_INPUT_ATTACH_BUTTON_BLOCK_STYLE = {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
};
export const CHAT_INPUT_ATTACH_BUTTON_IMAGE_STYLE = {
    width: 25,
    height: 25,
};
export const CHAT_INPUT_SEND_BUTTON_BLOCK_STYLE = {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
};
export const CHAT_INPUT_SEND_BUTTON_IMAGE_STYLE = {
    width: 25,
    height: 25
};
export const CHAT_INPUT_TEXT_INPUT_BLOCK_STYLE = {
    flex: 1,
};
export const CHAT_INPUT_TEXT_INPUT_STYLE = {
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    fontWeight: '300',
    color: '#95A5A6',
    textAlignVertical: 'top',
    height: 40,
};
export const CHAT_INPUT_TEXT_INPUT_PROPS_STYLE = {
    underlineColorAndroid: 'transparent',
    placeholderTextColor: '#E1E5EC',
    maxHeight: 70,
};
export const CHAT_INPUT_STICKER_BOX_BLOCK_STYLE = {
    height: 250,
    borderTopWidth: 1,
    borderTopColor: '#E1E5EC'
};
export const CHAT_INPUT_STICKER_BOX_HEADER_BLOCK_STYLE = {
    paddingVertical: 5,
    paddingHorizontal: 15,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5EC'
};
export const CHAT_INPUT_STICKER_BOX_TABS_BLOCK_STYLE = {
    flex: 1,
    flexDirection: 'row'
};
export const CHAT_INPUT_STICKER_BOX_TABS_TAB_BUTTON_STYLE = {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
};
export const CHAT_INPUT_STICKER_BOX_TABS_TAB_BUTTON_ACTIVE_STYLE = {
    borderBottomWidth: 2,
    borderBottomColor: '#F2784B'
};
export const CHAT_INPUT_STICKER_BOX_TABS_TAB_IMAGE_STYLE = {
    width: 30,
    height: 30
};
export const CHAT_INPUT_STICKER_BOX_CLOSE_BUTTON_BLOCK_STYLE = {
    width: 40,
    height: 40
};
export const CHAT_INPUT_STICKER_BOX_CLOSE_BUTTON_TEXT_STYLE = {
    fontSize: 30,
    fontWeight: '400',
    lineHeight: 40,
    color: '#95A5A6',
    textAlign: 'center'
};
export const CHAT_INPUT_STICKER_BOX_BODY_BLOCK_STYLE = {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 15
};
export const CHAT_INPUT_STICKER_BOX_STICKERS_BLOCK_STYLE = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start'
};
export const CHAT_INPUT_STICKER_BOX_STICKERS_STICKER_BUTTON_STYLE = {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center'
};
export const CHAT_INPUT_STICKER_BOX_STICKERS_STICKER_IMAGE_STYLE = {
    width: 60,
    height: 60
};
export const CHAT_INPUT_FILE_BOX_BLOCK_STYLE = {
    position: 'relative',
    height: 250,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: '#E1E5EC',
    justifyContent: 'center',
    alignItems: 'center'
};
export const CHAT_INPUT_FILE_BOX_CONTENT_BLOCK_STYLE = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center'
};
export const CHAT_INPUT_FILE_BOX_OPTION_BUTTON_BLOCK_STYLE = {
    width: '33%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 15
};
export const CHAT_INPUT_FILE_BOX_OPTION_IMAGE_BLOCK_STYLE = {
    width: 30,
    height: 30
};
export const CHAT_INPUT_FILE_BOX_OPTION_TEXT_BLOCK_STYLE = {
    fontSize: 16,
    lineHeight: 25,
    fontWeight: '300',
    color: '#95A5A6',
    marginTop: 5
};
export const CHAT_INPUT_FILE_BOX_CLOSE_BUTTON_BLOCK_STYLE = {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30
};
export const CHAT_INPUT_FILE_BOX_CLOSE_BUTTON_TEXT_STYLE = {
    fontSize: 30,
    fontWeight: '400',
    lineHeight: 30,
    color: '#95A5A6',
    textAlign: 'center'
};

export const MESSAGES_LIST_STYLE = {
    paddingHorizontal: 15,
    flex: 1
};

export const MESSAGE_BLOCK_STYLE = {
    marginVertical: 5
};
export const MESSAGE_TIME_MARK_TEXT_STYLE = {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '600',
    color: '#95A5A6',
    marginBottom: 5,
    textAlign: 'center'
};
export const MESSAGE_TYPE_ACTION_TEXT_STYLE = {
    paddingVertical: 5,
    paddingHorizontal: 15,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '300',
    color: '#555555',
    backgroundColor: '#E9EDEF',
    borderRadius: 5,
    textAlign: 'center'
};
export const MESSAGE_TYPE_ACTION_BOLD_TEXT_STYLE = {
    fontWeight: '500'
};
export const MESSAGE_TYPE_MEDIA_BLOCK_STYLE = {};
export const MESSAGE_TYPE_MEDIA_SENDER_BLOCK_STYLE = {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 5
};
export const MESSAGE_TYPE_MEDIA_SENDER_AVATAR_BLOCK_STYLE = {
    width: 30,
    height: 30
};
export const MESSAGE_TYPE_MEDIA_SENDER_AVATAR_TEXT_STYLE = {
    fontSize: 12
};
export const MESSAGE_TYPE_MEDIA_SENDER_TEXT_STYLE = {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#2F353B',
    marginLeft: 10
};
export const MESSAGE_TYPE_MEDIA_CONTENT_STYLE = {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    marginLeft: 40
};
export const MESSAGE_TYPE_MEDIA_CONTENT_FROM_ME_STYLE = {
    justifyContent: 'flex-end',
    marginLeft: 0
};
export const MESSAGE_TYPE_MEDIA_CANCELED_STYLE = {
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '400',
    color: '#555555',
    borderRadius: 5,
    backgroundColor: '#E9EDEF'
};
export const MESSAGE_TYPE_MEDIA_TEXT_STYLE = {
    maxWidth: '80%',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '400',
    color: '#2F353B'
};
export const MESSAGE_TYPE_MEDIA_TEXT_FROM_ME_STYLE = {
    paddingVertical: 5,
    paddingHorizontal: 10,
    color: '#fff',
    borderRadius: 5,
    backgroundColor: '#F2784B'
};
export const MESSAGE_TYPE_MEDIA_STICKER_STYLE = {
    width: 70,
    height: 70
};
export const MESSAGE_TYPE_MEDIA_FILE_BLOCK_STYLE = {
    width: 200
};
export const MESSAGE_TYPE_MEDIA_FILE_IMAGE_BLOCK_STYLE = {
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E9EDEF',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5
};
export const MESSAGE_TYPE_MEDIA_FILE_IMAGE_HOLDER_STYLE = {
    width: 50,
    height: 50
};
export const MESSAGE_TYPE_MEDIA_FILE_DOWNLOAD_BLOCK_STYLE = {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E5E5',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5
};
export const MESSAGE_TYPE_MEDIA_FILE_DOWNLOAD_INFO_BLOCK_STYLE = {
    flex: 1,
    padding: 5
};
export const MESSAGE_TYPE_MEDIA_FILE_DOWNLOAD_INFO_NAME_TEXT_STYLE = {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '400',
    color: '#95A5A6'
};
export const MESSAGE_TYPE_MEDIA_FILE_DOWNLOAD_INFO_SIZE_TEXT_STYLE = {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '500',
    color: '#95A5A6'
};
export const MESSAGE_TYPE_MEDIA_FILE_DOWNLOAD_IMAGE_BLOCK_STYLE = {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center'
};
export const MESSAGE_TYPE_MEDIA_FILE_DOWNLOAD_IMAGE_HOLDER_STYLE = {
    width: 20,
    height: 20
};
export const MESSAGE_TYPE_MEDIA_FILE_IMAGE_STYLE = {
    width: 200,
    height: 200
};
export const MESSAGE_TYPE_MEDIA_DETAILS_STATUS_TEXT_STYLE = {
    marginHorizontal: 5,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: '400',
    color: '#95A5A6'
};
export const MESSAGE_TYPE_MEDIA_STATUS_BLOCK_STYLE = {
    marginLeft: 5,
    width: 15,
    height: 15
};
export const MESSAGE_TYPE_MEDIA_STATUS_TEXT_STYLE = {
    fontSize: 8
};


export const USER_BLOCK_STYLE = {
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center'
};
export const USER_AVATAR_BLOCK_STYLE = {
    width: 100,
    height: 100,
    marginTop: 30
};
export const USER_AVATAR_TEXT_STYLE = {
    fontSize: 40
};
export const USER_NAME_TEXT_STYLE = {
    fontSize: 20,
    fontWeight: '400',
    lineHeight: 30,
    color: '#2F353B',
    marginTop: 10
};
export const USER_OFFLINE_TEXT_STYLE = {
    fontSize: 18,
    fontWeight: '300',
    lineHeight: 20,
    color: '#95A5A6',
    marginTop: 5
};
export const USER_ONLINE_TEXT_STYLE = {
    fontSize: 18,
    fontWeight: '300',
    lineHeight: 20,
    color: '#578EBE',
    marginTop: 5
};
export const USER_ACTION_BLOCK_STYLE = {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
};
export const USER_ACTION_BUTTON_STYLE = {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
};
export const USER_ACTION_BUTTON_IMAGE_STYLE = {
    width: 40,
    height: 40
};


export const GROUP_BLOCK_STYLE = {
    flex: 1,
    paddingHorizontal: 15
};
export const GROUP_INFO_BLOCK_STYLE = {
    marginVertical: 15,
    flexDirection: 'row'
};
export const GROUP_AVATAR_BLOCK_STYLE = {
    width: 100,
    height: 100
};
export const GROUP_AVATAR_TEXT_STYLE = {
    fontSize: 40
};
export const GROUP_DETAILS_BLOCK_STYLE = {
    marginLeft: 10
};
export const GROUP_NAME_TEXT_STYLE = {
    fontSize: 24,
    fontWeight: '400',
    lineHeight: 30,
    color: '#2F353B',
    marginLeft: 5,
    marginTop: 5
};
export const GROUP_TYPE_TEXT_STYLE = {
    fontSize: 20,
    fontWeight: '300',
    lineHeight: 25,
    color: '#95A5A6',
    marginLeft: 5,
    marginTop: 5
};
export const GROUP_MEMBERS_TEXT_STYLE = {
    fontSize: 18,
    fontWeight: '200',
    lineHeight: 20,
    color: '#95A5A6',
    marginLeft: 5,
    marginTop: 5
};
export const GROUP_ACTION_BLOCK_STYLE = {
    flexDirection: 'row',
    marginTop: 5
};
export const GROUP_ACTION_BUTTON_STYLE = {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
};
export const GROUP_ACTION_BUTTON_IMAGE_STYLE = {
    width: 25,
    height: 25
};
export const GROUP_MEMBERS_BLOCK_STYLE = {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: '#E1E5EC',
    paddingBottom: 10
};
export const GROUP_MEMBERS_LIST_BLOCK_STYLE = {
    flex: 1
};
export const GROUP_MEMBERS_LIST_MEMBER_BLOCK_STYLE = {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5EC',
    paddingVertical: 15
};
export const GROUP_MEMBERS_LIST_MEMBER_INFO_BLOCK_STYLE = {
    flex: 1,
    flexDirection: 'row'
};
export const GROUP_MEMBERS_LIST_MEMBER_AVATAR_BLOCK_STYLE = {
    width: 50,
    height: 50
};
export const GROUP_MEMBERS_LIST_MEMBER_AVATAR_TEXT_STYLE = {
    fontSize: 18
};
export const GROUP_MEMBERS_LIST_MEMBER_TEXTS_BLOCK_STYLE = {
    flex: 1,
    marginLeft: 15
};
export const GROUP_MEMBERS_LIST_MEMBER_NAME_TEXT_STYLE = {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 20,
    color: '#2F353B'
};
export const GROUP_MEMBERS_LIST_MEMBER_ADMIN_TEXT_STYLE = {
    color: '#F2784B'
};
export const GROUP_MEMBERS_LIST_MEMBER_OFFLINE_TEXT_STYLE = {
    fontSize: 15,
    fontWeight: '300',
    lineHeight: 20,
    color: '#95A5A6',
    marginTop: 5
};
export const GROUP_MEMBERS_LIST_MEMBER_ONLINE_TEXT_STYLE = {
    fontSize: 15,
    fontWeight: '300',
    lineHeight: 20,
    color: '#578EBE',
    marginTop: 5
};
export const GROUP_MEMBERS_LIST_MEMBER_CHANGE_ADMIN_BUTTON_BLOCK_STYLE = {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
};
export const GROUP_MEMBERS_LIST_MEMBER_CHANGE_ADMIN_BUTTON_IMAGE_STYLE = {
    width: 25,
    height: 25
};
export const GROUP_MEMBERS_LIST_MEMBER_KICK_MEMBER_BUTTON_BLOCK_STYLE = {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
};
export const GROUP_MEMBERS_LIST_MEMBER_KICK_MEMBER_BUTTON_IMAGE_STYLE = {
    width: 25,
    height: 25
};


export const SELECT_MEMBERS_HEADER_BLOCK_STYLE = {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5EC',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
};
export const SELECT_MEMBERS_HEADER_BACK_BUTTON_STYLE = {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'flex-start'
};
export const SELECT_MEMBERS_HEADER_BACK_BUTTON_IMAGE_STYLE = {
    width: 25,
    height: 25
};
export const SELECT_MEMBERS_HEADER_TITLE_TEXT_STYLE = {
    flex: 1,
    fontSize: 20,
    fontWeight: '400',
    lineHeight: 25,
    color: '#2F353B',
    textAlign: 'center'
};
export const SELECT_MEMBERS_HEADER_DONE_BUTTON_STYLE = {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'flex-end'
};
export const SELECT_MEMBERS_HEADER_DONE_BUTTON_IMAGE_STYLE = {
    width: 25,
    height: 25
};

export const SELECT_MEMBERS_SEARCH_BLOCK_STYLE = {
    marginVertical: 10,
    marginHorizontal: 15,
};
export const SELECT_MEMBERS_LIST_STYLE = {
    paddingHorizontal: 15,
    flex: 1
};
export const SELECT_MEMBERS_LIST_CONTENT_CONTAINER_STYLE = {
    paddingBottom: 15
};
export const SELECT_MEMBERS_SECTION_TITLE_TEXT_STYLE = {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '300',
    color: '#2F353B',
    backgroundColor: '#E1E5EC',
    paddingLeft: 5
};


export const SELECT_MEMBER_SEARCH_BLOCK_STYLE = {
    marginVertical: 10,
    marginHorizontal: 15,
};
export const SELECT_MEMBER_LIST_STYLE = {
    paddingHorizontal: 15,
    flex: 1
};
export const SELECT_MEMBER_LIST_CONTENT_CONTAINER_STYLE = {
    paddingBottom: 15
};
export const SELECT_MEMBER_SECTION_TITLE_TEXT_STYLE = {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '300',
    color: '#2F353B',
    backgroundColor: '#E1E5EC',
    paddingLeft: 5
};


export const SELECT_MEMBER_BLOCK_STYLE = {
    paddingVertical: 15,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5EC'
};
export const SELECT_MEMBER_AVATAR_BLOCK_STYLE = {
    width: 50,
    height: 50
};
export const SELECT_MEMBER_AVATAR_TEXT_STYLE = {
    fontSize: 18
};
export const SELECT_MEMBER_TEXTS_BLOCK_STYLE = {
    flex: 1,
    marginLeft: 15
};
export const SELECT_MEMBER_NAME_TEXT_STYLE = {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 20,
    color: '#2F353B'
};
export const SELECT_MEMBER_OFFLINE_TEXT_STYLE = {
    fontSize: 15,
    fontWeight: '300',
    lineHeight: 20,
    color: '#95A5A6',
    marginTop: 5
};
export const SELECT_MEMBER_ONLINE_TEXT_STYLE = {
    fontSize: 15,
    fontWeight: '300',
    lineHeight: 20,
    color: '#578EBE',
    marginTop: 5
};
export const SELECT_MEMBER_SELECTED_BLOCK_STYLE = {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'flex-end'
};
export const SELECT_MEMBER_SELECTED_IMAGE_STYLE = {
    width: 35,
    height: 35
};


export const GROUP_NAME_INPUT_BACK_GROUD_BLOCK_STYLE = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    padding: 20
};
export const GROUP_NAME_INPUT_CONTENT_BLOCK_STYLE = {
    width: '100%',
    padding: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E1E5EC',
    borderRadius: 5
};
export const GROUP_NAME_INPUT_TITLE_STYLE = {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 20,
    color: '#2F353B'
};
export const GROUP_NAME_INPUT_INPUT_BLOCKS_STYLE = {
    position: 'relative',
    marginTop: 15
};
export const GROUP_NAME_INPUT_INPUT_STYLE = {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E1E5EC',
    borderRadius: 5,
    paddingVertical: 5,
    paddingLeft: 10,
    paddingRight: 40,
    lineHeight: 20,
    fontSize: 16,
    fontWeight: '300',
    color: '#95A5A6'
};
export const GROUP_NAME_INPUT_INPUT_PROPS_STYLE = {
    underlineColorAndroid: 'transparent',
    placeholderTextColor: '#E1E5EC'
};
export const GROUP_NAME_INPUT_CLEAR_BUTTON_BLOCK_STYLE = {
    position: 'absolute',
    top: 2,
    right: 5,
    width: 30,
    height: 30
};
export const GROUP_NAME_INPUT_CLEAR_BUTTON_TEXT_STYLE = {
    fontSize: 30,
    fontWeight: '400',
    lineHeight: 30,
    color: '#E1E5EC',
    textAlign: 'center'
};
export const GROUP_NAME_INPUT_BUTTON_BLOCKS_STYLE = {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 15
};
export const GROUP_NAME_INPUT_BUTTON_TEXT_STYLE = {
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 20,
    color: '#F2784B',
    textAlign: 'center',
    paddingHorizontal: 10
};