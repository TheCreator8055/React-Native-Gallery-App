import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, Image, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore, lightColors, darkColors } from '../../store/useThemeStore';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { Dropdown } from '../../components/Dropdown';
import { RadioGroup } from '../../components/RadioGroup';
import { validateEmail, validateMobile, RegisterErrors } from '../../utils/validation';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const PREDEFINED_AVATARS = [
  'https://api.dicebear.com/9.x/bottts/png?seed=1&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/bottts/png?seed=2&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/bottts/png?seed=3&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/bottts/png?seed=4&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/bottts/png?seed=5&backgroundColor=d1d4f9',
  'https://api.dicebear.com/9.x/bottts/png?seed=6&backgroundColor=b6e3f4'
];

const COUNTRY_CODES = ['+1', '+44', '+91', '+61', '+81'];

export const ProfileScreen = () => {
  const { user, updateUser, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const colors = isDark ? darkColors : lightColors;
  
  // Extract existing country code if it exists (assuming +XX format)
  const extractCodeAndNumber = (fullMobile: string) => {
    for (const code of COUNTRY_CODES) {
      if (fullMobile.startsWith(code)) {
        return { code, number: fullMobile.slice(code.length) };
      }
    }
    return { code: '+1', number: fullMobile };
  };
  
  const extracted = extractCodeAndNumber(user?.mobile || '');
  
  const [isEditing, setIsEditing] = useState(false);
  const [countryCode, setCountryCode] = useState(extracted.code);
  const [showCodePicker, setShowCodePicker] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    mobile: extracted.number,
    gender: user?.gender || '',
    address: user?.address || '',
    city: user?.city || '',
    avatar: user?.avatar || PREDEFINED_AVATARS[0],
  });

  const [errors, setErrors] = useState<RegisterErrors>({});

  const handleUpdate = async () => {
    const newErrors: RegisterErrors = {};

    if (!formData.fullName) newErrors.fullName = 'Full Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!validateMobile(formData.mobile)) {
      newErrors.mobile = 'Mobile must be exactly 10 digits';
    }
    
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const updatedData = { ...formData, mobile: `${countryCode}${formData.mobile}` };
      await updateUser(updatedData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout }
    ]);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof RegisterErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      updateField('avatar', result.assets[0].uri);
    }
  };

  const CountryCodePrefix = () => (
    <TouchableOpacity 
      style={styles.prefixButton} 
      onPress={() => isEditing && setShowCodePicker(true)}
      disabled={!isEditing}
    >
      <Text style={[styles.prefixText, { color: colors.text }]}>{countryCode}</Text>
      {isEditing && <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>My Profile</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button 
                title={isDark ? '☀️' : '🌙'} 
                onPress={toggleTheme} 
                style={[styles.themeButton, { backgroundColor: colors.borderLight }]}
                textStyle={{ fontSize: 18 }}
              />
              <Button 
                title={isEditing ? 'Cancel' : 'Edit'} 
                onPress={() => {
                  if (isEditing) {
                    const ext = extractCodeAndNumber(user?.mobile || '');
                    setCountryCode(ext.code);
                    setFormData({
                      fullName: user?.fullName || '',
                      email: user?.email || '',
                      mobile: ext.number,
                      gender: user?.gender || '',
                      address: user?.address || '',
                      city: user?.city || '',
                      avatar: user?.avatar || PREDEFINED_AVATARS[0],
                    });
                    setErrors({});
                  }
                  setIsEditing(!isEditing);
                }} 
                style={[styles.editButton, { backgroundColor: colors.primary + '20' }]}
                textStyle={styles.editButtonText}
              />
            </View>
          </View>

          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: formData.avatar }} style={styles.currentAvatar} />
              {isEditing && (
                <TouchableOpacity style={styles.editAvatarBadge} onPress={pickImage}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            
            {isEditing && (
              <View style={styles.predefinedContainer}>
                <Text style={[styles.predefinedTitle, { color: colors.textSecondary }]}>Or choose an avatar:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarList}>
                  {PREDEFINED_AVATARS.map((uri) => (
                    <TouchableOpacity 
                      key={uri} 
                      onPress={() => updateField('avatar', uri)}
                      style={[styles.avatarChoice, formData.avatar === uri && { borderColor: colors.primary, borderWidth: 2 }]}
                    >
                      <Image source={{ uri }} style={styles.avatarChoiceImg} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.formSection}>
            <InputField
              label="Full Name"
              iconName="person"
              value={formData.fullName}
              onChangeText={(v) => updateField('fullName', v)}
              editable={isEditing}
              error={errors.fullName}
            />
            
            <InputField
              label="Email Address"
              iconName="mail"
              value={formData.email}
              onChangeText={(v) => updateField('email', v)}
              editable={isEditing}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <RadioGroup
              label="Gender"
              options={['Male', 'Female', 'Other']}
              selectedValue={formData.gender}
              onSelect={(v) => isEditing && updateField('gender', v)}
              error={errors.gender}
            />
            
            <InputField
              label="Mobile Number"
              iconName="call"
              prefix={<CountryCodePrefix />}
              value={formData.mobile}
              onChangeText={(v) => updateField('mobile', v)}
              editable={isEditing}
              keyboardType="phone-pad"
              maxLength={10}
              error={errors.mobile}
            />
            
            <InputField
              label="Address"
              iconName="location"
              value={formData.address}
              onChangeText={(v) => updateField('address', v)}
              editable={isEditing}
              error={errors.address}
            />
            
            {isEditing ? (
              <Dropdown
                label="City"
                options={['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix']}
                selectedValue={formData.city}
                onSelect={(v) => updateField('city', v)}
                error={errors.city}
              />
            ) : (
              <InputField
                label="City"
                iconName="business"
                value={formData.city}
                editable={false}
              />
            )}

            {isEditing ? (
              <Button title="Save Changes" onPress={handleUpdate} style={styles.saveButton} />
            ) : (
              <Button title="Logout" onPress={handleLogout} style={styles.logoutButton} />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <Modal visible={showCodePicker} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowCodePicker(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, { borderBottomColor: colors.borderLight }]}
                  onPress={() => {
                    setCountryCode(item);
                    setShowCodePicker(false);
                  }}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  themeButton: {
    width: 44,
    height: 44,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 22,
  },
  editButton: {
    width: 'auto',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600'
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  currentAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  predefinedContainer: {
    alignItems: 'center',
    width: '100%',
  },
  predefinedTitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  avatarList: {
    flexDirection: 'row',
  },
  avatarChoice: {
    marginHorizontal: 6,
    borderRadius: 32,
    padding: 2,
  },
  avatarChoiceImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eee',
  },
  formSection: {
    marginTop: 8,
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: '#34C759',
  },
  logoutButton: {
    marginTop: 40,
    backgroundColor: '#FF3B30',
  },
  prefixButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '60%',
    borderRadius: 8,
    maxHeight: '50%',
    padding: 10,
  },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600'
  },
});
