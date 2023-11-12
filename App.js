import React , { useEffect} from 'react'
import { NavigationContainer } from "@react-navigation/native";
import "react-native-gesture-handler";
import { NativeBaseProvider } from "native-base";
import Routes from "./src/routes";
import { PaperProvider,DefaultTheme } from 'react-native-paper';
import {LogBox} from 'react-native';
import { StatusBar } from 'expo-status-bar';


const App = () => {
  const lightTheme = {
    ...DefaultTheme,
    dark: false,
  };

  const theme = lightTheme;
  useEffect(() => {
    LogBox.ignoreLogs(['In React 18, SSRProvider is not necessary and is a noop. You can remove it from your app.']);
  }, []);

  const config = {
    dependencies: {
      // For Expo projects (Bare or managed workflow)
      "linear-gradient": require("expo-linear-gradient").LinearGradient,
      // For non expo projects
      // 'linear-gradient': require('react-native-linear-gradient').default,
    },
  };
  return (
    <NavigationContainer>
      <NativeBaseProvider config={config}>
      <PaperProvider theme={theme}>
      <StatusBar style="light" />
        <Routes />
        </PaperProvider>
      </NativeBaseProvider>
    </NavigationContainer>
  );
};

export default App;
