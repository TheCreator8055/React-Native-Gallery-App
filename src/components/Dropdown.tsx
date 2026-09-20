import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { useThemeStore, lightColors, darkColors } from '../store/useThemeStore';

interface DropdownProps {
  label: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  error?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({ label, options, selectedValue, onSelect, error }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { isDark } = useThemeStore();
  const colors = isDark ? darkColors : lightColors;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TouchableOpacity 
        style={[
          styles.dropdown, 
          { backgroundColor: colors.card, borderColor: error ? colors.error : colors.border }
        ]} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ fontSize: 16, color: selectedValue ? colors.text : colors.textSecondary }}>
          {selectedValue || 'Select an option'}
        </Text>
      </TouchableOpacity>
      {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, { borderBottomColor: colors.borderLight }]}
                  onPress={() => {
                    onSelect(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 8,
    maxHeight: '50%',
    padding: 10,
  },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
  },
});
