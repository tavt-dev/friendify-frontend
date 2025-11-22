import { API_ENDPOINTS } from '../config/apiConfig';
import { apiFetch } from './apiHelper';

export const getMyGroups = async () => {
  return apiFetch(API_ENDPOINTS.GROUP.MY_GROUPS);
};

export const getSuggestedGroups = async () => {
  return apiFetch(API_ENDPOINTS.GROUP.SUGGESTED);
};

export const getDiscoverGroups = async () => {
  return apiFetch(API_ENDPOINTS.GROUP.DISCOVER);
};

export const getGroupDetail = async (groupId) => {
  return apiFetch(API_ENDPOINTS.GROUP.DETAIL.replace(':id', groupId));
};

export const getGroupMembers = async (groupId) => {
  return apiFetch(API_ENDPOINTS.GROUP.MEMBERS.replace(':id', groupId));
};

export const getGroupPosts = async (groupId, page = 1, size = 20) => {
  const endpoint = `${API_ENDPOINTS.GROUP.POSTS.replace(':id', groupId)}?page=${page}&size=${size}`;
  return apiFetch(endpoint);
};

export const createGroup = async (groupData) => {
  return apiFetch(API_ENDPOINTS.GROUP.CREATE, {
    method: 'POST',
    body: JSON.stringify(groupData),
  });
};

export const joinGroup = async (groupId) => {
  return apiFetch(API_ENDPOINTS.GROUP.JOIN.replace(':id', groupId), {
    method: 'POST',
  });
};

export const leaveGroup = async (groupId) => {
  return apiFetch(API_ENDPOINTS.GROUP.LEAVE.replace(':id', groupId), {
    method: 'POST',
  });
};

export const createGroupPost = async (groupId, postData) => {
  return apiFetch(API_ENDPOINTS.GROUP.POSTS.replace(':id', groupId), {
    method: 'POST',
    body: JSON.stringify(postData),
  });
};
