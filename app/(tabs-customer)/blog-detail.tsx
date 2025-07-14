import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { blogService, BlogPopulated } from '@/services/blogService';
import { ArrowLeft } from 'lucide-react-native';

export default function BlogDetailScreen() {
  const { blogId } = useLocalSearchParams();
  const router = useRouter();
  const [blog, setBlog] = useState<BlogPopulated | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!blogId || typeof blogId !== 'string') return;
      try {
        const data = await blogService.getById(blogId);
        setBlog(data);
      } catch (err) {
        console.error('Failed to fetch blog:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [blogId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  if (!blog) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Blog not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Back */}
      <TouchableOpacity
        className="absolute top-10 left-5 z-10 bg-white rounded-full shadow p-2"
        onPress={() => router.back()}
      >
        <ArrowLeft size={22} color="#111827" />
      </TouchableOpacity>

      {/* Image */}
      <Image
        source={{ uri: blog.image || 'https://via.placeholder.com/300x200' }}
        className="w-full h-56"
        resizeMode="cover"
      />

      <View className="px-5 pt-4 pb-10">
        {/* Title */}
        <Text className="text-xl font-bold text-gray-800 mb-2">
          {blog.title}
        </Text>

        {/* Author + Date */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            {/* <Image
              source={{
                uri:
                  blog?.counselorId?.accountId?.image ||
                  'https://via.placeholder.com/50',
              }}
              className="w-8 h-8 rounded-full mr-2"
            /> */}
            <Text className="text-gray-700 font-medium">
              {blog.author || blog?.counselorId?.accountId?.name || 'Unknown'}
            </Text>
          </View>
          <Text className="text-gray-400 text-sm">
            {new Date(blog.postedDate || blog.createdAt).toDateString()}
          </Text>
        </View>

        {/* Content */}
        <Text className="text-base text-gray-700 leading-relaxed">
          {blog.content || 'No content provided.'}
        </Text>
      </View>
    </ScrollView>
  );
}
