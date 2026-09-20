import React from 'react';
import { TextInput, TextInputProps, StyleSheet, Text, View } from 'react-native';
import { useThemeStore, lightColors, darkColors } from '../store/useThemeStore';
import { Ionicons } from '@expo/vector-icons';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  prefix?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({ label, error, style, iconName, prefix, ...props }) => {
  const { isDark } = useThemeStore();
  const colors = isDark ? darkColors : lightColors;

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          {iconName && <Ionicons name={iconName} size={16} color={colors.textSecondary} style={styles.icon} />}
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        </View>
      )}
      <View style={[
        styles.inputWrapper, 
        { 
          backgroundColor: colors.card, 
          borderColor: error ? colors.error : colors.border,
        }
      ]}>
        {prefix && <View style={styles.prefixContainer}>{prefix}</View>}
        <TextInput
          style={[
            styles.input, 
            { color: colors.text }, 
            style
          ]}
          placeholderTextColor={colors.textSecondary}
          {...props}
        />
      </View>
      {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  prefixContainer: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
