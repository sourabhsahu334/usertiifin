import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  PermissionsAndroid,
  Dimensions,
  Alert,
  TouchableOpacity,
  TextInput,
  Text,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
  Camera,
} from 'react-native-vision-camera';
// import Topbar from '../components/Topbar';
// import { CustomButton } from '../components/CustomButton';
// import { http } from '../utils/AxiosInstance';
// import { CustomTextInput } from '../components/CustomTextInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import theme from '../utils/theme';
import firestore from '@react-native-firebase/firestore';

import theme from './theme';
import { editDocumentWithId, getDocumentById } from './Firebasefunc';

const Scan = () => {
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');
  const [scanStatus, setScanStatus] = useState(false);
  const [code, setCode] = useState();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState();
  const [ number,setNumer]=useState();
  const [ password,setPassword]=useState();
  // const [ user,setUser]=useState()
  const [ time,setTime]=useState();
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: codes => {
      if (codes.length == 1) {
        scan(codes[0].value);
      }
    },
  });

  useEffect(() => {
    const get = async () => {
      const data = await AsyncStorage.getItem('user');
      const json = JSON.parse(data)
      console.log(json?.remaining)
      setUser(JSON.parse(data));
    };
    get();
  }, []);

  const getndwdata = async()=>{
    const data = await getDocumentById('user', user?.id);
    // const json = JSON.parse(data);
    AsyncStorage.setItem('user', JSON.stringify(data))
    setUser(data);
  }

  const login = async () => {
    try {
      const data = await getDocumentById('user', number);
      // console.log(data);
      if (data?.password == password?.trim()) {
        Alert.alert('Successfull Login');
        AsyncStorage.setItem('user', JSON.stringify(data)).then(res =>
          console.log('stored'),
          // navigation.replace("Home")
          setUser(data)
        );
      } else {
        alert('Wrong Credentials');
      }
    } catch (error) {
      console.log(error);
      alert('Admin Not Exist');
    }
  };



  useEffect(() => {
    const requestCameraPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission',
              message: 'This app requires access to your camera.',
              buttonPositive: 'OK',
              buttonNegative: 'Cancel',
            },
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            requestPermission(true);
          } else {
            requestPermission(false);
          }
        } catch (err) {
          console.warn(err);
        }
      }
    };

    requestCameraPermission();
  }, []);

  const scan = async id => {
   setLoading(true)
    setScanStatus(false)
    try {
      setLoading(true);

      // Handle the response as needed
      console.log(user?.remaining,'user')
      // console.log('API Response:', response.data);
      if(!user?.remaining){
        setScanStatus(false)
        return alert('restart the app ')
      }
      // Alert.alert(response.data.response.message);
     let obj = {}
     if(time=='day'){
      obj={day:new Date().toString(),}
     }
     else{
      obj={night:new Date().toString(),}
     }
      const d = await editDocumentWithId('user',user?.id,obj);
      const userDocRef = firestore().collection('user').doc(user?.id);

      await userDocRef.update({
        remaining: firestore.FieldValue.increment(-1) // Decrement by 1
      });
      await getndwdata();
      setScanStatus(false);
      setLoading(false)
      alert(`${time} Attendance Done`)
    } catch (error) {
      // Handle errors
      console.error('Error:', error);
      Alert.alert('Network Error');
    } finally {
      setLoading(false); // Set loading to false after the API request is complete
    }
  };

  const loggout = async()=>{
    AsyncStorage.removeItem('user');
    setUser('')
  }

  return (
  user?<View
      style={{
        flex: 1,
        backgroundColor: "white",
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        paddingHorizontal: 10,
        justifyContent:"center",
        alignContent:"center"
      }}>
      {/* <Topbar/> */}
      <Text style={{color:"black",fontSize:17 ,}}>Remaining Thali :  {user?.remaining}</Text>
      <Text style={{color:"black",fontSize:17 ,}}>Tifin Type :   {user?.tiffinType}</Text>

      <Text style={{color:"black",fontSize:17 ,}}>Meal type :   {user?.mealType}</Text>

      <TouchableOpacity onPress={()=>loggout()} style={[styles.button,{backgroundColor:"red",width:120,height:40,paddingVertical:1,position:"absolute",top:10,right:20}]} >
          <Text style={{color:"white"}}>Log out</Text>
          </TouchableOpacity>

      {!scanStatus ? (
      ( loading?<ActivityIndicator size={"large"} color={"black"} style={{marginLeft:"auto",marginRight:"auto"}}/>:<View>
          <TouchableOpacity style={styles.button} onPress={() => {setTime('day'); setScanStatus(true)}}>
          <Text style={{color:"white"}}>Day Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => {setTime('night'); setScanStatus(true)}}>
          <Text style={{color:"white"}}>Night Scan</Text>
          </TouchableOpacity>
          </View>)
      ) : (
        <TouchableOpacity style={styles.button} onPress={() => setScanStatus(false)}>
          <Text style={{color:"white"}}>Cancel</Text>
        </TouchableOpacity>
      )}
      {/* 
{     !scanStatus&& <TextInput
                // label={"Enter Code "}
                value={code}
                keyboardType={"numeric"}
                setValue={setCode}
                placeholder={"Code"}
                marginTop={"45%"}
            />} */}
      {/* {hasPermission && scanStatus && device !== null && (
        <Camera
          style={{
            width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
          }}
          device={device}
          isActive={true}
          // resizeMode='contain'
          codeScanner={codeScanner}
        />
      )} */}
      {/* {loading?<ActivityIndicator size={"large"} color={theme.colors.primaryOpacity} style={{marginRight:"auto",marginLeft:"auto",marginTop:"10%"}}/>: */}
      {/* <CustomButton loading={loading} onPressfuntion={()=>{scan(code)}} text={"submit"} marginTop={"20%"} width={120} /> */}
      {/* <TouchableOpacity style={{marginVertical:10}}>Doe</TouchableOpacity> */}
      <Modal visible={scanStatus} onRequestClose={()=>setScanStatus(false)} animationType='slide' transparent={true}>
      {hasPermission && scanStatus && device !== null && (
        <Camera
          style={{
            width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
          }}
          device={device}
          isActive={true}
          // resizeMode='contain'
          codeScanner={codeScanner}
        />
      )}
      </Modal>
    </View>:
    <View style={{flex:1,backgroundColor:"white",justifyContent:'center',alignItems:"center"}}>
      <TextInput maxLength={10} keyboardType='numeric' style={styles.input} value={number} placeholder='number' onChangeText={(text)=>setNumer(text)}/>
      <TextInput style={styles.input} value={password} placeholder='Password' onChangeText={(text)=>setPassword(text)}/>
        <TouchableOpacity onPress={()=>login()} style={{marginTop:20,backgroundColor:"blue",paddingHorizontal:10,paddingVertical:5,borderRadius:5}}><Text style={{color:"white",fontSize:18}}>Done</Text></TouchableOpacity>

     
    </View>
  );
};

const styles = StyleSheet.create({

  input:{backgroundColor:'white',borderRadius:10,width:"95%",borderWidth:1,borderColor:"black",marginVertical:10,paddingHorizontal:10},
  container: {
    backgroundColor: '#8d98ba',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '10%',
    paddingVertical: '20%',
    flex: 1,
    height: '100%',
    width: '100%',
  },
  button:{
    paddingHorizontal:20,backgroundColor:"blue",
    borderRadius:5,elevation:2,
    paddingVertical:15,
    marginVertical:10,justifyContent:"center",alignItems:"center",color:"white"
  }
});

export default Scan;
