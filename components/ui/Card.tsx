import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '',
  style,
  ...props 
}) => {
  return (
    <View 
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 ${className}`}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
};