import React, { useState } from "react";
import { useFonts, Inter_900Black } from "@expo-google-fonts/inter";

import base64 from "react-native-base64";
import axios from "axios";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { Text, Box, Button, Image, KeyboardAvoidingView } from "native-base";
import { Platform, Alert } from "react-native";
import { TextInput } from "react-native-paper";

export default function Login({ navigation }) {
  const [usuario, setUsuario] = useState();
  const [senha, setSenha] = useState();
  const [loading, setLoading] = useState(false);

  const [baseUrl, setBaseUrl] = useState(null);

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
    "content-type": "application/x-www-form-urlencoded",
    "content-type": "multipart/form-data",
  };

  const getBaseURLAsyncStorage = async () => {
    try {
      const value = await AsyncStorage.getItem("ip-servidor");
      if (value !== null) {
        // value previously stored
        setBaseUrl(`http://${value}:1010`);
      }
    } catch (e) {
      // error reading value
      Alert.alert("Erro", "Não foi possível ler o ip do servidor");
    }
  };

  const api = axios.create({
    baseURL: baseUrl ? baseUrl : getBaseURLAsyncStorage(),
    headers: headers,
    params: params,
    timeout: 10000,
  });

  const login = async () => {
    getBaseURLAsyncStorage();
    try {
      setLoading(true);
      try {
        const response = await api.post("/oauth/token", { params, headers });
        //   localStorage.clear();
        const accessToken = JSON.stringify(response.data);

        try {
          await AsyncStorage.setItem("access_token", accessToken);
          navigation.navigate("Menu");
        } catch (e) {
          // saving error
        }
      } catch (e) {
        Alert.alert(
          "Erro ao realizar login",
          e?.code === "ERR_BAD_REQUEST"
            ? "Código ou senha inválidos"
            : e?.message
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      flex={1}
      alignItems="center"
      justifyContent="center"
      bg={{
        linearGradient: {
          colors: ["#eb575a", "#708090"],
          start: [1, 0],
          end: [0, 0],
        },
      }}
      p="10"
    >
      <Box  >
        <Button
          mb={5}
          leftIcon={<MaterialIcons name="settings" size={24} color="white" />}
          colorScheme="warmGray"
          borderRadius="full"
          size="lg"
          onPress={() => navigation.navigate("configuracao")}
        >
          <Text color="white">Configurar</Text>
        </Button>
      </Box>
      <Image
        source={require("../../../assets/images/logo_login.png")}
        alt="Logo"
        size={140}
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
      <Text color="white"> API - {baseUrl}</Text>
      <Text fontSize="lg" m="0.5" color="#FFFF">
        Informe sua conta uniplus
      </Text>
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        w="95%"
      >
        <Box m="1">
          <TextInput
            onFocus={() => getBaseURLAsyncStorage()}
            value={usuario}
            onChangeText={(e) => setUsuario(e)}
            keyboardType="email-address"
            type="text"
            bgColor={"blue.100"}
            size="2xl"
            placeholder="Código"
            label="Código"
          />
        </Box>
        <Box m="1">
          <TextInput
            value={senha}
            onChangeText={(e) => setSenha(e)}
            type="password"
            keyboardType="numbers-and-punctuation"
            secureTextEntry
            bgColor={"blue.100"}
            size="2xl"
            placeholder="Senha"
            label="Senha"
          />
        </Box>
        <Box rounded="lg" width="95%" m="1.5">
          <Button
            leftIcon={
              <FontAwesome5 name="sign-in-alt" size={24} color="white" />
            }
            colorScheme="success"
            borderRadius="full"
            size="lg"
            isLoading={loading}
            isLoadingText="Entrando ..."
            onPress={() => login()}
          >
            Entrar
          </Button>
        </Box>
      </KeyboardAvoidingView>
    </Box>
  );
}
