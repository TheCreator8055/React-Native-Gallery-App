import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore, lightColors, darkColors } from '../../store/useThemeStore';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore(state => state.login);
  const { isDark } = useThemeStore();
  const colors = isDark ? darkColors : lightColors;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const storedUsersStr = await AsyncStorage.getItem('@registered_users');
      let registeredUsers = [];
      if (storedUsersStr) {
        registeredUsers = JSON.parse(storedUsersStr);
      }
      
      const user = registeredUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        Alert.alert('Error', 'User not found');
        return;
      }
      
      if (user.password !== password) {
        Alert.alert('Error', 'Invalid password');
        return;
      }

      await login(user);
    } catch (e) {
      Alert.alert('Error', 'Something went wrong during login');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.formContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
        
        <InputField
          label="Email Address"
          iconName="mail"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <InputField
          label="Password"
          iconName="lock-closed"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <Button title="Login" onPress={handleLogin} style={styles.button} />
        
        <View style={styles.registerContainer}>
          <Text style={[styles.registerText, { color: colors.textSecondary }]}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.registerLink, { color: colors.primary }]}>Register</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 16,
  },
  registerLink: {
    fontSize: 16,
    fontWeight: '600',
  },
});
