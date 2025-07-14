import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl, Switch, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Search, MessageCircle, Clock, Heart, ChevronUp, ChevronDown, Award,
  Share2, ExternalLink, Mail, Copy, Eye, Plus, Filter, TrendingUp,
  Users, CheckCircle, SortDescIcon, SortAsc, X, Send,
  ThumbsDown,
  ThumbsUp
} from 'lucide-react-native';
import forumAPI, { ForumPost, Comment } from '@/services/forumAPI';
import { CreatePostModal } from '@/components/CreatePostModal';
import { PostCard } from '@/components/forum/PostCard';
import { PostDetail } from '@/components/forum/PostDetail';

// Helper function to get post ID consistently regardless of format
const getPostId = (post: any): string | null => {
  if (!post || !post._id) return null;
  
  // Handle different possible _id formats
  if (typeof post._id === 'string') {
    return post._id;
  } else if (post._id.$oid) {
    return post._id.$oid;
  } else if (typeof post._id === 'object') {
    // Try to convert to string if possible
    return String(post._id);
  }
  return null;
};

// Helper function to get user name from accountId
const getUserName = (accountId: any): string => {
  if (!accountId) return "Unknown User";
  
  if (typeof accountId === 'string') {
    return "User";  // If we only have the ID, we don't know the name
  } else if (typeof accountId === 'object') {
    if (accountId.name) {
      return accountId.name;
    } else if (accountId._id) {
      return "User " + accountId._id.toString().substring(0, 5);
    }
  }
  
  return "Unknown User";
};

export default function ForumScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const urlPostId = params.postId as string | undefined;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'newest' | 'popular' | 'votes'>('newest');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(urlPostId || null);
  const [selectedPostDetail, setSelectedPostDetail] = useState<ForumPost | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [replyingToComment, setReplyingToComment] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyIsAnonymous, setReplyIsAnonymous] = useState(false);
  
  // Active tab state
  const [activeTab, setActiveTab] = useState<'all' | 'questions' | 'expert' | 'following' | 'myPosts'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [communityStats, setCommunityStats] = useState({
    activeMembers: 0,
    discussions: 0,
    expertAnswers: 0,
  });
  
  // State for API data
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentReplies, setCommentReplies] = useState<Record<string, Comment[]>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  
  // User state
  const [accountId, setAccountId] = useState<string | null>(null);
  
  // Fetch initial data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userId = await AsyncStorage.getItem('user');
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setAccountId(user._id || userId);
        } else {
          setAccountId(userId);
        }
        fetchCommunityStats();
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Function to fetch community stats
  const fetchCommunityStats = async () => {
    try {
      const response = await forumAPI.getCommunityStats();
      if (response && response.data) {
        setCommunityStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching community stats:", error);
      // Set dummy data on failure for better UX
      setCommunityStats({
        activeMembers: 1250,
        discussions: 578,
        expertAnswers: 142,
      });
    }
  };

  // Fetch forum data
  const fetchForumData = useCallback(async (isRefreshing = false) => {
    if (loading && !isRefreshing) return;

    if (!isRefreshing) setLoading(true);
    
    const page = isRefreshing ? 1 : currentPage;
    
    try {
      const params: any = {
        page,
        limit: 10,
        sort: activeFilter,
        search: searchQuery,
      };

      // Set type based on active tab
      switch (activeTab) {
        case 'questions':
          // Questions: hiển thị câu hỏi chưa được chuyên gia(counselor) trả lời
          params.type = 'questions';
          break;
        case 'expert':
          // Expert Answers: hiển thị câu hỏi được chuyên gia(counselor) trả lời
          params.type = 'expert';
          break;
        case 'following':
          // Following: những câu hỏi mà accountId khi login đó voted up
          if (accountId) {
            params.type = 'following';
            params.accountId = accountId;
          } else {
            setForumPosts([]);
            setLoading(false);
            if (isRefreshing) setRefreshing(false);
            return;
          }
          break;
        case 'myPosts':
          // My Posts: hiển thị những bài đăng của người dùng hiện tại
          if (accountId) {
            params.type = 'myPosts';
            params.accountId = accountId;
          } else {
            setForumPosts([]);
            setLoading(false);
            if (isRefreshing) setRefreshing(false);
            return;
          }
          break;
        default:
          params.type = 'all';
          break;
      }
      
      // console.log('Fetching posts with params:', params);
      const response = await forumAPI.getPosts(params);
      // console.log('API Response:', response);
      
      let newPosts: ForumPost[] = [];
      let pagination = null;
      
      // Handle different response formats based on web implementation
      if (response && response.data) {
        // First try standard API format with data property
        if (response.data.posts && Array.isArray(response.data.posts)) {
          newPosts = response.data.posts;
          pagination = response.data.pagination;
        } 
        // Try posts property (used in web version)
        else if (response.data.data && Array.isArray(response.data.data)) {
          newPosts = response.data.data;
          pagination = response.data.pagination;
        } 
        // Handle if data is directly an array
        else if (Array.isArray(response.data)) {
          newPosts = response.data;
        }
      }
      
      // Filter out posts without valid IDs
      const validPosts = newPosts.filter(post => getPostId(post));

      // Update posts state
      if (isRefreshing) {
        setForumPosts(validPosts);
      } else {
        setForumPosts(prev => [...prev, ...validPosts]);
      }
      
      // Handle pagination
      if (pagination) {
        setHasMorePosts(pagination.page < pagination.pages);
        setCurrentPage(pagination.page + 1);
      } else {
        setHasMorePosts(validPosts.length === params.limit);
        if(validPosts.length > 0) setCurrentPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error fetching forum data:', error);
      Alert.alert(
        'Connection Error', 
        'Unable to load forum data. Please check your network connection and try again.',
        [{ text: 'Close' }, { text: 'Retry', onPress: () => fetchForumData(isRefreshing) }]
      );
    } finally {
      setLoading(false);
      if (isRefreshing) setRefreshing(false);
    }
  }, [currentPage, activeFilter, searchQuery, activeTab, accountId, loading]);
  
  // Handle refreshing the forum
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMorePosts(true);
    fetchForumData(true);
  }, [fetchForumData]);
  
  useEffect(() => {
    onRefresh();
  }, [activeFilter, activeTab]);

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      setHasMorePosts(true);
      fetchForumData(true);
    }, 500); // 500ms debounce
    return () => clearTimeout(handler);
  }, [searchQuery]);
  
  
  // Fetch comments when a post is selected
  const fetchComments = useCallback(async () => {
    if (selectedPostId) {
      setLoadingComments(true);
      try {
        // First increment the view counter
        await forumAPI.incrementView(selectedPostId);
        
        // Fetch both post details and comments in parallel
        const [postResponse, commentsResponse] = await Promise.all([
          forumAPI.getPostById(selectedPostId),
          forumAPI.getCommentsByPostId(selectedPostId, accountId || undefined)
        ]);
        
        // console.log('Post API response:', postResponse);
        // console.log('Comments API response:', commentsResponse.data);
        
        // Handle post data - check for different response formats
        let post = null;
        if (postResponse?.data?.data) {
          post = postResponse.data.data;
        } else if (postResponse?.data?.post) {
          post = postResponse.data.post;
        } else if (postResponse?.data) {
          post = postResponse.data;
        }
        
        // Handle comments data - check for different response formats
        let commentsList: Comment[] = [];
        if (commentsResponse?.data?.data) {
          commentsList = commentsResponse.data.data;
        } else if (commentsResponse?.data?.comments) {
          commentsList = commentsResponse.data.comments;
        } else if (Array.isArray(commentsResponse?.data)) {
          commentsList = commentsResponse.data;
        } else if (commentsResponse?.data) {
          // Try to extract comments from any available property
          const dataKeys = Object.keys(commentsResponse.data);
          for (const key of dataKeys) {
            if (Array.isArray(commentsResponse.data[key])) {
              commentsList = commentsResponse.data[key];
              break;
            }
          }
        }

        // console.log('Extracted comments:', commentsList);

        if (post) {
          // console.log('Post details loaded:', post);
          setSelectedPostDetail(post);
          
          // Filter out invalid comments and set to state
          const validComments = commentsList.filter((c: Comment) => c && c._id);
          // console.log('Valid comments to be set:', validComments);
          setComments(validComments);
          
          // Update the post in the list if it exists to reflect new view count
          setForumPosts(prevPosts => 
            prevPosts.map((p) => 
              getPostId(p) === selectedPostId ? { 
                ...p, 
                viewCount: post.viewCount, 
                answerCount: post.answerCount || commentsList.length 
              } : p
            )
          );
        } else {
          console.error('Invalid post data format:', postResponse);
          Alert.alert('Error', 'Post details could not be loaded correctly.');
        }
      } catch (error) {
        console.error('Error fetching post comments:', error);
        Alert.alert('Error', 'Could not load comments. Please try again.', [
          { text: 'Close' }, 
          { text: 'Retry', onPress: fetchComments }
        ]);
      } finally {
        setLoadingComments(false);
      }
    } else {
      setComments([]);
      setSelectedPostDetail(null);
    }
  }, [selectedPostId, accountId]);
  
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Format date function
  const formatDate = (dateInput: string | { $date: string } | Date) => {
    let dateString: string;
    
    if (dateInput instanceof Date) {
      dateString = dateInput.toISOString();
    } else if (typeof dateInput === 'object' && dateInput.$date) {
      dateString = dateInput.$date;
    } else if (typeof dateInput === 'string') {
      dateString = dateInput;
    } else {
      console.warn('Invalid date format:', dateInput);
      return 'Invalid Date';
    }
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return 'Invalid Date';
    }
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffSeconds = Math.floor(diffTime / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  // Handle submitting a new comment with optimistic updates
  const handleSubmitComment = async () => {
    if (newComment.trim() === '' || !selectedPostId || !accountId) return;
    
    // Keep a copy of the comment text before clearing
    const commentText = newComment.trim();
    const isAnonymousValue = isAnonymous;
    
    // --- STEP 1: PREPARE OPTIMISTIC COMMENT ---
    const tempId = `temp-${Date.now()}`;
    const optimisticComment: Comment = {
      _id: tempId,
      content: commentText,
      postId: selectedPostId,
      accountId: typeof accountId === 'string' 
        ? { _id: accountId, name: 'You' } 
        : { _id: accountId, name: 'You' },
      voteUp: [],
      voteDown: [],
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isAnonymous: isAnonymousValue
    };
    
    // --- STEP 2: IMMEDIATELY UPDATE UI ---
    // Clear input field right away for better UX
    setNewComment('');
    
    // Add optimistic comment to the top of the list
    setComments(prevComments => [optimisticComment, ...prevComments]);
    
    try {
      // --- STEP 3: MAKE API CALL IN BACKGROUND ---
      const commentData = {
        content: commentText,
        isAnonymous: isAnonymousValue,
        accountId
      };
      
      const response = await forumAPI.addComment(selectedPostId, commentData);
      
      // Handle the response
      let serverComment = null;
      if (response?.data?.comment) {
        serverComment = response.data.comment;
      } else if (response?.data) {
        serverComment = response.data;
      }
      
      if (serverComment) {
        // Replace the optimistic comment with the real one from server
        setComments(prevComments => prevComments.map(comment => 
          comment._id === tempId ? serverComment : comment
        ));
      } else {
        // If we can't extract the comment from response, refresh all comments
        await fetchComments();
      }
      
      // Update answer count in post list
      if (selectedPostDetail) {
        const updatedPost = {
          ...selectedPostDetail,
          answerCount: (selectedPostDetail.answerCount || 0) + 1
        };
        
        // Update in the post list
        setForumPosts(prevPosts => prevPosts.map(p => 
          getPostId(p) === selectedPostId ? updatedPost : p
        ));
        
        // Update selected post detail
        setSelectedPostDetail(updatedPost);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      
      // --- STEP 4: HANDLE ERROR AND ROLLBACK ---
      // Remove the optimistic comment
      setComments(prevComments => prevComments.filter(comment => comment._id !== tempId));
      
      // Restore comment text in case user wants to retry
      setNewComment(commentText);
      
      Alert.alert(
        'Error', 
        'Unable to post comment. Please try again.', 
        [{ text: 'Close' }, { text: 'Retry', onPress: handleSubmitComment }]
      );
    }
  };
  
  // Handle post voting with optimistic updates
  const handlePostVote = async (postId: string, voteType: 'up' | 'down') => {
    if (!accountId) {
      Alert.alert('Login Required', 'You need to be logged in to vote.');
      return;
    }

    // --- STEP 1: SAVE ORIGINAL STATE FOR ROLLBACK IF NEEDED ---
    const originalPosts = [...forumPosts];
    const originalSelectedPost = selectedPostDetail ? { ...selectedPostDetail } : null;

    try {
      // Determine if this is a toggle (clicking same vote type again)
      const post = forumPosts.find(p => getPostId(p) === postId);
      if (!post) return;
      
      const userVote = accountId ? (post.voteUp?.includes(accountId) ? 'up' : 
                                  (post.voteDown?.includes(accountId) ? 'down' : null)) : null;
      const isToggling = userVote === voteType;
      
      // If toggling, we'll send null to remove the vote
      const voteTypeToSend = isToggling ? null : voteType;
      
      // --- STEP 2: IMMEDIATE OPTIMISTIC UI UPDATE ---
      const updatedPosts = forumPosts.map(p => {
        if (getPostId(p) === postId) {
          let voteUp = [...(p.voteUp || [])];
          let voteDown = [...(p.voteDown || [])];
          
          // Remove user from both vote lists first
          const indexUp = voteUp.indexOf(accountId);
          if (indexUp > -1) voteUp.splice(indexUp, 1);
          
          const indexDown = voteDown.indexOf(accountId);
          if (indexDown > -1) voteDown.splice(indexDown, 1);
          
          // Add user to appropriate list if not toggling off
          if (voteTypeToSend === 'up') voteUp.push(accountId);
          if (voteTypeToSend === 'down') voteDown.push(accountId);
          
          return { ...p, voteUp, voteDown };
        }
        return p;
      });
      
      // Update UI immediately
      setForumPosts(updatedPosts);
      
      // Also update the selected post detail if this is the active post
      if (selectedPostId === postId) {
        const updatedPost = updatedPosts.find(p => getPostId(p) === postId);
        if (updatedPost) setSelectedPostDetail(updatedPost);
      }
      
      // --- STEP 3: MAKE API CALL IN BACKGROUND ---
      const response = await forumAPI.votePost(postId, { voteType: voteTypeToSend, accountId });
      
      // Update with server response data (to ensure consistency)
      if (response?.data?.post) {
        const serverPost = response.data.post;
        
        // Preserve the original post structure while updating the vote counts
        setForumPosts(prev => prev.map(p => {
          if (getPostId(p) === postId) {
            // Merge the server response with the original post to preserve structure
            return {
              ...p,
              voteUp: serverPost.voteUp || p.voteUp,
              voteDown: serverPost.voteDown || p.voteDown,
              // Keep other properties from server that might have changed
              viewCount: serverPost.viewCount || p.viewCount,
              answerCount: serverPost.answerCount || p.answerCount
            };
          }
          return p;
        }));
        
        // Also update the selected post detail if this is the active post
        if (selectedPostId === postId && selectedPostDetail) {
          setSelectedPostDetail({
            ...selectedPostDetail,
            voteUp: serverPost.voteUp || selectedPostDetail.voteUp,
            voteDown: serverPost.voteDown || selectedPostDetail.voteDown,
            // Keep other properties from server that might have changed
            viewCount: serverPost.viewCount || selectedPostDetail.viewCount,
            answerCount: serverPost.answerCount || selectedPostDetail.answerCount
          });
        }
      }
    } catch (error) {
      console.error(`Error ${voteType}-voting post:`, error);
      Alert.alert('Error', 'Could not register your vote. Please try again.');
      
      // --- STEP 4: ROLLBACK ON ERROR ---
      // Restore original state if API call fails
      setForumPosts(originalPosts);
      if (selectedPostId === postId && originalSelectedPost) {
        setSelectedPostDetail(originalSelectedPost);
      }
    }
  };
  
  // Find the selected post
  const selectedPost: ForumPost | null = selectedPostDetail || 
    (selectedPostId ? forumPosts.find(post => getPostId(post) === selectedPostId) || null : null);
  
  // Thêm một useEffect để tự động tải chi tiết bài đăng nếu có selectedPostId từ URL
  useEffect(() => {
    if (urlPostId) {
      setSelectedPostId(urlPostId);
    }
  }, [urlPostId]);
  
  // Handle tab change to reset posts
  useEffect(() => {
    if (activeTab === 'following' || activeTab === 'myPosts') {
      if (!accountId) {
        setForumPosts([]);
      }
    }
  }, [activeTab, accountId]);

  // Handle comment voting with optimistic updates
  const handleCommentVote = async (commentId: string, voteType: 'up' | 'down') => {
    if (!accountId) {
      Alert.alert('Login Required', 'Please log in to vote on comments.');
      return;
    }
    
    // --- STEP 1: SAVE ORIGINAL STATE FOR ROLLBACK IF NEEDED ---
    const originalComments = [...comments];
    
    try {
      // Find the current comment in state
      const originalComment = comments.find(c => c._id === commentId);
      if (!originalComment) return;

      // --- STEP 2: IMMEDIATE OPTIMISTIC UI UPDATE ---
      const updatedComments = comments.map(comment => {
        if (comment._id === commentId) {
          // Make copies of vote arrays to avoid mutating state
          let voteUp = [...(comment.voteUp || [])];
          let voteDown = [...(comment.voteDown || [])];
          
          // Check if user already voted
          const userVote = accountId ? (
            voteUp.includes(accountId) ? 'up' : 
            (voteDown.includes(accountId) ? 'down' : null)
          ) : null;
          
          const isToggling = userVote === voteType;
          
          // Remove previous votes
          const indexUp = voteUp.indexOf(accountId);
          if (indexUp > -1) voteUp.splice(indexUp, 1);
          
          const indexDown = voteDown.indexOf(accountId);
          if (indexDown > -1) voteDown.splice(indexDown, 1);
          
          // Add new vote if not toggling off
          if (!isToggling) {
            if (voteType === 'up') voteUp.push(accountId);
            if (voteType === 'down') voteDown.push(accountId);
          }
          
          return { ...comment, voteUp, voteDown };
        }
        return comment;
      });
      
      // Update state with optimistic changes immediately
      setComments(updatedComments);
      
      // --- STEP 3: MAKE API CALL IN BACKGROUND ---
      // Determine vote type to send (null if toggling off)
      const commentUserVote = originalComment.voteUp?.includes(accountId) ? 'up' : 
                            (originalComment.voteDown?.includes(accountId) ? 'down' : null);
      const isToggling = commentUserVote === voteType;
      const voteTypeToSend = isToggling ? null : voteType;
      
      const response = await forumAPI.voteComment(commentId, { 
        voteType: voteTypeToSend, 
        accountId 
      });
      
      // Handle different response formats
      let serverComment = null;
      if (response?.data?.comment) {
        serverComment = response.data.comment;
      } else if (response?.data) {
        serverComment = response.data;
      }
      
      if (serverComment) {
        // Preserve original comment structure while updating vote counts
        setComments(prev => prev.map(comment => {
          if (comment._id === commentId && originalComment) {
            return {
              ...originalComment, // Keep original structure
              voteUp: serverComment.voteUp || originalComment.voteUp,
              voteDown: serverComment.voteDown || originalComment.voteDown,
            };
          }
          return comment;
        }));
      }
    } catch (error) {
      console.error(`Error ${voteType}-voting comment:`, error);
      Alert.alert('Error', 'Could not register your vote. Please try again.');
      
      // --- STEP 4: ROLLBACK ON ERROR ---
      setComments(originalComments);
    }
  };
  
  // Fetch replies for a comment
  const fetchCommentReplies = async (commentId: string) => {
    setLoadingReplies(prev => ({ ...prev, [commentId]: true }));
    try {
      // console.log(`Fetching replies for comment: ${commentId}`);
      const response = await forumAPI.getCommentReplies(commentId);
      // console.log('Comment replies API response:', response);
      
      // Handle different response formats
      let repliesList = [];
      if (response?.data) {
        if (response.data.replies && Array.isArray(response.data.replies)) {
          repliesList = response.data.replies;
        } else if (Array.isArray(response.data)) {
          repliesList = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          repliesList = response.data.data;
        } else {
          // Try to find any array in the response
          const dataKeys = Object.keys(response.data);
          for (const key of dataKeys) {
            if (Array.isArray(response.data[key])) {
              repliesList = response.data[key];
              break;
            }
          }
        }
      }
      
      // console.log(`Extracted ${repliesList.length} replies for comment ${commentId}`);
      
      // Filter out invalid replies and ensure proper date format
      const validReplies = repliesList.filter((reply: any) => reply && reply._id).map((reply: any) => {
        // Ensure reply has proper date format
        if (reply.createdAt && typeof reply.createdAt === 'string') {
          const date = new Date(reply.createdAt);
          if (isNaN(date.getTime())) {
            // If date is invalid, use current date
            reply.createdAt = new Date().toISOString();
          }
        } else if (!reply.createdAt) {
          // If no createdAt, add current date
          reply.createdAt = new Date().toISOString();
        }
        return reply;
      });
      
      // Update state
      setCommentReplies(prev => ({ ...prev, [commentId]: validReplies }));
    } catch (error) {
      console.error('Error fetching comment replies:', error);
      Alert.alert('Error', 'Could not load replies. Please try again.');
    } finally {
      setLoadingReplies(prev => ({ ...prev, [commentId]: false }));
    }
  };

  // Handle submitting a reply to a comment with optimistic updates
  const handleSubmitReply = async (commentId: string) => {
    if (replyContent.trim() === '' || !accountId || !selectedPostId) return;
    
    // Store values before clearing
    const replyText = replyContent.trim();
    const isAnonymousValue = replyIsAnonymous;
    
    // --- STEP 1: PREPARE OPTIMISTIC REPLY ---
    const tempId = `temp-reply-${Date.now()}`;
    const optimisticReply: Comment = {
      _id: tempId,
      content: replyText,
      postId: selectedPostId,
      accountId: typeof accountId === 'string' 
        ? { _id: accountId, name: 'You' } 
        : { _id: accountId, name: 'You' },
      voteUp: [],
      voteDown: [],
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isAnonymous: isAnonymousValue
    };
    
    // --- STEP 2: IMMEDIATELY UPDATE UI ---
    setReplyContent('');
    setReplyingToComment(null);
    setCommentReplies(prev => {
      const currentReplies = prev[commentId] || [];
      return {
        ...prev,
        [commentId]: [...currentReplies, optimisticReply]
      };
    });
    setExpandedComments(prev => ({ ...prev, [commentId]: true }));
    
    try {
      // --- STEP 3: MAKE API CALL IN BACKGROUND ---
      const replyData = {
        content: replyText,
        isAnonymous: isAnonymousValue,
        accountId,
        postId: selectedPostId
      };
      
      const response = await forumAPI.replyToComment(commentId, replyData);
      
      // Handle different response formats
      let serverReply: Comment | null = null;
      if (response?.data?.reply) {
        serverReply = response.data.reply;
      } else if (response?.data) {
        serverReply = response.data;
      }
      
      if (serverReply) {
        // Merge missing fields from optimisticReply if needed
        serverReply = { ...optimisticReply, ...serverReply };
        // Ensure the server reply has proper date format
        if (serverReply.createdAt && typeof serverReply.createdAt === 'string') {
          const date = new Date(serverReply.createdAt);
          if (isNaN(date.getTime())) {
            serverReply.createdAt = new Date().toISOString();
          }
        } else if (!serverReply.createdAt) {
          serverReply.createdAt = new Date().toISOString();
        }
        // Replace optimistic reply with server reply
        setCommentReplies(prev => {
          const currentReplies = prev[commentId] || [];
          return {
            ...prev,
            [commentId]: currentReplies.map(reply =>
              reply._id === tempId && serverReply ? serverReply : reply
            )
          };
        });
        // Optionally: update reply count for parent comment in comments array
        setComments(prev =>
          prev.map(c =>
            c._id === commentId && serverReply
              ? { ...c, replies: [...((c.replies as any) || []), serverReply] }
              : c
          )
        );
      }
      // Nếu không có serverReply thì giữ optimistic reply, không fetch lại toàn bộ replies/comments
    } catch (error) {
      // --- STEP 4: HANDLE ERROR AND ROLLBACK ---
      setCommentReplies(prev => {
        const currentReplies = prev[commentId] || [];
        return {
          ...prev,
          [commentId]: currentReplies.filter(reply => reply._id !== tempId)
        };
      });
      setReplyContent(replyText);
      setReplyingToComment(commentId);
      Alert.alert(
        'Error',
        'Could not post reply. Please try again.',
        [{ text: 'Close' }, { text: 'Retry', onPress: () => handleSubmitReply(commentId) }]
      );
    }
  };

  // Handle tab change
  const handleTabChange = (tab: 'all' | 'questions' | 'expert' | 'following' | 'myPosts') => {
    if (tab === activeTab) return;
    
    setActiveTab(tab);
    setSelectedPostId(null); // Reset selected post when changing tabs
    setCurrentPage(1); // Reset pagination
    setHasMorePosts(true);
    setSearchQuery(''); // Reset search when changing tabs
    
    if ((tab === 'following' || tab === 'myPosts') && !accountId) {
      // setForumPosts([]);
      setLoading(false);
    } else {
      setRefreshing(true);
      // fetchForumData(true); // Refresh data with new tab
    }
  };

  // Handle load more posts
  const handleLoadMore = () => {
    if (!loading && hasMorePosts && !refreshing) {
      console.log('Loading more posts...');
      fetchForumData();
    }
  };

  // Handle post creation success with optimistic feedback
  const handlePostCreated = (newPost?: ForumPost) => {
    setShowCreateModal(false);
    
    // Show immediate success feedback
    Alert.alert('Success', 'Your post has been submitted for review!');
    
    // If we have the new post data, we can add it to the list with "pending" status
    if (newPost && accountId) {
      const optimisticPost: ForumPost = {
        ...newPost,
        _id: `temp-post-${Date.now()}`,
        voteUp: [],
        voteDown: [],
        viewCount: 0,
        answerCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statusInfo: {
          isPending: true,
          isApproved: false,
          isRejected: false,
          statusText: 'Pending Review'
        },
        status: 'pending'
      };
      
      // Add to the top of the list if user is on "myPosts" tab
      if (activeTab === 'myPosts') {
        setForumPosts(prevPosts => [optimisticPost, ...prevPosts]);
      }
    }
    
    // Still refresh data to ensure consistency
    setCurrentPage(1);
    setHasMorePosts(true);
    fetchForumData(true);
  };

  // Effect to refresh data when accountId changes
  useEffect(() => {
    if (accountId && (activeTab === 'following' || activeTab === 'myPosts')) {
      console.log('AccountId changed, refreshing data for tab:', activeTab);
      setCurrentPage(1);
      setHasMorePosts(true);
      fetchForumData(true);
    }
  }, [accountId]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-3 pb-2 shadow-sm">
         <View className="flex-row justify-between items-center mb-3">
          <Text className="text-2xl font-bold text-healthcare-primary">Health Forum</Text>
          {accountId && (
            <TouchableOpacity 
              className="bg-healthcare-primary rounded-full w-10 h-10 items-center justify-center"
              onPress={() => setShowCreateModal(true)}
            >
              <Plus size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        <Input
            placeholder="Search in forum..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Search size={18} color="#9ca3af" />}
            className="bg-gray-100"
        />
        {/* ... Tabs from your code ... */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="my-3">
             {['all', 'questions', 'expert', 'following', 'myPosts'].map(tab => (
                 <TouchableOpacity key={tab} onPress={() => handleTabChange(tab as any)} className={`px-4 py-2 mr-2 rounded-full ${activeTab === tab ? 'bg-healthcare-primary' : 'bg-gray-100'}`}>
                    <Text className={`font-medium capitalize ${activeTab === tab ? 'text-white' : 'text-gray-700'}`}>{tab.replace('myPosts', 'My Posts')}</Text>
                 </TouchableOpacity>
             ))}
        </ScrollView>
      </View>

      {/* Content */}
      <View className="flex-1">
        {selectedPostId ? (
          <PostDetail
            post={selectedPost}
            accountId={accountId}
            comments={comments}
            loadingComments={loadingComments}
            fetchComments={fetchComments}
            formatDate={formatDate}
            getUserName={getUserName}
            handlePostVote={handlePostVote}
            handleCommentVote={handleCommentVote}
            replyingToComment={replyingToComment}
            setReplyingToComment={setReplyingToComment}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            replyIsAnonymous={replyIsAnonymous}
            setReplyIsAnonymous={setReplyIsAnonymous}
            handleSubmitReply={handleSubmitReply}
            expandedComments={expandedComments}
            setExpandedComments={setExpandedComments}
            commentReplies={commentReplies}
            fetchCommentReplies={fetchCommentReplies}
            loadingReplies={loadingReplies}
            setSelectedPostId={setSelectedPostId}
            newComment={newComment}
            setNewComment={setNewComment}
            handleSubmitComment={handleSubmitComment}
          />
        ) : (
          <FlatList
            data={forumPosts}
            keyExtractor={(item) => getPostId(item)!}
            renderItem={({ item }) => (
              <PostCard
                post={item}
                onPress={() => setSelectedPostId(getPostId(item))}
                accountId={accountId}
                handlePostVote={handlePostVote}
                formatDate={formatDate}
                getUserName={getUserName}
              />
            )}
            contentContainerStyle={{ padding: 16, paddingTop: 8 }}
            showsVerticalScrollIndicator={false}
            onRefresh={onRefresh}
            refreshing={refreshing}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
                loading && !refreshing ? (
                    <View className="py-6"><ActivityIndicator color="#F8BBD9" size="large" /></View>
                ) : !hasMorePosts && forumPosts.length > 0 ? (
                    <Text className="text-center text-gray-400 py-6">You've reached the end.</Text>
                ) : null
            }
            ListEmptyComponent={
                !loading ? (
                    <View className="py-10 px-6 items-center">
                        {activeTab === 'following' && !accountId ? (
                            <>
                                <Text className="text-center text-gray-600 mb-3">Please log in to see posts you've upvoted.</Text>
                                <Button title="Explore all posts" variant="outline" onPress={() => handleTabChange('all')} />
                            </>
                        ) : activeTab === 'following' && accountId ? (
                            <>
                                <Text className="text-center text-gray-600 mb-3">You haven't upvoted any posts yet.</Text>
                                <Button title="Explore popular discussions" variant="outline" onPress={() => handleTabChange('all')} />
                            </>
                        ) : activeTab === 'myPosts' && !accountId ? (
                            <>
                                <Text className="text-center text-gray-600 mb-3">Please log in to see your posts.</Text>
                                <Button title="Explore all posts" variant="outline" onPress={() => handleTabChange('all')} />
                            </>
                        ) : activeTab === 'myPosts' && accountId ? (
                            <>
                                <Text className="text-center text-gray-600 mb-3">You haven't created any posts yet.</Text>
                                <Button title="Create your first post" variant="outline" onPress={() => setShowCreateModal(true)} />
                            </>
                        ) : (
                            <Text className="text-center text-gray-600">No posts found.</Text>
                        )}
                    </View>
                ) : !loading && activeTab === 'myPosts' && !accountId ? (
                    <View className="py-10 px-6 items-center">
                        <Text className="text-center text-gray-600 mb-3">Please log in to see your posts.</Text>
                        <Button title="Explore all posts" variant="outline" onPress={() => handleTabChange('all')} />
                    </View>
                ) : !loading && forumPosts.length === 0 && activeTab === 'following' ? (
                    <View className="py-10 px-6 items-center">
                        <Text className="text-center text-gray-600 mb-3">You haven't upvoted any posts yet.</Text>
                        <Button title="Explore popular posts" variant="outline" onPress={() => handleTabChange('all')} />
                    </View>
                ) : !loading && forumPosts.length === 0 && activeTab === 'myPosts' ? (
                    <View className="py-10 px-6 items-center">
                        <Text className="text-center text-gray-600 mb-3">You haven't created any posts yet.</Text>
                        <Button title="Create your first post" variant="outline" onPress={() => setShowCreateModal(true)} />
                    </View>
                ) : !loading && forumPosts.length === 0 ? (
                    <View className="py-10 px-6">
                        <Text className="text-center text-gray-600">No posts found.</Text>
                    </View>
                ) : null
            }
          />
        )}
      </View>
      
      {/* Create Post Modal */}
      <CreatePostModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={handlePostCreated}
      />
    </SafeAreaView>
  );
}