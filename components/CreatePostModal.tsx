import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch
} from 'react-native';
import { X, Plus } from 'lucide-react-native';
import { Button } from './ui/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import forumAPI from '@/services/forumAPI';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ 
  visible, 
  onClose,
  onPostCreated
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get categories from API
  const categories = forumAPI.getCategories();
  const suggestedTags = forumAPI.getSuggestedTags();

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSelectSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your post');
      return false;
    }
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter content for your post');
      return false;
    }
    if (!category) {
      Alert.alert('Error', 'Please select a category for your post');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const userId = await AsyncStorage.getItem('UserId');
      
      if (!userId) {
        Alert.alert('Error', 'You must be logged in to create a post');
        return;
      }
      
      const postData = {
        title,
        content,
        category,
        tags,
        accountId: userId,
        isAnonymous
      };
      
      await forumAPI.createPost(postData);
      
      // Clear form
      setTitle('');
      setContent('');
      setCategory('');
      setTags([]);
      setIsAnonymous(false);
      
      // Close modal
      onClose();
      
      // Notify parent that post was created
      onPostCreated();
      
      Alert.alert('Success', 'Your post has been created successfully');
      
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert(
        'Error', 
        'Unable to create post. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setTitle('');
    setContent('');
    setCategory('');
    setTags([]);
    setIsAnonymous(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-xl font-bold">Create New Post</Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="flex-1 p-4">
            {/* Title Input */}
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-1">Title</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3"
                placeholder="Enter a descriptive title"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
            </View>
            
            {/* Content Input */}
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-1">Content</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3"
                placeholder="Share your question or information..."
                value={content}
                onChangeText={setContent}
                multiline={true}
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
            
            {/* Category Selection */}
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-1">Category</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                className="mb-2"
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className={`mr-2 px-3 py-2 rounded-full ${
                      category === cat ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  >
                    <Text 
                      className={category === cat ? 'text-white' : 'text-gray-800'}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Tags Input */}
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-1">Tags (optional)</Text>
              <View className="flex-row items-center mb-2">
                <TextInput
                  className="flex-1 border border-gray-300 rounded-lg p-3 mr-2"
                  placeholder="Add tags"
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={handleAddTag}
                />
                <TouchableOpacity
                  onPress={handleAddTag}
                  className="bg-gray-200 p-3 rounded-lg"
                >
                  <Plus size={20} color="#000" />
                </TouchableOpacity>
              </View>
              
              {/* Selected Tags */}
              {tags.length > 0 && (
                <View className="flex-row flex-wrap mb-3">
                  {tags.map(tag => (
                    <View 
                      key={tag}
                      className="bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center"
                    >
                      <Text className="mr-1">{tag}</Text>
                      <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                        <X size={14} color="#000" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              
              {/* Suggested Tags */}
              <Text className="text-xs text-gray-500 mb-1">Suggested tags:</Text>
              <View className="flex-row flex-wrap">
                {suggestedTags.map(tag => (
                  !tags.includes(tag) && (
                    <TouchableOpacity
                      key={tag}
                      onPress={() => handleSelectSuggestedTag(tag)}
                      className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2"
                    >
                      <Text className="text-gray-700">{tag}</Text>
                    </TouchableOpacity>
                  )
                ))}
              </View>
            </View>
            
            {/* Anonymous Toggle */}
            <View className="flex-row justify-between items-center mb-6 p-3 bg-gray-50 rounded-lg">
              <View>
                <Text className="font-medium">Post Anonymously</Text>
                <Text className="text-xs text-gray-500">Your identity will not be revealed</Text>
              </View>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                thumbColor={isAnonymous ? '#3b82f6' : '#f4f4f5'}
              />
            </View>
          </ScrollView>
          
          {/* Submit Button */}
          <View className="p-4 border-t border-gray-200">
            <Button
              title={isSubmitting ? "Creating Post..." : "Create Post"}
              onPress={handleSubmit}
              disabled={isSubmitting}
              loading={isSubmitting}
              variant="primary"
              size="medium"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
