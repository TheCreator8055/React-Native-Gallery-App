import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { Dropdown } from '../../components/Dropdown';
import { RadioGroup } from '../../components/RadioGroup';
import { validateEmail, validateMobile, RegisterErrors } from '../../utils/validation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types/navigation';
import { useThemeStore, lightColors, darkColors } from '../../store/useThemeStore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';

const PREDEFINED_AVATARS = [
  'https://api.dicebear.com/9.x/bottts/png?seed=1&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/bottts/png?seed=2&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/bottts/png?seed=3&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/bottts/png?seed=4&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/bottts/png?seed=5&backgroundColor=d1d4f9',
  'https://api.dicebear.com/9.x/bottts/png?seed=6&backgroundColor=b6e3f4'
];

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const COUNTRY_CODES = ['+1', '+44', '+91', '+61', '+81'];

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { isDark } = useThemeStore();
  const colors = isDark ? darkColors : lightColors;

  const [countryCode, setCountryCode] = useState('+1');
  const [showCodePicker, setShowCodePicker] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    gender: '',
    address: '',
    city: '',
    password: '',
    confirmPassword: '',
    avatar: PREDEFINED_AVATARS[0],
  });

  const [errors, setErrors] = useState<RegisterErrors>({});

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

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof RegisterErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRegister = async () => {
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
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const storedUsersStr = await AsyncStorage.getItem('@registered_users');
      let registeredUsers = [];
      if (storedUsersStr) {
        registeredUsers = JSON.parse(storedUsersStr);
      }
      
      if (registeredUsers.some((u: any) => u.email.toLowerCase() === formData.email.toLowerCase())) {
        Alert.alert('Error', 'User with this email already exists');
        return;
      }

      const { confirmPassword, ...userData } = formData;
      // Store full mobile number
      userData.mobile = `${countryCode}${userData.mobile}`;

      registeredUsers.push(userData);
      await AsyncStorage.setItem('@registered_users', JSON.stringify(registeredUsers));
      
      Alert.alert('Success', 'Registration successful', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    }
  };

  const CountryCodePrefix = () => (
    <TouchableOpacity 
      style={styles.prefixButton} 
      onPress={() => setShowCodePicker(true)}
    >
      <Text style={[styles.prefixText, { color: colors.text }]}>{countryCode}</Text>
      <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: formData.avatar }} style={styles.currentAvatar} />
              <TouchableOpacity style={styles.editAvatarBadge} onPress={pickImage}>
                <Ionicons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            
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
          </View>

          <InputField
            label="Full Name"
            iconName="person"
            placeholder="Enter full name"
            value={formData.fullName}
            onChangeText={(v) => updateField('fullName', v)}
            error={errors.fullName}
          />
          
          <InputField
            label="Email Address"
            iconName="mail"
            placeholder="Enter email"
            value={formData.email}
            onChangeText={(v) => updateField('email', v)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <RadioGroup
            label="Gender"
            options={['Male', 'Female', 'Other']}
            selectedValue={formData.gender}
            onSelect={(v) => updateField('gender', v)}
            error={errors.gender}
          />
          
          <InputField
            label="Mobile Number"
            iconName="call"
            prefix={<CountryCodePrefix />}
            placeholder="Enter 10 digit mobile number"
            value={formData.mobile}
            onChangeText={(v) => updateField('mobile', v)}
            error={errors.mobile}
            keyboardType="phone-pad"
            maxLength={10}
          />
          
          <InputField
            label="Address"
            iconName="location"
            placeholder="Enter address"
            value={formData.address}
            onChangeText={(v) => updateField('address', v)}
            error={errors.address}
          />
          
          <Dropdown
            label="City"
            options={['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix']}
            selectedValue={formData.city}
            onSelect={(v) => updateField('city', v)}
            error={errors.city}
          />
          
          <InputField
            label="Password"
            iconName="lock-closed"
            placeholder="Enter password"
            value={formData.password}
            onChangeText={(v) => updateField('password', v)}
            error={errors.password}
            secureTextEntry
          />
          
          <InputField
            label="Confirm Password"
            iconName="lock-closed"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChangeText={(v) => updateField('confirmPassword', v)}
            error={errors.confirmPassword}
            secureTextEntry
          />
          
          <Button title="Register" onPress={handleRegister} style={styles.button} />
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  currentAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  predefinedContainer: {
    alignItems: 'center',
    width: '100%',
  },
  predefinedTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  avatarList: {
    flexDirection: 'row',
  },
  avatarChoice: {
    marginHorizontal: 6,
    borderRadius: 30,
    padding: 2,
  },
  avatarChoiceImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eee',
  },
  button: {
    marginTop: 20,
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
