import React from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { Card } from '@/components/ui/Card';
import { ChevronUp, ChevronDown, MessageCircle, CheckCircle } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Comment } from '@/services/forumAPI';

interface CommentItemProps {
  comment: Comment;
  accountId: string | null;
  isExpanded: boolean;
  replies: Comment[];
  isLoadingReplies: boolean;
  userCommentVote: 'up' | 'down' | null;
  commentUpVotes: number;
  isExpertComment: boolean;
  authorName: string;
  handleCommentVote: (commentId: string, voteType: 'up' | 'down') => void;
  setReplyingToComment: (id: string | null) => void;
  replyingToComment: string | null;
  fetchCommentReplies: (commentId: string) => void;
  setExpandedComments: (fn: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  replyContent: string;
  setReplyContent: (v: string) => void;
  handleSubmitReply: (commentId: string) => void;
  formatDate: (dateInput: string | { $date: string } | Date) => string;
}

export const CommentItem: React.FC<CommentItemProps> = React.memo(({
  comment,
  accountId,
  isExpanded,
  replies,
  isLoadingReplies,
  userCommentVote,
  commentUpVotes,
  isExpertComment,
  authorName,
  handleCommentVote,
  setReplyingToComment,
  replyingToComment,
  fetchCommentReplies,
  setExpandedComments,
  replyContent,
  setReplyContent,
  handleSubmitReply,
  formatDate
}) => {
  const commentId = comment._id;
  return (
    <Card
      className={`mb-4 shadow-sm ${
        isExpertComment
          ? 'border-2 border-green-200 bg-green-50/30'
          : 'border border-gray-100'
      }`}
    >
      <View className="flex-row items-center">
        {!comment?.isAnonymous && comment?.accountId && typeof comment?.accountId === 'object' && (
          <Image
            source={{ uri: comment?.accountId?.image || 'https://i.imgur.com/6VBx3io.png' }}
            className={`${isExpertComment ? 'w-10 h-10' : 'w-8 h-8'} rounded-full mr-2 ${isExpertComment ? 'border-2 border-green-400' : ''}`}
          />
        )}
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className={`font-bold ${isExpertComment ? 'text-green-800 text-base' : 'text-gray-800'}`}>{authorName}</Text>
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
      <Text className={`mt-3 mb-1 leading-5 ${isExpertComment ? 'text-gray-800 font-medium' : 'text-gray-700'}`}>{comment.content}</Text>
      <View className={`flex-row justify-between items-center mt-3 pt-2 border-t ${isExpertComment ? 'border-green-200' : 'border-gray-100'}`}>
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => handleCommentVote(commentId, 'up')}
            disabled={!accountId}
            className={`p-1 rounded-md mr-1 ${isExpertComment ? 'bg-green-100' : 'bg-gray-50'}`}
          >
            <ChevronUp size={16} color={userCommentVote === 'up' ? '#F8BBD9' : isExpertComment ? '#047857' : '#6b7280'} />
          </TouchableOpacity>
          <Text className={`text-sm mx-1 font-medium ${isExpertComment ? 'text-green-700' : 'text-green-600'}`}>{commentUpVotes}</Text>
          <TouchableOpacity
            onPress={() => handleCommentVote(commentId, 'down')}
            disabled={!accountId}
            className={`p-1 rounded-md mr-3 ${isExpertComment ? 'bg-green-100' : 'bg-gray-50'}`}
          >
            <ChevronDown size={16} color={userCommentVote === 'down' ? '#F8BBD9' : isExpertComment ? '#047857' : '#6b7280'} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setReplyingToComment(replyingToComment === commentId ? null : commentId)}
            className={`flex-row items-center px-2 py-1 rounded-md ${isExpertComment ? 'bg-green-100' : 'bg-gray-50'}`}
          >
            <MessageCircle size={14} color={isExpertComment ? '#047857' : '#6b7280'} />
            <Text className={`text-xs font-medium ml-1 ${isExpertComment ? 'text-green-800' : 'text-gray-600'}`}>Reply</Text>
          </TouchableOpacity>
        </View>
        {((comment.replies && comment.replies.length > 0) || (replies && replies.length > 0)) && (
          <TouchableOpacity
            onPress={() => {
              if (!isExpanded) fetchCommentReplies(commentId);
              setExpandedComments(prev => ({ ...prev, [commentId]: !isExpanded }));
            }}
            className={`flex-row items-center px-2 py-1 rounded-md ${isExpertComment ? 'bg-green-100' : 'bg-gray-50'}`}
          >
            <Text className="text-xs font-medium text-healthcare-primary mr-1">
              {isExpanded ? 'Hide Replies' : `View ${replies.length} Reply${replies.length !== 1 ? 's' : ''}`}
            </Text>
            <ChevronDown size={14} color="#F8BBD9" style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }} />
          </TouchableOpacity>
        )}
      </View>
      {/* Reply Form */}
      {replyingToComment === commentId && (
        <View className={`mt-4 pt-3 p-3 rounded-lg ${isExpertComment ? 'bg-green-50' : 'bg-gray-50'}`}>
          <TextInput
            className={`bg-white rounded-lg px-3 py-2 text-sm ${isExpertComment ? 'border border-green-200' : 'border border-gray-200'}`}
            placeholder={`Replying to ${comment.isAnonymous ? 'Anonymous' : comment.accountId?.name}${isExpertComment ? ' (Expert)' : ''}...`}
            value={replyContent}
            onChangeText={setReplyContent}
            multiline
          />
          <View className="flex-row justify-between items-center mt-3">
            <View className="flex-row">
              <Button
                title="Cancel"
                variant="outline"
                size="small"
                onPress={() => setReplyingToComment(null)}
                className="mr-2"
              />
              <Button
                title="Reply"
                size="small"
                onPress={() => handleSubmitReply(commentId)}
                disabled={!replyContent.trim()}
              />
            </View>
          </View>
        </View>
      )}
      {/* Replies Section */}
      {isExpanded && (
        <View className={`mt-3 ml-4 pl-3 border-l-2 ${isExpertComment ? 'border-green-300' : 'border-healthcare-primary/20'}`}>
          {isLoadingReplies ? (
            <View className="py-4 items-center">
              <ActivityIndicator color={isExpertComment ? '#059669' : '#F8BBD9'} size="small" />
            </View>
          ) : replies.length > 0 ? (
            replies.map(reply => {
              console.log(`Rendering reply:`, reply._id, reply.content, reply.createdAt);
              const isExpertReply = reply.accountId && typeof reply.accountId === 'object' && reply.accountId.role === 'counselor';
              return (
                <View
                  key={reply._id}
                  className={`py-2 mb-1 ${isExpertReply ? 'bg-green-50/50 rounded-md px-2' : ''}`}
                >
                  <View className="flex-row items-center">
                    {!reply?.isAnonymous && reply?.accountId && typeof reply?.accountId === 'object' && (
                      <Image
                        source={{ uri: reply?.accountId?.image || 'https://i.imgur.com/6VBx3io.png' }}
                        className={`${isExpertReply ? 'w-7 h-7' : 'w-6 h-6'} rounded-full mr-2 ${isExpertReply ? 'border-2 border-green-300' : ''}`}
                      />
                    )}
                    <View>
                      <View className="flex-row items-center">
                        <Text className={`font-bold text-sm ${isExpertReply ? 'text-green-800' : 'text-gray-800'}`}>{reply.isAnonymous ? 'Anonymous' : reply.accountId?.name}</Text>
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
                  <Text className={`text-sm mt-1 ${isExpertReply ? 'text-gray-800 font-medium' : 'text-gray-700'}`}>{reply.content}</Text>
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
});
