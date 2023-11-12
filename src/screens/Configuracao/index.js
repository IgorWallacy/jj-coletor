import React, { useState, useEffect } from "react";

import { Box } from "native-base";

import { TextInput, Card, Button, Text } from "react-native-paper";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const ConfiguracaoComponent = ({ navigation }) => {
  const [servidor, setServidor] = useState(null);
  const [baseUrl , setBaseUrl] = useState(null)

  useEffect(()=> {
    const getBaseURLAsyncStorage = async () => {
      try {
        const value = await AsyncStorage.getItem('ip-servidor');
        if (value !== null) {
          // value previously stored
          setBaseUrl(value)
        }
      } catch (e) {
        // error reading value
        Alert.alert('Erro' , 'Não foi possível ler o ip do servidor')
      }
    };
    getBaseURLAsyncStorage()
  },[])

  const salvar = async () => {

   

    try {
        await AsyncStorage.setItem('ip-servidor', servidor).then((r) => {
            Alert.alert('Sucesso' , 'Configuração salva')
            navigation.navigate("Login")
        })
      } catch (e) {
        
        Alert.alert("Erro" ,'Não foi possível salvar a configuração')
      }
  };

  return (
    <Box
      flex={1}
      alignItems="center"
      justifyContent="start"
      bg={{
        linearGradient: {
          colors: ["#eb575a", "#708090"],
          start: [1, 0],
          end: [0, 0],
        },
      }}
      p={2}
      w="100%"
    >
      <Card style={{ width: "100%" }}>
        <Card.Title
          title="Configuração"
          subtitle="Informe o endereço do servidor para acesso "
        />
        <Card.Content>
          <Text m='2'> {baseUrl ? 'Configuração atual : ' + baseUrl : ' Nenhuma configuração salva'}</Text>
          <TextInput
            keyboardType="url"
            label="Endereço do servidor"
            placeholder="Exemplo : 192.168.0.100"
            value={servidor}
            onChangeText={(text) => setServidor(text)}
            autoCapitalize="none"
            mode="outlined"
          />
        </Card.Content>

        <Card.Actions>
          <Button
            onPress={() => navigation.navigate("Login")}
            icon="cancel"
            mode="outlined"
          >
            Cancelar
          </Button>
          <Button onPress={() => salvar()} icon="content-save" mode="contained">
            Salvar
          </Button>
        </Card.Actions>
      </Card>
    </Box>
  );
};

export default ConfiguracaoComponent;
