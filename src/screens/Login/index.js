import React, { useState } from "react";
import { useFonts, Inter_900Black } from "@expo-google-fonts/inter";

import base64 from "react-native-base64";
import axios from "axios";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
 
  Text,
  Box,
  Button,
  Input,
  Image,
  Toast,
  KeyboardAvoidingView,
} from "native-base";
import { Platform } from "react-native";

export default function Login( { navigation }) {
  const [usuario, setUsuario] = useState();
  const [senha, setSenha] = useState();

  const baseURL = "http://192.168.86.40:1010";

  let [fontsLoaded] = useFonts({
    Inter_900Black,
  });

  if (!fontsLoaded) {
    return null;
  }
 

  let clientId = "doks";
  let clientSecret = "1234";

  var params = {
    client: "angular",
    username: usuario?.toUpperCase(),
    password: senha,
    grant_type: "password",
  };

  var headers = {
    Authorization: "Basic " + base64.encode(`${clientId}:${clientSecret}`),
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const api = axios.create({
    baseURL: baseURL,
    headers: headers,
    params: params,
    timeout : 5000
  });

  const login = async () => {
    try {
      try {
        const response = await api.post("/oauth/token", { params, headers });
        //   localStorage.clear();
        const accessToken = JSON.stringify(response.data);

        try {
          await AsyncStorage.setItem("access_token", accessToken);
          navigation.navigate('Menu')
        } catch (e) {
          // saving error
        }
      } catch (e) {
        console.log(e);
        Toast.show({
          render: () => {
            return <Box justifyContent="center" alignItems="center" bg="red.600" px="2" py="1" rounded="sm" mb={5}>
                    <Text fontSize={30} color="white">Login e ou senha inválidos </Text> 
                  
                  </Box>;
          },
          placement : 'top'
        });
      
      }
    } finally {
    }
  };

  return (
      
      <Box
        safeAreaTop="5"
        flex={1}
        alignItems="center"
        justifyContent="center"
        bg={{
          linearGradient: {
            colors: ["lightBlue.300", "#C8555A"],
            start: [0, 0],
            end: [1, 0],
          },
        }}
        p="5"
      >
        <Image
          source={require("../../../assets/images/logo_login.png")}
          alt="Logo"
          size={80}
        />
        <Text
          style={{
            fontFamily: "Inter_900Black",
            fontSize: 20,
            color: "#f4f5f1",
          }}
        >
          JJ Coletor{" "}
        </Text>
        <Text fontSize="lg" m="0.5" color="#FFFF">
          Informe sua conta uniplus
        </Text>
        <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'padding' : 'height'} w="95%">
          <Box>
            <Input
              value={usuario}
              onChangeText={(e) => setUsuario(e)}
              keyboardType="email-address"
              type="text"
              variant="rounded"
              bgColor={"blue.100"}
              size="2xl"
              placeholder="Código"
              m="1"
            />
          </Box>
          <Box>
            <Input
              value={senha}
              onChangeText={(e) => setSenha(e)}
              type="password"
              keyboardType="numbers-and-punctuation"
              variant="rounded"
              bgColor={"blue.100"}
              size="2xl"
              placeholder="Senha"
              m="1"
            />
          </Box>
          <Box rounded="lg" width="95%" m="1.5">
          <Button
            colorScheme="success"
            borderRadius="full"
            size="lg"
            onPress={() => login()}
          >
            Entrar
          </Button>
        </Box>
        </KeyboardAvoidingView>
        
      </Box>
   
  );
}
