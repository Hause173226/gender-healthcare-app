import React from 'react';
import { TextInput, Text, View, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-healthcare-text font-medium mb-2 text-base">
          {label}
        </Text>
      )}
      <View className="relative">
        {leftIcon && (
          <View className="absolute left-3 top-3 z-10">
            {leftIcon}
          </View>
        )}
        <TextInput
          className={`border border-gray-300 rounded-lg px-4 py-3 text-healthcare-text bg-white text-base ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${error ? 'border-healthcare-danger' : ''} ${className}`}
          placeholderTextColor="#A0AEC0"
          {...props}
        />
        {rightIcon && (
          <View className="absolute right-3 top-3 z-10">
            {rightIcon}
          </View>
        )}
      </View>
      {error && (
        <Text className="text-healthcare-danger text-sm mt-1">{error}</Text>
      )}
    </View>
  );
};