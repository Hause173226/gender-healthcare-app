// import axiosInstance from "./api";

// // Types for forum data
// export type ForumPost = {
//   _id: {
//     $oid: string;
//   };
//   title: string;
//   content: string;
//   category: string;
//   tags: string[];
//   accountId: {
//     $oid: string;
//   };
//   voteUp: string[];
//   voteDown: string[];
//   viewCount: number;
//   answerCount: number;
//   status: string;
//   createdAt: {
//     $date: string;
//   };
//   updatedAt: {
//     $date: string;
//   };
//   isAnonymous?: boolean;
// };

// export type Comment = {
//   id: string;
//   postId: string;
//   author: string;
//   content: string;
//   timestamp: string;
//   isExpert?: boolean;
//   likes: number;
//   dislikes: number;
// };

// // Type definitions for parameters
// export type PostParams = {
//   filter?: string;
//   category?: string;
//   page?: number;
//   limit?: number;
//   type?: 'all' | 'questions' | 'expert' | 'following' | 'myPosts';
//   accountId?: string;
//   sort?: string;
// };

// export type VoteData = {
//   type: 'up' | 'down' | 'like' | 'dislike';
// };

// export type PostData = {
//   title: string;
//   content: string;
//   category: string;
//   tags: string[];
//   isAnonymous?: boolean;
// };

// export type CommentData = {
//   content: string;
//   isAnonymous?: boolean;
// };

// export type ReplyData = {
//   content: string;
//   isAnonymous?: boolean;
// };

// // Using Axios types directly to avoid compatibility issues
// import { AxiosResponse } from 'axios';

// // Helper function to handle API errors
// const handleApiRequest = async <T>(apiCall: () => Promise<AxiosResponse<T>>): Promise<AxiosResponse<T>> => {
//   try {
//     const response = await apiCall();
//     return response;
//   } catch (error: any) {
//     console.error('API Error:', error.response?.data || error.message);
    
//     // Check if it's a network error (API server not running)
//     if (error && !error.response) {
//       console.error(`Cannot connect to API server. Please check if it's running.`);
//     }
    
//     throw error;
//   }
// };

// export const forumService = {
//   // Posts 
//   getPosts: (params: PostParams) => handleApiRequest(() => axiosInstance.get('/posts', { params })),
//   getPostById: (id: string) => handleApiRequest(() => axiosInstance.get(`/posts/${id}`)),
//   createPost: (data: PostData) => handleApiRequest(() => axiosInstance.post('/posts', data)),
//   updatePost: (id: string, data: Partial<PostData>) => handleApiRequest(() => axiosInstance.put(`/posts/${id}`, data)),
//   deletePost: (id: string) => handleApiRequest(() => axiosInstance.delete(`/posts/${id}`)),
//   votePost: (postId: string, data: VoteData) => handleApiRequest(() => axiosInstance.post(`/posts/${postId}/vote`, data)),
//   incrementView: (postId: string) => handleApiRequest(() => axiosInstance.patch(`/posts/${postId}/view`)),
  
//   // Comments
//   getCommentsByPostId: (postId: string, accountId?: string, page = 1, limit = 10) => 
//     handleApiRequest(() => axiosInstance.get(`/posts/${postId}/comments`, { params: { accountId, page, limit } })),
//   addComment: (postId: string, data: CommentData) => handleApiRequest(() => axiosInstance.post(`/posts/${postId}/comments`, data)),
//   replyToComment: (commentId: string, data: ReplyData) => handleApiRequest(() => axiosInstance.post(`/comments/${commentId}/replies`, data)),
//   voteComment: (commentId: string, data: VoteData) => handleApiRequest(() => axiosInstance.post(`/comments/${commentId}/vote`, data)),
//   getCommentReplies: (commentId: string) => handleApiRequest(() => axiosInstance.get(`/comments/${commentId}/replies`)),
  
//   // Moderation (for admin user)
//   getPendingPosts: (page = 1, limit = 10) => handleApiRequest(() => axiosInstance.get('/moderation/posts/pending', { params: { page, limit } })),
//   getPostsByStatus: (status: string, page = 1, limit = 10) => handleApiRequest(() => axiosInstance.get(`/moderation/posts/${status}`, { params: { page, limit } })),
//   approvePost: (postId: string) => handleApiRequest(() => axiosInstance.post(`/moderation/posts/${postId}/approve`)),
//   rejectPost: (postId: string, reason: string) => handleApiRequest(() => axiosInstance.post(`/moderation/posts/${postId}/reject`, { reason })),
//   flagPost: (postId: string, reason: string) => handleApiRequest(() => axiosInstance.post(`/moderation/posts/${postId}/flag`, { reason })),
//   getPendingComments: (page = 1, limit = 10) => handleApiRequest(() => axiosInstance.get('/moderation/comments/pending', { params: { page, limit } })),
//   getCommentsByStatus: (status: string, page = 1, limit = 10) => handleApiRequest(() => axiosInstance.get(`/moderation/comments/${status}`, { params: { page, limit } })),
//   approveComment: (commentId: string) => handleApiRequest(() => axiosInstance.post(`/moderation/comments/${commentId}/approve`)),
//   rejectComment: (commentId: string, reason: string) => handleApiRequest(() => axiosInstance.post(`/moderation/comments/${commentId}/reject`, { reason })),
//   flagComment: (commentId: string, reason: string) => handleApiRequest(() => axiosInstance.post(`/moderation/comments/${commentId}/flag`, { reason })),
//   getModerationStats: () => handleApiRequest(() => axiosInstance.get('/moderation/stats')),
  
//   // Community Stats
//   getCommunityStats: () => handleApiRequest(() => axiosInstance.get('/stats/community')),
  
//   // Helper methods
//   getCategories: () => [
//     "General Health",
//     "Reproductive Health",
//     "STI Prevention",
//     "Pregnancy & Family Planning",
//     "Menstrual Health",
//     "Mental Health",
//   ],
  
//   getSuggestedTags: () => [
//     "advice",
//     "support",
//     "question",
//     "experience",
//     "tips",
//     "resources",
//     "pregnancy",
//     "contraception",
//     "testing",
//     "symptoms",
//     "treatment",
//     "mental-health",
//     "anxiety",
//     "depression",
//     "relationships",
//   ],
  
//   getSortOptions: () => [
//     { value: "newest", label: "Newest" },
//     { value: "popular", label: "Most Popular" },
//     { value: "votes", label: "Most Votes" }
//   ],
  
//   // These legacy methods are maintained for backward compatibility
//   getAllPosts: async () => {
//     const response = await handleApiRequest(() => axiosInstance.get("/posts"));
//     return response.data;
//   },
  
//   getPostsByFilter: async (filter: 'trending' | 'most-viewed' | 'all') => {
//     const response = await handleApiRequest(() => axiosInstance.get('/posts', { 
//       params: { filter } 
//     }));
//     return response.data;
//   },
  
//   getPostsByCategory: async (category: string) => {
//     const response = await handleApiRequest(() => axiosInstance.get('/posts', { 
//       params: { category } 
//     }));
//     return response.data;
//   },
  
//   searchPosts: async (query: string) => {
//     const response = await handleApiRequest(() => 
//       axiosInstance.get('/posts/search', { 
//         params: { q: query } 
//       })
//     );
//     return response.data;
//   },
  
//   getComments: async (postId: string) => {
//     const response = await handleApiRequest(() => 
//       axiosInstance.get(`/posts/${postId}/comments`)
//     );
//     return response.data;
//   }
// };
