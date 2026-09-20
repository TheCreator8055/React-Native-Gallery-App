import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { AppStackParamList } from '../../types/navigation';
import { Button } from '../../components/Button';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library/legacy';
import * as Sharing from 'expo-sharing';
import { useGalleryStore } from '../../store/useGalleryStore';
import { Ionicons } from '@expo/vector-icons';
import ImageZoom from 'react-native-image-pan-zoom';

type ImageDetailScreenRouteProp = RouteProp<AppStackParamList, 'ImageDetail'>;

const { width, height } = Dimensions.get('window');

export const ImageDetailScreen = () => {
  const route = useRoute<ImageDetailScreenRouteProp>();
  const navigation = useNavigation();
  const { image } = route.params;
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [showUi, setShowUi] = useState(true);

  const { isFavorite, toggleFavorite } = useGalleryStore();
  const favorite = isFavorite(image.id);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: showUi,
      headerStyle: { backgroundColor: '#000' },
      headerTintColor: '#fff',
    });
  }, [navigation, showUi]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      
      let permissionGranted = false;
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        permissionGranted = status === 'granted';
      } catch (err) {
        Alert.alert(
          'Expo Go Limitation', 
          'Expo Go cannot request Media Library permissions on modern Android versions. This feature will work perfectly in the compiled APK.'
        );
        setDownloading(false);
        return;
      }

      if (!permissionGranted) {
        Alert.alert('Permission needed', 'We need permission to save images to your gallery.');
        setDownloading(false);
        return;
      }

      const fileUri = `${FileSystem.documentDirectory}${image.id}.jpg`;
      const downloadRes = await FileSystem.downloadAsync(image.download_url, fileUri);
      
      if (downloadRes.status === 200) {
        await MediaLibrary.saveToLibraryAsync(downloadRes.uri);
        Alert.alert('Success', 'Image saved to your device gallery!');
      } else {
        Alert.alert('Error', 'Failed to download image.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong while downloading.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      setSharing(true);
      const fileUri = `${FileSystem.documentDirectory}share_${image.id}.jpg`;
      const downloadRes = await FileSystem.downloadAsync(image.download_url, fileUri);
      
      if (downloadRes.status === 200) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadRes.uri);
        } else {
          Alert.alert('Unavailable', 'Sharing is not available on this device');
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong while preparing to share.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <View style={[styles.imageContainer, { paddingBottom: showUi ? 150 : 0 }]}>
        <ImageZoom 
          cropWidth={width}
          cropHeight={showUi ? height - 150 : height}
          imageWidth={width}
          imageHeight={showUi ? height - 150 : height}
          panToMove={false}
          onClick={() => setShowUi(!showUi)}
          onDoubleClick={() => {
            if (showUi) setShowUi(false);
          }}
        >
          <Image 
            source={{ uri: image.download_url }} 
            style={styles.fullImage} 
            resizeMode="contain"
          />
        </ImageZoom>
      </View>

      {showUi && (
        <View style={styles.overlayContainer}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.author}>Author: {image.author}</Text>
              <Text style={styles.id}>Image ID: {image.id}</Text>
              <Text style={styles.dimensions}>Size: {image.width} x {image.height}</Text>
            </View>
            <TouchableOpacity onPress={() => toggleFavorite(image)} style={styles.likeButton}>
              <Ionicons 
                name={favorite ? "heart" : "heart-outline"} 
                size={32} 
                color={favorite ? "#FF453A" : "#fff"} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.buttonContainer}>
            <Button 
              title={downloading ? 'Downloading' : 'Download'} 
              iconName="download"
              onPress={handleDownload} 
              loading={downloading}
              style={[styles.actionButton, styles.downloadButton]}
            />
            <Button 
              title={sharing ? 'Preparing' : 'Share'} 
              iconName="share-social"
              onPress={handleShare} 
              loading={sharing}
              style={[styles.actionButton, styles.shareButton]}
              textStyle={styles.shareButtonText}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomableView: {
    width: width,
    height: height,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  likeButton: {
    padding: 8,
  },
  author: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#fff',
  },
  id: {
    fontSize: 16,
    marginBottom: 4,
    color: '#ccc',
  },
  dimensions: {
    fontSize: 14,
    color: '#aaa',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 20,
  },
  actionButton: {
    flex: 1,
  },
  downloadButton: {
    backgroundColor: '#007AFF',
  },
  shareButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  shareButtonText: {
    color: '#fff',
  },
});
