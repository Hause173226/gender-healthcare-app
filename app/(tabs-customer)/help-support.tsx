import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, CircleHelp as HelpCircle, MessageCircle, Phone, Mail, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react-native';

export default function HelpSupportScreen() {
  const router = useRouter();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    category: 'General',
  });

  const faqs = [
    {
      id: 1,
      question: 'How do I track my menstrual cycle?',
      answer: 'To track your cycle, go to the Cycle tab and tap the "+" button to log your period start date. You can also record symptoms, flow intensity, and notes.',
    },
    {
      id: 2,
      question: 'How do I book a consultation?',
      answer: 'You can book a consultation by going to the Chat tab and tapping "Start New Conversation". Choose your preferred consultation type and select an available advisor.',
    },
    {
      id: 3,
      question: 'When will I receive my test results?',
      answer: 'Test results are typically available within 24-72 hours depending on the type of test. You\'ll receive a notification when your results are ready.',
    },
    {
      id: 4,
      question: 'How do I change my notification settings?',
      answer: 'Go to Profile > Notifications to customize your notification preferences. You can enable or disable specific types of notifications.',
    },
    {
      id: 5,
      question: 'Is my health data secure?',
      answer: 'Yes, we use industry-standard encryption to protect your data. You can review our privacy settings in Profile > Privacy & Security.',
    },
  ];

  const contactOptions = [
    {
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: MessageCircle,
      action: () => {},
      available: '24/7',
    },
    {
      title: 'Phone Support',
      description: 'Call our support hotline',
      icon: Phone,
      action: () => Linking.openURL('tel:+1-555-HEALTH'),
      available: '9 AM - 6 PM EST',
    },
    {
      title: 'Email Support',
      description: 'Send us an email',
      icon: Mail,
      action: () => Linking.openURL('mailto:support@genderhealthcare.com'),
      available: 'Response within 24h',
    },
  ];

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleSubmitContact = () => {
    // Handle contact form submission
    console.log('Contact form submitted:', contactForm);
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
              Help & Support
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-6">
          {/* Quick Actions */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Get Help Quickly
            </Text>
            
            <View className="gap-3">
              {contactOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={option.action}
                  className="flex-row items-center p-3 bg-healthcare-light rounded-lg"
                >
                  <option.icon size={24} color="#F8BBD9" />
                  <View className="flex-1 ml-3">
                    <Text className="text-healthcare-text font-medium">
                      {option.title}
                    </Text>
                    <Text className="text-healthcare-text/60 text-sm">
                      {option.description}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-healthcare-primary text-sm font-medium">
                      {option.available}
                    </Text>
                    <ExternalLink size={16} color="#A0AEC0" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* FAQ Section */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Frequently Asked Questions
            </Text>
            
            {faqs.map((faq) => (
              <View key={faq.id} className="mb-3">
                <TouchableOpacity
                  onPress={() => toggleFAQ(faq.id)}
                  className="flex-row items-center justify-between py-3"
                >
                  <Text className="text-healthcare-text font-medium flex-1 pr-3">
                    {faq.question}
                  </Text>
                  {expandedFAQ === faq.id ? (
                    <ChevronDown size={20} color="#A0AEC0" />
                  ) : (
                    <ChevronRight size={20} color="#A0AEC0" />
                  )}
                </TouchableOpacity>
                
                {expandedFAQ === faq.id && (
                  <View className="pb-3">
                    <Text className="text-healthcare-text/70 leading-5">
                      {faq.answer}
                    </Text>
                  </View>
                )}
                
                {faq.id < faqs.length && (
                  <View className="h-px bg-gray-200" />
                )}
              </View>
            ))}
          </Card>

          {/* Contact Form */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Contact Support
            </Text>
            
            <View className="mb-4">
              <Text className="text-healthcare-text font-medium mb-2">Category</Text>
              <View className="flex-row flex-wrap gap-2">
                {['General', 'Technical', 'Billing', 'Medical'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setContactForm(prev => ({ ...prev, category }))}
                    className={`px-3 py-2 rounded-full border ${
                      contactForm.category === category
                        ? 'bg-healthcare-primary border-healthcare-primary'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <Text className={`text-sm ${
                      contactForm.category === category ? 'text-white' : 'text-healthcare-text'
                    }`}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label="Subject"
              value={contactForm.subject}
              onChangeText={(value) => setContactForm(prev => ({ ...prev, subject: value }))}
              placeholder="Brief description of your issue"
            />

            <Input
              label="Message"
              value={contactForm.message}
              onChangeText={(value) => setContactForm(prev => ({ ...prev, message: value }))}
              placeholder="Describe your issue in detail..."
              multiline
              numberOfLines={4}
              className="h-24"
            />

            <Button title="Send Message" onPress={handleSubmitContact} />
          </Card>

          {/* Resources */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Helpful Resources
            </Text>
            
            <View className="gap-3">
              <TouchableOpacity className="flex-row items-center justify-between py-2">
                <Text className="text-healthcare-text">User Guide</Text>
                <ExternalLink size={16} color="#F8BBD9" />
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-row items-center justify-between py-2">
                <Text className="text-healthcare-text">Privacy Policy</Text>
                <ExternalLink size={16} color="#F8BBD9" />
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-row items-center justify-between py-2">
                <Text className="text-healthcare-text">Terms of Service</Text>
                <ExternalLink size={16} color="#F8BBD9" />
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-row items-center justify-between py-2">
                <Text className="text-healthcare-text">Community Guidelines</Text>
                <ExternalLink size={16} color="#F8BBD9" />
              </TouchableOpacity>
            </View>
          </Card>

          {/* App Info */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              App Information
            </Text>
            
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-healthcare-text/70">Version</Text>
                <Text className="text-healthcare-text">1.0.0</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-healthcare-text/70">Device</Text>
                <Text className="text-healthcare-text">iPhone 15 Pro</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-healthcare-text/70">OS Version</Text>
                <Text className="text-healthcare-text">iOS 17.2</Text>
              </View>
            </View>
          </Card>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}