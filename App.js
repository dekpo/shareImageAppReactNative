import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import uploadToAnonymousFilesAsync from 'anonymous-files'; 

export default function App() {
//utilisation du State pour stocker l'image reçue
const [selectedImage, setSelectedImage] = React.useState(null);

// obtenir l'autorisation d'accéder à la Galerie d'images du device
// si c'est ok on retourne les infos
let openImagePickerAsync = async () => {
  console.log(Platform.OS,'OKok !');
  let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  // si la permission est invalide on stoppe avec un return
  if (permissionResult.granted === false){
    alert("Permission to access camera and library is required !");
    return;
  }
  let pickerResult = await ImagePicker.launchImageLibraryAsync();
  console.log('pickerResult: ',pickerResult );
 // si la sélection est annulée on stoppe tout avec un return
  if (pickerResult.cancelled === true){
    return
  }
  // sinon c'est bon on stocke l'adresse de l'image dans une propriété localUri avec setSelectedImage()
  // mais éventuellement avant on vérifie si Platform.OS est 'web' dans ce cas on peut uploader sur AnonymousFiles
  if (Platform.OS === 'web'){
    let remoteUri = await uploadToAnonymousFilesAsync(pickerResult.uri);
    setSelectedImage( {localUri: pickerResult.uri, remoteUri} );
  } else {
    setSelectedImage( {localUri: pickerResult.uri, remoteUri: null} );
  }
  
}

// methode pour partager l'image
let openShareAsync = async () => {
  if ( !(await Sharing.isAvailableAsync()) ) {
    alert("Oups no sharing available on your platform but the image is available for sharing at: " + selectedImage.remoteUri );
    return
  }
  await Sharing.shareAsync( selectedImage.localUri );
}

// si selectedImage n'est pas null c'est qu'on a bien chargé une image
// on peut créer un élément View à la volée avec la fameuse image dedans
if (selectedImage !== null){
  return (
    <View style={styles.container}>
      <Image
      source={{uri: selectedImage.localUri }}
      style={{width: 300, height:300, resizeMode: 'contain'}} />
    
      <TouchableOpacity
      onPress={ openShareAsync }
      style={{backgroundColor: 'blue',padding:10}}>
        <Text style={{color: 'white'}}>SHARE YOUR IMAGE</Text>
      </TouchableOpacity>
      <TouchableOpacity
      onPress={ () => { setSelectedImage(null) } }
      style={{backgroundColor: 'blue',padding:10, marginTop:10}}>
        <Text style={{color: 'white'}}>OR CANCEL</Text>
      </TouchableOpacity>
    </View>
  )
}

  return (
    <View style={styles.container}>
      <Image
      source={ require ('./assets/dummy-image-portrait.jpg')}
      style={ styles.image } 
      />
      <Text style={styles.infos}>Please Choose an image to share !!!</Text>
      
      <TouchableOpacity
      onPress={ openImagePickerAsync }
      style={{backgroundColor: 'blue',padding:10}}>
        <Text style={{color: 'white'}}>PICK A PHOTO</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image:{
    width:300,
    height:300
  },
  infos: {
    color: 'blue',
    // fontFamily: 'sans-serif'
    fontSize: 15,
    fontWeight: 'bold'
  }
});
