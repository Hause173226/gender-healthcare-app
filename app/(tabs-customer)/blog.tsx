import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { CalendarDays, Clock } from 'lucide-react-native';
import { blogService, BlogPopulated } from '@/services/blogService';
import { useRouter } from 'expo-router'; // 👈 THÊM DÒNG NÀY


export default function BlogListScreen() {
    const [blogs, setBlogs] = useState<BlogPopulated[]>([]);
    const [filteredBlogs, setFilteredBlogs] = useState<BlogPopulated[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
    const router = useRouter(); // 👈 THÊM DÒNG NÀY



    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const data = await blogService.getAll();
                const activeBlogs = data.filter((b) => b.status === 'active');
                setBlogs(activeBlogs);
                setFilteredBlogs(activeBlogs);
                const counts: Record<string, number> = { All: activeBlogs.length };
                activeBlogs.forEach((b) => {
                    const cat = b.category || 'Uncategorized';
                    counts[cat] = (counts[cat] || 0) + 1;
                });
                setCategoryCounts(counts);
            } catch (err) {
                console.error('Failed to fetch blogs:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    useEffect(() => {
        if (selectedCategory === 'All') {
            setFilteredBlogs(blogs);
        } else {
            setFilteredBlogs(
                blogs.filter((b) => (b.category || 'Uncategorized') === selectedCategory)
            );
        }
    }, [selectedCategory, blogs]);

    const categories = ['All', ...Object.keys(categoryCounts).filter((k) => k !== 'All')];

    return (
        <ScrollView className="flex-1 bg-white pt-6 px-4">
            {/* Header */}
            <Text className="text-2xl font-bold text-gray-800 mb-4">Blog</Text>

            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
                <View className="flex-row space-x-3">
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            className={`px-4 py-2 rounded-full border ${selectedCategory === cat
                                    ? 'bg-pink-100 border-pink-400'
                                    : 'bg-white border-gray-300'
                                }`}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <Text
                                className={`text-sm font-medium ${selectedCategory === cat ? 'text-pink-600' : 'text-gray-600'
                                    }`}
                            >
                                {cat} ({categoryCounts[cat] || 0})
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Blog List */}
            {loading ? (
                <ActivityIndicator size="large" color="#EC4899" />
            ) : filteredBlogs.length === 0 ? (
                <Text className="text-center text-gray-400 mt-10">No blog posts available.</Text>
            ) : (
                <>
                    {filteredBlogs.map((blog, index) => (
                        <View key={blog._id}>
                            <TouchableOpacity
                                className="flex-row items-start mb-4"
                                onPress={() =>
                                    router.push({
                                        pathname: '/(tabs-customer)/blog-detail',
                                        params: { blogId: blog._id },
                                    })
                                }
                            >
                                <Image
                                    source={{ uri: blog.image || 'https://via.placeholder.com/150' }}
                                    className="w-16 h-16 rounded-md mr-4"
                                    resizeMode="cover"
                                />
                                <View className="flex-1">
                                    <Text className="text-base font-semibold text-gray-800 mb-1" numberOfLines={2}>
                                        {blog.title}
                                    </Text>
                                    <View className="flex-row items-center space-x-4">
                                        <View className="flex-row items-center space-x-1">
                                            <CalendarDays size={14} color="#6B7280" />
                                            <Text className="text-xs text-gray-500">
                                                {new Date(blog.postedDate || blog.createdAt).toDateString()}
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center space-x-1">
                                            <Clock size={14} color="#6B7280" />
                                            <Text className="text-xs text-gray-500">10 min read</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* Divider line - except for last item */}
                            {index !== filteredBlogs.length - 1 && (
                                <View className="h-[1px] bg-gray-200 mb-4" />
                            )}
                        </View>
                    ))}

                    <Text className="text-center text-gray-400 text-sm mt-6 mb-10">
                        You have reached the end
                    </Text>
                </>
            )}
        </ScrollView>
    );
}
