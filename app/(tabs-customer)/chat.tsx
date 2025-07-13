import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, 
  Alert, FlatList, RefreshControl, Image, Modal, Switch, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { 
  Search, MessageCircle, Clock, Heart, MessageSquare, TrendingUp, Filter, ThumbsUp, 
  ThumbsDown, Send, User, Calendar, PenLine, Eye, Plus, ChevronUp, ChevronDown,
  Award, Share2, ExternalLink, Mail, Copy, X, TrendingDown, Users, CheckCircle,
  SortDescIcon, SortAsc
} from 'lucide-react-native';
import { forumService, ForumPost, Comment, PostParams } from '@/services/forumService';

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

export default function ForumScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'newest' | 'popular' | 'votes'>('newest');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
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
    trendingTopics: [] as Array<{name: string, posts: number, trend: string}>
  });
  
  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  
  // State for API data
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [forumPosts, setForumPosts] = useState<any[]>([]); // Using any type to avoid type mismatches
  const [comments, setComments] = useState<any[]>([]);
  const [commentReplies, setCommentReplies] = useState<Record<string, any[]>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  
  // User state
  const [accountId, setAccountId] = useState<string | null>(null);
  
  // Post actions
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    content: "",
  });
  const [errorMessage, setErrorMessage] = useState('');
  
  // Fetch categories, tags, and community stats on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Get categories
        setCategories(forumService.getCategories());
        
        // Get suggested tags
        setSuggestedTags(forumService.getSuggestedTags());
        
        // Fetch community stats
        fetchCommunityStats();
        
        // Try to get account ID from storage (this is a placeholder - implement your auth storage)
        // In a real app, you would get this from your auth system
        setAccountId('user123'); // Replace with actual user ID retrieval
        
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Function to fetch community stats
  const fetchCommunityStats = async () => {
    try {
      // This is a placeholder - in a real app, you would call an API
      // const response = await forumService.getCommunityStats();
      
      // For now, we'll set some dummy data
      setCommunityStats({
        activeMembers: 1250,
        discussions: 578,
        expertAnswers: 142,
        trendingTopics: [
          { name: "Mental Health", posts: 24, trend: "+5%" },
          { name: "Reproductive Health", posts: 18, trend: "+3%" },
          { name: "Pregnancy", posts: 15, trend: "+2%" }
        ]
      });
    } catch (error) {
      console.error("Error fetching community stats:", error);
    }
  };

  // Fetch forum data
  const fetchForumData = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      }
      
      // Reset current page if refreshing
      const page = isRefreshing ? 1 : currentPage;
      if (isRefreshing) {
        setCurrentPage(1);
        setForumPosts([]);
      }
      
      // Prepare query params
      const params: PostParams = {
        page,
        limit: 10,
        sort: activeFilter,
        search: searchQuery
      };
      
      // Handle filter by category if needed
      // if (categoryFilter !== 'all') {
      //   params.category = categoryFilter;
      // }
      
      // Set type based on active tab
      switch (activeTab) {
        case 'questions':
          // Questions: show questions without expert (counselor) answers
          params.type = 'questions';
          break;
        case 'expert':
          // Expert Answers: show questions with expert (counselor) answers
          params.type = 'expert';
          break;
        case 'following':
          // Following: posts that the logged-in user upvoted
          if (accountId) {
            params.type = 'following';
            params.accountId = accountId;
          } else {
            setForumPosts([]);
            setLoading(false);
            setRefreshing(false);
            return;
          }
          break;
        case 'myPosts':
          // My Posts: posts created by the current user
          if (accountId) {
            params.type = 'myPosts';
            params.accountId = accountId;
          } else {
            setForumPosts([]);
            setLoading(false);
            setRefreshing(false);
            return;
          }
          break;
        default:
          params.type = 'all';
          break;
      }
      
      // Get posts with the active filter
      const response = await forumService.getPosts(params);
      
      // Enhanced debugging for response structure
      console.log('Fetched posts response structure:', {
        hasData: !!response.data,
        dataType: response.data ? typeof response.data : 'undefined',
        isArray: response.data ? Array.isArray(response.data) : false,
        dataKeys: response.data && typeof response.data === 'object' ? Object.keys(response.data) : []
      });
      
      // Safely access data, ensuring we have valid posts
      let newPosts = [];
      let pagination = null;
      
      if (response && response.data) {
        // Check if data is directly an array or if it's nested under another property
        if (Array.isArray(response.data)) {
          newPosts = response.data;
        } else if (response.data.posts && Array.isArray(response.data.posts)) {
          newPosts = response.data.posts;
          pagination = response.data.pagination;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          newPosts = response.data.data;
          pagination = response.data.pagination;
        } else {
          console.warn('Unexpected response format:', response.data);
        }
      }
      
      // Ensure all posts have required properties - handling both MongoDB ID formats
      const validPosts = newPosts.filter((post: any) => {
        if (!post) return false;
        
        // Handle different possible _id formats
        // 1. Standard MongoDB format: post._id.$oid
        // 2. String format: post._id is directly the string ID
        // 3. Object format: post._id is the ObjectId directly
        return (post._id && 
                (typeof post._id === 'string' || 
                 post._id.$oid || 
                 typeof post._id === 'object'));
      });
      
      if (validPosts.length === 0) {
        setHasMorePosts(false);
      } else {
        setForumPosts(prev => isRefreshing ? validPosts : [...prev, ...validPosts]);
        
        // Update pagination information
        if (pagination) {
          setCurrentPage(pagination.page);
          setHasMorePosts(pagination.page < pagination.pages);
        } else {
          if (!isRefreshing) {
            setCurrentPage(prev => prev + 1);
          }
          setHasMorePosts(validPosts.length === params.limit);
        }
      }
    } catch (error) {
      console.error('Error fetching forum data:', error);
      Alert.alert(
        'Lỗi kết nối', 
        'Không thể tải dữ liệu diễn đàn. Vui lòng kiểm tra kết nối mạng và thử lại sau.',
        [{ text: 'Đóng' }, { text: 'Thử lại', onPress: () => fetchForumData() }]
      );
    } finally {
      setLoading(false);
      if (isRefreshing) {
        setRefreshing(false);
      }
    }
  };
  
  // Handle refreshing the forum
  const handleRefresh = () => {
    setRefreshing(true);
    fetchForumData(true);
  };
  
  useEffect(() => {
    fetchForumData();
  }, [activeFilter]);
  
  // Fetch comments when a post is selected
  const fetchComments = async () => {
    if (selectedPostId) {
      try {
        setLoadingComments(true);
        
        // First, increment the view count
        try {
          await forumService.incrementView(selectedPostId);
        } catch (viewError) {
          console.warn('Error incrementing view count:', viewError);
          // Continue with fetching comments even if view increment fails
        }
        
        // Get the post details
        const postResponse = await forumService.getPostById(selectedPostId);
        
        // Safely access post data
        let post = null;
        if (postResponse && postResponse.data) {
          post = postResponse.data;
        }
        
        if (post) {
          // Store the detailed post data
          setSelectedPostDetail(post);
          
          // Fetch its comments with pagination - getting first page of comments
          const commentsResponse = await forumService.getCommentsByPostId(selectedPostId, undefined, 1, 20);
          
          // Safely access comment data
          let commentsList = [];
          if (commentsResponse && commentsResponse.data) {
            // Check if data is directly an array or if it's nested
            if (Array.isArray(commentsResponse.data)) {
              commentsList = commentsResponse.data;
            } else if (commentsResponse.data.comments && Array.isArray(commentsResponse.data.comments)) {
              commentsList = commentsResponse.data.comments;
            } else if (commentsResponse.data.data && Array.isArray(commentsResponse.data.data)) {
              commentsList = commentsResponse.data.data;
            } else {
              console.warn('Unexpected comments response format:', commentsResponse.data);
            }
          }
          
          // Ensure all comments have required properties
          const validComments = commentsList.filter((comment: any) => comment && comment.id);
          setComments(validComments);
          
          // Update the post in the forum posts list to reflect any changes
          setForumPosts(prevPosts => 
            prevPosts.map((p: any) => 
              getPostId(p) === selectedPostId ? 
                { ...p, viewCount: post.viewCount, answerCount: post.answerCount } : p
            )
          );
        }
      } catch (error) {
        console.error('Error fetching post comments:', error);
        Alert.alert(
          'Lỗi', 
          'Không thể tải bình luận. Vui lòng thử lại sau.',
          [{ text: 'Đóng' }, { text: 'Thử lại', onPress: fetchComments }]
        );
      } finally {
        setLoadingComments(false);
      }
    } else {
      setComments([]);
      setSelectedPostDetail(null);
    }
  };
  
  useEffect(() => {
    fetchComments();
  }, [selectedPostId]);

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hôm nay';
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} tuần trước`;
    } else {
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }
  };

  // Handle submitting a new comment
  const handleSubmitComment = async () => {
    if (newComment.trim() === '' || !selectedPostId) return;
    
    try {
      setSubmitLoading(true);
      const commentData = {
        content: newComment,
        isAnonymous: isAnonymous
      };
      
      await forumService.addComment(selectedPostId, commentData);
      
      // Clear the input immediately to improve UX
      setNewComment('');
      
      // After submitting, refresh the comments and update post data
      await fetchComments();
      
      // Also refresh the forum data in the background to update answer counts
      fetchForumData(true);
      
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert(
        'Lỗi', 
        'Không thể đăng bình luận. Vui lòng thử lại sau.',
        [{ text: 'Đóng' }, { text: 'Thử lại', onPress: handleSubmitComment }]
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle searching posts
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // If search query is empty, revert to filtered posts
      fetchForumData(true);
      return;
    }
    
    try {
      setLoading(true);
      setForumPosts([]);
      
      // Search posts using the searchPosts method
      const response = await forumService.searchPosts(searchQuery);
      const results = response.data || [];
      
      setForumPosts(results);
      setHasMorePosts(false); // Don't load more when searching
      
      if (results.length === 0) {
        Alert.alert('Thông báo', 'Không tìm thấy bài đăng nào phù hợp với từ khóa tìm kiếm.');
      }
    } catch (error) {
      console.error('Error searching posts:', error);
      Alert.alert(
        'Lỗi tìm kiếm', 
        'Không thể tìm kiếm bài đăng. Vui lòng thử lại sau.',
        [{ text: 'Đóng' }, { text: 'Thử lại', onPress: handleSearch }]
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Debounced search effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchForumData(true);
      }
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [searchQuery]);
  
  // Fetch posts when tab changes
  useEffect(() => {
    fetchForumData(true);
    setCurrentPage(1);
  }, [activeTab, activeFilter]);
  
  // Handle post voting
  const handlePostVote = async (postId: string, voteType: 'up' | 'down') => {
    try {
      await forumService.votePost(postId, { type: voteType });
      
      // Refresh the post details to update vote count
      if (selectedPostId === postId) {
        fetchComments();
      }
      
      // Also refresh the forum list to reflect changes
      fetchForumData(true);
      
    } catch (error) {
      console.error(`Error ${voteType}-voting post:`, error);
      Alert.alert('Lỗi', 'Không thể ghi nhận đánh giá của bạn. Vui lòng thử lại sau.');
    }
  };
  
  // Post Card Component
  const PostCard = ({ post, onPress, isSelected }: { post: any, onPress: () => void, isSelected: boolean }) => {
  // THIS FUNCTION IS NOW MOVED TO BE DEFINED OUTSIDE THE COMPONENT

    const postId = getPostId(post);
    const upVoteCount = post.voteUp?.length || 0;
    const downVoteCount = post.voteDown?.length || 0;
    const voteCount = upVoteCount - downVoteCount;
    
    // Determine if the current user has voted
    const currentUserId = accountId;
    const userVote = currentUserId ? 
      (post.voteUp?.includes(currentUserId) ? 'up' : 
       post.voteDown?.includes(currentUserId) ? 'down' : null) 
      : null;
    
    const getCategoryColor = (category: string) => {
      switch(category) {
        case "General Health": return "bg-blue-100";
        case "Reproductive Health": return "bg-pink-100";
        case "STI Prevention": return "bg-green-100";
        case "Pregnancy & Family Planning": return "bg-purple-100";
        case "Menstrual Health": return "bg-red-100";
        case "Mental Health": return "bg-indigo-100";
        default: return "bg-gray-100";
      }
    };
    
    return (
      <Card className={`mb-4 ${isSelected ? 'border-blue-400' : ''}`}>
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-blue-100 justify-center items-center mr-3">
                <Text className="text-blue-600 font-bold">
                  {post.isAnonymous 
                    ? "A" 
                    : (post.accountId?.name 
                        ? post.accountId.name.substring(0, 1).toUpperCase() 
                        : "U")}
                </Text>
              </View>
              <View>
                <Text className="font-semibold text-gray-900">
                  {post.isAnonymous ? "Ẩn danh" : post.accountId?.name || "Anonymous"}
                </Text>
                <View className="flex-row items-center">
                  <Clock size={12} color="#9ca3af" />
                  <Text className="text-xs text-gray-500 ml-1">{formatDate(post.createdAt)}</Text>
                  <Text className="text-xs text-gray-500 mx-1">•</Text>
                  <Eye size={12} color="#9ca3af" />
                  <Text className="text-xs text-gray-500 ml-1">{post.viewCount || 0}</Text>
                </View>
              </View>
            </View>
          </View>
          
          {post.category && (
            <View className={`self-start rounded-full px-2 py-1 mb-2 ${getCategoryColor(post.category)}`}>
              <Text className="text-xs">{post.category}</Text>
            </View>
          )}
          
          <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Text className="text-lg font-bold mb-2" numberOfLines={2}>{post.title}</Text>
            <Text className="text-gray-600 mb-3" numberOfLines={3}>{post.content}</Text>
          </TouchableOpacity>
          
          <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
            <View className="flex-row items-center">
              <TouchableOpacity 
                onPress={() => postId && handlePostVote(postId, 'up')}
                className={`flex-row items-center rounded-l-full py-1 px-3 ${userVote === 'up' ? 'bg-blue-100' : ''}`}
              >
                <ChevronUp size={16} color={userVote === 'up' ? '#3b82f6' : '#6b7280'} />
                <Text className={`ml-1 text-sm ${userVote === 'up' ? 'text-blue-600' : 'text-gray-600'}`}>
                  {upVoteCount}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => postId && handlePostVote(postId, 'down')}
                className={`flex-row items-center rounded-r-full py-1 px-3 ${userVote === 'down' ? 'bg-red-100' : ''}`}
              >
                <ChevronDown size={16} color={userVote === 'down' ? '#ef4444' : '#6b7280'} />
              </TouchableOpacity>
            </View>
            
            <View className="flex-row items-center">
              <View className="flex-row items-center mr-4">
                <MessageCircle size={16} color="#6b7280" />
                <Text className="text-gray-600 text-sm ml-1">{post.answerCount || 0}</Text>
              </View>
              {post.accountId?.role === "Counselor" && (
                <View className="bg-yellow-100 rounded-full px-2 py-1 flex-row items-center">
                  <Award size={12} color="#f59e0b" />
                  <Text className="text-yellow-700 text-xs ml-1">Expert</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Card>
    );
  };
  
  // Find the selected post
  // Use the detailed post data if available, otherwise fallback to the list item
  const selectedPost = selectedPostDetail || 
    (selectedPostId ? forumPosts.find(post => getPostId(post) === selectedPostId) : null);

  // Handle comment voting
  const handleCommentVote = async (commentId: string, voteType: 'like' | 'dislike') => {
    try {
      await forumService.voteComment(commentId, { type: voteType });
      
      // Refresh comments to show updated vote counts
      if (selectedPostId) {
        fetchComments();
      }
    } catch (error) {
      console.error(`Error ${voteType}-voting comment:`, error);
      Alert.alert('Lỗi', 'Không thể ghi nhận đánh giá của bạn. Vui lòng thử lại sau.');
    }
  };

  // Get comment replies
  const fetchCommentReplies = async (commentId: string) => {
    try {
      setLoadingReplies(prev => ({ ...prev, [commentId]: true }));
      const response = await forumService.getCommentReplies(commentId);
      
      // Safely access reply data
      let repliesList = [];
      if (response && response.data) {
        // Check if data is directly an array or if it's nested
        if (Array.isArray(response.data)) {
          repliesList = response.data;
        } else if (response.data.replies && Array.isArray(response.data.replies)) {
          repliesList = response.data.replies;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          repliesList = response.data.data;
        } else {
          console.warn('Unexpected replies response format:', response.data);
        }
      }
      
      // Ensure all replies have required properties
      const validReplies = repliesList.filter((reply: any) => reply && reply.id);
      
      setCommentReplies(prev => ({
        ...prev,
        [commentId]: validReplies
      }));
    } catch (error) {
      console.error('Error fetching comment replies:', error);
      Alert.alert('Lỗi', 'Không thể tải phản hồi cho bình luận này. Vui lòng thử lại sau.');
    } finally {
      setLoadingReplies(prev => ({ ...prev, [commentId]: false }));
    }
  };

  // Handle submitting a reply
  const handleSubmitReply = async (commentId: string) => {
    if (replyContent.trim() === '') return;
    
    try {
      setSubmittingReply(true);
      const replyData = {
        content: replyContent,
        isAnonymous: replyIsAnonymous
      };
      
      await forumService.replyToComment(commentId, replyData);
      
      // Clear the input immediately to improve UX
      setReplyContent('');
      setReplyingToComment(null);
      
      // Fetch the updated replies
      await fetchCommentReplies(commentId);
      
    } catch (error) {
      console.error('Error adding reply:', error);
      Alert.alert(
        'Lỗi', 
        'Không thể đăng phản hồi. Vui lòng thử lại sau.'
      );
    } finally {
      setSubmittingReply(false);
    }
  };
  
  // Handle loading more posts when reaching end of list
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMorePosts) {
      fetchForumData();
    }
  }, [loading, hasMorePosts]);
  
  // Handle tab changes
  const handleTabChange = (tabName: 'all' | 'questions' | 'expert' | 'following' | 'myPosts') => {
    setActiveTab(tabName);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white px-4 pt-2 pb-4 shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-xl font-bold text-gray-900">Community Forum</Text>
            <Text className="text-gray-500">Ask questions, share experiences</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setShowCreateModal(true)}
            className="bg-blue-500 rounded-full p-2"
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Search */}
        <View className="relative">
          <TextInput
            className="bg-gray-100 rounded-full pl-10 pr-4 py-2"
            placeholder="Search discussions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View className="absolute left-3 top-2.5">
            <Search size={20} color="#9ca3af" />
          </View>
        </View>
      </View>
      
      {/* Content */}
      <View className="flex-1">
        {!selectedPostId ? (
          <View className="flex-1">
            {/* Tabs */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="border-b border-gray-200 bg-white"
            >
              <TouchableOpacity
                onPress={() => handleTabChange('all')}
                className={`px-4 py-3 border-b-2 ${activeTab === 'all' ? 'border-blue-500' : 'border-transparent'}`}
              >
                <Text className={activeTab === 'all' ? 'text-blue-500 font-medium' : 'text-gray-500'}>
                  All Discussions
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => handleTabChange('questions')}
                className={`px-4 py-3 border-b-2 ${activeTab === 'questions' ? 'border-blue-500' : 'border-transparent'}`}
              >
                <Text className={activeTab === 'questions' ? 'text-blue-500 font-medium' : 'text-gray-500'}>
                  Questions
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => handleTabChange('expert')}
                className={`px-4 py-3 border-b-2 ${activeTab === 'expert' ? 'border-blue-500' : 'border-transparent'}`}
              >
                <Text className={activeTab === 'expert' ? 'text-blue-500 font-medium' : 'text-gray-500'}>
                  Expert Answers
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => handleTabChange('following')}
                className={`px-4 py-3 border-b-2 ${activeTab === 'following' ? 'border-blue-500' : 'border-transparent'}`}
              >
                <Text className={activeTab === 'following' ? 'text-blue-500 font-medium' : 'text-gray-500'}>
                  Following
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => handleTabChange('myPosts')}
                className={`px-4 py-3 border-b-2 ${activeTab === 'myPosts' ? 'border-blue-500' : 'border-transparent'}`}
              >
                <Text className={activeTab === 'myPosts' ? 'text-blue-500 font-medium' : 'text-gray-500'}>
                  My Posts
                </Text>
              </TouchableOpacity>
            </ScrollView>
            
            {/* Sort options */}
            <View className="flex-row justify-between items-center p-3 bg-gray-50">
              <View className="flex-row items-center">
                <Filter size={16} color="#6b7280" />
                <Text className="text-gray-500 ml-1">Sort by:</Text>
              </View>
              <View className="flex-row">
                <TouchableOpacity
                  onPress={() => setActiveFilter('newest')}
                  className={`flex-row items-center mr-4 ${activeFilter === 'newest' ? 'bg-blue-100 px-2 py-1 rounded-full' : ''}`}
                >
                  <Clock size={14} color={activeFilter === 'newest' ? '#3b82f6' : '#6b7280'} />
                  <Text className={`text-sm ml-1 ${activeFilter === 'newest' ? 'text-blue-600' : 'text-gray-600'}`}>
                    Recent
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setActiveFilter('popular')}
                  className={`flex-row items-center mr-4 ${activeFilter === 'popular' ? 'bg-blue-100 px-2 py-1 rounded-full' : ''}`}
                >
                  <TrendingUp size={14} color={activeFilter === 'popular' ? '#3b82f6' : '#6b7280'} />
                  <Text className={`text-sm ml-1 ${activeFilter === 'popular' ? 'text-blue-600' : 'text-gray-600'}`}>
                    Popular
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setActiveFilter('votes')}
                  className={`flex-row items-center ${activeFilter === 'votes' ? 'bg-blue-100 px-2 py-1 rounded-full' : ''}`}
                >
                  <ChevronUp size={14} color={activeFilter === 'votes' ? '#3b82f6' : '#6b7280'} />
                  <Text className={`text-sm ml-1 ${activeFilter === 'votes' ? 'text-blue-600' : 'text-gray-600'}`}>
                    Most Votes
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Posts list */}
            {loading && forumPosts.length === 0 ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-gray-500 mt-2">Loading discussions...</Text>
              </View>
            ) : forumPosts.length === 0 ? (
              <View className="flex-1 justify-center items-center p-6">
                {activeTab === 'following' && !accountId ? (
                  <>
                    <Text className="text-lg font-medium text-center mb-2">Please log in</Text>
                    <Text className="text-gray-500 text-center mb-4">
                      Log in to see discussions you've upvoted
                    </Text>
                    <Button onPress={() => handleTabChange('all')}>
                      Explore all discussions
                    </Button>
                  </>
                ) : activeTab === 'myPosts' && !accountId ? (
                  <>
                    <Text className="text-lg font-medium text-center mb-2">Please log in</Text>
                    <Text className="text-gray-500 text-center mb-4">
                      Log in to see your posts
                    </Text>
                    <Button onPress={() => handleTabChange('all')}>
                      Explore all discussions
                    </Button>
                  </>
                ) : (
                  <>
                    <Text className="text-lg font-medium text-center mb-2">No discussions found</Text>
                    <Text className="text-gray-500 text-center mb-4">
                      {searchQuery ? 'Try a different search term' : 'Be the first to start a discussion'}
                    </Text>
                    <Button onPress={() => setShowCreateModal(true)}>
                      Create New Post
                    </Button>
                  </>
                )}
              </View>
            ) : (
              <FlatList
                data={forumPosts}
                renderItem={({ item: post }) => (
                  <View className="px-4 pt-4">
                    <PostCard 
                      post={post} 
                      onPress={() => setSelectedPostId(getPostId(post))} 
                      isSelected={selectedPostId === getPostId(post)} 
                    />
                  </View>
                )}
                keyExtractor={(item) => getPostId(item) || String(Math.random())}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => {
                      setRefreshing(true);
                      fetchForumData(true);
                    }}
                  />
                }
                ListFooterComponent={
                  hasMorePosts && (
                    <View className="pb-6 pt-2 items-center">
                      <ActivityIndicator size="small" color="#3b82f6" />
                      <Text className="text-gray-500 text-sm mt-1">Loading more...</Text>
                    </View>
                  )
                }
              />
            )}
            
            {/* Community stats panel */}
            <View className="bg-gray-50 p-4 border-t border-gray-200">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-bold">Community Stats</Text>
                <TouchableOpacity>
                  <ChevronUp size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <View className="flex-row justify-around mb-4">
                <View className="items-center">
                  <View className="bg-blue-100 rounded-full p-2 mb-1">
                    <Users size={20} color="#3b82f6" />
                  </View>
                  <Text className="text-xs text-gray-600">Members</Text>
                  <Text className="font-bold">{communityStats.activeMembers}</Text>
                </View>
                <View className="items-center">
                  <View className="bg-green-100 rounded-full p-2 mb-1">
                    <MessageCircle size={20} color="#10b981" />
                  </View>
                  <Text className="text-xs text-gray-600">Discussions</Text>
                  <Text className="font-bold">{communityStats.discussions}</Text>
                </View>
                <View className="items-center">
                  <View className="bg-yellow-100 rounded-full p-2 mb-1">
                    <Award size={20} color="#f59e0b" />
                  </View>
                  <Text className="text-xs text-gray-600">Expert Answers</Text>
                  <Text className="font-bold">{communityStats.expertAnswers}</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          // Post detail view
          <View className="flex-1">
            {/* Back button */}
            <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
              <TouchableOpacity 
                onPress={() => setSelectedPostId(null)}
                className="mr-2"
              >
                <X size={20} color="#000" />
              </TouchableOpacity>
              <Text className="font-bold">Post Details</Text>
            </View>
            
            <ScrollView className="flex-1">
              {selectedPost ? (
                <View className="p-4">
                  {/* Post header */}
                  <View className="mb-4 flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-blue-100 justify-center items-center mr-3">
                      <Text className="text-blue-600 font-bold">
                        {selectedPost.isAnonymous 
                          ? "A" 
                          : (selectedPost.accountId?.name 
                            ? selectedPost.accountId.name.substring(0, 1).toUpperCase() 
                            : "U")}
                      </Text>
                    </View>
                    <View>
                      <Text className="font-semibold">
                        {selectedPost.isAnonymous ? "Ẩn danh" : selectedPost.accountId?.name || "Anonymous"}
                      </Text>
                      <View className="flex-row items-center">
                        <Clock size={12} color="#9ca3af" />
                        <Text className="text-xs text-gray-500 ml-1">{formatDate(selectedPost.createdAt)}</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Category */}
                  {selectedPost.category && (
                    <View className="bg-blue-100 self-start rounded-full px-3 py-1 mb-3">
                      <Text className="text-blue-800 text-xs">{selectedPost.category}</Text>
                    </View>
                  )}
                  
                  {/* Post title and content */}
                  <Text className="text-xl font-bold mb-3">{selectedPost.title}</Text>
                  <Text className="text-gray-800 mb-6">{selectedPost.content}</Text>
                  
                  {/* Post actions */}
                  <View className="flex-row justify-between items-center py-3 border-t border-b border-gray-200 mb-4">
                    <View className="flex-row">
                      <TouchableOpacity 
                        className="flex-row items-center bg-gray-100 rounded-l-full py-2 px-4 mr-1"
                        onPress={() => handlePostVote(getPostId(selectedPost) || '', 'up')}
                      >
                        <ChevronUp 
                          size={18} 
                          color={selectedPost.voteUp?.includes(accountId || '') ? '#3b82f6' : '#6b7280'} 
                        />
                        <Text 
                          className={`ml-1 ${
                            selectedPost.voteUp?.includes(accountId || '') ? 'text-blue-500' : 'text-gray-600'
                          }`}
                        >
                          {selectedPost.voteUp?.length || 0}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        className="flex-row items-center bg-gray-100 rounded-r-full py-2 px-4"
                        onPress={() => handlePostVote(getPostId(selectedPost) || '', 'down')}
                      >
                        <ChevronDown 
                          size={18}
                          color={selectedPost.voteDown?.includes(accountId || '') ? '#ef4444' : '#6b7280'}
                        />
                      </TouchableOpacity>
                    </View>
                    <View className="flex-row items-center">
                      <MessageCircle size={18} color="#6b7280" />
                      <Text className="text-gray-600 ml-1">{comments.length} comments</Text>
                    </View>
                  </View>
                  
                  {/* Comments section */}
                  <Text className="font-bold text-lg mb-4">Comments</Text>
                  
                  {loadingComments ? (
                    <View className="py-4 items-center">
                      <ActivityIndicator size="small" color="#3b82f6" />
                      <Text className="text-gray-500 mt-2">Loading comments...</Text>
                    </View>
                  ) : comments.length === 0 ? (
                    <View className="py-4 items-center">
                      <Text className="text-gray-500">No comments yet. Be the first to comment!</Text>
                    </View>
                  ) : (
                    comments.map((comment: any) => (
                      <View key={comment.id || comment._id} className="mb-4 pb-4 border-b border-gray-100">
                        <View className="flex-row mb-2">
                          <View className="w-8 h-8 rounded-full bg-gray-100 justify-center items-center mr-2">
                            <Text className="font-medium">
                              {comment.accountId?.name 
                                ? comment.accountId.name.substring(0, 1).toUpperCase() 
                                : "U"}
                            </Text>
                          </View>
                          <View>
                            <View className="flex-row items-center">
                              <Text className="font-medium">{comment.accountId?.name || "Anonymous"}</Text>
                              {comment.accountId?.role === "Counselor" && (
                                <View className="bg-yellow-100 rounded-full px-2 py-0.5 ml-2">
                                  <Text className="text-yellow-800 text-xs">Expert</Text>
                                </View>
                              )}
                            </View>
                            <Text className="text-xs text-gray-500">{formatDate(comment.createdAt)}</Text>
                          </View>
                        </View>
                        <Text className="ml-10 mb-2">{comment.content}</Text>
                        
                        <View className="ml-10 flex-row">
                          <TouchableOpacity className="mr-4 flex-row items-center">
                            <ThumbsUp size={14} color="#6b7280" />
                            <Text className="text-gray-600 text-xs ml-1">
                              {comment.voteUp?.length || 0}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity className="mr-4 flex-row items-center">
                            <ThumbsDown size={14} color="#6b7280" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            className="flex-row items-center"
                            onPress={() => {
                              setReplyingToComment(comment.id || comment._id);
                              setReplyContent('');
                            }}
                          >
                            <MessageCircle size={14} color="#6b7280" />
                            <Text className="text-gray-600 text-xs ml-1">Reply</Text>
                          </TouchableOpacity>
                        </View>
                        
                        {/* Comment replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <View className="ml-10 mt-2 pl-2 border-l-2 border-gray-100">
                            {comment.replies.map((reply: any) => (
                              <View key={reply.id || reply._id} className="mb-2">
                                <View className="flex-row items-center mb-1">
                                  <View className="w-6 h-6 rounded-full bg-gray-100 justify-center items-center mr-2">
                                    <Text className="text-xs font-medium">
                                      {reply.accountId?.name 
                                        ? reply.accountId.name.substring(0, 1).toUpperCase() 
                                        : "U"}
                                    </Text>
                                  </View>
                                  <View>
                                    <Text className="font-medium text-sm">
                                      {reply.accountId?.name || "Anonymous"}
                                    </Text>
                                    <Text className="text-xs text-gray-500">
                                      {formatDate(reply.createdAt)}
                                    </Text>
                                  </View>
                                </View>
                                <Text className="ml-8 text-sm">{reply.content}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                        
                        {/* Reply input */}
                        {replyingToComment === (comment.id || comment._id) && (
                          <View className="ml-10 mt-2">
                            <TextInput
                              className="border border-gray-300 rounded-md p-2 mb-2"
                              placeholder="Write your reply..."
                              value={replyContent}
                              onChangeText={setReplyContent}
                              multiline
                            />
                            <View className="flex-row justify-end">
                              <TouchableOpacity 
                                className="bg-gray-200 rounded-md px-3 py-1 mr-2"
                                onPress={() => setReplyingToComment(null)}
                              >
                                <Text>Cancel</Text>
                              </TouchableOpacity>
                              <TouchableOpacity 
                                className="bg-blue-500 rounded-md px-3 py-1"
                                // Handle reply submission here
                              >
                                <Text className="text-white">Reply</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}
                      </View>
                    ))
                  )}
                </View>
              ) : (
                <View className="p-4 items-center justify-center">
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text className="text-gray-500 mt-2">Loading post details...</Text>
                </View>
              )}
            </ScrollView>
            
            {/* Comment input */}
            <View className="p-3 border-t border-gray-200 bg-white">
              <View className="flex-row items-center">
                <TextInput
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChangeText={setNewComment}
                />
                <TouchableOpacity 
                  onPress={handleSubmitComment}
                  disabled={!newComment.trim() || submitLoading}
                >
                  <View className={`p-2 rounded-full ${!newComment.trim() || submitLoading ? 'bg-gray-300' : 'bg-blue-500'}`}>
                    <Send size={20} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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