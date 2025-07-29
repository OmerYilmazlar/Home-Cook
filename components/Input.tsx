import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: any;
}

export default function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  secureTextEntry,
  containerStyle,
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = secureTextEntry !== undefined;

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        error ? styles.inputError : null,
        props.editable === false ? styles.inputDisabled : null,
      ]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : null,
            (rightIcon || isPassword) ? styles.inputWithRightIcon : null,
            props.multiline ? styles.multilineInput : null,
            props.style,
          ]}
          placeholderTextColor={Colors.subtext}
          secureTextEntry={isPassword ? !isPasswordVisible : false}
          {...props}
        />
        
        {isPassword ? (
          <TouchableOpacity 
            style={styles.rightIcon} 
            onPress={togglePasswordVisibility}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={Colors.subtext} />
            ) : (
              <Eye size={20} color={Colors.subtext} />
            )}
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.rightIcon}>{rightIcon}</View>
        ) : null}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.white,
    minHeight: 48,
  },
  inputError: {
    borderColor: Colors.error,
  },
  inputDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    textAlignVertical: 'center',
  },
  multilineInput: {
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  inputWithLeftIcon: {
    paddingLeft: 4,
  },
  inputWithRightIcon: {
    paddingRight: 4,
  },
  leftIcon: {
    paddingLeft: 12,
    paddingRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  rightIcon: {
    paddingRight: 12,
    paddingLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
});