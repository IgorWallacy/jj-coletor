import React, { useState, useEffect, useRef } from "react";

import {
  ProgressBar,
  MD3Colors,
  TextInput,
  Card,
  Text as TextNP,
} from "react-native-paper";
import {
  Input,
  Box,
  Text,
  Button,
  VStack,
  ScrollView,
  Badge,
  Modal,
} from "native-base";

import { ListItem, Button as Button2 } from "@rneui/themed";

import { FontAwesome5, FontAwesome } from "@expo/vector-icons";

import { BarCodeScanner } from "expo-barcode-scanner";
import AsyncStorage from "@react-native-async-storage/async-storage";

import api from "../../../service/axios";
import { Alert } from "react-native";
import moment from "moment";

const NovaContagem = ({ route }) => {
  const [nomeUsuario, setNomeUsuario] = useState(null);

  const [produtoList, setProdutoList] = useState([]);

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [openScanner, setOpenScanner] = useState(false);
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loadingSalvar, setLoadingSalvar] = useState(false);

  const [quantidade, setQuantidade] = useState(null);
  const [ean, setEan] = useState(null);

  const [inventario, setInventario] = useState([]);

  const rowsProduto = useRef(3);

  const refBarras = useRef(null);

  const getInventarios = () => {
    return api
      .get(
        `/api/produto/contagem/inventarios/${parseInt(
          JSON.stringify(route.params.itemId)
        )}`
      )
      .then((r) => {
        setInventario(r.data);
        // console.log(r.data)
      })
      .catch((e) => {
        Alert.alert("Erro", "Erro ao buscar dados dos inventário ");
      })
      .finally((f) => {});
  };

  const carregarMaisProdutos = () => {
    rowsProduto.current = rowsProduto.current + 10;

    getListProduto();
  };

  const getListProduto = () => {
    setLoading2(true);
    return api
      .get(
        `/api/produto/contagem/porInventario/mobile/${parseInt(
          JSON.stringify(route.params.itemId)
        )}/${rowsProduto.current}`
      )
      .then((r) => {
        setProdutoList(r.data);
        // console.log(r.data)
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
    getInventarios();

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
    refBarras.current = data;
    setScanned(null);
  };

  const getProduto = (data) => {
    setLoading(true);
    return api
      .get(`/api/produto/ean/${ean ? ean : data}`)
      .then((r) => {
        r?.data?.length === 0
          ? Alert.alert("Aviso", "Nenhum produto encontrado")
          : setProduto(r.data);
        //  console.log(r.data)
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
    getInventarios();
    if (!inventario?.status) {
      Alert.alert(
        "Inventário com status fechado",
        `Solicite a abertura do inventário de código ${inventario?.id} - ${inventario?.nome} para iniciar a contagem `
      );
    } else {
      if (!quantidade || !produto) {
        Alert.alert("Aviso", "Informe a quantidade e/ou produto");
      } else {
        setLoadingSalvar(true);
        let q = parseFloat(quantidade.replace(",", "."));
        return api
          .post("/api/produto/contagem/salvar", {
            idproduto: produto?.id,
            idinventario: inventario?.id,
            produto: produto?.nome,
            idfilial: inventario?.idfilial,
            quantidadeLida: q,
            nomeUsuario: nomeUsuario,
          })
          .then((r) => {
            setProduto(null);
            setQuantidade(null);
            Alert.alert(
              "Sucesso",
              `${produto?.ean} - ${produto?.nome}   adicionado`
            );
            setLoadingSalvar(false);
            rowsProduto.current = 3;
            getListProduto();
          })
          .catch((e) => {
            alert(e?.message);
          })
          .finally((f) => {});
      }
    }
  };

  return (
    <>
      <Box
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
        px={2}
        
      >
        {openScanner === true ? (
          <Box w="100%" h="50%">
            <TextNP
              variant="headlineMedium"
              style={{
                fontWeight: "bold",
                color: "#ffff",
              }}
            >
              Aproxime o código de barras para leitura
            </TextNP>
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={{
                height: 600,
                width: "100%",
              }}
            />

            <Button
              colorScheme="danger"
              rounded="xl"
              mt="1"
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
                <Box
                  w="container"
                  flex={1}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Box>
                    <Text color="#f2f2f2" fontSize="2xl">
                      Consultando código {ean ? ean : refBarras.current}
                    </Text>
                    <ProgressBar
                      indeterminate
                      progress={1}
                      color={MD3Colors.success50}
                    />
                  </Box>
                </Box>
              </>
            ) : (
              <>
                {produto ? (
                  <></>
                ) : (
                  <>
                    <Card mode="elevated">
                      <Card.Content>
                        <Text fontSize="md" m={2} color="black">
                          Inventário #{inventario?.id} - {inventario?.nome} -
                          {inventario?.loja}
                        </Text>
                      </Card.Content>
                    </Card>
                  </>
                )}
                <Card mode="elevated" marginTop={5}>
                  <Card.Content>
                    <Box
                      flexDirection="row-reverse"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Button
                        w={16}
                        rounded="full"
                        mx={2}
                        variant="solid"
                        onPress={() => setOpenScanner(true)}
                        rightIcon={
                          <FontAwesome5 name="camera" size={20} color="white" />
                        }
                      />
                      <TextNP> {inventario?.status ? 'Aberto' : 'Fechado '} - Início {moment(inventario?.inicio).format("DD/MM/YYYY hh:mm:ss")}</TextNP>
                      <Button
                        w={16}
                        rounded="full"
                        mx={2}
                        variant="solid"
                        onPress={() => getListProduto()}
                        rightIcon={
                          <FontAwesome name="refresh" size={20} color="white" />
                        }
                      />
                    </Box>
                  </Card.Content>
                </Card>

                <Box
                  mx={5}
                  flexDirection="row"
                  justifyContent="center"
                  alignItems="center"
                  
                >
                  {produto ? (
                    <>
                      <Badge w="95%" h={24} mx={2} my={1} p={1}>
                        <Box
                          
                          flex={1}
                          w="100%"
                          flexDirection="column"
                          justifyContent="stretch"
                          alignItems="center"
                        >
                          <Text fontSize={12}>
                            {produto?.ean ? produto?.ean : produto?.codigo}
                          </Text>
                          <Text fontSize={18} fontWeight="extrabold">
                            {" "}
                            {produto?.nome}
                          </Text>
                          <Text fontSize={12} fontWeight="extrabold">
                            {" "}
                            {produto?.idUnidadeMedida?.codigo}
                          </Text>
                        </Box>
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Text
                        color="#fff"
                        fontWeight="bold"
                        fontSize="15"
                        w="80%"
                      ></Text>
                    </>
                  )}
                </Box>

                <Box justifyContent="center" alignItems="center">
                  {produto ? (
                    <></>
                  ) : (
                    <>
                      <Card width="100%">
                        <Card.Content>
                          <Box
                            w="100%"
                            flexDirection="row"
                            justifyContent="center"
                            alignItems="center"
                            flexWrap="wrap"
                          >
                            <TextInput
                              onChangeText={(e) => setEan(e)}
                              id="ean"
                              size="2xl"
                              style={{ width: "75%" }}
                              // placeholder="Digite o código ou cod.barras"
                              label="Código ou código de barras"
                              keyboardType="numeric"
                              mods="outlined"
                            />
                            <Button
                              mt={5}
                              w="75%"
                              rounded="full"
                              variant="solid"
                              onPress={() => getProduto()}
                              leftIcon={
                                <FontAwesome5
                                  name="search"
                                  size={18}
                                  color="white"
                                />
                              }
                            >
                              Adicionar novo produto por código
                            </Button>
                          </Box>
                        </Card.Content>
                      </Card>
                    </>
                  )}
                </Box>
                <Box flexDirection="column" w="container" p={1} mx={4}>
                  {produto ? (
                    <>
                      <Box>
                        <Input
                          w="container"
                          onChangeText={(e) => setQuantidade(e)}
                          id="quantidade"
                          clearTextOnFocus
                          size="2xl"
                          bgColor="#f2f2f2"
                          m="2"
                          placeholder="Quantidade #0,00"
                          keyboardType="decimal-pad"
                          rounded="md"
                          autoCapitalize="words"
                        />
                      </Box>

                      <Button
                        onPress={(e) => {
                          setProduto(null);
                          setQuantidade(null);
                        }}
                        h="12"
                        m="2"
                        rounded="full"
                        colorScheme="danger"
                        disabled={loadingSalvar}
                        leftIcon={
                          <FontAwesome5 name="times" size={18} color="white" />
                        }
                      >
                        Cancelar
                      </Button>
                      <Button
                        isLoading={loadingSalvar}
                        isLoadingText="Salvando..."
                        // disabled={!produto || !quantidade}
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
                    </>
                  ) : (
                    <></>
                  )}
                </Box>

                {loading2 ? (
                  <>
                    <Box w="container">
                      <Text p={5} color="#f2f2f2" fontSize="2xl">
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
                      <VStack w="container" my={2} p={4}>
                        {produtoList.map((item, i) => (
                          <>
                            <ListItem.Swipeable
                              keyExtractor={(p) => p?.id}
                              initialNumToRender={rowsProduto.current}
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
                                          "Sucesso",
                                          `Produto ${
                                            item?.produto + " "
                                          } excluído`
                                        );
                                        getListProduto();
                                      })
                                      .catch((e) => {
                                        Alert.alert(
                                          "Erro",
                                          "Erro ao excluir ",
                                          e?.message
                                        );
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
                                  Código - {item?.ean}
                                </ListItem.Subtitle>
                              </ListItem.Content>
                              <Badge backgroundColor={"green.500"}>
                                <Text color="#ffff">Quantidade</Text>
                                <Text
                                  fontSize="xl"
                                  fontWeight="bold"
                                  color="white"
                                >
                                  {Intl.NumberFormat("pt-BR", {
                                    minimumFractionDigits: "0",
                                    maximumFractionDigits: "3",
                                  }).format(item?.quantidadeLida)}
                                </Text>
                                <Text size={6} color="#ffff">
                                  {item?.unidadeMedida}
                                </Text>
                              </Badge>
                              <ListItem.Chevron />
                            </ListItem.Swipeable>
                          </>
                        ))}
                      </VStack>
                      <Button2
                      title={`Exibindo o(s) ${produtoList?.length} último(s) produto(s) adicionado(s). Clique para ver mais`}
                      onPress={() => carregarMaisProdutos()}
                    />
                    </ScrollView>

                   
                  </>
                )}
              </>
            )}
          </Box>
        )}
      </Box>
      <Modal
        isOpen={loadingSalvar}
        onClose={() => setLoadingSalvar(false)}
        clos
      >
        <Modal.Content
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Modal.Header> Aguarde por favor </Modal.Header>
          <Modal.Body>
            <TextNP variant="titleMedium"> Gravando </TextNP>
            <ProgressBar
              indeterminate
              progress={1}
              color={MD3Colors.success50}
            />
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  );
};

export default NovaContagem;
