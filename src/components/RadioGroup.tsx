import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeStore, lightColors, darkColors } from '../store/useThemeStore';

interface RadioGroupProps {
  label: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  error?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ label, options, selectedValue, onSelect, error }) => {
  const { isDark } = useThemeStore();
  const colors = isDark ? darkColors : lightColors;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={styles.row}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={styles.optionContainer}
            onPress={() => onSelect(option)}
          >
            <View style={[
              styles.radioOuter, 
              { borderColor: selectedValue === option ? colors.primary : colors.border }
            ]}>
              {selectedValue === option && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
            </View>
            <Text style={[styles.optionText, { color: colors.text }]}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
