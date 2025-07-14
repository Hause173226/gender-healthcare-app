import React, { useState, useEffect } from 'react';
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
  onPostCreated: (newPost?: any) => void;
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
  
  // Get categories and tags from the API
  const categories = forumAPI.getCategories();
  const suggestedTags = forumAPI.getSuggestedTags();

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase()) && tags.length < 5) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    } else if (tags.length >= 5) {
      Alert.alert('Limit Reached', 'You can only add up to 5 tags per post');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSelectSuggestedTag = (tag: string) => {
    if (!tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
    } else if (tags.length >= 5) {
      Alert.alert('Limit Reached', 'You can only add up to 5 tags per post');
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
    if (title.trim().length < 5) {
      Alert.alert('Error', 'Title must be at least 5 characters long');
      return false;
    }
    if (content.trim().length < 10) {
      Alert.alert('Error', 'Content must be at least 10 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Check if token exists first
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please log in again.');
        setIsSubmitting(false);
        return;
      }

      // Get the user object from AsyncStorage based on the Account interface
      const userString = await AsyncStorage.getItem('user');
      let userId;
      
      if (userString) {
        try {
          const userObj = JSON.parse(userString);
          
          // Log user object for debugging
          console.log("User object retrieved:", userObj);
          
          // Based on the Account interface, user has _id field
          userId = userObj._id;
          
          if (!userId) {
            console.warn("User object doesn't contain _id field:", userObj);
            if (userObj.id) {
              userId = userObj.id;
            }
          }
        } catch (e) {
          console.error("Error parsing user data:", e);
          userId = userString; // Fall back to using the string directly as last resort
        }
      }
      
      // Try alternative keys if user ID is still not found
      if (!userId) {
        userId = await AsyncStorage.getItem('userId');
      }
      
      if (!userId) {
        userId = await AsyncStorage.getItem('accountId');
      }
      
      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please log in again.');
        setIsSubmitting(false);
        return;
      }
      
      console.log("Creating post with userId:", userId);
      
      // Make sure we have valid data
      if (!category) {
        Alert.alert('Error', 'Please select a category');
        setIsSubmitting(false);
        return;
      }
      
      const postData = {
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tags.length > 0 ? tags : [], // Ensure tags is always an array
        accountId: userId,
        isAnonymous: isAnonymous || false
      };
      
      console.log("Sending post data:", JSON.stringify(postData));
      
      const response = await forumAPI.createPost(postData);
      console.log("Post created successfully:", response.data);
      
      // Clear form
      setTitle('');
      setContent('');
      setCategory('');
      setTags([]);
      setIsAnonymous(false);
      
      // Close modal
      onClose();
      
      // Pass the created post data back to parent component
      const newPost = response.data?.post || {
        title: postData.title,
        content: postData.content,
        category: postData.category,
        tags: postData.tags,
        accountId: userId,
        isAnonymous: postData.isAnonymous
      };
      
      // Notify parent that post was created with the post data
      onPostCreated(newPost);
      
      Alert.alert('Success', 'Your post has been created successfully and is awaiting moderation.');
      
    } catch (error: any) {
      console.error('Error creating post:', error);
      
      // Extract more detailed error information if available
      let errorMessage = 'An error occurred while creating your post. Please try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        if (error.response.status === 500) {
          errorMessage = 'Server error. The post could not be created. This could be due to incorrect user ID or server configuration.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        errorMessage = 'No response received from server. Please check your internet connection.';
      } else {
        // Something happened in setting up the request
        console.error('Error message:', error.message);
        errorMessage = error.message || errorMessage;
      }
      
      Alert.alert(
        'Error', 
        errorMessage
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
              <Text className="text-sm text-gray-600 mb-1">Tags (optional, max 5)</Text>
              <View className="flex-row items-center mb-2">
                <TextInput
                  className="flex-1 border border-gray-300 rounded-lg p-3 mr-2"
                  placeholder="Add tags"
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={handleAddTag}
                  editable={tags.length < 5}
                />
                <TouchableOpacity
                  onPress={handleAddTag}
                  className={`p-3 rounded-lg ${tags.length >= 5 ? 'bg-gray-100' : 'bg-gray-200'}`}
                  disabled={tags.length >= 5}
                >
                  <Plus size={20} color={tags.length >= 5 ? "#9ca3af" : "#000"} />
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
                      disabled={tags.length >= 5}
                    >
                      <Text className={`${tags.length >= 5 ? 'text-gray-400' : 'text-gray-700'}`}>{tag}</Text>
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
