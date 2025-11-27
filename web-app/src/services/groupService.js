import { API_ENDPOINTS } from '../config/apiConfig';
import { apiFetch } from './apiHelper';
import { extractArrayFromResponse } from '../utils/apiHelper';

export const getAllGroups = async (privacy = null, page = 1, size = 10) => {
  let endpoint = `${API_ENDPOINTS.GROUP.GET_ALL}?page=${page}&size=${size}`;
  if (privacy) {
    endpoint += `&privacy=${encodeURIComponent(privacy)}`;
  }
  return apiFetch(endpoint);
};

export const getMyGroups = async (page = 1, size = 10) => {
  const endpoint = `${API_ENDPOINTS.GROUP.MY_GROUPS}?page=${page}&size=${size}`;
  return apiFetch(endpoint);
};

export const getJoinedGroups = async (page = 1, size = 10) => {
  const endpoint = `${API_ENDPOINTS.GROUP.JOINED_GROUPS}?page=${page}&size=${size}`;
  return apiFetch(endpoint);
};

export const searchGroups = async (keyword = '', page = 1, size = 10) => {
  const endpoint = `${API_ENDPOINTS.GROUP.SEARCH}?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`;
  return apiFetch(endpoint);
};

export const getGroupDetail = async (groupId) => {
  return apiFetch(API_ENDPOINTS.GROUP.DETAIL.replace(':id', groupId));
};

export const getGroupMembers = async (groupId, page = 1, size = 10) => {
  const endpoint = `${API_ENDPOINTS.GROUP.MEMBERS.replace(':id', groupId)}?page=${page}&size=${size}`;
  return apiFetch(endpoint);
};

export const createGroup = async (groupData) => {
  return apiFetch(API_ENDPOINTS.GROUP.CREATE, {
    method: 'POST',
    body: JSON.stringify(groupData),
  });
};

export const updateGroup = async (groupId, groupData) => {
  return apiFetch(API_ENDPOINTS.GROUP.UPDATE.replace(':id', groupId), {
    method: 'PUT',
    body: JSON.stringify(groupData),
  });
};

export const deleteGroup = async (groupId) => {
  return apiFetch(API_ENDPOINTS.GROUP.DELETE.replace(':id', groupId), {
    method: 'DELETE',
  });
};

export const joinGroup = async (groupId, message = null) => {
  const body = message ? JSON.stringify({ message }) : null;
  return apiFetch(API_ENDPOINTS.GROUP.JOIN.replace(':id', groupId), {
    method: 'POST',
    body: body,
  });
};

export const leaveGroup = async (groupId) => {
  return apiFetch(API_ENDPOINTS.GROUP.LEAVE.replace(':id', groupId), {
    method: 'POST',
  });
};

export const addMember = async (groupId, userId) => {
  return apiFetch(API_ENDPOINTS.GROUP.ADD_MEMBER.replace(':id', groupId).replace(':userId', userId), {
    method: 'POST',
  });
};

export const removeMember = async (groupId, userId) => {
  return apiFetch(API_ENDPOINTS.GROUP.REMOVE_MEMBER.replace(':id', groupId).replace(':userId', userId), {
    method: 'DELETE',
  });
};

export const updateMemberRole = async (groupId, userId, role) => {
  return apiFetch(API_ENDPOINTS.GROUP.UPDATE_MEMBER_ROLE.replace(':id', groupId).replace(':userId', userId), {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
};

export const getJoinRequests = async (groupId, page = 1, size = 10) => {
  const endpoint = `${API_ENDPOINTS.GROUP.JOIN_REQUESTS.replace(':id', groupId)}?page=${page}&size=${size}`;
  return apiFetch(endpoint);
};

export const getMyJoinRequests = async (page = 1, size = 100) => {
  const endpoint = `${API_ENDPOINTS.GROUP.MY_JOIN_REQUESTS}?page=${page}&size=${size}`;
  return apiFetch(endpoint);
};

export const processJoinRequest = async (groupId, requestId, approve) => {
  return apiFetch(API_ENDPOINTS.GROUP.PROCESS_JOIN_REQUEST.replace(':id', groupId).replace(':requestId', requestId), {
    method: 'POST',
    body: JSON.stringify({ approve }), // true = approve, false = reject
  });
};

export const cancelJoinRequest = async (groupId, requestId) => {
  return apiFetch(API_ENDPOINTS.GROUP.CANCEL_JOIN_REQUEST.replace(':id', groupId).replace(':requestId', requestId), {
    method: 'DELETE',
  });
};

export const uploadGroupAvatar = async (groupId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiFetch(API_ENDPOINTS.GROUP.UPLOAD_AVATAR.replace(':id', groupId), {
    method: 'PUT',
    body: formData,
  });
};

export const uploadGroupCover = async (groupId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiFetch(API_ENDPOINTS.GROUP.UPLOAD_COVER.replace(':id', groupId), {
    method: 'PUT',
    body: formData,
  });
};
