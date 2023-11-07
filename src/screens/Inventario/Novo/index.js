import React, { useState, useEffect } from "react";

import { ProgressBar, MD3Colors } from "react-native-paper";
import {
  Input,
  Box,
  Text,
  Button,
  KeyboardAvoidingView,
  VStack,
  ScrollView,
  Badge,
} from "native-base";

import { ListItem, Button as Button2 } from "@rneui/themed";

import { FontAwesome5 } from "@expo/vector-icons";

import { BarCodeScanner } from "expo-barcode-scanner";
import AsyncStorage from "@react-native-async-storage/async-storage";

import api from "../../../service/axios";
import { Alert } from "react-native";

const NovaContagem = ({ route }) => {
  const [nomeUsuario, setNomeUsuario] = useState(null);

  const [produtoList, setProdutoList] = useState([]);

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [openScanner, setOpenScanner] = useState(false);
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loadinfgSalvar, setLoadingSalvar] = useState(false);

  const [quantidade, setQuantidade] = useState(null);
  const [ean, setEan] = useState(null);

  const getListProduto = () => {
    setLoading2(true);
    return api
      .get(
        `/api/produto/contagem/porInventario/${JSON.stringify(
          route.params.itemId
        )}`
      )
      .then((r) => {
        setProdutoList(r.data);
      })
      .catch((e) => {
        alert(e?.message);
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

    const getNomeUsuarioToken = async () => {
      const token = await AsyncStorage.getItem("access_token");
      let a = JSON.parse(token);
      setNomeUsuario(a?.nome);
    };

    getNomeUsuarioToken();
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
        r?.data?.length === 0
          ? Alert.alert("Aviso", "Nenhum produto encontrado")
          : setProduto(r.data);
      })
      .catch((e) => {
        alert(e?.message);
      })
      .finally((f) => {
        setLoading(false);
        setEan(null);
      });
  };

  const salvar = () => {
    //  console.log(produto);
    setLoadingSalvar(true);
    return api
      .post("/api/produto/contagem/salvar", {
        idproduto: produto?.id,
        idinventario: parseInt(JSON.stringify(route.params.itemId)),
        produto: produto?.nome,
        idfilial: 1,
        quantidadeLida: quantidade,
        nomeUsuario: nomeUsuario,
      })
      .then((r) => {
        Alert.alert("Sucesso", `${produto?.ean} - ${produto?.nome} adicionado`);
        setProduto(null);
      })
      .catch((e) => {
        alert(e?.message);
      })
      .finally((f) => {
        setLoadingSalvar(false);
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
            colors: ["#eb575a", "#708090"],
            start: [1, 0],
            end: [0, 0],
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
              leftIcon={
                <FontAwesome5 name="backward" size={24} color="white" />
              }
            >
              Cancelar
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
                        color="white"
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
                      ></Text>
                    </>
                  )}

                  <Button
                    rounded="full"
                    mr="5"
                    variant="solid"
                    onPress={() => setOpenScanner(true)}
                    rightIcon={
                      <FontAwesome5 name="camera" size={28} color="white" />
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
                            placeholder="Digite o código ou cod.barras"
                            mb={2}
                            keyboardType="numeric"
                            rounded="full"
                          />
                          <Button
                            rounded="full"
                            variant="solid"
                           
                            onPress={() => getProduto()}
                            ml="5"
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
                  </Box>
                  <Box flexDirection="column">
                    {produto ? (
                      <>
                        <Box w="96">
                          <Input
                            onChangeText={(e) => setQuantidade(e)}
                            id="quantidade"
                            clearTextOnFocus
                            size="2xl"
                            bgColor="#f2f2f2"
                            w="95%"
                            mx="2"
                            placeholder="Informe a quantidade"
                            keyboardType="numeric"
                            rounded="full"
                          />
                        </Box>

                        <Button
                          onPress={(e) => {
                            setProduto(null);
                          }}
                          h="12"
                          m="4"
                          rounded="full"
                          colorScheme="danger"
                          leftIcon={
                            <FontAwesome5
                              name="times"
                              size={18}
                              color="white"
                            />
                          }
                        >
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <></>
                    )}

                    <Button
                      isLoading={loadinfgSalvar}
                      isLoadingText="Salvando..."
                      disabled={!produto || !quantidade}
                      onPress={() => salvar()}
                      h="12"
                      m="2"
                      rounded="full"
                      colorScheme="success"
                      rightIcon={
                        <FontAwesome5 name="plus" size={18} color="white" />
                      }
                    >
                      <Text fontWeight="bold" fontSize="lg" color="#ffff">
                        Adicionar
                      </Text>
                    </Button>
                  </Box>
                </KeyboardAvoidingView>
                {loading2 ? (
                  <>
                    <Box w="container">
                      <Text color="#f2f2f2" fontSize="2xl">
                        Carregando produtos ...
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
                    <ScrollView>
                      <VStack w="full" m={1} bgColor={"#f2f2f2"}>
                        {produtoList.map((item, i) => (
                          <>
                            <ListItem.Swipeable
                              key={item?.id ? item.id : i}
                              topDivider
                              rightContent={(reset) => (
                                <Button2
                                  title="Excluir"
                                  onPress={() => {
                                    reset();
                                    return api
                                      .delete(
                                        `/api/produto/contagem/inventario/item/${item?.id}`
                                      )
                                      .then((r) => {
                                        Alert.alert(
                                          "Suceeso",
                                          `Produto ${
                                            item?.produto + " "
                                          } deletado`
                                        );
                                        getListProduto();
                                      })
                                      .catch((e) => {
                                        alert(e?.message);
                                      });
                                  }}
                                  icon={{ name: "delete", color: "white" }}
                                  buttonStyle={{
                                    minHeight: "100%",
                                    backgroundColor: "red",
                                  }}
                                />
                              )}
                            >
                              <ListItem.Content>
                                <ListItem.Title>{item?.produto}</ListItem.Title>
                                <ListItem.Subtitle>
                                  {item?.ean}
                                </ListItem.Subtitle>
                              </ListItem.Content>
                              <Badge backgroundColor={"green.500"}>
                                <Text
                                  fontSize="xl"
                                  fontWeight="bold"
                                  color="white"
                                >
                                  {item?.quantidadeLida}
                                </Text>
                              </Badge>
                              <ListItem.Chevron />
                            </ListItem.Swipeable>
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
