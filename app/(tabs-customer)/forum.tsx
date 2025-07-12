import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Search, MessageCircle, Clock, Heart, ChevronUp, ChevronDown, Award,
  Share2, ExternalLink, Mail, Copy, Eye, Plus, Filter, TrendingUp,
  Users, CheckCircle, SortDescIcon, SortAsc, X, Send
} from 'lucide-react-native';
import forumAPI, { ForumPost } from '@/services/forumAPI';
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
  
  // State for API data
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [commentReplies, setCommentReplies] = useState<Record<string, any[]>>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  
  // User state
  const [accountId, setAccountId] = useState<string | null>(null);
  
  // Fetch categories, tags, and community stats on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Try to get account ID from storage
        const userId = await AsyncStorage.getItem('UserId');
        setAccountId(userId);
        
        // Fetch community stats
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
      // This is a placeholder - in a real app, you would call an API
      // const response = await forumAPI.getCommunityStats();
      
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
      const params: any = {
        page,
        limit: 10,
        sort: activeFilter,
        search: searchQuery
      };
      
      // Set type based on active tab
      switch (activeTab) {
        case 'questions':
          params.type = 'questions';
          break;
        case 'expert':
          params.type = 'expert';
          break;
        case 'following':
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
      const response = await forumAPI.getPosts(params);
      
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
      
      // Ensure all posts have required properties
      const validPosts = newPosts.filter((post: any) => {
        if (!post) return false;
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
        'Connection Error', 
        'Unable to load forum data. Please check your network connection and try again.',
        [{ text: 'Close' }, { text: 'Retry', onPress: () => fetchForumData() }]
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
          await forumAPI.incrementView(selectedPostId);
        } catch (viewError) {
          console.warn('Error incrementing view count:', viewError);
          // Continue with fetching comments even if view increment fails
        }
        
        // Get the post details
        const postResponse = await forumAPI.getPostById(selectedPostId);
        
        // Safely access post data
        let post = null;
        if (postResponse && postResponse.data) {
          post = postResponse.data;
        }
        
        if (post) {
          // Store the detailed post data
          setSelectedPostDetail(post);
          
          // Fetch its comments with pagination
          const commentsResponse = await forumAPI.getCommentsByPostId(selectedPostId, accountId || undefined);
          
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
            }
          }
          
          // Ensure all comments have required properties
          const validComments = commentsList.filter((comment: any) => comment && (comment.id || comment._id));
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
          'Error', 
          'Could not load comments. Please try again later.',
          [{ text: 'Close', style: 'cancel' }, { text: 'Retry', onPress: fetchComments }]
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
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
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
        isAnonymous: isAnonymous,
        accountId: accountId
      };
      
      await forumAPI.addComment(selectedPostId, commentData);
      
      // Clear the input immediately to improve UX
      setNewComment('');
      
      // After submitting, refresh the comments and update post data
      await fetchComments();
      
      // Also refresh the forum data in the background to update answer counts
      fetchForumData(true);
      
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert(
        'Error', 
        'Unable to post comment. Please try again later.',
        [{ text: 'Close' }, { text: 'Retry', onPress: handleSubmitComment }]
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
      const response = await forumAPI.searchPosts(searchQuery);
      const results = response.data || [];
      
      setForumPosts(results);
      setHasMorePosts(false); // Don't load more when searching
      
      if (results.length === 0) {
        Alert.alert('Notice', 'No posts found matching your search query.');
      }
    } catch (error) {
      console.error('Error searching posts:', error);
      Alert.alert(
        'Search Error', 
        'Unable to search posts. Please try again later.',
        [{ text: 'Close' }, { text: 'Retry', onPress: handleSearch }]
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
      if (!accountId) {
        Alert.alert('Login Required', 'You need to be logged in to vote');
        return;
      }
      
      await forumAPI.votePost(postId, { voteType, accountId });
      
      // Refresh the post details to update vote count
      if (selectedPostId === postId) {
        fetchComments();
      }
      
      // Also refresh the forum list to reflect changes
      fetchForumData(true);
      
    } catch (error) {
      console.error(`Error ${voteType}-voting post:`, error);
      Alert.alert('Error', 'Could not register your vote. Please try again later.');
    }
  };
  
  // Find the selected post
  // Use the detailed post data if available, otherwise fallback to the list item
  const selectedPost = selectedPostDetail || 
    (selectedPostId ? forumPosts.find(post => getPostId(post) === selectedPostId) : null);

  // Handle comment voting
  const handleCommentVote = async (commentId: string, voteType: 'up' | 'down') => {
    try {
      if (!accountId) {
        Alert.alert('Login Required', 'Please log in to vote on comments.');
        return;
      }
      
      await forumAPI.voteComment(commentId, { voteType, accountId });
      
      // Refresh comments to show updated vote counts
      if (selectedPostId) {
        fetchComments();
      }
    } catch (error) {
      console.error(`Error ${voteType}-voting comment:`, error);
      Alert.alert('Error', 'Could not register your vote. Please try again later.');
    }
  };

  // Fetch replies for a comment
  const fetchCommentReplies = async (commentId: string) => {
    try {
      setLoadingReplies(prev => ({ ...prev, [commentId]: true }));
      
      const response = await forumAPI.getCommentReplies(commentId);
      
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
        }
      }
      
      // Update the replies state
      setCommentReplies(prev => ({
        ...prev,
        [commentId]: repliesList
      }));
      
    } catch (error) {
      console.error('Error fetching comment replies:', error);
      Alert.alert('Error', 'Could not load replies. Please try again later.');
    } finally {
      setLoadingReplies(prev => ({ ...prev, [commentId]: false }));
    }
  };

  // Handle submitting a reply to a comment
  const handleSubmitReply = async (commentId: string) => {
    if (replyContent.trim() === '' || !accountId) return;
    
    try {
      setSubmittingReply(true);
      
      const replyData = {
        content: replyContent,
        isAnonymous: replyIsAnonymous,
        accountId: accountId,
        postId: selectedPostId
      };
      
      await forumAPI.replyToComment(commentId, replyData);
      
      // Clear the input immediately to improve UX
      setReplyContent('');
      setReplyingToComment(null);
      
      // Refresh the comment's replies
      fetchCommentReplies(commentId);
      
      // Also refresh all comments to update reply counts
      fetchComments();
      
    } catch (error) {
      console.error('Error adding reply:', error);
      Alert.alert('Error', 'Could not post reply. Please try again later.');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab: 'all' | 'questions' | 'expert' | 'following' | 'myPosts') => {
    setActiveTab(tab);
  };

  // Handle load more posts
  const handleLoadMore = () => {
    if (!loading && hasMorePosts) {
      fetchForumData();
    }
  };

  // Handle post creation success
  const handlePostCreated = () => {
    // Close the modal
    setShowCreateModal(false);
    
    // Refresh the forum data
    fetchForumData(true);
    
    // Show success message
    Alert.alert('Success', 'Your post has been created successfully!');
  };

  // Post Card Component
  const PostCard = ({ post, onPress, isSelected }: { post: any, onPress: () => void, isSelected: boolean }) => {
    const postId = getPostId(post);
    const upVoteCount = post.voteUp?.length || 0;
    const downVoteCount = post.voteDown?.length || 0;
    const voteCount = upVoteCount - downVoteCount;
    
    // Determine if the current user has voted
    const userVote = accountId ? 
      (post.voteUp?.includes(accountId) ? 'up' : 
       post.voteDown?.includes(accountId) ? 'down' : null) 
      : null;
    
    const getCategoryColor = (category: string) => {
      switch(category) {
        case 'Reproductive Health':
          return 'bg-pink-100 text-pink-800';
        case 'Mental Health':
          return 'bg-purple-100 text-purple-800';
        case 'Pregnancy & Family Planning':
          return 'bg-blue-100 text-blue-800';
        case 'STI Prevention':
          return 'bg-red-100 text-red-800';
        case 'Menstrual Health':
          return 'bg-orange-100 text-orange-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };
    
    // Format post date
    const postDate = post.createdAt ? formatDate(post.createdAt) : '';
    
    // Get author name safely
    const authorName = post.accountId?.name || (post.isAnonymous ? "Anonymous" : "Unknown User");
    
    // Check if post has expert answer
    const hasExpertAnswer = post.hasExpertAnswer || false;
    
    return (
      <Card className="mb-3">
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          {/* Post Header */}
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1">
              <Text className="font-bold text-base text-gray-800">{post.title}</Text>
              <View className="flex-row items-center mt-1">
                <View className="flex-row items-center">
                  {post.isAnonymous ? (
                    <View className="w-6 h-6 rounded-full bg-gray-200 items-center justify-center mr-2">
                      <Text className="text-xs font-medium">A</Text>
                    </View>
                  ) : (
                    <View className="w-6 h-6 rounded-full bg-healthcare-primary items-center justify-center mr-2">
                      <Text className="text-xs font-medium text-white">{authorName.charAt(0)}</Text>
                    </View>
                  )}
                  <Text className="text-xs text-gray-600">{authorName} • {postDate}</Text>
                </View>
              </View>
            </View>
            
            {/* Vote Count */}
            <View className="items-center bg-gray-50 py-1 px-2 rounded-lg">
              <TouchableOpacity 
                onPress={() => handlePostVote(postId || '', 'up')}
                disabled={!accountId}
              >
                <ChevronUp 
                  size={16} 
                  color={userVote === 'up' ? '#F8BBD9' : '#6b7280'} 
                />
              </TouchableOpacity>
              <Text className={`text-sm font-medium ${voteCount > 0 ? 'text-green-600' : voteCount < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {voteCount}
              </Text>
              <TouchableOpacity 
                onPress={() => handlePostVote(postId || '', 'down')}
                disabled={!accountId}
              >
                <ChevronDown 
                  size={16} 
                  color={userVote === 'down' ? '#F8BBD9' : '#6b7280'} 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Post Content Preview */}
          <Text numberOfLines={3} className="text-gray-600 text-sm mb-3">
            {post.content}
          </Text>
          
          {/* Post Footer */}
          <View className="flex-row justify-between items-center">
            <View className="flex-row">
              {/* Category Tag */}
              <View className={`rounded-full px-3 py-1 mr-2 ${getCategoryColor(post.category)}`}>
                <Text className="text-xs font-medium">{post.category}</Text>
              </View>
              
              {/* Expert Badge if applicable */}
              {hasExpertAnswer && (
                <View className="bg-green-100 rounded-full px-3 py-1 flex-row items-center">
                  <CheckCircle size={12} color="#059669" />
                  <Text className="text-xs font-medium text-green-800 ml-1">Expert</Text>
                </View>
              )}
            </View>
            
            <View className="flex-row items-center">
              <View className="flex-row items-center mr-3">
                <Eye size={14} color="#6b7280" />
                <Text className="text-xs text-gray-500 ml-1">{post.viewCount || 0}</Text>
              </View>
              <View className="flex-row items-center">
                <MessageCircle size={14} color="#6b7280" />
                <Text className="text-xs text-gray-500 ml-1">{post.answerCount || 0}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    );
  };
  
  // Post Detail Component
  const PostDetail = ({ post }: { post: ForumPost | null | any }) => {
    if (!post) return null;
    
    const upVoteCount = post.voteUp?.length || 0;
    const downVoteCount = post.voteDown?.length || 0;
    const voteCount = upVoteCount - downVoteCount;
    
    // Determine if the current user has voted
    const userVote = accountId ? 
      (post.voteUp?.includes(accountId) ? 'up' : 
       post.voteDown?.includes(accountId) ? 'down' : null) 
      : null;
      
    const getCategoryColor = (category: string) => {
      switch(category) {
        case 'Reproductive Health':
          return 'bg-pink-100 text-pink-800';
        case 'Mental Health':
          return 'bg-purple-100 text-purple-800';
        case 'Pregnancy & Family Planning':
          return 'bg-blue-100 text-blue-800';
        case 'STI Prevention':
          return 'bg-red-100 text-red-800';
        case 'Menstrual Health':
          return 'bg-orange-100 text-orange-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };
      
    const postDate = post.createdAt ? formatDate(post.createdAt) : '';
    const authorName = post.accountId?.name || (post.isAnonymous ? "Anonymous" : "Unknown User");
    
    return (
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loadingComments}
            onRefresh={fetchComments}
            colors={["#F8BBD9"]}
            tintColor="#F8BBD9"
          />
        }
      >
        {/* Back button */}
        <TouchableOpacity 
          onPress={() => setSelectedPostId(null)} 
          className="flex-row items-center mb-3"
        >
          <ChevronUp size={20} color="#6b7280" style={{ transform: [{ rotate: '-90deg' }] }} />
          <Text className="text-gray-600 ml-1">Back to posts</Text>
        </TouchableOpacity>
        
        {/* Post Detail Card */}
        <Card className="mb-4">
          {/* Post Header */}
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1">
              <Text className="font-bold text-lg text-gray-800">{post.title}</Text>
              <View className="flex-row items-center mt-2">
                {post.isAnonymous ? (
                  <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center mr-2">
                    <Text className="text-sm font-medium">A</Text>
                  </View>
                ) : (
                  <View className="w-8 h-8 rounded-full bg-healthcare-primary items-center justify-center mr-2">
                    <Text className="text-sm font-medium text-white">{authorName.charAt(0)}</Text>
                  </View>
                )}
                <View>
                  <Text className="text-sm text-gray-800 font-medium">{authorName}</Text>
                  <Text className="text-xs text-gray-500">{postDate}</Text>
                </View>
              </View>
            </View>
            
            {/* Vote Controls */}
            <View className="items-center bg-gray-50 py-2 px-3 rounded-lg">
              <TouchableOpacity 
                onPress={() => handlePostVote(getPostId(post) || '', 'up')}
                disabled={!accountId}
              >
                <ChevronUp 
                  size={20} 
                  color={userVote === 'up' ? '#F8BBD9' : '#6b7280'} 
                />
              </TouchableOpacity>
              <Text className={`text-base font-medium ${voteCount > 0 ? 'text-green-600' : voteCount < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {voteCount}
              </Text>
              <TouchableOpacity 
                onPress={() => handlePostVote(getPostId(post) || '', 'down')}
                disabled={!accountId}
              >
                <ChevronDown 
                  size={20} 
                  color={userVote === 'down' ? '#F8BBD9' : '#6b7280'} 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Post Content */}
          <Text className="text-gray-700 mb-4 leading-6">
            {post.content}
          </Text>
          
          {/* Post Footer */}
          <View className="flex-row flex-wrap">
            {/* Category */}
            <View className={`rounded-full px-3 py-1 mr-2 mb-2 ${getCategoryColor(post.category)}`}>
              <Text className="text-xs font-medium">{post.category}</Text>
            </View>
            
            {/* Tags */}
            {post.tags && post.tags.map((tag: string, index: number) => (
              <View key={index} className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2">
                <Text className="text-xs text-gray-700">#{tag}</Text>
              </View>
            ))}
          </View>
          
          <View className="h-px bg-gray-200 my-3" />
          
          {/* Post Stats */}
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Eye size={16} color="#6b7280" />
              <Text className="text-sm text-gray-500 ml-1">{post.viewCount || 0} views</Text>
            </View>
            <View className="flex-row items-center">
              <MessageCircle size={16} color="#6b7280" />
              <Text className="text-sm text-gray-500 ml-1">{post.answerCount || 0} comments</Text>
            </View>
          </View>
        </Card>
        
        {/* Comments Section */}
        <View className="mb-4">
          <Text className="text-lg font-bold mb-3 text-healthcare-primary">
            Comments {comments.length > 0 && `(${comments.length})`}
          </Text>
          
          {loadingComments ? (
            <View className="py-10 items-center">
              <ActivityIndicator color="#F8BBD9" size="large" />
            </View>
          ) : comments.length > 0 ? (
            comments.map((comment: any) => {
              const commentId = comment._id || comment.id;
              const commentAuthorName = comment.accountId?.name || (comment.isAnonymous ? "Anonymous" : "Unknown User");
              const commentDate = formatDate(comment.createdAt);
              const commentUpVotes = comment.voteUp?.length || 0;
              const commentDownVotes = comment.voteDown?.length || 0;
              const commentVoteCount = commentUpVotes - commentDownVotes;
              const userCommentVote = accountId ? 
                (comment.voteUp?.includes(accountId) ? 'up' : 
                 comment.voteDown?.includes(accountId) ? 'down' : null) 
                : null;
              
              const isExpanded = expandedComments[commentId] || false;
              const replies = commentReplies[commentId] || [];
              const isLoadingReplies = loadingReplies[commentId] || false;
              
              return (
                <Card key={commentId} className="mb-3">
                  {/* Comment Header */}
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-row items-center flex-1">
                      {comment.isAnonymous ? (
                        <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center mr-2">
                          <Text className="text-sm font-medium">A</Text>
                        </View>
                      ) : (
                        <View className="w-8 h-8 rounded-full bg-healthcare-secondary items-center justify-center mr-2">
                          <Text className="text-sm font-medium text-white">{commentAuthorName.charAt(0)}</Text>
                        </View>
                      )}
                      <View>
                        <Text className="text-sm font-medium">{commentAuthorName}</Text>
                        <Text className="text-xs text-gray-500">{commentDate}</Text>
                      </View>
                    </View>
                    
                    {/* Comment Votes */}
                    <View className="flex-row items-center">
                      <TouchableOpacity 
                        onPress={() => handleCommentVote(commentId, 'up')}
                        disabled={!accountId}
                        className="p-1"
                      >
                        <ChevronUp 
                          size={16} 
                          color={userCommentVote === 'up' ? '#F8BBD9' : '#6b7280'} 
                        />
                      </TouchableOpacity>
                      <Text className={`text-sm mx-1 ${commentVoteCount > 0 ? 'text-green-600' : commentVoteCount < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {commentVoteCount}
                      </Text>
                      <TouchableOpacity 
                        onPress={() => handleCommentVote(commentId, 'down')}
                        disabled={!accountId}
                        className="p-1"
                      >
                        <ChevronDown 
                          size={16} 
                          color={userCommentVote === 'down' ? '#F8BBD9' : '#6b7280'} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {/* Comment Content */}
                  <Text className="text-gray-700 text-sm mb-3">
                    {comment.content}
                  </Text>
                  
                  {/* Comment Actions */}
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <TouchableOpacity 
                        onPress={() => {
                          if (comment.hasReplies && !isExpanded) {
                            setExpandedComments({...expandedComments, [commentId]: true});
                            fetchCommentReplies(commentId);
                          } else {
                            setExpandedComments({...expandedComments, [commentId]: !isExpanded});
                          }
                        }}
                        className="flex-row items-center mr-4"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp size={14} color="#6b7280" />
                            <Text className="text-xs text-gray-600 ml-1">Hide Replies</Text>
                          </>
                        ) : (
                          <>
                            <ChevronDown size={14} color="#6b7280" />
                            <Text className="text-xs text-gray-600 ml-1">
                              {comment.hasReplies ? `View Replies (${comment.replyCount || 0})` : "No Replies"}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                      
                      {accountId && (
                        <TouchableOpacity 
                          onPress={() => setReplyingToComment(replyingToComment === commentId ? null : commentId)}
                          className="flex-row items-center"
                        >
                          <MessageCircle size={14} color="#6b7280" />
                          <Text className="text-xs text-gray-600 ml-1">Reply</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  
                  {/* Reply Form */}
                  {replyingToComment === commentId && (
                    <View className="mt-3 pl-10 border-t border-gray-100 pt-3">
                      <View className="flex-row items-center mb-2">
                        <TextInput
                          className="flex-1 bg-gray-100 rounded-lg px-3 py-2 mr-2 text-sm"
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChangeText={setReplyContent}
                          multiline={true}
                        />
                        <TouchableOpacity
                          className={`bg-healthcare-primary rounded-full p-2 ${(!replyContent.trim() || submittingReply) ? 'opacity-50' : ''}`}
                          onPress={() => handleSubmitReply(commentId)}
                          disabled={!replyContent.trim() || submittingReply}
                        >
                          {submittingReply ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <Send size={16} color="#fff" />
                          )}
                        </TouchableOpacity>
                      </View>
                      <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                          <Text className="text-xs text-gray-500">Post as anonymous</Text>
                          <Switch
                            value={replyIsAnonymous}
                            onValueChange={setReplyIsAnonymous}
                            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                            thumbColor={replyIsAnonymous ? '#3b82f6' : '#f4f4f5'}
                          />
                        </View>
                        <TouchableOpacity onPress={() => setReplyingToComment(null)}>
                          <Text className="text-xs text-gray-500">Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  
                  {/* Replies */}
                  {isExpanded && (
                    <View className="mt-3 pl-6 border-l-2 border-gray-100">
                      {isLoadingReplies ? (
                        <View className="py-4 items-center">
                          <ActivityIndicator color="#F8BBD9" size="small" />
                        </View>
                      ) : replies.length > 0 ? (
                        replies.map((reply: any) => {
                          const replyId = reply._id || reply.id;
                          const replyAuthorName = reply.accountId?.name || (reply.isAnonymous ? "Anonymous" : "Unknown User");
                          const replyDate = formatDate(reply.createdAt);
                          
                          return (
                            <View key={replyId} className="mb-3 pb-3 border-b border-gray-100 last:border-b-0">
                              <View className="flex-row items-center mb-1">
                                <View className="w-6 h-6 rounded-full bg-gray-100 items-center justify-center mr-1">
                                  <Text className="text-xs">
                                    {reply.accountId?.isVerified ? "✓" 
                                      : reply.isAnonymous ? "A" : replyAuthorName.charAt(0)}
                                  </Text>
                                </View>
                                <Text className="text-xs font-medium">{replyAuthorName}</Text>
                                <Text className="text-xs text-gray-500 ml-1">• {replyDate}</Text>
                              </View>
                              <Text className="text-sm text-gray-700">{reply.content}</Text>
                            </View>
                          );
                        })
                      ) : (
                        <Text className="text-xs text-gray-500 py-2">No replies yet.</Text>
                      )}
                    </View>
                  )}
                </Card>
              );
            })
          ) : (
            <Text className="text-gray-500 text-center py-4">
              No comments yet. Be the first to comment!
            </Text>
          )}
        </View>
      </ScrollView>
    );
  };

  // Comment input component
  const CommentInput = () => {
    return (
      <View className="px-4 py-3 border-t border-gray-200 bg-white">
        <View className="flex-row items-center mb-2">
          <TextInput
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2 text-sm"
            placeholder="Write a comment..."
            value={newComment}
            onChangeText={setNewComment}
            multiline={true}
          />
          <TouchableOpacity
            className={`bg-healthcare-primary rounded-full p-2 ${(!newComment.trim() || submitLoading) ? 'opacity-50' : ''}`}
            onPress={handleSubmitComment}
            disabled={!newComment.trim() || submitLoading}
          >
            {submitLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={16} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
        
        <View className="flex-row items-center">
          <Text className="text-xs text-gray-500">Post as anonymous</Text>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
            thumbColor={isAnonymous ? '#3b82f6' : '#f4f4f5'}
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }], marginLeft: 4 }}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-3 pb-2 shadow-sm">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-xl font-bold text-healthcare-primary">Health Forum</Text>
          <TouchableOpacity 
            className="bg-healthcare-primary rounded-full w-10 h-10 items-center justify-center"
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View className="mb-3">
          <Input
            placeholder="Search topics, questions, or posts"
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Search size={18} color="#9ca3af" />}
            className="bg-gray-50"
          />
        </View>
        
        {/* Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="mb-1 -mx-1"
          contentContainerStyle={{ paddingHorizontal: 4 }}
        >
          <TouchableOpacity
            onPress={() => handleTabChange('all')}
            className={`px-4 py-2 mr-2 rounded-full ${activeTab === 'all' ? 'bg-healthcare-primary' : 'bg-gray-100'}`}
          >
            <Text className={`font-medium ${activeTab === 'all' ? 'text-white' : 'text-gray-700'}`}>All Posts</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleTabChange('questions')}
            className={`px-4 py-2 mr-2 rounded-full ${activeTab === 'questions' ? 'bg-healthcare-primary' : 'bg-gray-100'}`}
          >
            <Text className={`font-medium ${activeTab === 'questions' ? 'text-white' : 'text-gray-700'}`}>Questions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleTabChange('expert')}
            className={`px-4 py-2 mr-2 rounded-full ${activeTab === 'expert' ? 'bg-healthcare-primary' : 'bg-gray-100'}`}
          >
            <Text className={`font-medium ${activeTab === 'expert' ? 'text-white' : 'text-gray-700'}`}>Expert Advice</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleTabChange('following')}
            className={`px-4 py-2 mr-2 rounded-full ${activeTab === 'following' ? 'bg-healthcare-primary' : 'bg-gray-100'}`}
          >
            <Text className={`font-medium ${activeTab === 'following' ? 'text-white' : 'text-gray-700'}`}>Following</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleTabChange('myPosts')}
            className={`px-4 py-2 mr-2 rounded-full ${activeTab === 'myPosts' ? 'bg-healthcare-primary' : 'bg-gray-100'}`}
          >
            <Text className={`font-medium ${activeTab === 'myPosts' ? 'text-white' : 'text-gray-700'}`}>My Posts</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      <View className="flex-1">
        {/* Sort options */}
        <View className="flex-row justify-between items-center px-4 py-2 bg-white border-b border-gray-100">
          <View className="flex-row items-center">
            <Filter size={16} color="#6b7280" />
            <Text className="text-gray-600 ml-1 text-sm font-medium">Sort by:</Text>
          </View>
          
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setActiveFilter('newest')}
              className={`flex-row items-center mr-4 ${activeFilter === 'newest' ? 'border-b-2 border-healthcare-primary' : ''}`}
            >
              <Clock size={14} color={activeFilter === 'newest' ? '#F8BBD9' : '#6b7280'} />
              <Text className={`text-sm ml-1 ${activeFilter === 'newest' ? 'text-healthcare-primary font-medium' : 'text-gray-600'}`}>
                Newest
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setActiveFilter('popular')}
              className={`flex-row items-center mr-4 ${activeFilter === 'popular' ? 'border-b-2 border-healthcare-primary' : ''}`}
            >
              <TrendingUp size={14} color={activeFilter === 'popular' ? '#F8BBD9' : '#6b7280'} />
              <Text className={`text-sm ml-1 ${activeFilter === 'popular' ? 'text-healthcare-primary font-medium' : 'text-gray-600'}`}>
                Popular
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setActiveFilter('votes')}
              className={`flex-row items-center ${activeFilter === 'votes' ? 'border-b-2 border-healthcare-primary' : ''}`}
            >
              <Award size={14} color={activeFilter === 'votes' ? '#F8BBD9' : '#6b7280'} />
              <Text className={`text-sm ml-1 ${activeFilter === 'votes' ? 'text-healthcare-primary font-medium' : 'text-gray-600'}`}>
                Top Voted
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Community Stats Summary for All Posts tab */}
        {activeTab === 'all' && !searchQuery && !selectedPostId && (
          <View className="bg-white mx-4 mt-3 mb-2 rounded-xl shadow-sm p-4">
            <Text className="text-base font-semibold mb-3 text-healthcare-primary">Community Statistics</Text>
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Users size={18} color="#F8BBD9" />
                <Text className="font-bold mt-1">{communityStats.activeMembers}</Text>
                <Text className="text-xs text-gray-500">Members</Text>
              </View>
              <View className="items-center flex-1">
                <MessageCircle size={18} color="#F8BBD9" />
                <Text className="font-bold mt-1">{communityStats.discussions}</Text>
                <Text className="text-xs text-gray-500">Discussions</Text>
              </View>
              <View className="items-center flex-1">
                <CheckCircle size={18} color="#F8BBD9" />
                <Text className="font-bold mt-1">{communityStats.expertAnswers}</Text>
                <Text className="text-xs text-gray-500">Expert Answers</Text>
              </View>
            </View>
          </View>
        )}

        {/* Main Content - Either the post list or post detail */}
        {selectedPostId ? (
          <>
            <PostDetail post={selectedPost} />
            {!loadingComments && <CommentInput />}
          </>
        ) : (
          <FlatList
            data={forumPosts}
            keyExtractor={(item) => getPostId(item) || Math.random().toString()}
            renderItem={({ item }) => (
              <PostCard 
                post={item} 
                onPress={() => setSelectedPostId(getPostId(item))} 
                isSelected={false}
              />
            )}
            ListEmptyComponent={
              loading ? null : (
                <View className="items-center justify-center p-10">
                  <Text className="text-gray-500 text-center">
                    {searchQuery ? "No posts found matching your search query." : "No posts available."}
                  </Text>
                  <Button
                    title="Create First Post"
                    onPress={() => setShowCreateModal(true)}
                    variant="primary"
                    size="small"
                    className="mt-4"
                  />
                </View>
              )
            }
            ListFooterComponent={
              loading && !refreshing ? (
                <View className="py-6 items-center">
                  <ActivityIndicator color="#F8BBD9" size="large" />
                </View>
              ) : hasMorePosts ? (
                <TouchableOpacity 
                  className="py-4 items-center"
                  onPress={handleLoadMore}
                >
                  <Text className="text-healthcare-primary">Load More</Text>
                </TouchableOpacity>
              ) : (
                <View className="py-6" />
              )
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#F8BBD9"]}
                tintColor="#F8BBD9"
              />
            }
            contentContainerStyle={{ padding: 16, paddingTop: 8 }}
            showsVerticalScrollIndicator={false}
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
