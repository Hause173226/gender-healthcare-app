import axiosInstance from "./api";

// Types
export type ForumPost = {
  _id: string | { $oid: string };
  title: string;
  content: string;
  category: string;
  tags: string[];
  accountId: string | { _id?: string; name?: string;image?:string; role?: string; isVerified?: boolean };
  voteUp: string[];
  voteDown: string[];
  viewCount: number;
  answerCount: number;
  status: string;
  createdAt: string | { $date: string };
  updatedAt: string | { $date: string };
  isAnonymous?: boolean;
  hasExpertAnswer?: boolean;
  statusInfo?: {
    isPending?: boolean;
    isApproved?: boolean;
    isRejected?: boolean;
    statusText?: string;
  };
};

export type Comment = {
  _id: string;
  content: string;
  accountId?: {
    _id: string;
    name: string;
    role?: string;
    image?: string;
    isVerified?: boolean;
  };
  postId: string;
  voteUp: string[];
  voteDown: string[];
  replies?: Comment[];
  status: string;
  createdAt: string;
  updatedAt: string;
  isAnonymous?: boolean;
  userVote?: 'up' | 'down' | null;
  displayVoteCount?: number;
};

export type PostParams = {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  category?: string;
  type?: 'all' | 'questions' | 'expert' | 'following' | 'myPosts';
  accountId?: string;
};

const forumAPI = {
  // Posts
  getPosts: async (params: PostParams) => {
    try {
      const response = await axiosInstance.get('/posts', { params });
      return response;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },
  
  getPostById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/posts/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching post details:', error);
      throw error;
    }
  },
  
  createPost: async (data: any) => {
    try {
      const response = await axiosInstance.post('/posts', data);
      return response;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },
  
  votePost: async (postId: string, voteData: { voteType: 'up' | 'down' | null, accountId?: string }) => {
    try {
      const response = await axiosInstance.post(`/posts/${postId}/vote`, voteData);
      return response;
    } catch (error) {
      console.error('Error voting on post:', error);
      throw error;
    }
  },
  
  incrementView: async (postId: string) => {
    try {
      const response = await axiosInstance.patch(`/posts/${postId}/view`);
      return response;
    } catch (error) {
      console.error('Error incrementing view count:', error);
      throw error;
    }
  },
  
  searchPosts: async (query: string) => {
    try {
      const response = await axiosInstance.get('/posts/search', { params: { q: query } });
      return response;
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  },
  
  // Comments
  getCommentsByPostId: async (postId: string, accountId?: string, page = 1, limit = 20) => {
    try {
      const response = await axiosInstance.get(`/posts/${postId}/comments`, {
        params: { accountId, page, limit }
      });
      return response;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },
  
  addComment: async (postId: string, commentData: any) => {
    try {
      const response = await axiosInstance.post(`/posts/${postId}/comments`, commentData);
      return response;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },
  
  getCommentReplies: async (commentId: string) => {
    try {
      const response = await axiosInstance.get(`/comments/${commentId}/replies`);
      return response;
    } catch (error) {
      console.error('Error fetching comment replies:', error);
      throw error;
    }
  },
  
  replyToComment: async (commentId: string, replyData: any) => {
    try {
      const response = await axiosInstance.post(`/comments/${commentId}/replies`, replyData);
      return response;
    } catch (error) {
      console.error('Error replying to comment:', error);
      throw error;
    }
  },
  
  voteComment: async (commentId: string, voteData: { voteType: 'up' | 'down' | null, accountId?: string }) => {
    try {
      const response = await axiosInstance.post(`/comments/${commentId}/vote`, voteData);
      return response;
    } catch (error) {
      console.error('Error voting on comment:', error);
      throw error;
    }
  },
  
  // Community Stats
  getCommunityStats: async () => {
    try {
      const response = await axiosInstance.get('/stats/community');
      return response;
    } catch (error) {
      console.error('Error fetching community stats:', error);
      throw error;
    }
  },
  
  // User-specific post APIs
  getFollowedPosts: async (accountId: string, page = 1, limit = 10) => {
    try {
      const response = await axiosInstance.get('/posts', { 
        params: { accountId, page, limit, type: 'following' } 
      });
      return response;
    } catch (error) {
      console.error('Error fetching followed posts:', error);
      throw error;
    }
  },
  
  getUserPosts: async (accountId: string, page = 1, limit = 10) => {
    try {
      const response = await axiosInstance.get('/posts', { 
        params: { accountId, page, limit, type: 'myPosts' } 
      });
      return response;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  },
  
  followPost: async (postId: string, accountId: string) => {
    try {
      const response = await axiosInstance.post(`/posts/${postId}/follow`, { accountId });
      return response;
    } catch (error) {
      console.error('Error following post:', error);
      throw error;
    }
  },
  
  unfollowPost: async (postId: string, accountId: string) => {
    try {
      const response = await axiosInstance.post(`/posts/${postId}/unfollow`, { accountId });
      return response;
    } catch (error) {
      console.error('Error unfollowing post:', error);
      throw error;
    }
  },
  
  updatePost: async (id: string, data: any) => {
  try {
    const response = await axiosInstance.put(`/posts/${id}`, data);
    return response;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
},

deletePost: async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/posts/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
},

// Moderation APIs
getPendingPosts: async (page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get('/moderation/posts/pending', { params: { page, limit } });
    return response;
  } catch (error) {
    console.error('Error getting pending posts:', error);
    throw error;
  }
},

getPostsByStatus: async (status: string, page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(`/moderation/posts/${status}`, { params: { page, limit } });
    return response;
  } catch (error) {
    console.error('Error getting posts by status:', error);
    throw error;
  }
},

approvePost: async (postId: string) => {
  try {
    const response = await axiosInstance.post(`/moderation/posts/${postId}/approve`);
    return response;
  } catch (error) {
    console.error('Error approving post:', error);
    throw error;
  }
},

rejectPost: async (postId: string, reason: string) => {
  try {
    const response = await axiosInstance.post(`/moderation/posts/${postId}/reject`, { reason });
    return response;
  } catch (error) {
    console.error('Error rejecting post:', error);
    throw error;
  }
},

flagPost: async (postId: string, reason: string) => {
  try {
    const response = await axiosInstance.post(`/moderation/posts/${postId}/flag`, { reason });
    return response;
  } catch (error) {
    console.error('Error flagging post:', error);
    throw error;
  }
},

getPendingComments: async (page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get('/moderation/comments/pending', { params: { page, limit } });
    return response;
  } catch (error) {
    console.error('Error getting pending comments:', error);
    throw error;
  }
},

getCommentsByStatus: async (status: string, page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(`/moderation/comments/${status}`, { params: { page, limit } });
    return response;
  } catch (error) {
    console.error('Error getting comments by status:', error);
    throw error;
  }
},

approveComment: async (commentId: string) => {
  try {
    const response = await axiosInstance.post(`/moderation/comments/${commentId}/approve`);
    return response;
  } catch (error) {
    console.error('Error approving comment:', error);
    throw error;
  }
},

rejectComment: async (commentId: string, reason: string) => {
  try {
    const response = await axiosInstance.post(`/moderation/comments/${commentId}/reject`, { reason });
    return response;
  } catch (error) {
    console.error('Error rejecting comment:', error);
    throw error;
  }
},

flagComment: async (commentId: string, reason: string) => {
  try {
    const response = await axiosInstance.post(`/moderation/comments/${commentId}/flag`, { reason });
    return response;
  } catch (error) {
    console.error('Error flagging comment:', error);
    throw error;
  }
},

getModerationStats: async () => {
  try {
    const response = await axiosInstance.get('/moderation/stats');
    return response;
  } catch (error) {
    console.error('Error getting moderation stats:', error);
    throw error;
  }
},

getSortOptions: () => [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "votes", label: "Most Votes" },
],

  
  // Utilities
  getCategories: () => [
    "General Health",
    "Reproductive Health",
    "STI Prevention",
    "Pregnancy & Family Planning",
    "Menstrual Health",
    "Mental Health",
  ],
  
  getSuggestedTags: () => [
    "advice",
    "support",
    "question",
    "experience",
    "tips",
    "resources",
    "pregnancy",
    "contraception",
    "testing",
    "symptoms",
    "treatment",
    "mental-health",
    "anxiety",
    "depression",
    "relationships",
  ],
};

export default forumAPI;
