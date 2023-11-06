import React, { useState, useEffect } from "react";
import { ProgressBar, MD3Colors, Divider } from "react-native-paper";
import {
  Input,
  Box,
  Text,
  Button,
  KeyboardAvoidingView,
  VStack,
  ScrollView
} from "native-base";
import { List } from "react-native-paper";

import { FontAwesome5 } from "@expo/vector-icons";

import { BarCodeScanner } from "expo-barcode-scanner";

import api from "../../../service/axios";

const NovaContagem = ({ route, navigation }) => {
  const [produtoList, setProdutoList] = useState([]);

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [openScanner, setOpenScanner] = useState(false);
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);



  const [quantidade, setQuantidade] = useState(null);
  const [ean, setEan] = useState(null);

  const getListProduto = () => {
    setLoading2(true);
    return api
      .get(`/api/produto/contagem/porInventario/${JSON.stringify(route.params.itemId)}`)
      .then((r) => {
        setProdutoList(r.data);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally((f) => {
        setLoading2(false);
      });
  };


  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  useEffect(() => {
    getListProduto();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setOpenScanner(false);
    //  alert(`Código ${data} lido com sucesso!`);
    getProduto(data);

    setScanned(null);
  };

  if (hasPermission === null) {
    return <Text>Requisitando acesso a câmera do dispositivo</Text>;
  }
  if (hasPermission === false) {
    return <Text>Sem permissão de acesso a câmera do dispositivo</Text>;
  }

  const getProduto = (data) => {
    setLoading(true);
    return api
      .get(`/api/produto/ean/${ean ? ean : data}`)
      .then((r) => {
        if (r.data) {
          setProduto(r.data);
        } else {
          setProduto(null);
        }
      })
      .catch((e) => {
        console.log(e);
      })
      .finally((f) => {
        setLoading(false);
      });
  };

  const salvar = () => {
    //  console.log(produto);
    return api
      .post("/api/produto/contagem/salvar", {
        idproduto: produto?.id,
        idinventario : parseInt(JSON.stringify(route.params.itemId)) ,
        produto: produto?.nome,
        idfilial: 1,
        quantidadeLida: quantidade,
      })
      .then((r) => {
        alert("Sucesso");
        setProduto(null);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally((f) => {
        getListProduto();
      });
  };

  return (
    <>
      <Box
        w="container"
        safeAreaTop={8}
        flex={1}
        alignItems="center"
        //   justifyContent="flex-start"
        bg={{
          linearGradient: {
            colors: ["lightBlue.300", "#C8555A"],
            start: [0, 0],
            end: [1, 0],
          },
        }}
        p={1}
      >
        {openScanner === true ? (
          <Box w="100%" h="container">
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={{
                height: 300,
                width: "100%",
              }}
            />

            <Button
              colorScheme="danger"
              rounded="xl"
              mt="5"
              onPress={() => {
                setScanned(false);
                setOpenScanner(false);
                setProduto("");
              }}
            >
              Voltar
            </Button>

            {scanned === true && (
              <Button onPress={() => setScanned(false)}>
                {" "}
                Clique para tentar novamente{" "}
              </Button>
            )}
          </Box>
        ) : (
          <Box>
            {loading ? (
              <>
                <Box w="container">
                  <Text color="#f2f2f2" fontSize="2xl">
                    Buscando produto...
                  </Text>
                  <ProgressBar
                    indeterminate
                    progress={1}
                    color={MD3Colors.success50}
                  />
                </Box>
              </>
            ) : (
              <>
                <Text fontSize="2xl" color="white">
                  Inventário#{JSON.stringify(route.params.itemId)} -{" "}
                  {JSON.stringify(route.params.loja)}
                </Text>
                <Box
                  w="100%"
                  flexDirection="row"
                  justifyContent="center"
                  alignItems="center"
                >
                  {produto ? (
                    <>
                      <Text
                        color="black"
                        fontWeight="bold"
                        fontSize="2xl"
                        m="2"
                        w="80%"
                      >
                        {produto.nome}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text
                        color="#fff"
                        fontWeight="bold"
                        fontSize="15"
                        m="2"
                        w="80%"
                      >
                        Nenhum produto para ser exibido
                      </Text>
                    </>
                  )}

                  <Button
                    rounded="lg"
                    variant="outline"
                    onPress={() => setOpenScanner(true)}
                    rightIcon={
                      <FontAwesome5 name="camera" size={24} color="white" />
                    }
                  />
                </Box>
                <KeyboardAvoidingView
                  behavior={Platform.OS == "ios" ? "padding" : "height"}
                  w="95%"
                >
                  <Box w="80%" marginTop="5">
                    {produto ? (
                      <></>
                    ) : (
                      <>
                        <Box w="100%" flexDirection="row" m={1}>
                          <Input
                            onChangeText={(e) => setEan(e)}
                            id="ean"
                            size="2xl"
                            bgColor="#f2f2f2"
                            w="95%"
                            mx="2"
                            placeholder="Digite o cod de barras"
                            mb={2}
                            keyboardType="numeric"
                            rounded="full"
                          />
                          <Button
                            rounded="full"
                            onPress={() => getProduto()}
                            leftIcon={
                              <FontAwesome5
                                name="search"
                                size={24}
                                color="white"
                              />
                            }
                          ></Button>
                        </Box>
                      </>
                    )}

                    <Input
                      onChangeText={(e) => setQuantidade(e)}
                      id="quantidade"
                      clearTextOnFocus
                      size="2xl"
                      bgColor="#f2f2f2"
                      w="95%"
                      mx="2"
                      placeholder="Quantidade"
                      keyboardType="numeric"
                      rounded="full"
                    />
                  </Box>
                  <Box flexDirection="row">
                    <Button
                      onPress={(e) => {
                        setProduto(null);
                      }}
                      h="12"
                      m="4"
                      rounded="full"
                      colorScheme="danger"
                      leftIcon={
                        <FontAwesome5 name="times" size={18} color="white" />
                      }
                    >
                      Cancelar
                    </Button>
                    <Button
                      disabled={!produto && !quantidade}
                      onPress={() => salvar()}
                      h="12"
                      m="4"
                      rounded="full"
                      colorScheme="success"
                      leftIcon={
                        <FontAwesome5 name="save" size={18} color="white" />
                      }
                    >
                      Adicionar
                    </Button>
                  </Box>
                </KeyboardAvoidingView>
                {loading2 ? (
                  <>
                    <Box>
                      <Text>Carregando itens</Text>
                      <ProgressBar progress={1} />
                    </Box>
                  </>
                ) : (
                  <>
                    
                    <ScrollView  >
                      <VStack w="full" m={1} bgColor={'#f2f2f2'}>
                       
                      {produtoList.map((item) => (
                        <>
                           <List.Item
                           key={item.id}
                           title={item.produto}
                           description={  'Quantidade ' + item.quantidadeLida}
                           
                           left={props => <List.Icon {...props} icon="delete" />}
                          
                         />
                          <Divider bold style={{margin : 20}}  />
                         </>
                        ))}
                        
                      </VStack>
                      </ScrollView>
                    
                  </>
                )}
              </>
            )}
          </Box>
        )}
      </Box>
    </>
  );
};

export default NovaContagem;
