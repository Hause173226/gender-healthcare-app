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
  const [submittingReply, setSubmittingReply] = useState(false);
  
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
  const [submitLoading, setSubmitLoading] = useState(false);
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
  const formatDate = (dateInput: string | { $date: string }) => {
    const dateString = typeof dateInput === 'object' && dateInput.$date ? dateInput.$date : (dateInput as string);
    const date = new Date(dateString);
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

  // Handle submitting a new comment
  const handleSubmitComment = async () => {
    if (newComment.trim() === '' || !selectedPostId || !accountId) return;
    
    setSubmitLoading(true);
    try {
      const commentData = {
        content: newComment,
        isAnonymous,
        accountId
      };
      
      await forumAPI.addComment(selectedPostId, commentData);
      
      // Clear input field
      setNewComment('');
      
      // Refresh comments to show new comment
      await fetchComments(); 
      
      // Refresh main list to update answer count
      onRefresh();
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert(
        'Error', 
        'Unable to post comment. Please try again.', 
        [{ text: 'Close' }, { text: 'Retry', onPress: handleSubmitComment }]
      );
    } finally {
      setSubmitLoading(false);
    }
  };
  
  // Handle post voting
  const handlePostVote = async (postId: string, voteType: 'up' | 'down') => {
    if (!accountId) {
      Alert.alert('Login Required', 'You need to be logged in to vote.');
      return;
    }
    
    try {
      // Determine if this is a toggle (clicking same vote type again)
      const post = forumPosts.find(p => getPostId(p) === postId);
      if (!post) return;
      
      const userVote = accountId ? (post.voteUp?.includes(accountId) ? 'up' : 
                                  (post.voteDown?.includes(accountId) ? 'down' : null)) : null;
      const isToggling = userVote === voteType;
      
      // If toggling, we'll send null to remove the vote
      const voteTypeToSend = isToggling ? null : voteType;
      
      // Optimistic UI update before API response
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
      
      setForumPosts(updatedPosts);
      
      // Also update the selected post detail if this is the active post
      if (selectedPostId === postId) {
        const updatedPost = updatedPosts.find(p => getPostId(p) === postId);
        if (updatedPost) setSelectedPostDetail(updatedPost);
      }
      
      // Make the API call
      const response = await forumAPI.votePost(postId, { voteType: voteTypeToSend, accountId });
      
      // Update with server response data
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
      
      // On error, refresh data to ensure UI is in sync with server state
      if (selectedPostId === postId) {
        fetchComments();
      } else {
        fetchForumData(true);
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

  // Handle comment voting
  const handleCommentVote = async (commentId: string, voteType: 'up' | 'down') => {
    if (!accountId) {
      Alert.alert('Login Required', 'Please log in to vote on comments.');
      return;
    }
    
    try {
      // Find the current comment in state
      const originalComment = comments.find(c => c._id === commentId);
      if (!originalComment) return;

      // Optimistically update UI before API response
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
      
      // Update state with optimistic changes
      setComments(updatedComments);
      
      // Make API call
      const response = await forumAPI.voteComment(commentId, { voteType, accountId });
      
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
      // Refresh comments to restore correct state
      fetchComments();
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
      
      // Filter out invalid replies
      const validReplies = repliesList.filter((reply: any) => reply && reply._id);
      
      // Update state
      setCommentReplies(prev => ({ ...prev, [commentId]: validReplies }));
    } catch (error) {
      console.error('Error fetching comment replies:', error);
      Alert.alert('Error', 'Could not load replies. Please try again.');
    } finally {
      setLoadingReplies(prev => ({ ...prev, [commentId]: false }));
    }
  };

  // Handle submitting a reply to a comment
  const handleSubmitReply = async (commentId: string) => {
    if (replyContent.trim() === '' || !accountId || !selectedPostId) return;
    
    setSubmittingReply(true);
    try {
      const replyData = {
        content: replyContent,
        isAnonymous: replyIsAnonymous,
        accountId,
        postId: selectedPostId
      };
      
      await forumAPI.replyToComment(commentId, replyData);
      
      // Reset input field and close reply form
      setReplyContent('');
      setReplyingToComment(null);
      
      // Fetch updated replies
      await fetchCommentReplies(commentId);
      
      // Also refresh all comments to update reply counts
      await fetchComments();
    } catch (error) {
      console.error('Error adding reply:', error);
      Alert.alert(
        'Error', 
        'Could not post reply. Please try again.', 
        [{ text: 'Close' }, { text: 'Retry', onPress: () => handleSubmitReply(commentId) }]
      );
    } finally {
      setSubmittingReply(false);
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
      setForumPosts([]);
      setLoading(false);
    } else {
      setRefreshing(true);
      fetchForumData(true); // Refresh data with new tab
    }
  };

  // Reusable Post Card Component
  const PostCard = React.memo(({ post, onPress }: { post: ForumPost, onPress: () => void }) => {
    const postId = getPostId(post);
    if (!postId) return null;

    const upVotes = post.voteUp?.length || 0;
    const userVote = accountId ? (post.voteUp?.includes(accountId) ? 'up' : (post.voteDown?.includes(accountId) ? 'down' : null)) : null;
    const authorName = post.isAnonymous ? "Anonymous" : getUserName(post.accountId);
    
    const getCategoryColor = (category: string) => {
        // ... (implementation from your code)
        switch(category) {
            case 'Reproductive Health': return 'bg-pink-100 text-pink-800';
            case 'Mental Health': return 'bg-purple-100 text-purple-800';
            //... add other cases
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    return (
        <Card className="mb-3">
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 pr-3">
                        <Text className="font-bold text-base text-gray-800">{post.title}</Text>
                        <View className="flex-row items-center mt-1">
                            <View className="flex-row items-center">
                            {!post.isAnonymous && typeof post?.accountId === 'object' && (
                                <Image 
                                    source={{ uri: post?.accountId?.image || 'https://i.imgur.com/6VBx3io.png' }} 
                                    className="w-5 h-5 rounded-full mr-2"
                                />
                            )}
                            <Text className="text-xs text-gray-600">{authorName} • {formatDate(post.createdAt)}</Text>
                        </View>
                        </View>
                    </View>
                    <View className="items-center bg-gray-50 py-1 px-2 rounded-lg">
                        <TouchableOpacity onPress={() => handlePostVote(postId, 'up')} disabled={!accountId}>
                            <ChevronUp size={18} color={userVote === 'up' ? '#F8BBD9' : '#6b7280'} />
                        </TouchableOpacity>
                        <Text className="text-sm font-bold text-green-600">{upVotes}</Text>
                        <TouchableOpacity onPress={() => handlePostVote(postId, 'down')} disabled={!accountId}>
                            <ChevronDown size={18} color={userVote === 'down' ? '#F8BBD9' : '#6b7280'} />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text numberOfLines={3} className="text-gray-600 text-sm mb-3">{post.content}</Text>
                <View className="flex-row justify-between items-center">
                    <View className="flex-row flex-wrap items-center">
                         <View className={`rounded-full px-3 py-1 mr-2 ${getCategoryColor(post.category)}`}>
                             <Text className="text-xs font-medium">{post.category}</Text>
                         </View>
                         {post.hasExpertAnswer && (
                            <View className="bg-green-100 rounded-full px-3 py-1 flex-row items-center">
                                <CheckCircle size={12} color="#059669" />
                                <Text className="text-xs font-medium text-green-800 ml-1">Expert</Text>
                            </View>
                         )}
                    </View>
                    <View className="flex-row items-center">
                        <Eye size={14} color="#6b7280" />
                        <Text className="text-xs text-gray-500 ml-1 mr-3">{post.viewCount || 0}</Text>
                        <MessageCircle size={14} color="#6b7280" />
                        <Text className="text-xs text-gray-500 ml-1">{post.answerCount || 0}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Card>
    );
  });
  
  // Post Detail Component
  const PostDetail = ({ post }: { post: ForumPost | null }) => {
    if (!post) return null;
    
    const upVotes = post.voteUp?.length || 0;
    const userVote = accountId ? (post.voteUp?.includes(accountId) ? 'up' : (post.voteDown?.includes(accountId) ? 'down' : null)) : null;
    const authorName = post.isAnonymous ? "Anonymous" : getUserName(post.accountId);
    const downVotes = post.voteDown?.length || 0;
    const totalVotes = upVotes - downVotes;

    // Function to determine category styling
    const getCategoryColor = (category: string) => {
      switch(category) {
          case 'Reproductive Health': return 'bg-pink-100 text-pink-800';
          case 'Mental Health': return 'bg-purple-100 text-purple-800';
          case 'Sexual Health': return 'bg-red-100 text-red-800';
          case 'General Health': return 'bg-blue-100 text-blue-800';
          case 'Nutrition': return 'bg-green-100 text-green-800';
          default: return 'bg-gray-100 text-gray-800';
      }
    };

    const renderComment = (comment: Comment) => {
      if (!comment || !comment._id) return null;
      
      const commentId = comment._id;
      const isExpanded = !!expandedComments[commentId];
      const replies = commentReplies[commentId] || [];
      const isLoadingReplies = !!loadingReplies[commentId];
      
      // Safely access vote arrays with fallbacks
      const voteUp = Array.isArray(comment.voteUp) ? comment.voteUp : [];
      const voteDown = Array.isArray(comment.voteDown) ? comment.voteDown : [];
      
      const userCommentVote = accountId ? 
        (voteUp.includes(accountId) ? 'up' : 
         (voteDown.includes(accountId) ? 'down' : null)) : null;
      
      const commentUpVotes = voteUp.length;
      const isExpertComment = comment.accountId && typeof comment.accountId === 'object' && comment.accountId.role === 'Counselor';

      // Get comment author name safely
      let authorName = "Unknown User";
      if (comment.isAnonymous) {
        authorName = "Anonymous";
      } else if (comment.accountId) {
        if (typeof comment.accountId === 'string') {
          authorName = "User";
        } else if (typeof comment.accountId === 'object') {
          authorName = comment.accountId.name || `User ${String(comment.accountId._id || '').substring(0, 5)}`;
        }
      }

      return (
        <Card 
          key={commentId} 
          className={`mb-4 shadow-sm ${
            isExpertComment 
              ? "border-2 border-green-200 bg-green-50/30" 
              : "border border-gray-100"
          }`}
        >
          <View className="flex-row items-center">
            {!comment?.isAnonymous && comment?.accountId && typeof comment?.accountId === 'object' && (
              <Image 
                source={{ uri: comment?.accountId?.image || 'https://i.imgur.com/6VBx3io.png' }} 
                className={`${isExpertComment ? "w-10 h-10" : "w-8 h-8"} rounded-full mr-2 ${isExpertComment ? "border-2 border-green-400" : ""}`}
              />
            )}
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className={`font-bold ${isExpertComment ? "text-green-800 text-base" : "text-gray-800"}`}>
                  {authorName}
                </Text>
                {isExpertComment && (
                  <View className="bg-green-100 rounded-full px-2 py-1 ml-2 flex-row items-center">
                    <CheckCircle size={12} color="#059669" />
                    <Text className="text-xs font-medium text-green-800 ml-1">Expert</Text>
                  </View>
                )}
              </View>
              <Text className="text-xs text-gray-500">{formatDate(comment.createdAt)}</Text>
            </View>
          </View>
          
          <Text className={`mt-3 mb-1 leading-5 ${isExpertComment ? "text-gray-800 font-medium" : "text-gray-700"}`}>
            {comment.content}
          </Text>
          
          <View className={`flex-row justify-between items-center mt-3 pt-2 border-t ${isExpertComment ? "border-green-200" : "border-gray-100"}`}>
            <View className="flex-row items-center">
                <TouchableOpacity 
                  onPress={() => handleCommentVote(commentId, 'up')} 
                  disabled={!accountId} 
                  className={`p-1 rounded-md mr-1 ${isExpertComment ? "bg-green-100" : "bg-gray-50"}`}
                >
                    <ChevronUp size={16} color={userCommentVote === 'up' ? '#F8BBD9' : isExpertComment ? '#047857' : '#6b7280'} />
                </TouchableOpacity>
                <Text className={`text-sm mx-1 font-medium ${isExpertComment ? "text-green-700" : "text-green-600"}`}>{commentUpVotes}</Text>
                <TouchableOpacity 
                  onPress={() => handleCommentVote(commentId, 'down')} 
                  disabled={!accountId} 
                  className={`p-1 rounded-md mr-3 ${isExpertComment ? "bg-green-100" : "bg-gray-50"}`}
                >
                    <ChevronDown size={16} color={userCommentVote === 'down' ? '#F8BBD9' : isExpertComment ? '#047857' : '#6b7280'} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setReplyingToComment(replyingToComment === commentId ? null : commentId)} 
                  className={`flex-row items-center px-2 py-1 rounded-md ${isExpertComment ? "bg-green-100" : "bg-gray-50"}`}
                >
                  <MessageCircle size={14} color={isExpertComment ? "#047857" : "#6b7280"} />
                  <Text className={`text-xs font-medium ml-1 ${isExpertComment ? "text-green-800" : "text-gray-600"}`}>Reply</Text>
                </TouchableOpacity>
            </View>
            {(comment.replies && comment.replies.length > 0) && (
              <TouchableOpacity
                onPress={() => {
                  if (!isExpanded) fetchCommentReplies(commentId);
                  setExpandedComments(prev => ({ ...prev, [commentId]: !isExpanded }));
                }}
                className={`flex-row items-center px-2 py-1 rounded-md ${isExpertComment ? "bg-green-100" : "bg-gray-50"}`}
              >
                <Text className="text-xs font-medium text-healthcare-primary mr-1">
                  {isExpanded ? 'Hide Replies' : `View ${comment.replies.length} Replies`}
                </Text>
                <ChevronDown size={14} color="#F8BBD9" style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}/>
              </TouchableOpacity>
            )}
          </View>

          {/* Reply Form */}
          {replyingToComment === commentId && (
            <View className={`mt-4 pt-3 p-3 rounded-lg ${isExpertComment ? "bg-green-50" : "bg-gray-50"}`}>
               <TextInput
                  className={`bg-white rounded-lg px-3 py-2 text-sm ${isExpertComment ? "border border-green-200" : "border border-gray-200"}`}
                  placeholder={`Replying to ${comment.isAnonymous ? 'Anonymous' : comment.accountId?.name}${isExpertComment ? ' (Expert)' : ''}...`}
                  value={replyContent}
                  onChangeText={setReplyContent}
                  multiline
                />
                <View className="flex-row justify-between items-center mt-3">
                  <View className="flex-row items-center">
                    <Switch 
                      value={replyIsAnonymous} 
                      onValueChange={setReplyIsAnonymous} 
                      trackColor={{ false: "#d1d5db", true: "#F8BBD9" }} 
                      thumbColor={replyIsAnonymous ? "#ffffff" : "#ffffff"} 
                    />
                    <Text className="text-xs text-gray-500 ml-1">Post as anonymous</Text>
                  </View>
                  <View className="flex-row">
                    <Button 
                      title="Cancel" 
                      variant='outline' 
                      size='small' 
                      onPress={() => setReplyingToComment(null)} 
                      className="mr-2"
                    />
                    <Button 
                      title="Reply" 
                      size='small' 
                      onPress={() => handleSubmitReply(commentId)} 
                      loading={submittingReply} 
                      disabled={!replyContent.trim()} 
                    />
                  </View>
                </View>
            </View>
          )}

          {/* Replies Section */}
          {isExpanded && (
            <View className={`mt-3 ml-4 pl-3 border-l-2 ${isExpertComment ? "border-green-300" : "border-healthcare-primary/20"}`}>
              {isLoadingReplies ? (
                <View className="py-4 items-center">
                  <ActivityIndicator color={isExpertComment ? "#059669" : "#F8BBD9"} size="small" />
                </View>
              ) : replies.length > 0 ? (
                replies.map(reply => {
                  const isExpertReply = reply.accountId && typeof reply.accountId === 'object' && reply.accountId.role === 'counselor';
                  return (
                    <View 
                      key={reply._id} 
                      className={`py-2 mb-1 ${isExpertReply ? "bg-green-50/50 rounded-md px-2" : ""}`}
                    >
                      <View className="flex-row items-center">
                        {!reply?.isAnonymous && reply?.accountId && typeof reply?.accountId === 'object' && (
                          <Image 
                            source={{ uri: reply?.accountId?.image || 'https://i.imgur.com/6VBx3io.png' }} 
                            className={`${isExpertReply ? "w-7 h-7" : "w-6 h-6"} rounded-full mr-2 ${isExpertReply ? "border-2 border-green-300" : ""}`}
                          />
                        )}
                        <View>
                          <View className="flex-row items-center">
                            <Text className={`font-bold text-sm ${isExpertReply ? "text-green-800" : "text-gray-800"}`}>
                              {reply.isAnonymous ? 'Anonymous' : reply.accountId?.name}
                            </Text>
                            {isExpertReply && (
                              <View className="bg-green-100 rounded-full px-1.5 py-0.5 ml-1.5 flex-row items-center">
                                <CheckCircle size={8} color="#059669" />
                                <Text className="text-xs font-medium text-green-800 ml-0.5">Expert</Text>
                              </View>
                            )}
                          </View>
                          <Text className="text-xs text-gray-500">{formatDate(reply.createdAt)}</Text>
                        </View>
                      </View>
                      <Text className={`text-sm mt-1 ${isExpertReply ? "text-gray-800 font-medium" : "text-gray-700"}`}>
                        {reply.content}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <Text className="text-xs text-gray-500 py-2">No replies yet</Text>
              )}
            </View>
          )}
        </Card>
      );
    }
    
    return (
      <View className="flex-1 bg-gray-50">
        <ScrollView
            contentContainerStyle={{ padding: 16 }}
            refreshControl={<RefreshControl refreshing={loadingComments} onRefresh={fetchComments} colors={["#F8BBD9"]} />}
            showsVerticalScrollIndicator={false}
        >
            {/* Back Button with improved styling */}
            <TouchableOpacity 
              onPress={() => setSelectedPostId(null)} 
              className="flex-row items-center mb-4 bg-white py-2 px-3 rounded-full shadow-sm border border-gray-100"
            >
              <ChevronUp size={18} color="#F8BBD9" style={{ transform: [{ rotate: '-90deg' }] }} />
              <Text className="text-healthcare-primary font-medium ml-1">Back to Forum</Text>
            </TouchableOpacity>

            {/* Post Card with enhanced styling */}
            <Card className="mb-6 shadow-md border border-gray-100 overflow-hidden">
               {/* Post Header with Author Info and Voting */}
               <View className="mb-4 pb-3 border-b border-gray-100">
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-row items-center">
                      {!post?.isAnonymous && typeof post?.accountId === 'object' && (
                        <Image 
                          source={{ uri: post?.accountId?.image || 'https://i.imgur.com/6VBx3io.png' }} 
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      )}
                      <View>
                        <Text className="font-bold text-gray-800">{authorName}</Text>
                        <Text className="text-xs text-gray-500">{formatDate(post.createdAt)}</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center">
                      <View className="bg-gray-50 py-1 px-3 rounded-full mr-2 flex-row items-center">
                        <Eye size={14} color="#6b7280" />
                        <Text className="text-xs text-gray-500 ml-1">{post.viewCount || 0}</Text>
                      </View>
                      <View className="bg-gray-50 py-1 px-3 rounded-full flex-row items-center">
                        <MessageCircle size={14} color="#6b7280" />
                        <Text className="text-xs text-gray-500 ml-1">{comments.length}</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Title and Category */}
                  <Text className="font-bold text-2xl text-gray-800 mb-2">{post.title}</Text>
                  
                  {/* Category and Tags */}
                  <View className="flex-row flex-wrap mt-2">
                    {post.category && (
                      <View className={`rounded-full px-3 py-1 mr-2 mb-2 ${getCategoryColor(post.category)}`}>
                        <Text className="text-xs font-medium">{post.category}</Text>
                      </View>
                    )}
                    {post.tags?.map(tag => (
                      <View key={tag} className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2">
                        <Text className="text-xs text-gray-700">#{tag}</Text>
                      </View>
                    ))}
                  </View>
               </View>
               
               {/* Post Content */}
               <Text className="text-gray-700 mb-5 leading-6">{post.content}</Text>
               
               {/* Voting Controls */}
               <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                  <Text className="text-sm text-gray-500">Was this post helpful?</Text>
                  <View className="flex-row items-center">
                    <TouchableOpacity 
                      onPress={() => handlePostVote(getPostId(post)!, 'up')} 
                      disabled={!accountId}
                      className={`flex-row items-center px-3 py-2 mr-2 rounded-md ${userVote === 'up' ? 'bg-pink-50' : 'bg-gray-50'}`}
                    >
                      <ThumbsUp size={16} color={userVote === 'up' ? '#F8BBD9' : '#6b7280'} />
                      <Text className={`text-sm ml-1 ${userVote === 'up' ? 'text-healthcare-primary font-medium' : 'text-gray-600'}`}>
                        Yes ({upVotes})
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handlePostVote(getPostId(post)!, 'down')} 
                      disabled={!accountId}
                      className={`flex-row items-center px-3 py-2 rounded-md ${userVote === 'down' ? 'bg-pink-50' : 'bg-gray-50'}`}
                    >
                      <ThumbsDown size={16} color={userVote === 'down' ? '#F8BBD9' : '#6b7280'} />
                      <Text className={`text-sm ml-1 ${userVote === 'down' ? 'text-healthcare-primary font-medium' : 'text-gray-600'}`}>
                        No ({downVotes})
                      </Text>
                    </TouchableOpacity>
                  </View>
               </View>
            </Card>

            {/* Comments Section Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-healthcare-primary">
                Comments ({comments.length})
              </Text>
              {comments.length > 0 && (
                <TouchableOpacity className="flex-row items-center">
                  <Text className="text-xs text-healthcare-primary mr-1">Most Helpful</Text>
                  <ChevronDown size={14} color="#F8BBD9" />
                </TouchableOpacity>
              )}
            </View>
            
            {/* Comments List */}
            {loadingComments ? (
              <View className="py-8 items-center">
                <ActivityIndicator color="#F8BBD9" size="large" />
              </View>
            ) : comments.length > 0 ? (
              comments.map(comment => renderComment(comment))
            ) : (
              <Card className="items-center py-6 mb-4">
                <MessageCircle size={32} color="#d1d5db" />
                <Text className="text-center text-gray-500 mt-3 font-medium">Be the first to comment!</Text>
                <Text className="text-center text-gray-400 text-xs mt-1">Share your thoughts on this post</Text>
              </Card>
            )}
        </ScrollView>
        
        {/* Comment Input Section */}
        {accountId ? (
          <View className="px-4 py-3 border-t border-gray-200 bg-white shadow-md">
            <View className="flex-row items-start">
              <TextInput
                className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 mr-2 text-base border border-gray-200"
                placeholder="Add a comment..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity
                className={`bg-healthcare-primary rounded-full p-3.5 ${(!newComment.trim() || submitLoading) ? 'opacity-50' : ''}`}
                onPress={handleSubmitComment}
                disabled={!newComment.trim() || submitLoading}
              >
                {submitLoading ? <ActivityIndicator size="small" color="#fff" /> : <Send size={18} color="#fff" />}
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center mt-2">
              <Switch 
                value={isAnonymous} 
                onValueChange={setIsAnonymous} 
                trackColor={{ false: "#d1d5db", true: "#F8BBD9" }} 
                thumbColor={isAnonymous ? "#ffffff" : "#ffffff"} 
              />
              <Text className="ml-2 text-xs text-gray-600">Post as Anonymous</Text>
            </View>
          </View>
        ) : (
          <View className="px-4 py-3 border-t border-gray-200 bg-white">
            <Text className="text-center text-gray-500">Please log in to comment</Text>
          </View>
        )}
      </View>
    );
  };
  
  // Handle load more posts
  const handleLoadMore = () => {
    if (!loading && hasMorePosts && !refreshing) {
      console.log('Loading more posts...');
      fetchForumData();
    }
  };

  // Handle post creation success
  const handlePostCreated = () => {
    setShowCreateModal(false);
    setCurrentPage(1);
    setHasMorePosts(true);
    fetchForumData(true);
    Alert.alert('Success', 'Your post has been submitted for review!');
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
          <PostDetail post={selectedPost} />
        ) : (
          <>
            <View className="flex-row justify-end items-center px-4 py-2 bg-white border-b border-gray-100">
                {/* ... Sort options from your code ... */}
            </View>
            <FlatList
                data={forumPosts}
                keyExtractor={(item) => getPostId(item)!}
                renderItem={({ item }) => <PostCard post={item} onPress={() => setSelectedPostId(getPostId(item))} />}
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
          </>
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