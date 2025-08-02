import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View,
  TouchableOpacity, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { COLORS } from '../constants/colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
  icon?: React.ReactElement;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  testID,
  icon,
  ...rest
}) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getButtonStyle = () => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...sizeStyles[size],
    };

    if (disabled) {
      return {
        ...baseStyle,
        ...variantStyles[variant].disabled,
      };
    }

    return {
      ...baseStyle,
      ...variantStyles[variant].default,
    };
  };

  const getTextStyle = () => {
    const baseStyle: TextStyle = {
      ...styles.text,
      ...textSizeStyles[size],
    };

    if (disabled) {
      return {
        ...baseStyle,
        ...variantStyles[variant].disabledText,
      };
    }

    return {
      ...baseStyle,
      ...variantStyles[variant].text,
    };
  };

  const buttonContent = (
    <View style={styles.buttonContent}>
      {isLoading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' || variant === 'gradient' ? COLORS.white : COLORS.primary} 
        />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </View>
  );

  if (variant === 'gradient') {
    return (
      <Animated.View style={[animatedStyle, style]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || isLoading}
          testID={testID}
          activeOpacity={1}
          {...rest}
        >
          <LinearGradient
            colors={disabled ? [COLORS.textMuted, COLORS.textLight] : [COLORS.primary, COLORS.gradientPurple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.button, sizeStyles[size]]}
          >
            {buttonContent}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || isLoading}
        style={[getButtonStyle(), style]}
        testID={testID}
        activeOpacity={1}
        {...rest}
      >
        {buttonContent}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontWeight: '600',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
});

const sizeStyles = {
  small: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  medium: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
  },
  large: {
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderRadius: 20,
  },
};

const textSizeStyles = {
  small: {
    fontSize: 14,
  },
  medium: {
    fontSize: 16,
  },
  large: {
    fontSize: 18,
  },
};

const variantStyles = {
  primary: {
    default: {
      backgroundColor: COLORS.primary,
      borderWidth: 0,
    },
    disabled: {
      backgroundColor: COLORS.textMuted,
      opacity: 0.6,
      borderWidth: 0,
    },
    text: {
      color: COLORS.white,
    },
    disabledText: {
      color: COLORS.white,
    },
  },
  secondary: {
    default: {
      backgroundColor: COLORS.backgroundLight,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    disabled: {
      backgroundColor: COLORS.backgroundLight,
      opacity: 0.6,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    text: {
      color: COLORS.text,
    },
    disabledText: {
      color: COLORS.textMuted,
    },
  },
  outline: {
    default: {
      backgroundColor: COLORS.transparent,
      borderWidth: 2,
      borderColor: COLORS.primary,
    },
    disabled: {
      backgroundColor: COLORS.transparent,
      borderWidth: 2,
      borderColor: COLORS.textMuted,
      opacity: 0.6,
    },
    text: {
      color: COLORS.primary,
    },
    disabledText: {
      color: COLORS.textMuted,
    },
  },
  text: {
    default: {
      backgroundColor: COLORS.transparent,
      borderWidth: 0,
      paddingVertical: 8,
      paddingHorizontal: 12,
      shadowOpacity: 0,
      elevation: 0,
    },
    disabled: {
      backgroundColor: COLORS.transparent,
      borderWidth: 0,
      opacity: 0.6,
      paddingVertical: 8,
      paddingHorizontal: 12,
      shadowOpacity: 0,
      elevation: 0,
    },
    text: {
      color: COLORS.primary,
    },
    disabledText: {
      color: COLORS.textMuted,
    },
  },
  gradient: {
    default: {
      borderWidth: 0,
    },
    disabled: {
      borderWidth: 0,
      opacity: 0.6,
    },
    text: {
      color: COLORS.white,
    },
    disabledText: {
      color: COLORS.white,
    },
  },
};