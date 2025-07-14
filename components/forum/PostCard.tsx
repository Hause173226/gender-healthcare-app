import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Card } from '@/components/ui/Card';
import { ChevronUp, ChevronDown, Eye, MessageCircle, CheckCircle } from 'lucide-react-native';
import { ForumPost } from '@/services/forumAPI';

interface PostCardProps {
  post: ForumPost;
  onPress: () => void;
  accountId: string | null;
  handlePostVote: (postId: string, voteType: 'up' | 'down') => void;
  formatDate: (dateInput: string | { $date: string }) => string;
  getUserName: (accountId: any) => string;
}

const getCategoryColor = (category: string) => {
  switch(category) {
    case 'Reproductive Health': return 'bg-pink-100 text-pink-800';
    case 'Mental Health': return 'bg-purple-100 text-purple-800';
    //... add other cases
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const PostCard = React.memo(({ post, onPress, accountId, handlePostVote, formatDate, getUserName }: PostCardProps) => {
  const postId = post._id && (typeof post._id === 'string' ? post._id : post._id.$oid || String(post._id));
  if (!postId) return null;

  const upVotes = post.voteUp?.length || 0;
  const userVote = accountId ? (post.voteUp?.includes(accountId) ? 'up' : (post.voteDown?.includes(accountId) ? 'down' : null)) : null;
  const authorName = post.isAnonymous ? 'Anonymous' : getUserName(post.accountId);

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
