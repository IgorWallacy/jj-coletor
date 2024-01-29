import React, { useState, useEffect, useRef } from "react";

import {
  ProgressBar,
  MD3Colors,
  TextInput,
  Card,
  Text as TextNP,
  Button as ButtonNP,
} from "react-native-paper";
import {
  Box,
  Text,
  Button,
  VStack,
  ScrollView,
  Badge,
  Modal,
  Card as CardNB,
} from "native-base";

import { ListItem, Button as Button2, BottomSheet } from "@rneui/themed";

import { FontAwesome5, FontAwesome } from "@expo/vector-icons";

import { BarCodeScanner } from "expo-barcode-scanner";
import AsyncStorage from "@react-native-async-storage/async-storage";

import api from "../../../service/axios";
import { Alert, ImageBackground, KeyboardAvoidingView } from "react-native";
import moment from "moment";

const NovaContagem = ({ route, navigation }) => {
  const [nomeUsuario, setNomeUsuario] = useState(null);

  const [produtoList, setProdutoList] = useState([]);

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [openScanner, setOpenScanner] = useState(false);
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loadingSalvar, setLoadingSalvar] = useState(false);
  const [loadingInventario, setloadingInventario] = useState(false);

  const [quantidade, setQuantidade] = useState(null);
  const [ean, setEan] = useState(null);

  const [inventario, setInventario] = useState([]);
  const inventarioStatus = useRef(false);

  const rowsProduto = useRef(3);

  const getInventarios = () => {
    setloadingInventario(true);
    return api
      .get(
        `/api/produto/contagem/inventarios/${parseInt(
          JSON.stringify(route.params.itemId)
        )}`
      )
      .then((r) => {
        setInventario(r.data);
        inventarioStatus.current = r.data?.status;
        // console.log(r.data)
      })
      .catch((e) => {
        Alert.alert("Erro", "Erro ao buscar dados dos inventário ");
      })
      .finally((f) => {
        setloadingInventario(false);
      });
  };

  const carregarMaisProdutos = () => {
    rowsProduto.current = rowsProduto.current + 10;

    getListProduto();
  };

  const getListProduto = () => {
    getInventarios()
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
  }, [route]);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setOpenScanner(false);
    //  alert(`Código ${data} lido com sucesso!`);
    getProduto(data);

    setScanned(null);
  };

  const getProduto = (data) => {
    setLoading(true);
    return api
      .get(`/api/produto/ean/${ean ? ean : data}`)
      .then((r) => {
        r?.data?.length === 0
          ? Alert.alert(
              "Aviso",
              `Nenhum produto encontrado para o código ${ean ? ean : data}`
            )
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
            recontar: false,
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
      {produto ? (
        <>
          <Box
            bgColor="#f3f3f3"
            flexDirection="column"
            width="100%"
            marginTop={5}
            alignItems="center"
          >
            <Text fontSize={16}>
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

          <Box flexDirection="column" w="container" p={1} m={4}>
            <TextInput
              w="100%"
              onChangeText={(e) => setQuantidade(e)}
              id="quantidade"
              clearTextOnFocus
              size="2xl"
              marginTop={5}
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
            m={5}
            rounded="full"
            colorScheme="danger"
            disabled={loadingSalvar}
            leftIcon={<FontAwesome5 name="times" size={18} color="white" />}
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
            rightIcon={<FontAwesome5 name="plus" size={18} color="white" />}
          >
            <Text fontWeight="bold" fontSize="lg" color="#ffff">
              Adicionar
            </Text>
          </Button>
        </>
      ) : (
        <></>
      )}
      <Box
        flexDir="row"
        justifyContent="center"
        alignItems="center"
        flex={1}
        width="container"
        flexWrap="wrap"
        bg="#778899"
        p={1}
      >
        {openScanner === true ? (
          <Box
            flexWrap="wrap"
            justifyContent="center"
            flexDirection="row"
            alignItems="center"
            w={100}
            h={100}
            flex={1}
          >
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
                height: 500,
                width: "100%",
              }}
            />

            <Button
              colorScheme="danger"
              rounded="xl"
              mt="1"
              w="100%"
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
                Clique para tentar novamente{" "}
              </Button>
            )}
          </Box>
        ) : (
          <Box>
            {loading ? (
              <>
                <Box flex={1} justifyContent="center" alignItems="center">
                  <Box>
                    <Text color="#f2f2f2" fontSize="2xl">
                      Consultando código
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
                    <Box my={1}>
                      <Card mode="elevated">
                        <Card.Content>
                          <Box
                            flexDirection="row"
                            mx={1}
                            px={1}
                            alignItems="center"
                            justifyContent="space-around"
                          >
                            <Text fontSize="md" color="black">
                              Inventário #{inventario?.id} {inventario?.nome}{" "}
                              {inventario?.loja}
                            </Text>
                          </Box>

                          <Box
                            flexDirection="row-reverse"
                            mx={1}
                            px={1}
                            alignItems="center"
                            justifyContent="space-around"
                          >
                            <Button
                              rounded="full"
                              variant="solid"
                              onPress={() => setOpenScanner(true)}
                              rightIcon={
                                <FontAwesome5
                                  name="camera"
                                  size={30}
                                  color="white"
                                />
                              }
                            />
                            <TextNP>
                              {" "}
                              {inventario?.status ? "Aberto " : "Fechado "}
                              {moment(inventario?.inicio).format(
                                "DD/MM/YYYY hh:mm:ss"
                              )}
                            </TextNP>
                            <Button
                              rounded="full"
                              variant="solid"
                              onPress={() => getListProduto()}
                              rightIcon={
                                <FontAwesome
                                  name="refresh"
                                  size={25}
                                  color="white"
                                />
                              }
                            />
                          </Box>

                          <Box
                            w="100%"
                            flexDirection="row"
                            justifyContent="center"
                            alignItems="center"
                            flexWrap="wrap"
                            my={5}
                          >
                            <TextInput
                              onChangeText={(e) => setEan(e)}
                              id="ean"
                              size="2xl"
                              style={{ width: "100%" }}
                              // placeholder="Digite o código ou cod.barras"
                              label="Código ou código de barras"
                              keyboardType="numeric"
                              mods="outlined"
                            />
                            <Button
                              mt={5}
                              w="85%"
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
                    </Box>
                  </>
                )}

                {loading2 ? (
                  <>
                    <Box w="container" h="container" my={10}>
                      <Text p={1} mx={5} color="#f2f2f2" fontSize="2xl">
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
                    {!produto ? (
                      <>
                        <ScrollView>
                          <VStack my={1} p={1}>
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
                                    <ListItem.Title>
                                      {item?.produto}
                                    </ListItem.Title>
                                    <ListItem.Subtitle>
                                      Código - {item?.ean}
                                    </ListItem.Subtitle>
                                    <ListItem.Subtitle>
                                      Coletor(a) - {item?.nomeUsuario}
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
                        </ScrollView>

                        {produtoList?.length > 0 ? (
                          <>
                            <Box my={2}>
                              <Button2
                                radius="lg"
                                title={`Exibindo o(s) ${produtoList?.length} último(s) produto(s) adicionado(s). Clique para ver mais`}
                                onPress={() => carregarMaisProdutos()}
                              />
                            </Box>
                            <Box>
                              <ButtonNP
                                icon="package"
                                mode="contained"
                                onPress={() =>
                                  navigation.navigate("produtos-recontagem", {
                                    idInventario: inventario?.id,
                                  })
                                }
                              >
                                Visualizar recontagem
                              </ButtonNP>
                            </Box>
                          </>
                        ) : (
                          <></>
                        )}
                      </>
                    ) : (
                      <></>
                    )}
                  </>
                )}
              </>
            )}
          </Box>
        )}
      </Box>
      {produtoList?.length === 0 &&
      !produto &&
      loading === false &&
      loading2 === false &&
      openScanner === false ? (
        <>
          <Box
            flexDir="column"
            justifyContent="center"
            alignItems="center"
            flex={1}
            width="container"
            flexWrap="wrap"
            bg="#778899"
            p={1}
          >
            <ImageBackground
              resizeMode="cover"
              source={require("../../../../assets/images/vazio2.png")}
              alt="vazio"
              style={{ flex: 1, width: "100%", height: "100%" }}
            ></ImageBackground>
            <CardNB backgroundColor="blue.700" mx={5}>
              <Text h4 color="#f2f2f2">
                Nenhum produto adicionado para o inventário!
              </Text>
            </CardNB>
          </Box>
        </>
      ) : (
        <></>
      )}
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
      <BottomSheet modalProps={{}} isVisible={!inventarioStatus?.current}>
        <CardNB backgroundColor="#f2f2f2">
          <Text fontSize="2xl">
            Inventário está {inventarioStatus?.current ? "aberto" : "fechado"}
          </Text>
          <Text mb={2} fontSize="md">
            Solicite ao retaguarda a abertura para continuar{" "}
          </Text>
          <Box mb={5}>
            <ButtonNP
              icon="refresh"
              loading={loadingInventario}
              mode="contained"
              onPress={() => getInventarios()}
            >
              {loadingInventario ? "Consultando status" : "Tente novamente"}
            </ButtonNP>
          </Box>
          <Box>
            <ButtonNP
              icon="arrow-left"
              mode="contained"
              buttonColor="red"
              onPress={() => navigation.navigate("Menu")}
            >
              Sair
            </ButtonNP>
          </Box>
        </CardNB>
      </BottomSheet>
    </>
  );
};

export default NovaContagem;
