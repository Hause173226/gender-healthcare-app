import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  className = '',
}) => {
  const baseClasses = 'rounded-lg flex-row items-center justify-center';
  
  const sizeClasses = {
    small: 'px-3 py-2',
    medium: 'px-4 py-3',
    large: 'px-6 py-4',
  };

  const variantClasses = {
    primary: 'bg-healthcare-primary',
    secondary: 'bg-healthcare-secondary',
    outline: 'border-2 border-healthcare-primary bg-transparent',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-healthcare-text',
    outline: 'text-healthcare-primary',
  };

  const disabledClasses = disabled ? 'opacity-50' : '';

  return (
    <TouchableOpacity
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : '#F8BBD9'} />
      ) : (
        <Text className={`font-semibold text-center ${textSizeClasses[size]} ${textVariantClasses[variant]}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};