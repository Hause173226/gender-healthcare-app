import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, MessageCircle, Tag, Clock, Send, User, CheckCircle } from 'lucide-react-native';
import { forumService, PostData } from '@/services/forumService';

export default function NewForumPostScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories and tags on mount
  useEffect(() => {
    const fetchCategoriesAndTags = () => {
      try {
        setLoadingCategories(true);
        
        // Get pre-defined categories from the service
        const categoriesData = forumService.getCategories();
        setCategories(categoriesData);
        
        // Get pre-defined tags from the service
        const tagsData = forumService.getSuggestedTags();
        setSuggestedTags(tagsData);
      } catch (error) {
        console.error('Error fetching categories and tags:', error);
        Alert.alert('Lỗi', 'Không thể tải danh sách chủ đề. Vui lòng thử lại sau.');
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategoriesAndTags();
  }, []);
  
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };
  
  const handleCreatePost = async () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề cho bài đăng');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung cho bài đăng');
      return;
    }
    
    if (!selectedCategory) {
      Alert.alert('Lỗi', 'Vui lòng chọn danh mục cho bài đăng');
      return;
    }

    setLoading(true);
    try {
      const postData: PostData = {
        title: title.trim(),
        content: content.trim(),
        category: selectedCategory,
        tags: selectedTags,
        isAnonymous
      };
      
      const response = await forumService.createPost(postData);
      
      // Lấy ID của bài đăng vừa tạo
      const newPostId = response && response.data && response.data._id ? 
        (typeof response.data._id === 'string' ? response.data._id : 
          response.data._id.$oid || String(response.data._id)) : null;
      
      Alert.alert('Thành công', 'Bài đăng đã được tạo thành công!', [
        { text: 'OK', onPress: () => {
          // Chuyển hướng đến màn hình forum và truyền postId để hiển thị chi tiết
          router.push({
            pathname: '/(tabs-customer)/forum',
            params: { postId: newPostId }
          });
        }}
      ]);
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Lỗi', 'Không thể tạo bài đăng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-healthcare-light">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft size={24} color="#2C3E50" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-healthcare-text">
              Tạo bài đăng mới
            </Text>
          </View>
          <Text className="text-healthcare-text/70">
            Chia sẻ câu hỏi hoặc quan tâm của bạn với cộng đồng
          </Text>
        </View>

        <ScrollView className="flex-1 px-6">
          {/* Title */}
          <View className="mb-6">
            <Text className="text-healthcare-text font-semibold mb-2">Tiêu đề</Text>
            <Input
              placeholder="Nhập tiêu đề bài đăng"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <Text className="text-healthcare-text/50 text-right mt-1">
              {title.length}/100
            </Text>
          </View>
          
          {/* Content */}
          <View className="mb-6">
            <Text className="text-healthcare-text font-semibold mb-2">Nội dung</Text>
            <Input
              placeholder="Mô tả chi tiết vấn đề hoặc câu hỏi của bạn"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={5}
              className="h-32 align-text-top pt-3"
              textAlignVertical="top"
            />
          </View>
          
          {/* Category Selection */}
          <View className="mb-6">
            <Text className="text-healthcare-text font-semibold mb-2">Danh mục</Text>
            {loadingCategories ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#F8BBD9" />
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-2">
                <View className="flex-row gap-3">
                  {categories.map((category, index) => (
                    <TouchableOpacity 
                      key={index}
                      onPress={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full ${selectedCategory === category ? 'bg-healthcare-primary' : 'bg-healthcare-primary/10'}`}
                    >
                      <Text className={`${selectedCategory === category ? 'text-white' : 'text-healthcare-primary'} font-medium`}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
          
          {/* Tags Selection */}
          <View className="mb-6">
            <Text className="text-healthcare-text font-semibold mb-2">Thẻ (tối đa 3)</Text>
            <View className="flex-row flex-wrap gap-2">
              {popularTags.map((tag, index) => (
                <TouchableOpacity 
                  key={index}
                  onPress={() => selectedTags.length < 3 || selectedTags.includes(tag) ? toggleTag(tag) : Alert.alert('Thông báo', 'Bạn chỉ có thể chọn tối đa 3 thẻ')}
                  className={`px-3 py-1 rounded-full border ${selectedTags.includes(tag) ? 'bg-healthcare-accent/20 border-healthcare-accent' : 'bg-transparent border-gray-300'}`}
                >
                  <Text className={`text-sm ${selectedTags.includes(tag) ? 'text-healthcare-accent' : 'text-healthcare-text/70'}`}>
                    #{tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Anonymous Option */}
          <TouchableOpacity 
            className="flex-row items-center mb-8 p-2"
            onPress={() => setIsAnonymous(!isAnonymous)}
          >
            <View className={`w-6 h-6 rounded-full mr-2 items-center justify-center ${isAnonymous ? 'bg-healthcare-primary' : 'border border-gray-300'}`}>
              {isAnonymous && <CheckCircle size={16} color="white" />}
            </View>
            <Text className="text-healthcare-text">Đăng ẩn danh</Text>
          </TouchableOpacity>
          
          {/* Submit Button */}
          <Button
            title={loading ? "Đang xử lý..." : "Đăng bài"}
            onPress={handleCreatePost}
            disabled={loading}
            loading={loading}
            className="mb-8"
            size="large"
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}