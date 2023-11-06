import { NavigationContainer } from "@react-navigation/native";
import "react-native-gesture-handler";
import { NativeBaseProvider } from "native-base";
import Routes from "./src/routes";
import { PaperProvider } from 'react-native-paper';

const App = () => {
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
      <PaperProvider>
        <Routes />
        </PaperProvider>
      </NativeBaseProvider>
    </NavigationContainer>
  );
};

export default App;
