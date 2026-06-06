import { Stack } from "expo-router";
import { TimerProvider } from "./components/receitas/timerContext";
import { View } from "react-native";
import { TimerOverlay } from "./components/receitas/timerOrvelay";

export default function RootLayout() {
  return (
    // TimerProvider aqui envolve TODAS as páginas do app.
    // Os timers continuam rodando ao trocar de página porque
    // este componente nunca desmonta enquanto o app estiver aberto.
    <TimerProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />

        {/* TimerOverlay flutua sobre qualquer tela que estiver ativa */}
        <TimerOverlay />
      </View>
    </TimerProvider>
  );
}