import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, TextInput, ActivityIndicator } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Eye, MessageCircle, ChevronUp, ThumbsUp, ThumbsDown } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { ForumPost, Comment } from '@/services/forumAPI';
import { CommentItem } from './CommentItem';

interface PostDetailProps {
  post: ForumPost | null;
  accountId: string | null;
  comments: Comment[];
  loadingComments: boolean;
  fetchComments: () => void;
  formatDate: (dateInput: string | { $date: string } | Date) => string;
  getUserName: (accountId: any) => string;
  handlePostVote: (postId: string, voteType: 'up' | 'down') => void;
  handleCommentVote: (commentId: string, voteType: 'up' | 'down') => void;
  replyingToComment: string | null;
  setReplyingToComment: (id: string | null) => void;
  replyContent: string;
  setReplyContent: (v: string) => void;
  replyIsAnonymous: boolean;
  setReplyIsAnonymous: (v: boolean) => void;
  handleSubmitReply: (commentId: string) => void;
  expandedComments: Record<string, boolean>;
  setExpandedComments: (fn: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  commentReplies: Record<string, Comment[]>;
  fetchCommentReplies: (commentId: string) => void;
  loadingReplies: Record<string, boolean>;
  setSelectedPostId: (id: string | null) => void;
  newComment: string;
  setNewComment: (v: string) => void;
  handleSubmitComment: () => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({
  post,
  accountId,
  comments,
  loadingComments,
  fetchComments,
  formatDate,
  getUserName,
  handlePostVote,
  handleCommentVote,
  replyingToComment,
  setReplyingToComment,
  replyContent,
  setReplyContent,
  replyIsAnonymous,
  setReplyIsAnonymous,
  handleSubmitReply,
  expandedComments,
  setExpandedComments,
  commentReplies,
  fetchCommentReplies,
  loadingReplies,
  setSelectedPostId,
  newComment,
  setNewComment,
  handleSubmitComment
}) => {
  if (!post) return null;
  const upVotes = post.voteUp?.length || 0;
  const userVote = accountId ? (post.voteUp?.includes(accountId) ? 'up' : (post.voteDown?.includes(accountId) ? 'down' : null)) : null;
  const authorName = post.isAnonymous ? 'Anonymous' : getUserName(post.accountId);
  const downVotes = post.voteDown?.length || 0;

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

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={loadingComments} onRefresh={fetchComments} colors={["#F8BBD9"]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => setSelectedPostId(null)}
          className="flex-row items-center mb-4 bg-white py-2 px-3 rounded-full shadow-sm border border-gray-100"
        >
          <ChevronUp size={18} color="#F8BBD9" style={{ transform: [{ rotate: '-90deg' }] }} />
          <Text className="text-healthcare-primary font-medium ml-1">Back to Forum</Text>
        </TouchableOpacity>
        {/* Post Card */}
        <Card className="mb-6 shadow-md border border-gray-100 overflow-hidden">
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
            <Text className="font-bold text-2xl text-gray-800 mb-2">{post.title}</Text>
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
          <Text className="text-gray-700 mb-5 leading-6">{post.content}</Text>
          <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
            <Text className="text-sm text-gray-500">Was this post helpful?</Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => handlePostVote(post._id as string, 'up')}
                disabled={!accountId}
                className={`flex-row items-center px-3 py-2 mr-2 rounded-md ${userVote === 'up' ? 'bg-pink-50' : 'bg-gray-50'}`}
              >
                <ThumbsUp size={16} color={userVote === 'up' ? '#F8BBD9' : '#6b7280'} />
                <Text className={`text-sm ml-1 ${userVote === 'up' ? 'text-healthcare-primary font-medium' : 'text-gray-600'}`}>
                  Yes ({upVotes})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handlePostVote(post._id as string, 'down')}
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
          <Text className="text-lg font-bold text-healthcare-primary">Comments ({comments.length})</Text>
          {comments.length > 0 && (
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-xs text-healthcare-primary mr-1">Most Helpful</Text>
              <ChevronUp size={14} color="#F8BBD9" />
            </TouchableOpacity>
          )}
        </View>
        {/* Comments List */}
        {loadingComments ? (
          <View className="py-8 items-center">
            <ActivityIndicator color="#F8BBD9" size="large" />
          </View>
        ) : comments.length > 0 ? (
          comments.map(comment => {
            if (!comment || !comment._id) return null;
            const commentId = comment._id;
            const voteUp = Array.isArray(comment.voteUp) ? comment.voteUp : [];
            const voteDown = Array.isArray(comment.voteDown) ? comment.voteDown : [];
            const userCommentVote = accountId ? (voteUp.includes(accountId) ? 'up' : (voteDown.includes(accountId) ? 'down' : null)) : null;
            const commentUpVotes = voteUp.length;
            const isExpertComment = comment.accountId && typeof comment.accountId === 'object' && comment.accountId.role === 'Counselor';
            let authorName = 'Unknown User';
            if (comment.isAnonymous) {
              authorName = 'Anonymous';
            } else if (comment.accountId) {
              if (typeof comment.accountId === 'string') {
                authorName = 'User';
              } else if (typeof comment.accountId === 'object') {
                authorName = comment.accountId.name || `User ${String(comment.accountId._id || '').substring(0, 5)}`;
              }
            }
            return (
              <CommentItem
                key={commentId}
                comment={comment}
                accountId={accountId}
                isExpanded={!!expandedComments[commentId]}
                replies={commentReplies[commentId] || []}
                isLoadingReplies={Boolean(loadingReplies[commentId])}
                userCommentVote={userCommentVote}
                commentUpVotes={commentUpVotes}
                isExpertComment={!!(comment.accountId && typeof comment.accountId === 'object' && comment.accountId.role === 'Counselor')}
                authorName={authorName}
                handleCommentVote={handleCommentVote}
                setReplyingToComment={setReplyingToComment}
                replyingToComment={replyingToComment}
                fetchCommentReplies={fetchCommentReplies}
                setExpandedComments={setExpandedComments}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                handleSubmitReply={handleSubmitReply}
                formatDate={formatDate}
              />
            );
          })
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
              className={`bg-healthcare-primary rounded-full p-3.5 ${(!newComment.trim()) ? 'opacity-50' : ''}`}
              onPress={handleSubmitComment}
              disabled={!newComment.trim()}
            >
              <ChevronUp size={18} color="#fff" />
            </TouchableOpacity>
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
